import { num, sine, sineTruth, split } from "../data";
import type { Frame, FrameRun } from "../types";

/** Solve (XᵀX + λI)w = Xᵀy with Gaussian elimination (partial pivoting). */
export function ridgeFit(xs: number[], ys: number[], degree: number, lambda: number): number[] {
  const d = degree + 1;
  const feat = (x: number) => Array.from({ length: d }, (_, j) => (2 * x - 1) ** j);
  const A = Array.from({ length: d }, () => Array<number>(d + 1).fill(0));
  xs.forEach((x, i) => {
    const f = feat(x);
    for (let r = 0; r < d; r += 1) {
      for (let c = 0; c < d; c += 1) A[r][c] += f[r] * f[c];
      A[r][d] += f[r] * ys[i];
    }
  });
  for (let r = 1; r < d; r += 1) A[r][r] += lambda; // the intercept is not penalised
  for (let r = 0; r < d; r += 1) A[r][r] += 1e-10;
  for (let col = 0; col < d; col += 1) {
    let piv = col;
    for (let r = col + 1; r < d; r += 1) if (Math.abs(A[r][col]) > Math.abs(A[piv][col])) piv = r;
    [A[col], A[piv]] = [A[piv], A[col]];
    for (let r = 0; r < d; r += 1) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let c = col; c <= d; c += 1) A[r][c] -= f * A[col][c];
    }
  }
  return A.map((row, r) => row[d] / row[r]);
}
export const polyEval = (w: number[], x: number) => w.reduce((a, c, j) => a + c * (2 * x - 1) ** j, 0);

export type PolyConfig = { maxDegree: number; logLambda: number; samples: number; noise: number; seed: number };

export function runPoly(c: PolyConfig): FrameRun {
  const all = sine(c.samples, c.noise, c.seed);
  const { train, test } = split(all, 0.3, c.seed);
  const lambda = c.logLambda <= -8 ? 0 : 10 ** c.logLambda;
  const xs = Array.from({ length: 201 }, (_, i) => i / 200);
  const frames: Frame[] = [];
  let best = { d: 1, e: Infinity };
  for (let d = 1; d <= c.maxDegree; d += 1) {
    const w = ridgeFit(train.map((p) => p.x), train.map((p) => p.y), d, lambda);
    const err = (pts: { x: number; y: number }[]) => pts.reduce((a, p) => a + (p.y - polyEval(w, p.x)) ** 2, 0) / pts.length;
    const tr = err(train);
    const te = err(test);
    if (te < best.e) best = { d, e: te };
    const size = Math.sqrt(w.slice(1).reduce((a, v) => a + v * v, 0));
    frames.push({
      points: [...train.map((p) => ({ ...p })), ...test.map((p) => ({ ...p, test: true }))],
      curves: [
        { pts: sineTruth(), kind: "truth", label: "true curve" },
        { pts: xs.map((x) => [x, Math.max(-6, Math.min(6, polyEval(w, x)))] as [number, number]), kind: "model", label: "model" },
      ],
      caption: `Degree ${d}: the curve has ${d + 1} weights to tune. Training error ${num(tr)}, test error ${num(te)}. Size of the weights ${num(size, 2)}${lambda ? `, held back by the penalty λ = ${num(lambda, 2)}` : " (no penalty)"}.`,
      metrics: { train: tr, test: te },
    });
  }
  frames[frames.length - 1].caption += ` Test error was lowest at degree ${best.d}. Past that, extra flexibility mostly bends the curve towards noise in the training points.`;
  return {
    frames,
    domain: { x: [0, 1], y: [-2.2, 2.2] },
    axes: { x: "x", y: "y" },
    series: [
      { key: "train", label: "Training error (MSE)", color: "#14b8a6" },
      { key: "test", label: "Test error (MSE)", color: "#f59e0b" },
    ],
    frameLabel: (i) => `degree ${i + 1}`,
    metricTitle: "Error as the degree grows",
  };
}
