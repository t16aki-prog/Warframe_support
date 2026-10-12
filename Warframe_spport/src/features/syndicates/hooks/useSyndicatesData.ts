import { useState, useEffect } from 'react';
import { fetchWorldState } from '../../../utils/warframeApi';
import type { WorldState } from '../../../utils/warframeApi';

export const useSyndicatesData = () => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [userRanks, setUserRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem('syndicateRanks');
    if (saved) {
      try {
        setUserRanks(JSON.parse(saved));
      } catch {
        // fallback
      }
    } else {
      setUserRanks({
        Ostrons: 5,
        'Solaris United': 5,
        Entrati: 5,
        'The Holdfasts': 5,
        Cavia: 5,
        'The Hex': 5,
      });
    }
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLiveTimeLeft = (targetDateString: string) => {
    const target = new Date(targetDateString).getTime();
    const diff = target - now;
    if (diff <= 0) return 'まもなく更新...';

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (d > 0) return `${d}日 ${h}時間 ${m}分 ${s}秒`;
    if (h > 0) return `${h}時間 ${m}分 ${s}秒`;
    return `${m}分 ${s}秒`;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const data = await fetchWorldState();
    if (data) {
      setWorldState(data);
      setLastUpdated(new Date());
    } else {
      setError('データの取得に失敗しました。APIサーバーが混雑している可能性があります。');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return {
    worldState,
    loading,
    error,
    lastUpdated,
    userRanks,
    getLiveTimeLeft,
    loadData,
  };
};
