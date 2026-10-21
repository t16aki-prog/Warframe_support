"""CloudBridge application constants and configurations."""

from pathlib import Path

# Application Metadata
APP_NAME = "CloudBridge"
APP_VERSION = "1.0.0"
APP_DESCRIPTION = "OneDrive to Google Drive Safe Relayer with Storage Guard"

# Default Directory Paths
BASE_DIR = Path(__file__).resolve().parent
DEFAULT_BUFFER_DIR = BASE_DIR / "local_buffer"
DEFAULT_DB_PATH = BASE_DIR / "cloudbridge.db"
LOGS_DIR = BASE_DIR / "logs"
CREDENTIALS_FILE = BASE_DIR / "credentials.json"
TOKEN_FILE = BASE_DIR / "token.json"

def get_credentials_file() -> Path:
    """Return credentials.json if exists, or auto-detect client_secret_*.json."""
    if CREDENTIALS_FILE.exists():
        return CREDENTIALS_FILE
    # Auto-detect downloaded client_secret json files
    for candidate in sorted(BASE_DIR.glob("client_secret*.json")):
        if candidate.is_file():
            return candidate
    return CREDENTIALS_FILE

# Buffer & Capacity Defaults (in bytes)
DEFAULT_MAX_BUFFER_BYTES = 5 * 1024 * 1024 * 1024  # 5 GB
DEFAULT_MIN_FREE_DISK_BYTES = 5 * 1024 * 1024 * 1024  # 5 GB disk guard
CHUNK_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB resumable chunk

# Google Drive API Scopes
SCOPES = ["https://www.googleapis.com/auth/drive"]

# Server Configuration
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 5055

# Status Codes
STATUS_QUEUED = "QUEUED"
STATUS_DOWNLOADING = "DOWNLOADING"
STATUS_STAGED = "STAGED"
STATUS_UPLOADING = "UPLOADING"
STATUS_UPLOADED = "UPLOADED"
STATUS_VERIFYING = "VERIFYING"
STATUS_COMPLETED = "COMPLETED"
STATUS_FAILED = "FAILED"
STATUS_SKIPPED = "SKIPPED"

# Error Codes
ERR_INSUFFICIENT_BUFFER = "ERR_INSUFFICIENT_BUFFER"
ERR_LOW_DISK_SPACE = "ERR_LOW_DISK_SPACE"
ERR_DOWNLOAD_FAILED = "ERR_DOWNLOAD_FAILED"
ERR_UPLOAD_FAILED = "ERR_UPLOAD_FAILED"
ERR_VERIFICATION_FAILED = "ERR_VERIFICATION_FAILED"
ERR_AUTHENTICATION = "ERR_AUTHENTICATION"
ERR_USER_ABORTED = "ERR_USER_ABORTED"
