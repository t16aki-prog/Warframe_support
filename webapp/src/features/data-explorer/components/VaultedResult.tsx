import React from 'react';
import type { WorldState } from '../../../utils/warframeApi';

interface VaultedResultProps {
  results: any[];
  worldState: WorldState | null;
}

export const VaultedResult: React.FC<VaultedResultProps> = ({ results, worldState }) => {
  return (
    <div className="glass-card">
      <h3>格納済みのプライムアイテム (Vaulted Primes)</h3>

      {worldState?.vaultTrader?.schedule && (
        <div style={{ marginTop: '16px', marginBottom: '24px' }}>
          <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', borderBottom: '1px solid var(--color-gold)', paddingBottom: '4px' }}>
            🌟 現在リサージェンスで復刻中 (Prime Resurgence)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {worldState.vaultTrader.schedule
              .filter((s) => s.expiry && new Date(s.expiry).getTime() > Date.now())
              .slice(0, 2)
              .map((s, idx) => (
                <div
                  key={`resurgence-${idx}`}
                  style={{ padding: '8px', background: 'rgba(255,183,3,0.05)', border: '1px solid var(--color-gold)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                  title="クリックして自作レリック表に展開する"
                  onClick={() => {
                    let rawItem = s.item || '';
                    rawItem = rawItem.replace(/ dual pack/gi, '').replace(/ pack/gi, '').replace(/&/g, '/').replace(/ and /gi, '/');
                    const items = rawItem.split('/').map((i: string) => i.trim()).filter(Boolean);
                    window.dispatchEvent(
                      new CustomEvent('navigateTab', {
                        detail: { tab: 'relicgenerator', action: 'addResurgence', items },
                      })
                    );
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>{s.item || 'シークレットアイテム'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gold)', marginTop: '4px' }}>アヤ(Aya)と交換可能 (クリックでレリック表へ)</div>
                </div>
              ))}
          </div>
        </div>
      )}

      <h4 style={{ color: 'var(--text-color)', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
        その他の格納済みアイテム
      </h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
        {results?.map((item: any, i: number) => (
          <div key={i} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
            <div style={{ fontWeight: 'bold' }}>{item.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-purple)' }}>{item.category}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
