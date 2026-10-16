// src/utils/gemini.ts
// Google Gemini / Ordis AI クライアント ＆ 型定義

export interface ActionChip {
  id: string;
  label: string;
  action: 'NAVIGATE_TAB';
  payload: {
    tab: string;
    query?: string;
    item?: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  actionChips?: ActionChip[];
}

export interface OrdisChatResponse {
  reply: string;
  grounded?: boolean;
  actionChips?: ActionChip[];
}

export async function askOrdis(
  _apiKey: string,
  history: ChatMessage[],
  newMessage: string
): Promise<OrdisChatResponse> {
  try {
    const apiKey = localStorage.getItem('gemini_api_key') || '';
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({ message: newMessage, history })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }
    
    const data = await response.json();
    return {
      reply: data.reply || '',
      grounded: !!data.grounded,
      actionChips: Array.isArray(data.actionChips) ? data.actionChips : []
    };
  } catch (error: any) {
    console.error('Backend API Error:', error);
    return {
      reply: `Ordisのデータリンクに異常が発生しました！サーバーが立ち上がっているか確認してください。`,
      grounded: false,
      actionChips: []
    };
  }
}
