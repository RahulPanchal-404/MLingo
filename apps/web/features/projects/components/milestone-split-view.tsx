"use client";

import { useMemo } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { splitTrainTest } from "@/features/workbench/split";
import { SplitControls } from "@/features/workbench/components/split-controls";
import { LeakageExplainer } from "@/features/workbench/components/leakage-explainer";
import type { SplitConfig } from "@/features/workbench/types";

export type MilestoneSplitViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onUpdateSplit: (cfg: SplitConfig) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneSplitView({
  project,
  state,
  onUpdateSplit,
  onComplete,
  onBack,
}: MilestoneSplitViewProps) {
  const dataset = useMemo(() => getWorkbenchDataset(project.datasetId), [project.datasetId]);

  const { train, test } = useMemo(
    () => splitTrainTest(dataset.rows, state.splitConfig),
    [dataset.rows, state.splitConfig]
  );

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">✂️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Train / Test Partitioning & Leakage Prevention
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Evaluating a model on the same data it learned from yields dangerously optimistic metrics.
              Partitioning guarantees a hold-out test set for genuine generalization testing.
            </p>
          </div>
        </div>
      </div>

      {/* Reused Split Controls */}
      <SplitControls
        config={state.splitConfig}
        totalRows={dataset.rows.length}
        onChange={onUpdateSplit}
      />

      {/* Partition Visual Breakdown */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          Partition Summary
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-4 font-mono">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-teal-900">
              Training Set (Model Optimization)
            </span>
            <p className="mt-1 text-2xl font-black text-teal-950">
              {train.length} samples ({Math.round(state.splitConfig.trainRatio * 100)}%)
            </p>
            <p className="mt-1 text-xs text-teal-800 font-sans">
              Used strictly for parameter fitting (weights, biases, centroids) and transformer statistics.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
            <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-700">
              Test Set (Evaluation Integrity)
            </span>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {test.length} samples ({Math.round((1 - state.splitConfig.trainRatio) * 100)}%)
            </p>
            <p className="mt-1 text-xs text-slate-600 font-sans">
              Held out completely during training. Used exclusively to assess true generalization.
            </p>
          </div>
        </div>
      </div>

      {/* Reused Leakage Explainer */}
      <LeakageExplainer />

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Preprocess
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Split Confirmed: Choose a Model →
        </button>
      </div>
    </div>
  );
}
