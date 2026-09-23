import { ALL_PROJECTS } from "@/features/projects/definitions";
import { getProjectProgress, loadAllProjectStates, loadProjectState } from "@/features/projects/project-storage";
import type { ProjectDefinition, ProjectState } from "@/features/projects/types";
import { getSavedExperiments } from "@/features/experiments/experiment-storage";
import { readLearningActivity } from "@/features/progress/activity";

export type PortfolioProjectCardData = {
  project: ProjectDefinition;
  state: ProjectState;
  status: "Completed" | "In Progress" | "Not Started";
  percentage: number;
  completedCount: number;
  totalCount: number;
  experimentCount: number;
  reflectionCount: number;
  lastUpdated: string;
  completedAt: string | null;
};

export type PortfolioSummaryStats = {
  completedProjects: number;
  inProgressProjects: number;
  notStartedProjects: number;
  totalExperiments: number;
  totalConcepts: number;
};

export function getPortfolioProjects(): PortfolioProjectCardData[] {
  const allStates = loadAllProjectStates();

  return ALL_PROJECTS.map((project) => {
    const state = allStates[project.id] ?? loadProjectState(project.id);
    const { status, percentage, completedCount, totalCount } = getProjectProgress(state);

    const experimentCount = state.experiments.length;
    const reflectionCount = Object.keys(state.reflections).filter(
      (k) => state.reflections[k]?.trim() !== ""
    ).length;

    return {
      project,
      state,
      status,
      percentage,
      completedCount,
      totalCount,
      experimentCount,
      reflectionCount,
      lastUpdated: state.updatedAt,
      completedAt: state.completedAt,
    };
  });
}

export function getPortfolioSummary(): PortfolioSummaryStats {
  const projects = getPortfolioProjects();
  const savedExperiments = getSavedExperiments();
  const activity = readLearningActivity();

  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress").length;
  const notStartedProjects = projects.filter((p) => p.status === "Not Started").length;

  const projectExperiments = projects.reduce((acc, p) => acc + p.experimentCount, 0);
  const totalExperiments = projectExperiments + savedExperiments.length;

  const totalConcepts = activity.concepts.length;

  return {
    completedProjects,
    inProgressProjects,
    notStartedProjects,
    totalExperiments,
    totalConcepts,
  };
}
