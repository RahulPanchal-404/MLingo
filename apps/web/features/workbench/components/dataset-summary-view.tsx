import type { DatasetSummary } from "../types";

export function DatasetSummaryView({ summary }: { summary: DatasetSummary }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="inline-block rounded bg-teal-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-teal-700">
            {summary.taskType}
          </span>
          <h2 className="mt-1 text-xl font-bold text-slate-900">{summary.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{summary.description}</p>
        </div>
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Samples</p>
            <p className="text-lg font-bold text-slate-900">{summary.rowCount}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Features</p>
            <p className="text-lg font-bold text-slate-900">{summary.featureCount}</p>
          </div>
          {summary.target && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Target</p>
              <p className="text-lg font-bold text-teal-700">{summary.target.name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Feature Schema</h3>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {summary.features.map((feat) => (
            <div
              key={feat.name}
              className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-800">{feat.name}</span>
                <span className="ml-2 text-slate-500">({feat.dtype})</span>
              </div>
              <div className="flex items-center gap-2">
                {feat.missingCount > 0 ? (
                  <span className="rounded bg-amber-100 px-1.5 py-0.5 text-amber-800 font-medium">
                    {feat.missingCount} missing
                  </span>
                ) : (
                  <span className="text-slate-400">Complete</span>
                )}
                <span className="text-slate-400">| {feat.uniqueCount} unique</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
