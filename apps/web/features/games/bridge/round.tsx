"use client";

import { useMemo, useRef, useState } from "react";

import { svgPoint, useTicker } from "../framework/hooks";
import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar, type Debrief } from "../framework/kit";
import { fmt, logPosition, logValue, pct } from "../framework/math";
import type { RoundProps, RoundResult } from "../framework/types";
import {
  BEAMS, DEGREE_TASKS, LASSO_LAMBDAS, LASSO_TASKS, LINE_TASKS, REAL_BEAMS, RIDGE_DEGREE, RIDGE_TASKS, TRUCK_TOLERANCE,
  bestDegree, bestLambda, bestLassoLambda, bestLassoTest, bestLine, lassoScore, bestTestOverDegrees, bestTestOverLambdas, lassoModel, lassoTest, lineMse, polyModel, polyMse, polyPredict, ratioScore,
  type CurveTask, type Pt,
} from "./logic";

const W = 560;
const H = 320;
const sx = (x: number) => 50 + ((x + 1) / 2) * (W - 100);
const sy = (y: number) => H - 40 - ((y + 3) / 6) * (H - 70);
const unY = (py: number) => ((H - 40 - py) / (H - 70)) * 6 - 3;
const clampY = (v: number) => Math.max(-40, Math.min(H + 40, v));

type Mode = "line" | "degree" | "ridge";

/** The canyon: pillars (training data), the bridge (model), test checkpoints and the truck. */
function Canyon({
  train, f, checkpoints, truckX, ghost, onDrag,
}: {
  train: Pt[]; f: (x: number) => number; checkpoints?: { p: Pt; ok: boolean | null }[]; truckX?: number | null; ghost?: (x: number) => number; onDrag?: (side: "l" | "r", y: number) => void;
}) {
  const svg = useRef<SVGSVGElement>(null);
  const xs = Array.from({ length: 121 }, (_, i) => -1 + (2 * i) / 120);
  const road = xs.map((x) => `${sx(x)},${clampY(sy(f(x)))}`).join(" ");
  function drag(e: React.PointerEvent<SVGSVGElement>) {
    if (!onDrag || !svg.current) return;
    const p = svgPoint(e, svg.current, W, H);
    onDrag(p.x < W / 2 ? "l" : "r", Math.max(-3, Math.min(3, unY(p.y))));
  }
  return (
    <svg
      ref={svg}
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-auto w-full select-none ${onDrag ? "touch-none cursor-grab" : ""}`}
      onPointerDown={(e) => {
        if (!onDrag) return;
        e.currentTarget.setPointerCapture(e.pointerId);
        drag(e);
      }}
      onPointerMove={(e) => e.buttons === 1 && drag(e)}
      role="img"
      aria-label="Canyon with pillars and your bridge"
    >
      <defs>
        <linearGradient id="bb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#e0f2fe" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#bb-sky)" />
      <rect x={0} y={H - 30} width={W} height={30} fill="#0ea5e9" />
      <path d={`M0,${H} L0,60 L40,70 L46,${H} Z`} fill="#92400e" />
      <path d={`M${W},${H} L${W},60 L${W - 40},70 L${W - 46},${H} Z`} fill="#92400e" />
      {train.map((p, i) => (
        <g key={i}>
          <rect x={sx(p.x) - 4} y={clampY(sy(p.y))} width={8} height={Math.max(0, H - 30 - clampY(sy(p.y)))} fill="#78716c" />
          <rect x={sx(p.x) - 7} y={clampY(sy(p.y)) - 4} width={14} height={6} rx={2} fill="#44403c" />
          <line x1={sx(p.x)} x2={sx(p.x)} y1={clampY(sy(p.y))} y2={clampY(sy(f(p.x)))} stroke="#ef4444" strokeWidth={2} strokeOpacity={0.6} />
        </g>
      ))}
      {ghost ? <polyline points={xs.map((x) => `${sx(x)},${clampY(sy(ghost(x)))}`).join(" ")} fill="none" stroke="#16a34a" strokeWidth={3} strokeDasharray="8 6" /> : null}
      <polyline points={road} fill="none" stroke="#1e293b" strokeWidth={9} strokeLinejoin="round" />
      <polyline points={road} fill="none" stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="10 8" />
      {checkpoints?.map(({ p, ok }, i) => (
        <g key={i} opacity={ok === null ? 0.55 : 1}>
          <circle cx={sx(p.x)} cy={clampY(sy(p.y))} r={5} fill={ok === null ? "#64748b" : ok ? "#22c55e" : "#ef4444"} stroke="white" strokeWidth={1.5} />
          {ok === false ? <text x={sx(p.x)} y={clampY(sy(p.y)) - 9} textAnchor="middle" className="text-[11px]">💥</text> : null}
        </g>
      ))}
      {truckX !== null && truckX !== undefined ? (
        <text x={sx(truckX)} y={clampY(sy(f(truckX))) - 6} textAnchor="middle" className="text-[22px]" style={{ transform: "scaleX(-1)", transformBox: "fill-box", transformOrigin: "center" }}>🚚</text>
      ) : null}
      {onDrag ? (
        <>
          <circle aria-hidden="true" cx={sx(-1)} cy={clampY(sy(f(-1)))} r={12} fill="#f59e0b" stroke="white" strokeWidth={3} />
          <circle aria-hidden="true" cx={sx(1)} cy={clampY(sy(f(1)))} r={12} fill="#f59e0b" stroke="white" strokeWidth={3} />
        </>
      ) : null}
    </svg>
  );
}

/** Drives a truck across and grades every checkpoint it passes. */
function useTruck(points: Pt[] | null, f: (x: number) => number, onEnd: (hits: boolean[]) => void) {
  const [x, setX] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  useTicker(!!points && !done, (dt) => {
    const nx = (x ?? -1) + dt / 1600;
    if (nx >= 1) {
      setX(1);
      setDone(true);
      onEnd(points!.map((p) => Math.abs(f(p.x) - p.y) < TRUCK_TOLERANCE));
    } else setX(nx);
  });
  const reset = () => {
    setX(null);
    setDone(false);
  };
  const checks = points?.map((p) => ({ p, ok: x !== null && p.x <= x ? Math.abs(f(p.x) - p.y) < TRUCK_TOLERANCE : null }));
  return { x, checks, done, reset };
}

function CurveRound({ mode, onDone }: { mode: Mode; onDone: RoundProps["onDone"] }) {
  const tasks: CurveTask[] = mode === "line" ? LINE_TASKS : mode === "degree" ? DEGREE_TASKS : RIDGE_TASKS;
  const [i, setI] = useState(0);
  const task = tasks[i];
  const [left, setLeft] = useState(0);
  const [right, setRight] = useState(0);
  const [degree, setDegree] = useState(1);
  const [lambda, setLambda] = useState(1e-6);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | { score: number; err: number; best: number; hit: number }>(null);
  const [scores, setScores] = useState<number[]>([]);

  const model = useMemo(
    () => (mode === "degree" ? polyModel(task.train, degree) : mode === "ridge" ? polyModel(task.train, RIDGE_DEGREE, lambda) : null),
    [mode, task, degree, lambda],
  );
  const f = (x: number) => (model ? polyPredict(model, x) : left + ((right - left) * (x + 1)) / 2);
  const trainErr = model ? polyMse(model, task.train) : lineMse(task.train, left, right);
  const checkpoints = mode === "line" ? task.train : task.test;
  const truck = useTruck(sending ? checkpoints : null, f, (hits) => {
    const best = mode === "line" ? lineMse(task.train, bestLine(task.train).b - bestLine(task.train).w[0], bestLine(task.train).b + bestLine(task.train).w[0]) : mode === "degree" ? bestTestOverDegrees(task) : bestTestOverLambdas(task);
    const err = mode === "line" ? trainErr : polyMse(model!, task.test);
    setResult({ score: ratioScore(err, best), err, best, hit: hits.filter(Boolean).length / hits.length });
  });

  function next() {
    const all = [...scores, result!.score];
    if (all.length === tasks.length) {
      onDone(summary(mode, all));
      return;
    }
    setScores(all);
    setI(all.length);
    setSending(false);
    setResult(null);
    truck.reset();
    setLeft(0);
    setRight(0);
    setDegree(1);
    setLambda(1e-6);
  }

  const line = bestLine(task.train);
  return (
    <GameScreen>
      <TopBar
        left={<span className="text-white/70">🌉 {task.name} · {i + 1}/{tasks.length}</span>}
        right={
          <>
            <Stat icon="📏" value={`train err ${fmt(trainErr, 2)}`} />
            {mode !== "line" ? <span className="text-xs text-white/50">test trucks: {task.test.length}</span> : null}
          </>
        }
      />
      <Canyon
        train={task.train}
        f={f}
        checkpoints={sending ? truck.checks : undefined}
        truckX={sending ? truck.x : null}
        ghost={result && mode === "line" ? (x) => polyPredict(line, x) : undefined}
        onDrag={mode === "line" && !sending ? (side, y) => (side === "l" ? setLeft(y) : setRight(y)) : undefined}
      />
      {result ? (
        <Banner
          title={result.score >= 850 ? "🏆 Rock-solid bridge!" : result.score >= 500 ? "🙂 Most trucks made it" : "💥 Trucks in the river"}
          score={result.score}
          debrief={mode === "line" ? lineDebrief(result.score, result.err, result.best, left, right, line) : curveDebrief(mode, task, degree, lambda, trainErr, result.err, result.hit)}
        >
          <GameButton onClick={next}>{i + 1 === tasks.length ? "Finish" : "Next canyon →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        {mode === "line" ? (
          <div className="flex w-full flex-col gap-1.5">
            <span className="text-xs text-white/70">Drag the orange ends of the bridge, or use the sliders. The red lines are the errors.</span>
            <div className="flex flex-wrap gap-4">
              {([["Left end height", left, setLeft], ["Right end height", right, setRight]] as const).map(([label, v, set]) => (
                <label key={label} className="flex min-w-[200px] flex-1 items-center gap-2 text-xs text-white/80">
                  <span className="whitespace-nowrap font-bold text-white">{label}</span>
                  <input type="range" min={-3} max={3} step={0.05} value={v} onChange={(e) => set(Number(e.target.value))} disabled={sending} className="flex-1 accent-amber-400" />
                  <span className="w-10 font-mono text-white">{v.toFixed(2)}</span>
                </label>
              ))}
            </div>
          </div>
        ) : null}
        {mode === "degree" ? (
          <div className="flex w-full flex-col gap-1.5">
            <span className="text-xs text-white/80">
              <b className="text-white">Bendiness (degree):</b> 1 = a straight plank, 12 = bends like a snake.{" "}
              <b className="text-amber-300">Now: degree {degree} — {degree <= 2 ? "stiff" : degree <= 5 ? "flexible" : degree <= 8 ? "very bendy" : "wild"}</b>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 12 }, (_, n) => (
                <GameButton key={n} tone="ghost" active={degree === n + 1} onClick={() => setDegree(n + 1)} disabled={sending}>
                  {n + 1}
                </GameButton>
              ))}
            </div>
          </div>
        ) : null}
        {mode === "ridge" ? (
          <label className="flex min-w-[240px] flex-1 items-center gap-2 text-xs text-white/70">
            <span className="whitespace-nowrap font-bold text-white">Stiffness λ</span>
            <span className="whitespace-nowrap text-[11px] text-amber-300">🐍 bendy</span>
            <input type="range" min={0} max={1000} value={logPosition(lambda, 1e-7, 10)} onChange={(e) => setLambda(Number(logValue(Number(e.target.value), 1e-7, 10).toPrecision(2)))} disabled={sending} className="flex-1 accent-amber-400" aria-label="Regularization strength lambda" />
            <span className="whitespace-nowrap text-[11px] text-sky-300">stiff 🪵</span>
            <span className="w-16 font-mono text-sm font-black text-white">{lambda.toExponential(0)}</span>
            <span className="whitespace-nowrap text-[11px] font-bold text-white">{lambda < 1e-4 ? "wiggles through every pillar" : lambda < 0.1 ? "balanced" : "too stiff: flat"}</span>
          </label>
        ) : null}
        <span className="ml-auto" />
        <GameButton onClick={() => setSending(true)} disabled={sending}>{mode === "line" ? "Open the bridge 🚚" : "Send test trucks 🚚"}</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

function LassoRound({ onDone }: Pick<RoundProps, "onDone">) {
  const [i, setI] = useState(0);
  const [lambda, setLambda] = useState(0.001);
  const [result, setResult] = useState<null | { score: number; err: number; best: number; kept: number; junkKept: number }>(null);
  const [scores, setScores] = useState<number[]>([]);
  const task = LASSO_TASKS[i];
  const model = useMemo(() => lassoModel(task, lambda), [task, lambda]);
  const maxW = 2.4;

  function test() {
    const err = lassoTest(task, model);
    const best = bestLassoTest(task);
    const kept = model.w.filter((w) => Math.abs(w) > 1e-6).length;
    const junkKept = model.w.filter((w, j) => Math.abs(w) > 1e-6 && !REAL_BEAMS.includes(j)).length;
    setResult({ score: lassoScore(err, best), err, best, kept, junkKept });
  }
  function next() {
    const all = [...scores, result!.score];
    if (all.length === LASSO_TASKS.length) {
      onDone(summary("lasso", all));
      return;
    }
    setScores(all);
    setI(all.length);
    setResult(null);
    setLambda(0.001);
  }
  return (
    <GameScreen>
      <TopBar left={<span className="text-white/70">🏗️ {task.name} · {i + 1}/{LASSO_TASKS.length}</span>} right={<Stat icon="🔩" value={`${model.w.filter((w) => Math.abs(w) > 1e-6).length}/8 beams kept`} />} />
      <div className="space-y-2 bg-gradient-to-b from-sky-300 to-sky-100 p-4 text-slate-900">
        <p className="text-xs font-bold text-slate-700">Each beam is a feature. Its thickness is the weight the model gives it. Lasso cuts beams whose weight hits zero.</p>
        {BEAMS.map((name, j) => {
          const w = model.w[j];
          const cut = Math.abs(w) < 1e-6;
          return (
            <div key={name} className="flex items-center gap-2">
              <span className="w-28 text-xs font-bold">{name}</span>
              <span className="relative h-5 flex-1 rounded bg-white/60">
                <span className="absolute inset-y-0 left-1/2 w-px bg-slate-500" />
                {!cut ? (
                  <span
                    className={`absolute inset-y-0.5 rounded transition-all duration-200 ${w > 0 ? "bg-slate-700" : "bg-amber-700"}`}
                    style={{ left: w > 0 ? "50%" : `${50 - (Math.min(maxW, -w) / maxW) * 50}%`, width: `${(Math.min(maxW, Math.abs(w)) / maxW) * 50}%` }}
                  />
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-rose-600">✂ CUT</span>
                )}
              </span>
              <span className="w-14 text-right font-mono text-[11px]">{cut ? "0" : fmt(w, 2)}</span>
              {result ? <span className="w-5 text-center text-xs">{REAL_BEAMS.includes(j) ? "✅" : "🗑️"}</span> : null}
            </div>
          );
        })}
      </div>
      {result ? (
        <Banner
          title={result.score >= 850 ? "🏆 Lean, strong bridge!" : result.junkKept > 2 ? "🗑️ Too much junk left" : "🙂 Decent"}
          score={result.score}
          debrief={lassoDebrief(result.score, result.kept, result.junkKept, model.w, lambda, bestLassoLambda(task))}
        >
          <GameButton onClick={next}>{i + 1 === LASSO_TASKS.length ? "Finish" : "Next bridge →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        <label className="flex min-w-[240px] flex-1 items-center gap-2 text-xs text-white/70">
          <span className="whitespace-nowrap font-bold text-white">Lasso λ</span>
          <input type="range" min={0} max={1000} value={logPosition(lambda, LASSO_LAMBDAS[0], LASSO_LAMBDAS.at(-1)!)} onChange={(e) => setLambda(Number(logValue(Number(e.target.value), LASSO_LAMBDAS[0], LASSO_LAMBDAS.at(-1)!).toPrecision(2)))} disabled={!!result} className="flex-1 accent-amber-400" aria-label="Lasso strength lambda" />
          <span className="w-14 font-mono text-sm font-black text-white">{fmt(lambda, 3)}</span>
        </label>
        <GameButton onClick={test} disabled={!!result}>Load test 🚚</GameButton>
      </ControlDeck>
    </GameScreen>
  );
}

const LINE_IDEA =
  "A straight bridge is the simplest prediction model there is: a line, ŷ = w·x + b, where w is the tilt and b the height. To score a line we take each miss (each red line), square it and average them. Squaring makes big misses count much more than small ones. The line with the smallest possible score is called the least-squares line, and finding it is linear regression.";

/** Feedback for a hand-placed line, including which end is off and by how much. */
function lineDebrief(score: number, err: number, best: number, left: number, right: number, m: { w: number[]; b: number }): Debrief {
  const bestL = m.b - m.w[0];
  const bestR = m.b + m.w[0];
  const ends = ([["left", left - bestL], ["right", right - bestR]] as const).filter(([, d]) => Math.abs(d) >= 0.15);
  const endText = ends.map(([side, d]) => `the ${side} end is about ${fmt(Math.abs(d), 1)} too ${d > 0 ? "high" : "low"}`).join(" and ");
  if (score >= 850)
    return {
      happened: `Your bridge runs almost exactly along the best line (the green dashed line). Your error is ${fmt(err, 3)}; the best possible is ${fmt(best, 3)}.`,
      idea: LINE_IDEA,
    };
  return {
    happened: `Your bridge misses the pillars by more than it needs to. Its error (each red line's length squared, then averaged) is ${fmt(err, 3)}. The best straight bridge for these pillars, drawn as the green dashed line, gets ${fmt(best, 3)}.`,
    why: endText
      ? `Compared with the green line, ${endText}, so the bridge tilts away from where most pillars are. Each red line is squared before averaging, so a pillar missed by 2 costs four times as much as one missed by 1.`
      : "The bridge is close, but slightly off the green line along its length. Because each red line is squared, even small shifts add up.",
    fix: "Move the ends until the bridge runs through the middle of the pillars, with about as many pillars above it as below. Line it up with the green dashed line and watch the red lines shrink.",
    idea: LINE_IDEA,
  };
}

const OVERFIT_IDEA =
  "The pillars are training data: what the model learns from. The test trucks are new data it never saw. A model that copies the training data too closely, including its random noise, does badly on new data. That is called overfitting. A model too simple to follow the real pattern is underfitting. The aim is always the lowest error on new data, not on the training data.";
const RIDGE_IDEA =
  "Stiffness is regularization. The bridge is allowed to be very bendy (degree 12), but every bend costs extra: ridge regression adds λ × (sum of the squared weights) to the error, so the model only bends where the pillars really demand it. Instead of picking a simpler model, you keep the flexible one and hold it back. λ is chosen by checking which value does best on new data.";

/** Feedback for the bendy (degree) and stiff (ridge) bridges, compared with the best setting for this canyon. */
function curveDebrief(mode: Mode, task: CurveTask, degree: number, lambda: number, trainErr: number, testErr: number, hit: number): Debrief {
  const happened = `${pct(hit)} of the test trucks made it across. Test trucks are new trucks that played no part in shaping the bridge, so they show how it handles real traffic. Error on the pillars: ${fmt(trainErr, 2)}. Error on the test trucks: ${fmt(testErr, 2)}.`;
  if (mode === "degree") {
    const best = bestDegree(task);
    if (degree === best)
      return { happened, why: `Bendiness ${degree} was the best choice for this canyon. The trucks that still fell were thrown off by random noise that no bridge can predict.`, idea: OVERFIT_IDEA };
    return degree > best
      ? {
          happened,
          why: `Bendiness ${degree} lets the bridge bend to touch every pillar, even pillars that sit a little off because of random noise. To do that it swings up and down between them, exactly where the trucks drive. Notice the error on the pillars is lower than on the trucks.`,
          fix: `Lower the bendiness. On this canyon, bendiness ${best} did best on the test trucks.`,
          idea: OVERFIT_IDEA,
        }
      : {
          happened,
          why: `Bendiness ${degree} is too stiff to follow the curve of the canyon. It misses pillars and trucks alike, which is why both errors are high.`,
          fix: `Raise the bendiness. On this canyon, bendiness ${best} did best on the test trucks.`,
          idea: OVERFIT_IDEA,
        };
  }
  const best = bestLambda(task);
  const ratio = lambda / best;
  if (ratio > 1 / 3.2 && ratio < 3.2)
    return { happened, why: "That was about the best stiffness for this canyon. The remaining misses come from random noise in the data.", idea: RIDGE_IDEA };
  return lambda < best
    ? {
        happened,
        why: `With stiffness λ = ${lambda.toExponential(0)} there is almost no cost to bending, so the degree-12 bridge still wiggles through every pillar and throws trucks off between them.`,
        fix: `Raise the stiffness. About λ = ${best.toExponential(0)} worked best here.`,
        idea: RIDGE_IDEA,
      }
    : {
        happened,
        why: `Stiffness λ = ${lambda.toExponential(0)} makes bending so costly that the bridge goes nearly flat and can't follow the canyon.`,
        fix: `Lower the stiffness. About λ = ${best.toExponential(0)} worked best here.`,
        idea: RIDGE_IDEA,
      };
}

const LASSO_IDEA =
  "Each beam is a feature: a piece of information the model can use. Only Steel, Height and Span really matter; the others are junk that happens to line up with the data by chance. Lasso adds λ × (sum of the sizes of the weights) to the error. Unlike ridge, this pushes weak weights all the way to zero, cutting those features out. So Lasso picks the useful features for you, and λ sets how strict it is.";

function lassoDebrief(score: number, kept: number, junk: number, w: number[], lambda: number, best: number): Debrief {
  const realCut = REAL_BEAMS.filter((j) => Math.abs(w[j]) < 1e-6).map((j) => BEAMS[j]);
  const happened = `You kept ${kept} of the 8 beams, and ${junk} of the ones you kept ${junk === 1 ? "is" : "are"} junk (marked 🗑️). Real beams are marked ✅.`;
  if (realCut.length)
    return {
      happened,
      why: `λ was so strict that it cut real beams (${realCut.join(", ")}). Without them the bridge can't carry the load, so predictions on new data got worse.`,
      fix: `Lower λ. About ${fmt(best, 2)} was best here.`,
      idea: LASSO_IDEA,
    };
  if (junk > 0 && lambda < best)
    return {
      happened,
      why: `λ was too lenient, so ${junk} junk ${junk === 1 ? "beam" : "beams"} stayed in. With only 13 training examples, junk features can match the noise by luck, and that luck does not repeat on new data.`,
      fix: `Raise λ until the junk beams are cut. About ${fmt(best, 2)} was best here.`,
      idea: LASSO_IDEA,
    };
  return { happened, why: score >= 850 ? "You kept the real beams and cut the junk." : "Close to the best setting.", idea: LASSO_IDEA };
}

function summary(mode: string, all: number[]): RoundResult {
  const avg = Math.round(all.reduce((a, b) => a + b, 0) / all.length);
  const text: Record<string, string> = {
    line: "Your bridge was a linear model ŷ = w·x + b. The red lines were the errors, and the best bridge (least squares) minimises the average of their squares. That's why one far pillar pulls the whole line: squaring makes big misses count much more.",
    degree: "The degree controls how bendy the bridge can be. Low degree underfits: it can't follow the canyon. High degree passes through every pillar but wiggles between them, so test trucks fall off. The best degree is the one with the lowest test error, not the lowest training error.",
    ridge: "With a degree-12 bridge, λ is the stiffness. λ near zero lets it wiggle through every pillar (overfit); a huge λ flattens it (underfit). Ridge regularization adds λ × (sum of squared weights) to the loss, and the right λ is found on test data.",
    lasso: "Only Steel, Height and Span really hold the bridge up. With λ too small, Lasso keeps junk beams that fit noise; with λ too big it cuts real ones. The L1 penalty pushes weak weights to exactly zero, so Lasso selects features for you.",
  };
  return {
    score: avg,
    headline: avg >= 850 ? "Chief engineer material." : avg >= 500 ? "Bridges mostly hold." : "Back to the drawing board.",
    detail: text[mode],
    stats: [{ label: "Per bridge", value: all.join(" · ") }],
  };
}

export function BridgeRound({ level, onDone }: RoundProps) {
  if (level.id === "lasso") return <LassoRound onDone={onDone} />;
  return <CurveRound key={level.id} mode={level.id as Mode} onDone={onDone} />;
}
