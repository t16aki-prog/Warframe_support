// Warframe_spport/src/features/multiplayer/constants.ts

export const MISSION_CATEGORIES = [
  'レリック/亀裂 (持ち寄り・高速)',
  '鋼の道のり (Steel Path)',
  'アルコン討伐戦 (Archon Hunt)',
  '深淵アルキメデア / エリート深淵',
  'ネットセル (Netracells)',
  '星系開拓 / ボス周回',
  '素材・クレジット稼ぎ (Index等)',
  'エンドレス耐久 (Lv上げ・亀裂)',
  'その他マルチ'
] as const;

// ❄️ ゲームモード「氷河の縛り (The Icebind)」専用ステージ目標
export const ICEBIND_STAGES = [
  '全ステージ完全踏破 (ステージ1〜3 完全制覇)',
  'ステージ1: 氷結回廊 (ニューロプティクス狙い)',
  'ステージ2: 凍土の核 (シャーシ狙い)',
  'ステージ3: 絶対零度決戦 (システム狙い・週替わり報酬)',
  'Lv999+ エンドレス極限耐久 (クバ/エッセンス周回)',
  '週替わりモディファイア初クリア挑戦'
] as const;

export interface NarinPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommendedRules: string;
}

export const ICEBIND_OFFICIAL_RULE = {
  id: 'icebind_official',
  name: '❄️ 氷河の縛り 公式ルール (6人編成・重複禁止)',
  badge: '公式仕様',
  description: '地球ユヴァン峰クライオベル起動。6人限定・Warframe重複完全禁止・Lv999+・自力蘇生不可のエンドコンテンツ。',
  rules: '・定員: 最大6人フルスクワッド\n・ルール: Warframe重複完全禁止（同一フレームの重複出撃不可）\n・仕様: 敵Lv999+・自力蘇生不可・サイド目標即失敗\n・推奨: Vazarin装備者（即時蘇生）2名以上、装甲剥ぎ役1名以上'
};

export const NARIN_RULE_PRESETS: NarinPreset[] = [
  {
    id: ICEBIND_OFFICIAL_RULE.id,
    name: ICEBIND_OFFICIAL_RULE.name,
    badge: ICEBIND_OFFICIAL_RULE.badge,
    description: ICEBIND_OFFICIAL_RULE.description,
    recommendedRules: ICEBIND_OFFICIAL_RULE.rules
  }
];

export const POPULAR_WARFRAMES = [
  'Narin',
  'Frost',
  'Excalibur',
  'Dante',
  'Kullervo',
  'Wisp',
  'Gauss',
  'Saryn',
  'Mesa',
  'Rhino',
  'Revenant',
  'Nova',
  'Volt',
  'Mag',
  'Trinity',
  'Nekros',
  'Khora',
  'Octavia',
  'Protea',
  'Dagath',
  'Styanax',
  'Citrine',
  'Gyre',
  'Voruna',
  'Sevagooth',
  'Lavos',
  'Baruuk',
  'Grendel'
];
