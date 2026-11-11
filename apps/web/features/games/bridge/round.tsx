"use client";

import { useMemo, useRef, useState } from "react";

import { svgPoint, useTicker } from "../framework/hooks";
import { Banner, ControlDeck, GameButton, GameScreen, Stat, TopBar } from "../framework/kit";
import { fmt, logPosition, logValue, pct } from "../framework/math";
import type { RoundProps, RoundResult } from "../framework/types";
import {
  BEAMS, DEGREE_TASKS, LASSO_LAMBDAS, LASSO_TASKS, LINE_TASKS, REAL_BEAMS, RIDGE_DEGREE, RIDGE_TASKS, TRUCK_TOLERANCE,
  bestLassoTest, bestLine, lassoScore, bestTestOverDegrees, bestTestOverLambdas, lassoModel, lassoTest, lineMse, polyModel, polyMse, polyPredict, ratioScore,
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
          <circle cx={sx(-1)} cy={clampY(sy(f(-1)))} r={12} fill="#f59e0b" stroke="white" strokeWidth={3} />
          <circle cx={sx(1)} cy={clampY(sy(f(1)))} r={12} fill="#f59e0b" stroke="white" strokeWidth={3} />
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
          sub={
            mode === "line"
              ? `Your error ${fmt(result.err, 3)} vs least-squares ${fmt(result.best, 3)} (green dashed line): +${result.score}`
              : `${pct(result.hit)} of test trucks crossed. Test error ${fmt(result.err, 3)} vs best possible ${fmt(result.best, 3)}: +${result.score}`
          }
        >
          <GameButton onClick={next}>{i + 1 === tasks.length ? "Finish" : "Next canyon →"}</GameButton>
        </Banner>
      ) : null}
      <ControlDeck>
        {mode === "line" ? <span className="text-xs text-white/70">Drag the orange ends of the bridge. The red lines are the errors.</span> : null}
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
          sub={`Kept ${result.kept} beams (${result.junkKept} junk). Test error ${fmt(result.err, 2)} vs best ${fmt(result.best, 2)}: +${result.score}. ✅ = real beam, 🗑️ = junk.`}
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
