import React from 'react';
import { CheckSquare } from 'lucide-react';
import type { RelicGeneratorProps } from './types';
import { useRelicMatrix } from './hooks/useRelicMatrix';
import { useChatRecruiter } from './hooks/useChatRecruiter';
import { RelicSearchInput } from './components/RelicSearchInput';
import { RelicMatrixTable } from './components/RelicMatrixTable';
import { ChatRecruiterCard } from './components/ChatRecruiterCard';

export const RelicGenerator: React.FC<RelicGeneratorProps> = ({ navState, clearNavState }) => {
  const {
    searchQuery,
    setSearchQuery,
    loading,
    results,
    tableItems,
    latestPrimeItems,
    handleSearch,
    addCurrentResultToTable,
    removeTableItem,
    clearTableItems,
  } = useRelicMatrix(navState, clearNavState);

  const {
    selectedRelic,
    setSelectedRelic,
    refinement,
    setRefinement,
    partySize,
    setPartySize,
    missionType,
    setMissionType,
    getChatText,
    copyToClipboard,
    handleRelicSelect,
  } = useChatRecruiter();

  const navigateToDataExplorer = (relicName: string) => {
    let base = relicName
      .replace(' (Radiant)', '')
      .replace(' (Flawless)', '')
      .replace(' (Exceptional)', '')
      .replace(' (Intact)', '')
      .trim();
    if (!base.toLowerCase().includes('relic') && !base.toLowerCase().includes('レリック')) {
      base += ' Relic';
    }
    base = base.replace(' (Vaulted)', '').trim();
    window.dispatchEvent(
      new CustomEvent('navigateTab', {
        detail: { tab: 'dataexplorer', subTab: 'relics', query: base, from: 'relicgenerator' },
      })
    );
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">簡単レリック表ジェネレーター</h2>
        <p className="page-desc">目的のフレームに必要なレリック一覧（表）の作成と、リクルートチャット用テキストの生成を行います。</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Search & Checklist */}
        <div className="glass-card">
          <h3 className="card-title">
            <CheckSquare size={20} className="card-title-icon" style={{ color: 'var(--color-teal)' }} />
            レリック表生成
          </h3>
          <p className="cycle-sub" style={{ marginBottom: '16px' }}>
            調べたいフレーム名を入力すると、必要なレリックの一覧表を作成します。
          </p>

          <RelicSearchInput
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onSearch={handleSearch}
            loading={loading}
            hasResults={Boolean(results?.parts)}
            onAddToTable={addCurrentResultToTable}
          />

          {loading && <div style={{ padding: '20px', textAlign: 'center' }}>検索中...</div>}
          {results && results.error && <div className="alert-box danger">{results.error}</div>}

          {/* Latest Prime Auto-Generated Matrix */}
          <RelicMatrixTable
            items={latestPrimeItems}
            title="最新Prime (自動生成)"
            isRemovable={false}
            onRelicSelect={handleRelicSelect}
            onNavigateToDataExplorer={navigateToDataExplorer}
          />

          {/* User Generated Matrix */}
          <RelicMatrixTable
            items={tableItems}
            title="カスタム・レリック表"
            isRemovable={true}
            onRemoveItem={removeTableItem}
            onClearAll={clearTableItems}
            onRelicSelect={handleRelicSelect}
            onNavigateToDataExplorer={navigateToDataExplorer}
          />
        </div>

        {/* Recruitment Chat Generator */}
        <ChatRecruiterCard
          selectedRelic={selectedRelic}
          onSelectedRelicChange={setSelectedRelic}
          refinement={refinement}
          onRefinementChange={setRefinement}
          missionType={missionType}
          onMissionTypeChange={setMissionType}
          partySize={partySize}
          onPartySizeChange={setPartySize}
          chatText={getChatText()}
          onCopyChatText={() => copyToClipboard(getChatText())}
        />
      </div>
    </div>
  );
};
