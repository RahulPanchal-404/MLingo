import Link from "next/link";

import { CODE_MODULES } from "./curriculum";

const CORE = ["first-model", "load-inspect", "data-quality", "pipelines"];

/** On a project page: the Code track modules that teach what this project uses. */
export function ProjectCodeLinks({ project }: { project: string }) {
  const specific = CODE_MODULES.filter((m) => m.project === project);
  const core = CODE_MODULES.filter((m) => CORE.includes(m.slug));
  if (!specific.length) return null;
  return (
    <aside aria-label="Code for this project" className="mx-auto mb-6 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-950 dark:text-white">Code for this project</p>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">Learn to build each part yourself in the Code track.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[...core, ...specific].map((m) => (
          <Link key={m.slug} href={`/code/${m.slug}`} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-teal-700 hover:border-teal-600 dark:border-slate-700 dark:text-teal-300">
            {m.title}
          </Link>
        ))}
      </div>
    </aside>
  );
}
