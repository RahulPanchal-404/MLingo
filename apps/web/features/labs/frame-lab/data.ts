import { makeRng } from "@/features/labs/engine/random";

import type { PlotPoint } from "./types";

export type Labelled = { x: number; y: number; c: number };

/** Split into training and held-out test points, deterministically. */
export function split<T>(items: T[], testShare: number, seed: number): { train: T[]; test: T[] } {
  const rng = makeRng(seed + 1000);
  const order = items.map((item, i) => ({ item, key: rng.uniform(), i })).sort((a, b) => a.key - b.key);
  const nTest = Math.round(items.length * testShare);
  return { test: order.slice(0, nTest).map((o) => o.item), train: order.slice(nTest).map((o) => o.item) };
}

/** Two interleaving half-moons: a curved border that a straight line can't follow. */
export function moons(samples: number, noise: number, seed: number): Labelled[] {
  const rng = makeRng(seed);
  return Array.from({ length: samples }, (_, i) => {
    const c = i % 2;
    const t = Math.PI * rng.uniform();
    const x = c === 0 ? Math.cos(t) : 1 - Math.cos(t);
    const y = c === 0 ? Math.sin(t) : 0.5 - Math.sin(t);
    return { x: x + rng.normal(0, noise), y: y + rng.normal(0, noise), c };
  });
}

/** Two Gaussian blobs, overlapping more as spread grows. */
export function blobs(samples: number, spread: number, seed: number, gap = 1.2): Labelled[] {
  const rng = makeRng(seed);
  return Array.from({ length: samples }, (_, i) => {
    const c = i % 2;
    const m = c === 0 ? -gap / 2 : gap / 2;
    return { x: rng.normal(m, spread), y: rng.normal(m, spread), c };
  });
}

/** y = sin(2πx) on [0, 1] plus noise: a smooth curve to fit. */
export function sine(samples: number, noise: number, seed: number) {
  const rng = makeRng(seed);
  return Array.from({ length: samples }, () => {
    const x = rng.uniform();
    return { x, y: Math.sin(2 * Math.PI * x) + rng.normal(0, noise) };
  });
}
export const sineTruth = (n = 120): [number, number][] => Array.from({ length: n + 1 }, (_, i) => [i / n, Math.sin((2 * Math.PI * i) / n)]);

/** Correlated 2-D cloud stretched along a tilted direction. */
export function stretchedCloud(samples: number, angleDeg: number, ratio: number, seed: number) {
  const rng = makeRng(seed);
  const a = (angleDeg * Math.PI) / 180;
  return Array.from({ length: samples }, () => {
    const u = rng.normal(0, 1);
    const v = rng.normal(0, 1 / Math.max(ratio, 1));
    return { x: u * Math.cos(a) - v * Math.sin(a), y: u * Math.sin(a) + v * Math.cos(a) };
  });
}

export const toPlot = (train: Labelled[], test: Labelled[] = []): PlotPoint[] => [...train.map((p) => ({ ...p })), ...test.map((p) => ({ ...p, test: true }))];

export function bounds(points: { x: number; y: number }[], pad = 0.15): { x: [number, number]; y: [number, number] } {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const px = (x1 - x0) * pad || 1;
  const py = (y1 - y0) * pad || 1;
  return { x: [x0 - px, x1 + px], y: [y0 - py, y1 + py] };
}

/** Evaluate a classifier on an n x n grid over the domain (row by row from the bottom). */
export function grid(domain: { x: [number, number]; y: [number, number] }, n: number, f: (x: number, y: number) => number) {
  const values: number[] = [];
  for (let r = 0; r < n; r += 1) {
    const y = domain.y[0] + ((r + 0.5) / n) * (domain.y[1] - domain.y[0]);
    for (let c = 0; c < n; c += 1) values.push(f(domain.x[0] + ((c + 0.5) / n) * (domain.x[1] - domain.x[0]), y));
  }
  return { n, values };
}

export const acc = (pred: (p: Labelled) => number, pts: Labelled[]) => (pts.length ? pts.filter((p) => pred(p) === p.c).length / pts.length : 0);
export const pct = (v: number) => `${Math.round(v * 100)}%`;
export const num = (v: number, d = 3) => (Math.abs(v) >= 100 ? v.toFixed(0) : Number(v.toPrecision(d)).toString());
