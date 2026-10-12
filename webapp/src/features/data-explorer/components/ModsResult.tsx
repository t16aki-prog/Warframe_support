import React from 'react';

interface ModsResultProps {
  locations: any[];
}

export const ModsResult: React.FC<ModsResultProps> = ({ locations }) => {
  return (
    <div className="glass-card">
      <h3>MOD・アイテムドロップ場所 ({locations?.length || 0}件)</h3>
      <ul style={{ marginTop: '12px', paddingLeft: '20px', maxHeight: '500px', overflowY: 'auto' }}>
        {(locations || []).map((loc: any, i: number) => (
          <li key={i} style={{ marginBottom: '8px', fontSize: '15px' }}>
            {loc}
          </li>
        ))}
        {(!locations || locations.length === 0) && <li>見つかりませんでした。</li>}
      </ul>
    </div>
  );
};
