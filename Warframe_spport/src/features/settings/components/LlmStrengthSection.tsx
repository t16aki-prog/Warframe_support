import React from 'react';
import { Cpu, Zap, Activity, Flame, ShieldAlert } from 'lucide-react';

export interface LlmProfileItem {
  level: number;
  name: string;
  desc: string;
  numCtx: number;
  topK: number;
  model: string;
}

export const LLM_LEVEL_PRESETS: LlmProfileItem[] = [
  {
    level: 1,
    name: 'レベル 1 (軽量・標準)',
    desc: '現在の初期設定値。高速レスポンス・VRAM低負荷で軽快に動作します。',
    numCtx: 4096,
    topK: 5,
    model: 'qwen2.5:7b'
  },
  {
    level: 2,
    name: 'レベル 2 (中量・安定)',
    desc: '文脈記憶枠を2倍(8K)に拡張。より多くのパッチノートや装備特性を考慮します。',
    numCtx: 8192,
    topK: 8,
    model: 'qwen2.5:7b'
  },
  {
    level: 3,
    name: 'レベル 3 (高度・精緻)',
    desc: '文脈16K・参照資料12件に拡張。複雑なビルド相性やシナジーを詳細に分析します。',
    numCtx: 16384,
    topK: 12,
    model: 'qwen2.5:7b'
  },
  {
    level: 4,
    name: 'レベル 4 (最高・極大)',
    desc: '最大文脈32K・参照15件。大型モデル(14B)または最大探索深度で最高精度の回答を生成します。',
    numCtx: 32768,
    topK: 15,
    model: 'qwen2.5:14b / 7b(最大探索)'
  }
];

interface Props {
  currentLevel: number;
  onLevelChange: (level: number) => void;
}

export const LlmStrengthSection: React.FC<Props> = ({ currentLevel, onLevelChange }) => {
  const getIcon = (level: number) => {
    switch (level) {
      case 1:
        return <Zap size={18} style={{ color: 'var(--color-teal)' }} />;
      case 2:
        return <Activity size={18} style={{ color: '#38bdf8' }} />;
      case 3:
        return <Flame size={18} style={{ color: 'var(--color-gold)' }} />;
      case 4:
        return <Cpu size={18} style={{ color: 'var(--color-purple)' }} />;
      default:
        return <Zap size={18} />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Cpu size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
        <span>ローカルLLM 推論強度（4段階設定）</span>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
        現在の値（レベル1）を基準とし、文脈探索の深さ・参照データ量・コンテキスト窓の広さを4段階で調整できます。
        レベルを上げるほど詳細で賢い分析が可能になりますが、生成時間が長くなりPCメモリ(VRAM)の消費が増加します。
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {LLM_LEVEL_PRESETS.map((preset) => {
          const isSelected = currentLevel === preset.level;
          return (
            <div
              key={preset.level}
              onClick={() => onLevelChange(preset.level)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: isSelected ? '1px solid var(--color-teal)' : '1px solid var(--border-light)',
                background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                boxShadow: isSelected ? '0 0 16px rgba(0, 240, 255, 0.15)' : 'none',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: isSelected ? 'var(--color-teal)' : 'var(--text-main)' }}>
                  {getIcon(preset.level)}
                  <span>{preset.name}</span>
                </div>
                {preset.level === 1 && (
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-muted)' }}>
                    現在・最低
                  </span>
                )}
                {preset.level === 4 && (
                  <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', background: 'rgba(157, 78, 221, 0.2)', color: 'var(--color-purple)' }}>
                    最高強度
                  </span>
                )}
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '8px' }}>
                {preset.desc}
              </div>

              <div style={{ fontSize: '11px', color: isSelected ? 'var(--color-teal)' : 'rgba(255, 255, 255, 0.4)', display: 'flex', gap: '10px' }}>
                <span>文脈枠: {preset.numCtx.toLocaleString()} tokens</span>
                <span>参照: 最大{preset.topK}件</span>
              </div>
            </div>
          );
        })}
      </div>

      {currentLevel >= 3 && (
        <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255, 183, 3, 0.08)', border: '1px solid rgba(255, 183, 3, 0.25)', fontSize: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} style={{ color: 'var(--color-gold)', flexShrink: 0 }} />
          <span>
            レベル3以上では高密度な推論計算を行うため、応答まで30秒〜1分程度かかる場合があります。
          </span>
        </div>
      )}
    </div>
  );
};
