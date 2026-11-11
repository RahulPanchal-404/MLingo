/**
 * Cluster Wars (Chapter 3: K-Means). Real Lloyd's algorithm on fixed seeded datasets.
 */
import { fmt, gaussian, mean, mulberry32, pct, std } from "../framework/math";
import type { Evaluation, LevelDef, Params } from "../framework/types";

export type Pt = { x: number; y: number; label: number };

function blobs(seed: number, centers: [number, number][], n: number, spread: number): Pt[] {
  const g = gaussian(mulberry32(seed));
  const out: Pt[] = [];
  centers.forEach(([cx, cy], label) => {
    for (let i = 0; i < n; i++) out.push({ x: cx + spread * g(), y: cy + spread * g(), label });
  });
  return out;
}

export type KMeansResult = { assign: number[]; centroids: [number, number][]; inertia: number; iterations: number };

export function kmeans(points: [number, number][], init: [number, number][], maxIter = 100): KMeansResult {
  let centroids = init.map((c) => [...c] as [number, number]);
  let assign = new Array(points.length).fill(0);
  let iterations = 0;
  for (; iterations < maxIter; iterations++) {
    const next = points.map(([x, y]) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach(([cx, cy], k) => {
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < bestD) {
          bestD = d;
          best = k;
        }
      });
      return best;
    });
    const moved = centroids.map((c, k) => {
      const members = points.filter((_, i) => next[i] === k);
      return members.length ? ([mean(members.map((m) => m[0])), mean(members.map((m) => m[1]))] as [number, number]) : c;
    });
    const changed = next.some((a, i) => a !== assign[i]) || iterations === 0;
    assign = next;
    centroids = moved;
    if (!changed) break;
  }
  const inertia = points.reduce((s, [x, y], i) => s + (x - centroids[assign[i]][0]) ** 2 + (y - centroids[assign[i]][1]) ** 2, 0);
  return { assign, centroids, inertia, iterations };
}

/** k-means++: spread the starting centroids out, chosen in proportion to squared distance. */
export function kmeansPlusPlus(points: [number, number][], k: number, seed: number): [number, number][] {
  const rand = mulberry32(seed);
  const chosen: [number, number][] = [points[Math.floor(rand() * points.length)]];
  while (chosen.length < k) {
    const d = points.map(([x, y]) => Math.min(...chosen.map(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2)));
    const total = d.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    let idx = 0;
    for (; idx < d.length - 1 && r > d[idx]; idx++) r -= d[idx];
    chosen.push(points[idx]);
  }
  return chosen;
}

export function bestOf(points: [number, number][], k: number, restarts: number, seed = 1): KMeansResult {
  let best: KMeansResult | null = null;
  for (let r = 0; r < restarts; r++) {
    const res = kmeans(points, kmeansPlusPlus(points, k, seed + r * 97));
    if (!best || res.inertia < best.inertia) best = res;
  }
  return best!;
}

/** How many clusters the points of one true group are spread across (ignoring stray points). */
export function piecesOf(assign: number[], labels: number[], label: number): number {
  const counts = new Map<number, number>();
  assign.forEach((a, i) => labels[i] === label && counts.set(a, (counts.get(a) ?? 0) + 1));
  const total = [...counts.values()].reduce((x, y) => x + y, 0);
  return [...counts.values()].filter((c) => c / total >= 0.1).length;
}

/** Share of points whose cluster's majority true label matches their own. */
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

const xy = (pts: Pt[]) => pts.map((p) => [p.x, p.y] as [number, number]);

// ---------- datasets ----------
export const ELBOW_DATA = blobs(51, [[2, 2], [8, 3], [3, 8], [8.5, 8.5]], 30, 0.9);

// The first rows all come from one group, so "first 4 rows" starts every centroid in the same place.
const startCenters: [number, number][] = [[2, 8], [8, 8], [2, 2], [8, 2]];
export const START_DATA = blobs(53, startCenters, 30, 0.8);
const startRows = xy(START_DATA);
export const START_INITS: Record<string, [number, number][]> = {
  first: [startRows[0], startRows[1], startRows[2], startRows[3]],
  random: [startRows[5], startRows[12], startRows[20], startRows[95]],
};
export const START_BEST = bestOf(startRows, 4, 20).inertia;
/** Seed for the single k-means++ run shown in level 2. */
export const KPP_SEED = 1;

// Customers: income (₹k/year) has big raw numbers and wide spread; two segments differ only in visits/month.
const gc = gaussian(mulberry32(58));
const SEGMENTS: [number, number][] = [[50, 3], [55, 24], [150, 13]];
export const CUSTOMER_DATA: Pt[] = SEGMENTS.flatMap(([income, visits], label) =>
  Array.from({ length: 30 }, () => ({ x: Math.max(10, income + 20 * gc()), y: Math.max(0.5, visits + 1.2 * gc()), label })),
);

const rr = mulberry32(61);
const gr = gaussian(mulberry32(62));
export const RING_DATA: Pt[] = [1.2, 4].flatMap((radius, label) =>
  Array.from({ length: label ? 90 : 45 }, () => {
    const a = rr() * Math.PI * 2;
    const rad = radius + 0.25 * gr();
    return { x: 5 + rad * Math.cos(a), y: 5 + rad * Math.sin(a), label };
  }),
);

export const LEVELS: LevelDef[] = [
  {
    id: "elbow",
    number: 1,
    name: "How many groups?",
    brief: "Customers plotted by two behaviours. K-Means needs you to choose K, the number of clusters. When you run it, you'll also see the inertia (total squared distance to centroids) for every K from 1 to 7.",
    objective: "Choose the K at the 'elbow': where adding another cluster stops paying off.",
    lesson: "Inertia always falls as K grows (K = number of points gives zero), so 'lowest inertia' is meaningless. Look for the elbow, where the curve flattens: extra clusters after that just split real groups.",
    controls: [{ kind: "slider", id: "k", label: "K (number of clusters)", min: 1, max: 7, step: 1 }],
    initial: { k: 2 },
  },
  {
    id: "start",
    number: 2,
    name: "Bad luck start",
    brief: "Four obvious groups, K = 4. But K-Means only improves from wherever its centroids start, and it can get stuck. The starting centroids are shown as rings.",
    objective: `Reach inertia within 2% of the best possible (${fmt(START_BEST * 1.02, 0)}).`,
    lesson: "K-Means finds a local optimum, not the global one. Smart starts (k-means++) and running several restarts and keeping the best are how real libraries avoid bad luck.",
    controls: [
      {
        kind: "choice",
        id: "init",
        label: "Starting centroids",
        options: [
          { value: "first", label: "First 4 rows of the data" },
          { value: "random", label: "4 random rows" },
          { value: "kmeanspp", label: "k-means++", detail: "Each new start is picked far from the ones already chosen." },
        ],
      },
      { kind: "toggle", id: "restarts", label: "Run 10 restarts and keep the best", hint: "Restarts use k-means++ starting points." },
    ],
    initial: { init: "first", restarts: false },
  },
  {
    id: "units",
    number: 3,
    name: "Mixed units",
    brief: "Customer income (roughly ₹10k–200k a year) and store visits per month (1–30). There really are three kinds of shoppers. K = 3.",
    objective: "Recover the real segments: cluster purity of 90% or more.",
    lesson: "K-Means uses raw distance, so the feature with the biggest numbers dominates. Income in thousands drowned out visits. Standardize features before clustering.",
    controls: [{ kind: "toggle", id: "standardize", label: "Standardize features (z-score)" }],
    initial: { standardize: false },
  },
  {
    id: "rings",
    number: 4,
    name: "Shapes it can't see",
    brief: "Two groups: an inner ring and an outer ring. Try any K, then decide what's going on.",
    objective: "Give the right verdict about K-Means on this data.",
    lesson: "K-Means assigns each point to its nearest centroid, so its clusters are always round, convex blobs. Rings, moons and spirals need density- or graph-based methods such as DBSCAN or spectral clustering.",
    controls: [
      { kind: "slider", id: "k", label: "K to try", min: 2, max: 6, step: 1 },
      {
        kind: "choice",
        id: "verdict",
        label: "Your verdict",
        options: [
          { value: "longer", label: "K = 2 works if it runs for more iterations" },
          { value: "more-k", label: "Use more clusters and it will match the rings" },
          { value: "scale", label: "Standardize the features first" },
          { value: "wrong-tool", label: "K-Means can't separate rings; use a different algorithm" },
        ],
      },
    ],
    initial: { k: 2, verdict: "longer" },
  },
];

function standardized(pts: Pt[]): [number, number][] {
  const mx = mean(pts.map((p) => p.x));
  const my = mean(pts.map((p) => p.y));
  const sx = std(pts.map((p) => p.x));
  const sy = std(pts.map((p) => p.y));
  return pts.map((p) => [(p.x - mx) / sx, (p.y - my) / sy]);
}

export function evaluate(levelId: string, p: Params): Evaluation {
  if (levelId === "elbow") {
    const k = Number(p.k);
    const rows = xy(ELBOW_DATA);
    const elbow = [1, 2, 3, 4, 5, 6, 7].map((kk) => bestOf(rows, kk, 5).inertia);
    const res = bestOf(rows, k, 5);
    const pass = k === 4;
    return {
      pass,
      score: pass ? 1000 : 0,
      headline: pass ? "K = 4: right at the elbow." : `K = ${k} isn't the elbow.`,
      feedback: pass
        ? `Going from 3 to 4 clusters cut inertia by ${pct(1 - elbow[3] / elbow[2])}; going from 4 to 5 only by ${pct(1 - elbow[4] / elbow[3])}.`
        : k < 4
          ? `Adding one more cluster would still cut inertia by ${pct(1 - elbow[k] / elbow[k - 1])}. That's a big gain, so you haven't reached the elbow.`
          : `Inertia barely improved from K = ${k - 1} (only ${pct(1 - elbow[k - 1] / elbow[k - 2])}). You're splitting real groups. Look where the curve flattens.`,
      metrics: [
        { label: "Your K", value: String(k), good: pass },
        { label: "Inertia at your K", value: fmt(res.inertia, 0) },
      ],
      viz: { assign: res.assign, centroids: res.centroids, elbow, k },
    };
  }

  if (levelId === "start") {
    const rows = xy(START_DATA);
    const restarts = Boolean(p.restarts);
    const init = String(p.init);
    const res = restarts ? bestOf(rows, 4, 10, 5) : kmeans(rows, init === "kmeanspp" ? kmeansPlusPlus(rows, 4, KPP_SEED) : START_INITS[init]);
    const target = START_BEST * 1.02;
    const pass = res.inertia <= target;
    return {
      pass,
      score: pass ? 1000 : Math.round(Math.min(800, (START_BEST / res.inertia) * 800)),
      headline: pass ? `Inertia ${fmt(res.inertia, 0)}: the global optimum.` : `Stuck at inertia ${fmt(res.inertia, 0)}.`,
      feedback: pass
        ? "Every group got its own centroid."
        : "Two centroids are sharing one group while another centroid covers two groups. K-Means can't climb out of this: each step only moves centroids toward their current members. Change how it starts.",
      metrics: [
        { label: "Inertia", value: fmt(res.inertia, 0), good: pass },
        { label: "Best possible", value: fmt(START_BEST, 0) },
        { label: "Iterations", value: String(res.iterations) },
        { label: "Start", value: restarts ? "best of 10" : init },
      ],
      viz: { assign: res.assign, centroids: res.centroids },
    };
  }

  if (levelId === "units") {
    const scaled = Boolean(p.standardize);
    const rows = scaled ? standardized(CUSTOMER_DATA) : xy(CUSTOMER_DATA);
    const res = bestOf(rows, 3, 10);
    const pur = purity(res.assign, CUSTOMER_DATA.map((c) => c.label));
    const pass = pur >= 0.9;
    return {
      pass,
      score: Math.round(pur * 1000),
      headline: `Cluster purity ${pct(pur)}.`,
      feedback: pass
        ? "On the same scale, visits per month finally counts, and the three shopper types separate cleanly."
        : "Two of the clusters are slicing the lower-income customers by income. Income is measured in thousands, so its spread swamps the 20-visit gap that really separates those shoppers.",
      metrics: [
        { label: "Purity", value: pct(pur), good: pass },
        { label: "Target", value: "≥ 90%" },
        { label: "Features scaled", value: scaled ? "yes" : "no" },
      ],
      viz: { assign: res.assign },
    };
  }

  // rings
  const k = Number(p.k);
  const res = bestOf(xy(RING_DATA), k, 5);
  const pur = purity(res.assign, RING_DATA.map((r) => r.label));
  const outerPieces = piecesOf(res.assign, RING_DATA.map((r) => r.label), 1);
  const verdict = String(p.verdict);
  const pass = verdict === "wrong-tool";
  const wrongWhy: Record<string, string> = {
    longer: "K-Means already converged; more iterations won't change the answer.",
    "more-k": "More clusters can make each cluster pure, but only by chopping the outer ring into wedges. You wanted 2 groups and got K pieces; joining them back needs a different method anyway.",
    scale: "Both features are already on the same scale. Scaling won't turn rings into blobs.",
  };
  return {
    pass,
    score: pass ? 1000 : 0,
    headline: pass ? "Right: wrong tool for this shape." : "Not quite.",
    feedback: pass
      ? `With K = ${k}: purity ${pct(pur)}, outer ring cut into ${outerPieces} ${outerPieces === 1 ? "piece" : "pieces"}. K-Means draws straight boundaries between centroids, so it can never wrap one cluster around another.`
      : `${wrongWhy[verdict] ?? ""} With K = ${k}: purity ${pct(pur)}, outer ring cut into ${outerPieces} ${outerPieces === 1 ? "piece" : "pieces"}.`,
    metrics: [
      { label: `Purity at K = ${k}`, value: pct(pur) },
      { label: "Outer ring cut into", value: `${outerPieces} ${outerPieces === 1 ? "piece" : "pieces"}`, good: outerPieces === 1 && pur > 0.95 },
      { label: "Verdict", value: pass ? "correct" : "incorrect", good: pass },
    ],
    viz: { assign: res.assign, centroids: res.centroids },
  };
}
