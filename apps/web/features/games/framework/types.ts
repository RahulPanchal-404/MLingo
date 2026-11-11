import type { ComponentType } from "react";

/** Every game ID the backend accepts. Keep in sync with GAME_LEVELS in apps/api/app/players/progress.py. */
export type GameId = "descent" | "bridge" | "threshold" | "sorter" | "clusters" | "galaxy" | "neurons" | "pipeline";

export type LevelDef = {
  id: string;
  number: number;
  name: string;
  /** One line: the situation. */
  brief: string;
  /** One line: how to play (the controls). */
  howTo: string;
  /** What counts as a pass. */
  objective: string;
  /** The one-sentence takeaway shown after a pass. */
  lesson: string;
  /** /learn/<slug> lesson this level practises, if there is one. */
  lessonSlug?: string;
  /** Score (0–1000) needed for 1, 2 and 3 stars. */
  stars: [number, number, number];
  /** The ML concept this level teaches, and where to study it. */
  concept: Concept;
};

export type Concept = {
  title: string;
  /** Page that teaches the concept (lesson, lab or workbench). */
  href: string;
  /** What the player just did, in game terms mapped to ML terms. */
  played: string;
  /** Why it matters in real machine learning. */
  matters: string;
};

export type RoundResult = {
  /** 0–1000, saved as the level's score. */
  score: number;
  headline: string;
  /** What happened and why, in terms of the concept being taught. */
  detail: string;
  stats: { label: string; value: string }[];
};

export type RoundProps = { level: LevelDef; onDone: (result: RoundResult) => void };

export type GameDef = {
  id: GameId;
  chapter: number;
  chapterTitle: string;
  title: string;
  /** Emoji shown on the hub card. */
  icon: string;
  tagline: string;
  /** Tailwind color family used for the game's accents. */
  accent: "teal" | "violet" | "amber" | "rose" | "sky";
  levels: LevelDef[];
  /** Shown before any level starts: what the game is and how to win it. */
  guide: Guide;
  Round: ComponentType<RoundProps>;
};

export function starsForScore(score: number, thresholds: [number, number, number]): number {
  return thresholds.filter((t) => score >= t).length;
}

export type Guide = {
  /** The story in two or three sentences. */
  story: string;
  /** The end objective of the whole game. */
  goal: string;
  /** Step-by-step how a round plays out. */
  steps: string[];
  /** How you win and lose. */
  win: string;
  lose: string;
  /** Game element → the ML idea it stands for. */
  map: [string, string][];
};
