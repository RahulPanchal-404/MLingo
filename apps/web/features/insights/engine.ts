import type { TrainingRun, TrainingState } from "@/types/training-run";
import type { DiagnosticEvent } from "@/features/diagnostics/types";
import type { ComparisonInsight, TrainingInsight } from "@/features/insights/types";

function formatNumber(value: number | null | undefined, maxDigits = 4): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "N/A";
  return value.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
}

export function generateTrainingInsights(
  run: TrainingRun,
  diagnostics: DiagnosticEvent[] = []
): TrainingInsight[] {
  if (!run || !run.history || run.history.length === 0) return [];

  const history = run.history;
  const initial = history[0];
  const final = history[history.length - 1];
  const isKMeans = run.algorithm === "kmeans";
  const isLogistic = run.algorithm.startsWith("logistic");
  const isNeuralNetwork = run.algorithm === "neural_network" || run.algorithm.startsWith("neural");
  const isLinear = !isKMeans && !isLogistic && !isNeuralNetwork;

  const insights: TrainingInsight[] = [];

  // 1. Connect directly to existing diagnostics (without duplicating detector logic)
  for (const event of diagnostics) {
    if (event.type === "rapid_loss_decrease" && !insights.some((i) => i.id === "insight-rapid-decrease")) {
      insights.push({
        id: "insight-rapid-decrease",
        title: "Rapid initial loss decrease",
        description: `Loss decreased rapidly during the early updates, dropping significantly at Step ${event.step + 1}.`,
        step: event.step,
        evidence: {
          step: event.step,
          previousLoss: Number(event.evidence.previousLoss ?? 0),
          currentLoss: Number(event.evidence.currentLoss ?? 0),
        },
        algorithm: run.algorithm,
        category: "loss",
      });
    } else if (event.type === "possible_instability" && !insights.some((i) => i.id === "insight-instability")) {
      insights.push({
        id: "insight-instability",
        title: "Loss oscillation observed",
        description: `Loss increased after Step ${event.step + 1} following an earlier decrease, suggesting aggressive parameter updates.`,
        step: event.step,
        evidence: {
          step: event.step,
          previousLoss: Number(event.evidence.previousLoss ?? 0),
          currentLoss: Number(event.evidence.currentLoss ?? 0),
        },
        algorithm: run.algorithm,
        category: "dynamics",
      });
    } else if (event.type === "possible_divergence" && !insights.some((i) => i.id === "insight-divergence")) {
      insights.push({
        id: "insight-divergence",
        title: "Loss divergence observed",
        description: `Loss increased consistently across consecutive updates up to Step ${event.step + 1}, indicating the model is moving away from a fit.`,
        step: event.step,
        evidence: {
          step: event.step,
          consecutiveIncreases: Number(event.evidence.consecutiveIncreases ?? 0),
        },
        algorithm: run.algorithm,
        category: "dynamics",
      });
    } else if (event.type === "possible_plateau" && !insights.some((i) => i.id === "insight-plateau")) {
      insights.push({
        id: "insight-plateau",
        title: "Loss plateau reached",
        description: `Loss changed very little across recent frames around Step ${event.step + 1}, indicating updates have flattened.`,
        step: event.step,
        evidence: {
          step: event.step,
          startLoss: Number(event.evidence.startLoss ?? 0),
          endLoss: Number(event.evidence.endLoss ?? 0),
        },
        algorithm: run.algorithm,
        category: "convergence",
      });
    } else if (event.type === "near_convergence" && !insights.some((i) => i.id === "insight-convergence")) {
      insights.push({
        id: "insight-convergence",
        title: "Near convergence",
        description: isKMeans
          ? `Centroid movement became small near Step ${event.step + 1}, suggesting cluster centers have stabilized.`
          : `Weight and bias gradients became small near Step ${event.step + 1}, suggesting parameter updates are stabilizing.`,
        step: event.step,
        evidence: {
          step: event.step,
        },
        algorithm: run.algorithm,
        category: "convergence",
      });
    }
  }

  // 2. Algorithm-specific deterministic insights if fewer than 3 insights
  if (isLinear) {
    // Check general loss trend if not already covered
    if (history.length >= 2 && final.loss < initial.loss && !insights.some((i) => i.category === "loss")) {
      insights.push({
        id: "insight-linear-loss-trend",
        title: "Steady loss reduction",
        description: `Mean squared error decreased from ${formatNumber(initial.loss)} to ${formatNumber(final.loss)} across ${history.length - 1} recorded updates.`,
        evidence: { initialLoss: initial.loss, finalLoss: final.loss, totalSteps: history.length - 1 },
        algorithm: run.algorithm,
        category: "loss",
      });
    }

    // Check gradients near end of run
    const finalWeightGrad = final.gradients?.[0];
    const finalBiasGrad = final.bias_gradient;
    if (
      finalWeightGrad !== undefined &&
      finalBiasGrad !== null &&
      finalBiasGrad !== undefined &&
      Math.abs(finalWeightGrad) < 0.05 &&
      Math.abs(finalBiasGrad) < 0.05 &&
      !insights.some((i) => i.category === "convergence")
    ) {
      insights.push({
        id: "insight-linear-gradients",
        title: "Small terminal gradients",
        description: `Weight and bias gradients became small near the end of the recorded run (${formatNumber(finalWeightGrad)}, ${formatNumber(finalBiasGrad)}).`,
        step: history.length - 1,
        evidence: { weightGradient: finalWeightGrad, biasGradient: finalBiasGrad },
        algorithm: run.algorithm,
        category: "convergence",
      });
    }

    // Conservative learning rate observation if loss barely moved (< 5%) over 20+ steps
    if (
      history.length >= 20 &&
      initial.loss > 0 &&
      (initial.loss - final.loss) / initial.loss < 0.05 &&
      final.loss <= initial.loss &&
      !insights.some((i) => i.category === "dynamics")
    ) {
      insights.push({
        id: "insight-linear-conservative",
        title: "Conservative update rate",
        description: `Loss decreased by less than 5% across ${history.length - 1} steps, suggesting a conservative learning rate (${run.training.learning_rate}).`,
        evidence: { learningRate: run.training.learning_rate, lossReductionRatio: (initial.loss - final.loss) / initial.loss },
        algorithm: run.algorithm,
        category: "dynamics",
      });
    }
  } else if (isLogistic) {
    // Check BCE decrease
    if (history.length >= 2 && final.loss < initial.loss && !insights.some((i) => i.id === "insight-rapid-decrease")) {
      insights.push({
        id: "insight-logistic-bce-trend",
        title: "Binary cross-entropy trend",
        description: `Binary cross-entropy decreased across the recorded run from ${formatNumber(initial.loss)} to ${formatNumber(final.loss)}.`,
        evidence: { initialBce: initial.loss, finalBce: final.loss },
        algorithm: run.algorithm,
        category: "loss",
      });
    }

    // Check Accuracy reached 100% while BCE continued to decrease
    let perfectAccStep = -1;
    for (let i = 0; i < history.length; i++) {
      if (history[i].metrics?.accuracy === 1.0) {
        perfectAccStep = i;
        break;
      }
    }
    if (
      perfectAccStep >= 0 &&
      perfectAccStep < history.length - 1 &&
      final.loss < (history[perfectAccStep].loss ?? 0)
    ) {
      insights.push({
        id: "insight-logistic-perfect-acc-refining",
        title: "Confidence refinement",
        description: `Accuracy reached 100% at Step ${perfectAccStep + 1} while binary cross-entropy continued to decrease, indicating sharpening prediction probabilities.`,
        step: perfectAccStep,
        evidence: {
          step: perfectAccStep,
          lossAtPerfect: history[perfectAccStep].loss,
          finalLoss: final.loss,
        },
        algorithm: run.algorithm,
        category: "accuracy",
      });
    } else if (final.metrics?.accuracy !== undefined && final.metrics.accuracy !== null) {
      // General accuracy statement
      const finalAccPercent = Math.round(final.metrics.accuracy * 100);
      if (!insights.some((i) => i.category === "accuracy")) {
        insights.push({
          id: "insight-logistic-final-acc",
          title: "Classification accuracy",
          description: `The decision boundary reached ${finalAccPercent}% recorded classification accuracy by the final frame.`,
          step: history.length - 1,
          evidence: { finalAccuracy: final.metrics.accuracy },
          algorithm: run.algorithm,
          category: "accuracy",
        });
      }
    }
  } else if (isKMeans) {
    // Inertia check
    const initialInertia = initial.inertia ?? initial.loss;
    const finalInertia = final.inertia ?? final.loss;
    if (history.length >= 2 && finalInertia < initialInertia) {
      // Check if early updates drove the majority of drop
      const stepOneInertia = history[1]?.inertia ?? history[1]?.loss;
      const totalDrop = initialInertia - finalInertia;
      const earlyDrop = initialInertia - stepOneInertia;
      if (totalDrop > 0 && earlyDrop / totalDrop >= 0.5) {
        insights.push({
          id: "insight-kmeans-early-inertia",
          title: "Early iteration progress",
          description: `Inertia decreased substantially during the early iterations, with over ${Math.round((earlyDrop / totalDrop) * 100)}% of total reduction in the first update.`,
          step: 1,
          evidence: { initialInertia, stepOneInertia, finalInertia },
          algorithm: run.algorithm,
          category: "clustering",
        });
      } else {
        insights.push({
          id: "insight-kmeans-inertia-drop",
          title: "Inertia reduction",
          description: `Inertia decreased from ${formatNumber(initialInertia)} to ${formatNumber(finalInertia)} across ${history.length - 1} recorded iterations.`,
          evidence: { initialInertia, finalInertia },
          algorithm: run.algorithm,
          category: "clustering",
        });
      }
    }

    // Centroid movement check
    const finalMovement = final.centroid_movement;
    if (
      finalMovement &&
      finalMovement.length > 0 &&
      finalMovement.every((m) => m <= 0.02) &&
      !insights.some((i) => i.category === "convergence")
    ) {
      insights.push({
        id: "insight-kmeans-movement-small",
        title: "Centroid stabilization",
        description: "Centroid movement became small near the end of the run, suggesting cluster partition stability.",
        step: history.length - 1,
        evidence: { maxFinalMovement: Math.max(...finalMovement) },
        algorithm: run.algorithm,
        category: "convergence",
      });
    }
  } else if (isNeuralNetwork) {
    // Check BCE decrease
    if (history.length >= 2 && final.loss < initial.loss && !insights.some((i) => i.category === "loss")) {
      insights.push({
        id: "insight-nn-bce-trend",
        title: "Backpropagation loss reduction",
        description: `Binary cross-entropy dropped from ${formatNumber(initial.loss)} to ${formatNumber(final.loss)} as weights updated layer by layer.`,
        evidence: { initialBce: initial.loss, finalBce: final.loss },
        algorithm: run.algorithm,
        category: "loss",
      });
    }

    // Accuracy refinement
    if (final.metrics?.accuracy !== undefined && final.metrics.accuracy !== null) {
      const finalAccPercent = Math.round(final.metrics.accuracy * 100);
      if (!insights.some((i) => i.category === "accuracy")) {
        insights.push({
          id: "insight-nn-final-acc",
          title: "Nonlinear classification accuracy",
          description: `The hidden representations enabled ${finalAccPercent}% recorded classification accuracy by the final frame.`,
          step: history.length - 1,
          evidence: { finalAccuracy: final.metrics.accuracy },
          algorithm: run.algorithm,
          category: "accuracy",
        });
      }
    }
  }

  // Ensure single state runs are handled
  if (history.length === 1 && insights.length === 0) {
    insights.push({
      id: "insight-single-frame",
      title: "Initial baseline only",
      description: "Only the initial un-updated baseline state was recorded for this run.",
      step: 0,
      evidence: { step: 0 },
      algorithm: run.algorithm,
      category: "dynamics",
    });
  }

  // Return at most 3 non-duplicate insights
  return insights.slice(0, 3);
}

export function generateComparisonInsights(
  runA: TrainingRun,
  runB: TrainingRun
): ComparisonInsight[] {
  if (!runA || !runB || !runA.history || !runB.history || runA.history.length === 0 || runB.history.length === 0) {
    return [];
  }

  const finalA = runA.history[runA.history.length - 1];
  const finalB = runB.history[runB.history.length - 1];
  const isKMeans = runA.algorithm === "kmeans" || runB.algorithm === "kmeans";
  const isLogistic = runA.algorithm.startsWith("logistic") || runB.algorithm.startsWith("logistic");
  const isNeuralNetwork = runA.algorithm.startsWith("neural") || runB.algorithm.startsWith("neural");

  const insights: ComparisonInsight[] = [];

  // 1. Configuration observation
  if (isKMeans) {
    const kA = runA.training.clusters ?? runA.history[0]?.centroids?.length ?? 0;
    const kB = runB.training.clusters ?? runB.history[0]?.centroids?.length ?? 0;
    if (kA !== kB) {
      insights.push({
        id: "comp-config-clusters",
        title: "Cluster configuration",
        description: `Run A configured ${kA} clusters, whereas Run B configured ${kB} clusters.`,
        evidence: { clustersA: kA, clustersB: kB },
      });
    }
  } else if (isNeuralNetwork) {
    const lrA = runA.training.learning_rate;
    const lrB = runB.training.learning_rate;
    const hA = runA.training.hidden_neurons ?? runA.history[0]?.b1?.length ?? 3;
    const hB = runB.training.hidden_neurons ?? runB.history[0]?.b1?.length ?? 3;
    if (hA !== hB) {
      insights.push({
        id: "comp-config-hidden",
        title: "Hidden layer capacity",
        description: `Run A configured ${hA} hidden neurons, while Run B configured ${hB} hidden neurons.`,
        evidence: { hiddenA: hA, hiddenB: hB },
      });
    } else if (lrA !== lrB) {
      insights.push({
        id: "comp-config-lr",
        title: "Learning rate setup",
        description: `Run A used a learning rate of ${formatNumber(lrA)}, while Run B used ${formatNumber(lrB)}.`,
        evidence: { learningRateA: lrA, learningRateB: lrB },
      });
    }
  } else {
    const lrA = runA.training.learning_rate;
    const lrB = runB.training.learning_rate;
    if (lrA !== lrB) {
      insights.push({
        id: "comp-config-lr",
        title: "Learning rate setup",
        description: `Run A used a learning rate of ${formatNumber(lrA)}, while Run B used ${formatNumber(lrB)}.`,
        evidence: { learningRateA: lrA, learningRateB: lrB },
      });
    }
  }

  // 2. Factual Metric Difference (Strictly NO winner / loser / best / worse words)
  if (isKMeans) {
    const inertiaA = finalA.inertia ?? finalA.loss;
    const inertiaB = finalB.inertia ?? finalB.loss;
    if (Math.abs(inertiaA - inertiaB) > 1e-6) {
      const lowerRun = inertiaB < inertiaA ? "Run B" : "Run A";
      const higherRun = inertiaB < inertiaA ? "Run A" : "Run B";
      const lowerVal = Math.min(inertiaA, inertiaB);
      const higherVal = Math.max(inertiaA, inertiaB);
      insights.push({
        id: "comp-metric-inertia",
        title: "Final recorded inertia",
        description: `${lowerRun} reached a lower recorded final inertia (${formatNumber(lowerVal)}) than ${higherRun} (${formatNumber(higherVal)}).`,
        evidence: { inertiaA, inertiaB },
      });
    } else {
      insights.push({
        id: "comp-metric-inertia-equal",
        title: "Final recorded inertia",
        description: `Both runs concluded with comparable final inertia (${formatNumber(inertiaA)}).`,
        evidence: { inertiaA, inertiaB },
      });
    }
  } else if (isLogistic || isNeuralNetwork) {
    const bceA = finalA.loss;
    const bceB = finalB.loss;
    if (Math.abs(bceA - bceB) > 1e-6) {
      const lowerRun = bceB < bceA ? "Run B" : "Run A";
      const higherRun = bceB < bceA ? "Run A" : "Run B";
      insights.push({
        id: "comp-metric-bce",
        title: "Final binary cross-entropy",
        description: `${lowerRun} reached a lower recorded final binary cross-entropy (${formatNumber(Math.min(bceA, bceB))}) than ${higherRun} (${formatNumber(Math.max(bceA, bceB))}).`,
        evidence: { bceA, bceB },
      });
    }

    const accA = finalA.metrics?.accuracy;
    const accB = finalB.metrics?.accuracy;
    if (accA !== undefined && accB !== undefined && accA !== null && accB !== null) {
      if (accA !== accB) {
        insights.push({
          id: "comp-metric-accuracy",
          title: "Final classification accuracy",
          description: `Run A reached ${Math.round(accA * 100)}% final accuracy, while Run B reached ${Math.round(accB * 100)}% final accuracy.`,
          evidence: { accuracyA: accA, accuracyB: accB },
        });
      } else {
        insights.push({
          id: "comp-metric-accuracy-equal",
          title: "Final classification accuracy",
          description: `Both runs achieved ${Math.round(accA * 100)}% recorded classification accuracy by the final frame.`,
          evidence: { accuracyA: accA, accuracyB: accB },
        });
      }
    }
  } else {
    // Linear regression
    const lossA = finalA.loss;
    const lossB = finalB.loss;
    if (Math.abs(lossA - lossB) > 1e-6) {
      const lowerRun = lossB < lossA ? "Run B" : "Run A";
      const higherRun = lossB < lossA ? "Run A" : "Run B";
      insights.push({
        id: "comp-metric-loss",
        title: "Final recorded loss",
        description: `${lowerRun} reached a lower recorded final loss (${formatNumber(Math.min(lossA, lossB))}) than ${higherRun} (${formatNumber(Math.max(lossA, lossB))}).`,
        evidence: { lossA, lossB },
      });
    } else {
      insights.push({
        id: "comp-metric-loss-equal",
        title: "Final recorded loss",
        description: `Both runs reached identical final loss values (${formatNumber(lossA)}).`,
        evidence: { lossA, lossB },
      });
    }
  }

  // 3. Trajectory / Dynamic observation (e.g. loss increase or earlier plateau)
  const findFirstIncreaseStep = (history: TrainingState[]): number | null => {
    for (let i = 2; i < history.length; i++) {
      if (history[i].loss > history[i - 1].loss && history[i - 1].loss < history[i - 2].loss) {
        return i;
      }
    }
    return null;
  };

  const incA = findFirstIncreaseStep(runA.history);
  const incB = findFirstIncreaseStep(runB.history);

  if (incA !== null && incB === null) {
    insights.push({
      id: "comp-dynamics-oscillation",
      title: "Loss trajectory behavior",
      description: `Run A showed a loss increase at Step ${incA + 1} following an earlier decrease, whereas Run B decreased monotonically.`,
      evidence: { stepRunA: incA },
    });
  } else if (incB !== null && incA === null) {
    insights.push({
      id: "comp-dynamics-oscillation",
      title: "Loss trajectory behavior",
      description: `Run B showed a loss increase at Step ${incB + 1} following an earlier decrease, whereas Run A decreased monotonically.`,
      evidence: { stepRunB: incB },
    });
  } else if (incA !== null && incB !== null && incA !== incB) {
    const earlierRun = incA < incB ? "Run A" : "Run B";
    const earlierStep = Math.min(incA, incB);
    insights.push({
      id: "comp-dynamics-oscillation",
      title: "Loss trajectory behavior",
      description: `${earlierRun} showed an earlier loss increase at Step ${earlierStep + 1}.`,
      evidence: { incA, incB },
    });
  }

  return insights.slice(0, 3);
}
