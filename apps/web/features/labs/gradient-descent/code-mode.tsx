import type { TrainingState } from "@/types/training-run";

type CodeModeProps = { state: TrainingState | null; learningRate: number };

export function getCodeLines(state: TrainingState | null, learningRate: number): string[] {
      const weight = state?.weights[0];
      const weightGradient = state?.gradients[0];
      return [
            "prediction = X @ weights + bias",
            "error = prediction - y",
            "weight_gradient = (2 / n) * X.T @ error",
            "bias_gradient = 2 * mean(error)",
            `weights -= ${formatNumber(learningRate)} * weight_gradient  # recorded weight=${formatNumber(weight)}, pre-update gradient=${formatNumber(weightGradient)}`,
            `bias -= ${formatNumber(learningRate)} * bias_gradient  # recorded bias=${formatNumber(state?.bias)}, pre-update gradient=${formatNumber(state?.bias_gradient)}`,
      ];
}

export function CodeMode({ state, learningRate }: CodeModeProps) {
      return <section id="code-mode-panel" aria-label="Code mode" className="learning-mode-panel code-mode-panel">
            <div className="learning-mode-heading"><div><p className="eyebrow">Code mode</p><h2>Conceptual training update</h2></div><span>{state ? `Step ${state.step}` : "No frame"}</span></div>
            <pre aria-label="Conceptual Python training update"><code>{getCodeLines(state, learningRate).join("\n")}</code></pre>
            <p className="learning-mode-note">This is an educational representation of the recorded linear regression update. It is not executed in the browser.</p>
      </section>;
}

function formatNumber(value: number | null | undefined): string {
      return typeof value === "number" && Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "N/A";
}