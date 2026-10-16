// server/llm/geminiTools.js
// Gemini 2.0 / 1.5 Flash 向け Function Calling (Tool Use) 宣言 ＆ 実行ディスパッチャ
// 1ファイル150〜200行以下の原則を遵守

import { searchRelics, searchWarframeParts, getVaultedPrimes, findRelicsForItem } from '../../warframeData.js';
import { staticResources } from '../../staticResources.js';
import { getOfflineBuild } from '../../staticBuilds.js';
import { buildQuickKnowledgeSummary } from './quickFacts.js';

export const geminiToolDeclarations = [
  {
    name: "lookup_relic_drops",
    description: "指定されたレリック（例: 'Lith G1', 'Axi S9'）の報酬内容と現在のVault状態を照会します。",
    parameters: {
      type: "OBJECT",
      properties: {
        relic_name: { type: "STRING", description: "レリック名（例: Axi S9）" }
      },
      required: ["relic_name"]
    }
  },
  {
    name: "find_item_sources",
    description: "欲しいアイテムやPrimeパーツのドロップ元レリックと推奨ミッションを照会します。",
    parameters: {
      type: "OBJECT",
      properties: {
        item_name: { type: "STRING", description: "アイテムまたはパーツ名（例: Gauss Prime Systems）" }
      },
      required: ["item_name"]
    }
  },
  {
    name: "get_world_state",
    description: "地球/シータスの昼夜サイクル、Void亀裂、ソーティ、アルコン討伐の最新状態を取得します。",
    parameters: {
      type: "OBJECT",
      properties: {
        query_type: { type: "STRING", enum: ["cycles", "sortie", "archon", "baro", "all"], description: "取得対象の種別" }
      },
      required: ["query_type"]
    }
  },
  {
    name: "get_resource_farming_spot",
    description: "素材（オロキンセル、アルゴンクリスタル、ポリマー等）の最高効率狩場と推奨フレームを取得します。",
    parameters: {
      type: "OBJECT",
      properties: {
        resource_name: { type: "STRING", description: "素材名（例: オロキンセル）" }
      },
      required: ["resource_name"]
    }
  },
  {
    name: "get_recommended_build",
    description: "Warframeや武器の検証済みシナジービルド構成を取得します。",
    parameters: {
      type: "OBJECT",
      properties: {
        item_name: { type: "STRING", description: "対象の装備名" },
        build_type: { type: "STRING", enum: ["general", "steel_path", "beginner"], description: "ビルド種別" }
      },
      required: ["item_name"]
    }
  },
  {
    name: "check_icebind_squad",
    description: "「氷河の縛り」分隊内のWarframe重複の有無を判定します。",
    parameters: {
      type: "OBJECT",
      properties: {
        warframes: {
          type: "ARRAY",
          items: { type: "STRING" },
          description: "参加予定のWarframe一覧"
        }
      },
      required: ["warframes"]
    }
  }
];

/**
 * ツール呼び出しを安全に実行（3000msタイムアウト付き）
 */
export async function executeToolCall(call) {
  const { name, args } = call;
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Tool execution timeout (3000ms)')), 3000)
  );

  const execPromise = (async () => {
    switch (name) {
      case "lookup_relic_drops": {
        const data = searchRelics(args.relic_name);
        return { relic: args.relic_name, relics: (data.relics || []).slice(0, 5) };
      }
      case "find_item_sources": {
        const relics = findRelicsForItem(args.item_name).slice(0, 5);
        return { item: args.item_name, relics };
      }
      case "get_world_state": {
        return buildQuickKnowledgeSummary();
      }
      case "get_resource_farming_spot": {
        const found = staticResources.find(r => r.name.toLowerCase().includes(args.resource_name.toLowerCase()));
        return found ? { resource: found.name, spots: found.bestSpots, planets: found.planets } : { error: "該当素材の記録なし" };
      }
      case "get_recommended_build": {
        const build = getOfflineBuild(args.item_name, 'Warframe');
        return build ? { item: args.item_name, build } : { error: "推奨ビルド記録なし" };
      }
      case "check_icebind_squad": {
        const list = (args.warframes || []).map(f => f.trim().toLowerCase());
        const hasDuplicate = new Set(list).size !== list.length;
        return {
          valid: !hasDuplicate,
          duplicateDetected: hasDuplicate,
          rule: "6人編成・同一フレーム重複完全禁止"
        };
      }
      default:
        return { error: `未定義のツール: ${name}` };
    }
  })();

  try {
    return await Promise.race([execPromise, timeoutPromise]);
  } catch (err) {
    return { error: err.message };
  }
}
