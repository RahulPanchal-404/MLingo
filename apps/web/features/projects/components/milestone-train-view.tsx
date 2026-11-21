"use client";

import { useState } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import type { TrainingRun } from "@/types/training-run";
import { ProjectInteractiveDemo } from "./interactive-demos";
import { runProject } from "../engine";

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
  const [featureNames, setFeatureNames] = useState<string[]>([]);

  // Train on the project's own data, with the learner's split and preprocessing. This is the same run
  // the Evaluate and Interpret milestones report, so the numbers match end to end.
  const handleTrain = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { result, options, trainRaw, testRaw } = runProject(project, state);
      const frames = result.frames ?? [];
      const run: TrainingRun = {
        id: `project-${project.id}-seed${state.splitConfig.seed}-${project.type === "clustering" ? `k${options.clusters}` : `lr${options.learningRate}`}`,
        algorithm: project.modelName,
        dataset: { samples: trainRaw.length + testRaw.length, noise: 0, seed: state.splitConfig.seed },
        dataset_points: [],
        training: { learning_rate: options.learningRate ?? 0, epochs: frames.length - 1, initial_weight: 0, initial_bias: 0 },
        total_steps: frames.length,
        history: frames.map((fr) => ({
          step: fr.epoch,
          weights: fr.weights,
          bias: fr.bias,
          loss: fr.loss,
          gradients: fr.gradients,
          bias_gradient: fr.gradients.at(-1) ?? 0,
          predictions: [],
          metrics: {},
          centroids: fr.centroids?.map((c) => [c[0] ?? 0, c[1] ?? 0] as [number, number]),
        })),
        markers: [],
        metadata: { project: project.title, mode: "local_project_engine" },
      };
      setFeatureNames(result.featureNames ?? []);
      if (result.diverged) setError(`Training diverged at learning rate ${options.learningRate}: the loss grew instead of shrinking.`);
      setTrainingRun(run);
      setCurrentStep(run.history.length - 1);
      onSaveRunId(run.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Training failed.");
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
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Live Gradient Optimization & Step Scrubbing
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Train the model on this project&apos;s dataset with your split and preprocessing. Watch the loss
              fall epoch by epoch and inspect every weight and gradient. Evaluation uses this exact run.
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
              {project.type === "clustering"
                ? "K-Means on your training rows; every iteration is recorded."
                : "Full-batch gradient descent from zero weights; every epoch is recorded."}
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleTrain}
            className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isLoading ? "Optimizing in Engine..." : trainingRun ? "Re-Run Optimization ⟳" : "Start Real Training Run →"}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
            <strong>Training Note:</strong> {error}
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
              {trainingRun.history.length} snapshots: the starting state + {trainingRun.history.length - 1} {project.type === "clustering" ? "iterations" : "epochs"}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Scrub Training Timeline:</span>
              <span className="font-mono font-bold text-teal-800">
                {currentStep === 0 ? "Start (before any update)" : `${project.type === "clustering" ? "Iteration" : "Epoch"} ${currentStep} of ${trainingRun.history.length - 1}`}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={trainingRun.history.length - 1}
              value={currentStep}
              onChange={(e) => setCurrentStep(Number(e.target.value))}
              aria-label="Training timeline"
              className="w-full accent-teal-700 h-2 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Metrics & Parameters at Current Step */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-slate-500">
                {project.type === "clustering" ? "Inertia" : project.type === "classification" ? "Log loss" : "MSE loss"}
              </span>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {Number(activeState.loss).toFixed(4)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
              <span className="text-[10px] font-sans uppercase font-bold text-slate-500">
                Weights / Centroids
              </span>
              <p className="mt-1 text-xs font-bold text-slate-800 break-words">
                {activeState.weights && activeState.weights.length > 0
                  ? activeState.weights.map((w, j) => `${featureNames[j] ?? `w${j + 1}`} ${w.toFixed(3)}`).join(", ")
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
                {activeState.gradients && activeState.gradients.length > 0 && project.type !== "clustering"
                  ? activeState.gradients.map((g) => g.toFixed(3)).join(", ")
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Working Interactive Model Demonstration */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Live Model Demonstration & Hands-On Interface
          </span>
          <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
            Interactive ML Sandbox
          </span>
        </div>
        <p className="text-xs text-slate-500">
          Illustrative sandbox with its own hand-picked numbers so you can play with the idea. It is not the model you trained above.
        </p>
        <ProjectInteractiveDemo project={project} />
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          ← Back to Model Selection
        </button>
        <button
          type="button"
          disabled={!trainingRun && !state.trainingRunId}
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 disabled:opacity-40 transition-colors cursor-pointer"
        >
          Training Inspected: Proceed to Experiment →
        </button>
      </div>
    </div>
  );
}
