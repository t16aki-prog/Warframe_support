import React, { useState, useEffect } from 'react';
import { Package, Box, Archive, Star } from 'lucide-react';
import { AutocompleteSearch } from './AutocompleteSearch';
import { fetchWorldState, type WorldState } from '../utils/warframeApi';


interface DataExplorerProps {
  navState?: any;
  clearNavState?: () => void;
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ navState, clearNavState }) => {
  const [activeTab, setActiveTab] = useState<'relics' | 'warframes' | 'vaulted' | 'augments' | 'resources' | 'mods'>('relics');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [backTarget, setBackTarget] = useState<string | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  useEffect(() => {
    fetchWorldState().then(data => {
      if (data) setWorldState(data);
    });
  }, []);

  const addToWishlist = (itemName: string, type: 'relic' | 'part' | 'frame' | 'resource') => {
    const current = JSON.parse(localStorage.getItem('warframe_wishlist') || '[]');
    if (!current.some((item: any) => item.name === itemName)) {
      const newItem = { id: Date.now().toString(), name: itemName, type };
      localStorage.setItem('warframe_wishlist', JSON.stringify([...current, newItem]));
      alert(`${itemName} を欲しいものリストに追加しました！`);
    } else {
      alert(`${itemName} は既に欲しいものリストに登録されています。`);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && activeTab !== 'vaulted' && activeTab !== 'augments' && activeTab !== 'resources') return;
    
    setLoading(true);
    setResults(null);
    try {
      let endpoint = '';
      if (activeTab === 'relics') {
        endpoint = `/api/relics?q=${encodeURIComponent(searchQuery)}`;
      } else if (activeTab === 'warframes') {
        endpoint = `/api/warframes/${encodeURIComponent(searchQuery)}`;
      } else if (activeTab === 'vaulted') {
        endpoint = `/api/vaulted`;
      } else if (activeTab === 'augments') {
        endpoint = `/api/augments`;
      } else if (activeTab === 'mods') {
        endpoint = `/api/item-locations/${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = `/api/resources`;
      }

      const res = await fetch(endpoint);
      if (res.status === 503) {
        const errorData = await res.json();
        setResults({ error: errorData.error || "データベース構築中です..." });
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults({ error: 'データの取得に失敗しました。サーバーが起動しているか確認してください。' });
    }
    setLoading(false);
  };

  // Handle incoming cross-tab navigation
  useEffect(() => {
    if (navState && navState.tab === 'dataexplorer') {
      if (navState.subTab) {
        setActiveTab(navState.subTab as any);
      }
      if (navState.query) {
        setSearchQuery(navState.query);
        // We need to fetch immediately since state updates are async
        const runSearch = async () => {
          setLoading(true);
          try {
            let endpoint = '';
            if (navState.subTab === 'relics') {
              endpoint = `/api/relics?q=${encodeURIComponent(navState.query)}`;
            } else if (navState.subTab === 'warframes') {
              endpoint = `/api/warframes/${encodeURIComponent(navState.query)}`;
            } else if (navState.subTab === 'mods') {
              endpoint = `/api/item-locations/${encodeURIComponent(navState.query)}`;
            }
            if (endpoint) {
              const res = await fetch(endpoint);
              const data = await res.json();
              setResults(data);
            }
          } catch (err) {
            console.error(err);
          }
          setLoading(false);
        };
        runSearch();
      }
      if (navState.from) {
        setBackTarget(navState.from);
      }
      if (clearNavState) clearNavState();
    }
  }, [navState, clearNavState]);

  useEffect(() => {
    if (activeTab === 'vaulted' || activeTab === 'augments' || activeTab === 'resources') {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    } else {
      setResults(null);
    }
  }, [activeTab]);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">データベース検索</h2>
        <p className="page-desc">レリックのドロップ先、フレームの取得方法、格納(Vault)済みのアイテムを確認できます。</p>
      </div>

      {backTarget && (
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: backTarget } }));
            setBackTarget(null);
          }} 
          className="btn-primary" 
          style={{ marginBottom: '16px', background: 'var(--color-gold)', color: 'black' }}
        >
          ← 元の画面に戻る
        </button>
      )}

      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px' }}>
          <button 
            onClick={() => setActiveTab('relics')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'relics' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'relics' ? 'var(--color-gold)' : 'var(--text-muted)' }}
          >
            <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            レリック検索
          </button>
          <button 
            onClick={() => setActiveTab('warframes')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'warframes' ? 'var(--color-teal)' : 'var(--border-light)', color: activeTab === 'warframes' ? 'var(--color-teal)' : 'var(--text-muted)' }}
          >
            <Box size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            フレーム取得方法
          </button>
          <button 
            onClick={() => setActiveTab('vaulted')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'vaulted' ? 'var(--color-purple)' : 'var(--border-light)', color: activeTab === 'vaulted' ? 'var(--color-purple)' : 'var(--text-muted)' }}
          >
            <Archive size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            格納(Vault)一覧
          </button>
          <button 
            onClick={() => setActiveTab('augments')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'augments' ? 'var(--color-danger)' : 'var(--border-light)', color: activeTab === 'augments' ? 'var(--color-danger)' : 'var(--text-muted)' }}
          >
            <Box size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            増強MOD一覧
          </button>
          <button 
            onClick={() => setActiveTab('resources')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'resources' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'resources' ? 'var(--color-gold)' : 'var(--text-muted)' }}
          >
            <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            素材・最適狩場
          </button>
          <button 
            onClick={() => setActiveTab('mods')}
            className="btn-copy"
            style={{ borderColor: activeTab === 'mods' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'mods' ? 'var(--color-gold)' : 'var(--text-muted)' }}
          >
            <Star size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            MOD等入手先
          </button>
        </div>

        {activeTab !== 'vaulted' && activeTab !== 'augments' && activeTab !== 'resources' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <AutocompleteSearch 
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
            placeholder={
              activeTab === 'relics' ? '例: Lith G1, Axi L4...' : 
              activeTab === 'warframes' ? '例: Titania, Wukong...' :
              activeTab === 'mods' ? '例: Blind Rage, Continuity...' :
              'キーワードを入力...'
            }
            type={activeTab === 'relics' ? 'relics' : activeTab === 'warframes' ? 'warframes' : 'all'}
            disabled={false}
          />
        </div>
        )}
      </div>

      {loading && activeTab === 'vaulted' && <div style={{ textAlign: 'center', padding: '40px' }}>Loading Vaulted Primes...</div>}

      {results && !results.error && activeTab === 'relics' && (
        <div className="grid-dashboard">
          <div className="glass-card">
            <h3>レリック内容</h3>
            <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
              {results.relics?.map((r: any, i: number) => (
                <li key={i} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <strong>{r.name}</strong> {r.vaulted ? <span className="badge danger">Vaulted</span> : <span className="badge teal">Available</span>}
                  <button 
                    onClick={() => addToWishlist(r.name, 'relic')}
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
      )}

      {results && !results.error && activeTab === 'warframes' && (
        <div className="grid-dashboard">
          <div className="glass-card">
            <h3>フレーム・パーツ</h3>
            {(() => {
              const normalParts = results.parts?.filter((p: any) => !p.name.includes('Prime') && !p.name.includes('Umbra')) || [];
              const primeParts = results.parts?.filter((p: any) => p.name.includes('Prime') || p.name.includes('Umbra')) || [];
              
              if (normalParts.length === 0 && primeParts.length === 0) {
                return <div style={{ marginTop: '12px', paddingLeft: '20px' }}>見つかりませんでした</div>;
              }

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '12px' }}>
                  {normalParts.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--text-color)', marginBottom: '8px', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>通常版</h4>
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
                            // If it's just the frame (no components), use the frame name
                            if (allParts.length === 1 && part === frame) displayName = frame.name;
                            else displayName = `${frame.name} ${displayName}`;

                            return (
                              <li key={`${frameIdx}-${idx}`} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <strong>{displayName}</strong>
                                  <button onClick={() => addToWishlist(displayName, 'part')} className="btn-copy" style={{ padding: '2px 6px', fontSize: '11px' }}>
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
                                            query = query.replace(' Relic', '').replace(' レリック', '').replace(' Intact', '').replace(' Exceptional', '').replace(' Flawless', '').replace(' Radiant', '').trim();
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
                      <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', borderBottom: '1px solid var(--color-gold)', paddingBottom: '4px' }}>Prime / Umbra版</h4>
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
                                  <button onClick={() => addToWishlist(displayName, 'part')} className="btn-copy" style={{ padding: '2px 6px', fontSize: '11px' }}>
                                    <Star size={10} style={{ marginRight: '2px' }} /> 追加
                                  </button>
                                </div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{part.description}</div>
                                {part.drops && part.drops.length > 0 && (
                                  <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {part.drops.map((d: any, di: number) => {
                                      const isVaulted = d.place.includes('Vaulted');
                                      const baseName = d.place.replace(' Relic', '').replace(' レリック', '').replace(' Intact', '').replace(' Exceptional', '').replace(' Flawless', '').replace(' Radiant', '').trim();
                                      return (
                                        <span 
                                          key={di} 
                                          className={`badge ${isVaulted ? 'danger' : ''}`} 
                                          style={{ fontSize: '10px', background: isVaulted ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 183, 3, 0.1)', border: `1px solid ${isVaulted ? 'var(--color-danger)' : 'var(--color-gold)'}`, cursor: 'pointer', transition: 'all 0.2s' }}
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
              );
            })()}
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
      )}

      {results && !results.error && activeTab === 'vaulted' && (
        <div className="glass-card">
          <h3>格納済みのプライムアイテム (Vaulted Primes)</h3>

          {worldState?.vaultTrader?.schedule && (
            <div style={{ marginTop: '16px', marginBottom: '24px' }}>
              <h4 style={{ color: 'var(--color-gold)', marginBottom: '8px', borderBottom: '1px solid var(--color-gold)', paddingBottom: '4px' }}>
                🌟 現在リサージェンスで復刻中 (Prime Resurgence)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {worldState.vaultTrader.schedule
                  .filter(s => s.expiry && new Date(s.expiry).getTime() > Date.now())
                  .slice(0, 2)
                  .map((s, idx) => (
                    <div 
                      key={`resurgence-${idx}`} 
                      style={{ padding: '8px', background: 'rgba(255,183,3,0.05)', border: '1px solid var(--color-gold)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="クリックして自作レリック表に展開する"
                      onClick={() => {
                        let rawItem = s.item || '';
                        // Remove Pack words and split by & or /
                        rawItem = rawItem.replace(/ dual pack/gi, '').replace(/ pack/gi, '').replace(/&/g, '/').replace(/ and /gi, '/');
                        const items = rawItem.split('/').map((i: string) => i.trim()).filter(Boolean);
                        window.dispatchEvent(new CustomEvent('navigateTab', { 
                          detail: { tab: 'relicgenerator', action: 'addResurgence', items } 
                        }));
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
            {results.map((item: any, i: number) => {
              // 復刻中のアイテム名が含まれているか簡易チェックして色を変えるなどの処理も可能
              return (
              <div key={i} style={{ padding: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-purple)' }}>{item.category}</div>
              </div>
            )})}
          </div>
        </div>
      )}

      {results && !results.error && activeTab === 'augments' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>増強MOD一覧 (Augments)</h3>
            <input 
              type="text" 
              className="terminal-input" 
              style={{ width: '300px' }}
              placeholder="フレーム名やMOD名で絞り込み..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
            {(results.augments || [])
              .filter((aug: any) => 
                aug.frame.toLowerCase().includes(searchQuery.toLowerCase()) || 
                aug.modName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                aug.effect.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((aug: any, i: number) => (
              <div key={i} style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '16px', color: 'var(--color-teal)' }}>{aug.modName}</strong>
                    <span className="badge" style={{ marginLeft: '8px', background: 'rgba(255,255,255,0.1)' }}>{aug.frame}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ fontSize: '12px', color: 'var(--color-gold)' }}>
                      {aug.syndicate}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-color)', marginTop: '8px', lineHeight: '1.5' }}>
                  {aug.effect}
                </div>
              </div>
            ))}
            {results.augments && results.augments.length === 0 && <div>増強MODデータが登録されていません。</div>}
          </div>
        </div>
      )}

      {results && !results.error && activeTab === 'resources' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>素材・最適狩場一覧 (Resources)</h3>
            <input 
              type="text" 
              className="terminal-input" 
              style={{ width: '300px' }}
              placeholder="素材名で絞り込み..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {(results.resources || [])
              .filter((res: any) => 
                res.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((res: any, i: number) => (
              <div key={i} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ fontSize: '18px', color: 'var(--color-gold)' }}>{res.name}</strong>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{res.type}</span>
                    <button 
                      onClick={() => addToWishlist(res.name, 'resource')}
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
      )}

      {results?.error && (
        <div className="glass-card neon-danger">
          <p style={{ color: 'var(--color-danger)' }}>{results.error}</p>
        </div>
      )}

      {results && !results.error && activeTab === 'mods' && (
        <div className="glass-card">
          <h3>MOD・アイテムドロップ場所 ({(results.locations || []).length}件)</h3>
          <ul style={{ marginTop: '12px', paddingLeft: '20px', maxHeight: '500px', overflowY: 'auto' }}>
            {(results.locations || []).map((loc: any, i: number) => (
              <li key={i} style={{ marginBottom: '8px', fontSize: '15px' }}>
                {loc}
              </li>
            ))}
            {(!results.locations || results.locations.length === 0) && (
              <li>見つかりませんでした。</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
