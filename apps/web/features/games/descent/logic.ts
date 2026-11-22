import type { Debrief } from "../framework/types";
/**
 * Valley Runner: pure logic. A skier on a loss surface. Each jump is one gradient-descent update:
 * new position = position − learning rate × slope (with optional momentum).
 */

export type Land = {
  dim: 1 | 2;
  /** Curvature per axis for quadratic bowls (drawn as contour ellipses in 2D). */
  curv?: number[];
  center: number[];
  loss: (p: number[]) => number;
  grad: (p: number[]) => number[];
  start: number[];
  /** Reached the deepest point. */
  won: (p: number[]) => boolean;
  fuel: number;
  stepMs: number;
  xRange: [number, number];
  yRange: [number, number];
  /** Points for a win using `jumps` jumps (0–1000). */
  points: (jumps: number) => number;
};

/** 1-D bowl with its bottom at `center`. Flying off either edge of the map lands in lava. */
export const valley = (c: number, center = 0, start = 3, fuel = 20): Land => ({
  dim: 1,
  curv: [c],
  center: [center],
  loss: ([w]) => 0.5 * c * (w - center) ** 2,
  grad: ([w]) => [c * (w - center)],
  start: [start],
  won: ([w]) => Math.abs(w - center) < 0.12,
  fuel,
  stepMs: 420,
  xRange: [-5, 5],
  yRange: [0, 0.5 * c * 64],
  points: (j) => Math.max(300, 1000 - 60 * (j - 1)),
});

/** Two weights on very different scales (top-down canyon). `waxed` = standardized features: the canyon becomes a round bowl. */
export const ravine = (k: number, waxed: boolean): Land => {
  const c = waxed ? [1, 1] : [1, k];
  const s = waxed ? Math.sqrt(k) : 1;
  return {
    dim: 2,
    curv: c,
    center: [0, 0],
    loss: ([a, b]) => 0.5 * (c[0] * a * a + c[1] * b * b),
    grad: ([a, b]) => [c[0] * a, c[1] * b],
    start: [3, 0.6 * s],
    won: ([a, b]) => 0.5 * (c[0] * a * a + c[1] * b * b) < 0.02,
    fuel: 40,
    stepMs: 280,
    xRange: [-4, 4],
    yRange: [-1 * s, 1 * s],
    points: (j) => Math.max(300, 1000 - 20 * (j - 1)),
  };
};

const dip = (w: number) => Math.exp(-((w + 0.8) ** 2) / 0.6);
export const TRAP_GOAL = 4;
export const trap = (start: number): Land => ({
  dim: 1,
  center: [TRAP_GOAL],
  loss: ([w]) => 0.08 * (w - 4) ** 2 - 1.6 * dip(w),
  grad: ([w]) => [0.16 * (w - 4) + 1.6 * dip(w) * ((2 * (w + 0.8)) / 0.6)],
  start: [start],
  won: ([w]) => Math.abs(w - TRAP_GOAL) < 0.3,
  fuel: 80,
  stepMs: 120,
  xRange: [-6, 9],
  yRange: [-1.8, 3.2],
  points: (j) => Math.max(300, 1000 - 9 * (j - 1)),
});

export type Status = "ready" | "running" | "won" | "lava" | "fuel" | "stuck";
export type Controls = { lr: number; momentum: boolean };
export type Sim = { pos: number[]; prev: number[]; vel: number[]; jumps: number; status: Status };

export const initSim = (land: Land): Sim => ({ pos: land.start, prev: land.start, vel: land.start.map(() => 0), jumps: 0, status: "ready" });

const outOfMap = (land: Land, p: number[]) =>
  !p.every(Number.isFinite) || p[0] < land.xRange[0] || p[0] > land.xRange[1] || (land.dim === 2 && (p[1] < land.yRange[0] || p[1] > land.yRange[1]));

function settle(land: Land, sim: Sim, pos: number[], vel: number[]): Sim {
  const jumps = sim.jumps + 1;
  const moved = Math.hypot(...pos.map((p, i) => p - sim.pos[i]));
  const status: Status = outOfMap(land, pos)
    ? "lava"
    : land.won(pos)
      ? "won"
      : jumps >= land.fuel
        ? "fuel"
        : jumps > 4 && moved < 1e-3 && Math.hypot(...vel) < 1e-2
          ? "stuck"
          : "running";
  return { pos, prev: sim.pos, vel, jumps, status };
}

/** One automatic gradient-descent jump. Momentum (β = 0.9) keeps most of the last jump's direction. */
export function stepSim(land: Land, sim: Sim, ctl: Controls): Sim {
  const g = land.grad(sim.pos);
  const beta = ctl.momentum ? 0.9 : 0;
  const vel = sim.vel.map((v, i) => beta * v + g[i]);
  return settle(land, sim, sim.pos.map((p, i) => p - ctl.lr * vel[i]), vel);
}

/** Level 1: the player picks the direction; the jump length is learning rate × steepness. */
export function stepManual(land: Land, sim: Sim, dir: -1 | 1, lr: number): Sim {
  const g = land.grad(sim.pos)[0];
  return settle(land, sim, [sim.pos[0] + dir * lr * Math.abs(g)], [g]);
}

/** Whole run at a fixed setting (tests, and to check every course is winnable). */
export function simulate(land: Land, ctl: Controls): Sim {
  let sim: Sim = { ...initSim(land), status: "running" };
  while (sim.status === "running") sim = stepSim(land, sim, ctl);
  return sim;
}

/** Fewest jumps for level 1 if you always jump downhill. */
export function bestManualJumps(land: Land, lr: number): number {
  let sim: Sim = { ...initSim(land), status: "running" };
  while (sim.status === "running") sim = stepManual(land, sim, land.grad(sim.pos)[0] > 0 ? -1 : 1, lr);
  return sim.status === "won" ? sim.jumps : land.fuel;
}

// ---------- courses ----------
export type Course = { name: string; land: Land; lr?: number };

export const COURSES: Record<string, (waxed: boolean) => Course[]> = {
  eyeball: () => [
    { name: "Foggy hill", land: valley(1, 1.5, -3.5, 14), lr: 0.4 },
    { name: "Whiteout", land: valley(0.6, -2, 3.5, 14), lr: 0.4 / 0.6 },
    { name: "Blizzard", land: valley(1.5, 0.5, -3.2, 14), lr: 0.4 / 1.5 },
  ],
  "step-size": () => [
    { name: "Gentle slope", land: valley(1) },
    { name: "Steep drop", land: valley(4) },
    { name: "Long plain", land: valley(0.25) },
  ],
  ravine: (waxed) => [25, 60, 100].map((k, i) => ({ name: ["Narrow canyon", "Deep canyon", "Knife-edge canyon"][i], land: ravine(k, waxed) })),
  trap: () => [-2.6, -2.0, -3.0].map((s, i) => ({ name: ["The false valley", "Closer call", "Long way round"][i], land: trap(s) })),
};

const num = (x: number) => String(Number(x.toPrecision(2)));

/** Largest stable jump power for a quadratic bowl (gradient descent diverges above 2 / steepest curvature). */
export const maxStablePower = (land: Land) => (land.curv ? 2 / Math.max(...land.curv) : undefined);

/**
 * Plain-language reason for a failed run, based on what actually happened
 * (one huge jump vs growing overshoots, uphill jumps in the manual level, and so on).
 */
const GD_IDEA =
  "This is gradient descent, the way almost every model learns. The mountain's height is the loss, how wrong the model is. Your position is the model's weights. The slope under your feet is the gradient. Each step moves against the slope by learning rate × slope, so steps are long where the ground is steep and short near the bottom.";
const LR_IDEA =
  "Jump power is the learning rate. Too small and training needs a huge number of steps (you run out of fuel). Too large and each step overshoots the bottom, lands on steeper ground on the other side, and overshoots even more, until the loss explodes. That is called divergence. The right learning rate depends on how steep the loss is.";

/** Why a run failed, in plain words, with the fix. */
export function explainFail(land: Land, run: Sim, opts: { manual: boolean; lr: number; waxed?: boolean }): Debrief {
  const { manual, lr } = opts;
  if (manual) {
    if (run.status === "lava")
      return {
        happened: "You flew off the edge of the mountain into the lava.",
        why: "Some of your jumps went uphill. The length of each jump depends on how steep the ground is, and uphill the ground gets steeper, so your jumps kept getting longer until one carried you off the edge.",
        fix: "The slope reading points uphill. Always jump the opposite way.",
        idea: GD_IDEA,
      };
    return {
      happened: "You ran out of jumps before reaching the flag.",
      why: "Uphill jumps waste fuel and land you on steeper ground, further from the flag.",
      fix: "Always jump the opposite way to the slope reading.",
      idea: GD_IDEA,
    };
  }
  if (run.status === "stuck")
    return {
      happened: "You stopped in a small dip before the real bottom.",
      why: "At the bottom of the dip the ground is flat, so the slope is zero and plain gradient descent has nothing to follow. It stops, even though the flag is lower down.",
      fix: "Put on the momentum boots: they keep part of your previous speed, which carries you over the bump.",
      idea: "This dip is a local minimum: lower than everything around it, but not the lowest point. Momentum is a common fix. Each step keeps a fraction of the previous step's movement, like a rolling ball, so the model can coast through flat spots and small bumps.",
    };
  const limit = maxStablePower(land);
  const steep = land.curv ? Math.max(...land.curv) : undefined;
  const good = steep ? 1 / steep : undefined;
  if (run.status === "fuel")
    return {
      happened: `You ran out of fuel after ${land.fuel} jumps, still short of the flag.`,
      why: `Jump power ${num(lr)} is too weak for this mountain: each jump covered only a small part of the way.`,
      fix: "Raise the jump power." + (good ? ` About ${num(good)} gets there fastest on this mountain.` : ""),
      idea: LR_IDEA,
    };
  const ravineHint = land.dim === 2 && !opts.waxed && land.curv;
  const fix = ravineHint
    ? `Wax the skis (standardize). The canyon walls are ${num(land.curv![1] / land.curv![0])}× steeper than the floor, so any power above ${num(limit!)} bounces off a wall, and a power that low barely moves along the floor. Waxing makes every direction equally steep, so one power works everywhere.`
    : limit
      ? `Lower the jump power. On this mountain any power above ${num(limit)} overshoots more every jump. Try about ${num(good!)}.`
      : "Lower the jump power.";
  const idea = ravineHint
    ? "When one feature is on a much bigger scale than another, the loss becomes a narrow canyon: very steep across, nearly flat along. A learning rate small enough to stay inside the canyon is too small to make progress along it. Standardizing the features makes the loss round, so one learning rate suits every direction."
    : LR_IDEA;
  if (run.jumps === 1) {
    const jumpLen = Math.hypot(...run.pos.map((p, i) => p - run.prev[i]));
    const dist = Math.hypot(...run.prev.map((p, i) => p - land.center[i]));
    const slope = Math.hypot(...land.grad(run.prev));
    return {
      happened: `Your first jump was ${num(jumpLen)} long, but the flag was only ${num(dist)} away, so you flew straight off the mountain.`,
      why: `Jump length = power × steepness = ${num(lr)} × ${num(slope)}. The ground where you started is steep, so that power sent you far too far.`,
      fix,
      idea,
    };
  }
  return {
    happened: `You flew off the mountain after ${run.jumps} jumps.`,
    why: `Every jump overshot the flag by more than the last. Each overshoot landed you on steeper ground on the other side, which made the next jump even longer. The jump power (${num(lr)}) is too big for how steep this mountain is.`,
    fix,
    idea,
  };
}

export const LIVES = 3;
/** Each life lost on a course costs this many points from that course's score. */
export const LIFE_PENALTY = 150;
