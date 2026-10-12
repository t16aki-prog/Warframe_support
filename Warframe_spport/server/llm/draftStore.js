// server/llm/draftStore.js
// LLMが作った下書きの保存。承認されたものだけが「最新コンテンツ」に反映される。

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ensureDataDir } from './knowledgeStore.js';

const draftsFile = () => path.join(ensureDataDir(), 'drafts.json');

/** @typedef {{ id: string, kind: 'latest-content'|'patch-summary'|'build', title: string, body: string, sources: {title:string,url?:string}[], status: 'pending'|'approved'|'rejected', createdAt: string, reviewedAt?: string, model: string }} Draft */

function load() {
  try { return JSON.parse(fs.readFileSync(draftsFile(), 'utf8')); } catch { return []; }
}
function save(drafts) {
  fs.writeFileSync(draftsFile(), JSON.stringify(drafts, null, 2));
}

export function listDrafts(status) {
  const all = load();
  return status ? all.filter((d) => d.status === status) : all;
}

export function addDraft({ kind, title, body, sources, model }) {
  const drafts = load();
  const draft = {
    id: crypto.randomUUID(),
    kind, title, body, sources, model,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  drafts.unshift(draft);
  save(drafts.slice(0, 100));
  return draft;
}

export function reviewDraft(id, decision) {
  if (!['approved', 'rejected'].includes(decision)) throw new Error('Invalid decision');
  const drafts = load();
  const d = drafts.find((x) => x.id === id);
  if (!d) return null;
  d.status = decision;
  d.reviewedAt = new Date().toISOString();
  save(drafts);
  return d;
}
