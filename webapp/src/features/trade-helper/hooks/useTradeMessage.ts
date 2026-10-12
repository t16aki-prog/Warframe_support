import { useState } from 'react';
import { searchItems, type DictionaryItem } from '../../../utils/itemDictionary';

export const useTradeMessage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DictionaryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<DictionaryItem | null>(null);
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
      category: 'other',
    });
  };

  const itemName = selectedItem ? selectedItem.en : customItemEn || 'Item Name';
  const whisperCommand = `/w ${sellerName || '[取引相手のユーザー名]'} Hi! I want to buy: ${itemName} for ${platPrice || '[価格]'} platinum. (warframe.market)`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whisperCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return {
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
  };
};
