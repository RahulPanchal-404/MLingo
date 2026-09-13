"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { ComparisonRunPanel } from "@/features/labs/gradient-descent/comparison-run-panel";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { createRunComparison } from "@/features/comparison/types";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { diagnosticEventsToTimelineMarkers } from "@/features/timeline/event-markers";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TimelineMarker } from "@/features/timeline/types";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const defaultRunA: TrainingRunRequest = {
      algorithm: "linear_regression",
      dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
      training: { learning_rate: 0.001, epochs: 50, initial_weight: 0, initial_bias: 0 },
};
const defaultRunB: TrainingRunRequest = {
      ...defaultRunA,
      training: { ...defaultRunA.training, learning_rate: 0.01 },
};

type LoadingStage = "a" | "b" | null;

export function GradientDescentComparison() {
      const [configurationA, setConfigurationA] = useState(defaultRunA);
      const [configurationB, setConfigurationB] = useState(defaultRunB);
      const [runA, setRunA] = useState<TrainingRun | null>(null);
      const [runB, setRunB] = useState<TrainingRun | null>(null);
      const [loadingStage, setLoadingStage] = useState<LoadingStage>("a");
      const [error, setError] = useState<string | null>(null);
      const [userMarkers, setUserMarkers] = useState<TimelineMarker[]>([]);
      const [isMarkerFormOpen, setIsMarkerFormOpen] = useState(false);
      const [markerTitle, setMarkerTitle] = useState("");
      const [markerDescription, setMarkerDescription] = useState("");
      const comparison = useMemo(() => runA && runB ? createRunComparison(runA, runB) : null, [runA, runB]);
      const timeline = useTrainingTimeline(runA, comparison?.sharedStepCount);
      const stateA = timeline.selectedTrainingState;
      const stateB = comparison?.runB.history[timeline.currentStep] ?? null;
      const diagnosticsA = useMemo(() => runA ? analyzeTrainingRun(runA) : [], [runA]);
      const eventMarkers = useMemo(() => diagnosticEventsToTimelineMarkers(diagnosticsA).filter((marker) => marker.step < (comparison?.sharedStepCount ?? 0)), [diagnosticsA, comparison?.sharedStepCount]);
      const markers = [...eventMarkers, ...userMarkers];
      const isLoading = loadingStage !== null;

      const requestComparison = useCallback(async (requestA: TrainingRunRequest, requestB: TrainingRunRequest) => {
            setLoadingStage("a");
            setError(null);
            setRunA(null);
            setRunB(null);
            setUserMarkers([]);
            setIsMarkerFormOpen(false);
            try {
                  const nextRunA = await createTrainingRun(requestA);
                  setLoadingStage("b");
                  const nextRunB = await createTrainingRun(requestB);
                  setRunA(nextRunA);
                  setRunB(nextRunB);
            } catch (caught) {
                  setError(caught instanceof Error ? caught.message : "The comparison could not be trained.");
            } finally {
                  setLoadingStage(null);
            }
      }, []);

      useEffect(() => {
            const initialRequest = window.setTimeout(() => void requestComparison(defaultRunA, defaultRunB), 0);
            return () => window.clearTimeout(initialRequest);
      }, [requestComparison]);

      const submit = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void requestComparison(configurationA, configurationB);
      };

      const saveMarker = (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const title = markerTitle.trim();
            if (!title || !comparison) return;
            setUserMarkers((current) => [...current, { id: `user-${crypto.randomUUID()}`, step: timeline.currentStep, title, description: markerDescription.trim() || undefined, type: "user" }]);
            setMarkerTitle("");
            setMarkerDescription("");
            setIsMarkerFormOpen(false);
      };

      return (
            <div className="lab-layout comparison-lab">
                  <section className="lab-intro comparison-intro">
                        <div className="lab-intro-copy">
                              <p className="eyebrow">Lab 02 / shared review</p>
                              <h1>Two experiments. One clock.</h1>
                              <p>Train two real models, then review their recorded histories frame by frame with one shared playhead.</p>
                        </div>
                        <form className="comparison-form" onSubmit={submit}>
                              <div className="form-heading"><div><p className="eyebrow">Experiment setup</p><h2>Train a comparison</h2></div><span className="run-status">{isLoading ? `Run ${loadingStage?.toUpperCase()}` : comparison ? "Ready" : "Waiting"}</span></div>
                              <RunConfiguration label="Run A" configuration={configurationA} onChange={setConfigurationA} />
                              <RunConfiguration label="Run B" configuration={configurationB} onChange={setConfigurationB} />
                              <button className="primary-button run-button" disabled={isLoading} type="submit">{isLoading ? `Training Run ${loadingStage?.toUpperCase()}...` : "Train comparison"}</button>
                        </form>
                  </section>

                  {error && <section className="lab-alert" role="alert"><strong>Comparison could not be trained.</strong><span>{error}</span></section>}
                  {isLoading && <section className="lab-loading" aria-live="polite"><span className="loading-mark" aria-hidden="true" /><div><strong>{loadingStage === "a" ? "Training Run A" : "Training Run B"}</strong><p>The two runs are recorded through the existing training API.</p></div></section>}
                  {!isLoading && !error && comparison && (
                        <>
                              <div className="comparison-context"><strong>Shared step: {timeline.currentStep}</strong><span>Shared range: 0-{comparison.sharedStepCount}</span>{comparison.runA.history.length !== comparison.runB.history.length && <span>Comparison is limited to the shorter recorded history.</span>}</div>
                              <section className="comparison-grid" aria-label="Training run comparison">
                                    <ComparisonRunPanel currentStep={timeline.currentStep} label="Run A" run={comparison.runA} state={stateA} />
                                    <ComparisonRunPanel currentStep={timeline.currentStep} label="Run B" run={comparison.runB} state={stateB} />
                              </section>
                              <DifferencePanel stateA={stateA} stateB={stateB} />
                              {isMarkerFormOpen && <MarkerForm description={markerDescription} onCancel={() => setIsMarkerFormOpen(false)} onDescriptionChange={setMarkerDescription} onSave={saveMarker} title={markerTitle} onTitleChange={setMarkerTitle} step={timeline.currentStep + 1} />}
                              <TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={markers} onAddMarker={() => setIsMarkerFormOpen(true)} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={(id) => setUserMarkers((current) => current.filter((marker) => marker.id !== id))} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={comparison.sharedStepCount} />
                        </>
                  )}
            </div>
      );
}

function RunConfiguration({ label, configuration, onChange }: { label: string; configuration: TrainingRunRequest; onChange: (value: TrainingRunRequest) => void }) {
      const updateTraining = (key: "learning_rate" | "epochs", value: number) => onChange({ ...configuration, training: { ...configuration.training, [key]: key === "epochs" ? Math.round(value) : value } });
      const updateDataset = (key: "samples" | "noise", value: number) => onChange({ ...configuration, dataset: { ...configuration.dataset, [key]: key === "samples" ? Math.round(value) : value } });
      return <fieldset className="run-config"><legend>{label}</legend><NumberControl label={`${label} learning rate`} max="1" min="0.001" onChange={(value) => updateTraining("learning_rate", value)} step="0.001" value={configuration.training.learning_rate} /><NumberControl label={`${label} epochs`} max="300" min="1" onChange={(value) => updateTraining("epochs", value)} step="1" value={configuration.training.epochs} /><NumberControl label={`${label} samples`} max="100" min="1" onChange={(value) => updateDataset("samples", value)} step="1" value={configuration.dataset.samples} /><NumberControl label={`${label} noise`} max="2" min="0" onChange={(value) => updateDataset("noise", value)} step="0.05" value={configuration.dataset.noise} /></fieldset>;
}

function NumberControl({ label, min, max, step, value, onChange }: { label: string; min: string; max: string; step: string; value: number; onChange: (value: number) => void }) {
      return <label className="number-control"><span>{label}</span><input aria-label={label} max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} required step={step} type="number" value={value} /></label>;
}

function DifferencePanel({ stateA, stateB }: { stateA: TrainingRun["history"][number] | null; stateB: TrainingRun["history"][number] | null }) {
      return <section className="difference-panel" aria-label="Metric differences"><div><p className="eyebrow">Run B - Run A</p><h2>Current differences</h2></div>{stateA && stateB ? <dl><Difference label="Weight difference" value={(stateB.weights[0] ?? 0) - (stateA.weights[0] ?? 0)} /><Difference label="Bias difference" value={stateB.bias - stateA.bias} /><Difference label="Loss difference" value={stateB.loss - stateA.loss} /><Difference label="Gradient difference" value={(stateB.gradients[0] ?? 0) - (stateA.gradients[0] ?? 0)} /></dl> : <p className="empty-state">Both runs need a selected state to compare.</p>}</section>;
}

function Difference({ label, value }: { label: string; value: number }) {
      return <div><dt>{label}</dt><dd className={value < 0 ? "difference-lower" : value > 0 ? "difference-higher" : ""}>{value >= 0 ? "+" : ""}{value.toLocaleString(undefined, { maximumFractionDigits: 5 })}</dd></div>;
}

function MarkerForm({ step, title, description, onTitleChange, onDescriptionChange, onSave, onCancel }: { step: number; title: string; description: string; onTitleChange: (value: string) => void; onDescriptionChange: (value: string) => void; onSave: (event: FormEvent<HTMLFormElement>) => void; onCancel: () => void }) {
      return <section aria-label="Add timeline marker" className="marker-form"><div><p className="eyebrow">Frame {step}</p><h2>Add marker</h2></div><form onSubmit={onSave}><label>Title<input autoFocus onChange={(event) => onTitleChange(event.target.value)} required value={title} /></label><label>Description <span>(optional)</span><textarea onChange={(event) => onDescriptionChange(event.target.value)} value={description} /></label><div className="marker-form-actions"><button onClick={onCancel} type="button">Cancel</button><button className="primary-button" type="submit">Save marker</button></div></form></section>;
}
