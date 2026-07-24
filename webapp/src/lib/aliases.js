// aliases.js
// 検索キーワードの表記揺れ（エイリアス）を英語ベース名に変換するための辞書

const aliasMap = {
  // --- Warframes ---
  "Excalibur": ["エクスカリバー", "エクス", "exca", "excalibur"],
  "Volt": ["ボルト", "ヴォルト", "volt"],
  "Mag": ["マグ", "mag"],
  "Rhino": ["ライノ", "rhino"],
  "Loki": ["ロキ", "loki"],
  "Nyx": ["ニックス", "nyx"],
  "Ash": ["アッシュ", "ash"],
  "Ember": ["エンバー", "ember"],
  "Frost": ["フロスト", "frost"],
  "Trinity": ["トリニティ", "trinity"],
  "Banshee": ["バンシー", "banshee"],
  "Saryn": ["サリン", "saryn"],
  "Nova": ["ノヴァ", "ノバ", "nova"],
  "Nekros": ["ネクロス", "nekros"],
  "Valkyr": ["ヴァルキア", "バルキル", "ヴァルキリー", "valkyr"],
  "Oberon": ["オベロン", "oberon"],
  "Zephyr": ["ゼファー", "zephyr"],
  "Hydroid": ["ハイドロイド", "hydroid"],
  "Mirage": ["ミラージュ", "mirage"],
  "Limbo": ["リンボ", "limbo"],
  "Mesa": ["メサ", "mesa"],
  "Chroma": ["クロマ", "chroma"],
  "Equinox": ["イクイノックス", "equinox"],
  "Atlas": ["アトラス", "atlas"],
  "Wukong": ["ウーコン", "wukong", "猿"],
  "Ivara": ["アイヴァラ", "イバラ", "ivara"],
  "Nezha": ["ネジャ", "nezha"],
  "Inaros": ["イナロス", "inaros"],
  "Titania": ["ティターニア", "titania"],
  "Nidus": ["ナイダス", "nidus"],
  "Octavia": ["オクタヴィア", "オクタビア", "octavia"],
  "Harrow": ["ハロウ", "ハロー", "harrow"],
  "Gara": ["ガラ", "gara"],
  "Khora": ["コーラ", "khora"],
  "Revenant": ["レヴェナント", "レベナント", "revenant"],
  "Garuda": ["ガルーダ", "garuda"],
  "Baruuk": ["バルーク", "baruuk"],
  "Hildryn": ["ヒルドリン", "hildryn"],
  "Wisp": ["ウィスプ", "wisp"],
  "Gauss": ["ガウス", "gauss"],
  "Grendel": ["グレンデル", "grendel"],
  "Protea": ["プロテア", "protea"],
  "Xaku": ["ザク", "xaku"],
  "Lavos": ["ラヴォス", "ラボス", "lavos"],
  "Sevagoth": ["セヴァゴス", "セバゴス", "sevagoth"],
  "Yareli": ["ヤレリ", "yareli"],
  "Caliban": ["カリバン", "caliban"],
  "Gyre": ["ジャイア", "gyre"],
  "Styanax": ["ステュアナックス", "ステアナックス", "styanax"],
  "Voruna": ["ヴォルーナ", "ボルーナ", "voruna"],
  "Citrine": ["シトリン", "citrine"],
  "Kullervo": ["クレルヴォ", "クレルボ", "kullervo"],
  "Dagath": ["ダガス", "dagath"],
  "Qorvex": ["コーヴェックス", "コーベックス", "qorvex"],
  "Dante": ["ダンテ", "dante"],
  "Jade": ["ジェイド", "jade"],

  // --- Common Weapons (Examples) ---
  "Braton": ["ブラトン", "braton"],
  "Skana": ["スカナ", "skana"],
  "Lato": ["ラト", "lato"]
};

// ひらがなをカタカナに変換する関数
export function hiraganaToKatakana(str) {
  return str.replace(/[\u3041-\u3096]/g, function(match) {
    var chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

// 予測変換用の候補を取得する関数
export function getSuggestions(query, type) {
  if (!query || query.length < 1) return [];
  
  const lowerQuery = query.toLowerCase().trim();
  // ひらがな入力をカタカナにも変換して両方でマッチングする
  const kataQuery = hiraganaToKatakana(lowerQuery);
  
  const suggestions = [];
  
  // 1. AliasMapから検索 (Warframes, Weapons etc)
  if (type === 'warframes' || type === 'all') {
    for (const [englishName, aliases] of Object.entries(aliasMap)) {
      if (
        englishName.toLowerCase().startsWith(lowerQuery) || 
        aliases.some(alias => alias.startsWith(lowerQuery) || alias.startsWith(kataQuery))
      ) {
        // 日本語の代表名（配列の先頭）を取得
        const jpName = aliases.find(a => a.match(/[\u30a0-\u30ff\u3040-\u309f\u4e00-\u9faf]/)) || aliases[0];
        suggestions.push({
          value: englishName,
          label: `${englishName} (${jpName})`
        });
      }
    }
  }

  // 2. もしレリックなら簡単なサジェスト (Lith, Meso, Neo, Axi)
  if (type === 'relics' || type === 'all') {
    const relicEras = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'];
    const relicErasJP = { 'Lith': 'リス', 'Meso': 'メソ', 'Neo': 'ネオ', 'Axi': 'アクシ', 'Requiem': 'レクイエム', 'Omnia': 'オムニア' };
    
    relicEras.forEach(era => {
      const eraLower = era.toLowerCase();
      const eraJpLower = relicErasJP[era] || '';
      
      // "li", "lith", "り", "りす", "リス" 等にマッチ
      if (eraLower.startsWith(lowerQuery) || eraJpLower.startsWith(lowerQuery) || eraJpLower.startsWith(kataQuery)) {
        suggestions.push({
          value: era,
          label: `${era} レリック (${relicErasJP[era]})`
        });
      } else if (lowerQuery.startsWith(eraLower + ' ') || lowerQuery.startsWith(eraJpLower)) {
        // "Lith G1" などの入力途中
        const suffix = lowerQuery.replace(eraLower, '').replace(eraJpLower, '').replace(kataQuery.replace(eraJpLower, ''), '').trim().toUpperCase();
        suggestions.push({
          value: `${era} ${suffix} Relic`,
          label: `${era} ${suffix} レリック`
        });
      }
    });
  }

  return suggestions.slice(0, 10); // 最大10件
}

/**
 * ユーザーの入力文字列を英語のベース名に変換します。
 * 見つからない場合は入力文字列をそのまま返します（API側でよしなに処理させるため）。
 */
export function resolveAlias(inputName) {
  if (!inputName) return inputName;
  
  const lowerInput = inputName.toLowerCase().trim();
  const kataInput = hiraganaToKatakana(lowerInput);
  
  // "Prime" や "Umbra" のようなサフィックスを保持するため、ベース部分だけを判定する
  // 例: "エクスカリバー prime" -> "Excalibur Prime"
  const suffixMatch = lowerInput.match(/ (prime|umbra|wraith|vandal|prisma|kuva|tenet)$/i) || 
                      kataInput.match(/(プライム|アンブラ)$/);
  let suffix = "";
  let baseQuery = lowerInput;
  let baseKataQuery = kataInput;
  
  if (suffixMatch) {
    if (suffixMatch[1] === 'プライム' || suffixMatch[1] === 'prime') suffix = " Prime";
    else if (suffixMatch[1] === 'アンブラ' || suffixMatch[1] === 'umbra') suffix = " Umbra";
    else suffix = " " + suffixMatch[1].charAt(0).toUpperCase() + suffixMatch[1].slice(1).toLowerCase();
    
    baseQuery = lowerInput.replace(suffixMatch[0], "").trim();
    baseKataQuery = kataInput.replace(suffixMatch[0], "").trim();
  }

  // エイリアスマップから検索
  for (const [englishName, aliases] of Object.entries(aliasMap)) {
    if (aliases.includes(baseQuery) || aliases.includes(baseKataQuery) || englishName.toLowerCase() === baseQuery) {
      return englishName + suffix;
    }
  }

  return inputName; // そのまま返す
}
