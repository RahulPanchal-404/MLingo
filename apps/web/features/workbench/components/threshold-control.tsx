export function ThresholdControl({
  threshold,
  onChange,
}: {
  threshold: number;
  onChange: (newThreshold: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <label htmlFor="classification-threshold-slider" className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Classification Decision Threshold (θ)
          </label>
          <p className="text-xs text-slate-500">
            Assign predicted class 1 when P(y=1 | x) ≥ θ. Default is 0.50.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg font-black text-teal-800 bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
            θ = {threshold.toFixed(2)}
          </span>
          <button
            type="button"
            onClick={() => onChange(0.5)}
            className="rounded border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Reset (0.50)
          </button>
        </div>
      </div>

      <div className="mt-3">
        <input
          id="classification-threshold-slider"
          type="range"
          min="0.05"
          max="0.95"
          step="0.05"
          value={threshold}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-teal-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
          <span>0.05 (High Recall / Aggressive)</span>
          <span>0.50 (Standard)</span>
          <span>0.95 (High Precision / Conservative)</span>
        </div>
      </div>
    </div>
  );
}
