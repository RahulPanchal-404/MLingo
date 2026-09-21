"use client";

import { useMemo } from "react";
import type { ProjectDefinition } from "../types";
import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { analyzeDataQuality } from "@/features/workbench/quality";
import { DataQualityCard } from "@/features/workbench/components/data-quality-card";
import { DataPreviewTable } from "@/features/workbench/components/data-preview-table";

export type MilestoneQualityViewProps = {
  project: ProjectDefinition;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneQualityView({
  project,
  onComplete,
  onBack,
}: MilestoneQualityViewProps) {
  const dataset = useMemo(() => getWorkbenchDataset(project.datasetId), [project.datasetId]);
  const quality = useMemo(
    () => analyzeDataQuality(dataset.rows, dataset.targetColumn),
    [dataset]
  );

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">🛡️</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Data Integrity & Sanity Auditing
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Real-world datasets contain anomalies: null fields, duplicated records, constant features,
              and unbalanced targets. Auditing data quality informs which preprocessing operations are mathematically required.
            </p>
          </div>
        </div>
      </div>

      {/* Reused Data Quality Card */}
      <DataQualityCard quality={quality} />

      {/* Reused Raw Data Preview Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Raw Data Records Inspection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Notice rows containing missing null entries highlighted with badges below.
          </p>
        </div>
        <DataPreviewTable rows={dataset.rows} targetColumn={dataset.targetColumn} />
      </div>

      {/* Quality Audit Remediation Note */}
      <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-4 text-xs text-amber-900">
        <p className="font-bold">Remediation Strategy for the Next Step:</p>
        <p className="mt-1 leading-relaxed">
          {quality.totalMissingValues > 0
            ? `Found ${quality.totalMissingValues} missing observation(s) in column(s): ${quality.columnsWithMissing.join(
                ", "
              )}. In Milestone 04, we will configure an imputer to restore these entries so matrix arithmetic can run cleanly.`
            : "No missing values found in this dataset. We will focus on feature scaling and categorical encoding in Milestone 04."}
        </p>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          ← Back to Explore
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Quality Audit Complete: Prepare Data →
        </button>
      </div>
    </div>
  );
}
