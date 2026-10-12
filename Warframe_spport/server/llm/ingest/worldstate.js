// server/llm/ingest/worldstate.js
// api.warframestat.us（公開API）から現在の環境情報を取り込む

import { safeFetch } from '../sourceAllowlist.js';
import { WORLDSTATE_URL, WORLDSTATE_MIN_INTERVAL_MS } from '../config.js';
import { loadKnowledge, replaceSourceDocs } from '../knowledgeStore.js';

const doc = (id, title, text) => ({
  id: `ws:${id}`, source: 'worldstate', title, text,
  url: 'https://api.warframestat.us/', fetchedAt: new Date().toISOString(),
});

function toDocs(ws) {
  const docs = [];
  for (const n of (ws.news || []).slice(0, 15)) {
    docs.push(doc(`news:${n.id}`, `ニュース: ${n.message}`, `${n.message}（${n.date ?? ''}）`));
  }
  for (const e of ws.events || []) {
    docs.push(doc(`event:${e.id}`, `イベント: ${e.description}`, `${e.description} ${e.tooltip ?? ''} 終了: ${e.expiry ?? '不明'}`));
  }
  if (ws.sortie?.missions) {
    const m = ws.sortie.missions.map((x) => `${x.missionType}(${x.modifier})@${x.node}`).join(' / ');
    docs.push(doc('sortie', `ソーティ: ${ws.sortie.boss ?? ''}`, `勢力 ${ws.sortie.faction ?? ''}。${m}`));
  }
  if (ws.archonHunt?.missions) {
    const m = ws.archonHunt.missions.map((x) => `${x.type}@${x.node}`).join(' / ');
    docs.push(doc('archon', `アルコン討伐: ${ws.archonHunt.boss ?? ''}`, m));
  }
  if (ws.steelPath?.currentReward) {
    docs.push(doc('steelpath', '鋼の道 ティシュナ報酬', `今週: ${ws.steelPath.currentReward.name}`));
  }
  if (ws.nightwave?.activeChallenges) {
    const c = ws.nightwave.activeChallenges.map((x) => x.title).join(' / ');
    docs.push(doc('nightwave', 'ナイトウェーブ課題', c));
  }
  if (ws.voidTrader) {
    const inv = (ws.voidTrader.inventory || []).map((i) => i.item).join(', ');
    docs.push(doc('baro', 'バロ・キテール', `${ws.voidTrader.active ? '滞在中' : '不在'} @${ws.voidTrader.location ?? ''} ${inv}`));
  }
  return docs;
}

export async function ingestWorldstate({ force = false } = {}) {
  const last = loadKnowledge().lastFetched.worldstate || 0;
  if (!force && Date.now() - last < WORLDSTATE_MIN_INTERVAL_MS) {
    return { skipped: true, reason: 'interval', nextAllowedAt: last + WORLDSTATE_MIN_INTERVAL_MS };
  }
  const ws = JSON.parse(await safeFetch(WORLDSTATE_URL));
  const docs = toDocs(ws);
  replaceSourceDocs('worldstate', docs);
  return { skipped: false, count: docs.length };
}
