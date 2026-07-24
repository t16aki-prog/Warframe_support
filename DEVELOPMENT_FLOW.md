# 開発フロー (Development Flow)

このリポジトリでは、**GitHub Issue駆動開発** と **Vercel連携による自動CI/CD** を組み合わせて開発を進めます。

## 基本的なワークフロー

### 1. タスクの定義 (Issue作成)
機能追加やバグ修正を行う際は、まず GitHub に **Issue** を作成します。
- Issueを作成すると、GitHub Actions (`.github/workflows/project-automation.yml`) によって自動的に GitHub Projects（カンバンボード）の **「Todo」** カラムに追加されます。

### 2. 開発の開始 (In Progress)
Issue に着手する際は、プロジェクトボード上でステータスを **「In Progress」** に移動するか、またはブランチを作成して開発を開始します。

```bash
# 最新のmainブランチを反映
git checkout main
git pull

# 新しいブランチを作成 (例: feature/add-login)
git checkout -b feature/issue-番号-機能名
```

### 3. 実装とコミット
ローカル環境 (`webapp/`) で開発を行います。

```bash
cd webapp
npm run dev
```

変更をコミットし、GitHub にプッシュします。

```bash
git add .
git commit -m "機能の実装内容"
git push origin feature/issue-番号-機能名
```

### 4. プルリクエスト (PR) の作成
GitHub上で、作成したブランチから `main` ブランチに向けて **Pull Request (PR)** を作成します。
- PRの本文（Description）に `Closes #Issue番号` と記載すると、PRがマージされた際に元のIssueが自動的にクローズされます。
- PRを作成すると、**Vercel が自動的にプレビュー環境（Preview Deployment）を作成** します。PRの画面にプレビュー用のURLが発行されるため、本番環境にマージする前に実際のブラウザで動作確認が可能です。

### 5. レビューとマージ (本番デプロイ)
レビューが完了し、PRを `main` ブランチにマージします。
- PRがマージされると、**Vercel が自動的に本番環境（Production）へデプロイ** します。
- 同時に、元の Issue が自動的にクローズされ、GitHub Projects のステータスも **「Done」** に移動します。

---

## 連携サービスの確認ポイント

- **GitHub Projects**: タスク（Issue）の進捗状況をチームで可視化するためのボード。
- **Vercel**: Next.jsアプリケーションのホスティング環境。PRごとのプレビューと、`main` へのマージ時の本番デプロイを自動で行います。
