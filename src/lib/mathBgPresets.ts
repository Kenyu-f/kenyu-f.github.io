// Central registry of "which hyperbolic tiling + which formulas appear faintly
// behind this page". Kept in one place so every page stays visually distinct
// but easy to re-tune later without touching the rendering component.

export interface MathBgConfig {
  p: number;
  q: number;
  rotOffset?: number;
  depth?: number;
  spinSeconds?: number;
  formulas: string[];
}

// A little formula pool shared by the presets below and by the blog's
// per-post hashing, mixing hyperbolic geometry, the number theory side of
// the site, and hyperoperators (tetration / Knuth arrows / Ackermann).
export const FORMULAS = {
  poincareMetric: String.raw`ds^2=\dfrac{4\left(dx^2+dy^2\right)}{\left(1-x^2-y^2\right)^2}`,
  upperHalfPlaneMetric: String.raw`ds^2=\dfrac{dx^2+dy^2}{y^2}`,
  gaussBonnet: String.raw`\iint_{T} K\,dA+\oint_{\partial T}\kappa_g\,ds=2\pi\chi(T)`,
  angleDefect: String.raw`\mathrm{Area}(\triangle)=\pi-(\alpha+\beta+\gamma)`,
  mobius: String.raw`f(z)=\dfrac{az+b}{cz+d},\quad ad-bc\neq 0`,
  fuchsian: String.raw`\Gamma\subset\mathrm{PSL}(2,\mathbb{R})`,
  modularGroup: String.raw`\mathrm{SL}(2,\mathbb{Z})/\{\pm I\}`,
  schlafliCondition: String.raw`\dfrac{1}{p}+\dfrac{1}{q}<\dfrac{1}{2}`,
  vertexRadius: String.raw`r=\sqrt{\dfrac{\cos\left(\frac{\pi}{p}+\frac{\pi}{q}\right)}{\cos\left(\frac{\pi}{p}-\frac{\pi}{q}\right)}}`,
  zeta: String.raw`\zeta(s)=\sum_{n=1}^{\infty}n^{-s}=\prod_{p\,\mathrm{prime}}\dfrac{1}{1-p^{-s}}`,
  pnt: String.raw`\pi(x)\sim\dfrac{x}{\log x}`,
  tetration: String.raw`{}^{n}a=\underbrace{a^{a^{\cdot^{\cdot^{a}}}}}_{n}`,
  knuthArrow: String.raw`a\uparrow\uparrow n = a[4]n`,
  hyperopRecursive: String.raw`a[n]\,b=a[n-1]\big(a[n]\,(b-1)\big)`,
  ackermann: String.raw`A(m,n)=\begin{cases}n+1 & m=0\\ A(m-1,1) & n=0\\ A(m-1,A(m,n-1)) & \text{else}\end{cases}`,
} as const;

// Per-page presets. Every entry uses a different {p,q} pair (all satisfy the
// hyperbolic condition 1/p+1/q<1/2) so no two pages look the same at a glance.
export const PAGE_PRESETS: Record<string, MathBgConfig> = {
  home: {
    p: 7,
    q: 3,
    rotOffset: 0,
    spinSeconds: 220,
    formulas: [FORMULAS.poincareMetric, FORMULAS.schlafliCondition],
  },
  about: {
    p: 5,
    q: 4,
    rotOffset: 0.35,
    spinSeconds: 190,
    formulas: [FORMULAS.mobius],
  },
  research: {
    p: 4,
    q: 7,
    rotOffset: 0.6,
    spinSeconds: 240,
    formulas: [FORMULAS.gaussBonnet, FORMULAS.fuchsian, FORMULAS.tetration],
  },
  projects: {
    p: 6,
    q: 4,
    rotOffset: 0.9,
    spinSeconds: 200,
    formulas: [FORMULAS.vertexRadius],
  },
  publications: {
    p: 8,
    q: 3,
    rotOffset: 0.15,
    spinSeconds: 260,
    formulas: [FORMULAS.zeta],
  },
  people: {
    p: 5,
    q: 5,
    rotOffset: 1.1,
    spinSeconds: 210,
    formulas: [FORMULAS.modularGroup],
  },
  teaching: {
    p: 4,
    q: 5,
    rotOffset: 0.45,
    spinSeconds: 180,
    formulas: [FORMULAS.angleDefect],
  },
  cv: {
    p: 3,
    q: 7,
    rotOffset: 0.75,
    spinSeconds: 230,
    formulas: [FORMULAS.upperHalfPlaneMetric],
  },
  blogIndex: {
    p: 6,
    q: 5,
    rotOffset: 0.2,
    spinSeconds: 200,
    formulas: [FORMULAS.pnt],
  },
};

// Valid hyperbolic {p,q} pairs to draw from for individual blog posts, plus
// the formula pool (leans on the hyperoperator side, since blog posts are
// the most natural place for that theme to show up).
const BLOG_PAIRS: Array<[number, number]> = [
  [7, 3],
  [3, 7],
  [8, 3],
  [3, 8],
  [5, 4],
  [4, 5],
  [6, 4],
  [4, 6],
  [5, 5],
  [6, 5],
  [4, 7],
];

const BLOG_FORMULA_POOL: string[] = [
  FORMULAS.tetration,
  FORMULAS.knuthArrow,
  FORMULAS.hyperopRecursive,
  FORMULAS.ackermann,
  FORMULAS.poincareMetric,
  FORMULAS.upperHalfPlaneMetric,
  FORMULAS.gaussBonnet,
  FORMULAS.mobius,
  FORMULAS.fuchsian,
  FORMULAS.zeta,
  FORMULAS.pnt,
];

/** Small, deterministic string hash (djb2) — same slug always gives the same look. */
function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = (h * 33) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

/** Derives a distinct-but-stable {p,q} + formula pair for a given blog post slug. */
export function mathBgForSlug(slug: string): MathBgConfig {
  const h = hashString(slug);
  const [p, q] = BLOG_PAIRS[h % BLOG_PAIRS.length];
  const formula = BLOG_FORMULA_POOL[Math.floor(h / BLOG_PAIRS.length) % BLOG_FORMULA_POOL.length];
  const rotOffset = ((h % 1000) / 1000) * Math.PI;
  const spinSeconds = 180 + (h % 90);
  return { p, q, rotOffset, spinSeconds, formulas: [formula] };
}
