import type { TrainingState } from "@/types/training-run";

export function NeuralMathMode({
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
        <p className="empty-state">Select a recorded frame to inspect backpropagation mathematics.</p>
      </section>
    );
  }

  const hiddenCount = state.b1?.length ?? state.w1?.[0]?.length ?? 3;
  const w1Norm = state.w1
    ? Math.sqrt(state.w1.flatMap((r) => r.map((v) => v * v)).reduce((a, b) => a + b, 0))
    : null;
  const w2Norm = state.w2
    ? Math.sqrt(state.w2.flatMap((r) => r.map((v) => v * v)).reduce((a, b) => a + b, 0))
    : null;

  let gradNorm: number | null = null;
  if (state.dw1 && state.db1 && state.dw2 && state.db2 != null) {
    let sumSq = 0;
    for (const r of state.dw1) for (const v of r) sumSq += v * v;
    for (const v of state.db1) sumSq += v * v;
    for (const r of state.dw2) for (const v of r) sumSq += v * v;
    sumSq += state.db2 * state.db2;
    gradNorm = Math.sqrt(sumSq);
  }

  return (
    <section id="math-mode-panel" aria-label="Neural network math mode" className="learning-mode-panel">
      <div className="learning-mode-heading">
        <div>
          <p className="eyebrow">Math mode / Neural Network & Backprop</p>
          <h2>Layerwise equations & chain rule</h2>
        </div>
        <span>Step {state.step}</span>
      </div>

      <div className="equation-list">
        <p>
          <code>Z₁ = X W₁ + b₁ &rarr; A₁ = &sigma;(Z₁)</code>
          <span>Hidden layer forward (2 &rarr; {hiddenCount})</span>
        </p>
        <p>
          <code>z₂ = A₁ W₂ + b₂ &rarr; y&#770; = &sigma;(z₂)</code>
          <span>Output probability forward</span>
        </p>
        <p>
          <code>L = -&Sigma;[y ln(y&#770;) + (1-y)ln(1-y&#770;)] / n</code>
          <span>Binary Cross-Entropy Loss</span>
        </p>
        <p>
          <code>dZ₂ = y&#770; - y,  dW₂ = A₁ᵀ dZ₂ / n,  db₂ = mean(dZ₂)</code>
          <span>Output layer analytical gradients</span>
        </p>
        <p>
          <code>dA₁ = dZ₂ W₂ᵀ,  dZ₁ = dA₁ &odot; A₁ &odot; (1 - A₁)</code>
          <span>Hidden layer backpropagation (chain rule)</span>
        </p>
        <p>
          <code>dW₁ = Xᵀ dZ₁ / n,  db₁ = mean(dZ₁, axis=0)</code>
          <span>Input weight gradients</span>
        </p>
        <p>
          <code>W &larr; W - &alpha; &part;L/&part;W,  b &larr; b - &alpha; &part;L/&part;b</code>
          <span>Gradient descent update rule</span>
        </p>
      </div>

      <dl className="math-values">
        <div>
          <dt>Loss (BCE)</dt>
          <dd>{format(state.metrics?.binary_cross_entropy ?? state.loss)}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{formatPercentage(state.metrics?.accuracy)}</dd>
        </div>
        <div>
          <dt>Learning rate (&alpha;)</dt>
          <dd>{format(learningRate)}</dd>
        </div>
        <div>
          <dt>||&nabla;Loss||₂</dt>
          <dd>{state.step === 0 ? "Initial (None)" : format(gradNorm)}</dd>
        </div>
        <div>
          <dt>||W₁||_F (L1 weights)</dt>
          <dd>{format(w1Norm)}</dd>
        </div>
        <div>
          <dt>||W₂||_F (L2 weights)</dt>
          <dd>{format(w2Norm)}</dd>
        </div>
        <div>
          <dt>Bias b₂</dt>
          <dd>{format(state.b2)}</dd>
        </div>
        <div>
          <dt>Hidden units</dt>
          <dd>{hiddenCount}</dd>
        </div>
      </dl>
      <p className="learning-mode-note">
        Exact analytical derivatives calculated via the chain rule at this frame. No numerical finite-difference approximations.
      </p>
    </section>
  );
}

function format(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString(undefined, { maximumFractionDigits: 5 })
    : "N/A";
}

function formatPercentage(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value)
    ? `${(value * 100).toFixed(1)}%`
    : "N/A";
}
