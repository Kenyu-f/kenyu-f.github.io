// A regular icosahedron's edges, precomputed as CSS 3D transform
// parameters. Each edge becomes a thin absolutely-positioned <div> that is
// translated to the edge's midpoint and rotated (via rotate3d) so its long
// axis lies along the edge — the standard "CSS line between two 3D points"
// technique. Because every edge is a *true* 3D-positioned element inside a
// `transform-style: preserve-3d` scene, a single CSS @keyframes rotateY
// animation on the parent makes the whole shape spin correctly — the
// browser recomputes the 3D projection every frame on its own. No
// JavaScript, no per-frame recomputation on our end.
//
// This is offered as a rotating icosahedron motif in the spirit of the
// {3,5,3} icosahedral honeycomb (regular icosahedra tiling hyperbolic
// 3-space) — not a geometrically exact hyperbolic tessellation. A faithful
// {3,5,3} honeycomb only closes up under hyperbolic dihahedral angles
// (icosahedra meet at exactly 120° there, vs. ~138.2° in flat space), which
// has no meaning in ordinary Euclidean CSS 3D space. What's rendered here
// is concentric icosahedral shells, evoking the way cells recede toward the
// boundary sphere in the Poincaré ball picture of that honeycomb.

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EdgeTransform {
  mid: Vec3;
  length: number;
  axis: Vec3;
  angleDeg: number;
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}
function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}
function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}
function cross(a: Vec3, b: Vec3): Vec3 {
  return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
}
function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}
function norm(a: Vec3): number {
  return Math.hypot(a.x, a.y, a.z);
}
function normalize(a: Vec3): Vec3 {
  const n = norm(a);
  return n < 1e-12 ? { x: 0, y: 0, z: 0 } : scale(a, 1 / n);
}

/** The 12 vertices of a regular icosahedron, normalized to unit circumradius. */
function icosahedronVertices(): Vec3[] {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: Vec3[] = [];
  for (const s1 of [1, -1]) {
    for (const s2 of [1, -1]) {
      raw.push({ x: 0, y: s1 * 1, z: s2 * phi });
      raw.push({ x: s1 * 1, y: s2 * phi, z: 0 });
      raw.push({ x: s2 * phi, y: 0, z: s1 * 1 });
    }
  }
  const seen = new Set<string>();
  const verts: Vec3[] = [];
  for (const v of raw) {
    const k = `${v.x.toFixed(6)},${v.y.toFixed(6)},${v.z.toFixed(6)}`;
    if (!seen.has(k)) {
      seen.add(k);
      verts.push(v);
    }
  }
  const R = norm(verts[0]);
  return verts.map((v) => scale(v, 1 / R));
}

/** The 30 edges (as vertex index pairs) — nearest-neighbor pairs of the icosahedron. */
function icosahedronEdgeIndices(verts: Vec3[]): Array<[number, number]> {
  let minD = Infinity;
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      const d = norm(sub(verts[i], verts[j]));
      if (d < minD) minD = d;
    }
  }
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      if (Math.abs(norm(sub(verts[i], verts[j])) - minD) < 1e-6) edges.push([i, j]);
    }
  }
  return edges;
}

function edgeTransform(p1: Vec3, p2: Vec3): EdgeTransform {
  const d = sub(p2, p1);
  const length = norm(d);
  const dirN = normalize(d);
  const ref: Vec3 = { x: 0, y: 1, z: 0 }; // the div's untransformed long axis
  const axisRaw = cross(ref, dirN);
  const axis = norm(axisRaw) < 1e-9 ? { x: 1, y: 0, z: 0 } : normalize(axisRaw);
  const cosAngle = Math.max(-1, Math.min(1, dot(ref, dirN)));
  const angleDeg = (Math.acos(cosAngle) * 180) / Math.PI;
  const mid = scale(add(p1, p2), 0.5);
  return { mid, length, axis, angleDeg };
}

/** Returns the 30 edge transforms for a regular icosahedron of the given circumradius. */
export function generateIcosahedronEdges(radius: number): EdgeTransform[] {
  const verts = icosahedronVertices().map((v) => scale(v, radius));
  const edgeIdx = icosahedronEdgeIndices(icosahedronVertices());
  return edgeIdx.map(([i, j]) => edgeTransform(verts[i], verts[j]));
}
