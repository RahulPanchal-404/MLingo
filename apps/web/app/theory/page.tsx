import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { ChapterMotif } from "@/features/learning/chapter-motif";
import { chapterForLabel, chapterStyle } from "@/features/learning/chapter-style";
import { THEORY, THEORY_GROUPS } from "@/features/theory/topics";

export const metadata: Metadata = {
  title: "Theory & Math — MLingo",
  description: "The formal theory and mathematics behind every MLingo topic.",
};

export default function TheoryIndexPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">The maths behind every topic</h1>
          <p className="max-w-3xl text-slate-600 dark:text-slate-400">
            Lessons build intuition and games let you feel it. This section is for when you want the formal version: definitions, equations,
            derivations and the assumptions behind each method. Each topic links back to its lesson and game.
          </p>
        </header>
        {THEORY_GROUPS.map((group) => {
          const id = chapterForLabel(group);
          const color = chapterStyle(id);
          return (
          <section key={group} className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-20 items-center justify-center rounded-xl border-2 border-slate-950" style={{ background: color.fill }}>
                <ChapterMotif id={id} className="h-10 w-16" />
              </span>
              <h2 className="text-2xl font-bold text-slate-950 dark:text-white">{group}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {THEORY.filter((t) => t.group === group).map((t) => (
                <Link
                  key={t.slug}
                  href={`/theory/${t.slug}`}
                  className="group relative overflow-hidden rounded-2xl border bg-white p-4 pl-6 dark:bg-slate-900"
                >
                  <span aria-hidden="true" className="absolute inset-y-0 left-0 w-2" style={{ background: color.fill }} />
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.summary}</p>
                  <p className="mt-2 text-xs text-slate-500">{t.sections.length} sections</p>
                </Link>
              ))}
            </div>
          </section>
          );
        })}
      </div>
    </AppShell>
  );
}
