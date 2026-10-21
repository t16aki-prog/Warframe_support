"""Data model representing a file transfer item."""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional
import time

class TransferStatus(str, Enum):
    QUEUED = "QUEUED"
    DOWNLOADING = "DOWNLOADING"
    STAGED = "STAGED"
    UPLOADING = "UPLOADING"
    UPLOADED = "UPLOADED"
    VERIFYING = "VERIFYING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

@dataclass
class TransferItem:
    """Represents a file moving through the relay pipeline."""
    id: str  # Unique task ID or relative path hash
    relative_path: str  # Path relative to the source OneDrive directory
    source_path: str  # Full path on local OneDrive
    file_size: int  # Size in bytes
    
    # Execution states
    status: TransferStatus = TransferStatus.QUEUED
    local_buffer_path: Optional[str] = None  # Staging path in buffer
    gdrive_file_id: Optional[str] = None  # Assigned by Google Drive API
    
    # Checksums
    local_md5: Optional[str] = None
    gdrive_md5: Optional[str] = None
    
    # Progress & Metrics
    bytes_transferred: int = 0
    error_message: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    completed_at: Optional[float] = None

    def to_dict(self) -> dict:
        """Convert item to JSON-serializable dictionary."""
        return {
            "id": self.id,
            "relative_path": self.relative_path,
            "source_path": self.source_path,
            "file_size": self.file_size,
            "status": self.status.value,
            "local_buffer_path": self.local_buffer_path,
            "gdrive_file_id": self.gdrive_file_id,
            "local_md5": self.local_md5,
            "gdrive_md5": self.gdrive_md5,
            "bytes_transferred": self.bytes_transferred,
            "error_message": self.error_message,
            "created_at": self.created_at,
            "completed_at": self.completed_at
        }
