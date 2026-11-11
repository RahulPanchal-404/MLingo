"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useAuth } from "@/features/players/auth-provider";
import { localDate } from "@/features/players/api";
import { ArrowRightIcon, BoltIcon, FlagIcon, FlameIcon, LockIcon, RewindIcon, Stars, StarIcon, TrophyIcon } from "@/features/players/icons";
import { initials } from "@/features/players/user-chip";
import { HOLES } from "./golf/golf-engine";
import { SCENARIOS } from "./rewind/rewind-engine";
import { useClearedLevels } from "./use-cleared-levels";

const ALL_LEVELS = [
  ...SCENARIOS.map((s) => ({ game: "rewind" as const, id: s.id, name: s.title, label: `Rewind · Case ${s.number}`, href: `/games/rewind?case=${s.id}` })),
  ...HOLES.map((h) => ({ game: "golf" as const, id: h.id, name: h.name, label: `Golf · Hole ${h.number}`, href: `/games/golf?hole=${h.id}` })),
];

const GUEST_BADGES = [
  { id: "first-steps", title: "First steps", description: "Finish your first game." },
  { id: "on-fire", title: "On fire", description: "Keep a 3-day streak." },
  { id: "unstoppable", title: "Unstoppable", description: "Keep a 7-day streak." },
  { id: "hole-in-one", title: "Hole in one", description: "Sink a Gradient Golf hole in a single shot." },
  { id: "course-champion", title: "Course champion", description: "Get 3 stars on every golf hole." },
  { id: "time-lord", title: "Time lord", description: "Save a run in Rewind using only one rewind." },
  { id: "last-second", title: "Last second save", description: "Rewind in the final quarter of a run and still save it." },
  { id: "rewind-master", title: "Rewind master", description: "Get 3 stars on every Rewind scenario." },
  { id: "level-5", title: "Rising star", description: "Reach player level 5." },
];

function dailyPick(levels: typeof ALL_LEVELS, cleared: Set<string>) {
  const today = localDate();
  let h = 0;
  for (const c of today) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  // Only pick levels the player can open: the first of each game, or ones after a cleared level.
  const open = levels.filter((l, i) => {
    const prev = levels[i - 1];
    return !prev || prev.game !== l.game || cleared.has(`${prev.game}:${prev.id}`);
  });
  return open[h % open.length];
}

function MiniTimeline() {
  return (
    <svg viewBox="0 0 300 90" className="w-full h-auto" aria-hidden="true">
      <rect width="300" height="90" rx="10" fill="#0b1220" />
      {Array.from({ length: 31 }, (_, i) => (
        <line key={i} x1={10 + i * 9.3} x2={10 + i * 9.3} y1={8} y2={i % 5 === 0 ? 16 : 12} stroke="rgba(148,163,184,0.4)" />
      ))}
      <path d="M10,70 C60,60 90,52 120,50 S170,40 190,44 S230,10 290,8" fill="none" stroke="#fb7185" strokeWidth="2" strokeDasharray="3 4" opacity="0.7" />
      <path d="M10,70 C60,60 90,52 120,50 S170,62 210,72 S260,78 290,79" fill="none" stroke="#2dd4bf" strokeWidth="2.5" />
      <line x1="120" x2="120" y1="6" y2="84" stroke="#f8fafc" strokeWidth="2" />
      <path d="M113,6 L127,6 L127,12 L120,18 L113,12 Z" fill="#f8fafc" />
      <path d="M114,80 l6,-5 v10 Z M120,80 l6,-5 v10 Z" fill="#a78bfa" transform="translate(240,160) rotate(180)" />
    </svg>
  );
}

function MiniCourse() {
  return (
    <svg viewBox="0 0 300 90" className="w-full h-auto" aria-hidden="true">
      <rect width="300" height="90" rx="10" fill="#14532d" />
      {[70, 58, 46, 34, 22, 12].map((r, i) => (
        <ellipse key={r} cx="215" cy="48" rx={r * 1.6} ry={r * 0.75} fill={["#166534", "#15803d", "#16a34a", "#22c55e", "#4ade80", "#86efac"][i]} />
      ))}
      <path d="M40,72 Q110,10 175,40 T212,48" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="5 4" />
      <circle cx="40" cy="72" r="5" fill="#fff" stroke="#0f172a" />
      <circle cx="215" cy="48" r="4" fill="#0f172a" />
      <line x1="215" y1="48" x2="215" y2="22" stroke="#f8fafc" strokeWidth="2" />
      <path d="M215,22 l14,5 l-14,5 Z" fill="#f43f5e" />
    </svg>
  );
}

export function GamesHub() {
  const { status, player, progress, guestQueued } = useAuth();
  const golf = useClearedLevels("golf");
  const rewind = useClearedLevels("rewind");

  const clearedKeys = useMemo(
    () => new Set([...[...golf.cleared].map((id) => `golf:${id}`), ...[...rewind.cleared].map((id) => `rewind:${id}`)]),
    [golf.cleared, rewind.cleared],
  );
  const pick = useMemo(() => dailyPick(ALL_LEVELS, clearedKeys), [clearedKeys]);

  const golfStars = HOLES.reduce((sum, h) => sum + golf.bestStars(h.id), 0);
  const rewindStars = SCENARIOS.reduce((sum, s) => sum + rewind.bestStars(s.id), 0);
  const signedIn = status === "signed-in" && progress;
  const streak = progress?.current_streak ?? 0;
  const playedToday = progress?.played_today ?? false;
  const goalPct = progress ? Math.min(100, Math.round((progress.xp_today / progress.daily_goal) * 100)) : 0;
  const levelPct = progress ? Math.round((progress.level_xp / progress.level_xp_needed) * 100) : 0;
  const badges = progress?.badges ?? GUEST_BADGES.map((b) => ({ ...b, earned: false }));
  const earnedCount = badges.filter((b) => b.earned).length;

  const nameFor = (game: string, id: string) => ALL_LEVELS.find((l) => l.game === game && l.id === id)?.name ?? id;

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
                    : "Two games built on real training runs. No formulas required to start."}
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-3 pt-2">
              {[
                { label: "Games played", value: progress?.games_played ?? 0 },
                { label: "Stars", value: `${golfStars + rewindStars} / ${(HOLES.length + SCENARIOS.length) * 3}` },
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

      {/* Games */}
      <section className="grid gap-6 md:grid-cols-2">
        <Link href="/games/rewind" className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6 text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-violet-600/30 blur-3xl" aria-hidden="true" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 rounded-full bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-200"><RewindIcon size={14} /> Signature game</span>
              <span className="font-mono text-xs text-slate-400">{rewindStars} / {SCENARIOS.length * 3} ★</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Rewind</h2>
              <p className="mt-1 text-slate-300">A training run is about to crash. Scrub back in time, change one thing, and write a new future. Braid, but for gradient descent.</p>
            </div>
            <MiniTimeline />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {SCENARIOS.map((s) => (
                  <Stars key={s.id} count={rewind.bestStars(s.id)} size={11} />
                ))}
              </div>
              <span className="flex items-center gap-1 rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold group-hover:bg-violet-400">Play <ArrowRightIcon size={16} /></span>
            </div>
          </div>
        </Link>

        <Link href="/games/golf" className="group relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 text-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
          <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-lime-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 rounded-full bg-lime-300/20 px-3 py-1 text-xs font-bold text-lime-100"><FlagIcon size={14} /> 6 holes</span>
              <span className="font-mono text-xs text-emerald-200/80">{golfStars} / {HOLES.length * 3} ★</span>
            </div>
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Gradient Golf</h2>
              <p className="mt-1 text-emerald-100/90">The learning rate is your club and the minimum is the cup. Unlock momentum and Adam as you play the course.</p>
            </div>
            <MiniCourse />
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {HOLES.map((h) => (
                  <Stars key={h.id} count={golf.bestStars(h.id)} size={11} />
                ))}
              </div>
              <span className="flex items-center gap-1 rounded-xl bg-lime-400 px-4 py-2 text-sm font-bold text-emerald-950 group-hover:bg-lime-300">Tee off <ArrowRightIcon size={16} /></span>
            </div>
          </div>
        </Link>
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
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${r.game === "rewind" ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"}`}>
                      {r.game === "rewind" ? <RewindIcon size={15} /> : <FlagIcon size={15} />}
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
