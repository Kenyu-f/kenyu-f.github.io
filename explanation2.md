# kenyu-f.github.io — コード解説

このドキュメントは、リポジトリ [kenyu-f/kenyu-f.github.io](https://github.com/kenyu-f/kenyu-f.github.io) にあるコード全体を、ファイル単位で説明するものです。サイトは [Astro](https://astro.build/) で構築された静的サイトで、GitHub Pages 上でホストされる個人の学術サイト（研究・出版物・ブログなど）です。

大きく分けると次の2つの層があります。

1. **サイト本体** — ナビゲーション、レイアウト、各ページ（about / research / publications / projects / teaching / people / cv / blog）、コンテンツコレクション（Markdown管理のブログ記事・出版物など）
2. **数学的背景システム** — 各ページの背景にうっすら浮かぶ、双曲幾何学・p進幾何学・二十面体ハニカムなどの図形と数式。すべてビルド時に計算される純粋な数学関数で、クライアント側JavaScriptは一��使っていません。

---

## 目次

- [1. 全体構成とビルドの仕組み](#1-全体構成とビルドの仕組み)
- [2. 設定ファイル](#2-設定ファイル)
- [3. レイアウト (`src/layouts/`)](#3-レイアウト-srclayouts)
- [4. 共通コンポーネント (`src/components/`)](#4-共通コンポーネント-srccomponents)
- [5. 数学的背景システム](#5-数学的背景システム)
- [6. ページ (`src/pages/`)](#6-ページ-srcpages)
- [7. コンテンツコレクション (`src/content/`)](#7-コンテンツコレクション-srccontent)
- [8. デザイン・パフォーマンスの方針まとめ](#8-デザインパフォーマンスの方針まとめ)
- [9. カスタマイズの仕方](#9-カスタマイズの仕方)

---

## 1. 全体構成とビルドの仕組み

```
kenyu-f.github.io/
├── astro.config.mjs        # Astro本体の設定
├── package.json            # 依存パッケージ・npmスクリプト
├── src/
│   ├── consts.ts             # サイト全体で使う定数（タイトル・ナビゲーション等）
│   ├── content.config.ts     # コンテンツコレクションのスキーマ定義
│   ├── content/               # Markdownで書かれた実データ（ブログ記事・出版物・授業・プロジェクト）
│   ├── layouts/                # ページ全体の骨組み（HTML雛形）
│   │   ├── BaseLayout.astro
│   │   └── PostLayout.astro
│   ├── components/             # 各所で再利用される部品
│   │   ├── Header.astro / Footer.astro / PublicationItem.astro   (元からあるサイト部品)
│   │   └── MathBackground.astro / MathBackgroundMobileReveal.astro / IcosahedralHoneycomb.astro （今回追加した背景システム）
│   ├── lib/                     # 純粋な計算ロジック（数学）
│   │   ├── hyperbolicTiling.ts
│   │   ├── padicDisk.ts
│   │   ├── icosahedron.ts
│   │   └── mathBgPresets.ts
│   └── pages/                   # 実際のURLに対応するファイル（Astroのファイルベースルーティング）
└── public/                      # そのまま配信される静的ファイル（favicon, knot.webp など）
```

Astroは「ビルド時にできる限りの処理を終わらせておき、ブラウザには完成したHTML/CSSだけを渡す」思想のフレームワークです。このサイトはその思想を徹底していて、**サイト全体で`<script>`タグが1つも出力されません**（`grep -c "<script" dist/*.html` で確認済み）。アニメーションはすべてCSSの`@keyframes`だけで実現しています。

ビルドコマンドは `npm run build`（`package.json`の`"build": "astro build"`）で、`dist/`以下に静的HTMLが出力されます。`npm run dev`でローカルプレビューできます。

---

## 2. 設定ファイル

### `astro.config.mjs`

```js
export default defineConfig({
  site: 'https://kenyu-f.github.io',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
    }),
  },
});
```

- `mdx()` — Markdown内にAstro/JSXコンポーネントを埋め込めるようにする統合。
- `sitemap()` — ビルド時に`sitemap-index.xml`を自動生成。
- `remarkMath` + `rehypeKatex` — **ブログ記事本文（Markdown）の中で書いた数式（`$...$`や`$$...$$`）を、ビルド時にKaTeXでHTMLに変換する**設定。これは今回追加した背景の数式システムとは別物で、記事本文用です。

### `package.json`

主な依存関係：

| パッケージ | 役割 |
|---|---|
| `astro` | フレームワーク本体 |
| `@astrojs/mdx` | MDXサポート |
| `@astrojs/sitemap` | サイトマップ生成 |
| `@astrojs/rss` | `rss.xml`生成 |
| `katex` | 数式のHTMLレンダリング（記事本文にも、背景の数式にも使用） |
| `remark-math` / `rehype-katex` | Markdown内数式のパースとKaTeX変換 |

### `src/consts.ts`

サイトタイトル・説明文・ナビゲーションリンク（ヘッダー用の6項目、フッター用の3項目）を定義する定数ファイル。`Header.astro`と`Footer.astro`がここを参照してリンク一覧を描画します。

### `src/content.config.ts`

Astroの**コンテンツコレクション**（Markdownファイル群に型安全なスキーマを与える仕組み）の定義です。4つのコレクションがあります。

- `blog` — `title`, `description`, `date`, `updatedDate?`, `tags[]`, `draft`, `summary?`
- `publications` — `title`, `authors[]`, `date`, `year`, `abstract?`, `status`（`preprint`/`working-paper`/`published`/`in-review`）, `venue?`, `pdf?`, `doi?`, `tags[]`, `selected`
- `projects` — `title`, `description`, `startDate`, `endDate?`, `status`（`active`/`completed`/`archived`/`ongoing`）, `tags[]`, `repository?`, `demo?`, `selected`
- `teaching` — `title`, `date`, `description`, `materials[]`（`label`+`url`の配列）, `role?`, `venue?`

各コレクションは`glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/<name>" })`で該当フォルダのMarkdownを読み込みます。`publications`と`teaching`は現状ファイルが1つも無いため、ビルド時に`No files found matching`という警告が出ますが、これはエラーではなく「まだ記事がない」ことを示すだけです（該当ページは「Coming soon」等の表示にフォールバックします）。

---

## 3. レイアウト (`src/layouts/`)

### `BaseLayout.astro`

すべてのページが最終的にこの中に流し込まれる、**HTML文書の骨格**です。

- `<head>`内で、Google FontsからCormorant Garamond、CDN経由でComputer Modern Sans（CMU Sans Serif）を読み込み、CSSカスタムプロパティ（`--color-text`, `--color-bg`, `--color-link`など）でサイト全体の配色・余白・書体を定義しています。配色は白〜オフホワイト地に濃いグレーの文字、青系のリンクという、学術サイトらしい落ち着いたトーンです。
- `<body>`の中身は上から順に：
  1. `<MathBackground {...mathBg} />` — ページ全体に固定表示される、薄い数学模様の背景（後述）
  2. `<Header />`
  3. `<main><slot /></main>` — 各ページの実際のコンテンツがここに入る
  4. `<Footer />`
  5. `<MathBackgroundMobileReveal {...mathBg} />` — スマホでスクロールし切ったときだけ現れる数式ブロック（後述）
- Props: `title`, `description`, `mathBg`（省略時は`PAGE_PRESETS.home`）。`mathBg`は「このページにどの背景パターン・どの数式を出すか」を丸ごと渡すオブジェクトで、詳しくは第5章で説明します。

### `PostLayout.astro`

ブログ記事1本1本の骨組みです。`BaseLayout`をさらにラップし、記事タイトル・日付・本文（`<slot />`）・「← Back to blog」リンクを描画します。

```js
const { title, date, description, slug } = Astro.props;
const mathBg = mathBgForSlug(slug ?? title ?? '');
```

ここがポイントで、**記事ごとに背景パターンをハッシュ関数から自動生成**しています（`mathBgForSlug`は`mathBgForKey`の別名エクスポート）。記事のスラッグ（ファイル名、例: `2026-7-1`）を文字列ハッシュにかけて、双曲タイリングかp進円板か・どの{p,q}か・どの数式かを毎回同じ結果になるよう決定的に選びます。つまり同じ記事は常に同じ見た目になりますが、記事ごとに見た目は変わります。

---

## 4. 共通コンポーネント (`src/components/`)

### `Header.astro`

サイトタイトル（`consts.ts`の`SITE_TITLE`へのリンク）と、`NAV_LINKS`から生成されるナビゲーション（about / research / publications / projects / teaching / blog）。640px以上では横並び、それ未満では縦積みになります。

### `Footer.astro`

著作権表示（`© {今年} Kenyu FUJIMOTO`、年は`new Date().getFullYear()`でビルド時点の年を自動取得）と、`FOOTER_LINKS`（people / cv / rss）。

### `PublicationItem.astro`

`publications`コレクションの1件を表示するカード。年・タイトル・著者一覧・出版会場（venue）・ステータス（`published`以外は括弧書きで表示）・PDF/DOIリンクをグリッドレイアウトで並べます。`publications.astro`ページから`pub`propを受け取って使われます。

---

## 5. 数学的背景システム

ここからが、今回の一連のやり取りで追加した部分です。設計方針は一貫して

> **「ビルド時にすべて計算し、実行時はCSSアニメーションのみ」** — JavaScriptを一切使わず、GPU合成だけで軽く動かす

でした。以下、依存関係の下流（純粋な数学）から上流（実際に画面に出す部分）の順に説明します。

### 5.1 `src/lib/hyperbolicTiling.ts` — 双曲{p,q}タイリング

ポワンカレ円板モデル上に、正則{p,q}タイリング（p角形がq個ずつ頂点に集まる、双曲的な敷き詰め）をビルド時に生成する純粋関数です。

- `vertexRadius(p, q)` — 公式 `r = √(cos(π/p+π/q) / cos(π/p−π/q))` から、正{p,q}多角形の頂点までの原点からの距離（ユークリッド距離）を計算。
- `regularPolygon(p, q, rotOffset)` — 中心の1枚のタイルの頂点座標を計算。
- `geodesic(z1, z2)` — 2点を通る「双曲的な直線」（単位円に直交する円弧、または原点を通る直径）を求める。
- `reflect(z, geodesic)` — その測地線に関する鏡映（メビウス変換の一種）で点を反射させる。
- `generateTilingEdges(p, q, {depth, maxAbs, rotOffset})` — 中心のタイルから出発し、各辺について鏡映変換を繰り返すことで隣接タイルを幅優先探索的に生成。`depth`（何段階反射するか）と`maxAbs`（原点からの距離がこれを超えたタイルは打ち切り）で計算量と絵の細かさを制御。生成された辺は`Map`で重複除去され（隣接タイル同士が同じ辺を共有するため）、SVGの`<path d="...">`文字列の配列として返されます。

この関数はNode.js上（Astroのビルドプロセス内）でのみ実行され、出力は静的な文字列の配列です。ブラウザ側では一切計算しません。

### 5.2 `src/lib/padicDisk.ts` — p進的な入れ子円板

p進数体 Q_p の**超距離**（2つの球は互いに素か、一方が他方を完全に含むかのどちらかで、部分的に重なることがない）という性質を、「親円の中にp個の子円が互いに接しながら入れ子状に並ぶ」構造として視覚化したものです。

- `packChildren(cx, cy, R, p, depth, rotOffset, level, out)` — 半径`R`の円の中に、互いに接し合い、かつ親円に内接するp個の等円を配置する再帰関数。円の半径は`r = R·sin(π/p) / (1+sin(π/p))`という、円のパッキングでよく使う公式で決まります。各階層で`rotOffset`を少しずつずらし、格子状に揃って見えないようにしています。
- `generatePadicDisk(p, {depth, rotOffset})` — 上記を呼び出し、`{cx, cy, r, level}`の配列（円の中心・半径・再帰の深さ）を返します。

### 5.3 `src/lib/icosahedron.ts` — 正二十面体の3D幾何

唯一「本物の3D」を扱うモジュールです。CSSの`transform: translate3d() rotate3d()`を使えば、JavaScriptなしでもブラウザが毎フレーム3D投影を計算してくれる、という性質を利用しています。

- `icosahedronVertices()` — 黄金比 φ=(1+√5)/2 を使った古典的な構成 `(0, ±1, ±φ)`, `(±1, ±φ, 0)`, `(±φ, 0, ±1)` で12頂点を求め、外接半径1に正規化。
- `icosahedronEdgeIndices(verts)` — 頂点間の最小距離を求め、その距離にある頂点ペアをすべて辺とする（30辺になる）。
- `edgeTransform(p1, p2)` — 1本の辺を「CSSのdivで描く」ための変換パラメータを計算する、このモジュールの心臓部です。
  - 辺の中点`mid`、長さ`length`を求める。
  - div側は初期状態で「Y軸方向に伸びた棒」だと仮定し、それを目的の辺の方向`(p2-p1)`に一致させるための回転軸`axis`（外積 `(0,1,0) × 方向ベクトル`）と回転角`angleDeg`（内積から`acos`で算出）を、**ロドリゲスの回転公式**に基づいて計算。
  - CSS側では `transform: translate3d(mid) rotate3d(axis, angle)` と書くことで、「原点中心に正しい向きへ回転 → 中点へ移動」という順で変換され、棒が正確に辺の位置・向きに一致します。
- `generateIcosahedronEdges(radius)` — 指定した半径の正二十面体について、30辺すべての`EdgeTransform`を返す。

このモジュールのコメントにも明記していますが、**真の{3,5,3}二十面体ハニカム**（双曲3次元空間で正二十面体が辺のまわりに3個、頂点のまわりに12個集まる格子）は、二面角がちょうど120°になる双曲空間でしか成立せず、平坦なユークリッド空間で完結するCSSの3D変換では厳密には再現できません。ここで作っているのは、**同心円状に3枚重ねた正二十面体のワイヤーフレーム**で、ポワンカレ球体模型で見られる「境界球面に向かって小さくなっていくセル」の雰囲気を模した、正直に言えば近似的なオマージュです。

### 5.4 `src/lib/mathBgPresets.ts` — 「どのページに何を出すか」の一元管理

このファイルは計算ロジックではなく、**設定のレジストリ**です。2つの役割を担っています。

**(a) 数式プール（`FORMULAS`オブジェクト）**

ジャンルを次の5つに絞り込んであります：

1. **双曲幾何学** — ポワンカレ計量、メビウス変換、クロス比、フックス群、モジュラー群、距離公式、双曲面模型との対応式、直線の方程式、楔積を使った角度公式、H=PSL(2,R)/SO(2) など（日本語版ウィキペディアのポワンカレ円板/上半平面モデルの記事から採用）
2. **p進幾何学** — p進絶対値、Z_p の逆極限表示、超距離不等式、極大イデアル、剰余体、p⊂O_K、ガロア群、ヘンゼルの補題 など
3. **群論** — ラグランジュの定理、類等式、シローの定理、半直積
4. **表現論** — 表現の定義、指標の直交関係、Peter–Weylの定理、リー環、sl_2(C)、普遍包絡環
5. **ハイパー演算子** — テトレーション、Knuthの矢印表記、ペンテーション、ハイパー演算子の再帰定義、アッカーマン関数（必ずどこかのページに登場するよう設計）

`\mathfrak{...}`（フラクトゥール）や`\mathcal{...}`（花文字）は、実際に大学レベルの数学で標準的に使われる場面（リー環、イデアル、環の元など）だけに使うようにしています。

**(b) `MathBgConfig`型とページごとのプリセット**

```ts
export interface MathBgConfig {
  pattern: 'hyperbolic' | 'padic';
  p: number;         // 双曲: p角形の辺数 / p進: 素数の底
  q?: number;         // 双曲のみ: 頂点に集まる枚数
  rotOffset?: number;
  depth?: number;
  spinSeconds?: number;
  formulas: string[]; // 双曲: 四隅に固定表示 / p進: 円の中心に埋め込んで一緒に回転
  honeycomb?: boolean; // 正二十面体モチーフを追加するか
}
```

`PAGE_PRESETS`オブジェクトに、`home` / `about` / `research` / `projects` / `publications` / `people` / `teaching` / `cv` / `blogIndex` の9つが定義されており、各ページがどの{p,q}（またはp進のp）・どの数式・回転速度・二十面体の有無を持つかが一目でわかるようになっています。パターンと数式のジャンルは意図的に紐付けてあります（例: `about`はp=3のp進円板＋p進幾何学の数式、`teaching`は双曲幾何学の込み入った公式、`home`と`research`だけ二十面体モチーフ付き）。

ブログ記事・タグページ用に、`mathBgForKey(key)`という関数も用意しています。文字列（記事のスラッグやタグ名）をdjb2ハッシュ関数で数値化し、その値を使って

- p進か双曲かを決定（偶奇で分岐）
- {p,q}の組、またはp進の底と深さを候補リストから選択
- 数式を2〜4個、重複なく選択（内部の`pickN`ヘルパーで実装）
- 回転オフセット・回転速度を微妙にずらす
- 1/6の確率で二十面体モチーフを追加

という手順で、**同じキーなら常に同じ結果、異なるキーならほぼ確実に異なる見た目**になる背景を組み立てます。

### 5.5 `src/components/MathBackground.astro` — 実際に描画するコンポーネント

`BaseLayout`から`<MathBackground {...mathBg} />`として呼ばれる、背景全体の描画コンポーネントです。

**双曲パターンの場合:**
- `generateTilingEdges()`の結果を`<svg class="pattern-svg hyperbolic">`内の`<path>`群として出力。
- `formulas`（最大4個）はKaTeXで`displayMode: true`としてレンダリングし、画面四隅の固定スロット（`.slot-1〜4`）に**水平のまま・回転なし**で配置。スロット同士は離れているため重なりません。

**p進パターンの場合:**
- `generatePadicDisk()`の結果を`<svg class="pattern-svg padic">`内の`<circle>`群として出力。
- `formulas`は、`level <= 1`（大きい方の円）を半径の大きい順に選び、**円の中心座標に1対1で配置**します。円同士はパッキングの性質上絶対に重ならないため、ラベルも重なりません。
- 重要な点として、この数式群（`.disk-formulas`）は**タイリングのSVGと全く同じ`width/height/position`・全く同じ`animation-duration`**を持つ別の`<div>`として実装されています。つまり同じ回転アニメーションを共有しているので、**数式は常にp進円板そのものと寸分違わず同じ速度で回転**します。

**共通:**
- ルートの`.math-bg`は`position: fixed; inset: 0; z-index: -1; pointer-events: none;`。ページを埋め尽くす固定背景として、本文の下に敷かれます。
- `@media (prefers-reduced-motion: reduce)`でアニメーションを無効化（アクセシビリティ対応）。
- `@media (max-width: 700px)`でモチーフ表示を簡略化（右上に1つだけ残す）。スマホでは余白が少ないため見づらくなる問題への対処です。
- `honeycomb`が`true`のときだけ`<IcosahedralHoneycomb corner="bottom-right" />`を追加描画。

### 5.6 `src/components/IcosahedralHoneycomb.astro` — 回転する正二十面体

`icosahedron.ts`の`generateIcosahedronEdges()`を3つの半径（内側から順に不透明度0.26 / 0.16 / 0.09）で呼び出し、それぞれ30本、計90本の辺を`<div class="edge">`として描画します。

```
.honeycomb-scene { perspective: 900px; }
.honeycomb-rotator {
  transform-style: preserve-3d;
  animation: honeycomb-spin 70s linear infinite;  /* rotateY(0→360deg) */
}
```

`transform-style: preserve-3d`を持つ親要素の中に、各辺が正しい3D位置・向きで配置されているため、親に`rotateY`のアニメーションをかけるだけで、**ブラウザが毎フレーム自動的に3D投影を再計算**してくれます。JavaScriptで回転角を計算してDOMを書き換える、といった処理は一切不要です。色は青系（`#3b5fa6`）をデフォルトにしています。

### 5.7 `src/components/MathBackgroundMobileReveal.astro` — スマホでの下端表示

PC版では数式が画面四隅の余白に表示されますが、スマホでは余白がほぼ無いため視認しづらくなります。この対策として作ったのが本コンポーネントです。

```astro
<div class="math-reveal" aria-hidden="true">...</div>
<style>
  .math-reveal { display: none; }
  @media (max-width: 700px) {
    .math-reveal { display: block; /* フッターの下に通常のブロックとして表示 */ }
  }
</style>
```

これは`position: fixed`ではなく、**`BaseLayout`の中で`<Footer />`の直後に置かれた、ごく普通のドキュメントフロー上のブロック要素**です。JavaScriptによるスクロール検知は一切使っていません。「ページの一番下に置かれているだけの要素は、スクロールし切ったときにしか画面に入ってこない」という、ブロックレイアウトの当たり前の性質だけで、「一番下までスクロールすると数式が現れる」という挙動を実現しています。

---

## 6. ページ (`src/pages/`)

Astroではこのフォルダの中のファイル配置がそのままURLになります（ファイルベースルーティング）。

| ファイル | URL | 内容 |
|---|---|---|
| `index.astro` | `/` | 自己紹介、プロフィール画像（`knot.webp`）、研究興味リスト |
| `about.astro` | `/about` | 経歴・数学/CS/言語学それぞれへの興味を日英併記 |
| `research.astro` | `/research` | 研究ステートメント（ハイパー演算子理論とLanglandsプログラム、教育×AIの研究） |
| `projects.astro` | `/projects` | `projects`コレクションを開始日降順で一覧表示 |
| `publications.astro` | `/publications` | `publications`コレクションをpreprint/peer-reviewedに分けて`PublicationItem`で表示 |
| `people.astro` | `/people` | Advisors/Collaborators/Mentees（現状プレースホルダー） |
| `teaching.astro` | `/teaching` | `teaching`コレクションを年代順に一覧表示 |
| `cv.astro` | `/cv` | CV（PDFダウンロードリンク + Education/Experience/Awardsのプレースホルダー） |
| `blog/index.astro` | `/blog` | `blog`コレクションを日付降順で一覧（`draft: true`は除外） |
| `blog/[...slug].astro` | `/blog/<slug>` | 個別記事ページ。`getStaticPaths()`で全記事分のページを静的生成し、`PostLayout`に本文（`<Content />`）を渡す |
| `tags/[tag].astro` | `/tags/<tag>` | 全記事からタグの集合を集め（`[...new Set(...)]`）、タグごとに該当記事一覧ページを生成 |
| `rss.xml.js` | `/rss.xml` | `@astrojs/rss`でブログ記事のRSSフィードを生成するAPIルート |

いずれのページも、冒頭で`PAGE_PRESETS`（または`mathBgForKey`）から自分用の`mathBg`設定を取り出し、`<BaseLayout mathBg={...}>`に渡す、という共通のパターンになっています。

---

## 7. コンテンツコレクション (`src/content/`)

- `blog/` — 実際に10本の記事（`2026-6-28.md`など、日付がそのままファイル名＝スラッグ）が存在。`hazime.txt`と`time-derivatives.svg`は記事に埋め込まれる素材ファイルと思われます（`.gitkeep`はGitに空フォルダを認識させるための慣習的な空ファイル）。
- `projects/` — `geekk.md`, `qfcsp.md`の2件。
- `publications/`, `teaching/` — `.gitkeep`のみで、実データはまだ無し。該当ページは自動的に「まだありません」という表示にフォールバックします。

---

## 8. デザイン・パフォーマンスの方針まとめ

一連のやり取りを通じて一貫して守ってきた設計原則を整理します。

1. **計算はすべてビルド時（Node.js側）で完結** — `hyperbolicTiling.ts`, `padicDisk.ts`, `icosahedron.ts`はいずれも「純粋関数を呼んで配列を得る」だけのモジュールで、Astroの`---`フロントマター内（サーバー側）でのみ実行されます。ブラウザに渡るのは計算結果の静的なHTML/SVGだけです。
2. **アニメーションはCSSの`@keyframes`のみ** — 2Dの回転（`transform: rotate()`）も、3Dの回転（`rotate3d()` + `preserve-3d`）も、JavaScriptのフレームごとの再計算なしにブラウザのレンダリングエンジンだけで完結します。サイト全体で`<script>`タグは0個です。
3. **重ならないことを構造的に保証** — p進円板の数式は、円のパッキングという「そもそも重ならない」幾何構造の中心点にしか置かれません。双曲タイリングの数式は、固定4隅のスロットだけを使い、回転させません。
4. **モバイル対応もCSSのみ** — 「一番下までスクロールしたら数式が見える」は、単に要素をドキュメントの最後に置いているだけです。
5. **軽量性** — 典型的なページはgzip後 数KB程度の追加で済んでいます（例: 双曲タイリングは深さ3・重複除去で数百個の`<path>`程度、p進円板は`<circle>`のみでパスデータすら持たない）。

---

## 9. カスタマイズの仕方

- **あるページの見た目を変えたい** → `src/lib/mathBgPresets.ts`の`PAGE_PRESETS`内、該当ページのオブジェクトを編集（`p`, `q`, `depth`, `spinSeconds`, `formulas`, `honeycomb`）。
- **新しい数式を追加したい** → 同ファイルの`FORMULAS`オブジェクトにLaTeX文字列を追加し、`PAGE_PRESETS`や`HYPERBOLIC_FORMULA_POOL` / `PADIC_FORMULA_POOL`から参照する。
- **ブログ記事・タグページの「出やすさ」を調整したい** → `mathBgForKey()`内のロジック（`HYPERBOLIC_PAIRS`, `PADIC_BASES`, `honeycomb: h % 6 === 0`の確率など）を編集。
- **二十面体モチーフの色・大きさ・速度を変えたい** → `IcosahedralHoneycomb.astro`の`Props`のデフォルト値（`size`, `spinSeconds`, `tiltDeg`, `color`, `corner`）を編集、または呼び出し側（`MathBackground.astro`）で明示的にpropsを渡す。
- **新しいページを追加したい** → `src/pages/`に`.astro`ファイルを追加し、`PAGE_PRESETS`に対応するキーを1つ足して`mathBg={PAGE_PRESETS.xxx}`として`BaseLayout`に渡せば、他のページと同じ仕組みに自動的に乗ります。

---

*このドキュメントは会話の中で行った実装（双曲{p,q}タイリング → p進円板 → 数式ジャンルの絞り込みと回転の同期 → 正二十面体モチーフ）を反映した、リポジトリの状態に基づいています。*�
