"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useAuth, type RecordReceipt } from "@/features/players/auth-provider";
import type { GameResult } from "@/features/players/api";
import { FlameIcon, StarIcon, TrophyIcon } from "@/features/players/icons";

const CONFETTI_COLORS = ["#14b8a6", "#f59e0b", "#fb7185", "#38bdf8", "#a3e635"];

export function Confetti({ pieces = 36 }: { pieces?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      {Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2;
        const radius = 140 + ((i * 37) % 120);
        return (
          <span
            key={i}
            className="game-confetti-piece left-1/2 top-1/3"
            style={
              {
                background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                "--dx": `${Math.cos(angle) * radius}px`,
                "--dy": `${Math.sin(angle) * radius + 120}px`,
                animationDelay: `${(i % 6) * 0.03}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

type ResultPanelProps = {
  result: GameResult;
  title: string;
  subtitle: ReactNode;
  lesson: string;
  onRetry: () => void;
  next?: { label: string; onClick: () => void } | null;
};

/** Saves the result once, then shows stars, XP, streak and any new badges. */
export function ResultPanel({ result, title, subtitle, lesson, onRetry, next }: ResultPanelProps) {
  const { recordResult } = useAuth();
  const [receipt, setReceipt] = useState<RecordReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sent = useRef(false);
  const won = result.stars > 0;

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    recordResult(result)
      .then(setReceipt)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Couldn't save this result."));
  }, [recordResult, result]);

  const outcome = receipt?.saved ? receipt.outcome : null;

  return (
    <div className="relative game-rise overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
      {won ? <Confetti /> : null}
      <div className="relative flex flex-col items-center text-center gap-3">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="game-pop" style={{ animationDelay: `${0.15 + i * 0.18}s` }}>
              <StarIcon
                size={44}
                filled={i < result.stars}
                className={i < result.stars ? "text-amber-400 drop-shadow" : "text-slate-200 dark:text-slate-700"}
              />
            </span>
          ))}
        </div>
        <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h3>
        <div className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</div>

        <div className="mt-1 grid w-full grid-cols-3 gap-2">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3">
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Score</p>
            <p className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{result.score}</p>
          </div>
          <div className="rounded-xl bg-teal-50 dark:bg-teal-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-teal-700 dark:text-teal-300">XP</p>
            <p className="text-xl font-black tabular-nums text-teal-800 dark:text-teal-200">
              {outcome ? `+${outcome.xp_gained}` : receipt && !receipt.saved ? "—" : "…"}
            </p>
          </div>
          <div className="rounded-xl bg-orange-50 dark:bg-orange-500/10 p-3">
            <p className="text-[11px] uppercase tracking-wide text-orange-700 dark:text-orange-300">Streak</p>
            <p className="flex items-center justify-center gap-1 text-xl font-black tabular-nums text-orange-600 dark:text-orange-300">
              <FlameIcon size={18} className={outcome?.streak_extended ? "game-flicker fill-orange-400/50" : ""} />
              {outcome ? outcome.progress.current_streak : "—"}
            </p>
          </div>
        </div>

        {outcome?.streak_extended ? (
          <p className="game-pop text-sm font-semibold text-orange-600 dark:text-orange-300">
            Streak extended to {outcome.progress.current_streak} {outcome.progress.current_streak === 1 ? "day" : "days"}
          </p>
        ) : null}
        {outcome?.leveled_up ? (
          <p className="game-pop rounded-full bg-teal-600 px-3 py-1 text-sm font-bold text-white">Level up · Level {outcome.progress.level}</p>
        ) : null}
        {outcome?.new_badges.map((b) => (
          <div key={b.id} className="game-pop flex items-center gap-3 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-2.5 text-left">
            <TrophyIcon size={22} className="text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Badge unlocked: {b.title}</p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/70">{b.description}</p>
            </div>
          </div>
        ))}
        {receipt && !receipt.saved ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Playing as a guest.{" "}
            <Link href="/login?mode=signup&next=/games" className="font-semibold text-teal-700 dark:text-teal-300 underline underline-offset-2">
              Create an account
            </Link>{" "}
            to save this and start a streak.
          </p>
        ) : null}
        {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}

        <p className="mt-1 rounded-xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3 text-left text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-semibold text-slate-900 dark:text-white">What this teaches: </span>
          {lesson}
        </p>

        <div className="mt-1 flex w-full gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {won ? "Play again" : "Try again"}
          </button>
          {next ? (
            <button
              type="button"
              onClick={next.onClick}
              className="flex-1 rounded-xl bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 py-2.5 text-sm font-semibold text-white dark:text-slate-950"
            >
              {next.label}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
