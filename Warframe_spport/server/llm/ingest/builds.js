// server/llm/ingest/builds.js
// アプリ内の既存ビルドデータ（staticBuilds.js）を知識ベースに登録する（外部通信なし）

import { staticBuilds } from '../../../staticBuilds.js';
import { replaceSourceDocs } from '../knowledgeStore.js';

export function ingestLocalBuilds() {
  const docs = [];
  for (const [key, b] of Object.entries(staticBuilds.frames || {})) {
    const p = b.popularBuild || {};
    const parts = [
      p.playstyle,
      p.aura ? `オーラ: ${p.aura}` : '',
      p.exilus ? `エクシラス: ${p.exilus}` : '',
      p.mods ? `MOD: ${p.mods.join(', ')}` : '',
      p.arcanes ? `アルケイン: ${p.arcanes.join(', ')}` : '',
      b.augments ? `オーグメント: ${b.augments.map((a) => `${a.name}（${a.effect}）`).join(' / ')}` : '',
    ].filter(Boolean);
    docs.push({
      id: `build:${key}`,
      source: 'builds',
      title: `既存ビルド: ${b.itemName || key}`,
      text: parts.join('\n').slice(0, 2000),
      fetchedAt: new Date().toISOString(),
    });
  }
  replaceSourceDocs('builds', docs);
  return { count: docs.length };
}
