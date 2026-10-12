# AGENTS.md - 開発・設計基本原則

このリポジトリ（および配下のすべてのアプリケーション）で作業を行うすべてのAIエージェントおよび開発者は、以下の基本原則を最優先で遵守してください。

## 必須ルール: 機能分散化とファイル分割 (Modular Architecture & SRP)
詳細規約は [.agents/rules/modular_architecture.md](file:///e:/Oasobi/.agents/rules/modular_architecture.md) を参照。

### 基本方針
1. **1ファイル1責務（単一責任の原則）**: 1つのファイルに複数の機能や巨大なUI・ロジックを詰め込んではならない（目安: 150〜200行以下）。
2. **ロジックとUIの完全分離**:
   - UIコンポーネント内に状態管理や長大な計算、データフェッチをベタ書きしない。
   - 状態・計算・外部通信は **カスタムフック (`hooks/`)** または **サービスクラス (`services/`)** に切り出す。
3. **型定義・定数の独立化**:
   - `types/` または機能別の `types.ts` に型定義を分離する。
   - 固定値・初期値・マスターデータは `constants.ts` に分離する。
4. **機能ごとのフォルダ分離 (Feature-sliced)**:
   - 各画面・大きな機能は `features/[機能名]/` にまとめ、サブコンポーネント (`components/`)、フック (`hooks/`)、型 (`types.ts`) に分割する。
   - 既存のコンポーネントインポートとの互換性を保つため、`index.ts` から主コンポーネントを再エクスポートする。
5. **全アプリへの適用**:
   - `Warframe_spport`, `webapp`, `PomodoroTimer`, `War_cardGame`, `Chrono Graze`, `NetworkMonitor`, `JarvisProject` を含むすべてのアプリに適用する。
