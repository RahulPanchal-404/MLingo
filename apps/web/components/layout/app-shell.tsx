import Link from "next/link";
import type { ReactNode } from "react";

import { PrimaryNavigation } from "@/components/layout/primary-navigation";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link className="text-lg font-semibold tracking-tight text-slate-950" href="/">MLingo</Link>
          <span className="text-sm text-slate-500">Machine Learning, Frame by Frame</span>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[11rem_1fr]">
        <PrimaryNavigation className="hidden md:block" />
        <main className="space-y-10">{children}</main>
      </div>
      <PrimaryNavigation className="overflow-x-auto border-t border-slate-200 bg-white px-4 py-3 md:hidden" mobile />
    </div>
  );
}
