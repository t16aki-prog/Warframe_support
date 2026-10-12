// server/llm/knowledgeStore.js
// ローカル知識ベース（JSONファイル）の保存・読み込み

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, '../../data/llm');
const KNOWLEDGE_FILE = path.join(DATA_DIR, 'knowledge.json');

/** @typedef {{ id: string, source: 'worldstate'|'patchnotes'|'builds', title: string, text: string, url?: string, publishedAt?: string, fetchedAt: string, embedding?: number[] }} KnowledgeDoc */

function emptyStore() {
  return { docs: [], lastFetched: { worldstate: 0, patchnotes: 0 } };
}

export function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  return DATA_DIR;
}

export function loadKnowledge() {
  try {
    return { ...emptyStore(), ...JSON.parse(fs.readFileSync(KNOWLEDGE_FILE, 'utf8')) };
  } catch {
    return emptyStore();
  }
}

export function saveKnowledge(store) {
  ensureDataDir();
  const tmp = `${KNOWLEDGE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(store));
  fs.renameSync(tmp, KNOWLEDGE_FILE);
}

/** 同じ source のドキュメントを丸ごと差し替える */
export function replaceSourceDocs(source, docs) {
  const store = loadKnowledge();
  store.docs = [...store.docs.filter((d) => d.source !== source), ...docs];
  store.lastFetched[source] = Date.now();
  saveKnowledge(store);
  return store;
}

export function getKnowledgeSummary() {
  const store = loadKnowledge();
  const count = (s) => store.docs.filter((d) => d.source === s).length;
  return {
    totalDocs: store.docs.length,
    worldstateDocs: count('worldstate'),
    patchNoteDocs: count('patchnotes'),
    buildDocs: count('builds'),
    embedded: store.docs.filter((d) => Array.isArray(d.embedding)).length,
    lastFetched: store.lastFetched,
  };
}
