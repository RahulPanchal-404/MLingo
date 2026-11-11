"use client";

import Link from "next/link";

import { useAuth } from "./auth-provider";
import { FlameIcon } from "./icons";

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function UserChip() {
  const { status, player, progress } = useAuth();

  if (status === "loading") {
    return <span className="h-8 w-24 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" aria-hidden="true" />;
  }

  if (status === "guest" || !player) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-teal-700 hover:bg-teal-800 dark:bg-teal-500 dark:hover:bg-teal-400 px-4 py-1.5 text-sm font-semibold text-white dark:text-slate-950 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  const streak = progress?.current_streak ?? 0;
  const lit = progress?.played_today ?? false;

  return (
    <Link
      href="/games"
      className="group flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-1 pr-3 py-1 hover:border-teal-300 dark:hover:border-teal-700 transition-colors"
      aria-label={`${player.display_name}, ${streak}-day streak, level ${progress?.level ?? 1}`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-700 dark:bg-teal-500 text-[11px] font-bold text-white dark:text-slate-950">
        {initials(player.display_name)}
      </span>
      <span
        className={`flex items-center gap-0.5 text-sm font-bold tabular-nums ${lit ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}
        title={lit ? "Streak extended today" : "Play a game today to keep your streak"}
      >
        <FlameIcon size={16} className={lit ? "fill-orange-400/40" : ""} />
        {streak}
      </span>
      <span className="hidden sm:inline text-xs font-mono text-slate-500 dark:text-slate-400">Lv {progress?.level ?? 1}</span>
    </Link>
  );
}
