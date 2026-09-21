export type TaskType = "regression" | "classification" | "clustering";

export type FeatureMetadata = {
  name: string;
  dtype: "numeric" | "categorical";
  missingCount: number;
  uniqueCount: number;
  sampleValues: Array<string | number>;
};

export type TargetMetadata = {
  name: string;
  taskType: TaskType;
  uniqueCount: number;
  classDistribution?: Record<string, number>;
  minValue?: number;
  maxValue?: number;
  meanValue?: number;
};

export type DatasetSummary = {
  id: string;
  name: string;
  taskType: TaskType;
  description: string;
  rowCount: number;
  featureCount: number;
  features: FeatureMetadata[];
  target?: TargetMetadata;
};

export type DataQualityReport = {
  totalMissingValues: number;
  columnsWithMissing: string[];
  duplicateRowsCount: number;
  constantColumns: string[];
  numericColumns: string[];
  categoricalColumns: string[];
  classBalance?: Record<string, number>;
};

export type PreprocessingConfig = {
  numericScaling: "none" | "standard" | "minmax";
  missingImputation: "none" | "mean_mode";
  categoricalEncoding: "none" | "onehot";
};

export type SplitConfig = {
  trainRatio: number; // e.g. 0.8
  seed: number;
};

export type ConfusionMatrix = {
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  threshold: number;
};

export type ClassificationEvaluation = {
  threshold: number;
  confusionMatrix: ConfusionMatrix;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  rocPoints: Array<{ fpr: number; tpr: number }>;
  auc: number;
};

export type RegressionEvaluation = {
  trainMse: number;
  testMse: number;
  testMae: number;
  testR2: number;
};

export type ClusteringEvaluation = {
  inertia: number;
  clusterSizes: number[];
  centroids: number[][];
};

export type GeneralizationGapAnalysis = {
  metricName: string;
  trainValue: number;
  testValue: number;
  difference: number;
  description: string;
};

export type WorkbenchState = {
  selectedDatasetId: string;
  preprocessing: PreprocessingConfig;
  split: SplitConfig;
  classificationThreshold: number;
  activeStep: 1 | 2 | 3 | 4 | 5;
};
