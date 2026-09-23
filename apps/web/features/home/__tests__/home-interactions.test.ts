import { describe, expect, it } from "vitest";
import {
  HERO_DATASET_POINTS,
  HERO_MILESTONES,
  HERO_TRAINING_FRAMES,
} from "../hero-training-math";

describe("Homepage Interactions & Telemetry", () => {
  it("provides monotonic or near-monotonic loss reduction across training frames", () => {
    expect(HERO_TRAINING_FRAMES.length).toBe(41);

    // Initial loss vs final loss
    const startLoss = HERO_TRAINING_FRAMES[0].loss;
    const endLoss = HERO_TRAINING_FRAMES[40].loss;
    expect(startLoss).toBeGreaterThan(1.5);
    expect(endLoss).toBeLessThan(0.1);

    // Verify losses decrease overall
    let violations = 0;
    for (let i = 1; i < HERO_TRAINING_FRAMES.length; i++) {
      if (HERO_TRAINING_FRAMES[i].loss > HERO_TRAINING_FRAMES[i - 1].loss) {
        violations++;
      }
    }
    // Gradient descent with small alpha on convex MSE should have 0 violations
    expect(violations).toBe(0);
  });

  it("verifies parameter convergence matches expected values w ≈ 2.0 and b ≈ 1.0", () => {
    const finalFrame = HERO_TRAINING_FRAMES[40];
    expect(finalFrame.weight).toBeGreaterThan(1.85);
    expect(finalFrame.weight).toBeLessThan(2.1);
    expect(finalFrame.bias).toBeGreaterThan(0.85);
    expect(finalFrame.bias).toBeLessThan(1.1);
  });

  it("ensures each milestone maps to an existing training step", () => {
    HERO_MILESTONES.forEach((milestone) => {
      const frame = HERO_TRAINING_FRAMES[milestone.step];
      expect(frame).toBeDefined();
      expect(frame.step).toBe(milestone.step);
      expect(milestone.label).toBeTruthy();
      expect(milestone.description).toBeTruthy();
    });
  });

  it("computes reasonable gradient norms that decrease as convergence approaches", () => {
    const initialGradNorm = HERO_TRAINING_FRAMES[0].gradientNorm;
    const midGradNorm = HERO_TRAINING_FRAMES[15].gradientNorm;
    const finalGradNorm = HERO_TRAINING_FRAMES[40].gradientNorm;

    expect(initialGradNorm).toBeGreaterThan(midGradNorm);
    expect(midGradNorm).toBeGreaterThan(finalGradNorm);
    expect(finalGradNorm).toBeLessThan(0.15);
  });

  it("verifies dataset points count and range", () => {
    expect(HERO_DATASET_POINTS.length).toBe(31);
    const xVals = HERO_DATASET_POINTS.map((p) => p.x);
    expect(Math.min(...xVals)).toBe(-1.5);
    expect(Math.max(...xVals)).toBe(1.5);
  });
});
