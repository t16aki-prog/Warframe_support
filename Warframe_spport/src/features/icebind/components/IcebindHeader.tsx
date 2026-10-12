import React from 'react';
import { Snowflake, Clock, CheckCircle2, Users, Sparkles, ShieldCheck, Target } from 'lucide-react';
import type { IcebindTab } from '../types';

interface IcebindHeaderProps {
  activeTab: IcebindTab;
  onTabChange: (tab: IcebindTab) => void;
  countdown: string;
  weeklyClear: boolean;
  onToggleWeeklyClear: () => void;
}

export const IcebindHeader: React.FC<IcebindHeaderProps> = ({
  activeTab,
  onTabChange,
  countdown,
  weeklyClear,
  onToggleWeeklyClear,
}) => {
  const tabs = [
    { id: 'squad' as const, label: '6人分隊編成シミュレーター', icon: <Users size={16} /> },
    { id: 'narin' as const, label: '新フレーム「Narin」徹底解説', icon: <Sparkles size={16} /> },
    { id: 'strategy' as const, label: 'Lv999ギミック ＆ モディファイア対策', icon: <ShieldCheck size={16} /> },
    { id: 'tracker' as const, label: '報酬・ナリン素材トラッカー', icon: <Target size={16} /> },
  ];

  return (
    <div
      className="glass-card neon-frost"
      style={{
        marginBottom: '24px',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(6, 18, 38, 0.85) 0%, rgba(10, 30, 60, 0.7) 100%)',
        border: '1px solid rgba(0, 210, 255, 0.35)',
        boxShadow: '0 0 25px rgba(0, 210, 255, 0.15)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              background: 'rgba(0, 210, 255, 0.15)',
              border: '1px solid rgba(0, 210, 255, 0.4)',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 700,
              marginBottom: '8px',
            }}
          >
            <Snowflake size={14} /> Update 44 新高難易度エンドコンテンツ
          </div>
          <h1
            style={{
              fontSize: '30px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #38bdf8 50%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '6px',
            }}
          >
            氷河の縛り (The Icebind) ＆ ナリン (Narin) 攻略室
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '750px', lineHeight: '1.6' }}>
            地球「ユヴァン峰 (Yuvann Peak)」にてクライオベルを鳴らし挑む超高難易度6人分隊限定ミッション。
            <strong>「Warframe重複完全禁止」</strong>・<strong>「敵Lv 999+」</strong>・<strong>「自力蘇生不可」</strong>の厳しい制約を突破するための専任ナビゲーターです。
          </p>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.4)', padding: '12px 18px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', minWidth: '240px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <Clock size={13} style={{ color: '#38bdf8' }} /> クライオベル週替わり更新まで
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 700, color: '#38bdf8' }}>
            {countdown}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onToggleWeeklyClear}
              style={{
                background: weeklyClear ? 'rgba(46, 196, 182, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: weeklyClear ? '1px solid var(--color-success)' : '1px solid var(--border-light)',
                color: weeklyClear ? 'var(--color-success)' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {weeklyClear ? <CheckCircle2 size={13} /> : <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1px solid currentColor' }} />}
              今週のクリア: {weeklyClear ? '達成済み' : '未完了'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', overflowX: 'auto' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === tab.id ? '1px solid #38bdf8' : '1px solid transparent',
              background: activeTab === tab.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.03)',
              color: activeTab === tab.id ? '#38bdf8' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'var(--transition-smooth)',
              whiteSpace: 'nowrap',
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
