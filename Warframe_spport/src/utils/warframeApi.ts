// Warframe World State API Client

const WORLD_STATE_URL = 'https://api.warframestat.us/pc?language=ja';

export interface WorldState {
  cetusCycle: {
    id: string;
    expiry: string;
    activation: string;
    isDay: boolean;
    state: string;
    timeLeft: string;
  };
  vallisCycle: {
    id: string;
    expiry: string;
    isWarm: boolean;
    state: string;
    timeLeft: string;
  };
  cambionCycle: {
    id: string;
    expiry: string;
    activation: string;
    state: string; // 'vome' or 'fass'
    active: string;
    timeLeft: string;
  };
  duviriCycle: {
    id: string;
    expiry: string;
    state: string; // 'joy', 'anger', 'fear', 'sorrow', 'envy'
    choices: Array<{
      category: string;
      choices: string[];
    }>;
    timeLeft: string;
  };
  fissures: Array<{
    id: string;
    node: string;
    missionType: string;
    enemy: string;
    tier: string;
    tierNum: number;
    expired: boolean;
    eta: string;
    activation: string;
    expiry: string;
    isHard?: boolean;
  }>;
  voidTrader: {
    id: string;
    activation: string;
    expiry: string;
    character: string;
    location: string;
    inventory: Array<{
      item: string;
      ducats: number;
      credits: number;
    }>;
    active: boolean;
    startString: string;
    endString: string;
  };
  vaultTrader: {
    id: string;
    inventory: Array<{
      item: string;
      ducats: number | null;
      credits: number | null;
    }>;
    schedule: Array<{
      expiry: string;
      item: string;
    }>;
  };
  archonHunt: {
    id: string;
    activation: string;
    expiry: string;
    boss: string;
    faction: string;
    missions: Array<{
      node: string;
      type: string;
    }>;
  };
  nightwave: {
    id: string;
    activation: string;
    expiry: string;
    season: number;
    activeChallenges: Array<{
      id: string;
      title: string;
      desc: string;
      reputation: number; // API uses 'reputation'
      isDaily: boolean;
      isElite: boolean;
    }>;
  };
  steelPath: {
    activation: string;
    expiry: string;
    currentReward: {
      name: string;
      cost: number;
    };
  };
  syndicateMissions: Array<{
    id: string;
    activation: string;
    expiry: string;
    syndicate: string;
    syndicateKey: string;
    nodes: string[];
    jobs: Array<{
      id: string;
      rewardPool: string[];
      type: string;
      enemyLevels: number[];
      standingStages: number[];
      minMR: number;
    }>;
  }>;
  sortie: {
    id: string;
    activation: string;
    expiry: string;
    boss: string;
    faction: string;
    variants: Array<{
      boss: string;
      missionType: string;
      modifier: string;
      modifierDescription: string;
      node: string;
    }>;
  };
}

export async function fetchWorldState(): Promise<WorldState | null> {
  try {
    const response = await fetch(WORLD_STATE_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as WorldState;
  } catch (error) {
    console.error('Failed to fetch Warframe world state:', error);
    return null;
  }
}
