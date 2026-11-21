import Link from "next/link";

import { getProjectBySlug } from "@/features/projects/definitions";
import { getTheory } from "@/features/theory/topics";

/** Links from a Code module to the same concept in the other tracks. */
export function ModuleLinks({ slug, project }: { slug: string; project?: string }) {
  const topic = getTheory(slug);
  const proj = project ? getProjectBySlug(project) : undefined;
  const links = [
    topic?.learnHref ? { href: topic.learnHref, label: "Lesson", text: "The intuition" } : null,
    topic ? { href: `/theory/${slug}`, label: "Theory & Math", text: "The equations and derivations" } : null,
    proj ? { href: `/projects/${proj.slug}`, label: "Project", text: proj.title } : null,
  ].filter((l): l is { href: string; label: string; text: string } => l !== null);
  if (!links.length) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="rounded-xl border border-slate-200 px-4 py-3 hover:border-teal-600 dark:border-slate-800 dark:hover:border-teal-400">
          <span className="block text-xs font-bold uppercase tracking-wide text-slate-500">{l.label}</span>
          <span className="block text-sm font-semibold text-slate-900 dark:text-white">{l.text}</span>
        </Link>
      ))}
    </div>
  );
}
