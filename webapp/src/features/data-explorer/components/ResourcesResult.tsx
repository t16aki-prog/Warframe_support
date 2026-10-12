import React from 'react';
import { Star } from 'lucide-react';
import type { WishlistType } from '../types';

interface ResourcesResultProps {
  resources: any[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddToWishlist: (name: string, type: WishlistType) => void;
}

export const ResourcesResult: React.FC<ResourcesResultProps> = ({
  resources,
  searchQuery,
  onSearchChange,
  onAddToWishlist,
}) => {
  const filtered = (resources || []).filter((res: any) =>
    res.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="glass-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <h3>素材・最適狩場一覧 (Resources)</h3>
        <input
          type="text"
          className="terminal-input"
          style={{ width: '300px' }}
          placeholder="素材名で絞り込み..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filtered.map((res: any, i: number) => (
          <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <strong style={{ fontSize: '18px', color: 'var(--color-gold)' }}>{res.name}</strong>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{res.type}</span>
                <button
                  onClick={() => onAddToWishlist(res.name, 'resource')}
                  className="btn-copy"
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  <Star size={12} style={{ marginRight: '4px' }} />
                  リスト追加
                </button>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                ドロップ: {res.planets.join(' / ')}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--color-teal)' }}>おすすめの狩場</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {res.bestSpots.map((spot: any, j: number) => (
                  <div key={j} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-color)' }}>{spot.node}</strong>
                      <span style={{ fontSize: '12px', color: 'var(--color-purple)' }}>{spot.mission}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {spot.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
