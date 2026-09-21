import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TrainingRun, TrainingState } from "@/types/training-run";
import type { ProjectDefinition, ProjectState } from "@/features/projects/types";
import type {
  DiagnosticContext,
  ProjectContext,
  TrainingContext,
  TutorContext,
} from "./types";

export function buildTrainingTutorContext(
  run: TrainingRun | null,
  state: TrainingState | null,
  learningRate?: number
): TrainingContext | null {
  if (!run || !state) return null;

  const prevStep = Math.max(0, state.step - 1);
  const prevState = run.history[prevStep] ?? null;

  return {
    algorithm: run.algorithm,
    selected_step: state.step,
    total_steps: run.total_steps,
    loss: state.loss,
    previous_loss: prevState ? prevState.loss : null,
    weights: state.weights,
    bias: state.bias,
    gradients: state.gradients,
    bias_gradient: state.bias_gradient,
    learning_rate: learningRate ?? run.training.learning_rate,
    metrics: state.metrics as Record<string, number>,
    centroids: state.centroids,
    cluster_assignments: state.cluster_assignments,
    inertia: state.inertia,
    hidden_activations: state.hidden_activations as number[][] | undefined,
  };
}

export function buildDiagnosticTutorContext(
  diag: DiagnosticEvent | null
): DiagnosticContext | null {
  if (!diag) return null;

  const evList: Array<Record<string, string | number | null>> = [];
  if (diag.evidence) {
    for (const [k, v] of Object.entries(diag.evidence)) {
      if (typeof v === "string" || typeof v === "number") {
        evList.push({ [k]: v });
      }
    }
  }

  return {
    type: diag.type,
    title: diag.title,
    step: diag.step,
    what_happened: diag.description,
    why: diag.description || "",
    parameter_behavior: "",
    suggested_action: "",
    evidence: evList,
  };
}

export function buildProjectTutorContext(
  project: ProjectDefinition | null,
  state: ProjectState | null
): ProjectContext | null {
  if (!project || !state) return null;

  const currentMilestone = project.milestones.find((m) => m.id === state.currentMilestoneId);

  return {
    project_id: project.id,
    project_title: project.title,
    milestone_id: state.currentMilestoneId,
    milestone_order: currentMilestone?.order ?? 1,
    milestone_title: currentMilestone?.title ?? "Milestone",
    educational_goal: currentMilestone?.educationalGoal ?? "",
    dataset_name: project.datasetId,
    model_name: project.modelName,
    completed_milestones: state.completedMilestones,
  };
}

export function generateContextualSuggestions(context: TutorContext): string[] {
  if (context.project && context.project.project_title) {
    const mId = context.project.milestone_id;
    if (mId === "reflect") {
      return [
        "What should I include in my reflection?",
        "How well did this model generalize?",
        "Why was preprocessing critical here?",
      ];
    }
    if (mId === "preprocess" || mId === "split") {
      return [
        "Why must scalers be fit only on the training set?",
        "What happens if test data leaks into preprocessing?",
        "Explain this train/test split ratio.",
      ];
    }
    if (mId === "evaluate") {
      return [
        "How do I interpret this evaluation score?",
        "What is the generalization gap?",
        "Why is test error higher than train error?",
      ];
    }
    return [
      "What is the goal of this milestone?",
      "Why is this algorithm suited for this project?",
      "What should I check before proceeding?",
    ];
  }

  if (context.training) {
    const algo = context.training.algorithm.toLowerCase();
    if (algo.includes("logistic")) {
      return [
        "Why is the decision boundary changing here?",
        "What does this gradient mean in Math Mode?",
        "Why is the loss moving this way?",
        "Explain the sigmoid probability formula.",
      ];
    }
    if (algo.includes("kmeans")) {
      return [
        "Why did inertia decrease in this iteration?",
        "How do centroids update mathematically?",
        "Why is feature scaling essential for K-Means?",
        "What does cluster inertia measure?",
      ];
    }
    if (algo.includes("neural")) {
      return [
        "Explain how the gradient reached the first layer.",
        "Why did the loss change between frames?",
        "Show the backpropagation chain rule.",
        "Inspect hidden activations in X-Ray.",
      ];
    }
    return [
      "Why did the loss change from the previous frame?",
      "What is this gradient doing mathematically?",
      "Show this update in Python code.",
      "Why is the regression line moving this way?",
    ];
  }

  if (context.evaluation) {
    return [
      "Why is test error higher than training error?",
      "What does this confusion matrix indicate?",
      "How does changing threshold affect recall?",
    ];
  }

  return [
    "What is machine learning frame by frame?",
    "How does gradient descent minimize loss?",
    "What does the learning rate control?",
  ];
}
