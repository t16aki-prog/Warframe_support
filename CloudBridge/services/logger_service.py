"""Logging service with file persistence and real-time streaming."""

import logging
import datetime
from pathlib import Path
from typing import Callable, Optional, List
from ..constants import LOGS_DIR

class RelayLogger:
    """Central logger broadcasting messages to disk and real-time listeners."""

    def __init__(self, log_dir: Optional[Path] = None):
        self.log_dir = log_dir or LOGS_DIR
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.listeners: List[Callable[[dict], None]] = []
        
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_file = self.log_dir / f"relay_{timestamp}.log"
        
        # Setup file logger
        self.logger = logging.getLogger(f"CloudBridge_{timestamp}")
        self.logger.setLevel(logging.INFO)
        
        file_handler = logging.FileHandler(str(self.log_file), encoding="utf-8")
        formatter = logging.Formatter("[%(asctime)s] [%(levelname)s] %(message)s", datefmt="%H:%M:%S")
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)

    def add_listener(self, callback: Callable[[dict], None]) -> None:
        """Register a callback for real-time log broadcasts (e.g., WebSocket)."""
        self.listeners.append(callback)

    def _broadcast(self, level: str, message: str, details: Optional[dict] = None) -> None:
        time_str = datetime.datetime.now().strftime("%H:%M:%S")
        payload = {
            "timestamp": time_str,
            "level": level,
            "message": message,
            "details": details or {}
        }
        for listener in self.listeners:
            try:
                listener(payload)
            except Exception:
                pass

    def info(self, msg: str, details: Optional[dict] = None) -> None:
        self.logger.info(msg)
        self._broadcast("INFO", msg, details)

    def success(self, msg: str, details: Optional[dict] = None) -> None:
        self.logger.info(f"[SUCCESS] {msg}")
        self._broadcast("SUCCESS", msg, details)

    def warn(self, msg: str, details: Optional[dict] = None) -> None:
        self.logger.warning(msg)
        self._broadcast("WARN", msg, details)

    def error(self, msg: str, details: Optional[dict] = None) -> None:
        self.logger.error(msg)
        self._broadcast("ERROR", msg, details)
