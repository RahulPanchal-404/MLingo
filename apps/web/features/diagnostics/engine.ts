import type { TrainingRun, TrainingState } from "@/types/training-run";
import type { DiagnosticEvent } from "@/features/diagnostics/types";

export const DIAGNOSTIC_THRESHOLDS = {
      rapidLossDecrease: 0.15,
      plateauDelta: 0.002,
      plateauWindow: 5,
      instabilityIncreaseCount: 2,
      instabilityIncreaseRatio: 0.02,
      divergenceIncreaseCount: 3,
      divergenceIncreaseRatio: 0.1,
      convergenceGradient: 0.05,
} as const;

export function analyzeTrainingRun(run: TrainingRun): DiagnosticEvent[] {
      const history = run.history;
      if (history.length < 2) return [];

      // Each detector returns only its first match, so the timeline gets one event per type.
      const events: DiagnosticEvent[] = [];
      const rapid = findRapidLossDecrease(history);
      if (rapid) events.push(rapid);
      const plateau = findPlateau(history);
      if (plateau) events.push(plateau);
      const instability = findIncreasingTrend(history, DIAGNOSTIC_THRESHOLDS.instabilityIncreaseCount, DIAGNOSTIC_THRESHOLDS.instabilityIncreaseRatio, "possible_instability");
      if (instability) events.push(instability);
      const divergence = findIncreasingTrend(history, DIAGNOSTIC_THRESHOLDS.divergenceIncreaseCount, DIAGNOSTIC_THRESHOLDS.divergenceIncreaseRatio, "possible_divergence");
      if (divergence) events.push(divergence);
      const convergence = findNearConvergence(history);
      if (convergence) events.push(convergence);
      return events.sort((left, right) => left.step - right.step || left.id.localeCompare(right.id));
}

function findRapidLossDecrease(history: TrainingState[]): DiagnosticEvent | null {
      for (let index = 1; index < history.length; index += 1) {
            const previousLoss = finite(history[index - 1].loss);
            const currentLoss = finite(history[index].loss);
            if (previousLoss === null || currentLoss === null || previousLoss <= 0) continue;
            const relativeDecrease = (previousLoss - currentLoss) / previousLoss;
            if (relativeDecrease >= DIAGNOSTIC_THRESHOLDS.rapidLossDecrease) {
                  return event("rapid-loss", index, "rapid_loss_decrease", "Rapid loss decrease", "Loss dropped significantly between consecutive frames.", "info", { previousLoss, currentLoss, relativeLossChange: relativeDecrease });
            }
      }
      return null;
}

function findPlateau(history: TrainingState[]): DiagnosticEvent | null {
      const windowLength = DIAGNOSTIC_THRESHOLDS.plateauWindow;
      for (let end = windowLength - 1; end < history.length; end += 1) {
            const window = history.slice(end - windowLength + 1, end + 1);
            const losses = window.map((state) => finite(state.loss));
            if (losses.some((loss) => loss === null)) continue;
            const changes = losses.slice(1).map((loss, index) => Math.abs(loss! - losses[index]!));
            if (changes.every((change) => change <= DIAGNOSTIC_THRESHOLDS.plateauDelta)) {
                  return event("plateau", end, "possible_plateau", "Possible plateau", "Loss changed very little across the recent window.", "warning", { windowLength, startLoss: losses[0]!, endLoss: losses[losses.length - 1]!, maxAbsoluteChange: Math.max(...changes) });
            }
      }
      return null;
}

function findIncreasingTrend(history: TrainingState[], increaseCount: number, increaseRatio: number, type: "possible_instability" | "possible_divergence"): DiagnosticEvent | null {
      for (let end = increaseCount; end < history.length; end += 1) {
            const start = end - increaseCount;
            const losses = history.slice(start, end + 1).map((state) => finite(state.loss));
            if (losses.some((loss) => loss === null)) continue;
            const lossValues = losses.filter((loss): loss is number => loss !== null);
            const increases = lossValues.slice(1).map((loss, index) => ({ previous: lossValues[index], current: loss, ratio: lossValues[index] > 0 ? (loss - lossValues[index]) / lossValues[index] : 0 }));
            if (increases.every((change) => change.current > change.previous && change.ratio >= increaseRatio)) {
                  const hadPriorDecrease = start >= 1 && finite(history[start - 1].loss)! > finite(history[start].loss)!;
                  if (type === "possible_instability" && !hadPriorDecrease) continue;
                  return event(type === "possible_instability" ? "instability" : "divergence", end, type, type === "possible_instability" ? "Possible instability" : "Possible divergence", type === "possible_instability" ? "Loss increased after a recent decreasing region." : "Loss increased substantially across several consecutive frames.", "warning", { consecutiveIncreases: increaseCount, previousLoss: increases[0].previous, currentLoss: increases[increases.length - 1].current, lossValues });
            }
      }
      return null;
}

function findNearConvergence(history: TrainingState[]): DiagnosticEvent | null {
      for (let index = 1; index < history.length; index += 1) {
            const state = history[index];
            const weightGradient = finite(state.gradients?.[0]);
            const biasGradient = finite(state.bias_gradient);
            if (weightGradient !== null && biasGradient !== null && Math.abs(weightGradient) <= DIAGNOSTIC_THRESHOLDS.convergenceGradient && Math.abs(biasGradient) <= DIAGNOSTIC_THRESHOLDS.convergenceGradient) {
                  return event("convergence", index, "near_convergence", "Near convergence", "Weight and bias gradients are close to zero.", "success", { gradientMagnitudes: [Math.abs(weightGradient), Math.abs(biasGradient)], weightGradient, biasGradient });
            }
            const centroidMovement = state.centroid_movement ?? [];
            if (centroidMovement.length > 0 && centroidMovement.every((movement) => Math.abs(movement) <= DIAGNOSTIC_THRESHOLDS.convergenceGradient)) {
                  return event("convergence", index, "near_convergence", "Near convergence", "Centroid movement is now very small, suggesting the clustering is stabilizing.", "success", { centroidMovement });
            }
      }
      return null;
}

function event(id: string, index: number, type: DiagnosticEvent["type"], title: string, description: string, severity: DiagnosticEvent["severity"], evidence: DiagnosticEvent["evidence"]): DiagnosticEvent {
      return { id: `diagnostic-${id}`, step: index, type, title, description, severity, evidence };
}

function finite(value: number | null | undefined): number | null {
      return typeof value === "number" && Number.isFinite(value) ? value : null;
}