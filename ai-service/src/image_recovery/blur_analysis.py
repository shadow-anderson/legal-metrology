import cv2
import numpy as np
from typing import Dict, Any, Tuple

def estimate_blur_severity(image: np.ndarray) -> float:
    """Calculate blur score based on Laplacian variance."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    
    # Laplacian variance is a standard measure for sharpness
    score = cv2.Laplacian(gray, cv2.CV_64F).var()
    # Normalize score roughly between 0 and 1 (500 is a heuristic threshold for "sharp")
    normalized_score = float(max(0.0, min(1.0, score / 500.0)))
    return normalized_score

def analyze_blur_type(image: np.ndarray) -> str:
    """
    Attempt to categorize blur type.
    Possible return values: 'NONE', 'LIGHT', 'MODERATE', 'SEVERE'
    Also returns estimated nature: 'GENERAL', 'MOTION', 'FOCUS', 'LOCAL'
    """
    score = estimate_blur_severity(image)
    
    if score > 0.7:
        level = "NONE"
    elif score > 0.4:
        level = "LIGHT"
    elif score > 0.15:
        level = "MODERATE"
    else:
        level = "SEVERE"
        
    # Heuristic for motion blur: check for anisotropy in gradients
    # This is a simple implementation; more advanced could use FFT
    nature = "GENERAL"
    if level != "NONE":
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
            
        gx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        gy = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        
        mag_x = np.sum(np.abs(gx))
        mag_y = np.sum(np.abs(gy))
        
        ratio = max(mag_x, mag_y) / (min(mag_x, mag_y) + 1e-6)
        if ratio > 2.0:
            nature = "MOTION"
        elif score < 0.3:
            nature = "FOCUS"
            
    return level, nature

def analyze_regions(image: np.ndarray, regions: list[Dict[str, Any]]) -> list[Dict[str, Any]]:
    """
    Analyze sharpness for each text region.
    """
    results = []
    for region in regions:
        bbox = region.get("bbox")
        if not bbox or len(bbox) != 4:
            continue
            
        x1, y1, x2, y2 = map(int, bbox)
        # Ensure coordinates are within image bounds
        h, w = image.shape[:2]
        x1, x2 = max(0, x1), min(w, x2)
        y1, y2 = max(0, y1), min(h, y2)
        
        if x2 <= x1 or y2 <= y1:
            continue
            
        crop = image[y1:y2, x1:x2]
        blur_score = estimate_blur_severity(crop)
        level, nature = analyze_blur_type(crop)
        
        results.append({
            "bbox": [x1, y1, x2, y2],
            "blur_score": round(blur_score, 4),
            "blur_level": level,
            "blur_nature": nature
        })
    return results
