import { describe, expect, it } from "vitest";
import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TrainingRun } from "@/types/training-run";
import { generateLearningIntelligence } from "./intelligence-engine";

describe("intelligence-engine", () => {
  const linearRun: TrainingRun = {
    id: "run-linear",
    algorithm: "linear_regression",
    dataset: { samples: 32, noise: 0.1, seed: 0 },
    dataset_points: [],
    training: { learning_rate: 0.1, epochs: 40, initial_weight: 0, initial_bias: 0 },
    total_steps: 40,
    history: [
      { step: 0, loss: 4.5, weights: [0.0], bias: 0.0, gradients: [], bias_gradient: null, predictions: [], metrics: { mean_squared_error: 4.5 } },
      { step: 1, loss: 2.1, weights: [0.8], bias: 0.2, gradients: [-0.02], bias_gradient: -0.01, predictions: [], metrics: { mean_squared_error: 2.1 } },
      { step: 2, loss: 0.5, weights: [1.5], bias: 0.6, gradients: [-0.005], bias_gradient: -0.002, predictions: [], metrics: { mean_squared_error: 0.5 } },
    ],
    markers: [],
    metadata: {},
  };

  const logisticRun: TrainingRun = {
    id: "run-logistic",
    algorithm: "logistic_regression",
    dataset: { samples: 40, noise: 0.1, seed: 0 },
    dataset_points: [],
    training: { learning_rate: 0.2, epochs: 30, initial_weight: 0, initial_bias: 0 },
    total_steps: 30,
    history: [
      { step: 0, loss: 0.693, weights: [0, 0], bias: 0, gradients: [], bias_gradient: null, predictions: [0.5, 0.5], metrics: { binary_cross_entropy: 0.693, accuracy: 0.5 } },
      { step: 1, loss: 0.45, weights: [0.5, -0.3], bias: 0.1, gradients: [-0.04, 0.03], bias_gradient: -0.02, predictions: [0.8, 0.2], metrics: { binary_cross_entropy: 0.45, accuracy: 0.85 } },
    ],
    markers: [],
    metadata: {},
  };

  const kmeansRun: TrainingRun = {
    id: "run-kmeans",
    algorithm: "kmeans",
    dataset: { samples: 50, noise: 0.1, seed: 0 },
    dataset_points: [],
    training: { learning_rate: 0, epochs: 10, initial_weight: 0, initial_bias: 0, clusters: 3 },
    total_steps: 10,
    history: [
      { step: 0, loss: 120.0, weights: [], bias: 0, gradients: [], bias_gradient: null, predictions: [], metrics: { inertia: 120.0 }, centroids: [[0, 0], [1, 1], [2, 2]], centroid_movement: [0.5, 0.5, 0.5] },
      { step: 1, loss: 45.0, weights: [], bias: 0, gradients: [], bias_gradient: null, predictions: [], metrics: { inertia: 45.0 }, centroids: [[0.2, 0.1], [1.1, 0.9], [2.1, 1.9]], centroid_movement: [0.01, 0.01, 0.01] },
    ],
    markers: [],
    metadata: {},
  };

  const neuralRun: TrainingRun = {
    id: "run-neural",
    algorithm: "neural_network",
    dataset: { samples: 60, noise: 0.1, seed: 0 },
    dataset_points: [],
    training: { learning_rate: 0.3, epochs: 50, initial_weight: 0, initial_bias: 0, hidden_neurons: 3 },
    total_steps: 50,
    history: [
      { step: 0, loss: 0.693, weights: [], bias: 0, gradients: [], bias_gradient: null, predictions: [], metrics: { binary_cross_entropy: 0.693, accuracy: 0.5 } },
      { step: 1, loss: 0.55, weights: [], bias: 0, gradients: [], bias_gradient: null, predictions: [], metrics: { binary_cross_entropy: 0.55, accuracy: 0.75 }, dw2: [[-0.03], [-0.02], [-0.01]], db2: -0.01 },
    ],
    markers: [],
    metadata: {},
  };

  describe("Linear Regression Explanations", () => {
    it("generates evidence-based rapid loss decrease explanation", () => {
      const event: DiagnosticEvent = {
        id: "diag-1",
        step: 1,
        type: "rapid_loss_decrease",
        title: "Rapid loss decrease",
        description: "Loss dropped significantly.",
        severity: "info",
        evidence: { previousLoss: 4.5, currentLoss: 2.1, relativeLossChange: 0.533 },
      };

      const result = generateLearningIntelligence(event, linearRun, linearRun.history[1]);
      expect(result.step).toBe(1);
      expect(result.whatHappened).toContain("4.5");
      expect(result.whatHappened).toContain("2.1");
      expect(result.why).toContain("parameter update moved the regression line");
      expect(result.parameterBehavior).toContain("Learning rate α = 0.1");
      expect(result.evidence.some((e) => e.label === "Previous MSE" && e.value === "4.5")).toBe(true);
      expect(result.evidence.some((e) => e.label === "Current MSE" && e.value === "2.1")).toBe(true);
    });

    it("generates plateau explanation without inventing numbers", () => {
      const event: DiagnosticEvent = {
        id: "diag-2",
        step: 15,
        type: "possible_plateau",
        title: "Possible plateau",
        description: "Loss changed very little.",
        severity: "warning",
        evidence: { windowLength: 5, startLoss: 0.201, endLoss: 0.200, maxAbsoluteChange: 0.001 },
      };

      const result = generateLearningIntelligence(event, linearRun, null);
      expect(result.evidence.some((e) => e.label === "Window length" && e.value === "5 frames")).toBe(true);
      expect(result.suggestedAction).toContain("learning rate");
    });

    it("generates near convergence explanation with gradient evidence", () => {
      const event: DiagnosticEvent = {
        id: "diag-3",
        step: 35,
        type: "near_convergence",
        title: "Near convergence",
        description: "Gradients are small.",
        severity: "success",
        evidence: { weightGradient: 0.004, biasGradient: 0.001, gradientMagnitudes: [0.004, 0.001] },
      };

      const result = generateLearningIntelligence(event, linearRun, null);
      expect(result.why).toContain("stationary point");
      expect(result.evidence.some((e) => e.label === "Weight gradient (∂L/∂w)" && e.value === "0.004")).toBe(true);
    });
  });

  describe("Logistic Regression Explanations", () => {
    it("incorporates binary cross entropy and accuracy without claiming generalization", () => {
      const event: DiagnosticEvent = {
        id: "diag-log-1",
        step: 1,
        type: "rapid_loss_decrease",
        title: "Rapid loss decrease",
        description: "BCE dropped.",
        severity: "info",
        evidence: { previousLoss: 0.693, currentLoss: 0.45 },
      };

      const result = generateLearningIntelligence(event, logisticRun, logisticRun.history[1]);
      expect(result.whatHappened).toContain("binary cross-entropy");
      expect(result.why).toContain("gradient step adjusted the weights and bias");
      expect(result.whatHappened).not.toContain("generalize");
      expect(result.whatHappened).not.toContain("understands");
      expect(result.evidence.some((e) => e.label === "Classification accuracy" && e.value === "85.0%")).toBe(true);
    });
  });

  describe("K-Means Explanations", () => {
    it("uses inertia and centroid movement without mentioning weights or gradients", () => {
      const event: DiagnosticEvent = {
        id: "diag-km-1",
        step: 1,
        type: "near_convergence",
        title: "Near convergence",
        description: "Centroid movement small.",
        severity: "success",
        evidence: { centroidMovement: [0.01, 0.01, 0.01] },
      };

      const result = generateLearningIntelligence(event, kmeansRun, kmeansRun.history[1]);
      expect(result.whatHappened).toContain("Centroid movement became very small");
      expect(result.why).toContain("cluster assignments between iterations");
      expect(result.why).not.toContain("gradient");
      expect(result.why).not.toContain("weight");
      expect(result.parameterBehavior).not.toContain("learning rate");
      expect(result.parameterBehavior).toContain("k=3");
      expect(result.evidence.some((e) => e.label === "Centroid movement")).toBe(true);
    });
  });

  describe("Neural Network Explanations", () => {
    it("describes layerwise backpropagation and hidden activations", () => {
      const event: DiagnosticEvent = {
        id: "diag-nn-1",
        step: 1,
        type: "rapid_loss_decrease",
        title: "Rapid loss decrease",
        description: "BCE dropped.",
        severity: "info",
        evidence: { previousLoss: 0.693, currentLoss: 0.55 },
      };

      const result = generateLearningIntelligence(event, neuralRun, neuralRun.history[1]);
      expect(result.whatHappened).toContain("Binary cross-entropy dropped");
      expect(result.why).toContain("Analytical backpropagation");
      expect(result.parameterBehavior).toContain("3 hidden units");
      expect(result.suggestedAction).toContain("Model X-Ray");
    });
  });

  describe("Strict Neutrality and Robustness", () => {
    it("never includes subjective winner or ranking language", () => {
      const event: DiagnosticEvent = {
        id: "diag-neut",
        step: 1,
        type: "possible_instability",
        title: "Possible instability",
        description: "Loss increased.",
        severity: "warning",
        evidence: { previousLoss: 0.5, currentLoss: 0.8 },
      };

      const result = generateLearningIntelligence(event, linearRun, linearRun.history[1]);
      const fullText = `${result.whatHappened} ${result.why} ${result.parameterBehavior} ${result.suggestedAction}`.toLowerCase();
      expect(fullText).not.toContain("winner");
      expect(fullText).not.toContain("loser");
      expect(fullText).not.toContain("best");
      expect(fullText).not.toContain("worst");
      expect(fullText).not.toContain("you should");
    });
  });
});
