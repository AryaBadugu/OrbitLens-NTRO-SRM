import os
import sys
import torch
import numpy as np
from PIL import Image

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.models.swinir import get_srm_model
from app.services.uncertainty import compute_mc_uncertainty, generate_uncertainty_heatmap

def test_uncertainty():
    print("=" * 60)
    print(" NTRO SRM -- MONTE CARLO DROPOUT UNCERTAINTY TEST")
    print("=" * 60)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = get_srm_model(device=device)

    # Load demo tile
    tile_path = os.path.join(os.path.dirname(__file__), "..", "data", "demo_tiles", "harbor_01.png")
    if not os.path.exists(tile_path):
        print("Creating dummy tile for test...")
        img = Image.new("RGB", (256, 256), (30, 60, 90))
    else:
        img = Image.open(tile_path).convert("RGB")

    # Downsample tile to simulate LR input (64x64)
    lr_img = img.resize((64, 64), Image.Resampling.BICUBIC)
    arr = np.array(lr_img).astype(np.float32) / 255.0
    arr = np.transpose(arr, (2, 0, 1))  # [3, 64, 64]
    tensor = torch.tensor(arr).unsqueeze(0).to(device)  # [1, 3, 64, 64]

    print(f"Running N=5 Monte Carlo Dropout forward passes...")
    mean_img, var_map, score = compute_mc_uncertainty(model, tensor, num_passes=5)

    print(f"Mean Image Shape:      {mean_img.shape}")
    print(f"Variance Map Shape:    {var_map.shape}")
    print(f"Variance Min / Max:    {var_map.min():.4f} / {var_map.max():.4f}")
    print(f"Tile Uncertainty Score: {score:.4f}")

    heatmap = generate_uncertainty_heatmap(var_map)
    out_dir = os.path.join(os.path.dirname(__file__), "..", "outputs")
    os.makedirs(out_dir, exist_ok=True)
    heatmap_path = os.path.join(out_dir, "harbor_01_uncertainty.png")
    heatmap.save(heatmap_path)
    print(f"Heatmap saved to: {heatmap_path}")

    assert mean_img.shape == (256, 256, 3), f"Expected (256, 256, 3), got {mean_img.shape}"
    assert var_map.shape == (256, 256), f"Expected (256, 256), got {var_map.shape}"
    assert not np.isnan(var_map).any(), "Variance map contains NaNs!"

    print("\n[SUCCESS] Monte Carlo Dropout uncertainty test passed!")

if __name__ == "__main__":
    test_uncertainty()
