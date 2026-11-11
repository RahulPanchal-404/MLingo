import katex from "katex";
import { describe, expect, it } from "vitest";

import { GAMES } from "@/features/games/registry";
import { ALL_LESSONS, getLessonBySlug } from "@/features/learning/lessons-data";
import { MODEL_LESSONS } from "@/features/learning/model-lessons";
import { THEORY, blockTexts } from "../topics";

const inline = (s: string) => [...s.matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);
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
  it("core topics are complete: one-line summary, worked example, code, pitfalls and a valid quiz", () => {
    for (const t of THEORY.filter((x) => x.group !== "Prerequisites")) {
      const blocks = t.sections.flatMap((s) => s.blocks);
      expect(blocks.some((b) => "callout" in b), `${t.slug} callout`).toBe(true);
      expect(blocks.some((b) => "steps" in b), `${t.slug} worked example`).toBe(true);
      expect(blocks.some((b) => "code" in b), `${t.slug} code`).toBe(true);
      expect(blocks.some((b) => "pitfalls" in b), `${t.slug} pitfalls`).toBe(true);
      const quizzes = blocks.filter((b): b is Extract<typeof b, { quiz: unknown }> => "quiz" in b);
      expect(quizzes.length, `${t.slug} quiz`).toBeGreaterThan(0);
      for (const { quiz } of quizzes) expect(quiz.answer >= 0 && quiz.answer < quiz.options.length, t.slug).toBe(true);
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
