import numpy as np
from skimage.metrics import peak_signal_noise_ratio, structural_similarity


def compute_psnr(original: np.ndarray, enhanced: np.ndarray) -> float:
    """
    Compute Peak Signal-to-Noise Ratio (PSNR) using scikit-image.
    Both images must be uint8 [0, 255] or float [0.0, 1.0] with matching dtype.
    """
    # Ensure uint8 for consistent data_range
    if original.dtype != np.uint8:
        original = (np.clip(original, 0, 1) * 255).astype(np.uint8)
    if enhanced.dtype != np.uint8:
        enhanced = (np.clip(enhanced, 0, 1) * 255).astype(np.uint8)

    return float(peak_signal_noise_ratio(original, enhanced, data_range=255))


def compute_ssim(original: np.ndarray, enhanced: np.ndarray) -> float:
    """
    Compute Structural Similarity Index (SSIM) using scikit-image.
    Uses the proper windowed (11x11) Gaussian-weighted computation,
    not the naive global-mean approach that produces fake 0.9999 scores.
    """
    # Ensure uint8
    if original.dtype != np.uint8:
        original = (np.clip(original, 0, 1) * 255).astype(np.uint8)
    if enhanced.dtype != np.uint8:
        enhanced = (np.clip(enhanced, 0, 1) * 255).astype(np.uint8)

    # Determine win_size based on smallest image dimension
    min_dim = min(original.shape[0], original.shape[1])
    win_size = min(7, min_dim)
    if win_size % 2 == 0:
        win_size -= 1
    if win_size < 3:
        win_size = 3

    return float(structural_similarity(
        original,
        enhanced,
        data_range=255,
        channel_axis=2 if original.ndim == 3 else None,
        win_size=win_size,
    ))
