/**
 * Lab training engine that runs in the browser.
 *
 * It mirrors the backend trainer (apps/api/app/ml/training/trainer.py) and returns the
 * same TrainingRun shape, so the labs need no network call: no server time, no cold
 * starts and no multi-megabyte responses. Datasets are drawn from a seeded generator,
 * so a seed always reproduces the same run.
 */
import type { DatasetPoint, TrainingRun, TrainingRunRequest, TrainingState } from "@/types/training-run";

import { makeRng } from "./random";

/** Same cap as the API: samples x recorded steps. */
export const MAX_SAMPLE_STEPS = 500_000;

type Request = TrainingRunRequest;

export function validateRequest(request: Request): void {
  const { algorithm, dataset, training } = request;
  if (!Number.isInteger(dataset.samples) || dataset.samples <= 0 || dataset.samples > 10_000) throw new Error("Samples must be between 1 and 10,000.");
  if (!(dataset.noise >= 0) || !Number.isFinite(dataset.noise)) throw new Error("Noise must be zero or more.");
  if (!(training.learning_rate > 0) || !Number.isFinite(training.learning_rate)) throw new Error("The learning rate must be greater than zero.");
  if (!Number.isInteger(training.epochs) || training.epochs <= 0 || training.epochs > 10_000) throw new Error("Epochs must be between 1 and 10,000.");
  if ((algorithm === "logistic_regression" || algorithm === "neural_network") && dataset.samples <= 1) throw new Error(`${algorithm} requires at least two samples.`);
  if (algorithm === "kmeans") {
    const k = training.clusters;
    if (dataset.samples <= 1) throw new Error("K-Means requires at least two samples.");
    if (!k || k <= 0) throw new Error("K-Means requires a positive cluster count.");
    if (!training.iterations || training.iterations <= 0) throw new Error("K-Means requires a positive iteration count.");
    if (k > dataset.samples) throw new Error("K-Means clusters cannot exceed the number of samples.");
  }
  const steps = algorithm === "kmeans" ? training.iterations ?? 0 : training.epochs;
  if (dataset.samples * steps > MAX_SAMPLE_STEPS) throw new Error(`samples x ${algorithm === "kmeans" ? "iterations" : "epochs"} must not exceed ${MAX_SAMPLE_STEPS.toLocaleString("en")}.`);
}

const finite = (xs: readonly number[]) => xs.every(Number.isFinite);
const finite2 = (xs: readonly (readonly number[])[]) => xs.every(finite);
const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sigmoid = (z: number) => (z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z)));

function stateFinite(s: TrainingState): boolean {
  const scalars = [s.bias, s.loss, s.bias_gradient ?? 0, s.inertia ?? 0, s.b2 ?? 0, s.db2 ?? 0];
  const vectors = [s.weights, s.gradients, s.predictions, s.b1 ?? [], s.db1 ?? [], s.centroid_movement ?? []];
  const matrices = [s.w1 ?? [], s.w2 ?? [], s.dw1 ?? [], s.dw2 ?? [], s.hidden_activations ?? [], s.centroids ?? []];
  return finite(scalars) && vectors.every(finite) && matrices.every(finite2);
}

function initialMustBeFinite(state: TrainingState) {
  if (!stateFinite(state)) throw new Error("The initial model state is not finite; reduce the dataset slope, intercept, or noise.");
}

// ----- datasets (same shapes and defaults as apps/api/app/ml/datasets) -----

export function linearDataset(samples: number, slope: number, intercept: number, noise: number, seed: number) {
  const rng = makeRng(seed);
  const x = Array.from({ length: samples }, (_, i) => (samples === 1 ? -1 : -1 + (2 * i) / (samples - 1)));
  const y = x.map((v) => slope * v + intercept + (noise > 0 ? rng.normal(0, noise) : 0));
  return { x, y };
}

/** Two Gaussian blobs around (-1, -1) and (1, 1). */
export function blobsDataset(samples: number, noise: number, seed: number) {
  const rng = makeRng(seed);
  const zeros = Math.floor(samples / 2);
  const sd = Math.max(noise, 1e-9);
  const X: [number, number][] = [];
  const y: number[] = [];
  for (let i = 0; i < samples; i += 1) {
    const c = i < zeros ? -1 : 1;
    X.push([rng.normal(c, sd), rng.normal(c, sd)]);
    y.push(i < zeros ? 0 : 1);
  }
  return { X, y };
}

export function clustersDataset(samples: number, noise: number, seed: number, clusters = 3) {
  const centers: [number, number][] = [[-3, -2], [2.5, 2], [0, 3.5]];
  const rng = makeRng(seed);
  const base = Math.floor(samples / clusters);
  const rem = samples % clusters;
  const pts: [number, number][] = [];
  for (let c = 0; c < clusters; c += 1) {
    const [cx, cy] = centers[c % centers.length];
    for (let i = 0; i < base + (c < rem ? 1 : 0); i += 1) pts.push([cx + rng.normal(0, noise), cy + rng.normal(0, noise)]);
  }
  return pts;
}

// ----- trainers -----

type Trained = { history: TrainingState[]; metadata: Record<string, string>; algorithm: string; points: DatasetPoint[] };

function diverged(metadata: Record<string, string>, step: number | null) {
  if (step !== null) {
    metadata.diverged_at_step = String(step);
    metadata.stopped_reason = "diverged";
  }
  return metadata;
}

function trainLinear(r: Request): Trained {
  const { samples, slope = 2, intercept = 1, noise, seed } = r.dataset;
  const { x, y } = linearDataset(samples, slope, intercept, noise, seed);
  const n = x.length;
  let w = r.training.initial_weight ?? 0;
  let b = r.training.initial_bias ?? 0;
  const predict = () => x.map((v) => w * v + b);
  const mse = (p: number[]) => mean(p.map((v, i) => (v - y[i]) ** 2));
  const p0 = predict();
  const l0 = mse(p0);
  const history: TrainingState[] = [{ step: 0, weights: [w], bias: b, loss: l0, gradients: [], bias_gradient: null, predictions: p0, metrics: { mean_squared_error: l0 } }];
  initialMustBeFinite(history[0]);
  let stop: number | null = null;
  for (let step = 1; step <= r.training.epochs; step += 1) {
    const errors = predict().map((v, i) => v - y[i]);
    const gw = (2 / n) * errors.reduce((a, e, i) => a + e * x[i], 0);
    const gb = 2 * mean(errors);
    w -= r.training.learning_rate * gw;
    b -= r.training.learning_rate * gb;
    const p = predict();
    const loss = mse(p);
    const state: TrainingState = { step, weights: [w], bias: b, loss, gradients: [gw], bias_gradient: gb, predictions: p, metrics: { mean_squared_error: loss } };
    if (!stateFinite(state)) {
      stop = step;
      break;
    }
    history.push(state);
  }
  return {
    history,
    algorithm: "linear_regression.gradient_descent",
    metadata: diverged({ feature_count: "1", sample_count: String(n) }, stop),
    points: x.map((v, i) => ({ feature: v, target: y[i] })),
  };
}

const EPS = 2.220446049250313e-16;
const bce = (p: number[], y: number[], eps = EPS) => -mean(p.map((v, i) => {
  const c = Math.min(Math.max(v, eps), 1 - eps);
  return y[i] * Math.log(c) + (1 - y[i]) * Math.log1p(-c);
}));
const accuracy = (p: number[], y: number[]) => mean(p.map((v, i) => Number((v >= 0.5 ? 1 : 0) === y[i])));

function trainLogistic(r: Request): Trained {
  const { X, y } = blobsDataset(r.dataset.samples, r.dataset.noise, r.dataset.seed);
  const n = X.length;
  const w = [r.training.initial_weight ?? 0, r.training.initial_weight ?? 0];
  let b = r.training.initial_bias ?? 0;
  const history: TrainingState[] = [];
  let prevG: number[] | null = null;
  let prevGb: number | null = null;
  let stop: number | null = null;
  for (let step = 0; step <= r.training.epochs; step += 1) {
    const p = X.map(([a, c]) => sigmoid(w[0] * a + w[1] * c + b));
    const loss = bce(p, y);
    const state: TrainingState = { step, weights: [...w], bias: b, loss, gradients: prevG ? [...prevG] : [], bias_gradient: prevGb, predictions: p, metrics: { binary_cross_entropy: loss, accuracy: accuracy(p, y) } };
    if (step === 0) initialMustBeFinite(state);
    else if (!stateFinite(state)) {
      stop = step;
      break;
    }
    history.push(state);
    if (step === r.training.epochs) break;
    const err = p.map((v, i) => v - y[i]);
    prevG = [0, 1].map((j) => err.reduce((a, e, i) => a + e * X[i][j], 0) / n);
    prevGb = mean(err);
    w[0] -= r.training.learning_rate * prevG[0];
    w[1] -= r.training.learning_rate * prevG[1];
    b -= r.training.learning_rate * prevGb;
  }
  return {
    history,
    algorithm: "logistic_regression.gradient_descent",
    metadata: diverged({ feature_count: "2", sample_count: String(n) }, stop),
    points: X.map(([a, c], i) => ({ x1: a, x2: c, label: y[i] })),
  };
}

function trainNeural(r: Request): Trained {
  const { X, y } = blobsDataset(r.dataset.samples, r.dataset.noise, r.dataset.seed);
  const n = X.length;
  const H = Math.max(2, Math.min(4, r.training.hidden_neurons ?? 3));
  const rng = makeRng(r.training.seed ?? 0);
  const s1 = Math.sqrt(2 / (2 + H));
  const s2 = Math.sqrt(2 / (H + 1));
  const w1 = [0, 1].map(() => Array.from({ length: H }, () => rng.normal(0, s1)));
  const b1 = Array<number>(H).fill(0);
  const w2 = Array.from({ length: H }, () => [rng.normal(0, s2)]);
  let b2 = 0;
  const clipSig = (z: number) => 1 / (1 + Math.exp(-Math.min(25, Math.max(-25, z))));
  const history: TrainingState[] = [];
  let prev: null | { dw1: number[][]; db1: number[]; dw2: number[][]; db2: number } = null;
  let stop: number | null = null;
  const lr = r.training.learning_rate;
  for (let step = 0; step <= r.training.epochs; step += 1) {
    const a1 = X.map((x) => b1.map((bj, j) => clipSig(x[0] * w1[0][j] + x[1] * w1[1][j] + bj)));
    const p = a1.map((h) => clipSig(h.reduce((acc, v, j) => acc + v * w2[j][0], 0) + b2));
    const loss = bce(p, y, 1e-15);
    const state: TrainingState = {
      step,
      weights: w1.flat(),
      bias: b2,
      loss,
      gradients: prev ? prev.dw1.flat() : [],
      bias_gradient: prev ? prev.db2 : null,
      predictions: p,
      metrics: { binary_cross_entropy: loss, accuracy: accuracy(p, y) },
      w1: w1.map((row) => [...row]),
      b1: [...b1],
      w2: w2.map((row) => [...row]),
      b2,
      dw1: prev ? prev.dw1 : null,
      db1: prev ? prev.db1 : null,
      dw2: prev ? prev.dw2 : null,
      db2: prev ? prev.db2 : null,
      hidden_activations: a1.slice(0, 8),
    };
    if (step === 0) initialMustBeFinite(state);
    else if (!stateFinite(state)) {
      stop = step;
      break;
    }
    history.push(state);
    if (step === r.training.epochs) break;
    const dz2 = p.map((v, i) => v - y[i]);
    const dw2 = w2.map((_, j) => [a1.reduce((acc, h, i) => acc + h[j] * dz2[i], 0) / n]);
    const db2 = mean(dz2);
    const dz1 = a1.map((h, i) => h.map((v, j) => dz2[i] * w2[j][0] * v * (1 - v)));
    const dw1 = [0, 1].map((f) => b1.map((_, j) => dz1.reduce((acc, row, i) => acc + X[i][f] * row[j], 0) / n));
    const db1 = b1.map((_, j) => mean(dz1.map((row) => row[j])));
    prev = { dw1, db1, dw2, db2 };
    for (let f = 0; f < 2; f += 1) for (let j = 0; j < H; j += 1) w1[f][j] -= lr * dw1[f][j];
    for (let j = 0; j < H; j += 1) {
      b1[j] -= lr * db1[j];
      w2[j][0] -= lr * dw2[j][0];
    }
    b2 -= lr * db2;
  }
  return {
    history,
    algorithm: "neural_network",
    metadata: diverged({ feature_count: "2", hidden_neurons: String(H), sample_count: String(n) }, stop),
    points: X.map(([a, c], i) => ({ x1: a, x2: c, label: y[i] })),
  };
}

function trainKMeans(r: Request): Trained {
  const pts = clustersDataset(r.dataset.samples, r.dataset.noise, r.dataset.seed);
  const k = r.training.clusters ?? 3;
  const iterations = r.training.iterations ?? r.training.epochs ?? 1;
  const rng = makeRng(r.training.seed ?? 0);
  let centroids = rng.choice(pts.length, k).map((i) => [...pts[i]] as [number, number]);
  const assign = (cs: [number, number][]) => pts.map(([x, y]) => {
    let best = 0;
    let bd = Infinity;
    cs.forEach(([cx, cy], c) => {
      const d = (x - cx) ** 2 + (y - cy) ** 2;
      if (d < bd) {
        bd = d;
        best = c;
      }
    });
    return best;
  });
  const inertia = (cs: [number, number][], a: number[]) => pts.reduce((acc, [x, y], i) => acc + (x - cs[a[i]][0]) ** 2 + (y - cs[a[i]][1]) ** 2, 0);
  let assignments = assign(centroids);
  const i0 = inertia(centroids, assignments);
  const history: TrainingState[] = [{ step: 0, weights: [], bias: 0, loss: i0, gradients: [], bias_gradient: null, predictions: [], metrics: { inertia: i0 }, centroids: centroids.map((c) => [...c] as [number, number]), cluster_assignments: [...assignments], inertia: i0 }];
  initialMustBeFinite(history[0]);
  let stop: number | null = null;
  for (let step = 1; step <= iterations; step += 1) {
    const previous = centroids;
    centroids = previous.map((c, ci) => {
      const members = pts.filter((_, i) => assignments[i] === ci);
      return members.length ? [mean(members.map((m) => m[0])), mean(members.map((m) => m[1]))] as [number, number] : [...c] as [number, number];
    });
    const next = assign(centroids);
    const value = inertia(centroids, next);
    const state: TrainingState = {
      step,
      weights: [],
      bias: 0,
      loss: value,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      metrics: { inertia: value },
      centroids: centroids.map((c) => [...c] as [number, number]),
      cluster_assignments: [...next],
      inertia: value,
      centroid_movement: centroids.map((c, i) => Math.hypot(c[0] - previous[i][0], c[1] - previous[i][1])),
    };
    if (!stateFinite(state)) {
      stop = step;
      break;
    }
    history.push(state);
    assignments = next;
  }
  return {
    history,
    algorithm: "kmeans",
    metadata: diverged({ cluster_count: String(k), sample_count: String(pts.length) }, stop),
    points: pts.map(([x, y]) => ({ x, y })),
  };
}

const TRAINERS = { linear_regression: trainLinear, logistic_regression: trainLogistic, neural_network: trainNeural, kmeans: trainKMeans } as const;

/** Train one model in the browser and return every recorded state. */
export function trainLocally(request: Request): TrainingRun {
  validateRequest(request);
  const trained = TRAINERS[request.algorithm](request);
  const last = trained.history[trained.history.length - 1];
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `run-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    algorithm: trained.algorithm,
    dataset: { ...request.dataset },
    dataset_points: trained.points,
    training: { ...request.training },
    total_steps: last.step,
    history: trained.history,
    markers: trained.history.map((s) => s.step),
    metadata: trained.metadata,
  };
}
