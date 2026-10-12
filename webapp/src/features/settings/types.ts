export interface SettingsProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  voiceSource?: string;
  setVoiceSource?: (source: string) => void;
  voicevoxUrl?: string;
  setVoicevoxUrl?: (url: string) => void;
  voicevoxSpeaker?: number;
  setVoicevoxSpeaker?: (speaker: number) => void;
  clipboardCopyMode?: string;
  setClipboardCopyMode?: (mode: string) => void;
  showSteelPath?: boolean;
  setShowSteelPath?: (show: boolean) => void;
  enabledExtensions?: Record<string, boolean>;
  setEnabledExtensions?: (ext: Record<string, boolean>) => void;
  cephalonName?: string;
  setCephalonName?: (name: string) => void;
  cephalonVoiceURI?: string;
  setCephalonVoiceURI?: (uri: string) => void;
}

export type SaveStatus = 'idle' | 'saved' | 'deleted';

export interface SyndicateItem {
  id: string;
  label: string;
}

export interface ExtensionItem {
  id: string;
  label: string;
}
