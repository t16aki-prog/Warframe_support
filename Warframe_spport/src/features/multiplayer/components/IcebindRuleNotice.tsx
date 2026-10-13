// Warframe_spport/src/features/multiplayer/components/IcebindRuleNotice.tsx
import React from 'react';
import { Snowflake } from 'lucide-react';
import { ICEBIND_OFFICIAL_RULE } from '../constants';

export const IcebindRuleNotice: React.FC = () => {
  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '12px',
        padding: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Snowflake size={16} />
          {ICEBIND_OFFICIAL_RULE.name}
        </span>
        <span className="badge frost" style={{ fontSize: '10px', padding: '2px 8px', fontWeight: 700 }}>
          {ICEBIND_OFFICIAL_RULE.badge} (固定)
        </span>
      </div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
        {ICEBIND_OFFICIAL_RULE.description}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#bae6fd',
          lineHeight: '1.6',
          background: 'rgba(0,0,0,0.35)',
          padding: '10px 12px',
          borderRadius: '8px',
          whiteSpace: 'pre-line',
          border: '1px solid rgba(56, 189, 248, 0.2)'
        }}
      >
        {ICEBIND_OFFICIAL_RULE.rules}
      </div>
    </div>
  );
};
