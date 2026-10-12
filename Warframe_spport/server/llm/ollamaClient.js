// server/llm/ollamaClient.js
// ローカルの Ollama (127.0.0.1:11434) とだけ通信するクライアント

import { safeFetch } from './sourceAllowlist.js';
import { OLLAMA_BASE_URL, OLLAMA_DEFAULT_CHAT_MODEL, OLLAMA_EMBED_MODEL, OLLAMA_TIMEOUT_MS, getCurrentProfile } from './config.js';

export async function getOllamaStatus() {
  try {
    const text = await safeFetch(`${OLLAMA_BASE_URL}/api/tags`, { timeoutMs: 3000 });
    const models = (JSON.parse(text).models || []).map((m) => m.name);
    const profile = getCurrentProfile();
    const targetModel = profile.model || OLLAMA_DEFAULT_CHAT_MODEL;
    const has = (name) => models.includes(name) || models.includes(`${name}:latest`);
    return {
      running: true,
      models,
      chatModel: targetModel,
      activeProfile: profile,
      embedModel: OLLAMA_EMBED_MODEL,
      chatModelReady: has(targetModel) || has(OLLAMA_DEFAULT_CHAT_MODEL),
      embedModelReady: has(OLLAMA_EMBED_MODEL),
    };
  } catch {
    const profile = getCurrentProfile();
    return { running: false, models: [], chatModel: profile.model, activeProfile: profile, embedModel: OLLAMA_EMBED_MODEL, chatModelReady: false, embedModelReady: false };
  }
}

export async function ollamaChat(messages, { temperature, json = false, maxTokens } = {}) {
  const profile = getCurrentProfile();
  const status = await getOllamaStatus();
  // 指定されたプロファイルモデルがなければデフォルトの 7b を使用
  const modelToUse = status.models.includes(profile.model) ? profile.model : OLLAMA_DEFAULT_CHAT_MODEL;
  
  // チャットや高速応答向けにトークン上限を設けて思考・生成時間を短縮
  const numPredict = maxTokens ?? (profile.level === 1 ? 256 : profile.level === 2 ? 384 : profile.level === 3 ? 512 : 768);

  const body = {
    model: modelToUse,
    messages,
    stream: false,
    options: {
      temperature: temperature !== undefined ? temperature : (profile.level === 1 ? 0.4 : profile.level === 2 ? 0.35 : profile.level === 3 ? 0.25 : 0.2),
      num_ctx: profile.numCtx,
      num_predict: numPredict,
    },
    ...(json ? { format: 'json' } : {}),
  };
  const text = await safeFetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeoutMs: OLLAMA_TIMEOUT_MS,
  });
  return JSON.parse(text).message?.content ?? '';
}

export async function ollamaEmbed(input) {
  const text = await safeFetch(`${OLLAMA_BASE_URL}/api/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, input }),
    timeoutMs: OLLAMA_TIMEOUT_MS,
  });
  return JSON.parse(text).embeddings || [];
}
