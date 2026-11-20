import { Quiz, Stepper } from "./interactive";
import { CodeBlock, MathBlock, TexText } from "./tex";
import type { Block, Walk } from "./topics";
import { TryIt } from "./widgets";

const LIBRARY = /\b(from|import)\s+(sklearn|pandas|scipy|statsmodels|torch|tensorflow|keras|xgboost|lightgbm|catboost|seaborn|matplotlib)\b/;
/** True when a snippet uses an ML/data library (shown openly); pure-Python/NumPy maths is folded. */
export const isLibraryCode = (code: string) => LIBRARY.test(code);

/** "What each line does": a code fragment beside a plain explanation. */
function WalkList({ walk }: { walk: Walk[] }) {
  // Show the code part without its trailing "# ..." note, so the explanation below it is the only commentary.
  const bare = (line: string) => line.replace(/\s+#(?![^"']*["'][^"']*$).*$/, "").trimEnd();
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60">
      <p className="mb-3 text-sm font-bold text-slate-950 dark:text-white">Explanation: what each part does</p>
      <ol className="space-y-3">
        {walk.map((w, i) => (
          <li key={i} className="space-y-1.5">
            <code className="block whitespace-pre-wrap break-words rounded-lg bg-slate-900 px-3 py-2 font-mono text-[13px] text-emerald-200">{bare(w.line) || w.line}</code>
            <p className="pl-1 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"><TexText text={w.say} /></p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Renders one theory block. Server component; interactive parts hydrate on the client. */
export function BlockView({ b }: { b: Block }) {
  if ("plain" in b)
    return (
      <aside className="rounded-2xl border-l-[6px] border-emerald-500 bg-emerald-50 px-5 py-4 dark:bg-emerald-500/10">
        <p className="text-xs font-bold uppercase tracking-wide text-emerald-800 dark:text-emerald-300">In plain words</p>
        <p className="mt-1 text-[16px] leading-relaxed text-slate-900 dark:text-slate-100"><TexText text={b.plain} /></p>
      </aside>
    );
  if ("example" in b)
    return (
      <div className="light-island rounded-2xl border-2 border-slate-950 bg-[#fff4d6] p-5">
        <p className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border-2 border-slate-950 bg-[#ffd166] px-2.5 py-0.5 text-xs font-bold text-slate-950">{b.example.kind === "idea" ? "Example" : "Worked example"}</span>
          <span className="font-semibold text-slate-950"><TexText text={b.example.title} /></span>
        </p>
        <div className="mt-3 space-y-3 [&_p]:text-slate-800">{b.example.blocks.map((inner, i) => <BlockView key={i} b={inner} />)}</div>
      </div>
    );
  if ("codelink" in b)
    return (
      <a href={b.codelink.href ?? `#code-${b.codelink.n}`} className="flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-teal-600 px-4 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50 dark:text-teal-200 dark:hover:bg-teal-500/10">
        <span>💻 See the code: Step {b.codelink.n}, <TexText text={b.codelink.goal} /></span>
        <span aria-hidden="true">→</span>
      </a>
    );
  if ("codestep" in b) {
    const c = b.codestep;
    const body = (
      <div className="space-y-3">
        <CodeBlock code={c.code} />
        {c.figure ? (
          <figure className="light-island overflow-hidden rounded-xl border border-slate-200 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG drawn by this code step */}
            <img src={c.figure.src} alt={c.figure.alt} loading="lazy" className="mx-auto block h-auto max-w-full" />
            <figcaption className="border-t border-slate-200 px-3 py-2 text-[13px] text-slate-600">The figure this code draws.</figcaption>
          </figure>
        ) : null}
        {c.walk?.length ? <WalkList walk={c.walk} /> : null}
      </div>
    );
    return (
      <div id={`code-${c.n}`} className="scroll-mt-24 space-y-3 rounded-2xl border-2 border-[var(--panel-line)] bg-white p-4 dark:bg-slate-900">
        <h3 className="text-[17px] font-extrabold text-slate-950 dark:text-white">Step {c.n}: <TexText text={c.goal} /></h3>
        {c.open || isLibraryCode(c.code) ? body : (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 dark:bg-slate-800 dark:text-white">
              <span>From-scratch Python (how it works under the hood)</span>
              <span className="rounded-full border-2 border-slate-950 bg-[#a7f3d0] px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:hidden">Show the code</span>
              <span className="hidden rounded-full border-2 border-slate-950 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:inline">Hide</span>
            </summary>
            <div className="pt-3">{body}</div>
          </details>
        )}
        {c.back !== undefined ? (
          <a href={c.backHref ?? `#s${c.back}`} className="inline-block text-sm font-semibold text-teal-700 hover:underline dark:text-teal-300">↑ Back to the theory: {c.backTitle}</a>
        ) : null}
      </div>
    );
  }
  if ("math" in b)
    return (
      <div className="rounded-xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <MathBlock tex={b.math} />
      </div>
    );
  if ("code" in b) {
    // Library code (scikit-learn, pandas, SciPy…) is what learners use day to day, so it stays visible.
    // From-scratch implementations are folded away, like derivations, for readers who want them.
    if (isLibraryCode(b.code)) return <CodeBlock code={b.code} />;
    return (
      <details className="group rounded-2xl border-2 border-[var(--panel-line)] bg-white dark:bg-slate-900">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-slate-950 dark:text-white">
          <span>From-scratch Python (how it works under the hood)</span>
          <span className="rounded-full border-2 border-slate-950 bg-[#a7f3d0] px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:hidden">Show the code</span>
          <span className="hidden rounded-full border-2 border-slate-950 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:inline">Hide</span>
        </summary>
        <div className="border-t-2 border-[var(--panel-line)] p-3"><CodeBlock code={b.code} /></div>
      </details>
    );
  }
  if ("list" in b)
    return (
      <ul className="list-disc space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {b.list.map((item) => (
          <li key={item}><TexText text={item} /></li>
        ))}
      </ul>
    );
  if ("callout" in b)
    return (
      <aside className="light-island rounded-2xl border-2 border-slate-950 bg-[#d3f1ff] p-5">
        <p className="text-sm font-bold text-slate-950">{b.callout.title}</p>
        <p className="mt-1.5 text-[16px] leading-relaxed text-slate-900"><TexText text={b.callout.body} /></p>
      </aside>
    );
  if ("steps" in b)
    return (
      <Stepper
        steps={b.steps.map((s) => ({
          title: <TexText text={s.title} />,
          body: (
            <>
              <p><TexText text={s.body} /></p>
              {s.math ? <MathBlock tex={s.math} /> : null}
            </>
          ),
        }))}
      />
    );
  if ("derive" in b)
    return (
      <details className="group rounded-2xl border-2 border-[var(--panel-line)] bg-white dark:bg-slate-900">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold text-slate-950 dark:text-white">
          <span>{b.derive.title}</span>
          <span className="rounded-full border-2 border-slate-950 bg-[#b9a6ff] px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:hidden">Show the derivation</span>
          <span className="hidden rounded-full border-2 border-slate-950 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:inline">Hide</span>
        </summary>
        <div className="space-y-3 border-t-2 border-[var(--panel-line)] px-5 py-4">
          {b.derive.blocks.map((inner, i) => <BlockView key={i} b={inner} />)}
        </div>
      </details>
    );
  if ("problem" in b)
    return (
      <details className="group rounded-2xl border-2 border-[var(--panel-line)] bg-white dark:bg-slate-900">
        <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 text-[15px] font-semibold text-slate-950 dark:text-white">
          <span><TexText text={b.problem.q} /></span>
          <span className="shrink-0 rounded-full border-2 border-slate-950 bg-[#ffd166] px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:hidden">Show solution</span>
          <span className="hidden shrink-0 rounded-full border-2 border-slate-950 bg-white px-2.5 py-0.5 text-xs font-bold text-slate-950 group-open:inline">Hide</span>
        </summary>
        <div className="space-y-3 border-t-2 border-[var(--panel-line)] px-5 py-4">
          {b.problem.solution.map((inner, i) => <BlockView key={i} b={inner} />)}
        </div>
      </details>
    );
  if ("tryit" in b) return <TryIt id={b.tryit} caption={b.caption} />;
  if ("figure" in b)
    return (
      <figure className="light-island overflow-hidden rounded-2xl border-2 border-[var(--panel-line)] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element -- static SVG graphs, no optimisation needed */}
        <img src={b.figure.src} alt={b.figure.alt} loading="lazy" className="mx-auto block h-auto max-w-full" />
        <figcaption className="border-t border-slate-200 px-4 py-2.5 text-[14px] leading-relaxed text-slate-700">
          <TexText text={b.figure.caption} />
        </figcaption>
      </figure>
    );
  if ("table" in b)
    return (
      <div className="overflow-x-auto rounded-2xl border-2 border-[var(--panel-line)]">
        <table className="w-full text-left text-[15px]">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>{b.table.head.map((h) => <th key={h} className="px-4 py-2.5 font-semibold text-slate-950 dark:text-white"><TexText text={h} /></th>)}</tr>
          </thead>
          <tbody>
            {b.table.rows.map((row, i) => (
              <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                {row.map((c, j) => <td key={j} className="px-4 py-2.5 align-top text-slate-700 dark:text-slate-300"><TexText text={c} /></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  if ("pitfalls" in b)
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {b.pitfalls.map((x) => (
          <div key={x.mistake} className="rounded-2xl border-2 border-[var(--panel-line)] bg-white p-4 dark:bg-slate-900">
            <p className="flex gap-2 font-semibold text-slate-950 dark:text-white"><span aria-hidden="true" className="text-rose-600">✗</span><TexText text={x.mistake} /></p>
            <p className="mt-2 flex gap-2 text-[15px] text-slate-700 dark:text-slate-300"><span aria-hidden="true" className="text-emerald-600">✓</span><span><TexText text={x.fix} /></span></p>
          </div>
        ))}
      </div>
    );
  if ("quiz" in b)
    return <Quiz q={<TexText text={b.quiz.q} />} options={b.quiz.options.map((o, i) => <TexText key={i} text={o} />)} answer={b.quiz.answer} why={<TexText text={b.quiz.why} />} />;
  return <p className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300"><TexText text={b.p} /></p>;
}
