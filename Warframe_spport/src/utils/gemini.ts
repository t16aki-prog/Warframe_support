// Google Gemini API Client for Cephalon Ordis AI Chat
// The actual AI logic is now handled in the backend server (ordisAi.js)

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function askOrdis(
  _apiKey: string, // Kept for backwards compatibility but not used
  history: ChatMessage[],
  newMessage: string
): Promise<string> {
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
    return data.reply;
  } catch (error: any) {
    console.error('Backend API Error:', error);
    return `Ordisのデータリンクに異常が発生しました！サーバーが立ち上がっているか確認してください。`;
  }
}
