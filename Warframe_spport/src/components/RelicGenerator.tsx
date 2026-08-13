import React, { useState, useEffect } from 'react';
import { Copy, CheckSquare, MessageSquare } from 'lucide-react';
import { AutocompleteSearch } from './AutocompleteSearch';

interface RelicGeneratorProps {
  navState?: any;
  clearNavState?: () => void;
}

export const RelicGenerator: React.FC<RelicGeneratorProps> = ({ navState, clearNavState }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const [tableItems, setTableItems] = useState<any[]>([]);
  const [latestPrimeItems, setLatestPrimeItems] = useState<any[]>([]);

  // Chat Generator states
  const [selectedRelic, setSelectedRelic] = useState('');
  const [refinement, setRefinement] = useState('Radiant'); // Intact, Exceptional, Flawless, Radiant
  const [partySize, setPartySize] = useState('1/4'); // 1/4, 2/4, 3/4
  const [missionType, setMissionType] = useState('H'); // LF (Looking For) or H (Hosting)

  useEffect(() => {
    const loadLatestPrimes = async () => {
      try {
        const res = await fetch('/api/latest-primes');
        const data = await res.json();
        if (data.primes && data.primes.length > 0) {
          const newItems: any[] = [];
          for (const p of data.primes) {
            const frameRes = await fetch(`/api/warframes/${encodeURIComponent(p.name)}`);
            const frameData = await frameRes.json();
            newItems.push({ query: p.name.toUpperCase(), data: frameData });
          }
          setLatestPrimeItems(newItems);
        }
      } catch (err) {
        console.error('Failed to load latest primes', err);
      }
    };
    loadLatestPrimes();
  }, []);

  // Handle cross-tab navigation
  useEffect(() => {
    if (navState && navState.tab === 'relicgenerator') {
      if (navState.action === 'addResurgence' && navState.items) {
        const fetchAndAdd = async () => {
          setLoading(true);
          const newItems: any[] = [];
          for (const item of navState.items) {
            try {
              let query = item;
              if (!query.toLowerCase().includes('prime') && !query.toLowerCase().includes('umbra') && !query.toLowerCase().includes('secret')) {
                 query += ' Prime';
              }
              const res = await fetch(`/api/warframes/${encodeURIComponent(query)}`);
              const data = await res.json();
              if (data && data.parts && data.parts.length > 0) {
                // To avoid duplicate adding
                if (!tableItems.some(existing => existing.query === query.toUpperCase())) {
                  newItems.push({ query: query.toUpperCase(), data });
                }
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (newItems.length > 0) {
            setTableItems(prev => {
              // Deduplicate before adding
              const filteredNewItems = newItems.filter(ni => !prev.some(p => p.query === ni.query));
              return [...prev, ...filteredNewItems];
            });
          }
          setLoading(false);
        };
        fetchAndAdd();
      }
      if (clearNavState) clearNavState();
    }
  }, [navState, clearNavState]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    const text = `${missionType} [${selectedRelic}] ${refinementTag} 募集 ${partySize}`;
    return text;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('クリップボードにコピーしました！');
  };

  const handleRelicSelect = (relicName: string) => {
    let base = relicName.replace(' (Radiant)', '').replace(' (Flawless)', '').replace(' (Exceptional)', '').replace(' (Intact)', '').trim();
    if (!base.toLowerCase().includes('relic') && !base.toLowerCase().includes('レリック')) {
      base += ' Relic';
    }
    base = base.replace(' (Vaulted)', '').trim();
    
    setSelectedRelic(base);
    document.getElementById('chat-generator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const navigateToDataExplorer = (relicName: string) => {
    let base = relicName.replace(' (Radiant)', '').replace(' (Flawless)', '').replace(' (Exceptional)', '').replace(' (Intact)', '').trim();
    if (!base.toLowerCase().includes('relic') && !base.toLowerCase().includes('レリック')) {
      base += ' Relic';
    }
    base = base.replace(' (Vaulted)', '').trim();
    window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'relics', query: base, from: 'relicgenerator' } }));
  };

  const renderMatrix = (items: any[], title: string, isRemovable: boolean = true) => {
    if (items.length === 0) return null;
    return (
      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ color: 'var(--color-gold)', fontSize: '18px' }}>{title}</h4>
          {isRemovable && (
            <button 
              onClick={() => setTableItems([])}
              className="btn-copy" style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
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
                      {isRemovable && (
                        <button 
                          onClick={() => setTableItems(prev => prev.filter((_, idx) => idx !== i))}
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-danger)', cursor: 'pointer', fontSize: '16px', padding: '0 4px' }}
                          title="削除"
                        >×</button>
                      )}
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
                  {items.map((item, i) => {
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
                        // If duplicate, keep higher rarity
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
                                    opacity: d.isVaulted ? 0.7 : 1,
                                    border: d.isVaulted ? '1px dashed var(--color-danger)' : undefined,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}
                                  title={d.isVaulted ? 'Vaulted (現在入手不可)' : 'クリックしてデータベースでドロップ場所を検索'}
                                >
                                  <div 
                                    style={{ flex: 1, cursor: 'pointer' }}
                                    onClick={() => navigateToDataExplorer(d.relic)}
                                  >
                                    <span style={{ marginRight: '4px', fontWeight: 'bold' }}>[{rarityLabel}]</span>
                                    {d.relic} {d.isVaulted && <span style={{color: 'var(--color-danger)', fontSize: '10px', marginLeft: '2px'}}>(格納)</span>}
                                  </div>
                                  
                                  {/* Chat generator trigger */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRelicSelect(d.relic);
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
            レリック表生成
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
                }}
                className="btn-primary"
                style={{ background: 'var(--color-gold)', color: '#000' }}
              >
                表に追加
              </button>
            )}
          </div>

          {loading && <div style={{ padding: '20px', textAlign: 'center' }}>検索中...</div>}
          {results && results.error && <div className="alert-box danger">{results.error}</div>}
          
          {/* Latest Prime Auto-Generated Matrix */}
          {latestPrimeItems.length > 0 && renderMatrix(latestPrimeItems, "最新Prime (自動生成)", false)}

          {/* User Generated Matrix */}
          {tableItems.length > 0 && renderMatrix(tableItems, "カスタム・レリック表", true)}
        </div>

        {/* Recruitment Chat Generator */}
        <div className="glass-card" id="chat-generator" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">
            <MessageSquare size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
            リクルート募集メーカー
          </h3>
          <p className="cycle-sub" style={{ marginBottom: '16px' }}>
            ゲーム内のリクルート（分隊募集）チャットに貼り付ける定型文を作成します。
            左側の表の吹き出しアイコンをクリックすると自動入力されます。
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
