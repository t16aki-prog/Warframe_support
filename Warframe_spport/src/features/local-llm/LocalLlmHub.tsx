import React from 'react';
import { Cpu, AlertCircle } from 'lucide-react';
import { useLocalLlm } from './hooks/useLocalLlm';
import { LlmStatusCard } from './components/LlmStatusCard';
import { LlmActionsPanel } from './components/LlmActionsPanel';
import { DraftReviewList } from './components/DraftReviewList';

export const LocalLlmHub: React.FC = () => {
  const { status, drafts, busy, error, ingest, suggestBuild, draftLatest, summarizePatch, review } = useLocalLlm();
  const ready = Boolean(status?.ollama?.running && status?.ollama?.chatModelReady);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={28} /> ローカルLLM「オーディス・ローカル」
        </h1>
        <p className="page-desc">
          PC内で動くOllamaと最新の公式データを連携し、ビルド提案・コンテンツ要約・下書き生成を行う安全なアシスタントです。
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, marginBottom: 16,
          background: 'rgba(255, 77, 77, 0.15)', border: '1px solid var(--color-danger)',
          color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 13
        }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <LlmStatusCard status={status} busy={busy} onIngest={ingest} />
      <LlmActionsPanel
        disabled={!ready}
        busy={busy}
        onBuild={suggestBuild}
        onDraft={draftLatest}
        onSummary={summarizePatch}
      />
      <DraftReviewList drafts={drafts} busy={busy} onReview={review} />
    </div>
  );
};
