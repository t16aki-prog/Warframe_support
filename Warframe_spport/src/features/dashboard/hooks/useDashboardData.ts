import { useState, useEffect } from 'react';
import { fetchWorldState } from '../../../utils/warframeApi';
import type { WorldState } from '../../../utils/warframeApi';

export const useDashboardData = () => {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());

  const userLocale =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('ordis_locale') || (typeof navigator !== 'undefined' ? navigator.language : 'ja-JP')
      : 'ja-JP';

  const userTimeZone =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('ordis_timezone') ||
        (typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'Asia/Tokyo')
      : 'Asia/Tokyo';

  const [, setTrackedItem] = useState<string | null>(null);
  const [trackedLocations, setTrackedLocations] = useState<string[]>([]);
  const [favoriteNodes, setFavoriteNodes] = useState<string[]>([]);

  useEffect(() => {
    // Load tracking and favorites
    const item = localStorage.getItem('warframe_tracked_item');
    if (item) {
      setTrackedItem(item);
      fetch(`/api/item-locations/${encodeURIComponent(item)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.locations) {
            setTrackedLocations(data.locations);
          }
        })
        .catch(console.error);
    }

    const favs = JSON.parse(localStorage.getItem('warframe_favorite_nodes') || '[]');
    setFavoriteNodes(favs);
  }, []);

  const toggleFavoriteNode = (node: string) => {
    let newFavs: string[];
    if (favoriteNodes.includes(node)) {
      newFavs = favoriteNodes.filter((n) => n !== node);
    } else {
      newFavs = [...favoriteNodes, node];
    }
    setFavoriteNodes(newFavs);
    localStorage.setItem('warframe_favorite_nodes', JSON.stringify(newFavs));
  };

  useEffect(() => {
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
    userLocale,
    userTimeZone,
    trackedLocations,
    favoriteNodes,
    toggleFavoriteNode,
    getLiveTimeLeft,
    loadData,
  };
};
