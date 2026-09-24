import { describe, expect, it } from "vitest";
import type { TrainingState } from "@/types/training-run";
import {
  computeClusterDistribution,
  computeKMeansXRay,
  computeLinearXRay,
  computeLogisticXRay,
  computeNeuralNetworkXRay,
  computePredictionsSummary,
  formatDelta,
  formatNumber,
  formatPercentage,
  getXRayNarrative,
} from "./x-ray-helpers";

describe("x-ray-helpers", () => {
  describe("computePredictionsSummary", () => {
    it("returns null for empty or undefined arrays", () => {
      expect(computePredictionsSummary(null)).toBeNull();
      expect(computePredictionsSummary(undefined)).toBeNull();
      expect(computePredictionsSummary([])).toBeNull();
    });

    it("computes min, max, mean and a sample of at most 3 elements", () => {
      const summary = computePredictionsSummary([10, 2, 4, 8, 6]);
      expect(summary).not.toBeNull();
      expect(summary?.min).toBe(2);
      expect(summary?.max).toBe(10);
      expect(summary?.mean).toBe(6);
      expect(summary?.sample).toEqual([10, 2, 4]);
    });
  });

  describe("computeClusterDistribution", () => {
    it("returns empty array for zero or negative clusterCount", () => {
      expect(computeClusterDistribution([0, 1], 0)).toEqual([]);
      expect(computeClusterDistribution([0, 1], -1)).toEqual([]);
    });

    it("computes correct counts and percentages for clusters", () => {
      const stats = computeClusterDistribution([0, 0, 1, 1, 1, 2], 3);
      expect(stats).toHaveLength(3);
      expect(stats[0]).toEqual({ clusterIndex: 0, count: 2, percentage: (2 / 6) * 100 });
      expect(stats[1]).toEqual({ clusterIndex: 1, count: 3, percentage: (3 / 6) * 100 });
      expect(stats[2]).toEqual({ clusterIndex: 2, count: 1, percentage: (1 / 6) * 100 });
    });
  });

  describe("computeLinearXRay", () => {
    const state0: TrainingState = {
      step: 0,
      weights: [0.0],
      bias: 0.0,
      loss: 4.5,
      gradients: [],
      bias_gradient: null,
      predictions: [1.0, 2.0, 3.0, 4.0],
      metrics: { mean_squared_error: 4.5 },
    };

    const state1: TrainingState = {
      step: 1,
      weights: [0.5],
      bias: 0.2,
      loss: 2.1,
      gradients: [-5.0],
      bias_gradient: -2.0,
      predictions: [1.5, 2.5, 3.5, 4.5],
      metrics: { mean_squared_error: 2.1 },
    };

    it("identifies state 0 as initial state and does not create fake gradients or deltas", () => {
      const xray0 = computeLinearXRay(state0, null);
      expect(xray0.isInitialState).toBe(true);
      expect(xray0.step).toBe(0);
      expect(xray0.weights).toEqual([0.0]);
      expect(xray0.bias).toBe(0.0);
      expect(xray0.weightGradient).toBeNull();
      expect(xray0.biasGradient).toBeNull();
      expect(xray0.loss).toBe(4.5);
      expect(xray0.frameChanges).toBeNull();
      expect(xray0.predictions).toEqual({
        min: 1.0,
        max: 4.0,
        mean: 2.5,
        sample: [1.0, 2.0, 3.0],
      });
    });

    it("computes gradients and frame deltas at step 1", () => {
      const xray1 = computeLinearXRay(state1, state0);
      expect(xray1.isInitialState).toBe(false);
      expect(xray1.step).toBe(1);
      expect(xray1.weights).toEqual([0.5]);
      expect(xray1.bias).toBe(0.2);
      expect(xray1.weightGradient).toBe(-5.0);
      expect(xray1.biasGradient).toBe(-2.0);
      expect(xray1.loss).toBe(2.1);
      expect(xray1.frameChanges).toEqual({
        weight: 0.5,
        bias: 0.2,
        loss: -2.4,
        weightGradient: undefined, // state0 gradients was empty
      });
    });
  });

  describe("computeLogisticXRay", () => {
    const state0: TrainingState = {
      step: 0,
      weights: [0.0, 0.0],
      bias: 0.0,
      loss: 0.693,
      gradients: [],
      bias_gradient: null,
      predictions: [0.5, 0.5, 0.5, 0.5],
      metrics: { binary_cross_entropy: 0.693, accuracy: 0.5 },
    };

    const state1: TrainingState = {
      step: 1,
      weights: [0.25, -0.15],
      bias: 0.1,
      loss: 0.52,
      gradients: [-0.4, 0.2],
      bias_gradient: -0.1,
      predictions: [0.65, 0.35, 0.7, 0.25],
      metrics: { binary_cross_entropy: 0.52, accuracy: 0.75 },
    };

    it("correctly models logistic regression state 0", () => {
      const xray0 = computeLogisticXRay(state0, null);
      expect(xray0.isInitialState).toBe(true);
      expect(xray0.weights).toEqual([0.0, 0.0]);
      expect(xray0.weightGradients).toEqual([]);
      expect(xray0.biasGradient).toBeNull();
      expect(xray0.loss).toBe(0.693);
      expect(xray0.accuracy).toBe(0.5);
      expect(xray0.probabilities?.mean).toBe(0.5);
      expect(xray0.frameChanges).toBeNull();
    });

    it("computes logistic frame deltas including accuracy and BCE changes", () => {
      const xray1 = computeLogisticXRay(state1, state0);
      expect(xray1.isInitialState).toBe(false);
      expect(xray1.weights).toEqual([0.25, -0.15]);
      expect(xray1.weightGradients).toEqual([-0.4, 0.2]);
      expect(xray1.biasGradient).toBe(-0.1);
      expect(xray1.loss).toBe(0.52);
      expect(xray1.accuracy).toBe(0.75);
      expect(xray1.frameChanges?.weight1).toBeCloseTo(0.25);
      expect(xray1.frameChanges?.weight2).toBeCloseTo(-0.15);
      expect(xray1.frameChanges?.bias).toBeCloseTo(0.1);
      expect(xray1.frameChanges?.loss).toBeCloseTo(-0.173);
      expect(xray1.frameChanges?.accuracy).toBeCloseTo(0.25);
    });
  });

  describe("computeKMeansXRay", () => {
    const state0: TrainingState = {
      step: 0,
      weights: [],
      bias: 0,
      loss: 150.0,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      metrics: { inertia: 150.0 },
      centroids: [
        [1.0, 2.0],
        [5.0, 6.0],
      ],
      cluster_assignments: [0, 0, 1, 1],
      inertia: 150.0,
    };

    const state1: TrainingState = {
      step: 1,
      weights: [],
      bias: 0,
      loss: 95.0,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      metrics: { inertia: 95.0 },
      centroids: [
        [1.2, 2.3],
        [4.8, 5.7],
      ],
      cluster_assignments: [0, 0, 1, 1],
      inertia: 95.0,
      centroid_movement: [0.36, 0.36],
    };

    it("correctly models K-Means state 0 without gradient terms", () => {
      const xray0 = computeKMeansXRay(state0, null, 2);
      expect(xray0.isInitialState).toBe(true);
      expect(xray0.clusterCount).toBe(2);
      expect(xray0.centroids).toEqual([
        [1.0, 2.0],
        [5.0, 6.0],
      ]);
      expect(xray0.inertia).toBe(150.0);
      expect(xray0.centroidMovements).toBeNull();
      expect(xray0.totalMovement).toBeNull();
      expect(xray0.assignmentDistribution).toEqual([
        { clusterIndex: 0, count: 2, percentage: 50 },
        { clusterIndex: 1, count: 2, percentage: 50 },
      ]);
    });

    it("computes movement and inertia delta on step 1", () => {
      const xray1 = computeKMeansXRay(state1, state0, 2);
      expect(xray1.isInitialState).toBe(false);
      expect(xray1.inertia).toBe(95.0);
      expect(xray1.inertiaChange).toBe(-55.0);
      expect(xray1.centroidMovements).toEqual([0.36, 0.36]);
      expect(xray1.totalMovement).toBeCloseTo(0.72);
    });
  });

  describe("computeNeuralNetworkXRay", () => {
    const state0: TrainingState = {
      step: 0,
      weights: [],
      bias: 0,
      gradients: [],
      bias_gradient: null,
      loss: 0.693,
      w1: [
        [0.1, -0.2, 0.3],
        [-0.1, 0.2, -0.3],
      ],
      b1: [0.0, 0.0, 0.0],
      w2: [[0.2], [-0.1], [0.4]],
      b2: 0.0,
      dw1: null,
      db1: null,
      dw2: null,
      db2: null,
      predictions: [0.5, 0.52, 0.48],
      metrics: { binary_cross_entropy: 0.693, accuracy: 0.5 },
    };

    const state1: TrainingState = {
      step: 1,
      weights: [],
      bias: 0,
      gradients: [],
      bias_gradient: null,
      loss: 0.65,
      w1: [
        [0.12, -0.19, 0.31],
        [-0.09, 0.21, -0.29],
      ],
      b1: [0.01, 0.01, -0.01],
      w2: [[0.22], [-0.09], [0.42]],
      b2: 0.02,
      dw1: [
        [-0.02, -0.01, -0.01],
        [-0.01, -0.01, -0.01],
      ],
      db1: [-0.01, -0.01, 0.01],
      dw2: [[-0.02], [-0.01], [-0.02]],
      db2: -0.02,
      predictions: [0.55, 0.58, 0.42],
      metrics: { binary_cross_entropy: 0.65, accuracy: 0.75 },
    };

    it("extracts Step 0 architecture and initial state correctly with null gradients", () => {
      const xray0 = computeNeuralNetworkXRay(state0, null);
      expect(xray0.isInitialState).toBe(true);
      expect(xray0.architecture).toEqual({ inputs: 2, hidden: 3, outputs: 1 });
      expect(xray0.w1).toHaveLength(2);
      expect(xray0.b1).toHaveLength(3);
      expect(xray0.w2).toHaveLength(3);
      expect(xray0.b2).toBe(0.0);
      expect(xray0.dw1).toBeNull();
      expect(xray0.db1).toBeNull();
      expect(xray0.dw2).toBeNull();
      expect(xray0.db2).toBeNull();
      expect(xray0.gradientMagnitude).toBeNull();
      expect(xray0.frameChanges).toBeNull();
      expect(xray0.loss).toBe(0.693);
      expect(xray0.accuracy).toBe(0.5);
    });

    it("computes gradient norm, weight gradient norm, bias gradient norm, and weight deltas on step 1", () => {
      const xray1 = computeNeuralNetworkXRay(state1, state0);
      expect(xray1.isInitialState).toBe(false);
      expect(xray1.gradientMagnitude).toBeGreaterThan(0);
      expect(xray1.weightGradientNorm).toBeGreaterThan(0);
      expect(xray1.biasGradientNorm).toBeGreaterThan(0);
      expect(xray1.w1Norm).toBeGreaterThan(0);
      expect(xray1.w2Norm).toBeGreaterThan(0);
      expect(xray1.frameChanges).not.toBeNull();
      expect(xray1.frameChanges?.loss).toBeCloseTo(-0.043);
      expect(xray1.frameChanges?.accuracy).toBeCloseTo(0.25);
      expect(xray1.frameChanges?.w1DeltaNorm).toBeGreaterThan(0);
      expect(xray1.frameChanges?.w2DeltaNorm).toBeGreaterThan(0);
    });
  });

  describe("formatting helpers", () => {
    it("formatNumber formats numbers or returns N/A", () => {
      expect(formatNumber(null)).toBe("N/A");
      expect(formatNumber(undefined)).toBe("N/A");
      expect(formatNumber(Number.NaN)).toBe("N/A");
      expect(formatNumber(3.14159265, 3)).toBe("3.142");
    });

    it("formatDelta prepends + for non-negative values", () => {
      expect(formatDelta(0.5, 2)).toBe("+0.5");
      expect(formatDelta(-0.5, 2)).toBe("-0.5");
      expect(formatDelta(null)).toBe("N/A");
    });

    it("formatPercentage formats decimal as percentage", () => {
      expect(formatPercentage(0.8523)).toBe("85.2%");
      expect(formatPercentage(null)).toBe("N/A");
    });
  });

  describe("getXRayNarrative", () => {
    it("generates beginner-first what and why explanations for all model architectures", () => {
      const state0: TrainingState = {
        step: 0,
        loss: 0.693,
        weights: [],
        bias: 0,
        gradients: [],
        bias_gradient: null,
        predictions: [0.5],
        metrics: {},
      };
      const nn0 = computeNeuralNetworkXRay(state0, null);
      const narrative0 = getXRayNarrative(nn0);
      expect(narrative0.what).toContain("Step 0");
      expect(narrative0.why).toContain("variance scaling");

      const state1: TrainingState = {
        step: 1,
        loss: 0.65,
        weights: [],
        bias: 0,
        gradients: [],
        bias_gradient: null,
        dw1: [[-0.01]],
        db1: [-0.01],
        dw2: [[-0.01]],
        db2: -0.01,
        predictions: [0.6],
        metrics: { accuracy: 0.75 },
      };
      const nn1 = computeNeuralNetworkXRay(state1, state0);
      const narrative1 = getXRayNarrative(nn1);
      expect(narrative1.what).toContain("decreased");
      expect(narrative1.why).toContain("Backpropagation");
    });
  });
});
