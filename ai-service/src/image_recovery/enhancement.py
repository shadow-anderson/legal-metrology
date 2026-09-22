import cv2
import numpy as np

def upscale_region(crop: np.ndarray, factor: float = 2.0) -> np.ndarray:
    """Upscale a crop using cubic interpolation."""
    h, w = crop.shape[:2]
    return cv2.resize(crop, (int(w * factor), int(h * factor)), interpolation=cv2.INTER_CUBIC)

def enhance_text_region(crop: np.ndarray) -> list[np.ndarray]:
    """
    Apply a sequence of enhancements tailored for text regions.
    Returns multiple variants.
    """
    variants = []
    
    # Variant 1: Original (base for comparison)
    variants.append(crop)
    
    # Variant 2: Upscale + Sharpen
    up = upscale_region(crop, 2.0)
    gray = cv2.cvtColor(up, cv2.COLOR_BGR2GRAY) if len(up.shape) == 3 else up
    
    # Sharpening
    blurred = cv2.GaussianBlur(gray, (0, 0), 3)
    sharpened = cv2.addWeighted(gray, 1.5, blurred, -0.5, 0)
    variants.append(sharpened)
    
    # Variant 3: CLAHE + Threshold
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    cl = clahe.apply(gray)
    thresh = cv2.adaptiveThreshold(cl, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    variants.append(thresh)
    
    # Variant 4: Denoise + Sharpen
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    variants.append(denoised)
    
    return variants

def handle_glare(crop: np.ndarray) -> np.ndarray:
    """Attempt to mitigate glare in a crop."""
    if len(crop.shape) == 3:
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    else:
        gray = crop
    
    # Simple glare mitigation: localized histogram equalization
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    return clahe.apply(gray)
