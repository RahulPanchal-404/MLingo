import { useState } from "react";

export function DataPreviewTable({
  rows,
  targetColumn,
}: {
  rows: Array<Record<string, string | number | null>>;
  targetColumn?: string;
}) {
  const [rowLimit, setRowLimit] = useState(10);
  if (!rows || rows.length === 0) return null;

  const columns = Object.keys(rows[0]);
  const displayRows = rows.slice(0, rowLimit);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Data Sample Preview</h3>
          <p className="text-xs text-slate-500">
            Viewing first {displayRows.length} of {rows.length} records. Inspect values and schema.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label htmlFor="preview-limit" className="text-slate-600 font-medium">
            Rows:
          </label>
          <select
            id="preview-limit"
            className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
            value={rowLimit}
            onChange={(e) => setRowLimit(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-2.5 px-3 font-semibold text-slate-400 w-12 text-center">#</th>
              {columns.map((col) => {
                const isTarget = col === targetColumn;
                return (
                  <th
                    key={col}
                    className={`py-2.5 px-3 font-semibold ${
                      isTarget ? "bg-teal-50 text-teal-800 border-l border-r border-teal-100" : "text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col}</span>
                      {isTarget && (
                        <span className="rounded bg-teal-200 px-1 py-0.2 text-[10px] font-bold text-teal-900 uppercase">
                          Target
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            {displayRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/75 transition-colors">
                <td className="py-2 px-3 text-slate-400 text-center select-none font-sans text-[11px]">{idx + 1}</td>
                {columns.map((col) => {
                  const val = row[col];
                  const isMissing = val === null || val === undefined;
                  const isTarget = col === targetColumn;

                  return (
                    <td
                      key={col}
                      className={`py-2 px-3 whitespace-nowrap ${
                        isTarget ? "bg-teal-50/40 text-teal-950 font-medium" : ""
                      }`}
                    >
                      {isMissing ? (
                        <span className="inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-sans font-bold text-amber-900">
                          null (missing)
                        </span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
