/**
 * Main Frontend Controller initializing app components and user interactions.
 */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Socket.IO with handlers
  window.api.initSocket(
    (data) => {
      window.ui.updateMetrics(data);
      window.ui.updatePipelineStatus(data.state, data.error_reason);
      window.ui.renderQueueTable(data.items);
    },
    (log) => {
      window.ui.appendLog(log);
    }
  );

  // Initial State & Config Load
  try {
    const initialState = await window.api.fetchState();
    window.ui.updateMetrics(initialState);
    window.ui.updatePipelineStatus(initialState.state, initialState.error_reason);
    window.ui.renderQueueTable(initialState.items);

    const config = await window.api.fetchConfig();
    populateSettingsForm(config);
    await checkAuthStatus();
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }

  // Bind Buttons
  document.getElementById('btn-scan').addEventListener('click', async () => {
    try {
      window.ui.appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'OneDriveフォルダをスキャン中...' });
      const res = await window.api.scanOneDrive();
      if (!res.success) {
        alert(res.error || 'スキャンに失敗しました');
      }
    } catch (e) {
      alert('スキャン通信エラー: ' + e.message);
    }
  });

  document.getElementById('btn-start').addEventListener('click', async () => {
    try {
      const res = await window.api.startPipeline();
      if (!res.success) alert(res.error || 'パイプライン起動失敗');
    } catch (e) {
      alert('起動通信エラー: ' + e.message);
    }
  });

  document.getElementById('btn-stop').addEventListener('click', async () => {
    try {
      await window.api.stopPipeline();
    } catch (e) {
      alert('停止通信エラー: ' + e.message);
    }
  });

  // Terminal Controls
  const btnScroll = document.getElementById('btn-toggle-scroll');
  btnScroll.addEventListener('click', () => {
    window.ui.autoScroll = !window.ui.autoScroll;
    btnScroll.classList.toggle('active', window.ui.autoScroll);
  });

  document.getElementById('btn-clear-logs').addEventListener('click', () => {
    document.getElementById('terminal-body').innerHTML = '';
  });

  // Filter Tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      window.ui.currentFilter = e.target.dataset.filter;
      window.ui.renderQueueTable(window.ui.cachedItems);
    });
  });

  // Settings Modal Handlers
  const modal = document.getElementById('settings-modal');
  document.getElementById('btn-settings-toggle').addEventListener('click', async () => {
    modal.classList.remove('hidden');
    await checkAuthStatus();
  });
  document.getElementById('btn-settings-close').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('btn-settings-cancel').addEventListener('click', () => modal.classList.add('hidden'));
  document.getElementById('alert-close').addEventListener('click', () => {
    document.getElementById('alert-banner').classList.add('hidden');
  });

  document.getElementById('btn-detect-onedrive').addEventListener('click', async () => {
    const res = await window.api.detectOneDrive();
    if (res.path) {
      document.getElementById('onedrive-dir-input').value = res.path;
      window.ui.appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: `OneDriveパスを自動検出: ${res.path}` });
    } else {
      alert('OneDrive同期フォルダを自動検出できませんでした。手動で入力してください。');
    }
  });

  async function checkAuthStatus() {
    try {
      const status = await window.api.fetchAuthStatus();
      const dot = document.getElementById('auth-dot');
      const text = document.getElementById('auth-status-text');
      const btnAuth = document.getElementById('btn-auth-gdrive');

      dot.className = 'status-dot';
      if (status.is_authenticated) {
        dot.classList.add('dot-green');
        text.textContent = 'Google認証済み (連携中)';
        btnAuth.textContent = '再認証';
      } else if (status.has_credentials) {
        dot.classList.add('dot-yellow');
        text.textContent = 'credentials.json 配置済み（ログイン待ち）';
        btnAuth.disabled = false;
      } else {
        dot.classList.add('dot-red');
        text.textContent = 'credentials.json 未配置';
      }
    } catch (e) {
      console.warn('Auth status check failed:', e);
    }
  }

  // Credentials file import
  const fileInput = document.getElementById('credentials-file-input');
  document.getElementById('btn-import-creds').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const res = await window.api.uploadCredentials(file);
      if (res.success) {
        window.ui.appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: 'credentials.json を正常にインポートしました。' });
        await checkAuthStatus();
        alert('credentials.json の登録が完了しました！続けて「Googleログイン認証」ボタンを押してください。');
      } else {
        alert('アップロード失敗: ' + (res.error || '不明なエラー'));
      }
    }
  });

  document.getElementById('btn-auth-gdrive').addEventListener('click', async () => {
    window.ui.appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'INFO', message: 'Google Drive認証を開始します...' });
    const res = await window.api.authGDrive();
    if (res.success) {
      alert('Google Drive認証が成功しました！');
      await checkAuthStatus();
    } else {
      alert('認証エラー: ' + (res.error || '不明なエラー'));
    }
  });

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const maxGb = parseFloat(document.getElementById('max-buffer-input').value) || 5.0;
    const minGb = parseFloat(document.getElementById('min-disk-input').value) || 5.0;
    const config = {
      onedrive_dir: document.getElementById('onedrive-dir-input').value,
      max_buffer_bytes: Math.round(maxGb * 1024 * 1024 * 1024),
      min_free_disk_bytes: Math.round(minGb * 1024 * 1024 * 1024),
      gdrive_folder_name: document.getElementById('gdrive-folder-input').value,
      dry_run: document.getElementById('dry-run-check').checked
    };
    await window.api.saveConfig(config);
    modal.classList.add('hidden');
    window.ui.appendLog({ timestamp: new Date().toLocaleTimeString(), level: 'SUCCESS', message: '設定を更新しました。' });
  });

  function populateSettingsForm(cfg) {
    if (!cfg) return;
    if (cfg.onedrive_dir) document.getElementById('onedrive-dir-input').value = cfg.onedrive_dir;
    document.getElementById('max-buffer-input').value = ((cfg.max_buffer_bytes || 5368709120) / (1024 * 1024 * 1024)).toFixed(1);
    document.getElementById('min-disk-input').value = ((cfg.min_free_disk_bytes || 5368709120) / (1024 * 1024 * 1024)).toFixed(1);
    document.getElementById('gdrive-folder-input').value = cfg.gdrive_folder_name || 'CloudBridge_Backup';
    document.getElementById('dry-run-check').checked = !!cfg.dry_run;
  }
});
