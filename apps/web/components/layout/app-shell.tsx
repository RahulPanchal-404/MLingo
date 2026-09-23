import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";
import { ThemeSwitch } from "@/features/theme/theme-switch";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-150 flex flex-col justify-between">
      <div>
        <header className="border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5">
            <div className="flex items-center gap-3.5">
              <Link
                className="text-lg font-black tracking-tight text-slate-950 dark:text-white flex items-center gap-2"
                href="/"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-800 dark:bg-teal-600 text-white font-mono text-sm font-bold shadow-xs">
                  ML
                </span>
                <span>MLingo</span>
              </Link>
              <span className="hidden sm:inline text-xs font-mono text-slate-400 dark:text-slate-500 pl-2 border-l border-slate-200 dark:border-slate-800">
                Machine Learning, Frame by Frame
              </span>
            </div>

            <div className="flex items-center gap-3">
              <ThemeSwitch />
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-[1480px] gap-8 px-4 sm:px-6 lg:px-8 py-8 md:grid-cols-[13rem_1fr]">
          <PrimaryNavigation className="hidden md:block" />
          <main className="min-w-0 space-y-10">{children}</main>
        </div>
      </div>

      <PrimaryNavigation
        className="overflow-x-auto border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-4 py-2.5 md:hidden sticky bottom-0 z-30"
        mobile
      />
    </div>
  );
}
