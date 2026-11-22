import { makeRng } from "@/features/labs/engine/random";

import { num, pct, stretchedCloud } from "../data";
import type { Frame, FrameRun } from "../types";

export type PcaConfig = { iterations: number; angle: number; stretch: number; samples: number; seed: number };

/**
 * PCA by power iteration: start from a random direction and repeatedly multiply by the
 * covariance matrix. The direction turns towards the one with the most variance (PC1).
 */
export function runPca(c: PcaConfig): FrameRun {
  const raw = stretchedCloud(c.samples, c.angle, c.stretch, c.seed);
  const mx = raw.reduce((a, p) => a + p.x, 0) / raw.length;
  const my = raw.reduce((a, p) => a + p.y, 0) / raw.length;
  const pts = raw.map((p) => ({ x: p.x - mx, y: p.y - my }));
  const n = pts.length;
  const sxx = pts.reduce((a, p) => a + p.x * p.x, 0) / (n - 1);
  const syy = pts.reduce((a, p) => a + p.y * p.y, 0) / (n - 1);
  const sxy = pts.reduce((a, p) => a + p.x * p.y, 0) / (n - 1);
  const total = sxx + syy;
  // exact eigen decomposition for reference
  const tr = sxx + syy;
  const det = sxx * syy - sxy * sxy;
  const l1 = tr / 2 + Math.sqrt((tr * tr) / 4 - det);
  const pc1 = Math.abs(sxy) > 1e-12 ? norm([l1 - syy, sxy]) : sxx >= syy ? [1, 0] : [0, 1];
  const rng = makeRng(c.seed + 7);
  // start 70–80° away from the answer, so the turn is easy to see
  const a0 = Math.atan2(pc1[1], pc1[0]) + ((70 + 10 * rng.uniform()) * Math.PI) / 180;
  let v = [Math.cos(a0), Math.sin(a0)];
  const R = Math.max(...pts.map((p) => Math.hypot(p.x, p.y))) * 1.05;
  const frames: Frame[] = [];
  const snap = (step: number) => {
    const varAlong = v[0] * v[0] * sxx + 2 * v[0] * v[1] * sxy + v[1] * v[1] * syy;
    const share = varAlong / total;
    const angle = (Math.acos(Math.min(1, Math.abs(v[0] * pc1[0] + v[1] * pc1[1]))) * 180) / Math.PI;
    const proj = pts.map((p) => p.x * v[0] + p.y * v[1]);
    const done = angle < 0.5;
    const ortho = [-v[1], v[0]];
    frames.push({
      points: pts.map((p) => ({ ...p })),
      curves: [
        { pts: [[-R * v[0], -R * v[1]], [R * v[0], R * v[1]]], kind: "axis", label: "current direction" },
        ...(done ? [{ pts: [[-R * 0.6 * ortho[0], -R * 0.6 * ortho[1]], [R * 0.6 * ortho[0], R * 0.6 * ortho[1]]] as [number, number][], kind: "axis2" as const, label: "PC2" }] : []),
      ],
      segments: pts.map((p, i) => ({ a: [p.x, p.y] as [number, number], b: [proj[i] * v[0], proj[i] * v[1]] as [number, number], kind: "projection" as const })),
      caption:
        (step === 0
          ? `Start: a random direction. Projecting every point onto it (grey lines) keeps ${pct(share)} of the total variance.`
          : `Step ${step}: multiplying the direction by the covariance matrix turned it towards the stretch of the cloud. It now keeps ${pct(share)} of the variance and is ${num(angle, 2)}° away from the first principal component.`) +
        (done ? ` This is PC1. The dashed line at right angles is PC2, carrying the remaining ${pct(1 - share)}. Keeping only PC1 squeezes 2 numbers per point into 1 while losing ${pct(1 - share)} of the variance.` : ""),
      metrics: { share, angle },
    });
  };
  snap(0);
  for (let i = 1; i <= c.iterations; i += 1) {
    v = norm([sxx * v[0] + sxy * v[1], sxy * v[0] + syy * v[1]]);
    snap(i);
  }
  const lim = R;
  return {
    frames,
    // equal scale on both axes (the plot area is about 1.58 times wider than tall), so right angles look right
    domain: { x: [-lim * 1.58, lim * 1.58], y: [-lim, lim] },
    axes: { x: "feature 1 (centred)", y: "feature 2 (centred)" },
    series: [{ key: "share", label: "Variance kept on this direction", color: "#14b8a6", format: "pct" }],
    frameLabel: (i) => (i === 0 ? "random start" : `step ${i}`),
    metricTitle: "Share of variance captured",
  };
}

function norm(v: number[]) {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
}
