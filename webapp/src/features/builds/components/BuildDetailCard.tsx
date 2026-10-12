import React from 'react';
import { Shield, Sparkles } from 'lucide-react';
import type { BuildData } from '../types';

interface BuildDetailCardProps {
  buildData: BuildData;
  selectedItem: string | null;
}

export const BuildDetailCard: React.FC<BuildDetailCardProps> = ({ buildData, selectedItem }) => {
  const navigateToMod = (modName: string) => {
    window.dispatchEvent(
      new CustomEvent('navigateTab', {
        detail: { tab: 'dataexplorer', subTab: 'mods', query: modName, from: 'builds' },
      })
    );
  };

  return (
    <div className="glass-card neon-gold" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 className="card-title" style={{ color: 'var(--color-gold)' }}>
        <Shield size={20} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
        AI推奨ビルド構成 ({buildData.itemName || selectedItem})
      </h3>

      {/* Auras, Stances & Arcanes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {buildData.popularBuild.aura && (
          <div
            onClick={() => navigateToMod(buildData.popularBuild.aura!)}
            style={{
              background: 'rgba(255, 183, 3, 0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '8px',
              padding: '12px',
              flex: '1 1 200px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            title="クリックして入手先を検索"
          >
            <div className="cycle-sub" style={{ marginBottom: '4px' }}>オーラ (Aura)</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.aura}</div>
          </div>
        )}

        {buildData.popularBuild.stance && (
          <div
            onClick={() => navigateToMod(buildData.popularBuild.stance!)}
            style={{
              background: 'rgba(255, 183, 3, 0.1)',
              border: '1px solid var(--color-gold)',
              borderRadius: '8px',
              padding: '12px',
              flex: '1 1 200px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'none')}
            title="クリックして入手先を検索"
          >
            <div className="cycle-sub" style={{ marginBottom: '4px' }}>スタンス (Stance)</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.stance}</div>
          </div>
        )}

        {buildData.popularBuild.exilus && (
          <div
            onClick={() => navigateToMod(buildData.popularBuild.exilus)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-light)',
              borderRadius: '8px',
              padding: '12px',
              flex: '1 1 200px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-light)')}
            title="クリックして入手先を検索"
          >
            <div className="cycle-sub" style={{ marginBottom: '4px' }}>エクシラス (Exilus / Tennokai)</div>
            <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{buildData.popularBuild.exilus}</div>
          </div>
        )}

        {buildData.popularBuild.arcanes && buildData.popularBuild.arcanes.length > 0 && (
          <div style={{ background: 'rgba(157, 78, 221, 0.1)', border: '1px solid var(--color-purple)', borderRadius: '8px', padding: '12px', flex: '1 1 200px' }}>
            <div className="cycle-sub" style={{ marginBottom: '4px', color: 'var(--color-purple)' }}>アルケイン (Arcanes)</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {buildData.popularBuild.arcanes.map((arcane, i) => (
                <span key={i}>• {arcane}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mods Grid */}
      <div>
        <div className="cycle-sub" style={{ marginBottom: '8px' }}>メインMOD構成</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {buildData.popularBuild.mods.map((mod, i) => (
            <div
              key={i}
              onClick={() => navigateToMod(mod)}
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-light)',
                borderRadius: '6px',
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '48px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-gold)';
                e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 183, 3, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              title="クリックして入手先を検索"
            >
              {mod}
            </div>
          ))}
        </div>
      </div>

      {/* Playstyle */}
      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
        <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--text-color)' }}>
          <Sparkles size={16} style={{ color: 'var(--color-teal)' }} />
          立ち回り・解説
        </h4>
        <p style={{ fontSize: '14px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
          {buildData.popularBuild.playstyle}
        </p>
      </div>
    </div>
  );
};
