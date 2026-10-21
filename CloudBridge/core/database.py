"""Database module for transfer history and resume ledger."""

import sqlite3
from pathlib import Path
from typing import Optional, Dict, Any, List
from ..constants import DEFAULT_DB_PATH
from ..models.transfer_item import TransferItem, TransferStatus

class TransferDatabase:
    """SQLite-backed persistent registry for verified transfers."""

    def __init__(self, db_path: Optional[Path] = None):
        self.db_path = db_path or DEFAULT_DB_PATH
        self._init_db()

    def _get_connection(self) -> sqlite3.Connection:
        conn = sqlite3.connect(str(self.db_path), timeout=30.0)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Create tables if they do not exist."""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS transfers (
                    relative_path TEXT PRIMARY KEY,
                    file_size INTEGER NOT NULL,
                    gdrive_file_id TEXT,
                    md5_checksum TEXT,
                    status TEXT NOT NULL,
                    error_message TEXT,
                    completed_at REAL
                )
            """)
            conn.commit()

    def is_verified(self, relative_path: str, file_size: int) -> bool:
        """Check if file is already successfully transferred and verified."""
        with self._get_connection() as conn:
            cursor = conn.execute(
                "SELECT gdrive_file_id FROM transfers WHERE relative_path = ? AND file_size = ? AND status = ?",
                (relative_path, file_size, TransferStatus.COMPLETED.value)
            )
            return cursor.fetchone() is not None

    def record_success(self, item: TransferItem) -> None:
        """Record verified file completion."""
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO transfers 
                (relative_path, file_size, gdrive_file_id, md5_checksum, status, error_message, completed_at)
                VALUES (?, ?, ?, ?, ?, NULL, ?)
            """, (
                item.relative_path,
                item.file_size,
                item.gdrive_file_id,
                item.gdrive_md5,
                TransferStatus.COMPLETED.value,
                item.completed_at
            ))
            conn.commit()

    def record_failure(self, item: TransferItem, error_msg: str) -> None:
        """Record transfer error."""
        with self._get_connection() as conn:
            conn.execute("""
                INSERT OR REPLACE INTO transfers 
                (relative_path, file_size, gdrive_file_id, md5_checksum, status, error_message, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                item.relative_path,
                item.file_size,
                item.gdrive_file_id,
                item.local_md5,
                TransferStatus.FAILED.value,
                error_msg,
                item.completed_at
            ))
            conn.commit()

    def get_summary_stats(self) -> Dict[str, Any]:
        """Return total files and bytes completed."""
        with self._get_connection() as conn:
            cursor = conn.execute("""
                SELECT COUNT(*), COALESCE(SUM(file_size), 0) 
                FROM transfers WHERE status = ?
            """, (TransferStatus.COMPLETED.value,))
            row = cursor.fetchone()
            return {
                "completed_count": row[0] if row else 0,
                "completed_bytes": row[1] if row else 0
            }
