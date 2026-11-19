import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { TrainingRun, TrainingState } from "@/types/training-run";
import type { BreakModeChallenge, BreakModeResult } from "@/features/challenges/types";
import { formatNumber, formatPercentage } from "@/features/x-ray/x-ray-helpers";
import type { LearningEvidenceItem, LearningIntelligenceExplanation } from "./types";

export function generateLearningIntelligence(
  event: DiagnosticEvent,
  run: TrainingRun,
  state: TrainingState | null
): LearningIntelligenceExplanation {
  const algo = run.algorithm.toLowerCase();
  const isKMeans = algo.startsWith("kmeans");
  const isLogistic = algo.startsWith("logistic");
  const isNeural = algo.startsWith("neural");
  const isLinear = !isKMeans && !isLogistic && !isNeural;

  const currentStep = event.step;
  const history = run.history ?? [];
  const currState = state ?? history[currentStep] ?? null;

  const evidence: LearningEvidenceItem[] = [];

  // Extract recorded evidence
  const ev = event.evidence;
  if (ev.previousLoss !== undefined) {
    evidence.push({
      label: isKMeans ? "Previous Inertia" : isLinear ? "Previous MSE" : "Previous BCE",
      value: formatNumber(Number(ev.previousLoss)),
      step: Math.max(0, currentStep - 1),
    });
  }
  if (ev.currentLoss !== undefined) {
    evidence.push({
      label: isKMeans ? "Current Inertia" : isLinear ? "Current MSE" : "Current BCE",
      value: formatNumber(Number(ev.currentLoss)),
      step: currentStep,
    });
  }
  if (ev.relativeLossChange !== undefined) {
    evidence.push({
      label: "Relative drop",
      value: formatPercentage(Number(ev.relativeLossChange)),
    });
  }
  if (ev.startLoss !== undefined && ev.endLoss !== undefined) {
    evidence.push({
      label: "Window start loss",
      value: formatNumber(Number(ev.startLoss)),
    });
    evidence.push({
      label: "Window end loss",
      value: formatNumber(Number(ev.endLoss)),
    });
  }
  if (ev.windowLength !== undefined) {
    evidence.push({
      label: "Window length",
      value: `${ev.windowLength} frames`,
    });
  }
  if (ev.maxAbsoluteChange !== undefined) {
    evidence.push({
      label: "Max frame change in window",
      value: formatNumber(Number(ev.maxAbsoluteChange)),
    });
  }
  if (ev.consecutiveIncreases !== undefined) {
    evidence.push({
      label: "Consecutive loss increases",
      value: `${ev.consecutiveIncreases} frames`,
    });
  }

  // Gradients evidence
  if (ev.weightGradient !== undefined) {
    evidence.push({
      label: "Weight gradient (∂L/∂w)",
      value: formatNumber(Number(ev.weightGradient)),
      step: currentStep,
    });
  }
  if (ev.biasGradient !== undefined) {
    evidence.push({
      label: "Bias gradient (∂L/∂b)",
      value: formatNumber(Number(ev.biasGradient)),
      step: currentStep,
    });
  }
  if (ev.gradientMagnitudes !== undefined && Array.isArray(ev.gradientMagnitudes)) {
    const mags = ev.gradientMagnitudes.map((v) => formatNumber(Number(v))).join(", ");
    evidence.push({
      label: "Gradient magnitude(s)",
      value: mags,
      step: currentStep,
    });
  }

  // K-Means movement evidence
  if (ev.centroidMovement !== undefined && Array.isArray(ev.centroidMovement)) {
    const movements = ev.centroidMovement.map((v) => formatNumber(Number(v), 4)).join(", ");
    evidence.push({
      label: "Centroid movement",
      value: movements,
      step: currentStep,
    });
  }

  // Accuracy evidence if classification
  if ((isLogistic || isNeural) && currState?.metrics?.accuracy !== undefined && currState.metrics.accuracy !== null) {
    evidence.push({
      label: "Classification accuracy",
      value: formatPercentage(currState.metrics.accuracy),
      step: currentStep,
    });
  }

  // Learning rate evidence where applicable
  if (!isKMeans && run.training.learning_rate !== undefined) {
    evidence.push({
      label: "Configured learning rate (α)",
      value: formatNumber(run.training.learning_rate),
    });
  }

  // Algorithm specific "What Happened", "Why", "Parameter Behavior", and "Suggested Action"
  let whatHappened = "";
  let why = "";
  let parameterBehavior = "";
  let suggestedAction = "";
  let relatedConcepts: string[] = [];

  switch (event.type) {
    case "rapid_loss_decrease": {
      relatedConcepts = ["Gradient Step", "Loss Reduction", "Optimization Trajectory"];
      if (isKMeans) {
        whatHappened = "Inertia decreased significantly after the cluster assignment and centroid update.";
        why =
          "Reassigning each point to its nearest centroid and updating each centroid to the mean of its assigned points minimizes the within-cluster sum of squared distances.";
        parameterBehavior = `Clustering with k=${run.training.clusters ?? 3} partitioned the dataset into tighter groups during this iteration.`;
        suggestedAction =
          "Inspect subsequent iterations to verify if centroids continue relocating or settle into stationary positions.";
      } else if (isLogistic) {
        whatHappened = `Recorded binary cross-entropy decreased substantially from ${formatEv(ev.previousLoss)} to ${formatEv(ev.currentLoss)}.`;
        why =
          "The gradient step adjusted the weights and bias in the negative gradient direction, driving predicted probabilities closer to the true binary labels.";
        parameterBehavior = `Learning rate α = ${run.training.learning_rate} produced a step that significantly decreased the log-loss penalty.`;
        suggestedAction =
          "Scrub forward to observe whether probabilities continue to sharpen or begin oscillating.";
      } else if (isNeural) {
        whatHappened = `Binary cross-entropy dropped substantially from ${formatEv(ev.previousLoss)} to ${formatEv(ev.currentLoss)}.`;
        why =
          "Analytical backpropagation propagated the output prediction error backwards through the hidden layer, updating both layers in directions of steepest descent.";
        parameterBehavior = `Learning rate α = ${run.training.learning_rate} effectively scaled the backpropagated gradients across all ${run.training.hidden_neurons ?? 3} hidden units.`;
        suggestedAction =
          "Inspect the hidden activations in Model X-Ray to observe how features differentiate.";
      } else {
        // Linear regression
        whatHappened = `Mean squared error decreased from ${formatEv(ev.previousLoss)} to ${formatEv(ev.currentLoss)} between Step ${Math.max(1, currentStep)} and Step ${currentStep + 1}.`;
        why =
          "The parameter update moved the regression line toward the center of the dataset points, reducing the squared residuals.";
        parameterBehavior = `Learning rate α = ${run.training.learning_rate} moved parameters substantially along the negative gradient vector.`;
        suggestedAction =
          "Inspect subsequent frames to see if loss reduction continues at a steady pace.";
      }
      break;
    }

    case "possible_plateau": {
      relatedConcepts = ["Plateau", "Vanishing Gradient", "Learning Slowdown"];
      if (isKMeans) {
        whatHappened = "Inertia changed very little across recent iterations.";
        why =
          "Point assignments between clusters have mostly stabilized, leaving centroid coordinates virtually unchanged.";
        parameterBehavior = `With k=${run.training.clusters ?? 3}, the Voronoi partitions have reached an empirical partition boundary.`;
        suggestedAction =
          "Inspect whether centroid movements are near zero, or try running with a different k or random seed to test alternative partitionings.";
      } else if (isNeural) {
        whatHappened = "Loss changed very little across recent recorded epochs.";
        why =
          "Gradients across the hidden or output layers may have diminished, or hidden neuron activations may be approaching saturation where sigmoid derivative σ'(z) = a(1-a) becomes very small.";
        parameterBehavior = `At learning rate α = ${run.training.learning_rate}, parameter adjustments per epoch are producing negligible changes in the output surface.`;
        suggestedAction =
          "Consider inspecting layer gradients in Model X-Ray or testing a slightly higher learning rate.";
      } else {
        whatHappened = `Loss changed by less than ${formatEv(ev.maxAbsoluteChange)} across a ${formatEv(ev.windowLength)}-step window.`;
        why =
          "The gradient magnitude has grown small or the parameter updates are too small to noticeably shift the objective function.";
        parameterBehavior = `At learning rate α = ${run.training.learning_rate}, updates per step have flattened out.`;
        suggestedAction =
          "Consider testing a slightly higher learning rate or inspecting if gradients are already near zero.";
      }
      break;
    }

    case "possible_instability": {
      relatedConcepts = ["Instability", "Overshooting", "Step Size"];
      if (isKMeans) {
        whatHappened = "Inertia increased between consecutive iterations.";
        why =
          "In standard Lloyd's algorithm, inertia is theoretically non-increasing; an increase indicates numerical precision limits or partition reassignment at boundary points.";
        parameterBehavior = "Centroid repositioning resulted in a slightly higher overall sum of squared distances.";
        suggestedAction =
          "Inspect cluster assignments around boundary points between iterations.";
      } else {
        whatHappened = `Loss increased from ${formatEv(ev.previousLoss)} to ${formatEv(ev.currentLoss)} after a prior region of decreasing loss.`;
        why =
          "The parameter update stepped past the local descent direction and landed on a higher-loss region of the loss surface.";
        parameterBehavior = `The configured learning rate (α = ${run.training.learning_rate}) produced an update step that overshot the minimum along the gradient vector.`;
        suggestedAction =
          "Try running an experiment with a smaller learning rate to see if loss remains monotonic.";
      }
      break;
    }

    case "possible_divergence": {
      relatedConcepts = ["Divergence", "Gradient Explosion", "Unstable Step"];
      whatHappened = `Loss increased consistently across ${formatEv(ev.consecutiveIncreases)} consecutive updates.`;
      why =
        "Each update stepped farther away from the minimum, producing progressively larger prediction errors and larger gradients.";
      parameterBehavior = `Learning rate α = ${run.training.learning_rate} is too large for the local curvature of the loss surface, causing runaway expansion.`;
      suggestedAction =
        "Try reducing the learning rate by a factor of 2 to 5 to restore stable descent.";
      break;
    }

    case "near_convergence": {
      relatedConcepts = ["Convergence", "Stationary Point", "Gradient Magnitude"];
      if (isKMeans) {
        whatHappened = "Centroid movement became very small, indicating the clustering partition is stable.";
        why =
          "Points are no longer changing cluster assignments between iterations, so centroid recalculations produce no positional shift.";
        parameterBehavior = `The algorithm converged in ${currentStep + 1} iterations for k=${run.training.clusters ?? 3}.`;
        suggestedAction =
          "Inspect the final cluster assignments and inertia to verify the grouping quality.";
      } else {
        whatHappened = "Parameter gradients are close to zero across all trainable parameters.";
        why =
          "At a local minimum or flat stationary point, the gradient vector ∂L/∂θ approaches zero, making subsequent gradient updates α·∂L/∂θ negligible.";
        parameterBehavior = `Parameters have stabilized; further epochs at α = ${run.training.learning_rate} will yield virtually identical weights.`;
        suggestedAction =
          "Inspect Model X-Ray to confirm that weight changes between adjacent frames are minimal.";
      }
      break;
    }
  }

  return {
    id: `intel-${event.id}-${currentStep}`,
    diagnosticId: event.id,
    type: event.type,
    title: event.title,
    step: currentStep,
    whatHappened,
    evidence,
    why,
    parameterBehavior,
    suggestedAction,
    relatedConcepts,
    mathAnchorId: "math-mode-panel",
    codeAnchorId: "code-mode-panel",
    modelXRayAnchorId: "model-x-ray-panel",
  };
}

export function generateChallengeExplanation(
  challenge: BreakModeChallenge,
  result: BreakModeResult,
  run: TrainingRun | null
): LearningIntelligenceExplanation | null {
  if (result.status !== "success" || !run) return null;

  const targetStep = result.targetStep;
  const state = run.history[targetStep] ?? null;
  const prevState = targetStep > 0 ? run.history[targetStep - 1] ?? null : null;

  const fakeEvent: DiagnosticEvent = {
    id: `challenge-${challenge.id}`,
    step: targetStep,
    type: challenge.targetDiagnosticType,
    title: challenge.title,
    description: challenge.objective,
    severity: "warning",
    evidence: {
      previousLoss: prevState?.loss ?? 0,
      currentLoss: state?.loss ?? 0,
      windowLength: 5,
    },
  };

  return generateLearningIntelligence(fakeEvent, run, state);
}

function formatEv(val: unknown): string {
  if (typeof val === "number" && Number.isFinite(val)) {
    return formatNumber(val);
  }
  if (typeof val === "string") return val;
  return "N/A";
}

export function generateEvaluationExplanation(
  type: "regression" | "classification",
  data: {
    trainMetric: number;
    testMetric: number;
    metricName: string;
    threshold?: number;
    tp?: number;
    fp?: number;
    fn?: number;
    tn?: number;
    /** Regression extras: test R², test MAE, test-set size, target units and whether training diverged. */
    r2?: number;
    mae?: number;
    testSize?: number;
    units?: string;
    diverged?: boolean;
    precision?: number;
    recall?: number;
  }
): LearningIntelligenceExplanation {
  const diff = Number((data.testMetric - data.trainMetric).toFixed(4));
  const evidence: LearningEvidenceItem[] = [
    { label: `Train ${data.metricName}`, value: formatNumber(data.trainMetric) },
    { label: `Test ${data.metricName}`, value: formatNumber(data.testMetric) },
    { label: "Difference (Δ)", value: diff > 0 ? `+${diff}` : String(diff) },
  ];
  if (data.r2 !== undefined) evidence.push({ label: "Test R²", value: formatNumber(data.r2) });
  if (data.mae !== undefined) evidence.push({ label: `Test MAE${data.units ? ` (${data.units})` : ""}`, value: formatNumber(data.mae) });
  if (data.testSize !== undefined) evidence.push({ label: "Test rows", value: String(data.testSize) });

  if (data.threshold !== undefined) {
    evidence.push({ label: "Decision Threshold (θ)", value: data.threshold.toFixed(2) });
  }
  if (data.tp !== undefined && data.fp !== undefined) {
    evidence.push({ label: "True Positives (TP)", value: String(data.tp) });
    evidence.push({ label: "False Positives (FP)", value: String(data.fp) });
  }
  if (data.fn !== undefined && data.tn !== undefined) {
    evidence.push({ label: "False Negatives (FN)", value: String(data.fn) });
    evidence.push({ label: "True Negatives (TN)", value: String(data.tn) });
  }

  let whatHappened = "";
  let mathematicalReason = "";
  let parameterBehavior = "";
  let whatToTryNext = "";

  if (type === "regression") {
    const r2 = data.r2;
    const rel = (data.testMetric - data.trainMetric) / Math.max(Math.abs(data.trainMetric), 1e-9);
    const pctGap = Math.round(Math.abs(rel) * 100);
    const small = (data.testSize ?? 99) < 5;
    const maeText = data.mae !== undefined ? ` On average its predictions are off by ${formatNumber(data.mae, 2)}${data.units ? ` ${data.units}` : ""}.` : "";
    whatHappened = `Test ${data.metricName} is ${formatNumber(data.testMetric)} versus training ${data.metricName} ${formatNumber(data.trainMetric)}${r2 !== undefined ? `, with a test R² of ${formatNumber(r2, 3)}` : ""}.${maeText}`;
    mathematicalReason =
      "Training minimises mean squared error on the training rows only. Test error measures how well that fit carries over to rows the model never saw. R² compares the model with the simplest baseline, always predicting the mean of the test targets: 1 is perfect, 0 is no better than the mean, and below 0 is worse than the mean.";
    if (data.diverged) {
      parameterBehavior = "Training diverged: the learning rate was too large, so each step overshot and the loss grew instead of shrinking. These metrics describe a broken model.";
      whatToTryNext = "Lower the learning rate and retrain before interpreting the results.";
    } else if (r2 !== undefined && r2 < 0) {
      parameterBehavior = `Poor fit: R² is negative, so on these test rows the model does worse than simply predicting their average.${small ? ` With only ${data.testSize} test rows, R² is also very unstable: a single unusual row can swing it a lot.` : ""}`;
      whatToTryNext = small
        ? "Use a larger test split or cross-validation to get a trustworthy estimate, then check the residuals for patterns the model is missing."
        : "Check whether a straight-line model suits this data, look at the residuals, and consider more informative features.";
    } else if (r2 !== undefined && r2 < 0.5) {
      parameterBehavior = `Weak fit: the model explains only ${Math.round(r2 * 100)}% of the variation in the test targets.`;
      whatToTryNext = "Try more informative features or a more flexible model, and check the residual plot.";
    } else if (rel > 0.25) {
      parameterBehavior = `The model fits well overall (R² ${formatNumber(r2 ?? 0, 3)}), but test error is ${pctGap}% higher than training error, a sign of some overfitting.`;
      whatToTryNext = "Try regularisation (ridge) or fewer features, and confirm with cross-validation.";
    } else if (rel < -0.25) {
      parameterBehavior = `The model fits well (R² ${formatNumber(r2 ?? 0, 3)}). Test error is ${pctGap}% lower than training error, which usually means the ${small ? "very small " : ""}test set happened to contain easier rows, not that the model is better on new data.`;
      whatToTryNext = "Treat the test error as a rough estimate; cross-validation over several splits gives a more reliable number.";
    } else {
      parameterBehavior = `Good fit: R² is ${formatNumber(r2 ?? 0, 3)} and test error is within ${pctGap}% of training error, so the model generalises consistently.`;
      whatToTryNext = "Inspect the residuals for any remaining pattern, and compare against a regularised model.";
    }
  } else {
    const fp = data.fp ?? 0;
    const fn = data.fn ?? 0;
    const gap = data.trainMetric - data.testMetric;
    whatHappened = `At decision threshold θ = ${data.threshold?.toFixed(2) ?? "0.50"}, the model got ${formatPercentage(data.testMetric)} of test rows right (training: ${formatPercentage(data.trainMetric)}), with ${fp} false positive(s) and ${fn} false negative(s)${data.testSize !== undefined ? ` out of ${data.testSize} test rows` : ""}.`;
    mathematicalReason =
      "The model outputs P(y = 1 | x); the threshold θ turns that into a decision. Lowering θ catches more positives (higher recall) at the cost of more false alarms (lower precision); raising it does the opposite.";
    const balance =
      fp > fn
        ? "This threshold produces more false alarms than missed positives."
        : fp < fn
        ? "This threshold misses more positives than it falsely flags."
        : fp === 0
        ? "No test rows were misclassified."
        : "False positives and false negatives are balanced.";
    const small = (data.testSize ?? 99) < 5 ? ` With only ${data.testSize} test rows, each mistake moves accuracy by ${Math.round(100 / (data.testSize ?? 1))} points, so treat these numbers as rough.` : "";
    parameterBehavior = `${balance}${gap > 0.15 ? ` Training accuracy is ${Math.round(gap * 100)} points higher than test accuracy, a sign of overfitting.` : ""}${small}`;
    whatToTryNext =
      "Move the threshold and watch how precision and recall trade off in the confusion matrix. Pick the threshold from the cost of each kind of mistake.";
  }

  return {
    id: `eval-${type}-${Date.now()}`,
    diagnosticId: `eval-${type}`,
    type: "possible_plateau",
    step: 0,
    title: `Model Evaluation: ${data.metricName}`,
    whatHappened,
    evidence,
    why: mathematicalReason,
    parameterBehavior,
    suggestedAction: whatToTryNext,
    relatedConcepts: ["Model Evaluation", "Generalization", "Loss vs Metrics"],
    mathAnchorId: "math-mode-panel",
    codeAnchorId: "code-mode-panel",
    modelXRayAnchorId: "model-x-ray-panel",
  };
}

