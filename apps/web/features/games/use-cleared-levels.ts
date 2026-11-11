"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { useAuth } from "@/features/players/auth-provider";
import type { GameId } from "@/features/players/api";

const key = (game: GameId) => `mlingo.games.${game}.stars`;
const CHANGE_EVENT = "mlingo-cleared-change";

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readRaw(game: GameId): string {
  try {
    return window.localStorage.getItem(key(game)) ?? "{}";
  } catch {
    return "{}";
  }
}

function parse(raw: string): Record<string, number> {
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/**
 * Best stars per level, merged from the signed-in player's server progress and this browser,
 * so levels unlock immediately even before the result round-trips.
 */
export function useClearedLevels(game: GameId) {
  const { progress } = useAuth();
  const raw = useSyncExternalStore(subscribe, () => readRaw(game), () => "{}");

  const merged = useMemo(() => {
    const out: Record<string, number> = { ...parse(raw) };
    for (const [level, best] of Object.entries(progress?.games?.[game] ?? {})) {
      out[level] = Math.max(out[level] ?? 0, best.stars);
    }
    return out;
  }, [raw, progress, game]);

  const cleared = useMemo(() => new Set(Object.entries(merged).filter(([, s]) => s > 0).map(([k]) => k)), [merged]);

  const markCleared = useCallback(
    (level: string, stars: number) => {
      const current = parse(readRaw(game));
      const next = { ...current, [level]: Math.max(current[level] ?? 0, stars) };
      try {
        window.localStorage.setItem(key(game), JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      window.dispatchEvent(new Event(CHANGE_EVENT));
    },
    [game],
  );

  const bestStars = useCallback((level: string) => merged[level] ?? 0, [merged]);

  return { cleared, markCleared, bestStars };
}
