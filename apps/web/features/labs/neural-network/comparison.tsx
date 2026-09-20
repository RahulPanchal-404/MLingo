"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { TimelineControls } from "@/features/labs/gradient-descent/timeline-controls";
import { DecisionSurfacePlot } from "./decision-surface-plot";
import { ComparisonInsights } from "@/features/insights/comparison-insights";
import { generateComparisonInsights } from "@/features/insights/engine";
import { getSavedExperimentById, useSavedExperiments } from "@/features/experiments/experiment-storage";
import { useTrainingTimeline } from "@/features/timeline/use-training-timeline";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

const baseRequest: TrainingRunRequest = {
  algorithm: "neural_network",
  dataset: { samples: 80, noise: 0.15, seed: 0 },
  training: { learning_rate: 0.3, epochs: 80, initial_weight: 0, initial_bias: 0, hidden_neurons: 3 },
};

export function NeuralNetworkComparison() {
  const [runA, setRunA] = useState<TrainingRun | null>(null);
  const [runB, setRunB] = useState<TrainingRun | null>(null);
  const [learningRateA, setLearningRateA] = useState(0.2);
  const [learningRateB, setLearningRateB] = useState(0.8);
  const [hiddenA, setHiddenA] = useState(2);
  const [hiddenB, setHiddenB] = useState(4);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const savedNeuralRuns = useSavedExperiments("neural");

  const sharedTotal = runA && runB ? Math.min(runA.history.length, runB.history.length) : undefined;
  const timeline = useTrainingTimeline(runA, sharedTotal);
  const stateA = timeline.selectedTrainingState;
  const stateB = runB?.history[timeline.currentStep] ?? null;

  const comparisonInsights = useMemo(
    () => (runA && runB ? generateComparisonInsights(runA, runB) : []),
    [runA, runB]
  );

  const trainComparison = useCallback(
    async (
      rateA: number,
      rateB: number,
      hA: number,
      hB: number,
      preloadedA?: TrainingRun,
      preloadedB?: TrainingRun
    ) => {
      setLoading(true);
      setError(null);
      try {
        const makeReq = (lr: number, hidden: number): TrainingRunRequest => ({
          ...baseRequest,
          training: { ...baseRequest.training, learning_rate: lr, hidden_neurons: hidden },
        });

        const [nextA, nextB] = await Promise.all([
          preloadedA ?? createTrainingRun(makeReq(rateA, hA)),
          preloadedB ?? createTrainingRun(makeReq(rateB, hB)),
        ]);
        setRunA(nextA);
        setRunB(nextB);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "The comparison could not be trained.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const loadAId = params.get("loadA") || params.get("experimentId");
        const loadBId = params.get("loadB");
        const savedA = loadAId ? getSavedExperimentById(loadAId) : null;
        const savedB = loadBId ? getSavedExperimentById(loadBId) : null;

        if (savedA && savedB) {
          const lrA = savedA.run.training.learning_rate;
          const lrB = savedB.run.training.learning_rate;
          const hA = savedA.run.training.hidden_neurons ?? 3;
          const hB = savedB.run.training.hidden_neurons ?? 3;
          setLearningRateA(lrA);
          setLearningRateB(lrB);
          setHiddenA(hA);
          setHiddenB(hB);
          void trainComparison(lrA, lrB, hA, hB, savedA.run, savedB.run);
          return;
        }

        if (savedA) {
          const lrA = savedA.run.training.learning_rate;
          const hA = savedA.run.training.hidden_neurons ?? 3;
          setLearningRateA(lrA);
          setHiddenA(hA);
          void trainComparison(lrA, 0.8, hA, 4, savedA.run);
          return;
        }
      }
      void trainComparison(0.2, 0.8, 2, 4);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [trainComparison]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void trainComparison(learningRateA, learningRateB, hiddenA, hiddenB);
  };

  return (
    <div className="lab-layout comparison-lab">
      <section className="lab-intro comparison-intro">
        <div className="lab-intro-copy">
          <p className="eyebrow">Lab 04 / Shared Neural Comparison</p>
          <h1>Two architectures. One clock.</h1>
          <p>
            Compare how different hidden capacities and learning rates shape decision boundaries on identical data.
          </p>
        </div>

        <form className="comparison-form" onSubmit={submit}>
          <div className="form-heading">
            <div>
              <p className="eyebrow">Comparison setup</p>
              <h2>Configure Run A & Run B</h2>
            </div>
            <span className="run-status">{loading ? "Recording" : "Ready"}</span>
          </div>

          <div className="dual-inputs-grid">
            <fieldset className="run-config-group">
              <legend>Run A</legend>
              <label className="number-control">
                <span>Hidden units</span>
                <select
                  value={hiddenA}
                  onChange={(e) => setHiddenA(Number(e.target.value))}
                  className="select-input"
                >
                  <option value={2}>2 neurons</option>
                  <option value={3}>3 neurons</option>
                  <option value={4}>4 neurons</option>
                </select>
              </label>
              <label className="number-control">
                <span>Learning rate (α)</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  max="2"
                  value={learningRateA}
                  onChange={(e) => setLearningRateA(Number(e.target.value))}
                />
              </label>
            </fieldset>

            <fieldset className="run-config-group">
              <legend>Run B</legend>
              <label className="number-control">
                <span>Hidden units</span>
                <select
                  value={hiddenB}
                  onChange={(e) => setHiddenB(Number(e.target.value))}
                  className="select-input"
                >
                  <option value={2}>2 neurons</option>
                  <option value={3}>3 neurons</option>
                  <option value={4}>4 neurons</option>
                </select>
              </label>
              <label className="number-control">
                <span>Learning rate (α)</span>
                <input
                  type="number"
                  step="0.05"
                  min="0.01"
                  max="2"
                  value={learningRateB}
                  onChange={(e) => setLearningRateB(Number(e.target.value))}
                />
              </label>
            </fieldset>
          </div>

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Recording both networks..." : "Compare networks"}
          </button>
        </form>
      </section>

      {savedNeuralRuns.length > 0 && (
        <section className="saved-presets-bar" aria-label="Load saved experiments into comparison">
          <span className="eyebrow">Load from My Experiments:</span>
          <div className="presets-list">
            {savedNeuralRuns.slice(0, 4).map((rec) => (
              <button
                key={rec.id}
                className="preset-chip"
                type="button"
                onClick={() => {
                  setLearningRateA(rec.run.training.learning_rate);
                  setHiddenA(rec.run.training.hidden_neurons ?? 3);
                  void trainComparison(
                    rec.run.training.learning_rate,
                    learningRateB,
                    rec.run.training.hidden_neurons ?? 3,
                    hiddenB,
                    rec.run
                  );
                }}
              >
                Set Run A: {rec.title}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && (
        <section className="lab-alert" role="alert">
          <strong>Comparison could not be trained.</strong>
          <span>{error}</span>
        </section>
      )}

      {loading && (
        <section className="lab-loading" aria-live="polite">
          <span className="loading-mark" aria-hidden="true" />
          <div>
            <strong>Recording both networks simultaneously</strong>
            <p>Training two distinct architectures across identical datasets...</p>
          </div>
        </section>
      )}

      {!loading && !error && runA && runB && (
        <>
          <div className="comparison-columns-grid">
            <div className="comparison-column">
              <div className="column-header">
                <span className="badge badge-a">Run A</span>
                <h3>
                  {hiddenA} hidden units (lr={learningRateA})
                </h3>
              </div>
              <DecisionSurfacePlot points={runA.dataset_points} state={stateA} />
              <LossChart currentStep={timeline.currentStep} history={runA.history} label="Run A BCE Loss" />
            </div>

            <div className="comparison-column">
              <div className="column-header">
                <span className="badge badge-b">Run B</span>
                <h3>
                  {hiddenB} hidden units (lr={learningRateB})
                </h3>
              </div>
              <DecisionSurfacePlot points={runB.dataset_points} state={stateB} />
              <LossChart currentStep={timeline.currentStep} history={runB.history} label="Run B BCE Loss" />
            </div>
          </div>

          <ComparisonInsights insights={comparisonInsights} />

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
        </>
      )}
    </div>
  );
}
