"use client";

import type { TrainingRun, TrainingState } from "@/types/training-run";
import {
  computeKMeansXRay,
  computeLinearXRay,
  computeLogisticXRay,
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

  if (isKMeans) {
    const data = computeKMeansXRay(state, prevState, run.training.clusters);
    return <KMeansXRayView data={data} />;
  }

  if (isLogistic) {
    const data = computeLogisticXRay(state, prevState);
    return <LogisticXRayView data={data} />;
  }

  const data = computeLinearXRay(state, prevState);
  return <LinearXRayView data={data} />;
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
