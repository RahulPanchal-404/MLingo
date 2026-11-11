"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useAuth } from "@/features/players/auth-provider";
import { localDate } from "@/features/players/api";
import { ArrowRightIcon, BoltIcon, FlameIcon, LockIcon, Stars, StarIcon, TrophyIcon } from "@/features/players/icons";
import { initials } from "@/features/players/user-chip";
import type { GameDef } from "./framework/types";
import { ALL_LEVELS, BADGES, GAMES, getGame } from "./registry";
import { useClearedLevels } from "./use-cleared-levels";

const CARD_ACCENT: Record<GameDef["accent"], string> = {
  teal: "from-teal-700 to-teal-950 border-teal-900/40",
  rose: "from-rose-700 to-rose-950 border-rose-900/40",
  violet: "from-violet-700 to-violet-950 border-violet-900/40",
  amber: "from-amber-600 to-amber-950 border-amber-900/40",
  sky: "from-sky-700 to-sky-950 border-sky-900/40",
};

function dailyPick(cleared: Set<string>) {
  const today = localDate();
  let h = 0;
  for (const c of today) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  // Prefer levels the player hasn't passed yet.
  const fresh = ALL_LEVELS.filter((l) => !cleared.has(`${l.game}:${l.id}`));
  const pool = fresh.length ? fresh : ALL_LEVELS;
  return pool[h % pool.length];
}

function GameCard({ game }: { game: GameDef }) {
  const { bestStars } = useClearedLevels(game.id);
  const stars = game.levels.reduce((sum, l) => sum + bestStars(l.id), 0);
  const firstOpen = game.levels.find((l) => bestStars(l.id) < 3) ?? game.levels[0];
  return (
    <Link
      href={`/games/${game.id}?level=${firstOpen.id}`}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-3xl border bg-gradient-to-br p-6 text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl ${CARD_ACCENT[game.accent]}`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Chapter {game.chapter} · {game.chapterTitle}</span>
          <span className="font-mono text-xs text-white/70">{stars} / {game.levels.length * 3} ★</span>
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight">{game.title}</h2>
        <p className="text-sm text-white/85">{game.tagline}</p>
        <ul className="space-y-1">
          {game.levels.map((l) => (
            <li key={l.id} className="flex items-center justify-between text-sm text-white/90">
              <span>{l.number}. {l.name}</span>
              <Stars count={bestStars(l.id)} size={11} />
            </li>
          ))}
        </ul>
      </div>
      <span className="flex items-center gap-1 self-end rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900">
        {stars ? "Continue" : "Play"} <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

export function GamesHub() {
  const { status, player, progress, guestQueued } = useAuth();
  // One hook call per game (fixed list, so hook order is stable).
  const descent = useClearedLevels("descent");
  const threshold = useClearedLevels("threshold");
  const clusters = useClearedLevels("clusters");
  const neurons = useClearedLevels("neurons");
  const pipeline = useClearedLevels("pipeline");
  const perGame = [descent, threshold, clusters, neurons, pipeline];
  const clearedKeys = useMemo(
    () =>
      new Set(
        [descent.cleared, threshold.cleared, clusters.cleared, neurons.cleared, pipeline.cleared].flatMap((set, i) =>
          [...set].map((id) => `${GAMES[i].id}:${id}`),
        ),
      ),
    [descent.cleared, threshold.cleared, clusters.cleared, neurons.cleared, pipeline.cleared],
  );
  const pick = useMemo(() => dailyPick(clearedKeys), [clearedKeys]);
  const totalStars = GAMES.reduce((sum, g, i) => sum + g.levels.reduce((s, l) => s + perGame[i].bestStars(l.id), 0), 0);
  const maxStars = GAMES.reduce((sum, g) => sum + g.levels.length * 3, 0);
  const signedIn = status === "signed-in" && progress;
  const streak = progress?.current_streak ?? 0;
  const playedToday = progress?.played_today ?? false;
  const goalPct = progress ? Math.min(100, Math.round((progress.xp_today / progress.daily_goal) * 100)) : 0;
  const levelPct = progress ? Math.round((progress.level_xp / progress.level_xp_needed) * 100) : 0;
  const badges = progress?.badges ?? BADGES.map((b) => ({ ...b, earned: false }));
  const earnedCount = badges.filter((b) => b.earned).length;

  const nameFor = (game: string, id: string) => ALL_LEVELS.find((l) => l.game === game && l.id === id)?.name ?? id;
  const chapterFor = (game: string) => getGame(game)?.chapter;

  return (
    <div className="space-y-8">
      {/* Player header */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-white to-orange-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-400/10 blur-3xl" aria-hidden="true" />
        <div className="relative grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">Arcade</p>
            <div className="flex items-center gap-4">
              {signedIn && player ? (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-700 dark:bg-teal-500 text-lg font-black text-white dark:text-slate-950">
                  {initials(player.display_name)}
                </span>
              ) : null}
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {signedIn && player ? `Hey ${player.display_name.split(" ")[0]}` : "Learn ML by playing it"}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {signedIn
                    ? playedToday
                      ? "Streak safe for today. Go for stars."
                      : streak > 0
                        ? `Play one game today to keep your ${streak}-day streak.`
                        : "Play one game today to start a streak."
                    : "One game per chapter, built on real training runs. Pass levels, earn stars, keep your streak."}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: "Games played", value: progress?.games_played ?? 0 },
                { label: "Stars", value: `${totalStars} / ${maxStars}` },
                { label: "Badges", value: `${earnedCount} / ${badges.length}` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 px-4 py-3">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">{stat.label}</dt>
                  <dd className="text-xl font-black tabular-nums text-slate-900 dark:text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
            {status === "guest" ? (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3">
                <p className="text-sm text-amber-900 dark:text-amber-100">
                  You&apos;re playing as a guest{guestQueued ? ` with ${guestQueued} unsaved ${guestQueued === 1 ? "result" : "results"}` : ""}. Sign in to keep streaks, XP and badges.
                </p>
                <Link href="/login?mode=signup&next=/games" className="rounded-full bg-amber-500 hover:bg-amber-400 px-4 py-1.5 text-sm font-bold text-amber-950">
                  Create account
                </Link>
              </div>
            ) : null}
          </div>

          {/* Streak */}
          <div className="rounded-2xl border border-orange-200/80 dark:border-orange-500/20 bg-white/80 dark:bg-slate-900/80 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-300">Streak</p>
                <p className="mt-1 flex items-center gap-2 text-5xl font-black tabular-nums text-slate-900 dark:text-white">
                  {streak}
                  <FlameIcon size={40} className={playedToday ? "game-flicker text-orange-500 fill-orange-400/50" : "text-slate-300 dark:text-slate-700"} />
                </p>
                <p className="text-xs text-slate-500">best {progress?.best_streak ?? 0} {progress?.best_streak === 1 ? "day" : "days"}</p>
              </div>
            </div>
            <p className="mt-4 mb-1.5 text-[11px] text-slate-500">Last 4 weeks</p>
            <div className="grid grid-cols-7 gap-1" aria-label="Last 4 weeks of activity">
              {(progress?.calendar ?? Array.from({ length: 28 }, (_, i) => ({ date: String(i), active: false }))).map((d, i, arr) => (
                <span
                  key={d.date}
                  title={d.date}
                  className={`h-4 rounded ${
                    d.active ? "bg-orange-500 dark:bg-orange-400" : "bg-slate-100 dark:bg-slate-800"
                  } ${i === arr.length - 1 ? "ring-2 ring-offset-2 ring-orange-300 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                />
              ))}
            </div>
          </div>

          {/* Level + daily goal */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 p-5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className="stroke-slate-100 dark:stroke-slate-800" />
                  <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" strokeLinecap="round" className="stroke-teal-500" strokeDasharray={`${levelPct * 0.974} 100`} />
                </svg>
                <span className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] uppercase text-slate-500">Lv</span>
                  <span className="text-2xl font-black leading-none text-slate-900 dark:text-white">{progress?.level ?? 1}</span>
                </span>
              </div>
              <div className="text-sm">
                <p className="font-bold text-slate-900 dark:text-white">{progress?.xp ?? 0} XP total</p>
                <p className="text-slate-500">{progress ? `${progress.level_xp_needed - progress.level_xp} XP to level ${progress.level + 1}` : "Sign in to earn XP"}</p>
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300"><BoltIcon size={14} className="text-amber-500" /> Daily goal</span>
                <span className="font-mono text-slate-500">{progress?.xp_today ?? 0} / {progress?.daily_goal ?? 60} XP</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700" style={{ width: `${goalPct}%` }} />
              </div>
              {goalPct >= 100 ? <p className="mt-1.5 text-xs font-semibold text-orange-600 dark:text-orange-300">Daily goal complete</p> : null}
            </div>
          </div>
        </div>
      </section>

      {/* Daily pick */}
      {pick ? (
        <Link
          href={pick.href}
          className="group flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-200 dark:border-teal-500/30 bg-teal-50/70 dark:bg-teal-500/10 px-5 py-4 transition hover:border-teal-400"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white"><StarIcon size={20} filled /></span>
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-teal-700 dark:text-teal-300">Today&apos;s pick · {pick.label}</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{pick.name}</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-teal-800 dark:text-teal-200">
            Play now <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      ) : null}

      {/* Games, one per chapter */}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {GAMES.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Badges */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"><TrophyIcon size={20} className="text-amber-500" /> Badges</h2>
            <span className="font-mono text-xs text-slate-500">{earnedCount} / {badges.length}</span>
          </div>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <li
                key={b.id}
                className={`rounded-2xl border p-3.5 transition ${
                  b.earned
                    ? "border-amber-200 dark:border-amber-500/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/5"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50"
                }`}
              >
                <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${b.earned ? "bg-amber-400 text-amber-950" : "bg-slate-200 dark:bg-slate-800 text-slate-400"}`}>
                  {b.earned ? <TrophyIcon size={18} /> : <LockIcon size={16} />}
                </span>
                <p className={`text-sm font-bold ${b.earned ? "text-slate-900 dark:text-white" : "text-slate-500"}`}>{b.title}</p>
                <p className="text-xs leading-snug text-slate-500">{b.description}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Recent games</h2>
          {progress?.recent.length ? (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {progress.recent.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 font-mono text-xs font-bold text-teal-700 dark:bg-teal-500/15 dark:text-teal-300">
                      {chapterFor(r.game) ? `Ch${chapterFor(r.game)}` : "—"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{nameFor(r.game, r.level_id)}</p>
                      <Stars count={r.stars} size={11} />
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-300">+{r.xp} XP</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              {signedIn ? "Nothing yet. Today's pick is a good place to start." : "Sign in and your games will show up here."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
