/**
 * Theory & Math: the formal side of every topic. Text uses $…$ for inline maths;
 * `math` blocks are display equations (KaTeX syntax).
 */
export type WidgetId =
  | "gd-step"
  | "sigmoid"
  | "mse-line"
  | "gini"
  | "distance"
  | "confusion"
  | "ridge-lasso"
  | "poly-degree"
  | "scaling"
  | "bayes"
  | "neuron";

export type Block =
  | { p: string }
  | { math: string }
  | { list: string[] }
  | { code: string }
  /** A highlighted box: "In one sentence", "Intuition", etc. */
  | { callout: { title: string; body: string } }
  /** A worked example revealed one step at a time. */
  | { steps: { title: string; body: string; math?: string }[] }
  /** A derivation folded away until the reader asks for it. */
  | { derive: { title: string; blocks: Block[] } }
  /** An interactive slider widget. */
  | { tryit: WidgetId; caption?: string }
  | { table: { head: string[]; rows: string[][] } }
  | { pitfalls: { mistake: string; fix: string }[] }
  | { quiz: { q: string; options: string[]; answer: number; why: string } };

/** Every piece of text in a block (for tests and search). Display maths is returned wrapped in $$. */
export function blockTexts(b: Block): string[] {
  if ("p" in b) return [b.p];
  if ("math" in b) return [`$$${b.math}$$`];
  if ("list" in b) return b.list;
  if ("code" in b) return [];
  if ("callout" in b) return [b.callout.title, b.callout.body];
  if ("steps" in b) return b.steps.flatMap((s) => [s.title, s.body, ...(s.math ? [`$$${s.math}$$`] : [])]);
  if ("derive" in b) return [b.derive.title, ...b.derive.blocks.flatMap(blockTexts)];
  if ("tryit" in b) return b.caption ? [b.caption] : [];
  if ("table" in b) return [...b.table.head, ...b.table.rows.flat()];
  if ("pitfalls" in b) return b.pitfalls.flatMap((x) => [x.mistake, x.fix]);
  return [b.quiz.q, ...b.quiz.options, b.quiz.why];
}
export type Section = { heading: string; blocks: Block[] };
export type TheoryTopic = {
  slug: string;
  group: "Prerequisites" | "Foundations" | "Regression" | "Classification" | "Clustering" | "Neural networks" | "Workflow";
  title: string;
  summary: string;
  /** Matching lesson or lab, if there is one. */
  learnHref?: string;
  /** Matching game level, if there is one. */
  playHref?: string;
  sections: Section[];
};

import { PREREQ_THEORY } from "./prereq-topics";

import { FOUNDATIONS_THEORY } from "./core/foundations";
import { REGRESSION_THEORY, CLASSIFICATION_THEORY } from "./core/regression-classification";
import { CLUSTERING_THEORY, NN_THEORY, WORKFLOW_THEORY } from "./core/clustering-nn-workflow";

const CORE_THEORY: TheoryTopic[] = [
  ...FOUNDATIONS_THEORY,
  ...REGRESSION_THEORY,
  ...CLASSIFICATION_THEORY,
  ...CLUSTERING_THEORY,
  ...NN_THEORY,
  ...WORKFLOW_THEORY,
];

export const THEORY: TheoryTopic[] = [...PREREQ_THEORY, ...CORE_THEORY];

export const THEORY_GROUPS = ["Prerequisites", "Foundations", "Regression", "Classification", "Clustering", "Neural networks", "Workflow"] as const;
export const getTheory = (slug: string) => THEORY.find((t) => t.slug === slug);
