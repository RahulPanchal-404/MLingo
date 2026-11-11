import { describe, expect, it } from "vitest";

import { HOLES, lrFromSlider, scoreFor, simulateShot, sliderFromLr, starsFor, golfTerm } from "../golf/golf-engine";
import {
  SCENARIOS,
  baselineRun,
  isSaved,
  pointOfNoReturn,
  rewindScore,
  runWithBranches,
} from "../rewind/rewind-engine";

describe("gradient golf engine", () => {
  it("maps the power slider to a log-scale learning rate and back", () => {
    expect(lrFromSlider(0)).toBeCloseTo(0.001);
    expect(lrFromSlider(1)).toBeCloseTo(30);
    expect(sliderFromLr(lrFromSlider(0.37))).toBeCloseTo(0.37);
  });

  it("is deterministic", () => {
    const hole = HOLES[1];
    expect(simulateShot(hole, hole.tee, 0.3, "gd")).toEqual(simulateShot(hole, hole.tee, 0.3, "gd"));
  });

  it("sinks the bowl in one shot with a well-chosen learning rate", () => {
    const bowl = HOLES[0];
    expect(simulateShot(bowl, bowl.tee, 1, "gd").outcome).toBe("sunk");
    expect(simulateShot(bowl, bowl.tee, 0.01, "gd").outcome).toBe("rest");
  });

  it("sends the ball out of bounds when the learning rate is far too high", () => {
    const bowl = HOLES[0];
    const shot = simulateShot(bowl, bowl.tee, 25, "gd");
    expect(shot.outcome).toBe("out");
    expect(shot.end).toEqual(bowl.tee);
  });

  it("every hole is solvable in a single shot by at least one allowed optimizer", () => {
    for (const hole of HOLES) {
      const solvable = hole.optimizers.some((opt) =>
        Array.from({ length: 401 }, (_, i) => lrFromSlider(i / 400)).some(
          (lr) => simulateShot(hole, hole.tee, lr, opt).outcome === "sunk",
        ),
      );
      expect(solvable, hole.id).toBe(true);
    }
  });

  it("scores strokes against par", () => {
    expect(starsFor(2, 3, true)).toBe(3);
    expect(starsFor(4, 3, true)).toBe(2);
    expect(starsFor(6, 3, true)).toBe(1);
    expect(starsFor(2, 3, false)).toBe(0);
    expect(scoreFor(1, 3, true)).toBeGreaterThan(scoreFor(3, 3, true));
    expect(golfTerm(1, 3)).toBe("Hole in one");
    expect(golfTerm(2, 3)).toBe("Birdie");
    expect(golfTerm(5, 3)).toBe("Double bogey");
  });
});

describe("rewind engine", () => {
  it("every baseline run is doomed", () => {
    for (const scenario of SCENARIOS) expect(isSaved(scenario, baselineRun(scenario)), scenario.id).toBe(false);
  });

  it("the intended fix saves each scenario when applied early", () => {
    for (const scenario of SCENARIOS) {
      const frames = runWithBranches(scenario, [{ atStep: 5, interventionId: scenario.fixId }]);
      expect(isSaved(scenario, frames), scenario.id).toBe(true);
      expect(frames).toHaveLength(scenario.steps + 1);
    }
  });

  it("keeps history before the rewind frame untouched", () => {
    const scenario = SCENARIOS[0];
    const base = baselineRun(scenario);
    const branched = runWithBranches(scenario, [{ atStep: 20, interventionId: "halve" }]);
    expect(branched.slice(0, 21)).toEqual(base.slice(0, 21));
    expect(branched[21]).not.toEqual(base[21]);
  });

  it("has a point of no return after which the fix is too late", () => {
    const scenario = SCENARIOS[0];
    const pnr = pointOfNoReturn(scenario);
    expect(pnr).not.toBeNull();
    const late = runWithBranches(scenario, [{ atStep: (pnr ?? 0) + 2, interventionId: scenario.fixId }]);
    expect(isSaved(scenario, late)).toBe(false);
  });

  it("wrong fixes do not save the outlier scenario", () => {
    const scenario = SCENARIOS.find((s) => s.id === "outlier")!;
    for (const id of ["lower", "clip", "momentum"]) {
      expect(isSaved(scenario, runWithBranches(scenario, [{ atStep: 0, interventionId: id }])), id).toBe(false);
    }
  });

  it("rewards late, efficient rewinds", () => {
    expect(rewindScore(true, 1, 45, 60)).toEqual({ stars: 3, score: 850 });
    expect(rewindScore(true, 3, 10, 60).stars).toBe(1);
    expect(rewindScore(false, 3, 10, 60)).toEqual({ stars: 0, score: 0 });
    expect(rewindScore(true, 1, 50, 60).score).toBeGreaterThan(rewindScore(true, 1, 10, 60).score);
  });
});
