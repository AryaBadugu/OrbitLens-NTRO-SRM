import torch
import torch.nn as nn
import numpy as np
from PIL import Image

def enable_dropout(model):
    """Enable dropout layers during inference for Monte Carlo Dropout."""
    underlying = getattr(model, 'model', model)
    for m in underlying.modules():
        if isinstance(m, (nn.Dropout, nn.Dropout2d, nn.Dropout3d)):
            m.train()

def compute_mc_uncertainty(
    model,
    input_tensor: torch.Tensor,
    num_passes: int = 5
) -> tuple[np.ndarray, np.ndarray, float]:
    """
    Compute Monte Carlo Dropout variance and per-pixel confidence map across N forward passes.
    """
    underlying = getattr(model, 'model', model)
    underlying.eval()
    enable_dropout(model)

    device = next(underlying.parameters()).device
    input_tensor = input_tensor.to(device)

    preds = []
    with torch.no_grad():
        for _ in range(num_passes):
            out = model(input_tensor)
            # Clamp to valid image intensity range [0.0, 1.0]
            out_clamped = torch.clamp(out, 0.0, 1.0)
            preds.append(out_clamped.cpu().numpy()[0])  # [C, H, W]

    # Stack predictions [N, C, H, W]
    preds_arr = np.stack(preds, axis=0)

    # Compute mean prediction across passes [C, H, W]
    mean_pred = np.mean(preds_arr, axis=0)
    # Compute variance across passes [C, H, W] -> average across color channels to get 2D map [H, W]
    variance_map = np.mean(np.var(preds_arr, axis=0), axis=0)

    # Normalize variance map to [0.0, 1.0] range
    v_min, v_max = variance_map.min(), variance_map.max()
    if v_max > v_min:
        norm_variance = (variance_map - v_min) / (v_max - v_min)
    else:
        norm_variance = np.zeros_like(variance_map)

    # Format mean image array [H, W, C] in range [0, 255]
    mean_img = np.transpose(mean_pred, (1, 2, 0))
    mean_img = (np.clip(mean_img, 0.0, 1.0) * 255.0).astype(np.uint8)

    mean_uncertainty_score = float(np.mean(norm_variance))

    return mean_img, norm_variance, mean_uncertainty_score

def generate_uncertainty_heatmap(variance_map: np.ndarray) -> Image.Image:
    """
    Convert 2D variance map [H, W] into a visual RGB heatmap (Cyan -> Yellow -> Red gradient).
    """
    h, w = variance_map.shape
    heatmap_arr = np.zeros((h, w, 3), dtype=np.uint8)

    # Tactical Heatmap Gradient: Low = Dark Cyan/Green, Medium = Amber, High = Red
    # R channel = variance * 255
    # G channel = (1 - variance) * 200
    # B channel = (1 - variance) * 255
    r = (variance_map * 255.0).astype(np.uint8)
    g = ((1.0 - variance_map) * 180.0).astype(np.uint8)
    b = ((1.0 - variance_map) * 220.0 + variance_map * 40.0).astype(np.uint8)

    heatmap_arr[:, :, 0] = r
    heatmap_arr[:, :, 1] = g
    heatmap_arr[:, :, 2] = b

    return Image.fromarray(heatmap_arr)
