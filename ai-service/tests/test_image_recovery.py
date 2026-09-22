import numpy as np
import pytest
from src.image_recovery.blur_analysis import estimate_blur_severity, analyze_blur_type
from src.image_recovery.preprocessing import sharpen, apply_clahe
from src.ocr.fusion import fuse_ocr_results, OCRPass, contextual_correction
from src.extraction.ai_assisted import verify_with_ai

def test_blur_analysis():
    # Create a sharp image (synthetic white square on black)
    sharp_image = np.zeros((100, 100, 3), dtype=np.uint8)
    sharp_image[25:75, 25:75] = 255
    
    # Create a blurred image
    import cv2
    blurred_image = cv2.GaussianBlur(sharp_image, (15, 15), 0)
    
    sharp_score = estimate_blur_severity(sharp_image)
    blurred_score = estimate_blur_severity(blurred_image)
    
    # Sharp image should have a higher score (variance) than the blurred image
    assert sharp_score > blurred_score

def test_blur_type_categorization():
    # Sharp image should be NONE or LIGHT blur
    sharp_image = np.zeros((100, 100, 3), dtype=np.uint8)
    sharp_image[25:75, 25:75] = 255
    
    level, nature = analyze_blur_type(sharp_image)
    assert level in ['NONE', 'LIGHT']
    
    # Highly blurred image
    import cv2
    blurred_image = cv2.GaussianBlur(sharp_image, (21, 21), 0)
    level, nature = analyze_blur_type(blurred_image)
    assert level in ['MODERATE', 'SEVERE']

def test_ocr_fusion():
    passes = [
        OCRPass("MRP Rs 120", 0.9, "variant1"),
        OCRPass("MRP Rs 12O", 0.8, "variant2"),
        OCRPass("MRP Rs 120", 0.95, "variant3"),
    ]
    fused = fuse_ocr_results(passes)
    assert fused["text"] == "MRP Rs 120"
    assert fused["confidence"] == 0.95
    assert fused["agreement"] == 2/3 or fused["agreement"] == 1.0 # Rs 12O is slightly different, but similarity is high

def test_contextual_correction():
    corrected = contextual_correction("12O", "MRP")
    assert corrected == "120"
    
    # Should not correct in normal texts
    uncorrected = contextual_correction("ABC FOODS", "MANUFACTURER")
    assert uncorrected == "ABC FOODS"

def test_ai_verification():
    fused = {
        "text": "MRP Rs 120",
        "confidence": 0.9,
        "agreement": 1.0
    }
    verified = verify_with_ai("MRP", None, [], ["MRP Rs 120"], fused)
    assert verified["verified"] is True
    assert verified["status"] == "DETECTED"
