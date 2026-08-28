import React, { useState, useEffect, useMemo } from 'react';
import { Search, Shield, Zap, Sparkles, AlertCircle, RefreshCw, Crosshair, Sword, Cpu, Rocket, Database } from 'lucide-react';

interface Augment {
  name: string;
  effect: string;
  syndicate: string;
}

interface BuildData {
  itemName: string;
  augments: Augment[];
  popularBuild: {
    aura?: string;
    stance?: string;
    exilus: string;
    arcanes: string[];
    mods: string[];
    playstyle: string;
  };
}

interface ItemDefinition {
  name: string;
  category: string;
  uniqueName: string;
}

const CATEGORIES = [
  { id: 'Warframes', label: 'フレーム', icon: <Shield size={16} /> },
  { id: 'Primary', label: 'プライマリ', icon: <Crosshair size={16} /> },
  { id: 'Secondary', label: 'セカンダリ', icon: <Zap size={16} /> },
  { id: 'Melee', label: '近接', icon: <Sword size={16} /> },
  { id: 'Pets', label: 'コンパニオン', icon: <Cpu size={16} /> },
  { id: 'Archwing', label: 'アークウイング', icon: <Rocket size={16} /> },
  { id: 'Arch-Gun', label: 'アークウイングガン', icon: <Rocket size={16} /> },
  { id: 'Arch-Melee', label: 'アークウイング近接', icon: <Sword size={16} /> },
  { id: 'Necramech', label: 'ネクロメカ', icon: <Cpu size={16} /> }
];

export const Builds: React.FC = () => {
  const [items, setItems] = useState<ItemDefinition[]>([]);
  const [activeCategory, setActiveCategory] = useState('Warframes');
  const [filterText, setFilterText] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);

  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildData, setBuildData] = useState<BuildData | null>(null);
  const [warframesData, setWarframesData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'build' | 'acquisition'>('build');

  // Fetch all items on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://api.warframestat.us/items?language=ja');
        const data = await response.json();
        
        try {
          const wfResponse = await fetch('https://api.warframestat.us/warframes?language=ja');
          const wfData = await wfResponse.json();
          setWarframesData(wfData);
        } catch (e) {
          console.error('Failed to fetch warframes data:', e);
        }
        
        // Filter out cosmetics and non-gear
        const gearItems = data.filter((item: any) => 
          !item.name.includes('Skin') && 
          !item.name.includes('Helmet') &&
          item.category
        );
        
        // Normalize categories (e.g. Sentinels -> Pets, Voidrig -> Necramech)
        const normalized = gearItems.map((item: any) => {
          let cat = item.category;
          if (cat === 'Sentinels') cat = 'Pets';
          if (item.name === 'Voidrig' || item.name === 'Bonewidow') cat = 'Necramech';
          return { name: item.name, category: cat, uniqueName: item.uniqueName };
        }).filter((item: any) => {
          // フレームの「Prime」「Umbra」などのバリエーションを除外してベースフレームに一元化
          if (item.category === 'Warframes') {
            if (item.name.includes('Prime') || item.name.includes('Umbra')) {
              return false;
            }
          }
          return true;
        });

        // Unique filter to remove duplicate base names if needed
        const uniqueItems = Array.from(new Map(normalized.map((item: any) => [item.name, item])).values()) as ItemDefinition[];
        setItems(uniqueItems);
      } catch (e) {
        console.error('Failed to fetch items:', e);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items
      .filter(item => item.category === activeCategory)
      .filter(item => item.name.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, activeCategory, filterText]);

  const handleSelectItem = async (itemName: string) => {
    setSelectedItem(itemName);
    setLoadingBuild(true);
    setError(null);
    setBuildData(null);

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch(`/api/builds/${encodeURIComponent(itemName)}?category=${encodeURIComponent(activeCategory)}`, {
        headers: {
          'x-api-key': apiKey
        }
      });
      if (!response.ok) {
        throw new Error('データの取得に失敗しました。');
      }
      const data: BuildData = await response.json();
      setBuildData(data);
    } catch (err: any) {
      console.error(err);
      setError('ビルド情報の生成中にエラーが発生しました。セファロンAIが応答していません。');
    } finally {
      setLoadingBuild(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h2 className="page-title">ビルド＆増強MOD データベース</h2>
        <p className="page-desc">
          セファロンAIが最新のメタを解析し、選択した装備の「最適ビルド」を自動生成します。
        </p>
      </div>

      {/* Category Tabs */}
      <div className="tabs-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`tab-button ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => {
              setActiveCategory(cat.id);
              if (cat.id !== 'Warframes') setViewMode('build');
              setFilterText('');
              setSelectedItem(null);
              setBuildData(null);
            }}
            style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {activeCategory === 'Warframes' && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '-8px' }}>
          <button 
            className={`tab-button ${viewMode === 'build' ? 'active' : ''}`} 
            onClick={() => setViewMode('build')}
            style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '4px' }}
          >
            <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
            ビルド構成
          </button>
          <button 
            className={`tab-button ${viewMode === 'acquisition' ? 'active' : ''}`} 
            onClick={() => setViewMode('acquisition')}
            style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '4px' }}
          >
            <Database size={14} style={{ display: 'inline', marginRight: '4px' }} />
            取得方法一覧
          </button>
        </div>
      )}

      {viewMode === 'acquisition' && activeCategory === 'Warframes' ? (
        <div className="glass-card custom-scrollbar" style={{ padding: '24px', overflowY: 'auto', maxHeight: '70vh' }}>
          <h3 className="card-title" style={{ color: 'var(--color-primary)', marginBottom: '24px' }}>フレーム取得方法一覧</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {warframesData.filter(wf => !wf.name.includes('Prime') && !wf.name.includes('Umbra') && wf.components && wf.components.length > 0).map(wf => (
              <div key={wf.uniqueName} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h4 style={{ color: 'var(--color-gold)', fontSize: '18px', marginBottom: '12px' }}>{wf.name}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                  {wf.components.filter((c: any) => c.drops && c.drops.length > 0).map((comp: any) => (
                    <div key={comp.uniqueName} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: 'var(--color-primary)' }}>{comp.name}</div>
                      {comp.drops.slice(0, 3).map((drop: any, idx: number) => (
                        <div key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{drop.location}</span>
                          <span style={{ color: drop.rarity === 'Rare' ? '#e2b007' : drop.rarity === 'Uncommon' ? 'silver' : '#b08d6a' }}>
                            {drop.chance}%
                          </span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Item Selection List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
          
          <div style={{ position: 'relative' }}>
            <Search className="input-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="絞り込み..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px', fontSize: '14px' }}
            />
          </div>

          <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '8px' }} className="custom-scrollbar">
            {loadingItems ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
                <RefreshCw size={24} style={{ animation: 'spinRing 1s linear infinite', color: 'var(--color-primary)' }} />
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <button
                  key={item.uniqueName}
                  onClick={() => handleSelectItem(item.name)}
                  style={{
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: selectedItem === item.name ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: selectedItem === item.name ? '1px solid var(--color-primary)' : '1px solid transparent',
                    borderRadius: '6px',
                    color: 'var(--text-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '14px',
                    fontWeight: selectedItem === item.name ? 'bold' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedItem !== item.name) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedItem !== item.name) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                >
                  {item.name}
                </button>
              ))
            ) : (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                見つかりませんでした
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Build Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {loadingBuild && (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px' }}>
              <RefreshCw size={48} style={{ animation: 'spinRing 1.5s linear infinite', color: 'var(--color-gold)' }} />
              <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>セファロンAIが最新のビルド構成を解析中...</div>
            </div>
          )}

          {error && !loadingBuild && (
            <div className="glass-card neon-purple" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: 'var(--text-color)' }}>{error}</span>
            </div>
          )}

          {!loadingBuild && !error && !buildData && selectedItem && (
             <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
               {selectedItem} を選択しました。解析ボタンが不要になり、選択するだけで自動的に構築されます。
             </div>
          )}

          {!loadingBuild && !error && buildData && (
            <div className="glass-card neon-gold" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
                <Shield size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
                AI推奨ビルド構成 ({buildData.itemName || selectedItem})
              </h3>

              {/* Auras, Stances & Arcanes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {buildData.popularBuild.aura && (
                  <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'mods', query: buildData.popularBuild.aura, from: 'builds' } }))}
                    style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '12px', flex: '1 1 200px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    title="クリックして入手先を検索"
                  >
                    <div className="cycle-sub" style={{ marginBottom: '4px' }}>オーラ (Aura)</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.aura}</div>
                  </div>
                )}
                {buildData.popularBuild.stance && (
                  <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'mods', query: buildData.popularBuild.stance, from: 'builds' } }))}
                    style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '12px', flex: '1 1 200px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.5)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    title="クリックして入手先を検索"
                  >
                    <div className="cycle-sub" style={{ marginBottom: '4px' }}>スタンス (Stance)</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.stance}</div>
                  </div>
                )}
                {buildData.popularBuild.exilus && (
                  <div 
                    onClick={() => window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'mods', query: buildData.popularBuild.exilus, from: 'builds' } }))}
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', flex: '1 1 200px', cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-gold)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}
                    title="クリックして入手先を検索"
                  >
                    <div className="cycle-sub" style={{ marginBottom: '4px' }}>エクシラス (Exilus / Tennokai)</div>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.exilus}</div>
                  </div>
                )}
                {buildData.popularBuild.arcanes && buildData.popularBuild.arcanes.length > 0 && (
                  <div style={{ background: 'rgba(157, 78, 221, 0.1)', border: '1px solid var(--color-purple)', borderRadius: '8px', padding: '12px', flex: '1 1 200px' }}>
                    <div className="cycle-sub" style={{ marginBottom: '4px', color: 'var(--color-purple)' }}>アルケイン (Arcanes)</div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {buildData.popularBuild.arcanes.map((arcane, i) => (
                        <span key={i}>• {arcane}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Mods Grid */}
              <div>
                <div className="cycle-sub" style={{ marginBottom: '8px' }}>メインMOD構成</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  {buildData.popularBuild.mods.map((mod, i) => (
                    <div 
                      key={i} 
                      onClick={() => window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: 'dataexplorer', subTab: 'mods', query: mod, from: 'builds' } }))}
                      style={{ 
                        background: 'rgba(0,0,0,0.3)', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: '6px', 
                        padding: '12px 8px', 
                        textAlign: 'center',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '48px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--color-gold)';
                        e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-light)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      title="クリックして入手先を検索"
                    >
                      {mod}
                    </div>
                  ))}
                </div>
              </div>

              {/* Playstyle */}
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-color)' }}>
                  <Sparkles size={16} style={{ color: 'var(--color-teal)' }} />
                  立ち回り・解説
                </h4>
                <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                  {buildData.popularBuild.playstyle}
                </p>
              </div>

            </div>
          )}

          {/* Augments (if any) */}
          {!loadingBuild && !error && buildData?.augments && buildData.augments.length > 0 && (
            <div className="glass-card neon-teal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
                <Zap size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
                専用増強MOD (Augments)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {buildData.augments.map((aug, index) => (
                  <div key={index} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--color-teal)' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', color: 'var(--color-teal)' }}>
                      {aug.name}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-color)', marginBottom: '8px', lineHeight: '1.4' }}>
                      {aug.effect}
                    </div>
                    {aug.syndicate && (
                      <div className="badge teal" style={{ display: 'inline-block' }}>
                        入手: {aug.syndicate}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Drops for the selected Warframe */}
          {!loadingBuild && !error && buildData && activeCategory === 'Warframes' && (
            (() => {
              const wf = warframesData.find(w => w.name === (buildData.itemName || selectedItem));
              if (!wf || !wf.components || wf.components.filter((c: any) => c.drops && c.drops.length > 0).length === 0) return null;
              
              return (
                <div className="glass-card neon-purple" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 className="card-title" style={{ color: 'var(--color-primary)' }}>
                    <Database size={20} className="card-title-icon" style={{ color: 'var(--color-primary)' }} />
                    取得方法 (Drops)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                    {wf.components.filter((c: any) => c.drops && c.drops.length > 0).map((comp: any) => (
                      <div key={comp.uniqueName} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-primary)' }}>{comp.name}</div>
                        {comp.drops.slice(0, 3).map((drop: any, idx: number) => (
                          <div key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ paddingRight: '8px' }}>{drop.location}</span>
                            <span style={{ color: drop.rarity === 'Rare' ? '#e2b007' : drop.rarity === 'Uncommon' ? 'silver' : '#b08d6a' }}>
                              {drop.chance}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}

        </div>
      </div>
      )}
    </div>
  );
};
