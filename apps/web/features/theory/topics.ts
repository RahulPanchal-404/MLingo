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
  | { quiz: { q: string; options: string[]; answer: number; why: string } }
  /** A practice problem whose worked solution is folded away. */
  | { problem: { q: string; solution: Block[] } }
  /** A static graph from public/theory/figures (SVG preferred). */
  | { figure: { src: string; alt: string; caption: string } };

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
  if ("problem" in b) return [b.problem.q, ...b.problem.solution.flatMap(blockTexts)];
  if ("figure" in b) return [b.figure.caption];
  return [b.quiz.q, ...b.quiz.options, b.quiz.why];
}
export type Section = { heading: string; blocks: Block[] };
export type TheoryTopic = {
  slug: string;
  group: "Prerequisites" | "Foundations" | "Regression" | "Classification" | "Unsupervised learning" | "Neural networks" | "Workflow";
  title: string;
  summary: string;
  /** Matching lesson or lab, if there is one. */
  learnHref?: string;
  /** Matching game level, if there is one. */
  playHref?: string;
  sections: Section[];
};

import { PREREQ_THEORY } from "./prereq-topics";
import { DEEP } from "./deep";
import { mergeDeep } from "./deep/types";

import { FOUNDATIONS_THEORY } from "./core/foundations";
import { REGRESSION_THEORY, CLASSIFICATION_THEORY } from "./core/regression-classification";
import { CLUSTERING_THEORY, NN_THEORY, WORKFLOW_THEORY } from "./core/clustering-nn-workflow";
import { MORE_CLASSIFICATION_THEORY } from "./core/more-classification";
import { PCA_THEORY, MORE_NN_THEORY, MORE_WORKFLOW_THEORY } from "./core/more-unsupervised-nn-workflow";
import { NEW_REGRESSION_THEORY } from "./core/new-regression";
import { NEW_CLASSIFICATION_THEORY } from "./core/new-classification";
import { NEW_BASICS_THEORY } from "./core/new-basics";
import { applySupplements } from "./core/supplements";
import { RL_THEORY } from "./core/new-rl";
import { TEXTBOOK } from "./core/textbook";

const CORE_THEORY: TheoryTopic[] = [
  ...FOUNDATIONS_THEORY,
  ...NEW_BASICS_THEORY,
  ...RL_THEORY,
  ...REGRESSION_THEORY,
  ...NEW_REGRESSION_THEORY,
  ...CLASSIFICATION_THEORY,
  ...MORE_CLASSIFICATION_THEORY,
  ...NEW_CLASSIFICATION_THEORY,
  ...CLUSTERING_THEORY,
  ...PCA_THEORY,
  ...NN_THEORY,
  ...MORE_NN_THEORY,
  ...WORKFLOW_THEORY,
  ...MORE_WORKFLOW_THEORY,
];

/**
 * Adds the topic's MLingo textbook sections, in textbook order, just before "In Python":
 * the page opens with the short intuition, then the textbook builds the full theory step by step.
 */
function applyTextbook(t: TheoryTopic): TheoryTopic {
  const book = TEXTBOOK[t.slug];
  if (!book?.length) return t;
  const intro: Section = {
    heading: "From the MLingo textbook",
    blocks: [{ callout: { title: "The full theory, step by step", body: "The sections below are the MLingo textbook chapters for this topic, in order. Derivations and from-scratch code are folded: open them when you want the details." } }],
  };
  const at = t.sections.findIndex((s) => s.heading === "In Python");
  const i = at >= 0 ? at : t.sections.findIndex((s) => s.heading === "Common mistakes");
  const pos = i >= 0 ? i : t.sections.length;
  return { ...t, sections: [...t.sections.slice(0, pos), intro, ...book, ...t.sections.slice(pos)] };
}

export const THEORY: TheoryTopic[] = [...PREREQ_THEORY, ...CORE_THEORY].map((t) => applyTextbook(applySupplements(mergeDeep(t, DEEP[t.slug]))));

export const THEORY_GROUPS = ["Prerequisites", "Foundations", "Regression", "Classification", "Unsupervised learning", "Neural networks", "Workflow"] as const;
export const getTheory = (slug: string) => THEORY.find((t) => t.slug === slug);
