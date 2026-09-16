import { describe, expect, it } from "vitest";

import { explainDiagnostic } from "@/features/diagnostics/explanations";
import type { DiagnosticEvent } from "@/features/diagnostics/types";

const base = (type: DiagnosticEvent["type"], evidence: DiagnosticEvent["evidence"]): DiagnosticEvent => ({ id: type, step: 2, type, title: type, description: "detected", severity: "warning", evidence });

describe("explainDiagnostic", () => {
      it.each([
            ["rapid_loss_decrease", { previousLoss: 10, currentLoss: 4 }, "10"],
            ["possible_plateau", { windowLength: 5, startLoss: 1, endLoss: 1.001 }, "5"],
            ["possible_instability", { previousLoss: 2.99, currentLoss: 4.3 }, "4.3"],
            ["possible_divergence", { consecutiveIncreases: 3, previousLoss: 2, currentLoss: 8 }, "8"],
            ["near_convergence", { gradientMagnitudes: [0.01, 0.02] }, "0.01"],
      ] as Array<[DiagnosticEvent["type"], DiagnosticEvent["evidence"], string]>)("explains %s using evidence", (type, evidence, expected) => {
            expect(explainDiagnostic(base(type, evidence))).toContain(expected);
      });

      it("handles missing evidence cautiously", () => {
            expect(explainDiagnostic(base("possible_plateau", {}))).toContain("not available");
      });
});