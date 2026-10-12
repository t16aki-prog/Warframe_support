import React from 'react';
import { Package, Box, Archive, Star } from 'lucide-react';
import type { DataExplorerTab } from '../types';
import { AutocompleteSearch } from '../../../components/AutocompleteSearch';

interface ExplorerTabsProps {
  activeTab: DataExplorerTab;
  onTabChange: (tab: DataExplorerTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: (e?: React.FormEvent) => void;
}

export const ExplorerTabs: React.FC<ExplorerTabsProps> = ({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  onSearch,
}) => {
  return (
    <div className="glass-card" style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', overflowX: 'auto' }}>
        <button
          onClick={() => onTabChange('relics')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'relics' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'relics' ? 'var(--color-gold)' : 'var(--text-muted)' }}
        >
          <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          レリック検索
        </button>
        <button
          onClick={() => onTabChange('warframes')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'warframes' ? 'var(--color-teal)' : 'var(--border-light)', color: activeTab === 'warframes' ? 'var(--color-teal)' : 'var(--text-muted)' }}
        >
          <Box size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          フレーム取得方法
        </button>
        <button
          onClick={() => onTabChange('vaulted')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'vaulted' ? 'var(--color-purple)' : 'var(--border-light)', color: activeTab === 'vaulted' ? 'var(--color-purple)' : 'var(--text-muted)' }}
        >
          <Archive size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          格納(Vault)一覧
        </button>
        <button
          onClick={() => onTabChange('augments')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'augments' ? 'var(--color-danger)' : 'var(--border-light)', color: activeTab === 'augments' ? 'var(--color-danger)' : 'var(--text-muted)' }}
        >
          <Box size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          増強MOD一覧
        </button>
        <button
          onClick={() => onTabChange('resources')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'resources' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'resources' ? 'var(--color-gold)' : 'var(--text-muted)' }}
        >
          <Package size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          素材・最適狩場
        </button>
        <button
          onClick={() => onTabChange('mods')}
          className="btn-copy"
          style={{ borderColor: activeTab === 'mods' ? 'var(--color-gold)' : 'var(--border-light)', color: activeTab === 'mods' ? 'var(--color-gold)' : 'var(--text-muted)' }}
        >
          <Star size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
          MOD等入手先
        </button>
      </div>

      {activeTab !== 'vaulted' && activeTab !== 'augments' && activeTab !== 'resources' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <AutocompleteSearch
            value={searchQuery}
            onChange={onSearchChange}
            onSearch={onSearch}
            placeholder={
              activeTab === 'relics' ? '例: Lith G1, Axi L4...' :
              activeTab === 'warframes' ? '例: Titania, Wukong...' :
              activeTab === 'mods' ? '例: Blind Rage, Continuity...' :
              'キーワードを入力...'
            }
            type={activeTab === 'relics' ? 'relics' : activeTab === 'warframes' ? 'warframes' : 'all'}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
};
