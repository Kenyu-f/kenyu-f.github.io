// Poincaré disk model — regular {p,q} hyperbolic tiling generator.
//
// This runs entirely at BUILD TIME (inside .astro frontmatter, i.e. Node),
// not in the browser. The output is a small array of static SVG path "d"
// strings. There is no client-side computation and no per-frame JS: any
// motion is applied afterwards with a single CSS transform animation on the
// whole <svg>, which the browser can composite on the GPU essentially for
// free. This keeps the feature cheap regardless of how many pages use it.
//
// Math: a regular {p,q} tiling has p-gons, q of them meeting at each vertex,
// and is hyperbolic whenever 1/p + 1/q < 1/2. We build the central p-gon,
// then repeatedly reflect it across its own edges (each edge is a geodesic:
// either a diameter, or a circular arc meeting the unit circle at right
// angles) to generate neighboring tiles, breadth-first, until `depth` or the
// `maxAbs` radius cutoff is reached. Reflections are Möbius
// transformations, so the whole construction stays inside the disk exactly.

interface Complex {
  re: number;
  im: number;
}

type Geodesic =
  | { type: 'line'; theta: number }
  | { type: 'circle'; c: Complex; r: number };

function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}
function mul(a: Complex, b: Complex): Complex {
  return { re: a.re * b.re - a.im * b.im, im: a.re * b.im + a.im * b.re };
}
function conj(a: Complex): Complex {
  return { re: a.re, im: -a.im };
}
function abs2(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}
function div(a: Complex, b: Complex): Complex {
  const d = abs2(b);
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
}
function polar(r: number, theta: number): Complex {
  return { re: r * Math.cos(theta), im: r * Math.sin(theta) };
}

/** Euclidean distance from the disk center to a vertex of the regular {p,q} tile. */
function vertexRadius(p: number, q: number): number {
  const A = Math.PI / p;
  const B = Math.PI / q;
  const val = Math.cos(A + B) / Math.cos(A - B);
  return Math.sqrt(Math.max(val, 0));
}

function regularPolygon(p: number, q: number, rotOffset = 0): Complex[] {
  const r0 = vertexRadius(p, q);
  const verts: Complex[] = [];
  for (let k = 0; k < p; k++) {
    const theta = (2 * Math.PI * k) / p + Math.PI / 2 - Math.PI / p + rotOffset;
    verts.push(polar(r0, theta));
  }
  return verts;
}

/** The hyperbolic geodesic through two points of the disk (orthogonal to the boundary). */
function geodesic(z1: Complex, z2: Complex): Geodesic {
  const cross = z1.re * z2.im - z1.im * z2.re;
  if (Math.abs(cross) < 1e-9) {
    return { type: 'line', theta: Math.atan2(z1.im, z1.re) };
  }
  const { re: x1, im: y1 } = z1;
  const { re: x2, im: y2 } = z2;
  const b1 = (x1 * x1 + y1 * y1 + 1) / 2;
  const b2 = (x2 * x2 + y2 * y2 + 1) / 2;
  const det = x1 * y2 - y1 * x2;
  const cx = (b1 * y2 - y1 * b2) / det;
  const cy = (x1 * b2 - b1 * x2) / det;
  const r2 = cx * cx + cy * cy - 1;
  return { type: 'circle', c: { re: cx, im: cy }, r: Math.sqrt(Math.max(r2, 1e-12)) };
}

/** Reflect (invert) a point across a geodesic. This is the tiling's generating isometry. */
function reflect(z: Complex, g: Geodesic): Complex {
  if (g.type === 'line') {
    return mul(polar(1, 2 * g.theta), conj(z));
  }
  const diff = sub(z, g.c);
  const invConjDiff = div({ re: g.r * g.r, im: 0 }, conj(diff));
  return { re: g.c.re + invConjDiff.re, im: g.c.im + invConjDiff.im };
}

function centroid(verts: Complex[]): Complex {
  let sx = 0;
  let sy = 0;
  for (const v of verts) {
    sx += v.re;
    sy += v.im;
  }
  return { re: sx / verts.length, im: sy / verts.length };
}

function keyOfPoint(z: Complex): string {
  return `${Math.round(z.re * 1e4)},${Math.round(z.im * 1e4)}`;
}
function edgeKey(z1: Complex, z2: Complex): string {
  const k1 = keyOfPoint(z1);
  const k2 = keyOfPoint(z2);
  return k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
}

function arcPathForEdge(z1: Complex, z2: Complex): string {
  const g = geodesic(z1, z2);
  if (g.type === 'line') {
    return `M${z1.re.toFixed(3)} ${z1.im.toFixed(3)}L${z2.re.toFixed(3)} ${z2.im.toFixed(3)}`;
  }
  const sweep = (z2.re - z1.re) * (0 - z1.im) - (z2.im - z1.im) * (0 - z1.re) > 0 ? 1 : 0;
  return `M${z1.re.toFixed(3)} ${z1.im.toFixed(3)}A${g.r.toFixed(3)} ${g.r.toFixed(3)} 0 0 ${sweep} ${z2.re.toFixed(3)} ${z2.im.toFixed(3)}`;
}

export interface TilingOptions {
  /** How many rings of reflection to generate. 2–3 is plenty for a faint background. */
  depth?: number;
  /** Stop generating tiles whose centroid is farther than this from the origin (0..1). */
  maxAbs?: number;
  /** Rotate the whole tiling by this many radians (lets pages that share a {p,q} look different). */
  rotOffset?: number;
}

/**
 * Returns a deduplicated list of SVG path "d" strings for the edges of a
 * regular {p,q} hyperbolic tiling, in [-1,1] disk coordinates. Requires
 * 1/p + 1/q < 1/2 or the tiling is not hyperbolic (it will still compute,
 * but the classic Escher "Circle Limit" look needs the hyperbolic case).
 */
export function generateTilingEdges(p: number, q: number, options: TilingOptions = {}): string[] {
  const { depth = 3, maxAbs = 0.9, rotOffset = 0 } = options;
  const base = regularPolygon(p, q, rotOffset);
  const seenPoly = new Set<string>([keyOfPoint(centroid(base))]);
  const edgeMap = new Map<string, string>();

  const addPolyEdges = (poly: Complex[]) => {
    for (let i = 0; i < poly.length; i++) {
      const z1 = poly[i];
      const z2 = poly[(i + 1) % poly.length];
      const ek = edgeKey(z1, z2);
      if (!edgeMap.has(ek)) edgeMap.set(ek, arcPathForEdge(z1, z2));
    }
  };

  addPolyEdges(base);
  let frontier = [base];
  for (let d = 0; d < depth; d++) {
    const next: Complex[][] = [];
    for (const poly of frontier) {
      for (let i = 0; i < poly.length; i++) {
        const z1 = poly[i];
        const z2 = poly[(i + 1) % poly.length];
        const g = geodesic(z1, z2);
        const refl = poly.map((v) => reflect(v, g));
        const c = centroid(refl);
        if (Math.hypot(c.re, c.im) > maxAbs) continue;
        const k = keyOfPoint(c);
        if (seenPoly.has(k)) continue;
        seenPoly.add(k);
        addPolyEdges(refl);
        next.push(refl);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }

  return Array.from(edgeMap.values());
}
