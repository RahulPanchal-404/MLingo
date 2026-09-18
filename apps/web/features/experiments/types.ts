import type { TrainingRun } from "@/types/training-run";

export type ExperimentRecord = {
  id: string;
  createdAt: string;
  algorithm: string;
  title: string;
  configuration: {
    dataset: TrainingRun["dataset"];
    training: TrainingRun["training"];
  };
  run: TrainingRun;
  notes?: string;
};

export type SaveExperimentInput = {
  run: TrainingRun;
  title?: string;
  notes?: string;
};

export type ExperimentMetricSummary = {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel?: string;
  secondaryValue?: string;
};
