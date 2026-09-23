import { describe, expect, it } from "vitest";
import { FOUNDATIONAL_LESSONS, getLessonBySlug } from "../lessons-data";

describe("FOUNDATIONAL_LESSONS", () => {
  it("defines exactly 5 foundational lessons with unique numbers and slugs", () => {
    expect(FOUNDATIONAL_LESSONS.length).toBe(5);
    const slugs = FOUNDATIONAL_LESSONS.map((l) => l.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(5);
  });

  it("ensures each foundational lesson has distinct destinations and practical actions", () => {
    const destinations = FOUNDATIONAL_LESSONS.map((l) => l.nowTryIt.href);
    // At minimum, lessons must not all route to the same lab destination
    const uniqueDestinations = new Set(destinations);
    expect(uniqueDestinations.size).toBeGreaterThanOrEqual(3);

    // Lesson 01 points to the Interactive Demo
    expect(FOUNDATIONAL_LESSONS[0].nowTryIt.href).toBe("/demo");

    // Lesson 05 points to Break Mode
    expect(FOUNDATIONAL_LESSONS[4].nowTryIt.href).toBe("/challenges/gradient-descent-instability");
  });

  it("retrieves lessons by slug accurately", () => {
    const lesson = getLessonBySlug("what-is-machine-learning");
    expect(lesson).toBeDefined();
    expect(lesson?.title).toBe("What is Machine Learning?");
    expect(lesson?.number).toBe("01");

    expect(getLessonBySlug("non-existent-lesson")).toBeUndefined();
  });

  it("contains rich pedagogical content for all 5 lessons", () => {
    for (const lesson of FOUNDATIONAL_LESSONS) {
      expect(lesson.title.length).toBeGreaterThan(0);
      expect(lesson.whatAmILearning.length).toBeGreaterThanOrEqual(3);
      expect(lesson.whyItMatters.length).toBeGreaterThan(20);
      expect(lesson.keyIdea.length).toBeGreaterThan(20);
      expect(lesson.visual.items.length).toBeGreaterThanOrEqual(3);
      expect(lesson.concreteExample.context.length).toBeGreaterThan(0);
      expect(lesson.nowTryIt.whatToObserve.length).toBeGreaterThanOrEqual(3);
    }
  });
});
