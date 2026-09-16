import type { TrainingState } from "@/types/training-run";

type MathModeProps = { state: TrainingState | null; learningRate: number };

export function MathMode({ state, learningRate }: MathModeProps) {
      if (!state) return <section className="learning-mode-panel"><p className="eyebrow">Math mode</p><p className="empty-state">Select a recorded frame to inspect its mathematics.</p></section>;
      const weightGradient = state.gradients[0];
      const direction = typeof weightGradient === "number" && Number.isFinite(weightGradient) ? weightGradient < 0 ? "increases" : weightGradient > 0 ? "decreases" : "does not change" : "is not recorded at this initial frame";
      return <section aria-label="Math mode" className="learning-mode-panel">
            <div className="learning-mode-heading"><div><p className="eyebrow">Math mode</p><h2>Selected frame mathematics</h2></div><span>Step {state.step}</span></div>
            <div className="equation-list"><p><code>ŷ = wx + b</code><span>Prediction</span></p><p><code>L = (1/n) Σ(yᵢ - ŷᵢ)²</code><span>Mean squared error</span></p><p><code>w ← w - α ∂L/∂w</code><span>Weight update</span></p><p><code>b ← b - α ∂L/∂b</code><span>Bias update</span></p></div>
            <dl className="math-values"><div><dt>Weight</dt><dd>{formatNumber(state.weights[0])}</dd></div><div><dt>Bias</dt><dd>{formatNumber(state.bias)}</dd></div><div><dt>Loss</dt><dd>{formatNumber(state.loss)}</dd></div><div><dt>Weight gradient</dt><dd>{formatNumber(weightGradient)}</dd></div><div><dt>Bias gradient</dt><dd>{formatNumber(state.bias_gradient)}</dd></div><div><dt>Learning rate</dt><dd>{formatNumber(learningRate)}</dd></div></dl>
            <p className="learning-mode-note">{state.step === 0 ? "No parameter update precedes the initial recorded frame." : `The recorded gradient used to reach this frame was ${formatNumber(weightGradient)}, so that update ${direction} the weight.`}</p>
      </section>;
}

function formatNumber(value: number | null | undefined): string {
      return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "N/A";
}