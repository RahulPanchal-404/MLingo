"use client";

import { LevelPlayer } from "./framework/level-player";
import { getGame } from "./registry";

/** Client boundary: game definitions include functions and components, so they're looked up client-side. */
export function GamePlayer({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  return game ? <LevelPlayer game={game} /> : null;
}
