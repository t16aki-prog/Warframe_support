// staticBuilds.js
// オフライン用の固定ビルドデータベース

export const staticBuilds = {
  frames: {
    Excalibur: {
      itemName: "Excalibur",
      augments: [
        {
          name: "Chromatic Blade (クロマティック・ブレード)",
          effect: "Exalted Bladeのダメージタイプをライトカラーに応じて変化させ、状態異常確率を大幅に上昇させる。",
          syndicate: "スティール・メリディアン / アービターズ・オブ・ヘクシス"
        }
      ],
      popularBuild: {
        aura: "Steel Charge",
        exilus: "Power Drift",
        arcanes: ["Arcane Energize", "Arcane Strike"],
        mods: ["Umbral Intensify", "Umbral Vitality", "Umbral Fiber", "Transient Fortitude", "Blind Rage", "Streamline", "Fleeting Expertise", "Chromatic Blade"],
        playstyle: "Chromatic Bladeを採用したExalted Blade特化型ビルド。高い状態異常確率で敵を切り刻む。アビリティ効率と威力をバランスよく高め、近接攻撃で暴れ回るプレイスタイルが強力です。"
      }
    },
    Volt: {
      itemName: "Volt",
      augments: [
        {
          name: "Capacitance (キャパシタンス)",
          effect: "Dischargeで与えたダメージの一定割合をシールドに変換する。",
          syndicate: "アービターズ・オブ・ヘクシス / レッド・ベール"
        }
      ],
      popularBuild: {
        aura: "Brief Respite",
        exilus: "Primed Sure Footed",
        arcanes: ["Arcane Energize", "Arcane Aegis"],
        mods: ["Blind Rage", "Transient Fortitude", "Primed Continuity", "Primed Flow", "Stretch", "Overextended", "Capacitance", "Rolling Guard"],
        playstyle: "Capacitanceによるシールド回復と、高範囲のDischargeを連発するクラウドコントロール特化ビルド。ESO（エリートサンクチュアリ交戦）や通常の掃滅ミッションなどで非常に高い殲滅力を誇ります。"
      }
    },
    Rhino: {
      itemName: "Rhino",
      augments: [
        {
          name: "Iron Shrapnel (アイアン・シュラプネル)",
          effect: "Iron Skinを再発動して爆発させ、周囲の敵にダメージを与えることができる。Iron Skinのかけ直しが可能になる。",
          syndicate: "スティール・メリディアン / ペリン・シークエンス"
        }
      ],
      popularBuild: {
        aura: "Growing Power",
        exilus: "Power Drift",
        arcanes: ["Arcane Energize", "Arcane Tanker"],
        mods: ["Blind Rage", "Transient Fortitude", "Umbral Intensify", "Umbral Fiber", "Primed Continuity", "Stretch", "Iron Shrapnel", "Rolling Guard"],
        playstyle: "Iron Skinで圧倒的な耐久力を得つつ、Roarで味方全体の火力を底上げする万能バフ・タンクビルド。初心者からエンドコンテンツまで幅広く活躍できます。"
      }
    },
    Wukong: {
      itemName: "Wukong",
      augments: [
        {
          name: "Celestial Stomp (セレスティアル・ストンプ)",
          effect: "Celestial Twinが地面を叩きつけ、周囲の敵を浮遊させて動きを止める。",
          syndicate: "ニュー・ロカ / アービターズ・オブ・ヘクシス"
        }
      ],
      popularBuild: {
        aura: "Corrosive Projection",
        exilus: "Preparation",
        arcanes: ["Arcane Energize", "Arcane Strike"],
        mods: ["Primed Continuity", "Narrow Minded", "Umbral Intensify", "Blind Rage", "Primed Flow", "Streamline", "Adaptation", "Vitality"],
        playstyle: "Cloud Walkerの機動力を活かした潜入・確保・救出等の高速周回ビルド。Celestial Twinと共に武器で戦うことを前提とした汎用構成です。"
      }
    },
    Narin: {
      itemName: "Narin",
      augments: [
        {
          name: "Glacial Surge (グレイシャル・サージ)",
          effect: "Neoteの突進軌跡上に氷柱が連続発生し、通過する敵に冷気異常を最大付与して氷ゲージを2倍獲得する。",
          syndicate: "セファロン・スーダ / ニュー・ロカ"
        }
      ],
      popularBuild: {
        aura: "Brief Respite",
        exilus: "Primed Sure Footed",
        arcanes: ["Arcane Ice Storm", "Arcane Energize"],
        mods: ["Archon Flow", "Archon Continuity", "Blind Rage", "Transient Fortitude", "Stretch", "Overextended", "Rolling Guard", "Streamline"],
        playstyle: "「氷河の縛り」特化エンドコンテンツ構成。冷気異常を周囲に散布し、2番(Naraemagi)でシールド全回復と超過オーバーガードを常時キープ。氷ゲージ100%時の4番(Nurinarim)でLv999敵の装甲・シールドを100%全剥離し、大爆発で連鎖殲滅します。"
      }
    }
  },
  genericFrame: {
    augments: [
      {
        name: "専用増強MOD",
        effect: "各シンジケートで提供されるフレーム固有のアビリティ強化MOD。",
        syndicate: "各種シンジケート"
      }
    ],
    popularBuild: {
      aura: "Corrosive Projection / Energy Siphon",
      exilus: "Primed Sure Footed / Power Drift",
      arcanes: ["Arcane Energize", "任意のアルケイン"],
      mods: ["Umbral Intensify", "Umbral Vitality", "Primed Continuity", "Primed Flow", "Streamline", "Stretch", "Blind Rage", "Adaptation / Rolling Guard"],
      playstyle: "（オフライン用汎用データ）このフレームの標準的な汎用ビルド構成です。アビリティ威力、効果時間、範囲、効率をプレイスタイルに合わせて微調整してください。"
    }
  },
  genericPrimary: {
    augments: [],
    popularBuild: {
      exilus: "Vigilante Supplies",
      arcanes: ["Primary Merciless"],
      mods: ["Galvanized Chamber", "Galvanized Aptitude", "Serration", "Critical Delay", "Vital Sense", "Malignant Force", "Rime Rounds", "Hunter Munitions"],
      playstyle: "（オフライン用汎用データ）標準的な切断・感染ハイブリッド構成です。クリティカル率と状態異常確率を両立させる構成が現在の主流です。"
    }
  },
  genericMelee: {
    augments: [],
    popularBuild: {
      stance: "武器種に対応したスタンスMOD",
      exilus: "Dreamer's Wrath (Tennokai)",
      arcanes: ["Melee Animosity / Melee Influence"],
      mods: ["Condition Overload", "Blood Rush", "Weeping Wounds", "Organ Shatter", "Primed Reach", "Berserker Fury", "Virulent Scourge", "Volcanic Edge"],
      playstyle: "（オフライン用汎用データ）コンボカウントを稼ぎ、Condition Overloadで火力を上げる標準的な近接構成（COBRWW構成）です。"
    }
  }
};

export function getOfflineBuild(itemName, category) {
  const isFrame = category.toLowerCase().includes('frame');
  const isMelee = category.toLowerCase().includes('melee') || category === '近接' || category === 'アークウイング近接';
  const isPrimary = category.toLowerCase().includes('primary') || category === 'プライマリ';
  const isSecondary = category.toLowerCase().includes('secondary') || category === 'セカンダリ';

  // Exact match (case insensitive, removing "Prime" etc)
  const baseName = itemName.replace(/ Prime/i, '').replace(/ Umbra/i, '').trim();
  if (isFrame && staticBuilds.frames[baseName]) {
    const data = JSON.parse(JSON.stringify(staticBuilds.frames[baseName])); // deep copy
    data.itemName = itemName;
    return data;
  }

  // Fallback to generic builds
  let genericData;
  if (isFrame) {
    genericData = staticBuilds.genericFrame;
  } else if (isMelee) {
    genericData = staticBuilds.genericMelee;
  } else if (isPrimary || isSecondary) {
    genericData = staticBuilds.genericPrimary;
  } else {
    // Companion, Archwing, Necramech etc.
    genericData = {
      augments: [],
      popularBuild: {
        aura: "N/A",
        exilus: "N/A",
        arcanes: [],
        mods: ["耐久MOD", "攻撃力UP MOD", "属性MOD", "属性MOD", "ユーティリティMOD", "ユーティリティMOD", "自由枠", "自由枠"],
        playstyle: "（オフライン用汎用データ）このカテゴリの基本的な汎用構成です。"
      }
    };
  }

  return {
    itemName: itemName,
    augments: genericData.augments,
    popularBuild: genericData.popularBuild
  };
}
