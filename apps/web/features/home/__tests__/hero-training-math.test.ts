import { describe, expect, it } from "vitest";
import {
  HERO_DATASET_POINTS,
  HERO_MILESTONES,
  HERO_TRAINING_FRAMES,
} from "../hero-training-math";

describe("Hero Training Math Telemetry", () => {
  it("precomputes 41 steps from 0 to 40", () => {
    expect(HERO_TRAINING_FRAMES).toHaveLength(41);
    expect(HERO_TRAINING_FRAMES[0].step).toBe(0);
    expect(HERO_TRAINING_FRAMES[40].step).toBe(40);
  });

  it("shows authentic loss descent and parameter convergence", () => {
    const initial = HERO_TRAINING_FRAMES[0];
    const final = HERO_TRAINING_FRAMES[40];

    // Initial state at w=0, b=0
    expect(initial.weight).toBe(0);
    expect(initial.bias).toBe(0);
    expect(initial.loss).toBeGreaterThan(1.5);

    // Final state converged near w=2, b=1, low loss
    expect(final.loss).toBeLessThan(0.1);
    expect(final.weight).toBeGreaterThan(1.8);
    expect(final.bias).toBeGreaterThan(0.85);

    // Gradient norm decreases over time
    expect(final.gradientNorm).toBeLessThan(initial.gradientNorm);
  });

  it("verifies dataset points are valid and populated", () => {
    expect(HERO_DATASET_POINTS.length).toBeGreaterThanOrEqual(30);
    HERO_DATASET_POINTS.forEach((pt) => {
      expect(Number.isFinite(pt.x)).toBe(true);
      expect(Number.isFinite(pt.y)).toBe(true);
    });
  });

  it("includes valid milestones", () => {
    expect(HERO_MILESTONES.length).toBe(4);
    HERO_MILESTONES.forEach((m) => {
      expect(m.step).toBeGreaterThanOrEqual(0);
      expect(m.step).toBeLessThanOrEqual(40);
      expect(m.label.length).toBeGreaterThan(0);
    });
  });
});
