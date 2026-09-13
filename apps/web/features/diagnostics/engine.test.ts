import { describe, expect, it } from "vitest";

import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import type { TrainingRun, TrainingState } from "@/types/training-run";

function makeRun(losses: number[], gradients?: Array<[number | null, number | null]>): TrainingRun {
      return {
            id: "test-run",
            algorithm: "linear_regression.gradient_descent",
            dataset: { samples: 2, slope: 2, intercept: 1, noise: 0, seed: 0 },
            dataset_points: [],
            training: { learning_rate: 0.1, epochs: losses.length - 1, initial_weight: 0, initial_bias: 0 },
            total_steps: losses.length - 1,
            history: losses.map((loss, step) => makeState(step, loss, gradients?.[step])),
            markers: [],
            metadata: {},
      };
}

function makeState(step: number, loss: number, gradient: [number | null, number | null] = [1, 1]): TrainingState {
      return { step, weights: [0], bias: 0, loss, gradients: gradient[0] === null ? [] : [gradient[0]], bias_gradient: gradient[1], predictions: [], metrics: { mean_squared_error: loss } };
}

describe("analyzeTrainingRun", () => {
      it("handles empty and single-state histories", () => {
            expect(analyzeTrainingRun(makeRun([]))).toEqual([]);
            expect(analyzeTrainingRun(makeRun([1]))).toEqual([]);
      });

      it("detects rapid loss decrease with evidence", () => {
            const [diagnostic] = analyzeTrainingRun(makeRun([10, 8]));
            expect(diagnostic.type).toBe("rapid_loss_decrease");
            expect(diagnostic.step).toBe(1);
            expect(diagnostic.evidence).toMatchObject({ previousLoss: 10, currentLoss: 8, relativeLossChange: 0.2 });
      });

      it("deduplicates repeated matches by diagnostic type", () => {
            const diagnostics = analyzeTrainingRun(makeRun([10, 8, 6, 4]));
            expect(diagnostics.filter((diagnostic) => diagnostic.type === "rapid_loss_decrease")).toHaveLength(1);
      });

      it("detects and deduplicates a plateau window", () => {
            const diagnostics = analyzeTrainingRun(makeRun([1, 1.001, 1.0005, 1.001, 1.0008, 1.0009]));
            const plateaus = diagnostics.filter((diagnostic) => diagnostic.type === "possible_plateau");
            expect(plateaus).toHaveLength(1);
            expect(plateaus[0]).toMatchObject({ step: 4, evidence: { windowLength: 5, startLoss: 1, endLoss: 1.0008 } });
      });

      it("detects sustained instability after a decrease", () => {
            const diagnostics = analyzeTrainingRun(makeRun([10, 8, 8.3, 8.6]));
            expect(diagnostics.find((diagnostic) => diagnostic.type === "possible_instability")).toMatchObject({ step: 3, evidence: { consecutiveIncreases: 2 } });
      });

      it("detects several substantial increases as possible divergence", () => {
            const diagnostics = analyzeTrainingRun(makeRun([10, 8, 9, 10, 12]));
            expect(diagnostics.find((diagnostic) => diagnostic.type === "possible_divergence")).toMatchObject({ step: 4, evidence: { consecutiveIncreases: 3, lossValues: [8, 9, 10, 12] } });
      });

      it("detects near convergence when both gradients are available", () => {
            const diagnostics = analyzeTrainingRun(makeRun([10, 5], [[1, 1], [0.01, 0.02]]));
            expect(diagnostics.find((diagnostic) => diagnostic.type === "near_convergence")).toMatchObject({ step: 1, evidence: { weightGradient: 0.01, biasGradient: 0.02 } });
      });

      it("does not detect near convergence when one gradient is missing", () => {
            const diagnostics = analyzeTrainingRun(makeRun([10, 5], [[1, 1], [0.01, null]]));
            expect(diagnostics.find((diagnostic) => diagnostic.type === "near_convergence")).toBeUndefined();
      });

      it("does not label normal monotonic convergence as instability or divergence", () => {
            const types = analyzeTrainingRun(makeRun([10, 8, 6, 4])).map((diagnostic) => diagnostic.type);
            expect(types).not.toContain("possible_instability");
            expect(types).not.toContain("possible_divergence");
      });

      it("is deterministic and skips non-finite loss values", () => {
            const run = makeRun([10, Number.NaN, 8]);
            expect(analyzeTrainingRun(run)).toEqual(analyzeTrainingRun(run));
            expect(analyzeTrainingRun(run)).toEqual([]);
      });
});