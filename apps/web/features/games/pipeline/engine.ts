/**
 * Pipeline Detective (Chapter 5: data workflow). Find the bug in pipelines that look fine.
 * Every number shown is computed from the level's dataset, not hard-coded.
 */
import { fmt, gaussian, mean, mulberry32, pct, sigmoid } from "../framework/math";
import type { Evaluation, LevelDef, Params } from "../framework/types";

// ---------- Level 1: target leakage ----------
const r1 = mulberry32(91);
const g1 = gaussian(mulberry32(92));
export const LOANS = Array.from({ length: 240 }, () => {
  const credit = 650 + 70 * g1();
  const income = 60 + 20 * g1();
  const amount = 15 + 6 * g1();
  const defaulted = r1() < sigmoid(-(credit - 640) / 35 - (income - 60) / 60) ? 1 : 0;
  // Collections only call borrowers who have already defaulted.
  const calls = defaulted ? 2 + Math.floor(r1() * 6) : 0;
  return { credit, income, amount, calls, defaulted };
});
export const LOAN_FEATURES = [
  { key: "credit", label: "credit_score", detail: "Score at application time" },
  { key: "income", label: "annual_income", detail: "Declared at application" },
  { key: "amount", label: "loan_amount", detail: "Amount requested" },
  { key: "calls", label: "collection_calls", detail: "Calls logged by the collections team" },
] as const;

/** Test accuracy of the best single-threshold rule on one feature (fit on train, scored on test). */
export function soloAccuracy(key: (typeof LOAN_FEATURES)[number]["key"]): number {
  const train = LOANS.slice(0, 160);
  const test = LOANS.slice(160);
  let best = { t: 0, dir: 1, acc: 0 };
  const values = [...new Set(train.map((r) => r[key]))].sort((a, b) => a - b);
  for (const t of values)
    for (const dir of [1, -1]) {
      const acc = train.filter((r) => ((dir * (r[key] - t) > 0 ? 1 : 0) === r.defaulted)).length / train.length;
      if (acc > best.acc) best = { t, dir, acc };
    }
  return test.filter((r) => ((best.dir * (r[key] - best.t) > 0 ? 1 : 0) === r.defaulted)).length / test.length;
}

// ---------- Level 2: polynomial over/underfitting ----------
const truth = (x: number) => Math.sin(2.6 * x);
const g2 = gaussian(mulberry32(93));
const r2 = mulberry32(94);
export const POLY_TRAIN = Array.from({ length: 14 }, (_, i) => {
  const x = -0.95 + (1.9 * i) / 13 + 0.03 * g2();
  return { x, y: truth(x) + 0.22 * g2() };
});
export const POLY_TEST = Array.from({ length: 150 }, () => {
  const x = -0.95 + 1.9 * r2();
  return { x, y: truth(x) + 0.22 * g2() };
});

function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let piv = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
    [M[c], M[piv]] = [M[piv], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) x[r] = (M[r][n] - M[r].slice(r + 1, n).reduce((s, v, k) => s + v * x[r + 1 + k], 0)) / M[r][r];
  return x;
}

export function fitPoly(degree: number): number[] {
  const d = degree + 1;
  const AtA = Array.from({ length: d }, () => new Array(d).fill(0));
  const Aty = new Array(d).fill(0);
  for (const { x, y } of POLY_TRAIN) {
    const row = Array.from({ length: d }, (_, k) => x ** k);
    for (let i = 0; i < d; i++) {
      Aty[i] += row[i] * y;
      for (let j = 0; j < d; j++) AtA[i][j] += row[i] * row[j];
    }
  }
  for (let i = 0; i < d; i++) AtA[i][i] += 1e-9;
  return solve(AtA, Aty);
}
export const polyAt = (w: number[], x: number) => w.reduce((s, c, k) => s + c * x ** k, 0);
const mse = (w: number[], pts: { x: number; y: number }[]) => mean(pts.map((p) => (polyAt(w, p.x) - p.y) ** 2));
export const DEGREE_CURVES = Array.from({ length: 12 }, (_, i) => {
  const w = fitPoly(i + 1);
  return { degree: i + 1, train: mse(w, POLY_TRAIN), test: mse(w, POLY_TEST) };
});
export const BEST_TEST = Math.min(...DEGREE_CURVES.map((c) => c.test));

// ---------- Level 3: scaling before the split ----------
const g3 = gaussian(mulberry32(95));
export const INCOMES = Array.from({ length: 100 }, (_, i) => 45 + 12 * g3() + (i >= 80 ? 8 : 0)); // the last 20 rows (test) skew a little higher
export const TRAIN_MEAN = mean(INCOMES.slice(0, 80));
export const FULL_MEAN = mean(INCOMES);
export const TEST_MEAN = mean(INCOMES.slice(80));

// ---------- Level 4: accuracy on imbalanced data ----------
export const CHURN = { total: 300, positives: 9 };

export const LEVELS: LevelDef[] = [
  {
    id: "leak",
    number: 1,
    name: "Too good to be true",
    brief: "A teammate's loan-default model scores 100% on the test set. Nobody's model is that good. One of the four features is leaking the answer.",
    objective: "Find the leaking feature.",
    lesson: "Target leakage: a feature that is only known after (or because of) the outcome. It makes test scores look perfect and the model useless in production, where that information doesn't exist yet. Ask of every feature: would I have this at prediction time?",
    controls: [
      {
        kind: "choice",
        id: "feature",
        label: "Which feature leaks?",
        options: LOAN_FEATURES.map((f) => ({ value: f.key, label: f.label, detail: f.detail })),
      },
    ],
    initial: { feature: "credit" },
  },
  {
    id: "overfit",
    number: 2,
    name: "Fit or overfit?",
    brief: "Fit a polynomial to 14 training points. Higher degree means a more flexible model. The hidden test points are revealed when you Run.",
    objective: `Get test error (MSE) under ${fmt(BEST_TEST * 1.25, 3)}.`,
    lesson: "Training error always drops as the model gets more flexible, but test error falls and then rises. Too simple underfits (high bias); too flexible memorises the noise (high variance). Pick the model by held-out data, never by training error.",
    controls: [{ kind: "slider", id: "degree", label: "Polynomial degree", min: 1, max: 12, step: 1 }],
    initial: { degree: 12 },
  },
  {
    id: "order",
    number: 3,
    name: "Order of operations",
    brief: "Four teams standardized income (subtract the mean, divide by the standard deviation) in four different orders. Only one pipeline is honest.",
    objective: "Pick the pipeline that doesn't leak test information.",
    lesson: "Fit every preprocessing step (scalers, imputers, encoders) on the training set only, then apply it to the test set. Fitting on all the data lets test statistics leak into training and inflates your score.",
    controls: [
      {
        kind: "choice",
        id: "pipeline",
        label: "Which pipeline is correct?",
        options: [
          { value: "scale-then-split", label: "Fit scaler on all data → split → train" },
          { value: "split-fit-train", label: "Split → fit scaler on train → transform train and test → train" },
          { value: "split-fit-test", label: "Split → fit scaler on test → transform both → train" },
          { value: "split-fit-each", label: "Split → fit a separate scaler on train and on test" },
        ],
      },
    ],
    initial: { pipeline: "scale-then-split" },
  },
  {
    id: "metric",
    number: 4,
    name: "The 97% model",
    brief: `A churn model reports 97% accuracy on ${CHURN.total} customers. Only ${CHURN.positives} of them actually churned. Your manager wants to ship it.`,
    objective: "Pick the metric that reveals whether the model is any good.",
    lesson: "On imbalanced data, a model that always predicts the majority class gets high accuracy for free. Check recall and precision on the rare class (or F1, or the confusion matrix) before trusting it.",
    controls: [
      {
        kind: "choice",
        id: "metric",
        label: "What should you check?",
        options: [
          { value: "accuracy-fresh", label: "Accuracy on a fresh test set" },
          { value: "r2", label: "R² score" },
          { value: "recall", label: "Recall on the churners (how many it catches)" },
          { value: "mse", label: "Mean squared error" },
        ],
      },
    ],
    initial: { metric: "accuracy-fresh" },
  },
];

export function evaluate(levelId: string, p: Params): Evaluation {
  if (levelId === "leak") {
    const choice = String(p.feature);
    const solos = LOAN_FEATURES.map((f) => ({ label: f.label, key: f.key, acc: soloAccuracy(f.key) }));
    const pass = choice === "calls";
    const picked = solos.find((s) => s.key === choice)!;
    return {
      pass,
      score: pass ? 1000 : 0,
      headline: pass ? "Caught it: collection_calls." : `${picked.label} isn't it.`,
      feedback: pass
        ? "Collections only call people who have already defaulted, so the feature is the answer in disguise. On its own it scores 100% on the test set. At application time it's always 0."
        : `On its own, ${picked.label} reaches ${pct(picked.acc)} on the test set, nowhere near perfect. Which feature could only exist after the loan defaulted?`,
      metrics: solos.map((s) => ({ label: `${s.label} alone`, value: pct(s.acc), good: s.key === "calls" ? (pass ? false : undefined) : undefined })),
      viz: { solos },
    };
  }

  if (levelId === "overfit") {
    const degree = Number(p.degree);
    const c = DEGREE_CURVES[degree - 1];
    const target = BEST_TEST * 1.25;
    const pass = c.test <= target;
    return {
      pass,
      score: pass ? Math.round(Math.min(1000, (BEST_TEST / c.test) * 1000)) : Math.round(Math.min(500, (BEST_TEST / c.test) * 500)),
      headline: `Degree ${degree}: train MSE ${fmt(c.train)}, test MSE ${fmt(c.test)}.`,
      feedback: pass
        ? "Flexible enough to follow the curve, simple enough to ignore the noise."
        : c.train < c.test / 3
          ? "Training error is tiny but test error is high: the curve is threading through the noise in the training points. That's overfitting. Use a simpler model."
          : "Both errors are high: the model is too rigid to follow the pattern. That's underfitting. Allow more flexibility.",
      metrics: [
        { label: "Train MSE", value: fmt(c.train) },
        { label: "Test MSE", value: fmt(c.test), good: pass },
        { label: "Target", value: `≤ ${fmt(target, 3)}` },
      ],
      viz: { degree },
    };
  }

  if (levelId === "order") {
    const choice = String(p.pipeline);
    const pass = choice === "split-fit-train";
    const why: Record<string, string> = {
      "scale-then-split": `The scaler's mean was computed on all 100 rows (${fmt(FULL_MEAN, 1)}) instead of the 80 training rows (${fmt(TRAIN_MEAN, 1)}). The test set shaped the training data.`,
      "split-fit-test": "The model trains on data scaled with test-set statistics: the test set leaked straight into training.",
      "split-fit-each": `Train and test get different transformations (train mean ${fmt(TRAIN_MEAN, 1)}, test mean ${fmt(TEST_MEAN, 1)}), so the same income maps to different numbers. Test-set statistics are being used.`,
    };
    return {
      pass,
      score: pass ? 1000 : 0,
      headline: pass ? "Honest pipeline." : "This pipeline leaks.",
      feedback: pass
        ? `The scaler learns mean ${fmt(TRAIN_MEAN, 1)} from training rows only and applies it unchanged to the test rows, exactly what will happen with brand-new data in production.`
        : why[choice],
      metrics: [
        { label: "Train-only mean", value: fmt(TRAIN_MEAN, 1) },
        { label: "All-data mean", value: fmt(FULL_MEAN, 1) },
        { label: "Test-only mean", value: fmt(TEST_MEAN, 1) },
      ],
    };
  }

  // metric
  const choice = String(p.metric);
  const pass = choice === "recall";
  const acc = (CHURN.total - CHURN.positives) / CHURN.total;
  const why: Record<string, string> = {
    "accuracy-fresh": `A fresh test set with the same imbalance gives the same ${pct(acc)}: accuracy is the metric that's fooling you.`,
    r2: "R² is a regression metric; this is a classification problem.",
    mse: "MSE is for predicting numbers, not classes, and it would still be dominated by the 291 easy non-churners.",
  };
  return {
    pass,
    score: pass ? 1000 : 0,
    headline: pass ? `Recall: 0 of ${CHURN.positives} churners caught.` : "That won't expose it.",
    feedback: pass
      ? `The model predicts "won't churn" for everyone. That gets ${pct(acc)} accuracy and catches nobody. Recall 0%: it's useless for the job it was built for.`
      : why[choice],
    metrics: [
      { label: "Accuracy", value: pct(acc) },
      { label: "Recall (churners caught)", value: pass ? "0%" : "?", good: pass ? false : undefined },
      { label: "Churners", value: `${CHURN.positives} / ${CHURN.total}` },
    ],
  };
}
