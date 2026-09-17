"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { ComparisonInsights } from "@/features/insights/comparison-insights";
import { generateComparisonInsights } from "@/features/insights/engine";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const baseRequest: TrainingRunRequest = {
      algorithm: "kmeans",
      dataset: { samples: 60, noise: 0.1, seed: 0 },
      training: { learning_rate: 0.1, epochs: 12, initial_weight: 0, initial_bias: 0, clusters: 2, iterations: 12, seed: 0 },
};

export function KMeansComparison() {
      const [runA, setRunA] = useState<TrainingRun | null>(null);
      const [runB, setRunB] = useState<TrainingRun | null>(null);
      const [clustersA, setClustersA] = useState(2);
      const [clustersB, setClustersB] = useState(3);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState<string | null>(null);

      const comparison = useMemo(
            () => (runA && runB ? { runA, runB, sharedStepCount: Math.min(runA.history.length, runB.history.length) } : null),
            [runA, runB],
      );
      const comparisonInsights = useMemo(
            () => (runA && runB ? generateComparisonInsights(runA, runB) : []),
            [runA, runB],
      );
      const timeline = useTrainingTimeline(runA, comparison?.sharedStepCount);
      const stateA = timeline.selectedTrainingState;
      const stateB = comparison?.runB.history[timeline.currentStep] ?? null;

      const trainComparison = useCallback(async (nextA: number, nextB: number) => {
            setLoading(true);
            setError(null);
            try {
                  const [nextRunA, nextRunB] = await Promise.all([
                        createTrainingRun(makeRequest(nextA)),
                        createTrainingRun(makeRequest(nextB)),
                  ]);
                  setRunA(nextRunA);
                  setRunB(nextRunB);
            } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "The comparison could not be trained.");
            } finally {
                  setLoading(false);
            }
      }, []);

      useEffect(() => {
            const timer = window.setTimeout(() => void trainComparison(2, 3), 0);
            return () => window.clearTimeout(timer);
      }, [trainComparison]);

      const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void trainComparison(clustersA, clustersB);
      };

      return (
            <div className="lab-layout comparison-lab">
                  <section className="lab-intro comparison-intro">
                        <div className="lab-intro-copy">
                              <p className="eyebrow">Lab 03 / shared cluster review</p>
                              <h1>Two clustering strategies. One clock.</h1>
                              <p>Compare how different cluster counts produce different partitions, centroid movement, and inertia curves.</p>
                        </div>
                        <form className="comparison-form" onSubmit={submit}>
                              <div className="form-heading"><div><p className="eyebrow">Comparison setup</p><h2>Choose cluster counts</h2></div><span className="run-status">{loading ? "Training" : comparison ? "Ready" : "Waiting"}</span></div>
                              <NumberControl label="Run A clusters" value={clustersA} onChange={setClustersA} />
                              <NumberControl label="Run B clusters" value={clustersB} onChange={setClustersB} />
                              <button className="primary-button run-button" disabled={loading} type="submit">{loading ? "Training comparison..." : "Train comparison"}</button>
                        </form>
                  </section>

                  {error && <section className="lab-alert" role="alert">{error}</section>}
                  {!loading && comparison && (
                        <>
                              <div className="comparison-context"><strong>Shared step: {timeline.currentStep}</strong><span>Shared range: 0-{Math.max(comparison.sharedStepCount - 1, 0)}</span></div>
                              <section className="comparison-grid">
                                    <ComparisonPanel label="Run A" run={comparison.runA} state={stateA} currentStep={timeline.currentStep} />
                                    <ComparisonPanel label="Run B" run={comparison.runB} state={stateB} currentStep={timeline.currentStep} />
                              </section>
                              <KMeansDifferencePanel stateA={stateA} stateB={stateB} />
                              <ComparisonInsights insights={comparisonInsights} />
                              <TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={[]} onAddMarker={() => undefined} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={() => undefined} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={comparison.sharedStepCount} />
                        </>
                  )}
            </div>
      );
}

function makeRequest(clusters: number): TrainingRunRequest {
      return { ...baseRequest, training: { ...baseRequest.training, clusters } };
}

function NumberControl({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
      return <label className="number-control"><span>{label}</span><input max="6" min="2" onChange={(event) => onChange(Number(event.target.value))} required step="1" type="number" value={value} /></label>;
}

function ComparisonPanel({ label, run, state, currentStep }: { label: string; run: TrainingRun; state: TrainingRun["history"][number] | null; currentStep: number }) {
      return (
            <section className="comparison-run-panel">
                  <div className="comparison-run-heading">
                        <div><p className="eyebrow">{label}</p><h2>{run.training.clusters ?? 0} clusters</h2></div>
                        <span>{run.history.length} frames</span>
                  </div>
                  <div className="comparison-charts">
                        <KMeansPlot points={run.dataset_points} state={state} />
                        <LossChart currentStep={currentStep} history={run.history} label="Inertia" />
                  </div>
                  <div className="comparison-state">
                        <h3>{state ? `Step ${state.step}` : "No state available"}</h3>
                        {state && (
                              <dl className="comparison-metrics">
                                    <div><dt>Inertia</dt><dd>{state.inertia?.toLocaleString(undefined, { maximumFractionDigits: 5 }) ?? (state.loss ?? 0).toLocaleString(undefined, { maximumFractionDigits: 5 })}</dd></div>
                                    <div><dt>Clusters</dt><dd>{state.centroids?.length ?? 0}</dd></div>
                              </dl>
                        )}
                  </div>
            </section>
      );
}

function KMeansPlot({ points, state }: { points: TrainingRun["dataset_points"]; state: TrainingRun["history"][number] | null }) {
      if (!state || points.length === 0) return <div className="lab-chart empty-chart">No cluster state available to plot yet.</div>;
      const width = 640; const height = 340; const pad = 36;
      const xs = points.map((point) => point.x ?? 0);
      const ys = points.map((point) => point.y ?? 0);
      const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
      const x = (value: number) => pad + ((value - minX) / (maxX - minX || 1)) * (width - pad * 2);
      const y = (value: number) => height - pad - ((value - minY) / (maxY - minY || 1)) * (height - pad * 2);
      const palette = ["#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#f97316"];

      return (
            <figure className="lab-chart">
                  <figcaption>Cluster comparison <span>step {state.step}</span></figcaption>
                  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Cluster comparison plot">
                        <line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
                        <line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />
                        {points.map((point, index) => (
                              <circle
                                    key={`${point.x}-${point.y}-${index}`}
                                    cx={x(point.x ?? 0)}
                                    cy={y(point.y ?? 0)}
                                    fill={palette[(state.cluster_assignments?.[index] ?? 0) % palette.length]}
                                    r="4"
                              />
                        ))}
                        {(state.centroids ?? []).map((centroid, index) => (
                              <circle key={`centroid-${index}`} cx={x(centroid[0])} cy={y(centroid[1])} fill="#0f172a" r="6" stroke="#ffffff" strokeWidth={2} />
                        ))}
                  </svg>
                  <p>Cluster membership and centroid locations are compared at the same frame across both runs.</p>
            </figure>
      );
}

function KMeansDifferencePanel({
      stateA,
      stateB,
}: {
      stateA: TrainingRun["history"][number] | null;
      stateB: TrainingRun["history"][number] | null;
}) {
      const inertiaA = stateA ? (stateA.inertia ?? stateA.loss) : null;
      const inertiaB = stateB ? (stateB.inertia ?? stateB.loss) : null;
      const clustersA = stateA?.centroids?.length ?? 0;
      const clustersB = stateB?.centroids?.length ?? 0;

      return (
            <section className="difference-panel" aria-label="K-Means metric differences">
                  <div>
                        <p className="eyebrow">Run B - Run A</p>
                        <h2>Current differences</h2>
                  </div>
                  {stateA && stateB && inertiaA !== null && inertiaB !== null ? (
                        <dl>
                              <Difference label="Inertia difference" value={inertiaB - inertiaA} />
                              <Difference label="Cluster count difference" value={clustersB - clustersA} />
                        </dl>
                  ) : (
                        <p className="empty-state">Both runs need a selected state to compare.</p>
                  )}
            </section>
      );
}

function Difference({ label, value }: { label: string; value: number }) {
      return (
            <div>
                  <dt>{label}</dt>
                  <dd className={value < 0 ? "difference-lower" : value > 0 ? "difference-higher" : ""}>
                        {value >= 0 ? "+" : ""}
                        {value.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </dd>
            </div>
      );
}
