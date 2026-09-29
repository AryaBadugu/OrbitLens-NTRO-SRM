import os
import sys
import cv2
import base64
import torch
import numpy as np
from PIL import Image

# Ensure backend root and app directory are on python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Expose the NTRO SRM Swin2SR application and GPU inference engine
from app.main import app
from app.services.swin2sr_service import (
    model,
    processor,
    run_swin2sr_inference,
    SCALE_FACTOR,
)

# Strict Tensor Cropping helper ensuring heatmap matches exact SR dimensions
def crop_variance_tensor(variance_tensor: np.ndarray, original_width: int, original_height: int, scale_factor: int = SCALE_FACTOR) -> np.ndarray:
    """
    Rigorously crops variance array to original_width * scale_factor and original_height * scale_factor
    stripping all internal reflection padding before normalization and colorization.
    """
    expected_width = original_width * scale_factor
    expected_height = original_height * scale_factor
    return variance_tensor[:expected_height, :expected_width]


def generate_edge_map(sr_numpy_cropped: np.ndarray) -> str:
    """
    Tactical Structural Wireframe Generator (Canny Edge Detection):
    1. Tightened Edge Detection: cv2.Canny(sr_numpy_cropped, threshold1=100, threshold2=200)
    2. Re-map Colors: Convert 1-channel mask to 3-channel BGR
    3. Tactical Styling:
       - Background (mask == 0) -> Dark tactical slate BGR [30, 20, 15]
       - Edges (mask == 255) -> Sharp neon cyan BGR [255, 255, 0]
    4. Converts BGR to RGB, PIL Image, and returns base64 PNG data URI as edge_image.
    """
    import io
    if len(sr_numpy_cropped.shape) == 3:
        gray = cv2.cvtColor(sr_numpy_cropped, cv2.COLOR_RGB2GRAY)
    else:
        gray = sr_numpy_cropped

    # 1. Tighten Edge Detection for hard structural geometry
    edges = cv2.Canny(gray, threshold1=100, threshold2=200)

    # 2 & 3. Re-map Colors to 3-channel BGR tactical palette
    edge_bgr = np.zeros((*edges.shape, 3), dtype=np.uint8)
    edge_bgr[edges == 0] = [30, 20, 15]      # BGR dark tactical slate
    edge_bgr[edges == 255] = [255, 255, 0]   # BGR sharp neon cyan

    # 4. Convert BGR -> RGB for PIL, encode to base64
    edge_rgb = cv2.cvtColor(edge_bgr, cv2.COLOR_BGR2RGB)
    edge_pil = Image.fromarray(edge_rgb)

    buf = io.BytesIO()
    edge_pil.save(buf, format="PNG")
    return f"data:image/png;base64,{base64.b64encode(buf.getvalue()).decode('utf-8')}"


def extract_geotiff_crs(file_bytes: bytes, filename: str) -> str:
    """
    Extract Coordinate Reference System (CRS) from GeoTIFF files using rasterio.
    If it is a TIFF, opens the raw bytes and extracts the CRS string.
    """
    import rasterio
    from io import BytesIO

    crs_info = "Unknown (Not a GeoTIFF)"
    if filename.lower().endswith(('.tif', '.tiff')):
        try:
            with rasterio.open(BytesIO(file_bytes)) as dataset:
                crs_info = str(dataset.crs) if dataset.crs else "Unregistered CRS"
        except Exception:
            crs_info = "Unregistered CRS"
    else:
        crs_info = "EPSG:4326 (WGS 84)"
    return crs_info


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

