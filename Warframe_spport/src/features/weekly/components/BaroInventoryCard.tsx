import React from 'react';
import { Coins } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface BaroInventoryCardProps {
  voidTrader: any;
  getDaysLeft: (target: string) => string;
}

export const BaroInventoryCard: React.FC<BaroInventoryCardProps> = ({ voidTrader, getDaysLeft }) => {
  if (!voidTrader || !voidTrader.active) return null;

  return (
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
            {(voidTrader.inventory || []).map((item: any, idx: number) => (
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
  );
};
