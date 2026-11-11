import { apiBaseUrl } from "@/lib/api";

export type Player = { id: number; email: string; display_name: string; created_at: string };
export type Badge = { id: string; title: string; description: string; earned: boolean };
export type LevelBest = { stars: number; best_score: number; plays: number };
export type GameId = "golf" | "rewind";

export type Progress = {
  player: Player;
  xp: number;
  level: number;
  level_xp: number;
  level_xp_needed: number;
  xp_today: number;
  daily_goal: number;
  current_streak: number;
  best_streak: number;
  played_today: boolean;
  calendar: { date: string; active: boolean }[];
  games: Record<string, Record<string, LevelBest>>;
  badges: Badge[];
  recent: { game: string; level_id: string; stars: number; score: number; xp: number; created_at: string }[];
  games_played: number;
};

export type GameResult = {
  game: GameId;
  level_id: string;
  stars: number;
  score: number;
  meta?: Record<string, unknown>;
};

export type RecordOutcome = {
  xp_gained: number;
  leveled_up: boolean;
  streak_extended: boolean;
  new_badges: Badge[];
  progress: Progress;
};

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

/** The player's own calendar day, so streaks roll over at their midnight, not UTC's. */
export function localDate(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function describe(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0] as { msg?: string; loc?: string[] };
    const field = first.loc?.[first.loc.length - 1];
    const msg = (first.msg ?? fallback).replace(/^Value error, /, "");
    if (field === "password" && msg.includes("at least")) return "Password needs at least 8 characters.";
    if (field === "display_name" && msg.includes("at least")) return "Display name needs at least 2 characters.";
    return msg;
  }
  return fallback;
}

async function request<T>(path: string, init: RequestInit & { token?: string | null } = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (init.body) headers["Content-Type"] = "application/json";
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  } catch {
    throw new ApiError("Can't reach the MLingo API. Check that the backend is running.", 0);
  }
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = (body as { detail?: unknown } | null)?.detail;
    throw new ApiError(describe(detail, "Something went wrong. Try again."), response.status);
  }
  return body as T;
}

export const playersApi = {
  signUp: (email: string, displayName: string, password: string) =>
    request<{ token: string; player: Player }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, display_name: displayName, password }),
    }),
  signIn: (email: string, password: string) =>
    request<{ token: string; player: Player }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signOut: (token: string) => request<void>("/auth/logout", { method: "POST", token }),
  me: (token: string) => request<Player>("/auth/me", { token }),
  progress: (token: string) => request<Progress>(`/players/me/progress?local_date=${localDate()}`, { token }),
  record: (token: string, result: GameResult) =>
    request<RecordOutcome>("/players/me/results", {
      method: "POST",
      token,
      body: JSON.stringify({ meta: {}, ...result, local_date: localDate() }),
    }),
};
