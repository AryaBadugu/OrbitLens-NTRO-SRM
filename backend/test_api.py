import io
from PIL import Image
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    print("Health response status:", res.status_code)
    print("Health response body:", res.json())
    assert res.status_code == 200
    assert res.json()["status"] == "operational"

def test_enhance_stub():
    # Create valid PNG image bytes
    buf = io.BytesIO()
    Image.new("RGB", (64, 64), (100, 150, 200)).save(buf, format="PNG")
    png_bytes = buf.getvalue()

    res = client.post("/api/enhance", files={"file": ("test.png", png_bytes, "image/png")})
    print("Enhance response status:", res.status_code)
    print("Enhance response body:", res.json())
    assert res.status_code == 200
    assert res.json()["status"] == "success"
    assert "metrics" in res.json()


def test_tiles_api():
    res = client.get("/api/tiles")
    print("Tiles API status:", res.status_code)
    assert res.status_code == 200
    tiles = res.json()
    print(f"Loaded {len(tiles)} tiles from API")
    assert len(tiles) >= 10

    tile_id = tiles[0]["id"]
    res_tile = client.get(f"/api/tiles/{tile_id}")
    assert res_tile.status_code == 200
    assert res_tile.json()["id"] == tile_id

    res_preview = client.get(f"/api/tiles/{tile_id}/preview")
    assert res_preview.status_code == 200
    assert res_preview.headers["content-type"] == "image/png"

if __name__ == "__main__":
    test_health()
    test_enhance_stub()
    test_tiles_api()
    print("All backend tests passed successfully!")

