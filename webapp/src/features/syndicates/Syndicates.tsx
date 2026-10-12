import React from 'react';
import { Crosshair, RefreshCw, ShieldAlert } from 'lucide-react';
import type { SyndicatesProps } from './types';
import { useSyndicatesData } from './hooks/useSyndicatesData';
import { AyaFarmWidget } from './components/AyaFarmWidget';
import { SyndicateCard } from './components/SyndicateCard';

export const Syndicates: React.FC<SyndicatesProps> = ({ showSteelPath = true }) => {
  const {
    worldState,
    loading,
    error,
    lastUpdated,
    userRanks,
    getLiveTimeLeft,
    loadData,
  } = useSyndicatesData();

  if (loading && !worldState) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: '16px' }}>
        <RefreshCw size={36} className="logo-icon" style={{ animation: 'spinRing 2s linear infinite' }} />
        <p className="page-desc">中立シンジケートの依頼データを取得中...</p>
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
          <h2 className="page-title">中立シンジケート (Bounties)</h2>
          <p className="page-desc">シータス、フォーチュナー、ネクロリスクの依頼ローテーションとアヤ回収の最適解を表示します。</p>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {worldState && worldState.syndicateMissions && (
          <div className="glass-card neon-gold" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 className="card-title" style={{ color: 'var(--color-gold)', marginBottom: '8px' }}>
                  <Crosshair size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
                  現在の依頼ローテーション
                </h3>
              </div>
              <AyaFarmWidget worldState={worldState} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {worldState.syndicateMissions
                .filter((syn) => syn.jobs && syn.jobs.length > 0)
                .map((syndicate) => (
                  <SyndicateCard
                    key={syndicate.id}
                    syndicate={syndicate}
                    currentRank={userRanks[syndicate.syndicateKey] ?? 5}
                    showSteelPath={showSteelPath}
                    getLiveTimeLeft={getLiveTimeLeft}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
