"use client";

import { useState } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import type { TrainingRun } from "@/types/training-run";

export type MilestoneTrainViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onSaveRunId: (runId: string) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneTrainView({
  project,
  state,
  onSaveRunId,
  onComplete,
  onBack,
}: MilestoneTrainViewProps) {
  const [trainingRun, setTrainingRun] = useState<TrainingRun | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const handleTrain = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let run: TrainingRun;
      if (project.type === "regression") {
        run = await createTrainingRun({
          algorithm: "linear_regression",
          dataset: {
            samples: 20,
            noise: 0.1,
            slope: 1.5,
            intercept: 2.0,
            seed: state.splitConfig.seed,
          },
          training: {
            learning_rate: 0.05,
            epochs: 40,
            initial_weight: 0,
            initial_bias: 0,
          },
        });
      } else if (project.type === "classification") {
        run = await createTrainingRun({
          algorithm: "logistic_regression",
          dataset: {
            samples: 20,
            noise: 0.1,
            slope: 1.2,
            intercept: -0.5,
            seed: state.splitConfig.seed,
          },
          training: {
            learning_rate: 0.1,
            epochs: 40,
            initial_weight: 0,
            initial_bias: 0,
          },
        });
      } else {
        run = await createTrainingRun({
          algorithm: "kmeans",
          dataset: {
            samples: 12,
            noise: 0.1,
            clusters: 3,
            iterations: 8,
            seed: state.splitConfig.seed,
          },
          training: {
            learning_rate: 0,
            epochs: 8,
            initial_weight: 0,
            initial_bias: 0,
            clusters: 3,
            iterations: 8,
          },
        });
      }

      setTrainingRun(run);
      setCurrentStep(run.history.length - 1);
      onSaveRunId(run.id);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Training failed. Please check if the MLingo FastAPI backend is running."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const activeState =
    trainingRun && trainingRun.history[currentStep] ? trainingRun.history[currentStep] : null;

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚡</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Live Gradient Optimization & Step Scrubbing
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Trigger a real optimization run on the MLingo backend. Observe loss decrease frame by frame,
              scrub through iterations, and inspect weight gradients and centroid movements at each step.
            </p>
          </div>
        </div>
      </div>

      {/* Train Launcher Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Execute Model Training: {project.modelName}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Backend ML engine computes exact gradients and records frame-by-frame telemetry.
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleTrain}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Optimizing in Engine..." : trainingRun ? "Re-Run Optimization ⟳" : "Start Real Training Run →"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <strong>Training Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Telemetry and Frame Scrubbing (when trained) */}
      {trainingRun && activeState && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                Run ID: {trainingRun.id}
              </span>
              <h4 className="text-base font-bold text-slate-900">
                Training Telemetry & Parameter Inspection
              </h4>
            </div>
            <div className="text-xs font-mono text-slate-500">
              Step {currentStep + 1} of {trainingRun.history.length}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Scrub Training Timeline:</span>
              <span className="font-mono font-bold text-teal-800">
                Frame {currentStep} (Epoch {Math.floor(currentStep / 2)})
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={trainingRun.history.length - 1}
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              className="w-full accent-teal-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Metrics & Parameters at Current Step */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-slate-500">
                {project.type === "clustering" ? "Inertia" : "Current Loss"}
              </span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {Number(activeState.loss).toFixed(4)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-slate-500">
                Weights / Centroids
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800 truncate">
                {activeState.weights && activeState.weights.length > 0
                  ? activeState.weights.map((w) => w.toFixed(3)).join(", ")
                  : activeState.centroids
                  ? `${activeState.centroids.length} centroids`
                  : "w = 0.00"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-slate-500">
                Bias / Movement
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800">
                {activeState.bias !== undefined ? activeState.bias.toFixed(3) : "—"}
              </p>
            </div>

            <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-teal-900">
                Gradients
              </span>
              <p className="mt-1 text-xs font-bold text-teal-950 truncate">
                {activeState.gradients && activeState.gradients.length > 0
                  ? activeState.gradients.map((g) => g.toFixed(3)).join(", ")
                  : "0.00"}
              </p>
            </div>
          </div>

          {/* Loss Convergence Summary */}
          <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700">
            <span className="font-bold text-slate-900 block mb-1">Convergence Telemetry Note:</span>
            <p>
              Started with initial loss of{" "}
              <strong>{Number(trainingRun.history[0]?.loss ?? 0).toFixed(4)}</strong>, decreasing to{" "}
              <strong>
                {Number(trainingRun.history[trainingRun.history.length - 1]?.loss ?? 0).toFixed(4)}
              </strong>{" "}
              over {trainingRun.total_steps} gradient steps. The parameter updates followed the negative gradient vector smoothly toward local convergence.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Model Selection
        </button>
        <button
          type="button"
          disabled={!trainingRun && !state.trainingRunId}
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40 transition-colors"
        >
          Training Inspected: Proceed to Experiment →
        </button>
      </div>
    </div>
  );
}
