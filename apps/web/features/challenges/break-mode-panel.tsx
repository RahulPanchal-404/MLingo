"use client";

import { useEffect } from "react";

import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TimelineMarker } from "@/features/timeline/types";
import { evaluateBreakMode } from "@/features/challenges/break-mode-evaluator";
import type { BreakModeChallenge, BreakModeResult } from "@/features/challenges/types";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";

import { generateChallengeExplanation } from "@/features/intelligence/intelligence-engine";
import { WhyExplanationPanel } from "@/features/intelligence/why-explanation-panel";
import type { TrainingRun } from "@/types/training-run";

type BreakModePanelProps = {
      challenge: BreakModeChallenge;
      diagnostics: DiagnosticEvent[] | null;
      markers: TimelineMarker[];
      run?: TrainingRun | null;
};

export function BreakModePanel({ challenge, diagnostics, markers, run }: BreakModePanelProps) {
      const result = evaluateBreakMode(challenge, diagnostics, markers);
      const explanation = result.status === "success" && run ? generateChallengeExplanation(challenge, result, run) : null;

      useEffect(() => {
            if (result.status === "success") {
                  const current = readLearningActivity();
                  recordLearningActivity({ challengesCompleted: [...current.challengesCompleted, challenge.id] });
                  recordRunConcepts([challenge.targetDiagnosticType === "possible_plateau" ? "Learning slowdown" : challenge.targetDiagnosticType === "possible_divergence" ? "Divergence" : "Instability"]);
            }
      }, [challenge.id, challenge.targetDiagnosticType, result.status]);

      return <section aria-label="Break Mode challenge" className="break-mode-panel">
            <div className="break-mode-heading"><div><p className="eyebrow">Break Mode</p><h2>{challenge.title}</h2></div><span className={`break-mode-status ${result.status}`}>{getStatusLabel(result)}</span></div>
            <p>{challenge.description}</p>
            <dl className="break-mode-objective"><div><dt>Objective</dt><dd>{challenge.objective}</dd></div><div><dt>Target</dt><dd>{formatTarget(challenge, result)}</dd></div></dl>
            <p className={`break-mode-feedback ${result.status}`}>{getFeedback(result)}</p>
            {explanation && (
              <div className="break-mode-explanation-wrapper">
                <WhyExplanationPanel explanation={explanation} />
              </div>
            )}
      </section>;
}

function getStatusLabel(result: BreakModeResult): string {
      switch (result.status) {
            case "awaiting-run": return "Waiting for a run";
            case "not-detected": return "Target signal not detected";
            case "awaiting-marker": return "Target signal detected - mark the suspicious frame";
            case "incorrect-marker": return "Marker is too far from the target";
            case "success": return "Challenge complete";
      }
}

function formatTarget(challenge: BreakModeChallenge, result: BreakModeResult): string {
      if (result.status === "success") return `Step ${result.targetStep + 1}`;
      if (result.status === "awaiting-marker" || result.status === "incorrect-marker") return "Detected signal; inspect the neighboring frames";
      return challenge.targetDiagnosticType === "possible_plateau" ? "Possible plateau" : challenge.targetDiagnosticType === "possible_divergence" ? "Possible divergence" : "Possible instability";
}

function getFeedback(result: BreakModeResult): string {
      switch (result.status) {
            case "awaiting-run": return "Run training, then inspect the recorded timeline.";
            case "not-detected": return "Inspect the recorded loss and try another training configuration.";
            case "awaiting-marker": return "The target signal was detected. Scrub the timeline and add a user marker near the suspicious region.";
            case "incorrect-marker": return `Your closest marker is ${result.distance} step${result.distance === 1 ? "" : "s"} from the detected event. Inspect the neighboring frames.`;
            case "success": return `You found the suspicious region. Your marker is within ${result.distance} step${result.distance === 1 ? "" : "s"} of the detected event.`;
      }
}
