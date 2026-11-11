/** Threshold: pure logic. A conveyor of scored items; the player moves the cut-off while they pass the gate. */
import { gaussian, mulberry32, sigmoid } from "../framework/math";

export type Item = { p: number; y: 0 | 1 };
export type Cfg = { n: number; prevalence: number; sep: number; spread: number; costFN: number; costFP: number; seed: number; noun: string; positive: string };

export const CFGS: Record<string, Cfg> = {
  sigmoid: { n: 24, prevalence: 0.5, sep: 2.2, spread: 0.9, costFN: 1, costFP: 1, seed: 5, noun: "visitors", positive: "monster" },
  balanced: { n: 30, prevalence: 0.5, sep: 1.0, spread: 1.1, costFN: 1, costFP: 1, seed: 8, noun: "visitors", positive: "monster" },
  screening: { n: 32, prevalence: 0.25, sep: 0.9, spread: 1.1, costFN: 25, costFP: 1, seed: 5, noun: "travellers", positive: "plague carrier" },
  fraud: { n: 60, prevalence: 0.05, sep: 1.9, spread: 1.0, costFN: 20, costFP: 1, seed: 9, noun: "merchants", positive: "spy" },
};

/** Deterministic item sequence: exactly round(n × prevalence) positives, shuffled. */
export function makeItems(cfg: Cfg): Item[] {
  const rand = mulberry32(cfg.seed);
  const g = gaussian(mulberry32(cfg.seed + 1000));
  const pos = Math.max(1, Math.round(cfg.n * cfg.prevalence));
  const labels: (0 | 1)[] = Array.from({ length: cfg.n }, (_, i) => (i < pos ? 1 : 0));
  for (let i = labels.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [labels[i], labels[j]] = [labels[j], labels[i]];
  }
  return labels.map((y) => ({ y, p: sigmoid((y ? cfg.sep : -cfg.sep) + cfg.spread * g()) }));
}

export type Outcome = "TP" | "FP" | "FN" | "TN";
export const judge = (item: Item, t: number): Outcome => {
  const flagged = item.p >= t;
  return flagged ? (item.y ? "TP" : "FP") : item.y ? "FN" : "TN";
};
export const costOf = (o: Outcome, cfg: Cfg) => (o === "FN" ? cfg.costFN : o === "FP" ? cfg.costFP : 0);

export function costAt(items: Item[], t: number, cfg: Cfg): number {
  return items.reduce((s, it) => s + costOf(judge(it, t), cfg), 0);
}

/** Best and worst cost a single fixed threshold could have achieved on this exact sequence. */
export function fixedRange(items: Item[], cfg: Cfg) {
  let best = Infinity;
  let worst = 0;
  let bestT = 0.5;
  for (let i = 2; i <= 98; i++) {
    const t = i / 100;
    const c = costAt(items, t, cfg);
    if (c < best) {
      best = c;
      bestT = t;
    }
    worst = Math.max(worst, c);
  }
  return { best, worst, bestT };
}

export function runScore(cost: number, best: number, worst: number): number {
  if (worst <= best) return cost <= best ? 1000 : 0;
  return Math.round(1000 * Math.max(0, Math.min(1, (worst - cost) / (worst - best))));
}

export const SPAWN_MS = 750;
export const TRAVEL_MS = 3400;
