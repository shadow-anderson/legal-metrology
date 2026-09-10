from io import BytesIO
from uuid import uuid4

from fastapi.testclient import TestClient
from PIL import Image

import app.main as main
from app.main import SCHEMA_VALIDATOR, Observation, _analyze, _extract, app


def png_bytes(color="white"):
    buffer = BytesIO()
    Image.new("RGB", (128, 128), color).save(buffer, format="PNG")
    return buffer.getvalue()


def test_blank_image_is_schema_valid_and_does_not_crash():
    result = _analyze(png_bytes(), str(uuid4()))
    assert list(SCHEMA_VALIDATOR.iter_errors(result)) == []
    assert result["regions"] == []
    assert result["product"]["mrp"]["value"] is None


def test_declarations_include_evidence_regions():
    image_id = str(uuid4())
    observations = [
        Observation("MRP", [10, 10, 40, 20], 0.95),
        Observation("₹120", [40, 10, 70, 20], 0.95),
        Observation("Net Qty 500 g", [10, 30, 100, 42], 0.90),
        Observation("Manufactured by ABC Foods", [10, 50, 180, 62], 0.88),
    ]
    product, regions = _extract(observations, image_id)
    assert product["mrp"] == {"value": 120.0, "currency": "INR", "confidence": 0.95}
    assert product["netQuantity"]["value"] == 500.0
    assert product["netQuantity"]["unit"] == "g"
    assert product["manufacturer"]["value"] == "ABC Foods"
    assert {region["field"] for region in regions} == {"MRP", "NET_QTY", "MANUFACTURER"}
    assert all(region["sourceImageId"] == image_id for region in regions)


def test_role_aware_declarations_and_empty_observations_are_safe():
    image_id = str(uuid4())
    observations = [
        Observation("Packed by XYZ Traders", [10, 10, 180, 22], 0.84),
        Observation("Imported by DEF Imports", [10, 24, 180, 36], 0.83),
        Observation("MFD 08/2026", [10, 38, 120, 50], 0.82),
        Observation("Consumer Care 1800123456", [10, 52, 200, 64], 0.81),
        Observation("care@example.com", [10, 66, 180, 78], 0.80),
        Observation("Country of Origin India", [10, 80, 220, 92], 0.79),
    ]
    product, regions = _extract(observations, image_id)

    assert product["packer"]["value"] == "XYZ Traders"
    assert product["importer"]["value"] == "DEF Imports"
    assert product["manufactureDate"]["value"] == "08/2026"
    assert product["consumerCare"]["phone"]["value"] == "1800123456"
    assert product["consumerCare"]["email"]["value"] == "care@example.com"
    assert product["countryOfOrigin"]["value"] == "India"
    assert {region["field"] for region in regions} == {"PACKER", "IMPORTER", "DATE", "CONSUMER_CARE", "ORIGIN"}
    assert _extract([], image_id)[0]["mrp"]["value"] is None


def test_suffix_mrp_and_standalone_quantity_are_normalized():
    product, regions = _extract([
        Observation("₹120 MRP", [10, 10, 90, 22], 0.91),
        Observation("500 g", [10, 30, 80, 42], 0.89),
    ], str(uuid4()))

    assert product["mrp"] == {"value": 120.0, "currency": "INR", "confidence": 0.91}
    assert product["netQuantity"]["value"] == 500.0
    assert product["netQuantity"]["unit"] == "g"
    assert {region["field"] for region in regions} == {"MRP", "NET_QTY"}


def test_http_api_returns_and_persists_one_schema_valid_output_document(tmp_path, monkeypatch):
    monkeypatch.setattr(main, "OUTPUT_DIR", tmp_path)
    client = TestClient(app)
    image_id = str(uuid4())
    response = client.post(
        "/analyze",
        files={"image": ("sample.png", png_bytes(), "image/png")},
        data={"image_id": image_id},
    )

    assert response.status_code == 200
    payload = response.json()
    assert set(payload) == {"product", "regions", "imageQuality", "scale"}
    assert list(SCHEMA_VALIDATOR.iter_errors(payload)) == []
    assert (tmp_path / f"{image_id}.json").read_text(encoding="utf-8")
    assert (tmp_path / f"{image_id}.json").read_text(encoding="utf-8") == (
        __import__("json").dumps(payload, indent=2, ensure_ascii=True) + "\n"
    )


def test_unreadable_image_is_rejected():
    try:
        _analyze(b"not an image", str(uuid4()))
    except Exception as error:
        assert "Unreadable image" in str(error.detail)
    else:
        raise AssertionError("unreadable image was accepted")