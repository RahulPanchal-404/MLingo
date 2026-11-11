"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { conceptFor } from "./concepts";
import { getGame } from "./registry";

/**
 * Shown on any concept page reached from a game (?from=<game>:<level>):
 * recaps what the player just did in the game and why it matters here.
 */
export function ConceptBridge() {
  const from = useSearchParams().get("from");
  const [closed, setClosed] = useState(false);
  if (!from || closed) return null;
  const [gameId, levelId] = from.split(":");
  const game = getGame(gameId);
  const level = game?.levels.find((l) => l.id === levelId);
  const concept = conceptFor(gameId, levelId);
  if (!game || !level || !concept) return null;
  return (
    <aside className="relative space-y-3 rounded-2xl border border-violet-300 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm dark:border-violet-500/40 dark:from-violet-500/15 dark:to-slate-950" aria-label="From the game">
      <button type="button" onClick={() => setClosed(true)} className="absolute right-3 top-3 text-sm text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Dismiss">✕</button>
      <p className="font-mono text-xs uppercase tracking-wider text-violet-700 dark:text-violet-300">
        {game.icon} You just played {game.title} · {level.name}
      </p>
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">That was {concept.title.toLowerCase().startsWith("k-") ? concept.title : concept.title.charAt(0).toLowerCase() + concept.title.slice(1)}.</h2>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"><b className="text-slate-900 dark:text-white">In the game: </b>{concept.played}</p>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300"><b className="text-slate-900 dark:text-white">Why it matters: </b>{concept.matters}</p>
      <p className="text-sm text-slate-600 dark:text-slate-400">The page below explains the idea properly. Come back and beat your score once it clicks.</p>
      <Link href={`/games/${game.id}?level=${level.id}`} className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700 dark:bg-violet-500 dark:text-slate-950">
        ← Back to {level.name}
      </Link>
    </aside>
  );
}
