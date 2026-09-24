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
  getXRayNarrative,
} from "./x-ray-helpers";

export type ModelXRayProps = {
  run: TrainingRun;
  state: TrainingState | null;
  currentStep: number;
};

export function ModelXRay({ run, state, currentStep }: ModelXRayProps) {
  if (!state) {
    return (
      <section className="model-x-ray rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-6 shadow-xs" aria-label="Model X-Ray">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Model X-Ray
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            No frame selected
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Scrub the timeline or run training to inspect the model internals.
          </p>
        </div>
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
          No recorded frame is currently selected.
        </p>
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
    <div id="model-x-ray-panel" className="model-x-ray-anchor space-y-4">
      <div className="flex justify-end">
        <Link
          href="/workbench"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-teal-300 transition-colors"
        >
          <span>View evaluation in Data Workbench →</span>
        </Link>
      </div>
      {content}
    </div>
  );
}

/* ==========================================================================
   REUSABLE PRESENTATION COMPONENTS
   ========================================================================== */

function WhatWhyBanner({
  narrative,
  algorithmTitle,
  step,
  isInitialState,
}: {
  narrative: { what: string; why: string };
  algorithmTitle: string;
  step: number;
  isInitialState: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            Model X-Ray · {algorithmTitle}
          </span>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {isInitialState ? "Step 0 — Initial Model State" : `Training Frame ${step}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
            {isInitialState ? "Untrained Baseline" : `Step ${step}`}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl border border-teal-200/70 dark:border-teal-900/50 bg-teal-50/50 dark:bg-teal-950/30 p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300 text-[10px]">
            <span>✨</span>
            <span>What Happened</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {narrative.what}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3 space-y-1">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-[10px]">
            <span>💡</span>
            <span>Why</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {narrative.why}
          </p>
        </div>
      </div>
    </div>
  );
}

function CardContainer({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-5 shadow-xs transition-all space-y-4">
      <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {badge && (
          <span className="shrink-0 rounded-full border border-teal-200 dark:border-teal-800/80 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-4 grow">{children}</div>
    </section>
  );
}

function MetricBlock({
  label,
  value,
  explanation,
  indicator,
}: {
  label: string;
  value: string;
  explanation?: string;
  indicator?: "down" | "up" | "neutral";
}) {
  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        {indicator === "down" && (
          <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm leading-none">↓</span>
        )}
        {indicator === "up" && (
          <span className="text-amber-600 dark:text-amber-400 font-bold text-sm leading-none">↑</span>
        )}
        <span className="text-lg sm:text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white tabular-nums">
          {value}
        </span>
      </div>
      {explanation && (
        <span className="text-[10px] text-slate-500 dark:text-slate-400 block leading-tight">
          {explanation}
        </span>
      )}
    </div>
  );
}

function MatrixTable({
  title,
  symbol,
  dimensions,
  matrix,
  rowLabels,
  colLabels,
  decimals = 4,
}: {
  title: string;
  symbol?: string;
  dimensions?: string;
  matrix: number[][];
  rowLabels?: string[];
  colLabels?: string[];
  decimals?: number;
}) {
  if (!matrix || matrix.length === 0 || !matrix[0]) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-400 text-center">
        No matrix values recorded.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          {symbol && (
            <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
              {symbol}
            </span>
          )}
          <span>{title}</span>
        </span>
        {dimensions && (
          <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
            {dimensions}
          </span>
        )}
      </div>

      <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3">
        <table className="w-full text-right font-mono text-xs tabular-nums border-collapse">
          {colLabels && (
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-slate-800/60">
                {rowLabels && <th className="text-left font-sans text-[10px] text-slate-400 p-1.5 w-16" />}
                {colLabels.map((col, idx) => (
                  <th
                    key={idx}
                    className="font-sans text-[10px] font-semibold text-slate-500 dark:text-slate-400 p-1.5 min-w-[5rem]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {matrix.map((row, rIdx) => (
              <tr
                key={rIdx}
                className="hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition-colors"
              >
                {rowLabels && (
                  <td className="text-left font-sans text-[10px] font-medium text-slate-500 dark:text-slate-400 p-1.5 pr-2 whitespace-nowrap">
                    {rowLabels[rIdx]}
                  </td>
                )}
                {row.map((val, cIdx) => (
                  <td
                    key={cIdx}
                    className="p-1.5 text-slate-800 dark:text-slate-200 font-semibold min-w-[5rem]"
                  >
                    {formatNumber(val, decimals)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VectorDisplay({
  label,
  values,
  decimals = 4,
}: {
  label: string;
  values: number[];
  decimals?: number;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 px-3 py-2 text-xs">
      <span className="font-semibold text-slate-600 dark:text-slate-400 text-[11px]">{label}</span>
      <span className="font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
        [{values.map((v) => formatDelta(v, decimals)).join(", ")}]
      </span>
    </div>
  );
}

function CollapsibleDetail({
  title,
  badge,
  defaultOpen = false,
  children,
}: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group/detail rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 overflow-hidden"
    >
      <summary className="flex items-center justify-between p-3 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 select-none transition-colors">
        <span className="flex items-center gap-2">
          <span className="text-[10px] text-teal-600 dark:text-teal-400 group-open/detail:rotate-90 transition-transform">
            ▶
          </span>
          {title}
        </span>
        {badge && (
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            {badge}
          </span>
        )}
      </summary>
      <div className="p-3 pt-1 border-t border-slate-200/50 dark:border-slate-800/50 space-y-3">
        {children}
      </div>
    </details>
  );
}

/* ==========================================================================
   1. NEURAL NETWORK X-RAY
   ========================================================================== */
function NeuralNetworkXRayView({ data }: { data: ReturnType<typeof computeNeuralNetworkXRay> }) {
  const {
    isInitialState,
    architecture,
    w1,
    b1,
    w2,
    b2,
    w1Norm,
    w2Norm,
    dw1,
    db1,
    dw2,
    db2,
    gradientMagnitude,
    weightGradientNorm,
    biasGradientNorm,
    loss,
    accuracy,
    probabilities,
    hiddenActivations,
    frameChanges,
  } = data;

  const narrative = getXRayNarrative(data);
  const hiddenCount = architecture.hidden;
  const hLabels = Array.from({ length: hiddenCount }, (_, i) => `h${i + 1}`);

  return (
    <div className="space-y-5">
      <WhatWhyBanner
        narrative={narrative}
        algorithmTitle="Neural Network (Backpropagation)"
        step={data.step}
        isInitialState={isInitialState}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Model Parameters */}
        <CardContainer
          title="Model Parameters"
          badge={`W₁: ${architecture.inputs}×${architecture.hidden} · W₂: ${architecture.hidden}×1`}
          subtitle={`Input (${architecture.inputs} features) → Hidden (${architecture.hidden} neurons) → Output (1, Sigmoid)`}
        >
          {/* Summary View */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="||W₁||₂ (Input Weights)"
              value={w1Norm != null ? formatNumber(w1Norm, 3) : "N/A"}
              explanation="L2 norm of input layer"
            />
            <MetricBlock
              label="||W₂||₂ (Output Weights)"
              value={w2Norm != null ? formatNumber(w2Norm, 3) : "N/A"}
              explanation="L2 norm of hidden layer"
            />
          </div>

          {/* Biases: Compact Vector Formatting */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Biases (b₁, b₂)
            </span>
            <VectorDisplay
              label={`Hidden Layer (b₁, ${b1.length} neurons)`}
              values={b1}
              decimals={3}
            />
            <VectorDisplay
              label="Output Layer (b₂)"
              values={[b2]}
              decimals={3}
            />
          </div>

          {/* Progressive Disclosure: Structured Matrices */}
          <div className="space-y-2 pt-1">
            <CollapsibleDetail
              title="Inspect full W₁ matrix (Input → Hidden)"
              badge={`${architecture.inputs} × ${architecture.hidden}`}
            >
              <MatrixTable
                title="W₁ Weights — Input to Hidden"
                symbol="W₁"
                dimensions={`${architecture.inputs} × ${architecture.hidden}`}
                matrix={w1}
                rowLabels={["in₁ (Feature 1)", "in₂ (Feature 2)"]}
                colLabels={hLabels}
                decimals={4}
              />
            </CollapsibleDetail>

            <CollapsibleDetail
              title="Inspect full W₂ matrix (Hidden → Output)"
              badge={`${architecture.hidden} × 1`}
            >
              <MatrixTable
                title="W₂ Weights — Hidden to Output"
                symbol="W₂"
                dimensions={`${architecture.hidden} × 1`}
                matrix={w2}
                rowLabels={hLabels}
                colLabels={["out (Logit)"]}
                decimals={4}
              />
            </CollapsibleDetail>

            {hiddenActivations && hiddenActivations.length > 0 && (
              <CollapsibleDetail
                title="Inspect hidden activations sample (h₁..hₖ)"
                badge={`${Math.min(hiddenActivations.length, 3)} pts`}
              >
                <MatrixTable
                  title="Hidden Neuron Sigmoids (σ(z₁))"
                  symbol="a₁"
                  dimensions={`sample × ${architecture.hidden}`}
                  matrix={hiddenActivations.slice(0, 3)}
                  rowLabels={["Point 1", "Point 2", "Point 3"].slice(0, hiddenActivations.length)}
                  colLabels={hLabels}
                  decimals={3}
                />
              </CollapsibleDetail>
            )}
          </div>
        </CardContainer>

        {/* Card 2: Gradient Signal */}
        <CardContainer
          title="Gradient Signal"
          badge="Backpropagation"
          subtitle="Gradient Norm: How strongly the parameters are being pushed to change."
        >
          {/* Primary View: 3 Gradient Norms */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <MetricBlock
              label="Weight Gradient"
              value={weightGradientNorm != null ? formatNumber(weightGradientNorm, 3) : isInitialState ? "None" : "N/A"}
              explanation="||∇W||₂ weight norm"
            />
            <MetricBlock
              label="Bias Gradient"
              value={biasGradientNorm != null ? formatNumber(biasGradientNorm, 3) : isInitialState ? "None" : "N/A"}
              explanation="||∇b||₂ bias norm"
            />
            <MetricBlock
              label="Total Gradient"
              value={gradientMagnitude != null ? formatNumber(gradientMagnitude, 3) : isInitialState ? "None" : "N/A"}
              explanation="||∇Loss||₂ total norm"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-3 text-xs text-slate-600 dark:text-slate-400">
            {isInitialState
              ? "Baseline frame before gradient pass. Xavier-scaled weights are ready for the first forward-backward pass."
              : "Analytical derivatives computed via the chain rule propagate backwards from cross-entropy loss through the sigmoid layers."}
          </div>

          {/* Progressive Disclosure: Detailed Gradients */}
          {!isInitialState && (dw1 || dw2 || db1 || db2 != null) && (
            <div className="space-y-2 pt-1">
              <CollapsibleDetail
                title="Inspect analytical gradient matrices (∂L/∂W, ∂L/∂b) →"
                badge="Chain Rule"
              >
                {dw1 && (
                  <MatrixTable
                    title="∂L/∂W₁ — Hidden Weight Gradients"
                    symbol="∇W₁"
                    dimensions={`${architecture.inputs} × ${architecture.hidden}`}
                    matrix={dw1}
                    rowLabels={["in₁", "in₂"]}
                    colLabels={hLabels}
                    decimals={4}
                  />
                )}
                {dw2 && (
                  <MatrixTable
                    title="∂L/∂W₂ — Output Weight Gradients"
                    symbol="∇W₂"
                    dimensions={`${architecture.hidden} × 1`}
                    matrix={dw2}
                    rowLabels={hLabels}
                    colLabels={["out"]}
                    decimals={4}
                  />
                )}
                {db1 && (
                  <VectorDisplay
                    label="∂L/∂b₁ (Hidden Bias Gradients)"
                    values={db1}
                    decimals={4}
                  />
                )}
                {db2 != null && (
                  <VectorDisplay
                    label="∂L/∂b₂ (Output Bias Gradient)"
                    values={[db2]}
                    decimals={4}
                  />
                )}
              </CollapsibleDetail>
            </div>
          )}
        </CardContainer>

        {/* Card 3: Training Signal */}
        <CardContainer
          title="Training Signal"
          badge="Classification"
          subtitle="Empirical loss and probabilistic output distribution at this snapshot."
        >
          {/* 2x2 Metric Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="Loss / BCE"
              value={loss != null ? formatNumber(loss, 4) : "N/A"}
              explanation="Binary cross-entropy"
            />
            <MetricBlock
              label="Accuracy"
              value={accuracy != null ? formatPercentage(accuracy) : "N/A"}
              explanation="Correct classifications"
            />
            <MetricBlock
              label="Mean Prob."
              value={probabilities ? formatNumber(probabilities.mean, 3) : "N/A"}
              explanation="Average sigmoid confidence"
            />
            <MetricBlock
              label="Prob. Range"
              value={
                probabilities
                  ? `${formatNumber(probabilities.min, 2)}–${formatNumber(probabilities.max, 2)}`
                  : "N/A"
              }
              explanation="Min to max sigmoid output"
            />
          </div>

          {probabilities?.sample && probabilities.sample.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Sample Probabilities (first 3):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                {probabilities.sample.map((p) => formatNumber(p, 3)).join(", ")}
              </span>
            </div>
          )}
        </CardContainer>

        {/* Card 4: Frame Updates */}
        <CardContainer
          title="Frame Updates"
          badge={isInitialState ? "Baseline" : `Δ vs Frame ${data.step - 1}`}
          subtitle="Parameter shifts and error changes between consecutive frames."
        >
          {isInitialState ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 space-y-1">
              <span className="font-semibold block text-slate-600 dark:text-slate-300">Initial State</span>
              <span>Before the first gradient step. Delta metrics will appear starting at Step 1.</span>
            </div>
          ) : frameChanges ? (
            <div className="grid grid-cols-2 gap-2.5">
              <MetricBlock
                label="Loss Change"
                value={formatDelta(frameChanges.loss, 4)}
                indicator={frameChanges.loss < 0 ? "down" : frameChanges.loss > 0 ? "up" : "neutral"}
                explanation={frameChanges.loss < 0 ? "Loss decreased" : "Loss increased"}
              />
              <MetricBlock
                label="Accuracy Change"
                value={
                  frameChanges.accuracy !== undefined
                    ? `${frameChanges.accuracy >= 0 ? "+" : ""}${(frameChanges.accuracy * 100).toFixed(1)}%`
                    : "+0.0%"
                }
                explanation="Classification shift"
              />
              <MetricBlock
                label="W₁ Movement"
                value={frameChanges.w1DeltaNorm != null ? formatNumber(frameChanges.w1DeltaNorm, 4) : "N/A"}
                explanation="||ΔW₁||₂ input layer shift"
              />
              <MetricBlock
                label="W₂ Movement"
                value={frameChanges.w2DeltaNorm != null ? formatNumber(frameChanges.w2DeltaNorm, 4) : "N/A"}
                explanation="||ΔW₂||₂ output layer shift"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No previous frame data available.</p>
          )}
        </CardContainer>
      </div>
    </div>
  );
}

/* ==========================================================================
   2. LINEAR REGRESSION X-RAY
   ========================================================================== */
function LinearXRayView({ data }: { data: ReturnType<typeof computeLinearXRay> }) {
  const { isInitialState, weights, bias, weightGradient, biasGradient, totalGradientNorm, loss, predictions, frameChanges } = data;
  const narrative = getXRayNarrative(data);
  const w = weights[0] ?? 0;

  return (
    <div className="space-y-5">
      <WhatWhyBanner
        narrative={narrative}
        algorithmTitle="Linear Regression (Gradient Descent)"
        step={data.step}
        isInitialState={isInitialState}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Model Parameters */}
        <CardContainer
          title="Model Parameters"
          badge="1D Linear Fit"
          subtitle="Slope and intercept defining the fitted regression line."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="Weight (w, Slope)"
              value={formatNumber(w, 4)}
              explanation="Rise over run"
            />
            <MetricBlock
              label="Bias (b, Intercept)"
              value={formatNumber(bias, 4)}
              explanation="Vertical axis intercept"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Fitted Model Equation
            </span>
            <div className="font-mono text-sm font-bold text-teal-800 dark:text-teal-300">
              ŷ = {formatNumber(w, 4)} · x {bias >= 0 ? "+" : "−"} {formatNumber(Math.abs(bias), 4)}
            </div>
          </div>
        </CardContainer>

        {/* Card 2: Gradient Signal */}
        <CardContainer
          title="Gradient Signal"
          badge="MSE Derivatives"
          subtitle="Gradient Norm: How strongly the parameters are being pushed to change."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <MetricBlock
              label="Weight Gradient"
              value={weightGradient != null ? formatNumber(weightGradient, 4) : isInitialState ? "None" : "N/A"}
              explanation="∂L/∂w (slope error)"
            />
            <MetricBlock
              label="Bias Gradient"
              value={biasGradient != null ? formatNumber(biasGradient, 4) : isInitialState ? "None" : "N/A"}
              explanation="∂L/∂b (bias error)"
            />
            <MetricBlock
              label="Total Gradient Norm"
              value={totalGradientNorm != null ? formatNumber(totalGradientNorm, 4) : isInitialState ? "None" : "N/A"}
              explanation="||∇Loss||₂ total step force"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-3 text-xs text-slate-600 dark:text-slate-400">
            {isInitialState
              ? "Baseline frame before gradient calculation. Gradient descent updates parameters in the direction opposite to the slope."
              : "Parameters step downward against the gradient: w ← w − η(∂L/∂w), shifting the line toward data points."}
          </div>
        </CardContainer>

        {/* Card 3: Training Signal */}
        <CardContainer
          title="Training Signal"
          badge="MSE Loss"
          subtitle="Mean squared error across dataset observations."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="Loss / MSE"
              value={loss != null ? formatNumber(loss, 4) : "N/A"}
              explanation="Mean squared residuals"
            />
            <MetricBlock
              label="Mean Prediction"
              value={predictions ? formatNumber(predictions.mean, 4) : "N/A"}
              explanation="Average predicted ŷ"
            />
            <MetricBlock
              label="Min Prediction"
              value={predictions ? formatNumber(predictions.min, 4) : "N/A"}
              explanation="Minimum ŷ in batch"
            />
            <MetricBlock
              label="Max Prediction"
              value={predictions ? formatNumber(predictions.max, 4) : "N/A"}
              explanation="Maximum ŷ in batch"
            />
          </div>

          {predictions?.sample && predictions.sample.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Sample Predictions (first 3):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                {predictions.sample.map((p) => formatNumber(p, 3)).join(", ")}
              </span>
            </div>
          )}
        </CardContainer>

        {/* Card 4: Frame Updates */}
        <CardContainer
          title="Frame Updates"
          badge={isInitialState ? "Baseline" : `Δ vs Frame ${data.step - 1}`}
          subtitle="Parameter shifts and error changes between consecutive frames."
        >
          {isInitialState ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 space-y-1">
              <span className="font-semibold block text-slate-600 dark:text-slate-300">Initial State</span>
              <span>Before the first gradient step. Delta metrics will appear starting at Step 1.</span>
            </div>
          ) : frameChanges ? (
            <div className="grid grid-cols-2 gap-2.5">
              <MetricBlock
                label="Δ Loss"
                value={formatDelta(frameChanges.loss, 4)}
                indicator={frameChanges.loss < 0 ? "down" : frameChanges.loss > 0 ? "up" : "neutral"}
                explanation={frameChanges.loss < 0 ? "Loss decreased" : "Loss increased"}
              />
              <MetricBlock
                label="Δ Weight (w)"
                value={formatDelta(frameChanges.weight, 4)}
                explanation="Slope shift this step"
              />
              <MetricBlock
                label="Δ Bias (b)"
                value={formatDelta(frameChanges.bias, 4)}
                explanation="Intercept shift this step"
              />
              <MetricBlock
                label="Δ Gradient"
                value={frameChanges.weightGradient !== undefined ? formatDelta(frameChanges.weightGradient, 4) : "0.0000"}
                explanation="Slope curvature change"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No previous frame data available.</p>
          )}
        </CardContainer>
      </div>
    </div>
  );
}

/* ==========================================================================
   3. LOGISTIC REGRESSION X-RAY
   ========================================================================== */
function LogisticXRayView({ data }: { data: ReturnType<typeof computeLogisticXRay> }) {
  const {
    isInitialState,
    weights,
    bias,
    weightGradients,
    biasGradient,
    weightGradientNorm,
    totalGradientNorm,
    loss,
    accuracy,
    probabilities,
    frameChanges,
  } = data;

  const narrative = getXRayNarrative(data);
  const w1 = weights[0] ?? 0;
  const w2 = weights[1] ?? 0;

  return (
    <div className="space-y-5">
      <WhatWhyBanner
        narrative={narrative}
        algorithmTitle="Logistic Regression (Sigmoid Classification)"
        step={data.step}
        isInitialState={isInitialState}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Model Parameters */}
        <CardContainer
          title="Model Parameters"
          badge="Binary Classifier"
          subtitle="Weights and bias defining the linear decision boundary."
        >
          <div className="grid grid-cols-3 gap-2.5">
            <MetricBlock
              label="Weight 1 (w₁)"
              value={formatNumber(w1, 3)}
              explanation="Feature 1 weight"
            />
            <MetricBlock
              label="Weight 2 (w₂)"
              value={formatNumber(w2, 3)}
              explanation="Feature 2 weight"
            />
            <MetricBlock
              label="Bias (b)"
              value={formatNumber(bias, 3)}
              explanation="Boundary threshold"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Logit Equation z = w₁·x₁ + w₂·x₂ + b
            </span>
            <div className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 truncate">
              z = {formatNumber(w1, 3)}·x₁ {w2 >= 0 ? "+" : "−"} {formatNumber(Math.abs(w2), 3)}·x₂ {bias >= 0 ? "+" : "−"} {formatNumber(Math.abs(bias), 3)}
            </div>
          </div>
        </CardContainer>

        {/* Card 2: Gradient Signal */}
        <CardContainer
          title="Gradient Signal"
          badge="BCE Gradients"
          subtitle="Gradient Norm: How strongly the parameters are being pushed to change."
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <MetricBlock
              label="Weight Gradient Norm"
              value={weightGradientNorm != null ? formatNumber(weightGradientNorm, 3) : isInitialState ? "None" : "N/A"}
              explanation="||∇w||₂ weight norm"
            />
            <MetricBlock
              label="Bias Gradient"
              value={biasGradient != null ? formatNumber(biasGradient, 3) : isInitialState ? "None" : "N/A"}
              explanation="∂L/∂b bias slope"
            />
            <MetricBlock
              label="Total Gradient Norm"
              value={totalGradientNorm != null ? formatNumber(totalGradientNorm, 3) : isInitialState ? "None" : "N/A"}
              explanation="||∇Loss||₂ total norm"
            />
          </div>

          {!isInitialState && weightGradients.length > 0 && (
            <CollapsibleDetail title="Inspect individual weight gradients" badge="w₁, w₂">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <MetricBlock
                  label="∂L/∂w₁ (Weight 1 Gradient)"
                  value={formatNumber(weightGradients[0], 4)}
                />
                <MetricBlock
                  label="∂L/∂w₂ (Weight 2 Gradient)"
                  value={formatNumber(weightGradients[1], 4)}
                />
              </div>
            </CollapsibleDetail>
          )}
        </CardContainer>

        {/* Card 3: Training Signal */}
        <CardContainer
          title="Training Signal"
          badge="Probabilities"
          subtitle="Binary cross-entropy loss and sigmoid classification performance."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="Loss / BCE"
              value={loss != null ? formatNumber(loss, 4) : "N/A"}
              explanation="Binary cross-entropy"
            />
            <MetricBlock
              label="Accuracy"
              value={accuracy != null ? formatPercentage(accuracy) : "N/A"}
              explanation="Correct classifications"
            />
            <MetricBlock
              label="Mean Prob."
              value={probabilities ? formatNumber(probabilities.mean, 3) : "N/A"}
              explanation="Average sigmoid confidence"
            />
            <MetricBlock
              label="Prob. Range"
              value={
                probabilities
                  ? `${formatNumber(probabilities.min, 2)}–${formatNumber(probabilities.max, 2)}`
                  : "N/A"
              }
              explanation="Min to max sigmoid output"
            />
          </div>

          {probabilities?.sample && probabilities.sample.length > 0 && (
            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">Sample Probabilities (first 3):</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                {probabilities.sample.map((p) => formatNumber(p, 3)).join(", ")}
              </span>
            </div>
          )}
        </CardContainer>

        {/* Card 4: Frame Updates */}
        <CardContainer
          title="Frame Updates"
          badge={isInitialState ? "Baseline" : `Δ vs Frame ${data.step - 1}`}
          subtitle="Parameter shifts and error changes between consecutive frames."
        >
          {isInitialState ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 space-y-1">
              <span className="font-semibold block text-slate-600 dark:text-slate-300">Initial State</span>
              <span>Before the first gradient step. Delta metrics will appear starting at Step 1.</span>
            </div>
          ) : frameChanges ? (
            <div className="grid grid-cols-2 gap-2.5">
              <MetricBlock
                label="Δ Loss (BCE)"
                value={formatDelta(frameChanges.loss, 4)}
                indicator={frameChanges.loss < 0 ? "down" : frameChanges.loss > 0 ? "up" : "neutral"}
                explanation={frameChanges.loss < 0 ? "Loss decreased" : "Loss increased"}
              />
              <MetricBlock
                label="Δ Accuracy"
                value={
                  frameChanges.accuracy !== undefined
                    ? `${frameChanges.accuracy >= 0 ? "+" : ""}${(frameChanges.accuracy * 100).toFixed(1)}%`
                    : "+0.0%"
                }
                explanation="Accuracy shift"
              />
              <MetricBlock
                label="Δ Weight 1"
                value={formatDelta(frameChanges.weight1, 4)}
                explanation="Shift in w₁"
              />
              <MetricBlock
                label="Δ Weight 2"
                value={frameChanges.weight2 !== undefined ? formatDelta(frameChanges.weight2, 4) : "N/A"}
                explanation="Shift in w₂"
              />
            </div>
          ) : (
            <p className="text-xs text-slate-400 text-center py-4">No previous frame data available.</p>
          )}
        </CardContainer>
      </div>
    </div>
  );
}

/* ==========================================================================
   4. K-MEANS X-RAY
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

  const narrative = getXRayNarrative(data);

  return (
    <div className="space-y-5">
      <WhatWhyBanner
        narrative={narrative}
        algorithmTitle="K-Means Clustering (Centroid Relocation)"
        step={data.step}
        isInitialState={isInitialState}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Model State & Centroids */}
        <CardContainer
          title="Centroid Coordinates"
          badge={`K = ${clusterCount} Clusters`}
          subtitle="Coordinates of current cluster centers in 2D feature space."
        >
          <div className="relative overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 p-3">
            <table className="w-full text-left font-mono text-xs tabular-nums border-collapse">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/60 text-[10px] font-sans font-semibold text-slate-500 dark:text-slate-400">
                  <th className="p-1.5">Cluster</th>
                  <th className="p-1.5">Centroid (x, y)</th>
                  <th className="p-1.5 text-right">Step Shift</th>
                </tr>
              </thead>
              <tbody>
                {centroids.map((coord, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/70 dark:hover:bg-slate-900/70 transition-colors">
                    <td className="p-1.5 font-sans font-semibold text-teal-800 dark:text-teal-400">
                      Cluster {idx + 1}
                    </td>
                    <td className="p-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      ({formatNumber(coord[0], 3)}, {formatNumber(coord[1], 3)})
                    </td>
                    <td className="p-1.5 text-right font-semibold text-slate-600 dark:text-slate-400">
                      {centroidMovements && centroidMovements[idx] != null
                        ? formatNumber(centroidMovements[idx], 3)
                        : "0.000"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContainer>

        {/* Card 2: Cluster Assignment Distribution */}
        <CardContainer
          title="Assignment Distribution"
          badge={`${assignmentDistribution.reduce((s, a) => s + a.count, 0)} Points`}
          subtitle="Point allocation across clusters based on nearest Euclidean centroid."
        >
          <div className="space-y-3">
            {assignmentDistribution.map((stat) => (
              <div key={stat.clusterIndex} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Cluster {stat.clusterIndex + 1}
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {stat.count} pts ({stat.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full bg-teal-600 dark:bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${stat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContainer>

        {/* Card 3: Model Inertia */}
        <CardContainer
          title="Clustering Inertia"
          badge="Objective"
          subtitle="Inertia measures the sum of squared Euclidean distances to assigned cluster centers."
        >
          <div className="grid grid-cols-2 gap-2.5">
            <MetricBlock
              label="Inertia (WCSS)"
              value={inertia != null ? formatNumber(inertia, 2) : "N/A"}
              explanation="Within-cluster sum of squares"
            />
            <MetricBlock
              label="Active Clusters (k)"
              value={String(clusterCount)}
              explanation="Configured centroid count"
            />
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/50 p-3 text-xs text-slate-600 dark:text-slate-400">
            Lower inertia indicates tighter, more cohesive clusters. As iterations progress, centroids gravitate to geometric centers.
          </div>
        </CardContainer>

        {/* Card 4: Iteration Updates */}
        <CardContainer
          title="Iteration Updates"
          badge={isInitialState ? "Baseline" : `Iteration ${data.step}`}
          subtitle="Changes in inertia and centroid displacement."
        >
          {isInitialState ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400 space-y-1">
              <span className="font-semibold block text-slate-600 dark:text-slate-300">Initial Centroid Placement</span>
              <span>Before the first relocation. Movement deltas will appear starting at Iteration 1.</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <MetricBlock
                label="Δ Inertia"
                value={inertiaChange != null ? formatDelta(inertiaChange, 2) : "0.00"}
                indicator={inertiaChange != null && inertiaChange < 0 ? "down" : "neutral"}
                explanation={inertiaChange != null && inertiaChange < 0 ? "Inertia decreased" : "No change"}
              />
              <MetricBlock
                label="Total Movement"
                value={totalMovement != null ? formatNumber(totalMovement, 3) : "0.000"}
                explanation="Sum of centroid Euclidean shifts"
              />
            </div>
          )}
        </CardContainer>
      </div>
    </div>
  );
}
