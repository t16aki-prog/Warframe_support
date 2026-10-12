import React, { useState } from 'react';
import { Wand2, Sparkles, FileText } from 'lucide-react';

interface Props {
  disabled: boolean;
  busy: string | null;
  onBuild: (item: string, goal: string) => void;
  onDraft: (topic: string) => void;
  onSummary: () => void;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 8, fontSize: 13,
  background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-light)', color: 'var(--text-main)',
};

export const LlmActionsPanel: React.FC<Props> = ({ disabled, busy, onBuild, onDraft, onSummary }) => {
  const [item, setItem] = useState('');
  const [goal, setGoal] = useState('');
  const [topic, setTopic] = useState('');
  const off = disabled || busy !== null;
  const label = (key: string, text: string) => (busy === key ? '生成中…（数十秒かかります）' : text);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
      <div className="glass-card">
        <div className="card-title"><Wand2 size={18} className="card-title-icon" /> 最新環境のビルド提案</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input id="llm-build-item" style={inputStyle} placeholder="例: Narin, Volt Prime" value={item} maxLength={100} onChange={(e) => setItem(e.target.value)} />
          <input id="llm-build-goal" style={inputStyle} placeholder="目的（任意）例: 鋼の道 耐久" value={goal} maxLength={200} onChange={(e) => setGoal(e.target.value)} />
          <button id="llm-build-btn" className="btn-primary" disabled={off || !item.trim()} onClick={() => onBuild(item, goal)}>{label('build', 'ビルドを提案')}</button>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-title"><Sparkles size={18} className="card-title-icon" /> 最新コンテンツの下書き</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input id="llm-draft-topic" style={inputStyle} placeholder="テーマ（任意）例: 新イベント" value={topic} maxLength={200} onChange={(e) => setTopic(e.target.value)} />
          <button id="llm-draft-btn" className="btn-primary" disabled={off} onClick={() => onDraft(topic)}>{label('draft', '下書きを作成')}</button>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>承認するまでアプリには反映されません</span>
        </div>
      </div>

      <div className="glass-card">
        <div className="card-title"><FileText size={18} className="card-title-icon" /> パッチノート要約</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>取得済みの最新パッチノートを要約します。</p>
        <button id="llm-summary-btn" className="btn-primary" disabled={off} onClick={onSummary}>{label('summary', '最新パッチを要約')}</button>
      </div>
    </div>
  );
};
