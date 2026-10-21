/**
 * Backend API and Socket.IO real-time event interface.
 */
class CloudBridgeAPI {
  constructor() {
    this.socket = null;
  }

  initSocket(onStateUpdate, onLogMessage) {
    if (typeof io !== 'undefined') {
      this.socket = io();
      this.socket.on('state_update', (data) => {
        if (onStateUpdate) onStateUpdate(data);
      });
      this.socket.on('log_message', (log) => {
        if (onLogMessage) onLogMessage(log);
      });
    }
  }

  async fetchState() {
    const res = await fetch('/api/state');
    return await res.json();
  }

  async fetchConfig() {
    const res = await fetch('/api/config');
    return await res.json();
  }

  async saveConfig(config) {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    return await res.json();
  }

  async startPipeline() {
    const res = await fetch('/api/start', { method: 'POST' });
    return await res.json();
  }

  async stopPipeline() {
    const res = await fetch('/api/stop', { method: 'POST' });
    return await res.json();
  }

  async scanOneDrive() {
    const res = await fetch('/api/scan', { method: 'POST' });
    return await res.json();
  }

  async detectOneDrive() {
    const res = await fetch('/api/detect-onedrive');
    return await res.json();
  }

  async fetchAuthStatus() {
    const res = await fetch('/api/auth/status');
    return await res.json();
  }

  async uploadCredentials(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload-credentials', {
      method: 'POST',
      body: formData
    });
    return await res.json();
  }

  async authGDrive() {
    const res = await fetch('/api/auth/gdrive', { method: 'POST' });
    return await res.json();
  }
}

window.api = new CloudBridgeAPI();
