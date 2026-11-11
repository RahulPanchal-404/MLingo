import { getWatch, type Channel } from "../watch-links";

const DOT: Record<Channel, string> = { StatQuest: "#8fd3ff", CampusX: "#ffd166", "Krish Naik": "#ff9a8a" };

/** One compact row of outbound video links for a topic. Opens YouTube in a new tab. */
export function WatchRow({ slug }: { slug: string }) {
  const links = getWatch(slug);
  if (!links.length) return null;
  return (
    <section aria-labelledby={`watch-${slug}`} className="space-y-3">
      <h2 id={`watch-${slug}`} className="text-base font-bold text-slate-950 dark:text-white">
        Watch it explained
      </h2>
      <ul className="grid gap-2 sm:grid-cols-3">
        {links.map((l) => (
          <li key={l.url}>
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full flex-col gap-1 rounded-xl border bg-white p-3 dark:bg-slate-900"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <span className="h-2.5 w-2.5 rounded-full border border-slate-950" style={{ background: DOT[l.channel] }} aria-hidden="true" />
                {l.channel}
                {l.kind === "search" ? <span className="font-normal">· search</span> : l.kind === "playlist" ? <span className="font-normal">· playlist</span> : null}
              </span>
              <span className="text-sm font-semibold leading-snug text-slate-950 dark:text-white">{l.title.charAt(0).toUpperCase() + l.title.slice(1)}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500 dark:text-slate-400">Opens YouTube. Videos belong to their creators.</p>
    </section>
  );
}
