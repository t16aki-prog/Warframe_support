// Warframe_spport/src/features/multiplayer/components/LobbyRoomView.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Users,
  Snowflake,
  Copy,
  Check,
  LogOut,
  Send,
  Play,
  XCircle,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import type { Lobby, LobbyStatus } from '../types';

interface Props {
  lobby: Lobby;
  currentSocketId: string;
  onLeave: () => void;
  onToggleReady: () => void;
  onUpdateStatus: (status: LobbyStatus) => void;
  onSendMessage: (text: string) => void;
  onChangeWarframe: (wf: string) => void;
  myWarframe: string;
}

export const LobbyRoomView: React.FC<Props> = ({
  lobby,
  currentSocketId,
  onLeave,
  onToggleReady,
  onUpdateStatus,
  onSendMessage,
  onChangeWarframe,
  myWarframe
}) => {
  const [chatInput, setChatInput] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const me = lobby.members.find(m => m.socketId === currentSocketId);
  const isHost = me?.isHost ?? false;
  const isNarin = lobby.type === 'narin';
  const host = lobby.members.find(m => m.isHost) || lobby.members[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lobby.messages]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onSendMessage(chatInput);
    setChatInput('');
  };

  // ゲーム内コマンド文字列の生成
  const whisperHostText = host ? `/w ${host.inGameName} テンノナビの募集から来ました！よろしくお願いします。` : '';
  const inviteAllText = lobby.members
    .filter(m => !m.isHost)
    .map(m => `/invite ${m.inGameName}`)
    .join(' ');
  const recruitChatText = isNarin
    ? `H [Narin縛り] ${lobby.targetMission || lobby.missionCategory} (${lobby.members.length}/${lobby.maxMembers})`
    : `H [${lobby.targetMission || lobby.missionCategory}] (${lobby.members.length}/${lobby.maxMembers})`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div
        className={`glass-card ${isNarin ? 'neon-frost' : ''}`}
        style={{
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid',
          borderColor: isNarin ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.15)',
          background: isNarin
            ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.9) 100%)'
            : 'rgba(15, 23, 42, 0.8)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className={`badge ${isNarin ? 'frost' : 'blue'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {isNarin ? <Snowflake size={14} /> : <Users size={14} />}
                {isNarin ? '❄️ Narin縛りマルチロビー' : '通常マルチロビー'}
              </span>
              <span style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                {lobby.missionCategory}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontWeight: 700,
                  color: lobby.status === 'departed' ? '#38bdf8' : lobby.status === 'full' ? '#f59e0b' : '#22c55e',
                  background: 'rgba(255,255,255,0.05)'
                }}
              >
                ● {lobby.status === 'departed' ? '出撃中' : lobby.status === 'full' ? '満員' : '募集中'}
              </span>
            </div>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>
              {lobby.title}
            </h2>

            {lobby.targetMission && (
              <p style={{ fontSize: '14px', color: '#38bdf8', marginBottom: '6px' }}>
                🎯 目標: <strong>{lobby.targetMission}</strong>
              </p>
            )}

            {isNarin && lobby.narinRuleDescription && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '13px',
                  color: '#bae6fd',
                  whiteSpace: 'pre-line'
                }}
              >
                <strong>⚠️ 縛りルール:</strong> {lobby.narinRuleDescription}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={onLeave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px'
              }}
            >
              <LogOut size={16} />
              ロビー退出
            </button>

            {isHost && (
              <>
                <button
                  onClick={() => onUpdateStatus(lobby.status === 'departed' ? 'recruiting' : 'departed')}
                  className="primary-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: lobby.status === 'departed'
                      ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)'
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    fontWeight: 700,
                    fontSize: '13px'
                  }}
                >
                  <Play size={16} />
                  {lobby.status === 'departed' ? '募集中に戻す' : '出撃開始！'}
                </button>

                <button
                  onClick={() => onUpdateStatus('closed')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '13px'
                  }}
                >
                  <XCircle size={16} />
                  ロビー解散
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Squad Slots (Left) & Chat/Tools (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Left: Squad Members */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ color: '#00d2ff' }} />
              分隊スロット ({lobby.members.length} / {lobby.maxMembers})
            </h3>
            {!isHost && (
              <button
                onClick={onToggleReady}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: me?.ready ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                  background: me?.ready ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: me?.ready ? '#4ade80' : '#fbbf24'
                }}
              >
                {me?.ready ? <CheckCircle size={14} /> : null}
                {me?.ready ? 'READY (準備完了)' : '未完了 (クリックでReady)'}
              </button>
            )}
          </div>

          {/* Member Slot Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Array.from({ length: lobby.maxMembers }).map((_, index) => {
              const member = lobby.members[index];
              const isSlotMe = member?.socketId === currentSocketId;

              if (member) {
                return (
                  <div
                    key={member.socketId}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: isSlotMe ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid',
                      borderColor: isSlotMe ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: member.isHost ? 'rgba(255, 183, 3, 0.2)' : 'rgba(56, 189, 248, 0.15)',
                          color: member.isHost ? '#fbbf24' : '#38bdf8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '14px'
                        }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 700, color: '#f8fafc', fontSize: '14px' }}>
                            {member.inGameName}
                          </span>
                          {member.isHost && (
                            <span className="badge gold" style={{ fontSize: '10px', padding: '2px 6px' }}>
                              HOST
                            </span>
                          )}
                          {isSlotMe && (
                            <span style={{ fontSize: '10px', color: '#38bdf8' }}>(あなた)</span>
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                          フレーム: <strong style={{ color: '#bae6fd' }}>{member.warframe || 'Excalibur'}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      {member.ready ? (
                        <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> Ready
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 600 }}>
                          準備中...
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              // Empty Slot
              return (
                <div
                  key={`empty_${index}`}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px dashed rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: 'var(--text-muted, #64748b)'
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    {index + 1}
                  </div>
                  <span style={{ fontSize: '13px' }}>空きスロット (待機中...)</span>
                </div>
              );
            })}
          </div>

          {/* Quick Warframe Switch for Me */}
          {me && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '6px' }}>
                自分の使用Warframeを変更
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={myWarframe}
                  onChange={e => onChangeWarframe(e.target.value)}
                  placeholder="フレーム名"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff',
                    fontSize: '13px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Warframe In-Game One-Click Copy Tools */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
              ⚡ Warframeゲーム内コピペツール
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {!isHost && host && (
                <button
                  onClick={() => handleCopy(whisperHostText, 'whisper')}
                  className="secondary-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}
                >
                  <span>ホストにささやきを送る定型文</span>
                  {copiedType === 'whisper' ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </button>
              )}

              {isHost && inviteAllText && (
                <button
                  onClick={() => handleCopy(inviteAllText, 'invite')}
                  className="secondary-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    fontSize: '12px'
                  }}
                >
                  <span>参加メンバーを一括招待 (/invite)</span>
                  {copiedType === 'invite' ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                </button>
              )}

              <button
                onClick={() => handleCopy(recruitChatText, 'recruit')}
                className="secondary-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  fontSize: '12px'
                }}
              >
                <span>ゲーム内リクルートチャット用定型文</span>
                {copiedType === 'recruit' ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Lobby Chat */}
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
      </div>
    </div>
  );
};
