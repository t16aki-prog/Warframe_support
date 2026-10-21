"""Buffer and storage capacity manager."""

import os
import shutil
from pathlib import Path
from typing import Tuple
import psutil

class BufferManager:
    """Manages the local staging buffer and monitors disk free space."""

    def __init__(self, buffer_dir: str, max_buffer_bytes: int, min_free_disk_bytes: int):
        self.buffer_dir = Path(buffer_dir).resolve()
        self.max_buffer_bytes = max_buffer_bytes
        self.min_free_disk_bytes = min_free_disk_bytes
        self._ensure_buffer_dir()

    def _ensure_buffer_dir(self) -> None:
        """Create buffer directory if not present."""
        self.buffer_dir.mkdir(parents=True, exist_ok=True)

    def get_current_buffer_usage(self) -> int:
        """Calculate total bytes currently stored in local staging buffer."""
        total = 0
        if not self.buffer_dir.exists():
            return 0
        for entry in self.buffer_dir.rglob("*"):
            if entry.is_file():
                try:
                    total += entry.stat().st_size
                except OSError:
                    pass
        return total

    def get_free_disk_space(self) -> int:
        """Get available disk free space for the buffer's drive in bytes."""
        try:
            return psutil.disk_usage(str(self.buffer_dir)).free
        except Exception:
            return 0

    def can_accommodate(self, file_size: int) -> Tuple[bool, str]:
        """Check if buffer and disk can accept the incoming file safely."""
        current_usage = self.get_current_buffer_usage()
        if (current_usage + file_size) > self.max_buffer_bytes:
            return False, f"Buffer limit exceeded: current {current_usage}B + file {file_size}B > max {self.max_buffer_bytes}B"

        free_disk = self.get_free_disk_space()
        if (free_disk - file_size) < self.min_free_disk_bytes:
            return False, f"Low disk space guard: available {free_disk}B - file {file_size}B < minimum guard {self.min_free_disk_bytes}B"

        return True, ""

    def release_file(self, file_path: str) -> bool:
        """Safely delete staged local file to reclaim storage space."""
        target = Path(file_path).resolve()
        try:
            if target.exists() and target.is_file():
                resolved_buffer = self.buffer_dir.resolve()
                # Security check: ensure file is strictly inside the buffer directory
                if not target.is_relative_to(resolved_buffer) or target == resolved_buffer:
                    raise ValueError(f"Security: Refusing to delete file outside buffer: {target}")
                
                # Refuse to delete symlink to avoid deleting external target
                if target.is_symlink():
                    raise ValueError(f"Security: Refusing to delete symlink: {target}")
                
                # Windows temporary lock retry loop
                for attempt in range(4):
                    try:
                        target.unlink()
                        break
                    except (PermissionError, OSError) as e:
                        if attempt == 3:
                            raise e
                        import time
                        time.sleep(0.15)
                
                # Cleanup empty parent directories up to buffer root
                parent = target.parent
                while parent != self.buffer_dir and parent.exists():
                    if not any(parent.iterdir()):
                        parent.rmdir()
                        parent = parent.parent
                    else:
                        break
                return True
        except ValueError:
            raise
        except Exception as e:
            raise RuntimeError(f"Failed to release local file {file_path}: {e}")
        return False

    def purge_buffer(self) -> None:
        """Clear all contents inside the buffer directory."""
        if self.buffer_dir.exists():
            for item in self.buffer_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item, ignore_errors=True)
                else:
                    try:
                        item.unlink()
                    except OSError:
                        pass
