import React from 'react';
import { Database } from 'lucide-react';

interface FrameDropsCardProps {
  warframesData: any[];
  itemName: string;
}

export const FrameDropsCard: React.FC<FrameDropsCardProps> = ({ warframesData, itemName }) => {
  const wf = warframesData.find((w) => w.name === itemName);
  if (!wf || !wf.components || wf.components.filter((c: any) => c.drops && c.drops.length > 0).length === 0) {
    return null;
  }

  return (
    <div className="glass-card neon-purple" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
        <Database size={20} className="card-title-icon" style={{ color: 'var(--color-primary)' }} />
        取得方法 (Drops)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
        {wf.components
          .filter((c: any) => c.drops && c.drops.length > 0)
          .map((comp: any) => (
            <div key={comp.uniqueName} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary)' }}>{comp.name}</div>
              {comp.drops.slice(0, 3).map((drop: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '4px',
                  }}
                >
                  <span style={{ paddingRight: '8px' }}>{drop.location}</span>
                  <span style={{ color: drop.rarity === 'Rare' ? '#e2b007' : drop.rarity === 'Uncommon' ? 'silver' : '#b08d6a' }}>
                    {drop.chance}%
                  </span>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
};
