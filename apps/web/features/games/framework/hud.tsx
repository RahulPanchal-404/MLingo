import type { ReactNode } from "react";

export type HudItem = { label: string; value: string; tone?: "good" | "bad" };

const TONE = { good: "text-emerald-500", bad: "text-rose-500" };

/** Score strip shown above every round: a few big numbers and an optional timer bar. */
export function Hud({ items, progress }: { items: HudItem[]; progress?: number }) {
  return (
    <div className="space-y-2" aria-live="off">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        {items.map((i) => (
          <div key={i.label}>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{i.label}</div>
            <div className={`font-mono text-xl font-extrabold tabular-nums ${i.tone ? TONE[i.tone] : "text-slate-900 dark:text-white"}`}>{i.value}</div>
          </div>
        ))}
      </div>
      {progress !== undefined ? (
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-teal-500 transition-[width] duration-100" style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }} />
        </div>
      ) : null}
    </div>
  );
}

export function Pill({ children, onClick, active, disabled }: { children: ReactNode; onClick: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-4 py-2 text-sm font-bold transition disabled:opacity-40 ${
        active
          ? "border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "border-slate-300 bg-white text-slate-800 hover:border-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

export function BigButton({ children, onClick, disabled }: { children: ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl bg-teal-600 px-6 py-3 text-base font-extrabold text-white shadow-sm transition hover:bg-teal-700 active:scale-95 disabled:opacity-40 dark:bg-teal-500 dark:text-slate-950 dark:hover:bg-teal-400"
    >
      {children}
    </button>
  );
}
