// server/llm/quickFacts.js
// 頻出の問い合わせに対して即座に（0秒〜0.1秒）回答するための
// 最新ゲーム環境まとめ・ナレッジキャッシュエンジン。

import { loadKnowledge } from './knowledgeStore.js';

/**
 * 現在の知識ベース（worldstate, patchnotes, builds）から
 * 重要情報をまとめたナレッジサマリーを作成する
 */
export function buildQuickKnowledgeSummary() {
  const { docs } = loadKnowledge();
  
  // 1. 最新パッチノート
  const patches = docs.filter(d => d.source === 'patchnotes');
  const latestPatch = patches[0] || null;

  // 2. 世界情勢（ソーティ、アルコン、バロ、鋼、イベント）
  const sortie = docs.find(d => d.id === 'ws:sortie');
  const archon = docs.find(d => d.id === 'ws:archon');
  const baro = docs.find(d => d.id === 'ws:baro');
  const steelpath = docs.find(d => d.id === 'ws:steelpath');
  const events = docs.filter(d => d.id.startsWith('ws:event:')).slice(0, 3);
  const news = docs.filter(d => d.id.startsWith('ws:news:')).slice(0, 3);

  return {
    latestPatch: latestPatch ? { title: latestPatch.title, excerpt: latestPatch.text.slice(0, 200), url: latestPatch.url } : null,
    sortie: sortie ? sortie.text : null,
    archon: archon ? archon.text : null,
    baro: baro ? baro.text : null,
    steelpath: steelpath ? steelpath.text : null,
    events: events.map(e => e.title),
    news: news.map(n => n.title),
    hasNarinUpdate: docs.some(d => d.title.includes('Narin') || d.title.includes('Iceblade'))
  };
}

/**
 * 質問内容を高速判定し、LLM推論を待たずに即答できる定型・要約マッチング
 * @param {string} rawMessage 
 * @returns {string | null} 即答テキスト、該当なしなら null
 */
export function getQuickAnswer(rawMessage) {
  const msg = (rawMessage || '').trim().toLowerCase();
  if (!msg) return null;

  // 1. 挨拶・呼びかけ
  const greetings = ['こんにちは', 'こんにちわ', 'おはよう', 'こんばんは', 'やあ', 'ハロー', 'hello', 'hi', 'オーディス', 'ordis'];
  if (greetings.some(g => msg === g || msg === `${g}！` || msg === `${g}ー` || msg === `${g}〜`)) {
    return 'テンノ！オーディスはいつでも待機しております。――**早く敵の血を浴びに行きましょう！**――コホン。最新の状況確認やビルドの相談など、何でもお申し付けください！';
  }

  const summary = buildQuickKnowledgeSummary();

  // 2. 最新アップデート・パッチノート
  if (msg.includes('最新パッチ') || msg.includes('パッチノート') || msg.includes('アップデート') || msg.includes('最新アプデ') || msg.includes('更新内容')) {
    if (summary.latestPatch) {
      return `オペレーター、最新のパッチノート情報を確認しました！\n\n【最新更新】${summary.latestPatch.title}\n${summary.latestPatch.excerpt}\n\n公式フォーラムURL: ${summary.latestPatch.url || 'https://forums.warframe.com/'}\n――**バグも敵もまとめて消滅させます！**――詳細は左メニューの各機能やアーカイブでも確認できますよ。`;
    }
    return 'オペレーター、現在取得済みのパッチノートがありません。「ローカルLLMハブ」から最新データの取り込みを実行してください。';
  }

  // 3. 今日のソーティ・アルコン討伐
  if (msg.includes('ソーティ') || msg.includes('sortie')) {
    if (summary.sortie) {
      return `オペレーター、本日のソーティ状況です！\n${summary.sortie}\n――**ボスどもの首級を揃えて差し上げます！**――準備を整えて出撃してください！`;
    }
  }

  if (msg.includes('アルコン') || msg.includes('archon')) {
    if (summary.archon) {
      return `オペレーター、今週のアルコン討伐ミッションです！\n${summary.archon}\nシャードの回収をお忘れなく！`;
    }
  }

  // 4. バロ・キテール（Void商人）
  if (msg.includes('バロ') || msg.includes('baro') || msg.includes('キテール') || msg.includes('商人')) {
    if (summary.baro) {
      return `Void商人バロ・キテールの動向です：\n${summary.baro}\nデュカットとクレジットの準備はよろしいですか、オペレーター？`;
    }
  }

  // 5. 鋼の道・今週の報酬
  if (msg.includes('鋼の道') || msg.includes('ティシュナ') || msg.includes('steel path') || msg.includes('steelpath')) {
    if (summary.steelpath) {
      return `オペレーター、鋼の道の特別情報です：\n${summary.steelpath}\n万全のMOD構成で挑んでください！`;
    }
  }

  // 6. 今の状況 / 最新情報全般
  if (msg === '今の状況' || msg === '最新情報' || msg === '状況教えて' || msg === '今何がある' || msg === '近況') {
    const lines = ['オペレーター、現在の主要情報サマリーです！'];
    if (summary.latestPatch) lines.push(`・最新パッチ: ${summary.latestPatch.title}`);
    if (summary.sortie) lines.push(`・ソーティ: ${summary.sortie}`);
    if (summary.baro) lines.push(`・バロ・キテール: ${summary.baro}`);
    if (summary.events.length > 0) lines.push(`・アクティブイベント: ${summary.events.join(' / ')}`);
    lines.push('――**いつでも出撃の合図をお待ちしております！**――');
    return lines.join('\n');
  }

  return null;
}
