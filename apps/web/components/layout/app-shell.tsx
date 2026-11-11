import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { ThemeSwitch } from "@/features/theme/theme-switch";
import { UserChip } from "@/features/players/user-chip";
import { ConceptBridge } from "@/features/games/concept-bridge";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-150 flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[var(--background)]/85 backdrop-blur-md dark:border-slate-800/80">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="MLingo home">
              <LogoMark />
              <span className="font-display text-xl font-extrabold tracking-tight text-slate-950 dark:text-white">MLingo</span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeSwitch />
              <UserChip />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1480px] gap-8 px-4 sm:px-6 lg:px-8 py-8 md:grid-cols-[12rem_1fr] lg:gap-12">
          <PrimaryNavigation className="hidden md:block" />
          <main className="min-w-0 space-y-10">
            <Suspense fallback={null}>
              <ConceptBridge />
            </Suspense>
            {children}
          </main>
        </div>
      </div>

      <PrimaryNavigation
        className="overflow-x-auto border-t border-slate-200 bg-[var(--background)]/95 px-3 py-2 backdrop-blur-md md:hidden sticky bottom-0 z-30 dark:border-slate-800"
        mobile
      />
    </div>
  );
}

/** Three contour rings with the minimum marked: the loss landscape every lesson walks down. */
function LogoMark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-teal-600 dark:fill-teal-300" />
      <ellipse cx="17" cy="18" rx="11" ry="8" fill="none" strokeWidth="1.5" className="stroke-white/45 dark:stroke-slate-950/40" />
      <ellipse cx="18" cy="19" rx="7" ry="5" fill="none" strokeWidth="1.5" className="stroke-white/70 dark:stroke-slate-950/60" />
      <path d="M6 7 C 10 9, 13 14, 18 19" fill="none" strokeWidth="2" strokeLinecap="round" className="stroke-marigold" />
      <circle cx="18.5" cy="19.5" r="2.4" className="fill-marigold transition-transform duration-300 group-hover:scale-110" style={{ transformOrigin: "18.5px 19.5px" }} />
    </svg>
  );
}
