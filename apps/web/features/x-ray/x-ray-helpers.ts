import type { TrainingState } from "@/types/training-run";
import type {
  ClusterAssignmentStat,
  KMeansXRayData,
  LinearXRayData,
  LogisticXRayData,
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
