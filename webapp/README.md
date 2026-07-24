# Web App (Next.js) - 開発・デプロイ環境

このプロジェクトは [Next.js](https://nextjs.org) で構築されたWebアプリケーションです。

## ローカル開発の開始

開発サーバーを起動するには、以下のコマンドを実行します。

```bash
npm run dev
# または
yarn dev
# または
pnpm dev
# または
bun dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、結果を確認してください。

ページの編集は `src/app/page.tsx` から始めることができます。ファイルを保存すると自動的にブラウザが更新されます。

---

## Vercel へのデプロイメント (自動公開の設定)

このプロジェクトは、Next.js の開発元である [Vercel プラットフォーム](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) へ最も簡単にデプロイできるよう設計されています。

### 初期連携手順

1. **Vercel アカウントの作成**: [Vercel](https://vercel.com/) にアクセスし、GitHub アカウントを使用してサインイン（登録）します。
2. **新しいプロジェクトの追加 (Add New Project)**:
   - ダッシュボードの「Add New...」>「Project」をクリックします。
   - 「Import Git Repository」から、このプロジェクトが含まれている GitHub リポジトリ（例: `Oasobi`）を選択して「Import」をクリックします。
3. **プロジェクトの設定**:
   - **Framework Preset**: `Next.js` が自動で選択されます。
   - **Root Directory**: `webapp`（または Next.js を初期化したディレクトリ名）を指定します。これを行わないとルートの別ファイルが読まれてエラーになります。
   - **Environment Variables**: もし `.env` ファイルに環境変数を設定している場合（APIキーなど）、ここで全て入力してください。
4. **Deploy**: 「Deploy」ボタンをクリックすると、初回のビルドと公開が自動で始まります。

### CI/CD フロー (自動デプロイ)

一度連携を行うと、以降は以下のフローが自動化されます。

- **プレビュー環境**: 新しいブランチを作成し GitHub 上で PR（Pull Request）を作成すると、Vercel が自動的にその PR 用のプレビューURLを発行します。
- **本番環境**: PR を `main` ブランチにマージ（または `main` ブランチに直接プッシュ）すると、自動的に本番環境のURLへデプロイされます。

詳細な Next.js のデプロイ方法については、[Next.js デプロイメント・ドキュメント](https://nextjs.org/docs/app/building-your-application/deploying) を参照してください。
