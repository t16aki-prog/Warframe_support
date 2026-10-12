import React from 'react';
import { Cpu, CheckCircle2, XCircle, RefreshCw, Database } from 'lucide-react';
import type { LlmStatus } from '../types';
import { SETUP_STEPS } from '../constants';

interface Props {
  status: LlmStatus | null;
  busy: string | null;
  onIngest: (force: boolean) => void;
}

const fmt = (ms?: number) => (ms ? new Date(ms).toLocaleString('ja-JP') : '未取得');

const Flag: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: ok ? 'var(--color-success)' : 'var(--color-danger)' }}>
    {ok ? <CheckCircle2 size={15} /> : <XCircle size={15} />} {label}
  </div>
);

export const LlmStatusCard: React.FC<Props> = ({ status, busy, onIngest }) => {
  const o = status?.ollama;
  const k = status?.knowledge;
  const ready = Boolean(o?.running && o.chatModelReady);

  return (
    <div className="glass-card neon-teal" style={{ marginBottom: 20 }}>
      <div className="card-title"><Cpu size={18} className="card-title-icon" /> ローカルLLMの状態</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Flag ok={Boolean(o?.running)} label="Ollama 起動中" />
          <Flag ok={Boolean(o?.chatModelReady)} label={`文章モデル ${o?.chatModel ?? ''}`} />
          <Flag ok={Boolean(o?.embedModelReady)} label={`検索モデル ${o?.embedModel ?? ''}（任意）`} />
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-main)' }}><Database size={14} /> 知識ベース {k?.totalDocs ?? 0} 件</div>
          <div>環境情報 {k?.worldstateDocs ?? 0} / パッチノート {k?.patchNoteDocs ?? 0} / ビルド {k?.buildDocs ?? 0}</div>
          <div>環境情報の取得: {fmt(k?.lastFetched.worldstate)}</div>
          <div>パッチノートの取得: {fmt(k?.lastFetched.patchnotes)}</div>
        </div>
      </div>

      {!ready && (
        <ol style={{ marginTop: 16, paddingLeft: 20, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          {SETUP_STEPS.map((s) => (
            <li key={s.label}>{s.label}: <code style={{ color: 'var(--color-teal)' }}>{s.detail}</code></li>
          ))}
        </ol>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
        <button id="llm-ingest-btn" className="btn-primary" disabled={busy !== null} onClick={() => onIngest(false)}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <RefreshCw size={14} className={busy === 'ingest' ? 'spin' : ''} /> データを更新
        </button>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center' }}>
          ※ 公式サーバー負荷に配慮し、環境情報は30分・パッチノートは6時間より短い間隔では再取得しません
        </span>
      </div>
    </div>
  );
};
