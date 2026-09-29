import os
import numpy as np
from PIL import Image

try:
    import rasterio
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False

def load_image(path: str) -> np.ndarray:
    """Load standard PNG/JPEG or GeoTIFF image into numpy array."""
    if HAS_RASTERIO and path.lower().endswith(('.tif', '.tiff')):
        with rasterio.open(path) as src:
            data = src.read()  # (bands, height, width)
            data = np.transpose(data, (1, 2, 0))  # (height, width, bands)
            return data
    else:
        img = Image.open(path).convert('RGB')
        return np.array(img)

def load_geotiff(path: str) -> tuple[np.ndarray, dict]:
    """Load GeoTIFF image and return (pixel_array, metadata_dict)."""
    if not HAS_RASTERIO:
        img = Image.open(path).convert('RGB')
        arr = np.array(img)
        meta = {
            "driver": "PIL",
            "width": img.width,
            "height": img.height,
            "count": arr.shape[2] if arr.ndim == 3 else 1,
            "crs": "EPSG:4326 (simulated)",
            "transform": None
        }
        return arr, meta
    
    with rasterio.open(path) as src:
        arr = src.read()
        arr = np.transpose(arr, (1, 2, 0))
        meta = {
            "driver": src.driver,
            "width": src.width,
            "height": src.height,
            "count": src.count,
            "crs": str(src.crs),
            "transform": [float(x) for x in src.transform] if src.transform else None,
            "bounds": [src.bounds.left, src.bounds.bottom, src.bounds.right, src.bounds.top] if src.bounds else None
        }
        return arr, meta

def save_geotiff(array: np.ndarray, metadata: dict, output_path: str):
    """Save numpy array as GeoTIFF or standard image depending on metadata/extension."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    if HAS_RASTERIO and metadata.get("driver") != "PIL" and output_path.lower().endswith(('.tif', '.tiff')):
        height, width = array.shape[:2]
        count = array.shape[2] if array.ndim == 3 else 1
        with rasterio.open(
            output_path,
            'w',
            driver='GTiff',
            height=height,
            width=width,
            count=count,
            dtype=array.dtype,
            crs=metadata.get('crs'),
            transform=metadata.get('transform')
        ) as dst:
            if array.ndim == 3:
                for i in range(count):
                    dst.write(array[:, :, i], i + 1)
            else:
                dst.write(array, 1)
    else:
        img = Image.fromarray(array.astype(np.uint8))
        img.save(output_path)
