"""Main entrypoint and Flask-SocketIO web server for CloudBridge."""

import os
import sys
import webbrowser
import threading
from pathlib import Path
from flask import Flask, render_template, request, jsonify
from flask_socketio import SocketIO

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from CloudBridge.constants import SERVER_HOST, SERVER_PORT, APP_NAME
from CloudBridge.models.config import AppConfig
from CloudBridge.core.state_manager import StateManager
from CloudBridge.core.pipeline import TransferPipeline
from CloudBridge.core.database import TransferDatabase
from CloudBridge.services.logger_service import RelayLogger
from CloudBridge.services.gdrive_service import GoogleDriveService

app = Flask(
    __name__,
    template_folder=str(Path(__file__).resolve().parent / "ui" / "templates"),
    static_folder=str(Path(__file__).resolve().parent / "ui" / "static")
)
app.config["SECRET_KEY"] = "cloudbridge-secret-key-2026"
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="threading")

# Core services instances
config = AppConfig.load()
state_mgr = StateManager()
logger = RelayLogger()
db = TransferDatabase()
gdrive_svc = GoogleDriveService()
pipeline = TransferPipeline(config, state_mgr, logger, db, gdrive_svc)

# Attach WebSocket listeners for real-time pushing
def on_state_change(payload):
    # Enrich with live disk and buffer metrics
    payload["buffer"] = {
        "used_bytes": pipeline.buffer_mgr.get_current_buffer_usage(),
        "max_bytes": config.max_buffer_bytes
    }
    payload["disk"] = {
        "free_bytes": pipeline.buffer_mgr.get_free_disk_space(),
        "min_guard_bytes": config.min_free_disk_bytes
    }
    socketio.emit("state_update", payload)

def on_log_message(log):
    socketio.emit("log_message", log)

state_mgr.add_listener(on_state_change)
logger.add_listener(on_log_message)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/state", methods=["GET"])
def get_state():
    snapshot = state_mgr.get_snapshot()
    snapshot["buffer"] = {
        "used_bytes": pipeline.buffer_mgr.get_current_buffer_usage(),
        "max_bytes": config.max_buffer_bytes
    }
    snapshot["disk"] = {
        "free_bytes": pipeline.buffer_mgr.get_free_disk_space(),
        "min_guard_bytes": config.min_free_disk_bytes
    }
    return jsonify(snapshot)

@app.route("/api/config", methods=["GET", "POST"])
def manage_config():
    global config, pipeline
    if request.method == "POST":
        data = request.json or {}
        if "onedrive_dir" in data: config.onedrive_dir = data["onedrive_dir"]
        if "max_buffer_bytes" in data: config.max_buffer_bytes = int(data["max_buffer_bytes"])
        if "min_free_disk_bytes" in data: config.min_free_disk_bytes = int(data["min_free_disk_bytes"])
        if "gdrive_folder_name" in data: config.gdrive_folder_name = data["gdrive_folder_name"]
        if "dry_run" in data: config.dry_run = bool(data["dry_run"])
        config.save()
        # Re-initialize pipeline buffer settings
        pipeline.buffer_mgr.max_buffer_bytes = config.max_buffer_bytes
        pipeline.buffer_mgr.min_free_disk_bytes = config.min_free_disk_bytes
        return jsonify({"success": True})
    return jsonify(config.__dict__)

@app.route("/api/detect-onedrive", methods=["GET"])
def detect_onedrive():
    candidates = [
        os.environ.get("OneDriveConsumer"),
        os.environ.get("OneDrive"),
        os.environ.get("OneDriveCommercial"),
        str(Path.home() / "OneDrive")
    ]
    detected = next((c for c in candidates if c and Path(c).exists()), None)
    return jsonify({"path": detected})

@app.route("/api/scan", methods=["POST"])
def scan():
    if not config.onedrive_dir or not Path(config.onedrive_dir).exists():
        return jsonify({"success": False, "error": "OneDrive同期フォルダが存在しません。設定から指定してください。"})
    try:
        count = pipeline.scan_and_prepare()
        return jsonify({"success": True, "count": count})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/api/start", methods=["POST"])
def start_pipeline():
    if not config.onedrive_dir or not Path(config.onedrive_dir).exists():
        return jsonify({"success": False, "error": "OneDrive同期フォルダが未設定です。"})
    try:
        pipeline.start()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route("/api/stop", methods=["POST"])
def stop_pipeline():
    pipeline.stop("ユーザーによる手動即時停止")
    return jsonify({"success": True})

@app.route("/api/auth/gdrive", methods=["POST"])
def auth_gdrive():
    try:
        gdrive_svc.authenticate()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

def run_server():
    url = f"http://{SERVER_HOST}:{SERVER_PORT}"
    logger.info(f"{APP_NAME} web server starting at {url}")
    if not os.environ.get("NO_BROWSER"):
        threading.Timer(1.0, lambda: webbrowser.open(url)).start()
    socketio.run(app, host=SERVER_HOST, port=SERVER_PORT, debug=False, use_reloader=False, allow_unsafe_werkzeug=True)

if __name__ == "__main__":
    run_server()
