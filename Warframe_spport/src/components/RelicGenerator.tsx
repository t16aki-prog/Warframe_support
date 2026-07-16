import React, { useState } from 'react';
import { Share2, Copy, Search, CheckSquare, MessageSquare } from 'lucide-react';
import { AutocompleteSearch } from './AutocompleteSearch';

export const RelicGenerator: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [tableItems, setTableItems] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

  // Chat Generator states
  const [selectedRelic, setSelectedRelic] = useState('');
  const [refinement, setRefinement] = useState('Radiant'); // Intact, Exceptional, Flawless, Radiant
  const [partySize, setPartySize] = useState('1/4'); // 1/4, 2/4, 3/4
  const [missionType, setMissionType] = useState('H'); // LF (Looking For) or H (Hosting)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/warframes/${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setResults({ error: '検索エラーが発生しました' });
    }
    setLoading(false);
  };

  const getChatText = () => {
    const refinementJP: Record<string, string> = {
      'Intact': '無垢',
      'Exceptional': '例外',
      'Flawless': '無傷',
      'Radiant': '輝く'
    };
    
    const refinementTag = refinementJP[refinement] || refinement;
    // E.g., H [Lith G1 Relic] 輝く 募集 1/4
    const text = `${missionType} [${selectedRelic}] ${refinementTag} 募集 ${partySize}`;
    return text;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました！');
  };

  const handleRelicSelect = (relicName: string) => {
    // Extract base relic name e.g. "Lith G1 Relic" from "Lith G1 Relic (Radiant)"
    let base = relicName.replace(' (Radiant)', '').replace(' (Flawless)', '').replace(' (Exceptional)', '').replace(' (Intact)', '').trim();
    if (!base.toLowerCase().includes('relic') && !base.toLowerCase().includes('レリック')) {
      base += ' Relic';
    }
    // Remove "Vaulted"
    base = base.replace(' (Vaulted)', '').trim();
    
    setSelectedRelic(base);
    // Auto scroll to generator
    document.getElementById('chat-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">簡単レリック表ジェネレーター</h2>
        <p className="page-desc">目的のフレームに必要なレリック一覧（表）の作成と、リクルートチャット用テキストの生成を行います。</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Search & Checklist */}
        <div className="glass-card">
          <h3 className="card-title">
            <CheckSquare size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
            レリック表（チェックリスト）生成
          </h3>
          <p className="cycle-sub" style={{ marginBottom: '16px' }}>
            調べたいフレーム名を入力すると、必要なレリックの一覧表を作成します。
          </p>
          <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
            <AutocompleteSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="例: Titania (Prime省略可)"
              type="warframes"
              disabled={loading}
            />
            {results && results.parts && (
              <button 
                onClick={() => {
                  const displayQuery = searchQuery.toUpperCase().includes('PRIME') ? searchQuery.toUpperCase() : searchQuery.toUpperCase() + ' PRIME';
                  setTableItems(prev => [...prev, { query: displayQuery, data: results }]);
                  setViewMode('matrix');
                }}
                className="btn-primary"
                style={{ background: 'var(--color-gold)', color: '#000' }}
              >
                表に追加
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-light)' }}>
            <button 
              onClick={() => setViewMode('list')}
              style={{ background: 'transparent', border: 'none', color: viewMode === 'list' ? 'var(--color-gold)' : 'var(--text-muted)', borderBottom: viewMode === 'list' ? '2px solid var(--color-gold)' : '2px solid transparent', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              詳細リスト
            </button>
            <button 
              onClick={() => setViewMode('matrix')}
              style={{ background: 'transparent', border: 'none', color: viewMode === 'matrix' ? 'var(--color-gold)' : 'var(--text-muted)', borderBottom: viewMode === 'matrix' ? '2px solid var(--color-gold)' : '2px solid transparent', padding: '8px 16px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              マトリックス表
            </button>
          </div>

          {loading && <div style={{ padding: '20px', textAlign: 'center' }}>検索中...</div>}
          {results && results.error && <div className="alert-box danger">{results.error}</div>}
          
          {viewMode === 'list' && results && results.parts && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--color-gold)', textAlign: 'center', fontSize: '18px' }}>
                {searchQuery.toUpperCase().includes('PRIME') ? searchQuery.toUpperCase() : searchQuery.toUpperCase() + ' PRIME'} 収集表
              </h4>
              
              {(() => {
                const primeParts = results.parts.filter((p: any) => p.name.toLowerCase().includes('prime'));
                
                if (primeParts.length === 0) {
                  return (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>{searchQuery.toUpperCase()} のPrime版はまだ存在しません。</p>
                      <p style={{ fontSize: '12px' }}>※入力間違いがないか、または最新のアップデートをご確認ください。</p>
                    </div>
                  );
                }

                return (
                  <>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-light)', textAlign: 'left' }}>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', width: '30%' }}>パーツ</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)' }}>対象レリック (クリックでコピー)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {primeParts.flatMap((frame: any, frameIdx: number) => {
                          const allParts: any[] = [];
                          if (frame.drops && frame.drops.length > 0) allParts.push(frame);
                          if (frame.components) {
                            frame.components.forEach((c: any) => {
                              // Only include Prime components (e.g. Neuroptics, Chassis) or things with drops
                              if (c.name.includes('Prime') || (c.drops && c.drops.length > 0)) {
                                allParts.push(c);
                              }
                            });
                          }
                          if (allParts.length === 0) allParts.push(frame);

                          return allParts.map((part: any, idx: number) => {
                            let displayName = part.name;
                            // Make name shorter: "Titania Prime Neuroptics Blueprint" -> "Neuroptics 設計図"
                            displayName = displayName.replace(frame.name, '').trim();
                            displayName = displayName.replace('Blueprint', '設計図');
                            if (!displayName) displayName = '本体 設計図'; // If the name became empty, it was the main BP

                            return (
                              <tr key={`${frameIdx}-${idx}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '12px 8px', verticalAlign: 'top', color: 'var(--color-gold)' }}>
                                  <strong>{displayName}</strong>
                                </td>
                                <td style={{ padding: '12px 8px' }}>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {part.drops && part.drops.length > 0 ? (
                                      part.drops.filter((d: any) => d.place.toLowerCase().includes('relic')).map((d: any, di: number) => {
                                        const isVaulted = d.place.includes('Vaulted');
                                        let rarityLabel = '銅';
                                        let rarityColor = '#cd7f32'; // Bronze
                                        if (d.rarity === 'Rare' || d.chance <= 0.10) {
                                          rarityLabel = '金';
                                          rarityColor = '#ffd700'; // Gold
                                        } else if (d.rarity === 'Uncommon' || d.chance <= 0.20) {
                                          rarityLabel = '銀';
                                          rarityColor = '#c0c0c0'; // Silver
                                        }
                                        
                                        return (
                                          <div 
                                            key={di} 
                                            className={`badge ${isVaulted ? 'danger' : ''}`}
                                            style={{ 
                                              display: 'inline-block', 
                                              padding: '4px 8px', 
                                              cursor: 'pointer',
                                              background: isVaulted ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 183, 3, 0.1)',
                                              border: `1px solid ${isVaulted ? 'var(--color-danger)' : 'var(--color-gold)'}`,
                                              transition: 'all 0.2s'
                                            }}
                                            onClick={() => handleRelicSelect(d.place)}
                                            title="クリックして募集チャットジェネレーターに送る"
                                          >
                                            <span style={{ marginRight: '4px', fontWeight: 'bold', color: rarityColor }}>[{rarityLabel}]</span>
                                            {d.place} <span style={{ opacity: 0.8 }}>({(d.chance * 100).toFixed(1)}%)</span>
                                          </div>
                                        );
                                      })
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>レリック情報なし</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          });
                        })}
                      </tbody>
                    </table>
                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                      この領域をスクリーンショットしてフレンドと共有しましょう！
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {viewMode === 'matrix' && tableItems.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--color-gold)', fontSize: '18px' }}>レリック マトリックス表</h4>
                <button 
                  onClick={() => setTableItems([])}
                  className="btn-copy" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                >
                  クリア
                </button>
              </div>
              
              <div className="matrix-table-container">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Era</th>
                      {tableItems.map((item, i) => (
                        <th key={i} style={{ minWidth: '100px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {item.query}
                            <button 
                              onClick={() => setTableItems(prev => prev.filter((_, idx) => idx !== i))}
                              style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                              title="削除"
                            >×</button>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Lith', 'Meso', 'Neo', 'Axi'].map(era => (
                      <tr key={era}>
                        <td style={{ fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {era}
                        </td>
                        {tableItems.map((item, i) => {
                          const primeParts = item.data.parts.filter((p: any) => p.name.toLowerCase().includes('prime'));
                          const drops: any[] = [];
                          
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
                                          isVaulted: d.place.includes('Vaulted')
                                        });
                                      }
                                    }
                                  });
                                }
                              }
                            });
                          });

                          // Deduplicate by relic name
                          const uniqueDrops = new Map();
                          drops.forEach(d => {
                            if (!uniqueDrops.has(d.relic)) {
                              uniqueDrops.set(d.relic, d);
                            } else {
                              // If duplicate, keep higher rarity (Rare > Uncommon > Common)
                              const existing = uniqueDrops.get(d.relic);
                              const rank = (r: string) => r === 'Rare' ? 3 : r === 'Uncommon' ? 2 : 1;
                              if (rank(d.rarity) > rank(existing.rarity)) {
                                uniqueDrops.set(d.relic, d);
                              }
                            }
                          });

                          const finalDrops = Array.from(uniqueDrops.values()).sort((a, b) => a.relic.localeCompare(b.relic));

                          return (
                            <td key={i}>
                              {finalDrops.length === 0 ? (
                                <div className="matrix-cell-empty" style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}}></div>
                              ) : (
                                <div className="matrix-cell-relics">
                                  {finalDrops.map((d, di) => {
                                    let rarityClass = 'matrix-rarity-common';
                                    let rarityLabel = '銅';
                                    if (d.rarity === 'Rare' || d.chance <= 0.10) {
                                      rarityClass = 'matrix-rarity-rare';
                                      rarityLabel = '金';
                                    } else if (d.rarity === 'Uncommon' || d.chance <= 0.20) {
                                      rarityClass = 'matrix-rarity-uncommon';
                                      rarityLabel = '銀';
                                    }
                                    
                                    return (
                                      <div 
                                        key={di} 
                                        className={`matrix-relic-block ${rarityClass}`}
                                        style={{ 
                                          opacity: d.isVaulted ? 0.5 : 1,
                                          textDecoration: d.isVaulted ? 'line-through' : 'none'
                                        }}
                                        title={d.isVaulted ? 'Vaulted' : ''}
                                      >
                                        <span style={{ marginRight: '4px', fontWeight: 'bold' }}>[{rarityLabel}]</span>
                                        {d.relic}
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
          )}
        </div>

        {/* Recruitment Chat Generator */}
        <div className="glass-card" id="chat-generator" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">
            <MessageSquare size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
            リクルート募集メーカー
          </h3>
          <p className="cycle-sub" style={{ marginBottom: '16px' }}>
            ゲーム内のリクルート（分隊募集）チャットに貼り付ける定型文を作成します。
            左側の表からレリックをクリックすると自動入力されます。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">レリック名 (手入力も可)</label>
              <AutocompleteSearch
                value={selectedRelic}
                onChange={setSelectedRelic}
                onSearch={() => {}}
                placeholder="例: Lith G1 Relic"
                type="relics"
              />
            </div>

            <div className="form-group">
              <label className="form-label">精錬レベル (Refinement)</label>
              <select className="input-text" value={refinement} onChange={(e) => setRefinement(e.target.value)}>
                <option value="Intact">無垢 (Intact)</option>
                <option value="Exceptional">例外 (Exceptional)</option>
                <option value="Flawless">無傷 (Flawless)</option>
                <option value="Radiant">輝く (Radiant)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">募集タイプ</label>
                <select className="input-text" value={missionType} onChange={(e) => setMissionType(e.target.value)}>
                  <option value="H">募集 (H / Hosting)</option>
                  <option value="LF">参加希望 (LF)</option>
                </select>
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">人数状況</label>
                <select className="input-text" value={partySize} onChange={(e) => setPartySize(e.target.value)}>
                  <option value="1/4">1/4 (@3人)</option>
                  <option value="2/4">2/4 (@2人)</option>
                  <option value="3/4">3/4 (@1人)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '16px', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-purple)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-purple)', marginBottom: '8px' }}>プレビュー (Preview)</div>
              <div style={{ fontSize: '16px', fontFamily: 'monospace', wordBreak: 'break-all', minHeight: '40px', display: 'flex', alignItems: 'center' }}>
                {getChatText()}
              </div>
            </div>

            <button 
              className="btn-primary" 
              style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--color-purple)', borderColor: 'var(--color-purple)' }}
              onClick={() => copyToClipboard(getChatText())}
              disabled={!selectedRelic}
            >
              <Copy size={18} /> クリップボードにコピー
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
