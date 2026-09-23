import type { TrainingState } from "@/types/training-run";

export function LogisticMathMode({
  state,
  learningRate,
}: {
  state: TrainingState | null;
  learningRate: number;
}) {
  if (!state) {
    return (
      <section className="learning-mode-panel">
        <p className="eyebrow">Math mode</p>
        <p className="empty-state">Select a recorded frame to inspect its mathematics.</p>
      </section>
    );
  }

  return (
    <section id="math-mode-panel" aria-label="Logistic regression math mode" className="learning-mode-panel">
      <div className="learning-mode-heading">
        <div>
          <p className="eyebrow">Math mode / logistic regression</p>
          <h2>Selected frame mathematics</h2>
        </div>
        <span>Step {state.step}</span>
      </div>

      {/* Beginner Intuition Helpers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5">
          <span className="font-bold text-teal-900 block mb-0.5">Sigmoid Activation:</span>
          <span className="text-slate-600">Sigmoid turns a model&apos;s score into a probability between 0 and 1.</span>
        </div>
        <div className="rounded-lg border border-teal-200 bg-teal-50/50 p-2.5">
          <span className="font-bold text-teal-900 block mb-0.5">Decision Threshold:</span>
          <span className="text-slate-600">A threshold turns probability into a final class decision.</span>
        </div>
      </div>

      <div className="equation-list">
        <p>
          <code>z = w₁x₁ + w₂x₂ + b</code>
          <span>Logit</span>
        </p>
        <p>
          <code>p = σ(z) = 1 / (1 + e⁻ᶻ)</code>
          <span>Probability (Sigmoid)</span>
        </p>
        <p>
          <code>L = -Σ[y log(p) + (1-y)log(1-p)] / n</code>
          <span>Binary cross-entropy</span>
        </p>
        <p>
          <code>∂L/∂w = Xᵀ(p-y) / n</code>
          <span>Gradient</span>
        </p>
        <p>
          <code>w ← w - α∂L/∂w</code>
          <span>Update</span>
        </p>
      </div>

      <dl className="math-values">
        <div>
          <dt>Weight 1</dt>
          <dd>{format(state.weights[0])}</dd>
        </div>
        <div>
          <dt>Weight 2</dt>
          <dd>{format(state.weights[1])}</dd>
        </div>
        <div>
          <dt>Bias</dt>
          <dd>{format(state.bias)}</dd>
        </div>
        <div>
          <dt>BCE</dt>
          <dd>{format(state.loss)}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{format(state.metrics?.accuracy)}</dd>
        </div>
        <div>
          <dt>Learning rate</dt>
          <dd>{format(learningRate)}</dd>
        </div>
      </dl>
      <p className="learning-mode-note">
        Probabilities and loss in this panel come from the selected recorded state.
      </p>
    </section>
  );
}

function format(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 5 })
    : "N/A";
}