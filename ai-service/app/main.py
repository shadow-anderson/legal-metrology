from __future__ import annotations

import io
import json
import re
import uuid
from dataclasses import dataclass
from difflib import SequenceMatcher
from pathlib import Path
from typing import Any

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from PIL import Image, ImageOps, UnidentifiedImageError

try:
    import pillow_avif  # noqa: F401
except ImportError:
    pillow_avif = None

try:
    import pytesseract
    from pytesseract import Output
except ImportError:  # Optional dependency; zero-result analysis remains valid.
    pytesseract = None
    Output = None

try:
    from rapidocr_onnxruntime import RapidOCR
except ImportError:  # Optional fallback; deployments can choose their OCR engine.
    RapidOCR = None

from jsonschema import Draft202012Validator

# Import new modules
from src.image_recovery import estimate_blur_severity, analyze_blur_type, analyze_regions
from src.image_recovery import generate_global_variants, generate_regional_variants
from src.ocr.fusion import fuse_ocr_results, OCRPass, contextual_correction
from src.extraction.ai_assisted import verify_with_ai, extract_regulatory_fields

SERVICE_VERSION = "1.1.0"
SERVICE_ROOT = Path(__file__).resolve().parent.parent
SCHEMA_PATH = SERVICE_ROOT / "schema" / "ai-output.schema.json"
OUTPUT_DIR = SERVICE_ROOT / "output"
SCHEMA = json.loads(SCHEMA_PATH.read_text(encoding="utf-8"))
SCHEMA_VALIDATOR = Draft202012Validator(SCHEMA)
_rapidocr_engine: Any | None = None

app = FastAPI(title="METRA AI", version=SERVICE_VERSION)


@dataclass
class Observation:
    text: str
    bbox: list[float]
    confidence: float


def _empty_confident_string() -> dict[str, Any]:
    return {"value": "", "confidence": 0.0}


def _nullable(value: str | None, confidence: float | None) -> dict[str, Any]:
    return {"value": value, "confidence": confidence}


def _quality(image: np.ndarray, image_id: str) -> dict[str, Any]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur_score = estimate_blur_severity(image)
    glare_fraction = float(np.mean((gray >= 245).astype(np.float32)))
    accepted = bool(image.shape[0] >= 32 and image.shape[1] >= 32)
    return {
        "imageId": image_id,
        "blurScore": round(blur_score, 4),
        "glareFraction": round(glare_fraction, 4),
        "skewDegrees": 0.0,
        "accepted": accepted,
    }


def _ocr_available() -> bool:
    if pytesseract is not None:
        try:
            pytesseract.get_tesseract_version()
            return True
        except Exception:
            pass
    return RapidOCR is not None


def _rapidocr() -> Any | None:
    global _rapidocr_engine
    if RapidOCR is None:
        return None
    if _rapidocr_engine is None:
        try:
            _rapidocr_engine = RapidOCR()
        except Exception:
            return None
    return _rapidocr_engine


def _ocr(image: Image.Image | np.ndarray, psm: int = 11, coordinate_scale: float = 1.0) -> list[Observation]:
    observations: list[Observation] = []
    
    if isinstance(image, np.ndarray):
        pil_img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        pil_img = image

    if pytesseract is not None and Output is not None:
        try:
            data = pytesseract.image_to_data(pil_img, output_type=Output.DICT, config=f"--psm {psm}")
            for index, raw_text in enumerate(data.get("text", [])):
                text = str(raw_text).strip()
                try:
                    confidence = float(data["conf"][index]) / 100.0
                except (KeyError, IndexError, TypeError, ValueError):
                    confidence = 0.0
                if not text or confidence < 0:
                    continue
                try:
                    x, y, width, height = (int(data[key][index]) for key in ("left", "top", "width", "height"))
                except (KeyError, IndexError, TypeError, ValueError):
                    continue
                observations.append(Observation(
                    text,
                    [x / coordinate_scale, y / coordinate_scale, (x + width) / coordinate_scale, (y + height) / coordinate_scale],
                    max(0.0, min(1.0, confidence)),
                ))
        except Exception:
            observations = []
            
    if observations:
        return observations

    engine = _rapidocr()
    if engine is None:
        return observations
    try:
        np_img = np.asarray(pil_img)
        result = engine(np_img)
        result = result[0] if isinstance(result, tuple) else result
    except Exception:
        return observations
    for entry in result or []:
        try:
            polygon, text, confidence = entry[0], str(entry[1]).strip(), float(entry[2])
            if not text:
                continue
            points = [(float(point[0]), float(point[1])) for point in polygon]
            if len(points) < 4:
                continue
            x_values, y_values = zip(*points)
            observations.append(Observation(
                text,
                [min(x_values) / coordinate_scale, min(y_values) / coordinate_scale, max(x_values) / coordinate_scale, max(y_values) / coordinate_scale],
                max(0.0, min(1.0, confidence)),
            ))
        except (IndexError, TypeError, ValueError):
            continue
    return observations


def _ocr_adaptive(image: Image.Image) -> list[Observation]:
    """Escalate from the original image to enhanced variants using the new recovery pipeline."""
    bgr = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)
    blur_score = estimate_blur_severity(bgr)
    blur_level, blur_nature = analyze_blur_type(bgr)

    observations = _ocr(image)
    avg_conf = sum(item.confidence for item in observations) / len(observations) if observations else 0.0
    if observations and blur_level in ['NONE', 'LIGHT'] and avg_conf >= 0.5:
        return observations

    global_variants = generate_global_variants(bgr, blur_level, blur_nature)
    candidates: list[Observation] = []
    
    for var in global_variants[1:]:
        var_pil = Image.fromarray(cv2.cvtColor(var, cv2.COLOR_BGR2RGB) if len(var.shape) == 3 else var)
        scale = var_pil.width / image.width if image.width else 1.0
        candidates.extend(_ocr(var_pil, coordinate_scale=scale))

    h, w = bgr.shape[:2]
    mock_regions = [{"bbox": [0, 0, w, h]}]
    
    regional_blur_analysis = analyze_regions(bgr, mock_regions)
    for reg in regional_blur_analysis:
        reg_variants = generate_regional_variants(bgr, reg["bbox"])
        for r_var in reg_variants:
            r_pil = Image.fromarray(cv2.cvtColor(r_var, cv2.COLOR_BGR2RGB) if len(r_var.shape) == 3 else r_var)
            x1, y1, x2, y2 = reg["bbox"]
            scale = r_pil.width / (x2 - x1) if (x2 - x1) > 0 else 1.0
            crop_obs = _ocr(r_pil, coordinate_scale=scale)
            for co in crop_obs:
                co.bbox[0] += x1
                co.bbox[1] += y1
                co.bbox[2] += x1
                co.bbox[3] += y1
                candidates.append(co)

    combined = observations + candidates
    
    unique: list[Observation] = []
    for item in combined:
        normalized = re.sub(r"\s+", " ", item.text).casefold()
        duplicate = next(
            (index for index, previous in enumerate(unique)
             if _iou(item.bbox, previous.bbox) >= 0.5
             and SequenceMatcher(None, normalized, re.sub(r"\s+", " ", previous.text).casefold()).ratio() >= 0.65),
            None,
        )
        if duplicate is None:
            unique.append(item)
        elif item.confidence > unique[duplicate].confidence:
            unique[duplicate] = item
            
    return unique


def _iou(first: list[float], second: list[float]) -> float:
    left = max(first[0], second[0])
    top = max(first[1], second[1])
    right = min(first[2], second[2])
    bottom = min(first[3], second[3])
    intersection = max(0.0, right - left) * max(0.0, bottom - top)
    first_area = max(0.0, first[2] - first[0]) * max(0.0, first[3] - first[1])
    second_area = max(0.0, second[2] - second[0]) * max(0.0, second[3] - second[1])
    union = first_area + second_area - intersection
    return intersection / union if union else 0.0


def _joined(observations: list[Observation]) -> str:
    if not observations:
        return ""
    ordered = sorted(observations, key=lambda item: (item.bbox[1], item.bbox[0]))
    lines: list[list[Observation]] = []
    for item in ordered:
        if not lines or item.bbox[1] >= max(entry.bbox[3] for entry in lines[-1]) + 8:
            lines.append([item])
        else:
            lines[-1].append(item)
    return "\n".join(" ".join(item.text for item in line) for line in lines)


def _find(pattern: str, text: str, observations: list[Observation]) -> tuple[re.Match[str], Observation] | None:
    match = re.search(pattern, text, re.IGNORECASE)
    if not match:
        return None
    related = [item for item in observations if item.text.lower() in match.group(0).lower()]
    if not observations:
        return None
    return match, related[0] if related else observations[0]


def _extract(observations: list[Observation], image_id: str) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    text = _joined(observations)
    regions: list[dict[str, Any]] = []

    def add(field: str, source: Observation | None, value_confidence: float) -> None:
        if source is not None:
            regions.append({
                "field": field,
                "bbox": [max(0.0, float(value)) for value in source.bbox],
                "ocrText": source.text,
                "confidence": round(max(0.0, min(1.0, value_confidence)), 4),
                "sourceImageId": image_id,
            })

    mrp_match = _find(r"(?:M\.?[ \t]*R\.?[ \t]*P\.?|maximum[ \t]+retail[ \t]+price)[ \t]*[:.]?[ \t]*(?:rs\.?|₹|INR)?[ \t]*([0-9]+(?:\.[0-9]+)?)", text, observations)
    if mrp_match is None:
        mrp_match = _find(r"(?:₹|rs\.?|INR)[ \t]*([0-9]+(?:\.[0-9]+)?)[ \t]*(?:M\.?[ \t]*R\.?[ \t]*P\.?)", text, observations)
    qty_match = _find(r"(?:net\s*(?:quantity|qty|wt)|net)\s*[:.]?\s*([0-9]+(?:\.[0-9]+)?)\s*(kg|g|ml|l|litre|liter|litres|liters)\b", text, observations)
    if qty_match is None:
        qty_match = _find(r"(?<![\w.])([0-9]+(?:\.[0-9]+)?)\s*(kg|g|ml|l|litre|liter|litres|liters)\b", text, observations)
    manufacturer_match = _find(r"manufactured\s+(?:and\s+packed\s+)?by\s*[:.-]?\s*([^\n]+?)(?=\s+(?:packed|imported|marketed|mfd|pkd)\b|$)", text, observations)
    packer_match = _find(r"(?:packed\s+by|packed\s+and\s+marketed\s+by)\s*[:.-]?\s*([^\n]+?)(?=\s+(?:imported|marketed|mfd|pkd)\b|$)", text, observations)
    importer_match = _find(r"imported\s+by\s*[:.-]?\s*([^\n]+?)(?=\s+(?:manufactured|packed|marketed|mfd|pkd)\b|$)", text, observations)
    date_match = _find(r"(?:manufactured\s+on|mfd|date\s+of\s+manufacture)\s*[:.-]?\s*([0-9]{1,2}[/-][0-9]{1,2}[/-][0-9]{2,4}|[0-9]{1,2}[/-][0-9]{2,4})", text, observations)
    phone_match = _find(r"(?:consumer\s+care|customer\s+care|helpline|toll\s*free)[^\d]{0,30}(\d[\d\s-]{8,})", text, observations)
    email_match = _find(r"[\w.+-]+@[\w-]+\.[\w.-]+", text, observations)
    origin_match = _find(r"(?:country\s+of\s+origin|made\s+in|origin)\s*[:.-]?\s*([A-Za-z ]+)", text, observations)

    declaration_prefixes = re.compile(
        r"(?:mrp|m\.?r\.?p\.?|net|manufactured|packed|imported|marketed|mfd|pkd|consumer|customer|country|made\s+in|origin|maximum\s+retail)",
        re.IGNORECASE,
    )
    name_candidates = [
        item for item in observations
        if len(item.text) >= 3 and not declaration_prefixes.search(item.text)
    ]
    name_source = max(
        name_candidates,
        key=lambda item: item.confidence * max(1.0, item.bbox[2] - item.bbox[0]) * max(1.0, item.bbox[3] - item.bbox[1]),
        default=None,
    )

    mrp_raw_val = mrp_match[0].group(1) if mrp_match else None
    if mrp_raw_val:
        mrp_raw_val = contextual_correction(mrp_raw_val, 'MRP')
    mrp_value = float(mrp_raw_val) if mrp_raw_val and mrp_raw_val.replace('.', '', 1).isdigit() else None

    qty_value = float(qty_match[0].group(1)) if qty_match else None
    qty_unit = qty_match[0].group(2).lower() if qty_match else None
    if qty_unit in {"kg", "l", "litre", "liter", "litres", "liters"}:
        qty_unit = "kg" if qty_unit == "kg" else "L"
    elif qty_unit:
        qty_unit = qty_unit.lower()

    if mrp_match:
        fused = fuse_ocr_results([OCRPass(mrp_match[1].text, mrp_match[1].confidence, "primary")])
        verified = verify_with_ai("MRP", None, [], [mrp_match[1].text], fused)
        add("MRP", mrp_match[1], verified["confidence"])

    if qty_match:
        add("NET_QTY", qty_match[1], qty_match[1].confidence)
    if manufacturer_match:
        add("MANUFACTURER", manufacturer_match[1], manufacturer_match[1].confidence)
    if packer_match:
        add("PACKER", packer_match[1], packer_match[1].confidence)
    if importer_match:
        add("IMPORTER", importer_match[1], importer_match[1].confidence)
    if date_match:
        add("DATE", date_match[1], date_match[1].confidence)
    if phone_match:
        add("CONSUMER_CARE", phone_match[1], phone_match[1].confidence)
    if email_match:
        add("CONSUMER_CARE", email_match[1], email_match[1].confidence)
    if origin_match:
        add("ORIGIN", origin_match[1], origin_match[1].confidence)

    product = {
        "name": {"value": name_source.text if name_source else "", "confidence": name_source.confidence if name_source else 0.0},
        "category": _empty_confident_string(),
        "netQuantity": {"value": qty_value, "unit": qty_unit, "confidence": qty_match[1].confidence if qty_match else None},
        "mrp": {"value": mrp_value, "currency": "INR" if mrp_match else None, "confidence": mrp_match[1].confidence if mrp_match else None},
        "manufacturer": _nullable(manufacturer_match[0].group(1).strip() if manufacturer_match else None, manufacturer_match[1].confidence if manufacturer_match else None),
        "packer": _nullable(packer_match[0].group(1).strip() if packer_match else None, packer_match[1].confidence if packer_match else None),
        "importer": _nullable(importer_match[0].group(1).strip() if importer_match else None, importer_match[1].confidence if importer_match else None),
        "manufactureDate": _nullable(date_match[0].group(1) if date_match else None, date_match[1].confidence if date_match else None),
        "consumerCare": {
            "phone": _nullable(phone_match[0].group(1).strip() if phone_match else None, phone_match[1].confidence if phone_match else None),
            "email": _nullable(email_match[0].group(0) if email_match else None, email_match[1].confidence if email_match else None),
        },
        "countryOfOrigin": _nullable(origin_match[0].group(1).strip() if origin_match else None, origin_match[1].confidence if origin_match else None),
    }
    return product, regions


def _analyze(content: bytes, image_id: str) -> dict[str, Any]:
    try:
        image = ImageOps.exif_transpose(Image.open(io.BytesIO(content))).convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise HTTPException(status_code=422, detail=f"Unreadable image: {error}") from error
    if image.width < 32 or image.height < 32:
        raise HTTPException(status_code=422, detail="Image dimensions must be at least 32x32 pixels")
    bgr = cv2.cvtColor(np.asarray(image), cv2.COLOR_RGB2BGR)
    observations = _ocr_adaptive(image)
    product, regions = _extract(observations, image_id)
    result = {"product": product, "regions": regions, "imageQuality": [_quality(bgr, image_id)], "scale": {"established": False, "pixelsPerMm": None, "method": "NONE"}}
    errors = sorted(SCHEMA_VALIDATOR.iter_errors(result), key=lambda error: list(error.path))
    if errors:
        raise RuntimeError("AI output schema validation failed: " + "; ".join(error.message for error in errors))
    return result


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "metra-ai", "ocr": "available" if _ocr_available() else "unavailable", "version": SERVICE_VERSION}


@app.get("/version")
def version() -> dict[str, str]:
    return {"service": "metra-ai", "version": SERVICE_VERSION}


@app.post("/analyze")
async def analyze(image: UploadFile = File(...), image_id: str | None = Form(default=None)) -> dict[str, Any]:
    source_image_id = image_id or str(uuid.uuid4())
    try:
        source_image_id = str(uuid.UUID(source_image_id))
    except ValueError as error:
        raise HTTPException(status_code=422, detail="image_id must be a UUID") from error
    content = await image.read()
    if not content:
        raise HTTPException(status_code=422, detail="Image upload is empty")
    result = _analyze(content, source_image_id)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUTPUT_DIR / f"{source_image_id}.json").write_text(
        json.dumps(result, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    return result
