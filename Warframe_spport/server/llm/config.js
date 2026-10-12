// server/llm/config.js
// ローカルLLM機能の設定値（固定値はここに集約）

export const OLLAMA_BASE_URL = 'http://127.0.0.1:11434';
export const OLLAMA_DEFAULT_CHAT_MODEL = 'qwen2.5:7b';
export const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
export const OLLAMA_TIMEOUT_MS = 120_000;

/**
 * LLMの強さ（4段階）
 * level 1: 最低（現在・標準）- qwen2.5:7b (num_ctx: 4096, topK: 5, temp: 0.4) 高速・低負荷
 * level 2: 中量 - qwen2.5:7b (num_ctx: 8192, topK: 8, temp: 0.3) より深い文脈・厳密
 * level 3: 高度 - qwen2.5:7b (num_ctx: 16384, topK: 12, temp: 0.2) 最大文脈・高精度RAG
 * level 4: 最高 - qwen2.5:14b / 32b 等の大型モデル、または 7B 最高密度探索 (num_ctx: 32768, topK: 15)
 */
export const LLM_PROFILES = {
  1: { level: 1, name: '軽量・標準 (レベル1)', desc: '現在の標準設定。高速レスポンス・VRAM低負荷', numCtx: 4096, topK: 5, model: 'qwen2.5:7b' },
  2: { level: 2, name: '中量・安定 (レベル2)', desc: '文脈理解を2倍に拡張。安定したビルド分析', numCtx: 8192, topK: 8, model: 'qwen2.5:7b' },
  3: { level: 3, name: '高度・精緻 (レベル3)', desc: '参照情報と文脈を大幅強化。深い考察・正確性重視', numCtx: 16384, topK: 12, model: 'qwen2.5:7b' },
  4: { level: 4, name: '最高・極大 (レベル4)', desc: '最大探索深度。入手可能な最強モデル・最大コンテキスト', numCtx: 32768, topK: 15, model: 'qwen2.5:14b' },
};

let currentProfileLevel = 1;
export function setProfileLevel(level) {
  const num = Number(level);
  if (LLM_PROFILES[num]) {
    currentProfileLevel = num;
  }
}
export function getProfileLevel() {
  return currentProfileLevel;
}
export function getCurrentProfile() {
  return LLM_PROFILES[currentProfileLevel] || LLM_PROFILES[1];
}

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
