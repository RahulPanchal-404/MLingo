import { describe, expect, it } from "vitest";
import type { TrainingRun } from "@/types/training-run";
import type { DiagnosticEvent } from "@/features/diagnostics/types";
import { generateComparisonInsights, generateTrainingInsights } from "@/features/insights/engine";

function createMockRun(
  algorithm: string,
  losses: number[],
  extra?: {
    accuracies?: number[];
    gradients?: number[];
    biasGradients?: number[];
    centroidMovements?: number[][];
    inertias?: number[];
    learningRate?: number;
    clusters?: number;
  }
): TrainingRun {
  const history = losses.map((loss, index) => ({
    step: index,
    weights: [1.0],
    bias: 0.5,
    loss,
    gradients: [extra?.gradients?.[index] ?? 0.1],
    bias_gradient: extra?.biasGradients?.[index] ?? 0.05,
    predictions: [1.0],
    metrics: {
      mean_squared_error: algorithm === "linear_regression" ? loss : null,
      binary_cross_entropy: algorithm === "logistic_regression" ? loss : null,
      accuracy: extra?.accuracies?.[index] ?? null,
      inertia: extra?.inertias?.[index] ?? (algorithm === "kmeans" ? loss : null),
    },
    centroids: algorithm === "kmeans" ? ([[0, 0], [1, 1]] as [number, number][]) : undefined,
    centroid_movement: extra?.centroidMovements?.[index] ?? undefined,
    inertia: extra?.inertias?.[index] ?? (algorithm === "kmeans" ? loss : null),
  }));

  return {
    id: "test-run",
    algorithm,
    dataset: { samples: 10, noise: 0.1, seed: 0 },
    dataset_points: [],
    training: {
      learning_rate: extra?.learningRate ?? 0.1,
      epochs: losses.length - 1,
      initial_weight: 0,
      initial_bias: 0,
      clusters: extra?.clusters,
    },
    total_steps: losses.length - 1,
    history,
    markers: [],
    metadata: {},
  };
}

describe("Training Insights Engine", () => {
  it("generates deterministic insights from existing diagnostics", () => {
    const run = createMockRun("linear_regression", [10, 4, 3, 2]);
    const diagnostics: DiagnosticEvent[] = [
      {
        id: "diagnostic-rapid-loss",
        step: 1,
        type: "rapid_loss_decrease",
        title: "Rapid loss decrease",
        description: "Loss dropped significantly.",
        severity: "info",
        evidence: { previousLoss: 10, currentLoss: 4 },
      },
    ];

    const insights = generateTrainingInsights(run, diagnostics);
    expect(insights.length).toBeGreaterThanOrEqual(1);
    const rapid = insights.find((i) => i.id === "insight-rapid-decrease");
    expect(rapid).toBeDefined();
    expect(rapid?.step).toBe(1);
    expect(rapid?.description).toContain("Step 2");
    expect(rapid?.category).toBe("loss");
  });

  it("handles linear regression with terminal small gradients", () => {
    const run = createMockRun(
      "linear_regression",
      [5, 3, 1, 0.5],
      { gradients: [2, 1, 0.1, 0.01], biasGradients: [1, 0.5, 0.05, 0.005] }
    );
    const insights = generateTrainingInsights(run, []);
    const gradInsight = insights.find((i) => i.id === "insight-linear-gradients");
    expect(gradInsight).toBeDefined();
    expect(gradInsight?.step).toBe(3);
    expect(gradInsight?.description).toContain("Weight and bias gradients became small");
  });

  it("handles logistic regression accuracy reaching 100% while BCE continues refining", () => {
    const run = createMockRun(
      "logistic_regression",
      [0.8, 0.5, 0.3, 0.15],
      { accuracies: [0.6, 0.8, 1.0, 1.0] }
    );
    const insights = generateTrainingInsights(run, []);
    const refineInsight = insights.find((i) => i.id === "insight-logistic-perfect-acc-refining");
    expect(refineInsight).toBeDefined();
    expect(refineInsight?.step).toBe(2);
    expect(refineInsight?.title).toBe("Confidence refinement");
    expect(refineInsight?.description).toContain("Accuracy reached 100% at Step 3");
  });

  it("handles K-Means early iteration inertia drop and centroid stabilization", () => {
    const run = createMockRun(
      "kmeans",
      [100, 20, 15, 12],
      {
        centroidMovements: [[0.5, 0.5], [0.3, 0.2], [0.05, 0.05], [0.005, 0.005]],
      }
    );
    const insights = generateTrainingInsights(run, []);
    const earlyDrop = insights.find((i) => i.id === "insight-kmeans-early-inertia");
    expect(earlyDrop).toBeDefined();
    expect(earlyDrop?.step).toBe(1);
    expect(earlyDrop?.description).toContain("Inertia decreased substantially during the early iterations");

    const stabilization = insights.find((i) => i.id === "insight-kmeans-movement-small");
    expect(stabilization).toBeDefined();
    expect(stabilization?.description).toContain("Centroid movement became small");
  });

  it("handles single-step or empty runs gracefully without throwing", () => {
    expect(generateTrainingInsights(null as unknown as TrainingRun, [])).toEqual([]);
    const singleStateRun = createMockRun("linear_regression", [5]);
    const insights = generateTrainingInsights(singleStateRun, []);
    expect(insights.length).toBe(1);
    expect(insights[0].id).toBe("insight-single-frame");
  });
});

describe("Comparison Insights Engine", () => {
  it("factually compares two linear regression runs without winner/loser language", () => {
    const runA = createMockRun("linear_regression", [10, 8, 7], { learningRate: 0.01 });
    const runB = createMockRun("linear_regression", [10, 5, 2], { learningRate: 0.1 });

    const insights = generateComparisonInsights(runA, runB);
    expect(insights.length).toBeGreaterThan(0);

    const fullText = insights.map((i) => i.title + " " + i.description).join(" ").toLowerCase();
    expect(fullText).not.toContain("winner");
    expect(fullText).not.toContain("loser");
    expect(fullText).not.toContain("better");
    expect(fullText).not.toContain("worse");
    expect(fullText).not.toContain("best");

    const metricInsight = insights.find((i) => i.id === "comp-metric-loss");
    expect(metricInsight).toBeDefined();
    expect(metricInsight?.description).toContain("Run B reached a lower recorded final loss");
  });

  it("detects trajectory oscillation difference factually", () => {
    const runA = createMockRun("linear_regression", [10, 4, 8, 12]); // increased after decrease at step 2
    const runB = createMockRun("linear_regression", [10, 8, 6, 4]); // monotonic decrease

    const insights = generateComparisonInsights(runA, runB);
    const dynInsight = insights.find((i) => i.id === "comp-dynamics-oscillation");
    expect(dynInsight).toBeDefined();
    expect(dynInsight?.description).toContain("Run A showed a loss increase at Step 3");
  });

  it("factually compares two K-Means runs with different cluster counts", () => {
    const runA = createMockRun("kmeans", [100, 50, 40], { clusters: 2, inertias: [100, 50, 40] });
    const runB = createMockRun("kmeans", [100, 30, 20], { clusters: 3, inertias: [100, 30, 20] });

    const insights = generateComparisonInsights(runA, runB);
    const configInsight = insights.find((i) => i.id === "comp-config-clusters");
    expect(configInsight).toBeDefined();
    expect(configInsight?.description).toContain("Run A configured 2 clusters, whereas Run B configured 3 clusters");

    const inertiaInsight = insights.find((i) => i.id === "comp-metric-inertia");
    expect(inertiaInsight).toBeDefined();
    expect(inertiaInsight?.description).toContain("Run B reached a lower recorded final inertia");
  });
});
