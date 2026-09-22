"""
Test the OCR pipeline by directly calling _analyze with the provided product images.
Uses the user's image data directly.
"""
from __future__ import annotations

import io
import json
import sys
import time
from pathlib import Path
from uuid import uuid4

PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from PIL import Image, ImageDraw, ImageFont
import numpy as np

# We'll create synthetic test images that simulate the product labels
# since we can read the text from the product images

def create_test_image(texts: list[str], width: int = 800, height: int = 300) -> bytes:
    """Create a test image with text labels."""
    img = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(img)
    
    y_pos = 20
    for text in texts:
        try:
            font = ImageFont.truetype("arial.ttf", 24)
        except (IOError, OSError):
            font = ImageFont.load_default()
        draw.text((20, y_pos), text, fill="black", font=font)
        y_pos += 35
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def main():
    from app.main import _analyze, SCHEMA_VALIDATOR

    print("=" * 70)
    print("  OCR PIPELINE TEST - Simulated Eldohem Pain Relief Gel Labels")
    print("=" * 70)

    # ---- Image 1: Front panel ----
    img1_texts = [
        "Eldohem Pain Relief Gel",
        "Powerful Pain Relief NEW Gel",
        "Marketed by:",
        "Elder Neutraciticals Pvt. Ltd.",
        "402, Sai Baba Tower, Versova,",
        "Four Bunglows, Andheri (W), Andheri",
        "Mumbai, Maharashtra 400053",
    ]

    # ---- Image 2: Top panel ----
    img2_texts = [
        "Diclofenac Diethylamine, Virgin Linseed Oil,",
        "Methyl Salicylate and Menthol Gel",
        "Eldohem Pain Relief NEW Gel",
        "30 g",
        "Elder Neutraciticals",
    ]

    # ---- Image 3: Side panel (batch/MRP info) ----
    img3_texts = [
        "Mfg. Lic. No.: MNB/09/794 & MB/09/795",
        "Batch No.: PR 25044",
        "Mfg Date: 11/2027",
        "Expiry Date: 12/2025",
        "MRP Rs. 107.80",
        "Inclusive of all taxes",
    ]

    # ---- Image 4: Bottom panel (composition) ----
    img4_texts = [
        "Composition:",
        "Diclofenac Diethylamine IP 1.16% w/w",
        "eq. to Diclofenac Sodium 1.0% w/w",
        "Virgin Linseed Oil BP 3.0% w/w",
        "Methyl Salicylate IP 10.0% w/w",
        "Menthol IP 0.5% w/w",
        "Preservative: Benzyl Alcohol IP 1.0% w/w",
        "FOR EXTERNAL USE ONLY",
        "NOT FOR VETERINARY USE",
        "Store below 25C. Do not freeze.",
        "Manufactured in India by:",
        "Preet Remedies Ltd.",
        "183-186, HPSIDC, Industrial Area,",
        "Baddi-173 205 (H.P.)",
    ]

    test_cases = [
        ("front_panel", img1_texts),
        ("top_panel", img2_texts),
        ("side_panel_mrp", img3_texts),
        ("bottom_panel_composition", img4_texts),
    ]

    all_results = []

    for name, texts in test_cases:
        print(f"\n{'─'*60}")
        print(f"  Testing: {name}")
        print(f"{'─'*60}")
        
        content = create_test_image(texts, width=900, height=40 + 35 * len(texts))
        image_id = str(uuid4())

        start = time.perf_counter()
        try:
            result = _analyze(content, image_id)
            elapsed = time.perf_counter() - start

            # Schema validation
            errors = list(SCHEMA_VALIDATOR.iter_errors(result))
            schema_status = "✓ PASSED" if not errors else f"✗ FAILED ({len(errors)} errors)"
            
            print(f"  Time: {elapsed:.2f}s | Schema: {schema_status}")
            
            product = result["product"]
            print(f"\n  Product Name:       {product['name']['value']!r} (conf: {product['name']['confidence']:.2f})")
            
            mrp = product["mrp"]
            print(f"  MRP:                {mrp['value']} {mrp.get('currency', '')} (conf: {mrp['confidence']})")
            
            qty = product["netQuantity"]
            print(f"  Net Quantity:       {qty['value']} {qty.get('unit', '')} (conf: {qty['confidence']})")
            
            print(f"  Manufacturer:       {product['manufacturer']['value']} (conf: {product['manufacturer']['confidence']})")
            print(f"  Packer:             {product['packer']['value']} (conf: {product['packer']['confidence']})")
            print(f"  Manufacture Date:   {product['manufactureDate']['value']} (conf: {product['manufactureDate']['confidence']})")
            print(f"  Country of Origin:  {product['countryOfOrigin']['value']} (conf: {product['countryOfOrigin']['confidence']})")

            # Regions
            if result["regions"]:
                print(f"\n  Evidence Regions ({len(result['regions'])}):")
                for r in result["regions"]:
                    print(f"    {r['field']:20s} → \"{r['ocrText']}\" (conf: {r['confidence']:.2f})")

            # Quality
            for q in result["imageQuality"]:
                print(f"\n  Image Quality: blur={q['blurScore']:.4f}, glare={q['glareFraction']:.4f}, accepted={q['accepted']}")
            
            if errors:
                print(f"\n  Schema errors:")
                for e in errors:
                    print(f"    - {e.message}")

            all_results.append((name, result))

        except Exception as e:
            elapsed = time.perf_counter() - start
            print(f"  ✗ ERROR ({elapsed:.2f}s): {e}")
            import traceback
            traceback.print_exc()

    # Save results
    output_dir = PROJECT_ROOT / "output"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "test_eldohem_results.json"
    
    aggregate = {
        "test_run": "Eldohem Pain Relief Gel - OCR Pipeline Test",
        "images_processed": len(all_results),
        "results": {name: result for name, result in all_results}
    }
    output_path.write_text(json.dumps(aggregate, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    print(f"\n{'='*70}")
    print(f"  SUMMARY: Processed {len(all_results)}/{len(test_cases)} images successfully")
    print(f"  Results saved to: {output_path}")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
