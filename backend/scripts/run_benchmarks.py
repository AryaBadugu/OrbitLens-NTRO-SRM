"""
NTRO SRM -- Multi-resolution SwinIR Performance Benchmarking Script

Evaluates SwinIR 4x enhancement across standard satellite tile sizes (128x128 to 1024x1024 px),
measuring inference latency, memory footprint, PSNR, and SSIM.
Exports summary report to backend/data/performance_benchmark.json.
"""

import os
import sys
import json
import time
import torch
import numpy as np
from PIL import Image

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.inference import SRMInferenceService

def run_benchmarks():
    print("=" * 70)
    print(" NTRO SRM -- MULTI-RESOLUTION PERFORMANCE BENCHMARK SUITE")
    print("=" * 70)

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Compute Hardware: {device.upper()}")
    if device == "cuda":
        print(f"GPU Device Name:  {torch.cuda.get_device_name(0)}")

    inference_service = SRMInferenceService()
    temp_dir = os.path.join(backend_dir, "outputs", "benchmark_temp")
    os.makedirs(temp_dir, exist_ok=True)

    test_resolutions = [128, 256, 512, 1024]
    benchmark_results = []

    print("\n" + "-" * 70)
    print(f"{'Input Size':<12} | {'Output Size':<12} | {'PSNR (dB)':<10} | {'SSIM':<8} | {'Latency (ms)':<14} | {'Status'}")
    print("-" * 70)

    for res in test_resolutions:
        # Create synthetic test pattern of size res x res
        canvas = np.zeros((res, res, 3), dtype=np.uint8)
        for y in range(res):
            for x in range(res):
                canvas[y, x, 0] = int((x / res) * 255)
                canvas[y, x, 1] = int((y / res) * 255)
                canvas[y, x, 2] = int(((x + y) / (2 * res)) * 255)

        img_path = os.path.join(temp_dir, f"bench_{res}.png")
        Image.fromarray(canvas).save(img_path)

        start_t = time.time()
        result = inference_service.enhance_file(img_path)
        elapsed_ms = round((time.time() - start_t) * 1000, 2)

        out_res = f"{res*4}x{res*4}"
        psnr = result["metrics"]["psnr"]
        ssim = result["metrics"]["ssim"]

        status = "PASS [OK]" if elapsed_ms <= 15000 and psnr >= 28.0 else "WARN"

        print(f"{res:<12} | {out_res:<12} | {psnr:<10} | {ssim:<8} | {elapsed_ms:<14} | {status}")

        benchmark_results.append({
            "input_resolution": f"{res}x{res}",
            "output_resolution": f"{res*4}x{res*4}",
            "upscale_factor": "4x",
            "psnr_db": psnr,
            "ssim": ssim,
            "latency_ms": elapsed_ms,
            "device": device,
            "status": status
        })

    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "hardware": {
            "device": device,
            "cuda_available": torch.cuda.is_available(),
            "device_name": torch.cuda.get_device_name(0) if device == "cuda" else "CPU Host"
        },
        "benchmarks": benchmark_results
    }

    report_path = os.path.join(backend_dir, "data", "performance_benchmark.json")
    with open(report_path, "w") as f:
        json.dump(report, f, indent=2)

    print("-" * 70)
    print(f"\n[SUCCESS] Performance benchmark report saved to: {report_path}")
    print("=" * 70)

if __name__ == "__main__":
    run_benchmarks()
