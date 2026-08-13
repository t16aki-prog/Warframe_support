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
    Mesa: {
      itemName: "Mesa",
      augments: [
        {
          name: "Mesa's Waltz (メサズ・ワルツ)",
          effect: "Peacemaker発動中に移動速度は落ちるが移動とローリングが可能になる。",
          syndicate: "スティール・メリディアン / レッド・ベール"
        }
      ],
      popularBuild: {
        aura: "Pistol Amp",
        exilus: "Mesa's Waltz",
        arcanes: ["Arcane Velocity", "Arcane Energize"],
        mods: ["Umbral Intensify", "Primed Continuity", "Narrow Minded", "Streamline", "Fleeting Expertise", "Transient Fortitude", "Blind Rage", "Rolling Guard"],
        playstyle: "Peacemaker(4番)の火力を極限まで高めたアタッカービルド。効果時間と効率のバランスを取りつつ、高威力の連射で部屋中の敵を一掃します。"
      }
    },
    Saryn: {
      itemName: "Saryn",
      augments: [
        {
          name: "Venom Dose (ヴェノム・ドーズ)",
          effect: "Sporesを長押し発動で、自身と周囲の味方の攻撃に腐食ダメージを追加する。",
          syndicate: "スティール・メリディアン / レッド・ベール"
        }
      ],
      popularBuild: {
        aura: "Growing Power",
        exilus: "Power Drift",
        arcanes: ["Arcane Energize", "Arcane Avenger"],
        mods: ["Overextended", "Stretch", "Umbral Intensify", "Blind Rage", "Primed Continuity", "Streamline", "Venom Dose", "Adaptation"],
        playstyle: "Spores(1番)による広範囲の感染と、Miasma(4番)のコンボで広範囲の敵を自動的に殲滅し続ける感染拡大特化ビルドです。ESOでも最強クラスの性能を誇ります。"
      }
    }
  },
  weapons: {
    Ignis: {
      itemName: "Ignis",
      augments: [],
      popularBuild: {
        exilus: "Sinister Reach",
        arcanes: ["Primary Merciless"],
        mods: ["Serration", "Galvanized Chamber", "Galvanized Aptitude", "Critical Delay", "Vital Sense", "Malignant Force", "Rime Rounds", "Hunter Munitions"],
        playstyle: "広範囲の敵を焼き払う放射線＋感染＋切断（Hunter Munitions）構成。圧倒的な使いやすさで掃滅や素材稼ぎに最適です。"
      }
    },
    Nataruk: {
      itemName: "Nataruk",
      augments: [],
      popularBuild: {
        exilus: "Vigilante Supplies",
        arcanes: ["Primary Deadhead"],
        mods: ["Galvanized Chamber", "Galvanized Aptitude", "Critical Delay", "Vital Sense", "Vile Acceleration", "Malignant Force", "Rime Rounds", "Hunter Munitions"],
        playstyle: "パーフェクトチャージ時の確定クリティカルを活かした感染＋切断ビルド。一撃の威力と貫通力で直線状の敵を壊滅させます。"
      }
    },
    Glaive: {
      itemName: "Glaive",
      augments: [],
      popularBuild: {
        stance: "Astral Twilight",
        exilus: "Dreamer's Wrath (Tennokai)",
        arcanes: ["Melee Duplicate / Melee Animosity"],
        mods: ["Amalgam Organ Shatter", "Killing Blow", "Sacrificial Steel", "Sacrificial Pressure", "Volatile Quick Return", "Corrupt Charge", "Gladiator Might", "Primed Fever Strike"],
        playstyle: "ヘビー攻撃の爆発で広範囲に確定切断状態異常をばらまく、鋼の道のりでも通用する最強クラスの範囲近接ビルドです。"
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
  },
  genericNecramech: {
    augments: [],
    popularBuild: {
      aura: "N/A",
      exilus: "Necramech Thrusters",
      arcanes: [],
      mods: ["Necramech Vitality", "Necramech Steel Fiber", "Necramech Redirection", "Necramech Streamline", "Necramech Flow", "Necramech Continuity", "Necramech Stretch", "Necramech Intensify"],
      playstyle: "（オフライン用汎用データ）ネクロメカの標準的な耐久・アビリティ構成です。アビリティを多用して殲滅するスタイルに適しています。"
    }
  },
  genericArchwing: {
    augments: [],
    popularBuild: {
      aura: "N/A",
      exilus: "N/A",
      arcanes: [],
      mods: ["Enhanced Durability", "Argon Plating", "Energy Inversion", "System Reroute", "Auxiliary Power", "Morphic Transformer", "Hyperion Thrusters", "Kinetic Friction"],
      playstyle: "（オフライン用汎用データ）アークウイングの標準的な耐久および機動力確保、アビリティ強化用の汎用構成です。"
    }
  },
  genericArchGun: {
    augments: [],
    popularBuild: {
      aura: "N/A",
      exilus: "N/A",
      arcanes: [],
      mods: ["Rubedo-Lined Barrel", "Dual Rounds", "Parallax Scope", "Hollowed Bullets", "Venomous Clip", "Electrified Barrel", "Combustion Rounds", "Polar Magazine"],
      playstyle: "（オフライン用汎用データ）アークウイングガンの標準的なクリティカル・属性ハイブリッド構成です。地上および宇宙の両方で安定した火力を発揮します。"
    }
  },
  genericArchMelee: {
    augments: [],
    popularBuild: {
      aura: "N/A",
      exilus: "N/A",
      arcanes: [],
      mods: ["Cutting Edge", "Bleeding Edge", "Furor", "Poisonous Sting", "Galvanized Blade", "Blazing Steel", "Glacial Edge", "Extend"],
      playstyle: "（オフライン用汎用データ）アークウイング近接の標準的な火力・攻撃速度重視構成です。"
    }
  },
  genericPets: {
    augments: [
      {
        name: "専用プリセプトMOD",
        effect: "各コンパニオン固有の特殊行動MOD。",
        syndicate: "各コンパニオンに応じる"
      }
    ],
    popularBuild: {
      aura: "N/A",
      exilus: "N/A",
      arcanes: [],
      mods: ["Vacuum / Fetch", "Animal Instinct", "Link Health", "Link Armor", "Synth Fiber", "Synth Deconstruct", "Medi-Pet Kit", "Pack Leader"],
      playstyle: "（オフライン用汎用データ）コンパニオンの生存力とユーティリティ（アイテム回収・レーダー・ヘルスオーブ生成など）を最大化する汎用構成です。"
    }
  }
};

export function getOfflineBuild(itemName, category) {
  const isFrame = category.toLowerCase().includes('frame');
  const isMelee = category.toLowerCase().includes('melee') || category === '近接' || category === 'アークウイング近接';
  const isPrimary = category.toLowerCase().includes('primary') || category === 'プライマリ';
  const isSecondary = category.toLowerCase().includes('secondary') || category === 'セカンダリ';

  // Exact match (case insensitive, removing "Prime" etc)
  const baseName = itemName.replace(/ Prime/i, '').replace(/ Wraith/i, '').replace(/ Vandal/i, '').replace(/ Umbra/i, '').trim();
  
  if (isFrame && staticBuilds.frames[baseName]) {
    const data = JSON.parse(JSON.stringify(staticBuilds.frames[baseName])); // deep copy
    data.itemName = itemName;
    return data;
  }
  
  if ((isPrimary || isSecondary || isMelee) && staticBuilds.weapons && staticBuilds.weapons[baseName]) {
    const data = JSON.parse(JSON.stringify(staticBuilds.weapons[baseName])); // deep copy
    data.itemName = itemName;
    return data;
  }

  // Fallback to generic builds
  let genericData;
  if (isFrame) {
    genericData = staticBuilds.genericFrame;
  } else if (isMelee && !category.toLowerCase().includes('arch-melee') && category !== 'アークウイング近接') {
    genericData = staticBuilds.genericMelee;
  } else if (isPrimary || isSecondary) {
    genericData = staticBuilds.genericPrimary;
  } else if (category.toLowerCase().includes('necramech') || category === 'ネクロメカ') {
    genericData = staticBuilds.genericNecramech;
  } else if (category.toLowerCase().includes('archwing') || category === 'アークウイング') {
    genericData = staticBuilds.genericArchwing;
  } else if (category.toLowerCase().includes('arch-gun') || category === 'アークウイングガン') {
    genericData = staticBuilds.genericArchGun;
  } else if (category.toLowerCase().includes('arch-melee') || category === 'アークウイング近接') {
    genericData = staticBuilds.genericArchMelee;
  } else if (category.toLowerCase().includes('pets') || category === 'コンパニオン') {
    genericData = staticBuilds.genericPets;
  } else {
    // Other etc.
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
