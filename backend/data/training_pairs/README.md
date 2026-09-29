# Training Pairs Directory

This directory contains paired low-resolution (LR) input images and ground-truth high-resolution (HR) target images used for SwinIR model fine-tuning and evaluation.

## Naming Convention
- `{name}_lr.png`: Simulated 10m/px input tile (downsampled 4x with bicubic blur and sensor noise).
- `{name}_hr.png`: 2.5m/px ground-truth target tile.

## Regeneration
To regenerate all LR/HR pairs from `demo_tiles/`:
```bash
python scripts/create_training_pairs.py
```
