"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { ApiError, playersApi, type GameResult, type Player, type Progress, type RecordOutcome } from "./api";

const TOKEN_KEY = "mlingo.auth.token";
const GUEST_QUEUE_KEY = "mlingo.guest.results";
const MAX_GUEST_RESULTS = 30;

type Status = "loading" | "guest" | "signed-in";

export type RecordReceipt = { saved: true; outcome: RecordOutcome } | { saved: false; queued: number };

type AuthContextValue = {
  status: Status;
  player: Player | null;
  progress: Progress | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, displayName: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProgress: () => Promise<void>;
  recordResult: (result: GameResult) => Promise<RecordReceipt>;
  guestQueued: number;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode). The session simply won't persist.
  }
}

function readGuestQueue(): GameResult[] {
  try {
    const parsed: unknown = JSON.parse(readStorage(GUEST_QUEUE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as GameResult[]) : [];
  } catch {
    return [];
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [guestQueued, setGuestQueued] = useState(0);

  const becomeGuest = useCallback(() => {
    writeStorage(TOKEN_KEY, null);
    setToken(null);
    setPlayer(null);
    setProgress(null);
    setStatus("guest");
    setGuestQueued(readGuestQueue().length);
  }, []);

  const adoptSession = useCallback(async (nextToken: string, nextPlayer: Player) => {
    writeStorage(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setPlayer(nextPlayer);
    setStatus("signed-in");
    // Results earned while playing as a guest move into the account on sign-in.
    const queue = readGuestQueue();
    for (const result of queue) {
      try {
        await playersApi.record(nextToken, result);
      } catch {
        break;
      }
    }
    writeStorage(GUEST_QUEUE_KEY, null);
    setGuestQueued(0);
    setProgress(await playersApi.progress(nextToken));
  }, []);

  useEffect(() => {
    const stored = readStorage(TOKEN_KEY);
    if (!stored) {
      // Defer so the first render settles before we switch out of "loading".
      queueMicrotask(becomeGuest);
      return;
    }
    playersApi
      .me(stored)
      .then((me) => adoptSession(stored, me))
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) becomeGuest();
        else {
          // API unreachable: keep the token, but let the app run as a guest for now.
          setStatus("guest");
          setGuestQueued(readGuestQueue().length);
        }
      });
  }, [adoptSession, becomeGuest]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token: t, player: p } = await playersApi.signIn(email, password);
      await adoptSession(t, p);
    },
    [adoptSession],
  );

  const signUp = useCallback(
    async (email: string, displayName: string, password: string) => {
      const { token: t, player: p } = await playersApi.signUp(email, displayName, password);
      await adoptSession(t, p);
    },
    [adoptSession],
  );

  const signOut = useCallback(async () => {
    if (token) await playersApi.signOut(token).catch(() => undefined);
    becomeGuest();
  }, [token, becomeGuest]);

  const refreshProgress = useCallback(async () => {
    if (token) setProgress(await playersApi.progress(token));
  }, [token]);

  const recordResult = useCallback(
    async (result: GameResult): Promise<RecordReceipt> => {
      if (token) {
        const outcome = await playersApi.record(token, result);
        setProgress(outcome.progress);
        window.dispatchEvent(new CustomEvent("mlingo-progress-change"));
        return { saved: true, outcome };
      }
      const queue = [...readGuestQueue(), result].slice(-MAX_GUEST_RESULTS);
      writeStorage(GUEST_QUEUE_KEY, JSON.stringify(queue));
      setGuestQueued(queue.length);
      return { saved: false, queued: queue.length };
    },
    [token],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ status, player, progress, signIn, signUp, signOut, refreshProgress, recordResult, guestQueued }),
    [status, player, progress, signIn, signUp, signOut, refreshProgress, recordResult, guestQueued],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
