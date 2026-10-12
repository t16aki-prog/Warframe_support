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

export interface NarinPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  recommendedRules: string;
}

export const NARIN_RULE_PRESETS: NarinPreset[] = [
  {
    id: 'narin_frost_unite',
    name: '❄️ 氷刃舞踏会 (Narin4人冷気統一)',
    badge: '最難関',
    description: '分隊全員がNarinを使用し、Lv999+冷気オーバーガードの極限耐久に挑む編成。',
    recommendedRules: '・フレーム: 全員Narin必須\n・武器: 冷気属性必須 (レイピア推奨)\n・目標: エンドレス耐久30分以上 or 深淵アルキメデア'
  },
  {
    id: 'narin_cold_only',
    name: '🧊 冷気属性・絶対零度縛り',
    badge: '属性縛り',
    description: '冷気アビリティまたは冷気特化武器のみを使用可能とする寒冷縛りミッション。',
    recommendedRules: '・フレーム: 冷気親和フレーム (Narin, Frost, Hildryn等)\n・武器: 冷気属性MOD必須\n・禁止: 火炎/毒/腐食などの非冷気複合属性'
  },
  {
    id: 'narin_melee_rapier',
    name: '🗡️ 氷刃レイピア＆近接限定',
    badge: '武器縛り',
    description: '射撃武器の弾薬を封印し、レイピアおよび近接コンボとステップのみで突破する。',
    recommendedRules: '・プライマリ/セカンダリの発砲禁止\n・近接攻撃＆アビリティのみ使用可\n・Narinの「ネオテ」突進を主軸に戦闘'
  },
  {
    id: 'narin_iron_heart',
    name: '🛡️ 超過オーバーガード耐久 (回復ギア禁止)',
    badge: 'サバイバル',
    description: 'ヘルスギアやシールドギアの設置を禁止し、Narinのナレマギ等のアビリティ自給自足のみで生還する。',
    recommendedRules: '・ギアホイールのエネルギー/シールド/ヘルスリストア全般使用禁止\n・オーラ/パッシブ/アビリティによる自給自足'
  },
  {
    id: 'narin_custom',
    name: '✨ カスタム縛りルール',
    badge: '自由設定',
    description: 'ホストが独自の縛り条件や特殊ルールを自由に設定して募集する。',
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
