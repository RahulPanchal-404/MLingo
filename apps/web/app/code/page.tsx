import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { CODE_MODULES, CODE_PARTS, minutesFor } from "@/features/code-track/curriculum";
import { GUIDE_MODULES } from "@/features/code-track/guides";
import { LESSONS } from "@/features/code-track/lessons";
import { ChapterMotif } from "@/features/learning/chapter-motif";
import { chapterStyle } from "@/features/learning/chapter-style";
import { getTheory } from "@/features/theory/topics";

export const metadata: Metadata = {
  title: "Code — MLingo",
  description: "Learn to build machine learning in Python: setup, preprocessing, every algorithm with tuning advice, evaluation and deployment.",
};

/** Words and runnable programs in a module, for the time estimate. */
function size(slug: string): [number, number] {
  const text = JSON.stringify(LESSONS[slug] ?? GUIDE_MODULES[slug] ?? getTheory(slug)?.sections.filter((s) => s.blocks.some((b) => "codestep" in b)) ?? "");
  const cells = (text.match(/"(cell|program|codestep)"/g) ?? []).length;
  return [text.split(/\s+/).length * 0.6, cells];
}

export default function CodeIndexPage() {
  const first = CODE_MODULES[0];
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <header className="grid items-end gap-8 border-b-2 border-[var(--ink)] pb-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="mb-4 text-slate-500">{CODE_PARTS.length} parts, {CODE_MODULES.length} modules, every example run with its real output</p>
            <h1 className="text-[clamp(2.5rem,5.5vw,4.5rem)] text-slate-950 dark:text-white">Build it in code</h1>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Set up a project, prepare real data, use and tune every algorithm in scikit-learn and PyTorch, then evaluate and ship a model. Each module
              builds the code a few lines at a time and explains every part before moving on.
            </p>
          </div>
          <div className="space-y-3">
            <Link href={`/code/${first.slug}`} className="group block rounded-2xl border bg-white p-5 dark:bg-slate-900">
              <span className="block text-sm text-slate-500">Start here</span>
              <span className="mt-1 block text-xl font-bold text-slate-950 dark:text-white">{first.title}</span>
              <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{minutesFor(first.slug, ...size(first.slug))} · No experience needed</span>
            </Link>
            <p className="px-1 text-sm text-slate-600 dark:text-slate-400">
              Already set up?{" "}
              <Link href="/code/first-model" className="font-semibold text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
                Skip to Your first model, end to end
              </Link>
            </p>
          </div>
        </header>

        <ol className="mt-4">
          {CODE_PARTS.map((part, pi) => {
            const color = chapterStyle(part.chapter);
            return (
              <li key={part.title} className="learn-chapter relative grid grid-cols-[2.5rem_1fr] gap-x-5 pt-14 sm:grid-cols-[3.5rem_1fr]">
                <div className="relative flex justify-center" aria-hidden="true">
                  <span className="relative z-10 mt-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 font-semibold tabular-nums text-slate-950 sm:h-12 sm:w-12" style={{ background: color.fill }}>
                    {pi + 1}
                  </span>
                  {pi < CODE_PARTS.length - 1 ? <span className="learn-rail absolute bottom-[-3.5rem] top-14 w-1 rounded-full" style={{ background: color.fill }} /> : null}
                </div>
                <section aria-labelledby={`part-${pi}`} className="min-w-0 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-[46ch]">
                      <h2 id={`part-${pi}`} className="scroll-mt-28 text-[clamp(1.6rem,3vw,2.4rem)] text-slate-950 dark:text-white">{part.title}</h2>
                      <p className="mt-3 text-slate-600 dark:text-slate-400">{part.summary}</p>
                    </div>
                    <div className="chapter-fill hidden w-48 shrink-0 rounded-2xl border-2 border-slate-950 p-3 sm:block" style={{ ["--c-fill" as string]: color.fill }}>
                      <ChapterMotif id={part.chapter} className="h-auto w-full" />
                    </div>
                  </div>
                  <ul className="mt-7 border-t-2 border-[var(--ink)]">
                    {part.entries.map((e, ei) => {
                      const m = CODE_MODULES.find((x) => x.slug === e.slug)!;
                      return (
                        <li key={e.slug} className="border-b-2 border-[var(--panel-line)]">
                          <Link href={`/code/${e.slug}`} className="group relative grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4 pl-3 transition-colors duration-150 hover:bg-[var(--chapter-tint)]" style={{ ["--chapter-tint" as string]: `${color.fill}33` }}>
                            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 origin-center scale-y-0 rounded-full transition-transform duration-200 ease-[var(--ease-enter)] group-hover:scale-y-100" style={{ background: color.ink }} />
                            <span className="text-sm font-semibold tabular-nums text-[var(--c-ink)] dark:text-[var(--c-fill)]" style={{ ["--c-ink" as string]: color.ink, ["--c-fill" as string]: color.fill }}>{String(ei + 1).padStart(2, "0")}</span>
                            <span className="min-w-0">
                              <span className="block font-semibold text-slate-950 transition-colors duration-150 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{LESSONS[e.slug]?.title ?? m.title}</span>
                              <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{LESSONS[e.slug]?.summary ?? m.summary}</span>
                            </span>
                            <span className="flex items-center gap-3 whitespace-nowrap text-sm text-slate-500">
                              <span className="hidden sm:inline">{minutesFor(e.slug, ...size(e.slug))}</span>
                              <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1 group-hover:text-teal-600">›</span>
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}
