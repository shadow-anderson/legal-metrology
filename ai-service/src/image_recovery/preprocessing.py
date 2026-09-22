import cv2
import numpy as np

def apply_clahe(image: np.ndarray, clip_limit: float = 2.0, grid_size: tuple = (8, 8)) -> np.ndarray:
    """Apply Contrast Limited Adaptive Histogram Equalization."""
    if len(image.shape) == 3:
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
        cl = clahe.apply(l)
        limg = cv2.merge((cl, a, b))
        return cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    else:
        clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=grid_size)
        return clahe.apply(image)

def denoise(image: np.ndarray, strength: int = 10) -> np.ndarray:
    """Apply Non-Local Means Denoising."""
    if len(image.shape) == 3:
        return cv2.fastNlMeansDenoisingColored(image, None, strength, strength, 7, 21)
    else:
        return cv2.fastNlMeansDenoising(image, None, strength, 7, 21)

def sharpen(image: np.ndarray, strength: float = 1.5) -> np.ndarray:
    """Apply Unsharp Masking."""
    blurred = cv2.GaussianBlur(image, (0, 0), 3)
    return cv2.addWeighted(image, 1.0 + strength, blurred, -strength, 0)

def gamma_correction(image: np.ndarray, gamma: float = 1.0) -> np.ndarray:
    """Apply gamma correction."""
    inv_gamma = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv_gamma) * 255 for i in np.arange(0, 256)]).astype("uint8")
    return cv2.LUT(image, table)

def adaptive_threshold(image: np.ndarray) -> np.ndarray:
    """Apply adaptive thresholding."""
    if len(image.shape) == 3:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image
    return cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
