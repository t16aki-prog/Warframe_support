"""Test Flask web endpoints and JSON responses."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from CloudBridge.main import app

class TestCloudBridgeAPI(unittest.TestCase):

    def setUp(self):
        self.client = app.test_client()

    def test_index_page(self):
        """Dashboard HTML page loads successfully."""
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"CloudBridge", res.data)

    def test_get_state(self):
        """API returns valid state and capacity telemetry."""
        res = self.client.get("/api/state")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("state", data)
        self.assertIn("buffer", data)
        self.assertIn("disk", data)

    def test_detect_onedrive(self):
        """API responds to OneDrive detection query."""
        res = self.client.get("/api/detect-onedrive")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("path", data)

if __name__ == "__main__":
    unittest.main()
