"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import type { GameResult } from "@/features/players/api";
import { ArrowRightIcon, Stars } from "@/features/players/icons";

import { ResultPanel } from "../result-panel";
import { useClearedLevels } from "../use-cleared-levels";
import { starsForScore, type GameDef, type RoundResult } from "./types";

const ACCENT = {
  teal: { text: "text-teal-700 dark:text-teal-300", bg: "bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-400", ring: "ring-teal-500" },
  violet: { text: "text-violet-700 dark:text-violet-300", bg: "bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-400", ring: "ring-violet-500" },
  amber: { text: "text-amber-700 dark:text-amber-300", bg: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400", ring: "ring-amber-500" },
  rose: { text: "text-rose-700 dark:text-rose-300", bg: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-400", ring: "ring-rose-500" },
  sky: { text: "text-sky-700 dark:text-sky-300", bg: "bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-400", ring: "ring-sky-500" },
};

type Phase = { kind: "brief" } | { kind: "play" } | { kind: "done"; result: RoundResult; stars: number; won: GameResult | null };

/** Level picker + brief → play → result flow shared by every arcade game. The game itself is `game.Round`. */
export function ArcadePlayer({ game }: { game: GameDef }) {
  const router = useRouter();
  const search = useSearchParams();
  const { bestStars, markCleared } = useClearedLevels(game.id);
  const accent = ACCENT[game.accent];

  const requested = game.levels.findIndex((l) => l.id === search.get("level"));
  const [index, setIndex] = useState(Math.max(0, requested));
  const [phase, setPhase] = useState<Phase>({ kind: "brief" });
  const [runs, setRuns] = useState(0);
  const level = game.levels[index];
  const Round = game.Round;

  function selectLevel(i: number) {
    setIndex(i);
    setPhase({ kind: "brief" });
    setRuns(0);
    router.replace(`/games/${game.id}?level=${game.levels[i].id}`, { scroll: false });
  }

  function start() {
    setRuns((r) => r + 1);
    setPhase({ kind: "play" });
  }

  function finish(result: RoundResult) {
    const stars = starsForScore(result.score, level.stars);
    let won: GameResult | null = null;
    if (stars > 0) {
      markCleared(level.id, stars);
      won = { game: game.id, level_id: level.id, stars, score: Math.round(result.score), meta: { attempts: runs } };
    }
    setPhase({ kind: "done", result, stars, won });
  }

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
                i === index ? `border-transparent ring-2 ${accent.ring} bg-white dark:bg-slate-900` : "border-slate-200 bg-white/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60"
              }`}
            >
              <span className="font-mono text-xs text-slate-500">{l.number}</span>
              <span className="font-semibold text-slate-800 dark:text-slate-100">{l.name}</span>
              <Stars count={bestStars(l.id)} size={10} />
            </button>
          ))}
        </nav>
      </header>

      {phase.kind === "brief" ? (
        <section className="mx-auto max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className={`font-mono text-xs uppercase tracking-wider ${accent.text}`}>Level {level.number}</p>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{level.name}</h2>
          <p className="text-slate-700 dark:text-slate-300">{level.brief}</p>
          <dl className="space-y-2 text-sm">
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <dt className="inline font-bold text-slate-900 dark:text-white">Controls: </dt>
              <dd className="inline text-slate-700 dark:text-slate-300">{level.howTo}</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
              <dt className="inline font-bold text-slate-900 dark:text-white">Win: </dt>
              <dd className="inline text-slate-700 dark:text-slate-300">{level.objective}</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-500">
            Score {level.stars[0]}+ for ★, {level.stars[1]}+ for ★★, {level.stars[2]}+ for ★★★.
          </p>
          <button type="button" onClick={start} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base font-extrabold text-white dark:text-slate-950 ${accent.bg}`}>
            Start <ArrowRightIcon size={18} />
          </button>
          {level.lessonSlug ? (
            <Link href={`/learn/${level.lessonSlug}`} className={`inline-block text-xs font-semibold ${accent.text} underline underline-offset-2`}>
              Read the lesson first
            </Link>
          ) : null}
        </section>
      ) : null}

      {phase.kind === "play" ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <Round key={`${level.id}-${runs}`} level={level} onDone={finish} />
        </section>
      ) : null}

      {phase.kind === "done" ? (
        <div className="mx-auto max-w-xl space-y-4">
          {phase.won ? (
            <ResultPanel
              key={`${level.id}-${runs}`}
              result={phase.won}
              title={phase.stars === 3 ? "Perfect run!" : "Level cleared"}
              subtitle={`Score ${phase.result.score}. ${phase.result.headline}`}
              lesson={level.lesson}
              onRetry={start}
              next={index < game.levels.length - 1 ? { label: `Level ${index + 2} →`, onClick: () => selectLevel(index + 1) } : null}
            />
          ) : (
            <div className="space-y-3 rounded-2xl border border-rose-200 bg-rose-50/40 p-6 dark:border-rose-500/30 dark:bg-rose-500/5">
              <p className="font-mono text-xs uppercase tracking-wider text-rose-600 dark:text-rose-300">Not quite · score {phase.result.score} / {level.stars[0]} needed</p>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{phase.result.headline}</h2>
              <button type="button" onClick={start} className={`w-full rounded-xl py-3 text-base font-extrabold text-white dark:text-slate-950 ${accent.bg}`}>
                Try again
              </button>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <dl className="mb-3 grid grid-cols-2 gap-2">
              {phase.result.stats.map((s) => (
                <div key={s.label} className="rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                  <dt className="text-[11px] text-slate-500">{s.label}</dt>
                  <dd className="font-mono text-sm font-bold text-slate-900 dark:text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{phase.result.detail}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
