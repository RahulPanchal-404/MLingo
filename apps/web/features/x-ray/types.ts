import type { TrainingRun, TrainingState } from "@/types/training-run";

export type PredictionSummary = {
  min: number;
  max: number;
  mean: number;
  sample: number[];
};

export type LinearFrameChanges = {
  weight: number;
  bias: number;
  loss: number;
  weightGradient?: number;
};

export type LinearXRayData = {
  algorithm: "linear_regression";
  step: number;
  isInitialState: boolean;
  weights: number[];
  bias: number;
  weightGradient: number | null;
  biasGradient: number | null;
  loss: number | null;
  predictions: PredictionSummary | null;
  frameChanges: LinearFrameChanges | null;
};

export type LogisticFrameChanges = {
  weight1: number;
  weight2?: number;
  bias: number;
  loss: number;
  accuracy?: number;
};

export type LogisticXRayData = {
  algorithm: "logistic_regression";
  step: number;
  isInitialState: boolean;
  weights: number[];
  bias: number;
  weightGradients: number[];
  biasGradient: number | null;
  loss: number | null;
  accuracy: number | null;
  probabilities: PredictionSummary | null;
  frameChanges: LogisticFrameChanges | null;
};

export type ClusterAssignmentStat = {
  clusterIndex: number;
  count: number;
  percentage: number;
};

export type KMeansXRayData = {
  algorithm: "kmeans";
  step: number;
  isInitialState: boolean;
  clusterCount: number;
  centroids: Array<[number, number]>;
  inertia: number | null;
  assignmentDistribution: ClusterAssignmentStat[];
  centroidMovements: number[] | null;
  totalMovement: number | null;
  inertiaChange: number | null;
};

export type ModelXRayData = LinearXRayData | LogisticXRayData | KMeansXRayData;

export type ModelXRayProps = {
  run: TrainingRun;
  state: TrainingState | null;
  currentStep: number;
};
