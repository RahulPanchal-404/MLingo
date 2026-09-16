"use client";

import Link from "next/link";
import { useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const defaultRequest: TrainingRunRequest = { algorithm: "linear_regression", dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 }, training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 } };

export function ExperimentWorkspace() {
      const [request, setRequest] = useState(defaultRequest);
      const [run, setRun] = useState<TrainingRun | null>(null);
      const [error, setError] = useState<string | null>(null);
      const [loading, setLoading] = useState(false);
      const timeline = useTrainingTimeline(run);
      const diagnostics = run ? analyzeTrainingRun(run) : [];
      const state = timeline.selectedTrainingState;

      const updateTraining = (key: "learning_rate" | "epochs", value: number) => setRequest((current) => ({ ...current, training: { ...current.training, [key]: key === "epochs" ? Math.round(value) : value } }));
      const updateDataset = (key: "samples" | "noise", value: number) => setRequest((current) => ({ ...current, dataset: { ...current.dataset, [key]: key === "samples" ? Math.round(value) : value } }));
      const runExperiment = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); setLoading(true); setError(null);
            try {
                  const nextRun = await createTrainingRun(request); setRun(nextRun);
                  recordLearningActivity({ experimentsRun: readLearningActivity().experimentsRun + 1 });
                  recordRunConcepts(["Gradient Descent", "Loss", "Learning Rate"]);
            } catch (caught) { setError(caught instanceof Error ? caught.message : "The experiment could not be trained."); } finally { setLoading(false); }
      };

      return <div className="experiment-workspace">
            <section className="workspace-heading"><div><p className="eyebrow">Experiments / recorded runs</p><h1>Build an experiment.</h1><p>Change the setup, run the real training engine, and inspect the recorded result frame by frame.</p></div><Link className="secondary-button" href="/labs/gradient-descent/compare">Compare runs</Link></section>
            <form className="experiment-form" onSubmit={runExperiment}><div className="experiment-form-heading"><div><p className="eyebrow">Linear regression</p><h2>Training configuration</h2></div><span>{loading ? "Running" : "Ready"}</span></div><NumberControl label="Learning rate" max="1.30" min="0.001" step="0.001" value={request.training.learning_rate} onChange={(value) => updateTraining("learning_rate", value)} /><NumberControl label="Epochs" max="300" min="1" step="1" value={request.training.epochs} onChange={(value) => updateTraining("epochs", value)} /><NumberControl label="Samples" max="100" min="1" step="1" value={request.dataset.samples} onChange={(value) => updateDataset("samples", value)} /><NumberControl label="Noise" max="2" min="0" step="0.05" value={request.dataset.noise} onChange={(value) => updateDataset("noise", value)} /><button className="primary-button" disabled={loading} type="submit">{loading ? "Running experiment..." : "Run experiment"}</button></form>
            {error && <section className="lab-alert" role="alert"><strong>Experiment failed.</strong><span>{error}</span></section>}
            {run && <section className="recorded-experiment"><div className="recorded-heading"><div><p className="eyebrow">Recorded experiment</p><h2>{run.algorithm}</h2></div><span>{run.total_steps} steps</span></div><dl className="experiment-summary"><div><dt>Final loss</dt><dd>{formatNumber(run.history.at(-1)?.loss)}</dd></div><div><dt>Samples</dt><dd>{run.dataset.samples}</dd></div><div><dt>Learning rate</dt><dd>{run.training.learning_rate}</dd></div></dl><div className="visual-grid"><RegressionPlot points={run.dataset_points} state={state} /><LossChart currentStep={timeline.currentStep} history={run.history} /></div><TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} /><TimelineControls currentStep={timeline.currentStep} isPlaying={timeline.isPlaying} markers={[]} onAddMarker={() => undefined} onBackward={timeline.stepBackward} onForward={timeline.stepForward} onJump={timeline.jumpToStep} onPlayToggle={timeline.togglePlay} onRemoveMarker={() => undefined} onReset={timeline.reset} onSpeed={timeline.setPlaybackSpeed} playbackSpeed={timeline.playbackSpeed} reducedMotion={timeline.reducedMotion} totalSteps={timeline.totalSteps} /></section>}
      </div>;
}

function NumberControl({ label, min, max, step, value, onChange }: { label: string; min: string; max: string; step: string; value: number; onChange: (value: number) => void }) { return <label className="number-control"><span>{label}</span><input max={max} min={min} onChange={(event) => onChange(Number(event.target.value))} required step={step} type="number" value={value} /></label>; }
function formatNumber(value: number | undefined): string { return typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "N/A"; }