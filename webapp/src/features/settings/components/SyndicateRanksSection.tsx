import React from 'react';
import { Crosshair } from 'lucide-react';
import { SYNDICATE_LIST } from '../constants';

interface SyndicateRanksSectionProps {
  ranks: Record<string, number>;
  onRankChange: (id: string, rank: number) => void;
}

export const SyndicateRanksSection: React.FC<SyndicateRanksSectionProps> = ({
  ranks,
  onRankChange,
}) => {
  return (
    <div className="glass-card neon-purple" style={{ marginBottom: '24px' }}>
      <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
        <Crosshair size={20} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
        中立シンジケート 地位ランク設定
      </h3>
      <p className="cycle-sub" style={{ marginBottom: '20px' }}>
        現在の自分の地位ランク (0〜5) を設定すると、中立シンジケート画面で受注条件を満たさない依頼が非表示になります。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        {SYNDICATE_LIST.map((syn) => (
          <div key={syn.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label className="form-label" style={{ fontSize: '13px' }}>{syn.label}</label>
            <select
              className="input-text"
              value={ranks[syn.id] ?? 5}
              onChange={(e) => onRankChange(syn.id, Number(e.target.value))}
            >
              {[0, 1, 2, 3, 4, 5].map((rank) => (
                <option key={rank} value={rank}>
                  ランク {rank}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};
