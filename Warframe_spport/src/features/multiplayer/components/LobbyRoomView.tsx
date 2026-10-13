// Warframe_spport/src/features/multiplayer/components/LobbyRoomView.tsx
import React from 'react';
import type { Lobby, LobbyStatus } from '../types';
import { LobbyHeaderBanner } from './LobbyHeaderBanner';
import { LobbySquadSlots } from './LobbySquadSlots';
import { LobbyChatPanel } from './LobbyChatPanel';

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
  const me = lobby.members.find(m => m.socketId === currentSocketId);
  const isHost = me?.isHost ?? false;
  const isNarin = lobby.type === 'narin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header & Actions Banner */}
      <LobbyHeaderBanner
        lobby={lobby}
        isHost={isHost}
        isNarin={isNarin}
        onLeave={onLeave}
        onUpdateStatus={onUpdateStatus}
      />

      {/* 2. Main Grid: Squad Slots (Left) & Chat/Tools (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <LobbySquadSlots
          lobby={lobby}
          currentSocketId={currentSocketId}
          isHost={isHost}
          isNarin={isNarin}
          onToggleReady={onToggleReady}
          onChangeWarframe={onChangeWarframe}
          myWarframe={myWarframe}
        />

        <LobbyChatPanel
          lobby={lobby}
          currentSocketId={currentSocketId}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};
