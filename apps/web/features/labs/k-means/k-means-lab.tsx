"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { MarkerForm } from "@/features/timeline/marker-form";
import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import type { TimelineMarker } from "@/features/timeline/types";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import { KMeansMathMode } from "@/features/labs/k-means/math-mode";
import { KMeansCodeMode } from "@/features/labs/k-means/code-mode";
import { generateTrainingInsights } from "@/features/insights/engine";
import { TrainingInsights } from "@/features/insights/training-insights";
import { ModelXRay } from "@/features/x-ray/model-x-ray";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const defaultRequest: TrainingRunRequest = {
      algorithm: "kmeans",
      dataset: { samples: 60, noise: 0.1, seed: 0 },
      training: { learning_rate: 0.1, epochs: 12, initial_weight: 0, initial_bias: 0, clusters: 3, iterations: 12, seed: 0 },
};

export function KMeansLab() {
      const [request, setRequest] = useState(defaultRequest);
      const [run, setRun] = useState<TrainingRun | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(true);
      const [userMarkers, setUserMarkers] = useState<TimelineMarker[]>([]);
      const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
      const [markerTitle, setMarkerTitle] = useState("");
      const [markerDescription, setMarkerDescription] = useState("");
      const recordedRunId = useRef<string | null>(null);
      const timeline = useTrainingTimeline(run);
      const state = timeline.selectedTrainingState;
      const diagnostics = useMemo(() => (run ? analyzeTrainingRun(run) : []), [run]);
      const insights = useMemo(() => (run ? generateTrainingInsights(run, diagnostics) : []), [run, diagnostics]);

      const requestTraining = useCallback(async (nextRequest: TrainingRunRequest) => {
            setLoading(true);
            setError(null);
            setRun(null);
            setUserMarkers([]); setIsMarkerFormOpen(false);
            try {
                  const nextRun = await createTrainingRun(nextRequest);
                  setRun(nextRun);
            } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "Training could not start.");
            } finally {
                  setLoading(false);
            }
      }, []);

      useEffect(() => {
            const timer = window.setTimeout(() => void requestTraining(defaultRequest), 0);
            return () => window.clearTimeout(timer);
      }, [requestTraining]);

      useEffect(() => {
            if (!run || recordedRunId.current === run.id) return;
            recordedRunId.current = run.id;
            const activity = readLearningActivity();
            recordLearningActivity({ labsExplored: activity.labsExplored + 1 });
            recordRunConcepts(["K-Means", "Clustering", "Centroids", "Cluster Assignment", "Inertia", "Convergence"]);
      }, [run]);

      const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void requestTraining(request);
      };

      const updateDataset = (key: "samples" | "noise", value: number) => {
            setRequest((current) => ({ ...current, dataset: { ...current.dataset, [key]: key === "samples" ? Math.round(value) : value } }));
      };

      const updateTraining = (key: "clusters" | "iterations" | "seed", value: number) => {
            setRequest((current) => ({
                  ...current,
                  training: {
                        ...current.training,
                        [key]: key === "clusters" || key === "iterations" ? Math.round(value) : value,
                  },
            }));
      };
      const eventMarkers = run ? diagnosticEventsToTimelineMarkers(diagnostics) : [];
      const markers = [...eventMarkers, ...userMarkers];
      const saveMarker = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const title = markerTitle.trim(); if (!title || !run) return; setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]); setMarkerTitle(""); setMarkerDescription(""); setIsMarkerFormOpen(false); };

      return (
            <div className="lab-layout">
                  <section className="lab-intro">
                        <div className="lab-intro-copy">
                              <p className="eyebrow">Lab 03 / clustering</p>
                              <h1>K-Means, step by step.</h1>
                              <p>Watch a fixed dataset split into clusters as centroids move toward the densest regions.</p>
                        </div>
                        <form className="training-form" onSubmit={submit}>
                              <div className="form-heading">
                                    <div><p className="eyebrow">Experiment setup</p><h2>Record a clustering run</h2></div>
                                    <span className="run-status">{loading ? "Recording" : run ? "Ready" : "Waiting"}</span>
                              </div>
                              <NumberControl label="Samples" max="200" min="4" onChange={(value) => updateDataset("samples", value)} step="1" value={request.dataset.samples ?? 60} />
                              <NumberControl label="Noise" max="2" min="0" onChange={(value) => updateDataset("noise", value)} step="0.05" value={request.dataset.noise ?? 0.1} />
                              <NumberControl label="Clusters" max="6" min="2" onChange={(value) => updateTraining("clusters", value)} step="1" value={request.training.clusters ?? 3} />
                              <NumberControl label="Iterations" max="30" min="1" onChange={(value) => updateTraining("iterations", value)} step="1" value={request.training.iterations ?? 12} />
                              <NumberControl label="Seed" max="50" min="0" onChange={(value) => updateTraining("seed", value)} step="1" value={request.training.seed ?? 0} />
                              <button className="primary-button run-button" disabled={loading} type="submit">{loading ? "Recording run..." : "Run training"}</button>
                        </form>
                  </section>

                  <div className="lab-secondary-action">
                        <span>Compare or save your clustering run?</span>
                        <div className="lab-action-group">
                              <SaveExperimentButton run={run} />
                              <Link className="secondary-button" href="/labs/k-means/compare">Compare K-Means runs</Link>
                        </div>
                  </div>

                  {error && <section className="lab-alert" role="alert"><strong>Training could not be recorded.</strong><span>{error}</span></section>}
                  {loading && <section className="lab-loading" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><div><strong>Recording the clustering run</strong><p>Generating the dataset and capturing every assignment update.</p></div></section>}
                  {!loading && !error && run && (
                        <>
                              <section className="visual-grid" aria-label="K-Means visualizations">
                                    <KMeansPlot points={run.dataset_points} state={state} />
                                    <LossChart currentStep={timeline.currentStep} history={run.history} label="Inertia" />
                              </section>
                              <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />
                              <section className="learning-modes-grid" aria-label="Selected K-Means frame learning modes">
                                    <KMeansMathMode state={state} />
                                    <KMeansCodeMode state={state} />
                              </section>
                              <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} />
                              <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />
                              {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                              <TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={markers} onAddMarker={() => setIsMarkerFormOpen(true)} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={timeline.totalSteps} />
                        </>
                  )}
            </div>
      );
}

function NumberControl({ label, min, max, step, value, onChange }: { label: string; min: string; max: string; step: string; value: number; onChange: (value: number) => void }) {
      return <label className="number-control"><span>{label}</span><input aria-label={label} max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} required step={step} type="number" value={value} /></label>;
}

export function KMeansPlot({ points, state }: { points: TrainingRun["dataset_points"]; state: TrainingRun["history"][number] | null }) {
      if (!state || points.length === 0) return <div className="lab-chart empty-chart">No K-Means state is available to plot yet.</div>;
      const width = 640; const height = 340; const pad = 36;
      const xs = points.map((point) => point.x ?? 0);
      const ys = points.map((point) => point.y ?? 0);
      const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
      const makeX = (value: number) => pad + ((value - minX) / (maxX - minX || 1)) * (width - pad * 2);
      const makeY = (value: number) => height - pad - ((value - minY) / (maxY - minY || 1)) * (height - pad * 2);
      const assignmentColors = ["#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#0ea5e9", "#f97316"];

      return (
            <figure className="lab-chart">
                  <figcaption>Cluster assignments <span>step {state.step}</span></figcaption>
                  <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="K-Means cluster assignment and centroid plot">
                        <line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
                        <line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />
                        {points.map((point, index) => {
                              const cluster = state.cluster_assignments?.[index] ?? 0;
                              const color = assignmentColors[cluster % assignmentColors.length];
                              return <circle key={`${index}-${point.x}-${point.y}`} cx={makeX(point.x ?? 0)} cy={makeY(point.y ?? 0)} fill={color} r="4" />;
                        })}
                        {(state.centroids ?? []).map((centroid, index) => (
                              <g key={`centroid-${index}`}>
                                    <circle cx={makeX(centroid[0])} cy={makeY(centroid[1])} fill="rgba(15,23,42,0.9)" r="7" stroke="#ffffff" strokeWidth={2} />
                                    <text x={makeX(centroid[0]) + 10} y={makeY(centroid[1]) - 8} fontSize="12" fill="#0f172a">C{index + 1}</text>
                              </g>
                        ))}
                  </svg>
                  <p>Points stay fixed. Only cluster membership and centroid positions change across frames.</p>
            </figure>
      );
}
