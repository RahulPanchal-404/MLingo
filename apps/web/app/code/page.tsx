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
      <div className="mx-auto max-w-3xl pb-20">
        <header className="space-y-4 border-b border-slate-200 pb-10 dark:border-slate-800">
          <h1 className="text-[2.6rem] font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white">Build it in code</h1>
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            The lessons give you the intuition and Theory &amp; Math gives you the equations. This track teaches you to write the code: setting up a
            project, preparing real data, using and tuning each algorithm in scikit-learn and PyTorch, and shipping a model. Every example runs, and the
            output you see is the output it produced.
          </p>
          <p className="text-[15px] text-slate-600 dark:text-slate-400">
            New to coding ML? Start with <Link href="/code/setup" className="font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300">Set up your machine</Link> and{" "}
            <Link href="/code/first-model" className="font-semibold text-teal-700 underline underline-offset-4 dark:text-teal-300">Your first model, end to end</Link>, then follow the parts in order.
          </p>
        </header>
        {CODE_PARTS.map((part, pi) => (
          <section key={part.title} className="pt-10">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white">Part {pi + 1}: {part.title}</h2>
            <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-400">{part.summary}</p>
            <ol className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {part.entries.map((e) => {
                const m = CODE_MODULES.find((x) => x.slug === e.slug)!;
                return (
                  <li key={e.slug}>
                    <Link href={`/code/${e.slug}`} className="group grid grid-cols-[2.5rem_1fr] gap-x-2 py-3">
                      <span className="pt-0.5 text-sm tabular-nums text-slate-400">{numberOf(e.slug)}</span>
                      <span>
                        <span className="block font-semibold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{m.title}</span>
                        <span className="block text-sm leading-relaxed text-slate-600 dark:text-slate-400">{m.summary}</span>
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
