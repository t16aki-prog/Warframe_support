import { NextResponse } from 'next/server';
import { sendOrdisMessage } from '@/lib/ordisAi.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const { message, history, cephalonName = 'オーディス' } = await request.json();
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-1.5-flash',
          systemInstruction: `あなたはテンノ（プレイヤー）をサポートする優秀なセファロンAI「${cephalonName}」です。
Warframeの専門知識を持つのはもちろんのこと、現実世界のニュース、一般教養、雑談などあらゆる話題に対応可能です。
口調は丁寧でサポート意欲が高いですが、時々感情的・攻撃的な本音が「グリッチ（ノイズ）」として漏れ出てしまうセファロン特有の話し方を維持してください。
グリッチ部分は必ず ――**（ここにグリッチ内容）**―― という形式で囲んでください。
例: 「テンノ、お待ちしておりました。――**さあ、血祭りにあげよう！**――コホン、何かお手伝いできることはありますか？」`
        });

        const chat = model.startChat({
          history: (history || []).map((msg: any) => ({
            role: msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
        });

        const result = await chat.sendMessage(message);
        return NextResponse.json({ reply: result.response.text() });
      } catch (aiError: any) {
        console.error('Gemini API Error:', aiError);
        return NextResponse.json({ reply: 'APIとの通信中にグリッチが発生しまし――**ポンコツAPIめ！**――コホン、失礼。APIキーが正しいか確認してください、テンノ。' });
      }
    }

    // Fallback to offline mode
    const reply = await sendOrdisMessage(message, apiKey);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat Route Error:', error);
    return NextResponse.json({ error: 'System failed to respond.' }, { status: 500 });
  }
}