"""State management and telemetry module for CloudBridge."""

import threading
from typing import List, Dict, Any, Optional, Callable
from ..models.transfer_item import TransferItem, TransferStatus

class PipelineState:
    IDLE = "IDLE"
    SCANNING = "SCANNING"
    RUNNING = "RUNNING"
    PAUSED = "PAUSED"
    STOPPED_ERROR = "STOPPED_ERROR"
    STOPPED_USER = "STOPPED_USER"
    COMPLETED = "COMPLETED"

class StateManager:
    """Maintains pipeline state, transfer queue, and metrics."""

    def __init__(self):
        self._lock = threading.Lock()
        self.state: str = PipelineState.IDLE
        self.items: List[TransferItem] = []
        self.current_item_id: Optional[str] = None
        self.error_reason: Optional[str] = None
        self.listeners: List[Callable[[dict], None]] = []

    def add_listener(self, callback: Callable[[dict], None]) -> None:
        """Register state change listener."""
        self.listeners.append(callback)

    def _notify(self) -> None:
        payload = self.get_snapshot()
        for listener in self.listeners:
            try:
                listener(payload)
            except Exception:
                pass

    def set_state(self, new_state: str, error_reason: Optional[str] = None) -> None:
        with self._lock:
            self.state = new_state
            if error_reason:
                self.error_reason = error_reason
        self._notify()

    def set_items(self, items: List[TransferItem]) -> None:
        with self._lock:
            self.items = items
            self.current_item_id = None
        self._notify()

    def set_current_item(self, item_id: Optional[str]) -> None:
        with self._lock:
            self.current_item_id = item_id
        self._notify()

    def update_item_status(
        self,
        item_id: str,
        status: TransferStatus,
        error_msg: Optional[str] = None,
        bytes_transferred: Optional[int] = None,
        gdrive_id: Optional[str] = None,
        local_md5: Optional[str] = None,
        gdrive_md5: Optional[str] = None
    ) -> None:
        with self._lock:
            for item in self.items:
                if item.id == item_id:
                    item.status = status
                    if error_msg is not None:
                        item.error_message = error_msg
                    if bytes_transferred is not None:
                        item.bytes_transferred = bytes_transferred
                    if gdrive_id is not None:
                        item.gdrive_file_id = gdrive_id
                    if local_md5 is not None:
                        item.local_md5 = local_md5
                    if gdrive_md5 is not None:
                        item.gdrive_md5 = gdrive_md5
                    break
        self._notify()

    def get_snapshot(self) -> Dict[str, Any]:
        """Produce a complete JSON-ready state snapshot."""
        with self._lock:
            total_count = len(self.items)
            completed_count = sum(1 for i in self.items if i.status == TransferStatus.COMPLETED)
            failed_count = sum(1 for i in self.items if i.status == TransferStatus.FAILED)
            skipped_count = sum(1 for i in self.items if i.status == TransferStatus.SKIPPED)
            total_bytes = sum(i.file_size for i in self.items)
            completed_bytes = sum(i.file_size for i in self.items if i.status == TransferStatus.COMPLETED)

            return {
                "state": self.state,
                "error_reason": self.error_reason,
                "current_item_id": self.current_item_id,
                "metrics": {
                    "total_count": total_count,
                    "completed_count": completed_count,
                    "failed_count": failed_count,
                    "skipped_count": skipped_count,
                    "total_bytes": total_bytes,
                    "completed_bytes": completed_bytes,
                    "progress_percentage": round((completed_bytes / total_bytes * 100), 1) if total_bytes > 0 else 0.0
                },
                "items": [item.to_dict() for item in self.items]
            }
