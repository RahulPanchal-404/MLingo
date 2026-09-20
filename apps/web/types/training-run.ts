export type DatasetPoint = { feature?: number; target?: number; x1?: number; x2?: number; label?: number; x?: number; y?: number };

export type TrainingState = {
  step: number;
  weights: number[];
  bias: number;
  loss: number;
  gradients: number[];
  bias_gradient: number | null;
  predictions: number[];
  metrics: { mean_squared_error?: number | null; binary_cross_entropy?: number | null; accuracy?: number | null; inertia?: number | null };
  centroids?: Array<[number, number]>;
  cluster_assignments?: number[];
  inertia?: number | null;
  centroid_movement?: number[];
  w1?: number[][] | null;
  b1?: number[] | null;
  w2?: number[][] | null;
  b2?: number | null;
  dw1?: number[][] | null;
  db1?: number[] | null;
  dw2?: number[][] | null;
  db2?: number | null;
  hidden_activations?: number[][] | null;
};

export type TrainingRun = {
  id: string;
  algorithm: string;
  dataset: { samples: number; slope?: number; intercept?: number; noise: number; seed: number; clusters?: number; iterations?: number };
  dataset_points: DatasetPoint[];
  training: { learning_rate: number; epochs: number; initial_weight: number; initial_bias: number; clusters?: number; iterations?: number; hidden_neurons?: number; seed?: number };
  total_steps: number;
  history: TrainingState[];
  markers: number[];
  metadata: Record<string, string>;
};

export type TrainingRunRequest = {
  algorithm: "linear_regression" | "logistic_regression" | "kmeans" | "neural_network";
  dataset: { samples: number; slope?: number; intercept?: number; noise: number; seed: number; clusters?: number; iterations?: number };
  training: { learning_rate: number; epochs: number; initial_weight: number; initial_bias: number; clusters?: number; iterations?: number; hidden_neurons?: number; seed?: number };
};
