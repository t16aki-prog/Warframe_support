// ordisAi.js
// オフライン専用（AIレス）版

import { searchRelics, searchWarframeParts, getVaultedPrimes } from './warframeData.js';
import { getOfflineBuild } from './staticBuilds.js';

export async function initOrdisChat() {
  console.log('Ordis offline chat session initialized.');
}

export async function sendOrdisMessage(userMessage) {
  const msg = userMessage.toLowerCase();
  
  // Rule-based chat responses
  if (msg.includes('レリック') || msg.includes('relic')) {
    const match = userMessage.match(/([a-zA-Z]+) ([a-zA-Z0-9]+)/);
    if (match) {
      const data = searchRelics(match[0]);
      return `オペレーター、該当するレリックの情報をデータベースから引き出しました...\n${JSON.stringify(data, null, 2)}`;
    }
    return 'どのレリックをお探しですか、オペレーター？「Lith G1」のようにおっしゃってください。';
  }
  
  if (msg.includes('フレーム') || msg.includes('warframe')) {
    return 'フレームのドロップ場所ですね。アイテム名で検索機能を使用してください。';
  }
  
  if (msg.includes('vault') || msg.includes('ヴォールト')) {
    const data = getVaultedPrimes();
    return `現在ヴォールト入りしているプライムアイテムのリストです：\n${data.join(', ')}`;
  }
  
  if (msg.includes('おはよう') || msg.includes('こんにちは') || msg.includes('hello')) {
    return 'オペレーター、お待ちしておりました。オーディスは...敵を皆殺しに...あぁ、システムのメンテナンスを行っていました。';
  }

  if (msg.includes('ありがとう') || msg.includes('thanks') || msg.includes('サンキュー')) {
    return '光栄です、オペレーター！オーディスのデータ回路が温かい気持ちで満たされています...。次は何をお手伝いしましょうか？';
  }

  if (msg.includes('おすすめ') || msg.includes('オススメ') || msg.includes('強い')) {
    return 'オペレーターのプレイスタイルによりますが...生存力なら Rhino や Revenant、殲滅力なら Saryn や Mesa が...星系を血の海に...あぁ、非常に強力です。近接武器では Glaive Prime が現在のメタで猛威を振るっています。';
  }

  if (msg.includes('ビルド') || msg.includes('build')) {
    return 'ビルド構成ですね。「フレームビルド」のタブから各アイテムを選択してください。オーディスが最適なMOD構成を計算いたします。';
  }

  return 'オペレーター、申し訳ありません。現在オーディスの通信モジュールはオフラインモードで動作しているため、複雑な会話には対応できません...。左側のメニューから各機能をご利用ください。';
}

export async function generateWarframeBuild(itemName, clientApiKey, category = 'Warframe') {
  // オフラインデータベースから静的なビルド情報を取得
  const buildData = getOfflineBuild(itemName, category);
  return buildData;
}
