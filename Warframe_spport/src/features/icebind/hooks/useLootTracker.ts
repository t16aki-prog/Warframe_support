import { useState, useEffect, useMemo } from 'react';
import type { LootTrackerState } from '../types';

export const useLootTracker = () => {
  const [tracker, setTracker] = useState<LootTrackerState>(() => {
    const saved = localStorage.getItem('icebind_tracker');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallback */
      }
    }
    return {
      weeklyClear: false,
      splicerObtained: 0,
      narinBp: false,
      narinNeuro: false,
      narinChassis: false,
      narinSystems: false,
      kuvaCount: 4,
      essenceCount: 12,
    };
  });

  useEffect(() => {
    localStorage.setItem('icebind_tracker', JSON.stringify(tracker));
  }, [tracker]);

  const trackerProgress = useMemo(() => {
    let completed = 0;
    const total = 6;
    if (tracker.narinBp) completed++;
    if (tracker.narinNeuro) completed++;
    if (tracker.narinChassis) completed++;
    if (tracker.narinSystems) completed++;
    if (tracker.kuvaCount >= 15) completed++;
    if (tracker.essenceCount >= 30) completed++;
    return Math.round((completed / total) * 100);
  }, [tracker]);

  const toggleWeeklyClear = () => {
    setTracker((prev) => ({ ...prev, weeklyClear: !prev.weeklyClear }));
  };

  const toggleBlueprint = (key: 'narinBp' | 'narinNeuro' | 'narinChassis' | 'narinSystems', val: boolean) => {
    setTracker((prev) => ({ ...prev, [key]: val }));
  };

  const updateKuva = (updater: (prev: number) => number) => {
    setTracker((prev) => ({ ...prev, kuvaCount: updater(prev.kuvaCount) }));
  };

  const updateEssence = (updater: (prev: number) => number) => {
    setTracker((prev) => ({ ...prev, essenceCount: updater(prev.essenceCount) }));
  };

  const updateSplicer = (updater: (prev: number) => number) => {
    setTracker((prev) => ({ ...prev, splicerObtained: updater(prev.splicerObtained) }));
  };

  return {
    tracker,
    trackerProgress,
    toggleWeeklyClear,
    toggleBlueprint,
    updateKuva,
    updateEssence,
    updateSplicer,
  };
};
