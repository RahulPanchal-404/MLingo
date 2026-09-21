"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import type {
  ProjectDefinition,
  ProjectExperimentRecord,
  ProjectMilestoneId,
  ProjectState,
} from "./types";
import {
  loadProjectState,
  markMilestoneComplete,
  resetProjectState,
  saveProjectState,
  updateProjectState,
} from "./project-storage";
import { PROJECT_MILESTONES } from "./definitions";
import { ProjectHeader } from "./components/project-header";
import { ProjectStepper } from "./components/project-stepper";
import { MilestoneProblemView } from "./components/milestone-problem-view";
import { MilestoneExploreView } from "./components/milestone-explore-view";
import { MilestoneQualityView } from "./components/milestone-quality-view";
import { MilestonePreprocessView } from "./components/milestone-preprocess-view";
import { MilestoneSplitView } from "./components/milestone-split-view";
import { MilestoneModelView } from "./components/milestone-model-view";
import { MilestoneTrainView } from "./components/milestone-train-view";
import { MilestoneExperimentView } from "./components/milestone-experiment-view";
import { MilestoneEvaluateView } from "./components/milestone-evaluate-view";
import { MilestoneInterpretView } from "./components/milestone-interpret-view";
import { MilestoneReflectView } from "./components/milestone-reflect-view";
import { recordLearningActivity, recordRunConcepts } from "@/features/progress/activity";
import type { PreprocessingConfig, SplitConfig } from "@/features/workbench/types";

const emptySubscribe = () => () => {};

export type ProjectRunnerProps = {
  project: ProjectDefinition;
};

export function ProjectRunner({ project }: ProjectRunnerProps) {
  const [state, setState] = useState<ProjectState>(() => loadProjectState(project.id));
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    // Record in-progress status
    recordLearningActivity({ projectsInProgress: 1 });
    recordRunConcepts(project.focusConcepts);
  }, [project.focusConcepts]);

  const handleSelectMilestone = (id: ProjectMilestoneId) => {
    const updated = updateProjectState(project.id, { currentMilestoneId: id });
    setState(updated);
  };

  const handleCompleteCurrentMilestone = (milestoneId: ProjectMilestoneId) => {
    const updated = markMilestoneComplete(project.id, milestoneId);
    setState(updated);
  };

  const handleReset = () => {
    const fresh = resetProjectState(project.id);
    setState(fresh);
  };

  const handleUpdatePreprocessing = (cfg: PreprocessingConfig) => {
    const updated = updateProjectState(project.id, { preprocessingConfig: cfg });
    setState(updated);
  };

  const handleUpdateSplit = (cfg: SplitConfig) => {
    const updated = updateProjectState(project.id, { splitConfig: cfg });
    setState(updated);
  };

  const handleUpdateThreshold = (th: number) => {
    const updated = updateProjectState(project.id, { classificationThreshold: th });
    setState(updated);
  };

  const handleSaveRunId = (runId: string) => {
    const updated = updateProjectState(project.id, { trainingRunId: runId });
    setState(updated);
  };

  const handleRecordExperiment = (exp: ProjectExperimentRecord) => {
    const updated = updateProjectState(project.id, {
      experiments: [...state.experiments, exp],
    });
    setState(updated);
  };

  const handleUpdateReflections = (reflections: Record<string, string>) => {
    const updated = updateProjectState(project.id, { reflections });
    setState(updated);
  };

  const handleFinalizeProject = () => {
    const updated: ProjectState = {
      ...state,
      completed: true,
      completedAt: new Date().toISOString(),
      completedMilestones: PROJECT_MILESTONES.map((m) => m.id),
    };
    saveProjectState(updated);
    setState(updated);
  };

  const handleStepBack = () => {
    const currentIndex = PROJECT_MILESTONES.findIndex((m) => m.id === state.currentMilestoneId);
    if (currentIndex > 0) {
      handleSelectMilestone(PROJECT_MILESTONES[currentIndex - 1].id);
    }
  };

  if (!isMounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-xl" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="h-96 bg-slate-100 rounded-xl lg:col-span-1" />
          <div className="h-96 bg-slate-100 rounded-xl lg:col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Banner & Progress Header */}
      <ProjectHeader project={project} state={state} onReset={handleReset} />

      {/* Main Studio Grid: Left Stepper Navigation, Right Milestone Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 items-start">
        {/* Left Column: Milestone Stepper */}
        <aside className="lg:col-span-1 sticky top-6">
          <ProjectStepper
            milestones={project.milestones}
            currentMilestoneId={state.currentMilestoneId}
            completedMilestones={state.completedMilestones}
            onSelectMilestone={handleSelectMilestone}
          />
        </aside>

        {/* Right Column: Contextual Active Milestone Content */}
        <main className="lg:col-span-3 min-w-0" id="milestone-content-area">
          {state.currentMilestoneId === "problem" && (
            <MilestoneProblemView
              project={project}
              onComplete={() => handleCompleteCurrentMilestone("problem")}
            />
          )}

          {state.currentMilestoneId === "explore" && (
            <MilestoneExploreView
              project={project}
              onComplete={() => handleCompleteCurrentMilestone("explore")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "quality" && (
            <MilestoneQualityView
              project={project}
              onComplete={() => handleCompleteCurrentMilestone("quality")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "preprocess" && (
            <MilestonePreprocessView
              project={project}
              state={state}
              onUpdateConfig={handleUpdatePreprocessing}
              onComplete={() => handleCompleteCurrentMilestone("preprocess")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "split" && (
            <MilestoneSplitView
              project={project}
              state={state}
              onUpdateSplit={handleUpdateSplit}
              onComplete={() => handleCompleteCurrentMilestone("split")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "model" && (
            <MilestoneModelView
              project={project}
              onComplete={() => handleCompleteCurrentMilestone("model")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "train" && (
            <MilestoneTrainView
              project={project}
              state={state}
              onSaveRunId={handleSaveRunId}
              onComplete={() => handleCompleteCurrentMilestone("train")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "experiment" && (
            <MilestoneExperimentView
              project={project}
              state={state}
              onRecordExperiment={handleRecordExperiment}
              onComplete={() => handleCompleteCurrentMilestone("experiment")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "evaluate" && (
            <MilestoneEvaluateView
              project={project}
              state={state}
              onUpdateThreshold={handleUpdateThreshold}
              onComplete={() => handleCompleteCurrentMilestone("evaluate")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "interpret" && (
            <MilestoneInterpretView
              project={project}
              state={state}
              onComplete={() => handleCompleteCurrentMilestone("interpret")}
              onBack={handleStepBack}
            />
          )}

          {state.currentMilestoneId === "reflect" && (
            <MilestoneReflectView
              project={project}
              state={state}
              onUpdateReflections={handleUpdateReflections}
              onFinalizeProject={handleFinalizeProject}
              onBack={handleStepBack}
            />
          )}
        </main>
      </div>
    </div>
  );
}
