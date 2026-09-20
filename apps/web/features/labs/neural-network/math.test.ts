import { describe, expect, it } from "vitest";
import { evaluateDecisionGrid, stableSigmoid } from "./math";

describe("neural network math helpers", () => {
  describe("stableSigmoid", () => {
    it("evaluates sigmoid accurately around 0", () => {
      expect(stableSigmoid(0)).toBeCloseTo(0.5);
    });

    it("handles extreme positive and negative inputs without NaN or overflow", () => {
      expect(stableSigmoid(100)).toBeCloseTo(1.0);
      expect(stableSigmoid(-100)).toBeCloseTo(0.0);
      expect(Number.isFinite(stableSigmoid(1000))).toBe(true);
      expect(Number.isFinite(stableSigmoid(-1000))).toBe(true);
    });
  });

  describe("evaluateDecisionGrid", () => {
    const bounds = { minX: -2, maxX: 2, minY: -2, maxY: 2 };

    it("returns empty cells if weights are missing or malformed", () => {
      const result = evaluateDecisionGrid(null, null, null, null, bounds, 10);
      expect(result.cells).toEqual([]);
    });

    it("evaluates a resolution x resolution grid with valid probabilities", () => {
      const w1 = [
        [0.5, -0.5, 0.2],
        [-0.5, 0.5, -0.2],
      ];
      const b1 = [0.1, -0.1, 0.0];
      const w2 = [[0.8], [-0.8], [0.5]];
      const b2 = 0.0;

      const result = evaluateDecisionGrid(w1, b1, w2, b2, bounds, 10);
      expect(result.cells).toHaveLength(100);
      for (const cell of result.cells) {
        expect(cell.probability).toBeGreaterThanOrEqual(0);
        expect(cell.probability).toBeLessThanOrEqual(1);
        expect(cell.x1).toBeGreaterThanOrEqual(-2);
        expect(cell.x1).toBeLessThanOrEqual(2);
        expect(cell.x2).toBeGreaterThanOrEqual(-2);
        expect(cell.x2).toBeLessThanOrEqual(2);
      }
    });
  });
});
