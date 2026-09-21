import { beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultProjectState,
  getOverallProjectStats,
  getProjectProgress,
  loadAllProjectStates,
  loadProjectState,
  markMilestoneComplete,
  resetProjectState,
  saveProjectState,
} from "../project-storage";
import { ALL_PROJECTS } from "../definitions";

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

describe("Project Studio Storage & State Management", () => {
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

  it("creates a clean default state with milestone 01 'problem'", () => {
    const state = createDefaultProjectState("salary-prediction");
    expect(state.projectId).toBe("salary-prediction");
    expect(state.currentMilestoneId).toBe("problem");
    expect(state.completedMilestones).toEqual([]);
    expect(state.completed).toBe(false);
    expect(state.experiments).toEqual([]);
    expect(state.preprocessingConfig.numericScaling).toBe("standard");
    expect(state.splitConfig.trainRatio).toBe(0.8);
  });

  it("returns default state when storage is empty", () => {
    const state = loadProjectState("salary-prediction");
    expect(state.projectId).toBe("salary-prediction");
    expect(state.currentMilestoneId).toBe("problem");
  });

  it("saves and loads project state from localStorage", () => {
    const initial = createDefaultProjectState("student-outcome");
    initial.currentMilestoneId = "explore";
    initial.completedMilestones = ["problem"];
    saveProjectState(initial);

    const loaded = loadProjectState("student-outcome");
    expect(loaded.projectId).toBe("student-outcome");
    expect(loaded.currentMilestoneId).toBe("explore");
    expect(loaded.completedMilestones).toEqual(["problem"]);
  });

  it("safely handles malformed and corrupted JSON in localStorage", () => {
    memoryStorage.setItem("mlingo-projects-state", "NOT_VALID_JSON{{{");
    const state = loadProjectState("customer-segmentation");
    expect(state.projectId).toBe("customer-segmentation");
    expect(state.currentMilestoneId).toBe("problem");
    expect(loadAllProjectStates()).toEqual({});
  });

  it("safely handles non-object JSON values", () => {
    memoryStorage.setItem("mlingo-projects-state", JSON.stringify(["an", "array"]));
    const state = loadProjectState("salary-prediction");
    expect(state.currentMilestoneId).toBe("problem");
  });

  it("advances milestone and tracks completion accurately", () => {
    const s1 = markMilestoneComplete("salary-prediction", "problem");
    expect(s1.completedMilestones).toContain("problem");
    expect(s1.currentMilestoneId).toBe("explore");

    const s2 = markMilestoneComplete("salary-prediction", "explore");
    expect(s2.completedMilestones).toContain("problem");
    expect(s2.completedMilestones).toContain("explore");
    expect(s2.currentMilestoneId).toBe("quality");
  });

  it("resets project state completely", () => {
    markMilestoneComplete("customer-segmentation", "problem");
    markMilestoneComplete("customer-segmentation", "explore");

    const fresh = resetProjectState("customer-segmentation");
    expect(fresh.completedMilestones).toEqual([]);
    expect(fresh.currentMilestoneId).toBe("problem");
    expect(fresh.completed).toBe(false);
  });

  it("computes progress percentages and statuses accurately", () => {
    const state = createDefaultProjectState("salary-prediction");
    expect(getProjectProgress(state).status).toBe("Not Started");
    expect(getProjectProgress(state).percentage).toBe(0);

    state.completedMilestones = ["problem", "explore", "quality"];
    expect(getProjectProgress(state).status).toBe("In Progress");
    expect(getProjectProgress(state).percentage).toBe(27); // 3/11 = 27%

    state.completed = true;
    state.completedMilestones = [
      "problem",
      "explore",
      "quality",
      "preprocess",
      "split",
      "model",
      "train",
      "experiment",
      "evaluate",
      "interpret",
      "reflect",
    ];
    expect(getProjectProgress(state).status).toBe("Completed");
    expect(getProjectProgress(state).percentage).toBe(100);
  });

  it("computes overall project statistics across all projects", () => {
    const stats0 = getOverallProjectStats(ALL_PROJECTS);
    expect(stats0.notStarted).toBe(3);
    expect(stats0.inProgress).toBe(0);
    expect(stats0.completed).toBe(0);

    // Start one project
    markMilestoneComplete("salary-prediction", "problem");
    const stats1 = getOverallProjectStats(ALL_PROJECTS);
    expect(stats1.notStarted).toBe(2);
    expect(stats1.inProgress).toBe(1);
    expect(stats1.completed).toBe(0);
  });
});
