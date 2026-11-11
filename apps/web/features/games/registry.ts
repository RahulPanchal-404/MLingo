/**
 * The single list of games. The hub, routes, lesson links and badge list all read from here.
 * Adding a game = write its Round component, then add one entry below (and its level IDs to the API's GAME_LEVELS).
 */
import { ClustersRound } from "./clusters/round";
import { DescentRound } from "./descent/round";
import type { GameDef, GameId, LevelDef } from "./framework/types";
import { NeuronsRound } from "./neurons/round";
import { PipelineRound } from "./pipeline/round";
import { ThresholdRound } from "./threshold/round";
import { CONCEPTS } from "./concepts";
import { GUIDES } from "./guides";

const lv = (gameId: GameId, l: Omit<LevelDef, "concept">): LevelDef => ({ ...l, concept: CONCEPTS[`${gameId}:${l.id}`] });

export const GAMES: GameDef[] = [
  {
    id: "descent",
    guide: GUIDES.descent,
    chapter: 1,
    chapterTitle: "Foundations",
    title: "Valley Runner",
    icon: "⛷️",
    tagline: "Ski down the loss mountain. Your jump power is the learning rate. Don't fly into the lava.",
    accent: "teal",
    Round: DescentRound,
    levels: [
      lv("descent", { id: "eyeball", number: 1, name: "Lost in the fog", brief: "Thick fog. You can't see the flag at the bottom, only how the ground slopes under your skis.", howTo: "Jump left or right (buttons or ← →). Use the slope reading to go downhill.", objective: "Reach the 🚩 on 3 mountains with as few jumps as possible.", lesson: "The gradient tells you which way is downhill. Step against it.", lessonSlug: "gradient-descent", stars: [400, 650, 850] }),
      lv("descent", { id: "step-size", number: 2, name: "Jump power", brief: "Now you jump downhill automatically. You only control how far each jump goes.", howTo: "Set the jump power, press Go, and adjust it while you ski.", objective: "Reach the flag on 3 mountains of different steepness without falling into the lava.", lesson: "Learning rate too small: out of fuel. Too big: you overshoot and diverge.", lessonSlug: "learning-rate", stars: [400, 650, 850] }),
      lv("descent", { id: "ravine", number: 3, name: "Canyon run", brief: "A narrow canyon seen from above, with lava on both walls. Strong jumps smash into the walls; weak ones never arrive.", howTo: "Wax your skis (standardize) before starting, set jump power, press Go.", objective: "Reach the flag in 3 canyons within 40 jumps.", lesson: "Standardizing features turns a narrow canyon into a round bowl.", lessonSlug: "gradient-descent", stars: [400, 650, 850] }),
      lv("descent", { id: "trap", number: 4, name: "The false valley", brief: "A small dip lies between you and the deep valley. Plain skiing stops in it.", howTo: "Set jump power, toggle momentum boots (even mid-run), press Go.", objective: "Reach the deep valley's flag from 3 starting points.", lesson: "Momentum carries you over bumps that trap plain gradient descent.", lessonSlug: "gradient-descent", stars: [400, 650, 850] }),
    ],
  },
  {
    id: "threshold",
    guide: GUIDES.threshold,
    chapter: 2,
    chapterTitle: "Classification",
    title: "Gatekeeper",
    icon: "🏰",
    tagline: "Cloaked strangers march on your castle. The oracle gives each a suspicion score. You set the gate.",
    accent: "rose",
    Round: ThresholdRound,
    levels: [
      lv("threshold", { id: "sigmoid", number: 1, name: "First night", brief: "Monsters and villagers arrive cloaked. Only the oracle's suspicion bar tells them apart.", howTo: "Slide the gate level while they walk. Anyone at or above it is refused.", objective: "Keep monsters out without turning villagers away.", lesson: "A probability becomes a decision only when you pick a threshold.", stars: [450, 700, 880] }),
      lv("threshold", { id: "balanced", number: 2, name: "Foggy oracle", brief: "The oracle is unsure tonight. Monsters and villagers have similar scores.", howTo: "Slide the gate level. Both mistakes cost the same.", objective: "Find the gate level with the fewest total mistakes.", lesson: "Raising the threshold trades false alarms for misses, and vice versa.", stars: [450, 700, 880] }),
      lv("threshold", { id: "screening", number: 3, name: "The plague", brief: "A plague carrier inside costs 25 castle health. Refusing a healthy traveller costs just 1 gold.", howTo: "Slide the gate level. Watch the damage, not the accuracy.", objective: "Keep total damage near the minimum.", lesson: "When misses are expensive, lower the threshold, even if accuracy drops.", stars: [450, 700, 880] }),
      lv("threshold", { id: "fraud", number: 4, name: "Spies among us", brief: "Only 1 merchant in 20 is a spy. Letting everyone in looks 95% accurate.", howTo: "Slide the gate level. Ignore the accuracy number.", objective: "Catch the spies without refusing the whole market.", lesson: "On rare events accuracy lies. Count what you caught and what mistakes cost.", stars: [450, 700, 880] }),
    ],
  },
  {
    id: "clusters",
    guide: GUIDES.clusters,
    chapter: 3,
    chapterTitle: "Clustering",
    title: "Sheepdog",
    icon: "🐕",
    tagline: "Sheep run to the nearest dog, dogs walk to the middle of their flock. That's K-Means.",
    accent: "violet",
    Round: ClustersRound,
    levels: [
      lv("clusters", { id: "elbow", number: 1, name: "Hire the dogs", brief: "More dogs means less walking for the sheep, but every dog costs wages.", howTo: "Hire or fire dogs and watch the cost bars, then sign contracts.", objective: "Hire the right number of dogs on 3 farms.", lesson: "Inertia always falls with more clusters. Pick K at the elbow.", stars: [500, 700, 900] }),
      lv("clusters", { id: "start", number: 2, name: "Drop zone", brief: "Where the dogs start decides which flocks they end up herding.", howTo: "Tap the field to drop 4 dogs, then whistle. Re-dropping costs points.", objective: "Herd 3 fields with walking distance close to the best possible.", lesson: "Bad starts trap K-Means. Spread them out or use k-means++.", stars: [500, 700, 900] }),
      lv("clusters", { id: "units", number: 3, name: "Wrong map scale", brief: "This map counts income in big numbers and visits in tiny ones. The dogs only see the big numbers.", howTo: "Fix the map scale (standardize), choose the number of dogs, whistle.", objective: "Find the real customer flocks on 3 farms.", lesson: "Distance is dominated by big-number features. Standardize first.", stars: [500, 700, 900] }),
      lv("clusters", { id: "rings", number: 4, name: "Strange shapes", brief: "Blobs, rings and moons. Dogs guard round patches. Can they herd a ring?", howTo: "Look at the field, then send sheepdogs (K-Means) or follow-the-leader (DBSCAN). One try.", objective: "Separate the true flocks on all 3 fields.", lesson: "K-Means draws straight borders. Density clustering follows any shape.", stars: [500, 700, 900] }),
    ],
  },
  {
    id: "neurons",
    guide: GUIDES.neurons,
    chapter: 4,
    chapterTitle: "Neural networks",
    title: "Shield Builder",
    icon: "🛡️",
    tagline: "Invaders attack in patterns. Build a neural-network shield and watch it learn to trap them.",
    accent: "amber",
    Round: NeuronsRound,
    levels: [
      lv("neurons", { id: "xor", number: 1, name: "Corner attack", brief: "Invaders hold two opposite corners, allies the other two. Your shield can only make a straight wall.", howTo: "Change the neurons' activation. The shield retrains from scratch.", objective: "Trap the invaders before your base falls.", lesson: "Without a non-linear activation a network is one straight line.", stars: [300, 600, 850] }),
      lv("neurons", { id: "capacity", number: 2, name: "The ring", brief: "Invaders sit in a circle surrounded by allies. You have one neuron.", howTo: "Add or remove hidden neurons.", objective: "Trap the invaders before your base falls.", lesson: "Each neuron adds an edge. Too few neurons underfit.", stars: [300, 600, 850] }),
      lv("neurons", { id: "saturate", number: 3, name: "Jammed signal", brief: "The radar reports positions in the thousands. The shield isn't learning at all.", howTo: "Calibrate the signal (standardize) and tune the learning rate.", objective: "Trap the invaders before your base falls.", lesson: "Huge inputs saturate neurons. Standardize and learning takes off.", stars: [300, 600, 850] }),
      lv("neurons", { id: "lr", number: 4, name: "Overload", brief: "Training is cranked far too high and neurons are dying.", howTo: "Drag the learning rate and release to rebuild.", objective: "Trap the invaders before your base falls.", lesson: "Too high a learning rate kills ReLU neurons. Too low crawls.", stars: [300, 600, 850] }),
    ],
  },
  {
    id: "pipeline",
    guide: GUIDES.pipeline,
    chapter: 5,
    chapterTitle: "Data workflow",
    title: "Data Heist",
    icon: "🕵️",
    tagline: "Models are lying about their scores. Interrogate the suspects and crack the case.",
    accent: "sky",
    Round: PipelineRound,
    levels: [
      lv("pipeline", { id: "leak", number: 1, name: "The leak", brief: "Three models scored too well to be true. Someone is leaking the answer.", howTo: "Pick a suspect, interrogate for a clue (costs points), then accuse. 3 badges per case.", objective: "Close 3 cases with few clues and no wrong accusations.", lesson: "Would you have this value at the moment you predict? If not, it's a leak.", stars: [500, 750, 900] }),
      lv("pipeline", { id: "overfit", number: 2, name: "The con artist", brief: "Models present their training and test errors as alibis.", howTo: "Read the alibis, interrogate if unsure, accuse the right model.", objective: "Close 3 cases with few clues and no wrong accusations.", lesson: "Big train/test gap = overfit. High on both = underfit.", stars: [500, 750, 900] }),
      lv("pipeline", { id: "order", number: 3, name: "The timeline", brief: "Test data got into training. Rebuild what should have happened.", howTo: "Tap evidence cards in the correct order. A wrong card costs a badge.", objective: "Rebuild 3 timelines without losing badges.", lesson: "Split first. Fit everything on training data only.", stars: [500, 750, 900] }),
      lv("pipeline", { id: "metric", number: 4, name: "Lying witnesses", brief: "Metrics testify about a model. Some tell the truth for this case, some don't.", howTo: "Interrogate witnesses and accuse the right one.", objective: "Close 3 cases with few clues and no wrong accusations.", lesson: "Match the metric to the cost of each mistake.", stars: [500, 750, 900] }),
    ],
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
  { id: "descent-master", title: "Gradient guru", description: "3 stars on every Valley Runner level." },
  { id: "threshold-master", title: "Royal gatekeeper", description: "3 stars on every Gatekeeper level." },
  { id: "clusters-master", title: "Top dog", description: "3 stars on every Sheepdog level." },
  { id: "neurons-master", title: "Shield master", description: "3 stars on every Shield Builder level." },
  { id: "pipeline-master", title: "Master detective", description: "3 stars on every Data Heist level." },
  { id: "level-5", title: "Rising star", description: "Reach player level 5." },
];
