import { beforeEach, describe, expect, it } from "vitest";
import {
  getPortfolioProjects,
  getPortfolioSummary,
} from "../portfolio-helpers";
import { saveProjectState } from "@/features/projects/project-storage";
import { ALL_PROJECTS } from "@/features/projects/definitions";

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("Portfolio Helpers & Aggregations", () => {
  let memoryStorage: MemoryStorage;

  beforeEach(() => {
    memoryStorage = new MemoryStorage();
    Object.defineProperty(globalThis, "window", {
      value: {
        localStorage: memoryStorage,
        dispatchEvent: () => true,
        addEventListener: () => {},
        removeEventListener: () => {},
      },
      writable: true,
      configurable: true,
    });
  });

  it("extracts all projects with initial 'Not Started' status when empty", () => {
    const projects = getPortfolioProjects();
    expect(projects).toHaveLength(ALL_PROJECTS.length);
    for (const p of projects) {
      expect(p.status).toBe("Not Started");
      expect(p.percentage).toBe(0);
      expect(p.experimentCount).toBe(0);
    }
  });

  it("calculates summary statistics accurately when projects progress", () => {
    const proj = ALL_PROJECTS[0];
    saveProjectState({
      projectId: proj.id,
      currentMilestoneId: "experiment",
      completedMilestones: ["problem", "explore", "quality", "preprocess", "split", "model", "train"],
      preprocessingConfig: { numericScaling: "standard", missingImputation: "mean_mode", categoricalEncoding: "onehot" },
      splitConfig: { trainRatio: 0.8, seed: 42 },
      classificationThreshold: 0.5,
      trainingRunId: "run-123",
      experiments: [
        { id: "e1", title: "Double LR", timestamp: 1, parameterVal: 0.2, metricLabel: "MSE", metricValue: 0.04 },
      ],
      reflections: { problem: "Framed well" },
      completed: false,
      completedAt: null,
      updatedAt: new Date().toISOString(),
    });

    const summary = getPortfolioSummary();
    expect(summary.inProgressProjects).toBe(1);
    expect(summary.completedProjects).toBe(0);
    expect(summary.notStartedProjects).toBe(ALL_PROJECTS.length - 1);
    expect(summary.totalExperiments).toBeGreaterThanOrEqual(1);

    const projects = getPortfolioProjects();
    const updated = projects.find((p) => p.project.id === proj.id);
    expect(updated?.status).toBe("In Progress");
    expect(updated?.experimentCount).toBe(1);
    expect(updated?.reflectionCount).toBe(1);
    expect(updated?.percentage).toBeGreaterThan(0);
  });
});
