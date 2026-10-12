export type RoleType = 'DPS' | 'Armor Strip' | 'Survival' | 'CC' | 'Energy' | 'Flex';

export type IcebindTab = 'squad' | 'narin' | 'strategy' | 'tracker';

export interface SquadMember {
  id: number;
  name: string;
  frame: string;
  role: RoleType;
  focus: string;
  notes: string;
}

export interface LootTrackerState {
  weeklyClear: boolean;
  splicerObtained: number;
  narinBp: boolean;
  narinNeuro: boolean;
  narinChassis: boolean;
  narinSystems: boolean;
  kuvaCount: number;
  essenceCount: number;
}

export interface SynergyInfo {
  hasArmorStrip: boolean;
  hasSurvival: boolean;
  hasCC: boolean;
  hasEnergy: boolean;
  hasDPS: boolean;
  vazarinCount: number;
  score: number;
}

export interface CryobellModifier {
  name: string;
  danger: string;
  desc: string;
  counter: string;
}
