# モジュール化・機能分散化 設計規約 (Modular Architecture & Separation of Concerns)

本リポジトリ内のすべてのアプリケーション（`Warframe_spport`, `webapp`, `PomodoroTimer`, `War_cardGame`, `Chrono Graze`, `NetworkMonitor`, `JarvisProject` 等、および今後作成されるすべてのアプリ）において、本規約を厳格に適用します。

---

## 1. 基本原則 (Core Principles)

### ① 単一責任の原則 (Single Responsibility Principle: SRP)
- 1つのファイルには1つの関心事（1つのUIパーツ、1つのロジック、1つのドメイン機能）のみを持たせる。
- ファイル肥大化（目安: 150〜200行超）は設計のアンチパターンとみなし、直ちにサブモジュールやフック、コンポーネントへ分割する。

### ② ロジックとUIの完全分離 (Separation of Logic and UI)
- コンポーネントファイルに長大なビジネスロジック、データフェッチ、状態操作、複雑な副作用（`useEffect`）をベタ書きしない。
- ロジックや状態管理は **カスタムフック（`hooks/`）** や **サービスクラス/関数（`services/`, `utils/`）** に抽出する。
- コンポーネントは「propsやフックから受け取ったデータを表示し、イベントを委譲する」役割に徹する。

### ③ 型定義・定数の分離 (Types & Constants Separation)
- インターフェースや型定義（TypeScript）、固定データや設定定数をコンポーネントファイル内に混在させない。
- `types/` ディレクトリや各機能ディレクトリ内の `types.ts`、`constants.ts` に独立させる。

---

## 2. ディレクトリ構造の標準テンプレート (Standard Directory Structure)

各アプリケーション、特にReact/Next.js/フロントエンドアプリでは以下の粒度で分割する：

```
src/
├── components/          # 複数機能で共通して使う純粋なUI部品
│   ├── common/          # ボタン、モーダル、ローダー、タブなど
│   └── icons/
├── features/            # ドメイン・機能ごとの分割（Feature-sliced）
│   ├── [機能名]/         # 例: settings, icebind, explorer, dashboard
│   │   ├── components/  # その機能専用の分割されたサブコンポーネント
│   │   ├── hooks/       # その機能専用のカスタムフック（状態・計算・API）
│   │   ├── types.ts     # その機能専用の型定義
│   │   ├── constants.ts # その機能専用の定数・初期値
│   │   └── index.ts     # 外部公開用エントリーポイント
├── hooks/               # アプリ全体で共有するカスタムフック
├── services/            # API通信、外部サービス連携、ストレージ操作
├── utils/               # 汎用ヘルパー関数
└── types/               # アプリ全体のグローバル型定義
```

---

## 3. 具体的な分割ガイドライン

| 分割前（肥大化の兆候） | 分割後の構成 |
| :--- | :--- |
| 1つの巨大な `Settings.tsx` (500行+) | `features/settings/`<br>├ `components/ApiKeySection.tsx`<br>├ `components/VoiceSection.tsx`<br>├ `components/SyndicateRanksSection.tsx`<br>├ `components/DataCacheSection.tsx`<br>├ `hooks/useSettings.ts`<br>└ `types.ts` |
| 1つの巨大な `Icebind.tsx` (1000行+) | `features/icebind/`<br>├ `components/ModSlotGrid.tsx`<br>├ `components/BuildStatsDisplay.tsx`<br>├ `components/WeaponSelector.tsx`<br>├ `hooks/useModCalculator.ts`<br>├ `hooks/useBuildStorage.ts`<br>└ `constants/modRules.ts` |
| 巨大なダッシュボード (`Dashboard.tsx`) | `features/dashboard/`<br>├ 各ウィジェットコンポーネント（`WorldCycleWidget.tsx`, `FissuresWidget.tsx`, `SortieWidget.tsx`）<br>└ `hooks/useDashboardData.ts` |
| Python / バックエンドアプリ | `core/` (ビジネスロジック), `services/` (外部通信), `ui/` (画面描画), `models/` (データ構造) に責務を分割 |

---

## 4. エージェント/開発者の遵守事項

1. **新規作成・機能追加時**: 既存のファイルにコードを追記して肥大化させることを禁止する。新しい機能・タブ・セクションは必ず新規ファイルとして作成し、インポートして利用すること。
2. **リファクタリング時**: 既存コードを修正する際、200行を超えるファイルを見つけた場合は可能な限り機能ごとに分割・モジュール化を行うこと。
3. **後方互換性と結合度**: 分割したモジュールは `index.ts`（バレルファイル）を活用してエクスポートを整理し、既存のインポート元が壊れないように配慮すること。
