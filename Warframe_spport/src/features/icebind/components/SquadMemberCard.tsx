import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { SquadMember, RoleType } from '../types';
import { ALL_WARFRAMES } from '../constants';

interface SquadMemberCardProps {
  member: SquadMember;
  isDup: boolean;
  onChange: (id: number, field: keyof SquadMember, value: any) => void;
}

export const SquadMemberCard: React.FC<SquadMemberCardProps> = ({
  member,
  isDup,
  onChange,
}) => {
  return (
    <div
      className={`glass-card ${isDup ? 'duplicate-error' : ''}`}
      style={{
        padding: '18px',
        borderColor: isDup ? 'var(--color-danger)' : undefined,
        boxShadow: isDup ? '0 0 15px rgba(255, 77, 77, 0.25)' : undefined,
        background: isDup ? 'rgba(35, 10, 15, 0.7)' : undefined,
        transition: 'var(--transition-smooth)',
      }}
    >
      {/* Slot Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: isDup ? 'var(--color-danger)' : '#38bdf8',
            }}
          >
            SLOT #{member.id}
          </span>
          <input
            type="text"
            value={member.name}
            onChange={(e) => onChange(member.id, 'name', e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontWeight: 700,
              fontSize: '14px',
              outline: 'none',
              width: '140px',
            }}
          />
        </div>

        {isDup && (
          <span style={{ color: 'var(--color-danger)', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} /> 重複警告
          </span>
        )}
      </div>

      {/* Warframe Selection */}
      <div style={{ marginBottom: '10px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>出撃 Warframe</label>
        <select
          className="input-text"
          value={member.frame}
          onChange={(e) => onChange(member.id, 'frame', e.target.value)}
          style={{
            width: '100%',
            fontSize: '14px',
            fontWeight: 600,
            borderColor: isDup ? 'var(--color-danger)' : undefined,
            color: member.frame === 'Narin' ? '#38bdf8' : 'var(--text-main)',
          }}
        >
          {ALL_WARFRAMES.map((f) => (
            <option key={f} value={f}>
              {f} {f === 'Narin' ? '★ (Update 44 主役)' : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Role and Focus School in 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>担当ロール</label>
          <select
            className="input-text"
            value={member.role}
            onChange={(e) => onChange(member.id, 'role', e.target.value as RoleType)}
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="DPS">DPS (高火力・殲滅)</option>
            <option value="Armor Strip">Armor Strip (装甲完全剥ぎ)</option>
            <option value="Survival">Survival (防御・即蘇生)</option>
            <option value="CC">CC (凍結・広域遅延)</option>
            <option value="Energy">Energy (オーブ・バフ)</option>
            <option value="Flex">Flex (自由枠)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>フォーカススクール</label>
          <select
            className="input-text"
            value={member.focus}
            onChange={(e) => onChange(member.id, 'focus', e.target.value)}
            style={{ width: '100%', fontSize: '12px' }}
          >
            <option value="Vazarin">Vazarin (救護・即時蘇生)</option>
            <option value="Naramon">Naramon (近接コンボ維持)</option>
            <option value="Zenurik">Zenurik (エネルギー回復)</option>
            <option value="Madurai">Madurai (威力・武器バフ)</option>
            <option value="Unairu">Unairu (オペ装甲剥ぎ・無敵)</option>
          </select>
        </div>
      </div>

      {/* Strategy Notes */}
      <div>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>立ち回りメモ / Helminth移植</label>
        <input
          type="text"
          className="input-text"
          value={member.notes}
          onChange={(e) => onChange(member.id, 'notes', e.target.value)}
          placeholder="例: Roar移植、Snow Globe防衛、即時蘇生担当など"
          style={{ width: '100%', fontSize: '12px' }}
        />
      </div>
    </div>
  );
};
