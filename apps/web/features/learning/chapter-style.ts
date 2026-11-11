/** One colour per chapter, used wherever that chapter appears so learners can tell them apart. */
export type ChapterId = "foundations" | "regression" | "supervised" | "unsupervised" | "deep-learning" | "workflow" | "capstone";

export const CHAPTER_STYLE: Record<ChapterId, { fill: string; ink: string; label: string }> = {
  foundations: { fill: "#7be0c3", ink: "#0d7a5f", label: "Foundations" },
  regression: { fill: "#8fd3ff", ink: "#0a6799", label: "Regression" },
  supervised: { fill: "#ff9a8a", ink: "#c2412d", label: "Classification" },
  unsupervised: { fill: "#b9a6ff", ink: "#5b3fd6", label: "Clustering" },
  "deep-learning": { fill: "#ffd166", ink: "#9a6200", label: "Neural networks" },
  workflow: { fill: "#ffb3d9", ink: "#b0306f", label: "Data workflow" },
  capstone: { fill: "#c6f07a", ink: "#4d7c0f", label: "Projects" },
};

export function chapterStyle(id: string) {
  return CHAPTER_STYLE[(id in CHAPTER_STYLE ? id : "foundations") as ChapterId];
}

/** Maps a lesson tag ("Regression / 01") or theory section name to its chapter. */
export function chapterForLabel(label: string): ChapterId {
  const l = label.toLowerCase();
  if (l.includes("regress")) return "regression";
  if (l.includes("classif")) return "supervised";
  if (l.includes("cluster") || l.includes("unsupervis")) return "unsupervised";
  if (l.includes("neural") || l.includes("deep")) return "deep-learning";
  if (l.includes("workflow") || l.includes("data") || l.includes("evaluat") || l.includes("practice")) return "workflow";
  if (l.includes("capstone") || l.includes("project")) return "capstone";
  return "foundations";
}
