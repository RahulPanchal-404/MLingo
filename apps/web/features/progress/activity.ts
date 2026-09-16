export type LearningActivity = {
      labsExplored: number;
      experimentsRun: number;
      challengesCompleted: string[];
      concepts: string[];
};

const STORAGE_KEY = "mlingo-learning-activity";
const defaultActivity: LearningActivity = { labsExplored: 0, experimentsRun: 0, challengesCompleted: [], concepts: [] };

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