import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { TrainingRun } from "@/types/training-run";
import {
  clearAllExperiments,
  deleteExperiment,
  EXPERIMENTS_STORAGE_KEY,
  formatExperimentMetric,
  generateDefaultTitle,
  getSavedExperimentById,
  getSavedExperiments,
  isValidExperimentRecord,
  saveExperiment,
} from "./experiment-storage";

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

const sampleRun: TrainingRun = {
  id: "run-linear-123",
  algorithm: "linear_regression",
  dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
  dataset_points: [
    { feature: 1, target: 3 },
    { feature: 2, target: 5 },
  ],
  training: { learning_rate: 0.05, epochs: 40, initial_weight: 0, initial_bias: 0 },
  total_steps: 40,
  history: [
    {
      step: 0,
      weights: [0],
      bias: 0,
      loss: 10.0,
      gradients: [],
      bias_gradient: null,
      predictions: [0, 0],
      metrics: { mean_squared_error: 10.0 },
    },
    {
      step: 40,
      weights: [1.95],
      bias: 0.98,
      loss: 0.005,
      gradients: [-0.001],
      bias_gradient: -0.001,
      predictions: [2.93, 4.88],
      metrics: { mean_squared_error: 0.005 },
    },
  ],
  markers: [10],
  metadata: { engine: "test" },
};

const sampleLogisticRun: TrainingRun = {
  ...sampleRun,
  id: "run-logistic-456",
  algorithm: "logistic_regression",
  history: [
    {
      step: 50,
      weights: [0.5, -0.3],
      bias: 0.1,
      loss: 0.23,
      gradients: [-0.01, 0.02],
      bias_gradient: -0.005,
      predictions: [0.8, 0.2],
      metrics: { binary_cross_entropy: 0.23, accuracy: 0.9 },
    },
  ],
};

const sampleKMeansRun: TrainingRun = {
  ...sampleRun,
  id: "run-kmeans-789",
  algorithm: "kmeans",
  training: { ...sampleRun.training, clusters: 3, iterations: 12 },
  history: [
    {
      step: 12,
      weights: [],
      bias: 0,
      loss: 45.2,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      metrics: { inertia: 45.2 },
      centroids: [
        [1, 2],
        [3, 4],
        [5, 6],
      ],
      cluster_assignments: [0, 1, 2],
      inertia: 45.2,
    },
  ],
};

describe("experiment-storage", () => {
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

  it("generates deterministic titles based on algorithm and configuration", () => {
    expect(generateDefaultTitle(sampleRun)).toBe("Linear Regression (40 epochs, lr=0.05)");
    expect(generateDefaultTitle(sampleLogisticRun)).toBe("Logistic Regression (40 epochs, lr=0.05)");
    expect(generateDefaultTitle(sampleKMeansRun)).toBe("K-Means (3 clusters, 12 iterations)");
  });

  it("saves an experiment and lists it in descending order of creation", () => {
    const saved1 = saveExperiment({ run: sampleRun, title: "Custom Run 1" });
    expect(saved1).not.toBeNull();
    expect(saved1?.title).toBe("Custom Run 1");
    expect(saved1?.algorithm).toBe("linear_regression");
    expect(saved1?.id).toMatch(/^exp-/);

    const saved2 = saveExperiment({ run: sampleLogisticRun });
    expect(saved2?.title).toBe("Logistic Regression (40 epochs, lr=0.05)");

    const list = getSavedExperiments();
    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(saved2?.id);
    expect(list[1].id).toBe(saved1?.id);
  });

  it("preserves the complete TrainingRun object faithfully without mutation", () => {
    const saved = saveExperiment({ run: sampleRun, notes: "Special run notes" });
    expect(saved).not.toBeNull();

    const retrieved = getSavedExperimentById(saved!.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.run.id).toBe(sampleRun.id);
    expect(retrieved?.run.total_steps).toBe(40);
    expect(retrieved?.run.dataset_points).toHaveLength(2);
    expect(retrieved?.run.history).toHaveLength(2);
    expect(retrieved?.notes).toBe("Special run notes");
  });

  it("deletes a saved experiment and updates the list immediately", () => {
    const saved = saveExperiment({ run: sampleRun });
    expect(getSavedExperiments()).toHaveLength(1);

    const deleted = deleteExperiment(saved!.id);
    expect(deleted).toBe(true);
    expect(getSavedExperiments()).toHaveLength(0);

    // Deleting non-existent ID returns false
    expect(deleteExperiment("non-existent")).toBe(false);
  });

  it("handles malformed JSON in localStorage safely without throwing or crashing", () => {
    memoryStorage.setItem(EXPERIMENTS_STORAGE_KEY, "invalid-json{{{");
    const list = getSavedExperiments();
    expect(list).toEqual([]);

    // Verify saving still recovers and works
    const saved = saveExperiment({ run: sampleRun });
    expect(saved).not.toBeNull();
    expect(getSavedExperiments()).toHaveLength(1);
  });

  it("ignores individual malformed records without wiping valid ones", () => {
    const valid = {
      id: "exp-valid-1",
      createdAt: new Date().toISOString(),
      algorithm: "linear_regression",
      title: "Valid Experiment",
      configuration: { dataset: sampleRun.dataset, training: sampleRun.training },
      run: sampleRun,
    };

    const corrupted1 = { id: "exp-corrupt-1" };
    const corrupted2 = null;
    const corrupted3 = "a string";

    memoryStorage.setItem(
      EXPERIMENTS_STORAGE_KEY,
      JSON.stringify([corrupted1, valid, corrupted2, corrupted3])
    );

    const list = getSavedExperiments();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe("exp-valid-1");
  });

  it("formats algorithm-specific metrics cleanly without ranking or judging", () => {
    const linearRecord = {
      id: "1",
      createdAt: "",
      algorithm: "linear_regression",
      title: "",
      configuration: { dataset: sampleRun.dataset, training: sampleRun.training },
      run: sampleRun,
    };
    const linearMetric = formatExperimentMetric(linearRecord);
    expect(linearMetric.primaryLabel).toBe("Final MSE");
    expect(linearMetric.primaryValue).toBe("0.005");

    const logisticRecord = {
      id: "2",
      createdAt: "",
      algorithm: "logistic_regression",
      title: "",
      configuration: { dataset: sampleRun.dataset, training: sampleRun.training },
      run: sampleLogisticRun,
    };
    const logisticMetric = formatExperimentMetric(logisticRecord);
    expect(logisticMetric.primaryLabel).toBe("Final BCE");
    expect(logisticMetric.primaryValue).toBe("0.23");
    expect(logisticMetric.secondaryLabel).toBe("Accuracy");
    expect(logisticMetric.secondaryValue).toBe("90.0%");

    const kmeansRecord = {
      id: "3",
      createdAt: "",
      algorithm: "kmeans",
      title: "",
      configuration: { dataset: sampleRun.dataset, training: sampleRun.training },
      run: sampleKMeansRun,
    };
    const kmeansMetric = formatExperimentMetric(kmeansRecord);
    expect(kmeansMetric.primaryLabel).toBe("Final Inertia");
    expect(kmeansMetric.primaryValue).toBe("45.2");
  });

  it("generates unique IDs for each saved experiment", () => {
    const idSet = new Set<string>();
    for (let i = 0; i < 10; i++) {
      const record = saveExperiment({ run: sampleRun });
      expect(record).not.toBeNull();
      expect(idSet.has(record!.id)).toBe(false);
      idSet.add(record!.id);
    }
    expect(idSet.size).toBe(10);
  });

  it("handles unavailable storage safely by returning null or empty array", () => {
    Object.defineProperty(globalThis, "localStorage", {
      value: null,
      writable: true,
      configurable: true,
    });
    expect(getSavedExperiments()).toEqual([]);
    expect(saveExperiment({ run: sampleRun })).toBeNull();
    expect(deleteExperiment("any")).toBe(false);
  });

  it("isValidExperimentRecord validates structure strictly", () => {
    expect(isValidExperimentRecord(null)).toBe(false);
    expect(isValidExperimentRecord({})).toBe(false);
    expect(isValidExperimentRecord({ id: "" })).toBe(false);
    expect(isValidExperimentRecord({ id: "1", createdAt: "now", algorithm: "algo", title: "t" })).toBe(false);
    expect(
      isValidExperimentRecord({
        id: "1",
        createdAt: "now",
        algorithm: "algo",
        title: "t",
        run: sampleRun,
      })
    ).toBe(true);
  });
});
