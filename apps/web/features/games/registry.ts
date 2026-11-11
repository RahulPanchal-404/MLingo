/**
 * The single list of games. The hub, routes, lesson links and badge list all read from here.
 * Adding a game = write its engine + visual, then add one entry below (and its level IDs to the API's GAME_LEVELS).
 */
import * as clusters from "./clusters/engine";
import { ClustersVisual } from "./clusters/visual";
import * as descent from "./descent/engine";
import { DescentVisual } from "./descent/visual";
import type { GameDef, GameId } from "./framework/types";
import * as neurons from "./neurons/engine";
import { NeuronsVisual } from "./neurons/visual";
import * as pipeline from "./pipeline/engine";
import { PipelineVisual } from "./pipeline/visual";
import * as threshold from "./threshold/engine";
import { ThresholdVisual } from "./threshold/visual";

export const GAMES: GameDef[] = [
  {
    id: "descent",
    chapter: 1,
    chapterTitle: "Foundations",
    title: "Descent",
    tagline: "Loss, gradients and learning rates. Get the model to the bottom of the valley.",
    accent: "teal",
    levels: descent.LEVELS,
    evaluate: descent.evaluate,
    Visual: DescentVisual,
  },
  {
    id: "threshold",
    chapter: 2,
    chapterTitle: "Classification",
    title: "Threshold",
    tagline: "Every threshold trades one mistake for another. Choose based on what mistakes cost.",
    accent: "rose",
    levels: threshold.LEVELS,
    evaluate: threshold.evaluate,
    Visual: ThresholdVisual,
  },
  {
    id: "clusters",
    chapter: 3,
    chapterTitle: "Clustering",
    title: "Cluster Wars",
    tagline: "Pick K, beat bad starts, and learn when K-Means is the wrong tool.",
    accent: "violet",
    levels: clusters.LEVELS,
    evaluate: clusters.evaluate,
    Visual: ClustersVisual,
  },
  {
    id: "neurons",
    chapter: 4,
    chapterTitle: "Neural networks",
    title: "Neuron Surgeon",
    tagline: "A real network is failing. Diagnose it: activation, capacity, scaling or learning rate.",
    accent: "amber",
    levels: neurons.LEVELS,
    evaluate: neurons.evaluate,
    Visual: NeuronsVisual,
  },
  {
    id: "pipeline",
    chapter: 5,
    chapterTitle: "Data workflow",
    title: "Pipeline Detective",
    tagline: "The model looks great. Find the leak, the overfit, or the lying metric.",
    accent: "sky",
    levels: pipeline.LEVELS,
    evaluate: pipeline.evaluate,
    Visual: PipelineVisual,
  },
];

export const getGame = (id: string) => GAMES.find((g) => g.id === id);

export const ALL_LEVELS = GAMES.flatMap((g) =>
  g.levels.map((l) => ({ game: g.id, gameTitle: g.title, id: l.id, name: l.name, label: `${g.title} · Level ${l.number}`, href: `/games/${g.id}?level=${l.id}` })),
);

/** Levels that practise a given /learn lesson. */
export const levelsForLesson = (slug: string) =>
  GAMES.flatMap((g) => g.levels.filter((l) => l.lessonSlug === slug).map((l) => ({ game: g, level: l })));

/** Game that matches a /learn chapter id. */
export const GAME_FOR_CHAPTER: Record<string, GameId> = {
  foundations: "descent",
  supervised: "threshold",
  unsupervised: "clusters",
  "deep-learning": "neurons",
  workflow: "pipeline",
};

/** Mirrors BADGES in apps/api/app/players/progress.py, for guests who have no server progress. */
export const BADGES = [
  { id: "first-steps", title: "First steps", description: "Pass your first level." },
  { id: "first-try", title: "First try", description: "Pass a level on your first run." },
  { id: "on-fire", title: "On fire", description: "Keep a 3-day streak." },
  { id: "unstoppable", title: "Unstoppable", description: "Keep a 7-day streak." },
  { id: "explorer", title: "Explorer", description: "Pass a level in every game." },
  { id: "descent-master", title: "Gradient guru", description: "3 stars on every Descent level." },
  { id: "threshold-master", title: "Threshold tuner", description: "3 stars on every Threshold level." },
  { id: "clusters-master", title: "Cluster commander", description: "3 stars on every Cluster Wars level." },
  { id: "neurons-master", title: "Neuron surgeon", description: "3 stars on every Neuron Surgeon level." },
  { id: "pipeline-master", title: "Pipeline detective", description: "3 stars on every Pipeline Detective level." },
  { id: "level-5", title: "Rising star", description: "Reach player level 5." },
];
