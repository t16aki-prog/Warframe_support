// Warframe_spport/src/features/multiplayer/components/LobbyHeaderBanner.tsx
import React from 'react';
import { Users, Snowflake, LogOut, Play, XCircle } from 'lucide-react';
import type { Lobby, LobbyStatus } from '../types';

interface Props {
  lobby: Lobby;
  isHost: boolean;
  isNarin: boolean;
  onLeave: () => void;
  onUpdateStatus: (status: LobbyStatus) => void;
}

export const LobbyHeaderBanner: React.FC<Props> = ({
  lobby,
  isHost,
  isNarin,
  onLeave,
  onUpdateStatus
}) => {
  return (
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
              {isNarin ? '❄️ 氷河の縛り (The Icebind) 専用ロビー' : '通常マルチロビー'}
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
  );
};
