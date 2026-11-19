import katex from "katex";
import { describe, expect, it } from "vitest";
import { blockTexts } from "@/features/theory/topics";
import { getLessonBySlug } from "../lessons-data";
import { WALKTHROUGHS } from "../walkthroughs";

const inline = (s: string) => [...s.replace(/\\\$/g, "").matchAll(/\$([^$]+)\$/g)].map((m) => m[1]);

describe("lesson walkthroughs", () => {
  it("belong to real lessons and have the core parts", () => {
    for (const [slug, sections] of Object.entries(WALKTHROUGHS)) {
      expect(getLessonBySlug(slug), slug).toBeTruthy();
      const headings = sections.map((s) => s.heading);
      expect(headings[0], slug).toBe("Definition");
      expect(headings, slug).toContain("Frequently asked questions");
      expect(headings, slug).toContain("Practice");
      expect(sections.some((s) => s.blocks.some((b) => "code" in b)), `${slug} code`).toBe(true);
    }
  });
  it("every equation compiles in KaTeX", () => {
    for (const [slug, sections] of Object.entries(WALKTHROUGHS))
      for (const s of sections)
        for (const b of s.blocks)
          for (const tex of blockTexts(b).flatMap((t) => (t.startsWith("$$") ? [t.slice(2, -2)] : inline(t))))
            expect(() => katex.renderToString(tex, { throwOnError: true }), `${slug}: ${tex}`).not.toThrow();
  });
});
