import { describe, expect, it } from "vitest";

import { trainLocally } from "./train";

const linear = (lr: number, extra: Partial<{ noise: number; epochs: number }> = {}) =>
  trainLocally({
    algorithm: "linear_regression",
    dataset: { samples: 32, slope: 2, intercept: 1, noise: extra.noise ?? 0, seed: 0 },
    training: { learning_rate: lr, epochs: extra.epochs ?? 50, initial_weight: 0, initial_bias: 0 },
  });

describe("browser training engine", () => {
  it("reproduces the backend linear regression run exactly when there is no noise", () => {
    // Values from apps/api create_training_run with the same request.
    const run = linear(0.1);
    expect(run.history).toHaveLength(51);
    [2.4193548387, 1.8650464906, 1.4669387733, 1.1747340854].forEach((v, i) => expect(run.history[i].loss).toBeCloseTo(v, 9));
    expect(run.history[50].loss).toBeCloseTo(0.0009019251, 9);
    expect(run.history[50].weights[0]).toBeCloseTo(1.949583848380465, 12);
    expect(run.history[50].bias).toBeCloseTo(0.9999857275230729, 12);
    expect(run.history[0].gradients).toEqual([]);
    expect(run.history[0].bias_gradient).toBeNull();
  });

  it("stops at the first non-finite frame and records where it diverged", () => {
    const run = linear(5, { epochs: 2000 });
    expect(run.metadata.stopped_reason).toBe("diverged");
    expect(Number(run.metadata.diverged_at_step)).toBe(run.history.length);
    expect(run.history.every((s) => Number.isFinite(s.loss))).toBe(true);
  });

  it("is reproducible from the seed", () => {
    expect(linear(0.1, { noise: 0.3 }).dataset_points).toEqual(linear(0.1, { noise: 0.3 }).dataset_points);
  });

  it("trains logistic regression to separate the two blobs", () => {
    const run = trainLocally({ algorithm: "logistic_regression", dataset: { samples: 64, noise: 0.4, seed: 1 }, training: { learning_rate: 0.5, epochs: 100, initial_weight: 0, initial_bias: 0 } });
    expect(run.history[0].loss).toBeCloseTo(Math.log(2), 6);
    expect(run.history.at(-1)!.loss).toBeLessThan(0.2);
    expect(run.history.at(-1)!.metrics.accuracy).toBeGreaterThan(0.95);
    expect(run.history[1].gradients).toHaveLength(2);
  });

  it("trains the neural network with backpropagation and records every layer", () => {
    const run = trainLocally({ algorithm: "neural_network", dataset: { samples: 64, noise: 0.4, seed: 1 }, training: { learning_rate: 1, epochs: 200, initial_weight: 0, initial_bias: 0, hidden_neurons: 3, seed: 0 } });
    const last = run.history.at(-1)!;
    expect(last.w1).toHaveLength(2);
    expect(last.w1![0]).toHaveLength(3);
    expect(last.hidden_activations).toHaveLength(8);
    expect(last.loss).toBeLessThan(run.history[0].loss / 2);
  });

  it("runs k-means until inertia stops falling", () => {
    const run = trainLocally({ algorithm: "kmeans", dataset: { samples: 60, noise: 0.4, seed: 0 }, training: { learning_rate: 0.1, epochs: 10, initial_weight: 0, initial_bias: 0, clusters: 3, iterations: 10, seed: 0 } });
    const inertias = run.history.map((s) => s.inertia!);
    inertias.slice(1).forEach((v, i) => expect(v).toBeLessThanOrEqual(inertias[i] + 1e-9));
    expect(run.history[0].cluster_assignments).toHaveLength(60);
  });

  it("rejects requests the API would reject", () => {
    expect(() => trainLocally({ algorithm: "kmeans", dataset: { samples: 3, noise: 0.1, seed: 0 }, training: { learning_rate: 0.1, epochs: 5, initial_weight: 0, initial_bias: 0, clusters: 5, iterations: 5 } })).toThrow(/cannot exceed/);
    expect(() => linear(0)).toThrow(/learning rate/);
  });
});
