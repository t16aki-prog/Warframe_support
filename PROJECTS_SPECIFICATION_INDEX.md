# 開発プロジェクト総合仕様書インデックス

本リポジトリおよびワークスペース（`E:\Oasobi`）内で開発・管理されている全7つのアプリケーションの仕様書一覧です。
各アプリケーションの設計は、共通設計規約 [AGENTS.md](file:///e:/Oasobi/AGENTS.md) の「単一責任の原則」「UIとロジックの完全分離」「型定義の独立」「機能分散化 (Feature-sliced)」に準拠しています。

---

## 📚 アプリケーション別仕様書一覧

| アプリケーション名 | ディレクトリ | 主な技術スタック | 概要 | 仕様書リンク |
| :--- | :--- | :--- | :--- | :--- |
| **TennoNavi (Vite版)** | `Warframe_spport/` | React 19, Vite, Express, Socket.IO, Gemini/Ollama | Warframeプレイヤー向け総合支援ツール。環境サイクル監視、レリック逆引き、マルチ募集ロビー、セファロンAI。 | [仕様書を読む](file:///e:/Oasobi/Warframe_spport/SPECIFICATION.md) |
| **TennoNavi Web (Next.js版)** | `webapp/` | Next.js (App Router), TypeScript, TailwindCSS, Vercel | TennoNaviのNext.js移植版。Vercel等へのワンクリックデプロイ、拡張トグル、BYOK型Gemini連携。 | [仕様書を読む](file:///e:/Oasobi/webapp/SPECIFICATION.md) |
| **猫カフェ・ポモドーロ** | `PomodoroTimer/` | Python (Tkinter), Next.js (Web Worker), Google Calendar | ドット絵の猫たちが過ごすカフェを眺めながら集中するポモドーロタイマー。RGB猫ガチャ、家具ドラッグ配置、Google連携。 | [仕様書を読む](file:///e:/Oasobi/PomodoroTimer/SPECIFICATION.md) |
| **Chrono Graze** | `Chrono Graze/` | C++20, Raylib / CMake, (将来: UE/Godot) | 弾幕手動STG × 数値インフレ・放置自動化。ジャスト回避（グレイズ20倍）、ボス確定ダウン、ステージゴースト自動周回。 | [仕様書を読む](file:///e:/Oasobi/Chrono%20Graze/SPECIFICATION.md) |
| **NetMonitor** | `NetworkMonitor/` | Python, Tkinter, psutil | 枠なし・半透明・最前面常駐型の軽量ネットワークモニター。リアルタイム送受信速度、最大速度記録、低速赤色警告。 | [仕様書を読む](file:///e:/Oasobi/NetworkMonitor/SPECIFICATION.md) |
| **J.A.R.V.I.S.** | `JarvisProject/` | Python, Gemini 1.5, Edge-TTS, DuckDuckGo | 音声対話型AIアシスタント。完全ハンズフリー、Keitaニューラル音声合成、DuckDuckGoリアルタイム検索連携。 | [仕様書を読む](file:///e:/Oasobi/JarvisProject/SPECIFICATION.md) |
| **War Card Game** | `War_cardGame/` | TypeScript, React / Vite (設計策定) | トランプ対戦ゲーム「戦争（War）」。3Dカード反転、WAR発生演出、山札総取り、HP制カジュアルモード。 | [仕様書を読む](file:///e:/Oasobi/War_cardGame/SPECIFICATION.md) |

---

## 📐 共通アーキテクチャ・開発基本原則

すべてのアプリケーションは以下の原則に基づいて開発・リファクタリングを進行します：

1. **1ファイル1責務（単一責任の原則 / SRP）**:
   * 目安: 150〜200行以下に抑え、関心の分離を徹底。
2. **ロジックとUIの完全分離**:
   * UIコンポーネント内に重い計算・ステートマシン・API通信を混在させない。
   * フロントエンドはカスタムフック (`hooks/`)、バックエンド/スクリプトはサービスクラス・エンジンクラス (`core/`, `services/`) に集約。
3. **型定義・定数の独立化**:
   * `types/` または `types.ts`、`constants/` または `constants.ts` に切り分け、マジックナンバーを排除。
4. **機能ごとのフォルダ分離 (Feature-sliced)**:
   * 画面・ドメイン単位でディレクトリを自己完結化。
