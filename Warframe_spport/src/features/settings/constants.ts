import type { SyndicateItem, ExtensionItem } from './types';

export const DEFAULT_SYNDICATE_RANKS: Record<string, number> = {
  'Ostrons': 5,
  'Solaris United': 5,
  'Entrati': 5,
  'The Holdfasts': 5,
  'Cavia': 5,
  'The Hex': 5
};

export const SYNDICATE_LIST: SyndicateItem[] = [
  { id: 'Ostrons', label: 'オストロン (シータス)' },
  { id: 'Solaris United', label: 'ソラリス連合 (フォーチュナー)' },
  { id: 'Entrati', label: 'エントラティ (ダイモス)' },
  { id: 'The Holdfasts', label: 'ホールドファスト (Zariman)' },
  { id: 'Cavia', label: 'カビア (サンクタム)' },
  { id: 'The Hex', label: 'The Hex (1999)' },
];

export const EXTENSION_LIST: ExtensionItem[] = [
  { id: 'beginnerguide', label: '初心者ガイド' },
  { id: 'weekly', label: 'ウィークリー情報' },
  { id: 'icebind', label: '最新コンテンツ (氷河の縛り)' },
  { id: 'syndicates', label: '中立シンジケート' },
  { id: 'builds', label: 'フレームビルド' },
  { id: 'dataexplorer', label: 'データベース検索' },
  { id: 'wishlist', label: '欲しいもの・追跡' },
  { id: 'relicgenerator', label: 'レリック表生成' },
  { id: 'tradehelper', label: 'トレードコピペ' },
  { id: 'rulesguide', label: '安全規約＆マナー' },
  { id: 'multiplayer', label: 'マルチプレイ (募集/マッチング)' },
  { id: 'cephalonai', label: 'セファロンAI' },
  { id: 'localllm', label: 'ローカルLLM (オーディス・ローカル)' }
];

export const LANGUAGE_OPTIONS = [
  { value: 'ja-JP', label: '日本語 (ja-JP)' },
  { value: 'en-US', label: 'English (en-US)' },
  { value: 'en-GB', label: 'English (en-GB)' },
  { value: 'zh-CN', label: '中文 - 簡体字 (zh-CN)' },
  { value: 'zh-TW', label: '中文 - 繁体字 (zh-TW)' },
  { value: 'ko-KR', label: '한국어 (ko-KR)' },
  { value: 'fr-FR', label: 'Français (fr-FR)' },
  { value: 'de-DE', label: 'Deutsch (de-DE)' },
  { value: 'es-ES', label: 'Español (es-ES)' },
  { value: 'ru-RU', label: 'Русский (ru-RU)' },
];
