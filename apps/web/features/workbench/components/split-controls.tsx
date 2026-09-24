import type { SplitConfig } from "../types";

export function SplitControls({
  config,
  totalRows,
  onChange,
}: {
  config: SplitConfig;
  totalRows: number;
  onChange: (updated: SplitConfig) => void;
}) {
  const trainCount = Math.max(1, Math.min(totalRows - 1, Math.round(config.trainRatio * totalRows)));
  const testCount = totalRows - trainCount;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            Train / Test Partition Configuration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic partitioning into training and evaluation sets.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="rounded bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300">
            Training: <span className="font-bold">{trainCount}</span> ({Math.round(config.trainRatio * 100)}%)
          </div>
          <div className="rounded bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300">
            Test: <span className="font-bold">{testCount}</span> ({Math.round((1 - config.trainRatio) * 100)}%)
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Split Ratio Slider */}
        <div>
          <div className="flex justify-between text-xs">
            <label htmlFor="split-ratio-slider" className="font-semibold text-slate-700 dark:text-slate-300">
              Train Ratio
            </label>
            <span className="font-mono font-bold text-teal-700 dark:text-teal-400">{Math.round(config.trainRatio * 100)}%</span>
          </div>
          <input
            id="split-ratio-slider"
            type="range"
            min="0.5"
            max="0.9"
            step="0.05"
            value={config.trainRatio}
            onChange={(e) => onChange({ ...config, trainRatio: Number(e.target.value) })}
            className="mt-2 w-full accent-teal-600 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
            <span>50%</span>
            <span>70%</span>
            <span>80% (Default)</span>
            <span>90%</span>
          </div>
        </div>

        {/* Random Seed Input */}
        <div>
          <label htmlFor="split-seed-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Random Seed (Reproducibility)
          </label>
          <div className="mt-2 flex items-center gap-2">
            <input
              id="split-seed-input"
              type="number"
              min="0"
              max="99999"
              value={config.seed}
              onChange={(e) => onChange({ ...config, seed: Math.max(0, parseInt(e.target.value) || 0) })}
              className="w-32 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-surface-elevated px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-mono focus:border-teal-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange({ ...config, seed: Math.floor(Math.random() * 1000) })}
              className="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-surface px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Shuffle Seed
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Fixing the seed guarantees identical train/test splits across runs.
          </p>
        </div>
      </div>
    </div>
  );
}
