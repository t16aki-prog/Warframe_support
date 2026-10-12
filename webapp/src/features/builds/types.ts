import type { ReactNode } from 'react';

export interface Augment {
  name: string;
  effect: string;
  syndicate: string;
}

export interface BuildData {
  itemName: string;
  augments: Augment[];
  popularBuild: {
    aura?: string;
    stance?: string;
    exilus: string;
    arcanes: string[];
    mods: string[];
    playstyle: string;
  };
}

export interface ItemDefinition {
  name: string;
  category: string;
  uniqueName: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  icon: ReactNode;
}
