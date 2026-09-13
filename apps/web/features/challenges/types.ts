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
};

export type BreakModeResult =
      | { status: "awaiting-run" }
      | { status: "not-detected" }
      | { status: "awaiting-marker"; targetStep: number }
      | { status: "incorrect-marker"; targetStep: number; nearestMarkerStep: number; distance: number }
      | { status: "success"; targetStep: number; markerStep: number; distance: number };

export const BREAK_MODE_LEARNING_RATE = 1.25;

export const gradientDescentInstabilityChallenge: BreakModeChallenge = {
      id: "unstable-gradient-descent",
      title: "Make gradient descent unstable",
      description: "Increase the learning rate until the loss begins rising after an initial decrease.",
      objective: "Find and mark the first suspicious frame.",
      targetDiagnosticType: "possible_instability",
      acceptableStepTolerance: 1,
      successCriteria: { requiresTargetDiagnostic: true, requiresUserMarker: true },
};

