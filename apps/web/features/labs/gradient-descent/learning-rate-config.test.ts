import { describe, expect, it } from "vitest";

import { BREAK_MODE_LEARNING_RATE } from "@/features/challenges/types";
import { getLearningRateInputConfig } from "@/features/labs/gradient-descent/gradient-descent-lab";

describe("learning-rate input configuration", () => {
      it("preserves normal lab constraints", () => {
            expect(getLearningRateInputConfig(false)).toEqual({ min: "0.001", max: "1", step: "0.001" });
      });

      it("configures Break Mode for the solvable instability range", () => {
            expect(BREAK_MODE_LEARNING_RATE).toBe(1.1);
            expect(getLearningRateInputConfig(true)).toEqual({ min: "0.001", max: "1.30", step: "0.001" });
      });

      it("allows the plateau challenge default to be reproduced", () => {
            expect(getLearningRateInputConfig(true, true)).toEqual({ min: "0.0001", max: "1.30", step: "0.001" });
      });
});