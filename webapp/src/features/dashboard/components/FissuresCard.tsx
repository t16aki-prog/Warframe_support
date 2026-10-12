import React from 'react';
import { Zap, Star, Target } from 'lucide-react';
import type { WorldState } from '../../../utils/warframeApi';
import { translateText } from '../../../utils/translate';

interface FissuresCardProps {
  worldState: WorldState;
  showSteelPath: boolean;
  trackedLocations: string[];
  favoriteNodes: string[];
  toggleFavoriteNode: (node: string) => void;
  getLiveTimeLeft: (target: string) => string;
}

export const FissuresCard: React.FC<FissuresCardProps> = ({
  worldState,
  showSteelPath,
  trackedLocations,
  favoriteNodes,
  toggleFavoriteNode,
  getLiveTimeLeft,
}) => {
  const isTrackedNode = (node: string) => {
    if (!node || typeof node !== 'string') return false;
    return trackedLocations.some((loc) => {
      if (!loc || typeof loc !== 'string') return false;
      return loc.includes(node) || node.includes(loc.split(' ')[0]);
    });
  };

  const sortedFissures = worldState.fissures
    .filter((f) => !f.expired)
    .filter((f) => showSteelPath || !f.isHard)
    .sort((a, b) => {
      const aTracked = isTrackedNode(a.node);
      const bTracked = isTrackedNode(b.node);
      if (aTracked && !bTracked) return -1;
      if (!aTracked && bTracked) return 1;
      const aFav = favoriteNodes.includes(a.node);
      const bFav = favoriteNodes.includes(b.node);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  return (
    <div className="glass-card neon-purple">
      <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
        <Zap size={18} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
        アクティブなVoid亀裂 (Fissures)
      </h3>
      <div className="fissures-container">
        {sortedFissures.map((fissure) => {
          const isTracked = isTrackedNode(fissure.node);
          const isFav = favoriteNodes.includes(fissure.node);

          return (
            <div
              key={fissure.id}
              className="fissure-card"
              style={{
                border: isTracked ? '1px solid var(--color-gold)' : isFav ? '1px solid var(--color-teal)' : undefined,
                background: isTracked ? 'rgba(255, 183, 3, 0.05)' : isFav ? 'rgba(0, 242, 254, 0.05)' : undefined,
              }}
            >
              <div className="fissure-info">
                <div className="fissure-node" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {fissure.node}
                  {fissure.isHard && <span className="badge danger" style={{ fontSize: '10px', padding: '2px 4px' }}>鋼の道のり</span>}
                  <button
                    onClick={() => toggleFavoriteNode(fissure.node)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    title="お気に入りノードに登録/解除"
                  >
                    <Star size={14} fill={isFav ? 'var(--color-gold)' : 'none'} color={isFav ? 'var(--color-gold)' : 'var(--text-muted)'} />
                  </button>
                  {isTracked && (
                    <span className="badge gold" style={{ fontSize: '10px', padding: '2px 4px' }}>
                      <Target size={10} style={{ marginRight: '2px', verticalAlign: 'middle' }} />
                      🎯 追跡アイテムドロップ！
                    </span>
                  )}
                </div>
                <div className="fissure-mission">
                  {translateText(fissure.missionType)} | {translateText(fissure.enemy)}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className={`badge ${
                    fissure.tier === 'Requiem'
                      ? 'danger'
                      : fissure.tier === 'Axi'
                      ? 'purple'
                      : fissure.tier === 'Neo'
                      ? 'gold'
                      : 'teal'
                  }`}
                >
                  {fissure.tier}
                </span>
                <span className="fissure-time" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {getLiveTimeLeft(fissure.expiry)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
