import React from 'react';
import { AlertTriangle, Flame } from 'lucide-react';
import { CRYOBELL_MODIFIERS } from '../constants';

export const StrategyTab: React.FC = () => {
  return (
    <div>
      {/* Rules and Pitfalls */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: 'var(--color-danger)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} /> 氷河の縛り・5大ルールと即死回避の鉄則
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--color-danger)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>1. 敵Lv 999+ (装甲値数十万)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              通常武器ではダメージが1桁〜0になります。Styanax、Frost、Narin等のアビリティで<strong>100%装甲を全剥離</strong>することが攻撃の大前提です。
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--color-gold)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>2. 自力蘇生不可（手動蘇生のみ）</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              リスポーンボタンが無効化されます。ダウン時は味方が近づいて蘇生する必要があります。Vazarinの即時蘇生やRevenantの無敵壁が必須。
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>3. Warframe重複禁止 (6名全員別枠)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              「全員Revenantでゴリ押し」といった戦法は封じられています。各員が異なるロール（CC、装甲剥ぎ、バフ、タンク）を分担しなければなりません。
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid var(--color-purple)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>4. サイド目標失敗＝即ミッション失敗</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              道中に提示される追加ミッション（コンテナ死守、端末同時オーバーライドなど）を1つでも落とすと、その瞬間に分隊全員敗北となります。
            </div>
          </div>
        </div>
      </div>

      {/* Cryobell Modifiers Breakdown Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Flame size={20} style={{ color: '#38bdf8' }} /> 週替わりクライオベル・モディファイア対策表
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>モディファイア名</th>
                <th style={{ textAlign: 'center', padding: '10px 14px' }}>危険度</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>効果・ペナルティ</th>
                <th style={{ textAlign: 'left', padding: '10px 14px' }}>推奨対策フレーム ＆ MOD</th>
              </tr>
            </thead>
            <tbody>
              {CRYOBELL_MODIFIERS.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 700, color: '#38bdf8' }}>{m.name}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: m.danger.length >= 3 ? 'var(--color-danger)' : 'var(--color-gold)' }}>
                    {m.danger}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>{m.desc}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--color-success)', fontWeight: 500 }}>{m.counter}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
