import { describe, expect, it } from "vitest";
import {
  computeClassificationMetrics,
  computeConfusionMatrix,
  computeRegressionMetrics,
  computeRocCurveAndAuc,
  evaluateGeneralizationGap,
} from "../evaluation";

describe("Evaluation Metrics & Confusion Matrix", () => {
  it("computes exact regression metrics (MSE, MAE, R2)", () => {
    const trainPreds = [1, 2, 3];
    const trainTargets = [1, 2, 3];
    const testPreds = [2.5, 0.0, 2.0, 8.0];
    const testTargets = [3.0, -0.5, 2.0, 7.0];

    const res = computeRegressionMetrics(trainPreds, trainTargets, testPreds, testTargets);

    expect(res.trainMse).toBe(0);
    expect(res.testMse).toBeCloseTo(0.375, 3);
    expect(res.testMae).toBeCloseTo(0.5, 2);
    expect(res.testR2).toBeGreaterThan(0.9);
  });

  it("computes 2x2 confusion matrix and recalculates upon threshold change", () => {
    // 4 test samples: 2 positive, 2 negative
    const probs = [0.85, 0.65, 0.35, 0.15];
    const targets = [1, 1, 0, 0];

    // Standard threshold 0.50 -> perfect classification
    const cm05 = computeConfusionMatrix(probs, targets, 0.5);
    expect(cm05.tp).toBe(2);
    expect(cm05.tn).toBe(2);
    expect(cm05.fp).toBe(0);
    expect(cm05.fn).toBe(0);

    const m05 = computeClassificationMetrics(probs, targets, 0.5);
    expect(m05.accuracy).toBe(1);
    expect(m05.precision).toBe(1);
    expect(m05.recall).toBe(1);
    expect(m05.f1).toBe(1);

    // Conservative threshold 0.75 -> sample 2 (prob 0.65) now predicted 0!
    // TP=1, TN=2, FP=0, FN=1
    const cm075 = computeConfusionMatrix(probs, targets, 0.75);
    expect(cm075.tp).toBe(1);
    expect(cm075.fn).toBe(1);

    const m075 = computeClassificationMetrics(probs, targets, 0.75);
    expect(m075.recall).toBe(0.5); // recall drops to 50%
    expect(m075.precision).toBe(1); // precision remains 100%
  });

  it("handles zero division in precision/recall safely", () => {
    // Model predicts 0 for all
    const probs = [0.1, 0.2];
    const targets = [0, 0];

    const metrics = computeClassificationMetrics(probs, targets, 0.5);
    expect(metrics.precision).toBe(0);
    expect(metrics.recall).toBe(0);
    expect(metrics.f1).toBe(0);
  });

  it("computes ROC curve points and AUC correctly", () => {
    const probs = [0.9, 0.8, 0.3, 0.1];
    const targets = [1, 1, 0, 0];

    const { rocPoints, auc } = computeRocCurveAndAuc(probs, targets);
    expect(rocPoints.length).toBeGreaterThan(0);
    expect(auc).toBeCloseTo(1.0, 1);
  });

  it("analyzes generalization gap with neutral evidence", () => {
    const gapReg = evaluateGeneralizationGap("MSE", 0.05, 0.35, false);
    expect(gapReg.difference).toBe(0.3);
    expect(gapReg.description).toContain("generalization gap");

    const gapClf = evaluateGeneralizationGap("Accuracy", 0.95, 0.70, true);
    expect(gapClf.difference).toBe(-0.25);
    expect(gapClf.description).toContain("generalization gap");
  });
});
