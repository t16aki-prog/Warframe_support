export type DataExplorerTab = 'relics' | 'warframes' | 'vaulted' | 'augments' | 'resources' | 'mods';

export interface DataExplorerProps {
  navState?: any;
  clearNavState?: () => void;
}

export type WishlistType = 'relic' | 'part' | 'frame' | 'resource';
