import type { Block, Walk } from "../topics";

/** A small example added to a section. `at` = insert after this block index (default: end of section). */
export type ExampleSpec = { at?: number; title: string; kind?: "worked" | "idea"; blocks: Block[] };

export type EasySection = {
  /** Two or three sentences in everyday words, shown first. */
  plain?: string;
  examples?: ExampleSpec[];
  /** Replace block n (for example a formula written in plain text, or a correction). */
  replace?: Record<number, Block>;
  /** New code steps for this section (added to "How to code it", linked from the end of the section). */
  code?: EasyCode[];
};

/** Explanation for one code block. `code` replaces the snippet (self-contained, commented, executed). */
export type EasyCode = { goal: string; code?: string; walk: Walk[]; figure?: { src: string; alt: string } };


/**
 * The easy layer for one topic.
 * `sections` is keyed by section heading; `code` by "<section heading>#<n>", n = code block number in that section (from 0).
 */
export type EasyTopic = { sections?: Record<string, EasySection>; code?: Record<string, EasyCode> };
