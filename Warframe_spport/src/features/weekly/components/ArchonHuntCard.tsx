import React from 'react';
import { Target } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface ArchonHuntCardProps {
  archonHunt: any;
  getDaysLeft: (target: string) => string;
}

export const ArchonHuntCard: React.FC<ArchonHuntCardProps> = ({ archonHunt, getDaysLeft }) => {
  if (!archonHunt) return null;

  return (
    <div className="glass-card neon-purple">
      <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
        <Target size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
        アルコン討伐戦 (Archon Hunt)
        <span className="badge purple" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {getDaysLeft(archonHunt.expiry)}
        </span>
      </h3>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ターゲット</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{translateText(archonHunt.boss)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>勢力</div>
          <div style={{ fontSize: '18px' }}>{translateText(archonHunt.faction)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {archonHunt.missions.map((mission: any, idx: number) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--color-purple)',
            }}
          >
            <div style={{ width: '24px', fontWeight: 'bold', color: 'var(--color-purple)' }}>{idx + 1}.</div>
            <div style={{ flex: 1 }}>{mission.node}</div>
            <div style={{ color: 'var(--text-muted)' }}>{translateText(mission.type)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
