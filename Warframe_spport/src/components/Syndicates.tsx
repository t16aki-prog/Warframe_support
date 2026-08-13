import React, { useState, useEffect } from 'react';
import { Crosshair, Target, RefreshCw, ShieldAlert } from 'lucide-react';
import { fetchWorldState, type WorldState } from '../utils/warframeApi';
import { translateText } from '../utils/translate';

interface SyndicatesProps {
  showSteelPath?: boolean;
}

export const Syndicates: React.FC<SyndicatesProps> = ({ showSteelPath = true }) => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('syndicateRanks');
    if (saved) {
      setUserRanks(JSON.parse(saved));
    } else {
      setUserRanks({
        'Ostrons': 5,
        'Solaris United': 5,
        'Entrati': 5,
        'The Holdfasts': 5,
        'Cavia': 5,
        'The Hex': 5
      });
    }
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
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

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

              {/* Aya Farm Optimizer Widget */}
              <div style={{ background: 'rgba(255, 183, 3, 0.1)', border: '1px solid var(--color-gold)', borderRadius: '8px', padding: '12px', width: '100%' }}>
                <h4 style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '8px' }}>
                  <Target size={16} />
                  アヤ回収の最適解 (Aya Farm)
                </h4>
                <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge gold">常設最適</span>
                    <span>Void - Hepit (確保) / Void - Ukko (確保)</span>
                  </div>
                  {(() => {
                    const SYNDICATE_NAMES_JA: Record<string, string> = {
                      'Ostrons': 'オストロン',
                      'Solaris United': 'ソラリス連合',
                      'Entrati': 'エントラティ',
                      'The Holdfasts': 'ホールドファスト',
                      'The Hex': 'The Hex',
                      'Cavia': 'カビア'
                    };
                    
                    const allAyaJobs: { syndicate: string, job: any }[] = [];
                    
                    worldState.syndicateMissions.forEach(syn => {
                      if (!SYNDICATE_NAMES_JA[syn.syndicateKey]) return;
                      const ayaJobs = syn.jobs.filter(job => 
                        (job.rewardPool || []).some(r => r.includes('Aya') || r.includes('アヤ')) &&
                        job.enemyLevels[0] < 100 // 鋼の道のりは除外
                      );
                      ayaJobs.forEach(job => {
                        allAyaJobs.push({
                          syndicate: SYNDICATE_NAMES_JA[syn.syndicateKey],
                          job: job
                        });
                      });
                    });

                    // 敵のレベルが高い順（＝アヤのドロップ確率・効率が高い順）にソート
                    allAyaJobs.sort((a, b) => b.job.enemyLevels[0] - a.job.enemyLevels[0]);
                    
                    const top3 = allAyaJobs.slice(0, 3);
                    
                    if (top3.length === 0) {
                      return <div style={{ color: 'var(--text-muted)' }}>現在アヤが報酬に含まれる依頼はありません。</div>;
                    }

                    return top3.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="badge" style={{ background: 'var(--color-gold)', color: 'black', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>{idx + 1}</span>
                        <span className="badge teal">{item.syndicate}</span>
                        <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>Lv {item.job.enemyLevels[0]}-{item.job.enemyLevels[1]} 依頼</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-gold)' }}>(高確率・高効率)</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {worldState.syndicateMissions
                .filter(syn => syn.jobs && syn.jobs.length > 0)
                .map((syndicate) => {
                  const SYNDICATE_NAMES_JA: Record<string, string> = {
                    'Ostrons': 'オストロン (シータス)',
                    'Solaris United': 'ソラリス連合 (フォーチュナー)',
                    'Entrati': 'エントラティ (ダイモス)',
                    'The Holdfasts': 'ホールドファスト (Zariman)',
                    'The Hex': 'The Hex (1999)',
                    'Cavia': 'カビア (サンクタム)',
                    'Ostrons (Steel Path)': 'オストロン (鋼の道のり)',
                    'Solaris United (Steel Path)': 'ソラリス連合 (鋼の道のり)'
                  };

                  const synNameJa = SYNDICATE_NAMES_JA[syndicate.syndicateKey] || syndicate.syndicateKey;
                  const currentRank = userRanks[syndicate.syndicateKey] ?? 5; // Default to 5

                  const getRequiredRank = (levels: number[]) => {
                    const maxLvl = levels[1] || levels[0];
                    if (maxLvl <= 15) return 1;
                    if (maxLvl <= 30) return 2;
                    if (maxLvl <= 40) return 3;
                    if (maxLvl <= 50) return 4;
                    return 5;
                  };

                  const availableJobs = syndicate.jobs.filter(job => {
                     const isSteelPath = job.enemyLevels[0] >= 100;
                     if (!showSteelPath && isSteelPath) return false;
                     if (!isSteelPath && getRequiredRank(job.enemyLevels) > currentRank) return false;
                     return true;
                  });

                  if (availableJobs.length === 0) return null;

                  const ayaJobs = availableJobs.filter(job => 
                    (job.rewardPool || []).some(r => r.includes('Aya') || r.includes('アヤ')) &&
                    job.enemyLevels[0] < 100
                  );
                  const bestAyaJob = ayaJobs.length > 0 
                    ? ayaJobs.reduce((prev, current) => (prev.enemyLevels[0] > current.enemyLevels[0]) ? prev : current) 
                    : null;

                  return (
                  <div key={syndicate.id} style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', background: 'rgba(255,255,255,0.015)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ color: 'var(--color-teal)' }}>{synNameJa}</strong>
                      <span className="cycle-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>更新まで: {getLiveTimeLeft(syndicate.expiry)}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {availableJobs.map((job, idx) => {
                        const hasAya = (job.rewardPool || []).some(r => r.includes('Aya') || r.includes('アヤ'));
                        const isBestAya = hasAya && bestAyaJob && job.id === bestAyaJob.id;

                        const isSteelPath = job.enemyLevels[0] >= 100;
                        if (!showSteelPath && isSteelPath) return null;

                        return (
                          <details key={`${syndicate.id}-job-${idx}`} style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}>
                            <summary style={{ fontSize: '13px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', outline: 'none' }}>
                              <span style={{ color: isBestAya ? 'var(--color-gold)' : 'inherit' }}>
                                Lv {job.enemyLevels.join('-')} | {translateText(job.type)}
                                {isSteelPath && <span style={{ color: 'var(--color-danger)', marginLeft: '6px', fontWeight: 'bold' }}>(鋼の道のり)</span>}
                              </span>
                              {isBestAya ? (
                                <span className="badge gold">Aya (最適)</span>
                              ) : hasAya ? (
                                <span className="badge" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)' }}>Aya</span>
                              ) : null}
                            </summary>
                            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {(job.rewardPool || []).map((reward, ridx) => {
                                const isAyaReward = reward.includes('Aya') || reward.includes('アヤ');
                                return (
                                  <span key={ridx} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px', color: isAyaReward && isBestAya ? 'var(--color-gold)' : 'inherit' }}>
                                    {translateText(reward)}
                                  </span>
                                );
                              })}
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
