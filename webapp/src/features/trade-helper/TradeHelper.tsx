import React from 'react';
import type { TradeHelperProps } from './types';
import { useTradeMessage } from './hooks/useTradeMessage';
import { ItemSearchBox } from './components/ItemSearchBox';
import { MessageGeneratorBox } from './components/MessageGeneratorBox';
import { TradeMannersBox } from './components/TradeMannersBox';

export const TradeHelper: React.FC<TradeHelperProps> = () => {
  const {
    searchQuery,
    searchResults,
    selectedItem,
    customItemEn,
    setCustomItemEn,
    sellerName,
    setSellerName,
    platPrice,
    setPlatPrice,
    copied,
    handleSearchChange,
    handleSelectItem,
    handleUseCustomItem,
    whisperCommand,
    copyToClipboard,
  } = useTradeMessage();

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">トレード ＆ メッセージ生成</h2>
        <p className="page-desc">
          warframe.marketで取引する際の英語メッセージを生成し、取引マナーを確認します。
        </p>
      </div>

      <div className="grid-dashboard" style={{ alignItems: 'start' }}>
        <ItemSearchBox
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchResults={searchResults}
          onSelectItem={handleSelectItem}
          selectedItem={selectedItem}
          customItemEn={customItemEn}
          onCustomItemEnChange={setCustomItemEn}
          onUseCustomItem={handleUseCustomItem}
          sellerName={sellerName}
          onSellerNameChange={setSellerName}
          platPrice={platPrice}
          onPlatPriceChange={setPlatPrice}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <MessageGeneratorBox
            whisperCommand={whisperCommand}
            copied={copied}
            onCopy={copyToClipboard}
            sellerName={sellerName}
            hasItem={Boolean(selectedItem || customItemEn)}
          />
          <TradeMannersBox />
        </div>
      </div>
    </div>
  );
};
