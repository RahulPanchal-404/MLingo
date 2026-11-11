import { describe, expect, it } from "vitest";

import { GAMES } from "../registry";
import { starsForScore } from "../framework/types";
import { COURSES, TRAP_GOAL, bestManualJumps, initSim, ravine, simulate, stepManual, trap, valley, type Sim } from "../descent/logic";
import { CFGS, costAt, fixedRange, makeItems, runScore } from "../threshold/logic";
import { ELBOW_TASKS, TOOL_TASKS, START_TASKS, UNIT_TASKS, bestOf, dbscan, dogWage, elbowCurve, purity, purityScore, standardize, kmeansFrames, kmeansPlusPlus, startScore, totalCost, unitScore, xy } from "../clusters/logic";
import { SETUPS, makeTrainer, winScore, EPOCHS_PER_SECOND, TIME_LIMIT } from "../neurons/logic";
import { CASES, caseScore } from "../pipeline/cases";

describe("registry", () => {
  it("has 5 games x 4 levels with ascending star thresholds", () => {
    expect(GAMES).toHaveLength(8);
    for (const g of GAMES) {
      expect(g.levels).toHaveLength(4);
      for (const l of g.levels) expect(l.stars[0] < l.stars[1] && l.stars[1] < l.stars[2]).toBe(true);
    }
    expect(starsForScore(700, [500, 700, 850])).toBe(2);
  });
});

describe("valley runner", () => {
  it("fog level: always jumping downhill wins within fuel, wrong way wastes it", () => {
    for (const c of COURSES.eyeball(false)) {
      const best = bestManualJumps(c.land, c.lr!);
      expect(best).toBeLessThan(c.land.fuel);
      let sim: Sim = { ...initSim(c.land), status: "running" };
      for (let n = 0; n < 3; n++) sim = stepManual(c.land, sim, c.land.grad(sim.pos)[0] > 0 ? 1 : -1, c.lr!);
      expect(c.land.loss(sim.pos)).toBeGreaterThan(c.land.loss(c.land.start));
    }
  });
  it("jump power: tiny runs out of fuel, huge hits lava, tuned lands fast", () => {
    for (const { land } of COURSES["step-size"](false)) {
      const c = land.curv![0];
      expect(simulate(land, { lr: 0.02, momentum: false }).status).toBe("fuel");
      expect(simulate(land, { lr: 2.5 / c, momentum: false }).status).toBe("lava");
      const ok = simulate(land, { lr: 1 / c, momentum: false });
      expect(ok.status).toBe("won");
      expect(ok.jumps).toBeLessThanOrEqual(2);
    }
  });
  it("canyon: only waxed skis make a strong jump safe", () => {
    for (const k of [25, 60, 100]) {
      expect(simulate(ravine(k, false), { lr: 1, momentum: false }).status).toBe("lava");
      const crawl = simulate(ravine(k, false), { lr: 1.9 / k, momentum: false });
      if (crawl.status === "won") expect(crawl.jumps).toBeGreaterThan(25);
      expect(simulate(ravine(k, true), { lr: 1, momentum: false }).status).toBe("won");
    }
  });
  it("false valley: plain skiing never escapes, momentum can", () => {
    const lrs = [0.02, 0.05, 0.1, 0.2, 0.3, 0.5];
    for (const { land } of COURSES.trap(false)) {
      for (const lr of lrs) expect(simulate(land, { lr, momentum: false }).status).not.toBe("won");
      expect(lrs.filter((lr) => simulate(land, { lr, momentum: true }).status === "won").length).toBeGreaterThanOrEqual(2);
    }
    expect(trap(-2.6).won([TRAP_GOAL])).toBe(true);
    expect(valley(1).loss([0])).toBe(0);
  });
});

describe("threshold", () => {
  it("best fixed cut-off scores ~1000, extremes score low, and costs drive the optimum", () => {
    for (const id of Object.keys(CFGS)) {
      const cfg = CFGS[id];
      const items = makeItems(cfg);
      const r = fixedRange(items, cfg);
      expect(runScore(r.best, r.best, r.worst)).toBe(1000);
      expect(runScore(r.worst, r.best, r.worst)).toBe(0);
    }
    const s = CFGS.screening;
    const si = makeItems(s);
    expect(fixedRange(si, s).bestT).toBeLessThan(0.4);
    // flagging nothing is 95% accurate in the fraud level yet scores 0
    const f = CFGS.fraud;
    const fi = makeItems(f);
    const noFlag = costAt(fi, 0.99, f);
    const range = fixedRange(fi, f);
    expect(noFlag).toBeGreaterThan(range.best * 3);
    expect(fi.filter((i) => i.y === 1).length).toBe(3);
  });
});

describe("clusters", () => {
  it("elbow curves have a visible elbow at the true K", () => {
    for (const t of ELBOW_TASKS) {
      const c = elbowCurve(t.points).map((f) => f.inertia);
      const drop = (k: number) => c[k - 2] - c[k - 1];
      expect(drop(t.trueK)).toBeGreaterThan(3 * drop(t.trueK + 1));
      const wage = dogWage(c, t.trueK);
      const costs = c.map((_, k) => totalCost(c, k + 1, wage));
      expect(costs.indexOf(Math.min(...costs)) + 1).toBe(t.trueK);
    }
  });
  it("bad starts can lose to good starts", () => {
    for (const t of START_TASKS) {
      const pts = xy(t.points);
      const good = kmeansFrames(pts, kmeansPlusPlus(pts, 4, 7)).at(-1)!;
      expect(startScore(t.best, t.best, 1)).toBe(1000);
      expect(good.inertia).toBeGreaterThan(0);
    }
    // two centroids in the same blob → trapped
    const t = START_TASKS[0];
    const pts = xy(t.points);
    const bad = kmeansFrames(pts, [pts[0], pts[1], pts[2], pts[3]]).at(-1)!;
    expect(startScore(bad.inertia, t.best, 1)).toBeLessThan(500);
  });
  it("units: raw fails, standardized passes", () => {
    for (const pts of UNIT_TASKS) {
      const raw = xy(pts);
      const labels = pts.map((p) => p.label);
      const rawRes = bestOf(raw, 3, 6);
      const { z } = standardize(raw);
      const zRes = bestOf(z, 3, 6);
      expect(unitScore(purity(rawRes.assign, labels), 1)).toBeLessThan(400);
      expect(unitScore(purity(zRes.assign, labels), 1)).toBeGreaterThan(900);
    }
  });
  it("tools: K-Means fails rings and moons, DBSCAN solves them, both fine on blobs", () => {
    const score = (i: number, tool: "kmeans" | "density") => {
      const t = TOOL_TASKS[i];
      const pts = xy(t.points);
      const assign = tool === "kmeans" ? bestOf(pts, i === 0 ? 3 : 2, 6).assign : dbscan(pts, t.eps, t.minPts);
      return purityScore(purity(assign, t.points.map((p) => p.label)));
    };
    expect(score(0, "kmeans")).toBeGreaterThan(900);
    expect(score(0, "density")).toBeGreaterThan(900);
    expect(score(1, "kmeans")).toBeLessThan(300);
    expect(score(1, "density")).toBeGreaterThan(900);
    expect(score(2, "kmeans")).toBeLessThan(700);
    expect(score(2, "density")).toBeGreaterThan(900);
  });
});

describe("neurons", () => {
  function race(levelId: string, patch: object) {
    const s = SETUPS[levelId];
    const tr = makeTrainer(s.data, { ...s.start, ...patch });
    for (let t = 0; t < TIME_LIMIT * EPOCHS_PER_SECOND; t += 1) {
      tr.step(1);
      if (tr.epoch() > 20 && tr.accuracy() >= s.target) return { won: true, seconds: t / EPOCHS_PER_SECOND, tr };
    }
    return { won: false, seconds: TIME_LIMIT, tr };
  }
  it("xor: linear fails, non-linear wins", () => {
    expect(race("xor", {}).won).toBe(false);
    expect(race("xor", { activation: "tanh" }).won).toBe(true);
  });
  it("capacity: 1 neuron fails, 3+ wins", () => {
    expect(race("capacity", { hidden: 1 }).won).toBe(false);
    expect(race("capacity", { hidden: 4 }).won).toBe(true);
  });
  it("saturate: raw fails, standardized wins", () => {
    expect(race("saturate", {}).won).toBe(false);
    expect(race("saturate", { standardize: true, lr: 1 }).won).toBe(true);
  });
  it("lr: starting rate fails, a moderate rate wins", () => {
    expect(race("lr", {}).won).toBe(false);
    expect(race("lr", { lr: 1.5 }).won).toBe(true);
    expect(race("lr", { lr: 0.001 }).won).toBe(false);
    expect(race("lr", { lr: 20 }).tr.dead()).toBeGreaterThan(4);
  });
  it("score falls with time and changes", () => {
    expect(winScore(3, 1)).toBeGreaterThan(winScore(10, 1));
    expect(winScore(3, 1)).toBeGreaterThan(winScore(3, 4));
  });
});

describe("data heist", () => {
  it("every level has 3 solvable cases with clues", () => {
    for (const id of ["leak", "overfit", "order", "metric"]) {
      expect(CASES[id]).toHaveLength(3);
      for (const c of CASES[id]) {
        if (c.kind === "suspects") {
          expect(c.suspects.some((x) => x.guilty)).toBe(true);
          expect(c.suspects.some((x) => !x.guilty)).toBe(true);
          for (const x of c.suspects) expect(x.clue.length).toBeGreaterThan(5);
        } else expect(c.steps.length).toBeGreaterThanOrEqual(4);
      }
    }
    expect(caseScore(0, 0, true)).toBe(1000);
    expect(caseScore(2, 1, true)).toBeLessThan(1000);
    expect(caseScore(0, 0, false)).toBe(0);
  });
});

describe("concepts", () => {
  it("every level maps to a concept with a destination and both explanations", () => {
    for (const g of GAMES)
      for (const l of g.levels) {
        expect(l.concept, `${g.id}:${l.id}`).toBeTruthy();
        expect(l.concept.href.startsWith("/")).toBe(true);
        expect(l.concept.played.length).toBeGreaterThan(40);
        expect(l.concept.matters.length).toBeGreaterThan(40);
      }
  });
});

describe("guides", () => {
  it("every game explains its story, goal, steps, win/lose and ML mapping", () => {
    for (const g of GAMES) {
      expect(g.guide.goal.length).toBeGreaterThan(40);
      expect(g.guide.steps.length).toBeGreaterThanOrEqual(3);
      expect(g.guide.map.length).toBeGreaterThanOrEqual(4);
      expect(g.guide.win && g.guide.lose).toBeTruthy();
    }
  });
});
