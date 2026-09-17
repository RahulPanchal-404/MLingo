"use client";

import type { ComparisonInsight } from "@/features/insights/types";

type ComparisonInsightsProps = {
  insights: ComparisonInsight[];
};

export function ComparisonInsights({ insights }: ComparisonInsightsProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <section aria-label="Comparison insights" className="comparison-insights-panel">
      <div className="training-signals-heading">
        <div>
          <p className="eyebrow">Comparison insights</p>
          <h2>Factual run observations</h2>
        </div>
        <span>{insights.length} observation{insights.length === 1 ? "" : "s"}</span>
      </div>
      <ul className="insights-list">
        {insights.map((insight) => (
          <li key={insight.id} className="insight-card comparison-card">
            <div className="insight-content static-insight">
              <div className="insight-header">
                <strong className="insight-title">{insight.title}</strong>
              </div>
              <p className="insight-desc">{insight.description}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="insight-disclaimer">
        Observations are neutral factual comparisons based directly on recorded metrics and trajectories.
      </p>
    </section>
  );
}
