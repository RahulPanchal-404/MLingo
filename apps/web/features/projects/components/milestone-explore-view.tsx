"use client";

import { useMemo } from "react";
import type { ProjectDefinition } from "../types";
import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { computeDatasetSummary } from "@/features/workbench/summary";
import { DatasetSummaryView } from "@/features/workbench/components/dataset-summary-view";

export type MilestoneExploreViewProps = {
  project: ProjectDefinition;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneExploreView({
  project,
  onComplete,
  onBack,
}: MilestoneExploreViewProps) {
  const dataset = useMemo(() => getWorkbenchDataset(project.datasetId), [project.datasetId]);
  const summary = useMemo(() => computeDatasetSummary(dataset), [dataset]);

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🔍</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Exploratory Data Analysis (EDA)
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Inspect the dataset surface: total sample size $N$, feature dimensionality $D$,
              data types (numeric continuous vs categorical discrete), and target value properties.
            </p>
          </div>
        </div>
      </div>

      {/* Reused DatasetSummaryView */}
      <DatasetSummaryView summary={summary} />

      {/* Guided Exploration Takeaways */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          Dataset Exploration Insights for {project.title}
        </h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs text-slate-700">
          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">
              Input Features ({summary.features.length} columns)
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-600">
              {summary.features.map((f) => (
                <li key={f.name}>
                  <strong className="text-slate-800">{f.name}</strong> ({f.dtype}):{" "}
                  {f.uniqueCount} unique values
                  {f.missingCount > 0 ? (
                    <span className="text-amber-700 font-semibold ml-1">
                      ({f.missingCount} missing!)
                    </span>
                  ) : (
                    <span className="text-slate-500 ml-1">(clean)</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Target / Optimization Scope</span>
            {summary.target ? (
              <div className="space-y-1.5 text-slate-600">
                <p>
                  Target Column: <strong className="text-teal-900">{summary.target.name}</strong>
                </p>
                {summary.target.taskType === "regression" && (
                  <p>
                    Range: [{summary.target.minValue}, {summary.target.maxValue}], Mean:{" "}
                    {summary.target.meanValue}
                  </p>
                )}
                {summary.target.taskType === "classification" && summary.target.classDistribution && (
                  <div>
                    Class Distribution:
                    {Object.entries(summary.target.classDistribution).map(([cls, cnt]) => (
                      <span key={cls} className="ml-2 font-mono">
                        Class {cls}: {cnt} samples
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-600">
                No target column configured. The objective is unsupervised grouping based on pairwise
                geometric distance across feature dimensions.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Problem
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Exploration Complete: Check Data Quality →
        </button>
      </div>
    </div>
  );
}
