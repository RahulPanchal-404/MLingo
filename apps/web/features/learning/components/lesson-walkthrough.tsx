import { BlockView } from "@/features/theory/blocks";
import { WALKTHROUGHS } from "../walkthroughs";

const anchor = (heading: string) =>
  heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * The full step-by-step walkthrough for a lesson (server-rendered).
 * Order follows a textbook lesson: definition, intuition, steps, formula, worked example,
 * graph, code with output, pros and cons, uses, FAQs, practice.
 */
export function LessonWalkthrough({ slug }: { slug: string }) {
  const sections = WALKTHROUGHS[slug];
  if (!sections?.length) return null;
  return (
    <section aria-labelledby="walkthrough-title" className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <header className="space-y-2">
        <h2 id="walkthrough-title" className="text-xl font-extrabold text-slate-950 dark:text-white">Step-by-step walkthrough</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Read it in order: each part builds on the one before.</p>
        <nav aria-label="Walkthrough contents">
          <ol className="mt-3 grid list-decimal gap-x-8 gap-y-1 pl-5 text-sm text-teal-800 dark:text-teal-300 sm:grid-cols-2">
            {sections.map((s) => (
              <li key={s.heading}><a href={`#wt-${anchor(s.heading)}`} className="underline-offset-4 hover:underline">{s.heading}</a></li>
            ))}
          </ol>
        </nav>
      </header>
      {sections.map((s, i) => (
        <div key={s.heading} id={`wt-${anchor(s.heading)}`} className="scroll-mt-24 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">{i + 1}. {s.heading}</h3>
          {s.blocks.map((b, j) => <BlockView key={j} b={b} />)}
        </div>
      ))}
    </section>
  );
}
