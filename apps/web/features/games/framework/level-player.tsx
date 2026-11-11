"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { GameResult } from "@/features/players/api";
import { ArrowRightIcon, Stars } from "@/features/players/icons";

import { ResultPanel } from "../result-panel";
import { useClearedLevels } from "../use-cleared-levels";
import { fmt, logPosition, logValue } from "./math";
import { starsForAttempts, type Control, type Evaluation, type GameDef, type Params } from "./types";

const ACCENT = {
  teal: { text: "text-teal-700 dark:text-teal-300", bg: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400", ring: "ring-teal-500" },
  violet: { text: "text-violet-700 dark:text-violet-300", bg: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400", ring: "ring-violet-500" },
  amber: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400", ring: "ring-amber-500" },
  rose: { text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400", ring: "ring-rose-500" },
  sky: { text: "text-sky-700 dark:text-sky-300", bg: "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400", ring: "ring-sky-500" },
};

function ControlInput({ control, value, onChange }: { control: Control; value: Params[string]; onChange: (v: Params[string]) => void }) {
  const labelId = `ctl-${control.id}`;
  if (control.kind === "slider") {
    const num = Number(value);
    const position = control.log ? logPosition(num, control.min, control.max) : num;
    return (
      <div className="space-y-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={labelId} className="text-sm font-semibold text-slate-700 dark:text-slate-200">{control.label}</label>
          <span className="font-mono text-base font-bold tabular-nums text-slate-900 dark:text-white">
            {fmt(num, 3)}
            {control.unit ? ` ${control.unit}` : ""}
          </span>
        </div>
        <input
          id={labelId}
          type="range"
          className="w-full accent-teal-600"
          min={control.log ? 0 : control.min}
          max={control.log ? 1000 : control.max}
          step={control.log ? 1 : control.step}
          value={position}
          onChange={(e) => {
            const raw = Number(e.target.value);
            onChange(control.log ? Number(logValue(raw, control.min, control.max).toPrecision(3)) : raw);
          }}
        />
        {control.hint ? <p className="text-xs text-slate-500">{control.hint}</p> : null}
      </div>
    );
  }
  if (control.kind === "toggle") {
    return (
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" className="mt-1 h-4 w-4 accent-teal-600" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
        <span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{control.label}</span>
          {control.hint ? <span className="block text-xs text-slate-500">{control.hint}</span> : null}
        </span>
      </label>
    );
  }
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold text-slate-700 dark:text-slate-200">{control.label}</legend>
      {control.options.map((opt) => {
        const selected = value === opt.value;
        return (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
              selected
                ? "border-teal-500 bg-teal-50 dark:bg-teal-500/10"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <input type="radio" name={control.id} className="mt-0.5 accent-teal-600" checked={selected} onChange={() => onChange(opt.value)} />
            <span>
              <span className="font-medium text-slate-800 dark:text-slate-100">{opt.label}</span>
              {opt.detail ? <span className="block text-xs text-slate-500">{opt.detail}</span> : null}
            </span>
          </label>
        );
      })}
      {control.hint ? <p className="text-xs text-slate-500">{control.hint}</p> : null}
    </fieldset>
  );
}

export function LevelPlayer({ game }: { game: GameDef }) {
  const router = useRouter();
  const search = useSearchParams();
  const { bestStars, markCleared } = useClearedLevels(game.id);
  const accent = ACCENT[game.accent];

  const requested = game.levels.findIndex((l) => l.id === search.get("level"));
  const [index, setIndex] = useState(Math.max(0, requested));
  const level = game.levels[index];
  const [params, setParams] = useState<Params>(level.initial);
  const [attempts, setAttempts] = useState(0);
  // `evaluation` drives the visual and is cleared when params change; `lastRun` keeps the feedback visible.
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [lastRun, setLastRun] = useState<Evaluation | null>(null);
  const [won, setWon] = useState<GameResult | null>(null);

  function selectLevel(i: number) {
    setIndex(i);
    setParams(game.levels[i].initial);
    setAttempts(0);
    setEvaluation(null);
    setLastRun(null);
    setWon(null);
    router.replace(`/games/${game.id}?level=${game.levels[i].id}`, { scroll: false });
  }

  function run() {
    const result = game.evaluate(level.id, params);
    const n = attempts + 1;
    setAttempts(n);
    setEvaluation(result);
    setLastRun(result);
    if (result.pass) {
      const stars = starsForAttempts(n);
      markCleared(level.id, stars);
      setWon({ game: game.id, level_id: level.id, stars, score: result.score, meta: { attempts: n } });
    }
  }

  const Visual = game.Visual;

  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <Link href="/games" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          ← All games
        </Link>
        <div>
          <p className={`font-mono text-xs uppercase tracking-[0.2em] ${accent.text}`}>
            Chapter {game.chapter} · {game.chapterTitle}
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{game.title}</h1>
          <p className="text-slate-600 dark:text-slate-400">{game.tagline}</p>
        </div>
        <nav aria-label="Levels" className="flex flex-wrap gap-2">
          {game.levels.map((l, i) => (
            <button
              key={l.id}
              type="button"
              onClick={() => selectLevel(i)}
              aria-current={i === index ? "step" : undefined}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition ${
                i === index
                  ? `border-transparent ring-2 ${accent.ring} bg-white dark:bg-slate-900`
                  : "border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 hover:border-slate-300"
              }`}
            >
              <span className="font-mono text-xs text-slate-500">{l.number}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{l.name}</span>
              <Stars count={bestStars(l.id)} size={10} />
            </button>
          ))}
        </nav>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <Visual level={level} params={params} evaluation={evaluation} />
        </section>

        <aside className="space-y-4">
          {won ? (
            <ResultPanel
              key={`${level.id}-${attempts}`}
              result={won}
              title={won.stars === 3 ? "First try!" : "Solved"}
              subtitle={`Passed in ${attempts} ${attempts === 1 ? "run" : "runs"}. ${lastRun?.headline ?? ""}`}
              lesson={level.lesson}
              onRetry={() => selectLevel(index)}
              next={index < game.levels.length - 1 ? { label: `Level ${index + 2} →`, onClick: () => selectLevel(index + 1) } : null}
            />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-2">
                <p className={`font-mono text-xs uppercase tracking-wider ${accent.text}`}>Level {level.number}</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{level.name}</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">{level.brief}</p>
                <p className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-sm">
                  <span className="font-semibold text-slate-900 dark:text-white">Goal: </span>
                  <span className="text-slate-700 dark:text-slate-300">{level.objective}</span>
                </p>
                {level.lessonSlug ? (
                  <Link href={`/learn/${level.lessonSlug}`} className={`inline-block text-xs font-semibold ${accent.text} underline underline-offset-2`}>
                    Read the lesson first
                  </Link>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5">
                {level.controls.map((c) => (
                  <ControlInput
                    key={c.id}
                    control={c}
                    value={params[c.id]}
                    onChange={(v) => {
                      setParams((p) => ({ ...p, [c.id]: v }));
                      setEvaluation(null);
                    }}
                  />
                ))}
                <button
                  type="button"
                  onClick={run}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white dark:text-slate-950 ${accent.bg}`}
                >
                  Run <ArrowRightIcon size={16} />
                </button>
                <p className="text-center text-xs text-slate-500">
                  Runs so far: {attempts}. Pass on the first run for 3 stars, within 3 runs for 2.
                </p>
              </div>

              {lastRun ? (
                <div
                  className={`rounded-2xl border p-5 space-y-3 ${
                    lastRun.pass ? "border-emerald-300 dark:border-emerald-500/40" : "border-rose-200 dark:border-rose-500/30 bg-rose-50/40 dark:bg-rose-500/5"
                  }`}
                  aria-live="polite"
                >
                  <p className="text-xs font-mono uppercase tracking-wider text-slate-500">Last run{evaluation ? "" : " (settings changed since)"}</p>
                  <p className="font-bold text-slate-900 dark:text-white">{lastRun.headline}</p>
                  <dl className="grid grid-cols-2 gap-2">
                    {lastRun.metrics.map((m) => (
                      <div key={m.label} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2">
                        <dt className="text-[11px] text-slate-500">{m.label}</dt>
                        <dd
                          className={`font-mono text-sm font-bold ${
                            m.good === true ? "text-emerald-600 dark:text-emerald-400" : m.good === false ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{lastRun.feedback}</p>
                </div>
              ) : null}
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
