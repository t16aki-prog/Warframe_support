import React from 'react';
import { Target } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface SortieCardProps {
  sortie: any;
  getDaysLeft: (target: string) => string;
}

export const SortieCard: React.FC<SortieCardProps> = ({ sortie, getDaysLeft }) => {
  if (!sortie) return null;

  return (
    <div className="glass-card neon-gold">
      <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
        <Target size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
        ソーティー (Sortie)
        <span className="badge gold" style={{ marginLeft: 'auto', fontSize: '12px' }}>
          {getDaysLeft(sortie.expiry)}
        </span>
      </h3>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ターゲット</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{translateText(sortie.boss)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>勢力</div>
          <div style={{ fontSize: '18px' }}>{translateText(sortie.faction)}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {sortie.variants.map((variant: any, idx: number) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '12px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--color-gold)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '24px', fontWeight: 'bold', color: 'var(--color-gold)' }}>{idx + 1}.</div>
              <div style={{ flex: 1, fontWeight: 'bold' }}>
                {variant.node} - {translateText(variant.missionType)}
              </div>
            </div>
            <div style={{ paddingLeft: '24px', marginTop: '4px', fontSize: '13px', color: 'var(--color-danger)' }}>
              <strong>{translateText(variant.modifier)}:</strong> {translateText(variant.modifierDescription)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
