"use client";

import Link from "next/link";
import { useState } from "react";

import { GAMES_FOR_CHAPTER, getGame } from "@/features/games/registry";
import { chapters } from "@/features/learning/chapters";

/**
 * Chapter index with an in-place preview (oil-motion pattern 08): the list stays compact and
 * the panel shows whichever chapter is hovered or focused. Works the same with keyboard focus
 * and touch (tap selects; the "Open chapter" link navigates).
 */
export function ChapterIndex() {
  const list = chapters.filter((c) => c.lessons.length > 0);
  const [active, setActive] = useState(list[0].id);
  const chapter = list.find((c) => c.id === active) ?? list[0];
  const games = (GAMES_FOR_CHAPTER[chapter.id] ?? []).map((g) => getGame(g)).filter(Boolean);

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <ol className="border-t-2 border-[var(--ink)]">
        {list.map((c, i) => {
          const on = c.id === active;
          return (
            <li key={c.id} className="border-b-2 border-[var(--panel-line)]">
              <button
                type="button"
                onMouseEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                onClick={() => setActive(c.id)}
                aria-pressed={on}
                className="group flex w-full items-baseline gap-5 py-5 text-left"
              >
                <span className={`w-6 text-sm tabular-nums transition-colors duration-200 ${on ? "text-teal-700 dark:text-teal-300" : "text-slate-400"}`}>{i + 1}</span>
                <span
                  className={`font-display text-[clamp(1.75rem,3vw,2.6rem)] leading-none transition-[color,transform] duration-300 ease-[var(--ease-enter)] ${
                    on ? "translate-x-2 text-slate-950 dark:text-white" : "text-slate-400 group-hover:text-slate-700 dark:text-slate-600 dark:group-hover:text-slate-300"
                  }`}
                >
                  {c.title.split(":")[0]}
                </span>
                <span className="ml-auto text-sm text-slate-500">{c.lessons.length} {c.lessons.length === 1 ? "lesson" : "lessons"}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <article key={chapter.id} className="page-enter rounded-3xl border bg-white p-7 dark:bg-slate-900">
          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">{chapter.title}</h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400">{chapter.subtitle}</p>
          <ul className="mt-6 space-y-2.5">
            {chapter.lessons.slice(0, 5).map((l) => (
              <li key={l.href} className="flex gap-3 text-[15px]">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600 dark:bg-teal-300" aria-hidden="true" />
                <Link href={l.href} className="text-slate-800 underline-offset-4 hover:underline dark:text-slate-200">{l.title}</Link>
              </li>
            ))}
            {chapter.lessons.length > 5 ? <li className="pl-[18px] text-sm text-slate-500">and {chapter.lessons.length - 5} more</li> : null}
          </ul>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/learn#chapter-${chapter.id}`} className="rounded-xl bg-slate-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-slate-950">
              Open chapter
            </Link>
            {games.map((g) => (
              <Link key={g!.id} href={`/games/${g!.id}`} className="rounded-xl border bg-white px-5 py-3 font-semibold text-slate-900 dark:bg-slate-900 dark:text-white">
                Play {g!.title}
              </Link>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
