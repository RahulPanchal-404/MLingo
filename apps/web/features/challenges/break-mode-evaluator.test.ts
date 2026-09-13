import { describe, expect, it } from "vitest";

import { evaluateBreakMode } from "@/features/challenges/break-mode-evaluator";
import { gradientDescentInstabilityChallenge } from "@/features/challenges/types";
import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TimelineMarker } from "@/features/timeline/types";

const targetEvent: DiagnosticEvent = {
      id: "diagnostic-instability",
      step: 10,
      type: "possible_instability",
      title: "Possible instability",
      description: "Loss increased after a recent decreasing region.",
      severity: "warning",
      evidence: { consecutiveIncreases: 2 },
};

function marker(step: number, type: TimelineMarker["type"] = "user"): TimelineMarker {
      return { id: `${type}-${step}`, step, title: "Inspect this frame", type };
}

describe("evaluateBreakMode", () => {
      it("waits for a run", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, null, [])).toEqual({ status: "awaiting-run" });
      });

      it("reports when the target diagnostic is not detected", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [], [])).toEqual({ status: "not-detected" });
      });

      it("waits for a user marker when the target exists", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [])).toEqual({ status: "awaiting-marker", targetStep: 10 });
      });

      it("succeeds on the target step and within tolerance", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(10)])).toEqual({ status: "success", targetStep: 10, markerStep: 10, distance: 0 });
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(11)])).toEqual({ status: "success", targetStep: 10, markerStep: 11, distance: 1 });
      });

      it("reports a marker outside tolerance", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(12)])).toEqual({ status: "incorrect-marker", targetStep: 10, nearestMarkerStep: 12, distance: 2 });
      });

      it("considers only user markers", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(10, "event")])).toEqual({ status: "awaiting-marker", targetStep: 10 });
      });

      it("selects the closest user marker", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(0), marker(9), marker(20)])).toMatchObject({ status: "success", targetStep: 10, markerStep: 9, distance: 1 });
      });

      it("selects the first matching target event", () => {
            const laterTarget = { ...targetEvent, id: "later", step: 20 };
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [laterTarget, targetEvent], [marker(20)])).toMatchObject({ status: "success", targetStep: 20, markerStep: 20, distance: 0 });
      });

      it("is deterministic for repeated evaluation", () => {
            expect(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(11)])).toEqual(evaluateBreakMode(gradientDescentInstabilityChallenge, [targetEvent], [marker(11)]));
      });
});
