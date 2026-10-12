import type { SquadMember, CryobellModifier } from './types';

export const ALL_WARFRAMES = [
  'Narin', 'Ash', 'Atlas', 'Banshee', 'Baruuk', 'Caliban', 'Chroma', 'Citrine', 
  'Cyte-09', 'Dagath', 'Dante', 'Ember', 'Equinox', 'Excalibur', 'Frost', 'Gara', 
  'Garuda', 'Gauss', 'Grendel', 'Gyre', 'Harrow', 'Hildryn', 'Hydroid', 'Inaros', 
  'Ivara', 'Jade', 'Khora', 'Kullervo', 'Lavos', 'Limbo', 'Loki', 'Mag', 
  'Mesa', 'Mirage', 'Nekros', 'Nezha', 'Nidus', 'Nova', 'Nyx', 'Oberon', 
  'Octavia', 'Protea', 'Qorvex', 'Revenant', 'Rhino', 'Saryn', 'Sevagoth', 
  'Styanax', 'Titania', 'Trinity', 'Valkyr', 'Vauban', 'Volt', 'Voruna', 
  'Wisp', 'Wukong', 'Xaku', 'Yareli', 'Zephyr'
];

export const DEFAULT_SQUAD: SquadMember[] = [
  { id: 1, name: 'テンノ 1 (Host)', frame: 'Narin', role: 'DPS', focus: 'Naramon', notes: '冷気ゲージ満タンで4番装甲剥ぎ＆連鎖爆発' },
  { id: 2, name: 'テンノ 2', frame: 'Dante', role: 'Survival', focus: 'Vazarin', notes: '全員へ超過オーバーガード付与＆即時蘇生' },
  { id: 3, name: 'テンノ 3', frame: 'Styanax', role: 'Armor Strip', focus: 'Zenurik', notes: '2番で100%装甲剥ぎ＆4番でエネルギー継続供給' },
  { id: 4, name: 'テンノ 4', frame: 'Wisp', role: 'Energy', focus: 'Madurai', notes: 'ヘルスリザーバー＆移動/攻撃速度バフ' },
  { id: 5, name: 'テンノ 5', frame: 'Revenant', role: 'Survival', focus: 'Vazarin', notes: 'Mesmer Skinで完全無敵・事故時の安全蘇生' },
  { id: 6, name: 'テンノ 6', frame: 'Frost', role: 'CC', focus: 'Unairu', notes: 'Snow Globe防衛＆4番の確定全凍結・クリティカル付与' },
];

export const PRESET_CRYO_SQUAD: SquadMember[] = [
  { id: 1, name: 'テンノ 1 (Host)', frame: 'Narin', role: 'DPS', focus: 'Naramon', notes: '冷気爆縮＆Nurinarim全周囲斬殺' },
  { id: 2, name: 'テンノ 2', frame: 'Frost', role: 'CC', focus: 'Unairu', notes: '4番全周囲確定凍結・確定クリティカルバフ' },
  { id: 3, name: 'テンノ 3', frame: 'Nova', role: 'CC', focus: 'Zenurik', notes: 'Molecular Primeで全敵75%減速・被ダメージ2倍' },
  { id: 4, name: 'テンノ 4', frame: 'Citrine', role: 'Energy', focus: 'Vazarin', notes: 'オーブ大量ドロップ＆状態異常率・持続バフ' },
  { id: 5, name: 'テンノ 5', frame: 'Harrow', role: 'Survival', focus: 'Vazarin', notes: '無敵時間＆ヘッドショットで即時エネルギー補充' },
  { id: 6, name: 'テンノ 6', frame: 'Saryn', role: 'Armor Strip', focus: 'Madurai', notes: '腐食胞子でLv999敵の装甲を連続細分化' },
];

export const PRESET_BURST_SQUAD: SquadMember[] = [
  { id: 1, name: 'テンノ 1 (Host)', frame: 'Narin', role: 'DPS', focus: 'Naramon', notes: 'Neote突進とSangodaeで冷気弾薬供給' },
  { id: 2, name: 'テンノ 2', frame: 'Kullervo', role: 'DPS', focus: 'Madurai', notes: 'Collective Curseで超大ダメージを部屋全体に共有' },
  { id: 3, name: 'テンノ 3', frame: 'Dagath', role: 'Armor Strip', focus: 'Zenurik', notes: 'Doomで受けるダメージ増加＆馬の突進で100%装甲剥ぎ' },
  { id: 4, name: 'テンノ 4', frame: 'Wisp', role: 'Energy', focus: 'Vazarin', notes: 'ヘルスリザーバー＆感電CC' },
  { id: 5, name: 'テンノ 5', frame: 'Mirage', role: 'DPS', focus: 'Madurai', notes: '分身による超広域弾幕・高威力Roar移植' },
  { id: 6, name: 'テンノ 6', frame: 'Dante', role: 'Survival', focus: 'Vazarin', notes: 'Tragedy爆発＆オーバーガードでの即死防止' },
];

export const CRYOBELL_MODIFIERS: CryobellModifier[] = [
  {
    name: '極低温フィールド (Permafrost)',
    danger: '★★★',
    desc: '常時冷気異常が蓄積。移動速度-70%＆シールド自然回復が完全停止。',
    counter: 'Narin (冷気を吸収してオーバーガード変換), Primed Sure Footed, Dante'
  },
  {
    name: '虚無の飢え (Energy Leech Surge)',
    danger: '★★★',
    desc: '全アビリティのエネルギー消費量が2倍になり、時間経過でエネルギーが蒸発。',
    counter: 'Styanax (4番で継続回復), Citrine (オーブ大量生成), ギア(大型エネルギー大)'
  },
  {
    name: '強化オーバーガード (Reinforced Ward)',
    danger: '★★☆',
    desc: 'エクシマスユニットのオーバーガード耐久値が3倍。アビリティCCが通らない。',
    counter: 'Kullervo (超火力クリティカル近接), 放射線属性, Torid Incarnon'
  },
  {
    name: '暗号化妨害 (Signal Jammer)',
    danger: '★★☆',
    desc: 'ミニマップとHUDの敵マーカーが消失。サイド目標の端末ハッキング難易度が上昇。',
    counter: 'サイファーの持参, オペレーターでの索敵, Frostのドームによる定点防御'
  },
  {
    name: 'ナリファイア霧 (Nullifying Mist)',
    danger: '★★★',
    desc: 'マップ全体にランダムな消滅ゾーンが巡回。触れると即座に全バフが解除される。',
    counter: '高レート射撃武器で素早くドーム破壊, 密集を避けて各員が散開'
  }
];

export const NARIN_BLUEPRINTS = [
  { key: 'narinBp', label: 'ナリンの設計図 (本体BP)', desc: 'ユヴァン峰 クライオベル初鳴らし報酬' },
  { key: 'narinNeuro', label: 'ナリン ニューロプティクス', desc: '氷河の縛り ステージ1クリア報酬 / 交換' },
  { key: 'narinChassis', label: 'ナリン シャーシ', desc: '氷河の縛り ステージ2クリア報酬 / 交換' },
  { key: 'narinSystems', label: 'ナリン システム', desc: '氷河の縛り ステージ3クリア報酬 / 交換' },
];
