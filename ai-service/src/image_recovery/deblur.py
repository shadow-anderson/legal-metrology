import cv2
import numpy as np

def wiener_filter(img, kernel, K=0.01):
    """Simple Wiener filter for deblurring."""
    dummy = np.copy(img)
    if len(img.shape) == 3:
        # Process each channel
        for i in range(3):
            img_fft = np.fft.fft2(img[:,:,i])
            kernel_fft = np.fft.fft2(kernel, s=img.shape[:2])
            kernel_fft_conj = np.conj(kernel_fft)
            res_fft = img_fft * kernel_fft_conj / (np.abs(kernel_fft)**2 + K)
            dummy[:,:,i] = np.abs(np.fft.ifft2(res_fft))
    else:
        img_fft = np.fft.fft2(img)
        kernel_fft = np.fft.fft2(kernel, s=img.shape)
        kernel_fft_conj = np.conj(kernel_fft)
        res_fft = img_fft * kernel_fft_conj / (np.abs(kernel_fft)**2 + K)
        dummy = np.abs(np.fft.ifft2(res_fft))
    return np.uint8(np.clip(dummy, 0, 255))

def deblur_focus(image: np.ndarray, radius: int = 5) -> np.ndarray:
    """Attempt to deblur focus blur using a disk kernel."""
    kernel = np.zeros((radius*2+1, radius*2+1), np.float32)
    cv2.circle(kernel, (radius, radius), radius, 1, -1)
    kernel /= kernel.sum()
    return wiener_filter(image, kernel)

def deblur_motion(image: np.ndarray, length: int = 10, angle: float = 0) -> np.ndarray:
    """Attempt to deblur motion blur."""
    M = cv2.getRotationMatrix2D((length/2, length/2), angle, 1)
    kernel = np.zeros((length, length), np.float32)
    kernel[int(length/2), :] = 1
    kernel = cv2.warpAffine(kernel, M, (length, length))
    kernel /= kernel.sum()
    return wiener_filter(image, kernel)

def apply_deblurring(image: np.ndarray, nature: str = 'GENERAL') -> list[np.ndarray]:
    """Generate deblurred variants based on nature."""
    variants = []
    if nature == 'FOCUS' or nature == 'GENERAL':
        variants.append(deblur_focus(image, radius=3))
        variants.append(deblur_focus(image, radius=5))
    if nature == 'MOTION' or nature == 'GENERAL':
        # Try a few common angles if not known
        for angle in [0, 45, 90, 135]:
            variants.append(deblur_motion(image, length=10, angle=angle))
    return variants
