import React, { useState } from 'react';
import type { IcebindTab } from './types';
import { useWeeklyReset } from './hooks/useWeeklyReset';
import { useSquadManager } from './hooks/useSquadManager';
import { useLootTracker } from './hooks/useLootTracker';
import { IcebindHeader } from './components/IcebindHeader';
import { SquadTab } from './components/SquadTab';
import { NarinTab } from './components/NarinTab';
import { StrategyTab } from './components/StrategyTab';
import { LootTrackerTab } from './components/LootTrackerTab';
import { ArchiveTab } from './components/ArchiveTab';
import { useContentArchives } from './hooks/useContentArchives';

export const Icebind: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<IcebindTab>('squad');

  const { getWeeklyResetCountdown } = useWeeklyReset();

  const {
    squad,
    duplicates,
    hasDuplicate,
    synergy,
    applyPreset,
    handleMemberChange,
    copyRecruitmentText,
    copied,
  } = useSquadManager();

  const {
    tracker,
    trackerProgress,
    toggleWeeklyClear,
    toggleBlueprint,
    updateKuva,
    updateEssence,
    updateSplicer,
  } = useLootTracker();

  const {
    archives,
    selectedArchive,
    setSelectedId,
  } = useContentArchives();

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '60px' }}>
      <IcebindHeader
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        countdown={getWeeklyResetCountdown()}
        weeklyClear={tracker.weeklyClear}
        onToggleWeeklyClear={toggleWeeklyClear}
      />

      {activeSubTab === 'squad' && (
        <SquadTab
          squad={squad}
          duplicates={duplicates}
          hasDuplicate={hasDuplicate}
          synergy={synergy}
          applyPreset={applyPreset}
          handleMemberChange={handleMemberChange}
          copyRecruitmentText={copyRecruitmentText}
          copied={copied}
        />
      )}

      {activeSubTab === 'narin' && <NarinTab />}

      {activeSubTab === 'strategy' && <StrategyTab />}

      {activeSubTab === 'tracker' && (
        <LootTrackerTab
          tracker={tracker}
          trackerProgress={trackerProgress}
          toggleBlueprint={toggleBlueprint}
          updateKuva={updateKuva}
          updateEssence={updateEssence}
          updateSplicer={updateSplicer}
        />
      )}

      {activeSubTab === 'archive' && (
        <ArchiveTab
          archives={archives}
          selectedArchive={selectedArchive}
          onSelect={setSelectedId}
        />
      )}
    </div>
  );
};
