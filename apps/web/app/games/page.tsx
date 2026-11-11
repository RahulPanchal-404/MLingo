import { AppShell } from "@/components/layout/app-shell";
import { GamesHub } from "@/features/games/games-hub";

export const metadata = { title: "Games · MLingo" };

export default function GamesPage() {
  return (
    <AppShell>
      <GamesHub />
    </AppShell>
  );
}
