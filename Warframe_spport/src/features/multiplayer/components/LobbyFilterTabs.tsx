// Warframe_spport/src/features/multiplayer/components/LobbyFilterTabs.tsx
import React from 'react';
import { Users, Snowflake, Sparkles } from 'lucide-react';
import type { ActiveFilterTab } from '../types';

interface Props {
  activeFilter: ActiveFilterTab;
  onFilterChange: (filter: ActiveFilterTab) => void;
  totalCount: number;
  standardCount: number;
  narinCount: number;
}

export const LobbyFilterTabs: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  totalCount,
  standardCount,
  narinCount
}) => {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <button
        onClick={() => onFilterChange('all')}
        className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: activeFilter === 'all' ? 'var(--primary-color, #00d2ff)' : 'rgba(255,255,255,0.1)',
          background: activeFilter === 'all' ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
          color: activeFilter === 'all' ? '#00d2ff' : 'var(--text-secondary, #94a3b8)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
      >
        <Sparkles size={16} />
        すべての募集 ({totalCount})
      </button>

      <button
        onClick={() => onFilterChange('standard')}
        className={`filter-pill ${activeFilter === 'standard' ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: activeFilter === 'standard' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
          background: activeFilter === 'standard' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
          color: activeFilter === 'standard' ? '#60a5fa' : 'var(--text-secondary, #94a3b8)',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
      >
        <Users size={16} />
        通常マルチ募集 ({standardCount})
      </button>

      <button
        onClick={() => onFilterChange('narin')}
        className={`filter-pill ${activeFilter === 'narin' ? 'active' : ''}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid',
          borderColor: activeFilter === 'narin' ? '#38bdf8' : 'rgba(255,255,255,0.1)',
          background: activeFilter === 'narin' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.03)',
          color: activeFilter === 'narin' ? '#38bdf8' : 'var(--text-secondary, #94a3b8)',
          boxShadow: activeFilter === 'narin' ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '13px',
          transition: 'all 0.2s ease'
        }}
      >
        <Snowflake size={16} />
        ❄️ 氷河の縛り (The Icebind) ({narinCount})
      </button>
    </div>
  );
};
