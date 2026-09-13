import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TimelineMarker } from "@/features/timeline/types";
import { evaluateBreakMode } from "@/features/challenges/break-mode-evaluator";
import type { BreakModeChallenge, BreakModeResult } from "@/features/challenges/types";

type BreakModePanelProps = {
      challenge: BreakModeChallenge;
      diagnostics: DiagnosticEvent[] | null;
      markers: TimelineMarker[];
};

export function BreakModePanel({ challenge, diagnostics, markers }: BreakModePanelProps) {
      const result = evaluateBreakMode(challenge, diagnostics, markers);
      return <section aria-label="Break Mode challenge" className="break-mode-panel">
            <div className="break-mode-heading"><div><p className="eyebrow">Break Mode</p><h2>{challenge.title}</h2></div><span className={`break-mode-status ${result.status}`}>{getStatusLabel(result)}</span></div>
            <p>{challenge.description}</p>
            <dl className="break-mode-objective"><div><dt>Objective</dt><dd>{challenge.objective}</dd></div><div><dt>Target</dt><dd>{formatTarget(result)}</dd></div></dl>
            <p className={`break-mode-feedback ${result.status}`}>{getFeedback(result)}</p>
      </section>;
}

function getStatusLabel(result: BreakModeResult): string {
      switch (result.status) {
            case "awaiting-run": return "Waiting for a run";
            case "not-detected": return "No instability detected";
            case "awaiting-marker": return "Instability detected - mark the suspicious frame";
            case "incorrect-marker": return "Marker is too far from the target";
            case "success": return "Challenge complete";
      }
}

function formatTarget(result: BreakModeResult): string {
      if (result.status === "awaiting-marker" || result.status === "incorrect-marker" || result.status === "success") return `Step ${result.targetStep + 1}`;
      return "Possible instability";
}

function getFeedback(result: BreakModeResult): string {
      switch (result.status) {
            case "awaiting-run": return "Run training, then inspect the recorded timeline.";
            case "not-detected": return "Try a higher learning rate and look for loss increasing after it first decreases.";
            case "awaiting-marker": return "Instability was detected. Scrub the timeline and add a user marker near this suspicious region.";
            case "incorrect-marker": return `Your closest marker is ${result.distance} step${result.distance === 1 ? "" : "s"} from the detected event. Inspect the neighboring frames.`;
            case "success": return `You found the suspicious region. Your marker is within ${result.distance} step${result.distance === 1 ? "" : "s"} of the detected event.`;
      }
}
