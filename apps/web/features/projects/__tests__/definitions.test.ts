import { describe, expect, it } from "vitest";
import {
  ALL_PROJECTS,
  PROJECT_MILESTONES,
  SALARY_PREDICTION_PROJECT,
  STUDENT_OUTCOME_PROJECT,
  CUSTOMER_SEGMENTATION_PROJECT,
  HOUSE_PRICE_PREDICTION_PROJECT,
  CUSTOMER_RFM_PROJECT,
  EMAIL_SPAM_PROJECT,
  DIGIT_RECOGNITION_PROJECT,
  MOVIE_RECOMMENDATION_PROJECT,
  STOCK_PREDICTION_PROJECT,
  CREDIT_FRAUD_PROJECT,
  getAllProjects,
  getProjectById,
  getProjectBySlug,
} from "../definitions";

describe("Project Studio Definitions", () => {
  it("contains exactly 10 educational projects with sequential numbering", () => {
    expect(ALL_PROJECTS).toHaveLength(10);
    expect(getAllProjects()).toHaveLength(10);

    for (let i = 0; i < ALL_PROJECTS.length; i++) {
      expect(ALL_PROJECTS[i].projectNumber).toBe(i + 1);
      expect(ALL_PROJECTS[i].milestones).toHaveLength(11);
      expect(ALL_PROJECTS[i].reflectionPrompts.length).toBeGreaterThanOrEqual(2);
      expect(ALL_PROJECTS[i].experimentPrompt).toBeDefined();
      expect(ALL_PROJECTS[i].pythonSourceCode).toBeDefined();
      expect(ALL_PROJECTS[i].technologiesUsed?.length).toBeGreaterThanOrEqual(3);
    }
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

  it("defines Salary Prediction as Project 1 (regression)", () => {
    expect(SALARY_PREDICTION_PROJECT.id).toBe("salary-prediction");
    expect(SALARY_PREDICTION_PROJECT.projectNumber).toBe(1);
    expect(SALARY_PREDICTION_PROJECT.type).toBe("regression");
    expect(SALARY_PREDICTION_PROJECT.datasetId).toBe("housing_regression");
  });

  it("defines Student Exam Outcome as Project 2 (classification)", () => {
    expect(STUDENT_OUTCOME_PROJECT.id).toBe("student-outcome");
    expect(STUDENT_OUTCOME_PROJECT.projectNumber).toBe(2);
    expect(STUDENT_OUTCOME_PROJECT.type).toBe("classification");
  });

  it("defines Customer Retail Segmentation as Project 3 (clustering)", () => {
    expect(CUSTOMER_SEGMENTATION_PROJECT.id).toBe("customer-segmentation");
    expect(CUSTOMER_SEGMENTATION_PROJECT.projectNumber).toBe(3);
    expect(CUSTOMER_SEGMENTATION_PROJECT.type).toBe("clustering");
  });

  it("defines House Price Prediction as Project 4 (regression)", () => {
    expect(HOUSE_PRICE_PREDICTION_PROJECT.id).toBe("house-price-prediction");
    expect(HOUSE_PRICE_PREDICTION_PROJECT.projectNumber).toBe(4);
    expect(HOUSE_PRICE_PREDICTION_PROJECT.type).toBe("regression");
    expect(HOUSE_PRICE_PREDICTION_PROJECT.datasetId).toBe("house_price_prediction");
  });

  it("defines Customer RFM Segmentation as Project 5 (clustering)", () => {
    expect(CUSTOMER_RFM_PROJECT.id).toBe("customer-segmentation-rfm");
    expect(CUSTOMER_RFM_PROJECT.projectNumber).toBe(5);
    expect(CUSTOMER_RFM_PROJECT.type).toBe("clustering");
    expect(CUSTOMER_RFM_PROJECT.datasetId).toBe("customer_rfm_clustering");
  });

  it("defines Email Spam Detection as Project 6 (classification)", () => {
    expect(EMAIL_SPAM_PROJECT.id).toBe("email-spam-detection");
    expect(EMAIL_SPAM_PROJECT.projectNumber).toBe(6);
    expect(EMAIL_SPAM_PROJECT.type).toBe("classification");
    expect(EMAIL_SPAM_PROJECT.datasetId).toBe("email_spam_detection");
  });

  it("defines Handwritten Digit Recognition as Project 7 (classification)", () => {
    expect(DIGIT_RECOGNITION_PROJECT.id).toBe("digit-recognition");
    expect(DIGIT_RECOGNITION_PROJECT.projectNumber).toBe(7);
    expect(DIGIT_RECOGNITION_PROJECT.type).toBe("classification");
    expect(DIGIT_RECOGNITION_PROJECT.datasetId).toBe("digit_recognition");
  });

  it("defines Movie Recommendation System as Project 8 (regression)", () => {
    expect(MOVIE_RECOMMENDATION_PROJECT.id).toBe("movie-recommendation");
    expect(MOVIE_RECOMMENDATION_PROJECT.projectNumber).toBe(8);
    expect(MOVIE_RECOMMENDATION_PROJECT.type).toBe("regression");
    expect(MOVIE_RECOMMENDATION_PROJECT.datasetId).toBe("movie_recommendations");
  });

  it("defines Stock Price Prediction as Project 9 (regression)", () => {
    expect(STOCK_PREDICTION_PROJECT.id).toBe("stock-price-prediction");
    expect(STOCK_PREDICTION_PROJECT.projectNumber).toBe(9);
    expect(STOCK_PREDICTION_PROJECT.type).toBe("regression");
    expect(STOCK_PREDICTION_PROJECT.datasetId).toBe("stock_price_prediction");
  });

  it("defines Credit Card Fraud Detection as Project 10 (classification)", () => {
    expect(CREDIT_FRAUD_PROJECT.id).toBe("fraud-detection");
    expect(CREDIT_FRAUD_PROJECT.projectNumber).toBe(10);
    expect(CREDIT_FRAUD_PROJECT.type).toBe("classification");
    expect(CREDIT_FRAUD_PROJECT.datasetId).toBe("credit_card_fraud");
  });

  it("resolves all 10 projects cleanly by slug and ID", () => {
    for (const project of ALL_PROJECTS) {
      expect(getProjectBySlug(project.slug)?.id).toBe(project.id);
      expect(getProjectById(project.id).slug).toBe(project.slug);
    }
    expect(getProjectBySlug("non-existent")).toBeUndefined();
    expect(() => getProjectById("non-existent")).toThrowError();
  });
});
