// server/llm/sourceAllowlist.js
// 許可リスト方式の安全な fetch。許可されたURL以外へは一切接続しない。

import {
  OLLAMA_BASE_URL, WORLDSTATE_URL, PATCH_NOTES_RSS_URL,
  FETCH_TIMEOUT_MS, MAX_RESPONSE_BYTES, USER_AGENT,
} from './config.js';

const ALLOWED_ORIGINS = new Set([
  new URL(OLLAMA_BASE_URL).origin,
  new URL(WORLDSTATE_URL).origin,
  new URL(PATCH_NOTES_RSS_URL).origin,
]);

export function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    if (!['http:', 'https:'].includes(u.protocol)) return false;
    // Ollama以外はHTTPS必須
    if (u.protocol === 'http:' && u.origin !== new URL(OLLAMA_BASE_URL).origin) return false;
    return ALLOWED_ORIGINS.has(u.origin);
  } catch {
    return false;
  }
}

/**
 * 許可リストを通過したURLにのみリクエストする。
 * リダイレクトは追わない（許可外への転送を防ぐ）。
 */
export async function safeFetch(url, options = {}) {
  if (!isAllowedUrl(url)) {
    throw new Error(`Blocked by allowlist: ${url}`);
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      redirect: 'error',
      signal: controller.signal,
      headers: { 'User-Agent': USER_AGENT, ...(options.headers || {}) },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} from ${new URL(url).origin}`);
    const len = Number(res.headers.get('content-length') || 0);
    if (len > MAX_RESPONSE_BYTES) throw new Error('Response too large');
    const text = await res.text();
    if (text.length > MAX_RESPONSE_BYTES) throw new Error('Response too large');
    return text;
  } finally {
    clearTimeout(timer);
  }
}
