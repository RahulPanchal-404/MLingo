import type { DataQualityReport } from "../types";

export function DataQualityCard({ quality }: { quality: DataQualityReport }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Data Quality Analysis</h3>
        <p className="text-xs text-slate-500">
          Automated structural validation of values, distributions, and integrity.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Missing Values */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Missing Values</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {quality.totalMissingValues > 0 ? (
              <span className="text-amber-700">{quality.totalMissingValues} missing</span>
            ) : (
              <span className="text-emerald-700">0 (Complete)</span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {quality.columnsWithMissing.length > 0
              ? `Affects: ${quality.columnsWithMissing.join(", ")}`
              : "All rows have complete entries"}
          </p>
        </div>

        {/* Duplicate Rows */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Duplicate Rows</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {quality.duplicateRowsCount > 0 ? (
              <span className="text-amber-700">{quality.duplicateRowsCount} duplicate</span>
            ) : (
              <span className="text-emerald-700">0 (Unique)</span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {quality.duplicateRowsCount > 0
              ? "Identical row feature signatures detected"
              : "Every record is unique"}
          </p>
        </div>

        {/* Constant Columns */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Constant Columns</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {quality.constantColumns.length > 0 ? (
              <span className="text-amber-700">{quality.constantColumns.length} constant</span>
            ) : (
              <span className="text-emerald-700">None</span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {quality.constantColumns.length > 0
              ? `Zero variance: ${quality.constantColumns.join(", ")}`
              : "All features exhibit variance"}
          </p>
        </div>

        {/* Target Balance */}
        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3.5">
          <p className="text-xs text-slate-500 uppercase tracking-wider">Class Balance</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {quality.classBalance ? (
              Object.entries(quality.classBalance)
                .map(([cls, pct]) => `${cls}: ${Math.round(pct * 100)}%`)
                .join(" / ")
            ) : (
              <span className="text-slate-400">N/A (Continuous)</span>
            )}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {quality.classBalance
              ? "Binary target label distribution"
              : "Continuous or unsupervised target"}
          </p>
        </div>
      </div>
    </div>
  );
}
