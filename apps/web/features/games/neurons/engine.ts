/**
 * Neuron Surgeon (Chapter 4: neural networks and backpropagation).
 * A real 2-input, one-hidden-layer network trained with full-batch gradient descent and backprop.
 * Seeded initialisation, so the same settings always train the same network.
 */
import { fmt, gaussian, mean, mulberry32, pct, sigmoid, std } from "../framework/math";
import type { Evaluation, LevelDef, Params } from "../framework/types";

export type Sample = { x: number; y: number; label: 0 | 1 };
export type Activation = "linear" | "sigmoid" | "tanh" | "relu";

const act: Record<Activation, (z: number) => number> = {
  linear: (z) => z,
  sigmoid: (z) => sigmoid(z),
  tanh: (z) => Math.tanh(z),
  relu: (z) => Math.max(0, z),
};
const dact: Record<Activation, (z: number, a: number) => number> = {
  linear: () => 1,
  sigmoid: (_z, a) => a * (1 - a),
  tanh: (_z, a) => 1 - a * a,
  relu: (z) => (z > 0 ? 1 : 0),
};

export type TrainConfig = { hidden: number; activation: Activation; lr: number; epochs: number; standardize: boolean; seed?: number };

export function train(data: Sample[], cfg: TrainConfig) {
  const mx = cfg.standardize ? mean(data.map((d) => d.x)) : 0;
  const my = cfg.standardize ? mean(data.map((d) => d.y)) : 0;
  const sx = cfg.standardize ? std(data.map((d) => d.x)) : 1;
  const sy = cfg.standardize ? std(data.map((d) => d.y)) : 1;
  const prep = (x: number, y: number) => [(x - mx) / sx, (y - my) / sy];
  const g = gaussian(mulberry32(cfg.seed ?? 3));
  const H = cfg.hidden;
  const W1 = Array.from({ length: H }, () => [g() * Math.SQRT1_2 * 1.2, g() * Math.SQRT1_2 * 1.2]);
  const b1 = new Array(H).fill(0).map(() => 0.1 * g());
  const W2 = Array.from({ length: H }, () => g() / Math.sqrt(H));
  let b2 = 0;
  const f = act[cfg.activation];
  const df = dact[cfg.activation];
  const n = data.length;
  const loss: number[] = [];
  const inputs = data.map((d) => prep(d.x, d.y));

  for (let epoch = 0; epoch <= cfg.epochs; epoch++) {
    const gW1 = W1.map(() => [0, 0]);
    const gb1 = new Array(H).fill(0);
    const gW2 = new Array(H).fill(0);
    let gb2 = 0;
    let total = 0;
    for (let i = 0; i < n; i++) {
      const [a0, a1] = inputs[i];
      const z = W1.map((w, h) => w[0] * a0 + w[1] * a1 + b1[h]);
      const a = z.map(f);
      const out = sigmoid(a.reduce((s, v, h) => s + v * W2[h], b2));
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
    loss.push(total / n);
    if (!Number.isFinite(total)) break;
    if (epoch === cfg.epochs) break;
    for (let h = 0; h < H; h++) {
      W1[h][0] -= cfg.lr * gW1[h][0];
      W1[h][1] -= cfg.lr * gW1[h][1];
      b1[h] -= cfg.lr * gb1[h];
      W2[h] -= cfg.lr * gW2[h];
    }
    b2 -= cfg.lr * gb2;
  }

  const predict = (x: number, y: number) => {
    const [a0, a1] = prep(x, y);
    const a = W1.map((w, h) => f(w[0] * a0 + w[1] * a1 + b1[h]));
    return sigmoid(a.reduce((s, v, h) => s + v * W2[h], b2));
  };
  const accuracy = data.filter((d) => (predict(d.x, d.y) >= 0.5 ? 1 : 0) === d.label).length / n;
  const dead = cfg.activation === "relu" ? W1.filter((w, h) => inputs.every(([a0, a1]) => w[0] * a0 + w[1] * a1 + b1[h] <= 0)).length : 0;
  return { loss, accuracy, predict, dead };
}

// ---------- datasets ----------
const gx = gaussian(mulberry32(71));
export const XOR_DATA: Sample[] = [[1.5, 1.5, 1], [-1.5, -1.5, 1], [1.5, -1.5, 0], [-1.5, 1.5, 0]].flatMap(([cx, cy, label]) =>
  Array.from({ length: 30 }, () => ({ x: cx + 0.5 * gx(), y: cy + 0.5 * gx(), label: label as 0 | 1 })),
);

const rc = mulberry32(73);
export const CIRCLE_DATA: Sample[] = Array.from({ length: 180 }, () => {
  const x = rc() * 6 - 3;
  const y = rc() * 6 - 3;
  return { x, y, label: (Math.hypot(x, y) < 1.8 ? 1 : 0) as 0 | 1 };
});

// Raw sensor-style readings in the thousands. Linearly separable once scaled.
const gs = gaussian(mulberry32(79));
export const RAW_DATA: Sample[] = [[4300, 2600, 0], [5600, 3400, 1]].flatMap(([cx, cy, label]) =>
  Array.from({ length: 60 }, () => ({ x: cx + 380 * gs(), y: cy + 260 * gs(), label: label as 0 | 1 })),
);

const rm = mulberry32(83);
const gm = gaussian(mulberry32(84));
export const MOONS_DATA: Sample[] = Array.from({ length: 160 }, (_, i) => {
  const upper = i % 2 === 0;
  const a = rm() * Math.PI;
  const x = upper ? Math.cos(a) : 1 - Math.cos(a);
  const y = upper ? Math.sin(a) : 0.45 - Math.sin(a);
  return { x: x + 0.1 * gm(), y: y + 0.1 * gm(), label: (upper ? 0 : 1) as 0 | 1 };
});

export const BOUNDS: Record<string, { x: [number, number]; y: [number, number]; xLabel: string; yLabel: string }> = {
  xor: { x: [-3.2, 3.2], y: [-3.2, 3.2], xLabel: "x₁", yLabel: "x₂" },
  capacity: { x: [-3, 3], y: [-3, 3], xLabel: "x₁", yLabel: "x₂" },
  saturate: { x: [3000, 7000], y: [1700, 4300], xLabel: "sensor A (raw units)", yLabel: "sensor B (raw units)" },
  lr: { x: [-1.4, 2.4], y: [-1, 1.5], xLabel: "x₁", yLabel: "x₂" },
};
export const DATA: Record<string, Sample[]> = { xor: XOR_DATA, capacity: CIRCLE_DATA, saturate: RAW_DATA, lr: MOONS_DATA };

export const SETUP = {
  xor: { hidden: 4, lr: 0.5, epochs: 400, target: 0.95 },
  capacity: { activation: "tanh" as Activation, lr: 0.5, epochs: 600, target: 0.93 },
  saturate: { hidden: 3, activation: "sigmoid" as Activation, epochs: 300, target: 0.95 },
  lr: { hidden: 8, activation: "relu" as Activation, epochs: 300, target: 0.93 },
};

export const LEVELS: LevelDef[] = [
  {
    id: "xor",
    number: 1,
    name: "No straight line",
    brief: "Opposite corners share a class (the XOR pattern). No single straight line can split them. The network has one hidden layer with 4 neurons. You choose the hidden layer's activation function.",
    objective: `Reach ${pct(SETUP.xor.target)} accuracy after ${SETUP.xor.epochs} epochs.`,
    lesson: "Without a non-linear activation, stacking layers just multiplies matrices together: the whole network collapses into one linear model, which can only draw a straight line. Non-linearity is what lets hidden layers bend the boundary.",
    controls: [
      {
        kind: "choice",
        id: "activation",
        label: "Hidden-layer activation",
        options: [
          { value: "linear", label: "Linear", detail: "a = z" },
          { value: "sigmoid", label: "Sigmoid", detail: "a = 1 / (1 + e⁻ᶻ)" },
          { value: "tanh", label: "Tanh", detail: "a = tanh(z)" },
          { value: "relu", label: "ReLU", detail: "a = max(0, z)" },
        ],
      },
    ],
    initial: { activation: "linear" },
  },
  {
    id: "capacity",
    number: 2,
    name: "Too few neurons",
    brief: "Points inside the circle are one class. Activation is tanh. Each hidden neuron contributes one straight 'fold' to the boundary. How many does it take to wrap around a circle?",
    objective: `Reach ${pct(SETUP.capacity.target)} accuracy after ${SETUP.capacity.epochs} epochs, with as few neurons as you can.`,
    lesson: "Each hidden neuron adds one straight edge the network can bend around. One neuron gives a line, two give a strip, and three or more can start to enclose a region. Too little capacity underfits no matter how long you train.",
    controls: [{ kind: "slider", id: "hidden", label: "Hidden neurons", min: 1, max: 8, step: 1 }],
    initial: { hidden: 1 },
  },
  {
    id: "saturate",
    number: 3,
    name: "Saturated",
    brief: "Two sensor readings in the thousands. The classes are easy to separate, yet the network (sigmoid, 3 hidden neurons) refuses to learn.",
    objective: `Reach ${pct(SETUP.saturate.target)} accuracy after ${SETUP.saturate.epochs} epochs.`,
    lesson: "Inputs in the thousands push every sigmoid to 0 or 1 where its slope is almost zero, so backprop's gradients vanish and the weights stop moving. Scaling inputs to small numbers keeps neurons in their sensitive range.",
    controls: [
      { kind: "slider", id: "lr", label: "Learning rate α", min: 0.001, max: 10, step: 0.001, log: true },
      { kind: "toggle", id: "standardize", label: "Standardize inputs (z-score)" },
    ],
    initial: { lr: 0.1, standardize: false },
  },
  {
    id: "lr",
    number: 4,
    name: "Learning-rate surgery",
    brief: "Two interlocking moons. 8 ReLU neurons are plenty, but the learning rate is way off. You get 300 epochs.",
    objective: `Reach ${pct(SETUP.lr.target)} accuracy.`,
    lesson: "Backprop gives the direction; the learning rate sets the step. Too small and 300 epochs aren't enough; too big and updates overshoot, or push ReLU neurons into the always-zero 'dead' zone where they never recover.",
    controls: [{ kind: "slider", id: "lr", label: "Learning rate α", min: 0.001, max: 50, step: 0.001, log: true }],
    initial: { lr: 0.003 },
  },
];

const GRID = 26;
function surface(levelId: string, predict: (x: number, y: number) => number): number[][] {
  const b = BOUNDS[levelId];
  return Array.from({ length: GRID }, (_, j) =>
    Array.from({ length: GRID }, (_, i) => {
      const x = b.x[0] + ((i + 0.5) / GRID) * (b.x[1] - b.x[0]);
      const y = b.y[0] + ((j + 0.5) / GRID) * (b.y[1] - b.y[0]);
      const p = predict(x, y);
      return Number.isFinite(p) ? p : 0.5;
    }),
  );
}

export function configFor(levelId: string, p: Params): TrainConfig {
  if (levelId === "xor") return { hidden: SETUP.xor.hidden, activation: String(p.activation) as Activation, lr: SETUP.xor.lr, epochs: SETUP.xor.epochs, standardize: false, seed: 5 };
  if (levelId === "capacity") return { hidden: Number(p.hidden), activation: SETUP.capacity.activation, lr: SETUP.capacity.lr, epochs: SETUP.capacity.epochs, standardize: false };
  if (levelId === "saturate") return { hidden: SETUP.saturate.hidden, activation: SETUP.saturate.activation, lr: Number(p.lr), epochs: SETUP.saturate.epochs, standardize: Boolean(p.standardize) };
  return { hidden: SETUP.lr.hidden, activation: SETUP.lr.activation, lr: Number(p.lr), epochs: SETUP.lr.epochs, standardize: false };
}

export function evaluate(levelId: string, p: Params): Evaluation {
  const cfg = configFor(levelId, p);
  const target = SETUP[levelId as keyof typeof SETUP].target;
  const res = train(DATA[levelId], cfg);
  const finalLoss = res.loss.at(-1)!;
  const diverged = !Number.isFinite(finalLoss);
  const pass = !diverged && res.accuracy >= target;
  const viz = { grid: surface(levelId, res.predict), loss: res.loss };
  const base = [
    { label: "Accuracy", value: pct(res.accuracy), good: pass },
    { label: "Target", value: pct(target) },
    { label: "Final loss", value: diverged ? "diverged" : fmt(finalLoss) },
  ];

  let feedback: string;
  if (levelId === "xor") {
    feedback = pass
      ? `The ${cfg.activation} neurons bent the boundary into the X shape. That's something no linear model can do.`
      : cfg.activation === "linear"
        ? "Four linear neurons stacked together are still one linear function. The boundary can only be a straight line, and XOR needs at least two."
        : "Close, but not converged yet. Try another non-linear activation.";
  } else if (levelId === "capacity") {
    feedback = pass
      ? `${cfg.hidden} neurons were enough to enclose the circle.${cfg.hidden > 4 ? " Fewer would also work. Extra capacity costs compute and can overfit." : ""}`
      : cfg.hidden <= 2
        ? `${cfg.hidden === 1 ? "One neuron can only draw a single straight line." : "Two neurons make at most a strip between two lines."} The circle needs edges on every side.`
        : "Almost. Add a neuron or two.";
  } else if (levelId === "saturate") {
    feedback = pass
      ? "Scaled inputs keep each sigmoid in its middle range, where its slope is large and gradients flow."
      : cfg.standardize
        ? "Inputs are scaled now. Adjust the learning rate."
        : `With inputs around 5,000 every hidden sigmoid outputs exactly 0 or 1 for every point, so their gradient is ~0 and nothing learns. A bigger learning rate can't fix a zero gradient.`;
  } else {
    feedback = pass
      ? "Good step size: big enough to finish in 300 epochs, small enough to stay stable."
      : diverged
        ? "The loss exploded. The steps are far too big."
        : res.dead >= cfg.hidden / 2
          ? `${res.dead} of ${cfg.hidden} ReLU neurons died: a huge update pushed them to output 0 for every input, and a dead ReLU has zero gradient. Use a smaller α.`
          : res.loss[0] - finalLoss < 0.15
            ? "The loss barely moved in 300 epochs. The steps are tiny. Increase α."
            : "Getting there, but not converged. Adjust α.";
  }

  return {
    pass,
    score: pass ? Math.round(600 + 400 * res.accuracy) : Math.round(400 * res.accuracy),
    headline: pass ? `${pct(res.accuracy)} accuracy. The network learned it.` : diverged ? "Training diverged." : `${pct(res.accuracy)} accuracy.`,
    feedback,
    metrics: levelId === "lr" ? [...base, { label: "Dead ReLU neurons", value: `${res.dead} / ${cfg.hidden}` }] : base,
    viz,
  };
}
