"""File integrity verification engine."""

import hashlib
from pathlib import Path
from typing import Tuple, Optional, Dict, Any

class IntegrityVerifier:
    """Computes checksums and validates files against cloud API metadata."""

    @staticmethod
    def compute_local_md5(file_path: str, chunk_size: int = 4 * 1024 * 1024) -> str:
        """Calculate MD5 hash of local file using chunks."""
        hasher = hashlib.md5()
        path = Path(file_path)
        if not path.is_file():
            raise FileNotFoundError(f"Local file not found for verification: {file_path}")

        with open(path, "rb") as f:
            while chunk := f.read(chunk_size):
                hasher.update(chunk)
        return hasher.hexdigest().lower()

    @classmethod
    def verify(
        cls,
        local_file_path: str,
        expected_size: int,
        gdrive_metadata: Dict[str, Any]
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Verify that uploaded Google Drive file matches the local file exactly.
        Returns: (is_valid, message, details)
        """
        # 1. Check API ID existence
        gdrive_id = gdrive_metadata.get("id")
        if not gdrive_id:
            return False, "Google Drive API response did not contain a valid file ID", {}

        # 2. Check File Size
        gdrive_size_raw = gdrive_metadata.get("size")
        if gdrive_size_raw is not None:
            gdrive_size = int(gdrive_size_raw)
            if gdrive_size != expected_size:
                return False, f"Size mismatch: local={expected_size} bytes, gdrive={gdrive_size} bytes", {
                    "id": gdrive_id, "local_size": expected_size, "gdrive_size": gdrive_size
                }

        # 3. Check MD5 Checksum
        local_md5 = cls.compute_local_md5(local_file_path)
        gdrive_md5 = (gdrive_metadata.get("md5Checksum") or "").lower()

        if gdrive_md5 and local_md5 != gdrive_md5:
            return False, f"MD5 checksum mismatch: local={local_md5}, gdrive={gdrive_md5}", {
                "id": gdrive_id, "local_md5": local_md5, "gdrive_md5": gdrive_md5
            }

        return True, "Integrity verified successfully", {
            "id": gdrive_id,
            "local_md5": local_md5,
            "gdrive_md5": gdrive_md5,
            "size": expected_size
        }
