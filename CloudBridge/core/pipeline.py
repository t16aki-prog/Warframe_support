"""Transfer pipeline orchestrator with fail-safe stop and capacity guards."""

import threading
import time
from pathlib import Path
from typing import Optional

from ..models.config import AppConfig
from ..models.transfer_item import TransferItem, TransferStatus
from ..core.buffer_manager import BufferManager
from ..core.verifier import IntegrityVerifier
from ..core.database import TransferDatabase
from ..core.state_manager import StateManager, PipelineState
from ..services.onedrive_service import OneDriveService
from ..services.gdrive_service import GoogleDriveService
from ..services.logger_service import RelayLogger

class TransferPipeline:
    """Orchestrates download, upload, verification, and space release."""

    def __init__(
        self,
        config: AppConfig,
        state_mgr: StateManager,
        logger: RelayLogger,
        db: Optional[TransferDatabase] = None,
        gdrive_service: Optional[GoogleDriveService] = None
    ):
        self.config = config
        self.state_mgr = state_mgr
        self.logger = logger
        self.db = db or TransferDatabase()
        self.gdrive_service = gdrive_service or GoogleDriveService()
        self.buffer_mgr = BufferManager(
            config.buffer_dir,
            config.max_buffer_bytes,
            config.min_free_disk_bytes
        )
        self.stop_event = threading.Event()
        self._thread: Optional[threading.Thread] = None

    def start(self) -> None:
        """Start or resume pipeline in a background thread."""
        if self._thread and self._thread.is_alive():
            self.logger.warn("Pipeline thread already running.")
            return

        self.stop_event.clear()
        self._thread = threading.Thread(target=self._run_pipeline, daemon=True)
        self._thread.start()

    def stop(self, reason: str = "User requested stop") -> None:
        """Immediately stop pipeline execution."""
        self.logger.warn(f"Stopping pipeline: {reason}")
        self.stop_event.set()
        self.state_mgr.set_state(PipelineState.STOPPED_USER, error_reason=reason)

    def scan_and_prepare(self) -> int:
        """Scan OneDrive directory and initialize queued items."""
        self.state_mgr.set_state(PipelineState.SCANNING)
        self.logger.info(f"Scanning OneDrive folder: {self.config.onedrive_dir}")

        onedrive_svc = OneDriveService(self.config.onedrive_dir)
        items = onedrive_svc.scan_files()

        # Mark already verified items as SKIPPED
        for item in items:
            if self.config.skip_existing and self.db.is_verified(item.relative_path, item.file_size):
                item.status = TransferStatus.SKIPPED

        self.state_mgr.set_items(items)
        self.state_mgr.set_state(PipelineState.IDLE)
        self.logger.info(f"Scan complete. Found {len(items)} files ({sum(1 for i in items if i.status == TransferStatus.QUEUED)} pending).")
        return len(items)

    def _run_pipeline(self) -> None:
        """Main execution loop."""
        try:
            self.state_mgr.set_state(PipelineState.RUNNING)
            self.logger.info("Transfer pipeline started.")

            # Authenticate with Google Drive before processing
            if not self.config.dry_run:
                self.logger.info("Verifying Google Drive authentication...")
                self.gdrive_service.authenticate()
                target_folder_id = self.gdrive_service.get_or_create_folder(
                    self.config.gdrive_folder_name,
                    self.config.gdrive_folder_id
                )
            else:
                target_folder_id = "dry_run_folder_id"

            onedrive_svc = OneDriveService(self.config.onedrive_dir)

            for item in self.state_mgr.items:
                if self.stop_event.is_set():
                    self.logger.warn("Pipeline stopped upon stop signal.")
                    return

                if item.status != TransferStatus.QUEUED:
                    continue

                self.state_mgr.set_current_item(item.id)
                self._process_item(item, onedrive_svc, target_folder_id)

            self.state_mgr.set_current_item(None)
            self.state_mgr.set_state(PipelineState.COMPLETED)
            self.logger.success("All pending files processed successfully!")

        except Exception as e:
            err_msg = f"Critical pipeline failure: {str(e)}"
            self.logger.error(err_msg)
            self.state_mgr.set_state(PipelineState.STOPPED_ERROR, error_reason=err_msg)
            self.stop_event.set()

    def _process_item(self, item: TransferItem, onedrive_svc: OneDriveService, target_root_id: str) -> None:
        """Execute safe pipeline for a single file."""
        self.logger.info(f"Processing: {item.relative_path} ({item.file_size:,} bytes)")

        # 1. Capacity check
        can_fit, reason = self.buffer_mgr.can_accommodate(item.file_size)
        if not can_fit:
            self.state_mgr.update_item_status(item.id, TransferStatus.FAILED, error_msg=reason)
            self.db.record_failure(item, reason)
            raise RuntimeError(f"Storage capacity guard triggered: {reason}")

        # 2. Download / Stage from OneDrive
        self.state_mgr.update_item_status(item.id, TransferStatus.DOWNLOADING)
        def dl_progress(current, total):
            self.state_mgr.update_item_status(item.id, TransferStatus.DOWNLOADING, bytes_transferred=current)

        staged_path = onedrive_svc.stage_file(
            item,
            self.buffer_mgr.buffer_dir,
            self.stop_event,
            dl_progress
        )
        self.state_mgr.update_item_status(item.id, TransferStatus.STAGED)

        # 3. Upload to Google Drive
        self.state_mgr.update_item_status(item.id, TransferStatus.UPLOADING)
        def up_progress(current, total):
            self.state_mgr.update_item_status(item.id, TransferStatus.UPLOADING, bytes_transferred=current)

        if not self.config.dry_run:
            dest_folder_id = self.gdrive_service.resolve_path_folders(item.relative_path, target_root_id)
            api_res = self.gdrive_service.upload_file(
                staged_path,
                Path(item.relative_path).name,
                dest_folder_id,
                self.stop_event,
                up_progress
            )
        else:
            time.sleep(0.5)
            api_res = {"id": f"dry_{item.id}", "size": item.file_size, "md5Checksum": "dryrun_md5"}

        # 4. Strict Integrity Verification
        self.state_mgr.update_item_status(item.id, TransferStatus.VERIFYING)
        is_valid, v_msg, details = IntegrityVerifier.verify(
            staged_path,
            item.file_size,
            api_res
        )

        if not is_valid:
            self.db.record_failure(item, v_msg)
            self.state_mgr.update_item_status(item.id, TransferStatus.FAILED, error_msg=v_msg)
            # FAIL-SAFE: Do NOT delete local staged file, halt pipeline immediately
            raise ValueError(f"Integrity check failed for {item.relative_path}: {v_msg}")

        # 5. Safe Space Release (Only when verified!)
        self.buffer_mgr.release_file(staged_path)
        item.completed_at = time.time()
        self.db.record_success(item)
        self.state_mgr.update_item_status(
            item.id,
            TransferStatus.COMPLETED,
            gdrive_id=details.get("id"),
            local_md5=details.get("local_md5"),
            gdrive_md5=details.get("gdrive_md5")
        )
        self.logger.success(f"Verified & Space Released: {item.relative_path} (ID: {details.get('id')})")
