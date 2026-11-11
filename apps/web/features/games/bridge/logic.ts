/** Bridge Builder: pure logic. Linear, polynomial, ridge and lasso regression on small seeded datasets. */
import { gaussian, mulberry32 } from "../framework/math";
import { lassoFit, mse, predictLinear, ridgeFit } from "../framework/linalg";

export type Pt = { x: number; y: number };

/** x in [-1, 1]. Training pillars and test trucks come from the same curve with fresh noise. */
function sample(seed: number, f: (x: number) => number, n: number, noise: number): Pt[] {
  const r = mulberry32(seed);
  const g = gaussian(mulberry32(seed + 500));
  return Array.from({ length: n }, () => {
    const x = -1 + 2 * r();
    return { x, y: f(x) + noise * g() };
  }).sort((a, b) => a.x - b.x);
}

export type CurveTask = { name: string; train: Pt[]; test: Pt[] };

const CURVES: { name: string; f: (x: number) => number; noise: number }[] = [
  { name: "Gentle hill", f: (x) => 1.2 * Math.sin(2.2 * x) + 0.4 * x, noise: 0.28 },
  { name: "River bend", f: (x) => 1.4 * x * x - 0.6 + 0.3 * x, noise: 0.25 },
  { name: "Double dip", f: (x) => Math.cos(3.4 * x) + 0.5 * x, noise: 0.3 },
];

export const curveTasks = (seedBase: number, nTrain: number): CurveTask[] =>
  CURVES.map((c, i) => ({ name: c.name, train: sample(seedBase + i * 11, c.f, nTrain, c.noise), test: sample(seedBase + i * 11 + 7, c.f, 40, c.noise) }));

export const LINE_TASKS: CurveTask[] = [
  { name: "Short span", ...split(sample(201, (x) => 0.9 * x + 0.3, 14, 0.25)) },
  { name: "Steep climb", ...split(sample(202, (x) => -1.3 * x + 0.1, 14, 0.3)) },
  { name: "Windy valley", ...split(sample(203, (x) => 0.5 * x - 0.4, 14, 0.35)) },
];
function split(pts: Pt[]) {
  return { train: pts, test: pts };
}

export const DEGREE_TASKS = curveTasks(300, 16);
export const RIDGE_TASKS = curveTasks(400, 16);
export const RIDGE_DEGREE = 12;

export const polyFeatures = (x: number, d: number) => Array.from({ length: d }, (_, k) => x ** (k + 1));

export function polyModel(train: Pt[], degree: number, lambda = 0) {
  return ridgeFit(train.map((p) => polyFeatures(p.x, degree)), train.map((p) => p.y), lambda);
}
export const polyPredict = (m: { w: number[]; b: number }, x: number) => predictLinear(polyFeatures(x, m.w.length), m);
export const polyMse = (m: { w: number[]; b: number }, pts: Pt[]) => mse(pts.map((p) => polyPredict(m, p.x)), pts.map((p) => p.y));

/** Best-possible line by least squares. */
export const bestLine = (pts: Pt[]) => polyModel(pts, 1);
export const lineMse = (pts: Pt[], left: number, right: number) => {
  // line through (-1, left) and (1, right)
  const w = (right - left) / 2;
  const b = (right + left) / 2;
  return mse(pts.map((p) => w * p.x + b), pts.map((p) => p.y));
};

export const DEGREES = Array.from({ length: 12 }, (_, i) => i + 1);
export const LAMBDAS = Array.from({ length: 41 }, (_, i) => 10 ** (-7 + i * 0.2));

export const bestTestOverDegrees = (t: CurveTask) => Math.min(...DEGREES.map((d) => polyMse(polyModel(t.train, d), t.test)));
export const bestTestOverLambdas = (t: CurveTask) => Math.min(...LAMBDAS.map((l) => polyMse(polyModel(t.train, RIDGE_DEGREE, l), t.test)));

/** 1000 when you match the best achievable test error; halves roughly when your error is 2.5× worse. */
export const ratioScore = (yours: number, best: number) => Math.round(1000 * Math.min(1, best / Math.max(yours, 1e-9)) ** 0.75);

/** Tolerance for a truck to cross at a checkpoint (in y units). */
export const TRUCK_TOLERANCE = 0.45;

// ---------- Lasso: 8 support beams (features), 3 real ----------
export const BEAMS = ["Steel", "Height", "Span", "Paint colour", "Day of week", "Bolt brand", "Wind", "Random code"];
export const REAL_BEAMS = [0, 1, 2];
const TRUE_W = [2.0, -1.5, 1.0, 0, 0, 0, 0, 0];

export type LassoTask = { name: string; Xtr: number[][]; ytr: number[]; Xte: number[][]; yte: number[] };
function lassoData(seed: number, n: number): { X: number[][]; y: number[] } {
  const g = gaussian(mulberry32(seed));
  const X = Array.from({ length: n }, () => BEAMS.map(() => g()));
  return { X, y: X.map((r) => r.reduce((s, v, j) => s + v * TRUE_W[j], 0) + 1.5 * g()) };
}
export const LASSO_TASKS: LassoTask[] = [501, 502, 503].map((seed, i) => {
  const tr = lassoData(seed, 13);
  const te = lassoData(seed + 50, 200);
  return { name: ["Footbridge", "Road bridge", "Rail bridge"][i], Xtr: tr.X, ytr: tr.y, Xte: te.X, yte: te.y };
});
export const LASSO_LAMBDAS = Array.from({ length: 31 }, (_, i) => 10 ** (-3 + i * 0.1));
export const lassoModel = (t: LassoTask, lambda: number) => lassoFit(t.Xtr, t.ytr, lambda);
export const lassoTest = (t: LassoTask, m: { w: number[]; b: number }) => mse(t.Xte.map((r) => predictLinear(r, m)), t.yte);
/** Lasso differences are smaller, so the score is stricter. */
export const lassoScore = (yours: number, best: number) => Math.round(1000 * Math.min(1, best / Math.max(yours, 1e-9)) ** 3);
export const bestLassoTest = (t: LassoTask) => Math.min(...LASSO_LAMBDAS.map((l) => lassoTest(t, lassoModel(t, l))));
