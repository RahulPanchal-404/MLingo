import "katex/dist/katex.min.css";

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { ALGO_GUIDES, CODE_MODULES, getCodeModule } from "@/features/code-track/curriculum";
import { GUIDE_MODULES } from "@/features/code-track/guides";
import { ModuleLinks } from "@/features/code-track/module-links";
import { ProgramView } from "@/features/code-track/program-view";
import { BlockView } from "@/features/theory/blocks";
import { HOW_TO_CODE } from "@/features/theory/easy/apply";
import { CODE_EXTRAS } from "@/features/theory/easy/tuning";
import { TexText } from "@/features/theory/tex";
import { getTheory } from "@/features/theory/topics";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CODE_MODULES.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const m = getCodeModule(slug);
  return { title: m ? `${m.title}: Code — MLingo` : "Module not found — MLingo", description: m?.summary };
}

type Section = { id: string; heading: string; body: ReactNode };

const bullets = (items: string[]) => (
  <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
    {items.map((x) => <li key={x}><TexText text={x} /></li>)}
  </ul>
);

function topicSections(slug: string): Section[] {
  const topic = getTheory(slug);
  const guide = ALGO_GUIDES[slug];
  const extras = CODE_EXTRAS[slug] ?? {};
  const how = topic?.sections.find((s) => s.heading === HOW_TO_CODE);
  const programs = how?.blocks.filter((b) => "codestep" in b) ?? [];
  const out: Section[] = [];
  if (guide && (guide.use.length || guide.avoid.length)) {
    out.push({ id: "when", heading: "When to use it", body: (
      <div className="grid gap-4 sm:grid-cols-2">
        {guide.use.length ? <div className="space-y-2"><p className="text-sm font-bold text-slate-950 dark:text-white">Use it when</p>{bullets(guide.use)}</div> : null}
        {guide.avoid.length ? <div className="space-y-2"><p className="text-sm font-bold text-slate-950 dark:text-white">Avoid it when</p>{bullets(guide.avoid)}</div> : null}
      </div>
    ) });
  }
  if (guide?.prep.length) out.push({ id: "prep", heading: "Preprocessing it needs", body: bullets(guide.prep) });
  if (guide?.recipe) {
    out.push({ id: "template", heading: "Template: use it on your own data", body: (
      <div className="space-y-3">
        <p className="text-[15px] text-slate-600 dark:text-slate-400">A complete, runnable program in the style you would use at work. Swap in your own data and keep the structure.</p>
        <ProgramView program={guide.recipe} />
      </div>
    ) });
  }
  if (guide?.checks.length) {
    out.push({ id: "checks", heading: "Check your dataset first", body: <BlockView b={{ table: { head: ["If your data", "Then"], rows: guide.checks.map((c) => [c.if, c.do]) } }} /> });
  }
  if (guide?.optimise.length) {
    out.push({ id: "optimise", heading: "What to optimise, and when not to", body: (
      <BlockView b={{ table: { head: ["Setting", "Optimise it when", "Leave it alone when"], rows: guide.optimise.map((o) => [o.what, o.when, o.not || "—"]) } }} />
    ) });
  }
  if (programs.length) {
    out.push({ id: "programs", heading: "Programs from the theory", body: (
      <div className="space-y-4">
        <p className="text-[15px] text-slate-600 dark:text-slate-400">Each program below implements or checks a part of the Theory & Math page, step by step.</p>
        {programs.map((b, k) => <BlockView key={k} b={b} />)}
      </div>
    ) });
  }
  if (!guide?.optimise.length && extras.tune?.length) {
    out.push({ id: "tune", heading: "Settings to experiment with", body: (
      <BlockView b={{ table: { head: ["Setting", "What it controls", "Try"], rows: extras.tune.map((k) => [k.name, k.what, k.try]) } }} />
    ) });
  }
  if (extras.vary?.length) {
    out.push({ id: "vary", heading: "Variations to try", body: (
      <ol className="list-decimal space-y-3 pl-5">
        {extras.vary.map((v) => (
          <li key={v.title} className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-950 dark:text-white"><TexText text={v.title} />. </span><TexText text={v.how} />
          </li>
        ))}
      </ol>
    ) });
  }
  return out;
}

function guideSections(slug: string): Section[] {
  const g = GUIDE_MODULES[slug];
  return g.sections.map((s, i) => ({
    id: `s${i}`,
    heading: s.heading,
    body: (
      <div className="space-y-4">
        {s.blocks.map((b, k) => ("program" in b ? <ProgramView key={k} program={b.program} /> : <BlockView key={k} b={b} />))}
      </div>
    ),
  }));
}

export default async function CodeModulePage({ params }: Props) {
  const { slug } = await params;
  const m = getCodeModule(slug);
  if (!m) notFound();
  const sections = m.kind === "guide" ? guideSections(slug) : topicSections(slug);
  const i = CODE_MODULES.indexOf(m);
  const prev = CODE_MODULES[i - 1];
  const next = CODE_MODULES[i + 1];
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-8 pb-16">
        <nav className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <Link href="/code" className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">← Code track</Link>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-0.5 font-mono text-xs font-semibold text-teal-800 dark:border-teal-500/30 dark:bg-teal-500/10 dark:text-teal-200">
            Module {i + 1} of {CODE_MODULES.length} · {m.part}
          </span>
        </nav>
        <header className="space-y-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">{m.title}</h1>
          <p className="text-base text-slate-600 dark:text-slate-400">{m.summary}</p>
          <ModuleLinks slug={slug} project={m.project} />
        </header>
        <nav aria-label="On this page" className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">On this page</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-teal-700 hover:underline dark:text-teal-300">{s.heading}</a></li>)}
          </ol>
        </nav>
        {sections.map((s, k) => (
          <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{k + 1}. {s.heading}</h2>
            {s.body}
          </section>
        ))}
        <nav className="flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
          {prev ? <Link href={`/code/${prev.slug}`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">← {prev.title}</Link> : <span />}
          {next ? <Link href={`/code/${next.slug}`} className="font-semibold text-teal-700 hover:underline dark:text-teal-300">{next.title} →</Link> : <span />}
        </nav>
      </article>
    </AppShell>
  );
}
