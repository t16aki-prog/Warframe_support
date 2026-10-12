import React from 'react';
import { History, Calendar, ExternalLink, CheckCircle2, Bookmark, BookOpen, Layers } from 'lucide-react';
import type { ContentArchive } from '../types';

interface ArchiveTabProps {
  archives: ContentArchive[];
  selectedArchive: ContentArchive;
  onSelect: (id: string) => void;
}

export const ArchiveTab: React.FC<ArchiveTabProps> = ({
  archives,
  selectedArchive,
  onSelect,
}) => {
  return (
    <div>
      {/* Overview Banner */}
      <div
        className="glass-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(157, 78, 221, 0.08)',
          border: '1px solid rgba(157, 78, 221, 0.35)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <History size={22} style={{ color: 'var(--color-purple)' }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#f1f3f9' }}>
              過去の大型アップデート・特設コンテンツ アーカイブ
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              大型アップデートごとの重要システム、攻略ハイライト、新フレームや新武器の追加履歴を後からいつでも振り返ることができます。
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-purple)' }}>
          <Layers size={14} /> 記録済み: <strong>{archives.length} 件</strong>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left: Archive Timeline List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={14} /> アップデート履歴一覧
          </div>

          {archives.map((item) => {
            const isSelected = item.id === selectedArchive.id;
            return (
              <div
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="glass-card"
                style={{
                  padding: '14px 18px',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #38bdf8' : '1px solid var(--border-light)',
                  background: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  transition: 'var(--transition-smooth)',
                  boxShadow: isSelected ? '0 0 16px rgba(56, 189, 248, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: 'rgba(56, 189, 248, 0.2)',
                      color: '#38bdf8',
                    }}
                  >
                    {item.updateNumber}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {item.releaseDate}
                  </span>
                </div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: '#f1f3f9', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {item.subtitle}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Archive Detail */}
        <div className="glass-card neon-frost" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '14px',
                  background: 'rgba(157, 78, 221, 0.2)',
                  color: 'var(--color-purple)',
                  border: '1px solid rgba(157, 78, 221, 0.4)',
                  display: 'inline-block',
                  marginBottom: '8px',
                }}
              >
                {selectedArchive.updateNumber} ・ {selectedArchive.category}
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', marginBottom: '4px' }}>
                {selectedArchive.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--color-teal)' }}>
                {selectedArchive.subtitle}
              </p>
            </div>

            {selectedArchive.officialForumUrl && (
              <a
                href={selectedArchive.officialForumUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '12px',
                  color: 'var(--color-teal)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1px solid rgba(0, 240, 255, 0.25)',
                }}
              >
                <ExternalLink size={13} /> 公式パッチノート
              </a>
            )}
          </div>

          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(0, 0, 0, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '13px',
              lineHeight: '1.6',
              color: 'var(--text-main)',
              marginBottom: '18px',
            }}
          >
            {selectedArchive.summary}
          </div>

          {/* Key Features */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bookmark size={14} /> 主な実装・追加要素
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedArchive.keyFeatures.map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-main)' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: '2px' }} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Guide Highlights */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BookOpen size={14} /> 攻略・ビルドの重要要点
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedArchive.guideHighlights.map((guide, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 183, 3, 0.08)',
                    border: '1px solid rgba(255, 183, 3, 0.25)',
                    fontSize: '12px',
                    color: '#f8fafc',
                    lineHeight: '1.5',
                  }}
                >
                  💡 {guide}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
