import { describe, expect, it } from "vitest";
import {
  AVAILABLE_WORKBENCH_DATASETS,
  getWorkbenchDataset,
} from "../datasets";
import { computeDatasetSummary } from "../summary";
import { analyzeDataQuality } from "../quality";

describe("Workbench Datasets & Metadata", () => {
  it("provides deterministic educational datasets for all 3 tasks", () => {
    expect(AVAILABLE_WORKBENCH_DATASETS).toHaveLength(3);

    const reg = getWorkbenchDataset("housing_regression");
    expect(reg.taskType).toBe("regression");
    expect(reg.rows).toHaveLength(20);
    expect(reg.targetColumn).toBe("salary");

    const clf = getWorkbenchDataset("student_classification");
    expect(clf.taskType).toBe("classification");
    expect(clf.rows).toHaveLength(20);
    expect(clf.targetColumn).toBe("passed");

    const clust = getWorkbenchDataset("customer_clustering");
    expect(clust.taskType).toBe("clustering");
    expect(clust.rows).toHaveLength(12);
    expect(clust.targetColumn).toBeUndefined();
  });

  it("computes accurate dataset summary for regression", () => {
    const reg = getWorkbenchDataset("housing_regression");
    const summary = computeDatasetSummary(reg);

    expect(summary.rowCount).toBe(20);
    expect(summary.featureCount).toBe(3);
    expect(summary.target?.name).toBe("salary");
    expect(summary.target?.minValue).toBe(45);
    expect(summary.target?.maxValue).toBe(155);

    const missingFeat = summary.features.find((f) => f.name === "projects");
    expect(missingFeat?.missingCount).toBe(1);
    expect(missingFeat?.dtype).toBe("numeric");

    const catFeat = summary.features.find((f) => f.name === "education");
    expect(catFeat?.dtype).toBe("categorical");
    expect(catFeat?.missingCount).toBe(0);
  });

  it("computes accurate dataset summary for classification", () => {
    const clf = getWorkbenchDataset("student_classification");
    const summary = computeDatasetSummary(clf);

    expect(summary.rowCount).toBe(20);
    expect(summary.target?.taskType).toBe("classification");
    expect(summary.target?.classDistribution).toBeDefined();
    expect(summary.target?.classDistribution?.["0"]).toBe(8);
    expect(summary.target?.classDistribution?.["1"]).toBe(12);
  });

  it("analyzes data quality accurately", () => {
    const clf = getWorkbenchDataset("student_classification");
    const quality = analyzeDataQuality(clf.rows, clf.targetColumn);

    expect(quality.totalMissingValues).toBe(1);
    expect(quality.columnsWithMissing).toContain("study_hours");
    expect(quality.duplicateRowsCount).toBe(0);
    expect(quality.constantColumns).toHaveLength(0);
    expect(quality.classBalance?.["0"]).toBeCloseTo(0.4, 1);
    expect(quality.classBalance?.["1"]).toBeCloseTo(0.6, 1);
  });
});
