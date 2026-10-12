// server/llm/retriever.js
// 知識ベースから質問に関係する文書を探す。
// 埋め込み（nomic-embed-text）が使えればベクトル検索、なければキーワード検索。

import { loadKnowledge, saveKnowledge } from './knowledgeStore.js';
import { ollamaEmbed } from './ollamaClient.js';

function tokenize(s) {
  const lower = (s || '').toLowerCase();
  const words = lower.match(/[a-z0-9]+/g) || [];
  // 日本語は2文字ずつのN-gramで近似
  const ja = lower.replace(/[a-z0-9\s]/g, '');
  const grams = [];
  for (let i = 0; i < ja.length - 1; i++) grams.push(ja.slice(i, i + 2));
  return [...words, ...grams];
}

function keywordScore(query, doc) {
  const q = new Set(tokenize(query));
  if (q.size === 0) return 0;
  const d = tokenize(`${doc.title} ${doc.title} ${doc.text}`);
  let hit = 0;
  for (const t of d) if (q.has(t)) hit++;
  return hit / Math.sqrt(d.length + 1);
}

function cosine(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] ** 2; nb += b[i] ** 2; }
  return dot / (Math.sqrt(na * nb) || 1);
}

/** まだ埋め込みのない文書をまとめてベクトル化する（失敗しても検索はキーワードで継続） */
export async function embedMissingDocs() {
  const store = loadKnowledge();
  const targets = store.docs.filter((d) => !Array.isArray(d.embedding));
  if (targets.length === 0) return { embedded: 0 };
  const vectors = await ollamaEmbed(targets.map((d) => `${d.title}\n${d.text}`.slice(0, 2000)));
  targets.forEach((d, i) => { if (vectors[i]) d.embedding = vectors[i]; });
  saveKnowledge(store);
  return { embedded: targets.length };
}

export async function retrieve(query, { topK = 6, sources } = {}) {
  const { docs } = loadKnowledge();
  const pool = sources ? docs.filter((d) => sources.includes(d.source)) : docs;
  let qVec = null;
  if (pool.some((d) => d.embedding)) {
    try { [qVec] = await ollamaEmbed([query]); } catch { qVec = null; }
  }
  return pool
    .map((d) => ({
      doc: d,
      score: qVec && d.embedding ? cosine(qVec, d.embedding) : keywordScore(query, d),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.doc);
}
