"""
Generate Pre-computed Results Cache for NTRO SRM Demo Tiles

Runs SwinIR 4x enhancement and MC Dropout uncertainty estimation on all 10 demo target tiles,
saving pre-computed outputs to backend/data/cached_results/ and backend/outputs/.
"""

import os
import sys
import json
import time

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.inference import SRMInferenceService
from app.config import settings

def generate_all_caches():
    print("=" * 60)
    print(" NTRO SRM -- PRE-COMPUTED DEMO CACHE GENERATOR")
    print("=" * 60)

    demo_dir = os.path.join(backend_dir, "data", "demo_tiles")
    cache_dir = os.path.join(backend_dir, "data", "cached_results")
    output_dir = settings.OUTPUT_DIR

    os.makedirs(cache_dir, exist_ok=True)
    os.makedirs(output_dir, exist_ok=True)

    inference_service = SRMInferenceService()

    tiles = [f for f in os.listdir(demo_dir) if f.endswith(".png")]
    print(f"Found {len(tiles)} demo tiles in {demo_dir}\n")

    cached_manifest = {}

    for idx, tile_file in enumerate(sorted(tiles), 1):
        tile_path = os.path.join(demo_dir, tile_file)
        tile_stem = os.path.splitext(tile_file)[0]

        print(f"[{idx}/{len(tiles)}] Processing {tile_file}...")
        start_t = time.time()
        
        result = inference_service.enhance_file(tile_path)
        elapsed = round((time.time() - start_t) * 1000, 2)

        # Copy/Save into cached_results directory
        tile_cache_dir = os.path.join(cache_dir, tile_stem)
        os.makedirs(tile_cache_dir, exist_ok=True)

        cached_manifest[tile_stem] = {
            "tile_id": tile_stem,
            "filename": tile_file,
            "enhanced_path": result["enhanced_path"],
            "uncertainty_path": result["uncertainty_path"],
            "metrics": result["metrics"],
            "generation_time_ms": elapsed
        }

        # Save individual metadata json
        with open(os.path.join(tile_cache_dir, "meta.json"), "w") as f:
            json.dump(cached_manifest[tile_stem], f, indent=2)

        print(f"  [OK] PSNR: {result['metrics']['psnr']} dB | SSIM: {result['metrics']['ssim']} | Time: {elapsed} ms")

    manifest_path = os.path.join(cache_dir, "cache_manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(cached_manifest, f, indent=2)

    print("\n" + "=" * 60)
    print(f"[SUCCESS] Pre-computed cache generated for {len(tiles)} demo tiles!")
    print(f"Manifest written to: {manifest_path}")
    print("=" * 60)

if __name__ == "__main__":
    generate_all_caches()
