import type { ComponentType } from "react";

/** Every game ID the backend accepts. Keep in sync with GAME_LEVELS in apps/api/app/players/progress.py. */
export type GameId = "descent" | "threshold" | "clusters" | "neurons" | "pipeline";

export type ParamValue = number | string | boolean;
export type Params = Record<string, ParamValue>;

export type SliderControl = {
  kind: "slider";
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Log-scale slider, for learning rates that span orders of magnitude. */
  log?: boolean;
  unit?: string;
  hint?: string;
};

export type ChoiceControl = {
  kind: "choice";
  id: string;
  label: string;
  options: { value: string; label: string; detail?: string }[];
  hint?: string;
};

export type ToggleControl = { kind: "toggle"; id: string; label: string; hint?: string };

export type Control = SliderControl | ChoiceControl | ToggleControl;

export type Metric = { label: string; value: string; good?: boolean };

/** Result of one Run. Engines are pure functions, so the same params always give the same evaluation. */
export type Evaluation<V = unknown> = {
  pass: boolean;
  /** 0–1000, shown on the result card and saved as the level's score. */
  score: number;
  headline: string;
  /** Why it passed or failed, in terms of the concept being taught. */
  feedback: string;
  metrics: Metric[];
  /** Game-specific data for the visual (training path, decision surface, ...). */
  viz?: V;
};

export type LevelDef = {
  id: string;
  number: number;
  name: string;
  /** The situation, in plain language. */
  brief: string;
  /** What counts as a pass. */
  objective: string;
  /** The one-sentence takeaway shown after a pass. */
  lesson: string;
  /** /learn/<slug> lesson this level practises, if there is one. */
  lessonSlug?: string;
  controls: Control[];
  initial: Params;
};

export type VisualProps = { level: LevelDef; params: Params; evaluation: Evaluation | null };

export type GameDef = {
  id: GameId;
  chapter: number;
  chapterTitle: string;
  title: string;
  tagline: string;
  /** Tailwind color family used for the game's accents. */
  accent: "teal" | "violet" | "amber" | "rose" | "sky";
  levels: LevelDef[];
  evaluate: (levelId: string, params: Params) => Evaluation;
  Visual: ComponentType<VisualProps>;
};

/** Stars depend on how many runs it took to pass: think first, then run. */
export function starsForAttempts(attempts: number): number {
  if (attempts <= 1) return 3;
  if (attempts <= 3) return 2;
  return 1;
}
