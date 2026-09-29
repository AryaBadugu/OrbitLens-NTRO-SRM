import os
import sys
import glob
import json
import time
from PIL import Image

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from app.services.inference import SRMInferenceService

DEMO_TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "demo_tiles")
REPORT_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "ralph_loop_report.json")

def run_ralph_loop():
    print("=" * 70)
    print(" RALPH-LOOP: AUTONOMOUS MODEL QUALITY & LATENCY BENCHMARK")
    print(" Target Criteria: PSNR >= 28.0 dB | SSIM >= 0.850 | Latency <= 15,000 ms")
    print("=" * 70)

    service = SRMInferenceService()
    tile_files = glob.glob(os.path.join(DEMO_TILES_DIR, "*.png"))
    tile_files.sort()

    results = []
    total_psnr = 0.0
    total_ssim = 0.0
    total_latency = 0.0
    all_passed = True

    print(f"\nProcessing {len(tile_files)} target tiles...\n")
    print(f"{'Filename':<22} | {'PSNR (dB)':<10} | {'SSIM':<8} | {'Latency (ms)':<14} | {'Status'}")
    print("-" * 70)

    for file_path in tile_files:
        filename = os.path.basename(file_path)
        res = service.enhance_file(file_path)

        metrics = res["metrics"]
        psnr = metrics["psnr"]
        ssim = metrics["ssim"]
        lat = metrics["inference_time_ms"]

        total_psnr += psnr
        total_ssim += ssim
        total_latency += lat

        pass_psnr = psnr >= 28.0
        pass_ssim = ssim >= 0.850
        pass_lat = lat <= 15000.0

        tile_passed = pass_psnr and pass_ssim and pass_lat
        if not tile_passed:
            all_passed = False

        status_str = "PASS [OK]" if tile_passed else "FAIL [X]"

        print(f"{filename:<22} | {psnr:<10.2f} | {ssim:<8.4f} | {lat:<14.2f} | {status_str}")

        results.append({
            "filename": filename,
            "psnr": psnr,
            "ssim": ssim,
            "latency_ms": lat,
            "mean_uncertainty": metrics["mean_uncertainty"],
            "enhanced_path": res["enhanced_path"],
            "uncertainty_path": res["uncertainty_path"],
            "passed": tile_passed
        })

    n = max(1, len(tile_files))
    avg_psnr = round(total_psnr / n, 2)
    avg_ssim = round(total_ssim / n, 4)
    avg_lat = round(total_latency / n, 2)

    print("-" * 70)
    print(f"AVERAGE METRICS        | {avg_psnr:<10.2f} | {avg_ssim:<8.4f} | {avg_lat:<14.2f} | {'ALL PASS [OK]' if all_passed else 'NEEDS TWEAK'}")
    print("=" * 70)

    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "total_tiles": len(tile_files),
        "target_criteria": {
            "min_psnr_db": 28.0,
            "min_ssim": 0.850,
            "max_latency_ms": 15000.0
        },
        "average_metrics": {
            "psnr_db": avg_psnr,
            "ssim": avg_ssim,
            "latency_ms": avg_lat
        },
        "all_criteria_met": all_passed,
        "tiles": results
    }

    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\nReport written to: {REPORT_PATH}")
    assert all_passed, "Ralph-loop benchmark failed criteria!"
    print("\n[SUCCESS] Ralph-Loop autonomous quality verification complete!")

if __name__ == "__main__":
    run_ralph_loop()
