import React from 'react';
import { Star } from 'lucide-react';
import type { WishlistType } from '../types';

interface WarframeResultProps {
  results: any;
  onAddToWishlist: (name: string, type: WishlistType) => void;
}

export const WarframeResult: React.FC<WarframeResultProps> = ({ results, onAddToWishlist }) => {
  const normalParts = results.parts?.filter((p: any) => !p.name.includes('Prime') && !p.name.includes('Umbra')) || [];
  const primeParts = results.parts?.filter((p: any) => p.name.includes('Prime') || p.name.includes('Umbra')) || [];

  return (
    <div className="grid-dashboard">
      <div className="glass-card">
        <h3>フレーム・パーツ</h3>
        {normalParts.length === 0 && primeParts.length === 0 ? (
          <div style={{ marginTop: '12px', paddingLeft: '20px' }}>見つかりませんでした</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '12px' }}>
            {normalParts.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--text-color)', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                  通常版
                </h4>
                <ul style={{ paddingLeft: '16px' }}>
                  {normalParts.flatMap((frame: any, frameIdx: number) => {
                    const allParts: any[] = [];
                    if (frame.drops && frame.drops.length > 0) allParts.push(frame);
                    if (frame.components) allParts.push(...frame.components);
                    if (allParts.length === 0) allParts.push(frame);

                    return allParts.map((part: any, idx: number) => {
                      let displayName = part.name;
                      displayName = displayName.replace(frame.name, '').trim();
                      displayName = displayName.replace('Blueprint', '設計図');
                      if (!displayName) displayName = '本体 設計図';
                      if (allParts.length === 1 && part === frame) displayName = frame.name;
                      else displayName = `${frame.name} ${displayName}`;

                      return (
                        <li key={`${frameIdx}-${idx}`} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong>{displayName}</strong>
                            <button
                              onClick={() => onAddToWishlist(displayName, 'part')}
                              className="btn-copy"
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                            >
                              <Star size={10} style={{ marginRight: '2px' }} /> 追加
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{part.description}</div>
                          {part.drops && part.drops.length > 0 && (
                            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {part.drops.map((d: any, di: number) => (
                                <span
                                  key={di}
                                  className="badge"
                                  style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', cursor: 'pointer' }}
                                  onClick={() => {
                                    let query = d.place;
                                    if (query.includes('Relic') || query.includes('レリック')) {
                                      query = query
                                        .replace(' Relic', '')
                                        .replace(' レリック', '')
                                        .replace(' Intact', '')
                                        .replace(' Exceptional', '')
                                        .replace(' Flawless', '')
                                        .replace(' Radiant', '')
                                        .trim();
                                      window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'relics', query } }));
                                    }
                                  }}
                                >
                                  {d.place} <span style={{ color: 'var(--color-teal)' }}>({(d.chance * 100).toFixed(1)}%)</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </li>
                      );
                    });
                  })}
                </ul>
              </div>
            )}

            {primeParts.length > 0 && (
              <div>
                <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', borderBottom: '1px solid var(--color-gold)', paddingBottom: '4px' }}>
                  Prime / Umbra版
                </h4>
                <ul style={{ paddingLeft: '16px' }}>
                  {primeParts.flatMap((frame: any, frameIdx: number) => {
                    const allParts: any[] = [];
                    if (frame.drops && frame.drops.length > 0) allParts.push(frame);
                    if (frame.components) allParts.push(...frame.components);
                    if (allParts.length === 0) allParts.push(frame);

                    return allParts.map((part: any, idx: number) => {
                      let displayName = part.name;
                      displayName = displayName.replace(frame.name, '').trim();
                      displayName = displayName.replace('Blueprint', '設計図');
                      if (!displayName) displayName = '本体 設計図';
                      if (allParts.length === 1 && part === frame) displayName = frame.name;
                      else displayName = `${frame.name} ${displayName}`;

                      return (
                        <li key={`${frameIdx}-${idx}`} style={{ marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ color: 'var(--color-gold)' }}>{displayName}</strong>
                            <button
                              onClick={() => onAddToWishlist(displayName, 'part')}
                              className="btn-copy"
                              style={{ padding: '2px 6px', fontSize: '11px' }}
                            >
                              <Star size={10} style={{ marginRight: '2px' }} /> 追加
                            </button>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{part.description}</div>
                          {part.drops && part.drops.length > 0 && (
                            <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {part.drops.map((d: any, di: number) => {
                                const isVaulted = d.place.includes('Vaulted');
                                const baseName = d.place
                                  .replace(' Relic', '')
                                  .replace(' レリック', '')
                                  .replace(' Intact', '')
                                  .replace(' Exceptional', '')
                                  .replace(' Flawless', '')
                                  .replace(' Radiant', '')
                                  .trim();
                                return (
                                  <span
                                    key={di}
                                    className={`badge ${isVaulted ? 'danger' : ''}`}
                                    style={{
                                      fontSize: '10px',
                                      background: isVaulted ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 183, 3, 0.1)',
                                      border: `1px solid ${isVaulted ? 'var(--color-danger)' : 'var(--color-gold)'}`,
                                      cursor: 'pointer',
                                      transition: 'all 0.2s',
                                    }}
                                    onClick={() => {
                                      if (!isVaulted) {
                                        window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'relics', query: baseName } }));
                                      }
                                    }}
                                    title={isVaulted ? 'Vaulted (現在入手不可)' : 'クリックしてレリック検索を開く'}
                                  >
                                    {d.place} <span style={{ color: 'var(--color-gold)' }}>({(d.chance * 100).toFixed(1)}%)</span>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </li>
                      );
                    });
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h3>ドロップ場所</h3>
        <ul style={{ marginTop: '12px', paddingLeft: '20px', maxHeight: '400px', overflowY: 'auto' }}>
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
