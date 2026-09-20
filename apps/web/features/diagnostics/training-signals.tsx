"use client";

import { useMemo, useState } from "react";

import type { DiagnosticEvent } from "@/features/diagnostics/types";
import { explainDiagnostic } from "@/features/diagnostics/explanations";
import { generateLearningIntelligence } from "@/features/intelligence/intelligence-engine";
import { WhyExplanationPanel } from "@/features/intelligence/why-explanation-panel";
import { recordRunConcepts } from "@/features/progress/activity";
import type { TrainingRun, TrainingState } from "@/types/training-run";

type TrainingSignalsProps = {
  events: DiagnosticEvent[];
  onSelect: (step: number) => void;
  run?: TrainingRun | null;
  state?: TrainingState | null;
};

export function TrainingSignals({ events, onSelect, run, state }: TrainingSignalsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const explanationsMap = useMemo(() => {
    if (!run) return new Map();
    const map = new Map();
    for (const ev of events) {
      map.set(ev.id, generateLearningIntelligence(ev, run, state ?? null));
    }
    return map;
  }, [events, run, state]);

  if (events.length === 0) return null;

  return (
    <section aria-label="Training signals" className="training-signals">
      <div className="training-signals-heading">
        <div>
          <p className="eyebrow">Training signals</p>
          <h2>What the recorded run suggests</h2>
        </div>
        <span>
          {events.length} signal{events.length === 1 ? "" : "s"}
        </span>
      </div>

      <ul>
        {events.map((diagnostic) => {
          const isExpanded = expandedId === diagnostic.id;
          const intelExplanation = explanationsMap.get(diagnostic.id);

          return (
            <li key={diagnostic.id} className={`signal-${diagnostic.severity} signal-card-container`}>
              <div className="signal-header-row">
                <button
                  className="signal-jump-button"
                  aria-label={`${diagnostic.title}, jump to step ${diagnostic.step + 1}`}
                  onClick={() => onSelect(diagnostic.step)}
                  type="button"
                >
                  <span className="signal-icon" aria-hidden="true">
                    {getSignalIcon(diagnostic.severity)}
                  </span>
                  <span className="signal-text-block">
                    <strong>{diagnostic.title}</strong>
                    <small>Step {diagnostic.step + 1}</small>
                    <em>{diagnostic.description}</em>
                  </span>
                </button>

                <button
                  type="button"
                  className={`why-toggle-btn ${isExpanded ? "why-active" : ""}`}
                  onClick={() => {
                    onSelect(diagnostic.step);
                    const willOpen = expandedId !== diagnostic.id;
                    setExpandedId(willOpen ? diagnostic.id : null);
                    if (willOpen) {
                      recordRunConcepts([
                        "Training Diagnostics",
                        "Evidence-Based Reasoning",
                        "Model Inspection",
                        "Optimization Behavior",
                      ]);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-label={`Why did this happen: ${diagnostic.title}`}
                >
                  {isExpanded ? "Hide reason ▲" : "Why did this happen? ▾"}
                </button>
              </div>

              {isExpanded && (
                <div className="signal-expansion-container">
                  {intelExplanation ? (
                    <WhyExplanationPanel
                      explanation={intelExplanation}
                      onClose={() => setExpandedId(null)}
                    />
                  ) : (
                    <p className="signal-explanation">{explainDiagnostic(diagnostic)}</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function getSignalIcon(severity: DiagnosticEvent["severity"]): string {
  return severity === "success" ? "✓" : severity === "warning" ? "!" : "↘";
}