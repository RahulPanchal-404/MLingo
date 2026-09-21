export type TutorAnchors = {
  math_anchor_id?: string | null;
  code_anchor_id?: string | null;
  model_xray_anchor_id?: string | null;
  timeline_step?: number | null;
  suggested_action?: string | null;
};

export type TrainingContext = {
  algorithm: string;
  selected_step: number;
  total_steps: number;
  loss?: number | null;
  previous_loss?: number | null;
  weights?: number[] | null;
  bias?: number | null;
  gradients?: number[] | null;
  bias_gradient?: number | null;
  learning_rate?: number | null;
  metrics?: Record<string, number> | null;
  centroids?: number[][] | null;
  cluster_assignments?: number[] | null;
  inertia?: number | null;
  hidden_activations?: number[][] | null;
};

export type EvaluationContext = {
  task_type: "regression" | "classification" | "clustering";
  train_metric?: number | null;
  test_metric?: number | null;
  metric_name?: string | null;
  mae?: number | null;
  r2?: number | null;
  accuracy?: number | null;
  precision?: number | null;
  recall?: number | null;
  f1?: number | null;
  threshold?: number | null;
  tp?: number | null;
  fp?: number | null;
  fn?: number | null;
  tn?: number | null;
  inertia?: number | null;
};

export type ExperimentContext = {
  run_a_title?: string | null;
  run_b_title?: string | null;
  param_changed?: string | null;
  run_a_val?: string | null;
  run_b_val?: string | null;
  run_a_metric?: string | null;
  run_b_metric?: string | null;
};

export type ProjectContext = {
  project_id?: string | null;
  project_title?: string | null;
  milestone_id?: string | null;
  milestone_order?: number | null;
  milestone_title?: string | null;
  educational_goal?: string | null;
  dataset_name?: string | null;
  model_name?: string | null;
  completed_milestones?: string[];
};

export type DiagnosticContext = {
  type: string;
  title: string;
  step: number;
  what_happened: string;
  why: string;
  parameter_behavior: string;
  suggested_action: string;
  evidence: Array<Record<string, string | number | null>>;
};

export type TutorContext = {
  route?: string | null;
  training?: TrainingContext | null;
  evaluation?: EvaluationContext | null;
  experiment?: ExperimentContext | null;
  project?: ProjectContext | null;
  diagnostic?: DiagnosticContext | null;
  active_anchor?: string | null;
};

export type TutorMessage = {
  role: "user" | "assistant" | "system";
  content: string;
  anchors?: TutorAnchors | null;
};

export type TutorRequest = {
  message: string;
  context: TutorContext;
  conversation_history?: TutorMessage[];
  mode?: string;
};

export type TutorResponse = {
  answer: string;
  why?: string | null;
  evidence: string[];
  math_connection?: string | null;
  what_to_inspect_next?: string | null;
  anchors: TutorAnchors;
  suggested_followups: string[];
  provider: string;
  mode: string;
};

export type TutorChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  why?: string | null;
  evidence?: string[];
  math_connection?: string | null;
  what_to_inspect_next?: string | null;
  anchors?: TutorAnchors;
  suggested_followups?: string[];
  provider?: string;
};
