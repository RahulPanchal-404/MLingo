"use client";

import Link from "next/link";
import type { TrainingRun, TrainingState } from "@/types/training-run";
import {
  computeKMeansXRay,
  computeLinearXRay,
  computeLogisticXRay,
  computeNeuralNetworkXRay,
  formatDelta,
  formatNumber,
  formatPercentage,
} from "./x-ray-helpers";

export type ModelXRayProps = {
  run: TrainingRun;
  state: TrainingState | null;
  currentStep: number;
};

export function ModelXRay({ run, state, currentStep }: ModelXRayProps) {
  if (!state) {
    return (
      <section className="model-x-ray state-panel" aria-label="Model X-Ray">
        <div className="state-heading">
          <p className="eyebrow">Model X-Ray</p>
          <h2>No frame selected</h2>
          <p>Scrub the timeline or run training to inspect the model internals.</p>
        </div>
        <p className="empty-state">No recorded frame is currently selected.</p>
      </section>
    );
  }

  const prevState = currentStep > 0 ? run.history[currentStep - 1] ?? null : null;
  const isKMeans = run.algorithm === "kmeans" || run.algorithm.startsWith("kmeans");
  const isLogistic = run.algorithm.startsWith("logistic");
  const isNeuralNetwork = run.algorithm === "neural_network" || run.algorithm.startsWith("neural");

  let content: React.ReactNode;
  if (isKMeans) {
    const data = computeKMeansXRay(state, prevState, run.training.clusters);
    content = <KMeansXRayView data={data} />;
  } else if (isLogistic) {
    const data = computeLogisticXRay(state, prevState);
    content = <LogisticXRayView data={data} />;
  } else if (isNeuralNetwork) {
    const data = computeNeuralNetworkXRay(state, prevState);
    content = <NeuralNetworkXRayView data={data} />;
  } else {
    const data = computeLinearXRay(state, prevState);
    content = <LinearXRayView data={data} />;
  }

  return (
    <div id="model-x-ray-panel" className="model-x-ray-anchor space-y-2">
      <div className="flex justify-end">
        <Link
          href="/workbench"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <span>View evaluation in Data Workbench →</span>
        </Link>
      </div>
      {content}
    </div>
  );
}

/* ==========================================================================
   LINEAR REGRESSION X-RAY
   ========================================================================== */
function LinearXRayView({ data }: { data: ReturnType<typeof computeLinearXRay> }) {
  const { isInitialState, weights, bias, weightGradient, biasGradient, loss, predictions, frameChanges } = data;

  return (
    <section className="model-x-ray state-panel" aria-label="Linear Regression Model X-Ray">
      <div className="state-heading">
        <p className="eyebrow">Model X-Ray / Linear Regression</p>
        <h2>{isInitialState ? "Step 0 — Initial State" : `Step ${data.step}`}</h2>
        <p>
          {isInitialState
            ? "Initial state — before the first update."
            : "Inspecting actual parameters, gradients, and frame updates for this snapshot."}
        </p>
      </div>

      <div className="xray-content-grid">
        {/* Model Parameters */}
        <div className="xray-group">
          <h3 className="xray-group-title">Model Parameters</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Weight (w)" value={weights[0]} />
            <MetricItem label="Bias (b)" value={bias} />
          </dl>
        </div>

        {/* Gradients */}
        <div className="xray-group">
          <h3 className="xray-group-title">Gradients</h3>
          <dl className="xray-metrics-list">
            <MetricItem
              label="Weight gradient (∂L/∂w)"
              value={weightGradient}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
            <MetricItem
              label="Bias gradient (∂L/∂b)"
              value={biasGradient}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
          </dl>
        </div>

        {/* Training Signal */}
        <div className="xray-group">
          <h3 className="xray-group-title">Training Signal</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Loss / MSE" value={loss} />
          </dl>
        </div>

        {/* Predictions Summary */}
        <div className="xray-group">
          <h3 className="xray-group-title">Predictions Summary</h3>
          {predictions ? (
            <dl className="xray-metrics-list">
              <MetricItem
                label="Prediction range"
                textValue={`${formatNumber(predictions.min)} to ${formatNumber(predictions.max)}`}
              />
              <MetricItem label="Mean prediction" value={predictions.mean} />
              {predictions.sample.length > 0 && (
                <MetricItem
                  label="Sample (first 3)"
                  textValue={predictions.sample.map((v) => formatNumber(v)).join(", ")}
                />
              )}
            </dl>
          ) : (
            <p className="empty-state">No predictions recorded.</p>
          )}
        </div>

        {/* Changes from previous frame */}
        <div className="xray-group xray-group-full">
          <h3 className="xray-group-title">Changes from Previous Frame</h3>
          {isInitialState ? (
            <p className="xray-initial-note">Initial state — before the first update.</p>
          ) : frameChanges ? (
            <dl className="xray-metrics-list xray-metrics-inline">
              <MetricDelta label="Δ Weight" delta={frameChanges.weight} />
              <MetricDelta label="Δ Bias" delta={frameChanges.bias} />
              <MetricDelta label="Δ Loss" delta={frameChanges.loss} />
              {frameChanges.weightGradient !== undefined && (
                <MetricDelta label="Δ Gradient" delta={frameChanges.weightGradient} />
              )}
            </dl>
          ) : (
            <p className="empty-state">No previous frame data.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   LOGISTIC REGRESSION X-RAY
   ========================================================================== */
function LogisticXRayView({ data }: { data: ReturnType<typeof computeLogisticXRay> }) {
  const {
    isInitialState,
    weights,
    bias,
    weightGradients,
    biasGradient,
    loss,
    accuracy,
    probabilities,
    frameChanges,
  } = data;

  return (
    <section className="model-x-ray state-panel" aria-label="Logistic Regression Model X-Ray">
      <div className="state-heading">
        <p className="eyebrow">Model X-Ray / Logistic Regression</p>
        <h2>{isInitialState ? "Step 0 — Initial State" : `Step ${data.step}`}</h2>
        <p>
          {isInitialState
            ? "Initial state — before the first update."
            : "Inspecting actual parameters, gradients, and classification probabilities."}
        </p>
      </div>

      <div className="xray-content-grid">
        {/* Model Parameters */}
        <div className="xray-group">
          <h3 className="xray-group-title">Model Parameters</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Weight 1 (w₁)" value={weights[0]} />
            <MetricItem label="Weight 2 (w₂)" value={weights[1]} />
            <MetricItem label="Bias (b)" value={bias} />
          </dl>
        </div>

        {/* Gradients */}
        <div className="xray-group">
          <h3 className="xray-group-title">Gradients</h3>
          <dl className="xray-metrics-list">
            <MetricItem
              label="Weight 1 gradient"
              value={weightGradients[0]}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
            <MetricItem
              label="Weight 2 gradient"
              value={weightGradients[1]}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
            <MetricItem
              label="Bias gradient"
              value={biasGradient}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
          </dl>
        </div>

        {/* Training Signal & Classification */}
        <div className="xray-group">
          <h3 className="xray-group-title">Training Signal & Accuracy</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Binary Cross-Entropy (loss)" value={loss} />
            <MetricItem
              label="Accuracy"
              textValue={accuracy != null ? formatPercentage(accuracy) : "N/A"}
            />
          </dl>
        </div>

        {/* Predictions (Probabilities) */}
        <div className="xray-group">
          <h3 className="xray-group-title">Probabilities</h3>
          {probabilities ? (
            <dl className="xray-metrics-list">
              <MetricItem
                label="Probability range"
                textValue={`${formatNumber(probabilities.min)} to ${formatNumber(probabilities.max)}`}
              />
              <MetricItem label="Mean probability" value={probabilities.mean} />
              {probabilities.sample.length > 0 && (
                <MetricItem
                  label="Sample (first 3)"
                  textValue={probabilities.sample.map((v) => formatNumber(v)).join(", ")}
                />
              )}
            </dl>
          ) : (
            <p className="empty-state">No probability scores recorded.</p>
          )}
        </div>

        {/* Changes from previous frame */}
        <div className="xray-group xray-group-full">
          <h3 className="xray-group-title">Changes from Previous Frame</h3>
          {isInitialState ? (
            <p className="xray-initial-note">Initial state — before the first update.</p>
          ) : frameChanges ? (
            <dl className="xray-metrics-list xray-metrics-inline">
              <MetricDelta label="Δ Weight 1" delta={frameChanges.weight1} />
              {frameChanges.weight2 !== undefined && (
                <MetricDelta label="Δ Weight 2" delta={frameChanges.weight2} />
              )}
              <MetricDelta label="Δ Bias" delta={frameChanges.bias} />
              <MetricDelta label="Δ BCE" delta={frameChanges.loss} />
              {frameChanges.accuracy !== undefined && (
                <MetricDelta label="Δ Accuracy" delta={frameChanges.accuracy} isPercentage />
              )}
            </dl>
          ) : (
            <p className="empty-state">No previous frame data.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   K-MEANS X-RAY
   ========================================================================== */
function KMeansXRayView({ data }: { data: ReturnType<typeof computeKMeansXRay> }) {
  const {
    isInitialState,
    clusterCount,
    centroids,
    inertia,
    assignmentDistribution,
    centroidMovements,
    totalMovement,
    inertiaChange,
  } = data;

  return (
    <section className="model-x-ray state-panel" aria-label="K-Means Model X-Ray">
      <div className="state-heading">
        <p className="eyebrow">Model X-Ray / K-Means</p>
        <h2>{isInitialState ? "Step 0 — Initial Centroid Configuration" : `Iteration ${data.step}`}</h2>
        <p>
          {isInitialState
            ? "Initial centroid configuration — before the first update."
            : "Inspecting centroid coordinates, cluster assignment distribution, and movement."}
        </p>
      </div>

      <div className="xray-content-grid">
        {/* Model State & Inertia */}
        <div className="xray-group">
          <h3 className="xray-group-title">Model State & Inertia</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Clusters (k)" textValue={String(clusterCount)} />
            <MetricItem label="Inertia" value={inertia} />
          </dl>
        </div>

        {/* Centroids */}
        <div className="xray-group">
          <h3 className="xray-group-title">Centroids</h3>
          <dl className="xray-metrics-list">
            {centroids.map((coord, idx) => (
              <MetricItem
                key={idx}
                label={`Centroid ${idx + 1}`}
                textValue={`(${formatNumber(coord[0], 3)}, ${formatNumber(coord[1], 3)})`}
              />
            ))}
          </dl>
        </div>

        {/* Clustering State / Assignment Distribution */}
        <div className="xray-group">
          <h3 className="xray-group-title">Assignment Distribution</h3>
          <dl className="xray-metrics-list">
            {assignmentDistribution.map((stat) => (
              <MetricItem
                key={stat.clusterIndex}
                label={`Cluster ${stat.clusterIndex + 1}`}
                textValue={`${stat.count} pts (${stat.percentage.toFixed(1)}%)`}
              />
            ))}
          </dl>
        </div>

        {/* Movement */}
        <div className="xray-group">
          <h3 className="xray-group-title">Centroid Movement</h3>
          {isInitialState ? (
            <p className="xray-initial-note">Initial centroid configuration — no movement yet.</p>
          ) : (
            <dl className="xray-metrics-list">
              <MetricItem
                label="Total movement"
                value={totalMovement}
                placeholder="0.0000"
              />
              {centroidMovements?.map((mov, idx) => (
                <MetricItem
                  key={idx}
                  label={`Centroid ${idx + 1} movement`}
                  value={mov}
                />
              ))}
            </dl>
          )}
        </div>

        {/* Changes from previous iteration */}
        <div className="xray-group xray-group-full">
          <h3 className="xray-group-title">Iteration Change</h3>
          {isInitialState ? (
            <p className="xray-initial-note">Initial centroid configuration — before the first update.</p>
          ) : inertiaChange != null ? (
            <dl className="xray-metrics-list xray-metrics-inline">
              <MetricDelta label="Δ Inertia" delta={inertiaChange} />
              {totalMovement != null && (
                <MetricItem label="Centroid shift" value={totalMovement} />
              )}
            </dl>
          ) : (
            <p className="empty-state">No previous iteration data.</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   NEURAL NETWORK X-RAY
   ========================================================================== */
function NeuralNetworkXRayView({ data }: { data: ReturnType<typeof computeNeuralNetworkXRay> }) {
  const {
    isInitialState,
    architecture,
    w1,
    b1,
    w2,
    b2,
    dw1,
    db1,
    dw2,
    db2,
    gradientMagnitude,
    loss,
    accuracy,
    probabilities,
    frameChanges,
  } = data;

  return (
    <section className="model-x-ray state-panel" aria-label="Neural Network Model X-Ray">
      <div className="state-heading">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem" }}>
          <p className="eyebrow">Model X-Ray / Neural Network</p>
          <span className="badge" style={{ fontSize: "0.75rem" }}>
            {architecture.inputs} → {architecture.hidden} → {architecture.outputs} (Sigmoid)
          </span>
        </div>
        <h2>{isInitialState ? "Step 0 — Initial State" : `Step ${data.step}`}</h2>
        <p>
          {isInitialState
            ? "Initial weights initialized via Xavier/Glorot scaling, biases at 0. Ready for backpropagation."
            : "Inspecting frame parameters, layer activations, analytical gradients, and weight deltas."}
        </p>
      </div>

      <div className="xray-content-grid">
        {/* Hidden Layer (Layer 1) Parameters */}
        <div className="xray-group">
          <h3 className="xray-group-title">Hidden Layer (W₁, b₁)</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0 0 0.5rem" }}>
            Input (2 features) to {architecture.hidden} neurons
          </p>
          <dl className="xray-metrics-list">
            {w1.map((row, i) =>
              row.map((val, j) => (
                <MetricItem
                  key={`w1-${i}-${j}`}
                  label={`W₁[${i}, ${j}] (in${i + 1} → h${j + 1})`}
                  value={val}
                />
              ))
            )}
            {b1.map((val, j) => (
              <MetricItem
                key={`b1-${j}`}
                label={`b₁[${j}] (neuron h${j + 1})`}
                value={val}
              />
            ))}
          </dl>
        </div>

        {/* Output Layer (Layer 2) Parameters */}
        <div className="xray-group">
          <h3 className="xray-group-title">Output Layer (W₂, b₂)</h3>
          <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", margin: "0 0 0.5rem" }}>
            {architecture.hidden} hidden neurons to 1 output
          </p>
          <dl className="xray-metrics-list">
            {w2.map((row, j) => (
              <MetricItem
                key={`w2-${j}`}
                label={`W₂[${j}, 0] (h${j + 1} → out)`}
                value={row[0]}
              />
            ))}
            <MetricItem label="Bias (b₂)" value={b2} />
          </dl>
        </div>

        {/* Analytical Gradients (Backprop) */}
        <div className="xray-group">
          <h3 className="xray-group-title">Backpropagation Gradients</h3>
          <dl className="xray-metrics-list">
            <MetricItem
              label="||∇Loss||₂ (Total Gradient Norm)"
              value={gradientMagnitude}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
            {dw2 &&
              dw2.map((row, j) => (
                <MetricItem
                  key={`dw2-${j}`}
                  label={`∂L/∂W₂[${j}, 0]`}
                  value={row[0]}
                />
              ))}
            <MetricItem
              label="∂L/∂b₂"
              value={db2}
              placeholder={isInitialState ? "None (initial state)" : undefined}
            />
            {dw1 && dw1.length > 0 && (
              <MetricItem
                label="∂L/∂W₁ (sample)"
                textValue={dw1.map((r) => r.map((v) => formatNumber(v, 3)).join(", ")).join(" | ")}
              />
            )}
            {db1 && (
              <MetricItem
                label="∂L/∂b₁"
                textValue={db1.map((v) => formatNumber(v, 3)).join(", ")}
              />
            )}
          </dl>
        </div>

        {/* Training Signal */}
        <div className="xray-group">
          <h3 className="xray-group-title">Training Signal</h3>
          <dl className="xray-metrics-list">
            <MetricItem label="Loss / BCE" value={loss} />
            <MetricItem
              label="Accuracy"
              textValue={accuracy != null ? formatPercentage(accuracy) : "N/A"}
            />
            <MetricItem
              label="Probabilities (mean)"
              value={probabilities?.mean}
              placeholder="N/A"
            />
            <MetricItem
              label="Prob range"
              textValue={
                probabilities
                  ? `${formatNumber(probabilities.min, 2)} – ${formatNumber(probabilities.max, 2)}`
                  : "N/A"
              }
            />
          </dl>
        </div>

        {/* Frame Changes */}
        <div className="xray-group">
          <h3 className="xray-group-title">Frame Updates (Δ from prev)</h3>
          {frameChanges ? (
            <dl className="xray-metrics-list">
              <MetricDelta label="Δ Loss" delta={frameChanges.loss} />
              {frameChanges.accuracy !== undefined && (
                <MetricDelta label="Δ Accuracy" delta={frameChanges.accuracy} isPercentage />
              )}
              {frameChanges.w1DeltaNorm !== undefined && (
                <MetricItem label="||ΔW₁||₂ (L1 movement)" value={frameChanges.w1DeltaNorm} />
              )}
              {frameChanges.w2DeltaNorm !== undefined && (
                <MetricItem label="||ΔW₂||₂ (L2 movement)" value={frameChanges.w2DeltaNorm} />
              )}
            </dl>
          ) : (
            <p className="empty-state" style={{ padding: "0.5rem 0", fontSize: "0.85rem" }}>
              {isInitialState ? "Initial state — no prior step." : "No previous frame data."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   REUSABLE METRIC RENDERERS
   ========================================================================== */
function MetricItem({
  label,
  value,
  textValue,
  placeholder,
}: {
  label: string;
  value?: number | null;
  textValue?: string;
  placeholder?: string;
}) {
  const display =
    textValue !== undefined
      ? textValue
      : value != null
      ? formatNumber(value)
      : placeholder ?? "N/A";

  return (
    <div className="xray-metric-item">
      <dt>{label}</dt>
      <dd>{display}</dd>
    </div>
  );
}

function MetricDelta({
  label,
  delta,
  isPercentage = false,
}: {
  label: string;
  delta: number | null | undefined;
  isPercentage?: boolean;
}) {
  const display =
    delta == null
      ? "N/A"
      : isPercentage
      ? `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`
      : formatDelta(delta);

  return (
    <div className="xray-metric-item">
      <dt>{label}</dt>
      <dd className="xray-delta">{display}</dd>
    </div>
  );
}
