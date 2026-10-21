/**
 * UI Rendering and DOM manipulation manager.
 */
class UIManager {
  constructor() {
    this.autoScroll = true;
    this.currentFilter = 'all';
    this.cachedItems = [];
  }

  formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  updateMetrics(data) {
    const metrics = data.metrics || {};
    const buffer = data.buffer || {};
    const disk = data.disk || {};

    // Buffer Gauge
    const bufferUsed = buffer.used_bytes || 0;
    const bufferMax = buffer.max_bytes || (5 * 1024 * 1024 * 1024);
    const bufferPct = Math.min(100, Math.round((bufferUsed / bufferMax) * 100));
    document.getElementById('buffer-pct').textContent = `${bufferPct}%`;
    document.getElementById('buffer-used-text').textContent = this.formatBytes(bufferUsed);
    document.getElementById('buffer-max-text').textContent = this.formatBytes(bufferMax);
    document.getElementById('buffer-progress-bar').style.width = `${bufferPct}%`;
    document.getElementById('buffer-free-text').textContent = `空き ${this.formatBytes(Math.max(0, bufferMax - bufferUsed))}`;

    // Disk Space Guard
    const diskFree = disk.free_bytes || 0;
    document.getElementById('disk-free-text').textContent = this.formatBytes(diskFree);
    document.getElementById('disk-guard-text').textContent = `${this.formatBytes(disk.min_guard_bytes || 0)} 以上を保持`;

    // Overall Progress
    const progressPct = metrics.progress_percentage || 0;
    document.getElementById('overall-pct').textContent = `${progressPct}%`;
    document.getElementById('completed-files-text').textContent = `${metrics.completed_count || 0} / ${metrics.total_count || 0}`;
    document.getElementById('overall-progress-bar').style.width = `${progressPct}%`;
    document.getElementById('transfer-bytes-text').textContent = 
      `${this.formatBytes(metrics.completed_bytes || 0)} / ${this.formatBytes(metrics.total_bytes || 0)}`;
    document.getElementById('failed-files-text').textContent = `エラー: ${metrics.failed_count || 0}`;
    document.getElementById('queue-count-badge').textContent = `${metrics.total_count || 0} 件`;
  }

  updatePipelineStatus(state, errorReason) {
    const badge = document.getElementById('pipeline-status-badge');
    const text = document.getElementById('pipeline-status-text');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const alertBanner = document.getElementById('alert-banner');
    const alertText = document.getElementById('alert-text');

    badge.className = 'status-badge';

    switch (state) {
      case 'RUNNING':
        badge.classList.add('badge-running');
        text.textContent = '転送・検証中 (RUNNING)';
        btnStart.disabled = true;
        btnStop.disabled = false;
        alertBanner.classList.add('hidden');
        break;
      case 'STOPPED_ERROR':
        badge.classList.add('badge-error');
        text.textContent = '異常停止 (STOPPED_ERROR)';
        btnStart.disabled = false;
        btnStop.disabled = true;
        alertText.textContent = `エラーにより即時停止しました: ${errorReason || '不明なエラー'}`;
        alertBanner.classList.remove('hidden');
        break;
      case 'STOPPED_USER':
        badge.classList.add('badge-idle');
        text.textContent = '緊急停止完了 (STOPPED)';
        btnStart.disabled = false;
        btnStop.disabled = true;
        break;
      case 'COMPLETED':
        badge.classList.add('badge-completed');
        text.textContent = '全件完了 (COMPLETED)';
        btnStart.disabled = false;
        btnStop.disabled = true;
        break;
      default:
        badge.classList.add('badge-idle');
        text.textContent = '待機中 (IDLE)';
        btnStart.disabled = false;
        btnStop.disabled = true;
        break;
    }
  }

  renderQueueTable(items) {
    this.cachedItems = items || [];
    const tbody = document.getElementById('transfer-table-body');
    const filtered = this.cachedItems.filter(item => {
      if (this.currentFilter === 'pending') return ['QUEUED', 'DOWNLOADING', 'STAGED', 'UPLOADING', 'VERIFYING'].includes(item.status);
      if (this.currentFilter === 'completed') return item.status === 'COMPLETED';
      if (this.currentFilter === 'failed') return item.status === 'FAILED';
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-row">該当するアイテムはありません</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(item => `
      <tr>
        <td class="table-cell-path" title="${item.relative_path}">${item.relative_path}</td>
        <td>${this.formatBytes(item.file_size)}</td>
        <td><span class="badge-item-status status-${item.status}">${item.status}</span></td>
        <td class="table-cell-path" style="font-size:0.75rem; color:#94a3b8;">
          ${item.gdrive_file_id ? `ID: ${item.gdrive_file_id}` : (item.error_message ? `<span style="color:var(--accent-red)">${item.error_message}</span>` : '-')}
        </td>
      </tr>
    `).join('');
  }

  appendLog(log) {
    const terminal = document.getElementById('terminal-body');
    const line = document.createElement('div');
    const levelClass = `log-${(log.level || 'info').toLowerCase()}`;
    line.className = `log-line ${levelClass}`;
    line.innerHTML = `
      <span class="log-time">[${log.timestamp || '--:--:--'}]</span>
      <span class="log-msg">${log.message}</span>
    `;
    terminal.appendChild(line);

    if (this.autoScroll) {
      terminal.scrollTop = terminal.scrollHeight;
    }
  }
}

window.ui = new UIManager();
