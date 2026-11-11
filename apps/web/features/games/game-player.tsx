"use client";

import { ArcadePlayer } from "./framework/arcade";
import { getGame } from "./registry";

/** Client boundary: game definitions include functions and components, so they're looked up client-side. */
export function GamePlayer({ gameId }: { gameId: string }) {
  const game = getGame(gameId);
  return game ? <ArcadePlayer game={game} /> : null;
}
