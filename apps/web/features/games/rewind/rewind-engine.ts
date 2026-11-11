/**
 * Rewind engine. A scenario is a real gradient-descent run on linear regression (y = wx + b)
 * that is doomed to fail. The player rewinds to a frame, applies one intervention, and training
 * continues from that exact state. Everything is deterministic and pure.
 */

export type Point = { x: number; y: number; outlier?: boolean };

export type TrainConfig = {
  /** Learning rate at a given step (supports schedules). */
  lr: (step: number) => number;
  data: Point[];
  momentum: number;
  clip: number | null;
};

export type Frame = { step: number; w: number; b: number; loss: number; lr: number; vw: number; vb: number };

export type Intervention = {
  id: string;
  label: string;
  detail: string;
  apply: (config: TrainConfig, atStep: number, frame: Frame) => TrainConfig;
};

export type Scenario = {
  id: string;
  number: number;
  title: string;
  brief: string;
  objective: string;
  steps: number;
  target: number;
  base: TrainConfig;
  /** Clean points the model is judged on. */
  evalData: Point[];
  interventions: Intervention[];
  fixId: string;
  lesson: string;
};

export const DIVERGED = 1e6;

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function makeLine(n: number, slope: number, intercept: number, noise: number, seed: number): Point[] {
  const r = seeded(seed);
  return Array.from({ length: n }, (_, i) => {
    const x = -1 + (2 * i) / (n - 1);
    return { x, y: slope * x + intercept + (r() - 0.5) * 2 * noise };
  });
}

export function mse(data: Point[], w: number, b: number): number {
  let total = 0;
  for (const p of data) total += (w * p.x + b - p.y) ** 2;
  return total / data.length;
}

function gradients(data: Point[], w: number, b: number): [number, number] {
  let gw = 0;
  let gb = 0;
  for (const p of data) {
    const err = w * p.x + b - p.y;
    gw += 2 * err * p.x;
    gb += 2 * err;
  }
  return [gw / data.length, gb / data.length];
}

/** Continue training from `start` (frame at `start.step`) until `steps`. Returns frames after start. */
export function simulate(config: TrainConfig, start: Frame, steps: number, evalData: Point[]): Frame[] {
  const frames: Frame[] = [];
  let { w, b, vw, vb } = start;
  for (let step = start.step + 1; step <= steps; step++) {
    const lr = config.lr(step - 1);
    let [gw, gb] = gradients(config.data, w, b);
    if (config.clip !== null) {
      const norm = Math.hypot(gw, gb);
      if (norm > config.clip) {
        gw = (gw / norm) * config.clip;
        gb = (gb / norm) * config.clip;
      }
    }
    vw = config.momentum * vw + gw;
    vb = config.momentum * vb + gb;
    w -= lr * vw;
    b -= lr * vb;
    const raw = mse(evalData, w, b);
    const loss = Number.isFinite(raw) ? Math.min(raw, DIVERGED) : DIVERGED;
    frames.push({ step, w, b, loss, lr, vw, vb });
    if (loss >= DIVERGED) {
      // Once blown up, the run is dead: hold the diverged frame to the end.
      for (let s = step + 1; s <= steps; s++) frames.push({ step: s, w, b, loss: DIVERGED, lr: config.lr(s - 1), vw, vb });
      break;
    }
  }
  return frames;
}

export function initialFrame(scenario: Scenario): Frame {
  return { step: 0, w: 0, b: 0, loss: mse(scenario.evalData, 0, 0), lr: scenario.base.lr(0), vw: 0, vb: 0 };
}

export function baselineRun(scenario: Scenario): Frame[] {
  const start = initialFrame(scenario);
  return [start, ...simulate(scenario.base, start, scenario.steps, scenario.evalData)];
}

export type Branch = { atStep: number; interventionId: string };

/** Replay the scenario with branches applied in order. Each branch rewrites the future from its step. */
export function runWithBranches(scenario: Scenario, branches: Branch[]): Frame[] {
  let frames = baselineRun(scenario);
  let config = scenario.base;
  for (const branch of branches) {
    const intervention = scenario.interventions.find((i) => i.id === branch.interventionId);
    if (!intervention) continue;
    const frame = frames[branch.atStep];
    config = intervention.apply(config, branch.atStep, frame);
    frames = [...frames.slice(0, branch.atStep + 1), ...simulate(config, frame, scenario.steps, scenario.evalData)];
  }
  return frames;
}

export function isSaved(scenario: Scenario, frames: Frame[]): boolean {
  const last = frames[frames.length - 1];
  return last.loss <= scenario.target && frames.every((f) => f.loss < DIVERGED);
}

/** Latest frame where applying the correct fix still saves the doomed baseline run. */
export function pointOfNoReturn(scenario: Scenario): number | null {
  let latest: number | null = null;
  for (let step = 0; step < scenario.steps; step++) {
    if (isSaved(scenario, runWithBranches(scenario, [{ atStep: step, interventionId: scenario.fixId }]))) latest = step;
  }
  return latest;
}

export function rewindScore(saved: boolean, rewindsUsed: number, lastRewindStep: number, steps: number) {
  if (!saved) return { stars: 0, score: 0 };
  const stars = Math.max(1, 4 - rewindsUsed);
  const lateness = lastRewindStep / steps;
  const score = Math.round(400 + 600 * lateness) - 150 * (rewindsUsed - 1);
  return { stars, score: Math.max(100, score) };
}

const constant = (value: number) => () => value;

const keep = (c: TrainConfig, patch: Partial<TrainConfig>): TrainConfig => ({ ...c, ...patch });

const cleanLine = makeLine(24, 2, 1, 0.15, 7);
const outlierData: Point[] = [...cleanLine, { x: 0.85, y: -14, outlier: true }, { x: 0.95, y: -16, outlier: true }];

export const SCENARIOS: Scenario[] = [
  {
    id: "overshoot",
    number: 1,
    title: "The Overshoot",
    brief: "An intern set the learning rate to 1.08 and went home. Every step overshoots the minimum by a little more than the last.",
    objective: "Get the loss under 0.05 by step 60.",
    steps: 60,
    target: 0.05,
    base: { lr: constant(1.08), data: cleanLine, momentum: 0, clip: null },
    evalData: cleanLine,
    fixId: "halve",
    interventions: [
      { id: "halve", label: "Halve the learning rate", detail: "α → 0.54 from this frame", apply: (c) => keep(c, { lr: constant(0.54) }) },
      { id: "tiny", label: "Slash the learning rate", detail: "α → 0.02 from this frame", apply: (c) => keep(c, { lr: constant(0.02) }) },
      { id: "momentum", label: "Add momentum", detail: "β = 0.9, same α", apply: (c) => keep(c, { momentum: 0.9 }) },
      { id: "clip", label: "Clip gradients", detail: "Cap gradient norm at 1.0", apply: (c) => keep(c, { clip: 1 }) },
    ],
    lesson: "Divergence on a convex problem means α is past the stability limit (2 / largest curvature). Halving it lands safely inside. Slashing it is stable but too slow to finish.",
  },
  {
    id: "warmup",
    number: 2,
    title: "Warm-up Gone Wrong",
    brief: "The learning-rate schedule keeps ramping up and nobody told it to stop. It trains beautifully until it doesn't.",
    objective: "Survive to step 60 with loss under 0.02.",
    steps: 60,
    target: 0.02,
    base: { lr: (s) => 0.08 * 1.09 ** s, data: cleanLine, momentum: 0, clip: null },
    evalData: cleanLine,
    fixId: "cap",
    interventions: [
      { id: "cap", label: "Cap the learning rate", detail: "α never goes above 0.6", apply: (c) => keep(c, { lr: (s) => Math.min(0.6, c.lr(s)) }) },
      { id: "freeze", label: "Freeze α where it is", detail: "Hold today's α for the rest of the run", apply: (c, at) => keep(c, { lr: constant(c.lr(at)) }) },
      { id: "restart", label: "Restart the warm-up", detail: "Ramp again from α = 0.08", apply: (c, at) => keep(c, { lr: (s) => 0.08 * 1.09 ** (s - at) }) },
      { id: "clip", label: "Clip gradients", detail: "Cap gradient norm at 1.0", apply: (c) => keep(c, { clip: 1 }) },
    ],
    lesson: "Schedules need a ceiling. Freezing only works while α is still stable, and restarting the warm-up only buys time: in a longer run it climbs right back into the same crash.",
  },
  {
    id: "outlier",
    number: 3,
    title: "The Outlier",
    brief: "Two corrupted rows slipped into the training set. The loss looks calm, but the line is learning the wrong thing.",
    objective: "Clean-data loss under 0.1 by step 50.",
    steps: 50,
    target: 0.1,
    base: { lr: constant(0.3), data: outlierData, momentum: 0, clip: null },
    evalData: cleanLine,
    fixId: "remove",
    interventions: [
      { id: "remove", label: "Drop the outliers", detail: "Remove the two corrupted points", apply: (c) => keep(c, { data: c.data.filter((p) => !p.outlier) }) },
      { id: "lower", label: "Lower the learning rate", detail: "α → 0.05", apply: (c) => keep(c, { lr: constant(0.05) }) },
      { id: "clip", label: "Clip gradients", detail: "Cap gradient norm at 0.5", apply: (c) => keep(c, { clip: 0.5 }) },
      { id: "momentum", label: "Add momentum", detail: "β = 0.9", apply: (c) => keep(c, { momentum: 0.9 }) },
    ],
    lesson: "A calm loss curve can still be wrong. Optimizer tweaks change how fast you converge, not where. Only fixing the data moves the destination.",
  },
  {
    id: "crawl",
    number: 4,
    title: "The Crawl",
    brief: "The model is so cautious it has barely moved. At this pace it'll converge sometime next semester.",
    objective: "Loss under 0.02 by step 60.",
    steps: 60,
    target: 0.02,
    base: { lr: constant(0.004), data: cleanLine, momentum: 0, clip: null },
    evalData: cleanLine,
    fixId: "boost",
    interventions: [
      { id: "boost", label: "Raise the learning rate", detail: "α → 0.5", apply: (c) => keep(c, { lr: constant(0.5) }) },
      { id: "rocket", label: "Go big", detail: "α → 1.2", apply: (c) => keep(c, { lr: constant(1.2) }) },
      { id: "momentum", label: "Add momentum", detail: "β = 0.9, same tiny α", apply: (c) => keep(c, { momentum: 0.9 }) },
      { id: "clip", label: "Clip gradients", detail: "Cap gradient norm at 1.0", apply: (c) => keep(c, { clip: 1 }) },
    ],
    lesson: "Too small is a failure too, just a quiet one. A good α converges in a handful of steps, so you can rewind late. Too big and you trade a crawl for a crash.",
  },
];
