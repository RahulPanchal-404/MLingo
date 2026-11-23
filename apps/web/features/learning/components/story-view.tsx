import type { ReactNode } from "react";

/**
 * Renders a lesson story written in a small markdown subset:
 *   ## Heading          section heading
 *   blank-line paragraphs, **bold**, *italic*
 *   - item              bullet list
 *   > text              a highlighted note
 *   | a | b |           a simple table (first row is the header)
 */
export function StoryView({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  const out: ReactNode[] = [];
  blocks.forEach((raw, i) => {
    const block = raw.trim();
    if (block.startsWith("## ")) {
      out.push(
        <h2 key={i} className="pt-4 text-2xl font-extrabold text-slate-950 first:pt-0 dark:text-white">
          {inline(block.slice(3))}
        </h2>,
      );
    } else if (block.startsWith("### ")) {
      out.push(<h3 key={i} className="pt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{inline(block.slice(4))}</h3>);
    } else if (block.split("\n").every((l) => l.trim().startsWith("- "))) {
      out.push(
        <ul key={i} className="list-disc space-y-2 pl-6 text-[17px] leading-[1.75] text-slate-800 marker:text-slate-400 dark:text-slate-200">
          {block.split("\n").map((l, j) => <li key={j}>{inline(l.trim().slice(2))}</li>)}
        </ul>,
      );
    } else if (block.startsWith(">")) {
      out.push(
        <aside key={i} className="rounded-r-xl border-l-4 border-teal-600 bg-slate-50 px-5 py-4 text-[16.5px] leading-[1.7] text-slate-800 dark:border-teal-400 dark:bg-slate-900 dark:text-slate-100">
          <p>{inline(block.split("\n").map((l) => l.replace(/^>\s?/, "")).join(" "))}</p>
        </aside>,
      );
    } else if (block.startsWith("|")) {
      const rows = block.split("\n").filter((l) => !/^\|\s*-/.test(l.trim())).map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      out.push(
        <div key={i} className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-[15px]">
            <thead>
              <tr>{rows[0].map((c, j) => <th key={j} className="border-b-2 border-slate-300 px-3 py-2 font-bold text-slate-900 dark:border-slate-600 dark:text-white">{inline(c)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((r, j) => (
                <tr key={j}>{r.map((c, k) => <td key={k} className="border-b border-slate-200 px-3 py-2 text-slate-800 dark:border-slate-800 dark:text-slate-200">{inline(c)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    } else {
      out.push(<p key={i} className="text-[17px] leading-[1.8] text-slate-800 dark:text-slate-200">{inline(block.replace(/\n/g, " "))}</p>);
    }
  });
  return <div className="space-y-5">{out}</div>;
}

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? (
      <strong key={i} className="font-bold text-slate-950 dark:text-white">{p.slice(2, -2)}</strong>
    ) : p.startsWith("*") && p.length > 2 ? (
      <em key={i}>{p.slice(1, -1)}</em>
    ) : (
      p
    ),
  );
}
