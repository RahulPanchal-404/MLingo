export type LearningActivity = {
      labsExplored: number;
      experimentsRun: number;
      challengesCompleted: string[];
      concepts: string[];
      experimentsSaved?: number;
      experimentsReplayed?: number;
      sweepsCompleted?: number;
      workbenchExplored?: number;
      projectsCompleted?: number;
      projectsInProgress?: number;
      /** Ids of labs the learner has run at least once (the source of truth for labsExplored). */
      labsVisited?: string[];
};

const STORAGE_KEY = "mlingo-learning-activity";
const defaultActivity: LearningActivity = {
      labsExplored: 0,
      experimentsRun: 0,
      challengesCompleted: [],
      concepts: [],
      experimentsSaved: 0,
      experimentsReplayed: 0,
      sweepsCompleted: 0,
      workbenchExplored: 0,
      projectsCompleted: 0,
      projectsInProgress: 0,
      labsVisited: [],
};

export function readLearningActivity(): LearningActivity {
      if (typeof window === "undefined") return defaultActivity;
      try {
            const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null");
            if (!parsed || typeof parsed !== "object") return defaultActivity;
            const value = parsed as Partial<LearningActivity>;
            return {
                  labsExplored: typeof value.labsExplored === "number" ? value.labsExplored : 0,
                  experimentsRun: typeof value.experimentsRun === "number" ? value.experimentsRun : 0,
                  challengesCompleted: Array.isArray(value.challengesCompleted) ? value.challengesCompleted.filter((item): item is string => typeof item === "string") : [],
                  concepts: Array.isArray(value.concepts) ? value.concepts.filter((item): item is string => typeof item === "string") : [],
                  experimentsSaved: typeof value.experimentsSaved === "number" ? value.experimentsSaved : 0,
                  experimentsReplayed: typeof value.experimentsReplayed === "number" ? value.experimentsReplayed : 0,
                  sweepsCompleted: typeof value.sweepsCompleted === "number" ? value.sweepsCompleted : 0,
                  workbenchExplored: typeof value.workbenchExplored === "number" ? value.workbenchExplored : 0,
                  projectsCompleted: typeof value.projectsCompleted === "number" ? value.projectsCompleted : 0,
                  projectsInProgress: typeof value.projectsInProgress === "number" ? value.projectsInProgress : 0,
                  labsVisited: Array.isArray(value.labsVisited) ? value.labsVisited.filter((item): item is string => typeof item === "string") : [],
            };
      } catch { return defaultActivity; }
}

export function recordLearningActivity(update: Partial<LearningActivity>): void {
      if (typeof window === "undefined") return;
      const current = readLearningActivity();
      const next: LearningActivity = {
            labsExplored: update.labsExplored ?? current.labsExplored,
            experimentsRun: update.experimentsRun ?? current.experimentsRun,
            challengesCompleted: [...new Set(update.challengesCompleted ?? current.challengesCompleted)],
            concepts: [...new Set(update.concepts ?? current.concepts)],
            experimentsSaved: update.experimentsSaved ?? current.experimentsSaved ?? 0,
            experimentsReplayed: update.experimentsReplayed ?? current.experimentsReplayed ?? 0,
            sweepsCompleted: update.sweepsCompleted ?? current.sweepsCompleted ?? 0,
            workbenchExplored: update.workbenchExplored ?? current.workbenchExplored ?? 0,
            projectsCompleted: update.projectsCompleted ?? current.projectsCompleted ?? 0,
            projectsInProgress: update.projectsInProgress ?? current.projectsInProgress ?? 0,
            labsVisited: [...new Set(update.labsVisited ?? current.labsVisited ?? [])],
      };
      try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            window.dispatchEvent(new CustomEvent("mlingo-activity-change"));
      } catch {
            return;
      }
}

export function recordRunConcepts(concepts: string[]): void {
      const current = readLearningActivity();
      recordLearningActivity({ concepts: [...current.concepts, ...concepts] });
}
/** Marks a lab as explored (counted once per lab) and records the concepts it practises. */
export function recordLabVisit(labId: string, concepts: string[]): void {
      const current = readLearningActivity();
      const labsVisited = [...new Set([...(current.labsVisited ?? []), labId])];
      recordLearningActivity({
            labsVisited,
            labsExplored: labsVisited.length,
            concepts: [...current.concepts, ...concepts],
      });
}
