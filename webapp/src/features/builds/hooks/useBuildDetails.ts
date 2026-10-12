import { useState } from 'react';
import type { BuildData } from '../types';

export const useBuildDetails = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [loadingBuild, setLoadingBuild] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildData, setBuildData] = useState<BuildData | null>(null);

  const handleSelectItem = async (itemName: string, category: string) => {
    setSelectedItem(itemName);
    setLoadingBuild(true);
    setError(null);
    setBuildData(null);

    try {
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const response = await fetch(`/api/builds/${encodeURIComponent(itemName)}?category=${encodeURIComponent(category)}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });
      if (!response.ok) {
        throw new Error('データの取得に失敗しました。');
      }
      const data: BuildData = await response.json();
      setBuildData(data);
    } catch (err: any) {
      console.error(err);
      setError('ビルド情報の生成中にエラーが発生しました。セファロンAIが応答していません。');
    } finally {
      setLoadingBuild(false);
    }
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setBuildData(null);
    setError(null);
  };

  return {
    selectedItem,
    loadingBuild,
    error,
    buildData,
    handleSelectItem,
    clearSelection,
  };
};
