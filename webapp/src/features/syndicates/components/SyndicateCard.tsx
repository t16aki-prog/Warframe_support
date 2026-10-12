import React from 'react';
import { translateText } from '../../../utils/translate';

interface SyndicateCardProps {
  syndicate: any;
  currentRank: number;
  showSteelPath: boolean;
  getLiveTimeLeft: (target: string) => string;
}

export const SyndicateCard: React.FC<SyndicateCardProps> = ({
  syndicate,
  currentRank,
  showSteelPath,
  getLiveTimeLeft,
}) => {
  const SYNDICATE_NAMES_JA: Record<string, string> = {
    Ostrons: 'オストロン (シータス)',
    'Solaris United': 'ソラリス連合 (フォーチュナー)',
    Entrati: 'エントラティ (ダイモス)',
    'The Holdfasts': 'ホールドファスト (Zariman)',
    'The Hex': 'The Hex (1999)',
    Cavia: 'カビア (サンクタム)',
    'Ostrons (Steel Path)': 'オストロン (鋼の道のり)',
    'Solaris United (Steel Path)': 'ソラリス連合 (鋼の道のり)',
  };

  const synNameJa = SYNDICATE_NAMES_JA[syndicate.syndicateKey] || syndicate.syndicateKey;

  const getRequiredRank = (levels: number[]) => {
    const maxLvl = levels[1] || levels[0];
    if (maxLvl <= 15) return 1;
    if (maxLvl <= 30) return 2;
    if (maxLvl <= 40) return 3;
    if (maxLvl <= 50) return 4;
    return 5;
  };

  const availableJobs = (syndicate.jobs || []).filter((job: any) => {
    const isSteelPath = job.enemyLevels[0] >= 100;
    if (!showSteelPath && isSteelPath) return false;
    if (!isSteelPath && getRequiredRank(job.enemyLevels) > currentRank) return false;
    return true;
  });

  if (availableJobs.length === 0) return null;

  const ayaJobs = availableJobs.filter(
    (job: any) =>
      (job.rewardPool || []).some((r: string) => r.includes('Aya') || r.includes('アヤ')) &&
      job.enemyLevels[0] < 100
  );
  const bestAyaJob =
    ayaJobs.length > 0
      ? ayaJobs.reduce((prev: any, current: any) =>
          prev.enemyLevels[0] > current.enemyLevels[0] ? prev : current
        )
      : null;

  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', background: 'rgba(255,255,255,0.015)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <strong style={{ color: 'var(--color-teal)' }}>{synNameJa}</strong>
        <span className="cycle-sub" style={{ fontVariantNumeric: 'tabular-nums' }}>
          更新まで: {getLiveTimeLeft(syndicate.expiry)}
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {availableJobs.map((job: any, idx: number) => {
          const hasAya = (job.rewardPool || []).some((r: string) => r.includes('Aya') || r.includes('アヤ'));
          const isBestAya = hasAya && bestAyaJob && job.id === bestAyaJob.id;
          const isSteelPath = job.enemyLevels[0] >= 100;
          if (!showSteelPath && isSteelPath) return null;

          return (
            <details
              key={`${syndicate.id}-job-${idx}`}
              style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
            >
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
                {(job.rewardPool || []).map((reward: string, ridx: number) => {
                  const isAyaReward = reward.includes('Aya') || reward.includes('アヤ');
                  return (
                    <span
                      key={ridx}
                      style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: isAyaReward && isBestAya ? 'var(--color-gold)' : 'inherit',
                      }}
                    >
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
};
