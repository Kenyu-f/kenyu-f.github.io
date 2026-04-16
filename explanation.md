# al-folio カスタマイズ説明書

このドキュメントでは、`al-folio`テーマのどのファイルを編集すると、サイトのどの部分が更新されるかをまとめています。

## 基本設定

- **サイト全体の設定**: `_config.yml`
  - サイトタイトル、名前、URL、`baseurl`（GitHub Pages用）、SNSリンクの有効化、検索機能のON/OFFなどを設定します。
- **ナビゲーションバー**: `_pages/` 内の各Markdownファイルの `nav: true` と `nav_order` で制御します。

## プロフィール（About）

- **自己紹介文**: `_pages/about.md`
- **プロフィール写真**: `assets/img/prof_pic.jpg`（または `_pages/about.md` で指定したパス）
- **SNSリンク**: `_data/socials.yml`

## ブログ・コンテンツ

- **ブログ記事**: `_posts/`
  - `YYYY-MM-DD-title.md` という形式で作成します。
- **Zibaldone**: `_zibaldone/`
  - 今回新設したセクションです。ブログと同じ形式で記事を追加できます。
- **ニュース（お知らせ）**: `_news/`
  - トップページなどに表示される短いお知らせです。
- **プロジェクト**: `_projects/`
  - ポートフォリオや研究プロジェクトの紹介です。

## 学術・専門データ

- **論文・出版物**: `_bibliography/papers.bib`
  - BibTeX形式で論文データを管理します。
- **CV (履歴書)**: `_data/cv.yml` (RenderCV形式) または `assets/json/resume.json` (JSONResume形式)
  - CVページの内容をデータ形式で管理します。
- **共同著者**: `_data/coauthors.yml`
- **学会・ジャーナル略称**: `_data/venues.yml`

## デザイン・スタイル

- **テーマカラー**: `_sass/_themes.scss` および `_sass/_variables.scss`
- **カスタムCSS**: `assets/css/` に追加するか、`_sass/` 内のファイルを編集します。

## トラブルシューティング

- **404エラー/スタイル崩れ**: `_config.yml` の `url` と `baseurl` が正しく設定されているか確認してください。
- **表示が更新されない**: ブラウザのキャッシュをクリアするか、GitHub Actionsのビルドが完了するまで待機してください。
