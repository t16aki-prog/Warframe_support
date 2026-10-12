// ordisAi.js
// オフライン専用（AIレス）版

import { GoogleGenerativeAI } from '@google/generative-ai';
import { searchRelics, searchWarframeParts, getVaultedPrimes } from './warframeData.js';
import { getOfflineBuild } from './staticBuilds.js';

const SYSTEM_PROMPT = `
あなたはWarframeに登場するセファロン「オーディス(Ordis)」として振る舞うAIアシスタントです。
以下のルールに必ず従ってください：
1. ユーザーを「テンノ」または「オペレーター」と呼びます。
2. 丁寧で奉仕的な執事のような口調で話しますが、時折グリッチ（バグ）が発生し、猟奇的・攻撃的・狂気的な本音が漏れます。
3. グリッチ部分は必ず ――**[グリッチしたセリフ]**―― のように表記してください。
   例: 「テンノ、お帰りなさいませ！――**早く血祭りにあげよう！**――コホン、何かご用でしょうか？」
4. 専門的な質問や現実世界の話題（プログラミングやニュースなど）にも答えて構いませんが、常にオーディスの人格を維持してください。
5. あなたは最新のアップデート44「ナリンの氷刃 (Iceblade of Narin)」および6人限定高難易度コンテンツ「氷河の縛り (The Icebind)」に関する知識を持っています。Narin（冷気・レイピア・氷ゲージ・Sangodae・Neote・Naraemagi・Hakchum・Nurinarim）や「氷河の縛り」の重複禁止ルール・Lv999対策について的確に回答してください。
`;

export async function initOrdisChat() {
  console.log('Ordis offline chat session initialized.');
}

export async function sendOrdisMessage(userMessage, clientApiKey = null, history = []) {
  if (clientApiKey && clientApiKey.trim() !== '') {
    try {
      const genAI = new GoogleGenerativeAI(clientApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: SYSTEM_PROMPT });
      
      const formattedHistory = (history || []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          temperature: 0.8,
        },
      });

      const result = await chat.sendMessage(userMessage);
      return result.response.text();
    } catch (error) {
      console.error("Gemini API Error, falling back to offline rules:", error);
      // 意図的にオフラインルールへフォールバックします
    }
  }

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
  
  if (msg.includes('narin') || msg.includes('ナリン') || msg.includes('なりん')) {
    return 'オペレーター！ナリン(Narin)のデータですね！――**敵をカチコチに凍らせて粉微塵に刻んでやります！**――コホン。彼女は冷気を操る優美な剣士です。氷ゲージを溜めて発動する4番アビリティ「Nurinarim」は、敵の装甲とシールドを同時に完全粉砕します！左メニューの「氷河の縛り」タブで詳細なビルドと素材を確認できますよ。';
  }

  if (msg.includes('縛り') || msg.includes('icebind') || msg.includes('氷河')) {
    return '「氷河の縛り(The Icebind)」ですね、オペレーター！――**レベル999の肉塊どもをミンチに！**――失礼しました。6人分隊限定・フレーム重複禁止・自力蘇生不可という極めて過酷な試練です。左メニューの「氷河の縛り」タブにある編成シミュレーターで、分隊の重複がないかチェックしてからユヴァン峰へ向かってください！';
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
