export type InsightCategory = "loss" | "convergence" | "dynamics" | "accuracy" | "clustering";

export type TrainingInsight = {
  id: string;
  title: string;
  description: string;
  step?: number;
  evidence?: Record<string, number | string | boolean | number[]>;
  algorithm?: string;
  category: InsightCategory;
};

export type ComparisonInsight = {
  id: string;
  title: string;
  description: string;
  evidence?: Record<string, number | string | boolean>;
};
