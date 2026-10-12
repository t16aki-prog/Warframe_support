import React from 'react';
import { Infinity as InfinityIcon } from 'lucide-react';
import { translateText } from '../../../utils/translate';

interface CircuitCardProps {
  normalCircuit?: any;
  hardCircuit?: any;
}

export const CircuitCard: React.FC<CircuitCardProps> = ({ normalCircuit, hardCircuit }) => {
  if (!normalCircuit && !hardCircuit) return null;

  return (
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
              {(normalCircuit.choices || []).map((choice: string, idx: number) => (
                <span key={idx} className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {translateText(choice)}
                </span>
              ))}
            </div>
          </div>
        )}
        {hardCircuit && (
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: '4px solid var(--color-danger)' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-danger)', marginBottom: '8px', fontWeight: 'bold' }}>鋼の道のり (Incarnon Genesis)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(hardCircuit.choices || []).map((choice: string, idx: number) => (
                <span key={idx} className="badge danger">
                  {translateText(choice)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
