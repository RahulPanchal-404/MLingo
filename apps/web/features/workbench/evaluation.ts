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
    const increase = Number((testVal - trainVal).toFixed(4));
    if (increase > 0.2) {
      description = `Test ${metricName} (${testVal}) is higher than training ${metricName} (${trainVal}) by ${increase}, which may indicate a generalization gap.`;
    } else if (increase > 0.05) {
      description = `Test ${metricName} exceeds training ${metricName} by ${increase}.`;
    } else if (Math.abs(increase) <= 0.05) {
      description = `Training and test ${metricName} are closely aligned (difference of ${Math.abs(increase)}).`;
    } else {
      description = `Test ${metricName} (${testVal}) is lower than training ${metricName} (${trainVal}).`;
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

/**
 * Deterministic model trainer for workbench datasets.
 * Fits parameters on trainRows, returns predictions for trainRows and testRows.
 */
export function trainAndEvaluateModel(
  trainRows: Array<Record<string, number>>,
  testRows: Array<Record<string, number>>,
  taskType: "regression" | "classification" | "clustering",
  targetColumn?: string,
  threshold: number = 0.5
): {
  regression?: RegressionEvaluation;
  classification?: ClassificationEvaluation;
  clustering?: ClusteringEvaluation;
  generalization?: GeneralizationGapAnalysis;
  probabilities?: number[];
  testTargets?: number[];
} {
  if (taskType === "regression" && targetColumn) {
    // Ordinary Least Squares on training partition
    const featureCols = Object.keys(trainRows[0]).filter((c) => c !== targetColumn);
    const weights: Record<string, number> = {};
    let bias = 0;

    // Univariate or multivariate regression approximation
    for (const col of featureCols) {
      const xTrain = trainRows.map((r) => r[col]);
      const yTrain = trainRows.map((r) => r[targetColumn]);
      const meanX = xTrain.reduce((a, b) => a + b, 0) / (xTrain.length || 1);
      const meanY = yTrain.reduce((a, b) => a + b, 0) / (yTrain.length || 1);

      let num = 0;
      let den = 0;
      for (let i = 0; i < xTrain.length; i++) {
        num += (xTrain[i] - meanX) * (yTrain[i] - meanY);
        den += Math.pow(xTrain[i] - meanX, 2);
      }
      weights[col] = den > 0 ? num / den : 0;
      bias = meanY - weights[col] * meanX;
    }

    const predict = (r: Record<string, number>) => {
      let val = bias;
      for (const col of featureCols) {
        val += (weights[col] ?? 0) * (r[col] ?? 0);
      }
      return val;
    };

    const trainPreds = trainRows.map(predict);
    const trainTargets = trainRows.map((r) => r[targetColumn]);
    const testPreds = testRows.map(predict);
    const testTargets = testRows.map((r) => r[targetColumn]);

    const regression = computeRegressionMetrics(trainPreds, trainTargets, testPreds, testTargets);
    const generalization = evaluateGeneralizationGap("MSE", regression.trainMse, regression.testMse, false);

    return { regression, generalization, testTargets };
  }

  if (taskType === "classification" && targetColumn) {
    const featureCols = Object.keys(trainRows[0]).filter((c) => c !== targetColumn);
    // Logistic sigmoid model: p = 1 / (1 + exp(-(w * x + b)))
    const weights: Record<string, number> = {};
    for (const col of featureCols) {
      const x1 = trainRows.filter((r) => r[targetColumn] === 1).map((r) => r[col]);
      const x0 = trainRows.filter((r) => r[targetColumn] === 0).map((r) => r[col]);
      const mean1 = x1.length > 0 ? x1.reduce((a, b) => a + b, 0) / x1.length : 0;
      const mean0 = x0.length > 0 ? x0.reduce((a, b) => a + b, 0) / x0.length : 0;
      weights[col] = (mean1 - mean0) * 1.5;
    }

    const predictProba = (r: Record<string, number>) => {
      let z = 0;
      for (const col of featureCols) {
        z += (weights[col] ?? 0) * (r[col] ?? 0);
      }
      return 1 / (1 + Math.exp(-Math.max(-10, Math.min(10, z))));
    };

    const trainProbs = trainRows.map(predictProba);
    const trainTargets = trainRows.map((r) => r[targetColumn]);
    const testProbs = testRows.map(predictProba);
    const testTargets = testRows.map((r) => r[targetColumn]);

    const trainMetrics = computeClassificationMetrics(trainProbs, trainTargets, threshold);
    const testMetrics = computeClassificationMetrics(testProbs, testTargets, threshold);

    const generalization = evaluateGeneralizationGap(
      "Accuracy",
      trainMetrics.accuracy,
      testMetrics.accuracy,
      true
    );

    return {
      classification: testMetrics,
      generalization,
      probabilities: testProbs,
      testTargets,
    };
  }

  // Clustering: K-Means (K=3)
  const cols = Object.keys(trainRows[0]);
  const centroids: number[][] = [];
  const k = Math.min(3, trainRows.length);
  for (let i = 0; i < k; i++) {
    centroids.push(cols.map((c) => trainRows[i][c] ?? 0));
  }

  let inertia = 0;
  const clusterSizes = [0, 0, 0];
  for (const r of trainRows) {
    const pt = cols.map((c) => r[c] ?? 0);
    let bestDist = Infinity;
    let bestCluster = 0;
    centroids.forEach((cent, cIdx) => {
      const d = cent.reduce((acc, v, idx) => acc + Math.pow(v - pt[idx], 2), 0);
      if (d < bestDist) {
        bestDist = d;
        bestCluster = cIdx;
      }
    });
    inertia += bestDist;
    clusterSizes[bestCluster]++;
  }

  const clustering: ClusteringEvaluation = {
    inertia: Number(inertia.toFixed(2)),
    clusterSizes,
    centroids,
  };

  return { clustering };
}
