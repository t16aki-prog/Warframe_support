import React from 'react';
import { Swords } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface SteelPathCardProps {
  steelPath: any;
  getDaysLeft: (target: string) => string;
}

export const SteelPathCard: React.FC<SteelPathCardProps> = ({ steelPath, getDaysLeft }) => {
  if (!steelPath || !steelPath.currentReward) return null;

  return (
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
  );
};
