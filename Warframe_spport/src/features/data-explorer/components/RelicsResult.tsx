import React from 'react';
import { Star } from 'lucide-react';
import type { WishlistType } from '../types';

interface RelicsResultProps {
  results: any;
  onAddToWishlist: (name: string, type: WishlistType) => void;
}

export const RelicsResult: React.FC<RelicsResultProps> = ({ results, onAddToWishlist }) => {
  return (
    <div className="grid-dashboard">
      <div className="glass-card">
        <h3>レリック内容</h3>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          {results.relics?.map((r: any, i: number) => (
            <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong>{r.name}</strong> {r.vaulted ? <span className="badge danger">Vaulted</span> : <span className="badge teal">Available</span>}
              <button
                onClick={() => onAddToWishlist(r.name, 'relic')}
                className="btn-copy"
                style={{ padding: '2px 8px', fontSize: '12px' }}
              >
                <Star size={12} style={{ marginRight: '4px' }} />
                リスト追加
              </button>
            </li>
          ))}
          {(!results.relics || results.relics.length === 0) && <li>見つかりませんでした</li>}
        </ul>
      </div>
      <div className="glass-card">
        <h3>ドロップ場所 (上位10件)</h3>
        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
          {results.dropLocations?.map((loc: any, i: number) => (
            <li key={i} style={{ marginBottom: '8px' }}>
              {loc.place} ({loc.item}) - 確率: {(loc.chance * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
