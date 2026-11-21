import { describe, expect, it } from "vitest";

import { getProjectBySlug } from "@/features/projects/definitions";
import { getTheory } from "@/features/theory/topics";

import { ALGO_GUIDES, CODE_MODULES, CODE_PARTS, MISSING_TOPICS } from "../curriculum";
import { GUIDE_MODULES } from "../guides";
import { LESSONS } from "../lessons";
import type { Program } from "../types";

const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function programs(): { where: string; p: Program }[] {
  const out: { where: string; p: Program }[] = [];
  for (const g of Object.values(GUIDE_MODULES))
    for (const s of g.sections) for (const b of s.blocks) if ("program" in b) out.push({ where: `${g.slug}: ${b.program.goal}`, p: b.program });
  for (const [slug, g] of Object.entries(ALGO_GUIDES)) if (g.recipe) out.push({ where: `${slug}: template`, p: g.recipe });
  return out;
}

describe("code track", () => {
  it("every module resolves to a guide or a theory topic, with no duplicates", () => {
    const slugs = CODE_PARTS.flatMap((p) => p.entries.map((e) => e.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(Boolean(GUIDE_MODULES[s] || getTheory(s)), s).toBe(true);
  });

  it("every theory topic with programs has a Code page", () => {
    expect(MISSING_TOPICS).toEqual([]);
  });

  it("every practical guide belongs to a module, and every linked project exists", () => {
    for (const slug of Object.keys(ALGO_GUIDES)) expect(CODE_MODULES.some((m) => m.slug === slug), slug).toBe(true);
    for (const m of CODE_MODULES) if (m.project) expect(getProjectBySlug(m.project), m.project).toBeDefined();
  });

  it("every explained line really appears in its program, and programs show their output", () => {
    for (const { where, p } of programs()) {
      for (const w of p.walk) expect(p.code, `${where}: ${w.line}`).toContain(w.line);
      if ((p.lang ?? "python") === "python" && p.code.includes("print(") && !p.code.includes("FastAPI")) expect(p.code, where).toContain("# Output:");
    }
  });

  it("lessons belong to modules, and every Python cell that prints shows its output", () => {
    for (const [slug, lesson] of Object.entries(LESSONS)) {
      expect(CODE_MODULES.some((m) => m.slug === slug), slug).toBe(true);
      for (const s of lesson.sections)
        for (const b of s.blocks)
          if ("cell" in b && b.cell.lang === "python" && b.cell.code.includes("print(")) expect(b.cell.output, `${slug}: ${s.heading}`).toBeTruthy();
    }
    expect(EMOJI.test(JSON.stringify(LESSONS))).toBe(false);
  });

  it("has no emojis", () => {
    expect(EMOJI.test(JSON.stringify({ GUIDE_MODULES, ALGO_GUIDES, CODE_PARTS }))).toBe(false);
  });
});
