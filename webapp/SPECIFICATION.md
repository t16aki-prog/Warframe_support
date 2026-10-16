# TennoNavi Web (Next.js Edition) 仕様書

## 1. アプリケーション概要

### 1.1 名称・目的
* **アプリケーション名**: TennoNavi Web (Next.js Edition)
* **概要**: TPSアクションゲーム『Warframe』支援ツール「TennoNavi」のフルスタックNext.js移植版。
* **主要目的**:
  * Vercel、Cloudflare Pages等のモダンエッジ環境へのワンクリック自動デプロイの実現
  * Next.js App Routerを活用したSSR/SSG/ISRハイブリッド構成による超高速ロードとSEO最適化
  * クライアントサイドでのスタンドアロン動作（直接外部APIを安全にフェッチ、またはNext.js Route Handlersを介したプロキシ）
  * レスポンシブUI（デスクトップ、タブレット、スマートフォン）への完全適応

---

## 2. システム構成・技術スタック

### 2.1 コアテクノロジー
* **フレームワーク**: Next.js 15.x / 14.x (App Router)
* **言語**: TypeScript 5.x
* **レンダリング戦略**: 
  * クライアントサイドコンポーネント (`use client`, `AppClient.tsx`) による動的リアクティブUI
  * Route Handlers (`src/app/api/*`) によるセキュアな外部API通信・プロキシ
* **スタイリング**: TailwindCSS + PostCSS + CSS Modules / `globals.css` (ダークオロキン・近未来テーマ)
* **アイコン**: `lucide-react`
* **ホスティング・デプロイ**: Vercel (CI/CD完全自動化)

---

## 3. ディレクトリ・アーキテクチャ設計 (AGENTS.md準拠)

`AGENTS.md` のモジュラー原則に基づき、Next.js App Routerの構成とFeature-sliced設計を両立しています。

```text
webapp/
├── public/                 # 静的アセット（ファビコン、ロゴ画像等）
├── src/
│   ├── app/
│   │   ├── layout.tsx      # ルートレイアウト（メタデータ、フォント定義）
│   │   ├── page.tsx        # 動的クライアント読み込みエントリー
│   │   ├── AppClient.tsx   # メインタブ状態・レスポンシブドロワー制御
│   │   ├── globals.css     # テーマスタイル、アニメーションキーフレーム
│   │   └── api/            # Next.js サーバーレスRoute Handlers
│   │       ├── worldstate/ # Warframe公式APIのキャッシュ付き中継
│   │       └── ordis/      # セファロンAI呼び出しエンドポイント
│   ├── features/           # ドメイン別機能モジュール
│   │   ├── dashboard/      # リアルタイム環境監視・亀裂一覧
│   │   ├── weekly/         # ウィークリー・アルコン・深淵任務
│   │   ├── icebind/        # 氷河の縛り・シミュレータ
│   │   ├── syndicates/     # 各シンジケート報酬データ
│   │   ├── builds/         # ビルドエディタ＆ビューア
│   │   ├── dataexplorer/   # ゲーム内アイテム検索
│   │   ├── relicgenerator/ # レリック逆引き＆募集文生成
│   │   ├── tradehelper/    # 相場情報・チャット補助
│   │   ├── wishlist/       # 欲しいパーツの追跡リスト
│   │   ├── rulesguide/     # 初心者向け・各種システム解説ガイド
│   │   ├── multiplayer/    # 分隊募集（WebSockets / P2P対応）
│   │   └── settings/       # APIキー・拡張機能ON/OFFトグル
│   ├── components/         # 再利用可能な共通UIコンポーネント
│   ├── lib/                # ユーティリティ、APIクライアント、データキャッシュ
│   └── utils/              # 型定義、ヘルパー関数
├── next.config.ts          # Next.js設定（画像ドメイン、環境変数マッピング）
├── tsconfig.json           # TypeScriptコンパイル設定
└── package.json            # 依存関係定義
```

---

## 4. 機能要件・詳細仕様

### 4.1 プラットフォーム機能・拡張機能トグル
* **モジュール式トグルシステム**:
  * ユーザーは設定画面から「ダッシュボード」「ウィークリー」「ビルド」「レリック」「AIチャット」など各機能（Extensions）のON/OFFを個別に設定可能。
  * 設定値は `localStorage`（キー: `enabledExtensions`）に永続化され、不要な機能を隠して軽量化できる。

### 4.2 レスポンシブナビゲーション
* **デスクトップ**: 左サイドバーによる固定カテゴリ一覧表示。
* **モバイル / タブレット**: ハンバーガーメニューによるスライドイン式ドロワーナビゲーション。画面外タップでの自動クローズ。

### 4.3 セファロンAI（クライアント完結型＆API連携）
* **BYOK (Bring Your Own Key)**:
  * ユーザー自身の Google Gemini API キーをブラウザのローカルストレージ（`gemini_api_key`）に保持。
  * サーバー側でキーを保持しないため、安全にパブリックWeb（Vercel）上に無料公開可能。
* **Web Speech API**:
  * セファロンの声種・読み上げ速度のローカルカスタマイズに対応。

### 4.4 ウィッシュリスト (Wishlist) 機能
* 手に入れたいWarframeパーツ（例: Neuroptics, Chassis, Systems, Blueprint）を保存。
* レリック逆引き画面と連動し、現在所持しているレリックで開けられるかどうかを自動ハイライト。

---

## 5. デプロイ＆環境構築仕様

### 5.1 Vercel デプロイメント
1. GitHubリポジトリ連携後、Root Directory に `webapp` を指定。
2. Framework Preset: `Next.js`。
3. 自動ビルドパイプライン（PR作成でプレビューURL発行、`main`プッシュで本番公開）。
4. **リアルタイム通信（分隊募集ロビー）に関する留意点**:
   * Vercel等のサーバーレス実行環境は常駐WebSocket接続をサポートしないため、リアルタイム分隊ロビー機能を利用する場合は、独立したバックエンドサーバー（`Warframe_spport/server.js`）をRender/Railway等にホストし、環境変数 `NEXT_PUBLIC_SERVER_URL` または `VITE_SERVER_URL` に設定して接続します。他の全機能（環境サイクル、レリック、ビルド、セファロンAI等）はVercel単体で完全動作します。

### 5.2 ローカル開発
```bash
# webapp ディレクトリへ移動
cd webapp

# 依存パッケージインストール
npm install

# 開発サーバー起動（デフォルト: http://localhost:3000）
npm run dev

# プロダクションビルド検証
npm run build
npm run start
```
