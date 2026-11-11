/** Star Mapper: pure logic. Agglomerative (hierarchical) clustering and DBSCAN on star fields. */
import { gaussian, mulberry32 } from "../framework/math";

export type Star = { x: number; y: number; label: number };
export type Linkage = "single" | "complete" | "average";
export type Merge = { a: number; b: number; height: number; id: number; size: number };

export function blobs(seed: number, centers: [number, number][], n: number, spread: number): Star[] {
  const g = gaussian(mulberry32(seed));
  return centers.flatMap(([cx, cy], label) => Array.from({ length: n }, () => ({ x: cx + spread * g(), y: cy + spread * g(), label })));
}

/** Agglomerative clustering. Cluster ids: 0..n-1 are stars, n.. are merges in order. */
export function agglomerate(stars: Star[], linkage: Linkage): Merge[] {
  const n = stars.length;
  const d = (i: number, j: number) => Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y);
  let clusters = stars.map((_, i) => ({ id: i, members: [i] }));
  const merges: Merge[] = [];
  const link = (A: number[], B: number[]) => {
    let s = linkage === "single" ? Infinity : linkage === "complete" ? -Infinity : 0;
    for (const i of A)
      for (const j of B) {
        const v = d(i, j);
        if (linkage === "single") s = Math.min(s, v);
        else if (linkage === "complete") s = Math.max(s, v);
        else s += v;
      }
    return linkage === "average" ? s / (A.length * B.length) : s;
  };
  while (clusters.length > 1) {
    let bi = 0;
    let bj = 1;
    let bd = Infinity;
    for (let i = 0; i < clusters.length; i++)
      for (let j = i + 1; j < clusters.length; j++) {
        const v = link(clusters[i].members, clusters[j].members);
        if (v < bd) {
          bd = v;
          bi = i;
          bj = j;
        }
      }
    const merged = { id: n + merges.length, members: [...clusters[bi].members, ...clusters[bj].members] };
    merges.push({ a: clusters[bi].id, b: clusters[bj].id, height: bd, id: merged.id, size: merged.members.length });
    clusters = clusters.filter((_, k) => k !== bi && k !== bj).concat(merged);
  }
  return merges;
}

/** Labels after applying the first `count` merges. */
export function labelsAfter(n: number, merges: Merge[], count: number): number[] {
  const parent = Array.from({ length: n + merges.length }, (_, i) => i);
  const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  for (const m of merges.slice(0, count)) {
    parent[find(m.a)] = m.id;
    parent[find(m.b)] = m.id;
  }
  const roots = new Map<number, number>();
  return Array.from({ length: n }, (_, i) => {
    const r = find(i);
    if (!roots.has(r)) roots.set(r, roots.size);
    return roots.get(r)!;
  });
}
export const cutAtHeight = (n: number, merges: Merge[], h: number) => labelsAfter(n, merges, merges.filter((m) => m.height <= h).length);
export const cutToK = (n: number, merges: Merge[], k: number) => labelsAfter(n, merges, n - k);

/** Leaf order for drawing the dendrogram without crossings. */
export function leafOrder(n: number, merges: Merge[]): number[] {
  const kids = new Map(merges.map((m) => [m.id, [m.a, m.b]]));
  const out: number[] = [];
  const walk = (id: number) => (id < n ? out.push(id) : kids.get(id)!.forEach(walk));
  walk(merges[merges.length - 1].id);
  return out;
}

export function dbscan(stars: Star[], eps: number, minPts: number): number[] {
  const n = stars.length;
  const label = new Array<number>(n).fill(-2);
  const near = (i: number) => stars.map((_, j) => j).filter((j) => Math.hypot(stars[i].x - stars[j].x, stars[i].y - stars[j].y) <= eps);
  let c = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] !== -2) continue;
    const seeds = near(i);
    if (seeds.length < minPts) {
      label[i] = -1;
      continue;
    }
    label[i] = c;
    const q = [...seeds];
    while (q.length) {
      const j = q.pop()!;
      if (label[j] === -1) label[j] = c;
      if (label[j] !== -2) continue;
      label[j] = c;
      const more = near(j);
      if (more.length >= minPts) q.push(...more);
    }
    c++;
  }
  return label;
}

/**
 * Pair-counting F1: how well two groupings agree, ignoring cluster ids.
 * Noise (−1) counts as each star being on its own.
 */
export function pairF1(assign: number[], labels: number[]): number {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  for (let i = 0; i < assign.length; i++)
    for (let j = i + 1; j < assign.length; j++) {
      const same = assign[i] >= 0 && assign[i] === assign[j];
      const truth = labels[i] >= 0 && labels[i] === labels[j];
      if (same && truth) tp++;
      else if (same) fp++;
      else if (truth) fn++;
    }
  return tp ? (2 * tp) / (2 * tp + fp + fn) : 0;
}
export const f1Score = (f1: number) => Math.round(1000 * Math.max(0, Math.min(1, (f1 - 0.45) / 0.5)) ** 1.2);

// ---------- fields ----------
export const DENDRO_FIELDS: { name: string; stars: Star[] }[] = [
  { name: "Triple cluster", stars: blobs(1001, [[2, 2], [8, 3], [5, 8]], 14, 0.8) },
  { name: "Four galaxies", stars: blobs(1002, [[2, 2], [8, 2], [2, 8], [8, 8]], 12, 0.75) },
  { name: "Twin nebulae", stars: blobs(1003, [[3, 5], [7.5, 5]], 18, 1.0) },
];

function chain(seed: number, from: [number, number], to: [number, number], n: number, label: number, jitter: number): Star[] {
  const g = gaussian(mulberry32(seed));
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    return { x: from[0] + (to[0] - from[0]) * t + jitter * g(), y: from[1] + (to[1] - from[1]) * t + jitter * g(), label };
  });
}
function ring(seed: number, cx: number, cy: number, r: number, n: number, label: number): Star[] {
  const g = gaussian(mulberry32(seed));
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return { x: cx + r * Math.cos(a) + 0.12 * g(), y: cy + r * Math.sin(a) + 0.12 * g(), label };
  });
}

/** Linkage level: the right linkage differs per field. */
export const LINKAGE_FIELDS: { name: string; stars: Star[]; k: number; best: Linkage }[] = [
  { name: "Parallel streams", stars: [...chain(1101, [1, 3], [9, 4], 26, 0, 0.12), ...chain(1102, [1, 6.5], [9, 7.5], 26, 1, 0.12)], k: 2, best: "single" },
  {
    name: "Bridged galaxies",
    stars: [...blobs(1103, [[2.5, 5], [7.5, 5]], 20, 0.7), ...chain(1104, [3.4, 5], [6.6, 5], 7, -1, 0.05).map((s, i) => ({ ...s, label: i < 4 ? 0 : 1 }))],
    k: 2,
    best: "complete",
  },
  { name: "Halo and core", stars: [...ring(1105, 5, 5, 3.6, 40, 0), ...blobs(1106, [[5, 5]], 14, 0.45).map((s) => ({ ...s, label: 1 }))], k: 2, best: "single" },
];

export const EPS_FIELDS: { name: string; stars: Star[]; minPts: number }[] = [
  { name: "Open clusters", stars: blobs(1201, [[3, 3], [6.6, 3.4], [4.8, 6.9]], 22, 0.6), minPts: 4 },
  { name: "Spiral arms", stars: [...chain(1202, [1, 2], [6, 8], 34, 0, 0.18), ...chain(1203, [2.6, 1.2], [7.6, 7.2], 34, 1, 0.18)], minPts: 4 },
  { name: "Ring nebula", stars: [...ring(1204, 5, 5, 3.5, 50, 0), ...ring(1205, 5, 5, 1.3, 26, 1)], minPts: 4 },
];
export const EPS_VALUES = Array.from({ length: 40 }, (_, i) => 0.1 + i * 0.05);
export const bestEpsF1 = (stars: Star[], minPts: number) => Math.max(...EPS_VALUES.map((e) => pairF1(dbscan(stars, e, minPts), stars.map((s) => s.label))));

/** Noise level: clusters plus scattered space dust (label −1). */
function dusty(seed: number, centers: [number, number][]): Star[] {
  const r = mulberry32(seed + 7);
  const dust = Array.from({ length: 45 }, () => ({ x: r() * 10, y: r() * 10, label: -1 }));
  return [...blobs(seed, centers, 20, 0.5), ...dust];
}
export const NOISE_FIELDS: { name: string; stars: Star[] }[] = [
  { name: "Dusty sky", stars: dusty(1301, [[3, 3], [7, 7]]) },
  { name: "Storm of dust", stars: dusty(1302, [[2.5, 7], [7.5, 7], [5, 2.5]]) },
  { name: "Lonely pair", stars: dusty(1303, [[3, 6], [7, 4]]) },
];

/** Half for clustering the real stars right, half for flagging the dust as noise (F1 of noise detection). */
export function noiseQuality(stars: Star[], assign: number[]) {
  const real = stars.map((s, i) => (s.label >= 0 ? i : -1)).filter((i) => i >= 0);
  const clusterF1 = pairF1(real.map((i) => assign[i]), real.map((i) => stars[i].label));
  let tp = 0;
  let fp = 0;
  let fn = 0;
  stars.forEach((s, i) => {
    const flagged = assign[i] < 0;
    const dust = s.label < 0;
    if (flagged && dust) tp++;
    else if (flagged) fp++;
    else if (dust) fn++;
  });
  const noiseF1 = tp ? (2 * tp) / (2 * tp + fp + fn) : 0;
  return { clusterF1, noiseF1, score: Math.round(500 * Math.max(0, (clusterF1 - 0.45) / 0.5) ** 1.2 + 500 * noiseF1 ** 1.5) };
}
