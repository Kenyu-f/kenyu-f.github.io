# サイト構造

## 1. ディレクトリ構造の概要

\`\`\`text
.
├── astro.config.mjs      # Astroの設定ファイル（インテグレーション、マークダウン）
├── package.json           # プロジェクトの依存関係
├── public/                # 静的アセット（画像、ファビコンなど）
└── src/                   # ソースコード
    ├── components/        # 再利用可能なコンポーネント
    ├── content/           # 実際のコンテンツ（マークダウンファイル）
    ├── layouts/           # ページの骨組み（レイアウト）
    ├── pages/             # サイトの各ページ（ルーティング）
    ├── consts.ts          # サイト全体の定数（タイトル、ナビゲーション）
    └── content.config.ts  # コンテンツのデータ構造定義（スキーマ）
\`\`\`

## 2. 対応表

### 基本情報
*   **場所**: \`src/consts.ts\`
*   **内容**: \`SITE_TITLE\`, \`SITE_DESCRIPTION\`, \`NAV_LINKS\`, \`FOOTER_LINKS\`
*   **影響**: ヘッダーのタイトル、メタデータ、ナビゲーションメニューの内容が全ページで更新される。

### 共通デザイン
*   **場所**: \`src/layouts/BaseLayout.astro\`
*   **内容**: \`<style is:global>\` 内の CSS 変数（フォント、色、最大幅）や HTML の基本構造。
*   **影響**: フォントの種類、背景色、リンクの下線スタイルetc...

### 追加できる系のコンテンツ
このサイトは **Content Collections** を使用しています。
*   **ブログ記事**: \`src/content/blog/\` に \`.md\` または \`.mdx\` を追加。
*   **論文・出版物**: \`src/content/publications/\` にファイルを追加。
*   **プロジェクト**: \`src/content/projects/\` にファイルを追加。
*   **講義・教育**: \`src/content/teaching/\` にファイルを追加。
*   **注意**: 各ファイルの先頭（Frontmatter）には、\`src/content.config.ts\` で定義された形式に従ってメタデータを記述しなきゃいけない。

### メタデータ系
*   **場所**: \`src/content.config.ts\`
*   **内容**: 各コレクションの \`schema\` 定義。
*   **影響**: 例えば「ブログ記事にサムネイル画像を追加したい」場合は、ここで \`thumbnail: z.string().optional()\` のように定義を追加する。

### 個別のページ
*   **トップページ**: \`src/pages/index.astro\`
*   **ブログ一覧**: \`src/pages/blog/index.astro\`
*   **記事詳細ページ**: \`src/pages/blog/[...slug].astro\`
*   **影響**: データの取得方法や、各項目がどのように画面に配置されるかを変更できる。

## 3. KaTeX関係
\`astro.config.mjs\` で \`remark-math\` と \`rehype-katex\` が設定できる。
マークダウンファイル内で \`\$E=mc^2\$\` や \` \$\$ ... \$\$ \` の形式で記述することで、KaTeX による数式表示が可能。
スタイルの制御は \`src/layouts/BaseLayout.astro\` で読み込まれている KaTeX の CSS に依存する。
