// translateDict.js

export const translationMap = {
  // --- ミッションの種類 (Mission Types) ---
  "Extermination": "掃滅",
  "Capture": "確保",
  "Survival": "耐久",
  "Defense": "防衛",
  "Excavation": "発掘",
  "Interception": "傍受",
  "Spy": "潜入",
  "Sabotage": "妨害",
  "Rescue": "救出",
  "Mobile Defense": "機動防衛",
  "Assassination": "暗殺",
  "Defection": "脱出",
  "Disruption": "分裂",
  "Hive": "ハイヴ",
  "Infested Salvage": "感染サルベージ",
  "Arena": "アリーナ",
  "Hijack": "ハイジャック",
  "Purify": "浄化",
  "Alchemy": "錬金術",
  "Volatile": "揮発",
  "Void Cascade": "カスケード",
  "Void Flood": "フラッド",
  "Void Armageddon": "アルマゲドン",
  "Orphix": "オルフィクス",
  "Skirmish": "掃討",

  // --- ドロップ場所の惑星 / 領域 (Planets / Regions) ---
  "Earth": "地球",
  "Venus": "金星",
  "Mercury": "水星",
  "Mars": "火星",
  "Phobos": "フォボス",
  "Ceres": "ケレス",
  "Jupiter": "木星",
  "Europa": "エウロパ",
  "Saturn": "土星",
  "Uranus": "天王星",
  "Neptune": "海王星",
  "Pluto": "冥王星",
  "Sedna": "セドナ",
  "Eris": "エリス",
  "Void": "Void",
  "Lua": "ルア",
  "Kuva Fortress": "クバ要塞",
  "Zariman": "Zariman",
  "Deimos": "ダイモス",
  "Duviri": "デュヴィリ",

  // --- その他キーワード (Other Keywords) ---
  "Rotation A": "ローテーション A",
  "Rotation B": "ローテーション B",
  "Rotation C": "ローテーション C",
  "Bounty": "依頼",
  "Ghoul Purge": "グール粛清",
  "Relic": "レリック",
  "Lith": "Lith",
  "Meso": "Meso",
  "Neo": "Neo",
  "Axi": "Axi",
  "Requiem": "Requiem",
  "Omnia": "Omnia",
  "Endo": "Endo",
  "Credits": "クレジット",
  "Credit Cache": "クレジット",
  "Aya": "Aya",
  "Cetus Wisp": "シータス ウィスプ",
  "Focus Lens": "フォーカスレンズ",
  "Kuva": "クバ",
  "Riven Mod": "Riven Mod",
  "Ayatan Amber Star": "Ayatan Amber スター",
  "Ayatan Cyan Star": "Ayatan Cyan スター",
  "Blueprint": "設計図",
  "Chassis": "シャーシ",
  "Neuroptics": "ニューロプティック",
  "Systems": "システム",
  "Lens": "レンズ",
  "Greater Lens": "グレーターレンズ",
  "Eidolon Lens": "エイドロンレンズ",
  "Lua Lens": "ルアレンズ",
  "Lanthorn": "エントラティ・ランソーン",
  "Cull the Enemy": "敵の掃滅",
  "Resource Cache": "資材発掘",
  "Capture the Grineer Commander": "グリニア司令官の確保",
  "Rescue the Hostage": "人質の救出",
  "Sabotage the Grineer Camp": "グリニアの野営地の妨害",
  "Assassinate the Commander": "司令官の暗殺",
  "Reclaim the Stolen Artifact": "盗まれたアーティファクトの奪還",
  "Free the Ostrom Prisoners": "オストロンの捕虜の解放",
  "Sabotage the Enemy Supply Lines": "敵補給線の破壊",
  "Search and Rescue": "捜索と救出",
  "Daily": "デイリー",
  "Weekly": "ウィークリー",
  "Elite Weekly": "エリートウィークリー",
  "Nightwave": "ナイトウェーブ",

  // --- 説明文 (Descriptions) ---
  "Titania’s fairy-like appearance belies her formidable regal power. The enchantress deals high damage and provides crowd control. She forces opponents to pay homage or perish.": "妖精のような外見の裏に強力な力を秘めたエンチャントレス。高いダメージとクラウドコントロールを両立し、敵を平伏させるか滅ぼすかを選択を迫る。",
  "Tempting and terrifying, this is Titania in her ultimate form.": "魅惑的で恐ろしい、Titaniaの究極の姿。"
};

/**
 * 英語の文字列を与えられた辞書に基づいて日本語に置換します。
 */
export function translateText(text) {
  if (!text) return text;
  let translated = text;
  
  // 完全一致チェック
  if (translationMap[translated]) {
    return translationMap[translated];
  }

  // 部分一致での置換 (降順で長い文字列から置換すると安全)
  for (const [eng, jpn] of Object.entries(translationMap)) {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translated = translated.replace(regex, jpn);
  }

  return translated;
}
