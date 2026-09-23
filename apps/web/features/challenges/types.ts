import type { DiagnosticType } from "@/features/diagnostics/types";

export type BreakModeSuccessCriteria = {
  requiresTargetDiagnostic: boolean;
  requiresUserMarker: boolean;
};

export type BreakModeChallenge = {
  id: string;
  title: string;
  description: string;
  objective: string;
  algorithm: "linear_regression" | "logistic_regression" | "kmeans" | "neural_network";
  algorithmLabel: string;
  targetDiagnosticType: DiagnosticType;
  acceptableStepTolerance: number;
  successCriteria: BreakModeSuccessCriteria;
  defaultLearningRate?: number;
};

export type BreakModeResult =
  | { status: "awaiting-run" }
  | { status: "not-detected" }
  | { status: "awaiting-marker"; targetStep: number }
  | { status: "incorrect-marker"; targetStep: number; nearestMarkerStep: number; distance: number }
  | { status: "success"; targetStep: number; markerStep: number; distance: number };

export const BREAK_MODE_LEARNING_RATE = 1.1;

export const gradientDescentInstabilityChallenge: BreakModeChallenge = {
  id: "unstable-gradient-descent",
  title: "Make gradient descent unstable",
  description: "Increase the learning rate and watch for the loss to decrease first, then begin rising.",
  objective: "Find and mark the first suspicious frame.",
  algorithm: "linear_regression",
  algorithmLabel: "Linear Regression",
  targetDiagnosticType: "possible_instability",
  acceptableStepTolerance: 1,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: BREAK_MODE_LEARNING_RATE,
};

export const gradientDescentPlateauChallenge: BreakModeChallenge = {
  id: "learning-slowdown",
  title: "Find the learning slowdown",
  description: "Inspect a run where the loss changes very little across several frames.",
  objective: "Find and mark the first plateau frame.",
  algorithm: "linear_regression",
  algorithmLabel: "Linear Regression",
  targetDiagnosticType: "possible_plateau",
  acceptableStepTolerance: 1,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: 0.0001,
};

export const gradientDescentDivergenceChallenge: BreakModeChallenge = {
  id: "spot-divergence",
  title: "Spot divergence",
  description: "Find the recorded region where loss rises substantially across consecutive updates.",
  objective: "Find and mark the first divergence frame.",
  algorithm: "linear_regression",
  algorithmLabel: "Linear Regression",
  targetDiagnosticType: "possible_divergence",
  acceptableStepTolerance: 1,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: 1.1,
};

export const logisticRegressionThresholdChallenge: BreakModeChallenge = {
  id: "threshold-tradeoff",
  title: "Find the Threshold Trade-off",
  description: "Scrub through training frames to spot where the classification boundary reaches near-convergence.",
  objective: "Find and mark the frame where parameter gradients settle near zero.",
  algorithm: "logistic_regression",
  algorithmLabel: "Logistic Regression",
  targetDiagnosticType: "near_convergence",
  acceptableStepTolerance: 2,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: 0.2,
};

export const kMeansStabilizationChallenge: BreakModeChallenge = {
  id: "stable-clustering",
  title: "Find the Stable Clustering",
  description: "Identify the iteration where centroid movement becomes negligible and cluster centers stabilize.",
  objective: "Find and mark the frame where cluster centroids reach stability.",
  algorithm: "kmeans",
  algorithmLabel: "K-Means Clustering",
  targetDiagnosticType: "near_convergence",
  acceptableStepTolerance: 1,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: 0.1,
};

export const neuralNetworkPlateauChallenge: BreakModeChallenge = {
  id: "neural-learning-slowdown",
  title: "Find the Learning Slowdown",
  description: "Inspect deep neural network backpropagation and find where loss improvement slows to a plateau.",
  objective: "Find and mark the first frame where loss delta flattens across frames.",
  algorithm: "neural_network",
  algorithmLabel: "Neural Network",
  targetDiagnosticType: "possible_plateau",
  acceptableStepTolerance: 2,
  successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
  defaultLearningRate: 0.01,
};

export const ALL_CHALLENGES: BreakModeChallenge[] = [
  gradientDescentInstabilityChallenge,
  gradientDescentPlateauChallenge,
  gradientDescentDivergenceChallenge,
  logisticRegressionThresholdChallenge,
  kMeansStabilizationChallenge,
  neuralNetworkPlateauChallenge,
];

export function getChallengeById(id: string): BreakModeChallenge | undefined {
  return ALL_CHALLENGES.find((c) => c.id === id);
}
