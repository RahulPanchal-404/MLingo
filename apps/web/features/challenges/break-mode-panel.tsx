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
  const explanation =
    result.status === "success" && run
      ? generateChallengeExplanation(challenge, result, run)
      : null;

  useEffect(() => {
    if (result.status === "success") {
      const current = readLearningActivity();
      if (!current.challengesCompleted.includes(challenge.id)) {
        recordLearningActivity({
          challengesCompleted: [...current.challengesCompleted, challenge.id],
        });
      }
      recordRunConcepts([challenge.title, challenge.algorithmLabel]);
    }
  }, [challenge.id, challenge.title, challenge.algorithmLabel, result.status]);

  return (
    <section aria-label="Break Mode challenge" className="break-mode-panel">
      <div className="break-mode-heading">
        <div>
          <div className="flex items-center gap-2">
            <p className="eyebrow">Break Mode</p>
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {challenge.algorithmLabel}
            </span>
          </div>
          <h2>{challenge.title}</h2>
        </div>
        <span className={`break-mode-status ${result.status}`}>
          {getStatusLabel(result)}
        </span>
      </div>

      <p>{challenge.description}</p>

      <dl className="break-mode-objective">
        <div>
          <dt>Objective</dt>
          <dd>{challenge.objective}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{formatTarget(challenge, result)}</dd>
        </div>
      </dl>

      <div className={`break-mode-feedback ${result.status} p-3 rounded-xl border`}>
        {renderFeedback(result)}
      </div>

      {explanation && (
        <div className="break-mode-explanation-wrapper">
          <WhyExplanationPanel explanation={explanation} />
        </div>
      )}
    </section>
  );
}

function getStatusLabel(result: BreakModeResult): string {
  switch (result.status) {
    case "awaiting-run":
      return "Waiting for a run";
    case "not-detected":
      return "Target signal not detected";
    case "awaiting-marker":
      return "Signal detected — scrub & mark the frame";
    case "incorrect-marker":
      return "Not quite — inspect neighboring frames";
    case "success":
      return "Challenge complete! 🎉";
  }
}

function formatTarget(challenge: BreakModeChallenge, result: BreakModeResult): string {
  if (result.status === "success") return `Step ${result.targetStep + 1} (Found!)`;
  if (result.status === "awaiting-marker" || result.status === "incorrect-marker") {
    return "Target region active — inspect timeline frames to mark";
  }
  return "Run model to search for target behavior";
}

function renderFeedback(result: BreakModeResult) {
  switch (result.status) {
    case "awaiting-run":
      return (
        <p className="text-xs text-slate-600">
          Run training first, then scrub through the recorded timeline to find the target condition.
        </p>
      );
    case "not-detected":
      return (
        <p className="text-xs text-amber-800">
          The target condition was not detected in this run. Try adjusting hyperparameters (like learning rate) or running for more epochs.
        </p>
      );
    case "awaiting-marker":
      return (
        <p className="text-xs text-teal-800">
          The target signal occurred during this run! Scrub the timeline and click <strong>&quot;Add marker&quot;</strong> near the frame where this behavior began.
        </p>
      );
    case "incorrect-marker":
      return (
        <div className="space-y-1.5 text-xs text-amber-900">
          <p className="font-semibold">
            Not quite. At this frame the target behavior has not happened yet.
          </p>
          <p className="text-slate-600">Look closely at:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-700">
            <li><strong>Loss:</strong> Check whether it has started rising, flattening, or stabilized.</li>
            <li><strong>Gradient / parameter movement:</strong> Check how much weights, centroids, or boundaries shifted.</li>
            <li><strong>The diagnostic signal:</strong> Look for active diagnostic chips on the timeline.</li>
          </ul>
          <p className="text-slate-500 pt-1">
            (Your closest marker was {result.distance} step{result.distance === 1 ? "" : "s"} away. Try scrubbing to another frame!)
          </p>
        </div>
      );
    case "success":
      return (
        <p className="text-xs text-emerald-900 font-medium">
          Spot on! You found the target frame (Step {result.targetStep + 1}). Your marker is within {result.distance} step{result.distance === 1 ? "" : "s"} of the exact event.
        </p>
      );
  }
}
