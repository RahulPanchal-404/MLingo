import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import type { ExperimentRecord } from "@/features/experiments/types";
import { formatNumber } from "@/features/x-ray/x-ray-helpers";
import type {
  ExperimentSweep,
  SelectedRunsAnalysis,
  SweepParameterDefinition,
  SweepParameterKey,
  SweepValidationResult,
} from "./types";

export const MAX_SWEEP_RUNS = 7;

export const SWEEP_PARAMETERS: Record<TrainingRunRequest["algorithm"], SweepParameterDefinition> = {
  linear_regression: {
    key: "learning_rate",
    label: "Learning rate",
    min: 0.001,
    max: 2.0,
    defaultStart: 0.02,
    defaultEnd: 0.10,
    defaultStep: 0.02,
    isInteger: false,
  },
  logistic_regression: {
    key: "learning_rate",
    label: "Learning rate",
    min: 0.001,
    max: 2.0,
    defaultStart: 0.05,
    defaultEnd: 0.25,
    defaultStep: 0.05,
    isInteger: false,
  },
  kmeans: {
    key: "clusters",
    label: "Number of clusters (k)",
    min: 2,
    max: 6,
    defaultStart: 2,
    defaultEnd: 5,
    defaultStep: 1,
    isInteger: true,
  },
};

function roundPrecision(val: number, precision = 6): number {
  const factor = Math.pow(10, precision);
  return Math.round(val * factor) / factor;
}

export function validateAndGenerateSweepValues(
  start: number,
  end: number,
  step: number,
  isInteger = false,
  maxRuns: number = MAX_SWEEP_RUNS
): SweepValidationResult {
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(step)) {
    return { isValid: false, error: "Parameters must be finite numbers.", expectedRunCount: 0, previewValues: [] };
  }

  if (step <= 0) {
    return { isValid: false, error: "Step size must be greater than zero.", expectedRunCount: 0, previewValues: [] };
  }

  if (start < 0 || end < 0) {
    return { isValid: false, error: "Values must be non-negative.", expectedRunCount: 0, previewValues: [] };
  }

  if (end < start) {
    return { isValid: false, error: "End value must be greater than or equal to start value.", expectedRunCount: 0, previewValues: [] };
  }

  const values: number[] = [];
  let current = start;

  // Use small epsilon for float comparison
  const epsilon = 1e-9;
  while (current <= end + epsilon) {
    const val = isInteger ? Math.round(current) : roundPrecision(current);
    if (!values.includes(val)) {
      values.push(val);
    }
    current = roundPrecision(current + step);
    if (values.length > maxRuns + 2) {
      break;
    }
  }

  if (values.length === 0) {
    return { isValid: false, error: "No valid values found in the specified range.", expectedRunCount: 0, previewValues: [] };
  }

  if (values.length > maxRuns) {
    return {
      isValid: false,
      error: `Sweep configuration generates ${values.length} runs, which exceeds the safe maximum of ${maxRuns} runs. Increase step or narrow range.`,
      expectedRunCount: values.length,
      previewValues: values,
    };
  }

  return {
    isValid: true,
    expectedRunCount: values.length,
    previewValues: values,
  };
}

export function buildSweepRequest(
  baseRequest: TrainingRunRequest,
  parameterKey: SweepParameterKey,
  value: number
): TrainingRunRequest {
  const cloned: TrainingRunRequest = {
    algorithm: baseRequest.algorithm,
    dataset: { ...baseRequest.dataset },
    training: { ...baseRequest.training },
  };

  if (parameterKey === "learning_rate") {
    cloned.training.learning_rate = value;
  } else if (parameterKey === "clusters") {
    const intVal = Math.round(value);
    cloned.training.clusters = intVal;
    if (cloned.dataset.clusters !== undefined) {
      cloned.dataset.clusters = intVal;
    }
  }

  return cloned;
}

export function extractSweepMetric(run: TrainingRun): { label: string; value: number } {
  const history = run.history;
  const lastState = history.length > 0 ? history[history.length - 1] : null;

  if (!lastState) {
    return { label: "Loss", value: 0 };
  }

  const algo = run.algorithm.toLowerCase();

  if (algo.startsWith("linear")) {
    const mse = lastState.metrics?.mean_squared_error ?? lastState.loss;
    return { label: "MSE", value: typeof mse === "number" && Number.isFinite(mse) ? mse : lastState.loss };
  }

  if (algo.startsWith("logistic")) {
    const bce = lastState.metrics?.binary_cross_entropy ?? lastState.loss;
    return { label: "BCE", value: typeof bce === "number" && Number.isFinite(bce) ? bce : lastState.loss };
  }

  if (algo.startsWith("kmeans")) {
    const inertia = lastState.inertia ?? lastState.metrics?.inertia ?? lastState.loss;
    return { label: "Inertia", value: typeof inertia === "number" && Number.isFinite(inertia) ? inertia : lastState.loss };
  }

  return { label: "Loss", value: lastState.loss };
}

export function generateSweepInsights(sweep: ExperimentSweep): string[] {
  const completed = sweep.runs.filter((r) => r.status === "completed" && r.trainingRun);
  if (completed.length === 0) {
    return ["No runs completed successfully in this sweep."];
  }

  const insights: string[] = [];
  const metricsWithParams = completed.map((r) => {
    const metric = extractSweepMetric(r.trainingRun!);
    return {
      param: r.parameterValue,
      metric: metric.value,
      metricLabel: metric.label,
      run: r.trainingRun!,
    };
  });

  // Sort by parameter value
  metricsWithParams.sort((a, b) => a.param - b.param);

  const first = metricsWithParams[0];
  const last = metricsWithParams[metricsWithParams.length - 1];

  // 1. Overall parameter vs metric relationship
  if (first.metric !== last.metric) {
    const diff = last.metric - first.metric;
    const direction = diff < 0 ? "decreased" : "increased";
    insights.push(
      `Across the sweep range (${first.param} to ${last.param}), final recorded ${first.metricLabel} ${direction} from ${formatNumber(first.metric)} to ${formatNumber(last.metric)}.`
    );
  } else {
    insights.push(
      `Across the sweep range (${first.param} to ${last.param}), final recorded ${first.metricLabel} remained constant at ${formatNumber(first.metric)}.`
    );
  }

  // 2. Minimum and maximum recorded metrics
  let lowest = metricsWithParams[0];
  let highest = metricsWithParams[0];
  for (const item of metricsWithParams) {
    if (item.metric < lowest.metric) lowest = item;
    if (item.metric > highest.metric) highest = item;
  }

  if (lowest.param !== highest.param) {
    insights.push(
      `The lowest recorded final ${lowest.metricLabel} was ${formatNumber(lowest.metric)} at ${sweep.parameterName} = ${lowest.param}; the highest was ${formatNumber(highest.metric)} at ${sweep.parameterName} = ${highest.param}.`
    );
  }

  // 3. Loss trajectory behavior (e.g. did any run oscillate or diverge?)
  const runsWithOscillations: number[] = [];
  for (const item of metricsWithParams) {
    const history = item.run.history;
    for (let i = 2; i < history.length; i++) {
      if (history[i].loss > history[i - 1].loss && history[i - 1].loss < history[i - 2].loss) {
        runsWithOscillations.push(item.param);
        break;
      }
    }
  }

  if (runsWithOscillations.length > 0) {
    insights.push(
      `Loss oscillation was recorded during training at ${sweep.parameterName} = ${runsWithOscillations.join(", ")}.`
    );
  } else {
    insights.push(
      `All completed runs maintained monotonic loss reduction throughout recorded frames.`
    );
  }

  return insights;
}

export function compareSavedExperiments(records: ExperimentRecord[]): SelectedRunsAnalysis {
  if (records.length === 0) {
    return {
      records: [],
      algorithm: "",
      differences: [],
      metricComparison: [],
      diagnosticNotes: [],
      insights: [],
    };
  }

  const algo = records[0].algorithm;
  const differences: string[] = [];
  const metricComparison: string[] = [];
  const diagnosticNotes: string[] = [];
  const insights: string[] = [];

  // Configuration differences
  const lrs = new Set(records.map((r) => r.run.training.learning_rate));
  const epochs = new Set(records.map((r) => r.run.training.epochs));
  const clusters = new Set(records.map((r) => r.run.training.clusters));
  const samples = new Set(records.map((r) => r.run.dataset.samples));
  const noises = new Set(records.map((r) => r.run.dataset.noise));

  if (lrs.size > 1) {
    differences.push(`Learning rate varied: ${Array.from(lrs).map((v) => formatNumber(v)).join(", ")}`);
  }
  if (epochs.size > 1) {
    differences.push(`Epochs varied: ${Array.from(epochs).join(", ")}`);
  }
  if (clusters.size > 1) {
    differences.push(`Clusters (k) varied: ${Array.from(clusters).join(", ")}`);
  }
  if (samples.size > 1) {
    differences.push(`Dataset samples varied: ${Array.from(samples).join(", ")}`);
  }
  if (noises.size > 1) {
    differences.push(`Dataset noise varied: ${Array.from(noises).map((v) => formatNumber(v)).join(", ")}`);
  }
  if (differences.length === 0) {
    differences.push("Selected runs share identical configuration parameters.");
  }

  // Metric comparisons
  records.forEach((record, index) => {
    const metric = extractSweepMetric(record.run);
    metricComparison.push(
      `Run ${index + 1} ("${record.title}"): final ${metric.label} = ${formatNumber(metric.value)} across ${record.run.total_steps} frames.`
    );
  });

  // Diagnostic notes
  records.forEach((record, index) => {
    const events: string[] = [];
    const history = record.run.history;
    for (let i = 1; i < history.length; i++) {
      if (history[i].loss > history[i - 1].loss) {
        events.push(`loss increased at step ${i + 1}`);
        break;
      }
    }
    if (events.length > 0) {
      diagnosticNotes.push(`Run ${index + 1}: ${events.join(", ")}.`);
    } else {
      diagnosticNotes.push(`Run ${index + 1}: monotonic loss reduction.`);
    }
  });

  // Insights
  const metrics = records.map((r) => extractSweepMetric(r.run).value);
  const minMetric = Math.min(...metrics);
  const maxMetric = Math.max(...metrics);
  const minIdx = metrics.indexOf(minMetric);
  const maxIdx = metrics.indexOf(maxMetric);

  if (minIdx !== maxIdx) {
    insights.push(
      `Run ${minIdx + 1} reached the lowest recorded final metric (${formatNumber(minMetric)}), while Run ${maxIdx + 1} concluded at ${formatNumber(maxMetric)}.`
    );
  } else {
    insights.push(
      `All selected runs concluded at comparable final metric values (${formatNumber(minMetric)}).`
    );
  }

  return {
    records,
    algorithm: algo,
    differences,
    metricComparison,
    diagnosticNotes,
    insights,
  };
}
