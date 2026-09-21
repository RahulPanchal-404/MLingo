"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

import {
  AVAILABLE_WORKBENCH_DATASETS,
  getWorkbenchDataset,
  type WorkbenchDatasetRecord,
} from "./datasets";
import { computeDatasetSummary } from "./summary";
import { analyzeDataQuality } from "./quality";
import { fitPreprocessing, transformWithPipeline } from "./preprocessing";
import { splitTrainTest } from "./split";
import { trainAndEvaluateModel } from "./evaluation";
import { DatasetSummaryView } from "./components/dataset-summary-view";
import { DataPreviewTable } from "./components/data-preview-table";
import { DataQualityCard } from "./components/data-quality-card";
import { PreprocessingPlayground } from "./components/preprocessing-playground";
import { PreprocessingPreview } from "./components/preprocessing-preview";
import { MathExplainer } from "./components/math-explainer";
import { SplitControls } from "./components/split-controls";
import { LeakageExplainer } from "./components/leakage-explainer";
import { ConfusionMatrixView } from "./components/confusion-matrix-view";
import { ThresholdControl } from "./components/threshold-control";
import { RocCurveChart } from "./components/roc-curve-chart";
import { OverfittingExplainer } from "./components/overfitting-explainer";
import { DataScienceReport } from "./components/data-science-report";
import { saveExperiment } from "@/features/experiments/experiment-storage";
import { recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import type { PreprocessingConfig, SplitConfig } from "./types";

export function DataWorkbench() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("housing_regression");
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [preprocessing, setPreprocessing] = useState<PreprocessingConfig>({
    numericScaling: "standard",
    missingImputation: "mean_mode",
    categoricalEncoding: "onehot",
  });

  const [split, setSplit] = useState<SplitConfig>({
    trainRatio: 0.8,
    seed: 42,
  });

  const [threshold, setThreshold] = useState<number>(0.5);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // 1. Dataset & Metadata
  const dataset: WorkbenchDatasetRecord = useMemo(
    () => getWorkbenchDataset(selectedDatasetId),
    [selectedDatasetId]
  );

  const summary = useMemo(() => computeDatasetSummary(dataset), [dataset]);
  const quality = useMemo(
    () => analyzeDataQuality(dataset.rows, dataset.targetColumn),
    [dataset]
  );

  // 2. Train / Test Split
  const { train: trainRaw, test: testRaw } = useMemo(
    () => splitTrainTest(dataset.rows, split),
    [dataset.rows, split]
  );

  // 3. Preprocessing (FIT ONLY ON TRAIN!)
  const pipeline = useMemo(
    () => fitPreprocessing(trainRaw, preprocessing, dataset.targetColumn),
    [trainRaw, preprocessing, dataset.targetColumn]
  );

  const trainTransformed = useMemo(
    () => transformWithPipeline(trainRaw, pipeline, dataset.targetColumn),
    [trainRaw, pipeline, dataset.targetColumn]
  );

  const testTransformed = useMemo(
    () => transformWithPipeline(testRaw, pipeline, dataset.targetColumn),
    [testRaw, pipeline, dataset.targetColumn]
  );

  // Full transformed set for exploratory preview
  const allTransformed = useMemo(
    () => transformWithPipeline(dataset.rows, pipeline, dataset.targetColumn),
    [dataset.rows, pipeline, dataset.targetColumn]
  );

  // 4. Model Training & Evaluation
  const evalResult = useMemo(
    () =>
      trainAndEvaluateModel(
        trainTransformed,
        testTransformed,
        dataset.taskType,
        dataset.targetColumn,
        threshold
      ),
    [trainTransformed, testTransformed, dataset.taskType, dataset.targetColumn, threshold]
  );

  // Record progress concepts on load/step change
  useEffect(() => {
    const concepts = [
      "Data Understanding",
      "Preprocessing",
      "Scaling",
      "Encoding",
      "Train/Test Split",
      "Data Leakage",
      "Model Evaluation",
      "Confusion Matrix",
      "Precision",
      "Recall",
      "F1",
      "Generalization",
    ];
    recordRunConcepts(concepts);
    recordLearningActivity({ labsExplored: 1 });
  }, [activeStep]);

  // Handle saving experiment to local storage
  const handleSaveToExperiments = () => {
    const fakeRunId = `workbench-${selectedDatasetId}-${Date.now()}`;
    const primaryLabel = dataset.taskType === "regression" ? "Test MSE" : "Test Accuracy";
    const primaryVal =
      dataset.taskType === "regression"
        ? String(evalResult.regression?.testMse ?? 0)
        : `${((evalResult.classification?.accuracy ?? 0) * 100).toFixed(1)}%`;

    const saved = saveExperiment({
      run: {
        id: fakeRunId,
        algorithm: dataset.taskType,
        dataset: {
          samples: dataset.rows.length,
          seed: split.seed,
          noise: 0,
        },
        dataset_points: [],
        training: {
          learning_rate: 0.1,
          epochs: 50,
          initial_weight: 0,
          initial_bias: 0,
        },
        total_steps: 1,
        history: [],
        markers: [],
        metadata: {
          workbenchDataset: dataset.name,
          preprocessing: `${preprocessing.numericScaling}_${preprocessing.missingImputation}`,
          splitRatio: `${Math.round(split.trainRatio * 100)}%`,
          primaryMetric: `${primaryLabel}: ${primaryVal}`,
        },
      },
      title: `Workbench: ${dataset.name}`,
      notes: `Evaluated with ${Math.round(split.trainRatio * 100)}% train split, ${preprocessing.numericScaling} scaling, ${preprocessing.missingImputation} imputation.`,
    });

    if (saved) {
      setSaveStatus("Saved to Experiment History!");
      setTimeout(() => setSaveStatus(null), 3500);
    }
  };

  const steps = [
    { num: 1, label: "1. Dataset" },
    { num: 2, label: "2. Explore & Quality" },
    { num: 3, label: "3. Preprocess" },
    { num: 4, label: "4. Split" },
    { num: 5, label: "5. Evaluate" },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
            End-to-End Workflow / Frame by Frame
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Data Science Workbench
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Clean, transform, split, train, and evaluate machine learning models without data leakage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Learn Workflow
          </Link>
          <button
            type="button"
            onClick={handleSaveToExperiments}
            className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
          >
            {saveStatus ?? "Save to Experiments"}
          </button>
        </div>
      </div>

      {/* Dataset Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Educational Dataset:
          </span>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_WORKBENCH_DATASETS.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDatasetId(d.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  selectedDatasetId === d.id
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {d.name} ({d.taskType})
              </button>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Samples: <span className="font-bold text-slate-900">{dataset.rows.length}</span> | Features:{" "}
          <span className="font-bold text-slate-900">{summary.featureCount}</span>
        </div>
      </div>

      {/* 5-Step Workflow Stepper Navigation */}
      <nav aria-label="Workbench workflow steps" className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-5">
          {steps.map((s) => (
            <li key={s.num}>
              <button
                type="button"
                onClick={() => setActiveStep(s.num)}
                className={`w-full rounded-lg py-2.5 px-3 text-xs font-bold transition-all text-center ${
                  activeStep === s.num
                    ? "bg-teal-50 text-teal-900 border border-teal-200 shadow-sm"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {s.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Step Content */}
      <div className="space-y-6">
        {/* STEP 1: Dataset */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <DatasetSummaryView summary={summary} />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                Next: Explore & Quality →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Explore & Quality */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <DataQualityCard quality={quality} />
            <DataPreviewTable rows={dataset.rows} targetColumn={dataset.targetColumn} />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Dataset
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                Next: Preprocessing →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Preprocess */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <PreprocessingPlayground config={preprocessing} onChange={setPreprocessing} />
            <PreprocessingPreview
              originalRows={dataset.rows}
              transformedRows={allTransformed}
              config={preprocessing}
              pipeline={pipeline}
              targetColumn={dataset.targetColumn}
            />
            <MathExplainer />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(2)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Explore
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                Next: Train / Test Split →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Split */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <SplitControls config={split} totalRows={dataset.rows.length} onChange={setSplit} />
            <LeakageExplainer />
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setActiveStep(3)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Preprocess
              </button>
              <button
                type="button"
                onClick={() => setActiveStep(5)}
                className="rounded-lg bg-teal-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition-colors shadow-sm"
              >
                Next: Evaluate Model →
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: Evaluate */}
        {activeStep === 5 && (
          <div className="space-y-6" id="evaluation-section">
            {/* Report Card */}
            <DataScienceReport
              datasetName={dataset.name}
              taskType={dataset.taskType}
              preprocessing={preprocessing}
              split={split}
              trainSamples={trainRaw.length}
              testSamples={testRaw.length}
              trainMetric={
                dataset.taskType === "regression"
                  ? evalResult.regression?.trainMse ?? 0
                  : evalResult.classification?.accuracy ?? 0
              }
              testMetric={
                dataset.taskType === "regression"
                  ? evalResult.regression?.testMse ?? 0
                  : evalResult.classification?.accuracy ?? 0
              }
              metricName={dataset.taskType === "regression" ? "MSE" : "Accuracy"}
              secondaryMetric={
                dataset.taskType === "regression"
                  ? `MAE: ${evalResult.regression?.testMae} | R²: ${evalResult.regression?.testR2}`
                  : `Precision: ${evalResult.classification?.precision} | Recall: ${evalResult.classification?.recall}`
              }
            />

            {/* Classification: Confusion Matrix, Threshold Control, ROC */}
            {dataset.taskType === "classification" && evalResult.classification && (
              <div className="space-y-6">
                <ThresholdControl threshold={threshold} onChange={setThreshold} />
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
              </div>
            )}

            {/* Regression Metrics Display */}
            {dataset.taskType === "regression" && evalResult.regression && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
                  Regression Evaluation Metrics
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                    <p className="text-[10px] uppercase font-sans text-slate-500">Train MSE</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{evalResult.regression.trainMse}</p>
                    <p className="text-[10px] text-slate-400 font-sans mt-1">1/n Σ(y - ŷ)²</p>
                  </div>
                  <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 font-mono">
                    <p className="text-[10px] uppercase font-sans text-teal-800 font-semibold">Test MSE</p>
                    <p className="mt-1 text-xl font-black text-teal-950">{evalResult.regression.testMse}</p>
                    <p className="text-[10px] text-teal-700 font-sans mt-1">Generalization error</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                    <p className="text-[10px] uppercase font-sans text-slate-500">Test MAE</p>
                    <p className="mt-1 text-xl font-bold text-slate-900">{evalResult.regression.testMae}</p>
                    <p className="text-[10px] text-slate-400 font-sans mt-1">1/n Σ|y - ŷ|</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono">
                    <p className="text-[10px] uppercase font-sans text-slate-500">Test R² Score</p>
                    <p className="mt-1 text-xl font-bold text-indigo-700">{evalResult.regression.testR2}</p>
                    <p className="text-[10px] text-slate-400 font-sans mt-1">1 - SSE / SST</p>
                  </div>
                </div>
              </div>
            )}

            {/* Clustering Metrics */}
            {dataset.taskType === "clustering" && evalResult.clustering && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
                  K-Means Clustering Metrics
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                    <p className="text-xs uppercase font-sans text-slate-500">Total Inertia</p>
                    <p className="mt-1 text-2xl font-bold text-teal-900">{evalResult.clustering.inertia}</p>
                    <p className="text-[11px] text-slate-500 font-sans mt-1">
                      Sum of squared Euclidean distances to assigned centroids.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono">
                    <p className="text-xs uppercase font-sans text-slate-500">Cluster Sizes</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      {evalResult.clustering.clusterSizes.map((sz, idx) => (
                        <div key={idx} className="rounded bg-white px-2.5 py-1 border border-slate-200">
                          C{idx + 1}: <span className="font-bold text-teal-800">{sz} samples</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generalization Gap Analysis */}
            {evalResult.generalization && (
              <OverfittingExplainer analysis={evalResult.generalization} />
            )}

            {/* Lab Jump Connections */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Connect to Algorithm Labs
                </h4>
                <p className="text-xs text-slate-500">
                  Observe gradient descent, loss landscapes, and backpropagation frame by frame.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <Link
                  href="/labs/gradient-descent"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Linear Regression Lab
                </Link>
                <Link
                  href="/labs/logistic-regression"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Logistic Regression Lab
                </Link>
                <Link
                  href="/labs/k-means"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  K-Means Lab
                </Link>
                <Link
                  href="/labs/neural-network"
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Neural Network Lab
                </Link>
              </div>
            </div>

            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setActiveStep(4)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                ← Back to Split
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
