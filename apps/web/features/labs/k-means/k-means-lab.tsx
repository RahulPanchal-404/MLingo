"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
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
import { consumeLabHandoffRun } from "@/features/experiments/experiment-storage";
import { recordLabVisit } from "@/features/progress/activity";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import { PersistentTimelineDock } from "@/features/timeline/persistent-timeline-dock";
import { LabLinks, LabSettings, LabWorkspace } from "@/features/labs/workspace/lab-workspace";
import { useTutor } from "@/features/tutor/tutor-provider";
import { buildDiagnosticTutorContext, buildTrainingTutorContext } from "@/features/tutor/tutor-context-builder";
import { BreakModePanel } from "@/features/challenges/break-mode-panel";
import type { BreakModeChallenge } from "@/features/challenges/types";

const defaultRequest: TrainingRunRequest = {
      algorithm: "kmeans",
      dataset: { samples: 60, noise: 0.6, seed: 0 },
      training: { learning_rate: 0.1, epochs: 12, initial_weight: 0, initial_bias: 0, clusters: 3, iterations: 12, seed: 2 },
};

type KMeansLabProps = { breakMode?: BreakModeChallenge };

export function KMeansLab({ breakMode }: KMeansLabProps = {}) {
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
      const { setTutorContext } = useTutor();

      useEffect(() => {
        if (run && state) {
          setTutorContext({
            route: "/labs/k-means",
            training: buildTrainingTutorContext(run, state, request.training.learning_rate),
            diagnostic: buildDiagnosticTutorContext(diagnostics[0] ?? null),
            project: null,
          });
        }
      }, [run, state, request.training.learning_rate, diagnostics, setTutorContext]);

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
            const timer = window.setTimeout(() => {
                  const handoff = consumeLabHandoffRun();
                  if (handoff && handoff.algorithm.toLowerCase().startsWith("kmeans")) {
                        setRequest({ algorithm: "kmeans", dataset: handoff.dataset, training: handoff.training });
                        setRun(handoff);
                        setLoading(false);
                        return;
                  }
                  void requestTraining(defaultRequest);
            }, 0);
            return () => window.clearTimeout(timer);
      }, [requestTraining]);

      useEffect(() => {
            if (!run || recordedRunId.current === run.id) return;
            recordedRunId.current = run.id;
            recordLabVisit("k-means", ["K-Means", "Clustering", "Centroids", "Cluster Assignment", "Inertia", "Convergence"]);
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
            <LabWorkspace
                  title="K-Means clustering"
                  summary="Unlabelled points are split into K groups. Each frame, every point joins its nearest centroid, then each centroid moves to the middle of its points."
                  actions={<><SaveExperimentButton run={run} /><Link className="secondary-button" href="/labs/k-means/compare">Compare runs</Link></>}
                  notices={breakMode ? <BreakModePanel challenge={breakMode} diagnostics={run ? diagnostics : null} markers={markers} run={run} /> : null}
                  status={{ loading, error, loadingText: "Clustering the points…" }}
                  settings={
                        <LabSettings onSubmit={submit} loading={loading} footer={<LabLinks theory="k-means" code="k-means" />} fields={[
                              { label: "Clusters (K)", value: request.training.clusters ?? 3, min: 2, max: 6, step: 1, onChange: (v) => updateTraining("clusters", v), hint: "How many groups to look for." },
                              { label: "Iterations", value: request.training.iterations ?? 12, min: 1, max: 30, step: 1, onChange: (v) => updateTraining("iterations", v) },
                              { label: "Start seed", value: request.training.seed ?? 0, min: 0, max: 50, step: 1, onChange: (v) => updateTraining("seed", v), hint: "Changes where the centroids start." },
                              { label: "Samples", value: request.dataset.samples ?? 60, min: 4, max: 200, step: 1, onChange: (v) => updateDataset("samples", v) },
                              { label: "Spread", value: request.dataset.noise ?? 0.1, min: 0, max: 2, step: 0.05, onChange: (v) => updateDataset("noise", v), hint: "Larger spread makes the groups overlap." },
                        ]} />
                  }
                  visuals={run ? <><KMeansPlot points={run.dataset_points} state={state} /><LossChart currentStep={timeline.currentStep} history={run.history} label="Inertia" /></> : undefined}
                  timeline={
                        <PersistentTimelineDock currentStep={timeline.currentStep} totalSteps={timeline.totalSteps} isPlaying={timeline.isPlaying} onPlayToggle={timeline.togglePlay} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onReset={timeline.reset} playbackSpeed={timeline.playbackSpeed} onSpeed={timeline.setPlaybackSpeed} markers={markers} lossValue={state?.loss} metricLabel="Inertia" onAddMarker={() => setIsMarkerFormOpen(true)} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} />
                  }
            >
                  {run && <>
                        {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                        <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />
                        <section className="learning-modes-grid" aria-label="Selected K-Means frame learning modes">
                              <KMeansMathMode state={state} />
                              <KMeansCodeMode state={state} />
                        </section>
                        <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} run={run} state={state} />
                        <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />
                  </>}
            </LabWorkspace>
      );
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
                                    <circle cx={makeX(centroid[0])} cy={makeY(centroid[1])} fill="var(--surface-elevated)" r="7" stroke="var(--foreground)" strokeWidth={2.5} />
                                    <text x={makeX(centroid[0]) + 10} y={makeY(centroid[1]) - 8} fontSize="12" fontWeight="700" fill="var(--foreground)">C{index + 1}</text>
                              </g>
                        ))}
                  </svg>
                  <p>Points stay fixed. Only cluster membership and centroid positions change across frames.</p>
            </figure>
      );
}
