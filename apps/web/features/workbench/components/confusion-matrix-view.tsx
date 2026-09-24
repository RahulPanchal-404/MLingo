import type { ClassificationEvaluation } from "../types";

export function ConfusionMatrixView({
  evaluation,
}: {
  evaluation: ClassificationEvaluation;
}) {
  const { confusionMatrix: cm, accuracy, precision, recall, f1, threshold } = evaluation;
  const total = cm.tp + cm.tn + cm.fp + cm.fn;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Confusion Matrix (Decision Threshold θ = {threshold.toFixed(2)})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Contingency table comparing ground-truth test labels with predicted classes.
          </p>
        </div>
        <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Total Test Samples: <span className="font-bold text-slate-900 dark:text-white">{total}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 2x2 Matrix Table */}
        <div className="flex flex-col items-center justify-center">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Predicted Class
          </div>
          <div className="flex items-center gap-3">
            <div className="-rotate-90 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap">
              Actual Class
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {/* Actual 0, Pred 0: TN */}
              <div className="rounded-lg border-2 border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/40 p-4 w-36">
                <p className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300">True Negative (TN)</p>
                <p className="mt-1 text-2xl font-black text-emerald-950 dark:text-emerald-100 font-mono">{cm.tn}</p>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">Actual 0 → Pred 0</p>
              </div>

              {/* Actual 0, Pred 1: FP */}
              <div className="rounded-lg border-2 border-rose-200 dark:border-rose-800/80 bg-rose-50/60 dark:bg-rose-950/40 p-4 w-36">
                <p className="text-[10px] font-bold uppercase text-rose-800 dark:text-rose-300">False Positive (FP)</p>
                <p className="mt-1 text-2xl font-black text-rose-950 dark:text-rose-100 font-mono">{cm.fp}</p>
                <p className="text-[10px] text-rose-700 dark:text-rose-400 mt-1">Actual 0 → Pred 1</p>
              </div>

              {/* Actual 1, Pred 0: FN */}
              <div className="rounded-lg border-2 border-amber-200 dark:border-amber-800/80 bg-amber-50/60 dark:bg-amber-950/40 p-4 w-36">
                <p className="text-[10px] font-bold uppercase text-amber-800 dark:text-amber-300">False Negative (FN)</p>
                <p className="mt-1 text-2xl font-black text-amber-950 dark:text-amber-100 font-mono">{cm.fn}</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">Actual 1 → Pred 0</p>
              </div>

              {/* Actual 1, Pred 1: TP */}
              <div className="rounded-lg border-2 border-teal-200 dark:border-teal-800/80 bg-teal-50/60 dark:bg-teal-950/40 p-4 w-36">
                <p className="text-[10px] font-bold uppercase text-teal-800 dark:text-teal-300">True Positive (TP)</p>
                <p className="mt-1 text-2xl font-black text-teal-950 dark:text-teal-100 font-mono">{cm.tp}</p>
                <p className="text-[10px] text-teal-700 dark:text-teal-400 mt-1">Actual 1 → Pred 1</p>
              </div>
            </div>
          </div>
        </div>

        {/* Derived Metrics Grid */}
        <div className="flex flex-col justify-center gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-inset p-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Accuracy</span>
              <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white font-mono">{(accuracy * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">(TP + TN) / Total</p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-inset p-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precision</span>
              <p className="mt-1 text-xl font-bold text-teal-700 dark:text-teal-400 font-mono">{(precision * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">TP / (TP + FP)</p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-inset p-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recall</span>
              <p className="mt-1 text-xl font-bold text-indigo-700 dark:text-indigo-400 font-mono">{(recall * 100).toFixed(1)}%</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">TP / (TP + FN)</p>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-surface-inset p-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">F1 Score</span>
              <p className="mt-1 text-xl font-bold text-purple-700 dark:text-purple-400 font-mono">{f1.toFixed(3)}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">2 · P · R / (P + R)</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-50 dark:bg-surface-inset p-3 text-xs text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800">
            <span className="font-semibold text-slate-800 dark:text-slate-200">Trade-off dynamic: </span>
            Raising the threshold increases precision at the cost of recall (fewer false alarms, more missed positives). Lowering it captures more positives but increases false alarms.
          </div>
        </div>
      </div>
    </div>
  );
}
