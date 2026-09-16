"use client";

import { useState } from "react";

import type { DiagnosticEvent } from "@/features/diagnostics/types";
import { explainDiagnostic } from "@/features/diagnostics/explanations";

type TrainingSignalsProps = {
      events: DiagnosticEvent[];
      onSelect: (step: number) => void;
};

export function TrainingSignals({ events, onSelect }: TrainingSignalsProps) {
      const [expandedId, setExpandedId] = useState<string | null>(null);
      if (events.length === 0) return null;
      return <section aria-label="Training signals" className="training-signals">
            <div className="training-signals-heading"><div><p className="eyebrow">Training signals</p><h2>What the recorded run suggests</h2></div><span>{events.length} signal{events.length === 1 ? "" : "s"}</span></div>
            <ul>
                  {events.map((diagnostic) => <li key={diagnostic.id} className={`signal-${diagnostic.severity}`}>
                        <button aria-expanded={expandedId === diagnostic.id} aria-label={`${diagnostic.title}, step ${diagnostic.step + 1}`} onClick={() => { onSelect(diagnostic.step); setExpandedId((current) => current === diagnostic.id ? null : diagnostic.id); }} type="button">
                              <span className="signal-icon" aria-hidden="true">{getSignalIcon(diagnostic.severity)}</span>
                              <span><strong>{diagnostic.title}</strong><small>Step {diagnostic.step + 1}</small><em>{diagnostic.description}</em></span>
                        </button>
                        {expandedId === diagnostic.id && <p className="signal-explanation">{explainDiagnostic(diagnostic)}</p>}
                  </li>)}
            </ul>
      </section>;
}

function getSignalIcon(severity: DiagnosticEvent["severity"]): string {
      return severity === "success" ? "✓" : severity === "warning" ? "!" : "↘";
}