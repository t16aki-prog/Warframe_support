// Warframe_spport/src/features/multiplayer/types.ts

export type LobbyType = 'standard' | 'narin';
export type LobbyStatus = 'recruiting' | 'full' | 'departed' | 'closed';

export interface LobbyMember {
  socketId: string;
  username: string;
  inGameName: string;
  warframe: string;
  isHost: boolean;
  ready: boolean;
  joinedAt: number;
}

export interface LobbyMessage {
  id: string;
  username: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface Lobby {
  id: string;
  type: LobbyType;
  title: string;
  missionCategory: string;
  targetMission: string;
  narinRulePreset?: string;
  narinRuleDescription?: string;
  maxMembers: number;
  members: LobbyMember[];
  status: LobbyStatus;
  description: string;
  createdAt: number;
  messages: LobbyMessage[];
}

export interface CreateLobbyFormInput {
  type: LobbyType;
  title: string;
  missionCategory: string;
  targetMission: string;
  narinRulePreset: string;
  narinRuleDescription: string;
  maxMembers: number;
  inGameName: string;
  warframe: string;
  description: string;
}

export type ActiveFilterTab = 'all' | 'standard' | 'narin';
