import type { DiagnosticType } from "@/features/diagnostics/types";

export type BreakModeSuccessCriteria = {
      requiresTargetDiagnostic: true;
      requiresUserMarker: true;
};

export type BreakModeChallenge = {
      id: string;
      title: string;
      description: string;
      objective: string;
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
      targetDiagnosticType: "possible_divergence",
      acceptableStepTolerance: 1,
      successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
      defaultLearningRate: 1.1,
};

