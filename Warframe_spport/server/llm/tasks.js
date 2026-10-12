import { ollamaChat } from './ollamaClient.js';
import { retrieve } from './retriever.js';
import { addDraft } from './draftStore.js';
import { loadKnowledge } from './knowledgeStore.js';
import { getCurrentProfile } from './config.js';
import { SYSTEM_BUILD, SYSTEM_DRAFT, SYSTEM_SUMMARY, SYSTEM_CHAT, formatContext, userPrompt } from './prompts.js';

const MAX_INPUT = 500;
const clean = (s) => String(s ?? '').slice(0, MAX_INPUT).trim();
const toSources = (docs) => docs.map((d) => ({ title: d.title, url: d.url }));

async function run(system, task, docs, opts) {
  return ollamaChat(
    [{ role: 'system', content: system }, { role: 'user', content: userPrompt(task, formatContext(docs)) }],
    opts,
  );
}

/** 1. 最新環境を踏まえたビルド提案（下書きとして保存） */
export async function suggestBuild(itemName, goal = '') {
  const profile = getCurrentProfile();
  const item = clean(itemName);
  if (!item) throw new Error('itemName is required');
  const docs = await retrieve(`${item} ${clean(goal)} ビルド MOD`, { topK: profile.topK });
  const body = await run(SYSTEM_BUILD, `「${item}」のビルドを提案してください。目的: ${clean(goal) || '汎用'}`, docs);
  const draft = addDraft({ kind: 'build', title: `${item} ビルド案`, body, sources: toSources(docs), model: profile.model });
  return draft;
}

/** 2. 最新コンテンツタブの下書き（承認されるまで反映しない） */
export async function draftLatestContent(topic = '') {
  const profile = getCurrentProfile();
  const q = clean(topic) || '最新アップデート 新コンテンツ イベント';
  const docs = await retrieve(q, { topK: profile.topK, sources: ['patchnotes', 'worldstate'] });
  const body = await run(SYSTEM_DRAFT, `次のテーマで最新コンテンツ紹介の下書きを作ってください: ${q}`, docs);
  return addDraft({ kind: 'latest-content', title: `最新コンテンツ下書き: ${q}`, body, sources: toSources(docs), model: profile.model });
}

/** 3. 直近のパッチノート要約 */
export async function summarizeLatestPatch() {
  const notes = loadKnowledge().docs.filter((d) => d.source === 'patchnotes');
  if (notes.length === 0) throw new Error('パッチノートが未取得です。先にデータ更新を実行してください。');
  const latest = notes[0];
  const body = await run(SYSTEM_SUMMARY, `「${latest.title}」を要約してください。`, [latest], { temperature: 0.2 });
  return addDraft({ kind: 'patch-summary', title: `要約: ${latest.title}`, body, sources: toSources([latest]), model: OLLAMA_CHAT_MODEL });
}

import { getQuickAnswer } from './quickFacts.js';

/** 4. セファロンAIチャット（RAG付き） */
export async function chatWithContext(message, history = []) {
  const msg = clean(message);

  // 1. 高速まとめ・事前キャッシュによる即答チェック（思考時間 0ms）
  const quick = getQuickAnswer(msg);
  if (quick) {
    return quick;
  }

  const profile = getCurrentProfile();
  // チャット質問時はレベル1では topK=3 に絞って検索＆プロンプト長を大幅圧縮
  const searchK = profile.level === 1 ? 3 : profile.topK;
  const docs = await retrieve(msg, { topK: searchK });
  const past = (Array.isArray(history) ? history : []).slice(-4).map((h) => ({
    role: h.role === 'user' ? 'user' : 'assistant',
    content: String(h.content ?? '').slice(0, 1000),
  }));
  return ollamaChat([
    { role: 'system', content: SYSTEM_CHAT },
    ...past,
    { role: 'user', content: userPrompt(msg, formatContext(docs)) },
  ]);
}
