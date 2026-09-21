import type { PreprocessingConfig, SplitConfig, TaskType } from "@/features/workbench/types";

export type ProjectMilestoneId =
  | "problem"
  | "explore"
  | "quality"
  | "preprocess"
  | "split"
  | "model"
  | "train"
  | "experiment"
  | "evaluate"
  | "interpret"
  | "reflect";

export type ProjectMilestone = {
  id: ProjectMilestoneId;
  order: number;
  tag: string;
  title: string;
  shortDescription: string;
  educationalGoal: string;
  completionCriteria: string;
};

export type ReflectionPrompt = {
  id: string;
  prompt: string;
  guidance: string;
  placeholder: string;
};

export type ExperimentPrompt = {
  title: string;
  question: string;
  parameterName: string;
  defaultVal: number;
  testVal: number;
  explanation: string;
};

export type ProjectDefinition = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  problemStatement: string;
  type: TaskType;
  datasetId: string;
  difficulty: "Beginner" | "Intermediate";
  estimatedMinutes: number;
  modelName: string;
  learningObjectives: string[];
  focusConcepts: string[];
  milestones: ProjectMilestone[];
  reflectionPrompts: ReflectionPrompt[];
  experimentPrompt: ExperimentPrompt;
  lessonsLearned: string[];
  nextConcepts: string[];
};

export type ProjectExperimentRecord = {
  id: string;
  title: string;
  timestamp: number;
  parameterVal: number;
  metricLabel: string;
  metricValue: string | number;
};

export type ProjectState = {
  projectId: string;
  currentMilestoneId: ProjectMilestoneId;
  completedMilestones: ProjectMilestoneId[];
  preprocessingConfig: PreprocessingConfig;
  splitConfig: SplitConfig;
  classificationThreshold: number;
  trainingRunId: string | null;
  experiments: ProjectExperimentRecord[];
  reflections: Record<string, string>;
  completed: boolean;
  completedAt: string | null;
  updatedAt: string;
};
