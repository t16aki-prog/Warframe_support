// Warframe_spport/src/features/multiplayer/components/LobbyList.tsx
import { Users, Plus } from 'lucide-react';
import { LobbyCard } from './LobbyCard';
import type { Lobby } from '../types';

interface Props {
  lobbies: Lobby[];
  onJoin: (id: string) => void;
  onOpenCreateModal: () => void;
  activeLobbyId: string | null;
}

export const LobbyList: React.FC<Props> = ({
  lobbies,
  onJoin,
  onOpenCreateModal,
  activeLobbyId
}) => {
  if (lobbies.length === 0) {
    return (
      <div
        className="glass-card"
        style={{
          padding: '48px 24px',
          textAlign: 'center',
          borderRadius: '16px',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          background: 'rgba(15, 23, 42, 0.4)'
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(0, 210, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#00d2ff'
          }}
        >
          <Users size={32} />
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
          現在募集中の分隊はありません
        </h3>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 24px' }}>
          同じアプリを使っているテンノに向けて、最初のマルチ募集やNarin縛り分隊を立ち上げてみましょう！
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={onOpenCreateModal}
            className="primary-btn"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700
            }}
          >
            <Plus size={18} />
            新しい分隊を募集する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '20px'
      }}
    >
      {lobbies.map(lobby => (
        <LobbyCard
          key={lobby.id}
          lobby={lobby}
          onJoin={onJoin}
          isMyLobby={activeLobbyId === lobby.id}
        />
      ))}
    </div>
  );
};
