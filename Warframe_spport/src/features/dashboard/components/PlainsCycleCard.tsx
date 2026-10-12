import React from 'react';
import { Compass, Sun, Moon, Flame, Sparkles } from 'lucide-react';
import type { WorldState } from '../../../utils/warframeApi';

interface PlainsCycleCardProps {
  worldState: WorldState;
  getLiveTimeLeft: (target: string) => string;
}

export const PlainsCycleCard: React.FC<PlainsCycleCardProps> = ({ worldState, getLiveTimeLeft }) => {
  return (
    <div className="glass-card neon-teal">
      <h3 className="card-title">
        <Compass size={18} className="card-title-icon" />
        平原・オープンワールド状況
      </h3>

      {/* Cetus Cycle */}
      <div className="cycle-item">
        <div className="cycle-name">
          シータス (地球)
          <span className="cycle-sub">エイドロンハント (夜) の追跡</span>
        </div>
        <div className="cycle-val">
          {worldState.cetusCycle.isDay ? (
            <>
              <Sun size={18} style={{ color: 'var(--color-gold)' }} />
              <span className="badge gold">昼 (Day)</span>
            </>
          ) : (
            <>
              <Moon size={18} style={{ color: 'var(--color-teal)' }} />
              <span className="badge teal">夜 (Night)</span>
            </>
          )}
          <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {getLiveTimeLeft(worldState.cetusCycle.expiry)}
          </span>
        </div>
      </div>

      {/* Vallis Cycle */}
      <div className="cycle-item">
        <div className="cycle-name">
          オーブ渓谷 (金星)
          <span className="cycle-sub">サーミア湧出・釣り</span>
        </div>
        <div className="cycle-val">
          {worldState.vallisCycle.isWarm ? (
            <>
              <Sun size={18} style={{ color: 'var(--color-danger)' }} />
              <span className="badge danger">温暖 (Warm)</span>
            </>
          ) : (
            <>
              <Moon size={18} style={{ color: 'var(--color-teal)' }} />
              <span className="badge teal">極寒 (Cold)</span>
            </>
          )}
          <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {getLiveTimeLeft(worldState.vallisCycle.expiry)}
          </span>
        </div>
      </div>

      {/* Cambion Cycle */}
      <div className="cycle-item">
        <div className="cycle-name">
          カンビオン平原 (火星)
          <span className="cycle-sub">感染体の支配サイクル</span>
        </div>
        <div className="cycle-val">
          {worldState.cambionCycle.active === 'fass' ? (
            <>
              <Flame size={18} style={{ color: 'var(--color-gold)' }} />
              <span className="badge gold">Fass</span>
            </>
          ) : (
            <>
              <Sparkles size={18} style={{ color: 'var(--color-purple)' }} />
              <span className="badge purple">Vome</span>
            </>
          )}
          <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {getLiveTimeLeft(worldState.cambionCycle.expiry)}
          </span>
        </div>
      </div>

      {/* Duviri Cycle */}
      <div className="cycle-item">
        <div className="cycle-name">
          デュヴィリ (Duviri)
          <span className="cycle-sub">スパイラル感情サイクル</span>
        </div>
        <div className="cycle-val">
          <span className="badge purple" style={{ fontSize: '12px' }}>
            {worldState.duviriCycle.state.toUpperCase()}
          </span>
          <span style={{ minWidth: '100px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
            {getLiveTimeLeft(worldState.duviriCycle.expiry)}
          </span>
        </div>
      </div>
    </div>
  );
};
