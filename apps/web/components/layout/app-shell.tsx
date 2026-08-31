import type { ReactNode } from "react";

const navigationItems = ["Dashboard", "Learn", "Labs", "Experiments", "Challenges", "Progress", "Profile"];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight text-slate-950">MLingo</span>
          <span className="text-sm text-slate-500">Machine Learning, Frame by Frame</span>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-8 md:grid-cols-[11rem_1fr]">
        <nav aria-label="Primary navigation" className="hidden md:block">
          <ul className="space-y-1 text-sm text-slate-600">
            {navigationItems.map((item) => <li className={item === "Dashboard" ? "rounded-md bg-teal-50 px-3 py-2 font-medium text-teal-800" : "px-3 py-2"} key={item}>{item}</li>)}
          </ul>
        </nav>
        <main className="space-y-10">{children}</main>
      </div>
    </div>
  );
}
