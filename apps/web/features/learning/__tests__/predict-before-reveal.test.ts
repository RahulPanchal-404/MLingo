import { describe, expect, it } from "vitest";
import type { PredictOption } from "../components/predict-before-reveal";

describe("PredictBeforeReveal Data Model", () => {
  it("structures prediction options and detects accurate outcome", () => {
    const options: PredictOption[] = [
      { id: "slower", label: "Training will become slower" },
      { id: "faster_less_stable", label: "Training may become faster but less stable" },
      { id: "no_change", label: "Nothing will change" },
      { id: "unsure", label: "I'm not sure" },
    ];

    expect(options).toHaveLength(4);
    const targetOutcome = {
      headline: "Larger step size accelerated initial descent, but caused slight oscillations.",
      explanation: "With α = 0.35, each step covered more ground on the loss surface.",
      accurateOptionId: "faster_less_stable",
    };

    const matchingOption = options.find((o) => o.id === targetOutcome.accurateOptionId);
    expect(matchingOption?.label).toBe("Training may become faster but less stable");
  });
});
