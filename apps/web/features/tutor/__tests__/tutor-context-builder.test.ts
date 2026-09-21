import { describe, expect, it } from "vitest";
import {
  buildDiagnosticTutorContext,
  buildProjectTutorContext,
  buildTrainingTutorContext,
  generateContextualSuggestions,
} from "../tutor-context-builder";
import type { TrainingRun } from "@/types/training-run";
import type { DiagnosticEvent } from "@/features/diagnostics/types";
import { ALL_PROJECTS } from "@/features/projects/definitions";
import type { ProjectState } from "@/features/projects/types";
import { createDefaultProjectState } from "@/features/projects/project-storage";

describe("Tutor Context Builder & Suggestions", () => {
  const mockRun: TrainingRun = {
    id: "run-1",
    algorithm: "logistic_regression",
    dataset: { samples: 64, noise: 0.1, seed: 0 },
    training: { learning_rate: 0.2, epochs: 50, initial_weight: 0, initial_bias: 0 },
    dataset_points: [],
    history: [
      {
        step: 0,
        loss: 0.693,
        weights: [0, 0],
        bias: 0,
        gradients: [-0.1, -0.2],
        bias_gradient: -0.05,
        predictions: [],
        metrics: { accuracy: 0.5 },
      },
      {
        step: 1,
        loss: 0.550,
        weights: [0.02, 0.04],
        bias: 0.01,
        gradients: [-0.08, -0.15],
        bias_gradient: -0.03,
        predictions: [],
        metrics: { accuracy: 0.75 },
      },
    ],
    total_steps: 2,
    markers: [],
    metadata: {},
  };

  it("builds training context accurately from run and selected state", () => {
    const ctx = buildTrainingTutorContext(mockRun, mockRun.history[1], 0.2);
    expect(ctx).not.toBeNull();
    expect(ctx?.algorithm).toBe("logistic_regression");
    expect(ctx?.selected_step).toBe(1);
    expect(ctx?.total_steps).toBe(2);
    expect(ctx?.loss).toBe(0.550);
    expect(ctx?.previous_loss).toBe(0.693);
    expect(ctx?.weights).toEqual([0.02, 0.04]);
    expect(ctx?.bias).toBe(0.01);
    expect(ctx?.learning_rate).toBe(0.2);
  });

  it("returns null when run or state is missing", () => {
    expect(buildTrainingTutorContext(null, mockRun.history[0])).toBeNull();
    expect(buildTrainingTutorContext(mockRun, null)).toBeNull();
  });

  it("builds diagnostic context from diagnostic event", () => {
    const event: DiagnosticEvent = {
      id: "diag-1",
      step: 12,
      type: "possible_divergence",
      title: "Exploding Loss",
      description: "Loss increased by >500% in a single step.",
      severity: "warning",
      evidence: { current_loss: 14.5, previous_loss: 0.4 },
    };

    const diagCtx = buildDiagnosticTutorContext(event);
    expect(diagCtx).not.toBeNull();
    expect(diagCtx?.title).toBe("Exploding Loss");
    expect(diagCtx?.step).toBe(12);
    expect(diagCtx?.what_happened).toBe("Loss increased by >500% in a single step.");
    expect(diagCtx?.evidence).toEqual([
      { current_loss: 14.5 },
      { previous_loss: 0.4 },
    ]);
  });

  it("builds project tutor context accurately", () => {
    const project = ALL_PROJECTS[0]; // salary-prediction
    const state: ProjectState = {
      ...createDefaultProjectState(project.id),
      currentMilestoneId: "preprocess",
      completedMilestones: ["problem", "explore", "quality"],
      completed: false,
    };

    const prjCtx = buildProjectTutorContext(project, state);
    expect(prjCtx).not.toBeNull();
    expect(prjCtx?.project_id).toBe("salary-prediction");
    expect(prjCtx?.milestone_id).toBe("preprocess");
    expect(prjCtx?.completed_milestones).toContain("quality");
  });

  it("generates contextual suggestions for project milestones", () => {
    const project = ALL_PROJECTS[0];
    const suggestions = generateContextualSuggestions({
      project: {
        project_id: project.id,
        project_title: project.title,
        milestone_id: "split",
        milestone_order: 5,
        milestone_title: "Train/Test Split",
      },
    });

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.includes("leak") || s.includes("split"))).toBe(true);
  });

  it("generates contextual suggestions for algorithms", () => {
    const logisticSuggestions = generateContextualSuggestions({
      training: {
        algorithm: "logistic_regression",
        selected_step: 5,
        total_steps: 50,
      },
    });
    expect(logisticSuggestions.some((s) => s.includes("decision boundary") || s.includes("sigmoid"))).toBe(true);

    const kmeansSuggestions = generateContextualSuggestions({
      training: {
        algorithm: "kmeans",
        selected_step: 3,
        total_steps: 12,
      },
    });
    expect(kmeansSuggestions.some((s) => s.includes("inertia") || s.includes("centroid"))).toBe(true);
  });

  it("returns general suggestions for empty context", () => {
    const generalSuggestions = generateContextualSuggestions({});
    expect(generalSuggestions.length).toBeGreaterThan(0);
    expect(generalSuggestions.some((s) => s.includes("gradient descent") || s.includes("frame by frame"))).toBe(true);
  });
});
