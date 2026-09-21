"use client";

import { useMemo } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { fitPreprocessing, transformWithPipeline } from "@/features/workbench/preprocessing";
import { PreprocessingPlayground } from "@/features/workbench/components/preprocessing-playground";
import { PreprocessingPreview } from "@/features/workbench/components/preprocessing-preview";
import { MathExplainer } from "@/features/workbench/components/math-explainer";
import type { PreprocessingConfig } from "@/features/workbench/types";

export type MilestonePreprocessViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onUpdateConfig: (cfg: PreprocessingConfig) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestonePreprocessView({
  project,
  state,
  onUpdateConfig,
  onComplete,
  onBack,
}: MilestonePreprocessViewProps) {
  const dataset = useMemo(() => getWorkbenchDataset(project.datasetId), [project.datasetId]);

  // Fit pipeline on raw rows for live preview
  const pipeline = useMemo(
    () => fitPreprocessing(dataset.rows, state.preprocessingConfig, dataset.targetColumn),
    [dataset.rows, state.preprocessingConfig, dataset.targetColumn]
  );

  const transformedRows = useMemo(
    () => transformWithPipeline(dataset.rows, pipeline, dataset.targetColumn),
    [dataset.rows, pipeline, dataset.targetColumn]
  );

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚙️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Data Preprocessing & Feature Engineering
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Machine learning models cannot compute dot products on raw categorical strings or missing NaN entries.
              Select appropriate scaling ($Z$-score vs MinMax), missing imputation, and one-hot encoding.
            </p>
          </div>
        </div>
      </div>

      {/* Preprocessing Playground Controls */}
      <PreprocessingPlayground
        config={state.preprocessingConfig}
        onChange={onUpdateConfig}
      />

      {/* Before / After Preview */}
      <PreprocessingPreview
        originalRows={dataset.rows}
        transformedRows={transformedRows}
        config={state.preprocessingConfig}
        pipeline={pipeline}
        targetColumn={dataset.targetColumn}
      />

      {/* Mathematical Formulas */}
      <MathExplainer />

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Quality Audit
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Preprocessing Configured: Proceed to Split →
        </button>
      </div>
    </div>
  );
}
