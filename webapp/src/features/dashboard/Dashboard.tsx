import React from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import type { DashboardProps } from './types';
import { useDashboardData } from './hooks/useDashboardData';
import { PlainsCycleCard } from './components/PlainsCycleCard';
import { FissuresCard } from './components/FissuresCard';
import { EventsCard } from './components/EventsCard';

export const Dashboard: React.FC<DashboardProps> = ({ showSteelPath = true }) => {
  const {
    worldState,
    loading,
    error,
    lastUpdated,
    userLocale,
    userTimeZone,
    trackedLocations,
    favoriteNodes,
    toggleFavoriteNode,
    getLiveTimeLeft,
    loadData,
  } = useDashboardData();

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
        {worldState && (
          <>
            <PlainsCycleCard worldState={worldState} getLiveTimeLeft={getLiveTimeLeft} />
            <FissuresCard
              worldState={worldState}
              showSteelPath={showSteelPath}
              trackedLocations={trackedLocations}
              favoriteNodes={favoriteNodes}
              toggleFavoriteNode={toggleFavoriteNode}
              getLiveTimeLeft={getLiveTimeLeft}
            />
            <EventsCard
              worldState={worldState}
              userLocale={userLocale}
              userTimeZone={userTimeZone}
              getLiveTimeLeft={getLiveTimeLeft}
            />
          </>
        )}
      </div>
    </div>
  );
};
