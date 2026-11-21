import { THEORY, getTheory } from "@/features/theory/topics";

import { ALGO_GUIDES_1 } from "./algos1";
import { ALGO_GUIDES_2 } from "./algos2";
import { ALGO_GUIDES_3 } from "./algos3";
import { GUIDE_MODULES } from "./guides";
import type { AlgoGuide } from "./types";

export const ALGO_GUIDES: Record<string, AlgoGuide> = { ...ALGO_GUIDES_1, ...ALGO_GUIDES_2, ...ALGO_GUIDES_3 };

/** One entry in the Code track. A theory slug means the page is built from that topic; otherwise it is a guide module. */
type Entry = { slug: string; project?: string };
type Part = { title: string; summary: string; chapter: string; entries: Entry[] };

export const CODE_PARTS: Part[] = [
  {
    title: "Getting started", chapter: "foundations",
    summary: "Set up your machine, run a complete project once, and learn the tools every later module uses.",
    entries: [{ slug: "setup" }, { slug: "first-model" }, { slug: "project-structure" }, { slug: "python-numpy-pandas" }, { slug: "python-plotting-sklearn" }],
  },
  {
    title: "Data and preprocessing", chapter: "workflow",
    summary: "Load, inspect and clean data, then prepare each kind of column, and validate without leakage.",
    entries: [
      { slug: "load-inspect" }, { slug: "data-quality" }, { slug: "missing-values" }, { slug: "numeric-features" },
      { slug: "feature-scaling", project: "salary-prediction" }, { slug: "categorical-features" },
      { slug: "feature-engineering", project: "house-price-prediction" }, { slug: "text-data", project: "email-spam-detection" },
      { slug: "dates-time-series", project: "stock-price-prediction" }, { slug: "image-data", project: "digit-recognition" },
      { slug: "pipelines" }, { slug: "train-test-split" }, { slug: "imbalanced-data", project: "fraud-detection" },
    ],
  },
  {
    title: "How models train", chapter: "foundations",
    summary: "Losses, gradient descent and learning rates in code: what `fit` is doing underneath.",
    entries: [
      { slug: "what-is-machine-learning" }, { slug: "how-models-learn" }, { slug: "loss-functions" },
      { slug: "gradient-descent", project: "salary-prediction" }, { slug: "learning-rate" }, { slug: "gradient-descent-variants" },
    ],
  },
  {
    title: "Regression", chapter: "regression",
    summary: "Predict numbers: linear models, curves, regularisation and non-linear regressors.",
    entries: [
      { slug: "linear-regression", project: "salary-prediction" }, { slug: "multiple-linear-regression", project: "house-price-prediction" },
      { slug: "polynomial-regression", project: "house-price-prediction" }, { slug: "regularization", project: "house-price-prediction" },
      { slug: "tree-knn-regression", project: "house-price-prediction" },
    ],
  },
  {
    title: "Classification", chapter: "supervised",
    summary: "Predict categories: from logistic regression to boosting and ensembles.",
    entries: [
      { slug: "logistic-regression", project: "student-outcome" }, { slug: "k-nearest-neighbors", project: "movie-recommendation" },
      { slug: "decision-trees", project: "fraud-detection" }, { slug: "naive-bayes", project: "email-spam-detection" },
      { slug: "support-vector-machines", project: "digit-recognition" }, { slug: "random-forests", project: "fraud-detection" },
      { slug: "gradient-boosting", project: "fraud-detection" }, { slug: "adaboost-xgboost", project: "fraud-detection" },
      { slug: "ensemble-methods", project: "fraud-detection" }, { slug: "multiclass-softmax", project: "digit-recognition" },
    ],
  },
  {
    title: "Unsupervised learning", chapter: "unsupervised",
    summary: "Find structure without labels: clustering and dimensionality reduction.",
    entries: [
      { slug: "k-means", project: "customer-segmentation" }, { slug: "hierarchical-clustering", project: "customer-segmentation-rfm" },
      { slug: "dbscan", project: "customer-segmentation-rfm" }, { slug: "pca", project: "digit-recognition" },
    ],
  },
  {
    title: "Neural networks", chapter: "deep-learning",
    summary: "From scikit-learn's MLP to a PyTorch training loop.",
    entries: [{ slug: "neural-networks", project: "digit-recognition" }, { slug: "training-neural-networks", project: "digit-recognition" }],
  },
  {
    title: "Evaluate, tune and ship", chapter: "capstone",
    summary: "Measure honestly, tune efficiently, compare models fairly, and put a model into use.",
    entries: [
      { slug: "regression-metrics", project: "house-price-prediction" }, { slug: "regression-diagnostics", project: "house-price-prediction" },
      { slug: "classification-metrics", project: "student-outcome" }, { slug: "roc-auc-calibration", project: "fraud-detection" },
      { slug: "bias-variance" }, { slug: "cross-validation-tuning" }, { slug: "statistics-inference" }, { slug: "save-and-serve" },
    ],
  },
  {
    title: "Reference: maths and other methods in code", chapter: "foundations",
    summary: "The maths behind the models, and reinforcement learning, written as runnable NumPy.",
    entries: [
      { slug: "vectors-matrices-notation" }, { slug: "linear-algebra-for-ml" }, { slug: "derivatives-chain-rule" },
      { slug: "partial-derivatives-gradients" }, { slug: "probability-statistics" }, { slug: "reinforcement-learning" },
    ],
  },
];

export type CodeModule = {
  slug: string;
  title: string;
  summary: string;
  part: string;
  kind: "guide" | "topic";
  project?: string;
};

const titleOf = (slug: string) => GUIDE_MODULES[slug]?.title ?? getTheory(slug)?.title ?? slug;
const summaryOf = (slug: string) => GUIDE_MODULES[slug]?.summary ?? getTheory(slug)?.summary ?? "";

/** Every Code track module in reading order. */
export const CODE_MODULES: CodeModule[] = CODE_PARTS.flatMap((p) =>
  p.entries.map((e) => ({ slug: e.slug, title: titleOf(e.slug), summary: summaryOf(e.slug), part: p.title, kind: GUIDE_MODULES[e.slug] ? "guide" as const : "topic" as const, project: e.project })),
);

export const getCodeModule = (slug: string) => CODE_MODULES.find((m) => m.slug === slug);

/** Theory topics that have programs but no Code track page would leave links dangling; the test suite checks this list is empty. */
export const MISSING_TOPICS = THEORY.filter((t) => t.sections.some((s) => s.blocks.some((b) => "codestep" in b)) && !getCodeModule(t.slug)).map((t) => t.slug);

/** Rough reading-and-running time for a module, from its length and number of programs. */
export function minutesFor(slug: string, words: number, cells: number): string {
  void slug;
  return `${Math.max(5, Math.round(words / 180 + cells * 1.5))} min`;
}
