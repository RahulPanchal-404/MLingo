import { describe, expect, it } from "vitest";

import * as B from "../bridge/logic";
import * as S from "../sorter/logic";
import * as G from "../galaxy/logic";

describe("bridge builder", () => {
  it("least squares beats a flat bridge", () => {
    for (const t of B.LINE_TASKS) expect(B.polyMse(B.bestLine(t.train), t.train)).toBeLessThan(B.lineMse(t.train, 0, 0));
  });
  it("degree 12 overfits: lower train error, higher test error than the best degree", () => {
    for (const t of B.DEGREE_TASKS) {
      const hi = B.polyModel(t.train, 12);
      expect(B.polyMse(hi, t.train)).toBeLessThan(B.polyMse(B.polyModel(t.train, 2), t.train));
      expect(B.ratioScore(B.polyMse(hi, t.test), B.bestTestOverDegrees(t))).toBeLessThan(400);
    }
  });
  it("ridge: tiny λ overfits, a moderate λ scores well", () => {
    for (const t of B.RIDGE_TASKS) {
      const best = B.bestTestOverLambdas(t);
      expect(Math.min(...[1e-3, 1e-2].map((l) => B.polyMse(B.polyModel(t.train, 12, l), t.test)))).toBeLessThan(2 * best);
      expect(B.polyMse(B.polyModel(t.train, 12, 10), t.test)).toBeGreaterThan(best);
    }
  });
  it("lasso: no penalty keeps junk and scores badly; the right λ cuts junk", () => {
    for (const t of B.LASSO_TASKS) {
      const best = B.bestLassoTest(t);
      const none = B.lassoModel(t, 0.001);
      expect(none.w.filter((w) => Math.abs(w) > 1e-6).length).toBeGreaterThan(6);
      expect(B.lassoScore(B.lassoTest(t, none), best)).toBeLessThan(700);
      const mid = B.lassoModel(t, 0.1);
      expect(mid.w.filter((w) => Math.abs(w) > 1e-6).length).toBeLessThan(8);
    }
  });
});

describe("creature sorter", { timeout: 30000 }, () => {
  it("K = 1 is beaten by a moderate K", () => {
    for (const t of S.KNN_TASKS) {
      const k1 = S.accuracy((c) => S.knnPredict(t.train, 1, c), t.test);
      expect(S.accScore(k1, S.bestKnnAcc(t))).toBeLessThan(850);
    }
  });
  it("raw units fail, standardized units pass", () => {
    for (const t of S.SCALE_TASKS) {
      expect(S.accuracy((c) => S.knnPredict(t.train, 7, c), t.test)).toBeLessThan(0.6);
      expect(S.accuracy((c) => S.knnPredict(t.train, 7, c, S.standardizer(t.train)), t.test)).toBeGreaterThan(0.85);
    }
  });
  it("one question per node is clearly best", () => {
    for (const t of S.TREE_TASKS) {
      const q = S.questionsFor(t.train);
      const scores = q.map((s) => S.questionScore(t.train, s, q)).sort((a, b) => b - a);
      expect(scores[0]).toBe(1000);
      expect(scores[1]).toBeLessThan(700);
    }
  });
  it("a depth-12 tree memorises training data and loses to the best depth", () => {
    for (const t of S.DEPTH_TASKS) {
      const deep = S.fullTree(t.train);
      expect(S.accuracy((c) => S.treePredict(deep, c), t.train)).toBe(1);
      expect(S.accuracy((c) => S.treePredict(deep, c), t.test)).toBeLessThan(S.bestDepthAcc(t));
    }
  });
});

describe("star mapper", () => {
  it("cutting the dendrogram at the true K scores well", () => {
    for (const f of G.DENDRO_FIELDS) {
      const m = G.agglomerate(f.stars, "average");
      const k = new Set(f.stars.map((s) => s.label)).size;
      expect(G.f1Score(G.pairF1(G.cutToK(f.stars.length, m, k), f.stars.map((s) => s.label)))).toBeGreaterThan(900);
      expect(G.f1Score(G.pairF1(G.cutToK(f.stars.length, m, k - 1), f.stars.map((s) => s.label)))).toBeLessThan(700);
    }
  });
  it("the right linkage wins each field and the wrong one loses", () => {
    for (const f of G.LINKAGE_FIELDS) {
      const score = (l: G.Linkage) => G.f1Score(G.pairF1(G.cutToK(f.stars.length, G.agglomerate(f.stars, l), f.k), f.stars.map((s) => s.label)));
      const other = f.best === "single" ? "complete" : "single";
      expect(score(f.best)).toBeGreaterThan(850);
      expect(score(other)).toBeLessThan(500);
    }
  });
  it("eps: too small is all noise, the best eps finds the galaxies", () => {
    for (const f of G.EPS_FIELDS) {
      expect(G.pairF1(G.dbscan(f.stars, 0.1, f.minPts), f.stars.map((s) => s.label))).toBeLessThan(0.1);
      expect(G.bestEpsF1(f.stars, f.minPts)).toBeGreaterThan(0.9);
    }
  });
  it("noise: a strict minPts flags dust better than a lax one", () => {
    for (const f of G.NOISE_FIELDS) expect(G.noiseQuality(f.stars, G.dbscan(f.stars, 0.8, 8)).score).toBeGreaterThan(G.noiseQuality(f.stars, G.dbscan(f.stars, 0.6, 2)).score);
  });
});
