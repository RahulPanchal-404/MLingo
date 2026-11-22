import { acc, bounds, grid, moons, num, pct, split, toPlot, type Labelled } from "../data";
import type { Frame, FrameRun, Segment } from "../types";

type Box = { x0: number; x1: number; y0: number; y1: number };
export type TreeNode = { box: Box; pts: Labelled[]; depth: number; pred: number; split?: { f: "x" | "y"; t: number }; left?: TreeNode; right?: TreeNode };

export const gini = (pts: Labelled[]) => {
  if (!pts.length) return 0;
  const p = pts.filter((q) => q.c === 1).length / pts.length;
  return 2 * p * (1 - p);
};
const majority = (pts: Labelled[]) => (pts.filter((q) => q.c === 1).length * 2 > pts.length ? 1 : 0);

/** Best single split of these points: the threshold that lowers weighted Gini impurity the most. */
export function bestSplit(pts: Labelled[], minLeaf: number) {
  let best: null | { f: "x" | "y"; t: number; gain: number; left: Labelled[]; right: Labelled[] } = null;
  const parent = pts.length * gini(pts);
  for (const f of ["x", "y"] as const) {
    const sorted = [...pts].sort((a, b) => a[f] - b[f]);
    let ones = 0;
    const total1 = sorted.filter((p) => p.c === 1).length;
    for (let i = 0; i < sorted.length - 1; i += 1) {
      ones += sorted[i].c;
      const nl = i + 1;
      const nr = sorted.length - nl;
      if (nl < minLeaf || nr < minLeaf || sorted[i][f] === sorted[i + 1][f]) continue;
      const pl = ones / nl;
      const pr = (total1 - ones) / nr;
      const gain = parent - nl * 2 * pl * (1 - pl) - nr * 2 * pr * (1 - pr);
      if (!best || gain > best.gain + 1e-12) best = { f, t: (sorted[i][f] + sorted[i + 1][f]) / 2, gain, left: sorted.slice(0, nl), right: sorted.slice(nl) };
    }
  }
  return best;
}

export function predict(node: TreeNode, p: { x: number; y: number }): number {
  while (node.split && node.left && node.right) node = p[node.split.f] <= node.split.t ? node.left : node.right;
  return node.pred;
}

const leaves = (n: TreeNode): TreeNode[] => (n.left && n.right ? [...leaves(n.left), ...leaves(n.right)] : [n]);
const splits = (n: TreeNode): TreeNode[] => (n.left && n.right ? [n, ...splits(n.left), ...splits(n.right)] : []);

function segmentOf(n: TreeNode, kind: Segment["kind"]): Segment {
  const { box, split: s } = n;
  return s!.f === "x" ? { a: [s!.t, box.y0], b: [s!.t, box.y1], kind } : { a: [box.x0, s!.t], b: [box.x1, s!.t], kind };
}

export type TreeConfig = { maxSplits: number; maxDepth: number; minLeaf: number; samples: number; noise: number; seed: number };

export function runTree(c: TreeConfig): FrameRun {
  const all = moons(c.samples, c.noise, c.seed);
  const { train, test } = split(all, 0.3, c.seed);
  const domain = bounds(all);
  const root: TreeNode = { box: { x0: domain.x[0], x1: domain.x[1], y0: domain.y[0], y1: domain.y[1] }, pts: train, depth: 0, pred: majority(train) };
  const frames: Frame[] = [];
  const snapshot = (caption: string, newest?: TreeNode) => {
    const f = (p: { x: number; y: number }) => predict(root, p);
    const trainAcc = acc(f, train);
    const testAcc = acc(f, test);
    frames.push({
      points: toPlot(train, test),
      surface: grid(domain, 48, (x, y) => f({ x, y })),
      segments: splits(root).map((n) => segmentOf(n, n === newest ? "split-new" : "split")),
      caption: `${caption} Training accuracy ${pct(trainAcc)}, test accuracy ${pct(testAcc)}.`,
      metrics: { train: trainAcc, test: testAcc, leaves: leaves(root).length },
    });
  };
  snapshot(`Before any question, the tree puts every point in one box and predicts the majority class (${root.pred === 1 ? "amber" : "teal"}).`);
  for (let i = 0; i < c.maxSplits; i += 1) {
    let pick: null | { leaf: TreeNode; s: NonNullable<ReturnType<typeof bestSplit>> } = null;
    for (const leaf of leaves(root)) {
      if (leaf.depth >= c.maxDepth || gini(leaf.pts) === 0) continue;
      const s = bestSplit(leaf.pts, c.minLeaf);
      if (s && s.gain > 1e-9 && (!pick || s.gain > pick.s.gain)) pick = { leaf, s };
    }
    if (!pick) break;
    const { leaf, s } = pick;
    const before = gini(leaf.pts);
    leaf.split = { f: s.f, t: s.t };
    const lb = s.f === "x" ? { ...leaf.box, x1: s.t } : { ...leaf.box, y1: s.t };
    const rb = s.f === "x" ? { ...leaf.box, x0: s.t } : { ...leaf.box, y0: s.t };
    leaf.left = { box: lb, pts: s.left, depth: leaf.depth + 1, pred: majority(s.left) };
    leaf.right = { box: rb, pts: s.right, depth: leaf.depth + 1, pred: majority(s.right) };
    const after = (s.left.length * gini(s.left) + s.right.length * gini(s.right)) / leaf.pts.length;
    snapshot(
      `Split ${i + 1}: in a box of ${leaf.pts.length} training points, the tree asked "is ${s.f === "x" ? "feature 1" : "feature 2"} ≤ ${num(s.t, 2)}?". That lowered the mix of classes (Gini) from ${num(before, 2)} to ${num(after, 2)}.`,
      leaf,
    );
  }
  const last = frames.length - 1;
  if (last > 0 && frames[last].metrics.train === 1) frames[last].caption += " Every training point is now classified correctly, but look at whether test accuracy kept up.";
  return {
    frames,
    domain,
    axes: { x: "feature 1", y: "feature 2" },
    series: [
      { key: "train", label: "Training accuracy", color: "#14b8a6", format: "pct" },
      { key: "test", label: "Test accuracy", color: "#f59e0b", format: "pct" },
    ],
    frameLabel: (i) => (i === 0 ? "no splits" : `split ${i}`),
    metricTitle: "Accuracy as the tree grows",
  };
}
