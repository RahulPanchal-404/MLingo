"use client";

import { useMemo } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { splitTrainTest } from "@/features/workbench/split";
import { fitPreprocessing, transformWithPipeline } from "@/features/workbench/preprocessing";
import { trainAndEvaluateModel } from "@/features/workbench/evaluation";
import { ConfusionMatrixView } from "@/features/workbench/components/confusion-matrix-view";
import { ThresholdControl } from "@/features/workbench/components/threshold-control";
import { RocCurveChart } from "@/features/workbench/components/roc-curve-chart";
import { OverfittingExplainer } from "@/features/workbench/components/overfitting-explainer";

export type MilestoneEvaluateViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onUpdateThreshold: (th: number) => void;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneEvaluateView({
  project,
  state,
  onUpdateThreshold,
  onComplete,
  onBack,
}: MilestoneEvaluateViewProps) {
  const dataset = useMemo(() => getWorkbenchDataset(project.datasetId), [project.datasetId]);

  // 1. Train / Test Split
  const { train: trainRaw, test: testRaw } = useMemo(
    () => splitTrainTest(dataset.rows, state.splitConfig),
    [dataset.rows, state.splitConfig]
  );

  // 2. Preprocessing (fit exclusively on train)
  const pipeline = useMemo(
    () => fitPreprocessing(trainRaw, state.preprocessingConfig, dataset.targetColumn),
    [trainRaw, state.preprocessingConfig, dataset.targetColumn]
  );

  const trainTransformed = useMemo(
    () => transformWithPipeline(trainRaw, pipeline, dataset.targetColumn),
    [trainRaw, pipeline, dataset.targetColumn]
  );

  const testTransformed = useMemo(
    () => transformWithPipeline(testRaw, pipeline, dataset.targetColumn),
    [testRaw, pipeline, dataset.targetColumn]
  );

  // 3. Train & Evaluate
  const evalResult = useMemo(
    () =>
      trainAndEvaluateModel(
        trainTransformed,
        testTransformed,
        dataset.taskType,
        dataset.targetColumn,
        state.classificationThreshold
      ),
    [trainTransformed, testTransformed, dataset.taskType, dataset.targetColumn, state.classificationThreshold]
  );

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl">📊</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Educational Goal — Multi-Metric Evaluation & Generalization Assessment
            </h4>
            <p className="mt-1 text-sm text-teal-800">
              Optimization loss is merely a mathematical surrogate. Operational evaluation assesses how
              the model satisfies real business requirements on unseen test candidates.
            </p>
          </div>
        </div>
      </div>

      {/* REGRESSION EVALUATION METRICS */}
      {project.type === "regression" && evalResult.regression && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
              Salary Prediction Evaluation Metrics
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                <p className="text-[10px] uppercase font-sans text-slate-500">Train MSE</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{evalResult.regression.trainMse}</p>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Training residual error</p>
              </div>
              <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-4 font-mono">
                <p className="text-[10px] uppercase font-sans text-teal-800 font-bold">Test MSE</p>
                <p className="mt-1 text-2xl font-black text-teal-950">{evalResult.regression.testMse}</p>
                <p className="text-[10px] text-teal-700 font-sans mt-1">Generalization error</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                <p className="text-[10px] uppercase font-sans text-slate-500">Test MAE</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{evalResult.regression.testMae}</p>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Average $ error ($k)</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                <p className="text-[10px] uppercase font-sans text-slate-500">R² Score</p>
                <p className="mt-1 text-2xl font-bold text-indigo-700">{evalResult.regression.testR2}</p>
                <p className="text-[10px] text-slate-400 font-sans mt-1">Explained variance %</p>
              </div>
            </div>
          </div>

          {evalResult.generalization && (
            <OverfittingExplainer analysis={evalResult.generalization} />
          )}
        </div>
      )}

      {/* CLASSIFICATION EVALUATION METRICS */}
      {project.type === "classification" && evalResult.classification && (
        <div className="space-y-6">
          <ThresholdControl
            threshold={state.classificationThreshold}
            onChange={onUpdateThreshold}
          />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ConfusionMatrixView evaluation={evalResult.classification} />
            </div>
            <RocCurveChart
              rocPoints={evalResult.classification.rocPoints}
              auc={evalResult.classification.auc}
              currentThresholdFpr={
                evalResult.classification.confusionMatrix.fp /
                (evalResult.classification.confusionMatrix.fp +
                  evalResult.classification.confusionMatrix.tn || 1)
              }
              currentThresholdTpr={evalResult.classification.recall}
            />
          </div>

          {evalResult.generalization && (
            <OverfittingExplainer analysis={evalResult.generalization} />
          )}
        </div>
      )}

      {/* CLUSTERING EVALUATION METRICS */}
      {project.type === "clustering" && evalResult.clustering && (
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
              Retail Customer Segmentation Metrics
            </h3>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                <p className="text-xs uppercase font-sans text-slate-500">Total Inertia (WCSS)</p>
                <p className="mt-1 text-3xl font-bold text-teal-900">
                  {evalResult.clustering.inertia}
                </p>
                <p className="text-xs text-slate-500 font-sans mt-1">
                  Sum of squared Euclidean distances to assigned centroids.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                <p className="text-xs uppercase font-sans text-slate-500">Discovered Cluster Cohorts</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {evalResult.clustering.clusterSizes.map((sz, idx) => (
                    <div key={idx} className="rounded-md bg-white px-3 py-1.5 border border-slate-200">
                      Cohort C{idx + 1}: <span className="font-bold text-teal-800">{sz} shoppers</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
          ← Back to Experiment
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Evaluation Inspected: Interpret Results →
        </button>
      </div>
    </div>
  );
}
