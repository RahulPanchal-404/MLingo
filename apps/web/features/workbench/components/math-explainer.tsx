export function MathExplainer() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Mathematical Formulation of Preprocessing
        </h3>
        <p className="text-xs text-slate-500">
          Exact formulas computed during feature preparation.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Standardization */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Standardization (Z-Score)</p>
          <div className="mt-2 rounded bg-white p-2 font-mono text-xs text-teal-800 text-center border border-slate-200">
            z = (x - μ) / σ
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Centers mean to 0 and scales standard deviation to 1. Prevents large-scale features from dominating gradients.
          </p>
        </div>

        {/* Min-Max Scaling */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Min-Max Scaling</p>
          <div className="mt-2 rounded bg-white p-2 font-mono text-xs text-teal-800 text-center border border-slate-200">
            x&apos; = (x - x_min) / (x_max - x_min)
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Compresses values into [0, 1]. Preserves zero values and relative distances without assuming Gaussian normality.
          </p>
        </div>

        {/* Mean Imputation */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Mean Imputation</p>
          <div className="mt-2 rounded bg-white p-2 font-mono text-xs text-teal-800 text-center border border-slate-200">
            x_missing = (1 / n) Σ x_observed
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Replaces missing observations with the sample mean calculated strictly from observed training instances.
          </p>
        </div>

        {/* One-Hot Encoding */}
        <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">One-Hot Encoding</p>
          <div className="mt-2 rounded bg-white p-2 font-mono text-xs text-teal-800 text-center border border-slate-200">
            c_k ∈ &#123;0, 1&#125; indicator
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            Maps categorical levels to orthogonal basis vectors. Avoids imposing artificial numerical order on nominal classes.
          </p>
        </div>
      </div>
    </div>
  );
}
