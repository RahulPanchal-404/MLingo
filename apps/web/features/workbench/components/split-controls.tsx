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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Train / Test Partition Configuration
          </h3>
          <p className="text-xs text-slate-500">
            Deterministic partitioning into training and evaluation sets.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="rounded bg-teal-50 px-2.5 py-1 border border-teal-200 text-teal-800">
            Training: <span className="font-bold">{trainCount}</span> ({Math.round(config.trainRatio * 100)}%)
          </div>
          <div className="rounded bg-indigo-50 px-2.5 py-1 border border-indigo-200 text-indigo-800">
            Test: <span className="font-bold">{testCount}</span> ({Math.round((1 - config.trainRatio) * 100)}%)
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Split Ratio Slider */}
        <div>
          <div className="flex justify-between text-xs">
            <label htmlFor="split-ratio-slider" className="font-semibold text-slate-700">
              Train Ratio
            </label>
            <span className="font-mono font-bold text-teal-700">{Math.round(config.trainRatio * 100)}%</span>
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
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
            <span>50%</span>
            <span>70%</span>
            <span>80% (Default)</span>
            <span>90%</span>
          </div>
        </div>

        {/* Random Seed Input */}
        <div>
          <label htmlFor="split-seed-input" className="block text-xs font-semibold text-slate-700">
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
              className="w-32 rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-teal-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onChange({ ...config, seed: Math.floor(Math.random() * 1000) })}
              className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Shuffle Seed
            </button>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Fixing the seed guarantees identical train/test splits across runs.
          </p>
        </div>
      </div>
    </div>
  );
}
