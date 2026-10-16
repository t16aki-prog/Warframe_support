// server/llm/groundingService.js
// ゼロ・ハルシネーションのための確定事実抽出・注入サービス
// 1ファイル150〜200行以下の原則を遵守

import { resolveAlias } from '../../aliases.js';
import { searchRelics, searchWarframeParts, getVaultedPrimes, findRelicsForItem } from '../../warframeData.js';
import { staticResources } from '../../staticResources.js';
import { getOfflineBuild } from '../../staticBuilds.js';

const RELIC_REGEX = /\b(Lith|Meso|Neo|Axi|リソ|メソ|ネオ|アクシ)\s*([A-Za-z0-9]+)\b/i;
const NEGATIVE_REGEX = /(使わずに|持っていない|なしで|除外して|以外で|持ってない)/;

/**
 * ユーザー入力から対象エンティティを最大3件抽出
 */
export function extractEntities(userMessage) {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();
  const entities = [];

  // 1. レリックパターンの抽出
  const relicMatch = text.match(RELIC_REGEX);
  if (relicMatch) {
    let tier = relicMatch[1];
    if (tier === 'リソ') tier = 'Lith';
    else if (tier === 'メソ') tier = 'Meso';
    else if (tier === 'ネオ') tier = 'Neo';
    else if (tier === 'アクシ') tier = 'Axi';
    entities.push({ name: `${tier} ${relicMatch[2].toUpperCase()}`, type: 'relic' });
  }

  // 2. 素材パターンの抽出
  for (const res of staticResources) {
    if (entities.length >= 3) break;
    if (text.includes(res.name)) {
      entities.push({ name: res.name, type: 'resource', data: res });
    }
  }

  // 3. Warframe / 装備の表記揺れ抽出
  const resolved = resolveAlias(text);
  if (resolved && resolved !== text && !entities.some(e => e.name === resolved)) {
    if (entities.length < 3) {
      entities.push({ name: resolved, type: 'item' });
    }
  }

  return entities.slice(0, 3);
}

/**
 * ユーザー発話が特定エンティティを否定・除外しているか判定
 */
export function isNegativeQuery(userMessage, entityName) {
  if (!NEGATIVE_REGEX.test(userMessage)) return false;
  const lowerMsg = userMessage.toLowerCase();
  return lowerMsg.includes(entityName.toLowerCase());
}

/**
 * 確定事実コンテキスト（<ground_truth>）とアクションチップを構築
 */
export function buildGroundingContext(userMessage) {
  const entities = extractEntities(userMessage);
  const actionChips = [];
  const truthBlocks = [];

  for (const entity of entities) {
    // 否定文の場合は除外通知のみ付与
    if (isNegativeQuery(userMessage, entity.name)) {
      truthBlocks.push(`[除外指定]: ユーザーは「${entity.name}」を使用しない方針です。代替候補を提案してください。`);
      continue;
    }

    if (entity.type === 'relic') {
      const result = searchRelics(entity.name);
      const relics = (result.relics || []).slice(0, 5);
      const isVaulted = relics.some(r => r.vaulted);
      const rewards = relics.flatMap(r => r.rewards || []).slice(0, 5);

      truthBlocks.push(`[確定レリック情報: ${entity.name}]
Vault状態: ${isVaulted ? 'Vault入り (現在ドロップ不可・トレードのみ)' : 'アクティブ (ゲーム内で入手可能)'}
主要報酬: ${rewards.map(rw => `${rw.item} (${rw.rarity || 'Common'})`).join(', ') || '情報なし'}`);

      actionChips.push({
        id: `chip_relic_${entity.name.replace(/\s+/g, '_')}`,
        label: `🔍 ${entity.name} のドロップ逆引き`,
        action: 'NAVIGATE_TAB',
        payload: { tab: 'relicgenerator', query: entity.name }
      });
    } else if (entity.type === 'resource') {
      const res = entity.data;
      const spots = (res.bestSpots || []).slice(0, 3);
      truthBlocks.push(`[確定素材狩場: ${res.name}]
惑星: ${res.planets.join(', ')}
最高効率ノード: ${spots.map(s => `${s.node} (${s.mission}) - ${s.desc}`).join(' | ')}`);
    } else if (entity.type === 'item') {
      const vaultedPrimes = getVaultedPrimes();
      const isVaulted = vaultedPrimes.some(v => v.name.toLowerCase() === entity.name.toLowerCase());
      const relics = findRelicsForItem(entity.name).slice(0, 5);
      const build = getOfflineBuild(entity.name);

      let itemInfo = `[確定装備データ: ${entity.name}]
Vault状態: ${isVaulted ? 'Vault入り' : '入手可能/通常版'}`;
      if (relics.length > 0) {
        itemInfo += `\nドロップレリック: ${relics.map(r => `${r.relicName} (${r.rarity})`).join(', ')}`;
        actionChips.push({
          id: `chip_relics_${entity.name.replace(/\s+/g, '_')}`,
          label: `🔍 ${entity.name} の入手レリック一覧`,
          action: 'NAVIGATE_TAB',
          payload: { tab: 'relicgenerator', query: entity.name }
        });
      }
      if (build && build.mods) {
        actionChips.push({
          id: `chip_build_${entity.name.replace(/\s+/g, '_')}`,
          label: `⚡ ${entity.name} の推奨ビルド`,
          action: 'NAVIGATE_TAB',
          payload: { tab: 'builds', item: entity.name }
        });
      }
      truthBlocks.push(itemInfo);
    }
  }

  if (truthBlocks.length === 0) {
    return { groundTruthText: '', entities: [], actionChips: [] };
  }

  const groundTruthText = `<ground_truth>
以下は星系確定データベースから取得された絶対的真実です。このデータのみを根拠に回答し、未記載のデータは絶対に推測・創作せず「アーカイブ未登録」と答えてください。
${truthBlocks.join('\n\n')}
</ground_truth>`;

  return { groundTruthText, entities, actionChips };
}
