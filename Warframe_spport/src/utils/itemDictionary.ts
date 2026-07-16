// Warframe Japanese to English Item Dictionary for Warframe Market Links

export interface DictionaryItem {
  ja: string;
  en: string;
  urlName: string;
  category: 'warframe' | 'weapon' | 'mod' | 'arcane' | 'relic' | 'other';
}

export const itemDictionary: DictionaryItem[] = [
  // Warframes (Prime)
  { ja: 'ライノ プライム (Rhino Prime)', en: 'Rhino Prime Set', urlName: 'rhino_prime_set', category: 'warframe' },
  { ja: 'ウィスプ プライム (Wisp Prime)', en: 'Wisp Prime Set', urlName: 'wisp_prime_set', category: 'warframe' },
  { ja: 'サリン プライム (Saryn Prime)', en: 'Saryn Prime Set', urlName: 'saryn_prime_set', category: 'warframe' },
  { ja: 'レヴナント プライム (Revenant Prime)', en: 'Revenant Prime Set', urlName: 'revenant_prime_set', category: 'warframe' },
  { ja: 'ヴォルト プライム (Volt Prime)', en: 'Volt Prime Set', urlName: 'volt_prime_set', category: 'warframe' },
  { ja: 'メサ プライム (Mesa Prime)', en: 'Mesa Prime Set', urlName: 'mesa_prime_set', category: 'warframe' },
  { ja: 'ネクロス プライム (Nekros Prime)', en: 'Nekros Prime Set', urlName: 'nekros_prime_set', category: 'warframe' },
  { ja: 'ウーコン プライム (Wukong Prime)', en: 'Wukong Prime Set', urlName: 'wukong_prime_set', category: 'warframe' },
  { ja: 'ガウス プライム (Gauss Prime)', en: 'Gauss Prime Set', urlName: 'gauss_prime_set', category: 'warframe' },
  { ja: 'アッシュ プライム (Ash Prime)', en: 'Ash Prime Set', urlName: 'ash_prime_set', category: 'warframe' },
  { ja: 'プロテア プライム (Protea Prime)', en: 'Protea Prime Set', urlName: 'protea_prime_set', category: 'warframe' },
  
  // Weapons (Prime)
  { ja: 'インカーノン ブラントン (Gorgon/Lex etc)', en: 'Lex Prime Set', urlName: 'lex_prime_set', category: 'weapon' },
  { ja: 'オーソス プライム (Orthos Prime)', en: 'Orthos Prime Set', urlName: 'orthos_prime_set', category: 'weapon' },
  { ja: 'グレイブ プライム (Glaive Prime)', en: 'Glaive Prime Set', urlName: 'glaive_prime_set', category: 'weapon' },
  { ja: 'ルビコ プライム (Rubico Prime)', en: 'Rubico Prime Set', urlName: 'rubico_prime_set', category: 'weapon' },
  { ja: 'フェラックス (Phenmor/Laetum etc)', en: 'Phenmor', urlName: 'phenmor', category: 'weapon' },
  { ja: 'クローナッシュ (Kronen Prime)', en: 'Kronen Prime Set', urlName: 'kronen_prime_set', category: 'weapon' },
  { ja: 'ソマ プライム (Soma Prime)', en: 'Soma Prime Set', urlName: 'soma_prime_set', category: 'weapon' },
  { ja: 'リーパー プライム (Reaper Prime)', en: 'Reaper Prime Set', urlName: 'reaper_prime_set', category: 'weapon' },

  // Mods
  { ja: 'コンディショニング オーバーロード (Condition Overload)', en: 'Condition Overload', urlName: 'condition_overload', category: 'mod' },
  { ja: 'アダプテーション (Adaptation)', en: 'Adaptation', urlName: 'adaptation', category: 'mod' },
  { ja: 'ブラッド ラッシュ (Blood Rush)', en: 'Blood Rush', urlName: 'blood_rush', category: 'mod' },
  { ja: 'ウィーピング ウーンズ (Weeping Wounds)', en: 'Weeping Wounds', urlName: 'weeping_wounds', category: 'mod' },
  { ja: 'プライムド コンティニュイティ (Primed Continuity)', en: 'Primed Continuity', urlName: 'primed_continuity', category: 'mod' },
  { ja: 'プライムド フロー (Primed Flow)', en: 'Primed Flow', urlName: 'primed_flow', category: 'mod' },
  { ja: 'オーバーエクステンデッド (Overextended)', en: 'Overextended', urlName: 'overextended', category: 'mod' },
  { ja: 'ブライド レイジ (Blind Rage)', en: 'Blind Rage', urlName: 'blind_rage', category: 'mod' },
  { ja: 'トランジェント フォーティチュード (Transient Fortitude)', en: 'Transient Fortitude', urlName: 'transient_fortitude', category: 'mod' },

  // Arcanes
  { ja: 'アルケイン エナジャイズ (Arcane Energize)', en: 'Arcane Energize', urlName: 'arcane_energize', category: 'arcane' },
  { ja: 'アルケイン グレイス (Arcane Grace)', en: 'Arcane Grace', urlName: 'arcane_grace', category: 'arcane' },
  { ja: 'アルケイン バリア (Arcane Barrier)', en: 'Arcane Barrier', urlName: 'arcane_barrier', category: 'arcane' },
  { ja: 'アルケイン フューリー (Arcane Fury)', en: 'Arcane Fury', urlName: 'arcane_fury', category: 'arcane' },
  { ja: 'アルケイン ストライク (Arcane Strike)', en: 'Arcane Strike', urlName: 'arcane_strike', category: 'arcane' },
  { ja: 'アルケイン プレシジョン (Arcane Precision)', en: 'Arcane Precision', urlName: 'arcane_precision', category: 'arcane' },
  
  // Relics
  { ja: 'レリック Lith (古レリックパック等)', en: 'Lith Relic Pack', urlName: 'lith_relic_pack', category: 'relic' },
  { ja: 'レリック Meso', en: 'Meso Relic Pack', urlName: 'meso_relic_pack', category: 'relic' },
];

export function searchItems(query: string): DictionaryItem[] {
  if (!query) return [];
  const lowercaseQuery = query.toLowerCase().trim();
  
  return itemDictionary.filter(
    item =>
      item.ja.toLowerCase().includes(lowercaseQuery) ||
      item.en.toLowerCase().includes(lowercaseQuery) ||
      item.urlName.toLowerCase().includes(lowercaseQuery)
  );
}
