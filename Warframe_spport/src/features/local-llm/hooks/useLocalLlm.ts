import { useCallback, useEffect, useState } from 'react';
import { LLM_API, STATUS_POLL_MS } from '../constants';
import type { Draft, DraftStatus, LlmStatus } from '../types';

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${LLM_API}${path}`, body === undefined ? undefined : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data as T;
}

export function useLocalLlm() {
  const [status, setStatus] = useState<LlmStatus | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [s, d] = await Promise.all([
        api<LlmStatus>('/status'),
        api<{ drafts: Draft[] }>('/drafts'),
      ]);
      setStatus(s);
      setDrafts(d.drafts);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, STATUS_POLL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  const runAction = useCallback(async (key: string, path: string, body: unknown = {}) => {
    setBusy(key);
    setError(null);
    try {
      await api(path, body);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }, [refresh]);

  return {
    status, drafts, busy, error, refresh,
    ingest: (force: boolean) => runAction('ingest', '/ingest', { force }),
    suggestBuild: (itemName: string, goal: string) => runAction('build', '/build', { itemName, goal }),
    draftLatest: (topic: string) => runAction('draft', '/drafts/latest-content', { topic }),
    summarizePatch: () => runAction('summary', '/drafts/patch-summary'),
    review: (id: string, decision: Exclude<DraftStatus, 'pending'>) =>
      runAction(`review:${id}`, `/drafts/${encodeURIComponent(id)}/review`, { decision }),
  };
}
