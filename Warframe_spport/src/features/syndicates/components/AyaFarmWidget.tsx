import React from 'react';
import { Target } from 'lucide-react';
import type { WorldState } from '../../../utils/warframeApi';

interface AyaFarmWidgetProps {
  worldState: WorldState;
}

export const AyaFarmWidget: React.FC<AyaFarmWidgetProps> = ({ worldState }) => {
  const SYNDICATE_NAMES_JA: Record<string, string> = {
    Ostrons: 'オストロン',
    'Solaris United': 'ソラリス連合',
    Entrati: 'エントラティ',
    'The Holdfasts': 'ホールドファスト',
    'The Hex': 'The Hex',
    Cavia: 'カビア',
  };

  const allAyaJobs: { syndicate: string; job: any }[] = [];

  (worldState.syndicateMissions || []).forEach((syn) => {
    if (!SYNDICATE_NAMES_JA[syn.syndicateKey]) return;
    const ayaJobs = syn.jobs.filter(
      (job) =>
        (job.rewardPool || []).some((r) => r.includes('Aya') || r.includes('アヤ')) &&
        job.enemyLevels[0] < 100
    );
    ayaJobs.forEach((job) => {
      allAyaJobs.push({
        syndicate: SYNDICATE_NAMES_JA[syn.syndicateKey],
        job,
      });
    });
  });

  allAyaJobs.sort((a, b) => b.job.enemyLevels[0] - a.job.enemyLevels[0]);
  const top3 = allAyaJobs.slice(0, 3);

  return (
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

        {top3.length === 0 ? (
          <div style={{ color: 'var(--text-muted)' }}>現在アヤが報酬に含まれる依頼はありません。</div>
        ) : (
          top3.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: 'var(--color-gold)', color: 'black', fontWeight: 'bold', minWidth: '20px', textAlign: 'center' }}>
                {idx + 1}
              </span>
              <span className="badge teal">{item.syndicate}</span>
              <span style={{ fontWeight: '500', color: 'var(--text-color)' }}>
                Lv {item.job.enemyLevels[0]}-{item.job.enemyLevels[1]} 依頼
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-gold)' }}>(高確率・高効率)</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
