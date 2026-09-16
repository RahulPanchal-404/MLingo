import { describe, expect, it } from "vitest";

import { getDatasetYDomain, getPlotYCoordinate, getRunYDomain } from "@/features/labs/gradient-descent/regression-plot";
import type { DatasetPoint, TrainingState } from "@/types/training-run";

function makeState(step: number, weight: number, bias: number): TrainingState {
      return { step, weights: [weight], bias, loss: 0, gradients: [], bias_gradient: null, predictions: [], metrics: { mean_squared_error: 0 } };
}

describe("getDatasetYDomain", () => {
      it("keeps the dataset scale independent of model state values", () => {
            const points: DatasetPoint[] = [
                  { feature: -1, target: -1 },
                  { feature: 0, target: 1 },
                  { feature: 1, target: 3 },
            ];

            expect(getDatasetYDomain(points)).toEqual({ min: -1, max: 3 });
            expect(getDatasetYDomain(points)).toEqual(getDatasetYDomain(points));
      });

      it("includes historical regression-line endpoints in the run-wide domain", () => {
            const points: DatasetPoint[] = [{ feature: -1, target: -1 }, { feature: 1, target: 3 }];
            const history = [makeState(0, 0, 0), makeState(1, 4, 1)];

            expect(getRunYDomain(points, history)).toEqual({ min: -3, max: 5 });
      });

      it("keeps supplied domain and dataset point coordinates stable across states", () => {
            const points: DatasetPoint[] = [{ feature: -1, target: -1 }, { feature: 1, target: 3 }];
            const domain = getRunYDomain(points, [makeState(0, 0, 0), makeState(1, 4, 1)]);
            const pointCoordinate = getPlotYCoordinate(points[0].target, domain);

            expect(getPlotYCoordinate(points[0].target, domain)).toBe(pointCoordinate);
            expect(getRunYDomain(points, [makeState(0, 0, 0), makeState(1, 4, 1)])).toEqual(domain);
      });

      it("uses safe finite domains for empty, constant, and non-finite values", () => {
            expect(getDatasetYDomain([])).toEqual({ min: 0, max: 1 });
            expect(getDatasetYDomain([{ feature: 0, target: 2 }, { feature: 1, target: 2 }])).toEqual({ min: 2, max: 2 });
            expect(getRunYDomain([{ feature: Number.NaN, target: Number.POSITIVE_INFINITY }], [makeState(0, Number.NaN, 0)])).toEqual({ min: 0, max: 1 });
      });
});