import { useState, useEffect } from 'react';
import type { DataExplorerTab, DataExplorerProps, WishlistType } from '../types';
import { fetchWorldState } from '../../../utils/warframeApi';
import type { WorldState } from '../../../utils/warframeApi';

export const useDataExplorer = (props: DataExplorerProps) => {
  const { navState, clearNavState } = props;

  const [activeTab, setActiveTab] = useState<DataExplorerTab>('relics');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [backTarget, setBackTarget] = useState<string | null>(null);
  const [worldState, setWorldState] = useState<WorldState | null>(null);

  useEffect(() => {
    fetchWorldState().then((data: WorldState | null) => {
      if (data) setWorldState(data);
    });
  }, []);

  const addToWishlist = (itemName: string, type: WishlistType) => {
    const current = JSON.parse(localStorage.getItem('warframe_wishlist') || '[]');
    if (!current.some((item: any) => item.name === itemName)) {
      const newItem = { id: Date.now().toString(), name: itemName, type };
      localStorage.setItem('warframe_wishlist', JSON.stringify([...current, newItem]));
      alert(`${itemName} を欲しいものリストに追加しました！`);
    } else {
      alert(`${itemName} は既に欲しいものリストに登録されています。`);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() && activeTab !== 'vaulted' && activeTab !== 'augments' && activeTab !== 'resources') return;

    setLoading(true);
    setResults(null);
    try {
      let endpoint = '';
      if (activeTab === 'relics') {
        endpoint = `/api/relics?q=${encodeURIComponent(searchQuery)}`;
      } else if (activeTab === 'warframes') {
        endpoint = `/api/warframes/${encodeURIComponent(searchQuery)}`;
      } else if (activeTab === 'vaulted') {
        endpoint = `/api/vaulted`;
      } else if (activeTab === 'augments') {
        endpoint = `/api/augments`;
      } else if (activeTab === 'mods') {
        endpoint = `/api/item-locations/${encodeURIComponent(searchQuery)}`;
      } else {
        endpoint = `/api/resources`;
      }

      const res = await fetch(endpoint);
      if (res.status === 503) {
        const errorData = await res.json();
        setResults({ error: errorData.error || 'データベース構築中です...' });
        return;
      }
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
      setResults({ error: 'データの取得に失敗しました。サーバーが起動しているか確認してください。' });
    }
    setLoading(false);
  };

  // Handle incoming cross-tab navigation
  useEffect(() => {
    if (navState && navState.tab === 'dataexplorer') {
      if (navState.subTab) {
        setActiveTab(navState.subTab as any);
      }
      if (navState.query) {
        setSearchQuery(navState.query);
        const runSearch = async () => {
          setLoading(true);
          try {
            let endpoint = '';
            if (navState.subTab === 'relics') {
              endpoint = `/api/relics?q=${encodeURIComponent(navState.query)}`;
            } else if (navState.subTab === 'warframes') {
              endpoint = `/api/warframes/${encodeURIComponent(navState.query)}`;
            } else if (navState.subTab === 'mods') {
              endpoint = `/api/item-locations/${encodeURIComponent(navState.query)}`;
            }
            if (endpoint) {
              const res = await fetch(endpoint);
              const data = await res.json();
              setResults(data);
            }
          } catch (err) {
            console.error(err);
          }
          setLoading(false);
        };
        runSearch();
      }
      if (navState.from) {
        setBackTarget(navState.from);
      }
      if (clearNavState) clearNavState();
    }
  }, [navState, clearNavState]);

  useEffect(() => {
    if (activeTab === 'vaulted' || activeTab === 'augments' || activeTab === 'resources') {
      handleSearch({ preventDefault: () => {} } as React.FormEvent);
    } else {
      setResults(null);
    }
  }, [activeTab]);

  return {
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
  };
};
