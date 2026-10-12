import { useState, useEffect, useMemo } from 'react';
import type { ItemDefinition } from '../types';

export const useBuildItems = () => {
  const [items, setItems] = useState<ItemDefinition[]>([]);
  const [activeCategory, setActiveCategory] = useState('Warframes');
  const [filterText, setFilterText] = useState('');
  const [loadingItems, setLoadingItems] = useState(true);
  const [warframesData, setWarframesData] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'build' | 'acquisition'>('build');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://api.warframestat.us/items?language=ja');
        const data = await response.json();

        try {
          const wfResponse = await fetch('https://api.warframestat.us/warframes?language=ja');
          const wfData = await wfResponse.json();
          setWarframesData(wfData);
        } catch (e) {
          console.error('Failed to fetch warframes data:', e);
        }

        const gearItems = data.filter((item: any) =>
          !item.name.includes('Skin') &&
          !item.name.includes('Helmet') &&
          item.category
        );

        const normalized = gearItems.map((item: any) => {
          let cat = item.category;
          if (cat === 'Sentinels') cat = 'Pets';
          if (item.name === 'Voidrig' || item.name === 'Bonewidow') cat = 'Necramech';
          return { name: item.name, category: cat, uniqueName: item.uniqueName };
        }).filter((item: any) => {
          if (item.category === 'Warframes') {
            if (item.name.includes('Prime') || item.name.includes('Umbra')) {
              return false;
            }
          }
          return true;
        });

        const uniqueItems = Array.from(new Map(normalized.map((item: any) => [item.name, item])).values()) as ItemDefinition[];
        setItems(uniqueItems);
      } catch (e) {
        console.error('Failed to fetch items:', e);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.category === activeCategory)
      .filter((item) => item.name.toLowerCase().includes(filterText.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, activeCategory, filterText]);

  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    if (categoryId !== 'Warframes') setViewMode('build');
    setFilterText('');
  };

  return {
    items,
    activeCategory,
    selectCategory,
    filterText,
    setFilterText,
    loadingItems,
    warframesData,
    viewMode,
    setViewMode,
    filteredItems,
  };
};
