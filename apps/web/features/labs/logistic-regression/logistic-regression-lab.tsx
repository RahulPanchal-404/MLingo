"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import { ClassificationPlot } from "@/features/labs/logistic-regression/classification-plot";
import { LogisticCodeMode } from "@/features/labs/logistic-regression/code-mode";
import { LogisticMathMode } from "@/features/labs/logistic-regression/math-mode";
import { MarkerForm } from "@/features/timeline/marker-form";
import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import { generateTrainingInsights } from "@/features/insights/engine";
import { TrainingInsights } from "@/features/insights/training-insights";
import { ModelXRay } from "@/features/x-ray/model-x-ray";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import { consumeLabHandoffRun } from "@/features/experiments/experiment-storage";
import type { TimelineMarker } from "@/features/timeline/types";

const defaultRequest: TrainingRunRequest = { algorithm: "logistic_regression", dataset: { samples: 64, noise: 0.1, seed: 0 }, training: { learning_rate: 0.2, epochs: 50, initial_weight: 0, initial_bias: 0 } };

export function LogisticRegressionLab() {
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
      const diagnostics = run ? analyzeTrainingRun(run) : [];
      const insights = run ? generateTrainingInsights(run, diagnostics) : [];

      const requestTraining = useCallback(async (nextRequest: TrainingRunRequest) => {
            setLoading(true); setError(null); setRun(null);
            setUserMarkers([]); setIsMarkerFormOpen(false);
            try { setRun(await createTrainingRun(nextRequest)); } catch (caught) { setError(caught instanceof Error ? caught.message : "Training could not start."); } finally { setLoading(false); }
      }, []);

      useEffect(() => {
            const timer = window.setTimeout(() => {
                  const handoff = consumeLabHandoffRun();
                  if (handoff && handoff.algorithm.toLowerCase().startsWith("logistic")) {
                        setRequest({ algorithm: "logistic_regression", dataset: handoff.dataset, training: handoff.training });
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
            recordLearningActivity({ labsExplored: readLearningActivity().labsExplored + 1 });
            recordRunConcepts(["Logistic Regression", "Sigmoid", "Probability", "Binary Cross-Entropy", "Decision Boundary"]);
      }, [run]);

      const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); void requestTraining(request); };
      const updateDataset = (key: "samples" | "noise", value: number) => setRequest((current) => ({ ...current, dataset: { ...current.dataset, [key]: key === "samples" ? Math.round(value) : value } }));
      const updateTraining = (key: "learning_rate" | "epochs", value: number) => setRequest((current) => ({ ...current, training: { ...current.training, [key]: key === "epochs" ? Math.round(value) : value } }));
      const eventMarkers = run ? diagnosticEventsToTimelineMarkers(diagnostics) : [];
      const markers = [...eventMarkers, ...userMarkers];
      const saveMarker = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const title = markerTitle.trim(); if (!title || !run) return; setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]); setMarkerTitle(""); setMarkerDescription(""); setIsMarkerFormOpen(false); };

      return <div className="lab-layout">
            <section className="lab-intro"><div className="lab-intro-copy"><p className="eyebrow">Lab 02 / classification</p><h1>Logistic regression, frame by frame.</h1><p>Watch probabilities become a decision boundary as a real classifier learns from two classes.</p></div><form className="training-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">Experiment setup</p><h2>Record a classification run</h2></div><span className="run-status">{loading ? "Recording" : run ? "Ready" : "Waiting"}</span></div><NumberControl label="Learning rate" max="2" min="0.001" step="0.001" value={request.training.learning_rate} onChange={(value) => updateTraining("learning_rate", value)} /><NumberControl label="Epochs" max="300" min="1" step="1" value={request.training.epochs} onChange={(value) => updateTraining("epochs", value)} /><NumberControl label="Samples" max="200" min="2" step="2" value={request.dataset.samples} onChange={(value) => updateDataset("samples", value)} /><NumberControl label="Noise" max="1" min="0.01" step="0.01" value={request.dataset.noise} onChange={(value) => updateDataset("noise", value)} /><button className="primary-button run-button" disabled={loading} type="submit">{loading ? "Recording run..." : "Run training"}</button></form></section>
            <div className="lab-secondary-action">
                  <span>Want to save or compare classifiers?</span>
                  <div className="lab-action-group">
                        <SaveExperimentButton run={run} />
                        <Link className="secondary-button" href="/labs/logistic-regression/compare">Compare logistic runs</Link>
                  </div>
            </div>
            {error && <section className="lab-alert" role="alert"><strong>Training could not be recorded.</strong><span>{error}</span></section>}
            {loading && <section className="lab-loading" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><div><strong>Recording the classification run</strong><p>Generating two classes and capturing every update.</p></div></section>}
            {!loading && !error && run && <><section className="visual-grid" aria-label="Logistic regression visualizations"><ClassificationPlot points={run.dataset_points} state={state} /><LossChart currentStep={timeline.currentStep} history={run.history} label="Binary Cross-Entropy" /></section><ModelXRay currentStep={timeline.currentStep} run={run} state={state} /><section className="learning-modes-grid" aria-label="Selected logistic frame learning modes"><LogisticMathMode learningRate={run.training.learning_rate} state={state} /><LogisticCodeMode learningRate={run.training.learning_rate} state={state} /></section><TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} run={run} state={state} /><TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />{isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}<TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={markers} onAddMarker={() => setIsMarkerFormOpen(true)} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={timeline.totalSteps} /></>}
      </div>;
}

function NumberControl({ label, min, max, step, value, onChange }: { label: string; min: string; max: string; step: string; value: number; onChange: (value: number) => void }) { return <label className="number-control"><span>{label}</span><input aria-label={label} max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} required step={step} type="number" value={value} /></label>; }