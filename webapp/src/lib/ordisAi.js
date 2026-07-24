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

  return 'オペレーター、申し訳ありません。現在オーディスの通信モジュールはオフラインモードで動作しているため、複雑な会話には対応できません...。左側のメニューから各機能をご利用ください。';
}

export async function generateWarframeBuild(itemName, clientApiKey, category = 'Warframe') {
  // オフラインデータベースから静的なビルド情報を取得
  const buildData = getOfflineBuild(itemName, category);
  return buildData;
}
