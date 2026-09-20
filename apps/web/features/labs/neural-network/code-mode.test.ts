import { describe, expect, it } from "vitest";
import type { TrainingState } from "@/types/training-run";
import { getNeuralNetworkCodeLines } from "./code-mode";

describe("neural network code mode", () => {
  it("produces forward and backprop NumPy code lines for initial state", () => {
    const lines = getNeuralNetworkCodeLines(null, 0.3);
    expect(lines.some((l) => l.includes("z1 = X @ w1 + b1"))).toBe(true);
    expect(lines.some((l) => l.includes("dz2 = y_hat - y"))).toBe(true);
    expect(lines.some((l) => l.includes("da1 = dz2 @ w2.T"))).toBe(true);
    expect(lines.some((l) => l.includes("dz1 = da1 * a1 * (1 - a1)"))).toBe(true);
    expect(lines.some((l) => l.includes("w1 -= 0.3 * dw1"))).toBe(true);
  });

  it("annotates gradients with recorded values on trained frames", () => {
    const state: TrainingState = {
      step: 5,
      loss: 0.34,
      weights: [],
      bias: 0,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      w1: [[0.1, 0.2], [0.3, 0.4]],
      b1: [0.0, 0.0],
      w2: [[0.5], [0.6]],
      b2: 0.1,
      dw1: [[0.01, 0.02], [0.01, 0.02]],
      db1: [0.01, 0.01],
      dw2: [[-0.045], [-0.035]],
      db2: -0.02,
      metrics: { binary_cross_entropy: 0.34, accuracy: 0.85 },
    };

    const lines = getNeuralNetworkCodeLines(state, 0.25);
    expect(lines.some((l) => l.includes("-0.045"))).toBe(true);
    expect(lines.some((l) => l.includes("-0.02"))).toBe(true);
    expect(lines.some((l) => l.includes("w1 -= 0.25 * dw1"))).toBe(true);
  });
});
