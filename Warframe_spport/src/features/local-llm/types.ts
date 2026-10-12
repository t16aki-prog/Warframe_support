export interface OllamaStatus {
  running: boolean;
  models: string[];
  chatModel: string;
  embedModel: string;
  chatModelReady: boolean;
  embedModelReady: boolean;
}

export interface KnowledgeSummary {
  totalDocs: number;
  worldstateDocs: number;
  patchNoteDocs: number;
  buildDocs: number;
  embedded: number;
  lastFetched: { worldstate?: number; patchnotes?: number };
}

export interface LlmStatus {
  ollama: OllamaStatus;
  knowledge: KnowledgeSummary;
  generating: boolean;
}

export type DraftKind = 'latest-content' | 'patch-summary' | 'build';
export type DraftStatus = 'pending' | 'approved' | 'rejected';

export interface Draft {
  id: string;
  kind: DraftKind;
  title: string;
  body: string;
  sources: { title: string; url?: string }[];
  status: DraftStatus;
  createdAt: string;
  reviewedAt?: string;
  model: string;
}
