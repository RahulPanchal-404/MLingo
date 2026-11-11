import type { Block, Section, TheoryTopic } from "../topics";

type Quiz = Extract<Block, { quiz: unknown }>["quiz"];

/** Extra depth for one topic, merged into its page. */
export type Deep = {
  /** Longer explanation, placed right after the first section. */
  explain: Block[];
  /** Further sections (variants, a second example), placed before "In Python". */
  extra?: Section[];
  /** Practice problems with folded solutions. */
  practice: { q: string; solution: Block[] }[];
  /** Interview / viva questions with model answers. */
  interview: { q: string; a: string }[];
  /** The points to remember. */
  summary: string[];
  /** More quiz questions, added to "Check yourself". */
  quiz: Quiz[];
};

export function mergeDeep(t: TheoryTopic, d: Deep | undefined): TheoryTopic {
  if (!d) return t;
  const hasPython = t.sections.some((s) => s.heading === "In Python");
  const out: Section[] = [];
  t.sections.forEach((s, i) => {
    if (s.heading === "In Python" && d.extra) out.push(...d.extra);
    if (s.heading === "Check yourself") {
      if (!hasPython && d.extra) out.push(...d.extra);
      out.push({ heading: "Practice problems", blocks: d.practice.map((p) => ({ problem: p })) });
      out.push({ heading: "Interview and viva questions", blocks: d.interview.map((x) => ({ problem: { q: x.q, solution: [{ p: x.a }] } })) });
      out.push({ heading: "Summary", blocks: [{ list: d.summary }] });
      out.push({ ...s, blocks: [...s.blocks, ...d.quiz.map((quiz) => ({ quiz }))] });
      return;
    }
    out.push(s);
    if (i === 0) out.push({ heading: "Explained in depth", blocks: d.explain });
  });
  return { ...t, sections: out };
}
