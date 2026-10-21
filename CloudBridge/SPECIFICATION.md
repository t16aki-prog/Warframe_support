# CloudBridge (OneDrive to Google Drive Safe Relayer) 仕様書

## 1. 概要
**CloudBridge** は、ローカルPCの限られたストレージ容量を考慮し、ローカルディスクを一時バッファ（ステージング領域）として利用しながら、OneDrive上のオンデマンドファイルをGoogle Driveへ安全かつ確実にパイプライン転送するデスクトップWebアプリケーションです。

---

## 2. コア設計思想
1. **ローカル容量ガード (Buffer & Free Space Guard)**:
   - ユーザーが指定した「バッファ容量上限」（例: 2GB, 5GB, 10GB）および「最小空きディスク容量」（例: 5GB）を厳格に順守。
   - 上限を超える場合は一度アップロードと検証を完了させてローカルバッファを削除・解放してから、後続のダウンロードを実行。
2. **多段階の整合性検証 (Strict Verification)**:
   - Google Drive APIから返却される `id`、`size`、`md5Checksum` と、ローカルファイルのサイズおよびMD5ハッシュ値を厳密に照合。
   - 完全一致が証明された場合のみ、ローカル一時ファイルを削除して容量を解放。
3. **即時停止＆フェイルセーフ (Fail-Safe Emergency Stop)**:
   - 通信エラー、ハッシュ不一致、APIエラー、容量枯渇等の異常発生時は、**即座に全パイプラインを緊急停止**。
   - 原因・対象ファイル・スタックトレースを明瞭にログおよび画面に表示。
   - ユーザーによる手動即時停止（Abort）にも即座に応答。
4. **OneDrive元ファイルの保護**:
   - 移行完了後もOneDrive側の元ファイルは一切変更・削除せず、安全なバックアップ・移行モードを維持。
5. **モジュール化アーキテクチャ (Modular Architecture)**:
   - `core/`, `services/`, `models/`, `ui/` に完全分離し、各ファイルは単一責任の原則（150〜200行以下）を徹底。

---

## 3. システムアーキテクチャ
```
CloudBridge/
├── core/
│   ├── pipeline.py         # パイプライン制御（ダウンロード→アップロード→検証→解放ループ）
│   ├── buffer_manager.py  # 一時バッファ容量計算・空き容量監視・安全削除
│   ├── verifier.py        # MD5ハッシュ照合・Google Driveメタデータ検証
│   ├── state_manager.py   # 進捗・状態管理・イベント通知
│   └── database.py        # 転送台帳SQLite（二重転送防止・レジューム）
├── services/
│   ├── onedrive_service.py # OneDrive走査・オンデマンド検出・ステージング
│   ├── gdrive_service.py   # Google Drive API v3・OAuth2・フォルダ作成・チャンク転送
│   └── logger_service.py   # 詳細ログ出力・WebUIリアルタイムストリーミング
├── models/
│   ├── transfer_item.py    # 転送対象モデル・ステータスenum
│   └── config.py           # アプリケーション設定モデル
├── ui/
│   ├── static/
│   │   ├── css/style.css   # ネオン・ダークモード・グラスモフィズムCSS
│   │   └── js/             # api.js, ui.js, app.js
│   └── templates/
│       └── index.html      # ダッシュボード画面
├── constants.py            # 定数・初期値・エラーコード
└── main.py                 # エントリーポイント
```

---

## 4. 画面・機能要件
- **ストレージ容量ゲージ**:
  - ローカル一時バッファ使用率（現在使用量 / 上限設定値）
  - ローカルPCの空きディスク容量（リアルタイム監視）
  - 全体転送進捗（処理済み / 総ファイル数・容量）
- **転送キューモニター**:
  - ファイルごとの状態（待機、ダウンロード中、アップロード中、検証中、完了、エラー）
  - Google Drive File ID、MD5ハッシュ、サイズ、所要時間
- **リアルタイムログターミナル**:
  - カラーコード化されたログ（INFO, SUCCESS, WARN, ERROR）
  - 自動スクロール・即時停止メッセージ
- **コントロール**:
  - 開始、一時停止、即時停止（緊急停止）、リセット
- **設定パネル**:
  - OneDrive同期フォルダパス選択
  - Google Drive宛先フォルダID/名前
  - バッファ容量上限設定（GB/MB）
  - 最小空き容量ガード設定
