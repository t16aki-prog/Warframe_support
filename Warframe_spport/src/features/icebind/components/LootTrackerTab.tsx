import React from 'react';
import { Cpu, Target } from 'lucide-react';
import type { LootTrackerState } from '../types';
import { NARIN_BLUEPRINTS } from '../constants';

interface LootTrackerTabProps {
  tracker: LootTrackerState;
  trackerProgress: number;
  toggleBlueprint: (key: 'narinBp' | 'narinNeuro' | 'narinChassis' | 'narinSystems', val: boolean) => void;
  updateKuva: (updater: (prev: number) => number) => void;
  updateEssence: (updater: (prev: number) => number) => void;
  updateSplicer: (updater: (prev: number) => number) => void;
}

export const LootTrackerTab: React.FC<LootTrackerTabProps> = ({
  tracker,
  trackerProgress,
  toggleBlueprint,
  updateKuva,
  updateEssence,
  updateSplicer,
}) => {
  return (
    <div>
      {/* Progress Overview Card */}
      <div className="glass-card neon-frost" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
          <div>
            <span className="badge frost" style={{ marginBottom: '4px', display: 'inline-block' }}>製造進捗率</span>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)' }}>
              Warframe「Narin」製作 ＆ 氷河の縛り報酬進捗
            </h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
              {trackerProgress}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>必要素材収集完了度</div>
          </div>
        </div>

        <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${trackerProgress}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #00f0ff)', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Blueprints Checklist */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={18} /> 設計図 ＆ パーツ入手チェック
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {NARIN_BLUEPRINTS.map((item) => {
              const checked = !!tracker[item.key as keyof LootTrackerState];
              return (
                <label
                  key={item.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: checked ? 'rgba(0, 210, 255, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: checked ? '1px solid rgba(0, 210, 255, 0.4)' : '1px solid var(--border-light)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleBlueprint(item.key as any, e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#38bdf8' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Exclusive Materials Counter */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Target size={18} /> 特殊製造素材 ＆ 固有ドロップ
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Entropic Kuva */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>エントロピック・クヴァ (Entropic Kuva)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>エントロピック・エクシマスからドロップ (必要: 15個)</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: tracker.kuvaCount >= 15 ? 'var(--color-success)' : 'var(--color-gold)' }}>
                  {tracker.kuvaCount} / 15
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={() => updateKuva((prev) => Math.max(0, prev - 1))}
                  style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  -
                </button>
                <button
                  onClick={() => updateKuva((prev) => prev + 1)}
                  style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  +
                </button>
                <button
                  onClick={() => updateKuva(() => 15)}
                  style={{ padding: '4px 12px', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.3)', borderRadius: '4px', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  最大 (15)
                </button>
              </div>
            </div>

            {/* Cryobell Essence */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>クライオベル・エッセンス (Cryobell Essence)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>氷河の縛り ミッションクリア報酬 (必要: 30個)</div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', color: tracker.essenceCount >= 30 ? 'var(--color-success)' : 'var(--color-gold)' }}>
                  {tracker.essenceCount} / 30
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={() => updateEssence((prev) => Math.max(0, prev - 5))}
                  style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  -5
                </button>
                <button
                  onClick={() => updateEssence((prev) => prev + 5)}
                  style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  +5
                </button>
                <button
                  onClick={() => updateEssence(() => 30)}
                  style={{ padding: '4px 12px', background: 'rgba(0, 210, 255, 0.1)', border: '1px solid rgba(0, 210, 255, 0.3)', borderRadius: '4px', color: '#38bdf8', fontSize: '11px', cursor: 'pointer', marginLeft: 'auto' }}
                >
                  最大 (30)
                </button>
              </div>
            </div>

            {/* Riven Splicer Counter */}
            <div style={{ background: 'rgba(157, 78, 221, 0.05)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(157, 78, 221, 0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-purple)' }}>リベン スプライサー (Riven Splicer)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Riven MOD合成用確定報酬</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateSplicer((prev) => Math.max(0, prev - 1))}
                    style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>
                    {tracker.splicerObtained}
                  </span>
                  <button
                    onClick={() => updateSplicer((prev) => prev + 1)}
                    style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '4px', color: 'var(--text-main)', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
