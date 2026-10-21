"""Application configuration model."""

from dataclasses import dataclass, field
import json
from pathlib import Path
from typing import Optional
from ..constants import (
    DEFAULT_BUFFER_DIR,
    DEFAULT_MAX_BUFFER_BYTES,
    DEFAULT_MIN_FREE_DISK_BYTES,
    BASE_DIR
)

CONFIG_FILE_PATH = BASE_DIR / "config.json"

@dataclass
class AppConfig:
    """Runtime configuration for CloudBridge."""
    onedrive_dir: str = ""
    buffer_dir: str = str(DEFAULT_BUFFER_DIR)
    max_buffer_bytes: int = DEFAULT_MAX_BUFFER_BYTES
    min_free_disk_bytes: int = DEFAULT_MIN_FREE_DISK_BYTES
    gdrive_folder_name: str = "CloudBridge_Backup"
    gdrive_folder_id: Optional[str] = None
    skip_existing: bool = True
    dry_run: bool = False

    def save(self, filepath: Optional[Path] = None) -> None:
        """Persist config to JSON file."""
        target = filepath or CONFIG_FILE_PATH
        data = {
            "onedrive_dir": self.onedrive_dir,
            "buffer_dir": self.buffer_dir,
            "max_buffer_bytes": self.max_buffer_bytes,
            "min_free_disk_bytes": self.min_free_disk_bytes,
            "gdrive_folder_name": self.gdrive_folder_name,
            "gdrive_folder_id": self.gdrive_folder_id,
            "skip_existing": self.skip_existing,
            "dry_run": self.dry_run
        }
        with open(target, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    @classmethod
    def load(cls, filepath: Optional[Path] = None) -> "AppConfig":
        """Load configuration from JSON file or return defaults."""
        target = filepath or CONFIG_FILE_PATH
        if not target.exists():
            return cls()
        try:
            with open(target, "r", encoding="utf-8") as f:
                data = json.load(f)
                return cls(**data)
        except Exception:
            return cls()
