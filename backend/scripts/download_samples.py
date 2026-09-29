import os
import json
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

DEMO_TILES_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "demo_tiles")
TRAINING_PAIRS_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "training_pairs")

os.makedirs(DEMO_TILES_DIR, exist_ok=True)
os.makedirs(TRAINING_PAIRS_DIR, exist_ok=True)

CATEGORIES = [
    {
        "id": "harbor_01",
        "name": "Harbor Facility — Port Surveillance",
        "filename": "harbor_01.png",
        "category": "maritime",
        "region_label": "Visakhapatnam Port",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Ship count & berth occupancy monitoring",
        "base_color": (30, 60, 90), # Deep water
        "pattern": "harbor"
    },
    {
        "id": "airfield_01",
        "name": "Tactical Airfield — Runway Alpha",
        "filename": "airfield_01.png",
        "category": "military",
        "region_label": "Ambala Airbase",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Aircraft disposition & runway integrity assessment",
        "base_color": (80, 95, 75), # Ground/tarmac
        "pattern": "airfield"
    },
    {
        "id": "urban_01",
        "name": "Dense Urban Grid — Sector 17",
        "filename": "urban_01.png",
        "category": "urban",
        "region_label": "Chandigarh Metro",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Building footprint extraction & urban density analysis",
        "base_color": (120, 115, 110),
        "pattern": "urban"
    },
    {
        "id": "border_01",
        "name": "Northern Border Patrol Corridor",
        "filename": "border_01.png",
        "category": "border",
        "region_label": "Ladakh Border Sector",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Fence-line tracking & vehicle movement detection",
        "base_color": (140, 120, 95), # Mountain terrain
        "pattern": "border"
    },
    {
        "id": "freeway_01",
        "name": "National Highway 44 Interchange",
        "filename": "freeway_01.png",
        "category": "infrastructure",
        "region_label": "NH-44 Junction",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Convoy monitoring & bottleneck identification",
        "base_color": (70, 110, 60),
        "pattern": "freeway"
    },
    {
        "id": "agricultural_01",
        "name": "Punjab Agricultural Belt",
        "filename": "agricultural_01.png",
        "category": "agricultural",
        "region_label": "Ludhiana Fields",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Crop pattern classification & NDWI anomaly detection",
        "base_color": (40, 120, 40),
        "pattern": "agricultural"
    },
    {
        "id": "river_01",
        "name": "Brahmaputra River Bend",
        "filename": "river_01.png",
        "category": "maritime",
        "region_label": "Assam Valley",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Flood monitoring & bridge infrastructure assessment",
        "base_color": (35, 75, 110),
        "pattern": "river"
    },
    {
        "id": "storage_tanks_01",
        "name": "Refinery Fuel Storage Depot",
        "filename": "storage_tanks_01.png",
        "category": "industrial",
        "region_label": "Jamnagar Industrial Complex",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Strategic reserve volume estimation",
        "base_color": (100, 100, 95),
        "pattern": "tanks"
    },
    {
        "id": "power_plant_01",
        "name": "Thermal Power Generation Plant",
        "filename": "power_plant_01.png",
        "category": "industrial",
        "region_label": "Singrauli Power Hub",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Thermal plume & operational status monitoring",
        "base_color": (90, 85, 80),
        "pattern": "power"
    },
    {
        "id": "coastal_01",
        "name": "Coastal Defense Outpost",
        "filename": "coastal_01.png",
        "category": "border",
        "region_label": "Rann of Kutch Coastal Zone",
        "original_resolution": "10m/px",
        "enhanced_resolution": "2.5m/px",
        "dimensions": [256, 256],
        "use_case": "Amphibious landing site surveillance",
        "base_color": (50, 90, 110),
        "pattern": "coastal"
    }
]

def generate_procedural_tile(info: dict) -> Image.Image:
    """Generate high-quality synthetic satellite imagery with realistic GIS structures."""
    w, h = info["dimensions"]
    img = Image.new("RGB", (w, h), info["base_color"])
    draw = ImageDraw.Draw(img)
    pattern = info["pattern"]

    np.random.seed(abs(hash(info["id"])) % 10000)

    if pattern == "harbor":
        # Draw water background
        draw.rectangle([0, 0, w, h], fill=(25, 55, 95))
        # Draw piers / docks
        draw.rectangle([60, 0, 90, 180], fill=(130, 130, 130))
        draw.rectangle([140, 0, 170, 180], fill=(130, 130, 130))
        draw.rectangle([0, 180, w, h], fill=(100, 110, 100)) # Land
        # Draw ships at dock
        draw.rectangle([95, 40, 110, 120], fill=(220, 220, 230))
        draw.rectangle([175, 60, 190, 140], fill=(200, 50, 50))

    elif pattern == "airfield":
        # Draw grass/dirt ground
        draw.rectangle([0, 0, w, h], fill=(70, 90, 65))
        # Main runway
        draw.line([(30, 0), (220, 256)], fill=(50, 50, 55), width=24)
        draw.line([(30, 0), (220, 256)], fill=(230, 230, 230), width=2) # Center line
        # Taxiway
        draw.line([(80, 40), (180, 80)], fill=(60, 60, 65), width=12)
        # Aircraft shapes on apron
        for px, py in [(140, 70), (170, 85)]:
            draw.polygon([(px, py-6), (px-8, py+6), (px+8, py+6)], fill=(200, 210, 220))

    elif pattern == "urban":
        # Road grid
        draw.rectangle([0, 0, w, h], fill=(80, 80, 80))
        for x in range(0, w, 40):
            draw.line([(x, 0), (x, h)], fill=(40, 40, 40), width=6)
        for y in range(0, h, 40):
            draw.line([(0, y), (w, y)], fill=(40, 40, 40), width=6)
        # Building blocks
        for x in range(6, w-30, 40):
            for y in range(6, h-30, 40):
                r_col = (np.random.randint(140, 220), np.random.randint(130, 200), np.random.randint(120, 190))
                draw.rectangle([x, y, x+28, y+28], fill=r_col)

    elif pattern == "border":
        # Mountain terrain texture
        arr = np.random.normal(130, 25, (h, w, 3)).astype(np.uint8)
        arr[:, :, 0] = np.clip(arr[:, :, 0] + 20, 0, 255) # reddish terrain
        img = Image.fromarray(arr)
        draw = ImageDraw.Draw(img)
        # Border road / fence
        draw.line([(0, 50), (w, 200)], fill=(40, 40, 40), width=8)
        draw.line([(0, 50), (w, 200)], fill=(240, 220, 100), width=2)
        # Outposts
        draw.rectangle([100, 110, 125, 135], fill=(180, 50, 50))
        draw.rectangle([180, 160, 200, 180], fill=(50, 150, 50))

    elif pattern == "freeway":
        draw.rectangle([0, 0, w, h], fill=(50, 110, 50)) # Fields
        # Curved highway interchange
        draw.arc([-50, 20, 200, 240], start=0, end=180, fill=(60, 60, 65), width=18)
        draw.line([(0, 128), (w, 128)], fill=(50, 50, 55), width=20)
        draw.line([(128, 0), (128, h)], fill=(50, 50, 55), width=20)

    elif pattern == "agricultural":
        # Patchwork fields
        for x in range(0, w, 64):
            for y in range(0, h, 64):
                g = np.random.randint(80, 180)
                r = np.random.randint(30, 100)
                b = np.random.randint(20, 60)
                draw.rectangle([x, y, x+64, y+64], fill=(r, g, b))
                draw.rectangle([x, y, x+64, y+64], outline=(20, 40, 20), width=2)

    elif pattern == "river":
        draw.rectangle([0, 0, w, h], fill=(100, 120, 90)) # Land
        # River curve
        points = [(0, 40), (80, 90), (150, 140), (256, 220)]
        for i in range(len(points)-1):
            draw.line([points[i], points[i+1]], fill=(30, 80, 140), width=45)
        # Bridge
        draw.line([(110, 60), (130, 180)], fill=(180, 180, 180), width=6)

    elif pattern == "tanks":
        draw.rectangle([0, 0, w, h], fill=(90, 90, 85))
        # Circular storage tanks
        for cx in [50, 120, 190]:
            for cy in [50, 120, 190]:
                draw.ellipse([cx-22, cy-22, cx+22, cy+22], fill=(210, 215, 220), outline=(50, 50, 50), width=3)
                draw.ellipse([cx-15, cy-15, cx+15, cy+15], fill=(170, 175, 180))

    elif pattern == "power":
        draw.rectangle([0, 0, w, h], fill=(85, 80, 75))
        # Cooling towers and main building
        draw.rectangle([40, 40, 140, 120], fill=(140, 135, 130), outline=(30, 30, 30), width=2)
        draw.ellipse([160, 50, 210, 100], fill=(200, 200, 200), outline=(50, 50, 50), width=4)
        draw.ellipse([160, 130, 210, 180], fill=(200, 200, 200), outline=(50, 50, 50), width=4)

    elif pattern == "coastal":
        # Water half, land half
        draw.polygon([(0, 0), (w, 0), (w, 160), (0, 100)], fill=(30, 90, 130))
        draw.polygon([(0, 100), (w, 160), (w, h), (0, h)], fill=(150, 130, 100))
        # Beach line
        draw.line([(0, 100), (w, 160)], fill=(220, 200, 150), width=10)

    # Add realistic noise and blur filter to simulate sensor optics
    img = img.filter(ImageFilter.GaussianBlur(radius=0.5))
    return img

def main():
    print(f"Generating {len(CATEGORIES)} demo tiles in {DEMO_TILES_DIR}...")
    manifest = []
    for cat in CATEGORIES:
        img = generate_procedural_tile(cat)
        file_path = os.path.join(DEMO_TILES_DIR, cat["filename"])
        img.save(file_path)

        tile_meta = {
            "id": cat["id"],
            "name": cat["name"],
            "filename": cat["filename"],
            "category": cat["category"],
            "region_label": cat["region_label"],
            "original_resolution": cat["original_resolution"],
            "enhanced_resolution": cat["enhanced_resolution"],
            "dimensions": cat["dimensions"],
            "use_case": cat["use_case"],
            "file_size_kb": round(os.path.getsize(file_path) / 1024, 1)
        }
        manifest.append(tile_meta)
        print(f"  [OK] Created {cat['filename']} ({cat['name']})")

    manifest_path = os.path.join(DEMO_TILES_DIR, "manifest.json")
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest written to {manifest_path} with {len(manifest)} tiles.")

if __name__ == "__main__":
    main()
