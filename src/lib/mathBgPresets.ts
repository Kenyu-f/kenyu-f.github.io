// Central registry of "what appears faintly behind this page": which
// background pattern (a hyperbolic {p,q} tiling, or a p-adic nested-disk
// packing), which formulas sit in the readable corner slots, which short
// expressions get scattered around at various rotations (echoing the way
// Escher repeats a motif at different orientations across a hyperbolic
// tiling), and whether a small category-theory diagram appears.

export type BgPattern = 'hyperbolic' | 'padic';

export interface MathBgConfig {
  pattern: BgPattern;
  /** Hyperbolic: number of polygon sides. p-adic: the prime base. */
  p: number;
  /** Hyperbolic only: how many polygons meet at each vertex. */
  q?: number;
  rotOffset?: number;
  depth?: number;
  spinSeconds?: number;
  /** The 1–3 larger, readable formulas placed in the fixed corner slots. */
  formulas: string[];
  /** Short expressions stamped several times at scattered positions/rotations. */
  motifs?: string[];
  /** An optional small faint category-theory diagram. */
  diagram?: 'commutativeTriangle' | 'pullbackSquare';
}

// ---- Formula pool -----------------------------------------------------
// Hyperbolic & Möbius geometry, algebraic geometry, p-adic analysis,
// hyperoperators, and category theory, mixed across the site.
export const FORMULAS = {
  // Hyperbolic / Möbius geometry
  poincareMetric: String.raw`ds^2=\dfrac{4\left(dx^2+dy^2\right)}{\left(1-x^2-y^2\right)^2}`,
  upperHalfPlaneMetric: String.raw`ds^2=\dfrac{dx^2+dy^2}{y^2}`,
  gaussBonnet: String.raw`\iint_{T} K\,dA+\oint_{\partial T}\kappa_g\,ds=2\pi\chi(T)`,
  angleDefect: String.raw`\mathrm{Area}(\triangle)=\pi-(\alpha+\beta+\gamma)`,
  mobius: String.raw`T(z)=e^{i\theta}\dfrac{z-z_0}{1-\overline{z_0}z}`,
  crossRatio: String.raw`(z,z_1;z_0,z_0^{*})=\dfrac{z_1-z_0^{*}}{z_1-z_0}\cdot\dfrac{z-z_0}{z-z_0^{*}}`,
  fuchsian: String.raw`\Gamma\subset\mathrm{PSL}(2,\mathbb{R})`,
  modularGroup: String.raw`\mathrm{SL}(2,\mathbb{Z})/\{\pm I\}`,
  schlafliCondition: String.raw`\dfrac{1}{p}+\dfrac{1}{q}<\dfrac{1}{2}`,
  vertexRadius: String.raw`r=\sqrt{\dfrac{\cos\left(\frac{\pi}{p}+\frac{\pi}{q}\right)}{\cos\left(\frac{\pi}{p}-\frac{\pi}{q}\right)}}`,
  horocycle: String.raw`\text{horocycle: a circle in }\mathbb{D}\text{ tangent to }\mathbb{S}^1_\infty`,

  // p-adic analysis
  padicNorm: String.raw`|x|_p=p^{-v_p(x)}`,
  padicIntegers: String.raw`\mathbb{Z}_p=\varprojlim_n \mathbb{Z}/p^n\mathbb{Z}`,
  ultrametric: String.raw`|x+y|_p\le\max\left(|x|_p,|y|_p\right)`,
  ostrowski: String.raw`|\cdot| \sim |\cdot|_\infty \text{ or } |\cdot|_p`,

  // Number theory / algebraic geometry
  zeta: String.raw`\zeta(s)=\sum_{n=1}^{\infty}n^{-s}=\prod_{p\,\mathrm{prime}}\dfrac{1}{1-p^{-s}}`,
  pnt: String.raw`\pi(x)\sim\dfrac{x}{\log x}`,
  weierstrass: String.raw`y^2=x^3+ax+b`,
  projectiveSpace: String.raw`\mathbb{P}^n(k)=\left(k^{n+1}\setminus\{0\}\right)/k^{\times}`,
  riemannRoch: String.raw`\ell(D)-\ell(K-D)=\deg D+1-g`,
  spec: String.raw`X=\operatorname{Spec}(R)`,

  // Hyperoperators
  tetration: String.raw`{}^{n}a=\underbrace{a^{a^{\cdot^{\cdot^{a}}}}}_{n}`,
  knuthArrow: String.raw`a\uparrow\uparrow n=a[4]\,n`,
  pentation: String.raw`a\uparrow\uparrow\uparrow n=a[5]\,n`,
  hyperopRecursive: String.raw`a[n]\,b=a[n-1]\big(a[n]\,(b-1)\big)`,
  ackermann: String.raw`A(m,n)=\begin{cases}n+1 & m=0\\ A(m-1,1) & n=0\\ A(m-1,A(m,n-1)) & \text{else}\end{cases}`,

  // Category theory
  functor: String.raw`F:\mathcal{C}\to\mathcal{D}`,
  natTransform: String.raw`\eta:F\Rightarrow G`,
  adjunction: String.raw`F\dashv G`,
  yoneda: String.raw`\mathcal{C}(-,A)\cong\mathcal{C}(-,B)\ \Rightarrow\ A\cong B`,
  commSquare: String.raw`g\circ f=k\circ h`,
  pullback: String.raw`P=A\times_{C}B`,
} as const;

type FormulaKey = keyof typeof FORMULAS;
const F = FORMULAS;

// ---- Per-page presets --------------------------------------------------
// Each page differs in pattern (hyperbolic vs p-adic), the {p,q}/base, and
// which formulas/motifs/diagram appear, so no two pages look alike.
export const PAGE_PRESETS: Record<string, MathBgConfig> = {
  home: {
    pattern: 'hyperbolic',
    p: 7,
    q: 3,
    rotOffset: 0,
    spinSeconds: 220,
    formulas: [F.poincareMetric, F.schlafliCondition],
    motifs: [F.mobius, F.zeta, F.tetration, F.padicNorm],
  },
  about: {
    pattern: 'padic',
    p: 3,
    depth: 4,
    rotOffset: 0.2,
    spinSeconds: 190,
    formulas: [F.padicIntegers],
    motifs: [F.ultrametric, F.mobius, F.functor],
  },
  research: {
    pattern: 'hyperbolic',
    p: 4,
    q: 7,
    rotOffset: 0.6,
    spinSeconds: 240,
    formulas: [F.gaussBonnet, F.fuchsian, F.tetration],
    motifs: [F.hyperopRecursive, F.ackermann, F.riemannRoch, F.natTransform, F.adjunction],
    diagram: 'commutativeTriangle',
  },
  projects: {
    pattern: 'padic',
    p: 5,
    depth: 3,
    rotOffset: 0.5,
    spinSeconds: 200,
    formulas: [F.vertexRadius],
    motifs: [F.functor, F.commSquare, F.spec],
    diagram: 'pullbackSquare',
  },
  publications: {
    pattern: 'padic',
    p: 2,
    depth: 5,
    rotOffset: 0.1,
    spinSeconds: 260,
    formulas: [F.zeta],
    motifs: [F.pnt, F.ostrowski, F.padicNorm],
  },
  people: {
    pattern: 'hyperbolic',
    p: 5,
    q: 5,
    rotOffset: 1.1,
    spinSeconds: 210,
    formulas: [F.modularGroup],
    motifs: [F.crossRatio, F.yoneda],
  },
  teaching: {
    pattern: 'hyperbolic',
    p: 4,
    q: 5,
    rotOffset: 0.45,
    spinSeconds: 180,
    formulas: [F.angleDefect],
    motifs: [F.horocycle, F.weierstrass],
  },
  cv: {
    pattern: 'padic',
    p: 7,
    depth: 2,
    rotOffset: 0.75,
    spinSeconds: 230,
    formulas: [F.upperHalfPlaneMetric],
    motifs: [F.projectiveSpace, F.pentation],
  },
  blogIndex: {
    pattern: 'hyperbolic',
    p: 6,
    q: 5,
    rotOffset: 0.2,
    spinSeconds: 200,
    formulas: [F.pnt],
    motifs: [F.knuthArrow, F.weierstrass, F.adjunction],
  },
};

// ---- Per-post variety for the blog --------------------------------------
const BLOG_HYPERBOLIC_PAIRS: Array<[number, number]> = [
  [7, 3], [3, 7], [8, 3], [3, 8], [5, 4], [4, 5], [6, 4], [4, 6], [5, 5], [6, 5], [4, 7],
];
const BLOG_PADIC_BASES: Array<[number, number]> = [
  // [prime base, depth]
  [2, 5], [3, 4], [5, 3], [7, 2], [11, 2], [13, 2],
];

const BLOG_MAIN_FORMULAS: FormulaKey[] = [
  'tetration', 'knuthArrow', 'hyperopRecursive', 'ackermann', 'poincareMetric',
  'upperHalfPlaneMetric', 'gaussBonnet', 'mobius', 'fuchsian', 'zeta', 'pnt',
  'padicIntegers', 'padicNorm', 'ultrametric', 'weierstrass', 'riemannRoch',
];
const BLOG_MOTIF_FORMULAS: FormulaKey[] = [
  'functor', 'natTransform', 'adjunction', 'yoneda', 'commSquare', 'pullback',
  'crossRatio', 'schlafliCondition', 'vertexRadius', 'projectiveSpace', 'spec',
];

/** Small, deterministic string hash (djb2) — the same slug always gives the same look. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

/** Derives a distinct-but-stable background config for a given blog post slug. */
export function mathBgForSlug(slug: string): MathBgConfig {
  const h = hashString(slug);
  const usePadic = h % 2 === 0;
  const rotOffset = ((h % 1000) / 1000) * Math.PI;
  const spinSeconds = 180 + (h % 90);

  const mainFormula = F[BLOG_MAIN_FORMULAS[h % BLOG_MAIN_FORMULAS.length]];
  const motifA = F[BLOG_MOTIF_FORMULAS[Math.floor(h / 7) % BLOG_MOTIF_FORMULAS.length]];
  const motifB = F[BLOG_MOTIF_FORMULAS[Math.floor(h / 13) % BLOG_MOTIF_FORMULAS.length]];
  const diagram = h % 5 === 0 ? 'commutativeTriangle' : h % 5 === 1 ? 'pullbackSquare' : undefined;

  if (usePadic) {
    const [p, depth] = BLOG_PADIC_BASES[h % BLOG_PADIC_BASES.length];
    return { pattern: 'padic', p, depth, rotOffset, spinSeconds, formulas: [mainFormula], motifs: [motifA, motifB], diagram };
  }
  const [p, q] = BLOG_HYPERBOLIC_PAIRS[h % BLOG_HYPERBOLIC_PAIRS.length];
  return { pattern: 'hyperbolic', p, q, rotOffset, spinSeconds, formulas: [mainFormula], motifs: [motifA, motifB], diagram };
}
