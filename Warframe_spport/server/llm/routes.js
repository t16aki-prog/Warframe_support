// server/llm/routes.js
// /api/llm/* の Express ルーター

import { Router } from 'express';
import { getOllamaStatus } from './ollamaClient.js';
import { getKnowledgeSummary } from './knowledgeStore.js';
import { listDrafts, reviewDraft } from './draftStore.js';
import { runIngest } from './ingestService.js';
import { suggestBuild, draftLatestContent, summarizeLatestPatch } from './tasks.js';

const router = Router();

// サーバーは 0.0.0.0 で待ち受けているため、LLM機能はこのPC自身からのアクセスに限定する
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
router.use((req, res, next) => {
  if (LOOPBACK.has(req.socket.remoteAddress)) return next();
  res.status(403).json({ error: 'ローカルLLM機能はこのPCからのみ利用できます。' });
});

// 生成系は重いので同時実行を1つに制限
let generating = false;
const exclusive = (fn) => async (req, res) => {
  if (generating) return res.status(429).json({ error: '別の生成処理を実行中です。少し待ってから再試行してください。' });
  const status = await getOllamaStatus();
  if (!status.running || !status.chatModelReady) {
    return res.status(503).json({ error: `Ollama または ${status.chatModel} が利用できません。`, status });
  }
  generating = true;
  try {
    res.json(await fn(req));
  } catch (e) {
    res.status(500).json({ error: e.message });
  } finally {
    generating = false;
  }
};

router.get('/status', async (_req, res) => {
  res.json({ ollama: await getOllamaStatus(), knowledge: getKnowledgeSummary(), generating });
});

router.post('/ingest', async (req, res) => {
  res.json(await runIngest({ force: Boolean(req.body?.force) }));
});

router.post('/build', exclusive((req) => suggestBuild(req.body?.itemName, req.body?.goal)));
router.post('/drafts/latest-content', exclusive((req) => draftLatestContent(req.body?.topic)));
router.post('/drafts/patch-summary', exclusive(() => summarizeLatestPatch()));

router.get('/drafts', (req, res) => {
  const status = ['pending', 'approved', 'rejected'].includes(req.query.status) ? req.query.status : undefined;
  res.json({ drafts: listDrafts(status) });
});

router.post('/drafts/:id/review', (req, res) => {
  try {
    const d = reviewDraft(req.params.id, req.body?.decision);
    if (!d) return res.status(404).json({ error: 'Draft not found' });
    res.json({ draft: d });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
