// Warframe_spport/src/features/multiplayer/components/LobbyCard.tsx
import React from 'react';
import { Users, Snowflake, Shield, ArrowRight, Clock } from 'lucide-react';
import type { Lobby } from '../types';

interface Props {
  lobby: Lobby;
  onJoin: (id: string) => void;
  isMyLobby: boolean;
}

export const LobbyCard: React.FC<Props> = ({ lobby, onJoin, isMyLobby }) => {
  const isNarin = lobby.type === 'narin';
  const isFull = lobby.members.length >= lobby.maxMembers;
  const isClosed = lobby.status === 'closed';
  const isDeparted = lobby.status === 'departed';

  const host = lobby.members.find(m => m.isHost) || lobby.members[0];

  return (
    <div
      className={`glass-card ${isNarin ? 'neon-frost' : ''}`}
      style={{
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: isNarin ? 'rgba(56, 189, 248, 0.35)' : 'rgba(255, 255, 255, 0.1)',
        background: isNarin
          ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)'
          : 'var(--card-bg, rgba(30, 41, 59, 0.7))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {/* Header Tags */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span
              className={`badge ${isNarin ? 'frost' : 'blue'}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                padding: '3px 8px'
              }}
            >
              {isNarin ? <Snowflake size={12} /> : <Users size={12} />}
              {isNarin ? 'Narin縛りマルチ' : '通常マルチ'}
            </span>
            <span
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                borderRadius: '4px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: 'var(--text-secondary, #94a3b8)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {lobby.missionCategory}
            </span>
          </div>

          {/* Member Count Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              background: isFull ? 'rgba(239, 68, 68, 0.15)' : 'rgba(34, 197, 94, 0.15)',
              color: isFull ? '#f87171' : '#4ade80',
              border: `1px solid ${isFull ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`
            }}
          >
            <Users size={13} />
            {lobby.members.length} / {lobby.maxMembers} 名
          </div>
        </div>

        {/* Title */}
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', lineHeight: '1.4' }}>
          {lobby.title}
        </h3>

        {/* Target Mission or Narin Rules */}
        {lobby.targetMission && (
          <div style={{ fontSize: '13px', color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🎯 目的:</span>
            <span style={{ fontWeight: 600 }}>{lobby.targetMission}</span>
          </div>
        )}

        {/* Narin Rule Snippet */}
        {isNarin && lobby.narinRuleDescription && (
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '12px',
              color: '#bae6fd',
              marginBottom: '12px',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}
          >
            <span style={{ fontWeight: 700, color: '#38bdf8' }}>⚠️ 縛りルール: </span>
            {lobby.narinRuleDescription}
          </div>
        )}

        {/* General Description */}
        {lobby.description && (
          <p style={{ fontSize: '13px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '14px', lineHeight: '1.5' }}>
            {lobby.description}
          </p>
        )}
      </div>

      {/* Footer Info & Action */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary, #94a3b8)' }}>
            <Shield size={14} style={{ color: '#00d2ff' }} />
            <span>ホスト: <strong style={{ color: '#f8fafc' }}>{host?.inGameName || '不明'}</strong></span>
            {host?.warframe && (
              <span style={{ opacity: 0.8 }}>({host.warframe})</span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>
            <Clock size={12} />
            <span>{new Date(lobby.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => onJoin(lobby.id)}
          disabled={isClosed || (isFull && !isMyLobby) || isDeparted}
          className="primary-btn"
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: 700,
            background: isMyLobby
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : isNarin
              ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
              : 'linear-gradient(135deg, #00d2ff 0%, #0099cc 100%)',
            opacity: (isClosed || (isFull && !isMyLobby) || isDeparted) ? 0.5 : 1,
            cursor: (isClosed || (isFull && !isMyLobby) || isDeparted) ? 'not-allowed' : 'pointer'
          }}
        >
          {isMyLobby ? (
            <>参加中 (ロビーを開く) <ArrowRight size={16} /></>
          ) : isDeparted ? (
            '出撃中'
          ) : isFull ? (
            '満員'
          ) : (
            <>分隊に参加する <ArrowRight size={16} /></>
          )}
        </button>
      </div>
    </div>
  );
};
