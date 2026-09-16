import { describe, expect, it } from "vitest";

import { getLogisticCodeLines } from "@/features/labs/logistic-regression/code-mode";

describe("logistic code mode", () => {
      it("matches the logistic regression update", () => {
            expect(getLogisticCodeLines(null, 0.2).slice(0, 5)).toEqual(["logits = X @ weights + bias", "probabilities = sigmoid(logits)", "error = probabilities - y", "weight_gradient = (X.T @ error) / n", "bias_gradient = error.mean()"]);
            expect(getLogisticCodeLines(null, 0.2)[5]).toContain("weights -= 0.2 * weight_gradient");
      });
});