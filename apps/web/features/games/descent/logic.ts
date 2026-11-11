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

export const LIVES = 3;
/** Each life lost on a course costs this many points from that course's score. */
export const LIFE_PENALTY = 150;
