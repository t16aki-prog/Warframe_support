"""Unit tests verifying buffer management, integrity verification, and fail-safe stop."""

import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from CloudBridge.core.buffer_manager import BufferManager
from CloudBridge.core.verifier import IntegrityVerifier
from CloudBridge.core.database import TransferDatabase
from CloudBridge.core.state_manager import StateManager, PipelineState
from CloudBridge.models.transfer_item import TransferItem, TransferStatus

class TestCloudBridgeCore(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.buffer_dir = Path(self.test_dir) / "buffer"
        self.buffer_dir.mkdir()
        self.db_path = Path(self.test_dir) / "test.db"

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_buffer_capacity_guard(self):
        """Verify that buffer limits and disk guard prevent staging when full."""
        # 1000 bytes max buffer
        mgr = BufferManager(str(self.buffer_dir), max_buffer_bytes=1000, min_free_disk_bytes=100)
        
        # 500 bytes fits
        can_fit, _ = mgr.can_accommodate(500)
        self.assertTrue(can_fit)

        # Create 800 bytes file in buffer
        dummy_file = self.buffer_dir / "test.bin"
        with open(dummy_file, "wb") as f:
            f.write(b"x" * 800)

        # 300 bytes does NOT fit (800 + 300 = 1100 > 1000)
        can_fit, reason = mgr.can_accommodate(300)
        self.assertFalse(can_fit)
        self.assertIn("Buffer limit exceeded", reason)

    def test_buffer_safe_release(self):
        """Verify verified files are deleted and parent folders cleaned up."""
        mgr = BufferManager(str(self.buffer_dir), max_buffer_bytes=10000, min_free_disk_bytes=100)
        nested_file = self.buffer_dir / "sub" / "file.txt"
        nested_file.parent.mkdir(parents=True, exist_ok=True)
        nested_file.write_text("hello world")

        self.assertTrue(nested_file.exists())
        mgr.release_file(str(nested_file))
        self.assertFalse(nested_file.exists())
        self.assertFalse(nested_file.parent.exists())  # empty dir cleaned up

    def test_integrity_verifier_success(self):
        """Verify successful check when hash, size, and ID all match."""
        test_file = Path(self.test_dir) / "data.txt"
        test_file.write_text("SafeDataPayload")
        size = test_file.stat().st_size
        local_md5 = IntegrityVerifier.compute_local_md5(str(test_file))

        metadata = {
            "id": "gdrive_file_12345",
            "size": size,
            "md5Checksum": local_md5
        }

        is_valid, msg, details = IntegrityVerifier.verify(str(test_file), size, metadata)
        self.assertTrue(is_valid)
        self.assertEqual(details["id"], "gdrive_file_12345")

    def test_integrity_verifier_mismatch_failsafe(self):
        """Verify fail-safe rejection when hash or size is corrupted."""
        test_file = Path(self.test_dir) / "data.txt"
        test_file.write_text("CorrectData")
        size = test_file.stat().st_size

        # Tampered MD5
        metadata = {
            "id": "gdrive_file_corrupt",
            "size": size,
            "md5Checksum": "00000000000000000000000000000000"
        }

        is_valid, msg, _ = IntegrityVerifier.verify(str(test_file), size, metadata)
        self.assertFalse(is_valid)
        self.assertIn("MD5 checksum mismatch", msg)

    def test_database_persistence(self):
        """Verify transfer registry correctly records and queries completions."""
        db = TransferDatabase(self.db_path)
        item = TransferItem(
            id="item1",
            relative_path="docs/spec.pdf",
            source_path="C:/dummy/docs/spec.pdf",
            file_size=1024,
            gdrive_file_id="gid_999",
            gdrive_md5="hash123",
            status=TransferStatus.COMPLETED
        )
        self.assertFalse(db.is_verified("docs/spec.pdf", 1024))
        db.record_success(item)
        self.assertTrue(db.is_verified("docs/spec.pdf", 1024))

if __name__ == "__main__":
    unittest.main()
