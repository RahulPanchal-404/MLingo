import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { GolfGame } from "@/features/games/golf/golf-game";

export const metadata = { title: "Gradient Golf · MLingo" };

export default function GolfPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <GolfGame />
      </Suspense>
    </AppShell>
  );
}
