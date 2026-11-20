import katex from "katex";
import { describe, expect, it } from "vitest";

import { GAMES } from "@/features/games/registry";
import { ALL_LESSONS, getLessonBySlug } from "@/features/learning/lessons-data";
import { MODEL_LESSONS } from "@/features/learning/model-lessons";
import { EASY } from "../easy";
import { THEORY, THEORY_BASE, blockTexts } from "../topics";

const inline = (s: string) => [...s.replace(/\\\$/g, "").matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
const gameExists = (href: string) => {
  const m = href.match(/^\/games\/(\w+)\?level=([\w-]+)$/);
  if (!m) return true;
  return GAMES.some((g) => g.id === m[1] && g.levels.some((l) => l.id === m[2]));
};

describe("theory & math", () => {
  it("every equation compiles in KaTeX", () => {
    for (const t of THEORY)
      for (const s of t.sections)
        for (const b of s.blocks) {
          const texts = blockTexts(b).flatMap((t) => (t.startsWith("$$") ? [t.slice(2, -2)] : inline(t)));
          for (const tex of texts) expect(() => katex.renderToString(tex, { throwOnError: true }), `${t.slug}: ${tex}`).not.toThrow();
        }
  });
  it("slugs are unique and links point somewhere real", () => {
    expect(new Set(THEORY.map((t) => t.slug)).size).toBe(THEORY.length);
    for (const t of THEORY) {
      if (t.learnHref?.startsWith("/learn/")) expect(getLessonBySlug(t.learnHref.slice(7)), t.slug).toBeTruthy();
      if (t.playHref) expect(gameExists(t.playHref), t.playHref).toBe(true);
    }
  });
  it("every topic has depth sections", () => {
    for (const t of THEORY) {
      const headings = t.sections.map((s) => s.heading);
      for (const h of ["Explained in depth", "Practice problems", "Interview and viva questions", "Summary"]) expect(headings, `${t.slug}: ${h}`).toContain(h);
    }
  });
  it("core topics are complete: one-line summary, worked example, code, pitfalls and a valid quiz", () => {
    for (const t of THEORY.filter((x) => x.group !== "Prerequisites")) {
      const blocks = t.sections.flatMap((s) => s.blocks);
      expect(blocks.some((b) => "callout" in b), `${t.slug} callout`).toBe(true);
      expect(blocks.some((b) => "steps" in b), `${t.slug} worked example`).toBe(true);
      expect(blocks.some((b) => "codestep" in b), `${t.slug} code`).toBe(true);
      expect(blocks.some((b) => "pitfalls" in b), `${t.slug} pitfalls`).toBe(true);
      const quizzes = blocks.filter((b): b is Extract<typeof b, { quiz: unknown }> => "quiz" in b);
      expect(quizzes.length, `${t.slug} quiz`).toBeGreaterThan(0);
      for (const { quiz } of quizzes) expect(quiz.answer >= 0 && quiz.answer < quiz.options.length, t.slug).toBe(true);
      const headings = t.sections.map((s) => s.heading);
      for (const h of ["Explained in depth", "Practice problems", "Interview and viva questions", "Summary"]) expect(headings, `${t.slug}: ${h}`).toContain(h);
      expect(quizzes.length, `${t.slug} quizzes`).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("model lessons", () => {
  it("9 lessons, unique slugs, valid prev/next and practice links, theory for each", () => {
    expect(MODEL_LESSONS).toHaveLength(9);
    expect(new Set(ALL_LESSONS.map((l) => l.slug)).size).toBe(ALL_LESSONS.length);
    for (const l of MODEL_LESSONS) {
      if (l.prevLesson) expect(getLessonBySlug(l.prevLesson.slug), l.slug).toBeTruthy();
      if (l.nextLesson) expect(getLessonBySlug(l.nextLesson.slug), l.slug).toBeTruthy();
      expect(gameExists(l.nowTryIt.href), l.nowTryIt.href).toBe(true);
      expect(THEORY.some((t) => t.slug === l.slug), `theory for ${l.slug}`).toBe(true);
      expect(l.thinkPrompt?.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });
  it("every game level's lesson link resolves", () => {
    for (const g of GAMES) for (const lv of g.levels) if (lv.lessonSlug) expect(getLessonBySlug(lv.lessonSlug), `${g.id}:${lv.id}`).toBeTruthy();
  });
});

describe("textbook coverage", () => {
  it("every textbook section is attached to a real theory page", async () => {
    const { TEXTBOOK } = await import("../core/textbook");
    for (const slug of Object.keys(TEXTBOOK)) expect(THEORY.some((t) => t.slug === slug), slug).toBe(true);
    const sections = Object.values(TEXTBOOK).flat().filter((s) => /^\d+\.\d+\.\d+ /.test(s.heading));
    expect(sections.length).toBe(385);
  });
});

describe("easy layer", () => {
  it("every example and code note points at a real section or code block", () => {
    for (const [slug, e] of Object.entries(EASY)) {
      const base = THEORY_BASE.find((t) => t.slug === slug);
      expect(base, slug).toBeTruthy();
      const headings = base!.sections.map((s) => s.heading);
      for (const [h, es] of Object.entries(e.sections ?? {})) {
        expect(headings, `${slug}: ${h}`).toContain(h);
        const n = base!.sections.find((s) => s.heading === h)!.blocks.length;
        for (const x of es.examples ?? []) expect((x.at ?? 0) < n, `${slug}: ${h} at ${x.at}`).toBe(true);
        for (const k of Object.keys(es.replace ?? {})) expect(Number(k) < n, `${slug}: ${h} replace ${k}`).toBe(true);
        for (const c of es.code ?? []) expect(c.code?.length, `${slug}: ${h} new code`).toBeTruthy();
      }
      for (const key of Object.keys(e.code ?? {})) {
        const [h, i] = key.split("#");
        const codes = base!.sections.find((s) => s.heading === h)?.blocks.filter((b) => "code" in b) ?? [];
        expect(codes.length > Number(i), `${slug}: ${key}`).toBe(true);
      }
    }
  });
  it("code lives in How to code it, and every walk line is really in its code", () => {
    for (const t of THEORY) {
      expect(t.sections.flatMap((s) => s.blocks).some((b) => "code" in b), `${t.slug} loose code`).toBe(false);
      const steps = t.sections.flatMap((s) => s.blocks).filter((b): b is Extract<typeof b, { codestep: unknown }> => "codestep" in b);
      steps.forEach(({ codestep }, i) => {
        expect(codestep.n, t.slug).toBe(i + 1);
        for (const w of codestep.walk ?? []) expect(codestep.code, `${t.slug} step ${codestep.n}: ${w.line}`).toContain(w.line);
        if (codestep.back !== undefined) expect(t.sections[codestep.back].blocks.some((b) => "codelink" in b && b.codelink.n === codestep.n), `${t.slug} back ${codestep.n}`).toBe(true);
      });
    }
  });
});
