import { useState, useEffect } from 'react';
import type { TableItem } from '../types';

export const useRelicMatrix = (navState?: any, clearNavState?: () => void) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [tableItems, setTableItems] = useState<TableItem[]>([]);
  const [latestPrimeItems, setLatestPrimeItems] = useState<TableItem[]>([]);

  useEffect(() => {
    const loadLatestPrimes = async () => {
      try {
        const res = await fetch('/api/latest-primes');
        const data = await res.json();
        if (data.primes && data.primes.length > 0) {
          const newItems: TableItem[] = [];
          for (const p of data.primes) {
            const frameRes = await fetch(`/api/warframes/${encodeURIComponent(p.name)}`);
            const frameData = await frameRes.json();
            newItems.push({ query: p.name.toUpperCase(), data: frameData });
          }
          setLatestPrimeItems(newItems);
        }
      } catch (err) {
        console.error('Failed to load latest primes', err);
      }
    };
    loadLatestPrimes();
  }, []);

  // Handle cross-tab navigation
  useEffect(() => {
    if (navState && navState.tab === 'relicgenerator') {
      if (navState.action === 'addResurgence' && navState.items) {
        const fetchAndAdd = async () => {
          setLoading(true);
          const newItems: TableItem[] = [];
          for (const item of navState.items) {
            try {
              let query = item;
              if (
                !query.toLowerCase().includes('prime') &&
                !query.toLowerCase().includes('umbra') &&
                !query.toLowerCase().includes('secret')
              ) {
                query += ' Prime';
              }
              const res = await fetch(`/api/warframes/${encodeURIComponent(query)}`);
              const data = await res.json();
              if (data && data.parts && data.parts.length > 0) {
                if (!tableItems.some((existing) => existing.query === query.toUpperCase())) {
                  newItems.push({ query: query.toUpperCase(), data });
                }
              }
            } catch (err) {
              console.error(err);
            }
          }
          if (newItems.length > 0) {
            setTableItems((prev) => {
              const filteredNewItems = newItems.filter((ni) => !prev.some((p) => p.query === ni.query));
              return [...prev, ...filteredNewItems];
            });
          }
          setLoading(false);
        };
        fetchAndAdd();
      }
      if (clearNavState) clearNavState();
    }
  }, [navState, clearNavState]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setResults(null);
    try {
      const res = await fetch(`/api/warframes/${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data);
    } catch {
      setResults({ error: '検索エラーが発生しました' });
    }
    setLoading(false);
  };

  const addCurrentResultToTable = () => {
    if (!results || !results.parts) return;
    const displayQuery = searchQuery.toUpperCase().includes('PRIME')
      ? searchQuery.toUpperCase()
      : searchQuery.toUpperCase() + ' PRIME';
    setTableItems((prev) => [...prev, { query: displayQuery, data: results }]);
  };

  const removeTableItem = (index: number) => {
    setTableItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const clearTableItems = () => {
    setTableItems([]);
  };

  return {
    searchQuery,
    setSearchQuery,
    loading,
    results,
    tableItems,
    latestPrimeItems,
    handleSearch,
    addCurrentResultToTable,
    removeTableItem,
    clearTableItems,
  };
};
