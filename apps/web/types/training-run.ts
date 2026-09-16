export type DatasetPoint = { feature: number; target: number; x1?: number; x2?: number; label?: number };

export type TrainingState = {
  step: number;
  weights: number[];
  bias: number;
  loss: number;
  gradients: number[];
  bias_gradient: number | null;
  predictions: number[];
  metrics: { mean_squared_error?: number | null; binary_cross_entropy?: number | null; accuracy?: number | null };
};

export type TrainingRun = {
  id: string;
  algorithm: string;
  dataset: { samples: number; slope?: number; intercept?: number; noise: number; seed: number };
  dataset_points: DatasetPoint[];
  training: { learning_rate: number; epochs: number; initial_weight: number; initial_bias: number };
  total_steps: number;
  history: TrainingState[];
  markers: number[];
  metadata: Record<string, string>;
};

export type TrainingRunRequest = {
  algorithm: "linear_regression" | "logistic_regression";
  dataset: { samples: number; slope?: number; intercept?: number; noise: number; seed: number };
  training: { learning_rate: number; epochs: number; initial_weight: number; initial_bias: number };
};
