import { describe, expect, it } from "vitest";

import { getTheory } from "@/features/theory/topics";
import { chapters } from "../chapters";
import { getLessonBySlug } from "../lessons-data";
import { PREREQ_LESSONS } from "../prereq-lessons";
import { WATCH } from "../watch-links";

describe("Before you start: math & python", () => {
  it("has six lessons with valid links, a theory page and one correct think answer each", () => {
    expect(PREREQ_LESSONS).toHaveLength(6);
    for (const l of PREREQ_LESSONS) {
      expect(getLessonBySlug(l.slug), l.slug).toBeTruthy();
      expect(getTheory(l.slug), `theory for ${l.slug}`).toBeTruthy();
      expect(l.nowTryIt.href).toBe(`/theory/${l.slug}`);
      if (l.prevLesson) expect(getLessonBySlug(l.prevLesson.slug)).toBeTruthy();
      if (l.nextLesson) expect(getLessonBySlug(l.nextLesson.slug)).toBeTruthy();
      expect(l.thinkPrompt?.options.filter((o) => o.correct)).toHaveLength(1);
    }
  });

  it("theory pages include worked Python code", () => {
    for (const l of PREREQ_LESSONS) {
      const blocks = getTheory(l.slug)!.sections.flatMap((s) => s.blocks);
      expect(blocks.some((b) => "code" in b), l.slug).toBe(true);
    }
  });

  it("appear first in Foundations under their own heading, and every listed lesson exists", () => {
    const f = chapters.find((c) => c.id === "foundations")!;
    expect(f.lessons.slice(0, 6).every((l) => l.group?.startsWith("Before you start"))).toBe(true);
    for (const c of chapters) for (const l of c.lessons) if (l.href.startsWith("/learn/")) expect(getLessonBySlug(l.href.slice(7)), l.href).toBeTruthy();
  });
});

describe("watch links", () => {
  it("every theory topic has 1-3 YouTube links, one per channel at most twice", () => {
    for (const [slug, links] of Object.entries(WATCH)) {
      expect(getTheory(slug), `theory exists for ${slug}`).toBeTruthy();
      expect(links.length).toBeGreaterThan(0);
      expect(links.length).toBeLessThanOrEqual(3);
      for (const l of links) expect(l.url).toMatch(/^https:\/\/www\.youtube\.com\/(watch\?v=[\w-]{11}|playlist\?list=[\w-]+|results\?search_query=.+)$/);
    }
  });
});
