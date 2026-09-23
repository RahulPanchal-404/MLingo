import { describe, expect, it } from "vitest";
import { computeDatasetSummary } from "../summary";
import { getWorkbenchDataset } from "../datasets";

describe("Dataset Schema & Unique Concept Explanations", () => {
  it("computes accurate schema summary including distinct unique counts", () => {
    const dataset = getWorkbenchDataset("housing_regression");
    const summary = computeDatasetSummary(dataset);

    expect(summary.name).toBe("Experience & Education Salary");
    expect(summary.rowCount).toBeGreaterThan(0);
    expect(summary.features.length).toBeGreaterThan(0);

    for (const feat of summary.features) {
      expect(feat.uniqueCount).toBeGreaterThan(0);
      expect(typeof feat.dtype).toBe("string");
    }

    if (summary.target) {
      expect(summary.target.name).toBe("salary");
      expect(summary.target.uniqueCount).toBeGreaterThan(0);
    }
  });

  it("handles classification dataset properties cleanly", () => {
    const dataset = getWorkbenchDataset("student_classification");
    const summary = computeDatasetSummary(dataset);

    expect(summary.taskType).toBe("classification");
    expect(summary.target?.name).toBe("passed");
    // Binary classification has 2 unique target values (0 and 1)
    expect(summary.target?.uniqueCount).toBe(2);
  });
});
