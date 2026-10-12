import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { useBuildItems } from './hooks/useBuildItems';
import { useBuildDetails } from './hooks/useBuildDetails';
import { CategoryTabs } from './components/CategoryTabs';
import { ItemListView } from './components/ItemListView';
import { AcquisitionListView } from './components/AcquisitionListView';
import { BuildDetailCard } from './components/BuildDetailCard';
import { AugmentsCard } from './components/AugmentsCard';
import { FrameDropsCard } from './components/FrameDropsCard';

export const Builds: React.FC = () => {
  const {
    activeCategory,
    selectCategory,
    filterText,
    setFilterText,
    loadingItems,
    warframesData,
    viewMode,
    setViewMode,
    filteredItems,
  } = useBuildItems();

  const {
    selectedItem,
    loadingBuild,
    error,
    buildData,
    handleSelectItem,
    clearSelection,
  } = useBuildDetails();

  const handleCategoryChange = (categoryId: string) => {
    selectCategory(categoryId);
    clearSelection();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <h2 className="page-title">ビルド＆増強MOD データベース</h2>
        <p className="page-desc">
          セファロンAIが最新のメタを解析し、選択した装備の「最適ビルド」を自動生成します。
        </p>
      </div>

      <CategoryTabs
        activeCategory={activeCategory}
        onSelectCategory={handleCategoryChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {viewMode === 'acquisition' && activeCategory === 'Warframes' ? (
        <AcquisitionListView warframesData={warframesData} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
          <ItemListView
            filterText={filterText}
            onFilterChange={setFilterText}
            loadingItems={loadingItems}
            filteredItems={filteredItems}
            selectedItem={selectedItem}
            onSelectItem={(name) => handleSelectItem(name, activeCategory)}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {loadingBuild && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '16px' }}>
                <RefreshCw size={48} style={{ animation: 'spinRing 1.5s linear infinite', color: 'var(--color-gold)' }} />
                <div style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>セファロンAIが最新のビルド構成を解析中...</div>
              </div>
            )}

            {error && !loadingBuild && (
              <div className="glass-card neon-purple" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle style={{ color: 'var(--color-danger)' }} />
                <span style={{ color: 'var(--text-color)' }}>{error}</span>
              </div>
            )}

            {!loadingBuild && !error && !buildData && selectedItem && (
              <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {selectedItem} を選択しました。解析ボタンが不要になり、選択するだけで自動的に構築されます。
              </div>
            )}

            {!loadingBuild && !error && buildData && (
              <>
                <BuildDetailCard buildData={buildData} selectedItem={selectedItem} />
                <AugmentsCard augments={buildData.augments} />
                {activeCategory === 'Warframes' && (
                  <FrameDropsCard warframesData={warframesData} itemName={buildData.itemName || selectedItem || ''} />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
