import { useState, useEffect } from 'react';

export const useWeeklyReset = () => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getWeeklyResetCountdown = () => {
    const d = new Date(now);
    // Warframe weekly reset: Monday 00:00 UTC
    const currentDay = d.getUTCDay(); // 0 is Sunday, 1 is Monday
    const daysUntilMonday = (1 - currentDay + 7) % 7 || 7;
    const nextMonday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + daysUntilMonday, 0, 0, 0));
    const diff = nextMonday.getTime() - now;
    if (diff <= 0) return '更新間近';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return `${days}日 ${hours}時間 ${minutes}分 ${seconds}秒`;
  };

  return { getWeeklyResetCountdown };
};
