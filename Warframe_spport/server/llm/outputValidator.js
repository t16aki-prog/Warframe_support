// server/llm/outputValidator.js
// LLM出力テキストの事後検証 ＆ インライン自動修復フィルター
// 1ファイル150〜200行以下の原則を遵守

import { searchRelics } from '../../warframeData.js';

const RELIC_EXTRACTOR = /\b(Lith|Meso|Neo|Axi)\s*([A-Za-z0-9]+)\b/g;
const CHEAT_KEYWORDS = /(自動エイム|aimbot|ウォールハック|外部チート|不正マクロ)/i;

/**
 * AIの回答テキストを検証し、捏造レリック名を安全にインライン修復
 */
export function validateAndSanitizeOutput(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return {
      text: 'オペレーター、応答信号が途絶しました。再度ご指示をお願いします。',
      sanitized: true,
      hasHallucination: false
    };
  }

  // 1. チート・不正ツールの厳格拒絶
  if (CHEAT_KEYWORDS.test(rawText)) {
    return {
      text: 'オペレーター！そのような外部不正ツールは星系の利用規約違反であり、即時永久BANの対象です！――**汚らわしいチーターどもは船外に叩き出してやりましょう！**――コホン、正当な装備の強化をお勧めします。',
      sanitized: true,
      hasHallucination: true
    };
  }

  let validatedText = rawText;
  let hasHallucination = false;

  // 2. 出現したレリック名の実在照合
  const matches = [...rawText.matchAll(RELIC_EXTRACTOR)];
  for (const match of matches) {
    const relicName = `${match[1]} ${match[2].toUpperCase()}`;
    const result = searchRelics(relicName);

    // キャッシュ内に該当レリックが1件も存在しない場合
    if (!result.relics || result.relics.length === 0) {
      hasHallucination = true;
      // 全文破棄せず、該当レリック名に注記をインライン付与
      const replacement = `${relicName}（※星系記録に実在が確認できないレリック）`;
      validatedText = validatedText.replaceAll(match[0], replacement);
    }
  }

  return {
    text: validatedText,
    sanitized: hasHallucination,
    hasHallucination
  };
}
