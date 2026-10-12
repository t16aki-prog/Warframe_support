// server/llm/ollamaClient.js
// ローカルの Ollama (127.0.0.1:11434) とだけ通信するクライアント

import { safeFetch } from './sourceAllowlist.js';
import { OLLAMA_BASE_URL, OLLAMA_CHAT_MODEL, OLLAMA_EMBED_MODEL, OLLAMA_TIMEOUT_MS } from './config.js';

export async function getOllamaStatus() {
  try {
    const text = await safeFetch(`${OLLAMA_BASE_URL}/api/tags`, { timeoutMs: 3000 });
    const models = (JSON.parse(text).models || []).map((m) => m.name);
    const has = (name) => models.includes(name) || models.includes(`${name}:latest`);
    return {
      running: true,
      models,
      chatModel: OLLAMA_CHAT_MODEL,
      embedModel: OLLAMA_EMBED_MODEL,
      chatModelReady: has(OLLAMA_CHAT_MODEL),
      embedModelReady: has(OLLAMA_EMBED_MODEL),
    };
  } catch {
    return { running: false, models: [], chatModel: OLLAMA_CHAT_MODEL, embedModel: OLLAMA_EMBED_MODEL, chatModelReady: false, embedModelReady: false };
  }
}

export async function ollamaChat(messages, { temperature = 0.4, json = false } = {}) {
  const body = {
    model: OLLAMA_CHAT_MODEL,
    messages,
    stream: false,
    options: { temperature, num_ctx: 8192 },
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
