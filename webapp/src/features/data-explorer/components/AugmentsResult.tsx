import React from 'react';

interface AugmentsResultProps {
  augments: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const AugmentsResult: React.FC<AugmentsResultProps> = ({
  augments,
  searchQuery,
  onSearchChange,
}) => {
  const filtered = (augments || []).filter(
    (aug: any) =>
      aug.frame.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aug.modName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      aug.effect.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3>増強MOD一覧 (Augments)</h3>
        <input
          type="text"
          className="terminal-input"
          style={{ width: '300px' }}
          placeholder="フレーム名やMOD名で絞り込み..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
        {filtered.map((aug: any, i: number) => (
          <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: '16px', color: 'var(--color-teal)' }}>{aug.modName}</strong>
                <span className="badge" style={{ marginLeft: '8px', background: 'rgba(255,255,255,0.1)' }}>{aug.frame}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: 'var(--color-gold)' }}>{aug.syndicate}</div>
              </div>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-color)', marginTop: '8px', lineHeight: '1.5' }}>
              {aug.effect}
            </div>
          </div>
        ))}
        {augments && augments.length === 0 && <div>増強MODデータが登録されていません。</div>}
      </div>
    </div>
  );
};
