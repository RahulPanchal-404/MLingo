import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
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
        {THEORY_GROUPS.map((group) => (
          <section key={group} className="space-y-3">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{group}</h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {THEORY.filter((t) => t.group === group).map((t) => (
                <Link
                  key={t.slug}
                  href={`/theory/${t.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-teal-600"
                >
                  <h3 className="font-bold text-slate-900 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">{t.title}</h3>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.summary}</p>
                  <p className="mt-2 font-mono text-[11px] text-slate-400">{t.sections.length} sections · read →</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
