import { useMemo } from "react";

import { getWorkbenchDataset } from "@/features/workbench/datasets";
import { DEFAULT_TRAIN, trainAndEvaluateModel, type TrainOptions } from "@/features/workbench/evaluation";
import { fitPreprocessing, transformWithPipeline } from "@/features/workbench/preprocessing";
import { splitTrainTest } from "@/features/workbench/split";
import type { ProjectDefinition, ProjectState } from "./types";

/** Units of each regression target, for readable error messages. */
export const TARGET_UNITS: Record<string, string> = {
  housing_regression: "$k",
  house_price_prediction: "$k",
  movie_recommendations: "stars",
  stock_price_prediction: "$",
};

/**
 * The hyperparameters of the project's baseline run. Training, evaluation and interpretation all use these,
 * so every milestone reports the same model. The experiment milestone changes exactly one of them.
 */
export function baselineOptions(project: ProjectDefinition): TrainOptions {
  const p = project.experimentPrompt;
  return {
    learningRate: p.parameterName === "learning_rate" ? p.defaultVal : project.type === "regression" ? DEFAULT_TRAIN.learningRate : 0.1,
    epochs: DEFAULT_TRAIN.epochs,
    clusters: p.parameterName === "clusters" ? p.defaultVal : DEFAULT_TRAIN.clusters,
  };
}

/** Prepare the project's dataset exactly as the learner configured it, then train and evaluate. */
export function runProject(project: ProjectDefinition, state: ProjectState, override: Partial<TrainOptions> & { threshold?: number } = {}) {
  const dataset = getWorkbenchDataset(project.datasetId);
  const { train: trainRaw, test: testRaw } = splitTrainTest(dataset.rows, state.splitConfig);
  const pipeline = fitPreprocessing(trainRaw, state.preprocessingConfig, dataset.targetColumn);
  const train = transformWithPipeline(trainRaw, pipeline, dataset.targetColumn);
  const test = transformWithPipeline(testRaw, pipeline, dataset.targetColumn);
  const options = { ...baselineOptions(project), ...override };
  const result = trainAndEvaluateModel(train, test, dataset.taskType, dataset.targetColumn, override.threshold ?? state.classificationThreshold, options);
  return { dataset, trainRaw, testRaw, train, test, options, result, units: TARGET_UNITS[project.datasetId] };
}

export function useProjectRun(project: ProjectDefinition, state: ProjectState) {
  return useMemo(() => runProject(project, state), [project, state.splitConfig, state.preprocessingConfig, state.classificationThreshold]); // eslint-disable-line react-hooks/exhaustive-deps
}
