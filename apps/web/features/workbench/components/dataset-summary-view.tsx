import type { DatasetSummary } from "../types";

export function DatasetSummaryView({ summary }: { summary: DatasetSummary }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface p-6 shadow-xs space-y-6">
      {/* Dataset Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="space-y-1 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="rounded bg-teal-50 dark:bg-teal-950/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {summary.taskType}
            </span>
            {summary.target && (
              <span className="rounded bg-slate-100 dark:bg-surface-elevated px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Target: <span className="font-mono text-teal-800 dark:text-teal-400 font-bold">{summary.target.name}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-950 dark:text-white sm:text-2xl">
            {summary.name}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {summary.description}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-slate-50 dark:bg-surface-inset border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5">
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-sans">Total Rows</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{summary.rowCount}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
          <div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-sans">Features</span>
            <span className="text-base font-bold text-slate-900 dark:text-white">{summary.featureCount}</span>
          </div>
        </div>
      </div>

      {/* Primary Surface: Consolidated Feature Schema Table */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Feature Schema & Data Properties
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            💡 <span className="font-semibold text-slate-700 dark:text-slate-300">unique</span> = how many different values this column contains.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-surface-elevated text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Column Name</th>
                <th className="px-4 py-3">Data Type</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Missing Values</th>
                <th className="px-4 py-3">Unique Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-surface">
              {summary.features.map((feat) => (
                <tr key={feat.name} className="hover:bg-slate-50/70 dark:hover:bg-surface-elevated/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900 dark:text-white">
                    {feat.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 dark:bg-surface-elevated px-2 py-0.5 text-[11px] font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {feat.dtype}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    Input Feature
                  </td>
                  <td className="px-4 py-3">
                    {feat.missingCount > 0 ? (
                      <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:text-amber-300">
                        {feat.missingCount} missing ({((feat.missingCount / summary.rowCount) * 100).toFixed(1)}%)
                      </span>
                    ) : (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span>✓</span> Complete
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-800 dark:text-slate-200">
                    <span className="font-bold">{feat.uniqueCount}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans ml-1">distinct values</span>
                  </td>
                </tr>
              ))}

              {/* Target Column Row */}
              {summary.target && (
                <tr className="bg-teal-50/40 dark:bg-teal-950/30 hover:bg-teal-50/60 dark:hover:bg-teal-950/50 transition-colors font-medium">
                  <td className="px-4 py-3 font-mono font-bold text-teal-950 dark:text-teal-200">
                    {summary.target.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-teal-100/70 dark:bg-teal-900/60 px-2 py-0.5 text-[11px] font-mono text-teal-900 dark:text-teal-200 font-semibold border border-teal-200 dark:border-teal-800">
                      {summary.target.taskType === "regression" ? "numeric" : "binary"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-teal-800 dark:text-teal-300 font-semibold">
                    Target (Prediction Objective)
                  </td>
                  <td className="px-4 py-3 text-emerald-700 dark:text-emerald-400">
                    ✓ Complete
                  </td>
                  <td className="px-4 py-3 font-mono text-teal-950 dark:text-teal-200">
                    <span className="font-bold">{summary.target.uniqueCount}</span>
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 font-sans ml-1">distinct values</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
