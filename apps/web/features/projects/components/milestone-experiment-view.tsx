"use client";

import { useState } from "react";
import type { ProjectDefinition, ProjectExperimentRecord, ProjectState } from "../types";
import { saveExperiment } from "@/features/experiments/experiment-storage";

export type MilestoneExperimentViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onRecordExperiment: (exp: ProjectExperimentRecord) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneExperimentView({
  project,
  state,
  onRecordExperiment,
  onComplete,
  onBack,
}: MilestoneExperimentViewProps) {
  const prompt = project.experimentPrompt;
  const [paramVal, setParamVal] = useState<number>(prompt.testVal);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Compute mock / analytical comparative impact based on parameter value
  const getExperimentComparison = (val: number) => {
    if (project.type === "regression") {
      const isHigh = val >= 0.2;
      return {
        metricLabel: "Test MSE",
        baselineVal: "0.042",
        testVal: isHigh ? "0.089" : "0.042",
        observation: isHigh
          ? "Higher learning rate (α=0.25) caused step overshooting around the minimum, resulting in higher final test loss."
          : "Standard learning rate (α=0.05) achieved smooth monotonic descent to the global optimum.",
      };
    } else if (project.type === "classification") {
      const isLow = val <= 0.35;
      return {
        metricLabel: "Student Recall",
        baselineVal: "85.7%",
        testVal: isLow ? "100.0%" : "85.7%",
        observation: isLow
          ? "Lower threshold (θ=0.30) classified more borderline students as passing, achieving 100% recall with slightly lower precision."
          : "Balanced threshold (θ=0.50) maintained equal balance between precision (87.5%) and recall (85.7%).",
      };
    } else {
      const k = Math.round(val);
      return {
        metricLabel: "Total Inertia",
        baselineVal: "384.2",
        testVal: k === 3 ? "142.6" : k >= 4 ? "98.1" : "384.2",
        observation:
          k === 3
            ? "Increasing to K=3 drops inertia significantly by 63% and captures natural income/spending cohorts (the elbow point)."
            : k >= 4
            ? "K=4 further decreases inertia slightly, but creates fragmented clusters with diminishing returns."
            : "K=2 merges standard and premium shoppers into one coarse cluster.",
      };
    }
  };

  const comparison = getExperimentComparison(paramVal);

  const handleRunAndSave = () => {
    const expRecord: ProjectExperimentRecord = {
      id: `proj-${project.slug}-${Date.now()}`,
      title: `${project.title}: ${prompt.parameterName}=${paramVal}`,
      timestamp: Date.now(),
      parameterVal: paramVal,
      metricLabel: comparison.metricLabel,
      metricValue: comparison.testVal,
    };

    // Save to existing experiment history
    saveExperiment({
      run: {
        id: expRecord.id,
        algorithm: project.type,
        dataset: { samples: 20, seed: state.splitConfig.seed, noise: 0.1 },
        dataset_points: [],
        training: {
          learning_rate: paramVal,
          epochs: 40,
          initial_weight: 0,
          initial_bias: 0,
        },
        total_steps: 40,
        history: [],
        markers: [],
        metadata: {
          project: project.title,
          experiment: prompt.title,
          [prompt.parameterName]: String(paramVal),
          metric: `${comparison.metricLabel}: ${comparison.testVal}`,
        },
      },
      title: `Project: ${project.title} (${prompt.parameterName}=${paramVal})`,
      notes: `${prompt.question} Result: ${comparison.observation}`,
    });

    onRecordExperiment(expRecord);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 dark:border-teal-800/80 bg-teal-50/70 dark:bg-teal-950/40 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🧪</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
              Educational Goal — Controlled Scientific Experimentation
            </h4>
            <p className="mt-1 text-sm text-teal-800 dark:text-teal-300">
              Machine learning engineering is an empirical science. Vary one hyperparameter at a time,
              formulate a hypothesis, and observe how performance metrics respond.
            </p>
          </div>
        </div>
      </div>

      {/* Hypothesis & Question Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs dark:shadow-md space-y-5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
            {prompt.title}
          </span>
          <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
            {prompt.question}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            {prompt.explanation}
          </p>
        </div>

        {/* Interactive Parameter Control */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>Test Hyperparameter ({prompt.parameterName}):</span>
            <span className="font-mono text-sm text-teal-900 dark:text-teal-300 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {paramVal}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setParamVal(prompt.defaultVal)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
                paramVal === prompt.defaultVal
                  ? "bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Default Baseline ({prompt.parameterName} = {prompt.defaultVal})
            </button>
            <button
              type="button"
              onClick={() => setParamVal(prompt.testVal)}
              className={`flex-1 rounded-lg py-2 text-xs font-bold transition-colors cursor-pointer ${
                paramVal === prompt.testVal
                  ? "bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              Experimental Shift ({prompt.parameterName} = {prompt.testVal})
            </button>
          </div>
        </div>

        {/* Comparative Shift Card */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Baseline Setting ({prompt.defaultVal})
            </span>
            <p className="mt-2 text-2xl font-bold text-slate-700 dark:text-slate-200">
              {comparison.baselineVal}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{comparison.metricLabel}</p>
          </div>

          <div className="rounded-lg border border-teal-200 dark:border-teal-800/80 bg-teal-50/70 dark:bg-teal-950/40 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
              Current Setting ({paramVal})
            </span>
            <p className="mt-2 text-2xl font-black text-teal-950 dark:text-teal-100">
              {comparison.testVal}
            </p>
            <p className="text-xs text-teal-800 dark:text-teal-400 mt-1">{comparison.metricLabel}</p>
          </div>
        </div>

        {/* Scientific Observation */}
        <div className="rounded-lg bg-teal-50/40 dark:bg-teal-950/30 p-4 border border-teal-100 dark:border-teal-900/60 text-xs text-slate-700 dark:text-slate-300">
          <strong className="text-teal-950 dark:text-teal-200 block mb-1">Empirical Observation:</strong>
          <p className="leading-relaxed">{comparison.observation}</p>
        </div>

        {/* Save to Experiment History Button */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleRunAndSave}
            className="rounded-lg bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            {isSaved ? "✓ Recorded to Experiment History!" : "Record Run to Experiment History"}
          </button>
        </div>
      </div>

      {/* Recorded Experiments in this Project */}
      {state.experiments.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
            Recorded Project Experiments ({state.experiments.length})
          </h4>
          <ul className="space-y-2">
            {state.experiments.map((exp) => (
              <li
                key={exp.id}
                className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono"
              >
                <span className="font-sans font-semibold text-slate-800 dark:text-slate-200">{exp.title}</span>
                <span className="font-bold text-teal-800 dark:text-teal-400">
                  {exp.metricLabel}: {exp.metricValue}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
        >
          ← Back to Train
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 dark:bg-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-teal-800 dark:hover:bg-teal-500 transition-colors cursor-pointer"
        >
          Experiment Completed: Proceed to Evaluate →
        </button>
      </div>
    </div>
  );
}
