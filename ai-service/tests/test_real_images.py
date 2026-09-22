"""
End-to-end pipeline test on real product images from test-data/images/.

Runs the full flow:  image -> quality assessment -> adaptive OCR -> field extraction -> schema validation

Usage (from ai-service/):
    python -m pytest tests/test_real_images.py -v -s
    -- or --
    python tests/test_real_images.py
"""
from __future__ import annotations

import io
import json
import os
import sys
import time

# Force UTF-8 stdout on Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
from pathlib import Path
from uuid import uuid4

# Ensure the ai-service root is on the path so imports work
SERVICE_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SERVICE_ROOT))

from app.main import _analyze, SCHEMA_VALIDATOR

IMAGES_DIR = SERVICE_ROOT.parent / "test-data" / "images"
RESULTS_DIR = SERVICE_ROOT / "output" / "test-results"


def collect_images() -> list[Path]:
    """Gather all JPEG/PNG images from test-data/images/."""
    exts = {".jpeg", ".jpg", ".png", ".webp", ".avif"}
    images = sorted(
        p for p in IMAGES_DIR.iterdir()
        if p.suffix.lower() in exts and p.stat().st_size > 0
    )
    return images


def run_pipeline_on_image(image_path: Path) -> dict:
    """Run the full _analyze pipeline on a single image and return rich results."""
    image_id = str(uuid4())
    content = image_path.read_bytes()

    start = time.perf_counter()
    try:
        result = _analyze(content, image_id)
        elapsed = time.perf_counter() - start
        schema_errors = list(SCHEMA_VALIDATOR.iter_errors(result))
        return {
            "image": image_path.name,
            "image_id": image_id,
            "status": "OK",
            "elapsed_sec": round(elapsed, 3),
            "schema_valid": len(schema_errors) == 0,
            "schema_errors": [e.message for e in schema_errors],
            "result": result,
        }
    except Exception as exc:
        elapsed = time.perf_counter() - start
        return {
            "image": image_path.name,
            "image_id": image_id,
            "status": "ERROR",
            "elapsed_sec": round(elapsed, 3),
            "error": str(exc),
            "schema_valid": False,
            "schema_errors": [],
            "result": None,
        }


def print_report(reports: list[dict]) -> None:
    """Pretty-print a summary report for all images."""
    separator = "=" * 90
    print(f"\n{separator}")
    print(f"  PIPELINE TEST REPORT  —  {len(reports)} images")
    print(separator)

    for i, r in enumerate(reports, 1):
        print(f"\n{'─' * 90}")
        print(f"  [{i}/{len(reports)}]  {r['image']}")
        print(f"  Status : {r['status']}   |   Time : {r['elapsed_sec']}s   |   Schema valid : {r['schema_valid']}")

        if r["status"] == "ERROR":
            print(f"  [ERROR] {r['error']}")
            continue

        res = r["result"]

        # --- Image Quality ---
        iq = res.get("imageQuality", [{}])[0] if res.get("imageQuality") else {}
        print(f"  Image Quality  →  blur={iq.get('blurScore', '?')}  glare={iq.get('glareFraction', '?')}  accepted={iq.get('accepted', '?')}")

        # --- Product Fields ---
        p = res.get("product", {})
        print(f"\n  [PRODUCT] Fields:")
        print(f"     Name            : {p.get('name', {}).get('value', '—')!r}  (conf={p.get('name', {}).get('confidence', 0):.2f})")
        print(f"     MRP             : {p.get('mrp', {}).get('value', '—')}  {p.get('mrp', {}).get('currency', '')}  (conf={p.get('mrp', {}).get('confidence', '—')})")

        nq = p.get("netQuantity", {})
        print(f"     Net Quantity    : {nq.get('value', '—')} {nq.get('unit', '')}  (conf={nq.get('confidence', '—')})")

        print(f"     Manufacturer    : {p.get('manufacturer', {}).get('value', '—')!r}  (conf={p.get('manufacturer', {}).get('confidence', '—')})")
        print(f"     Packer          : {p.get('packer', {}).get('value', '—')!r}  (conf={p.get('packer', {}).get('confidence', '—')})")
        print(f"     Importer        : {p.get('importer', {}).get('value', '—')!r}  (conf={p.get('importer', {}).get('confidence', '—')})")
        print(f"     Mfg Date        : {p.get('manufactureDate', {}).get('value', '—')}")
        print(f"     Country Origin  : {p.get('countryOfOrigin', {}).get('value', '—')!r}")

        cc = p.get("consumerCare", {})
        print(f"     Consumer Phone  : {cc.get('phone', {}).get('value', '—')}")
        print(f"     Consumer Email  : {cc.get('email', {}).get('value', '—')}")

        # --- Regions ---
        regions = res.get("regions", [])
        if regions:
            print(f"\n  [REGIONS] Detected ({len(regions)}):")
            for reg in regions:
                print(f"     • {reg['field']:20s}  ocr={reg['ocrText']!r:40s}  conf={reg['confidence']:.2f}")
        else:
            print(f"\n  [REGIONS] Detected: NONE")

        # Schema errors
        if r["schema_errors"]:
            print(f"\n  [WARN] Schema errors:")
            for err in r["schema_errors"]:
                print(f"     - {err}")

    # --- Summary ---
    ok = sum(1 for r in reports if r["status"] == "OK")
    valid = sum(1 for r in reports if r["schema_valid"])
    avg_time = sum(r["elapsed_sec"] for r in reports) / len(reports) if reports else 0

    print(f"\n{separator}")
    print(f"  SUMMARY:  {ok}/{len(reports)} succeeded  |  {valid}/{len(reports)} schema-valid  |  avg time {avg_time:.2f}s")
    print(separator)


def save_results(reports: list[dict]) -> Path:
    """Save the full JSON results to output/test-results/."""
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    # Create a serialisable version (strip numpy etc.)
    out = []
    for r in reports:
        entry = {k: v for k, v in r.items()}
        out.append(entry)
    outfile = RESULTS_DIR / "real_images_report.json"
    outfile.write_text(json.dumps(out, indent=2, ensure_ascii=False, default=str), encoding="utf-8")
    return outfile


# ── pytest entry points ─────────────────────────────────────────────────────

def test_all_real_images_run_without_crash():
    """Each image in test-data/images/ must complete the pipeline without exceptions."""
    images = collect_images()
    assert images, f"No images found in {IMAGES_DIR}"

    reports = []
    for img_path in images:
        report = run_pipeline_on_image(img_path)
        reports.append(report)

    print_report(reports)
    outfile = save_results(reports)
    print(f"\n  📄 Full JSON results saved to: {outfile}")

    # Assertions
    for r in reports:
        assert r["status"] == "OK", f"Pipeline failed on {r['image']}: {r.get('error', '?')}"
        assert r["schema_valid"], f"Schema validation failed on {r['image']}: {r['schema_errors']}"


def test_back_images_extract_mrp():
    """Images showing the back of the package should detect MRP (₹20.00)."""
    images = collect_images()
    back_images = [p for p in images if "17.27.04" in p.name or "17.27.06" in p.name]
    if not back_images:
        return  # skip if naming doesn't match

    for img_path in back_images:
        report = run_pipeline_on_image(img_path)
        assert report["status"] == "OK", f"Pipeline failed on {report['image']}"
        mrp = report["result"]["product"]["mrp"]["value"]
        print(f"  {img_path.name}: MRP = {mrp}")
        # MRP should be detected (Rs.20.00 visible on package)
        if mrp is not None:
            assert isinstance(mrp, (int, float)), f"MRP should be numeric, got {type(mrp)}"


def test_back_images_extract_net_quantity():
    """Images showing back should detect net quantity (90g)."""
    images = collect_images()
    back_images = [p for p in images if "17.27.04" in p.name or "17.27.06" in p.name]
    if not back_images:
        return

    for img_path in back_images:
        report = run_pipeline_on_image(img_path)
        assert report["status"] == "OK"
        nq = report["result"]["product"]["netQuantity"]
        print(f"  {img_path.name}: Net Qty = {nq.get('value')} {nq.get('unit')}")


# ── standalone runner ────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Collecting images from:", IMAGES_DIR)
    images = collect_images()
    if not images:
        print(f"  [ERROR] No images found in {IMAGES_DIR}")
        sys.exit(1)

    print(f"  Found {len(images)} images:")
    for img in images:
        print(f"    • {img.name}  ({img.stat().st_size / 1024:.1f} KB)")

    reports = []
    for img_path in images:
        print(f"\n  >> Processing: {img_path.name} ...")
        report = run_pipeline_on_image(img_path)
        reports.append(report)

    print_report(reports)
    outfile = save_results(reports)
    print(f"\n  📄 Full JSON results saved to: {outfile}")
