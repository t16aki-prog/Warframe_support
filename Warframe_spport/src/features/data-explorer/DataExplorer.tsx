import React from 'react';
import type { DataExplorerProps } from './types';
import { useDataExplorer } from './hooks/useDataExplorer';
import { ExplorerTabs } from './components/ExplorerTabs';
import { RelicsResult } from './components/RelicsResult';
import { WarframeResult } from './components/WarframeResult';
import { VaultedResult } from './components/VaultedResult';
import { AugmentsResult } from './components/AugmentsResult';
import { ResourcesResult } from './components/ResourcesResult';
import { ModsResult } from './components/ModsResult';

export const DataExplorer: React.FC<DataExplorerProps> = (props) => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    loading,
    results,
    backTarget,
    setBackTarget,
    worldState,
    addToWishlist,
    handleSearch,
  } = useDataExplorer(props);

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">データベース検索</h2>
        <p className="page-desc">レリックのドロップ先、フレームの取得方法、格納(Vault)済みのアイテムを確認できます。</p>
      </div>

      {backTarget && (
        <button
          onClick={() => {
            window.dispatchEvent(new CustomEvent('navigateTab', { detail: { tab: backTarget } }));
            setBackTarget(null);
          }}
          className="btn-primary"
          style={{ marginBottom: '16px', background: 'var(--color-gold)', color: 'black' }}
        >
          ← 元の画面に戻る
        </button>
      )}

      <ExplorerTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {loading && activeTab === 'vaulted' && (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading Vaulted Primes...</div>
      )}

      {results && !results.error && activeTab === 'relics' && (
        <RelicsResult results={results} onAddToWishlist={addToWishlist} />
      )}

      {results && !results.error && activeTab === 'warframes' && (
        <WarframeResult results={results} onAddToWishlist={addToWishlist} />
      )}

      {results && !results.error && activeTab === 'vaulted' && (
        <VaultedResult results={results} worldState={worldState} />
      )}

      {results && !results.error && activeTab === 'augments' && (
        <AugmentsResult
          augments={results.augments}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      )}

      {results && !results.error && activeTab === 'resources' && (
        <ResourcesResult
          resources={results.resources}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAddToWishlist={addToWishlist}
        />
      )}

      {results && !results.error && activeTab === 'mods' && (
        <ModsResult locations={results.locations} />
      )}

      {results?.error && (
        <div className="glass-card neon-danger">
          <p style={{ color: 'var(--color-danger)' }}>{results.error}</p>
        </div>
      )}
    </div>
  );
};
