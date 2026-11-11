/** Creature Sorter: pure logic. KNN and CART decision trees on 2-feature creature datasets. */
import { gaussian, mean, mulberry32, std } from "../framework/math";

export type C = { a: number; b: number; label: 0 | 1 };
export type Task = { name: string; train: C[]; test: C[]; axes: [string, string] };

/** Two overlapping species. `shape` bends the boundary so KNN and trees have something to learn. */
function creatures(seed: number, n: number, noise: number, shape: "blobs" | "moons" | "xor", flip = 0): C[] {
  const r = mulberry32(seed);
  const g = gaussian(mulberry32(seed + 1));
  const fr = mulberry32(seed + 2);
  return Array.from({ length: n }, (_, i) => {
    const label = (i % 2) as 0 | 1;
    const shown = (fr() < flip ? 1 - label : label) as 0 | 1;
    if (shape === "blobs") return { a: (label ? 6.5 : 3.5) + noise * 1.6 * g(), b: (label ? 6 : 4) + noise * 1.6 * g(), label: shown };
    if (shape === "xor") {
      const qa = r() < 0.5 ? 2.5 : 7.5;
      const qb = label ? (qa < 5 ? 7.5 : 2.5) : qa < 5 ? 2.5 : 7.5;
      return { a: qa + noise * 1.3 * g(), b: qb + noise * 1.3 * g(), label: shown };
    }
    const t = r() * Math.PI;
    const a = label ? 5 + 2.5 * Math.cos(t) : 3 + 2.5 * Math.cos(t);
    const b = label ? 4 - 2.5 * Math.sin(t) + 1.2 : 5 + 2.5 * Math.sin(t) - 1.2;
    return { a: a + 1.1 + noise * g(), b: b + noise * g(), label: shown };
  });
}
/** Training labels include some mislabelled creatures (noise), so memorising the training set hurts. */
const task = (name: string, seed: number, noise: number, shape: "blobs" | "moons" | "xor", axes: [string, string] = ["wing length (cm)", "spots"], flip = 0.15): Task => ({
  name, train: creatures(seed, 80, noise, shape, flip), test: creatures(seed + 99, 120, noise, shape), axes,
});

export const KNN_TASKS: Task[] = [task("Meadow", 701, 0.7, "moons"), task("Swamp", 702, 0.9, "blobs"), task("Cave", 703, 0.6, "xor")];

// Scale level: weight in grams has huge spread but is useless noise; wing length decides the species.
function scaled(seed: number, n: number): C[] {
  const g = gaussian(mulberry32(seed));
  return Array.from({ length: n }, (_, i) => {
    const label = (i % 2) as 0 | 1;
    return { a: (label ? 4.4 : 3.0) + 0.45 * g(), b: 500 + 160 * g() + (label ? 40 : 0), label };
  });
}
export const SCALE_TASKS: Task[] = [801, 802, 803].map((s, i) => ({ name: ["Beetle farm", "Moth house", "Bat roost"][i], train: scaled(s, 80), test: scaled(s + 50, 120), axes: ["wing length (cm)", "weight (g)"] }));

export function standardizer(train: C[]) {
  const ma = mean(train.map((c) => c.a));
  const mb = mean(train.map((c) => c.b));
  const sa = std(train.map((c) => c.a));
  const sb = std(train.map((c) => c.b));
  return (c: { a: number; b: number }) => ({ a: (c.a - ma) / sa, b: (c.b - mb) / sb });
}

export function knnPredict(train: C[], k: number, q: { a: number; b: number }, tf = (c: { a: number; b: number }) => c): 0 | 1 {
  const tq = tf(q);
  const d = train.map((c) => {
    const t = tf(c);
    return { d: (t.a - tq.a) ** 2 + (t.b - tq.b) ** 2, l: c.label };
  });
  d.sort((x, y) => x.d - y.d);
  const votes = d.slice(0, k).reduce((s, x) => s + x.l, 0);
  return votes * 2 > k ? 1 : 0;
}
export const accuracy = (pred: (c: C) => 0 | 1, data: C[]) => data.filter((c) => pred(c) === c.label).length / data.length;
export const KS = [1, 3, 5, 7, 9, 11, 15, 21, 31, 45, 79];
export const bestKnnAcc = (t: Task) => Math.max(...KS.map((k) => accuracy((c) => knnPredict(t.train, k, c), t.test)));

/** 1000 at the best achievable test accuracy, 0 at coin-flip level. */
export const accScore = (acc: number, best: number) => Math.round(1000 * Math.max(0, Math.min(1, (acc - 0.5) / Math.max(0.01, best - 0.5))) ** 1.3);

// ---------- decision trees ----------
export type Split = { feature: "a" | "b"; t: number };
export type Node = { leaf: true; label: 0 | 1; n: number } | { leaf: false; split: Split; left: Node; right: Node; n: number; label?: 0 | 1 };

export const gini = (data: C[]) => {
  if (!data.length) return 0;
  const p = data.filter((c) => c.label === 1).length / data.length;
  return 1 - p * p - (1 - p) * (1 - p);
};
export const majority = (data: C[]): 0 | 1 => (data.filter((c) => c.label === 1).length * 2 > data.length ? 1 : 0);
export const go = (c: { a: number; b: number }, s: Split) => c[s.feature] < s.t;

/** Weighted Gini of the two children; lower is better. */
export function splitGini(data: C[], s: Split) {
  const L = data.filter((c) => go(c, s));
  const R = data.filter((c) => !go(c, s));
  return (L.length * gini(L) + R.length * gini(R)) / data.length;
}

function candidates(data: C[]): Split[] {
  const out: Split[] = [];
  for (const f of ["a", "b"] as const) {
    const vs = [...new Set(data.map((c) => c[f]))].sort((x, y) => x - y);
    for (let i = 1; i < vs.length; i++) out.push({ feature: f, t: (vs[i - 1] + vs[i]) / 2 });
  }
  return out;
}

export function bestSplit(data: C[]): Split | null {
  let best: Split | null = null;
  let bg = gini(data) - 1e-9;
  for (const s of candidates(data)) {
    const g = splitGini(data, s);
    if (g < bg) {
      bg = g;
      best = s;
    }
  }
  return best;
}

export function buildTree(data: C[], depth: number): Node {
  if (depth === 0 || gini(data) === 0 || data.length < 2) return { leaf: true, label: majority(data), n: data.length };
  const s = bestSplit(data);
  if (!s) return { leaf: true, label: majority(data), n: data.length };
  return { leaf: false, split: s, left: buildTree(data.filter((c) => go(c, s)), depth - 1), right: buildTree(data.filter((c) => !go(c, s)), depth - 1), n: data.length, label: majority(data) };
}
/** Predict, optionally stopping after `maxDepth` questions (a deep tree read as a shallower one). */
export const treePredict = (n: Node, c: { a: number; b: number }, maxDepth = Infinity): 0 | 1 =>
  n.leaf ? n.label : maxDepth <= 0 && n.label !== undefined ? n.label : treePredict(go(c, n.split) ? n.left : n.right, c, maxDepth - 1);
const fullTrees = new WeakMap<C[], Node>();
/** The depth-12 tree for a training set, built once. Shallower trees are the same tree read to fewer levels. */
export function fullTree(train: C[]): Node {
  if (!fullTrees.has(train)) fullTrees.set(train, buildTree(train, 12));
  return fullTrees.get(train)!;
}
export const DEPTHS = Array.from({ length: 12 }, (_, i) => i + 1);
export const DEPTH_TASKS: Task[] = [task("Jungle", 901, 1.0, "moons"), task("Reef", 902, 1.15, "blobs"), task("Tundra", 903, 0.9, "xor")];
export const bestDepthAcc = (t: Task) => Math.max(...DEPTHS.map((d) => accuracy((c) => treePredict(fullTree(t.train), c, d), t.test)));

/** Manual tree-building level: hand-picked questions per node, one is clearly best. */
export const TREE_TASKS: Task[] = [task("Forest", 951, 0.55, "xor", ["leg length (cm)", "fur (mm)"], 0), task("Desert", 952, 0.6, "xor", ["tail (cm)", "ear size (cm)"], 0)];

/** A few readable candidate questions for a node: the best split on each feature plus some decoys. */
export function questionsFor(data: C[]): Split[] {
  const out: Split[] = [];
  for (const f of ["a", "b"] as const) {
    const cands = candidates(data).filter((s) => s.feature === f);
    if (!cands.length) continue;
    const sorted = [...cands].sort((x, y) => splitGini(data, x) - splitGini(data, y));
    const pick = [sorted[0], sorted[Math.floor(sorted.length / 2)], sorted[sorted.length - 1]];
    for (const p of pick) out.push({ feature: f, t: Math.round(p.t * 10) / 10 });
  }
  const uniq = out.filter((s, i) => out.findIndex((o) => o.feature === s.feature && o.t === s.t) === i);
  return uniq.sort((x, y) => (x.feature === y.feature ? x.t - y.t : x.feature < y.feature ? -1 : 1));
}
/** Points for choosing `s` at a node: impurity drop relative to the best available question. */
export function questionScore(data: C[], s: Split, options: Split[]): number {
  const g0 = gini(data);
  const drop = g0 - splitGini(data, s);
  const best = Math.max(...options.map((o) => g0 - splitGini(data, o)));
  return best <= 0 ? 1000 : Math.round(1000 * Math.max(0, drop / best) ** 1.5);
}
