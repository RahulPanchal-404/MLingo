import type { TrainingRun } from "@/types/training-run";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import type { TimelineMarker } from "@/features/timeline/types";

export function detectTrainingEventMarkers(run: TrainingRun | null): TimelineMarker[] {
      return run ? analyzeTrainingRun(run).map((diagnostic) => ({ id: diagnostic.id, step: diagnostic.step, title: diagnostic.title, description: diagnostic.description, type: "event" as const })) : [];
}