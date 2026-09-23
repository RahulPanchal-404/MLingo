"use client";

import type { FormEvent } from "react";
import type { TrainingRunRequest } from "@/types/training-run";

interface ExperimentControlPanelProps {
  configuration: TrainingRunRequest;
  onConfigurationChange: React.Dispatch<React.SetStateAction<TrainingRunRequest>>;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  isReady: boolean;
  learningRateConfig: { min: number | string; max: number | string; step: number | string };
}

export function ExperimentControlPanel({
  configuration,
  onConfigurationChange,
  onSubmit,
  isLoading,
  isReady,
  learningRateConfig,
}: ExperimentControlPanelProps) {
  const updateTraining = (key: "learning_rate" | "epochs", value: number) => {
    onConfigurationChange((current) => ({
      ...current,
      training: {
        ...current.training,
        [key]: key === "epochs" ? Math.round(value) : value,
      },
    }));
  };

  const updateDataset = (key: "samples" | "noise", value: number) => {
    onConfigurationChange((current) => ({
      ...current,
      dataset: {
        ...current.dataset,
        [key]: key === "samples" ? Math.round(value) : value,
      },
    }));
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs space-y-5"
      aria-label="Experiment Configuration Panel"
    >
      {/* Header & Run State */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
            EXPERIMENT CONTROL CONSOLE
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            Configure Training Run
          </h2>
        </div>

        <div className="flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <span
            className={`h-2 w-2 rounded-full ${
              isLoading
                ? "bg-amber-400 animate-pulse"
                : isReady
                ? "bg-emerald-400"
                : "bg-slate-400"
            }`}
          />
          <span className="text-slate-700 dark:text-slate-300">
            {isLoading ? "Recording..." : isReady ? "Model Ready" : "Awaiting Run"}
          </span>
        </div>
      </div>

      {/* Control Sliders & Inputs */}
      <div className="space-y-4">
        {/* Learning Rate (α) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="learning-rate-input" className="font-semibold text-slate-800 dark:text-slate-200">
              Learning Rate (α)
            </label>
            <input
              id="learning-rate-input"
              type="number"
              step={learningRateConfig.step}
              min={learningRateConfig.min}
              max={learningRateConfig.max}
              value={configuration.training.learning_rate}
              onChange={(e) => updateTraining("learning_rate", Number(e.target.value))}
              className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-right font-mono text-xs font-bold text-teal-800 dark:text-teal-300"
            />
          </div>
          <input
            type="range"
            min={learningRateConfig.min}
            max={learningRateConfig.max}
            step={learningRateConfig.step}
            value={configuration.training.learning_rate}
            onChange={(e) => updateTraining("learning_rate", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Step size multiplier. Controls how aggressively parameters step in the direction of the negative gradient.
          </p>
        </div>

        {/* Epochs */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="epochs-input" className="font-semibold text-slate-800 dark:text-slate-200">
              Epochs (Iterations)
            </label>
            <input
              id="epochs-input"
              type="number"
              step="1"
              min="1"
              max="300"
              value={configuration.training.epochs}
              onChange={(e) => updateTraining("epochs", Number(e.target.value))}
              className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
          <input
            type="range"
            min="1"
            max="150"
            step="1"
            value={configuration.training.epochs}
            onChange={(e) => updateTraining("epochs", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Total optimization cycles to record into the timeline.
          </p>
        </div>

        {/* Samples */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="samples-input" className="font-semibold text-slate-800 dark:text-slate-200">
              Dataset Samples (N)
            </label>
            <input
              id="samples-input"
              type="number"
              step="1"
              min="10"
              max="100"
              value={configuration.dataset.samples}
              onChange={(e) => updateDataset("samples", Number(e.target.value))}
              className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={configuration.dataset.samples}
            onChange={(e) => updateDataset("samples", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Synthetic points generated along the target relationship y = 2x + 1.
          </p>
        </div>

        {/* Noise Variance */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <label htmlFor="noise-input" className="font-semibold text-slate-800 dark:text-slate-200">
              Noise Variance (σ)
            </label>
            <input
              id="noise-input"
              type="number"
              step="0.05"
              min="0"
              max="2"
              value={configuration.dataset.noise}
              onChange={(e) => updateDataset("noise", Number(e.target.value))}
              className="w-20 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-right font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
            />
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.05"
            value={configuration.dataset.noise}
            onChange={(e) => updateDataset("noise", Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-600"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Gaussian scatter added to points to test model tolerance to variance.
          </p>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-mono text-xs font-bold py-3 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span>{isLoading ? "Recording Training Run..." : "▶ Record New Training Run"}</span>
      </button>
    </form>
  );
}
