import { describe, expect, it } from "vitest";
import { getKMeansCodeLines } from "@/features/labs/k-means/code-mode";

describe("K-Means Code Mode", () => {
  it("renders conceptual numpy operations with recorded frame metrics", () => {
    const mockState = {
      step: 2,
      weights: [],
      bias: 0,
      loss: 14.5,
      gradients: [],
      bias_gradient: null,
      predictions: [],
      metrics: { inertia: 14.5 },
      inertia: 14.5,
      centroid_movement: [0.02, 0.03],
    };

    const lines = getKMeansCodeLines(mockState);
    expect(lines.length).toBeGreaterThanOrEqual(5);
    expect(lines.some((line) => line.includes("np.argmin(distances, axis=1)"))).toBe(true);
    expect(lines.some((line) => line.includes("recorded inertia = 14.5"))).toBe(true);
  });

  it("handles null state safely", () => {
    const lines = getKMeansCodeLines(null);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.some((line) => line.includes("recorded inertia = N/A"))).toBe(true);
  });
});
