import { useState, useEffect } from 'react';
import { fetchWorldState } from '../../../utils/warframeApi';
import type { WorldState } from '../../../utils/warframeApi';

export const useWeeklyData = () => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchWorldState();
        setWorldState(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch world state:', err);
        setError('ウィークリー情報の取得に失敗しました。');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDaysLeft = (targetDateString: string) => {
    const target = new Date(targetDateString).getTime();
    const diff = target - now;
    if (diff <= 0) return '更新間近';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `残り ${days}日 ${hours}時間`;
    return `残り ${hours}時間`;
  };

  return {
    worldState,
    loading,
    error,
    getDaysLeft,
  };
};
