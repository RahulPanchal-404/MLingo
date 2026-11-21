import type { Block, Walk } from "@/features/theory/topics";

/** A complete program with the explanation shown below it. */
export type Program = {
  goal: string;
  code: string;
  walk: Walk[];
  /** How the code block is labelled; defaults to Python. */
  lang?: "python" | "terminal" | "text";
};

export type GuideBlock = Block | { program: Program };

/** A Code track module that is not tied to one theory topic (setup, preprocessing, serving). */
export type GuideModule = {
  slug: string;
  title: string;
  summary: string;
  sections: { heading: string; blocks: GuideBlock[] }[];
};

/** The practical part of an algorithm or workflow page. */
export type AlgoGuide = {
  use: string[];
  avoid: string[];
  prep: string[];
  recipe?: Program;
  checks: { if: string; do: string }[];
  optimise: { what: string; when: string; not: string }[];
};
