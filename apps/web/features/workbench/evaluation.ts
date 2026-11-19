import type {
  ClassificationEvaluation,
  ClusteringEvaluation,
  ConfusionMatrix,
  GeneralizationGapAnalysis,
  RegressionEvaluation,
} from "./types";

export function computeRegressionMetrics(
  trainPreds: number[],
  trainTargets: number[],
  testPreds: number[],
  testTargets: number[]
): RegressionEvaluation {
  const trainMse = calcMse(trainPreds, trainTargets);
  const testMse = calcMse(testPreds, testTargets);
  const testMae = calcMae(testPreds, testTargets);
  const testR2 = calcR2(testPreds, testTargets);

  return {
    trainMse: Number(trainMse.toFixed(4)),
    testMse: Number(testMse.toFixed(4)),
    testMae: Number(testMae.toFixed(4)),
    testR2: Number(testR2.toFixed(4)),
  };
}

function calcMse(preds: number[], targets: number[]): number {
  if (preds.length === 0) return 0;
  const sumSq = preds.reduce((acc, p, i) => acc + Math.pow(p - targets[i], 2), 0);
  return sumSq / preds.length;
}

function calcMae(preds: number[], targets: number[]): number {
  if (preds.length === 0) return 0;
  const sumAbs = preds.reduce((acc, p, i) => acc + Math.abs(p - targets[i]), 0);
  return sumAbs / preds.length;
}

function calcR2(preds: number[], targets: number[]): number {
  if (targets.length === 0) return 0;
  const meanTarget = targets.reduce((a, b) => a + b, 0) / targets.length;
  const sse = preds.reduce((acc, p, i) => acc + Math.pow(targets[i] - p, 2), 0);
  const sst = targets.reduce((acc, t) => acc + Math.pow(t - meanTarget, 2), 0);
  if (sst === 0) return sse === 0 ? 1 : 0;
  return 1 - sse / sst;
}

export function computeConfusionMatrix(
  probabilities: number[],
  targets: number[],
  threshold: number = 0.5
): ConfusionMatrix {
  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < probabilities.length; i++) {
    const pred = probabilities[i] >= threshold ? 1 : 0;
    const target = targets[i] >= 0.5 ? 1 : 0;

    if (pred === 1 && target === 1) tp++;
    else if (pred === 0 && target === 0) tn++;
    else if (pred === 1 && target === 0) fp++;
    else if (pred === 0 && target === 1) fn++;
  }

  return { tn, fp, fn, tp, threshold };
}

export function computeClassificationMetrics(
  probabilities: number[],
  targets: number[],
  threshold: number = 0.5
): ClassificationEvaluation {
  const cm = computeConfusionMatrix(probabilities, targets, threshold);
  const total = cm.tp + cm.tn + cm.fp + cm.fn;

  const accuracy = total > 0 ? (cm.tp + cm.tn) / total : 0;
  const precision = cm.tp + cm.fp > 0 ? cm.tp / (cm.tp + cm.fp) : 0;
  const recall = cm.tp + cm.fn > 0 ? cm.tp / (cm.tp + cm.fn) : 0;
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const { rocPoints, auc } = computeRocCurveAndAuc(probabilities, targets);

  return {
    threshold,
    confusionMatrix: cm,
    accuracy: Number(accuracy.toFixed(4)),
    precision: Number(precision.toFixed(4)),
    recall: Number(recall.toFixed(4)),
    f1: Number(f1.toFixed(4)),
    rocPoints,
    auc: Number(auc.toFixed(4)),
  };
}

export function computeRocCurveAndAuc(
  probabilities: number[],
  targets: number[],
  numSteps: number = 25
): { rocPoints: Array<{ fpr: number; tpr: number }>; auc: number } {
  const targs = targets.map((t) => (t >= 0.5 ? 1 : 0));
  const positives = targs.filter((t) => t === 1).length;
  const negatives = targs.filter((t) => t === 0).length;

  if (positives === 0 || negatives === 0) {
    return {
      rocPoints: [
        { fpr: 0, tpr: 0 },
        { fpr: 1, tpr: 1 },
      ],
      auc: 0.5,
    };
  }

  const points: Array<{ fpr: number; tpr: number }> = [];

  for (let i = numSteps; i >= 0; i--) {
    const th = i / numSteps;
    const cm = computeConfusionMatrix(probabilities, targs, th);
    const tpr = cm.tp / positives;
    const fpr = cm.fp / negatives;
    points.push({ fpr: Number(fpr.toFixed(4)), tpr: Number(tpr.toFixed(4)) });
  }

  // Deduplicate and sort by FPR ascending
  points.sort((a, b) => a.fpr - b.fpr || a.tpr - b.tpr);

  // Compute trapezoidal AUC
  let auc = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].fpr - points[i - 1].fpr;
    const avgY = (points[i].tpr + points[i - 1].tpr) / 2;
    auc += dx * avgY;
  }

  auc = Math.max(0, Math.min(1, auc));

  return { rocPoints: points, auc };
}

export function evaluateGeneralizationGap(
  metricName: string,
  trainVal: number,
  testVal: number,
  higherIsBetter: boolean = false
): GeneralizationGapAnalysis {
  const diff = Number((testVal - trainVal).toFixed(4));
  let description = "";

  if (higherIsBetter) {
    const drop = Number((trainVal - testVal).toFixed(4));
    if (drop > 0.15) {
      description = `Training ${metricName} (${trainVal}) exceeds test ${metricName} (${testVal}) by ${drop}, which may indicate a generalization gap.`;
    } else if (drop > 0.05) {
      description = `Moderate difference of ${drop} between training and test ${metricName}.`;
    } else if (Math.abs(drop) <= 0.05) {
      description = `Training and test ${metricName} are closely aligned (difference of ${Math.abs(drop)}).`;
    } else {
      description = `Test ${metricName} (${testVal}) matches or exceeds training ${metricName} (${trainVal}).`;
    }
  } else {
    // Error metrics (MSE) depend on the target's units, so compare the gap relative to training error.
    const rel = (testVal - trainVal) / Math.max(Math.abs(trainVal), 1e-9);
    const pctGap = Math.round(Math.abs(rel) * 100);
    if (rel > 0.25) {
      description = `Test ${metricName} (${testVal}) is ${pctGap}% higher than training ${metricName} (${trainVal}): the model does noticeably worse on unseen rows, a sign of a generalization gap.`;
    } else if (rel < -0.25) {
      description = `Test ${metricName} (${testVal}) is ${pctGap}% lower than training ${metricName} (${trainVal}). That usually means the small test set happened to contain easier rows, not that the model is better on new data. Check R² before trusting the fit.`;
    } else {
      description = `Training and test ${metricName} are within ${pctGap}% of each other (${trainVal} vs ${testVal}), so the model behaves similarly on seen and unseen rows. Whether that error is acceptable is a separate question: check R² and MAE.`;
    }
  }

  return {
    metricName,
    trainValue: trainVal,
    testValue: testVal,
    difference: diff,
    description,
  };
}

/** Hyperparameters for one training run. */
export type TrainOptions = { learningRate?: number; epochs?: number; clusters?: number };

/** One recorded snapshot of training. Frame 0 is the initial state; frame e is after e full-batch updates. */
export type TrainFrame = {
  epoch: number;
  weights: number[];
  bias: number;
  loss: number;
  gradients: number[];
  /** Clustering only. */
  centroids?: number[][];
};

export const DEFAULT_TRAIN: Required<TrainOptions> = { learningRate: 0.05, epochs: 100, clusters: 3 };

const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const dot = (w: number[], x: number[]) => w.reduce((s, wi, j) => s + wi * x[j], 0);

/**
 * Full-batch gradient descent for linear regression (MSE) or logistic regression (log loss).
 * Starts from w = 0, b = 0, so the recorded frames show the real optimisation path.
 */
export function fitGradientDescent(
  X: number[][],
  y: number[],
  kind: "regression" | "classification",
  opts: TrainOptions = {}
): { weights: number[]; bias: number; frames: TrainFrame[]; diverged: boolean } {
  const lr = opts.learningRate ?? (kind === "regression" ? DEFAULT_TRAIN.learningRate : 0.1);
  const epochs = opts.epochs ?? DEFAULT_TRAIN.epochs;
  const n = X.length;
  const d = X[0]?.length ?? 0;
  let w = new Array<number>(d).fill(0);
  let b = 0;
  const frames: TrainFrame[] = [];
  let diverged = false;
  const sig = (z: number) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, z))));
  for (let e = 0; e <= epochs; e++) {
    const out = X.map((x) => (kind === "regression" ? dot(w, x) + b : sig(dot(w, x) + b)));
    const err = out.map((o, i) => o - y[i]);
    const loss =
      kind === "regression"
        ? mean(err.map((v) => v * v))
        : mean(out.map((p, i) => -(y[i] * Math.log(Math.max(p, 1e-12)) + (1 - y[i]) * Math.log(Math.max(1 - p, 1e-12)))));
    const scale = kind === "regression" ? 2 / n : 1 / n;
    const gw = Array.from({ length: d }, (_, j) => scale * err.reduce((s, v, i) => s + v * X[i][j], 0));
    const gb = scale * err.reduce((s, v) => s + v, 0);
    frames.push({ epoch: e, weights: [...w], bias: b, loss, gradients: [...gw, gb] });
    if (!Number.isFinite(loss) || loss > 1e12) {
      diverged = true;
      break;
    }
    if (e === epochs) break;
    w = w.map((wj, j) => wj - lr * gw[j]);
    b -= lr * gb;
  }
  return { weights: w, bias: b, frames, diverged };
}

/** K-Means (Lloyd's algorithm) with deterministic farthest-point initialisation. */
export function fitKMeans(points: number[][], k: number, maxIter = 50): { centroids: number[][]; assign: number[]; inertia: number; frames: TrainFrame[] } {
  const kk = Math.max(1, Math.min(k, points.length));
  const dist2 = (a: number[], c: number[]) => a.reduce((s, v, j) => s + (v - c[j]) ** 2, 0);
  const centre = points[0].map((_, j) => mean(points.map((p) => p[j])));
  let first = 0;
  points.forEach((p, i) => { if (dist2(p, centre) < dist2(points[first], centre)) first = i; });
  let centroids: number[][] = [[...points[first]]];
  while (centroids.length < kk) {
    let far = 0;
    let best = -1;
    points.forEach((p, i) => {
      const dmin = Math.min(...centroids.map((c) => dist2(p, c)));
      if (dmin > best) { best = dmin; far = i; }
    });
    centroids.push([...points[far]]);
  }
  let assign = new Array<number>(points.length).fill(0);
  const frames: TrainFrame[] = [];
  for (let it = 0; it <= maxIter; it++) {
    const next = points.map((p) => centroids.reduce((bi, c, ci) => (dist2(p, c) < dist2(p, centroids[bi]) ? ci : bi), 0));
    const inertia = points.reduce((s, p, i) => s + dist2(p, centroids[next[i]]), 0);
    frames.push({ epoch: it, weights: [], bias: 0, loss: inertia, gradients: [], centroids: centroids.map((c) => [...c]) });
    const changed = it === 0 || next.some((a, i) => a !== assign[i]);
    assign = next;
    if (!changed) break;
    centroids = centroids.map((c, ci) => {
      const members = points.filter((_, i) => assign[i] === ci);
      return members.length ? c.map((_, j) => mean(members.map((m) => m[j]))) : c;
    });
  }
  const inertia = points.reduce((s, p, i) => s + dist2(p, centroids[assign[i]]), 0);
  return { centroids, assign, inertia, frames };
}

/**
 * Deterministic model trainer for workbench datasets and projects.
 * Regression and classification are trained by gradient descent from zero; clustering by K-Means.
 * The same inputs always give the same run, so training, evaluation and interpretation agree.
 */
export function trainAndEvaluateModel(
  trainRows: Array<Record<string, number>>,
  testRows: Array<Record<string, number>>,
  taskType: "regression" | "classification" | "clustering",
  targetColumn?: string,
  threshold: number = 0.5,
  opts: TrainOptions = {}
): {
  regression?: RegressionEvaluation;
  classification?: ClassificationEvaluation;
  trainClassification?: ClassificationEvaluation;
  clustering?: ClusteringEvaluation;
  generalization?: GeneralizationGapAnalysis;
  probabilities?: number[];
  testTargets?: number[];
  frames?: TrainFrame[];
  featureNames?: string[];
  weights?: number[];
  bias?: number;
  diverged?: boolean;
} {
  if ((taskType === "regression" || taskType === "classification") && targetColumn && trainRows.length) {
    const featureNames = Object.keys(trainRows[0]).filter((c) => c !== targetColumn);
    const toX = (rows: Array<Record<string, number>>) => rows.map((r) => featureNames.map((c) => r[c] ?? 0));
    const Xtr = toX(trainRows);
    const Xte = toX(testRows);
    const ytr = trainRows.map((r) => r[targetColumn]);
    const yte = testRows.map((r) => r[targetColumn]);
    const fit = fitGradientDescent(Xtr, ytr, taskType, opts);
    const raw = (x: number[]) => dot(fit.weights, x) + fit.bias;
    const extra = { frames: fit.frames, featureNames, weights: fit.weights, bias: fit.bias, diverged: fit.diverged };

    if (taskType === "regression") {
      const regression = computeRegressionMetrics(Xtr.map(raw), ytr, Xte.map(raw), yte);
      const generalization = evaluateGeneralizationGap("MSE", regression.trainMse, regression.testMse, false);
      return { regression, generalization, testTargets: yte, ...extra };
    }
    const prob = (x: number[]) => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, raw(x)))));
    const trainProbs = Xtr.map(prob);
    const testProbs = Xte.map(prob);
    const trainMetrics = computeClassificationMetrics(trainProbs, ytr, threshold);
    const testMetrics = computeClassificationMetrics(testProbs, yte, threshold);
    const generalization = evaluateGeneralizationGap("Accuracy", trainMetrics.accuracy, testMetrics.accuracy, true);
    return { classification: testMetrics, trainClassification: trainMetrics, generalization, probabilities: testProbs, testTargets: yte, ...extra };
  }

  // Clustering: K-Means on the training rows.
  const cols = trainRows.length ? Object.keys(trainRows[0]) : [];
  const pts = trainRows.map((r) => cols.map((c) => r[c] ?? 0));
  if (!pts.length) return { clustering: { inertia: 0, clusterSizes: [], centroids: [] } };
  const km = fitKMeans(pts, opts.clusters ?? DEFAULT_TRAIN.clusters);
  const clusterSizes = km.centroids.map((_, ci) => km.assign.filter((a) => a === ci).length);
  const clustering: ClusteringEvaluation = {
    inertia: Number(km.inertia.toFixed(2)),
    clusterSizes,
    centroids: km.centroids,
  };
  return { clustering, frames: km.frames, featureNames: cols };
}
