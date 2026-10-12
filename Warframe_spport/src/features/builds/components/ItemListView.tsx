import React from 'react';
import { Search, RefreshCw } from 'lucide-react';
import type { ItemDefinition } from '../types';

interface ItemListViewProps {
  filterText: string;
  onFilterChange: (val: string) => void;
  loadingItems: boolean;
  filteredItems: ItemDefinition[];
  selectedItem: string | null;
  onSelectItem: (name: string) => void;
}

export const ItemListView: React.FC<ItemListViewProps> = ({
  filterText,
  onFilterChange,
  loadingItems,
  filteredItems,
  selectedItem,
  onSelectItem,
}) => {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh' }}>
      <div style={{ position: 'relative' }}>
        <Search className="input-icon" size={16} />
        <input
          type="text"
          className="search-input"
          placeholder="絞り込み..."
          value={filterText}
          onChange={(e) => onFilterChange(e.target.value)}
          style={{ width: '100%', paddingLeft: '36px', fontSize: '14px' }}
        />
      </div>

      <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '8px' }} className="custom-scrollbar">
        {loadingItems ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
            <RefreshCw size={24} style={{ animation: 'spinRing 1s linear infinite', color: 'var(--color-primary)' }} />
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <button
              key={item.uniqueName}
              onClick={() => onSelectItem(item.name)}
              style={{
                padding: '10px 16px',
                textAlign: 'left',
                background: selectedItem === item.name ? 'rgba(0, 240, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedItem === item.name ? '1px solid var(--color-primary)' : '1px solid transparent',
                borderRadius: '6px',
                color: 'var(--text-color)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontSize: '14px',
                fontWeight: selectedItem === item.name ? 'bold' : 'normal',
              }}
              onMouseEnter={(e) => {
                if (selectedItem !== item.name) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                if (selectedItem !== item.name) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {item.name}
            </button>
          ))
        ) : (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>
            見つかりませんでした
          </div>
        )}
      </div>
    </div>
  );
};
