import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { clearAllExperiments, isValidExperimentRecord, saveExperiment } from "@/features/experiments/experiment-storage";
import { generateEvaluationExplanation } from "@/features/intelligence/intelligence-engine";
import type { TrainingRun } from "@/types/training-run";

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  get length(): number { return Object.keys(this.store).length; }
  clear(): void { this.store = {}; }
  getItem(key: string): string | null { return this.store[key] ?? null; }
  setItem(key: string, value: string): void { this.store[key] = String(value); }
  removeItem(key: string): void { delete this.store[key]; }
  key(index: number): string | null { return Object.keys(this.store)[index] ?? null; }
}

describe("Workbench Integrations & Learning Intelligence", () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    Object.defineProperty(globalThis, "localStorage", {
      value: memoryStorage,
      writable: true,
      configurable: true,
    });
    clearAllExperiments();
  });

  afterEach(() => {
    clearAllExperiments();
  });
  const dummyRun: TrainingRun = {
    id: "test-run-123",
    algorithm: "regression",
    dataset: { samples: 20, noise: 0, seed: 42 },
    dataset_points: [],
    training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 },
    total_steps: 1,
    history: [
      {
        step: 0,
        loss: 0.25,
        weights: [1],
        bias: 0,
        gradients: [0],
        bias_gradient: 0,
        predictions: [],
        metrics: { mean_squared_error: 0.25 },
      },
    ],
    markers: [],
    metadata: {},
  };

  it("serializes experiment with preprocessing, split, and evaluation", () => {
    const saved = saveExperiment({
      run: dummyRun,
      title: "Workbench Regression Run",
      notes: "Test notes",
      preprocessing: {
        numericScaling: "standard",
        missingImputation: "mean_mode",
      },
      split: {
        trainRatio: 0.8,
        seed: 42,
      },
      evaluation: {
        primaryLabel: "Test MSE",
        primaryValue: "0.082",
      },
    });

    expect(saved).not.toBeNull();
    expect(saved?.preprocessing?.numericScaling).toBe("standard");
    expect(saved?.split?.trainRatio).toBe(0.8);
    expect(saved?.evaluation?.primaryValue).toBe("0.082");

    expect(isValidExperimentRecord(saved)).toBe(true);
  });

  it("handles malformed experiment records gracefully without crashing", () => {
    expect(isValidExperimentRecord(null)).toBe(false);
    expect(isValidExperimentRecord(undefined)).toBe(false);
    expect(isValidExperimentRecord({})).toBe(false);
    expect(isValidExperimentRecord({ id: "1", run: "not-an-object" })).toBe(false);
  });

  it("generates evidence-first evaluation explanations", () => {
    const regExplanation = generateEvaluationExplanation("regression", {
      trainMetric: 0.05,
      testMetric: 0.25,
      metricName: "MSE",
    });

    expect(regExplanation.whatHappened).toContain("test MSE of 0.25");
    expect(regExplanation.evidence.length).toBeGreaterThan(0);
    expect(regExplanation.why).toBeDefined();
    expect(regExplanation.parameterBehavior).toContain("generalization gap");

    const clfExplanation = generateEvaluationExplanation("classification", {
      trainMetric: 0.95,
      testMetric: 0.75,
      metricName: "Accuracy",
      threshold: 0.75,
      tp: 3,
      fp: 0,
      fn: 2,
      tn: 5,
    });

    expect(clfExplanation.whatHappened).toContain("threshold θ = 0.75");
    expect(clfExplanation.evidence.some((e) => e.label.includes("Threshold"))).toBe(true);
  });
});
