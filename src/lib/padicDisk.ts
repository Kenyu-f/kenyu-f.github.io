// A "p-adic disk": visualizes the ultrametric structure of Z_p (or a ball in
// Q_p) as self-similar nested circles. In an ultrametric space, any two
// balls are either disjoint or one contains the other entirely — never a
// partial overlap. That's exactly what tangent-circle packing gives us: a
// parent disk of radius R contains p children, each internally tangent to
// the parent and tangent to their neighbors, and each child recurses the
// same way. This is the classic picture for "p-adic integers as a disk
// divided into p residue classes mod p, each divided into p classes mod p^2,
// and so on."
//
// Runs at build time only (pure math, no DOM); output is a flat list of
// circles, which render as native <circle> SVG elements — even cheaper than
// the hyperbolic tiling's arc paths.

export interface PadicCircle {
  cx: number;
  cy: number;
  r: number;
  level: number;
}

export interface PadicOptions {
  /** How many levels of subdivision (residues mod p, mod p^2, ...). */
  depth?: number;
  rotOffset?: number;
}

function packChildren(
  cx: number,
  cy: number,
  R: number,
  p: number,
  depth: number,
  rotOffset: number,
  level: number,
  out: PadicCircle[]
) {
  if (depth <= 0) return;
  // p equal circles in a ring inside radius R, mutually tangent and
  // internally tangent to the parent boundary.
  const s = Math.sin(Math.PI / p);
  const r = (R * s) / (1 + s);
  const distFromCenter = R - r;
  for (let k = 0; k < p; k++) {
    const theta = (2 * Math.PI * k) / p + rotOffset;
    const ccx = cx + distFromCenter * Math.cos(theta);
    const ccy = cy + distFromCenter * Math.sin(theta);
    out.push({ cx: ccx, cy: ccy, r, level });
    // Nudge each level's starting angle so children don't line up in a grid.
    packChildren(ccx, ccy, r, p, depth - 1, rotOffset + Math.PI / p + level * 0.15, level + 1, out);
  }
}

/** Returns the circles of a p-adic disk (excludes the outer unit boundary, drawn separately). */
export function generatePadicDisk(p: number, options: PadicOptions = {}): PadicCircle[] {
  const { depth = 4, rotOffset = 0 } = options;
  const out: PadicCircle[] = [];
  packChildren(0, 0, 1, p, depth, rotOffset, 0, out);
  return out;
}
