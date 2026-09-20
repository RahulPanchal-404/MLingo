import type { TrainingState } from "@/types/training-run";

export function getLogisticCodeLines(state: TrainingState | null, learningRate: number): string[] {
      return ["logits = X @ weights + bias", "probabilities = sigmoid(logits)", "error = probabilities - y", "weight_gradient = (X.T @ error) / n", "bias_gradient = error.mean()", `weights -= ${learningRate} * weight_gradient  # recorded gradient=${format(state?.gradients[0])}`, `bias -= ${learningRate} * bias_gradient  # recorded bias=${format(state?.bias_gradient)}`];
}

export function LogisticCodeMode({ state, learningRate }: { state: TrainingState | null; learningRate: number }) {
      return <section id="code-mode-panel" aria-label="Logistic regression code mode" className="learning-mode-panel code-mode-panel"><div className="learning-mode-heading"><div><p className="eyebrow">Code mode / logistic regression</p><h2>Conceptual training update</h2></div><span>{state ? `Step ${state.step}` : "No frame"}</span></div><pre><code>{getLogisticCodeLines(state, learningRate).join("\n")}</code></pre><p className="learning-mode-note">This conceptual Python follows the recorded logistic regression update and is not executed in the browser.</p></section>;
}

function format(value: number | null | undefined): string { return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "N/A"; }