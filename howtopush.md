# GitHubへの反映手順 (Push Guide)

このリポジトリ（kenyu-f.github.io）で行った変更を保存し、公開サイトに反映させるための基本的な手順です。

## 1. 変更内容の確認
まず、どのファイルが変更されたかを確認します。
```bash
git status
```

## 2. 変更のステージング
変更したファイルをコミット対象に追加します。すべての変更を追加する場合は以下を実行します。
```bash
git add .
```

## 3. コミットの作成
変更内容に対する説明（コミットメッセージ）を付けて保存します。
```bash
git commit -m "Fix configuration and add zibaldone section"
```

## 4. GitHubへ送信 (Push)
ローカルの変更をGitHubのサーバーに送信します。
```bash
git push origin main
```

## 5. 公開状況の確認
1. **GitHub Actions**: リポジトリの「Actions」タブを開き、ビルド（Deploy site）が完了するのを待ちます（通常3〜5分）。
2. **サイトの確認**: [https://kenyu-f.github.io](https://kenyu-f.github.io) を開き、変更が反映されているか確認します。

---

### 注意点
- **Prettierエラー**: GitHub Actionsでビルドが失敗する場合、多くはコードの整形（フォーマット）が原因です。その場合は、プッシュ前に以下を実行してください。
  ```bash
  npx prettier . --write
  git add .
  git commit -m "Format code with prettier"
  git push origin main
  ```
- **gh-pagesブランチ**: このリポジトリでは `main` ブランチを編集します。`gh-pages` ブランチはビルド後に自動生成されるため、直接編集しないでください。
