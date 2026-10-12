import React from 'react';
import { Zap } from 'lucide-react';
import type { Augment } from '../types';

interface AugmentsCardProps {
  augments: Augment[];
}

export const AugmentsCard: React.FC<AugmentsCardProps> = ({ augments }) => {
  if (!augments || augments.length === 0) return null;

  return (
    <div className="glass-card neon-teal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 className="card-title" style={{ color: 'var(--color-teal)' }}>
        <Zap size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
        専用増強MOD (Augments)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {augments.map((aug, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(0,0,0,0.2)',
              padding: '12px',
              borderRadius: '8px',
              borderLeft: '3px solid var(--color-teal)',
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', color: 'var(--color-teal)' }}>
              {aug.name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-color)', marginBottom: '8px', lineHeight: '1.4' }}>
              {aug.effect}
            </div>
            {aug.syndicate && (
              <div className="badge teal" style={{ display: 'inline-block' }}>
                入手: {aug.syndicate}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
