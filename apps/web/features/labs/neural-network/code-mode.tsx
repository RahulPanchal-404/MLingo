import type { TrainingState } from "@/types/training-run";

export function getNeuralNetworkCodeLines(
  state: TrainingState | null,
  learningRate: number
): string[] {
  const isInit = !state || state.step === 0;
  const dw2Sample = state?.dw2?.[0]?.[0];
  const db2Sample = state?.db2;

  return [
    "# 1. Forward pass",
    "z1 = X @ w1 + b1",
    "a1 = 1 / (1 + np.exp(-np.clip(z1, -25, 25)))  # hidden activations",
    "z2 = a1 @ w2 + b2",
    "y_hat = 1 / (1 + np.exp(-np.clip(z2, -25, 25)))  # output probability",
    "",
    "# 2. Analytical backpropagation (chain rule)",
    "dz2 = y_hat - y",
    `dw2 = (a1.T @ dz2) / n  # ${isInit ? "initial state" : `sample ∂L/∂W₂[0]=${format(dw2Sample)}`}`,
    `db2 = float(np.mean(dz2))  # ${isInit ? "initial state" : `∂L/∂b₂=${format(db2Sample)}`}`,
    "da1 = dz2 @ w2.T",
    "dz1 = da1 * a1 * (1 - a1)  # sigmoid derivative",
    "dw1 = (X.T @ dz1) / n",
    "db1 = np.mean(dz1, axis=0)",
    "",
    "# 3. Gradient descent updates",
    `w1 -= ${learningRate} * dw1`,
    `b1 -= ${learningRate} * db1`,
    `w2 -= ${learningRate} * dw2`,
    `b2 -= ${learningRate} * db2`,
  ];
}

export function NeuralCodeMode({
  state,
  learningRate,
}: {
  state: TrainingState | null;
  learningRate: number;
}) {
  return (
    <section id="code-mode-panel" aria-label="Neural network code mode" className="learning-mode-panel code-mode-panel">
      <div className="learning-mode-heading">
        <div>
          <p className="eyebrow">Code mode / Neural Network & Backprop</p>
          <h2>Conceptual vectorized NumPy code</h2>
        </div>
        <span>{state ? `Step ${state.step}` : "No frame"}</span>
      </div>
      <pre>
        <code>{getNeuralNetworkCodeLines(state, learningRate).join("\n")}</code>
      </pre>
      <p className="learning-mode-note">
        This conceptual Python code reflects the exact vectorized algorithm executed by the MLingo FastAPI backend.
      </p>
    </section>
  );
}

function format(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : "N/A";
}
