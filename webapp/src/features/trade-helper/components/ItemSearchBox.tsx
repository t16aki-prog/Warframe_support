import React from 'react';
import { Search, ExternalLink } from 'lucide-react';
import type { DictionaryItem } from '../types';

interface ItemSearchBoxProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchResults: DictionaryItem[];
  onSelectItem: (item: DictionaryItem) => void;
  selectedItem: DictionaryItem | null;
  customItemEn: string;
  onCustomItemEnChange: (val: string) => void;
  onUseCustomItem: () => void;
  sellerName: string;
  onSellerNameChange: (val: string) => void;
  platPrice: string;
  onPlatPriceChange: (val: string) => void;
}

export const ItemSearchBox: React.FC<ItemSearchBoxProps> = ({
  searchQuery,
  onSearchChange,
  searchResults,
  onSelectItem,
  selectedItem,
  customItemEn,
  onCustomItemEnChange,
  onUseCustomItem,
  sellerName,
  onSellerNameChange,
  platPrice,
  onPlatPriceChange,
}) => {
  return (
    <div className="glass-card neon-teal">
      <h3 className="card-title">
        <Search size={18} className="card-title-icon" />
        アイテム検索・入力
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">アイテム名 (日本語または英語)</label>
          <input
            type="text"
            className="input-text"
            placeholder="例: ライノ プライム, Arcane Energize..."
            value={searchQuery}
            onChange={onSearchChange}
          />

          {searchResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'var(--bg-panel)',
                border: '1px solid var(--border-light)',
                borderRadius: '8px',
                zIndex: 10,
                maxHeight: '200px',
                overflowY: 'auto',
                marginTop: '4px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {searchResults.map((item) => (
                <div
                  key={item.urlName}
                  onClick={() => onSelectItem(item)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                    fontSize: '14px',
                    transition: 'var(--transition-smooth)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="badge teal" style={{ marginRight: '8px', fontSize: '9px' }}>
                    {item.category}
                  </span>
                  {item.ja}
                </div>
              ))}
            </div>
          )}
        </div>

        {searchQuery && !selectedItem && searchResults.length === 0 && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-light)',
              borderRadius: '8px',
            }}
          >
            <p className="cycle-sub" style={{ marginBottom: '12px' }}>
              辞書に一致するアイテムが見つかりませんでした。英語名がわかる場合は手動で入力できます。
            </p>
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label" style={{ fontSize: '12px' }}>英語アイテム名を入力してください</label>
              <input
                type="text"
                className="input-text"
                placeholder="例: Rhino Prime Chassis"
                value={customItemEn}
                onChange={(e) => onCustomItemEnChange(e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={onUseCustomItem}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              入力した英語名を使用する
            </button>
          </div>
        )}

        {selectedItem && (
          <div
            style={{
              padding: '16px',
              background: 'rgba(0, 240, 255, 0.03)',
              border: '1px solid rgba(0, 240, 255, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{selectedItem.ja}</h4>
              <p className="cycle-sub">英語名: {selectedItem.en}</p>
            </div>
            <a
              href={`https://warframe.market/items/${selectedItem.urlName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-copy"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
            >
              <ExternalLink size={14} />
              Marketで相場を確認
            </a>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">取引相手のゲーム内ユーザー名 (Seller Name)</label>
          <input
            type="text"
            className="input-text"
            placeholder="例: TennoTrader123"
            value={sellerName}
            onChange={(e) => onSellerNameChange(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">合意したプラチナ価格 (Price in Platinum)</label>
          <input
            type="number"
            className="input-text"
            placeholder="例: 45"
            value={platPrice}
            onChange={(e) => onPlatPriceChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
