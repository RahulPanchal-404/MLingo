import type {
  ProjectDefinition,
  ProjectMilestoneId,
  ProjectState,
} from "./types";
import { PROJECT_MILESTONES } from "./definitions";

const STORAGE_KEY = "mlingo-projects-state";

export function createDefaultProjectState(projectId: string): ProjectState {
  return {
    projectId,
    currentMilestoneId: "problem",
    completedMilestones: [],
    preprocessingConfig: {
      numericScaling: "standard",
      missingImputation: "mean_mode",
      categoricalEncoding: "onehot",
    },
    splitConfig: {
      trainRatio: 0.8,
      seed: 42,
    },
    classificationThreshold: 0.5,
    trainingRunId: null,
    experiments: [],
    reflections: {},
    completed: false,
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

export function loadAllProjectStates(): Record<string, ProjectState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const result: Record<string, ProjectState> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (value && typeof value === "object") {
        const p = value as Partial<ProjectState>;
        result[id] = {
          projectId: typeof p.projectId === "string" ? p.projectId : id,
          currentMilestoneId: isMilestoneId(p.currentMilestoneId) ? p.currentMilestoneId : "problem",
          completedMilestones: Array.isArray(p.completedMilestones)
            ? p.completedMilestones.filter(isMilestoneId)
            : [],
          preprocessingConfig: {
            numericScaling: p.preprocessingConfig?.numericScaling ?? "standard",
            missingImputation: p.preprocessingConfig?.missingImputation ?? "mean_mode",
            categoricalEncoding: p.preprocessingConfig?.categoricalEncoding ?? "onehot",
          },
          splitConfig: {
            trainRatio: typeof p.splitConfig?.trainRatio === "number" ? p.splitConfig.trainRatio : 0.8,
            seed: typeof p.splitConfig?.seed === "number" ? p.splitConfig.seed : 42,
          },
          classificationThreshold:
            typeof p.classificationThreshold === "number" ? p.classificationThreshold : 0.5,
          trainingRunId: typeof p.trainingRunId === "string" ? p.trainingRunId : null,
          experiments: Array.isArray(p.experiments) ? p.experiments : [],
          reflections:
            p.reflections && typeof p.reflections === "object"
              ? (p.reflections as Record<string, string>)
              : {},
          completed: Boolean(p.completed),
          completedAt: typeof p.completedAt === "string" ? p.completedAt : null,
          updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : new Date().toISOString(),
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

export function loadProjectState(projectId: string): ProjectState {
  const all = loadAllProjectStates();
  if (all[projectId]) {
    return all[projectId];
  }
  return createDefaultProjectState(projectId);
}

export function saveProjectState(state: ProjectState): void {
  if (typeof window === "undefined") return;
  try {
    const all = loadAllProjectStates();
    all[state.projectId] = {
      ...state,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent("mlingo-project-state-change"));
  } catch {
    // Graceful silent fallback if local storage quota exceeded
  }
}

export function resetProjectState(projectId: string): ProjectState {
  const fresh = createDefaultProjectState(projectId);
  saveProjectState(fresh);
  return fresh;
}

export function markMilestoneComplete(
  projectId: string,
  milestoneId: ProjectMilestoneId
): ProjectState {
  const current = loadProjectState(projectId);
  const completedSet = new Set(current.completedMilestones);
  completedSet.add(milestoneId);

  const completedList = Array.from(completedSet);
  const isAllComplete = PROJECT_MILESTONES.every((m) => completedSet.has(m.id));

  // Determine next milestone
  const currentIndex = PROJECT_MILESTONES.findIndex((m) => m.id === milestoneId);
  const nextMilestone =
    currentIndex >= 0 && currentIndex < PROJECT_MILESTONES.length - 1
      ? PROJECT_MILESTONES[currentIndex + 1].id
      : milestoneId;

  const nextState: ProjectState = {
    ...current,
    completedMilestones: completedList,
    currentMilestoneId: nextMilestone,
    completed: isAllComplete,
    completedAt: isAllComplete ? (current.completedAt ?? new Date().toISOString()) : null,
  };

  saveProjectState(nextState);
  return nextState;
}

export function updateProjectState(
  projectId: string,
  update: Partial<ProjectState>
): ProjectState {
  const current = loadProjectState(projectId);
  const next: ProjectState = {
    ...current,
    ...update,
    projectId,
  };
  saveProjectState(next);
  return next;
}

export function getProjectProgress(state: ProjectState): {
  completedCount: number;
  totalCount: number;
  percentage: number;
  status: "Not Started" | "In Progress" | "Completed";
} {
  const totalCount = PROJECT_MILESTONES.length;
  const completedCount = Array.isArray(state?.completedMilestones) ? state.completedMilestones.length : 0;
  const percentage = Math.round((completedCount / totalCount) * 100);

  let status: "Not Started" | "In Progress" | "Completed" = "Not Started";
  if (state?.completed || completedCount === totalCount) {
    status = "Completed";
  } else if (completedCount > 0 || state?.trainingRunId || (Array.isArray(state?.experiments) && state.experiments.length > 0)) {
    status = "In Progress";
  }

  return { completedCount, totalCount, percentage, status };
}

export function getOverallProjectStats(projects: ProjectDefinition[]): {
  completed: number;
  inProgress: number;
  notStarted: number;
} {
  const allStates = loadAllProjectStates();
  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;

  for (const proj of projects) {
    const state = allStates[proj.id] ?? createDefaultProjectState(proj.id);
    const { status } = getProjectProgress(state);
    if (status === "Completed") completed++;
    else if (status === "In Progress") inProgress++;
    else notStarted++;
  }

  return { completed, inProgress, notStarted };
}

function isMilestoneId(val: unknown): val is ProjectMilestoneId {
  if (typeof val !== "string") return false;
  return PROJECT_MILESTONES.some((m) => m.id === val);
}
