// Warframe_spport/src/features/multiplayer/components/LobbySquadSlots.tsx
import React, { useState } from 'react';
import { Users, Copy, Check, CheckCircle } from 'lucide-react';
import type { Lobby } from '../types';

interface Props {
  lobby: Lobby;
  currentSocketId: string;
  isHost: boolean;
  isNarin: boolean;
  onToggleReady: () => void;
  onChangeWarframe: (wf: string) => void;
  myWarframe: string;
}

export const LobbySquadSlots: React.FC<Props> = ({
  lobby,
  currentSocketId,
  isHost,
  isNarin,
  onToggleReady,
  onChangeWarframe,
  myWarframe
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const me = lobby.members.find(m => m.socketId === currentSocketId);
  const host = lobby.members.find(m => m.isHost) || lobby.members[0];

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  // ゲーム内コマンド文字列の生成
  const whisperHostText = host ? `/w ${host.inGameName} テンノナビの募集から来ました！よろしくお願いします。` : '';
  const inviteAllText = lobby.members
    .filter(m => !m.isHost)
    .map(m => `/invite ${m.inGameName}`)
    .join(' ');
  const recruitChatText = isNarin
    ? `H [氷河の縛り] ${lobby.targetMission || '全ステージ'} 重複禁止 (${lobby.members.length}/${lobby.maxMembers})`
    : `H [${lobby.targetMission || lobby.missionCategory}] (${lobby.members.length}/${lobby.maxMembers})`;

  // Warframe重複検知（氷河の縛り専用ルール）
  const frameCounts = lobby.members.reduce((acc, m) => {
    const name = m.warframe?.trim().toLowerCase();
    if (name) acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const hasDuplicateFrame = isNarin && Object.values(frameCounts).some(count => count > 1);

  return (
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

      {/* Duplicate Frame Alert for Icebind */}
      {hasDuplicateFrame && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '12px',
            lineHeight: '1.5'
          }}
        >
          ⚠️ <strong>【出撃不可】Warframeの重複が検出されました！</strong><br />
          「氷河の縛り」では同フレームの出撃が禁止されています。別フレームに変更してください。
        </div>
      )}

      {/* Member Slot Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {Array.from({ length: lobby.maxMembers }).map((_, index) => {
          const member = lobby.members[index];
          const isSlotMe = member?.socketId === currentSocketId;
          const isDup = isNarin && Boolean(member?.warframe && frameCounts[member.warframe.trim().toLowerCase()] > 1);

          if (member) {
            return (
              <div
                key={member.socketId}
                style={{
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: isDup
                    ? 'rgba(239, 68, 68, 0.1)'
                    : isSlotMe
                    ? 'rgba(0, 210, 255, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid',
                  borderColor: isDup
                    ? 'rgba(239, 68, 68, 0.5)'
                    : isSlotMe
                    ? 'rgba(0, 210, 255, 0.3)'
                    : 'rgba(255, 255, 255, 0.08)',
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
                      background: isDup
                        ? 'rgba(239, 68, 68, 0.2)'
                        : member.isHost
                        ? 'rgba(255, 183, 3, 0.2)'
                        : 'rgba(56, 189, 248, 0.15)',
                      color: isDup ? '#f87171' : member.isHost ? '#fbbf24' : '#38bdf8',
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
                      {isDup && (
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700 }}>
                          重複中！
                        </span>
                      )}
                      {isSlotMe && (
                        <span style={{ fontSize: '10px', color: '#38bdf8' }}>(あなた)</span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary, #94a3b8)', marginTop: '2px' }}>
                      フレーム: <strong style={{ color: isDup ? '#f87171' : '#bae6fd' }}>{member.warframe || 'Excalibur'}</strong>
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
  );
};
