"use client";

import type { LearningIntelligenceExplanation } from "./types";

export type WhyExplanationPanelProps = {
  explanation: LearningIntelligenceExplanation;
  onClose?: () => void;
};

export function WhyExplanationPanel({ explanation, onClose }: WhyExplanationPanelProps) {
  const scrollToAnchor = (anchorId?: string) => {
    if (!anchorId || typeof document === "undefined") return;
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      element.classList.add("highlight-panel-pulse");
      window.setTimeout(() => {
        element.classList.remove("highlight-panel-pulse");
      }, 2000);
    }
  };

  return (
    <article
      className="why-explanation-panel"
      aria-label={`Why did this happen: ${explanation.title}`}
    >
      <div className="why-panel-header">
        <div className="why-header-left">
          <span className="why-badge">Why did this happen?</span>
          <span className="why-step-tag">Step {explanation.step + 1}</span>
        </div>
        {onClose && (
          <button
            type="button"
            className="why-close-btn"
            onClick={onClose}
            aria-label="Close explanation"
          >
            ✕
          </button>
        )}
      </div>

      <div className="why-section">
        <h4 className="why-section-title">What Happened</h4>
        <p className="why-text">{explanation.whatHappened}</p>
      </div>

      {explanation.evidence.length > 0 && (
        <div className="why-section">
          <h4 className="why-section-title">Recorded Evidence</h4>
          <dl className="why-evidence-grid">
            {explanation.evidence.map((item, idx) => (
              <div key={idx} className="why-evidence-item">
                <dt>{item.label}</dt>
                <dd>
                  <span className="why-evidence-value">{item.value}</span>
                  {item.step !== undefined && (
                    <span className="why-evidence-step">Step {item.step + 1}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className="why-section">
        <h4 className="why-section-title">Mathematical & Algorithmic Reason</h4>
        <p className="why-text">{explanation.why}</p>
      </div>

      <div className="why-section">
        <h4 className="why-section-title">Parameter & Model Behavior</h4>
        <p className="why-text">{explanation.parameterBehavior}</p>
      </div>

      <div className="why-section why-try-section">
        <h4 className="why-section-title">What To Try Next</h4>
        <p className="why-text-try">
          💡 <em>{explanation.suggestedAction}</em>
        </p>
      </div>

      {/* Deep Link Quick Actions */}
      <div className="why-actions-bar">
        <span className="why-actions-label">Explore frame internals:</span>
        <div className="why-actions-group">
          {explanation.mathAnchorId && (
            <button
              type="button"
              className="why-action-chip"
              onClick={() => scrollToAnchor(explanation.mathAnchorId)}
            >
              📐 Connected to Math
            </button>
          )}
          {explanation.codeAnchorId && (
            <button
              type="button"
              className="why-action-chip"
              onClick={() => scrollToAnchor(explanation.codeAnchorId)}
            >
              💻 See in Code
            </button>
          )}
          {explanation.modelXRayAnchorId && (
            <button
              type="button"
              className="why-action-chip"
              onClick={() => scrollToAnchor(explanation.modelXRayAnchorId)}
            >
              🔬 Inspect model state
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
