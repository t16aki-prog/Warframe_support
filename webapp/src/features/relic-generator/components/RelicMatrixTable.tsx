import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { TableItem, RelicDropItem } from '../types';

interface RelicMatrixTableProps {
  items: TableItem[];
  title: string;
  isRemovable?: boolean;
  onRemoveItem?: (index: number) => void;
  onClearAll?: () => void;
  onRelicSelect: (relicName: string) => void;
  onNavigateToDataExplorer: (relicName: string) => void;
}

export const RelicMatrixTable: React.FC<RelicMatrixTableProps> = ({
  items,
  title,
  isRemovable = true,
  onRemoveItem,
  onClearAll,
  onRelicSelect,
  onNavigateToDataExplorer,
}) => {
  if (items.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.2)',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid var(--border-light)',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: 'var(--color-gold)', fontSize: '18px' }}>{title}</h4>
        {isRemovable && onClearAll && (
          <button
            onClick={onClearAll}
            className="btn-copy"
            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          >
            クリア
          </button>
        )}
      </div>

      <div className="matrix-table-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Era</th>
              {items.map((item, i) => (
                <th key={i} style={{ minWidth: '100px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    {item.query}
                    {isRemovable && onRemoveItem && (
                      <button
                        onClick={() => onRemoveItem(i)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--color-danger)',
                          cursor: 'pointer',
                          fontSize: '16px',
                          padding: '0 4px',
                        }}
                        title="削除"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['Lith', 'Meso', 'Neo', 'Axi'].map((era) => (
              <tr key={era}>
                <td style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {era}
                </td>
                {items.map((item, i) => {
                  const primeParts = item.data?.parts?.filter((p: any) => p.name.toLowerCase().includes('prime')) || [];
                  const drops: RelicDropItem[] = [];

                  primeParts.forEach((frame: any) => {
                    const allParts: any[] = [];
                    if (frame.drops) allParts.push(frame);
                    if (frame.components) allParts.push(...frame.components);

                    allParts.forEach((part: any) => {
                      if (part.name.includes('Prime') || (part.drops && part.drops.length > 0)) {
                        if (part.drops) {
                          part.drops.forEach((d: any) => {
                            if (d.place.toLowerCase().includes(era.toLowerCase())) {
                              const match = d.place.match(new RegExp(`${era}\\s+(\\w+\\d+)`, 'i'));
                              if (match) {
                                drops.push({
                                  relic: match[1].toUpperCase(),
                                  chance: d.chance,
                                  rarity: d.rarity,
                                  isVaulted: d.place.includes('Vaulted'),
                                });
                              }
                            }
                          });
                        }
                      }
                    });
                  });

                  const uniqueDrops = new Map<string, RelicDropItem>();
                  drops.forEach((d) => {
                    if (!uniqueDrops.has(d.relic)) {
                      uniqueDrops.set(d.relic, d);
                    } else {
                      const existing = uniqueDrops.get(d.relic)!;
                      const rank = (r: string) => (r === 'Rare' ? 3 : r === 'Uncommon' ? 2 : 1);
                      if (rank(d.rarity) > rank(existing.rarity)) {
                        uniqueDrops.set(d.relic, d);
                      }
                    }
                  });

                  const finalDrops = Array.from(uniqueDrops.values()).sort((a, b) => a.relic.localeCompare(b.relic));

                  return (
                    <td key={i}>
                      {finalDrops.length === 0 ? (
                        <div className="matrix-cell-empty" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />
                      ) : (
                        <div className="matrix-cell-relics">
                          {finalDrops.map((d, di) => {
                            let rarityClass = 'matrix-rarity-common';
                            let rarityLabel = '銅';
                            if (d.rarity === 'Rare' || d.chance <= 0.1) {
                              rarityClass = 'matrix-rarity-rare';
                              rarityLabel = '金';
                            } else if (d.rarity === 'Uncommon' || d.chance <= 0.2) {
                              rarityClass = 'matrix-rarity-uncommon';
                              rarityLabel = '銀';
                            }

                            return (
                              <div
                                key={di}
                                className={`matrix-relic-block ${rarityClass}`}
                                style={{
                                  opacity: d.isVaulted ? 0.7 : 1,
                                  border: d.isVaulted ? '1px dashed var(--color-danger)' : undefined,
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                }}
                                title={d.isVaulted ? 'Vaulted (現在入手不可)' : 'クリックしてデータベースでドロップ場所を検索'}
                              >
                                <div
                                  style={{ flex: 1, cursor: 'pointer' }}
                                  onClick={() => onNavigateToDataExplorer(d.relic)}
                                >
                                  <span style={{ marginRight: '4px', fontWeight: 'bold' }}>[{rarityLabel}]</span>
                                  {d.relic} {d.isVaulted && <span style={{ color: 'var(--color-danger)', fontSize: '10px', marginLeft: '2px' }}>(格納)</span>}
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRelicSelect(d.relic);
                                  }}
                                  className="btn-copy"
                                  style={{ padding: '2px 4px', border: 'none', background: 'transparent' }}
                                  title="募集メーカーにセット"
                                >
                                  <MessageSquare size={12} style={{ color: 'var(--text-muted)' }} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
