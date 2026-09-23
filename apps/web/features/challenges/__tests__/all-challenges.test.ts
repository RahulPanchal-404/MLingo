import { describe, expect, it } from "vitest";
import {
  ALL_CHALLENGES,
  getChallengeById,
  gradientDescentInstabilityChallenge,
  logisticRegressionThresholdChallenge,
  kMeansStabilizationChallenge,
  neuralNetworkPlateauChallenge,
} from "../types";
import { evaluateBreakMode } from "../break-mode-evaluator";
import type { DiagnosticEvent } from "@/features/diagnostics/types";

describe("ALL_CHALLENGES and Algorithm Coverage", () => {
  it("includes at least one challenge for all four algorithms", () => {
    const algorithms = ALL_CHALLENGES.map((c) => c.algorithm);
    expect(algorithms).toContain("linear_regression");
    expect(algorithms).toContain("logistic_regression");
    expect(algorithms).toContain("kmeans");
    expect(algorithms).toContain("neural_network");
  });

  it("retrieves each challenge by its ID", () => {
    expect(getChallengeById("threshold-tradeoff")).toBe(logisticRegressionThresholdChallenge);
    expect(getChallengeById("stable-clustering")).toBe(kMeansStabilizationChallenge);
    expect(getChallengeById("neural-learning-slowdown")).toBe(neuralNetworkPlateauChallenge);
    expect(getChallengeById("unstable-gradient-descent")).toBe(gradientDescentInstabilityChallenge);
  });

  it("evaluates Logistic Regression threshold challenge correctly", () => {
    const event: DiagnosticEvent = {
      id: "diag-conv",
      step: 18,
      type: "near_convergence",
      title: "Near convergence",
      description: "Gradients close to zero",
      severity: "success",
      evidence: {},
    };

    // Awaiting run
    expect(evaluateBreakMode(logisticRegressionThresholdChallenge, null, [])).toEqual({
      status: "awaiting-run",
    });

    // Not detected
    expect(evaluateBreakMode(logisticRegressionThresholdChallenge, [], [])).toEqual({
      status: "not-detected",
    });

    // Awaiting marker
    expect(evaluateBreakMode(logisticRegressionThresholdChallenge, [event], [])).toEqual({
      status: "awaiting-marker",
      targetStep: 18,
    });

    // Success within tolerance (tolerance = 2)
    expect(
      evaluateBreakMode(logisticRegressionThresholdChallenge, [event], [
        { id: "u-1", step: 19, title: "Stable", type: "user" },
      ])
    ).toMatchObject({
      status: "success",
      targetStep: 18,
      markerStep: 19,
      distance: 1,
    });

    // Incorrect marker too far away
    expect(
      evaluateBreakMode(logisticRegressionThresholdChallenge, [event], [
        { id: "u-2", step: 5, title: "Too early", type: "user" },
      ])
    ).toMatchObject({
      status: "incorrect-marker",
      targetStep: 18,
      nearestMarkerStep: 5,
      distance: 13,
    });
  });

  it("evaluates K-Means stabilization challenge correctly", () => {
    const event: DiagnosticEvent = {
      id: "diag-kmeans-conv",
      step: 6,
      type: "near_convergence",
      title: "Centroids stabilized",
      description: "Centroid movement negligible",
      severity: "success",
      evidence: {},
    };

    expect(
      evaluateBreakMode(kMeansStabilizationChallenge, [event], [
        { id: "u-km", step: 6, title: "Stabilized", type: "user" },
      ])
    ).toMatchObject({
      status: "success",
      targetStep: 6,
      markerStep: 6,
      distance: 0,
    });
  });

  it("evaluates Neural Network slowdown challenge correctly", () => {
    const event: DiagnosticEvent = {
      id: "diag-nn-plateau",
      step: 25,
      type: "possible_plateau",
      title: "Possible plateau",
      description: "Loss changes very little",
      severity: "warning",
      evidence: {},
    };

    expect(
      evaluateBreakMode(neuralNetworkPlateauChallenge, [event], [
        { id: "u-nn", step: 26, title: "Plateau onset", type: "user" },
      ])
    ).toMatchObject({
      status: "success",
      targetStep: 25,
      markerStep: 26,
      distance: 1,
    });
  });
});
