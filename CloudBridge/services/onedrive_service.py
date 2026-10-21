"""OneDrive folder scanning and staging service."""

import os
import shutil
import threading
from pathlib import Path
from typing import List, Optional, Callable
from ..models.transfer_item import TransferItem, TransferStatus

class OneDriveService:
    """Scans local OneDrive directories and stages files into the buffer."""

    def __init__(self, source_dir: str):
        self.source_dir = Path(source_dir).resolve()

    def scan_files(self) -> List[TransferItem]:
        """Walk the source directory and return a list of TransferItems."""
        if not self.source_dir.exists() or not self.source_dir.is_dir():
            raise FileNotFoundError(f"OneDrive directory not found: {self.source_dir}")

        items: List[TransferItem] = []
        for root, _, files in os.walk(self.source_dir):
            for file_name in files:
                # Skip temporary hidden files
                if file_name.startswith("~$") or file_name.startswith("."):
                    continue

                full_path = Path(root) / file_name
                try:
                    stat = full_path.stat()
                    file_size = stat.st_size
                except OSError:
                    continue

                rel_path = str(full_path.relative_to(self.source_dir)).replace("\\", "/")
                item_id = f"item_{len(items)}_{hash(rel_path) & 0xffffffff}"

                items.append(TransferItem(
                    id=item_id,
                    relative_path=rel_path,
                    source_path=str(full_path),
                    file_size=file_size,
                    status=TransferStatus.QUEUED
                ))

        return items

    def stage_file(
        self,
        item: TransferItem,
        buffer_dir: Path,
        stop_event: Optional[threading.Event] = None,
        progress_cb: Optional[Callable[[int, int], None]] = None
    ) -> str:
        """
        Copy/download file from OneDrive to staging buffer.
        Triggers Windows On-Demand hydration upon read.
        """
        source = Path(item.source_path)
        dest = buffer_dir / Path(item.relative_path)
        dest.parent.mkdir(parents=True, exist_ok=True)

        if not source.exists():
            raise FileNotFoundError(f"Source file vanished: {source}")

        chunk_size = 1024 * 1024  # 1 MB chunk
        copied_bytes = 0

        try:
            # Stream copy to allow stop signal interruption and progress updates
            with open(source, "rb") as fsrc, open(dest, "wb") as fdst:
                while True:
                    if stop_event and stop_event.is_set():
                        raise InterruptedError("Download aborted by user stop signal.")

                    buf = fsrc.read(chunk_size)
                    if not buf:
                        break

                    fdst.write(buf)
                    copied_bytes += len(buf)
                    if progress_cb:
                        progress_cb(copied_bytes, item.file_size)
        except Exception as e:
            # Clean up partial incomplete file
            if dest.exists():
                try:
                    dest.unlink()
                except OSError:
                    pass
            raise e

        item.local_buffer_path = str(dest)
        item.bytes_transferred = copied_bytes
        return str(dest)
