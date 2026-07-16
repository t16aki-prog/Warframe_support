import React, { useState } from 'react';
import { Search, ExternalLink, Copy, Check, MessageSquareCode, BadgeAlert } from 'lucide-react';
import { searchItems, type DictionaryItem } from '../utils/itemDictionary';

export const TradeHelper: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);
  
  // Custom input for items not in the dictionary
  const [customItemEn, setCustomItemEn] = useState('');
  
  const [sellerName, setSellerName] = useState('');
  const [platPrice, setPlatPrice] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(searchItems(query));
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectItem = (item: DictionaryItem) => {
    setSelectedItem(item);
    setCustomItemEn('');
    setSearchResults([]);
    setSearchQuery(item.ja);
  };

  const handleUseCustomItem = () => {
    setSelectedItem({
      ja: `手動入力: ${searchQuery}`,
      en: customItemEn || searchQuery,
      urlName: (customItemEn || searchQuery).toLowerCase().replace(/\s+/g, '_'),
      category: 'other'
    });
  };

  // Build the copypasta command
  const itemName = selectedItem ? selectedItem.en : (customItemEn || 'Item Name');
  const whisperCommand = `/w ${sellerName || '[取引相手のユーザー名]'} Hi! I want to buy: ${itemName} for ${platPrice || '[価格]'} platinum. (warframe.market)`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whisperCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">トレード ＆ メッセージ生成</h2>
        <p className="page-desc">
          warframe.marketで取引する際の英語メッセージを生成し、取引マナーを確認します。
        </p>
      </div>

      <div className="grid-dashboard" style={{ alignItems: 'start' }}>
        {/* Left column: Item Search and Input */}
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
                onChange={handleSearchChange}
              />
              
              {/* Search dropdown suggestions */}
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
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  {searchResults.map((item) => (
                    <div
                      key={item.urlName}
                      onClick={() => handleSelectItem(item)}
                      style={{
                        padding: '10px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        fontSize: '14px',
                        transition: 'var(--transition-smooth)'
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

            {/* Custom Input helper if item is not found */}
            {searchQuery && !selectedItem && searchResults.length === 0 && (
              <div
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px dashed var(--border-light)',
                  borderRadius: '8px'
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
                    onChange={(e) => setCustomItemEn(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUseCustomItem}
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
                  alignItems: 'center'
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
                onChange={(e) => setSellerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">合意したプラチナ価格 (Price in Platinum)</label>
              <input
                type="number"
                className="input-text"
                placeholder="例: 45"
                value={platPrice}
                onChange={(e) => setPlatPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right column: Generated Message & Manners Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card neon-purple">
            <h3 className="card-title" style={{ color: 'var(--color-purple)' }}>
              <MessageSquareCode size={18} className="card-title-icon" style={{ color: 'var(--color-purple)' }} />
              コピー用ゲーム内チャットコマンド
            </h3>
            <p className="cycle-sub" style={{ marginBottom: '16px' }}>
              以下のテキストをコピーし、ゲーム内のチャットウィンドウにそのまま貼り付ける（Ctrl+V）と、相手に直接ウィスパー（個チャ）を送ることができます。
            </p>

            <div className="copypasta-box" style={{ wordBreak: 'break-all' }}>
              <span>{whisperCommand}</span>
            </div>

            <button
              onClick={copyToClipboard}
              className="btn-primary"
              style={{
                marginTop: '16px',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: copied ? 'var(--color-success)' : undefined
              }}
              disabled={!sellerName || (!selectedItem && !customItemEn)}
            >
              {copied ? (
                <>
                  <Check size={18} />
                  クリップボードにコピーしました！
                </>
              ) : (
                <>
                  <Copy size={18} />
                  チャットコマンドをコピー
                </>
              )}
            </button>
            {!sellerName && (
              <p className="cycle-sub" style={{ color: 'var(--color-danger)', marginTop: '8px', textAlign: 'center' }}>
                ※コピペメッセージを生成するには「ユーザー名」を入力してください。
              </p>
            )}
          </div>

          <div className="glass-card">
            <h3 className="card-title">
              <BadgeAlert size={18} className="card-title-icon" style={{ color: 'var(--color-gold)' }} />
              トレード時のチェックリスト
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
                取引に必要なクレジット（取引税）が十分にありますか？（特にアルケインや伝説MODは高額なクレジットが必要です）
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
                道場に入った後、ホストから「取引申請」が来るまでじっと待っていますか？
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
                取引画面にセットしたアイテム、およびプラチナの数量は正しいですか？
              </li>
              <li style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--color-gold)', fontWeight: 'bold' }}>✔</span>
                取引が終わったら「ty (thank you)」などの挨拶を送りましたか？
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
