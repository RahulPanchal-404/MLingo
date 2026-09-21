import { beforeEach, describe, expect, it } from "vitest";
import {
  createDefaultProjectState,
  markMilestoneComplete,
  updateProjectState,
} from "../project-storage";
import { PROJECT_MILESTONES, SALARY_PREDICTION_PROJECT } from "../definitions";
import { readLearningActivity, recordLearningActivity } from "@/features/progress/activity";

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

describe("Project Studio Runner & Milestone Logic", () => {
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

  it("progresses sequentially through all 11 milestones until project completion", () => {
    let state = createDefaultProjectState("salary-prediction");

    for (const milestone of PROJECT_MILESTONES) {
      state = markMilestoneComplete("salary-prediction", milestone.id);
      expect(state.completedMilestones).toContain(milestone.id);
    }

    expect(state.completed).toBe(true);
    expect(state.completedAt).not.toBeNull();
    expect(state.completedMilestones).toHaveLength(11);
  });

  it("updates configurations and reflects them in state", () => {
    const updated1 = updateProjectState("student-outcome", {
      classificationThreshold: 0.35,
    });
    expect(updated1.classificationThreshold).toBe(0.35);

    const updated2 = updateProjectState("student-outcome", {
      preprocessingConfig: {
        numericScaling: "minmax",
        missingImputation: "mean_mode",
        categoricalEncoding: "onehot",
      },
    });
    expect(updated2.preprocessingConfig.numericScaling).toBe("minmax");
  });

  it("appends experiment records into project state", () => {
    const s1 = updateProjectState("customer-segmentation", {
      experiments: [
        {
          id: "exp-1",
          title: "K=3 experiment",
          timestamp: Date.now(),
          parameterVal: 3,
          metricLabel: "Inertia",
          metricValue: "142.6",
        },
      ],
    });
    expect(s1.experiments).toHaveLength(1);
    expect(s1.experiments[0].metricValue).toBe("142.6");
  });

  it("stores reflection answers and links to progress activity", () => {
    const s = updateProjectState("salary-prediction", {
      reflections: {
        target: "The target is software engineer salary in thousands of dollars.",
        preprocessing: "Mean imputation for missing project counts was required.",
      },
    });
    expect(s.reflections.target).toContain("salary");
    expect(s.reflections.preprocessing).toContain("Mean imputation");

    // Record learning activity
    recordLearningActivity({
      projectsCompleted: 1,
      concepts: SALARY_PREDICTION_PROJECT.focusConcepts,
    });

    const activity = readLearningActivity();
    expect(activity.projectsCompleted).toBe(1);
    expect(activity.concepts).toContain("Linear Regression");
    expect(activity.concepts).toContain("Z-Score Scaling");
  });
});
