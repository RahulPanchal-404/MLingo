import type { GeneralizationGapAnalysis } from "../types";

export function OverfittingExplainer({
  analysis,
}: {
  analysis: GeneralizationGapAnalysis;
}) {
  const isLargeGap = Math.abs(analysis.difference) > 0.15;

  return (
    <div
      className={`rounded-xl border p-6 shadow-sm ${
        isLargeGap
          ? "border-amber-200 bg-amber-50/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Generalization Gap Analysis (Train vs Test)
          </h4>
          <p className="text-xs text-slate-500">
            Evaluating whether performance on training examples holds on unseen test data.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500">Train: </span>
            <span className="font-bold text-slate-900">{analysis.trainValue}</span>
          </div>
          <div>
            <span className="text-slate-500">Test: </span>
            <span className="font-bold text-teal-800">{analysis.testValue}</span>
          </div>
          <div className="rounded bg-slate-100 px-2 py-0.5 font-bold text-slate-700">
            Δ: {analysis.difference > 0 ? `+${analysis.difference}` : analysis.difference}
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs leading-relaxed text-slate-700">
        <p className="font-medium text-slate-900">{analysis.description}</p>
        <p className="mt-2 text-[11px] text-slate-500">
          When training loss continues to drop while test loss plateaus or increases, the model may be fitting idiosyncrasies of the training partition rather than generalizable relationships.
        </p>
      </div>
    </div>
  );
}
