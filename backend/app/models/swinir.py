import os
import urllib.request
import torch
from spandrel import ModelLoader

# Direct download link for the official lightweight SwinIR 4x weights
SWINIR_WEIGHTS_URL = "https://github.com/JingyunLiang/SwinIR/releases/download/v0.0/002_lightweightSR_DIV2K_s64w8_SwinIR-S_x4.pth"

def download_weights(model_path: str, url: str):
    """Download the model weights if they don't exist."""
    if not os.path.exists(model_path):
        print(f"[SRM Model] Downloading SwinIR weights from {url}...")
        os.makedirs(os.path.dirname(model_path), exist_ok=True)
        try:
            urllib.request.urlretrieve(url, model_path)
            print(f"[SRM Model] Successfully downloaded weights to {model_path}")
        except Exception as e:
            print(f"[SRM Model] Failed to download weights: {e}")
            raise e

def get_srm_model(model_path: str = "models/swinir_4x.pth", device: str = "cpu"):
    """
    Instantiate the real SwinIR model and load weights.
    Downloads the official lightweight SwinIR weights if not found locally.
    Uses 'spandrel' to parse and load the architecture without manually defining the massive model structure.
    """
    # 1. Ensure weights are present
    download_weights(model_path, SWINIR_WEIGHTS_URL)
    
    # 2. Load with spandrel
    print(f"[SRM Model] Loading weights from {model_path} via spandrel on {device}...")
    model_loader = ModelLoader()
    model = model_loader.load_from_file(model_path)
    
    # spandrel wraps the model. model.eval() sets the underlying PyTorch model to eval.
    model = model.to(device)
    model.eval()
    
    print("[SRM Model] SwinIR architecture loaded and ready for inference.")
    return model
