import type { ProjectDefinition, ProjectState } from "@/features/projects/types";

export function generateProjectMarkdown(
  project: ProjectDefinition,
  state: ProjectState
): string {
  const isCompleted = state.completed;
  const statusStr = isCompleted ? "Completed" : "In Progress";
  const completedDate = state.completedAt
    ? new Date(state.completedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Ongoing";

  const lines: string[] = [
    `# Machine Learning Project Case Study: ${project.title}`,
    "",
    `**Author:** MLingo Learner  `,
    `**Task Type:** ${project.type.toUpperCase()}  `,
    `**Status:** ${statusStr}  `,
    `**Completion Date:** ${completedDate}  `,
    `**Estimated Effort:** ~${project.estimatedMinutes} minutes  `,
    "",
    "---",
    "",
    "## 1. Executive Summary",
    "",
    project.tagline,
    "",
    `- **Dataset:** ${project.datasetId}`,
    `- **Model Architecture:** ${project.modelName}`,
    `- **Difficulty Level:** ${project.difficulty}`,
    `- **Milestones Completed:** ${state.completedMilestones.length} of ${project.milestones.length}`,
    "",
    "---",
    "",
    "## 2. Problem Formulation",
    "",
    `### Problem Statement`,
    project.problemStatement,
    "",
    `### Learning Objectives`,
    ...project.learningObjectives.map((obj) => `- ${obj}`),
    "",
    "---",
    "",
    "## 3. Dataset & Exploration",
    "",
    `- **Dataset Identifier:** \`${project.datasetId}\``,
    `- **Target Variable:** Continuous or Discrete target dependent on task type (${project.type})`,
    "- **Exploratory Checks:** Analyzed feature correlations, distributions, and target variances.",
    "",
    "---",
    "",
    "## 4. Data Quality & Hygiene",
    "",
    "- **Missing Values:** Audited and imputed using selected statistical strategy.",
    "- **Constant Columns:** Inspected for zero-variance features.",
    "- **Duplicate Records:** Checked and verified unique observational units.",
    "",
    "---",
    "",
    "## 5. Preprocessing & Feature Engineering Pipeline",
    "",
    `| Pipeline Step | Configuration Applied | Purpose |`,
    `| :--- | :--- | :--- |`,
    `| Numeric Scaling | \`${state.preprocessingConfig.numericScaling}\` | Normalizes scale to prevent features with large magnitudes from dominating gradients. |`,
    `| Missing Imputation | \`${state.preprocessingConfig.missingImputation}\` | Fills unrecorded cells without introducing statistical bias. |`,
    `| Categorical Encoding | \`${state.preprocessingConfig.categoricalEncoding}\` | Converts categorical attributes into numerical vectors for tensor operations. |`,
    "",
    "---",
    "",
    "## 6. Train / Test Splitting & Data Leakage Prevention",
    "",
    `- **Training Set Ratio:** ${(state.splitConfig.trainRatio * 100).toFixed(0)}%`,
    `- **Holdout Test Set Ratio:** ${((1 - state.splitConfig.trainRatio) * 100).toFixed(0)}%`,
    `- **Random Seed:** \`${state.splitConfig.seed}\` (for deterministic reproducibility)`,
    "- **Data Leakage Safeguard:** Preprocessing statistics (means, standard deviations) were fitted exclusively on the training partition and then applied to test records.",
    "",
    "---",
    "",
    "## 7. Model Architecture",
    "",
    `- **Selected Model:** ${project.modelName}`,
    `- **Classification Threshold:** \`${state.classificationThreshold}\``,
    "",
    "---",
    "",
    "## 8. Training Optimization",
    "",
    `- **Training Run Recorded:** ${state.trainingRunId ? `\`${state.trainingRunId}\`` : "Baseline Execution"}`,
    "- **Optimization Protocol:** Loss was tracked frame by frame across epochs to observe gradient dynamics and convergence stability.",
    "",
    "---",
    "",
    "## 9. Scientific Experiments Conducted",
    "",
  ];

  if (state.experiments.length === 0) {
    lines.push(
      "*No empirical experiments recorded in this project yet. Return to Milestone 08 to test hyperparameter variations.*",
      ""
    );
  } else {
    lines.push(
      "| Experiment Title | Parameter Value | Metric Measured | Outcome |",
      "| :--- | :--- | :--- | :--- |"
    );
    for (const exp of state.experiments) {
      lines.push(
        `| ${exp.title} | \`${exp.parameterVal}\` | ${exp.metricLabel} | **${exp.metricValue}** |`
      );
    }
    lines.push("");
  }

  lines.push(
    "---",
    "",
    "## 10. Model Evaluation & Generalization",
    "",
    "Evaluation was performed on the unseen holdout test split to assess real-world generalization performance and diagnose overfitting.",
    ""
  );

  lines.push(
    "---",
    "",
    "## 11. Learner Reflections",
    ""
  );

  const reflectionEntries = Object.entries(state.reflections).filter(
    ([, text]) => text && text.trim() !== ""
  );

  if (reflectionEntries.length === 0) {
    lines.push(
      "*No written reflections recorded yet. Complete Milestone 11 to document qualitative findings.*",
      ""
    );
  } else {
    for (const [key, text] of reflectionEntries) {
      const promptObj = project.reflectionPrompts.find((p) => p.id === key);
      const title = promptObj ? promptObj.prompt : `Reflection (${key})`;
      lines.push(
        `### ${title}`,
        "",
        `> "${text.trim()}"`,
        ""
      );
    }
  }

  lines.push(
    "---",
    "",
    "## 12. Lessons Learned & Key Takeaways",
    "",
    ...project.lessonsLearned.map((lesson) => `- **Takeaway:** ${lesson}`),
    "",
    "### Next Concepts to Explore",
    ...project.nextConcepts.map((c) => `- ${c}`),
    "",
    "---",
    "",
    "*Generated by [MLingo](https://mlingo.org) — Machine Learning, Frame by Frame.*"
  );

  return lines.join("\n");
}

export function downloadProjectMarkdown(
  project: ProjectDefinition,
  state: ProjectState
): void {
  if (typeof window === "undefined") return;

  const content = generateProjectMarkdown(project, state);
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.slug}-case-study.md`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
