import { describe, expect, it } from "vitest";
import { generateProjectMarkdown } from "../portfolio-export";
import { ALL_PROJECTS } from "@/features/projects/definitions";
import type { ProjectState } from "@/features/projects/types";

describe("Portfolio Markdown Export Generation", () => {
  const project = ALL_PROJECTS[0]; // salary-prediction
  const sampleState: ProjectState = {
    projectId: project.id,
    currentMilestoneId: "reflect",
    completedMilestones: [
      "problem",
      "explore",
      "quality",
      "preprocess",
      "split",
      "model",
      "train",
      "experiment",
      "evaluate",
      "interpret",
      "reflect",
    ],
    preprocessingConfig: {
      numericScaling: "standard",
      missingImputation: "mean_mode",
      categoricalEncoding: "onehot",
    },
    splitConfig: {
      trainRatio: 0.8,
      seed: 42,
    },
    classificationThreshold: 0.5,
    trainingRunId: "run-999",
    experiments: [
      {
        id: "exp-1",
        title: "Learning Rate 0.01 vs 0.1",
        timestamp: 12345678,
        parameterVal: 0.1,
        metricLabel: "Test MSE",
        metricValue: "0.0345",
      },
    ],
    reflections: {
      reflect: "Standard scaling was vital because experience years has smaller magnitude than salary.",
    },
    completed: true,
    completedAt: "2026-09-22T00:00:00.000Z",
    updatedAt: "2026-09-22T00:00:00.000Z",
  };

  it("generates a comprehensive markdown document with all 12 sections", () => {
    const md = generateProjectMarkdown(project, sampleState);

    expect(md).toContain(`# Machine Learning Project Case Study: ${project.title}`);
    expect(md).toContain("## 1. Executive Summary");
    expect(md).toContain("## 2. Problem Formulation");
    expect(md).toContain("## 3. Dataset & Exploration");
    expect(md).toContain("## 4. Data Quality & Hygiene");
    expect(md).toContain("## 5. Preprocessing & Feature Engineering Pipeline");
    expect(md).toContain("## 6. Train / Test Splitting & Data Leakage Prevention");
    expect(md).toContain("## 7. Model Architecture");
    expect(md).toContain("## 8. Training Optimization");
    expect(md).toContain("## 9. Scientific Experiments Conducted");
    expect(md).toContain("## 10. Model Evaluation & Generalization");
    expect(md).toContain("## 11. Learner Reflections");
    expect(md).toContain("## 12. Lessons Learned & Key Takeaways");
  });

  it("embeds actual project telemetry and learner reflections without fabrication", () => {
    const md = generateProjectMarkdown(project, sampleState);

    expect(md).toContain("`standard`");
    expect(md).toContain("`mean_mode`");
    expect(md).toContain("`onehot`");
    expect(md).toContain("80%");
    expect(md).toContain("Learning Rate 0.01 vs 0.1");
    expect(md).toContain("0.0345");
    expect(md).toContain("Standard scaling was vital because experience years");
    expect(md).toContain(project.modelName);
  });
});
