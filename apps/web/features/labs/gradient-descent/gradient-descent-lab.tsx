"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { detectTrainingEventMarkers } from "@/features/timeline/event-markers";
import { getFrameChanges } from "@/features/timeline/frame-changes";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TimelineMarker } from "@/features/timeline/types";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const defaultRequest: TrainingRunRequest = {
      algorithm: "linear_regression",
      dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
      training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 },
};

export function GradientDescentLab() {
      const [configuration, setConfiguration] = useState(defaultRequest);
      const [run, setRun] = useState<TrainingRun | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [userMarkers, setUserMarkers] = useState<TimelineMarker[]>([]);
      const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
      const [markerTitle, setMarkerTitle] = useState("");
      const [markerDescription, setMarkerDescription] = useState("");
      const timeline = useTrainingTimeline(run);
      const state = timeline.selectedTrainingState;
      const frameChanges = getFrameChanges(run?.history ?? [], timeline.currentStep);
      const diagnostics = useMemo(() => run ? analyzeTrainingRun(run) : [], [run]);
      const eventMarkers = useMemo(() => detectTrainingEventMarkers(run), [run]);
      const markers = [...eventMarkers, ...userMarkers];

      const requestTraining = useCallback(async (request: TrainingRunRequest) => {
            setIsLoading(true);
            setError(null);
            setRun(null);
            setUserMarkers([]);
            setIsMarkerFormOpen(false);
            try {
                  setRun(await createTrainingRun(request));
            } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "Training could not start.");
            } finally {
                  setIsLoading(false);
            }
      }, []);

      useEffect(() => {
            const initialRequest = window.setTimeout(() => void requestTraining(defaultRequest), 0);
            return () => window.clearTimeout(initialRequest);
      }, [requestTraining]);

      const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void requestTraining(configuration);
      };

      const saveMarker = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const title = markerTitle.trim();
            if (!title || !run) return;
            setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]);
            setMarkerTitle("");
            setMarkerDescription("");
            setIsMarkerFormOpen(false);
      };

      return (
            <div className="lab-layout">
                  <section className="lab-intro">
                        <div className="lab-intro-copy">
                              <p className="eyebrow">Lab 01 / recorded training</p>
                              <h1>Gradient descent, frame by frame.</h1>
                              <p>Run one real linear model, then scrub its recorded states to see the fit, gradients, and loss change together.</p>
                        </div>
                        <form className="training-form" onSubmit={submit}>
                              <div className="form-heading"><div><p className="eyebrow">Experiment setup</p><h2>Record a new run</h2></div><span className="run-status">{isLoading ? "Recording" : run ? "Ready" : "Waiting"}</span></div>
                              <NumberControl label="Learning rate" max="1" min="0.001" onChange={(value) => setConfiguration((current) => ({ ...current, training: { ...current.training, learning_rate: value } }))} step="0.001" value={configuration.training.learning_rate} />
                              <NumberControl label="Epochs" max="300" min="1" onChange={(value) => setConfiguration((current) => ({ ...current, training: { ...current.training, epochs: Math.round(value) } }))} step="1" value={configuration.training.epochs} />
                              <NumberControl label="Samples" max="100" min="1" onChange={(value) => setConfiguration((current) => ({ ...current, dataset: { ...current.dataset, samples: Math.round(value) } }))} step="1" value={configuration.dataset.samples} />
                              <NumberControl label="Noise" max="2" min="0" onChange={(value) => setConfiguration((current) => ({ ...current, dataset: { ...current.dataset, noise: value } }))} step="0.05" value={configuration.dataset.noise} />
                              <button className="primary-button run-button" disabled={isLoading} type="submit">{isLoading ? "Recording run..." : "Run training"}</button>
                        </form>
                  </section>

                  <div className="lab-secondary-action"><span>Ready to inspect another experiment?</span><Link className="secondary-button" href="/labs/gradient-descent/compare">Compare training runs</Link></div>
                  {error && <section className="lab-alert" role="alert"><strong>Training could not be recorded.</strong><span>{error}</span></section>}
                  {isLoading && <section className="lab-loading" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><div><strong>Recording the training run</strong><p>Generating the dataset and capturing every update.</p></div></section>}
                  {!isLoading && !error && run && (
                        <>
                              <section className="visual-grid" aria-label="Training visualizations"><RegressionPlot points={run.dataset_points} state={state} /><LossChart currentStep={timeline.currentStep} history={run.history} /></section>
                              <section className="state-panel" aria-label="Selected training state">
                                    <div className="state-heading"><p className="eyebrow">Selected frame</p><h2>{state ? `Step ${state.step}` : "No state selected"}</h2><p>{state ? "The visualizations are reading this exact training snapshot." : "This run has no recorded states."}</p></div>
                                    {state ? <dl><Metric change={frameChanges?.weight} label="Weight" value={state.weights[0]} /><Metric change={frameChanges?.bias} label="Bias" value={state.bias} /><Metric change={frameChanges?.loss} label="Loss / MSE" value={state.metrics.mean_squared_error} /><Metric change={frameChanges?.gradient} label="Weight gradient" value={state.gradients[0]} /><Metric label="Bias gradient" value={state.bias_gradient} /></dl> : <p className="empty-state">There is no state to inspect yet.</p>}
                              </section>
                              <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} />
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

function Metric({ label, value, change }: { label: string; value: number | null | undefined; change?: number }) {
      return <div><dt>{label}</dt><dd>{formatNumber(value)}</dd><small>{change === undefined ? "No previous frame." : formatDelta(change)}</small></div>;
}

function formatNumber(value: number | null | undefined): string {
      if (value == null) return "N/A";
      return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
}

function formatDelta(value: number): string {
      return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}

function MarkerForm({ step, title, description, onTitleChange, onDescriptionChange, onSave, onCancel }: { step: number; title: string; description: string; onTitleChange: (value: string) => void; onDescriptionChange: (value: string) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
      return <section aria-label="Add timeline marker" className="marker-form"><div><p className="eyebrow">Frame {step}</p><h2>Add marker</h2></div><form onSubmit={onSave}><label>Title<input autoFocus onChange={(event) => onTitleChange(event.target.value)} required value={title} /></label><label>Description <span>(optional)</span><textarea onChange={(event) => onDescriptionChange(event.target.value)} value={description} /></label><div className="marker-form-actions"><button onClick={onCancel} type="button">Cancel</button><button className="primary-button" type="submit">Save marker</button></div></form></section>;
}
