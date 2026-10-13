// Warframe_spport/src/features/multiplayer/components/LobbyChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import type { Lobby } from '../types';

interface Props {
  lobby: Lobby;
  currentSocketId: string;
  onSendMessage: (text: string) => void;
}

export const LobbyChatPanel: React.FC<Props> = ({
  lobby,
  currentSocketId,
  onSendMessage
}) => {
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const me = lobby.members.find(m => m.socketId === currentSocketId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lobby.messages]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        height: '480px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <MessageSquare size={18} style={{ color: '#00d2ff' }} />
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc' }}>
          ロビー作戦チャット
        </h3>
      </div>

      {/* Chat history */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'rgba(0, 0, 0, 0.25)',
          borderRadius: '8px',
          padding: '12px',
          marginBottom: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {lobby.messages.map(msg => {
          if (msg.isSystem) {
            return (
              <div
                key={msg.id}
                style={{
                  textAlign: 'center',
                  fontSize: '11px',
                  color: 'var(--text-muted, #64748b)',
                  padding: '4px 8px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '4px'
                }}
              >
                {msg.message}
              </div>
            );
          }

          const isMyMsg = msg.username === me?.inGameName || msg.username === me?.username;
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMyMsg ? 'flex-end' : 'flex-start'
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '2px' }}>
                {msg.username} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  wordBreak: 'break-word',
                  background: isMyMsg ? 'var(--primary-color, #00d2ff)' : 'rgba(255, 255, 255, 0.1)',
                  color: isMyMsg ? '#0f172a' : '#f8fafc',
                  fontWeight: isMyMsg ? 600 : 400
                }}
              >
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={chatInput}
          onChange={e => setChatInput(e.target.value)}
          placeholder="作戦やビルドについて発言..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            fontSize: '13px'
          }}
        />
        <button
          type="submit"
          disabled={!chatInput.trim()}
          className="primary-btn"
          style={{
            padding: '0 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Send size={16} />
          送信
        </button>
      </form>
    </div>
  );
};
