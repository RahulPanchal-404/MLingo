import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { CODE_MODULES, CODE_PARTS } from "@/features/code-track/curriculum";

export const metadata: Metadata = {
  title: "Code — MLingo",
  description: "Learn to build machine learning in Python: setup, preprocessing, every algorithm with tuning advice, evaluation and deployment.",
};

export default function CodeIndexPage() {
  const numberOf = (slug: string) => CODE_MODULES.findIndex((m) => m.slug === slug) + 1;
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-10 pb-16">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">Code: build it yourself</h1>
          <p className="max-w-3xl text-slate-600 dark:text-slate-400">
            The practical track. Set up your machine, prepare real data, use every algorithm in scikit-learn and PyTorch, learn what to tune
            and what to leave alone, then evaluate and ship a model. Every program on these pages has been run, and its output is shown.
          </p>
          <p className="text-sm text-slate-500">{CODE_MODULES.length} modules in {CODE_PARTS.length} parts. Work through them in order, or jump to the one you need.</p>
        </header>
        {CODE_PARTS.map((part, pi) => (
          <section key={part.title} className="space-y-4">
            <div className="border-b border-slate-200 pb-2 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">Part {pi + 1}. {part.title}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{part.summary}</p>
            </div>
            <ol className="grid gap-3 md:grid-cols-2">
              {part.entries.map((e) => {
                const m = CODE_MODULES.find((x) => x.slug === e.slug)!;
                return (
                  <li key={e.slug}>
                    <Link href={`/code/${e.slug}`} className="group flex h-full gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-teal-600 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-400">
                      <span className="font-mono text-sm font-bold text-slate-400">{String(numberOf(e.slug)).padStart(2, "0")}</span>
                      <span>
                        <span className="block font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{m.title}</span>
                        <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{m.summary}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
