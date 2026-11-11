import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { PrimaryNavigation, TopNavigation } from "@/components/layout/primary-navigation";
import { ThemeSwitch } from "@/features/theme/theme-switch";
import { UserChip } from "@/features/players/user-chip";
import { ConceptBridge } from "@/features/games/concept-bridge";

export function AppShell({ children, bleed = false }: { children: ReactNode; bleed?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[var(--background)]/80 backdrop-blur-md dark:border-slate-800/70">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 py-3 sm:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5" aria-label="MLingo home">
              <LogoMark />
              <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">MLingo</span>
            </Link>
            <TopNavigation />
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitch />
            <UserChip />
          </div>
        </div>
      </header>

      <main className={`flex-1 ${bleed ? "" : "mx-auto w-full max-w-[1320px] space-y-10 px-5 py-10 sm:px-8 lg:py-14"}`}>
        <Suspense fallback={null}>
          <ConceptBridge />
        </Suspense>
        {children}
      </main>

      <footer className="hidden border-t border-slate-200 py-8 text-sm text-slate-500 md:block dark:border-slate-800">
        <div className="mx-auto flex max-w-[1320px] justify-between px-8">
          <span>MLingo. Machine learning, one frame at a time.</span>
        </div>
      </footer>

      <PrimaryNavigation
        className="sticky bottom-0 z-30 overflow-x-auto border-t border-slate-200 bg-[var(--background)]/95 px-3 py-2 backdrop-blur-md md:hidden dark:border-slate-800"
        mobile
      />
    </div>
  );
}

/** A line fitting a scatter of points: the first thing every learner trains. */
function LogoMark() {
  return (
    <svg viewBox="0 0 28 28" className="h-7 w-7" aria-hidden="true">
      <rect width="28" height="28" rx="7" className="fill-slate-950 dark:fill-white" />
      <g className="fill-white dark:fill-slate-950">
        <circle cx="7" cy="19" r="1.6" />
        <circle cx="11" cy="17.5" r="1.6" />
        <circle cx="14.5" cy="13" r="1.6" />
        <circle cx="18" cy="12" r="1.6" />
        <circle cx="21.5" cy="8" r="1.6" />
      </g>
      <path d="M5 20.5 L23 7" strokeWidth="2" strokeLinecap="round" className="stroke-teal-400 transition-transform duration-300 group-hover:rotate-[-4deg]" style={{ transformOrigin: "14px 14px" }} />
    </svg>
  );
}
