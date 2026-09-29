import os
import glob
import numpy as np
from PIL import Image

DEMO_TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "demo_tiles")
TRAINING_PAIRS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "training_pairs")

os.makedirs(TRAINING_PAIRS_DIR, exist_ok=True)

def create_lr_hr_pair(hr_image: Image.Image, scale: int = 4) -> tuple[Image.Image, Image.Image]:
    """
    Take high-resolution ground truth image, downscale by factor of `scale` using bicubic interpolation,
    add realistic optical blur & noise, then upscale back to original size for LR input representation.
    """
    w, h = hr_image.size
    lr_w, lr_h = w // scale, h // scale
    
    # Downsample
    lr_small = hr_image.resize((lr_w, lr_h), Image.Resampling.BICUBIC)
    
    # Add slight Gaussian noise to simulate sensor noise
    arr = np.array(lr_small).astype(np.float32)
    noise = np.random.normal(0, 3.0, arr.shape)
    arr_noisy = np.clip(arr + noise, 0, 255).astype(np.uint8)
    lr_noisy_small = Image.fromarray(arr_noisy)
    
    # Upsample back to (w, h) so input tensor has matching spatial canvas for 4x super resolution target
    lr_input = lr_noisy_small.resize((w, h), Image.Resampling.BICUBIC)
    
    return lr_input, hr_image

def main():
    tile_files = glob.glob(os.path.join(DEMO_TILES_DIR, "*.png"))
    print(f"Generating LR/HR training pairs for {len(tile_files)} tiles in {TRAINING_PAIRS_DIR}...")
    
    count = 0
    for file_path in tile_files:
        base_name = os.path.splitext(os.path.basename(file_path))[0]
        hr_img = Image.open(file_path).convert("RGB")
        
        lr_img, hr_gt = create_lr_hr_pair(hr_img, scale=4)
        
        lr_path = os.path.join(TRAINING_PAIRS_DIR, f"{base_name}_lr.png")
        hr_path = os.path.join(TRAINING_PAIRS_DIR, f"{base_name}_hr.png")
        
        lr_img.save(lr_path)
        hr_gt.save(hr_path)
        count += 1
        print(f"  [OK] Created pair: {base_name}_lr.png & {base_name}_hr.png")
        
    print(f"Successfully generated {count} training pairs.")

if __name__ == "__main__":
    main()
