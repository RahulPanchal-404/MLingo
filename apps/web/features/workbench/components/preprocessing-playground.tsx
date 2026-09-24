import type { PreprocessingConfig } from "../types";

export function PreprocessingPlayground({
  config,
  onChange,
}: {
  config: PreprocessingConfig;
  onChange: (updated: PreprocessingConfig) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface p-6 shadow-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
          Feature Engineering & Transformation Controls
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure deterministic transformations to prepare features for model training.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Missing Values */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-inset p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            1. Missing Values
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Impute incomplete observations before fitting models.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="imputation"
                checked={config.missingImputation === "none"}
                onChange={() => onChange({ ...config, missingImputation: "none" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>None (Leave missing values as-is)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="imputation"
                checked={config.missingImputation === "mean_mode"}
                onChange={() => onChange({ ...config, missingImputation: "mean_mode" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-semibold text-teal-800 dark:text-teal-400">Mean / Most Frequent</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Mean for numeric, mode for categorical</p>
              </div>
            </label>
          </div>
        </div>

        {/* Numeric Scaling */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-inset p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            2. Numeric Scaling
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Normalize feature magnitudes to equalize gradient step sizes.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="scaling"
                checked={config.numericScaling === "none"}
                onChange={() => onChange({ ...config, numericScaling: "none" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>None (Raw magnitudes)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="scaling"
                checked={config.numericScaling === "standard"}
                onChange={() => onChange({ ...config, numericScaling: "standard" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-semibold text-teal-800 dark:text-teal-400">Standardization (Z-Score)</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Zero mean and unit standard deviation</p>
              </div>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="scaling"
                checked={config.numericScaling === "minmax"}
                onChange={() => onChange({ ...config, numericScaling: "minmax" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-semibold text-teal-800 dark:text-teal-400">Min-Max Scaling</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Bound feature values into [0, 1]</p>
              </div>
            </label>
          </div>
        </div>

        {/* Categorical Encoding */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-surface-inset p-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            3. Categorical Encoding
          </label>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Convert nominal categories into numeric signals for vector math.
          </p>
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="encoding"
                checked={config.categoricalEncoding === "none"}
                onChange={() => onChange({ ...config, categoricalEncoding: "none" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <span>None (Raw string representations)</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
              <input
                type="radio"
                name="encoding"
                checked={config.categoricalEncoding === "onehot"}
                onChange={() => onChange({ ...config, categoricalEncoding: "onehot" })}
                className="text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-semibold text-teal-800 dark:text-teal-400">One-Hot Encoding</span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Expand categories into binary columns</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
