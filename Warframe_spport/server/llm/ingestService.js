// server/llm/ingestService.js
// 取り込み処理の一括実行と定期実行

import { ingestWorldstate } from './ingest/worldstate.js';
import { ingestPatchNotes } from './ingest/patchNotes.js';
import { ingestLocalBuilds } from './ingest/builds.js';
import { embedMissingDocs } from './retriever.js';
import { getOllamaStatus } from './ollamaClient.js';

let running = false;

export async function runIngest({ force = false } = {}) {
  if (running) return { busy: true };
  running = true;
  const result = {};
  try {
    for (const [name, fn] of [['worldstate', ingestWorldstate], ['patchnotes', ingestPatchNotes]]) {
      try { result[name] = await fn({ force }); } catch (e) { result[name] = { error: e.message }; }
    }
    result.builds = ingestLocalBuilds();
    const status = await getOllamaStatus();
    if (status.embedModelReady) {
      try { result.embedding = await embedMissingDocs(); } catch (e) { result.embedding = { error: e.message }; }
    } else {
      result.embedding = { skipped: true, reason: 'embed model not available' };
    }
    return result;
  } finally {
    running = false;
  }
}

/** 起動時に1回、その後1時間ごと（各ソースの最短間隔は ingest 側で別途守られる） */
export function startIngestScheduler() {
  const tick = () => runIngest().catch((e) => console.error('[llm] ingest failed:', e.message));
  setTimeout(tick, 10_000);
  return setInterval(tick, 60 * 60 * 1000);
}
