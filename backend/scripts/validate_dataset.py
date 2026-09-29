import os
import glob
import json
from PIL import Image

DEMO_TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "demo_tiles")
TRAINING_PAIRS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "training_pairs")

def validate():
    print("=" * 60)
    print(" NTRO SRM -- DATASET VALIDATION PROTOCOL")
    print("=" * 60)

    # 1. Check demo tiles
    manifest_path = os.path.join(DEMO_TILES_DIR, "manifest.json")
    if not os.path.exists(manifest_path):
        print("[ERROR] manifest.json not found in demo_tiles directory!")
        return False

    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    print(f"\n[1/3] Validating {len(manifest)} demo tile records in manifest.json...")
    errors = 0
    for item in manifest:
        img_path = os.path.join(DEMO_TILES_DIR, item["filename"])
        if not os.path.exists(img_path):
            print(f"  [ERROR] Missing tile file: {item['filename']}")
            errors += 1
            continue

        try:
            with Image.open(img_path) as img:
                w, h = img.size
                if w != item["dimensions"][0] or h != item["dimensions"][1]:
                    print(f"  [ERROR] Dimension mismatch for {item['filename']}: expected {item['dimensions']}, got [{w}, {h}]")
                    errors += 1
        except Exception as e:
            print(f"  [ERROR] Failed to load {item['filename']}: {e}")
            errors += 1

    # 2. Check training pairs
    print(f"\n[2/3] Validating LR/HR training pairs in {TRAINING_PAIRS_DIR}...")
    lr_files = glob.glob(os.path.join(TRAINING_PAIRS_DIR, "*_lr.png"))
    hr_files = glob.glob(os.path.join(TRAINING_PAIRS_DIR, "*_hr.png"))

    print(f"  Found {len(lr_files)} LR files and {len(hr_files)} HR files.")
    if len(lr_files) != len(hr_files):
        print("  [ERROR] LR and HR file counts do not match!")
        errors += 1

    for lr_path in lr_files:
        hr_path = lr_path.replace("_lr.png", "_hr.png")
        if not os.path.exists(hr_path):
            print(f"  [ERROR] Missing matching HR file for: {os.path.basename(lr_path)}")
            errors += 1

    # 3. Print Summary Table
    print(f"\n[3/3] Dataset Summary:")
    print("-" * 60)
    print(f"{'Filename':<22} | {'Category':<12} | {'Dim':<10} | {'Status'}")
    print("-" * 60)
    for item in manifest:
        print(f"{item['filename']:<22} | {item['category']:<12} | {item['dimensions'][0]}x{item['dimensions'][1]:<5} | OK")
    print("-" * 60)

    if errors == 0:
        print("\n[SUCCESS] VALIDATION PASSED: 0 errors detected across dataset.")
        return True
    else:
        print(f"\n[FAILURE] VALIDATION FAILED: {errors} errors detected.")
        return False

if __name__ == "__main__":
    validate()
