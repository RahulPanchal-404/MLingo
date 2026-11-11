"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

import { useAuth } from "@/features/players/auth-provider";
import { HourglassIcon, LockIcon, RewindIcon, Stars } from "@/features/players/icons";
import { ResultPanel } from "../result-panel";
import { useClearedLevels } from "../use-cleared-levels";
import {
  DIVERGED,
  SCENARIOS,
  isSaved,
  pointOfNoReturn,
  rewindScore,
  runWithBranches,
  type Branch,
  type Frame,
  type Scenario,
} from "./rewind-engine";

const MAX_REWINDS = 3;
type Phase = "brief" | "watching" | "rewinding" | "branching" | "done";

const fmt = (v: number) => (v >= DIVERGED ? "∞" : Math.abs(v) >= 1000 ? v.toExponential(1) : v.toFixed(Math.abs(v) < 1 ? 3 : 2));

/** Log-scale loss → y position within the timeline plot. */
function lossY(loss: number, top: number, height: number) {
  const lo = Math.log10(0.003);
  const hi = Math.log10(DIVERGED);
  const v = Math.log10(Math.max(0.003, Math.min(loss, DIVERGED)));
  return top + height - ((v - lo) / (hi - lo)) * height;
}

function RegressionView({ scenario, frame, ghost }: { scenario: Scenario; frame: Frame; ghost: Frame | null }) {
  const W = 360;
  const H = 240;
  const pts = scenario.base.data;
  const xs = (x: number) => ((x + 1.2) / 2.4) * W;
  const ys = (y: number) => H / 2 - (y - 1) * (H / 2 / 4.5);
  const line = (f: Frame) => {
    const y1 = f.w * -1.2 + f.b;
    const y2 = f.w * 1.2 + f.b;
    return { x1: 0, y1: ys(y1), x2: W, y2: ys(y2) };
  };
  const exploded = frame.loss >= DIVERGED || Math.abs(frame.w) > 1e3;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Regression line at step ${frame.step}`}>
      <defs>
        <clipPath id="rv-clip">
          <rect width={W} height={H} />
        </clipPath>
      </defs>
      <g clipPath="url(#rv-clip)">
        {[-1, 0, 1].map((x) => (
          <line key={x} x1={xs(x)} x2={xs(x)} y1={0} y2={H} stroke="rgba(148,163,184,0.12)" />
        ))}
        {[-2, 1, 4].map((y) => (
          <line key={y} x1={0} x2={W} y1={ys(y)} y2={ys(y)} stroke="rgba(148,163,184,0.12)" />
        ))}
        {ghost ? <line {...line(ghost)} stroke="#fb7185" strokeWidth={2} strokeDasharray="6 5" opacity={0.6} /> : null}
        {pts.map((p, i) => (
          <circle key={i} cx={xs(p.x)} cy={Math.max(6, Math.min(H - 6, ys(p.y)))} r={p.outlier ? 6 : 4} fill={p.outlier ? "#fb7185" : "#38bdf8"} opacity={p.outlier ? 1 : 0.85}>
            {p.outlier ? <title>Corrupted point (y = {p.y})</title> : null}
          </circle>
        ))}
        {!exploded ? <line {...line(frame)} stroke="#2dd4bf" strokeWidth={3} /> : null}
      </g>
      {exploded ? (
        <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-rose-400 font-mono" fontSize={18} fontWeight={700}>
          PARAMETERS EXPLODED
        </text>
      ) : null}
    </svg>
  );
}

type TimelineProps = {
  scenario: Scenario;
  frames: Frame[];
  ghosts: Frame[][];
  revealed: number;
  playhead: number;
  branches: Branch[];
  scrubbable: boolean;
  noReturn: number | null;
  failed: boolean;
  onScrub: (step: number) => void;
};

function Timeline({ scenario, frames, ghosts, revealed, playhead, branches, scrubbable, noReturn, failed, onScrub }: TimelineProps) {
  const W = 900;
  const H = 210;
  const left = 46;
  const right = 14;
  const top = 26;
  const plotH = 150;
  const n = scenario.steps;
  const sx = (step: number) => left + (step / n) * (W - left - right);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const stepFromEvent = (e: ReactPointerEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * W;
    return Math.round(Math.max(0, Math.min(n, ((x - left) / (W - left - right)) * n)));
  };

  const path = (fs: Frame[], upto: number) =>
    fs
      .slice(0, upto + 1)
      .map((f, i) => `${i ? "L" : "M"}${sx(f.step).toFixed(1)},${lossY(f.loss, top, plotH).toFixed(1)}`)
      .join(" ");

  const targetY = lossY(scenario.target, top, plotH);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`w-full h-auto select-none touch-none ${scrubbable ? "cursor-ew-resize" : ""}`}
      onPointerDown={(e) => {
        if (!scrubbable) return;
        dragging.current = true;
        (e.target as Element).setPointerCapture?.(e.pointerId);
        onScrub(stepFromEvent(e));
      }}
      onPointerMove={(e) => {
        if (dragging.current && scrubbable) onScrub(stepFromEvent(e));
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      role="slider"
      aria-label="Training timeline"
      aria-valuemin={0}
      aria-valuemax={n}
      aria-valuenow={playhead}
      tabIndex={scrubbable ? 0 : -1}
      onKeyDown={(e) => {
        if (!scrubbable) return;
        if (e.key === "ArrowLeft") onScrub(Math.max(0, playhead - (e.shiftKey ? 5 : 1)));
        if (e.key === "ArrowRight") onScrub(Math.min(n, playhead + (e.shiftKey ? 5 : 1)));
      }}
    >
      <rect x={0} y={0} width={W} height={H} rx={14} fill="#0b1220" />
      {/* ruler */}
      {Array.from({ length: n + 1 }, (_, s) => (
        <line key={s} x1={sx(s)} x2={sx(s)} y1={top - (s % 10 === 0 ? 10 : s % 5 === 0 ? 6 : 3)} y2={top} stroke="rgba(148,163,184,0.35)" />
      ))}
      {Array.from({ length: n / 10 + 1 }, (_, k) => (
        <text key={k} x={sx(k * 10)} y={12} textAnchor="middle" fontSize={10} className="fill-slate-500 font-mono">
          {k * 10}
        </text>
      ))}
      {/* loss axis */}
      {[0.01, 1, 100, 1e4, 1e6].map((v) => (
        <g key={v}>
          <line x1={left} x2={W - right} y1={lossY(v, top, plotH)} y2={lossY(v, top, plotH)} stroke="rgba(148,163,184,0.08)" />
          <text x={left - 6} y={lossY(v, top, plotH) + 3} textAnchor="end" fontSize={9} className="fill-slate-500 font-mono">
            {v >= 1e4 ? `1e${Math.log10(v)}` : v}
          </text>
        </g>
      ))}
      {/* target band */}
      <rect x={left} y={targetY} width={W - left - right} height={top + plotH - targetY} fill="rgba(45,212,191,0.07)" />
      <line x1={left} x2={W - right} y1={targetY} y2={targetY} stroke="#2dd4bf" strokeDasharray="5 5" opacity={0.6} />
      <text x={W - right - 4} y={targetY - 5} textAnchor="end" fontSize={10} className="fill-teal-300 font-mono">
        target {scenario.target}
      </text>
      {/* doomed futures */}
      {ghosts.map((g, i) => (
        <path key={i} d={path(g, n)} fill="none" stroke="#fb7185" strokeWidth={1.5} opacity={0.35} strokeDasharray="3 4" />
      ))}
      {/* the live run */}
      <path d={path(frames, revealed)} fill="none" stroke={failed && revealed >= n ? "#fb7185" : "#2dd4bf"} strokeWidth={2.5} />
      {/* point of no return, revealed at the end */}
      {noReturn !== null ? (
        <g>
          <line x1={sx(noReturn)} x2={sx(noReturn)} y1={top} y2={top + plotH} stroke="#fbbf24" strokeDasharray="2 3" />
          <text x={sx(noReturn) + 4} y={top + plotH - 4} fontSize={10} className="fill-amber-300 font-mono">
            last safe rewind: {noReturn}
          </text>
        </g>
      ) : null}
      {/* rewind markers */}
      {branches.map((b, i) => (
        <g key={i} transform={`translate(${sx(b.atStep)}, ${top + plotH + 14})`}>
          <path d="M-6,-6 L0,0 L-6,6 Z M0,-6 L6,0 L0,6 Z" transform="scale(-1,1)" fill="#a78bfa" />
        </g>
      ))}
      {/* playhead */}
      <g transform={`translate(${sx(playhead)}, 0)`}>
        <line y1={top - 12} y2={top + plotH + 6} stroke="#f8fafc" strokeWidth={2} />
        <path d="M-7,14 L7,14 L7,20 L0,27 L-7,20 Z" fill="#f8fafc" />
        <circle cy={lossY(frames[Math.min(playhead, frames.length - 1)].loss, top, plotH)} r={5} fill="#f8fafc" stroke="#0b1220" strokeWidth={2} />
      </g>
      <text x={left} y={H - 8} fontSize={10} className="fill-slate-500 font-mono">
        loss (log) · step →
      </text>
      {scrubbable ? (
        <text x={W - right} y={H - 8} textAnchor="end" fontSize={10} className="fill-violet-300 font-mono">
          drag to rewind · ← → keys
        </text>
      ) : null}
    </svg>
  );
}

export function RewindGame() {
  const { status } = useAuth();
  const { cleared, markCleared, bestStars } = useClearedLevels("rewind");
  const params = useSearchParams();
  const [index, setIndex] = useState(() => Math.max(0, SCENARIOS.findIndex((s) => s.id === params.get("case"))));
  const scenario = SCENARIOS[index];
  const [phase, setPhase] = useState<Phase>("brief");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [used, setUsed] = useState(0);
  const [ghosts, setGhosts] = useState<Frame[][]>([]);
  const [playhead, setPlayhead] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const frames = useMemo(() => runWithBranches(scenario, branches), [scenario, branches]);
  const saved = isSaved(scenario, frames);
  const rewindsLeft = MAX_REWINDS - used;
  const noReturn = useMemo(() => (phase === "done" ? pointOfNoReturn(scenario) : null), [phase, scenario]);

  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const animate = useCallback((from: number, to: number, onDone: () => void, ms = 3200) => {
    stop();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevealed(to);
      setPlayhead(to);
      onDone();
      return;
    }
    const perStep = Math.max(16, ms / Math.max(1, to - from));
    let s = from;
    timer.current = window.setInterval(() => {
      s += 1;
      setRevealed(s);
      setPlayhead(s);
      if (s >= to) {
        stop();
        onDone();
      }
    }, perStep);
  }, []);

  const loadScenario = (i: number) => {
    stop();
    setIndex(i);
    setPhase("brief");
    setBranches([]);
    setUsed(0);
    setGhosts([]);
    setPlayhead(0);
    setRevealed(0);
    setChoice(null);
    setToast(null);
  };

  const startWatching = () => {
    setPhase("watching");
    setRevealed(0);
    setPlayhead(0);
    animate(0, scenario.steps, () => {
      setToast("Run failed. Drag the playhead back to the moment you want to change.");
      setPhase("rewinding");
    });
  };

  const branch = () => {
    if (!choice || phase !== "rewinding" || rewindsLeft <= 0) return;
    const at = Math.min(playhead, scenario.steps - 1);
    setGhosts((g) => [...g, frames]);
    const nextBranches = [...branches.filter((b) => b.atStep <= at), { atStep: at, interventionId: choice }];
    setBranches(nextBranches);
    const nextUsed = used + 1;
    setUsed(nextUsed);
    setToast(null);
    setPhase("branching");
    setRevealed(at);
    const nextFrames = runWithBranches(scenario, nextBranches);
    animate(at, scenario.steps, () => {
      const ok = isSaved(scenario, nextFrames);
      if (ok || nextUsed >= MAX_REWINDS) {
        setPhase("done");
        if (ok) markCleared(scenario.id, rewindScore(true, nextUsed, at, scenario.steps).stars);
      } else {
        setPhase("rewinding");
        setChoice(null);
        const last = nextFrames[nextFrames.length - 1];
        setToast(
          last.loss >= DIVERGED
            ? "That timeline diverged too. Rewind again."
            : `Ended at loss ${fmt(last.loss)}, target was ${scenario.target}. Rewind again.`,
        );
      }
    }, 2200);
  };

  const shownFrame = frames[Math.min(playhead, frames.length - 1)];
  // In rewind mode, the dashed line shows where the current timeline ends up if left alone.
  const ghostFrame = phase === "rewinding" ? frames[frames.length - 1] : null;
  const lastRewind = branches.length ? branches[branches.length - 1].atStep : 0;
  const finalScore = rewindScore(saved, used, lastRewind, scenario.steps);
  const potential = rewindScore(true, used + 1, Math.min(playhead, scenario.steps - 1), scenario.steps);

  const result = useMemo(
    () =>
      phase === "done"
        ? {
            game: "rewind" as const,
            level_id: scenario.id,
            stars: finalScore.stars,
            score: finalScore.score,
            meta: {
              rewinds_used: used,
              rewind_fraction: Number((lastRewind / scenario.steps).toFixed(3)),
              interventions: branches.map((b) => b.interventionId),
            },
          }
        : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase],
  );

  const unlocked = (i: number) => i === 0 || cleared.has(SCENARIOS[i - 1].id);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <Link href="/games" className="text-xs font-mono text-slate-500 hover:text-teal-700 dark:hover:text-teal-300">← Games</Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Rewind</h1>
          <p className="max-w-2xl text-slate-600 dark:text-slate-400">
            Every run here is doomed. Scrub back in time, change one thing, and watch a new future unfold. The later you rewind, the more it&apos;s worth, but wait too long and nothing can save it.
          </p>
        </div>
        {status === "guest" ? (
          <Link href="/login?next=/games/rewind" className="rounded-full border border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
            Guest mode · sign in to save scores
          </Link>
        ) : null}
      </header>

      <nav aria-label="Scenarios" className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {SCENARIOS.map((s, i) => {
          const open = unlocked(i);
          const active = i === index;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!open || phase === "watching" || phase === "branching"}
              onClick={() => loadScenario(i)}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                active
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-2 ring-violet-500/20"
                  : open
                    ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-violet-300 dark:hover:border-violet-700"
                    : "border-dashed border-slate-200 dark:border-slate-800 opacity-60 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                Case {s.number}
                {!open ? <LockIcon size={12} /> : null}
              </span>
              <span className="block truncate text-sm font-bold text-slate-900 dark:text-white">{s.title}</span>
              <Stars count={bestStars(s.id)} size={12} className="mt-1" />
            </button>
          );
        })}
      </nav>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="relative self-start overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-4 sm:p-6 text-slate-100 shadow-2xl">
          <div className="game-crt pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
              <span className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${phase === "watching" || phase === "branching" ? "bg-rose-500 animate-pulse" : phase === "done" && saved ? "bg-teal-400" : "bg-slate-600"}`} />
                {phase === "brief" && "STANDBY"}
                {phase === "watching" && "REPLAYING ORIGINAL RUN"}
                {phase === "rewinding" && `REWIND MODE · STEP ${playhead}`}
                {phase === "branching" && "NEW TIMELINE TRAINING"}
                {phase === "done" && (saved ? "RUN SAVED" : "OUT OF REWINDS")}
              </span>
              <span className="flex items-center gap-1.5" aria-label={`${rewindsLeft} rewinds left`}>
                {Array.from({ length: MAX_REWINDS }, (_, i) => (
                  <HourglassIcon key={i} size={18} className={i < rewindsLeft ? "text-violet-300" : "text-slate-700"} />
                ))}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-3">
                <RegressionView scenario={scenario} frame={shownFrame} ghost={ghostFrame} />
              </div>
              <dl className="grid grid-cols-2 gap-2 font-mono text-sm">
                {[
                  ["step", `${shownFrame.step} / ${scenario.steps}`],
                  ["loss", fmt(shownFrame.loss)],
                  ["w", fmt(shownFrame.w)],
                  ["b", fmt(shownFrame.b)],
                  ["α", fmt(shownFrame.lr)],
                  ["status", shownFrame.loss >= DIVERGED ? "diverged" : shownFrame.loss <= scenario.target ? "on target" : "training"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
                    <dt className="text-[10px] uppercase tracking-widest text-slate-500">{k}</dt>
                    <dd className={`truncate text-base font-bold ${k === "loss" && shownFrame.loss >= DIVERGED ? "text-rose-400" : "text-slate-100"}`}>{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <Timeline
              scenario={scenario}
              frames={frames}
              ghosts={ghosts}
              failed={!saved}
              revealed={phase === "brief" ? 0 : phase === "watching" || phase === "branching" ? revealed : scenario.steps}
              playhead={playhead}
              branches={branches}
              scrubbable={phase === "rewinding" || phase === "done"}
              noReturn={noReturn}
              onScrub={setPlayhead}
            />

            {toast ? <p className="game-rise rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2.5 text-sm text-violet-100">{toast}</p> : null}

            {phase === "brief" ? (
              <div className="game-rise flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
                <p className="font-mono text-xs uppercase tracking-widest text-rose-300">Incident · case {scenario.number}</p>
                <h2 className="text-2xl font-extrabold">{scenario.title}</h2>
                <p className="text-slate-300">{scenario.brief}</p>
                <p className="text-sm text-teal-300">Objective: {scenario.objective}</p>
                <button type="button" onClick={startWatching} className="mt-1 rounded-xl bg-rose-500 hover:bg-rose-400 px-5 py-2.5 font-bold text-white transition">
                  Play the footage
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          {phase === "done" && result ? (
            <ResultPanel
              key={`${scenario.id}-${used}`}
              result={result}
              title={saved ? (used === 1 ? "Clean save" : "Run saved") : "Timeline lost"}
              subtitle={
                saved
                  ? `Rewound to step ${lastRewind} with ${used} ${used === 1 ? "rewind" : "rewinds"}.${noReturn !== null ? ` On the original run, the latest safe moment was step ${noReturn}.` : ""}`
                  : `Every timeline failed.${noReturn !== null ? ` The right fix works up to step ${noReturn}.` : ""}`
              }
              lesson={scenario.lesson}
              onRetry={() => loadScenario(index)}
              next={saved && index < SCENARIOS.length - 1 ? { label: `Case ${index + 2} →`, onClick: () => loadScenario(index + 1) } : null}
            />
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Choose one change</p>
                {phase === "rewinding" ? (
                  <span className="rounded-full bg-violet-100 dark:bg-violet-500/15 px-2.5 py-1 font-mono text-xs font-bold text-violet-700 dark:text-violet-300">
                    worth up to {potential.score}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-2">
                {scenario.interventions.map((iv) => {
                  const active = choice === iv.id;
                  return (
                    <button
                      key={iv.id}
                      type="button"
                      disabled={phase !== "rewinding"}
                      onClick={() => setChoice(iv.id)}
                      className={`rounded-xl border px-3.5 py-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${
                        active
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10 ring-2 ring-violet-500/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600"
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">{iv.label}</span>
                      <span className="block text-xs font-mono text-slate-500">{iv.detail}</span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={branch}
                disabled={phase !== "rewinding" || !choice}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-500 py-3 font-extrabold text-white shadow-lg shadow-violet-600/25 transition disabled:opacity-40 disabled:shadow-none"
              >
                <RewindIcon size={18} />
                Rewind to step {Math.min(playhead, scenario.steps - 1)} and branch
              </button>
              <p className="text-xs leading-relaxed text-slate-500">
                Training continues from the exact weights at that frame. Everything before it stays the same; everything after is rewritten.
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-sm space-y-2">
            <p className="font-semibold text-slate-800 dark:text-slate-100">Scoring</p>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><span className="font-mono text-amber-500">★★★</span> save it with 1 rewind</li>
              <li><span className="font-mono text-amber-500">★★</span> 2 rewinds · <span className="font-mono text-amber-500">★</span> 3 rewinds</li>
              <li>Later rewinds score more. Rewind too late and the run can&apos;t recover.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
