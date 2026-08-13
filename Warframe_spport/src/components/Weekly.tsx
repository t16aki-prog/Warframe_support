import React, { useState, useEffect } from 'react';
import { fetchWorldState, type WorldState } from '../utils/warframeApi';
import { translateText } from '../utils/translate';
import { Calendar, Target, Swords, Shield, Coins, Infinity as InfinityIcon } from 'lucide-react';

export const Weekly: React.FC = () => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWorldState();
        setWorldState(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch world state:', err);
        setError('ウィークリー情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const getDaysLeft = (targetDateString: string) => {
    const target = new Date(targetDateString).getTime();
    const diff = target - now;
    if (diff <= 0) return '更新間近';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `残り ${days}日 ${hours}時間`;
    return `残り ${hours}時間`;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', color: 'var(--text-color)' }}>
        <p>ウィークリー情報を読み込み中...</p>
      </div>
    );
  }

  if (error || !worldState) {
    return (
      <div style={{ padding: '24px', color: 'var(--color-danger)' }}>
        <p>{error || 'データがありません'}</p>
      </div>
    );
  }

  const { archonHunt, nightwave, steelPath, voidTrader, duviriCycle, sortie } = worldState;

  const normalCircuit = duviriCycle?.choices?.find(c => c.category === 'normal');
  const hardCircuit = duviriCycle?.choices?.find(c => c.category === 'hard');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={28} style={{ color: 'var(--color-gold)' }} />
        ウィークリー情報 (Weekly)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Sortie */}
        {sortie && (
          <div className="glass-card neon-gold">
            <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
              <Target size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
              ソーティー (Sortie)
              <span className="badge gold" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                {getDaysLeft(sortie.expiry)}
              </span>
            </h3>
            
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ターゲット</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{translateText(sortie.boss)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>勢力</div>
                <div style={{ fontSize: '18px' }}>{translateText(sortie.faction)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sortie.variants.map((variant, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '24px', fontWeight: 'bold', color: 'var(--color-gold)' }}>{idx + 1}.</div>
                    <div style={{ flex: 1, fontWeight: 'bold' }}>{variant.node} - {translateText(variant.missionType)}</div>
                  </div>
                  <div style={{ paddingLeft: '24px', marginTop: '4px', fontSize: '13px', color: 'var(--color-danger)' }}>
                    <strong>{translateText(variant.modifier)}:</strong> {translateText(variant.modifierDescription)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Archon Hunt */}
        {archonHunt && (
          <div className="glass-card neon-purple">
            <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
              <Target size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
              アルコン討伐戦 (Archon Hunt)
              <span className="badge purple" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                {getDaysLeft(archonHunt.expiry)}
              </span>
            </h3>
            
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>ターゲット</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{translateText(archonHunt.boss)}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>勢力</div>
                <div style={{ fontSize: '18px' }}>{translateText(archonHunt.faction)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {archonHunt.missions.map((mission, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-purple)' }}>
                  <div style={{ width: '24px', fontWeight: 'bold', color: 'var(--color-purple)' }}>{idx + 1}.</div>
                  <div style={{ flex: 1 }}>{mission.node}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{translateText(mission.type)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Steel Path Honors */}
        {steelPath && steelPath.currentReward && (
          <div className="glass-card neon-danger">
            <h3 className="card-title" style={{ color: 'var(--color-danger)' }}>
              <Swords size={20} className="card-title-icon" style={{ color: 'var(--color-danger)' }} />
              Teshinの洞窟 (Steel Path Honors)
              <span className="badge danger" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                {getDaysLeft(steelPath.expiry)}
              </span>
            </h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>今週の提供アイテム</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{translateText(steelPath.currentReward.name)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '4px' }}>必要スティール・エッセンス</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--color-danger)' }}>{steelPath.currentReward.cost}</div>
              </div>
            </div>
          </div>
        )}

        {/* Duviri Circuit */}
        {(normalCircuit || hardCircuit) && (
          <div className="glass-card neon-teal">
            <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
              <InfinityIcon size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
              デュヴィリ サーキット (The Circuit)
              <span className="badge teal" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                Weekly
              </span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {normalCircuit && (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--text-color)' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold' }}>通常モード (Warframes)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {normalCircuit.choices.map((choice, idx) => (
                      <span key={idx} className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{translateText(choice)}</span>
                    ))}
                  </div>
                </div>
              )}
              {hardCircuit && (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-danger)' }}>
                  <div style={{ fontSize: '14px', color: 'var(--color-danger)', marginBottom: '8px', fontWeight: 'bold' }}>鋼の道のり (Incarnon Genesis)</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {hardCircuit.choices.map((choice, idx) => (
                      <span key={idx} className="badge danger">{translateText(choice)}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Nightwave */}
        {nightwave && (
          <div className="glass-card">
            <h3 className="card-title">
              <Shield size={20} className="card-title-icon" style={{ color: 'var(--text-color)' }} />
              ナイトウェーブ (Nightwave)
              <span className="badge" style={{ marginLeft: 'auto', fontSize: '12px', background: 'rgba(255,255,255,0.1)' }}>
                Season {nightwave.season}
              </span>
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {nightwave.activeChallenges
                .filter(c => !c.isDaily)
                .sort((a, b) => (b.isElite ? 1 : 0) - (a.isElite ? 1 : 0))
                .map((challenge) => (
                <div key={challenge.id} style={{ 
                  padding: '16px', 
                  background: 'rgba(255,255,255,0.05)', 
                  borderRadius: '8px',
                  border: challenge.isElite ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{translateText(challenge.title)}</span>
                    <span style={{ color: challenge.isElite ? 'var(--color-gold)' : 'var(--text-color)', fontSize: '14px', fontWeight: 'bold' }}>
                      +{challenge.reputation}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {translateText(challenge.desc)}
                  </div>
                  {challenge.isElite && <div style={{ fontSize: '10px', color: 'var(--color-gold)', marginTop: '8px', textTransform: 'uppercase' }}>Elite Weekly</div>}
                  {!challenge.isElite && !challenge.isDaily && <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase' }}>Weekly</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Void Trader (Baro) if active */}
        {voidTrader && voidTrader.active && (
          <div className="glass-card neon-gold">
            <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
              <Coins size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
              Baro Ki'Teer (Void Trader)
              <span className="badge gold" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                {getDaysLeft(voidTrader.expiry)}
              </span>
            </h3>
            <p style={{ marginBottom: '16px' }}>
              場所: <strong>{translateText(voidTrader.location)}</strong>
            </p>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ textAlign: 'left', padding: '8px' }}>アイテム</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>デュカット</th>
                    <th style={{ textAlign: 'right', padding: '8px' }}>クレジット</th>
                  </tr>
                </thead>
                <tbody>
                  {voidTrader.inventory.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '8px' }}>{translateText(item.item)}</td>
                      <td style={{ textAlign: 'right', padding: '8px', color: 'var(--color-gold)' }}>{item.ducats}</td>
                      <td style={{ textAlign: 'right', padding: '8px', color: 'var(--color-teal)' }}>{item.credits.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
