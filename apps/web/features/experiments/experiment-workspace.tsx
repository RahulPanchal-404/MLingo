"use client";

import Link from "next/link";
import { useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { ClassificationPlot } from "@/features/labs/logistic-regression/classification-plot";
import { KMeansPlot } from "@/features/labs/k-means/k-means-lab";
import { MathMode } from "@/features/labs/gradient-descent/math-mode";
import { CodeMode } from "@/features/labs/gradient-descent/code-mode";
import { LogisticCodeMode } from "@/features/labs/logistic-regression/code-mode";
import { LogisticMathMode } from "@/features/labs/logistic-regression/math-mode";
import { KMeansMathMode } from "@/features/labs/k-means/math-mode";
import { KMeansCodeMode } from "@/features/labs/k-means/code-mode";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { TrainingSignals } from "@/features/diagnostics/training-signals";
import { TrainingInsights } from "@/features/insights/training-insights";
import { generateTrainingInsights } from "@/features/insights/engine";
import { analyzeTrainingRun } from "@/features/diagnostics/engine";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import { readLearningActivity, recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import { ModelXRay } from "@/features/x-ray/model-x-ray";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import { setLabHandoffRun } from "@/features/experiments/experiment-storage";
import { MyExperimentsList } from "@/features/experiments/my-experiments-list";
import { ExperimentExplorer } from "@/features/experiments/explorer/experiment-explorer";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const defaultRequest: TrainingRunRequest = {
  algorithm: "linear_regression",
  dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
  training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 },
};

export function ExperimentWorkspace() {
  const [request, setRequest] = useState(defaultRequest);
  const [run, setRun] = useState<TrainingRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const timeline = useTrainingTimeline(run);
  const diagnostics = run ? analyzeTrainingRun(run) : [];
  const insights = run ? generateTrainingInsights(run, diagnostics) : [];
  const state = timeline.selectedTrainingState;

  const updateTraining = (key: "learning_rate" | "epochs" | "clusters" | "iterations" | "seed", value: number) => {
    setRequest((current) => ({
      ...current,
      training: {
        ...current.training,
        [key]: key === "learning_rate" ? value : Math.round(value),
      },
    }));
  };

  const updateDataset = (key: "samples" | "noise", value: number) => {
    setRequest((current) => ({
      ...current,
      dataset: {
        ...current.dataset,
        [key]: key === "samples" ? Math.round(value) : value,
      },
    }));
  };

  const selectAlgorithm = (algorithm: TrainingRunRequest["algorithm"]) => {
    if (algorithm === "logistic_regression") {
      setRequest({
        algorithm,
        dataset: { samples: 64, noise: 0.1, seed: 0 },
        training: { learning_rate: 0.2, epochs: 50, initial_weight: 0, initial_bias: 0 },
      });
    } else if (algorithm === "kmeans") {
      setRequest({
        algorithm,
        dataset: { samples: 60, noise: 0.1, seed: 0 },
        training: { learning_rate: 0.1, epochs: 12, initial_weight: 0, initial_bias: 0, clusters: 3, iterations: 12, seed: 0 },
      });
    } else {
      setRequest({
        algorithm: "linear_regression",
        dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
        training: { learning_rate: 0.1, epochs: 50, initial_weight: 0, initial_bias: 0 },
      });
    }
  };

  const runExperiment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const nextRun = await createTrainingRun(request);
      setRun(nextRun);
      recordLearningActivity({ experimentsRun: readLearningActivity().experimentsRun + 1 });
      recordRunConcepts(
        request.algorithm === "logistic_regression"
          ? ["Logistic Regression", "Sigmoid", "Probability", "Binary Cross-Entropy", "Decision Boundary"]
          : request.algorithm === "kmeans"
          ? ["K-Means", "Clustering", "Centroids", "Inertia"]
          : ["Gradient Descent", "Loss", "Learning Rate"]
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The experiment could not be trained.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="experiment-workspace">
      <section className="workspace-heading">
        <div>
          <p className="eyebrow">Experiments / recorded runs</p>
          <h1>Build an experiment.</h1>
          <p>Configure parameters, record real model updates, and inspect the run frame by frame.</p>
        </div>
        <Link className="secondary-button" href="/labs/gradient-descent/compare">
          Compare runs
        </Link>
      </section>

      <form className="experiment-form" onSubmit={runExperiment}>
        <div className="experiment-form-heading">
          <div>
            <p className="eyebrow">Algorithm-aware workspace</p>
            <h2>Single run configuration</h2>
          </div>
          <span>{loading ? "Running" : "Ready"}</span>
        </div>

        <label className="number-control">
          <span>Algorithm</span>
          <select
            aria-label="Algorithm"
            onChange={(event) => selectAlgorithm(event.target.value as TrainingRunRequest["algorithm"])}
            value={request.algorithm}
          >
            <option value="linear_regression">Linear Regression</option>
            <option value="logistic_regression">Logistic Regression</option>
            <option value="kmeans">K-Means</option>
          </select>
        </label>

        {request.algorithm === "kmeans" ? (
          <>
            <NumberControl
              label="Clusters"
              max="6"
              min="2"
              step="1"
              value={request.training.clusters ?? 3}
              onChange={(value) => updateTraining("clusters", value)}
            />
            <NumberControl
              label="Iterations"
              max="30"
              min="1"
              step="1"
              value={request.training.iterations ?? 12}
              onChange={(value) => updateTraining("iterations", value)}
            />
            <NumberControl
              label="Seed"
              max="50"
              min="0"
              step="1"
              value={request.training.seed ?? 0}
              onChange={(value) => updateTraining("seed", value)}
            />
          </>
        ) : (
          <>
            <NumberControl
              label="Learning rate"
              max="2"
              min="0.001"
              step="0.001"
              value={request.training.learning_rate}
              onChange={(value) => updateTraining("learning_rate", value)}
            />
            <NumberControl
              label="Epochs"
              max="300"
              min="1"
              step="1"
              value={request.training.epochs}
              onChange={(value) => updateTraining("epochs", value)}
            />
          </>
        )}

        <NumberControl
          label="Samples"
          max="200"
          min="2"
          step="2"
          value={request.dataset.samples}
          onChange={(value) => updateDataset("samples", value)}
        />
        <NumberControl
          label="Noise"
          max="2"
          min="0"
          step="0.05"
          value={request.dataset.noise}
          onChange={(value) => updateDataset("noise", value)}
        />

        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Running experiment..." : "Run experiment"}
        </button>
      </form>

      {error && (
        <section className="lab-alert" role="alert">
          <strong>Experiment failed.</strong>
          <span>{error}</span>
        </section>
      )}

      {run && (
        <section className="recorded-experiment">
          <div className="recorded-heading">
            <div>
              <p className="eyebrow">Recorded experiment</p>
              <h2>{run.algorithm}</h2>
            </div>
            <div className="recorded-heading-actions">
              <SaveExperimentButton run={run} />
              <Link
                className="secondary-button lab-handoff-link"
                href={
                  run.algorithm.startsWith("logistic")
                    ? "/labs/logistic-regression"
                    : run.algorithm === "kmeans"
                    ? "/labs/k-means"
                    : "/labs/gradient-descent"
                }
                onClick={() => setLabHandoffRun(run)}
                title="Open this recorded run in the algorithm lab without re-running training"
              >
                Open in Lab →
              </Link>
              <span>{run.total_steps} steps</span>
            </div>
          </div>

          <dl className="experiment-summary">
            <div>
              <dt>Final loss / metric</dt>
              <dd>{formatNumber(run.history.at(-1)?.loss)}</dd>
            </div>
            <div>
              <dt>Samples</dt>
              <dd>{run.dataset.samples}</dd>
            </div>
            <div>
              <dt>Training control</dt>
              <dd>
                {run.algorithm === "kmeans"
                  ? `${run.training.iterations ?? run.total_steps} iterations, k=${run.training.clusters ?? 3}`
                  : `Learning rate ${run.training.learning_rate}, ${run.training.epochs} epochs`}
              </dd>
            </div>
          </dl>

          <div className="visual-grid">
            {run.algorithm.startsWith("logistic") ? (
              <ClassificationPlot points={run.dataset_points} state={state} />
            ) : run.algorithm === "kmeans" ? (
              <KMeansPlot points={run.dataset_points} state={state} />
            ) : (
              <RegressionPlot points={run.dataset_points} state={state} />
            )}
            <LossChart
              currentStep={timeline.currentStep}
              history={run.history}
              label={
                run.algorithm.startsWith("logistic")
                  ? "Binary Cross-Entropy"
                  : run.algorithm === "kmeans"
                  ? "Inertia"
                  : "MSE"
              }
            />
          </div>

          <ModelXRay currentStep={timeline.currentStep} run={run} state={state} />

          <section className="learning-modes-grid" aria-label="Selected frame learning modes">
            {run.algorithm.startsWith("logistic") ? (
              <>
                <LogisticMathMode learningRate={run.training.learning_rate} state={state} />
                <LogisticCodeMode learningRate={run.training.learning_rate} state={state} />
              </>
            ) : run.algorithm === "kmeans" ? (
              <>
                <KMeansMathMode state={state} />
                <KMeansCodeMode state={state} />
              </>
            ) : (
              <>
                <MathMode learningRate={run.training.learning_rate} state={state} />
                <CodeMode learningRate={run.training.learning_rate} state={state} />
              </>
            )}
          </section>

          <TrainingSignals events={diagnostics} onSelect={timeline.jumpToStep} />
          <TrainingInsights insights={insights} onSelectStep={timeline.jumpToStep} />

          <TimelineControls
            currentStep={timeline.currentStep}
            isPlaying={timeline.isPlaying}
            markers={[]}
            onAddMarker={() => undefined}
            onBackward={timeline.stepBackward}
            onForward={timeline.stepForward}
            onJump={timeline.jumpToStep}
            onPlayToggle={timeline.togglePlay}
            onRemoveMarker={() => undefined}
            onReset={timeline.reset}
            onSpeed={timeline.setPlaybackSpeed}
            playbackSpeed={timeline.playbackSpeed}
            reducedMotion={timeline.reducedMotion}
            totalSteps={timeline.totalSteps}
          />
        </section>
      )}

      <ExperimentExplorer
        onInspectRun={(inspectedRun) => {
          setRun(inspectedRun);
          timeline.jumpToStep(0);
        }}
        inspectedRunId={run?.id}
      />

      <MyExperimentsList
        activeRunId={run?.id}
        onReplayRun={(savedRun) => {
          setRun(savedRun);
          timeline.jumpToStep(0);
        }}
      />
    </div>
  );
}

function NumberControl({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  min: string;
  max: string;
  step: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="number-control">
      <span>{label}</span>
      <input
        max={max}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        required
        step={step}
        type="number"
        value={value}
      />
    </label>
  );
}

function formatNumber(value: number | undefined): string {
  return typeof value === "number" ? value.toLocaleString(undefined, { maximumFractionDigits: 5 }) : "N/A";
}