import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TimelineMarker } from "@/features/timeline/types";
import type { BreakModeChallenge, BreakModeResult } from "@/features/challenges/types";

export function evaluateBreakMode(challenge: BreakModeChallenge, diagnostics: DiagnosticEvent[] | null, markers: TimelineMarker[]): BreakModeResult {
      if (diagnostics === null) return { status: "awaiting-run" };

      const targetEvent = diagnostics.find((event) => event.type === challenge.targetDiagnosticType);
      if (!targetEvent) return { status: "not-detected" };

      const userMarkers = markers.filter((marker) => marker.type === "user");
      if (!challenge.successCriteria.requiresUserMarker || userMarkers.length === 0) return { status: "awaiting-marker", targetStep: targetEvent.step };

      const nearestMarker = userMarkers.reduce((nearest, marker) => {
            const distance = Math.abs(marker.step - targetEvent.step);
            return distance < nearest.distance ? { marker, distance } : nearest;
      }, { marker: userMarkers[0], distance: Math.abs(userMarkers[0].step - targetEvent.step) });

      if (nearestMarker.distance <= challenge.acceptableStepTolerance) {
            return { status: "success", targetStep: targetEvent.step, markerStep: nearestMarker.marker.step, distance: nearestMarker.distance };
      }
      return { status: "incorrect-marker", targetStep: targetEvent.step, nearestMarkerStep: nearestMarker.marker.step, distance: nearestMarker.distance };
}
