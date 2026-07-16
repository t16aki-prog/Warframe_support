# プロジェクトの参考資料および引用元記録 (References & Citations)

本アプリケーション（TENNO NAVI / Ordis Chat システム）を製作するうえで参考・引用した主なサイト、API仕様書、およびドキュメントの一覧です。
どの技術や情報を、アプリのどの部分（ファイル・機能）にどのように組み込んでいるかを記録しています。

---

## 1. Warframe 公式データ・非公式API群

### [Warframestat API](https://docs.warframestat.us/)
*   **引用・利用箇所**: 
    *   `src/utils/warframeApi.ts`
    *   `warframeData.js` (バックエンド)
    *   `src/components/Dashboard.tsx`
    *   `src/components/DataExplorer.tsx`
*   **利用内容**:
    *   Digital Extremes社が提供するWarframeのゲーム内データをパースして公開しているコミュニティAPIです。
    *   **World State機能**: シータスの昼夜、オーブ渓谷の気候、デュヴィリのスパイラル、Void亀裂、Baro Ki'Teer（バロ吉）の到着日時、ナイトウェーブの終了予定などをリアルタイムに取得してダッシュボードに表示しています。
    *   **Items & Drops機能**: バックエンドの `warframeData.js` にて、巨大なJSONデータをサーバーのキャッシュとして読み込み、レリックのドロップ率、Warframeパーツの取得先、Vault（格納）入りしたPrimeアイテムの特定に使用しています。

---

## 2. AI・機械学習関連 (生成AIプラットフォーム)

### [Google Gemini API (Google AI for Developers)](https://ai.google.dev/docs)
*   **引用・利用箇所**: 
    *   `ordisAi.js`
    *   `src/utils/gemini.ts`
*   **利用内容**:
    *   **System Instructions (システムプロンプト)**: 公式ドキュメントのペルソナ設定ガイドラインを参考に、AIに「Cephalon Ordis（セファロン・オーディス）」の狂気を帯びた人格を付与し、ゲーム内用語（テンノ、オービターなど）を使った会話ルールを定義しました。
    *   **Function Calling (関数呼び出し機能)**: AIが「リアルタイムのデータベース」にアクセスするための手法として採用。Ordisが質問を受けた際、自律的に `search_relic` や `get_vaulted_primes` などの関数を実行し、正確なドロップ情報を返答する仕組みを構築しました。

---

## 3. 音声・ブラウザAPI (Web標準機能)

### [Web Speech API (MDN Web Docs)](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)
*   **引用・利用箇所**: 
    *   `src/components/OrdisChat.tsx`
*   **利用内容**:
    *   **SpeechSynthesis (音声合成)**: AIが生成したOrdisのテキストをブラウザ上で読み上げさせるために使用。Ordis特有の「バグ（狂気）の割り込み」を表現するため、正規表現でテキストを分割し、バグ部分の `pitch` (ピッチ) を低く、`rate` (速度) を速くする処理を実装しています。
    *   **SpeechRecognition (音声認識)**: ユーザーがマイクに向かって「Hi オーディス」と呼びかけたことを検知（ウェイクワード検知）し、そこから音声をテキスト化してGeminiへ送信するハンズフリーチャット機能の中核として実装しています。

### [Web Audio API (MDN Web Docs)](https://developer.mozilla.org/ja/docs/Web/API/Web_Audio_API)
*   **引用・利用箇所**: 
    *   `src/components/OrdisChat.tsx` (`playBeep` 関数)
*   **利用内容**:
    *   Ordisがウェイクワードを認識した際に鳴る「ピピッ」というSFチックな電子音（ビープ音）を、外部の音声ファイルを使わず、ブラウザのオシレーター（正弦波: 880Hz）を用いて動的に生成・再生するために使用しました。

### [Intl.supportedValuesOf() (MDN Web Docs)](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf)
*   **引用・利用箇所**: 
    *   `src/components/Settings.tsx`
    *   `src/components/Dashboard.tsx` (タイムゾーン計算)
*   **利用内容**:
    *   システム設定における「言語と地域設定」にて、世界地図に登録されているすべての国・地域（IANA Time Zone Database）のリストを取得するために使用。取得したタイムゾーンを `Date.prototype.toLocaleString()` に渡すことで、ダッシュボードでの正確な時差計算を実現しています。

---

## 4. UIフレームワーク・ライブラリ

### [React & Vite 公式ドキュメント](https://react.dev/) / [Vite](https://vitejs.dev/)
*   **引用・利用箇所**: 
    *   フロントエンド基盤全般 (`App.tsx` 等)
*   **利用内容**:
    *   SPA（シングルページアプリケーション）の構築と、`useState` / `useEffect` を用いた状態管理やタイマー（ダッシュボードのリアルタイムカウントダウン機能など）の実装ルールを参考にしています。

### [Lucide React (アイコンライブラリ)](https://lucide.dev/)
*   **引用・利用箇所**: 
    *   ほぼ全てのコンポーネントファイル
*   **利用内容**:
    *   UIの視認性を高めるため、WarframeのSF世界観に合うシンプルでクリーンなSVGアイコンセットをインポートして利用しています。

### [Socket.IO 公式ドキュメント](https://socket.io/docs/v4/)
*   **引用・利用箇所**: 
    *   `server.js`
    *   `src/components/LocalChat.tsx`
*   **利用内容**:
    *   ユーザー同士が通信できる「ローカルチャット機能」を実現するための、WebSocketによる双方向リアルタイム通信のアーキテクチャ設計に利用しています。

---
*※ 本アプリはファンメイドツールであり、Warframeの著作権や登録商標はDigital Extremes Ltd.に帰属します。*
