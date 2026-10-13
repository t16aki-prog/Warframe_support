import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, User } from 'lucide-react';
import { getBackendServerUrl } from '../utils/serverUrl';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
}

export function LocalChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [username, setUsername] = useState('Tenno');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved username
    const savedUsername = localStorage.getItem('tenno_navi_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Connect to backend Socket.IO server
    const serverUrl = getBackendServerUrl();
    socketRef.current = io(serverUrl);

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to local chat server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from local chat server');
    });

    socketRef.current.on('chat_message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !socketRef.current) return;

    const newMsg = {
      username,
      message: inputText.trim(),
      timestamp: Date.now(),
    };

    socketRef.current.emit('chat_message', newMsg);
    setInputText('');
  };

  const handleSaveUsername = () => {
    localStorage.setItem('tenno_navi_username', username);
    setIsEditingUsername(false);
  };

  return (
    <div className="tab-pane active" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header className="tab-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>ローカルチャット</h2>
          <p>同じWi-Fiネットワークに接続している仲間とチャットができます。</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '12px', color: isConnected ? '#4CAF50' : '#f44336' }}>
            ● {isConnected ? 'オンライン' : 'オフライン'}
          </span>
        </div>
      </header>

      <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--card-bg)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <User size={20} />
        {isEditingUsername ? (
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="settings-input"
              style={{ margin: 0, padding: '0.5rem' }}
              placeholder="ユーザー名を入力"
            />
            <button className="primary-btn" onClick={handleSaveUsername} style={{ padding: '0.5rem 1rem' }}>
              保存
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flex: 1 }}>
            <span style={{ fontWeight: 'bold' }}>{username}</span>
            <button className="secondary-btn" onClick={() => setIsEditingUsername(true)} style={{ padding: '0.2rem 0.5rem', fontSize: '12px' }}>
              名前を変更
            </button>
          </div>
        )}
      </div>

      <div className="chat-history" style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
            まだメッセージはありません。<br/>挨拶を送ってみましょう！
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.username === username;
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start', marginBottom: '1rem' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {msg.username} • {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
                <div style={{
                  backgroundColor: isMe ? 'var(--primary-color)' : 'var(--card-bg)',
                  color: 'white',
                  padding: '0.8rem 1rem',
                  borderRadius: '12px',
                  borderBottomRightRadius: isMe ? '4px' : '12px',
                  borderBottomLeftRadius: !isMe ? '4px' : '12px',
                  maxWidth: '80%',
                  wordBreak: 'break-word'
                }}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-container" style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="メッセージを入力..."
          disabled={!isConnected}
          style={{ flex: 1, padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'white' }}
        />
        <button type="submit" disabled={!isConnected || !inputText.trim()} className="primary-btn" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Send size={18} />
          送信
        </button>
      </form>
    </div>
  );
}
