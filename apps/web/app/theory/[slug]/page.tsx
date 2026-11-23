import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { LAB_FOR_TOPIC } from "@/features/labs/lab-links";
import { WatchRow } from "@/features/learning/components/watch-row";
import { StoryView } from "@/features/learning/components/story-view";
import { THEORY_STORIES } from "@/features/theory/stories";
import { BlockView } from "@/features/theory/blocks";
import { HOW_TO_CODE } from "@/features/theory/easy/apply";
import { THEORY, getTheory } from "@/features/theory/topics";
import { TopicTabs } from "@/features/theory/topic-tabs";

type TheoryPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return THEORY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: TheoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = getTheory(slug);
  return { title: t ? `${t.title}: Theory & Math — MLingo` : "Topic not found — MLingo", description: t?.summary };
}

export default async function TheoryPage({ params }: TheoryPageProps) {
  const { slug } = await params;
  const topic = getTheory(slug);
  if (!topic) notFound();
  const i = THEORY.indexOf(topic);
  const prev = THEORY[i - 1];
  const next = THEORY[i + 1];
  const hasCode = topic.sections.some((s) => s.heading === HOW_TO_CODE);
  // The code steps have their own page (/theory/[slug]/code); keep each section's original index as its anchor.
  const shown = topic.sections.map((s, n) => ({ s, n })).filter(({ s }) => s.heading !== HOW_TO_CODE);
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-8 pb-16">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <Link href="/theory" className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            ← All theory topics
          </Link>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
            {topic.group} · Theory &amp; Math
          </span>
        </nav>
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{topic.title}</h1>
          <p className="text-base text-slate-600 dark:text-slate-400">{topic.summary}</p>
          <div className="flex flex-wrap gap-2">
            {topic.learnHref ? (
              <Link href={topic.learnHref} className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-bold text-white hover:bg-teal-600">
                The intuition (lesson)
              </Link>
            ) : null}
            {LAB_FOR_TOPIC[topic.slug] && LAB_FOR_TOPIC[topic.slug] !== topic.learnHref ? (
              <Link href={LAB_FOR_TOPIC[topic.slug]} className="rounded-xl border border-teal-700 px-4 py-2 text-sm font-bold text-teal-800 hover:bg-teal-50 dark:border-teal-400 dark:text-teal-200 dark:hover:bg-teal-500/10">
                Open the lab
              </Link>
            ) : null}
            {topic.playHref ? (
              <Link href={topic.playHref} className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-amber-950 hover:bg-amber-400">
                Play it
              </Link>
            ) : null}
          </div>
          {hasCode ? <TopicTabs slug={topic.slug} active="theory" /> : null}
        </header>
        {THEORY_STORIES[topic.slug] ? (
          <section aria-label="The idea in plain words" className="space-y-5 border-b border-slate-200 pb-8 dark:border-slate-800">
            <StoryView source={THEORY_STORIES[topic.slug]} />
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              That&apos;s the intuition. The sections below go through the same idea carefully, with the maths, worked examples and code.
            </p>
          </section>
        ) : null}
        <nav aria-label="On this page" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {shown.map(({ s, n }) => (
              <li key={s.heading}>
                <a href={`#s${n}`} className="text-teal-700 hover:underline dark:text-teal-300">{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        {shown.map(({ s, n }, k) => (
          <section key={s.heading} id={`s${n}`} className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{k + 1}. {s.heading}</h2>
            {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
          </section>
        ))}
        {hasCode ? (
          <Link href={`/code/${topic.slug}`} className="block rounded-2xl border-2 border-[var(--panel-line)] bg-white p-5 hover:border-teal-600 dark:bg-slate-900 dark:hover:border-teal-400">
            <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">Next: build it</span>
            <span className="mt-1 block text-lg font-extrabold text-slate-950 dark:text-white">{topic.title} in code</span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">A template for your own data, the preprocessing it needs, what to tune and when not to, and every program from this page.</span>
          </Link>
        ) : null}
        <WatchRow slug={topic.slug} />
        <nav className="flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          {prev ? <Link href={`/theory/${prev.slug}`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">← {prev.title}</Link> : <span />}
          {next ? <Link href={`/theory/${next.slug}`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">{next.title} →</Link> : <span />}
        </nav>
      </article>
    </AppShell>
  );
}
