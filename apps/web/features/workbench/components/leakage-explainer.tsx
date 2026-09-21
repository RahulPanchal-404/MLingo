export function LeakageExplainer() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-100 p-2 text-amber-800 shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950">
            Why Split Before Fitting Preprocessing? (Preventing Data Leakage)
          </h3>
          <div className="mt-2 space-y-2 text-xs text-amber-900 leading-relaxed">
            <p>
              In real-world inference, test data is completely unknown when training the model. If you compute scaling
              statistics (such as mean <span className="font-mono">μ</span>, standard deviation <span className="font-mono">σ</span>, or min/max bounds) or imputation values across the <em>entire</em> dataset before splitting, information from the test partition leaks into the training pipeline.
            </p>
            <p>
              <strong>The Golden Rule of Machine Learning Pipelines:</strong>
            </p>
            <div className="rounded bg-white/80 p-2.5 font-mono text-[11px] text-amber-950 border border-amber-200/60">
              1. Split dataset into Train and Test partitions.
              <br />
              2. Fit scaler / imputer on Training partition ONLY.
              <br />
              3. Transform Training partition using those fitted parameters.
              <br />
              4. Transform Test partition using the exact same Training parameters.
            </div>
            <p className="text-[11px] text-amber-800">
              MLingo strictly enforces this: scaling and imputation parameters are never computed from test examples.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
