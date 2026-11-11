import { Suspense } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { RewindGame } from "@/features/games/rewind/rewind-game";

export const metadata = { title: "Rewind · MLingo" };

export default function RewindPage() {
  return (
    <AppShell>
      <Suspense fallback={null}>
        <RewindGame />
      </Suspense>
    </AppShell>
  );
}
