import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TimelineMarker } from "@/features/timeline/types";

export function diagnosticEventsToTimelineMarkers(events: DiagnosticEvent[]): TimelineMarker[] {
      return events.map((diagnostic) => ({ id: diagnostic.id, step: diagnostic.step, title: diagnostic.title, description: diagnostic.description, type: "event" as const }));
}