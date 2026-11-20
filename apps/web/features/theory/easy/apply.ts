import type { Block, Section, TheoryTopic } from "../topics";
import type { EasyTopic } from "./types";

export const HOW_TO_CODE = "How to code it";

/**
 * Makes a topic easier to follow:
 * 1. each section opens with plain words and gets small examples;
 * 2. every code block moves to one "How to code it" section, as numbered steps with line-by-line explanations,
 *    and the theory keeps a "Code this" link to its step (each step links back).
 */
/** Turns a note's inline maths into plain text so it can sit in a code comment. */
export function plainNote(say: string): string {
  let t = say.replace(/`/g, "");
  for (let k = 0; k < 3; k++) t = t.replace(/\\frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)").replace(/\\sqrt\{([^{}]*)\}/g, "sqrt($1)");
  const sym: Record<string, string> = { times: "×", cdot: "·", to: "→", approx: "≈", lambda: "λ", alpha: "α", beta: "β", tau: "τ", delta: "δ", sigma: "σ", mu: "μ", pi: "π", leq: "≤", geq: "≥", le: "≤", ge: "≥", ne: "≠", infty: "∞", in: "∈", odot: "⊙", hat: "", tanh: "tanh", log: "log", exp: "exp", sqrt: "sqrt", mathbb: "", text: "", operatorname: "", lVert: "‖", rVert: "‖", ldots: "…", dots: "…" };
  t = t.replace(/\\([a-zA-Z]+)/g, (m, w: string) => (w in sym ? sym[w] : w));
  return t.replace(/\\[,;! ]/g, " ").replace(/[${}]/g, "").replace(/\s+/g, " ").trim();
}

/** Writes each line-by-line note into the code as a comment just above the line it explains. */
export function annotate(code: string, walk?: { line: string; say: string }[]): string {
  if (!walk?.length) return code;
  const lines = code.split("\n");
  const notes = new Map<number, string[]>();
  for (const w of walk) {
    const first = w.line.split("\n")[0].trim();
    const at = lines.findIndex((l) => l.includes(first));
    if (at < 0) continue;
    const indent = lines[at].match(/^\s*/)?.[0] ?? "";
    const words = plainNote(w.say).split(" ");
    const wrapped: string[] = [];
    let cur = "";
    for (const word of words) {
      if (cur && (indent.length + 4 + cur.length + word.length) > 78) { wrapped.push(cur); cur = word; } else cur = cur ? `${cur} ${word}` : word;
    }
    if (cur) wrapped.push(cur);
    notes.set(at, [...(notes.get(at) ?? []), ...wrapped.map((x, i) => `${indent}# ${i === 0 ? "▶ " : "  "}${x}`)]);
  }
  return lines.flatMap((l, i) => [...(notes.get(i) ?? []), l]).join("\n");
}

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
      let b = es?.replace?.[String(i)] ?? orig;
      if ("derive" in b) {
        const inner = b.derive.blocks.map((x, j) => es?.replace?.[`${i}.d.${j}`] ?? x);
        b = { derive: { ...b.derive, blocks: inner } };
      }
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
    { callout: { title: "Build it one step at a time", body: "Each step below is a complete program you can run on its own. Read the goal, then the code: every important line has a comment (marked ▶) saying what it does and why. The same notes are listed under the code, and the printed output is shown at the bottom of each program." } },
    ...steps.map((st): Block => {
      const back = st.from ? out.indexOf(st.from) : -1;
      return { codestep: { n: st.n, goal: st.goal, code: annotate(st.code, st.walk), walk: st.walk, figure: st.figure, open: true, back: back >= 0 ? back : undefined, backTitle: back >= 0 ? out[back].heading : undefined } };
    }),
  ];
  return { ...t, sections: out };
}
