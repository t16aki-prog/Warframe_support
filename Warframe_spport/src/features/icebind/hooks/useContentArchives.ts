import { useState, useEffect } from 'react';
import type { ContentArchive } from '../types';
import { INITIAL_ARCHIVES } from '../constants';

const STORAGE_KEY = 'tennonavi_content_archives_v1';

export function useContentArchives() {
  const [archives, setArchives] = useState<ContentArchive[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse archives from localStorage', e);
    }
    return INITIAL_ARCHIVES;
  });

  const [selectedId, setSelectedId] = useState<string>(archives[0]?.id || 'update-44-icebind');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(archives));
    } catch (e) {
      console.error('Failed to save archives to localStorage', e);
    }
  }, [archives]);

  const addArchive = (item: ContentArchive) => {
    setArchives((prev) => [item, ...prev.filter((a) => a.id !== item.id)]);
    setSelectedId(item.id);
  };

  const selectedArchive = archives.find((a) => a.id === selectedId) || archives[0];

  return {
    archives,
    selectedId,
    setSelectedId,
    selectedArchive,
    addArchive,
  };
}
