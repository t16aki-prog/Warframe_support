"""Comprehensive edge cases and boundary condition tests for CloudBridge."""

import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from CloudBridge.core.buffer_manager import BufferManager
from CloudBridge.core.verifier import IntegrityVerifier
from CloudBridge.core.database import TransferDatabase
from CloudBridge.core.state_manager import StateManager, PipelineState
from CloudBridge.core.pipeline import TransferPipeline
from CloudBridge.models.config import AppConfig
from CloudBridge.models.transfer_item import TransferItem, TransferStatus
from CloudBridge.services.onedrive_service import OneDriveService
from CloudBridge.services.logger_service import RelayLogger

class TestEdgeCasesAndBoundaries(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.onedrive_dir = Path(self.test_dir) / "OneDriveSpecial"
        self.onedrive_dir.mkdir()
        self.buffer_dir = Path(self.test_dir) / "buffer"
        self.buffer_dir.mkdir()
        self.logs_dir = Path(self.test_dir) / "logs"
        self.logs_dir.mkdir()
        self.db_path = Path(self.test_dir) / "test.db"

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_special_characters_and_japanese_paths(self):
        """Test files with spaces, Japanese characters, and symbols in paths."""
        nested = self.onedrive_dir / "書類 [2026] #プロジェクト" / "テスト & サンプル (重要).txt"
        nested.parent.mkdir(parents=True, exist_ok=True)
        nested.write_text("マルチバイト日本語テキストデータ", encoding="utf-8")

        svc = OneDriveService(str(self.onedrive_dir))
        items = svc.scan_files()
        self.assertEqual(len(items), 1)
        self.assertIn("書類 [2026] #プロジェクト", items[0].relative_path)

        # Stage file
        staged_path = svc.stage_file(items[0], self.buffer_dir)
        self.assertTrue(Path(staged_path).exists())

        # Verify Integrity
        size = Path(staged_path).stat().st_size
        local_md5 = IntegrityVerifier.compute_local_md5(staged_path)
        is_valid, _, details = IntegrityVerifier.verify(staged_path, size, {
            "id": "gdrive_special_char_id",
            "size": size,
            "md5Checksum": local_md5.upper()  # Test uppercase MD5 handling
        })
        self.assertTrue(is_valid, "Uppercase MD5 checksum should match seamlessly")

    def test_zero_byte_empty_file(self):
        """Test handling of 0-byte empty files."""
        empty_file = self.onedrive_dir / "empty.dat"
        empty_file.touch()

        svc = OneDriveService(str(self.onedrive_dir))
        items = svc.scan_files()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].file_size, 0)

        staged_path = svc.stage_file(items[0], self.buffer_dir)
        size = Path(staged_path).stat().st_size
        self.assertEqual(size, 0)

        # MD5 of empty string is d41d8cd98f00b204e9800998ecf8427e
        local_md5 = IntegrityVerifier.compute_local_md5(staged_path)
        self.assertEqual(local_md5, "d41d8cd98f00b204e9800998ecf8427e")

        is_valid, _, _ = IntegrityVerifier.verify(staged_path, 0, {
            "id": "empty_file_id",
            "size": 0,
            "md5Checksum": "d41d8cd98f00b204e9800998ecf8427e"
        })
        self.assertTrue(is_valid)

    def test_buffer_boundary_exact_match(self):
        """Buffer boundary check: file exactly equals maximum capacity."""
        mgr = BufferManager(str(self.buffer_dir), max_buffer_bytes=1024, min_free_disk_bytes=100)
        can_fit, _ = mgr.can_accommodate(1024)
        self.assertTrue(can_fit, "File exactly at max buffer size should fit")

        # 1 byte over max should be rejected
        can_fit_over, _ = mgr.can_accommodate(1025)
        self.assertFalse(can_fit_over, "File 1 byte over max buffer size must be rejected")

    def test_sequential_buffer_release_reclaim(self):
        """Verify that after releasing file 1, file 2 can now fit in the buffer."""
        mgr = BufferManager(str(self.buffer_dir), max_buffer_bytes=1000, min_free_disk_bytes=100)
        file1 = self.buffer_dir / "file1.bin"
        file1.write_bytes(b"A" * 700)

        # file2 of 500 bytes cannot fit (700 + 500 = 1200 > 1000)
        can_fit, _ = mgr.can_accommodate(500)
        self.assertFalse(can_fit)

        # Release file1
        mgr.release_file(str(file1))
        self.assertEqual(mgr.get_current_buffer_usage(), 0)

        # file2 can now fit!
        can_fit_now, _ = mgr.can_accommodate(500)
        self.assertTrue(can_fit_now)

    def test_temporary_office_files_ignored(self):
        """Verify Office temporary lock files (~$file.docx) and dotfiles are ignored."""
        (self.onedrive_dir / "~$document.docx").write_text("temp lock")
        (self.onedrive_dir / ".hidden_file").write_text("hidden")
        (self.onedrive_dir / "normal.docx").write_text("real content")

        svc = OneDriveService(str(self.onedrive_dir))
        items = svc.scan_files()
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0].relative_path, "normal.docx")

if __name__ == "__main__":
    unittest.main()
