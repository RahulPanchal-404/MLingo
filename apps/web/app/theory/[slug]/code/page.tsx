import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { BlockView } from "@/features/theory/blocks";
import { HOW_TO_CODE } from "@/features/theory/easy/apply";
import { CODE_EXTRAS } from "@/features/theory/easy/tuning";
import { TexText } from "@/features/theory/tex";
import { TopicTabs } from "@/features/theory/topic-tabs";
import { THEORY, getTheory } from "@/features/theory/topics";

type CodePageProps = { params: Promise<{ slug: string }> };

const codeSection = (slug: string) => getTheory(slug)?.sections.find((s) => s.heading === HOW_TO_CODE);
const WITH_CODE = THEORY.filter((t) => codeSection(t.slug));

export function generateStaticParams() {
  return WITH_CODE.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: CodePageProps): Promise<Metadata> {
  const { slug } = await params;
  const t = getTheory(slug);
  return { title: t ? `${t.title}: Code — MLingo` : "Topic not found — MLingo", description: t ? `How to code ${t.title}, step by step, with explanations, settings to tune and variations to try.` : undefined };
}

export default async function CodePage({ params }: CodePageProps) {
  const { slug } = await params;
  const topic = getTheory(slug);
  const how = codeSection(slug);
  if (!topic || !how) notFound();
  const extras = CODE_EXTRAS[slug] ?? {};
  const steps = how.blocks.filter((b) => "codestep" in b);
  const i = WITH_CODE.indexOf(topic);
  const prev = WITH_CODE[i - 1];
  const next = WITH_CODE[i + 1];
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-8 pb-16">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <Link href="/theory" className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            ← All theory topics
          </Link>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
            {topic.group} · Code
          </span>
        </nav>
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{topic.title}: the code</h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            Every program for this topic, in order. Each one is followed by an explanation of what it does. At the end: the settings you can tune and variations to try.
          </p>
          <TopicTabs slug={slug} active="code" />
        </header>
        <nav aria-label="On this page" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {steps.map((b) => "codestep" in b ? (
              <li key={b.codestep.n}><a href={`#code-${b.codestep.n}`} className="text-teal-700 hover:underline dark:text-teal-300"><TexText text={b.codestep.goal} /></a></li>
            ) : null)}
            {extras.tune?.length ? <li><a href="#tune" className="text-teal-700 hover:underline dark:text-teal-300">Settings you can tune</a></li> : null}
            {extras.vary?.length ? <li><a href="#vary" className="text-teal-700 hover:underline dark:text-teal-300">Variations to try</a></li> : null}
          </ol>
        </nav>
        {how.blocks.map((b, k) => <BlockView key={k} b={b} />)}
        {extras.tune?.length ? (
          <section id="tune" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Settings you can tune</h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-400">Change one at a time, rerun the code, and compare the printed numbers.</p>
            <div className="space-y-3">
              {extras.tune.map((k) => (
                <div key={k.name} className="rounded-xl border-2 border-[var(--panel-line)] bg-white p-4 dark:bg-slate-900">
                  <p className="font-mono text-[15px] font-bold text-slate-950 dark:text-white">{k.name}</p>
                  <p className="mt-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"><TexText text={k.what} /></p>
                  <p className="mt-2 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"><span className="font-semibold text-teal-700 dark:text-teal-300">Try: </span><TexText text={k.try} /></p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {extras.vary?.length ? (
          <section id="vary" className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Variations to try</h2>
            <ol className="list-decimal space-y-3 pl-5">
              {extras.vary.map((v) => (
                <li key={v.title} className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-slate-950 dark:text-white"><TexText text={v.title} />. </span>
                  <TexText text={v.how} />
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <nav className="flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          {prev ? <Link href={`/theory/${prev.slug}/code`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">← {prev.title}: code</Link> : <span />}
          {next ? <Link href={`/theory/${next.slug}/code`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">{next.title}: code →</Link> : <span />}
        </nav>
      </article>
    </AppShell>
  );
}
