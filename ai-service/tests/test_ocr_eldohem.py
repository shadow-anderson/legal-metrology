"""
Test the full OCR pipeline with Eldohem Pain Relief Gel images.

Usage:
    python -m tests.test_ocr_eldohem

Loads test images from test-data/images/ and runs them through the full
_analyze pipeline, printing extracted fields, quality scores, and regions.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from uuid import uuid4

# Ensure project root is importable
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from app.main import _analyze, _ocr_adaptive, _joined, _quality, SCHEMA_VALIDATOR
from PIL import Image, ImageOps
import numpy as np
import cv2
import io


IMAGE_DIR = PROJECT_ROOT.parent / "test-data" / "images"
OUTPUT_DIR = PROJECT_ROOT / "output"


def separator(title: str) -> None:
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def run_single_image(image_path: Path) -> dict:
    """Run the full pipeline on a single image and return the result."""
    content = image_path.read_bytes()
    image_id = str(uuid4())

    print(f"\n--- Processing: {image_path.name} ---")
    print(f"  Image ID: {image_id}")
    print(f"  File size: {len(content):,} bytes")

    # Load image for dimension info
    pil_img = ImageOps.exif_transpose(Image.open(io.BytesIO(content))).convert("RGB")
    print(f"  Dimensions: {pil_img.width} x {pil_img.height}")

    # Run OCR adaptive (intermediate step)
    start = time.perf_counter()
    observations = _ocr_adaptive(pil_img)
    ocr_time = time.perf_counter() - start

    print(f"  OCR observations: {len(observations)} text regions in {ocr_time:.2f}s")
    if observations:
        joined_text = _joined(observations)
        print(f"\n  --- Raw OCR Text ---")
        for line in joined_text.split("\n"):
            print(f"    {line}")
        print(f"  --- End Raw OCR Text ---\n")

        print(f"  Top observations by confidence:")
        sorted_obs = sorted(observations, key=lambda o: o.confidence, reverse=True)
        for obs in sorted_obs[:15]:
            print(f"    [{obs.confidence:.2f}] \"{obs.text}\"  bbox={[round(v,1) for v in obs.bbox]}")

    # Run full analysis pipeline
    start = time.perf_counter()
    result = _analyze(content, image_id)
    full_time = time.perf_counter() - start
    print(f"\n  Full analysis completed in {full_time:.2f}s")

    # Validate schema
    errors = list(SCHEMA_VALIDATOR.iter_errors(result))
    if errors:
        print(f"  ⚠ SCHEMA ERRORS: {len(errors)}")
        for e in errors:
            print(f"    - {e.message}")
    else:
        print(f"  ✓ Schema validation PASSED")

    return result


def print_product_fields(product: dict) -> None:
    """Pretty-print the extracted product fields."""
    separator("EXTRACTED PRODUCT FIELDS")

    fields = [
        ("Product Name", product.get("name", {})),
        ("Category", product.get("category", {})),
        ("MRP", product.get("mrp", {})),
        ("Net Quantity", product.get("netQuantity", {})),
        ("Manufacturer", product.get("manufacturer", {})),
        ("Packer", product.get("packer", {})),
        ("Importer", product.get("importer", {})),
        ("Manufacture Date", product.get("manufactureDate", {})),
        ("Country of Origin", product.get("countryOfOrigin", {})),
    ]

    for name, field in fields:
        value = field.get("value")
        conf = field.get("confidence")
        extra = ""
        if "currency" in field and field["currency"]:
            extra += f" ({field['currency']})"
        if "unit" in field and field["unit"]:
            extra += f" {field['unit']}"
        conf_str = f"{conf:.2f}" if conf is not None else "N/A"
        print(f"  {name:25s}: {str(value):30s} [conf: {conf_str}]{extra}")

    # Consumer care
    cc = product.get("consumerCare", {})
    phone = cc.get("phone", {})
    email = cc.get("email", {})
    print(f"  {'Phone':25s}: {str(phone.get('value')):30s} [conf: {phone.get('confidence', 'N/A')}]")
    print(f"  {'Email':25s}: {str(email.get('value')):30s} [conf: {email.get('confidence', 'N/A')}]")


def print_regions(regions: list) -> None:
    """Print extracted evidence regions."""
    separator("EVIDENCE REGIONS")
    if not regions:
        print("  (no regions detected)")
        return
    for r in regions:
        print(f"  Field: {r['field']:20s}  OCR: \"{r.get('ocrText', '')}\"  Conf: {r['confidence']:.2f}  BBox: {[round(v,1) for v in r['bbox']]}")


def print_quality(quality: list) -> None:
    """Print image quality assessments."""
    separator("IMAGE QUALITY")
    for q in quality:
        print(f"  Image ID:       {q['imageId']}")
        print(f"  Blur Score:     {q['blurScore']:.4f}")
        print(f"  Glare Fraction: {q['glareFraction']:.4f}")
        print(f"  Skew Degrees:   {q['skewDegrees']:.1f}")
        print(f"  Accepted:       {q['accepted']}")


def main():
    separator("OCR PIPELINE TEST - Eldohem Pain Relief Gel")

    # Find images
    image_files = sorted(IMAGE_DIR.glob("*"))
    image_files = [f for f in image_files if f.suffix.lower() in ('.jpg', '.jpeg', '.png', '.webp', '.bmp', '.avif') and f.name != '.gitkeep']

    if not image_files:
        print(f"  No images found in {IMAGE_DIR}")
        print(f"  Please place test images in this directory.")
        sys.exit(1)

    print(f"  Found {len(image_files)} image(s) in {IMAGE_DIR}")

    all_results = []
    for img_path in image_files:
        try:
            result = run_single_image(img_path)
            all_results.append((img_path.name, result))
        except Exception as e:
            print(f"  ✗ ERROR processing {img_path.name}: {e}")
            import traceback
            traceback.print_exc()

    # --- Aggregate results ---
    if not all_results:
        print("\nNo images were successfully processed.")
        sys.exit(1)

    # Merge all product fields across images (take best confidence)
    separator("AGGREGATED RESULTS ACROSS ALL IMAGES")
    merged_product = {}
    all_regions = []
    all_quality = []

    for filename, result in all_results:
        product = result["product"]
        all_regions.extend(result["regions"])
        all_quality.extend(result["imageQuality"])

        for field_name in ["name", "category", "mrp", "netQuantity", "manufacturer",
                           "packer", "importer", "manufactureDate", "countryOfOrigin"]:
            field = product.get(field_name, {})
            current = merged_product.get(field_name)
            val = field.get("value")
            conf = field.get("confidence")

            if val is not None and val != "" and val != 0.0:
                if current is None or (conf or 0) > (current.get("confidence") or 0):
                    merged_product[field_name] = {**field, "_source": filename}

        # Consumer care
        cc = product.get("consumerCare", {})
        for sub in ["phone", "email"]:
            subfield = cc.get(sub, {})
            key = f"consumerCare_{sub}"
            val = subfield.get("value")
            conf = subfield.get("confidence")
            if val is not None:
                current = merged_product.get(key)
                if current is None or (conf or 0) > (current.get("confidence") or 0):
                    merged_product[key] = {**subfield, "_source": filename}

    print("\n  Best extracted values (highest confidence across all images):")
    for field_name, field_data in merged_product.items():
        source = field_data.pop("_source", "?")
        val = field_data.get("value")
        conf = field_data.get("confidence")
        extra_info = ""
        if "currency" in field_data and field_data["currency"]:
            extra_info = f" {field_data['currency']}"
        if "unit" in field_data and field_data["unit"]:
            extra_info = f" {field_data['unit']}"
        conf_str = f"{conf:.2f}" if conf is not None else "N/A"
        print(f"    {field_name:25s}: {str(val):30s} [conf: {conf_str}]{extra_info}  (from {source})")

    # Print per-image details
    for filename, result in all_results:
        separator(f"DETAILS: {filename}")
        print_product_fields(result["product"])
        print_regions(result["regions"])
        print_quality(result["imageQuality"])

    # Save aggregate JSON
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    aggregate_path = OUTPUT_DIR / "test_eldohem_aggregate.json"
    aggregate_data = {
        "images_processed": len(all_results),
        "results": {name: result for name, result in all_results},
    }
    aggregate_path.write_text(
        json.dumps(aggregate_data, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    print(f"\n  Aggregate results saved to: {aggregate_path}")

    separator("DONE")


if __name__ == "__main__":
    main()
