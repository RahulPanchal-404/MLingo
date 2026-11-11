import { describe, expect, it } from "vitest";

import { logValue } from "../framework/math";
import { starsForAttempts } from "../framework/types";
import { GAMES, getGame, levelsForLesson } from "../registry";
import { confusion, DATASETS } from "../threshold/engine";

const grid = (min: number, max: number, n = 40) => Array.from({ length: n }, (_, i) => logValue((i / (n - 1)) * 1000, min, max));
const pass = (game: string, level: string, params: Record<string, number | string | boolean>) => getGame(game)!.evaluate(level, params).pass;

/** A known passing answer for every level. */
const SOLUTIONS: Record<string, Record<string, Record<string, number | string | boolean>>> = {
  descent: { eyeball: { w: 1.8, b: 1.45 }, "step-size": { alpha: 0.08 }, ravine: { alpha: 0.3, standardize: true }, trap: { optimizer: "momentum", alpha: 0.1 } },
  threshold: { sigmoid: { center: 6.2, steep: 1.3 }, balanced: { t: 0.45 }, screening: { t: 0.26 }, fraud: { t: 0.7 } },
  clusters: { elbow: { k: 4 }, start: { init: "kmeanspp", restarts: false }, units: { standardize: true }, rings: { k: 2, verdict: "wrong-tool" } },
  neurons: { xor: { activation: "tanh" }, capacity: { hidden: 3 }, saturate: { lr: 1, standardize: true }, lr: { lr: 1.5 } },
  pipeline: { leak: { feature: "calls" }, overfit: { degree: 4 }, order: { pipeline: "split-fit-train" }, metric: { metric: "recall" } },
};

describe("game registry", () => {
  it("has one game per chapter with four levels each, matching the API's GAME_LEVELS", () => {
    expect(GAMES.map((g) => [g.id, g.chapter, g.levels.map((l) => l.id)])).toEqual([
      ["descent", 1, ["eyeball", "step-size", "ravine", "trap"]],
      ["threshold", 2, ["sigmoid", "balanced", "screening", "fraud"]],
      ["clusters", 3, ["elbow", "start", "units", "rings"]],
      ["neurons", 4, ["xor", "capacity", "saturate", "lr"]],
      ["pipeline", 5, ["leak", "overfit", "order", "metric"]],
    ]);
  });

  it("links Chapter 1 lessons to levels", () => {
    expect(levelsForLesson("learning-rate").map((x) => x.level.id)).toEqual(["step-size"]);
    expect(levelsForLesson("loss-functions").map((x) => x.level.id)).toEqual(["eyeball"]);
  });

  it("awards stars by number of runs", () => {
    expect([1, 2, 3, 4, 9].map(starsForAttempts)).toEqual([3, 2, 2, 1, 1]);
  });
});

describe.each(GAMES.flatMap((g) => g.levels.map((l) => [g.id, l.id] as const)))("%s / %s", (gameId, levelId) => {
  const level = getGame(gameId)!.levels.find((l) => l.id === levelId)!;

  it("does not pass with the starting settings, so the player has to think", () => {
    expect(pass(gameId, levelId, level.initial)).toBe(false);
  });

  it("passes with a correct answer", () => {
    expect(pass(gameId, levelId, SOLUTIONS[gameId][levelId])).toBe(true);
  });

  it("is deterministic", () => {
    const g = getGame(gameId)!;
    expect(g.evaluate(levelId, level.initial)).toEqual(g.evaluate(levelId, level.initial));
  });
});

describe("each level teaches its lesson", () => {
  it("Descent ravine: no learning rate works without scaling", () => {
    expect(grid(1e-5, 1).some((alpha) => pass("descent", "ravine", { alpha, standardize: false }))).toBe(false);
  });

  it("Descent trap: plain gradient descent never escapes, momentum does", () => {
    expect(grid(0.01, 0.5).some((alpha) => pass("descent", "trap", { alpha, optimizer: "gd" }))).toBe(false);
    expect(grid(0.01, 0.5).filter((alpha) => pass("descent", "trap", { alpha, optimizer: "momentum" })).length).toBeGreaterThan(20);
  });

  it("Descent step size: both too small and too large fail", () => {
    expect(pass("descent", "step-size", { alpha: 0.005 })).toBe(false);
    expect(pass("descent", "step-size", { alpha: 0.3 })).toBe(false);
  });

  it("Threshold screening: the cheapest threshold has lower accuracy than 0.5", () => {
    expect(confusion(DATASETS.screening, 0.26).accuracy).toBeLessThan(confusion(DATASETS.screening, 0.5).accuracy);
  });

  it("Threshold fraud: flagging almost nothing still shows ~97% accuracy", () => {
    expect(confusion(DATASETS.fraud, 0.97).accuracy).toBeGreaterThan(0.96);
  });

  it("Cluster Wars rings: only the 'wrong tool' verdict passes, for any K", () => {
    for (const k of [2, 3, 4, 5, 6])
      for (const verdict of ["longer", "more-k", "scale"]) expect(pass("clusters", "rings", { k, verdict })).toBe(false);
  });

  it("Neuron Surgeon: linear activation can't learn XOR; one or two neurons can't enclose a circle", () => {
    expect(pass("neurons", "xor", { activation: "linear" })).toBe(false);
    for (const activation of ["sigmoid", "tanh", "relu"]) expect(pass("neurons", "xor", { activation })).toBe(true);
    expect(pass("neurons", "capacity", { hidden: 2 })).toBe(false);
  });

  it("Neuron Surgeon saturation: no learning rate fixes unscaled inputs", () => {
    expect(grid(0.001, 10, 12).some((lr) => pass("neurons", "saturate", { lr, standardize: false }))).toBe(false);
  });

  it("Neuron Surgeon learning rate: too small and too large both fail", () => {
    expect(pass("neurons", "lr", { lr: 0.003 })).toBe(false);
    expect(pass("neurons", "lr", { lr: 30 })).toBe(false);
  });

  it("Pipeline overfit: the most flexible model has the lowest training error but fails the test set", () => {
    expect(pass("pipeline", "overfit", { degree: 12 })).toBe(false);
    expect(pass("pipeline", "overfit", { degree: 1 })).toBe(false);
  });
});
