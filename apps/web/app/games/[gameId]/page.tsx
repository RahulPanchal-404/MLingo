import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { GamePlayer } from "@/features/games/game-player";
import { GAMES, getGame } from "@/features/games/registry";

type GamePageProps = {
  params: Promise<{ gameId: string }>;
};

export function generateStaticParams() {
  return GAMES.map((g) => ({ gameId: g.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = getGame(gameId);
  return { title: game ? `${game.title} · MLingo Games` : "Game not found · MLingo" };
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  if (!getGame(gameId)) notFound();
  return (
    <AppShell>
      <Suspense fallback={null}>
        <GamePlayer gameId={gameId} />
      </Suspense>
    </AppShell>
  );
}
