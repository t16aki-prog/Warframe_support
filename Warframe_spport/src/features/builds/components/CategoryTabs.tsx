import React from 'react';
import { Shield, Database } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface CategoryTabsProps {
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  viewMode: 'build' | 'acquisition';
  onViewModeChange: (mode: 'build' | 'acquisition') => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  activeCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div className="tabs-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`tab-button ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat.id)}
            style={{ padding: '8px 16px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {activeCategory === 'Warframes' && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`tab-button ${viewMode === 'build' ? 'active' : ''}`}
            onClick={() => onViewModeChange('build')}
            style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '4px' }}
          >
            <Shield size={14} style={{ display: 'inline', marginRight: '4px' }} />
            ビルド構成
          </button>
          <button
            className={`tab-button ${viewMode === 'acquisition' ? 'active' : ''}`}
            onClick={() => onViewModeChange('acquisition')}
            style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '4px' }}
          >
            <Database size={14} style={{ display: 'inline', marginRight: '4px' }} />
            取得方法一覧
          </button>
        </div>
      )}
    </div>
  );
};
