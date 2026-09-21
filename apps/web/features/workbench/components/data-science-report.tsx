import type { PreprocessingConfig, SplitConfig, TaskType } from "../types";

export function DataScienceReport({
  datasetName,
  taskType,
  preprocessing,
  split,
  trainSamples,
  testSamples,
  trainMetric,
  testMetric,
  metricName,
  secondaryMetric,
}: {
  datasetName: string;
  taskType: TaskType;
  preprocessing: PreprocessingConfig;
  split: SplitConfig;
  trainSamples: number;
  testSamples: number;
  trainMetric: number;
  testMetric: number;
  metricName: string;
  secondaryMetric?: string;
}) {
  const scalingLabel =
    preprocessing.numericScaling === "standard"
      ? "Standardized (Z-Score)"
      : preprocessing.numericScaling === "minmax"
      ? "Min-Max [0, 1]"
      : "None";

  const imputerLabel =
    preprocessing.missingImputation === "mean_mode" ? "Mean / Mode" : "None";

  const encodingLabel =
    preprocessing.categoricalEncoding === "onehot" ? "One-Hot Encoded" : "None";

  return (
    <div className="rounded-xl border-2 border-teal-600/20 bg-gradient-to-br from-teal-50/40 via-white to-slate-50 p-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-teal-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-teal-600 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
            Report
          </span>
          <h3 className="text-base font-bold text-slate-900">Data Science Experiment Summary</h3>
        </div>
        <span className="text-xs font-mono text-slate-500">Seed: {split.seed}</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-xs sm:grid-cols-4">
        {/* Dataset */}
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Dataset</p>
          <p className="mt-1 font-bold text-slate-900 truncate">{datasetName}</p>
          <p className="text-[11px] text-slate-500 capitalize">{taskType}</p>
        </div>

        {/* Preprocessing */}
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Preprocessing</p>
          <p className="mt-1 font-medium text-slate-800 text-[11px]">
            Scale: <span className="font-bold text-teal-800">{scalingLabel}</span>
          </p>
          <p className="text-[11px] text-slate-500">
            Impute: {imputerLabel} | Enc: {encodingLabel}
          </p>
        </div>

        {/* Split */}
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[10px] uppercase font-semibold text-slate-400">Partitioning</p>
          <p className="mt-1 font-bold text-slate-900 font-mono">
            {Math.round(split.trainRatio * 100)}% / {Math.round((1 - split.trainRatio) * 100)}%
          </p>
          <p className="text-[11px] text-slate-500">
            Train: {trainSamples} | Test: {testSamples}
          </p>
        </div>

        {/* Evaluation */}
        <div className="rounded-lg border border-teal-200 bg-teal-50/70 p-3">
          <p className="text-[10px] uppercase font-semibold text-teal-700">Primary Metric ({metricName})</p>
          <p className="mt-1 font-black text-teal-950 font-mono text-base">{testMetric}</p>
          <p className="text-[11px] text-teal-800 font-mono">
            Train: {trainMetric} {secondaryMetric ? `| ${secondaryMetric}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
