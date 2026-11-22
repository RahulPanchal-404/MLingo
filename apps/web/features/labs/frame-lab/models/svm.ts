import { blobs, bounds, grid, num, pct, toPlot } from "../data";
import type { Curve, Frame, FrameRun } from "../types";

export type SvmConfig = { epochs: number; C: number; learningRate: number; samples: number; spread: number; seed: number };

/**
 * Linear soft-margin SVM trained with full-batch subgradient descent on
 *   0.5·||w||² + C · mean(max(0, 1 − yᵢ(w·xᵢ + b)))
 * Each frame is one update.
 */
export function runSvm(c: SvmConfig): FrameRun {
  const pts = blobs(c.samples, c.spread, c.seed, 2);
  const domain = bounds(pts);
  const ys = pts.map((p) => (p.c === 1 ? 1 : -1));
  let w = [0, 0];
  let b = 0;
  const frames: Frame[] = [];
  const line = (offset: number): [number, number][] => {
    // w0·x + w1·y + b = offset, clipped to the domain
    if (Math.abs(w[1]) > Math.abs(w[0])) return domain.x.map((x) => [x, (offset - b - w[0] * x) / w[1]] as [number, number]);
    if (Math.abs(w[0]) > 1e-9) return domain.y.map((y) => [(offset - b - w[1] * y) / w[0], y] as [number, number]);
    return [];
  };
  const snap = (step: number) => {
    const margins = pts.map((p, i) => ys[i] * (w[0] * p.x + w[1] * p.y + b));
    const hinge = margins.reduce((a, m) => a + Math.max(0, 1 - m), 0) / pts.length;
    const norm = Math.hypot(w[0], w[1]);
    const objective = 0.5 * norm * norm + c.C * hinge;
    const accuracy = margins.filter((m) => m > 0).length / pts.length;
    const sv = margins.filter((m) => m <= 1 + 1e-9).length;
    const width = norm > 1e-9 ? 2 / norm : Infinity;
    const curves: Curve[] = norm > 1e-9 ? [{ pts: line(0), kind: "model", label: "boundary" }, { pts: line(1), kind: "margin" }, { pts: line(-1), kind: "margin" }] : [];
    frames.push({
      points: toPlot(pts).map((p, i) => ({ ...p, ring: margins[i] <= 1 + 1e-9 })),
      surface: norm > 1e-9 ? grid(domain, 40, (x, y) => (w[0] * x + w[1] * y + b > 0 ? 1 : 0)) : undefined,
      curves,
      caption:
        step === 0
          ? "Before training, w = 0, so there is no boundary yet and every point is inside the margin (ringed)."
          : `Update ${step}: ${sv} point${sv === 1 ? " is" : "s are"} on or inside the margin (ringed); only these push on the boundary. Margin width ${Number.isFinite(width) ? num(width, 2) : "∞"}, accuracy ${pct(accuracy)}.`,
      metrics: { objective, hinge, width: Number.isFinite(width) ? width : 0 },
    });
  };
  snap(0);
  for (let step = 1; step <= c.epochs; step += 1) {
    const g = [w[0], w[1]];
    let gb = 0;
    pts.forEach((p, i) => {
      if (ys[i] * (w[0] * p.x + w[1] * p.y + b) < 1) {
        g[0] -= (c.C * ys[i] * p.x) / pts.length;
        g[1] -= (c.C * ys[i] * p.y) / pts.length;
        gb -= (c.C * ys[i]) / pts.length;
      }
    });
    const lr = c.learningRate / Math.sqrt(step);
    w = [w[0] - lr * g[0], w[1] - lr * g[1]];
    b -= lr * gb;
    snap(step);
  }
  return {
    frames,
    domain,
    axes: { x: "feature 1", y: "feature 2" },
    series: [
      { key: "objective", label: "Objective (½‖w‖² + C·hinge)", color: "#14b8a6" },
      { key: "hinge", label: "Hinge loss", color: "#f59e0b" },
    ],
    frameLabel: (i) => (i === 0 ? "start" : `update ${i}`),
    metricTitle: "Loss during training",
  };
}
