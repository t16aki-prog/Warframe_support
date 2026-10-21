"""Google Drive API v3 client with resumable chunked upload and folder caching."""

import os
import threading
from pathlib import Path
from typing import Optional, Dict, Any, Callable
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from ..constants import SCOPES, CREDENTIALS_FILE, TOKEN_FILE, CHUNK_UPLOAD_SIZE
from ..models.transfer_item import TransferItem

class GoogleDriveService:
    """Manages authentication, directory structures, and file uploads to Google Drive."""

    def __init__(self, credentials_path: Optional[Path] = None, token_path: Optional[Path] = None):
        self.credentials_path = credentials_path or CREDENTIALS_FILE
        self.token_path = token_path or TOKEN_FILE
        self.service = None
        self._folder_cache: Dict[str, str] = {}  # "parent_id/folder_name" -> folder_id

    def is_authenticated(self) -> bool:
        """Check if valid credentials exist."""
        return self._get_credentials() is not None

    def _get_credentials(self) -> Optional[Credentials]:
        creds = None
        if self.token_path.exists():
            try:
                creds = Credentials.from_authorized_user_file(str(self.token_path), SCOPES)
            except Exception:
                pass

        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(self.token_path, "w", encoding="utf-8") as token_file:
                    token_file.write(creds.to_json())
            except Exception:
                creds = None

        return creds if (creds and creds.valid) else None

    def authenticate(self) -> bool:
        """Run interactive OAuth flow if credentials are missing or invalid."""
        creds = self._get_credentials()
        if not creds:
            if not self.credentials_path.exists():
                raise FileNotFoundError(
                    f"Google Drive credentials file not found at {self.credentials_path}. "
                    "Please download your client_secrets.json from Google Cloud Console."
                )
            flow = InstalledAppFlow.from_client_secrets_file(str(self.credentials_path), SCOPES)
            creds = flow.run_local_server(port=0)
            with open(self.token_path, "w", encoding="utf-8") as token_file:
                token_file.write(creds.to_json())

        self.service = build("drive", "v3", credentials=creds)
        return True

    def ensure_service(self):
        """Ensure Google Drive service is initialized."""
        if not self.service:
            if not self.authenticate():
                raise RuntimeError("Failed to authenticate with Google Drive API.")

    def get_or_create_folder(self, folder_name: str, parent_id: Optional[str] = None) -> str:
        """Find or create a folder under parent_id in Google Drive."""
        self.ensure_service()
        cache_key = f"{parent_id or 'root'}/{folder_name}"
        if cache_key in self._folder_cache:
            return self._folder_cache[cache_key]

        query = f"mimeType = 'application/vnd.google-apps.folder' and name = '{folder_name}' and trashed = false"
        if parent_id:
            query += f" and '{parent_id}' in parents"
        else:
            query += " and 'root' in parents"

        results = self.service.files().list(q=query, fields="files(id, name)").execute()
        files = results.get("files", [])

        if files:
            folder_id = files[0]["id"]
        else:
            metadata = {
                "name": folder_name,
                "mimeType": "application/vnd.google-apps.folder",
                "parents": [parent_id] if parent_id else ["root"]
            }
            created = self.service.files().create(body=metadata, fields="id").execute()
            folder_id = created.get("id")

        self._folder_cache[cache_key] = folder_id
        return folder_id

    def resolve_path_folders(self, relative_path: str, root_folder_id: Optional[str] = None) -> str:
        """Recursively ensure all subdirectories for a file exist on Google Drive."""
        parts = Path(relative_path).parent.parts
        current_parent = root_folder_id

        for folder_part in parts:
            if folder_part and folder_part != ".":
                current_parent = self.get_or_create_folder(folder_part, current_parent)

        return current_parent

    def upload_file(
        self,
        local_path: str,
        file_name: str,
        parent_folder_id: Optional[str] = None,
        stop_event: Optional[threading.Event] = None,
        progress_cb: Optional[Callable[[int, int], None]] = None
    ) -> Dict[str, Any]:
        """Upload a file using resumable chunked upload with progress and interrupt support."""
        self.ensure_service()
        file_path = Path(local_path)
        total_size = file_path.stat().st_size

        metadata = {"name": file_name}
        if parent_folder_id:
            metadata["parents"] = [parent_folder_id]

        media = MediaFileUpload(
            str(file_path),
            resumable=True,
            chunksize=CHUNK_UPLOAD_SIZE
        )

        request = self.service.files().create(
            body=metadata,
            media_body=media,
            fields="id, name, size, md5Checksum"
        )

        response = None
        while response is None:
            if stop_event and stop_event.is_set():
                raise InterruptedError("Upload interrupted by user stop signal.")

            status, response = request.next_chunk()
            if status and progress_cb:
                progress_cb(status.resumable_progress, total_size)

        if progress_cb:
            progress_cb(total_size, total_size)

        return response
