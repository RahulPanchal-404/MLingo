import { describe, expect, it } from "vitest";

import { getCodeLines } from "@/features/labs/gradient-descent/code-mode";

describe("getCodeLines", () => {
      it("matches the recorded linear regression update", () => {
            expect(getCodeLines(null, 0.1).slice(0, 4)).toEqual([
                  "prediction = X @ weights + bias",
                  "error = prediction - y",
                  "weight_gradient = (2 / n) * X.T @ error",
                  "bias_gradient = 2 * mean(error)",
            ]);
            expect(getCodeLines(null, 0.1)[4]).toContain("weights -= 0.1 * weight_gradient");
      });
});