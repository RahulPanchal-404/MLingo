/**
 * Gradient Golf engine. Each hole is a 2D loss surface; the hole sits at the global minimum.
 * A shot is a real optimization run (GD, momentum or Adam) starting from where the ball rests.
 * Pure functions only, so the game stays deterministic and testable.
 */

export type Vec = [number, number];
export type Optimizer = "gd" | "momentum" | "adam";

export type Hole = {
  id: string;
  number: number;
  name: string;
  tagline: string;
  lesson: string;
  par: number;
  tee: Vec;
  cup: Vec;
  loss: (x: number, y: number) => number;
  grad: (x: number, y: number) => Vec;
  optimizers: Optimizer[];
};

export const BOUNDS = 5;
export const CUP_RADIUS = 0.32;
export const STEPS_PER_SHOT = 12;
export const MAX_STROKES = 8;
export const LR_MIN = 0.001;
export const LR_MAX = 30;

export type ShotOutcome = "sunk" | "rest" | "out";
export type Shot = { path: Vec[]; outcome: ShotOutcome; end: Vec; distance: number };

const g = (x: number, y: number, cx: number, cy: number, s: number) => Math.exp(-((x - cx) ** 2 + (y - cy) ** 2) / s);

export const HOLES: Hole[] = [
  {
    id: "bowl",
    number: 1,
    name: "The Bowl",
    tagline: "A perfect round valley. Find the one swing that drops straight in.",
    lesson: "On a quadratic bowl there is an ideal learning rate. Too small crawls, too big overshoots, exactly right lands in one step.",
    par: 2,
    tee: [-3.5, 2.5],
    cup: [0, 0],
    loss: (x, y) => 0.5 * (x * x + y * y),
    grad: (x, y) => [x, y],
    optimizers: ["gd"],
  },
  {
    id: "valley",
    number: 2,
    name: "The Long Valley",
    tagline: "Steep walls, gentle floor. Big swings bounce off the walls.",
    lesson: "When curvature differs by direction, the steep direction caps your learning rate and the flat direction crawls. This is why feature scaling matters.",
    par: 3,
    tee: [-4.2, 1.5],
    cup: [0, 0],
    loss: (x, y) => 0.05 * x * x + 2 * y * y,
    grad: (x, y) => [0.1 * x, 4 * y],
    optimizers: ["gd", "momentum"],
  },
  {
    id: "plateau",
    number: 3,
    name: "The Plateau",
    tagline: "The tee sits on a flat mesa. The gradient barely whispers.",
    lesson: "Flat regions give tiny gradients, so plain GD needs a huge step to escape, then a small one near the minimum. Adaptive optimizers rescale for you.",
    par: 3,
    tee: [-3.6, -2.4],
    cup: [0, 0],
    loss: (x, y) => 3 * (1 - g(x, y, 0, 0, 2.2)),
    grad: (x, y) => {
      const e = g(x, y, 0, 0, 2.2);
      return [(3 * 2 * x * e) / 2.2, (3 * 2 * y * e) / 2.2];
    },
    optimizers: ["gd", "momentum", "adam"],
  },
  {
    id: "bunker",
    number: 4,
    name: "The Bunker",
    tagline: "A sand trap sits on the way. Roll through it, don't settle in it.",
    lesson: "A local minimum traps plain gradient descent. Momentum carries speed through shallow traps.",
    par: 3,
    tee: [-3.8, -2.8],
    cup: [2.5, 1.5],
    loss: (x, y) => 0.03 * (x * x + y * y) - 1.4 * g(x, y, -1.2, -1, 1.1) - 3 * g(x, y, 2.5, 1.5, 1.6),
    grad: (x, y) => {
      const a = g(x, y, -1.2, -1, 1.1);
      const b = g(x, y, 2.5, 1.5, 1.6);
      return [
        0.06 * x + (1.4 * 2 * (x + 1.2) * a) / 1.1 + (3 * 2 * (x - 2.5) * b) / 1.6,
        0.06 * y + (1.4 * 2 * (y + 1) * a) / 1.1 + (3 * 2 * (y - 1.5) * b) / 1.6,
      ];
    },
    optimizers: ["gd", "momentum", "adam"],
  },
  {
    id: "saddle",
    number: 5,
    name: "The Ridge",
    tagline: "A ridge blocks the direct line. Go over it or go around it.",
    lesson: "Gradients push you away from ridges, so GD can stall in front of one. A bold first step, or momentum, gets over.",
    par: 3,
    tee: [-3.4, 0.4],
    cup: [3, 0],
    loss: (x, y) => 0.08 * ((x - 3) ** 2 + y * y) + 2.5 * Math.exp(-(x * x) / 0.6 - (y * y) / 6),
    grad: (x, y) => {
      const r = 2.5 * Math.exp(-(x * x) / 0.6 - (y * y) / 6);
      return [0.16 * (x - 3) - (r * 2 * x) / 0.6, 0.16 * y - (r * 2 * y) / 6];
    },
    optimizers: ["gd", "momentum", "adam"],
  },
  {
    id: "canyon",
    number: 6,
    name: "The Banana Canyon",
    tagline: "A curved canyon, Rosenbrock style. The championship hole.",
    lesson: "Curved, narrow valleys are where plain GD zig-zags forever. This is the classic test that made Adam popular.",
    par: 4,
    tee: [-3.2, 2.6],
    cup: [1.5, 1.125],
    loss: (x, y) => 0.06 * (1.5 - x) ** 2 + 0.6 * (y - 0.5 * x * x) ** 2,
    grad: (x, y) => [-0.12 * (1.5 - x) - 1.2 * (y - 0.5 * x * x) * x, 1.2 * (y - 0.5 * x * x)],
    optimizers: ["gd", "momentum", "adam"],
  },
];

export function lrFromSlider(t: number): number {
  return LR_MIN * Math.pow(LR_MAX / LR_MIN, Math.min(1, Math.max(0, t)));
}

export function sliderFromLr(lr: number): number {
  return Math.log(lr / LR_MIN) / Math.log(LR_MAX / LR_MIN);
}

const dist = (a: Vec, b: Vec) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export function simulateShot(hole: Hole, start: Vec, lr: number, optimizer: Optimizer, steps = STEPS_PER_SHOT): Shot {
  let p: Vec = [start[0], start[1]];
  const path: Vec[] = [p];
  let v: Vec = [0, 0];
  let m: Vec = [0, 0];
  let s: Vec = [0, 0];
  const beta = 0.9;
  const b1 = 0.9;
  const b2 = 0.999;

  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = hole.grad(p[0], p[1]);
    let step: Vec;
    if (optimizer === "gd") {
      step = [lr * gx, lr * gy];
    } else if (optimizer === "momentum") {
      v = [beta * v[0] + gx, beta * v[1] + gy];
      step = [lr * v[0], lr * v[1]];
    } else {
      m = [b1 * m[0] + (1 - b1) * gx, b1 * m[1] + (1 - b1) * gy];
      s = [b2 * s[0] + (1 - b2) * gx * gx, b2 * s[1] + (1 - b2) * gy * gy];
      const mh: Vec = [m[0] / (1 - b1 ** t), m[1] / (1 - b1 ** t)];
      const sh: Vec = [s[0] / (1 - b2 ** t), s[1] / (1 - b2 ** t)];
      step = [(lr * 0.1 * mh[0]) / (Math.sqrt(sh[0]) + 1e-8), (lr * 0.1 * mh[1]) / (Math.sqrt(sh[1]) + 1e-8)];
    }
    const next: Vec = [p[0] - step[0], p[1] - step[1]];
    if (!Number.isFinite(next[0]) || !Number.isFinite(next[1]) || Math.abs(next[0]) > BOUNDS || Math.abs(next[1]) > BOUNDS) {
      path.push(next.map((c) => (Number.isFinite(c) ? Math.max(-BOUNDS * 1.15, Math.min(BOUNDS * 1.15, c)) : BOUNDS * 1.15)) as Vec);
      return { path, outcome: "out", end: start, distance: dist(start, hole.cup) };
    }
    p = next;
    path.push(p);
    // The ball drops when it rolls over the cup slowly enough.
    if (dist(p, hole.cup) < CUP_RADIUS && Math.hypot(step[0], step[1]) < 0.9) {
      return { path, outcome: "sunk", end: hole.cup, distance: 0 };
    }
  }
  return { path, outcome: "rest", end: p, distance: dist(p, hole.cup) };
}

export function starsFor(strokes: number, par: number, sunk: boolean): number {
  if (!sunk) return 0;
  if (strokes <= par) return 3;
  if (strokes === par + 1) return 2;
  return 1;
}

export function scoreFor(strokes: number, par: number, sunk: boolean): number {
  if (!sunk) return 0;
  const underPar = Math.max(0, par - strokes);
  return Math.max(100, 1000 - (strokes - 1) * 140) + underPar * 250;
}

export function golfTerm(strokes: number, par: number): string {
  if (strokes === 1) return "Hole in one";
  const diff = strokes - par;
  if (diff <= -2) return "Eagle";
  if (diff === -1) return "Birdie";
  if (diff === 0) return "Par";
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double bogey";
  return `+${diff}`;
}
