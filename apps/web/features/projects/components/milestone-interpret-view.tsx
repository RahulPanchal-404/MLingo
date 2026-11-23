"use client";

import { useMemo } from "react";
import type { ProjectDefinition, ProjectState } from "../types";
import { useProjectRun } from "../engine";
import { generateEvaluationExplanation } from "@/features/intelligence/intelligence-engine";
import { WhyExplanationPanel } from "@/features/intelligence/why-explanation-panel";
import type { LearningIntelligenceExplanation } from "@/features/intelligence/types";

export type MilestoneInterpretViewProps = {
  project: ProjectDefinition;
  state: ProjectState;
  onComplete: () => void;
  onBack: () => void;
};

export function MilestoneInterpretView({
  project,
  state,
  onComplete,
  onBack,
}: MilestoneInterpretViewProps) {
  const { result: evalResult, units, options, testRaw } = useProjectRun(project, state);

  // Generate Learning Intelligence explanation
  const explanation: LearningIntelligenceExplanation = useMemo(() => {
    if (project.type === "regression" && evalResult.regression) {
      return generateEvaluationExplanation("regression", {
        trainMetric: evalResult.regression.trainMse,
        testMetric: evalResult.regression.testMse,
        metricName: "MSE",
        r2: evalResult.regression.testR2,
        mae: evalResult.regression.testMae,
        testSize: testRaw.length,
        units,
        diverged: evalResult.diverged,
      });
    }

    if (project.type === "classification" && evalResult.classification) {
      const cm = evalResult.classification.confusionMatrix;
      return generateEvaluationExplanation("classification", {
        trainMetric: evalResult.trainClassification?.accuracy ?? evalResult.classification.accuracy,
        testMetric: evalResult.classification.accuracy,
        testSize: testRaw.length,
        metricName: "Accuracy",
        threshold: state.classificationThreshold,
        tp: cm.tp,
        fp: cm.fp,
        fn: cm.fn,
        tn: cm.tn,
      });
    }

    // Clustering: describe the run that actually happened.
    const c = evalResult.clustering;
    const k = c?.clusterSizes.length ?? options.clusters ?? 3;
    const inertia = c?.inertia ?? 0;
    const sizes = c?.clusterSizes ?? [];
    const scaled = state.preprocessingConfig.numericScaling !== "none";
    return {
      id: `eval-clustering-${project.slug}`,
      diagnosticId: "eval-clustering",
      type: "possible_plateau",
      step: 0,
      title: "Model Interpretation: K-Means Clustering",
      whatHappened: `K-Means split the ${sizes.reduce((a, b) => a + b, 0)} training customers into ${k} clusters of sizes ${sizes.join(", ")}, with a total within-cluster sum of squares (inertia) of ${inertia}.`,
      evidence: [
        { label: "Number of clusters (K)", value: String(k) },
        { label: "Inertia (within-cluster sum of squares)", value: String(inertia) },
        { label: "Cluster sizes", value: sizes.join(" / ") },
        { label: "Features scaled", value: scaled ? "Yes" : "No" },
      ],
      why: `K-Means repeats two steps until nothing changes: assign every customer to the nearest centre, then move each centre to the mean of its customers. Neither step can increase inertia, so it settles at a local minimum.${scaled ? " Because the features were scaled, every feature counts equally in the distance." : " The features were not scaled, so the feature with the largest numbers dominates the distance."}`,
      parameterBehavior: `Inertia always falls as K grows, so a low inertia alone does not prove K = ${k} is right. Compare inertia for several K values (the elbow method) in the Experiment milestone${sizes.some((n) => n <= 1) ? `, and note that one cluster here has only ${Math.min(...sizes)} member, which can mean K is too large` : ""}.`,
      suggestedAction: "Describe each cluster by its centre (for example, high spenders versus occasional shoppers) and check whether those groups are useful for the business decision.",
      relatedConcepts: ["K-Means", "Inertia", "Elbow Method", "Feature Scaling", "Centroids"],
    };
  }, [project.type, project.slug, evalResult, state.classificationThreshold, state.preprocessingConfig.numericScaling, options.clusters, testRaw.length, units]);

  return (
    <div className="space-y-6">
      {/* Educational Goal Header Banner */}
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-4 dark:border-teal-500/40 dark:bg-teal-500/10">
        <div className="flex items-start gap-3">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-300">
              Educational Goal — Learning Intelligence: Why Did This Happen?
            </h4>
            <p className="mt-1 text-sm text-teal-800 dark:text-teal-300">
              Go beyond raw metric scores. Connect telemetry evidence to mathematical reasons:
              understand why the model produced these results and what parameter behavior caused them.
            </p>
          </div>
        </div>
      </div>

      {/* Reused WhyExplanationPanel */}
      <WhyExplanationPanel explanation={explanation} />

      {/* Navigation Footer */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60"
        >
          ← Back to Evaluation
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="rounded-lg bg-teal-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-teal-800 transition-colors"
        >
          Interpretation Reviewed: Reflect & Complete →
        </button>
      </div>
    </div>
  );
}
