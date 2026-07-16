import React, { useState, useEffect } from 'react';
import { Compass, RefreshCw, Sun, Moon, Flame, Sparkles, Zap, ShieldAlert, ShoppingCart, Star, Target } from 'lucide-react';
import { fetchWorldState, type WorldState, type Fissure } from '../utils/warframeApi';
import { translateText } from '../utils/translate';

interface DashboardProps {
  showSteelPath?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ showSteelPath = true }) => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());

  const userLocale = localStorage.getItem('ordis_locale') || navigator.language;
  const userTimeZone = localStorage.getItem('ordis_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const [trackedItem, setTrackedItem] = useState<string | null>(null);
  const [trackedLocations, setTrackedLocations] = useState<string[]>([]);
  const [favoriteNodes, setFavoriteNodes] = useState<string[]>([]);

  useEffect(() => {
    // Load tracking and favorites
    const item = localStorage.getItem('warframe_tracked_item');
    if (item) {
      setTrackedItem(item);
      fetch(`/api/item-locations/${encodeURIComponent(item)}`)
        .then(res => res.json())
        .then(data => {
          if (data.locations) {
            setTrackedLocations(data.locations);
          }
        })
        .catch(console.error);
    }

    const favs = JSON.parse(localStorage.getItem('warframe_favorite_nodes') || '[]');
    setFavoriteNodes(favs);
  }, []);

  const toggleFavoriteNode = (node: string) => {
    let newFavs;
    if (favoriteNodes.includes(node)) {
      newFavs = favoriteNodes.filter(n => n !== node);
    } else {
      newFavs = [...favoriteNodes, node];
    }
    setFavoriteNodes(newFavs);
    localStorage.setItem('warframe_favorite_nodes', JSON.stringify(newFavs));
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLiveTimeLeft = (targetDateString: string) => {
    const target = new Date(targetDateString).getTime();
    const diff = target - now;
    if (diff <= 0) return 'まもなく更新...';
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (d > 0) return `${d}日 ${h}時間 ${m}分 ${s}秒`;
    if (h > 0) return `${h}時間 ${m}分 ${s}秒`;
    return `${m}分 ${s}秒`;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchWorldState();
    if (data) {
      setWorldState(data);
      setLastUpdated(new Date());
    } else {
      setError('データの取得に失敗しました。APIサーバーが混雑している可能性があります。');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 60 seconds
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !worldState) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <RefreshCw size={36} className="logo-icon" style={{ animation: 'spinRing 2s linear infinite' }} />
        <p className="page-desc">オービターからWorld Stateデータをロード中...</p>
      </div>
    );
  }

  if (error && !worldState) {
    return (
      <div className="glass-card neon-purple" style={{ textAlign: 'center', padding: '40px' }}>
        <ShieldAlert size={48} style={{ color: 'var(--color-danger)', marginBottom: '16px' }} />
        <h3 style={{ marginBottom: '12px' }}>通信エラーが発生しました</h3>
        <p className="page-desc" style={{ marginBottom: '24px' }}>{error}</p>
        <button onClick={loadData} className="btn-primary">再読み込みを試みる</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="page-title">システム状況 (World State)</h2>
          <p className="page-desc">Warframeの主要なゲーム内サイクルとイベント状況をリアルタイムで追跡します。</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastUpdated && (
            <span className="cycle-sub">
              最終更新: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={loadData}
            className="btn-copy"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spinRing 1s linear infinite' : undefined }} />
            手動更新
          </button>
        </div>
      </div>

      <div className="grid-dashboard">
        {/* Card 1: Plains Cycles */}
        {worldState && (
          <div className="glass-card neon-teal">
            <h3 className="card-title">
              <Compass size={18} className="card-title-icon" />
              平原・オープンワールド状況
            </h3>
            
            {/* Cetus Cycle */}
            <div className="cycle-item">
              <div className="cycle-name">
                シータス (地球)
                <span className="cycle-sub">エイドロンハント (夜) の追跡</span>
              </div>
              <div className="cycle-val">
                {worldState.cetusCycle.isDay ? (
                  <>
                    <Sun size={18} style={{ color: 'var(--color-gold)' }} />
                    <span className="badge gold">昼 (Day)</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} style={{ color: 'var(--color-teal)' }} />
                    <span className="badge teal">夜 (Night)</span>
                  </>
                )}
                <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getLiveTimeLeft(worldState.cetusCycle.expiry)}</span>
              </div>
            </div>

            {/* Vallis Cycle */}
            <div className="cycle-item">
              <div className="cycle-name">
                オーブ渓谷 (金星)
                <span className="cycle-sub">サーミア湧出・釣り</span>
              </div>
              <div className="cycle-val">
                {worldState.vallisCycle.isWarm ? (
                  <>
                    <Sun size={18} style={{ color: 'var(--color-danger)' }} />
                    <span className="badge danger">温暖 (Warm)</span>
                  </>
                ) : (
                  <>
                    <Moon size={18} style={{ color: 'var(--color-teal)' }} />
                    <span className="badge teal">極寒 (Cold)</span>
                  </>
                )}
                <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getLiveTimeLeft(worldState.vallisCycle.expiry)}</span>
              </div>
            </div>

            {/* Cambion Cycle */}
            <div className="cycle-item">
              <div className="cycle-name">
                カンビオン平原 (火星)
                <span className="cycle-sub">感染体の支配サイクル</span>
              </div>
              <div className="cycle-val">
                {worldState.cambionCycle.active === 'fass' ? (
                  <>
                    <Flame size={18} style={{ color: 'var(--color-gold)' }} />
                    <span className="badge gold">Fass</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} style={{ color: 'var(--color-purple)' }} />
                    <span className="badge purple">Vome</span>
                  </>
                )}
                <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getLiveTimeLeft(worldState.cambionCycle.expiry)}</span>
              </div>
            </div>

            {/* Duviri Cycle */}
            <div className="cycle-item">
              <div className="cycle-name">
                デュヴィリ (Duviri)
                <span className="cycle-sub">スパイラル感情サイクル</span>
              </div>
              <div className="cycle-val">
                <span className="badge purple" style={{ fontSize: '12px' }}>
                  {worldState.duviriCycle.state.toUpperCase()}
                </span>
                <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{getLiveTimeLeft(worldState.duviriCycle.expiry)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Card 2: Void Fissures */}
        {worldState && (
          <div className="glass-card neon-purple">
            <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
              <Zap size={18} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
              アクティブなVoid亀裂 (Fissures)
            </h3>
            <div className="fissures-container">
              {worldState.fissures
                .filter((f) => !f.expired)
                .filter((f) => showSteelPath || !f.isHard)
                .sort((a, b) => {
                  // Sort: Tracked Nodes first, then Favorites, then normal
                  const isTrackedNode = (node: string) => {
                    if (!node || typeof node !== 'string') return false;
                    return trackedLocations.some(loc => {
                      if (!loc || typeof loc !== 'string') return false;
                      return loc.includes(node) || node.includes(loc.split(' ')[0]);
                    });
                  };
                  const aTracked = isTrackedNode(a.node);
                  const bTracked = isTrackedNode(b.node);
                  if (aTracked && !bTracked) return -1;
                  if (!aTracked && bTracked) return 1;
                  const aFav = favoriteNodes.includes(a.node);
                  const bFav = favoriteNodes.includes(b.node);
                  if (aFav && !bFav) return -1;
                  if (!aFav && bFav) return 1;
                  return 0;
                })
                .map((fissure) => {
                  const isTrackedNode = (node: string) => {
                    if (!node || typeof node !== 'string') return false;
                    return trackedLocations.some(loc => {
                      if (!loc || typeof loc !== 'string') return false;
                      return loc.includes(node) || node.includes(loc.split(' ')[0]);
                    });
                  };
                  const isTracked = isTrackedNode(fissure.node);
                  const isFav = favoriteNodes.includes(fissure.node);
                  return (
                  <div key={fissure.id} className="fissure-card" style={{ 
                    border: isTracked ? '1px solid var(--color-gold)' : isFav ? '1px solid var(--color-teal)' : undefined,
                    background: isTracked ? 'rgba(255, 183, 3, 0.05)' : isFav ? 'rgba(0, 242, 254, 0.05)' : undefined
                  }}>
                    <div className="fissure-info">
                      <div className="fissure-node" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {fissure.node}
                        {fissure.isHard && <span className="badge danger" style={{ fontSize: '10px', padding: '2px 4px' }}>鋼の道のり</span>}
                        <button 
                          onClick={() => toggleFavoriteNode(fissure.node)} 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="お気に入りノードに登録/解除"
                        >
                          <Star size={14} fill={isFav ? "var(--color-gold)" : "none"} color={isFav ? "var(--color-gold)" : "var(--text-muted)"} />
                        </button>
                        {isTracked && <span className="badge gold" style={{ fontSize: '10px', padding: '2px 4px' }}><Target size={10} style={{marginRight: '2px', verticalAlign: 'middle'}}/>🎯 追跡アイテムドロップ！</span>}
                      </div>
                      <div className="fissure-mission">
                        {translateText(fissure.missionType)} | {translateText(fissure.enemy)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        className={`badge ${
                          fissure.tier === 'Requiem'
                            ? 'danger'
                            : fissure.tier === 'Axi'
                            ? 'purple'
                            : fissure.tier === 'Neo'
                            ? 'gold'
                            : 'teal'
                        }`}
                      >
                        {fissure.tier}
                      </span>
                      <span className="fissure-time" style={{ fontVariantNumeric: 'tabular-nums' }}>{getLiveTimeLeft(fissure.expiry)}</span>
                    </div>
                  </div>
                )})}
            </div>
          </div>
        )}

        {/* Card 3: Void Trader & Nightwave */}
        {worldState && (
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Void Trader Section */}
            <div>
              <h3 className="card-title" style={{ color: 'var(--color-gold)', marginBottom: '12px' }}>
                <ShoppingCart size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
                Voidの商人 Baro Ki'Teer
              </h3>
              {worldState.voidTrader.active ? (
                <div style={{ padding: '12px', background: 'rgba(255, 183, 3, 0.05)', border: '1px solid rgba(255, 183, 3, 0.2)', borderRadius: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-gold)' }}>
                    現在出現中！ Location: {worldState.voidTrader.location}
                  </div>
                  <div className="cycle-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    出発まであと: {getLiveTimeLeft(worldState.voidTrader.expiry)}
                  </div>
                  <div className="cycle-sub" style={{ marginTop: '4px' }}>
                    出発日時: {new Date(worldState.voidTrader.expiry).toLocaleString(userLocale, { timeZone: userTimeZone })}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
                  <div>次回到着予定地: {worldState.voidTrader.location || '不明'}</div>
                  <div className="cycle-sub" style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-mono)', fontSize: '14px', marginTop: '4px', fontVariantNumeric: 'tabular-nums' }}>
                    到着まであと: {getLiveTimeLeft(worldState.voidTrader.activation)}
                  </div>
                  <div className="cycle-sub" style={{ marginTop: '4px' }}>
                    到着日時: {new Date(worldState.voidTrader.activation).toLocaleString(userLocale, { timeZone: userTimeZone })}
                  </div>
                </div>
              )}
            </div>

            {/* Nightwave Section */}
            {worldState.nightwave && (
              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <h3 className="card-title" style={{ color: 'var(--color-teal)', marginBottom: '12px' }}>
                  <Sparkles size={18} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
                  ナイトウェーブ (Nightwave)
                </h3>
                {worldState.nightwave.expiry && (
                  <div className="cycle-sub" style={{ marginBottom: '12px' }}>
                    終了予定: {new Date(worldState.nightwave.expiry).toLocaleString(userLocale, { timeZone: userTimeZone })}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto', paddingRight: '4px' }}>
                  {worldState.nightwave.activeChallenges.map((challenge) => (
                    <div
                      key={challenge.id}
                      style={{
                        padding: '8px',
                        background: 'rgba(255,255,255,0.015)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: '600', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{challenge.title}</span>
                        <span style={{ color: 'var(--color-teal)' }}>+{challenge.standing}</span>
                      </div>
                      <div className="cycle-sub" style={{ fontSize: '11px' }}>{challenge.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
