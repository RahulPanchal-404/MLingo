import { describe, expect, it } from "vitest";

import { getDecisionBoundary } from "@/features/labs/logistic-regression/classification-plot";
import type { TrainingState } from "@/types/training-run";

const state = (weights: number[], bias: number): TrainingState => ({ step: 1, weights, bias, loss: 0.2, gradients: [0.1, 0.2], bias_gradient: 0.1, predictions: [], metrics: { binary_cross_entropy: 0.2, accuracy: 1 } });

describe("getDecisionBoundary", () => {
      it("uses the selected state's two weights and bias", () => {
            expect(getDecisionBoundary([{ x1: -1, x2: -1, label: 0 }, { x1: 1, x2: 1, label: 1 }], state([2, 2], 0))).toEqual([{ x1: -1, x2: 1 }, { x1: 1, x2: -1 }]);
      });

      it("returns no boundary when the second weight is zero or values are invalid", () => {
            expect(getDecisionBoundary([{ x1: -1, x2: -1, label: 0 }], state([1, 0], 0))).toEqual([]);
            expect(getDecisionBoundary([{ x1: Number.NaN, x2: 1, label: 0 }], state([1, 1], 0))).toEqual([]);
      });
});