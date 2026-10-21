"""Security audit tests for path traversal, credential safety, and sanitization."""

import json
import io
import sys
import unittest
import tempfile
import shutil
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from CloudBridge.core.buffer_manager import BufferManager
from CloudBridge.services.onedrive_service import OneDriveService
from CloudBridge.models.transfer_item import TransferItem
from CloudBridge.constants import get_credentials_file, BASE_DIR
from CloudBridge.main import app

class TestSecurityHardening(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.buffer_dir = Path(self.test_dir) / "buffer"
        self.buffer_dir.mkdir()
        self.outside_dir = Path(self.test_dir) / "outside"
        self.outside_dir.mkdir()
        self.client = app.test_client()

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_release_file_rejects_path_traversal(self):
        """BufferManager MUST refuse to delete any file located outside the buffer."""
        mgr = BufferManager(str(self.buffer_dir), max_buffer_bytes=10000, min_free_disk_bytes=100)
        victim_file = self.outside_dir / "critical_user_file.txt"
        victim_file.write_text("DO NOT DELETE")

        with self.assertRaises(ValueError) as ctx:
            mgr.release_file(str(victim_file))
        self.assertIn("Refusing to delete file outside buffer", str(ctx.exception))
        self.assertTrue(victim_file.exists(), "Victim file outside buffer must not be deleted")

    def test_stage_file_rejects_directory_traversal(self):
        """OneDriveService MUST reject relative paths that attempt to escape buffer directory."""
        source_file = self.outside_dir / "source.txt"
        source_file.write_text("safe content")

        item = TransferItem(
            id="evil1",
            relative_path="../../outside/escaped.txt",
            source_path=str(source_file),
            file_size=10
        )
        svc = OneDriveService(str(self.outside_dir))

        with self.assertRaises(ValueError) as ctx:
            svc.stage_file(item, self.buffer_dir)
        self.assertIn("attempts to escape buffer directory", str(ctx.exception))

    def test_upload_credentials_validation(self):
        """API must reject non-JSON or invalid OAuth client files."""
        # Non-JSON
        res = self.client.post("/api/upload-credentials", data={"file": (io.BytesIO(b"malicious exe"), "virus.exe")})
        self.assertEqual(res.json.get("success"), False)

        # Invalid JSON structure (missing 'installed' or 'web')
        fake_json = io.BytesIO(json.dumps({"some_key": "val"}).encode("utf-8"))
        res2 = self.client.post("/api/upload-credentials", data={"file": (fake_json, "dummy.json")})
        self.assertEqual(res2.json.get("success"), False)
        self.assertIn("無効なOAuthクライアントファイル", res2.json.get("error", ""))

    def test_credentials_auto_discovery(self):
        """get_credentials_file detects client_secret files in BASE_DIR."""
        found = get_credentials_file()
        self.assertTrue(found.exists(), "Should find either credentials.json or client_secret_*.json")
        self.assertTrue("credentials" in found.name or "client_secret" in found.name)

if __name__ == "__main__":
    unittest.main()
