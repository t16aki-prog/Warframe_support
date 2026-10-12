// server/llm/config.js
// ローカルLLM機能の設定値（固定値はここに集約）

export const OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
export const OLLAMA_CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || 'qwen2.5:7b';
export const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
export const OLLAMA_TIMEOUT_MS = 120_000;

// 外部データ取得元（この2つ以外の外部URLには接続しない）
export const WORLDSTATE_URL = 'https://api.warframestat.us/pc?language=ja';
export const PATCH_NOTES_RSS_URL = 'https://forums.warframe.com/forum/3-pc-update-notes.xml/';

// 取得頻度の下限（相手サーバーへの負荷配慮）
export const WORLDSTATE_MIN_INTERVAL_MS = 30 * 60 * 1000; // 30分
export const PATCH_NOTES_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6時間
export const FETCH_TIMEOUT_MS = 15_000;
export const MAX_RESPONSE_BYTES = 5 * 1024 * 1024;

// 公式文章は要約と出典のみ保持（本文の転載はしない）
export const PATCH_EXCERPT_MAX_CHARS = 1500;
export const MAX_PATCH_NOTES_KEPT = 15;

export const USER_AGENT = 'TennoNavi-LocalAssistant/1.0 (personal, non-commercial)';
