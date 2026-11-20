import type { Block, Section, TheoryTopic } from "../topics";
import type { EasyTopic } from "./types";

export const HOW_TO_CODE = "How to code it";

/**
 * Makes a topic easier to follow:
 * 1. each section opens with plain words and gets small examples;
 * 2. every code block moves to one "How to code it" section, as numbered steps with line-by-line explanations,
 *    and the theory keeps a "Code this" link to its step (each step links back).
 */
export function applyEasy(t: TheoryTopic, e: EasyTopic | undefined): TheoryTopic {
  type Step = { n: number; goal: string; code: string; walk?: Extract<Block, { code: string }>["walk"]; from?: Section; figure?: { src: string; alt: string } };
  const steps: Step[] = [];
  const out: Section[] = [];

  for (const s of t.sections) {
    const es = e?.sections?.[s.heading];
    const blocks: Block[] = [];
    if (es?.plain) blocks.push({ plain: es.plain });
    const examplesAt = (i: number) =>
      (es?.examples ?? []).filter((x) => (x.at ?? s.blocks.length - 1) === i).map((x): Block => ({ example: { title: x.title, kind: x.kind, blocks: x.blocks } }));
    const isPython = s.heading === "In Python";
    const sec: Section = { heading: s.heading, blocks };
    let codeIndex = 0;
    s.blocks.forEach((orig, i) => {
      const b = es?.replace?.[i] ?? orig;
      if ("code" in b) {
        const ec = e?.code?.[`${s.heading}#${codeIndex++}`];
        const step: Step = { n: steps.length + 1, goal: ec?.goal ?? b.goal ?? s.heading.replace(/^[\d.]+\s+/, ""), code: ec?.code ?? b.code, walk: ec?.walk ?? b.walk, figure: ec?.figure, from: isPython ? undefined : sec };
        steps.push(step);
        if (!isPython) blocks.push({ codelink: { n: step.n, goal: step.goal } });
      } else blocks.push(b);
      blocks.push(...examplesAt(i));
    });
    if (s.blocks.length === 0) blocks.push(...examplesAt(-1));
    for (const extra of es?.code ?? []) {
      const step: Step = { n: steps.length + 1, goal: extra.goal, code: extra.code ?? "", walk: extra.walk, figure: extra.figure, from: sec };
      steps.push(step);
      blocks.push({ codelink: { n: step.n, goal: step.goal } });
    }
    if (isPython) continue; // its code now lives in "How to code it"
    out.push(sec);
  }
  if (!steps.length) return { ...t, sections: out };

  // Code comes after all the theory: before the first wrap-up section.
  const before = ["Common mistakes", "Practice problems", "Interview and viva questions", "Summary", "Check yourself"];
  const found = before.map((h) => out.findIndex((s) => s.heading === h)).filter((i) => i >= 0);
  const pos = found.length ? Math.min(...found) : out.length;
  const how: Section = { heading: HOW_TO_CODE, blocks: [] };
  out.splice(pos, 0, how);
  how.blocks = [
    { callout: { title: "Build it one step at a time", body: "Each step below is a complete program you can run on its own. Read the goal, run the code, then read the line-by-line notes under it. Library code (scikit-learn, pandas) is shown; from-scratch code is folded so you can open it when you want to see how the method works inside." } },
    ...steps.map((st): Block => {
      const back = st.from ? out.indexOf(st.from) : -1;
      return { codestep: { n: st.n, goal: st.goal, code: st.code, walk: st.walk, figure: st.figure, open: t.group === "Prerequisites" || undefined, back: back >= 0 ? back : undefined, backTitle: back >= 0 ? out[back].heading : undefined } };
    }),
  ];
  return { ...t, sections: out };
}
