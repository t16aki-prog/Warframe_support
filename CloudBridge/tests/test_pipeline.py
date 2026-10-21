"""Test fail-safe pipeline behavior upon errors and aborts."""

import os
import sys
import unittest
import tempfile
import shutil
from pathlib import Path
from unittest.mock import MagicMock

sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from CloudBridge.models.config import AppConfig
from CloudBridge.models.transfer_item import TransferItem, TransferStatus
from CloudBridge.core.state_manager import StateManager, PipelineState
from CloudBridge.core.pipeline import TransferPipeline
from CloudBridge.core.database import TransferDatabase
from CloudBridge.services.logger_service import RelayLogger

class TestPipelineFailSafe(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.onedrive_dir = Path(self.test_dir) / "OneDrive"
        self.onedrive_dir.mkdir()
        self.buffer_dir = Path(self.test_dir) / "buffer"
        self.buffer_dir.mkdir()
        self.logs_dir = Path(self.test_dir) / "logs"
        self.logs_dir.mkdir()
        self.db_path = Path(self.test_dir) / "test.db"

        # Create sample files in fake OneDrive
        (self.onedrive_dir / "valid.txt").write_text("Hello safe file")
        (self.onedrive_dir / "corrupted.txt").write_text("This file will fail hash check")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_pipeline_halts_on_hash_mismatch_and_preserves_local_file(self):
        """Pipeline must STOP on mismatch, not delete staged file, and transition to STOPPED_ERROR."""
        config = AppConfig(
            onedrive_dir=str(self.onedrive_dir),
            buffer_dir=str(self.buffer_dir),
            max_buffer_bytes=10 * 1024 * 1024,
            min_free_disk_bytes=100,
            dry_run=False
        )
        state_mgr = StateManager()
        logger = RelayLogger(self.logs_dir)
        db = TransferDatabase(self.db_path)

        # Mock Google Drive service returning a bogus checksum
        mock_gdrive = MagicMock()
        mock_gdrive.get_or_create_folder.return_value = "folder_root"
        mock_gdrive.resolve_path_folders.return_value = "folder_root"
        mock_gdrive.upload_file.return_value = {
            "id": "gdrive_id_corrupt",
            "size": 30,
            "md5Checksum": "wrong_checksum_here"
        }

        pipeline = TransferPipeline(config, state_mgr, logger, db, mock_gdrive)
        pipeline.scan_and_prepare()

        # Run pipeline directly
        pipeline._run_pipeline()

        # Check that pipeline halted with STOPPED_ERROR
        self.assertEqual(state_mgr.state, PipelineState.STOPPED_ERROR)
        self.assertIn("Integrity check failed", state_mgr.error_reason)

        # Verify that staged file was NOT deleted (preserved for inspection)
        staged_files = list(self.buffer_dir.rglob("*.txt"))
        self.assertGreater(len(staged_files), 0, "Staged file should be preserved on error")

if __name__ == "__main__":
    unittest.main()
