// Central registry of "what appears faintly behind this page". Two
// unrelated concerns are kept in one file because they're tuned together:
//
// 1. Which background pattern a page gets: a hyperbolic {p,q} tiling, or a
//    p-adic nested-disk packing.
// 2. Which formulas appear. For hyperbolic pages these sit in a few plain,
//    horizontal, well-separated corner slots (no rotation, no crowding).
//    For p-adic pages the formulas are placed at the centers of the disk's
//    own top-level circles — since those circles are already non-overlapping
//    by construction, the labels can't collide — and they're rendered
//    *inside* the same element that spins, so they rotate together with the
//    disk at exactly the same speed. Formulas never rotate independently of
//    the disk, and only p-adic pages have rotating formulas at all.
//
// Formula genres are deliberately narrow: group theory, representation
// theory, hyperbolic geometry, p-adic geometry, and hyperoperators — using
// Fraktur (\mathfrak) and calligraphic (\mathcal) letters where that's
// actually standard notation (Lie algebras, ideals, rings of integers).

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
  /**
   * Hyperbolic: 1–4 formulas shown in plain, fixed, non-rotating corner slots.
   * p-adic: formulas placed at the disk's own circle centers, rotating with it.
   */
  formulas: string[];
}

// ---- Formula pool -------------------------------------------------------
export const FORMULAS = {
  // Hyperbolic geometry
  poincareMetric: String.raw`ds^2=\dfrac{4\left(dx^2+dy^2\right)}{\left(1-x^2-y^2\right)^2}`,
  upperHalfPlaneFraktur: String.raw`\mathfrak{H}=\{z\in\mathbb{C}:\operatorname{Im}(z)>0\}`,
  mobius: String.raw`T(z)=e^{i\theta}\dfrac{z-z_0}{1-\overline{z_0}z}`,
  crossRatio: String.raw`(z,z_1;z_0,z_0^{*})=\dfrac{z_1-z_0^{*}}{z_1-z_0}\cdot\dfrac{z-z_0}{z-z_0^{*}}`,
  fuchsian: String.raw`\Gamma\subset\mathrm{PSL}(2,\mathbb{R})`,
  modularGroup: String.raw`\mathrm{SL}(2,\mathbb{Z})/\{\pm I\}`,
  schlafliCondition: String.raw`\dfrac{1}{p}+\dfrac{1}{q}<\dfrac{1}{2}`,
  vertexRadius: String.raw`r=\sqrt{\dfrac{\cos\left(\frac{\pi}{p}+\frac{\pi}{q}\right)}{\cos\left(\frac{\pi}{p}-\frac{\pi}{q}\right)}}`,

  // p-adic geometry
  padicNorm: String.raw`|x|_p=p^{-v_p(x)}`,
  padicIntegers: String.raw`\mathbb{Z}_p=\varprojlim_n \mathbb{Z}/p^n\mathbb{Z}`,
  ultrametric: String.raw`|x+y|_p\le\max\left(|x|_p,|y|_p\right)`,
  ostrowski: String.raw`|\cdot|\sim|\cdot|_\infty\text{ or }|\cdot|_p`,
  maximalIdeal: String.raw`\mathfrak{m}=p\,\mathbb{Z}_p`,
  residueField: String.raw`\mathbb{Z}_p/\mathfrak{m}\cong\mathbb{F}_p`,
  ringOfIntegers: String.raw`\mathfrak{p}\subset\mathcal{O}_K`,
  galoisGroup: String.raw`\mathrm{Gal}(\overline{\mathbb{Q}_p}/\mathbb{Q}_p)`,
  henselLemma: String.raw`f(a)\equiv 0,\ f'(a)\not\equiv 0\ (\mathrm{mod}\ p)\implies\exists!\,\alpha`,

  // Group theory
  lagrange: String.raw`|H|\ \big|\ |G|`,
  classEquation: String.raw`|G|=|Z(G)|+\sum_i[G:C_G(x_i)]`,
  sylow: String.raw`n_p\equiv 1\ (\mathrm{mod}\ p)`,
  semidirect: String.raw`G=N\rtimes H`,

  // Representation theory
  repDef: String.raw`\rho:G\to\mathrm{GL}(V)`,
  characterOrthogonality: String.raw`\dfrac{1}{|G|}\sum_{g\in G}\chi(g)\overline{\psi(g)}=\delta_{\chi\psi}`,
  peterWeyl: String.raw`L^2(G)\cong\bigoplus_{\pi}V_\pi\otimes V_\pi^{*}`,
  liealgebra: String.raw`\mathfrak{g}=\mathrm{Lie}(G)`,
  sl2: String.raw`\mathfrak{sl}_2(\mathbb{C})`,
  uea: String.raw`U(\mathfrak{g})`,

  // Hyperoperators
  tetration: String.raw`{}^{n}a=\underbrace{a^{a^{\cdot^{\cdot^{a}}}}}_{n}`,
  knuthArrow: String.raw`a\uparrow\uparrow n=a[4]\,n`,
  pentation: String.raw`a\uparrow\uparrow\uparrow n=a[5]\,n`,
  hyperopRecursive: String.raw`a[n]\,b=a[n-1]\big(a[n]\,(b-1)\big)`,
  ackermann: String.raw`A(m,n)=\begin{cases}n+1 & m=0\\ A(m-1,1) & n=0\\ A(m-1,A(m,n-1)) & \text{else}\end{cases}`,
} as const;

type FormulaKey = keyof typeof FORMULAS;
const F = FORMULAS;

// ---- Per-page presets ----------------------------------------------------
// Hyperbolic-pattern pages: formulas sit in plain corner slots, capped at 4
// so spacing stays generous. p-adic-pattern pages: formula count is chosen
// to roughly match the number of top-level circles the disk has, so every
// label gets its own circle and nothing crowds.
export const PAGE_PRESETS: Record<string, MathBgConfig> = {
  home: {
    pattern: 'hyperbolic',
    p: 7,
    q: 3,
    rotOffset: 0,
    spinSeconds: 220,
    formulas: [F.poincareMetric, F.classEquation, F.tetration],
  },
  about: {
    // p = 3 → 3 top-level circles, one formula per circle.
    pattern: 'padic',
    p: 3,
    depth: 4,
    rotOffset: 0.2,
    spinSeconds: 190,
    formulas: [F.padicIntegers, F.maximalIdeal, F.residueField],
  },
  research: {
    pattern: 'hyperbolic',
    p: 4,
    q: 7,
    rotOffset: 0.6,
    spinSeconds: 240,
    formulas: [F.fuchsian, F.hyperopRecursive, F.ackermann],
  },
  projects: {
    // p = 5 → 5 top-level circles.
    pattern: 'padic',
    p: 5,
    depth: 3,
    rotOffset: 0.5,
    spinSeconds: 200,
    formulas: [F.galoisGroup, F.henselLemma, F.padicNorm, F.ultrametric],
  },
  publications: {
    // p = 2 → only 2 top-level circles, so exactly 2 formulas.
    pattern: 'padic',
    p: 2,
    depth: 5,
    rotOffset: 0.1,
    spinSeconds: 260,
    formulas: [F.padicNorm, F.ostrowski],
  },
  people: {
    pattern: 'hyperbolic',
    p: 5,
    q: 5,
    rotOffset: 1.1,
    spinSeconds: 210,
    formulas: [F.repDef, F.characterOrthogonality, F.peterWeyl],
  },
  teaching: {
    pattern: 'hyperbolic',
    p: 4,
    q: 5,
    rotOffset: 0.45,
    spinSeconds: 180,
    formulas: [F.lagrange, F.sylow, F.semidirect],
  },
  cv: {
    // p = 7 → 7 top-level circles; only use the 4 largest.
    pattern: 'padic',
    p: 7,
    depth: 2,
    rotOffset: 0.75,
    spinSeconds: 230,
    formulas: [F.ringOfIntegers, F.galoisGroup, F.padicIntegers, F.ultrametric],
  },
  blogIndex: {
    pattern: 'hyperbolic',
    p: 6,
    q: 5,
    rotOffset: 0.2,
    spinSeconds: 200,
    formulas: [F.liealgebra, F.knuthArrow, F.uea],
  },
};

// ---- Per-post variety for the blog and tag pages -------------------------
const HYPERBOLIC_PAIRS: Array<[number, number]> = [
  [7, 3], [3, 7], [8, 3], [3, 8], [5, 4], [4, 5], [6, 4], [4, 6], [5, 5], [6, 5], [4, 7],
];
const PADIC_BASES: Array<[number, number]> = [
  // [prime base, depth]
  [2, 5], [3, 4], [5, 3], [7, 2], [11, 2], [13, 2],
];

const HYPERBOLIC_FORMULA_POOL: FormulaKey[] = [
  'poincareMetric', 'upperHalfPlaneFraktur', 'mobius', 'crossRatio', 'fuchsian',
  'modularGroup', 'lagrange', 'classEquation', 'sylow', 'semidirect', 'repDef',
  'characterOrthogonality', 'peterWeyl', 'liealgebra', 'sl2', 'uea',
  'tetration', 'knuthArrow', 'pentation', 'hyperopRecursive', 'ackermann',
];
const PADIC_FORMULA_POOL: FormulaKey[] = [
  'padicNorm', 'padicIntegers', 'ultrametric', 'ostrowski', 'maximalIdeal',
  'residueField', 'ringOfIntegers', 'galoisGroup', 'henselLemma',
];

/** Small, deterministic string hash (djb2) — the same key always gives the same look. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

function pickN<T>(pool: T[], count: number, seed: number): T[] {
  const picked: T[] = [];
  const used = new Set<number>();
  let i = 0;
  while (picked.length < count && used.size < pool.length) {
    const idx = (seed + i * 7 + i * i) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(pool[idx]);
    }
    i++;
  }
  return picked;
}

/** Derives a distinct-but-stable background config for a given slug/tag string. */
export function mathBgForKey(key: string): MathBgConfig {
  const h = hashString(key);
  const usePadic = h % 2 === 0;
  const rotOffset = ((h % 1000) / 1000) * Math.PI;
  const spinSeconds = 180 + (h % 90);

  if (usePadic) {
    const [p, depth] = PADIC_BASES[h % PADIC_BASES.length];
    const count = Math.max(2, Math.min(4, p));
    const keys = pickN(PADIC_FORMULA_POOL, count, h);
    return { pattern: 'padic', p, depth, rotOffset, spinSeconds, formulas: keys.map((k) => F[k]) };
  }
  const [p, q] = HYPERBOLIC_PAIRS[h % HYPERBOLIC_PAIRS.length];
  // Always include a hyperoperator formula among the corner slots.
  const hyperopPool: FormulaKey[] = ['tetration', 'knuthArrow', 'pentation', 'hyperopRecursive', 'ackermann'];
  const hyperop = hyperopPool[h % hyperopPool.length];
  const others = pickN(
    HYPERBOLIC_FORMULA_POOL.filter((k) => !hyperopPool.includes(k)),
    2,
    h
  );
  return { pattern: 'hyperbolic', p, q, rotOffset, spinSeconds, formulas: [...others.map((k) => F[k]), F[hyperop]] };
}

/** @deprecated use mathBgForKey */
export const mathBgForSlug = mathBgForKey;
