import { acc, bounds, grid, moons, pct, split, toPlot, type Labelled } from "../data";
import type { Frame, FrameRun } from "../types";

export function knnPredict(train: Labelled[], k: number, p: { x: number; y: number }, exclude?: Labelled) {
  const near = train
    .filter((q) => q !== exclude)
    .map((q) => ({ q, d: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k);
  const ones = near.filter((n) => n.q.c === 1).length;
  return ones * 2 > near.length ? 1 : ones * 2 < near.length ? 0 : near[0].q.c;
}

export type KnnConfig = { maxK: number; samples: number; noise: number; seed: number };

export function runKnn(c: KnnConfig): FrameRun {
  const all = moons(c.samples, c.noise, c.seed);
  const { train, test } = split(all, 0.3, c.seed);
  const domain = bounds(all);
  const ks: number[] = [];
  for (let k = 1; k <= Math.min(c.maxK, train.length); k += 2) ks.push(k);
  let best = { k: 1, a: -1 };
  const frames: Frame[] = ks.map((k) => {
    const f = (p: { x: number; y: number }) => knnPredict(train, k, p);
    const trainAcc = acc(f, train);
    const testAcc = acc(f, test);
    if (testAcc > best.a) best = { k, a: testAcc };
    const caption =
      k === 1
        ? `k = 1: each new point copies its single nearest neighbour. Every training point is right (${pct(trainAcc)}), and the map breaks into small islands around noisy points. Test accuracy ${pct(testAcc)}.`
        : `k = ${k}: each new point takes a vote among its ${k} nearest neighbours. Training accuracy ${pct(trainAcc)}, test accuracy ${pct(testAcc)}.`;
    return { points: toPlot(train, test), surface: grid(domain, 44, (x, y) => f({ x, y })), caption, metrics: { train: trainAcc, test: testAcc } };
  });
  const last = frames[frames.length - 1];
  last.caption += ` The best test accuracy (${pct(best.a)}) came at k = ${best.k}. Very large k smooths the border so much that it can no longer follow the curve.`;
  return {
    frames,
    domain,
    axes: { x: "feature 1", y: "feature 2" },
    series: [
      { key: "train", label: "Training accuracy", color: "#14b8a6", format: "pct" },
      { key: "test", label: "Test accuracy", color: "#f59e0b", format: "pct" },
    ],
    frameLabel: (i) => `k = ${ks[i]}`,
    metricTitle: "Accuracy as k grows",
  };
}
