"use client";

import Link from "next/link";
import type { FormEvent, ReactNode } from "react";

/**
 * Shared layout for every lab.
 *
 *   title + one-line summary                         [actions]
 *   ┌──────────── charts ────────────┐  ┌─ settings ─┐
 *   │ main plot        │ metric plot │  │ sliders     │
 *   ├──────────── timeline ──────────┤  │ Run         │
 *   └────────────────────────────────┘  └─────────────┘
 *   explanations, maths, code (full width)
 *
 * The charts are visible as soon as the page opens, next to the settings that change them,
 * and the timeline sits directly under the charts it controls.
 */
export function LabWorkspace({
  title,
  summary,
  actions,
  settings,
  notices,
  status,
  visuals,
  timeline,
  children,
}: {
  title: string;
  summary: string;
  actions?: ReactNode;
  settings: ReactNode;
  notices?: ReactNode;
  status: { loading: boolean; error: string | null; loadingText?: string };
  visuals?: ReactNode;
  timeline?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="max-w-2xl">
          <h1 className="font-extrabold text-slate-950 dark:text-white" style={{ fontSize: "clamp(1.6rem, 2.4vw, 2.1rem)", lineHeight: 1.15 }}>{title}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{summary}</p>
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </header>

      {notices}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 space-y-4">
          {status.error ? (
            <section className="lab-alert" role="alert">
              <strong>Training could not be recorded.</strong>
              <span>{status.error}</span>
            </section>
          ) : status.loading || !visuals ? (
            <div className="flex min-h-[18rem] items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-slate-700" aria-live="polite">
              {status.loadingText ?? "Training the model…"}
            </div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] [&_.lab-chart]:h-full" aria-label="Training visualizations">
                {visuals}
              </section>
              {timeline}
            </>
          )}
        </div>
        <aside className="lg:sticky lg:top-20">{settings}</aside>
      </div>

      {!status.loading && !status.error && visuals ? children : null}
    </div>
  );
}

export type LabField = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** One short line under the slider. */
  hint?: string;
};

/** Compact settings panel: one slider per setting, a number box for exact values, and the run button. */
export function LabSettings({
  fields,
  onSubmit,
  loading,
  runLabel = "Train again",
  footer,
}: {
  fields: LabField[];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  runLabel?: string;
  footer?: ReactNode;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900" aria-label="Training settings">
      <h2 className="text-sm font-bold text-slate-900 dark:text-white">Settings</h2>
      {fields.map((f) => (
        <div key={f.label} className="space-y-1">
          <label className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span>{f.label}</span>
            <input
              aria-label={f.label}
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              required
              onChange={(e) => f.onChange(Number(e.target.value))}
              className="w-20 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-right font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            />
          </label>
          <input
            aria-hidden="true"
            tabIndex={-1}
            type="range"
            min={f.min}
            max={f.max}
            step={f.step}
            value={f.value}
            onChange={(e) => f.onChange(Number(e.target.value))}
            className="w-full accent-teal-600 dark:accent-teal-400"
          />
          {f.hint ? <p className="text-[11px] leading-snug text-slate-500 dark:text-slate-400">{f.hint}</p> : null}
        </div>
      ))}
      <button type="submit" disabled={loading} className="primary-button w-full justify-center">
        {loading ? "Training…" : runLabel}
      </button>
      {footer}
    </form>
  );
}

/** Links shown under the settings: where this lab's ideas are explained and coded. */
export function LabLinks({ theory, code }: { theory: string; code?: string }) {
  return (
    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
      New to this model? Read the <Link className="font-semibold text-teal-700 underline dark:text-teal-300" href={`/theory/${theory}`}>theory</Link>
      {code ? (
        <>
          {" "}or see it <Link className="font-semibold text-teal-700 underline dark:text-teal-300" href={`/code/${code}`}>in code</Link>
        </>
      ) : null}
      .
    </p>
  );
}
