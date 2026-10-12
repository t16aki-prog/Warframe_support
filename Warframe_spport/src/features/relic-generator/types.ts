export interface RelicGeneratorProps {
  navState?: any;
  clearNavState?: () => void;
}

export interface TableItem {
  query: string;
  data: any;
}

export interface RelicDropItem {
  relic: string;
  chance: number;
  rarity: string;
  isVaulted: boolean;
}
