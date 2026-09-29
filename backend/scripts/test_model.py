import os
import sys
import time
import torch
from PIL import Image
import numpy as np

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.models.swinir import get_srm_model


def test_model():
    print("=" * 60)
    print(" NTRO SRM -- MODEL ARCHITECTURE BENCHMARK")
    print("=" * 60)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Target Device: {device}")

    model = get_srm_model(device=device)
    num_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Model Parameter Count: {num_params:,} parameters")

    # Test with dummy tensor (1, 3, 64, 64) -> expect (1, 3, 256, 256)
    x = torch.randn(1, 3, 64, 64).to(device)
    start_t = time.time()
    with torch.no_grad():
        y = model(x)
    elapsed_ms = (time.time() - start_t) * 1000

    print(f"Input Shape:  {list(x.shape)}")
    print(f"Output Shape: {list(y.shape)}")
    print(f"Forward Pass Latency: {elapsed_ms:.2f} ms")

    assert y.shape == (1, 3, 256, 256), f"Expected shape (1, 3, 256, 256), got {y.shape}"
    print("\n[SUCCESS] Model forward pass test passed!")

if __name__ == "__main__":
    test_model()
