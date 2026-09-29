import os
import json
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter(prefix="/api", tags=["tiles"])

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "demo_tiles")
MANIFEST_PATH = os.path.join(DATA_DIR, "manifest.json")

def _load_manifest() -> list[dict]:
    if not os.path.exists(MANIFEST_PATH):
        return []
    with open(MANIFEST_PATH, "r") as f:
        return json.load(f)

@router.get("/tiles")
def get_tiles():
    """Return manifest list of pre-loaded target demo tiles."""
    return _load_manifest()

@router.get("/tiles/{tile_id}")
def get_tile_metadata(tile_id: str):
    """Return metadata for a specific tile."""
    manifest = _load_manifest()
    for tile in manifest:
        if tile["id"] == tile_id:
            return tile
    raise HTTPException(status_code=404, detail="Tile ID not found in manifest")

@router.get("/tiles/{tile_id}/preview")
def get_tile_preview(tile_id: str):
    """Serve the tile image file for UI rendering."""
    manifest = _load_manifest()
    filename = None
    for tile in manifest:
        if tile["id"] == tile_id:
            filename = tile["filename"]
            break
    
    if not filename:
        raise HTTPException(status_code=404, detail="Tile ID not found")
        
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Tile image file missing from disk")
        
    return FileResponse(file_path, media_type="image/png")
