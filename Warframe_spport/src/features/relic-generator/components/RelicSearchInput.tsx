import React from 'react';
import { AutocompleteSearch } from '../../../components/AutocompleteSearch';

interface RelicSearchInputProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: (e?: React.FormEvent) => void;
  loading: boolean;
  hasResults: boolean;
  onAddToTable: () => void;
}

export const RelicSearchInput: React.FC<RelicSearchInputProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
  loading,
  hasResults,
  onAddToTable,
}) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
      <AutocompleteSearch
        value={searchQuery}
        onChange={onSearchQueryChange}
        onSearch={onSearch}
        placeholder="例: Titania (Prime省略可)"
        type="warframes"
        disabled={loading}
      />
      {hasResults && (
        <button
          onClick={onAddToTable}
          className="btn-primary"
          style={{ background: 'var(--color-gold)', color: '#000', whiteSpace: 'nowrap' }}
        >
          表に追加
        </button>
      )}
    </div>
  );
};
