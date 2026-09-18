import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import type { ExperimentRecord } from "@/features/experiments/types";

export type SweepParameterKey = "learning_rate" | "clusters";

export type SweepParameterDefinition = {
  key: SweepParameterKey;
  label: string;
  unit?: string;
  min: number;
  max: number;
  defaultStart: number;
  defaultEnd: number;
  defaultStep: number;
  isInteger?: boolean;
};

export type SweepConfig = {
  algorithm: TrainingRunRequest["algorithm"];
  parameterKey: SweepParameterKey;
  start: number;
  end: number;
  step: number;
  baseRequest: TrainingRunRequest;
};

export type SweepRun = {
  id: string;
  parameterName: string;
  parameterValue: number;
  trainingRun: TrainingRun | null;
  status: "completed" | "failed";
  error?: string;
};

export type ExperimentSweep = {
  id: string;
  algorithm: TrainingRunRequest["algorithm"];
  parameterKey: SweepParameterKey;
  parameterName: string;
  startValue: number;
  endValue: number;
  stepValue: number;
  baseRequest: TrainingRunRequest;
  runs: SweepRun[];
  createdAt: string;
};

export type SweepValidationResult = {
  isValid: boolean;
  error?: string;
  expectedRunCount: number;
  previewValues: number[];
};

export type SweepMetricPoint = {
  parameterValue: number;
  metricValue: number;
  metricLabel: string;
  runId: string;
  status: "completed" | "failed";
};

export type SelectedRunsAnalysis = {
  records: ExperimentRecord[];
  algorithm: string;
  differences: string[];
  metricComparison: string[];
  diagnosticNotes: string[];
  insights: string[];
};
