/**
 * The single list of games. The hub, routes, lesson links and badge list all read from here.
 * Adding a game = write its Round component, then add one entry below (and its level IDs to the API's GAME_LEVELS).
 */
import { BridgeRound } from "./bridge/round";
import { ClustersRound } from "./clusters/round";
import { GalaxyRound } from "./galaxy/round";
import { SorterRound } from "./sorter/round";
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
    id: "bridge",
    guide: GUIDES.bridge,
    chapter: 2,
    chapterTitle: "Regression",
    title: "Bridge Builder",
    icon: "🌉",
    tagline: "Build bridges across canyons. Fit the pillars, but only test trucks tell you if it holds.",
    accent: "sky",
    Round: BridgeRound,
    levels: [
      lv("bridge", { id: "line", number: 1, name: "Straight bridge", brief: "A straight bridge over the pillars. Get it as close to all of them as you can.", howTo: "Drag the two orange ends of the bridge, then open it to traffic.", objective: "Get your error close to the least-squares line on 3 canyons.", lesson: "Linear regression picks the line with the smallest squared errors.", lessonSlug: "linear-regression", stars: [450, 700, 880] }),
      lv("bridge", { id: "degree", number: 2, name: "Bendy bridge", brief: "Now the bridge can bend. More bends hug the pillars better, but can trucks still cross?", howTo: "Pick the degree (1–12), then send the test trucks. One shot per canyon.", objective: "Pick the degree with the lowest test error on 3 canyons.", lesson: "The best complexity minimises test error, not training error.", lessonSlug: "polynomial-regression", stars: [450, 700, 880] }),
      lv("bridge", { id: "ridge", number: 3, name: "Stiff bridge", brief: "A super-bendy degree-12 bridge. Add stiffness to stop it wiggling.", howTo: "Slide stiffness λ, then send the test trucks.", objective: "Find the λ with the lowest test error on 3 canyons.", lesson: "Ridge regularization calms a flexible model down.", lessonSlug: "regularization", stars: [450, 700, 880] }),
      lv("bridge", { id: "lasso", number: 4, name: "Cut the junk beams", brief: "8 support beams, only 3 actually carry weight. Junk beams make the bridge fit noise.", howTo: "Slide Lasso λ and watch beams get cut, then load the test traffic.", objective: "Keep the real beams, cut the junk, keep test error low.", lesson: "Lasso drives useless feature weights to exactly zero.", lessonSlug: "regularization", stars: [450, 700, 880] }),
    ],
  },
  {
    id: "threshold",
    guide: GUIDES.threshold,
    chapter: 3,
    chapterTitle: "Classification",
    title: "Gatekeeper",
    icon: "🏰",
    tagline: "Cloaked strangers march on your castle. The oracle gives each a suspicion score. You set the gate.",
    accent: "rose",
    Round: ThresholdRound,
    levels: [
      lv("threshold", { id: "sigmoid", number: 1, name: "First night", brief: "Monsters and villagers arrive cloaked. Only the oracle's suspicion bar tells them apart.", howTo: "Slide the gate level while they walk. Anyone at or above it is refused.", objective: "Keep monsters out without turning villagers away.", lesson: "A probability becomes a decision only when you pick a threshold.", lessonSlug: "logistic-regression", stars: [450, 700, 880] }),
      lv("threshold", { id: "balanced", number: 2, name: "Foggy oracle", brief: "The oracle is unsure tonight. Monsters and villagers have similar scores.", howTo: "Slide the gate level. Both mistakes cost the same.", objective: "Find the gate level with the fewest total mistakes.", lesson: "Raising the threshold trades false alarms for misses, and vice versa.", lessonSlug: "logistic-regression", stars: [450, 700, 880] }),
      lv("threshold", { id: "screening", number: 3, name: "The plague", brief: "A plague carrier inside costs 25 castle health. Refusing a healthy traveller costs just 1 gold.", howTo: "Slide the gate level. Watch the damage, not the accuracy.", objective: "Keep total damage near the minimum.", lesson: "When misses are expensive, lower the threshold, even if accuracy drops.", lessonSlug: "logistic-regression", stars: [450, 700, 880] }),
      lv("threshold", { id: "fraud", number: 4, name: "Spies among us", brief: "Only 1 merchant in 20 is a spy. Letting everyone in looks 95% accurate.", howTo: "Slide the gate level. Ignore the accuracy number.", objective: "Catch the spies without refusing the whole market.", lesson: "On rare events accuracy lies. Count what you caught and what mistakes cost.", lessonSlug: "logistic-regression", stars: [450, 700, 880] }),
    ],
  },
  {
    id: "sorter",
    guide: GUIDES.sorter,
    chapter: 3,
    chapterTitle: "Classification",
    title: "Creature Sorter",
    icon: "🐞",
    tagline: "Sort ladybirds and bees with neighbour votes and question trees. New arrivals are the real test.",
    accent: "amber",
    Round: SorterRound,
    levels: [
      lv("sorter", { id: "knn", number: 1, name: "Ask the neighbours", brief: "Some of your hand-sorted creatures were labelled wrong. Sort new ones by asking their nearest neighbours.", howTo: "Pick K, watch the sorting map, then release the new creatures.", objective: "Sort as many new creatures correctly as possible in 3 habitats.", lesson: "Too few neighbours copies noise; too many blurs everything.", lessonSlug: "k-nearest-neighbors", stars: [450, 700, 880] }),
      lv("sorter", { id: "scale", number: 2, name: "Grams vs centimetres", brief: "Weight is in grams (hundreds), wing length in cm (under 6). Only wing length tells species apart.", howTo: "Decide whether to put features in the same units, then release the new creatures.", objective: "Sort new creatures correctly in 3 habitats.", lesson: "Distance-based models need standardized features.", lessonSlug: "k-nearest-neighbors", stars: [450, 700, 880] }),
      lv("sorter", { id: "tree", number: 3, name: "Ask the right question", brief: "Build a sorting flowchart. At each step, choose the yes/no question that separates the species best.", howTo: "Compare how each question splits the group, then pick one. Up to 3 questions.", objective: "Pick the best question at every node in 2 habitats.", lesson: "Trees choose the split that makes the groups purest (lowest Gini).", lessonSlug: "decision-trees", stars: [500, 750, 900] }),
      lv("sorter", { id: "depth", number: 4, name: "Too many questions", brief: "The computer builds the tree for you. You choose how many questions deep it may go.", howTo: "Pick a max depth, watch the map, then release the new creatures.", objective: "Find the depth that sorts new creatures best in 3 habitats.", lesson: "Deep trees memorise noise. Limit depth to generalise.", lessonSlug: "decision-trees", stars: [450, 700, 880] }),
    ],
  },
  {
    id: "clusters",
    guide: GUIDES.clusters,
    chapter: 4,
    chapterTitle: "Clustering",
    title: "Sheepdog",
    icon: "🐕",
    tagline: "Sheep run to the nearest dog, dogs walk to the middle of their flock. That's K-Means.",
    accent: "violet",
    Round: ClustersRound,
    levels: [
      lv("clusters", { id: "elbow", number: 1, name: "Hire the dogs", brief: "More dogs means less walking for the sheep, but every dog costs wages.", howTo: "Hire or fire dogs and watch the cost bars, then sign contracts.", objective: "Hire the right number of dogs on 3 farms.", lesson: "Inertia always falls with more clusters. Pick K at the elbow.", lessonSlug: "k-means", stars: [500, 700, 900] }),
      lv("clusters", { id: "start", number: 2, name: "Drop zone", brief: "Where the dogs start decides which flocks they end up herding.", howTo: "Tap the field to drop 4 dogs, then whistle. Re-dropping costs points.", objective: "Herd 3 fields with walking distance close to the best possible.", lesson: "Bad starts trap K-Means. Spread them out or use k-means++.", lessonSlug: "k-means", stars: [500, 700, 900] }),
      lv("clusters", { id: "units", number: 3, name: "Wrong map scale", brief: "This map counts income in big numbers and visits in tiny ones. The dogs only see the big numbers.", howTo: "Fix the map scale (standardize), choose the number of dogs, whistle.", objective: "Find the real customer flocks on 3 farms.", lesson: "Distance is dominated by big-number features. Standardize first.", lessonSlug: "k-means", stars: [500, 700, 900] }),
      lv("clusters", { id: "rings", number: 4, name: "Strange shapes", brief: "Blobs, rings and moons. Dogs guard round patches. Can they herd a ring?", howTo: "Look at the field, then send sheepdogs (K-Means) or follow-the-leader (DBSCAN). One try.", objective: "Separate the true flocks on all 3 fields.", lesson: "K-Means draws straight borders. Density clustering follows any shape.", lessonSlug: "dbscan", stars: [500, 700, 900] }),
    ],
  },
  {
    id: "galaxy",
    guide: GUIDES.galaxy,
    chapter: 4,
    chapterTitle: "Clustering",
    title: "Star Mapper",
    icon: "🔭",
    tagline: "Map galaxies from raw starlight with family trees and density. No labels, no K given.",
    accent: "violet",
    Round: GalaxyRound,
    levels: [
      lv("galaxy", { id: "dendro", number: 1, name: "Cut the family tree", brief: "The star family tree shows every merge of nearby groups. Where you cut it decides the galaxies.", howTo: "Drag the red cut line on the tree, then publish the map.", objective: "Find the real galaxies in 3 skies.", lesson: "Cut the dendrogram at the biggest gap in merge distances.", lessonSlug: "hierarchical-clustering", stars: [500, 750, 900] }),
      lv("galaxy", { id: "linkage", number: 2, name: "Measure the gap", brief: "Is the distance between two galaxies their closest stars, or their farthest?", howTo: "Pick single or complete linkage. One try per sky.", objective: "Pick the linkage that finds the real galaxies in 3 skies.", lesson: "Single linkage follows chains; complete linkage keeps groups compact.", lessonSlug: "hierarchical-clustering", stars: [500, 750, 900] }),
      lv("galaxy", { id: "eps", number: 3, name: "Reach of light", brief: "Stars whose light reaches each other join the same galaxy. Spirals and rings included.", howTo: "Slide ε (light reach), watch galaxies form, then publish.", objective: "Find the real galaxies in 3 skies.", lesson: "DBSCAN chains dense points, so it follows any shape.", lessonSlug: "dbscan", stars: [500, 750, 900] }),
      lv("galaxy", { id: "noise", number: 4, name: "Space dust", brief: "Dust is scattered everywhere. Don't let it join a galaxy.", howTo: "Tune ε and minPts so dust turns grey (noise), then publish.", objective: "Keep the galaxies and flag the dust in 3 skies.", lesson: "minPts decides what counts as dense; the rest is noise.", lessonSlug: "dbscan", stars: [500, 820, 930] }),
    ],
  },
  {
    id: "neurons",
    guide: GUIDES.neurons,
    chapter: 5,
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
    chapter: 6,
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

/** Games that practise each /learn chapter. */
export const GAMES_FOR_CHAPTER: Record<string, GameId[]> = {
  foundations: ["descent"],
  regression: ["bridge"],
  supervised: ["threshold", "sorter"],
  unsupervised: ["clusters", "galaxy"],
  "deep-learning": ["neurons"],
  workflow: ["pipeline"],
};

/** Mirrors BADGES in apps/api/app/players/progress.py, for guests who have no server progress. */
export const BADGES = [
  { id: "first-steps", title: "First steps", description: "Pass your first level." },
  { id: "first-try", title: "First try", description: "Pass a level on your first run." },
  { id: "on-fire", title: "On fire", description: "Keep a 3-day streak." },
  { id: "unstoppable", title: "Unstoppable", description: "Keep a 7-day streak." },
  { id: "explorer", title: "Explorer", description: "Pass a level in every game." },
  { id: "descent-master", title: "Gradient guru", description: "3 stars on every Valley Runner level." },
  { id: "bridge-master", title: "Chief engineer", description: "3 stars on every Bridge Builder level." },
  { id: "threshold-master", title: "Royal gatekeeper", description: "3 stars on every Gatekeeper level." },
  { id: "sorter-master", title: "Head zookeeper", description: "3 stars on every Creature Sorter level." },
  { id: "clusters-master", title: "Top dog", description: "3 stars on every Sheepdog level." },
  { id: "galaxy-master", title: "Astronomer royal", description: "3 stars on every Star Mapper level." },
  { id: "neurons-master", title: "Shield master", description: "3 stars on every Shield Builder level." },
  { id: "pipeline-master", title: "Master detective", description: "3 stars on every Data Heist level." },
  { id: "level-5", title: "Rising star", description: "Reach player level 5." },
];
