"use client";

import type { TrainingInsight } from "@/features/insights/types";

type TrainingInsightsProps = {
  insights: TrainingInsight[];
  onSelectStep?: (step: number) => void;
};

export function TrainingInsights({ insights, onSelectStep }: TrainingInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <section aria-label="Training insights" className="training-insights-panel">
      <div className="training-signals-heading">
        <div>
          <p className="eyebrow">Training insights</p>
          <h2>What this run suggests</h2>
        </div>
        <span>{insights.length} observation{insights.length === 1 ? "" : "s"}</span>
      </div>
      <ul className="insights-list">
        {insights.map((insight) => {
          const hasStep = typeof insight.step === "number";
          return (
            <li key={insight.id} className={`insight-card insight-${insight.category}`}>
              {hasStep && onSelectStep ? (
                <button
                  type="button"
                  onClick={() => onSelectStep(insight.step!)}
                  className="insight-action-button"
                  aria-label={`${insight.title}, jump to step ${insight.step! + 1}`}
                >
                  <div className="insight-content">
                    <div className="insight-header">
                      <strong className="insight-title">{insight.title}</strong>
                      <span className="insight-step-badge">Step {insight.step! + 1} ↵</span>
                    </div>
                    <p className="insight-desc">{insight.description}</p>
                  </div>
                </button>
              ) : (
                <div className="insight-content static-insight">
                  <div className="insight-header">
                    <strong className="insight-title">{insight.title}</strong>
                  </div>
                  <p className="insight-desc">{insight.description}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className="insight-disclaimer">
        Observations are deterministically derived from this recorded run&apos;s history and metrics.
      </p>
    </section>
  );
}
