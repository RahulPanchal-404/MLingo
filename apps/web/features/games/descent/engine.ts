/**
 * Descent (Chapter 1: loss, gradient descent, learning rate).
 * Every level runs real gradient descent on a fixed dataset, so results are exact and repeatable.
 */
import { fmt, gaussian, mean, mulberry32, scoreFromRatio } from "../framework/math";
import type { Evaluation, LevelDef, Params } from "../framework/types";

// ---------- data ----------
const rand1 = gaussian(mulberry32(7));
export const LINE_DATA = Array.from({ length: 10 }, (_, i) => {
  const x = 0.4 * (i + 1);
  return { x, y: 2 * x + 1 + 0.5 * rand1() };
});

function leastSquares(pts: { x: number; y: number }[]) {
  const mx = mean(pts.map((p) => p.x));
  const my = mean(pts.map((p) => p.y));
  const sxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const sxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const w = sxy / sxx;
  return { w, b: my - w * mx };
}
export const BEST_LINE = leastSquares(LINE_DATA);
export const lineMse = (w: number, b: number) => mean(LINE_DATA.map((p) => (w * p.x + b - p.y) ** 2));
export const BEST_MSE = lineMse(BEST_LINE.w, BEST_LINE.b);

/** Level 2: learn only the slope with plain gradient descent (bias fixed at its best value). */
export function slopeDescent(alpha: number, steps = 10, w0 = -1) {
  const path = [w0];
  let w = w0;
  for (let i = 0; i < steps; i++) {
    const grad = 2 * mean(LINE_DATA.map((p) => (w * p.x + BEST_LINE.b - p.y) * p.x));
    w -= alpha * grad;
    path.push(w);
    if (!Number.isFinite(w) || Math.abs(w) > 1e6) break;
  }
  return { path, loss: path.map((v) => lineMse(v, BEST_LINE.b)) };
}
/** Curvature of the slope-only loss: GD is stable only for alpha < 2 / CURVATURE. */
export const CURVATURE = 2 * mean(LINE_DATA.map((p) => p.x * p.x));

// Level 3: two features on very different scales (0–1 vs 0–100).
const rand3 = mulberry32(21);
const noise3 = gaussian(mulberry32(22));
export const RAVINE_DATA = Array.from({ length: 40 }, () => {
  const x1 = rand3();
  const x2 = rand3() * 100;
  return { x1, x2, y: 3 * x1 + 0.05 * x2 + 2 + 0.3 * noise3() };
});
const m1 = mean(RAVINE_DATA.map((p) => p.x1));
const m2 = mean(RAVINE_DATA.map((p) => p.x2));
const s1 = Math.sqrt(mean(RAVINE_DATA.map((p) => (p.x1 - m1) ** 2)));
const s2 = Math.sqrt(mean(RAVINE_DATA.map((p) => (p.x2 - m2) ** 2)));

export function ravineDescent(alpha: number, standardize: boolean, steps = 60) {
  const rows = RAVINE_DATA.map((p) => ({
    a: standardize ? (p.x1 - m1) / s1 : p.x1,
    c: standardize ? (p.x2 - m2) / s2 : p.x2,
    y: p.y,
  }));
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  const loss: number[] = [];
  const mse = () => mean(rows.map((r) => (w1 * r.a + w2 * r.c + b - r.y) ** 2));
  loss.push(mse());
  for (let i = 0; i < steps; i++) {
    let g1 = 0;
    let g2 = 0;
    let gb = 0;
    for (const r of rows) {
      const e = w1 * r.a + w2 * r.c + b - r.y;
      g1 += (2 * e * r.a) / rows.length;
      g2 += (2 * e * r.c) / rows.length;
      gb += (2 * e) / rows.length;
    }
    w1 -= alpha * g1;
    w2 -= alpha * g2;
    b -= alpha * gb;
    const l = mse();
    loss.push(l);
    if (!Number.isFinite(l) || l > 1e12) break;
  }
  return { loss };
}
// Best achievable MSE: run standardized GD to convergence.
export const RAVINE_BEST = ravineDescent(0.3, true, 2000).loss.at(-1)!;

// Level 4: a bumpy loss with a shallow trap on the way to the true minimum.
export const bumpy = (w: number) => 0.08 * (w - 4) ** 2 - 1.6 * Math.exp(-((w + 0.8) ** 2) / 0.6);
const bumpyGrad = (w: number) => 0.16 * (w - 4) + 1.6 * Math.exp(-((w + 0.8) ** 2) / 0.6) * ((2 * (w + 0.8)) / 0.6);
export const BUMPY_START = -2.6;
export const BUMPY_GLOBAL = 4.0;

export function bumpyDescent(alpha: number, optimizer: string, steps = 80) {
  const beta = optimizer === "momentum" ? 0.9 : 0;
  let w = BUMPY_START;
  let v = 0;
  const path = [w];
  for (let i = 0; i < steps; i++) {
    v = beta * v + bumpyGrad(w);
    w -= alpha * v;
    path.push(w);
    if (!Number.isFinite(w) || Math.abs(w) > 1e4) break;
  }
  return { path };
}

// ---------- levels ----------
export const LEVELS: LevelDef[] = [
  {
    id: "eyeball",
    number: 1,
    name: "Fit by eye",
    brief: "Drag the slope and intercept until the line fits the points. The red bars are the errors (residuals). Loss is the average of their squares.",
    objective: `Get the mean squared error (MSE) under ${fmt(BEST_MSE + 0.25, 2)}.`,
    lesson: "Loss turns 'how wrong is the line' into one number. Squaring makes big misses count far more than small ones, so the best line refuses to leave any point far away.",
    lessonSlug: "loss-functions",
    controls: [
      { kind: "slider", id: "w", label: "Slope w", min: -1, max: 4, step: 0.05 },
      { kind: "slider", id: "b", label: "Intercept b", min: -2, max: 4, step: 0.05 },
    ],
    initial: { w: 0.5, b: 0 },
  },
  {
    id: "step-size",
    number: 2,
    name: "Pick the step",
    brief: "Now gradient descent moves the slope for you, 10 steps from w = −1. Your only job: choose the learning rate α.",
    objective: "Reach the bottom of the loss curve within 10 steps (MSE within 0.02 of the best).",
    lesson: `Too small and the model crawls; too large and every step overshoots further, so the loss explodes. For this loss, steps are stable only below α = 2 / curvature ≈ ${fmt(2 / CURVATURE, 2)}.`,
    lessonSlug: "learning-rate",
    controls: [{ kind: "slider", id: "alpha", label: "Learning rate α", min: 0.001, max: 0.5, step: 0.001, log: true }],
    initial: { alpha: 0.005 },
  },
  {
    id: "ravine",
    number: 3,
    name: "The ravine",
    brief: "Two features: x₁ ranges 0–1, x₂ ranges 0–100. Gradient descent gets 60 steps. Try every learning rate you like.",
    objective: `Get MSE under ${fmt(RAVINE_BEST + 0.1, 2)} within 60 steps.`,
    lesson: "When features have very different scales, the big feature's steep direction caps the learning rate, and the small feature then barely moves. Standardizing (z-score) puts both on the same scale so one learning rate works for both.",
    lessonSlug: "gradient-descent",
    controls: [
      { kind: "slider", id: "alpha", label: "Learning rate α", min: 0.00001, max: 1, step: 0.00001, log: true },
      { kind: "toggle", id: "standardize", label: "Standardize features (z-score)", hint: "Subtract each feature's mean and divide by its standard deviation." },
    ],
    initial: { alpha: 0.0001, standardize: false },
  },
  {
    id: "trap",
    number: 4,
    name: "The trap",
    brief: "The ball starts on the left. There's a shallow dip on the way down, and the real minimum is further right. 80 steps.",
    objective: "Finish within 0.25 of the true minimum at w = 4.",
    lesson: "Plain gradient descent stops in the first dip it finds, because the gradient there is zero. Momentum keeps a running velocity, so it rolls through shallow local minima toward a better one.",
    lessonSlug: "gradient-descent",
    controls: [
      {
        kind: "choice",
        id: "optimizer",
        label: "Optimizer",
        options: [
          { value: "gd", label: "Gradient descent", detail: "w ← w − α·∇L" },
          { value: "momentum", label: "Momentum (β = 0.9)", detail: "v ← 0.9·v + ∇L,  w ← w − α·v" },
        ],
      },
      { kind: "slider", id: "alpha", label: "Learning rate α", min: 0.01, max: 0.5, step: 0.01, log: true },
    ],
    initial: { optimizer: "gd", alpha: 0.1 },
  },
];

// ---------- evaluation ----------
export function evaluate(levelId: string, p: Params): Evaluation {
  if (levelId === "eyeball") {
    const mse = lineMse(Number(p.w), Number(p.b));
    const target = BEST_MSE + 0.25;
    const pass = mse <= target;
    return {
      pass,
      score: scoreFromRatio(mse, BEST_MSE + 0.05),
      headline: pass ? `MSE ${fmt(mse)}. That's a good fit.` : `MSE ${fmt(mse)}. Not there yet.`,
      feedback: pass
        ? `The best possible line here has MSE ${fmt(BEST_MSE)} (w = ${fmt(BEST_LINE.w, 2)}, b = ${fmt(BEST_LINE.b, 2)}).`
        : "Look for the longest red bars: because errors are squared, the biggest misses dominate the loss. Fix those first.",
      metrics: [
        { label: "Your MSE", value: fmt(mse), good: pass },
        { label: "Target", value: `≤ ${fmt(target, 2)}` },
      ],
    };
  }

  if (levelId === "step-size") {
    const alpha = Number(p.alpha);
    const { path, loss } = slopeDescent(alpha);
    const final = loss.at(-1)!;
    const target = BEST_MSE + 0.02;
    const pass = Number.isFinite(final) && final <= target;
    const diverged = !Number.isFinite(final) || final > loss[0];
    const progress = (path.at(-1)! - path[0]) / (BEST_LINE.w - path[0]);
    return {
      pass,
      score: pass ? Math.round(1000 - 40 * Math.abs(Math.log(alpha * CURVATURE))) : 0,
      headline: pass ? "Converged within 10 steps." : diverged ? "Diverged: the loss blew up." : "Too slow: still sliding downhill.",
      feedback: pass
        ? `α·curvature = ${fmt(alpha * CURVATURE, 2)}. At exactly 1 the first step lands straight on the minimum.`
        : diverged
          ? `Each step jumped past the minimum and landed higher up the other side. α = ${fmt(alpha)} is above the stability limit ${fmt(2 / CURVATURE, 3)}.`
          : `After 10 steps the slope covered only ${Math.round(progress * 100)}% of the distance. A bigger α takes bigger steps.`,
      metrics: [
        { label: "Final MSE", value: fmt(final), good: pass },
        { label: "Final slope", value: fmt(path.at(-1)!, 3) },
        { label: "Stability limit", value: `α < ${fmt(2 / CURVATURE, 3)}` },
        { label: "Target", value: `MSE ≤ ${fmt(target, 3)}` },
      ],
      viz: { path },
    };
  }

  if (levelId === "ravine") {
    const alpha = Number(p.alpha);
    const standardize = Boolean(p.standardize);
    const { loss } = ravineDescent(alpha, standardize);
    const final = loss.at(-1)!;
    const target = RAVINE_BEST + 0.1;
    const pass = Number.isFinite(final) && final <= target;
    const diverged = !Number.isFinite(final) || final > loss[0];
    return {
      pass,
      score: pass ? scoreFromRatio(final, RAVINE_BEST + 0.02) : 0,
      headline: pass ? "Through the ravine." : diverged ? "Diverged." : "Stuck crawling along the ravine floor.",
      feedback: pass
        ? "Standardized features give the loss a round bowl, so one learning rate suits every direction."
        : diverged
          ? standardize
            ? "Even scaled features have a stability limit. Lower α a little."
            : "x₂ goes up to 100, so its direction is extremely steep. Any α big enough to move x₁ blows up along x₂."
          : standardize
            ? "Scaling is on, so now just pick a bigger α."
            : "α small enough to be stable for x₂ (0–100) is far too small for x₁ (0–1). No single α can serve both. What if the features were on the same scale?",
      metrics: [
        { label: "Final MSE", value: fmt(final), good: pass },
        { label: "Target", value: `≤ ${fmt(target, 2)}` },
        { label: "Features scaled", value: standardize ? "yes" : "no" },
        { label: "Steps", value: String(loss.length - 1) },
      ],
      viz: { loss },
    };
  }

  // trap
  const alpha = Number(p.alpha);
  const optimizer = String(p.optimizer);
  const { path } = bumpyDescent(alpha, optimizer);
  const end = path.at(-1)!;
  const pass = Number.isFinite(end) && Math.abs(end - BUMPY_GLOBAL) <= 0.25;
  const inTrap = Number.isFinite(end) && end < 1;
  return {
    pass,
    score: pass ? Math.round(1000 - 300 * Math.abs(end - BUMPY_GLOBAL)) : 0,
    headline: pass ? "Rolled through the trap to the true minimum." : inTrap ? "Stuck in the local dip." : "Ended away from the minimum.",
    feedback: pass
      ? "Velocity built up on the way down carried the ball over the small bump."
      : inTrap
        ? optimizer === "gd"
          ? "Plain gradient descent stops wherever the slope is zero, and the dip has zero slope at its bottom. A bigger α doesn't help much here. You need a different optimizer."
          : "Momentum needs enough speed to clear the bump. Try a larger α."
        : "Too much speed: the ball is still swinging back and forth. Lower α.",
    metrics: [
      { label: "Final w", value: fmt(end, 3), good: pass },
      { label: "True minimum", value: "w = 4" },
      { label: "Final loss", value: fmt(bumpy(end), 3) },
      { label: "Optimizer", value: optimizer === "gd" ? "GD" : "Momentum" },
    ],
    viz: { path },
  };
}
