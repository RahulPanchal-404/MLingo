"use client";

import { useState, type ReactNode } from "react";

/**
 * Client pieces for theory pages. The text inside (with KaTeX) is rendered on the server and
 * passed in as nodes, so these components only handle the interaction.
 */

/** Worked example revealed one step at a time. */
export function Stepper({ steps }: { steps: { title: ReactNode; body: ReactNode }[] }) {
  const [shown, setShown] = useState(1);
  const done = shown >= steps.length;
  return (
    <div className="rounded-2xl border-2 border-[var(--ink)] bg-white p-5 dark:bg-slate-900">
      <ol className="space-y-4">
        {steps.slice(0, shown).map((s, i) => (
          <li key={i} className="page-enter grid grid-cols-[2rem_1fr] gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-[#ffd166] text-sm font-bold text-slate-950">{i + 1}</span>
            <div className="min-w-0 space-y-1.5">
              <p className="font-semibold text-slate-950 dark:text-white">{s.title}</p>
              <div className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">{s.body}</div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!done ? (
          <button type="button" onClick={() => setShown((n) => n + 1)} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-slate-950">
            Next step ({shown}/{steps.length})
          </button>
        ) : (
          <button type="button" onClick={() => setShown(1)} className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
            Start again
          </button>
        )}
        {!done ? (
          <button type="button" onClick={() => setShown(steps.length)} className="text-sm font-semibold text-slate-600 underline-offset-4 hover:underline dark:text-slate-300">
            Show all steps
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** One multiple-choice check with an explanation. */
export function Quiz({ q, options, answer, why }: { q: ReactNode; options: ReactNode[]; answer: number; why: ReactNode }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <div className="rounded-2xl border-2 border-[var(--ink)] bg-white p-5 dark:bg-slate-900">
      <p className="font-semibold text-slate-950 dark:text-white">{q}</p>
      <div className="mt-4 grid gap-2">
        {options.map((o, i) => {
          const state = picked === null ? "idle" : i === answer ? "right" : i === picked ? "wrong" : "idle";
          return (
            <button
              key={i}
              type="button"
              onClick={() => setPicked(i)}
              aria-pressed={picked === i}
              className={`rounded-xl border-2 px-4 py-2.5 text-left text-[15px] transition-colors duration-150 ${
                state === "right"
                  ? "border-emerald-600 bg-emerald-50 text-emerald-950 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-100"
                  : state === "wrong"
                    ? "border-rose-500 bg-rose-50 text-rose-950 dark:border-rose-400 dark:bg-rose-950/40 dark:text-rose-100"
                    : "border-slate-200 text-slate-800 hover:border-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500"
              }`}
            >
              {o}
            </button>
          );
        })}
      </div>
      {picked !== null ? (
        <div className="page-enter mt-4 rounded-xl bg-slate-50 p-4 text-[15px] leading-relaxed text-slate-700 dark:bg-slate-800 dark:text-slate-200" role="status">
          <span className="font-semibold text-slate-950 dark:text-white">{picked === answer ? "Correct. " : "Not quite. "}</span>
          {why}
        </div>
      ) : null}
    </div>
  );
}
