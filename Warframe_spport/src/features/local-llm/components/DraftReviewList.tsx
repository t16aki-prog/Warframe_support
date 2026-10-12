import React, { useState } from 'react';
import { Check, X, AlertTriangle } from 'lucide-react';
import type { Draft, DraftStatus } from '../types';
import { DRAFT_KIND_LABELS } from '../constants';

interface Props {
  drafts: Draft[];
  busy: string | null;
  onReview: (id: string, decision: Exclude<DraftStatus, 'pending'>) => void;
}

const FILTERS: { id: DraftStatus; label: string }[] = [
  { id: 'pending', label: '未確認' },
  { id: 'approved', label: '承認済み' },
  { id: 'rejected', label: '却下' },
];

const isSafeLink = (url?: string) => Boolean(url && /^https:\/\/(forums\.warframe\.com|api\.warframestat\.us)\//.test(url));

export const DraftReviewList: React.FC<Props> = ({ drafts, busy, onReview }) => {
  const [filter, setFilter] = useState<DraftStatus>('pending');
  const shown = drafts.filter((d) => d.status === filter);

  return (
    <div className="glass-card">
      <div className="card-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <span>生成物の確認</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`nav-item ${filter === f.id ? 'active' : ''}`} style={{ padding: '4px 10px', fontSize: 12 }}>
              {f.label} ({drafts.filter((d) => d.status === f.id).length})
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>該当する生成物はありません。</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {shown.map((d) => (
          <article key={d.id} style={{ border: '1px solid var(--border-light)', borderRadius: 12, padding: 14, background: 'rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <strong style={{ fontSize: 14 }}>{d.title}</strong>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{DRAFT_KIND_LABELS[d.kind]} ・ {new Date(d.createdAt).toLocaleString('ja-JP')} ・ {d.model}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--color-gold)', marginBottom: 8 }}>
              <AlertTriangle size={12} /> AI生成・内容未確認。数値や仕様は公式情報で必ず確認してください。
            </div>
            {/* 生成テキストはHTMLとして解釈せずプレーンテキストで表示（XSS対策） */}
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.7, maxHeight: 320, overflowY: 'auto' }}>{d.body}</div>
            {d.sources.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                出典: {d.sources.map((s, i) => (
                  <span key={i}>
                    [{i + 1}] {isSafeLink(s.url) ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-teal)' }}>{s.title}</a> : s.title}{' '}
                  </span>
                ))}
              </div>
            )}
            {d.status === 'pending' && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button className="btn-primary" disabled={busy !== null} onClick={() => onReview(d.id, 'approved')} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={14} /> 承認</button>
                <button className="nav-item" disabled={busy !== null} onClick={() => onReview(d.id, 'rejected')} style={{ padding: '6px 12px' }}><X size={14} /> 却下</button>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
};
