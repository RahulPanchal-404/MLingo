import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ChapterIndex } from "@/features/home/chapter-index";
import { TrainingFilm } from "@/features/home/training-film";

const PATHWAYS = [
  {
    title: "Practise",
    items: [
      { href: "/games", label: "Games", text: "Each level is one concept you have to use to win." },
      { href: "/labs", label: "Labs", text: "Train a model, then scrub through every step." },
      { href: "/challenges", label: "Challenges", text: "Break training on purpose and diagnose why." },
      { href: "/theory", label: "Theory & Math", text: "The equations behind every lesson." },
    ],
  },
  {
    title: "Build",
    items: [
      { href: "/workbench", label: "Workbench", text: "Clean data, scale features, split without leaks." },
      { href: "/projects", label: "Projects", text: "Salary, exam outcome and customer segments, end to end." },
      { href: "/portfolio", label: "Portfolio", text: "Your finished projects, exportable as reports." },
    ],
  },
];

export default function Home() {
  return (
    <AppShell bleed>
      <TrainingFilm />

      <section className="mx-auto max-w-[1320px] px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-end gap-8 lg:grid-cols-[1.4fr_1fr]">
          <h2 className="text-[clamp(2.25rem,4.8vw,4.25rem)] text-slate-950 dark:text-white">Now you drive.</h2>
          <div className="space-y-6">
            <p className="max-w-[44ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Every lesson ends with something to play with. Start with the five-minute tour, or jump straight into the first lesson.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/demo" className="rounded-xl bg-teal-600 px-6 py-3.5 font-semibold text-white dark:bg-teal-300 dark:text-slate-950">
                Take the 5-minute tour
              </Link>
              <Link href="/learn/what-is-machine-learning" className="rounded-xl border bg-white px-6 py-3.5 font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
                Start lesson 1
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-24 sm:px-8" aria-labelledby="chapters-heading">
        <h2 id="chapters-heading" className="mb-8 text-[clamp(1.9rem,3.2vw,2.75rem)] text-slate-950 dark:text-white">What you will learn</h2>
        <ChapterIndex />
      </section>

      <section className="border-t-2 border-[var(--ink)] bg-white dark:bg-slate-900" aria-labelledby="pathways-heading">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_2fr]">
          <h2 id="pathways-heading" className="text-[clamp(1.9rem,3.2vw,2.75rem)] text-slate-950 dark:text-white">Beyond the lessons</h2>
          <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {PATHWAYS.map((group) => (
              <div key={group.title}>
                <h3 className="pb-3 text-lg font-bold text-slate-950 dark:text-white">{group.title}</h3>
                <ul className="border-t-2 border-[var(--ink)]">
                  {group.items.map((item) => (
                    <li key={item.href} className="border-b-2 border-[var(--panel-line)]">
                      <Link href={item.href} className="group flex items-baseline justify-between gap-4 py-4">
                        <span>
                          <span className="block font-semibold text-slate-900 transition-colors duration-150 group-hover:text-teal-700 dark:text-slate-100 dark:group-hover:text-teal-300">{item.label}</span>
                          <span className="block text-sm text-slate-500 dark:text-slate-400">{item.text}</span>
                        </span>
                        <span aria-hidden="true" className="text-slate-400 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-teal-600">›</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
