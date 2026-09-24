import type { TrainingState } from "@/types/training-run";
import type {
  ClusterAssignmentStat,
  KMeansXRayData,
  LinearXRayData,
  LogisticXRayData,
  ModelXRayData,
  NeuralNetworkXRayData,
  PredictionSummary,
} from "./types";

export function computePredictionsSummary(values: number[] | undefined | null): PredictionSummary | null {
  if (!values || values.length === 0) return null;
  let min = values[0];
  let max = values[0];
  let sum = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val < min) min = val;
    if (val > max) max = val;
    sum += val;
  }

  const mean = sum / values.length;
  const sample = values.slice(0, 3);

  return { min, max, mean, sample };
}

export function computeClusterDistribution(
  assignments: number[] | undefined | null,
  clusterCount: number
): ClusterAssignmentStat[] {
  if (clusterCount <= 0) return [];
  const counts = new Array<number>(clusterCount).fill(0);
  const total = assignments?.length ?? 0;

  if (assignments && total > 0) {
    for (const clusterIndex of assignments) {
      if (clusterIndex >= 0 && clusterIndex < clusterCount) {
        counts[clusterIndex]++;
      }
    }
  }

  return counts.map((count, clusterIndex) => ({
    clusterIndex,
    count,
    percentage: total > 0 ? (count / total) * 100 : 0,
  }));
}

export function computeLinearXRay(
  state: TrainingState,
  prevState: TrainingState | null
): LinearXRayData {
  const isInitialState = state.step === 0;
  const weights = state.weights ?? [];
  const bias = state.bias ?? 0;
  const weightGradient = isInitialState ? null : (state.gradients?.[0] ?? null);
  const biasGradient = isInitialState ? null : (state.bias_gradient ?? null);
  const totalGradientNorm =
    !isInitialState && weightGradient != null && biasGradient != null
      ? Math.sqrt(weightGradient * weightGradient + biasGradient * biasGradient)
      : null;
  const loss = state.metrics.mean_squared_error ?? state.loss ?? null;
  const predictions = computePredictionsSummary(state.predictions);

  let frameChanges = null;
  if (prevState) {
    frameChanges = {
      weight: (state.weights?.[0] ?? 0) - (prevState.weights?.[0] ?? 0),
      bias: (state.bias ?? 0) - (prevState.bias ?? 0),
      loss: (state.loss ?? 0) - (prevState.loss ?? 0),
      weightGradient:
        state.gradients?.[0] != null && prevState.gradients?.[0] != null
          ? state.gradients[0] - prevState.gradients[0]
          : undefined,
    };
  }

  return {
    algorithm: "linear_regression",
    step: state.step,
    isInitialState,
    weights,
    bias,
    weightGradient,
    biasGradient,
    totalGradientNorm,
    loss,
    predictions,
    frameChanges,
  };
}

export function computeLogisticXRay(
  state: TrainingState,
  prevState: TrainingState | null
): LogisticXRayData {
  const isInitialState = state.step === 0;
  const weights = state.weights ?? [];
  const bias = state.bias ?? 0;
  const weightGradients = isInitialState ? [] : (state.gradients ?? []);
  const biasGradient = isInitialState ? null : (state.bias_gradient ?? null);

  let weightGradientNorm: number | null = null;
  let totalGradientNorm: number | null = null;
  if (!isInitialState && weightGradients.length > 0) {
    const wgSq = weightGradients.reduce((sum, g) => sum + g * g, 0);
    weightGradientNorm = Math.sqrt(wgSq);
    const bgSq = biasGradient != null ? biasGradient * biasGradient : 0;
    totalGradientNorm = Math.sqrt(wgSq + bgSq);
  }

  const loss = state.metrics.binary_cross_entropy ?? state.loss ?? null;
  const accuracy = state.metrics.accuracy ?? null;
  const probabilities = computePredictionsSummary(state.predictions);

  let frameChanges = null;
  if (prevState) {
    frameChanges = {
      weight1: (state.weights?.[0] ?? 0) - (prevState.weights?.[0] ?? 0),
      weight2:
        state.weights?.[1] != null && prevState.weights?.[1] != null
          ? state.weights[1] - prevState.weights[1]
          : undefined,
      bias: (state.bias ?? 0) - (prevState.bias ?? 0),
      loss: (state.loss ?? 0) - (prevState.loss ?? 0),
      accuracy:
        state.metrics.accuracy != null && prevState.metrics.accuracy != null
          ? state.metrics.accuracy - prevState.metrics.accuracy
          : undefined,
    };
  }

  return {
    algorithm: "logistic_regression",
    step: state.step,
    isInitialState,
    weights,
    bias,
    weightGradients,
    biasGradient,
    weightGradientNorm,
    totalGradientNorm,
    loss,
    accuracy,
    probabilities,
    frameChanges,
  };
}

export function computeKMeansXRay(
  state: TrainingState,
  prevState: TrainingState | null,
  clusterCountConfig?: number
): KMeansXRayData {
  const isInitialState = state.step === 0;
  const centroids = (state.centroids ?? []) as Array<[number, number]>;
  const clusterCount = centroids.length > 0 ? centroids.length : (clusterCountConfig ?? 3);
  const inertia = state.inertia ?? state.metrics.inertia ?? state.loss ?? null;
  const assignmentDistribution = computeClusterDistribution(state.cluster_assignments, clusterCount);
  const centroidMovements = isInitialState ? null : (state.centroid_movement ?? null);
  const totalMovement =
    centroidMovements && centroidMovements.length > 0
      ? centroidMovements.reduce((sum, v) => sum + v, 0)
      : null;

  const currentInertia = state.inertia ?? state.loss;
  const prevInertia = prevState ? (prevState.inertia ?? prevState.loss) : null;
  const inertiaChange =
    currentInertia != null && prevInertia != null ? currentInertia - prevInertia : null;

  return {
    algorithm: "kmeans",
    step: state.step,
    isInitialState,
    clusterCount,
    centroids,
    inertia,
    assignmentDistribution,
    centroidMovements,
    totalMovement,
    inertiaChange,
  };
}

export function computeNeuralNetworkXRay(
  state: TrainingState,
  prevState: TrainingState | null
): NeuralNetworkXRayData {
  const isInitialState = state.step === 0;
  const w1 = state.w1 ?? [];
  const b1 = state.b1 ?? [];
  const w2 = state.w2 ?? [];
  const b2 = state.b2 ?? 0;

  const hiddenCount = b1.length > 0 ? b1.length : (w1[0]?.length ?? 3);
  const inputCount = w1.length > 0 ? w1.length : 2;
  const architecture = { inputs: inputCount, hidden: hiddenCount, outputs: 1 };

  const dw1 = isInitialState ? null : (state.dw1 ?? null);
  const db1 = isInitialState ? null : (state.db1 ?? null);
  const dw2 = isInitialState ? null : (state.dw2 ?? null);
  const db2 = isInitialState ? null : (state.db2 ?? null);

  let gradientMagnitude: number | null = null;
  let weightGradientNorm: number | null = null;
  let biasGradientNorm: number | null = null;

  if (!isInitialState && dw1 && db1 && dw2 && db2 != null) {
    let weightSumSq = 0;
    for (const row of dw1) {
      for (const v of row) weightSumSq += v * v;
    }
    for (const row of dw2) {
      for (const v of row) weightSumSq += v * v;
    }
    weightGradientNorm = Math.sqrt(weightSumSq);

    let biasSumSq = 0;
    for (const v of db1) biasSumSq += v * v;
    biasSumSq += db2 * db2;
    biasGradientNorm = Math.sqrt(biasSumSq);

    gradientMagnitude = Math.sqrt(weightSumSq + biasSumSq);
  }

  let w1Norm = 0;
  for (const row of w1) {
    for (const v of row) w1Norm += v * v;
  }
  w1Norm = Math.sqrt(w1Norm);

  let w2Norm = 0;
  for (const row of w2) {
    for (const v of row) w2Norm += v * v;
  }
  w2Norm = Math.sqrt(w2Norm);

  const loss = state.metrics.binary_cross_entropy ?? state.loss ?? null;
  const accuracy = state.metrics.accuracy ?? null;
  const probabilities = computePredictionsSummary(state.predictions);
  const hiddenActivations = state.hidden_activations ?? null;

  let frameChanges = null;
  if (prevState) {
    let w1DeltaNorm = 0;
    if (state.w1 && prevState.w1) {
      let sumSq = 0;
      for (let i = 0; i < state.w1.length; i++) {
        for (let j = 0; j < (state.w1[i]?.length ?? 0); j++) {
          const diff = (state.w1[i][j] ?? 0) - (prevState.w1[i]?.[j] ?? 0);
          sumSq += diff * diff;
        }
      }
      w1DeltaNorm = Math.sqrt(sumSq);
    }

    let w2DeltaNorm = 0;
    if (state.w2 && prevState.w2) {
      let sumSq = 0;
      for (let i = 0; i < state.w2.length; i++) {
        for (let j = 0; j < (state.w2[i]?.length ?? 0); j++) {
          const diff = (state.w2[i][j] ?? 0) - (prevState.w2[i]?.[j] ?? 0);
          sumSq += diff * diff;
        }
      }
      w2DeltaNorm = Math.sqrt(sumSq);
    }

    frameChanges = {
      loss: (state.loss ?? 0) - (prevState.loss ?? 0),
      accuracy:
        state.metrics.accuracy != null && prevState.metrics.accuracy != null
          ? state.metrics.accuracy - prevState.metrics.accuracy
          : undefined,
      w1DeltaNorm,
      w2DeltaNorm,
    };
  }

  return {
    algorithm: "neural_network",
    step: state.step,
    isInitialState,
    architecture,
    w1,
    b1,
    w2,
    b2,
    w1Norm,
    w2Norm,
    dw1,
    db1,
    dw2,
    db2,
    gradientMagnitude,
    weightGradientNorm,
    biasGradientNorm,
    loss,
    accuracy,
    probabilities,
    hiddenActivations,
    frameChanges,
  };
}

export function formatNumber(value: number | null | undefined, maxDecimals = 4): string {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

export function formatDelta(value: number | null | undefined, maxDecimals = 4): string {
  if (value == null || !Number.isFinite(value)) return "N/A";
  const prefix = value > 0 ? "+" : "";
  return `${prefix}${formatNumber(value, maxDecimals)}`;
}

export function formatPercentage(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return "N/A";
  return `${(value * 100).toFixed(1)}%`;
}

export function getXRayNarrative(data: ModelXRayData): { what: string; why: string } {
  if (data.algorithm === "linear_regression") {
    if (data.isInitialState) {
      return {
        what: `Step 0: Initial parameters set to w = ${formatNumber(data.weights[0])}, b = ${formatNumber(data.bias)}. Initial loss is ${formatNumber(data.loss)}.`,
        why: "Baseline regression line established before calculating MSE gradients.",
      };
    }
    const lossDelta = data.frameChanges?.loss;
    const lossText =
      lossDelta != null && lossDelta < 0
        ? `Loss decreased by ${formatNumber(Math.abs(lossDelta))} to ${formatNumber(data.loss)}`
        : `Loss is ${formatNumber(data.loss)}`;
    const weightShift = data.frameChanges?.weight;
    const weightText = weightShift != null ? `, weight shifted by ${formatDelta(weightShift)}` : "";
    return {
      what: `${lossText}${weightText}.`,
      why: "Gradient descent moves opposite to the loss gradient, stepping toward the minimum MSE error.",
    };
  }

  if (data.algorithm === "logistic_regression") {
    if (data.isInitialState) {
      return {
        what: `Step 0: Initial parameters set with loss at ${formatNumber(data.loss)} and accuracy at ${data.accuracy != null ? formatPercentage(data.accuracy) : "N/A"}.`,
        why: "Baseline classification boundary evaluated before computing cross-entropy gradients.",
      };
    }
    const lossDelta = data.frameChanges?.loss;
    const lossText =
      lossDelta != null && lossDelta < 0
        ? `Loss decreased by ${formatNumber(Math.abs(lossDelta))} to ${formatNumber(data.loss)}`
        : `Loss is ${formatNumber(data.loss)}`;
    const accText = data.accuracy != null ? ` with accuracy at ${formatPercentage(data.accuracy)}` : "";
    return {
      what: `${lossText}${accText}.`,
      why: "Cross-entropy gradients push the sigmoid decision boundary to separate the classes with higher certainty.",
    };
  }

  if (data.algorithm === "kmeans") {
    if (data.isInitialState) {
      return {
        what: `Step 0: Initialized K = ${data.clusterCount} cluster centroids with inertia at ${formatNumber(data.inertia)}.`,
        why: "Centroid anchors placed before assigning points to their nearest cluster center.",
      };
    }
    const moveText = data.totalMovement != null ? `Centroids moved by ${formatNumber(data.totalMovement)} total distance. ` : "";
    const inertiaDelta = data.inertiaChange;
    const inertiaText =
      inertiaDelta != null && inertiaDelta < 0
        ? `Inertia decreased by ${formatNumber(Math.abs(inertiaDelta))} to ${formatNumber(data.inertia)}.`
        : `Inertia is ${formatNumber(data.inertia)}.`;
    return {
      what: `${moveText}${inertiaText}`,
      why: "Centroids update to the arithmetic mean of assigned points, minimizing intra-cluster variance.",
    };
  }

  // Neural network
  if (data.isInitialState) {
    return {
      what: "Step 0: Weights initialized with Xavier scaling and biases at zero. Ready for backpropagation.",
      why: "Appropriate variance scaling prevents vanishing or exploding gradients before forward propagation begins.",
    };
  }
  const lossDelta = data.frameChanges?.loss;
  const lossText =
    lossDelta != null && lossDelta < 0
      ? `Loss decreased by ${formatNumber(Math.abs(lossDelta))} to ${formatNumber(data.loss)}`
      : `Loss is ${formatNumber(data.loss)}`;
  const accText = data.accuracy != null ? ` (accuracy ${formatPercentage(data.accuracy)})` : "";
  const gradText = data.gradientMagnitude != null ? `. Total gradient norm is ${formatNumber(data.gradientMagnitude, 4)}` : "";
  return {
    what: `${lossText}${accText}${gradText}.`,
    why: "Backpropagation computes layer-wise error gradients (∂L/∂W, ∂L/∂b) to step weights opposite to the gradient toward lower prediction loss.",
  };
}
