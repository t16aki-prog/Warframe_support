// Warframe_spport/src/features/multiplayer/Multiplayer.tsx
import React, { useState } from 'react';
import { Users, Plus, User, AlertCircle, Wifi } from 'lucide-react';
import { useMultiplayerLobbies } from './hooks/useMultiplayerLobbies';
import { LobbyFilterTabs } from './components/LobbyFilterTabs';
import { LobbyList } from './components/LobbyList';
import { CreateLobbyModal } from './components/CreateLobbyModal';
import { LobbyRoomView } from './components/LobbyRoomView';
import type { LobbyType } from './types';

export const Multiplayer: React.FC = () => {
  const {
    lobbies,
    allLobbiesCount,
    activeLobby,
    activeFilter,
    setActiveFilter,
    isConnected,
    errorMsg,
    clearError,
    inGameName,
    myWarframe,
    saveUserData,
    createLobby,
    joinLobby,
    leaveLobby,
    toggleReady,
    updateMyWarframe,
    updateLobbyStatus,
    sendLobbyMessage,
    currentSocketId
  } = useMultiplayerLobbies();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialType, setModalInitialType] = useState<LobbyType>('standard');
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [tempIgn, setTempIgn] = useState(inGameName);

  const standardCount = lobbies.filter(l => l.type === 'standard').length;
  const narinCount = lobbies.filter(l => l.type === 'narin').length;

  const handleOpenCreateModal = (type: LobbyType = 'standard') => {
    setModalInitialType(type);
    setIsModalOpen(true);
  };

  const handleSaveIgn = () => {
    saveUserData(tempIgn.trim() || 'Tenno', myWarframe);
    setIsEditingUser(false);
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={28} style={{ color: '#00d2ff' }} />
              マルチプレイ・分隊マッチング
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '20px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: isConnected ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: isConnected ? '#4ade80' : '#f87171',
                border: `1px solid ${isConnected ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}
            >
              <Wifi size={12} />
              {isConnected ? 'マッチング通信: オンライン' : 'オフライン'}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px' }}>
            同じアプリを利用中のテンノ同士でリアルタイムに分隊を結成。通常マルチ募集から専用エンドコンテンツ<strong>「氷河の縛り (The Icebind)」</strong>まで即座にマッチングできます。
          </p>
        </div>

        {/* User In-Game Name & Create Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* User IGN Pill */}
          <div
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <User size={15} style={{ color: '#00d2ff' }} />
            {isEditingUser ? (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={tempIgn}
                  onChange={e => setTempIgn(e.target.value)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <button
                  onClick={handleSaveIgn}
                  className="primary-btn"
                  style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '4px' }}
                >
                  保存
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{inGameName}</span>
                <button
                  onClick={() => {
                    setTempIgn(inGameName);
                    setIsEditingUser(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted, #94a3b8)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  変更
                </button>
              </div>
            )}
          </div>

          {!activeLobby && (
            <button
              onClick={() => handleOpenCreateModal(activeFilter === 'narin' ? 'narin' : 'standard')}
              className="primary-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              <Plus size={18} />
              新規分隊を募集
            </button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
          <button
            onClick={clearError}
            style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer', fontSize: '12px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main View: Active Lobby Room or Lobby List */}
      {activeLobby ? (
        <LobbyRoomView
          lobby={activeLobby}
          currentSocketId={currentSocketId}
          onLeave={leaveLobby}
          onToggleReady={toggleReady}
          onUpdateStatus={updateLobbyStatus}
          onSendMessage={sendLobbyMessage}
          onChangeWarframe={updateMyWarframe}
          myWarframe={myWarframe}
        />
      ) : (
        <div>
          {/* Subtabs Filter: All / Standard / Narin */}
          <div style={{ marginBottom: '20px' }}>
            <LobbyFilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              totalCount={allLobbiesCount}
              standardCount={standardCount}
              narinCount={narinCount}
            />
          </div>

          {/* Lobby List */}
          <LobbyList
            lobbies={lobbies}
            onJoin={joinLobby}
            onOpenCreateModal={() => handleOpenCreateModal(activeFilter === 'narin' ? 'narin' : 'standard')}
            activeLobbyId={null}
          />
        </div>
      )}

      {/* Create Modal */}
      <CreateLobbyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={createLobby}
        defaultIgn={inGameName}
        defaultWarframe={myWarframe}
        initialType={modalInitialType}
      />
    </div>
  );
};
