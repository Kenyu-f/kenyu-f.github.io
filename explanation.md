# al-folio 構成ドキュメント & カスタマイズガイド

このドキュメントでは、Kenyu FUJIMOTO のポートフォリオサイト（al-folio テーマ）の設計構造、各ファイルの役割、および編集方法について詳説します。

---

## 1. コア・コンフィギュレーション (Core Configuration)

サイト全体の挙動やメタデータは `_config.yml` で定義されます。

| パラメータ | 説明 | 編集対象ファイル |
| :--- | :--- | :--- |
| `title`, `first_name`, `last_name` | 氏名とサイトタイトル。 | `_config.yml` |
| `url`, `baseurl` | デプロイ先URL。スタイル崩れ時はここを最初に見る。 | `_config.yml` |
| `scholar` | 論文リストでの著者ハイライト設定。 | `_config.yml` |
| `enable_darkmode` | ダークモードの切り替えスイッチ。 | `_config.yml` |

---

## 2. ページ構造 (Page Structure)

ナビゲーションバーに表示される各ページは `_pages/` ディレクトリに格納されています。

- **ディレクトリ**: `_pages/`
- **制御方法**: フロントマター（ファイル先頭の `---` で囲まれた部分）
  - `nav: true`: ナビゲーションバーに表示する。
  - `nav_order: 1`: 表示順序。

### 主要ページ
- `about.md`: ホームページ兼プロフィール。`subtitle` や `profile` オプションを編集。
- `cv.md`: 履歴書ページ。実データは `_data/cv.yml` にあります。
- `repositories.md`: GitHubリポジトリ表示設定。

---

## 3. データ駆動型コンテンツ (Data-driven Content)

特定のフォーマットに従って `_data/` 内のファイルを編集することで、ページ内容を更新します。

### CV (履歴書)
- **ファイル**: `_data/cv.yml`
- **構造**: `sections` 以下に各カテゴリを配列形式で記述します。
  - `Languages`: 語学力。
  - `Interests`: 興味・関心分野。

### SNS・連絡先
- **ファイル**: `_data/socials.yml`
- **役割**: アイコンとリンクの対応。`enabled: true` で表示されます。

### リポジトリ
- **ファイル**: `_data/repositories.yml`
- **役割**: 表示したい GitHub ユーザー名や特定のリポジトリを指定します。

---

## 4. コレクション (Collections)

時系列データや個別の記事を管理する仕組みです。

| コレクション | ディレクトリ | ファイル形式 | 概要 |
| :--- | :--- | :--- | :--- |
| **Blog** | `_posts/` | `YYYY-MM-DD-title.md` | 定期的なブログ記事。 |
| **Projects** | `_projects/` | `name.md` | 研究や開発プロジェクトの紹介。 |
| **Teaching** | `_teachings/` | `course.md` | 講義資料や教育実績。 |
| **News** | `_news/` | `announcement.md` | 短いお知らせ（Aboutページ等に表示）。 |
| **Bookshelf** | `_books/` | `book.md` | 読書記録、レビュー。 |

---

## 5. 出版物管理 (Publications)

学術的な出版物は BibTeX 形式で一括管理されます。

- **データベース**: `_bibliography/papers.bib`
- **表示制御**: 各エントリーに `selected={true}` を加えると、Aboutページの「Selected Publications」に表示されます（有効な場合）。

---

## 6. スタイルとテーマ (Styling)

デザインの微調整は SCSS で行います。

- **テーマカラー**: `_sass/_themes.scss`
  - `:root` 内の `--global-theme-color` などを変更します。
- **変数定義**: `_sass/_variables.scss`
  - 色の定義やフォントサイズの設定。

---

## 7. メンテナンス・デプロイ

- **画像の追加**: `assets/img/` に保存。
- **PDFの追加**: `assets/pdf/` に保存。
- **更新の反映**: GitHub へ `push` すると GitHub Actions が走り、自動的に `gh-pages` ブランチへビルド結果が反映されます。反映には 3〜5 分程度かかります。
