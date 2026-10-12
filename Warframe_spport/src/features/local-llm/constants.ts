import type { DraftKind } from './types';

export const LLM_API = '/api/llm';

export const DRAFT_KIND_LABELS: Record<DraftKind, string> = {
  'latest-content': '最新コンテンツ下書き',
  'patch-summary': 'パッチノート要約',
  build: 'ビルド提案',
};

export const SETUP_STEPS = [
  { label: 'Ollama をインストール', detail: 'https://ollama.com/download/windows' },
  { label: '文章生成モデルを取得', detail: 'ollama pull qwen2.5:7b' },
  { label: '検索用モデルを取得', detail: 'ollama pull nomic-embed-text' },
];

export const STATUS_POLL_MS = 15_000;
