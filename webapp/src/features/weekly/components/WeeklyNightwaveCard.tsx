import React from 'react';
import { Shield } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface WeeklyNightwaveCardProps {
  nightwave: any;
}

export const WeeklyNightwaveCard: React.FC<WeeklyNightwaveCardProps> = ({ nightwave }) => {
  if (!nightwave) return null;

  return (
    <div className="glass-card">
      <h3 className="card-title">
        <Shield size={20} className="card-title-icon" style={{ color: 'var(--text-color)' }} />
        ナイトウェーブ (Nightwave)
        <span className="badge" style={{ marginLeft: 'auto', fontSize: '12px', background: 'rgba(255,255,255,0.1)' }}>
          Season {nightwave.season}
        </span>
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {(nightwave.activeChallenges || [])
          .filter((c: any) => !c.isDaily)
          .sort((a: any, b: any) => (b.isElite ? 1 : 0) - (a.isElite ? 1 : 0))
          .map((challenge: any) => (
            <div
              key={challenge.id}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                border: challenge.isElite ? '1px solid var(--color-gold)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{translateText(challenge.title)}</span>
                <span style={{ color: challenge.isElite ? 'var(--color-gold)' : 'var(--text-color)', fontSize: '14px', fontWeight: 'bold' }}>
                  +{challenge.reputation}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{translateText(challenge.desc)}</div>
              {challenge.isElite && (
                <div style={{ fontSize: '10px', color: 'var(--color-gold)', marginTop: '8px', textTransform: 'uppercase' }}>
                  Elite Weekly
                </div>
              )}
              {!challenge.isElite && !challenge.isDaily && (
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', textTransform: 'uppercase' }}>
                  Weekly
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};
