"""
NTRO SRM -- System Integration and API Boundary Test Suite

Tests all FastAPI backend endpoints, error handling boundaries, format validation,
and pre-computed fallback caching using FastAPI TestClient.
"""

import os
import sys
import io
import unittest
from PIL import Image

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app

class TestSRMSystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_01_health_endpoint(self):
        """Test GET /api/health returns 200 OK and healthy status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data.get("status"), ["healthy", "operational"])
        self.assertIn("gpu", data)

    def test_02_tiles_endpoint(self):
        """Test GET /api/tiles returns list of pre-loaded demo target tiles."""
        response = self.client.get("/api/tiles")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertGreaterEqual(len(data), 1)

    def test_03_enhance_valid_image(self):
        """Test POST /api/enhance with a valid 256x256 PNG image."""
        img = Image.new("RGB", (256, 256), color=(100, 150, 200))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = self.client.post(
            "/api/enhance",
            files={"file": ("test_tile.png", buf, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data.get("status"), "success")
        self.assertIn("enhanced_path", data)
        self.assertIn("uncertainty_path", data)
        self.assertIn("metrics", data)
        self.assertGreaterEqual(data["metrics"]["psnr"], 28.0)
        self.assertGreaterEqual(data["metrics"]["ssim"], 0.85)

    def test_04_enhance_unsupported_format(self):
        """Test POST /api/enhance with an unsupported file extension returns 400 Bad Request."""
        response = self.client.post(
            "/api/enhance",
            files={"file": ("document.pdf", b"%PDF-1.4...", "application/pdf")}
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("Unsupported file format", data.get("detail", ""))

    def test_05_enhance_empty_file(self):
        """Test POST /api/enhance with an empty 0-byte file returns 400 Bad Request."""
        response = self.client.post(
            "/api/enhance",
            files={"file": ("empty.png", b"", "image/png")}
        )
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertIn("file is empty", data.get("detail", ""))

    def test_06_enhance_fallback_cache(self):
        """Test POST /api/enhance?fallback=true returns instant pre-computed cache."""
        img = Image.new("RGB", (64, 64), color=(50, 100, 150))
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = self.client.post(
            "/api/enhance?fallback=true",
            files={"file": ("urban_01.png", buf, "image/png")}
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("cached", False))

if __name__ == "__main__":
    print("=" * 60)
    print(" NTRO SRM -- AUTOMATED SYSTEM & API BOUNDARY TEST SUITE")
    print("=" * 60)
    unittest.main()
