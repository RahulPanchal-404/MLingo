import { describe, expect, it } from "vitest";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import type { ExperimentRecord } from "@/features/experiments/types";
import {
  MAX_SWEEP_RUNS,
  SWEEP_PARAMETERS,
  buildSweepRequest,
  compareSavedExperiments,
  extractSweepMetric,
  generateSweepInsights,
  validateAndGenerateSweepValues,
} from "./sweep-engine";
import type { ExperimentSweep } from "./types";

function mockLinearRun(lr: number, finalLoss: number): TrainingRun {
  return {
    id: `run-linear-${lr}`,
    algorithm: "linear_regression",
    dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
    dataset_points: [{ x: 1, y: 3 }, { x: 2, y: 5 }],
    training: { learning_rate: lr, epochs: 20, initial_weight: 0, initial_bias: 0 },
    total_steps: 20,
    history: [
      {
        step: 0,
        weights: [0],
        bias: 0,
        loss: 10.0,
        gradients: [2.0],
        bias_gradient: 1.0,
        predictions: [0, 0],
        metrics: { mean_squared_error: 10.0 },
      },
      {
        step: 19,
        weights: [1.9],
        bias: 0.9,
        loss: finalLoss,
        gradients: [0.01],
        bias_gradient: 0.01,
        predictions: [2.8, 4.7],
        metrics: { mean_squared_error: finalLoss },
      },
    ],
    markers: [],
    metadata: {},
  };
}

function mockLogisticRun(lr: number, finalLoss: number, accuracy: number): TrainingRun {
  return {
    id: `run-logistic-${lr}`,
    algorithm: "logistic_regression",
    dataset: { samples: 32, noise: 0.1, seed: 0 },
    dataset_points: [{ feature: 0.5, label: 1 }],
    training: { learning_rate: lr, epochs: 20, initial_weight: 0, initial_bias: 0 },
    total_steps: 20,
    history: [
      {
        step: 0,
        weights: [0],
        bias: 0,
        loss: 0.693,
        gradients: [0.1],
        bias_gradient: 0.1,
        predictions: [0.5],
        metrics: { binary_cross_entropy: 0.693, accuracy: 0.5 },
      },
      {
        step: 19,
        weights: [1.2],
        bias: -0.4,
        loss: finalLoss,
        gradients: [0.02],
        bias_gradient: 0.01,
        predictions: [0.82],
        metrics: { binary_cross_entropy: finalLoss, accuracy },
      },
    ],
    markers: [],
    metadata: {},
  };
}

function mockKMeansRun(k: number, finalInertia: number): TrainingRun {
  return {
    id: `run-kmeans-${k}`,
    algorithm: "kmeans",
    dataset: { samples: 40, noise: 0.1, seed: 0, clusters: k },
    dataset_points: [{ x: 1, y: 1 }, { x: 5, y: 5 }],
    training: { learning_rate: 0.1, epochs: 10, initial_weight: 0, initial_bias: 0, clusters: k, iterations: 10 },
    total_steps: 10,
    history: [
      {
        step: 0,
        weights: [],
        bias: 0,
        loss: 50.0,
        gradients: [],
        bias_gradient: null,
        predictions: [],
        metrics: { inertia: 50.0 },
        inertia: 50.0,
        centroids: [[0, 0]],
        cluster_assignments: [0, 0],
      },
      {
        step: 9,
        weights: [],
        bias: 0,
        loss: finalInertia,
        gradients: [],
        bias_gradient: null,
        predictions: [],
        metrics: { inertia: finalInertia },
        inertia: finalInertia,
        centroids: [[1, 1], [5, 5]],
        cluster_assignments: [0, 1],
      },
    ],
    markers: [],
    metadata: {},
  };
}

describe("sweep-engine", () => {
  it("1. generates sweep values correctly with floating point precision", () => {
    const result = validateAndGenerateSweepValues(0.01, 0.05, 0.01);
    expect(result.isValid).toBe(true);
    expect(result.expectedRunCount).toBe(5);
    expect(result.previewValues).toEqual([0.01, 0.02, 0.03, 0.04, 0.05]);
  });

  it("2. enforces inclusive start and end behavior", () => {
    const result = validateAndGenerateSweepValues(2, 5, 1, true);
    expect(result.isValid).toBe(true);
    expect(result.previewValues).toEqual([2, 3, 4, 5]);
    expect(result.previewValues[0]).toBe(2);
    expect(result.previewValues[result.previewValues.length - 1]).toBe(5);
  });

  it("3. handles invalid step size (zero and negative)", () => {
    const zeroStep = validateAndGenerateSweepValues(0.01, 0.1, 0);
    expect(zeroStep.isValid).toBe(false);
    expect(zeroStep.error).toMatch(/greater than zero/i);

    const negativeStep = validateAndGenerateSweepValues(0.01, 0.1, -0.01);
    expect(negativeStep.isValid).toBe(false);
    expect(negativeStep.error).toMatch(/greater than zero/i);
  });

  it("4. enforces maximum run-count bounds (MAX_SWEEP_RUNS = 7)", () => {
    const tooManyRuns = validateAndGenerateSweepValues(0.01, 0.1, 0.01, false, MAX_SWEEP_RUNS);
    expect(tooManyRuns.isValid).toBe(false);
    expect(tooManyRuns.expectedRunCount).toBe(10);
    expect(tooManyRuns.error).toMatch(/exceeds the safe maximum of 7 runs/i);
  });

  it("5. provides algorithm-specific sweep parameters", () => {
    expect(SWEEP_PARAMETERS.linear_regression.key).toBe("learning_rate");
    expect(SWEEP_PARAMETERS.logistic_regression.key).toBe("learning_rate");
    expect(SWEEP_PARAMETERS.kmeans.key).toBe("clusters");
    expect(SWEEP_PARAMETERS.kmeans.isInteger).toBe(true);
  });

  it("6. builds non-mutated sweep request for each parameter key", () => {
    const baseRequest: TrainingRunRequest = {
      algorithm: "linear_regression",
      dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
      training: { learning_rate: 0.01, epochs: 50, initial_weight: 0, initial_bias: 0 },
    };

    const newRequest = buildSweepRequest(baseRequest, "learning_rate", 0.05);
    expect(newRequest.training.learning_rate).toBe(0.05);
    expect(baseRequest.training.learning_rate).toBe(0.01); // base not mutated
  });

  it("7. extracts final metrics correctly across all three algorithms", () => {
    const linearRun = mockLinearRun(0.05, 0.42);
    const logisticRun = mockLogisticRun(0.1, 0.25, 0.95);
    const kmeansRun = mockKMeansRun(3, 14.8);

    expect(extractSweepMetric(linearRun)).toEqual({ label: "MSE", value: 0.42 });
    expect(extractSweepMetric(logisticRun)).toEqual({ label: "BCE", value: 0.25 });
    expect(extractSweepMetric(kmeansRun)).toEqual({ label: "Inertia", value: 14.8 });
  });

  it("8. handles partial sweep failure gracefully without dropping successful runs", () => {
    const sweep: ExperimentSweep = {
      id: "sweep-1",
      algorithm: "linear_regression",
      parameterKey: "learning_rate",
      parameterName: "Learning rate",
      startValue: 0.01,
      endValue: 0.03,
      stepValue: 0.01,
      baseRequest: {
        algorithm: "linear_regression",
        dataset: { samples: 32, noise: 0, seed: 0 },
        training: { learning_rate: 0.01, epochs: 20, initial_weight: 0, initial_bias: 0 },
      },
      runs: [
        {
          id: "r1",
          parameterName: "learning_rate",
          parameterValue: 0.01,
          trainingRun: mockLinearRun(0.01, 1.5),
          status: "completed",
        },
        {
          id: "r2",
          parameterName: "learning_rate",
          parameterValue: 0.02,
          trainingRun: null,
          status: "failed",
          error: "Connection timeout",
        },
        {
          id: "r3",
          parameterName: "learning_rate",
          parameterValue: 0.03,
          trainingRun: mockLinearRun(0.03, 0.8),
          status: "completed",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const completed = sweep.runs.filter((r) => r.status === "completed");
    expect(completed.length).toBe(2);
    const insights = generateSweepInsights(sweep);
    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toContain("Across the sweep range");
  });

  it("9. validates empty sweep or invalid reversed ranges", () => {
    const reversed = validateAndGenerateSweepValues(0.1, 0.01, 0.01);
    expect(reversed.isValid).toBe(false);
    expect(reversed.error).toMatch(/greater than or equal to start/i);
  });

  it("10. compares saved experiments factually without subjective words", () => {
    const run1 = mockLinearRun(0.01, 1.42);
    const run2 = mockLinearRun(0.10, 0.63);

    const records: ExperimentRecord[] = [
      {
        id: "exp-1",
        createdAt: "2026-09-18T10:00:00Z",
        algorithm: "linear_regression",
        title: "Run 1",
        configuration: { dataset: run1.dataset, training: run1.training },
        run: run1,
      },
      {
        id: "exp-2",
        createdAt: "2026-09-18T10:05:00Z",
        algorithm: "linear_regression",
        title: "Run 2",
        configuration: { dataset: run2.dataset, training: run2.training },
        run: run2,
      },
    ];

    const analysis = compareSavedExperiments(records);
    expect(analysis.differences.length).toBeGreaterThan(0);
    expect(analysis.metricComparison.length).toBe(2);
    expect(analysis.insights.length).toBeGreaterThan(0);

    const allText = JSON.stringify(analysis).toLowerCase();
    expect(allText).not.toContain("winner");
    expect(allText).not.toContain("loser");
    expect(allText).not.toContain("better");
    expect(allText).not.toContain("worse");
    expect(allText).not.toContain("best");
  });

  it("11. generates deterministic sweep insights observing loss trends", () => {
    const sweep: ExperimentSweep = {
      id: "sweep-kmeans",
      algorithm: "kmeans",
      parameterKey: "clusters",
      parameterName: "Clusters (k)",
      startValue: 2,
      endValue: 4,
      stepValue: 1,
      baseRequest: {
        algorithm: "kmeans",
        dataset: { samples: 40, noise: 0.1, seed: 0 },
        training: { learning_rate: 0.1, epochs: 10, initial_weight: 0, initial_bias: 0, clusters: 2, iterations: 10 },
      },
      runs: [
        { id: "k2", parameterName: "clusters", parameterValue: 2, trainingRun: mockKMeansRun(2, 60.5), status: "completed" },
        { id: "k3", parameterName: "clusters", parameterValue: 3, trainingRun: mockKMeansRun(3, 30.2), status: "completed" },
        { id: "k4", parameterName: "clusters", parameterValue: 4, trainingRun: mockKMeansRun(4, 15.1), status: "completed" },
      ],
      createdAt: new Date().toISOString(),
    };

    const insights = generateSweepInsights(sweep);
    expect(insights.length).toBeGreaterThanOrEqual(2);
    expect(insights[0]).toContain("Inertia decreased from 60.5 to 15.1");
  });

  it("12. preserves TrainingRun immutability during metric extraction and insight generation", () => {
    const run = mockLinearRun(0.05, 0.42);
    const originalString = JSON.stringify(run);

    extractSweepMetric(run);
    const sweep: ExperimentSweep = {
      id: "s",
      algorithm: "linear_regression",
      parameterKey: "learning_rate",
      parameterName: "Learning rate",
      startValue: 0.05,
      endValue: 0.05,
      stepValue: 0.01,
      baseRequest: { algorithm: "linear_regression", dataset: run.dataset, training: run.training },
      runs: [{ id: "1", parameterName: "learning_rate", parameterValue: 0.05, trainingRun: run, status: "completed" }],
      createdAt: new Date().toISOString(),
    };
    generateSweepInsights(sweep);

    expect(JSON.stringify(run)).toBe(originalString);
  });

  it("13. handles completely empty runs array in sweep insights", () => {
    const emptySweep: ExperimentSweep = {
      id: "empty",
      algorithm: "linear_regression",
      parameterKey: "learning_rate",
      parameterName: "Learning rate",
      startValue: 0.01,
      endValue: 0.05,
      stepValue: 0.01,
      baseRequest: { algorithm: "linear_regression", dataset: { samples: 32, noise: 0, seed: 0 }, training: { learning_rate: 0.01, epochs: 10, initial_weight: 0, initial_bias: 0 } },
      runs: [],
      createdAt: new Date().toISOString(),
    };

    const insights = generateSweepInsights(emptySweep);
    expect(insights).toEqual(["No runs completed successfully in this sweep."]);
  });
});
