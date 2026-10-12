import React from 'react';
import { Calendar } from 'lucide-react';
import type { WeeklyProps } from './types';
import { useWeeklyData } from './hooks/useWeeklyData';
import { SortieCard } from './components/SortieCard';
import { ArchonHuntCard } from './components/ArchonHuntCard';
import { SteelPathCard } from './components/SteelPathCard';
import { CircuitCard } from './components/CircuitCard';
import { WeeklyNightwaveCard } from './components/WeeklyNightwaveCard';
import { BaroInventoryCard } from './components/BaroInventoryCard';

export const Weekly: React.FC<WeeklyProps> = () => {
  const { worldState, loading, error, getDaysLeft } = useWeeklyData();

  if (loading) {
    return (
      <div style={{ padding: '24px', display: 'flex', justifyContent: 'center', color: 'var(--text-color)' }}>
        <p>ウィークリー情報を読み込み中...</p>
      </div>
    );
  }

  if (error || !worldState) {
    return (
      <div style={{ padding: '24px', color: 'var(--color-danger)' }}>
        <p>{error || 'データがありません'}</p>
      </div>
    );
  }

  const { archonHunt, nightwave, steelPath, voidTrader, duviriCycle, sortie } = worldState;
  const normalCircuit = duviriCycle?.choices?.find((c) => c.category === 'normal');
  const hardCircuit = duviriCycle?.choices?.find((c) => c.category === 'hard');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar size={28} style={{ color: 'var(--color-gold)' }} />
        ウィークリー情報 (Weekly)
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <SortieCard sortie={sortie} getDaysLeft={getDaysLeft} />
        <ArchonHuntCard archonHunt={archonHunt} getDaysLeft={getDaysLeft} />
        <SteelPathCard steelPath={steelPath} getDaysLeft={getDaysLeft} />
        <CircuitCard normalCircuit={normalCircuit} hardCircuit={hardCircuit} />
        <WeeklyNightwaveCard nightwave={nightwave} />
        <BaroInventoryCard voidTrader={voidTrader} getDaysLeft={getDaysLeft} />
      </div>
    </div>
  );
};
