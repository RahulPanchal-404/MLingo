"use client";

import type { ProjectDefinition } from "../types";

export type MilestoneModelViewProps = {
  project: ProjectDefinition;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneModelView({ project, onComplete, onBack }: MilestoneModelViewProps) {
  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🧠</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Model Selection & Mathematical Formulation
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Select an algorithm whose hypothesis function and optimization objective match the task type.
              Review how parameters are mathematically defined and updated during optimization.
            </p>
          </div>
        </div>
      </div>

      {/* Selected Model Card */}
      <div className="rounded-xl border-2 border-teal-600 bg-white p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider">
              Selected Model
            </span>
            <h2 className="mt-1.5 text-2xl font-bold text-slate-900">
              {project.modelName}
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200">
            Task: {project.type}
          </span>
        </div>

        {/* Math & Mechanics Formulation */}
        {project.type === "regression" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 font-mono text-xs">
              <p className="font-bold text-slate-800 text-sm mb-1">Linear Regression Formulation:</p>
              <p className="text-teal-900 text-sm">ŷ = w₁ · x₁ + w₂ · x₂ + ... + w_d · x_d + b = wᵀ x + b</p>
              <div className="mt-2 text-slate-600 font-sans space-y-1">
                <p><strong>Loss Function:</strong> Mean Squared Error: J(w, b) = 1/n Σ (yᵢ - ŷᵢ)²</p>
                <p><strong>Gradient:</strong> ∂J/∂w = -2/n Σ (yᵢ - ŷᵢ) · xᵢ</p>
                <p><strong>Parameter Update:</strong> w ← w - α · (∂J/∂w), b ← b - α · (∂J/∂b)</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Why Linear Regression for Salary Prediction:</strong> Experience and education have a predominantly positive, monotonic relationship with compensation. Linear models provide direct interpretability: each feature weight reveals the exact marginal salary gain per unit change in input.
              </p>
            </div>
          </div>
        )}

        {project.type === "classification" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 font-mono text-xs">
              <p className="font-bold text-slate-800 text-sm mb-1">Logistic Regression Formulation:</p>
              <p className="text-teal-900 text-sm">P(y=1 | x) = σ(wᵀ x + b) = 1 / (1 + e^-(wᵀ x + b))</p>
              <div className="mt-2 text-slate-600 font-sans space-y-1">
                <p><strong>Loss Function:</strong> Binary Cross-Entropy: J = -1/n Σ [yᵢ log(pᵢ) + (1 - yᵢ) log(1 - pᵢ)]</p>
                <p><strong>Decision Boundary:</strong> Predict Class 1 if P(y=1 | x) ≥ θ (default θ = 0.50)</p>
                <p><strong>Gradient:</strong> ∂J/∂w = 1/n Σ (pᵢ - yᵢ) · xᵢ</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Why Logistic Regression for Exam Outcome:</strong> Student exam success is a binary outcome (pass or fail). Linear regression could predict impossible probabilities outside [0, 1]. Logistic regression guarantees calibrated probabilistic estimates squashed between 0 and 1.
              </p>
            </div>
          </div>
        )}

        {project.type === "clustering" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 font-mono text-xs">
              <p className="font-bold text-slate-800 text-sm mb-1">K-Means Clustering Formulation:</p>
              <p className="text-teal-900 text-sm">{"Objective (Inertia): WCSS = Σ_k Σ_{x ∈ C_k} ||x - μ_k||²"}</p>
              <div className="mt-2 text-slate-600 font-sans space-y-1">
                <p><strong>Step 1 (Assignment):</strong> {"c_i = argmin_k ||x_i - μ_k||²"}</p>
                <p><strong>Step 2 (Update):</strong> {"μ_k = 1/|C_k| Σ_{i ∈ C_k} x_i"}</p>
                <p><strong>Convergence:</strong> Repeat until centroid positions stop shifting (Δμ &lt; ε)</p>
              </div>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>Why K-Means for Retail Segmentation:</strong> When customer profiles have no predefined labels, K-Means iteratively clusters shoppers into cohesive cohorts based on Euclidean distance in normalized income and spending space.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Split
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Confirm Model: Train Model →
        </button>
      </div>
    </div>
  );
}
