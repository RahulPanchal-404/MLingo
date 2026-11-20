import Link from "next/link";

/** Switches between a topic's Theory & Math page and its Code page. */
export function TopicTabs({ slug, active }: { slug: string; active: "theory" | "code" }) {
  const tab = (on: boolean) =>
    `rounded-lg px-4 py-2 text-sm font-bold ${on ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`;
  return (
    <div role="tablist" aria-label="Topic pages" className="inline-flex gap-1 rounded-xl border border-slate-200 p-1 dark:border-slate-800">
      <Link role="tab" aria-selected={active === "theory"} href={`/theory/${slug}`} className={tab(active === "theory")}>📐 Theory &amp; Math</Link>
      <Link role="tab" aria-selected={active === "code"} href={`/theory/${slug}/code`} className={tab(active === "code")}>💻 Code</Link>
    </div>
  );
}
