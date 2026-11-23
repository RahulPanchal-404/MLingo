import { CodeBlock, TexText } from "@/features/theory/tex";

import type { LessonBlock, LessonCell } from "./types";

/** Code with its printed output directly underneath, the way a notebook shows it. */
export function Cell({ cell }: { cell: LessonCell }) {
  const lang = cell.lang === "terminal" || cell.lang === "text" ? cell.lang : "python";
  return (
    <figure className="my-6">
      <CodeBlock code={cell.code} lang={lang} />
      {cell.output ? (
        <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-1 text-xs font-semibold text-slate-500">Output</p>
          <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-200">{cell.output}</pre>
        </div>
      ) : null}
      {cell.figures?.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="The figure this code draws" className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-900" />
      ))}
    </figure>
  );
}

const prose = "text-[16.5px] leading-[1.75] text-slate-700 dark:text-slate-300";

export function LessonBlockView({ b }: { b: LessonBlock }) {
  if ("cell" in b) return <Cell cell={b.cell} />;
  if ("p" in b) return <p className={`${prose} my-4`}><TexText text={b.p} /></p>;
  if ("note" in b) return <p className={`${prose} my-5 border-l-4 border-teal-500 pl-4`}><TexText text={b.note} /></p>;
  if ("list" in b)
    return (
      <ul className={`${prose} my-4 list-disc space-y-2 pl-6`}>
        {b.list.map((x) => <li key={x}><TexText text={x} /></li>)}
      </ul>
    );
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full text-left text-[15px]">
        <thead>
          <tr className="border-b-2 border-slate-300 dark:border-slate-700">
            {b.table.head.map((h) => <th key={h} className="py-2 pr-4 font-semibold text-slate-950 dark:text-white"><TexText text={h} /></th>)}
          </tr>
        </thead>
        <tbody>
          {b.table.rows.map((row, i) => (
            <tr key={i} className="border-b border-slate-200 dark:border-slate-800">
              {row.map((c, j) => <td key={j} className="py-2.5 pr-4 align-top text-slate-700 dark:text-slate-300"><TexText text={c} /></td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
