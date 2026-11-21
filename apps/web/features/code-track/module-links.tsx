import Link from "next/link";

import { getProjectBySlug } from "@/features/projects/definitions";
import { getTheory } from "@/features/theory/topics";

const link = "font-semibold text-teal-700 underline decoration-teal-700/30 underline-offset-4 hover:decoration-teal-700 dark:text-teal-300";

/** One sentence pointing to the same concept in the other tracks. */
export function ModuleLinks({ slug, project }: { slug: string; project?: string }) {
  const topic = getTheory(slug);
  const proj = project ? getProjectBySlug(project) : undefined;
  if (!topic && !proj) return null;
  return (
    <p className="text-[15px] leading-relaxed text-slate-600 dark:text-slate-400">
      {topic?.learnHref ? <>Build the intuition in the <Link href={topic.learnHref} className={link}>lesson</Link>, </> : null}
      {topic ? <>see the equations in <Link href={`/theory/${slug}`} className={link}>Theory &amp; Math</Link></> : null}
      {proj ? <>{topic ? ", and " : "Practise it in "}{topic ? "practise it in the " : "the "}<Link href={`/projects/${proj.slug}`} className={link}>{proj.title}</Link> project</> : null}.
    </p>
  );
}
