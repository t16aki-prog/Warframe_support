import { useState, useEffect, useMemo } from 'react';
import type { SquadMember, SynergyInfo } from '../types';
import { DEFAULT_SQUAD, PRESET_CRYO_SQUAD, PRESET_BURST_SQUAD } from '../constants';

export const useSquadManager = () => {
  const [squad, setSquad] = useState<SquadMember[]>(() => {
    const saved = localStorage.getItem('icebind_squad');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        /* fallback */
      }
    }
    return DEFAULT_SQUAD;
  });

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('icebind_squad', JSON.stringify(squad));
  }, [squad]);

  // Duplicate Check
  const duplicates = useMemo(() => {
    const counts: Record<string, number> = {};
    squad.forEach((m) => {
      const clean = m.frame.trim().toLowerCase();
      if (clean) counts[clean] = (counts[clean] || 0) + 1;
    });
    const dupFrames = new Set<string>();
    Object.entries(counts).forEach(([f, count]) => {
      if (count > 1) dupFrames.add(f);
    });
    return dupFrames;
  }, [squad]);

  const hasDuplicate = duplicates.size > 0;

  // Synergy Analysis
  const synergy: SynergyInfo = useMemo(() => {
    const roles = squad.map((s) => s.role);
    const frames = squad.map((s) => s.frame.toLowerCase());

    const hasArmorStrip =
      roles.includes('Armor Strip') ||
      frames.some((f) => ['styanax', 'frost', 'narin', 'nekros', 'ash', 'dagath', 'caliban', 'mag'].includes(f));

    const hasSurvival =
      roles.includes('Survival') ||
      frames.some((f) => ['dante', 'revenant', 'wisp', 'trinity', 'citrine', 'harrow', 'rhino'].includes(f));

    const hasCC =
      roles.includes('CC') ||
      frames.some((f) => ['frost', 'nova', 'narin', 'khora', 'vauban', 'limbo', 'sevagoth', 'gloom'].includes(f));

    const hasEnergy =
      roles.includes('Energy') ||
      frames.some((f) => ['citrine', 'styanax', 'wisp', 'harrow', 'protea', 'voruna'].includes(f));

    const hasDPS =
      roles.includes('DPS') ||
      frames.some((f) => ['narin', 'saryn', 'mesa', 'kullervo', 'mirage', 'dagath', 'excalibur', 'gauss'].includes(f));

    const vazarinCount = squad.filter((s) => s.focus === 'Vazarin').length;

    let score = 0;
    if (hasArmorStrip) score += 25;
    if (hasSurvival) score += 25;
    if (hasCC) score += 20;
    if (hasEnergy) score += 15;
    if (hasDPS) score += 15;

    return {
      hasArmorStrip,
      hasSurvival,
      hasCC,
      hasEnergy,
      hasDPS,
      vazarinCount,
      score: Math.min(100, score),
    };
  }, [squad]);

  const applyPreset = (type: 'balanced' | 'cryo' | 'burst') => {
    if (type === 'balanced') {
      setSquad(DEFAULT_SQUAD);
    } else if (type === 'cryo') {
      setSquad(PRESET_CRYO_SQUAD);
    } else if (type === 'burst') {
      setSquad(PRESET_BURST_SQUAD);
    }
  };

  const handleMemberChange = (id: number, field: keyof SquadMember, value: any) => {
    setSquad((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  };

  const copyRecruitmentText = () => {
    const frameList = squad.map((s) => s.frame).join(', ');
    const emptySlots = 6 - squad.filter((s) => s.frame).length;
    const text = `【Warframe】氷河の縛り(The Icebind) 6人分隊募集！\n現在の構成: ${frameList}\n募集枠: ${emptySlots > 0 ? `@${emptySlots}名 (装甲剥ぎ/Vazarin推奨)` : '満員確認中'}\n重複判定: ${hasDuplicate ? '要調整' : '重複なし(出撃可能)'} / 参加希望の方は返信またはウィスパーください！`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return {
    squad,
    duplicates,
    hasDuplicate,
    synergy,
    applyPreset,
    handleMemberChange,
    copyRecruitmentText,
    copied,
  };
};
