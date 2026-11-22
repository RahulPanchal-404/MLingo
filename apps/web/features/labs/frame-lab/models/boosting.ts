import { num, sine, sineTruth, split } from "../data";
import type { Frame, FrameRun } from "../types";

type P = { x: number; y: number };
type Tree = { t?: number; left?: Tree; right?: Tree; value: number };

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** A small regression tree fitted to residuals by minimising squared error. */
function fitTree(pts: { x: number; r: number }[], depth: number): Tree {
  const value = avg(pts.map((p) => p.r));
  if (depth === 0 || pts.length < 4) return { value };
  const sorted = [...pts].sort((a, b) => a.x - b.x);
  const total = sorted.reduce((a, p) => a + p.r, 0);
  let left = 0;
  let best: null | { i: number; score: number } = null;
  for (let i = 1; i < sorted.length - 1; i += 1) {
    left += sorted[i - 1].r;
    if (sorted[i - 1].x === sorted[i].x) continue;
    const nl = i;
    const nr = sorted.length - i;
    // maximising sum^2/n on each side is the same as minimising squared error
    const score = (left * left) / nl + ((total - left) * (total - left)) / nr;
    if (!best || score > best.score) best = { i, score };
  }
  if (!best) return { value };
  return {
    value,
    t: (sorted[best.i - 1].x + sorted[best.i].x) / 2,
    left: fitTree(sorted.slice(0, best.i), depth - 1),
    right: fitTree(sorted.slice(best.i), depth - 1),
  };
}
const evalTree = (t: Tree, x: number): number => (t.t === undefined ? t.value : evalTree(x <= t.t ? t.left! : t.right!, x));
const thresholds = (t: Tree): number[] => (t.t === undefined ? [] : [t.t, ...thresholds(t.left!), ...thresholds(t.right!)]);

export type BoostConfig = { trees: number; learningRate: number; depth: number; samples: number; noise: number; seed: number };

export function runBoosting(c: BoostConfig): FrameRun {
  const all = sine(c.samples, c.noise, c.seed);
  const { train, test } = split(all, 0.3, c.seed);
  const base = avg(train.map((p) => p.y));
  const trees: Tree[] = [];
  const model = (x: number) => base + c.learningRate * trees.reduce((a, t) => a + evalTree(t, x), 0);
  const mse = (pts: P[]) => avg(pts.map((p) => (p.y - model(p.x)) ** 2));
  const xs = Array.from({ length: 161 }, (_, i) => i / 160);
  const frames: Frame[] = [];
  let bestVal = Infinity;
  let bestAt = 0;
  const snap = (caption: string) => {
    const tr = mse(train);
    const te = mse(test);
    if (te < bestVal - 1e-9) {
      bestVal = te;
      bestAt = trees.length;
    }
    frames.push({
      points: [...train.map((p) => ({ ...p })), ...test.map((p) => ({ ...p, test: true }))],
      curves: [
        { pts: sineTruth(), kind: "truth", label: "true curve" },
        { pts: xs.map((x) => [x, model(x)] as [number, number]), kind: "model", label: "model" },
      ],
      segments: train.map((p) => ({ a: [p.x, p.y] as [number, number], b: [p.x, model(p.x)] as [number, number], kind: "residual" as const })),
      caption: `${caption} Training error ${num(tr)}, test error ${num(te)}.`,
      metrics: { train: tr, test: te },
    });
  };
  snap(`Before any tree, the model predicts the average of the training targets (${num(base, 2)}) everywhere. The grey lines are the errors (residuals) the first tree will try to fix.`);
  for (let m = 1; m <= c.trees; m += 1) {
    const residuals = train.map((p) => ({ x: p.x, r: p.y - model(p.x) }));
    const t = fitTree(residuals, c.depth);
    trees.push(t);
    const cuts = thresholds(t).sort((a, b) => a - b).map((v) => num(v, 2));
    snap(`Tree ${m} was fitted to the current errors${cuts.length ? `, splitting at x = ${cuts.join(", ")}` : ""}. Only ${num(c.learningRate, 2)} of its correction is added, so each tree nudges the curve instead of jumping.`);
  }
  if (frames.length > 2) {
    const last = frames[frames.length - 1];
    last.caption += bestAt < c.trees - 2 ? ` Test error was lowest after ${bestAt} trees; the trees after that mostly fit noise.` : " Test error is still falling or flat, so more trees are not hurting yet.";
  }
  return {
    frames,
    domain: { x: [0, 1], y: [-2.2, 2.2] },
    axes: { x: "x", y: "y" },
    series: [
      { key: "train", label: "Training error (MSE)", color: "#14b8a6" },
      { key: "test", label: "Test error (MSE)", color: "#f59e0b" },
    ],
    frameLabel: (i) => (i === 0 ? "no trees" : `${i} tree${i === 1 ? "" : "s"}`),
    metricTitle: "Error as trees are added",
  };
}
