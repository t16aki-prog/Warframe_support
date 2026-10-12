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

export const NARIN_RULE_PRESETS: NarinPreset[] = [
  {
    id: 'icebind_standard',
    name: '❄️ 氷河の縛り 公式ルール (6人編成・重複禁止)',
    badge: '公式仕様',
    description: 'ユヴァン峰クライオベル起動。6人限定・Warframe重複完全禁止・Lv999+・自力蘇生不可のエンドコンテンツ。',
    recommendedRules: '・定員: 6人フルスクワッド\n・ルール: Warframe重複完全禁止（同フレーム出撃不可）\n・推奨: Vazarin装備者（即時蘇生）2名以上、装甲剥ぎ役1名以上'
  },
  {
    id: 'icebind_narin_lead',
    name: '🗡️ Narin主軸・冷気オーバーガード攻略',
    badge: '推奨メタ',
    description: 'NarinをメインDPS/弾薬供給に据え、冷気オーバーガードとアビリティ連鎖で制圧する編成。',
    recommendedRules: '・ホストまたはDPS枠: Narin (冷気属性/レイピア推奨)\n・サポート: Dante(OG付与), Styanax(装甲剥ぎ/エネ), Frost(CC)\n・ルール: 重複禁止・自力蘇生不可'
  },
  {
    id: 'icebind_modifier_rush',
    name: '⚠️ 週替わり過酷モディファイア対策',
    badge: '高難度',
    description: '極低温フィールドやナリファイア霧、虚無の飢えなどの悪条件を対策フレームで突破する。',
    recommendedRules: '・モディファイア対策特化\n・回復ギア等の使用制限あり\n・ルール: 6人重複禁止'
  },
  {
    id: 'icebind_custom',
    name: '✨ カスタム縛り条件',
    badge: '自由設定',
    description: '氷河の縛りゲームモード内で、ホスト独自の縛りルールを設定して募集する。',
    recommendedRules: ''
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
