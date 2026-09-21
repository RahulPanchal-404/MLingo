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
  preprocessing?: {
    numericScaling?: string;
    missingImputation?: string;
    categoricalEncoding?: string;
  };
  split?: {
    trainRatio?: number;
    seed?: number;
  };
  evaluation?: {
    primaryLabel?: string;
    primaryValue?: string;
    secondaryLabel?: string;
    secondaryValue?: string;
  };
};

export type SaveExperimentInput = {
  run: TrainingRun;
  title?: string;
  notes?: string;
  preprocessing?: ExperimentRecord["preprocessing"];
  split?: ExperimentRecord["split"];
  evaluation?: ExperimentRecord["evaluation"];
};

export type ExperimentMetricSummary = {
  primaryLabel: string;
  primaryValue: string;
  secondaryLabel?: string;
  secondaryValue?: string;
};
