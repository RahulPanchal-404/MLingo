import { describe, expect, it } from "vitest";

import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import type { DiagnosticEvent } from "@/features/diagnostics/types";

describe("diagnosticEventsToTimelineMarkers", () => {
      it("converts diagnostic events without re-running detection", () => {
            const event: DiagnosticEvent = {
                  id: "diagnostic-plateau",
                  step: 4,
                  type: "possible_plateau",
                  title: "Possible plateau",
                  description: "Loss changed very little across the recent window.",
                  severity: "warning",
                  evidence: { windowLength: 5, maxAbsoluteChange: 0.001 },
            };

            expect(diagnosticEventsToTimelineMarkers([event])).toEqual([{
                  id: event.id,
                  step: event.step,
                  title: event.title,
                  description: event.description,
                  type: "event",
            }]);
      });
});