import cv2
import numpy as np
from .preprocessing import apply_clahe, sharpen, denoise
from .deblur import apply_deblurring
from .enhancement import upscale_region, enhance_text_region

def generate_global_variants(image: np.ndarray, blur_level: str, blur_nature: str) -> list[np.ndarray]:
    """Generate global image variants based on overall quality."""
    variants = [image]
    
    # Grayscale is often better for OCR
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variants.append(gray)
    
    if blur_level in ['MODERATE', 'SEVERE']:
        # Add deblurred variants
        variants.extend(apply_deblurring(image, blur_nature))
        
    # Standard enhancements
    variants.append(apply_clahe(gray))
    variants.append(sharpen(gray))
    
    return variants

def generate_regional_variants(image: np.ndarray, bbox: list[float]) -> list[np.ndarray]:
    """Generate variants for a specific crop."""
    x1, y1, x2, y2 = map(int, bbox)
    h, w = image.shape[:2]
    x1, x2 = max(0, x1), min(w, x2)
    y1, y2 = max(0, y1), min(h, y2)
    
    if x2 <= x1 or y2 <= y1:
        return []
        
    crop = image[y1:y2, x1:x2]
    return enhance_text_region(crop)
