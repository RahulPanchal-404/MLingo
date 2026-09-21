import { describe, expect, it } from "vitest";
import {
  ALL_PROJECTS,
  PROJECT_MILESTONES,
  SALARY_PREDICTION_PROJECT,
  STUDENT_OUTCOME_PROJECT,
  CUSTOMER_SEGMENTATION_PROJECT,
  getAllProjects,
  getProjectById,
  getProjectBySlug,
} from "../definitions";

describe("Project Studio Definitions", () => {
  it("contains exactly 3 educational projects", () => {
    expect(ALL_PROJECTS).toHaveLength(3);
    expect(getAllProjects()).toHaveLength(3);
  });

  it("contains all 11 standardized guided milestones in chronological order", () => {
    expect(PROJECT_MILESTONES).toHaveLength(11);
    for (let i = 0; i < PROJECT_MILESTONES.length; i++) {
      expect(PROJECT_MILESTONES[i].order).toBe(i + 1);
      expect(PROJECT_MILESTONES[i].tag).toBe(
        `Milestone ${String(i + 1).padStart(2, "0")}`
      );
      expect(PROJECT_MILESTONES[i].educationalGoal.length).toBeGreaterThan(10);
      expect(PROJECT_MILESTONES[i].completionCriteria.length).toBeGreaterThan(5);
    }
  });

  it("defines Salary Prediction as regression on housing_regression dataset", () => {
    expect(SALARY_PREDICTION_PROJECT.id).toBe("salary-prediction");
    expect(SALARY_PREDICTION_PROJECT.slug).toBe("salary-prediction");
    expect(SALARY_PREDICTION_PROJECT.type).toBe("regression");
    expect(SALARY_PREDICTION_PROJECT.datasetId).toBe("housing_regression");
    expect(SALARY_PREDICTION_PROJECT.milestones).toHaveLength(11);
    expect(SALARY_PREDICTION_PROJECT.reflectionPrompts.length).toBeGreaterThanOrEqual(4);
    expect(SALARY_PREDICTION_PROJECT.experimentPrompt.parameterName).toBe("learning_rate");
  });

  it("defines Student Exam Outcome as binary classification on student_classification dataset", () => {
    expect(STUDENT_OUTCOME_PROJECT.id).toBe("student-outcome");
    expect(STUDENT_OUTCOME_PROJECT.slug).toBe("student-outcome");
    expect(STUDENT_OUTCOME_PROJECT.type).toBe("classification");
    expect(STUDENT_OUTCOME_PROJECT.datasetId).toBe("student_classification");
    expect(STUDENT_OUTCOME_PROJECT.milestones).toHaveLength(11);
    expect(STUDENT_OUTCOME_PROJECT.reflectionPrompts.length).toBeGreaterThanOrEqual(4);
    expect(STUDENT_OUTCOME_PROJECT.experimentPrompt.parameterName).toBe("threshold");
  });

  it("defines Customer Retail Segmentation as clustering on customer_clustering dataset", () => {
    expect(CUSTOMER_SEGMENTATION_PROJECT.id).toBe("customer-segmentation");
    expect(CUSTOMER_SEGMENTATION_PROJECT.slug).toBe("customer-segmentation");
    expect(CUSTOMER_SEGMENTATION_PROJECT.type).toBe("clustering");
    expect(CUSTOMER_SEGMENTATION_PROJECT.datasetId).toBe("customer_clustering");
    expect(CUSTOMER_SEGMENTATION_PROJECT.milestones).toHaveLength(11);
    expect(CUSTOMER_SEGMENTATION_PROJECT.reflectionPrompts.length).toBeGreaterThanOrEqual(4);
    expect(CUSTOMER_SEGMENTATION_PROJECT.experimentPrompt.parameterName).toBe("clusters");
  });

  it("resolves projects cleanly by slug and ID", () => {
    expect(getProjectBySlug("salary-prediction")?.title).toBe("Salary Prediction");
    expect(getProjectBySlug("student-outcome")?.title).toBe("Student Exam Outcome");
    expect(getProjectBySlug("customer-segmentation")?.title).toBe("Customer Retail Segmentation");
    expect(getProjectBySlug("non-existent")).toBeUndefined();

    expect(getProjectById("salary-prediction").id).toBe("salary-prediction");
    expect(() => getProjectById("non-existent")).toThrowError();
  });
});
