import { describe, expect, it } from "vitest";

import { ALL_PROJECTS, SALARY_PREDICTION_PROJECT } from "../definitions";
import { baselineOptions, runProject } from "../engine";
import type { ProjectState } from "../types";

const state = {
  splitConfig: { trainRatio: 0.8, seed: 42 },
  preprocessingConfig: { numericScaling: "standard", missingImputation: "mean_mode", categoricalEncoding: "onehot" },
  classificationThreshold: 0.5,
} as unknown as ProjectState;

describe("project engine", () => {
  it("trains a real multivariate salary model (QA-01)", () => {
    const { result } = runProject(SALARY_PREDICTION_PROJECT, state);
    expect(result.regression!.testR2).toBeGreaterThan(0.9);
    expect(result.weights!.length).toBeGreaterThan(1);
    expect(result.frames![0].epoch).toBe(0);
    expect(result.frames!.at(-1)!.loss).toBeCloseTo(result.regression!.trainMse, 2);
  });

  it("is deterministic, so training, evaluation and interpretation report the same run (QA-02)", () => {
    const a = runProject(SALARY_PREDICTION_PROJECT, state).result.regression;
    const b = runProject(SALARY_PREDICTION_PROJECT, state).result.regression;
    expect(a).toEqual(b);
  });

  it("every project runs on its own dataset with its baseline settings", () => {
    for (const p of ALL_PROJECTS) {
      const { result, options } = runProject(p, state);
      expect(options).toEqual(baselineOptions(p));
      if (p.type === "clustering") expect(result.clustering!.clusterSizes.reduce((x, y) => x + y, 0)).toBeGreaterThan(0);
      else expect(result.diverged, p.id).toBe(false);
    }
  });

  it("reports real train accuracy for classification (QA-05)", () => {
    const p = ALL_PROJECTS.find((x) => x.type === "classification")!;
    const { result } = runProject(p, state);
    expect(result.trainClassification).toBeDefined();
  });
});

describe("stock project (no lookahead)", () => {
  it("splits chronologically and uses only pre-close features", async () => {
    const { STOCK_PREDICTION_PROJECT } = await import("../definitions");
    const run = runProject(STOCK_PREDICTION_PROJECT, state);
    const trainDays = run.trainRaw.map((r) => Number(r.day_seq));
    const testDays = run.testRaw.map((r) => Number(r.day_seq));
    expect(Math.max(...trainDays)).toBeLessThan(Math.min(...testDays));
    for (const col of ["high_price", "low_price", "volume_k", "ma_5day"]) expect(run.trainRaw[0]).not.toHaveProperty(col);
    expect(run.result.diverged).toBe(false);
    expect(run.result.regression!.testR2).toBeGreaterThan(0.5);
  });
});
