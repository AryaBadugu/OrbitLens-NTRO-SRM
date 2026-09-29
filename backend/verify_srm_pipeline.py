import os
import sys
import time
import json
import torch
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.services.swin2sr_service import run_swin2sr_inference, device, model, processor

print("=" * 70)
print("SIH 2026 PS 26142 (NTRO) — SRM HARDWARE & DL ENGINE VERIFICATION")
print("=" * 70)

# 1. Hardware & CUDA Verification
cuda_ok = torch.cuda.is_available()
gpu_name = torch.cuda.get_device_name(0) if cuda_ok else "None (CPU)"
print(f"[*] CUDA Available: {cuda_ok}")
print(f"[*] Detected GPU: {gpu_name}")
print(f"[*] PyTorch Version: {torch.__version__}")
assert cuda_ok, "CRITICAL: CUDA is not available! Must run on RTX 5050 GPU."
assert "5050" in gpu_name, f"Expected RTX 5050 GPU, found: {gpu_name}"

# 2. Native Model Architecture Verification
print(f"[*] Model Class: {model.__class__.__name__}")
print(f"[*] Processor Class: {processor.__class__.__name__}")
print(f"[*] Model Device: {next(model.parameters()).device}")

# 3. Direct Swin2SR Inference Test
test_image_path = os.path.join(os.path.dirname(__file__), "data", "demo_tiles", "crop_01.jpg")
assert os.path.exists(test_image_path), f"Missing test tile: {test_image_path}"

with open(test_image_path, "rb") as f:
    raw_bytes = f.read()

print(f"\n[*] Running Swin2SR Deep Learning inference on {os.path.basename(test_image_path)} ({len(raw_bytes)} bytes)...")
t0 = time.time()
direct_result = run_swin2sr_inference(raw_bytes, "crop_01.jpg")
t1 = time.time()

metrics = direct_result["metrics"]
print(f"[+] Direct Inference Status: {direct_result['status']}")
print(f"[+] Output Enhanced Image: {direct_result['enhanced_path']}")
print(f"[+] Dynamic PSNR (skimage): {metrics['psnr']} dB")
print(f"[+] Dynamic SSIM (skimage): {metrics['ssim']}")
print(f"[+] GPU Latency: {metrics['inference_time_ms']} ms (Total roundtrip: {round((t1-t0)*1000, 2)} ms)")
print(f"[+] Input Resolution: {metrics['input_resolution']} -> Enhanced Resolution: {metrics['enhanced_resolution']}")
print(f"[+] Dimensions: {metrics['dimensions_in']} -> {metrics['dimensions_out']}")

assert metrics["psnr"] > 25.0, f"PSNR too low: {metrics['psnr']}"
assert metrics["ssim"] > 0.70, f"SSIM too low: {metrics['ssim']}"

# 4. FastAPI Endpoint Verification
print("\n[*] Testing FastAPI /api/enhance and /enhance endpoints via TestClient...")
client = TestClient(app)

# Health endpoint
health_res = client.get("/api/health")
assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
print(f"[+] /api/health Response: {health_res.json()}")

# /api/enhance endpoint
with open(test_image_path, "rb") as f:
    api_enhance_res = client.post(
        "/api/enhance",
        files={"file": ("crop_01.jpg", f, "image/jpeg")}
    )
assert api_enhance_res.status_code == 200, f"/api/enhance failed: {api_enhance_res.text}"
api_data = api_enhance_res.json()
assert api_data["status"] == "success"
assert "enhanced_path" in api_data
assert "enhanced_base64" in api_data
assert "heatmap_base64" in api_data
assert "edge_base64" in api_data
assert "edge_image" in api_data
assert "vegetation_base64" in api_data
assert api_data["heatmap_base64"].startswith("data:image/png;base64,")
assert api_data["edge_base64"].startswith("data:image/png;base64,")
assert api_data["edge_image"].startswith("data:image/png;base64,")
assert api_data["vegetation_base64"].startswith("data:image/png;base64,")
assert "crs_info" in api_data
assert "sam" in api_data["metrics"]
assert "crs" in api_data["metrics"]
print(f"[+] /api/enhance HTTP 200 OK — PSNR: {api_data['metrics']['psnr']} dB, SSIM: {api_data['metrics']['ssim']}, SAM: {api_data['metrics']['sam']}°, CRS: {api_data['crs_info']}")

# /enhance direct endpoint
with open(test_image_path, "rb") as f:
    direct_enhance_res = client.post(
        "/enhance",
        files={"file": ("crop_01.jpg", f, "image/jpeg")}
    )
assert direct_enhance_res.status_code == 200, f"/enhance failed: {direct_enhance_res.text}"
direct_data = direct_enhance_res.json()
assert "heatmap_base64" in direct_data
assert "enhanced_base64" in direct_data
assert "edge_base64" in direct_data
assert "edge_image" in direct_data
assert "vegetation_base64" in direct_data
assert "crs_info" in direct_data
print(f"[+] /enhance HTTP 200 OK — MC Dropout Heatmap, Edge Map, Vegetation Map, CRS & SR Base64 Verified")

# 5. GeoTIFF CRS Extraction Verification with rasterio
print("\n[*] Testing GeoTIFF CRS extraction via rasterio...")
import io
import rasterio
from rasterio.crs import CRS
import numpy as np

# Create an in-memory GeoTIFF with EPSG:32643 (UTM zone 43N)
tif_buffer = io.BytesIO()
with rasterio.open(
    tif_buffer,
    'w',
    driver='GTiff',
    height=64,
    width=64,
    count=3,
    dtype='uint8',
    crs=CRS.from_epsg(32643),
) as dst:
    for i in range(1, 4):
        dst.write(np.full((64, 64), 100, dtype=np.uint8), i)

tif_bytes = tif_buffer.getvalue()

geotiff_res = client.post(
    "/api/enhance",
    files={"file": ("sentinel_tile.tif", tif_bytes, "image/tiff")}
)
assert geotiff_res.status_code == 200, f"GeoTIFF enhance failed: {geotiff_res.text}"
geotiff_data = geotiff_res.json()
assert "EPSG:32643" in geotiff_data["crs_info"], f"Expected EPSG:32643 in crs_info, got {geotiff_data['crs_info']}"
print(f"[+] GeoTIFF CRS Extraction verified: {geotiff_data['crs_info']}")

print("\n" + "=" * 70)
print("ALL VERIFICATION CHECKS PASSED: 100% REAL GPU SWIN2SR PIPELINE ACTIVE")
print("=" * 70)
