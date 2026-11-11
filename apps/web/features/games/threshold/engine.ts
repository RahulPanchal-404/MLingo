/**
 * Threshold (Chapter 2: logistic regression, confusion matrix, precision vs recall).
 * Scores come from a fixed seeded model, so every threshold gives an exact, repeatable confusion matrix.
 */
import { fmt, gaussian, mulberry32, pct, sigmoid } from "../framework/math";
import type { Evaluation, LevelDef, Params } from "../framework/types";

export type Scored = { p: number; y: 0 | 1 };

// ---------- Level 1: fit a sigmoid to pass/fail by hours studied ----------
const r1 = mulberry32(31);
export const STUDY_DATA = Array.from({ length: 32 }, (_, i) => {
  const hours = 0.3 + (i / 31) * 9.4;
  const y: 0 | 1 = r1() < sigmoid(1.1 * (hours - 5)) ? 1 : 0;
  return { x: hours, y };
});
export function sigmoidLoss(center: number, steep: number) {
  const eps = 1e-12;
  return (
    STUDY_DATA.reduce((s, d) => {
      const p = Math.min(1 - eps, Math.max(eps, sigmoid(steep * (d.x - center))));
      return s - (d.y * Math.log(p) + (1 - d.y) * Math.log(1 - p));
    }, 0) / STUDY_DATA.length
  );
}
export const BEST_BCE = (() => {
  let best = Infinity;
  for (let c = 0; c <= 10; c += 0.05) for (let k = 0.1; k <= 5; k += 0.05) best = Math.min(best, sigmoidLoss(c, k));
  return best;
})();

// ---------- Levels 2–4: score distributions ----------
function scores(seed: number, nPos: number, nNeg: number, sep: number, spread: number): Scored[] {
  const g = gaussian(mulberry32(seed));
  const out: Scored[] = [];
  for (let i = 0; i < nPos; i++) out.push({ p: sigmoid(sep + spread * g()), y: 1 });
  for (let i = 0; i < nNeg; i++) out.push({ p: sigmoid(-sep + spread * g()), y: 0 });
  return out;
}
export const DATASETS: Record<string, Scored[]> = {
  balanced: scores(41, 60, 60, 1.3, 1.2),
  screening: scores(43, 30, 170, 0.8, 1.3),
  fraud: scores(47, 12, 388, 1.9, 1.1),
};

export function confusion(data: Scored[], t: number) {
  let tp = 0;
  let fp = 0;
  let fn = 0;
  let tn = 0;
  for (const d of data) {
    const flagged = d.p >= t;
    if (flagged && d.y === 1) tp++;
    else if (flagged) fp++;
    else if (d.y === 1) fn++;
    else tn++;
  }
  const n = data.length;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tp + fn ? tp / (tp + fn) : 0;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { tp, fp, fn, tn, accuracy: (tp + tn) / n, precision, recall, f1 };
}

const thresholds = Array.from({ length: 99 }, (_, i) => (i + 1) / 100);
const SCREEN_COST = { fn: 25, fp: 1 };
const screenCost = (t: number) => {
  const c = confusion(DATASETS.screening, t);
  return c.fn * SCREEN_COST.fn + c.fp * SCREEN_COST.fp;
};
export const TARGETS = {
  balancedAccuracy: Math.max(...thresholds.map((t) => confusion(DATASETS.balanced, t).accuracy)) - 0.03,
  screeningCost: Math.round(Math.min(...thresholds.map(screenCost)) * 1.15),
  fraudF1: Math.max(...thresholds.map((t) => confusion(DATASETS.fraud, t).f1)) - 0.08,
};

function matrixMetrics(c: ReturnType<typeof confusion>) {
  return [
    { label: "True positives", value: String(c.tp) },
    { label: "False positives", value: String(c.fp) },
    { label: "False negatives (missed)", value: String(c.fn) },
    { label: "True negatives", value: String(c.tn) },
  ];
}

export const LEVELS: LevelDef[] = [
  {
    id: "sigmoid",
    number: 1,
    name: "Shape the sigmoid",
    brief: "Students who studied more hours passed more often. Shape the curve that turns hours into a probability of passing: where the 50% boundary sits, and how steep it is.",
    objective: `Get the log loss (binary cross-entropy) under ${fmt(BEST_BCE + 0.07, 3)}.`,
    lesson: "The decision boundary is where the probability crosses 50%. Steepness is confidence: too flat and the model is unsure about everyone; too steep and every surprise costs a huge log-loss penalty.",
    controls: [
      { kind: "slider", id: "center", label: "Decision boundary (hours)", min: 0, max: 10, step: 0.1 },
      { kind: "slider", id: "steep", label: "Steepness (confidence)", min: 0.1, max: 5, step: 0.05 },
    ],
    initial: { center: 2.5, steep: 3 },
  },
  {
    id: "balanced",
    number: 2,
    name: "The balanced call",
    brief: "120 patients, half of them sick. The model gives each a risk score. Everyone at or above your threshold gets flagged as sick.",
    objective: `Reach ${pct(TARGETS.balancedAccuracy)} accuracy.`,
    lesson: "Every threshold trades false positives for false negatives. With balanced classes and equal costs, accuracy is a fair score, and the best threshold sits where the two groups overlap.",
    controls: [{ kind: "slider", id: "t", label: "Threshold", min: 0.01, max: 0.99, step: 0.01 }],
    initial: { t: 0.9 },
  },
  {
    id: "screening",
    number: 3,
    name: "Don't miss a tumour",
    brief: `Cancer screening for 200 people. A missed cancer (false negative) costs ${SCREEN_COST.fn}; a false alarm (an extra scan) costs ${SCREEN_COST.fp}.`,
    objective: `Keep the total cost at or below ${TARGETS.screeningCost}.`,
    lesson: "When a miss is far worse than a false alarm, lower the threshold and prioritise recall. The 'best' threshold depends on what mistakes cost, not on accuracy.",
    controls: [{ kind: "slider", id: "t", label: "Threshold", min: 0.01, max: 0.99, step: 0.01 }],
    initial: { t: 0.5 },
  },
  {
    id: "fraud",
    number: 4,
    name: "The 97% illusion",
    brief: "400 card transactions, only 12 are fraud. At the current threshold the model flags almost nothing, and its accuracy looks amazing.",
    objective: `Reach an F1 score of ${fmt(TARGETS.fraudF1, 2)} (F1 balances precision and recall).`,
    lesson: "With rare classes, accuracy lies: flagging nothing scores 97% here. Precision, recall and F1 look only at the class you care about.",
    controls: [{ kind: "slider", id: "t", label: "Threshold", min: 0.01, max: 0.99, step: 0.01 }],
    initial: { t: 0.97 },
  },
];

export function evaluate(levelId: string, p: Params): Evaluation {
  if (levelId === "sigmoid") {
    const loss = sigmoidLoss(Number(p.center), Number(p.steep));
    const target = BEST_BCE + 0.07;
    const pass = loss <= target;
    const acc = STUDY_DATA.filter((d) => (sigmoid(Number(p.steep) * (d.x - Number(p.center))) >= 0.5 ? 1 : 0) === d.y).length / STUDY_DATA.length;
    return {
      pass,
      score: Math.round(Math.max(0, 1000 - 2500 * Math.max(0, loss - BEST_BCE))),
      headline: pass ? `Log loss ${fmt(loss)}. Well calibrated.` : `Log loss ${fmt(loss)}.`,
      feedback: pass
        ? `Best possible here is ${fmt(BEST_BCE)}. Notice the curve isn't a cliff: some students who studied a lot still failed.`
        : Number(p.steep) > 2.5
          ? "Your curve is very steep, so the model is near-certain, and the students it gets wrong cost a fortune in log loss. Soften it."
          : "Move the boundary to where passes start to outnumber fails, then tune the steepness.",
      metrics: [
        { label: "Log loss", value: fmt(loss), good: pass },
        { label: "Target", value: `≤ ${fmt(target, 3)}` },
        { label: "Accuracy at 50%", value: pct(acc) },
      ],
    };
  }

  const data = DATASETS[levelId];
  const t = Number(p.t);
  const c = confusion(data, t);

  if (levelId === "balanced") {
    const pass = c.accuracy >= TARGETS.balancedAccuracy;
    return {
      pass,
      score: Math.round(c.accuracy * 1000),
      headline: `${pct(c.accuracy)} accuracy at threshold ${t.toFixed(2)}.`,
      feedback: pass
        ? "Moving the threshold either way now swaps one kind of mistake for the other."
        : c.fn > c.fp
          ? "Lots of sick patients are slipping under the threshold (false negatives). Lower it."
          : "Lots of healthy patients are being flagged (false positives). Raise it.",
      metrics: [...matrixMetrics(c), { label: "Accuracy", value: pct(c.accuracy), good: pass }, { label: "Target", value: pct(TARGETS.balancedAccuracy) }],
      viz: { t },
    };
  }

  if (levelId === "screening") {
    const cost = c.fn * SCREEN_COST.fn + c.fp * SCREEN_COST.fp;
    const pass = cost <= TARGETS.screeningCost;
    return {
      pass,
      score: Math.round(Math.min(1000, (TARGETS.screeningCost / Math.max(cost, 1)) * 900)),
      headline: `Total cost ${cost} (${c.fn} missed × ${SCREEN_COST.fn} + ${c.fp} false alarms × ${SCREEN_COST.fp}).`,
      feedback: pass
        ? `Recall ${pct(c.recall)}: you catch almost every cancer and accept extra scans. Accuracy is ${pct(c.accuracy)}, which doesn't matter here.`
        : c.fn * SCREEN_COST.fn > c.fp
          ? "Missed cancers dominate the cost. Lower the threshold so fewer sick people slip through."
          : "Now false alarms dominate. You've gone too low; nudge the threshold up.",
      metrics: [
        ...matrixMetrics(c),
        { label: "Recall", value: pct(c.recall), good: c.recall >= 0.9 },
        { label: "Total cost", value: `${cost} (target ≤ ${TARGETS.screeningCost})`, good: pass },
      ],
      viz: { t },
    };
  }

  // fraud
  const pass = c.f1 >= TARGETS.fraudF1;
  return {
    pass,
    score: Math.round(c.f1 * 1000),
    headline: `F1 ${fmt(c.f1, 2)}, accuracy ${pct(c.accuracy)}.`,
    feedback: pass
      ? `Accuracy barely changed (${pct(c.accuracy)}) while F1 went from near zero to ${fmt(c.f1, 2)}. That's why accuracy is the wrong metric for rare events.`
      : c.recall < 0.5
        ? `Accuracy is ${pct(c.accuracy)}, but you're catching only ${c.tp} of 12 frauds. Lower the threshold.`
        : `You catch ${c.tp} frauds but flag ${c.fp} legit transactions too (precision ${pct(c.precision)}). Raise it a little.`,
    metrics: [
      ...matrixMetrics(c),
      { label: "Precision", value: pct(c.precision) },
      { label: "Recall", value: pct(c.recall) },
      { label: "Accuracy", value: pct(c.accuracy) },
      { label: "F1", value: `${fmt(c.f1, 2)} (target ${fmt(TARGETS.fraudF1, 2)})`, good: pass },
    ],
    viz: { t },
  };
}
