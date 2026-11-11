/** Cluster Wars: pure logic. Real k-means (Lloyd) and DBSCAN on small seeded datasets. */
import { gaussian, mean, mulberry32, std } from "../framework/math";

export type P = { x: number; y: number; label: number };
type XY = [number, number];

export function blobs(seed: number, centers: XY[], n: number, spread: number): P[] {
  const g = gaussian(mulberry32(seed));
  return centers.flatMap(([cx, cy], label) => Array.from({ length: n }, () => ({ x: cx + spread * g(), y: cy + spread * g(), label })));
}

export function rings(seed: number): P[] {
  const r = mulberry32(seed);
  const g = gaussian(mulberry32(seed + 1));
  return [1.2, 4].flatMap((radius, label) =>
    Array.from({ length: 60 }, () => {
      const a = r() * Math.PI * 2;
      return { x: radius * Math.cos(a) + 0.12 * g(), y: radius * Math.sin(a) + 0.12 * g(), label };
    }),
  );
}

export function moons(seed: number): P[] {
  const r = mulberry32(seed);
  const g = gaussian(mulberry32(seed + 1));
  return Array.from({ length: 120 }, (_, i) => {
    const upper = i % 2 === 0;
    const a = r() * Math.PI;
    return { x: (upper ? Math.cos(a) : 1 - Math.cos(a)) + 0.08 * g(), y: (upper ? Math.sin(a) : 0.45 - Math.sin(a)) + 0.08 * g(), label: upper ? 0 : 1 };
  });
}

/** Customers: income (k per year) has big raw numbers; two segments differ only in visits per month. */
export function customers(seed: number): P[] {
  const g = gaussian(mulberry32(seed));
  const segs: XY[] = [[60, 3], [60, 24], [170, 13]];
  return segs.flatMap(([income, visits], label) =>
    Array.from({ length: 30 }, () => ({ x: Math.max(10, income + 30 * g()), y: Math.max(0.5, visits + 1.5 * g()), label })),
  );
}

export const xy = (pts: P[]): XY[] => pts.map((p) => [p.x, p.y]);

export function standardize(pts: XY[]): { z: XY[]; back: (c: XY) => XY } {
  const mx = mean(pts.map((p) => p[0]));
  const my = mean(pts.map((p) => p[1]));
  const sx = std(pts.map((p) => p[0]));
  const sy = std(pts.map((p) => p[1]));
  return { z: pts.map(([x, y]) => [(x - mx) / sx, (y - my) / sy]), back: ([x, y]) => [x * sx + mx, y * sy + my] };
}

// ---------- k-means ----------
export type Frame = { centroids: XY[]; assign: number[]; inertia: number };

function assignTo(points: XY[], centroids: XY[]): number[] {
  return points.map(([x, y]) => {
    let best = 0;
    let bd = Infinity;
    centroids.forEach(([cx, cy], k) => {
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < bd) {
        bd = d;
        best = k;
      }
    });
    return best;
  });
}
const inertiaOf = (points: XY[], centroids: XY[], assign: number[]) =>
  points.reduce((s, [x, y], i) => s + (x - centroids[assign[i]][0]) ** 2 + (y - centroids[assign[i]][1]) ** 2, 0);

/** Every iteration of Lloyd's algorithm as a frame, so it can be animated. The last frame is the converged result. */
export function kmeansFrames(points: XY[], init: XY[], maxIter = 60): Frame[] {
  let centroids = init.map((c) => [...c] as XY);
  const frames: Frame[] = [];
  let prev: number[] = [];
  for (let it = 0; it < maxIter; it++) {
    const assign = assignTo(points, centroids);
    frames.push({ centroids, assign, inertia: inertiaOf(points, centroids, assign) });
    if (prev.length && assign.every((a, i) => a === prev[i])) break;
    prev = assign;
    centroids = centroids.map((c, k) => {
      const m = points.filter((_, i) => assign[i] === k);
      return m.length ? ([mean(m.map((q) => q[0])), mean(m.map((q) => q[1]))] as XY) : c;
    });
  }
  return frames;
}

export function kmeansPlusPlus(points: XY[], k: number, seed: number): XY[] {
  const rand = mulberry32(seed);
  const chosen: XY[] = [points[Math.floor(rand() * points.length)]];
  while (chosen.length < k) {
    const d = points.map(([x, y]) => Math.min(...chosen.map(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2)));
    let r = rand() * d.reduce((a, b) => a + b, 0);
    let idx = 0;
    for (; idx < d.length - 1 && r > d[idx]; idx++) r -= d[idx];
    chosen.push(points[idx]);
  }
  return chosen;
}

export function bestOf(points: XY[], k: number, restarts: number): Frame {
  let best: Frame | null = null;
  for (let r = 0; r < restarts; r++) {
    const frames = kmeansFrames(points, kmeansPlusPlus(points, k, 1 + r * 97));
    const last = frames[frames.length - 1];
    if (!best || last.inertia < best.inertia) best = last;
  }
  return best!;
}

// ---------- DBSCAN ----------
/** Density clustering. Noise points all share one extra cluster id so purity can be computed. */
export function dbscan(points: XY[], eps: number, minPts: number): number[] {
  const n = points.length;
  const label = new Array<number>(n).fill(-2);
  const near = (i: number) => points.map((_, j) => j).filter((j) => Math.hypot(points[i][0] - points[j][0], points[i][1] - points[j][1]) <= eps);
  let cluster = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] !== -2) continue;
    const seeds = near(i);
    if (seeds.length < minPts) {
      label[i] = -1;
      continue;
    }
    label[i] = cluster;
    const queue = [...seeds];
    while (queue.length) {
      const j = queue.pop()!;
      if (label[j] === -1) label[j] = cluster;
      if (label[j] !== -2) continue;
      label[j] = cluster;
      const more = near(j);
      if (more.length >= minPts) queue.push(...more);
    }
    cluster++;
  }
  return label.map((l) => (l < 0 ? cluster : l));
}

export function purity(assign: number[], labels: number[]): number {
  const byCluster = new Map<number, number[]>();
  assign.forEach((a, i) => byCluster.set(a, [...(byCluster.get(a) ?? []), labels[i]]));
  let correct = 0;
  byCluster.forEach((ls) => {
    const counts = new Map<number, number>();
    ls.forEach((l) => counts.set(l, (counts.get(l) ?? 0) + 1));
    correct += Math.max(...counts.values());
  });
  return correct / labels.length;
}

/** Purity 0.55 (barely better than guessing) → 0, purity 0.95+ → 1000. */
export const purityScore = (p: number) => Math.round(1000 * Math.max(0, Math.min(1, (p - 0.55) / 0.4)));

// ---------- level tasks ----------
export const ELBOW_TASKS = [
  { trueK: 3, points: blobs(51, [[2, 2], [8, 3], [5, 8.5]], 30, 0.9) },
  { trueK: 4, points: blobs(52, [[2, 2], [8, 3], [2.5, 8], [8.5, 8.5]], 28, 0.8) },
  { trueK: 5, points: blobs(54, [[1.5, 2], [5, 5], [8.5, 2], [2, 8.5], [8.5, 8.5]], 24, 0.75) },
];
export const elbowScore = (picked: number, trueK: number) => [1000, 550, 200][Math.abs(picked - trueK)] ?? 0;
export const elbowCurve = (pts: P[]) => Array.from({ length: 8 }, (_, i) => bestOf(xy(pts), i + 1, 6));

export const START_TASKS = [
  blobs(53, [[2, 8], [8, 8], [2, 2], [8, 2]], 30, 0.8),
  blobs(56, [[2, 5], [5, 5.3], [8, 5], [5, 9]], 30, 0.7),
  blobs(57, [[1.5, 1.5], [4, 2], [8, 8], [8.5, 4.5]], 30, 0.75),
].map((points) => ({ points, best: bestOf(xy(points), 4, 20).inertia }));
export const startScore = (inertia: number, best: number, runs: number) =>
  Math.max(0, Math.round(1000 * Math.min(1, best / inertia) ** 2) - 150 * (runs - 1));

export const UNIT_TASKS = [58, 59, 60].map((seed) => customers(seed));
export const unitScore = (purityValue: number, runs: number) => Math.max(0, purityScore(purityValue) - 150 * (runs - 1));

export const TOOL_TASKS: { name: string; points: P[]; eps: number; minPts: number }[] = [
  { name: "Three tidy groups", points: blobs(61, [[2, 2], [8, 3], [5, 8]], 30, 0.8), eps: 0.9, minPts: 4 },
  { name: "Rings", points: rings(62), eps: 0.8, minPts: 4 },
  { name: "Moons", points: moons(63), eps: 0.22, minPts: 4 },
];

/** Level 1 economy: each dog costs a wage; walking distance is inertia. The wage is set so the cheapest total is at the true K. */
export function dogWage(curve: number[], trueK: number): number {
  const drop = (k: number) => curve[k - 2] - curve[k - 1];
  return Math.sqrt(drop(trueK) * drop(trueK + 1));
}
export const totalCost = (curve: number[], k: number, wage: number) => curve[k - 1] + wage * k;
