import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { GAMES_FOR_CHAPTER, getGame } from "@/features/games/registry";
import { ChapterMotif } from "@/features/learning/chapter-motif";
import { chapterStyle } from "@/features/learning/chapter-style";
import { chapters } from "@/features/learning/chapters";

/**
 * The curriculum as one path. The rail beside each chapter draws in as you scroll past it
 * (CSS scroll-driven animation behind @supports, so it is simply drawn where unsupported).
 */
export default function LearnPage() {
  const list = chapters.filter((c) => c.lessons.length > 0);
  const totalLessons = list.reduce((acc, c) => acc + c.lessons.length, 0);
  const first = list[0].lessons[0];

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <header className="grid items-end gap-8 border-b-2 border-[var(--ink)] pb-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <p className="mb-4 text-slate-500">{list.length} chapters, {totalLessons} lessons</p>
            <h1 className="text-[clamp(3rem,7vw,5.5rem)] text-slate-950 dark:text-white">The learning path</h1>
            <p className="mt-5 max-w-[50ch] text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Start with what a model is and how it learns, then work through regression, classification, clustering and neural networks. Every lesson ends with something to try.
            </p>
          </div>
          <Link href={first.href} className="group block rounded-2xl border bg-white p-5 dark:bg-slate-900">
            <span className="block text-sm text-slate-500">Start here</span>
            <span className="mt-1 block text-xl font-bold text-slate-950 dark:text-white">{first.title}</span>
            <span className="mt-1 block text-sm text-slate-600 dark:text-slate-400">{first.time} · {first.difficulty}</span>
          </Link>
        </header>

        <ol className="mt-4">
          {list.map((chapter, ci) => {
            const games = (GAMES_FOR_CHAPTER[chapter.id] ?? []).map((g) => getGame(g)).filter(Boolean);
            const color = chapterStyle(chapter.id);
            return (
              <li key={chapter.id} className="learn-chapter relative grid grid-cols-[2.5rem_1fr] gap-x-5 pt-14 sm:grid-cols-[3.5rem_1fr]">
                {/* Path rail: node + line that draws on scroll */}
                <div className="relative flex justify-center" aria-hidden="true">
                  <span className="relative z-10 mt-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-950 font-semibold tabular-nums text-slate-950 sm:h-12 sm:w-12" style={{ background: color.fill }}>
                    {ci + 1}
                  </span>
                  {ci < list.length - 1 ? <span className="learn-rail absolute bottom-[-3.5rem] top-14 w-1 rounded-full" style={{ background: color.fill }} /> : null}
                </div>

                <section aria-labelledby={`chapter-${chapter.id}`} className="min-w-0 pb-4">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div className="max-w-[46ch]">
                      <h2 id={`chapter-${chapter.id}`} className="scroll-mt-28 text-[clamp(2rem,4vw,3rem)] text-slate-950 dark:text-white">
                        {chapter.title}
                      </h2>
                      <p className="mt-3 text-slate-600 dark:text-slate-400">{chapter.subtitle}</p>
                    </div>
                    <div className="hidden w-48 shrink-0 rounded-2xl border-2 border-slate-950 p-3 sm:block" style={{ background: color.fill }}>
                      <ChapterMotif id={chapter.id} className="h-auto w-full" />
                    </div>
                  </div>

                  <ul className="mt-7 border-t-2 border-[var(--ink)]">
                    {chapter.lessons.map((lesson) => (
                      <li key={lesson.title} className="border-b-2 border-[var(--panel-line)]">
                        <Link href={lesson.href} className="group relative grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-4 pl-3 transition-colors duration-150 hover:bg-[var(--chapter-tint)]" style={{ ["--chapter-tint" as string]: `${color.fill}33` }}>
                          <span aria-hidden="true" className="absolute inset-y-2 left-0 w-1 origin-center scale-y-0 rounded-full transition-transform duration-200 ease-[var(--ease-enter)] group-hover:scale-y-100" style={{ background: color.ink }} />
                          <span className="text-sm font-semibold tabular-nums text-[var(--c-ink)] dark:text-[var(--c-fill)]" style={{ ["--c-ink" as string]: color.ink, ["--c-fill" as string]: color.fill }}>{lesson.num}</span>
                          <span className="min-w-0">
                            <span className="block font-semibold text-slate-950 transition-colors duration-150 group-hover:text-teal-700 dark:text-white dark:group-hover:text-teal-300">
                              {lesson.title}
                            </span>
                            <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{lesson.summary}</span>
                          </span>
                          <span className="flex items-center gap-3 whitespace-nowrap text-sm text-slate-500">
                            <span className="hidden sm:inline">{lesson.time}</span>
                            <span aria-hidden="true" className="transition-transform duration-150 group-hover:translate-x-1 group-hover:text-teal-600">›</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                  {games.length ? (
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <span className="text-sm text-slate-500">Practise it:</span>
                      {games.map((g) => (
                        <Link key={g!.id} href={`/games/${g!.id}`} className="rounded-xl border px-4 py-2 text-sm font-semibold text-slate-950" style={{ background: color.fill }}>
                          Play {g!.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </section>
              </li>
            );
          })}
        </ol>
      </div>
    </AppShell>
  );
}
