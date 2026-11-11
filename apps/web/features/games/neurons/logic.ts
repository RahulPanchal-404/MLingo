/** Neuron Surgeon: pure logic. A small real network (2 inputs, one hidden layer) trained step by step with backprop. */
import { gaussian, mean, mulberry32, sigmoid, std } from "../framework/math";

export type Sample = { x: number; y: number; label: 0 | 1 };
export type Activation = "linear" | "sigmoid" | "tanh" | "relu";

const act: Record<Activation, (z: number) => number> = { linear: (z) => z, sigmoid: (z) => sigmoid(z), tanh: Math.tanh, relu: (z) => Math.max(0, z) };
const dact: Record<Activation, (z: number, a: number) => number> = {
  linear: () => 1,
  sigmoid: (_z, a) => a * (1 - a),
  tanh: (_z, a) => 1 - a * a,
  relu: (z) => (z > 0 ? 1 : 0),
};

export type NetConfig = { hidden: number; activation: Activation; lr: number; standardize: boolean; seed?: number };

export type Trainer = {
  step: (epochs: number) => void;
  epoch: () => number;
  predict: (x: number, y: number) => number;
  accuracy: () => number;
  loss: () => number;
  /** Hidden units whose output is zero for every sample (ReLU only). */
  dead: () => number;
};

export function makeTrainer(data: Sample[], cfg: NetConfig): Trainer {
  const mx = cfg.standardize ? mean(data.map((d) => d.x)) : 0;
  const my = cfg.standardize ? mean(data.map((d) => d.y)) : 0;
  const sx = cfg.standardize ? std(data.map((d) => d.x)) : 1;
  const sy = cfg.standardize ? std(data.map((d) => d.y)) : 1;
  const prep = (x: number, y: number): [number, number] => [(x - mx) / sx, (y - my) / sy];
  const g = gaussian(mulberry32(cfg.seed ?? 3));
  const H = cfg.hidden;
  const W1 = Array.from({ length: H }, () => [g() * Math.SQRT1_2 * 1.2, g() * Math.SQRT1_2 * 1.2]);
  const b1 = Array.from({ length: H }, () => 0.1 * g());
  const W2 = Array.from({ length: H }, () => g() / Math.sqrt(H));
  let b2 = 0;
  const f = act[cfg.activation];
  const df = dact[cfg.activation];
  const inputs = data.map((d) => prep(d.x, d.y));
  const n = data.length;
  let epochs = 0;
  let lastLoss = Math.log(2);

  const forward = (a0: number, a1: number) => {
    const z = W1.map((w, h) => w[0] * a0 + w[1] * a1 + b1[h]);
    const a = z.map(f);
    return { z, a, out: sigmoid(a.reduce((s, v, h) => s + v * W2[h], b2)) };
  };

  function step(count: number) {
    for (let e = 0; e < count; e++) {
      const gW1 = W1.map(() => [0, 0]);
      const gb1 = new Array<number>(H).fill(0);
      const gW2 = new Array<number>(H).fill(0);
      let gb2 = 0;
      let total = 0;
      for (let i = 0; i < n; i++) {
        const [a0, a1] = inputs[i];
        const { z, a, out } = forward(a0, a1);
        const t = data[i].label;
        total -= t * Math.log(Math.max(out, 1e-12)) + (1 - t) * Math.log(Math.max(1 - out, 1e-12));
        const dOut = (out - t) / n;
        gb2 += dOut;
        for (let h = 0; h < H; h++) {
          gW2[h] += dOut * a[h];
          const dz = dOut * W2[h] * df(z[h], a[h]);
          gW1[h][0] += dz * a0;
          gW1[h][1] += dz * a1;
          gb1[h] += dz;
        }
      }
      lastLoss = total / n;
      for (let h = 0; h < H; h++) {
        W1[h][0] -= cfg.lr * gW1[h][0];
        W1[h][1] -= cfg.lr * gW1[h][1];
        b1[h] -= cfg.lr * gb1[h];
        W2[h] -= cfg.lr * gW2[h];
      }
      b2 -= cfg.lr * gb2;
      epochs++;
    }
  }

  const predict = (x: number, y: number) => {
    const [a0, a1] = prep(x, y);
    const p = forward(a0, a1).out;
    return Number.isFinite(p) ? p : 0.5;
  };
  return {
    step,
    epoch: () => epochs,
    predict,
    accuracy: () => data.filter((d) => (predict(d.x, d.y) >= 0.5 ? 1 : 0) === d.label).length / n,
    loss: () => (Number.isFinite(lastLoss) ? lastLoss : Infinity),
    dead: () => (cfg.activation === "relu" ? W1.filter((w, h) => inputs.every(([a0, a1]) => w[0] * a0 + w[1] * a1 + b1[h] <= 0)).length : 0),
  };
}

// ---------- datasets ----------
const gx = gaussian(mulberry32(71));
const XOR: Sample[] = [[1.5, 1.5, 1], [-1.5, -1.5, 1], [1.5, -1.5, 0], [-1.5, 1.5, 0]].flatMap(([cx, cy, label]) =>
  Array.from({ length: 30 }, () => ({ x: cx + 0.5 * gx(), y: cy + 0.5 * gx(), label: label as 0 | 1 })),
);
const rc = mulberry32(73);
const CIRCLE: Sample[] = Array.from({ length: 180 }, () => {
  const x = rc() * 6 - 3;
  const y = rc() * 6 - 3;
  return { x, y, label: (Math.hypot(x, y) < 1.8 ? 1 : 0) as 0 | 1 };
});
const gs = gaussian(mulberry32(79));
const RAW: Sample[] = [[4300, 2600, 0], [5600, 3400, 1]].flatMap(([cx, cy, label]) =>
  Array.from({ length: 60 }, () => ({ x: cx + 380 * gs(), y: cy + 260 * gs(), label: label as 0 | 1 })),
);
const rm = mulberry32(83);
const gm = gaussian(mulberry32(84));
const MOONS: Sample[] = Array.from({ length: 160 }, (_, i) => {
  const upper = i % 2 === 0;
  const a = rm() * Math.PI;
  return { x: (upper ? Math.cos(a) : 1 - Math.cos(a)) + 0.1 * gm(), y: (upper ? Math.sin(a) : 0.45 - Math.sin(a)) + 0.1 * gm(), label: (upper ? 0 : 1) as 0 | 1 };
});

export type Setup = {
  data: Sample[];
  x: [number, number];
  y: [number, number];
  start: NetConfig;
  target: number;
  /** Which controls the player gets. */
  controls: ("activation" | "hidden" | "lr" | "standardize")[];
  hint: string;
};

export const SETUPS: Record<string, Setup> = {
  xor: { data: XOR, x: [-3.2, 3.2], y: [-3.2, 3.2], start: { hidden: 4, activation: "linear", lr: 0.5, standardize: false }, target: 0.95, controls: ["activation"], hint: "The network can only draw one straight line. Change what each neuron does." },
  capacity: { data: CIRCLE, x: [-3, 3], y: [-3, 3], start: { hidden: 1, activation: "tanh", lr: 0.5, standardize: false }, target: 0.93, controls: ["hidden"], hint: "One neuron can only draw one line. How many does a circle need?" },
  saturate: { data: RAW, x: [3000, 7000], y: [1700, 4300], start: { hidden: 3, activation: "sigmoid", lr: 0.5, standardize: false }, target: 0.95, controls: ["standardize", "lr"], hint: "The inputs are in the thousands. Look at the loss line." },
  lr: { data: MOONS, x: [-1.4, 2.4], y: [-1, 1.5], start: { hidden: 8, activation: "relu", lr: 20, standardize: false }, target: 0.93, controls: ["lr"], hint: "Watch the loss and the dead neurons while you tune the learning rate." },
};

export const EPOCHS_PER_SECOND = 90;
export const TIME_LIMIT = 30;
export const GRID = 22;

/** 1000 for an instant win, falling with time taken and with every change of settings after the first. */
export const winScore = (seconds: number, changes: number) => Math.max(120, Math.round(1000 - 28 * seconds - 70 * Math.max(0, changes - 1)));
