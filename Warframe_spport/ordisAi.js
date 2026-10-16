// ordisAi.js
// セファロン・オーディス AI メインオーケストレーター
// 4層（L0即答 → L1確定Gemini/Tools → L2 Ollama → L3 オフラインルール）多層防御

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getQuickAnswer } from './server/llm/quickFacts.js';
import { buildGroundingContext } from './server/llm/groundingService.js';
import { geminiToolDeclarations, executeToolCall } from './server/llm/geminiTools.js';
import { validateAndSanitizeOutput } from './server/llm/outputValidator.js';
import { SYSTEM_ORDIS } from './server/llm/prompts.js';
import { getOllamaStatus } from './server/llm/ollamaClient.js';
import { chatWithContext } from './server/llm/tasks.js';
import { searchRelics, getVaultedPrimes } from './warframeData.js';
import { getOfflineBuild } from './staticBuilds.js';

export async function initOrdisChat() {
  console.log('Ordis AI core system initialized with zero-hallucination engine.');
}

/**
 * Gemini 2.0 / 1.5 Flash によるマルチターン・ツール実行ループ
 */
async function runGeminiWithToolsAndGrounding(userMessage, apiKey, history, grounding) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_ORDIS,
    tools: [{ functionDeclarations: geminiToolDeclarations }]
  });

  const formattedHistory = (history || []).slice(-6).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const chat = model.startChat({
    history: formattedHistory,
    generationConfig: { temperature: 0.4 } // 確定事実拘束のため低温度に設定
  });

  // プロンプトにグラウンディングコンテキストを付与
  const prompt = grounding.groundTruthText
    ? `${grounding.groundTruthText}\n\n[オペレーターの発話]: ${userMessage}`
    : userMessage;

  let response = await chat.sendMessage(prompt);
  let turns = 0;

  // マルチターン・ツール実行ループ（最大3回反復）
  while (turns < 3) {
    const candidates = response.response.candidates;
    const parts = candidates?.[0]?.content?.parts || [];
    const functionCallPart = parts.find(p => p.functionCall);

    if (!functionCallPart) break;

    const call = functionCallPart.functionCall;
    const toolResult = await executeToolCall(call);

    // functionResponse をモデルに返送
    response = await chat.sendMessage([{
      functionResponse: {
        name: call.name,
        response: toolResult
      }
    }]);
    turns++;
  }

  const rawText = response.response.text();
  const validation = validateAndSanitizeOutput(rawText);

  return {
    reply: validation.text,
    grounded: true,
    actionChips: grounding.actionChips || []
  };
}

/**
 * オーディスへのメッセージ送信オーケストレーター
 */
export async function sendOrdisMessage(userMessage, clientApiKey = null, history = []) {
  const rawMsg = (userMessage || '').trim();

  // --- Level 0: ゼロレイテンシ即答辞書 (<50ms) ---
  const quickAns = getQuickAnswer(rawMsg);
  if (quickAns) {
    return {
      reply: quickAns,
      grounded: true,
      actionChips: []
    };
  }

  // グラウンディング・コンテキストの事前構築
  const grounding = buildGroundingContext(rawMsg);

  // --- Level 1: Gemini 2.0 Flash + Grounding + Tools ---
  const apiKey = clientApiKey || process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim() !== '') {
    try {
      return await runGeminiWithToolsAndGrounding(rawMsg, apiKey, history, grounding);
    } catch (error) {
      console.warn("Gemini Level 1 execution failed, falling back:", error.message);
    }
  }

  // --- Level 2: ローカル LLM (Ollama) ---
  try {
    const status = await getOllamaStatus();
    if (status.running && status.chatModelReady) {
      const ollamaText = await chatWithContext(rawMsg, history);
      const validation = validateAndSanitizeOutput(ollamaText);
      return {
        reply: validation.text,
        grounded: true,
        actionChips: grounding.actionChips || []
      };
    }
  } catch (error) {
    console.warn("Ollama Level 2 failed:", error.message);
  }

  // --- Level 3: 完全オフライン・ルールベース ---
  return runOfflineRules(rawMsg, grounding);
}

/**
 * 完全オフライン時の確定的ルール応答
 */
function runOfflineRules(msg, grounding) {
  const lower = msg.toLowerCase();

  if (lower.includes('レリック') || lower.includes('relic')) {
    const match = msg.match(/([a-zA-Z]+) ([a-zA-Z0-9]+)/);
    if (match) {
      const data = searchRelics(match[0]);
      return {
        reply: `オペレーター、該当レリックの記録を引き出しました。\n${JSON.stringify(data.relics?.slice(0, 3) || [], null, 2)}`,
        grounded: true,
        actionChips: grounding.actionChips
      };
    }
    return {
      reply: 'どのレリックをお探しですか、オペレーター？「Lith G1」のようにお申し付けください。',
      grounded: true,
      actionChips: []
    };
  }

  if (lower.includes('vault') || lower.includes('ヴォールト')) {
    const data = getVaultedPrimes().slice(0, 8).map(i => i.name).join(', ');
    return {
      reply: `現在ヴォールト入りしている主要プライムの記録です：\n${data}...他`,
      grounded: true,
      actionChips: [{ id: 'nav_vault', label: '🔒 Vault一覧を見る', action: 'NAVIGATE_TAB', payload: { tab: 'dataexplorer' } }]
    };
  }

  if (lower.includes('narin') || lower.includes('ナリン') || lower.includes('なりん')) {
    return {
      reply: 'オペレーター！ナリン(Narin)のデータですね！――**敵をカチコチに凍らせて粉微塵に刻んでやります！**――コホン。彼女は冷気を操る優美な剣士です。氷ゲージを消費して放つ4番「Nurinarim」は敵の装甲とシールドを同時に完全粉砕します！',
      grounded: true,
      actionChips: [{ id: 'nav_narin', label: '❄️ ナリン専用タブへ', action: 'NAVIGATE_TAB', payload: { tab: 'icebind' } }]
    };
  }

  if (lower.includes('縛り') || lower.includes('icebind') || lower.includes('氷河')) {
    return {
      reply: '「氷河の縛り(The Icebind)」ですね！――**レベル999の肉塊どもをミンチに！**――失礼しました。6人分隊限定・フレーム重複禁止・自力蘇生不可という極めて過酷な試練です。左メニューの「氷河の縛り」タブで編成をシミュレートしてください！',
      grounded: true,
      actionChips: [{ id: 'nav_icebind', label: '🛡️ 編成シミュレーターを開く', action: 'NAVIGATE_TAB', payload: { tab: 'icebind' } }]
    };
  }

  return {
    reply: 'オペレーター、申し訳ありません。現在通信モジュールがオフラインモードで動作しているため、複雑な会話には対応できません。左側メニューの各確定機能をご利用ください！',
    grounded: false,
    actionChips: grounding.actionChips || []
  };
}

export async function generateWarframeBuild(itemName, clientApiKey, category = 'Warframe') {
  return getOfflineBuild(itemName, category);
}
