import type { DiagnosticEvent } from "@/features/diagnostics/types";

export function explainDiagnostic(event: DiagnosticEvent): string {
      const evidence = event.evidence;
      switch (event.type) {
            case "rapid_loss_decrease":
                  return `The loss dropped from ${formatEvidence(evidence.previousLoss)} to ${formatEvidence(evidence.currentLoss)} between consecutive frames, suggesting that the update improved the fit significantly.`;
            case "possible_plateau":
                  return `Loss changed only slightly across ${formatEvidence(evidence.windowLength)} frames, from ${formatEvidence(evidence.startLoss)} to ${formatEvidence(evidence.endLoss)}. This suggests learning may have slowed.`;
            case "possible_instability":
                  return `The recorded loss increased from ${formatEvidence(evidence.previousLoss)} to ${formatEvidence(evidence.currentLoss)} after previously decreasing, suggesting the learning rate may be too aggressive.`;
            case "possible_divergence":
                  return `Loss increased substantially across ${formatEvidence(evidence.consecutiveIncreases)} consecutive updates, from ${formatEvidence(evidence.previousLoss)} to ${formatEvidence(evidence.currentLoss)}, suggesting optimization may be moving away from a good solution.`;
            case "near_convergence":
                  return `The recorded weight and bias gradients are small (${formatGradientEvidence(evidence.gradientMagnitudes)}), suggesting parameter updates have become small and the model is approaching a stable solution.`;
      }
}

function formatGradientEvidence(value: number | string | number[] | undefined): string {
      if (!Array.isArray(value)) return "not available";
      return value.map((item) => formatEvidence(item)).join(", ");
}

function formatEvidence(value: number | string | number[] | undefined): string {
      if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
      if (typeof value === "string") return value;
      return "not available";
}