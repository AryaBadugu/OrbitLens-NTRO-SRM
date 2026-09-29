import os
import io
import time
import torch
from PIL import Image
from app.config import settings
from app.services.swin2sr_service import run_swin2sr_inference, device, model, processor


class SRMInferenceService:
    def __init__(self, model_path: str = None, device: str = None):
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.output_dir = settings.OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)
        self.model = model
        self.processor = processor

    async def enhance_image_bytes(self, image_bytes: bytes, filename: str) -> dict:
        """Process image file bytes via Swin2SR real super-resolution on GPU."""
        return run_swin2sr_inference(image_bytes, filename)

    def enhance_file(self, file_path: str) -> dict:
        """Process local image file path."""
        filename = os.path.basename(file_path)
        with open(file_path, "rb") as f:
            content = f.read()
        return run_swin2sr_inference(content, filename)
