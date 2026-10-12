import React from 'react';

interface AcquisitionListViewProps {
  warframesData: any[];
}

export const AcquisitionListView: React.FC<AcquisitionListViewProps> = ({ warframesData }) => {
  const frames = warframesData.filter(
    (wf) => !wf.name.includes('Prime') && !wf.name.includes('Umbra') && wf.components && wf.components.length > 0
  );

  return (
    <div className="glass-card custom-scrollbar" style={{ padding: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
      <h3 className="card-title" style={{ color: 'var(--color-primary)', marginBottom: '24px' }}>
        フレーム取得方法一覧
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {frames.map((wf) => (
          <div
            key={wf.uniqueName}
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <h4 style={{ color: 'var(--color-gold)', fontSize: '18px', marginBottom: '12px' }}>{wf.name}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
              {wf.components
                .filter((c: any) => c.drops && c.drops.length > 0)
                .map((comp: any) => (
                  <div key={comp.uniqueName} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-primary)' }}>{comp.name}</div>
                    {comp.drops.slice(0, 3).map((drop: any, idx: number) => (
                      <div
                        key={idx}
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>{drop.location}</span>
                        <span style={{ color: drop.rarity === 'Rare' ? '#e2b007' : drop.rarity === 'Uncommon' ? 'silver' : '#b08d6a' }}>
                          {drop.chance}%
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
