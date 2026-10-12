import React from 'react';
import { AlertTriangle, CheckCircle2, Copy, Check, Sparkles, Shield } from 'lucide-react';
import type { SquadMember, SynergyInfo } from '../types';
import { SquadMemberCard } from './SquadMemberCard';

interface SquadTabProps {
  squad: SquadMember[];
  duplicates: Set<string>;
  hasDuplicate: boolean;
  synergy: SynergyInfo;
  applyPreset: (type: 'balanced' | 'cryo' | 'burst') => void;
  handleMemberChange: (id: number, field: keyof SquadMember, value: any) => void;
  copyRecruitmentText: () => void;
  copied: boolean;
}

export const SquadTab: React.FC<SquadTabProps> = ({
  squad,
  duplicates,
  hasDuplicate,
  synergy,
  applyPreset,
  handleMemberChange,
  copyRecruitmentText,
  copied,
}) => {
  return (
    <div>
      {/* Status Alert Banner for Duplicates */}
      <div
        style={{
          padding: '14px 20px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: hasDuplicate ? 'rgba(255, 77, 77, 0.15)' : 'rgba(46, 196, 182, 0.12)',
          border: hasDuplicate ? '1px solid rgba(255, 77, 77, 0.4)' : '1px solid rgba(46, 196, 182, 0.35)',
          boxShadow: hasDuplicate ? '0 0 15px rgba(255, 77, 77, 0.1)' : '0 0 15px rgba(46, 196, 182, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasDuplicate ? (
            <AlertTriangle size={24} style={{ color: 'var(--color-danger)' }} />
          ) : (
            <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: hasDuplicate ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {hasDuplicate ? '【出撃不可】Warframeの重複が検出されました！' : '【出撃可能】重複なし！6人全員が異なるWarframeです'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {hasDuplicate
                ? `重複しているフレーム: [${Array.from(duplicates).map((d) => d.toUpperCase()).join(', ')}] は出撃できません。通常版とPrime版も同一判定です。`
                : '氷河の縛りの「分隊内Warframe重複禁止」ルールに完全適合しています。'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={copyRecruitmentText}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              padding: '8px 14px',
              background: copied ? 'var(--color-success)' : undefined,
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? '募集文をコピーしました！' : '募集テキストをコピー'}
          </button>
        </div>
      </div>

      {/* Quick Preset Selector & Synergy Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Presets Card */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} style={{ color: 'var(--color-gold)' }} /> おすすめ推奨メタ編成 (ワンクリック適用)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => applyPreset('balanced')}
              style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#38bdf8' }}>① 安定クリア標準構成 (Balanced Meta)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Narin + Dante + Styanax + Wisp + Revenant + Frost</div>
            </button>
            <button
              onClick={() => applyPreset('cryo')}
              style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-teal)' }}>② 超極低温・絶対凍結構成 (Permafrost Synergy)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Narin + Frost + Nova + Citrine + Harrow + Saryn</div>
            </button>
            <button
              onClick={() => applyPreset('burst')}
              style={{ textAlign: 'left', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 14px', cursor: 'pointer', transition: 'var(--transition-smooth)' }}
            >
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-purple)' }}>③ 瞬時装甲剥ぎ＆超火力構成 (Instant Strip & Burst)</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Narin + Kullervo + Dagath + Wisp + Mirage + Dante</div>
            </button>
          </div>
        </div>

        {/* Synergy Diagnostics Card */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={15} style={{ color: 'var(--color-teal)' }} /> 分隊シナジー・バランス診断
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: synergy.score >= 80 ? 'var(--color-success)' : 'var(--color-gold)' }}>
              総合スコア: {synergy.score} / 100
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '14px' }}>
            <div
              style={{
                width: `${synergy.score}%`,
                height: '100%',
                background: synergy.score >= 80 ? 'linear-gradient(90deg, #38bdf8, #2ec4b6)' : 'linear-gradient(90deg, #ffb703, #ff4d4d)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: synergy.hasArmorStrip ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {synergy.hasArmorStrip ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>装甲剥ぎ (Armor Strip): {synergy.hasArmorStrip ? '充足' : '不足 (致命的)'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: synergy.hasSurvival ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {synergy.hasSurvival ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>生存・オーバーガード: {synergy.hasSurvival ? '充足' : '事故死リスク高'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: synergy.hasCC ? 'var(--color-success)' : 'var(--color-gold)' }}>
              {synergy.hasCC ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>クラウドコントロール (CC): {synergy.hasCC ? '安定' : 'やや不安'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: synergy.hasEnergy ? 'var(--color-success)' : 'var(--color-gold)' }}>
              {synergy.hasEnergy ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
              <span>エネルギー供給: {synergy.hasEnergy ? '円滑' : '燃費注意'}</span>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.25)', padding: '8px 10px', borderRadius: '6px' }}>
            💡 <strong>攻略アドバイス:</strong> 敵Lv999+では自力復活ができません。Vazarin（即時蘇生）の装備者が現在 <strong>{synergy.vazarinCount}名</strong> です。事故防止のため最低1〜2名はVazarinを推奨します。
          </div>
        </div>
      </div>

      {/* 6 Squad Slots Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '16px' }}>
        {squad.map((member) => (
          <SquadMemberCard
            key={member.id}
            member={member}
            isDup={duplicates.has(member.frame.trim().toLowerCase())}
            onChange={handleMemberChange}
          />
        ))}
      </div>
    </div>
  );
};
