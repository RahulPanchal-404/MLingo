export function RocCurveChart({
  rocPoints,
  auc,
  currentThresholdFpr,
  currentThresholdTpr,
}: {
  rocPoints: Array<{ fpr: number; tpr: number }>;
  auc: number;
  currentThresholdFpr?: number;
  currentThresholdTpr?: number;
}) {
  const width = 260;
  const height = 220;
  const padding = 35;

  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const toSvgX = (fpr: number) => padding + fpr * plotW;
  const toSvgY = (tpr: number) => padding + (1 - tpr) * plotH;

  const pathD =
    rocPoints.length > 0
      ? `M ${toSvgX(rocPoints[0].fpr)} ${toSvgY(rocPoints[0].tpr)} ` +
        rocPoints.slice(1).map((p) => `L ${toSvgX(p.fpr)} ${toSvgY(p.tpr)}`).join(" ")
      : "";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col items-center">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">ROC Curve</h4>
          <p className="text-[11px] text-slate-500">
            ROC shows how the classifier behaves as we change the decision threshold.
          </p>
        </div>
        <div className="rounded bg-teal-50 px-2 py-0.5 border border-teal-200 text-teal-800 text-xs font-mono font-bold">
          AUC: {auc.toFixed(3)}
        </div>
      </div>

      <svg width={width} height={height} className="overflow-visible select-none">
        {/* Axes */}
        <line
          x1={padding}
          y1={padding + plotH}
          x2={padding + plotW}
          y2={padding + plotH}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={padding + plotH}
          stroke="#cbd5e1"
          strokeWidth="1.5"
        />

        {/* Diagonal chance line */}
        <line
          x1={padding}
          y1={padding + plotH}
          x2={padding + plotW}
          y2={padding}
          stroke="#e2e8f0"
          strokeWidth="1.5"
          strokeDasharray="3 3"
        />

        {/* ROC Path */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#0d9488"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Current Operating Point */}
        {currentThresholdFpr !== undefined && currentThresholdTpr !== undefined && (
          <circle
            cx={toSvgX(currentThresholdFpr)}
            cy={toSvgY(currentThresholdTpr)}
            r={5}
            fill="#0f766e"
            stroke="#ffffff"
            strokeWidth={2}
          />
        )}

        {/* Axis Labels */}
        <text
          x={padding + plotW / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="10"
          className="fill-slate-500 font-sans"
        >
          FPR (1 - Specificity)
        </text>
        <text
          x={10}
          y={padding + plotH / 2}
          textAnchor="middle"
          fontSize="10"
          transform={`rotate(-90 10 ${padding + plotH / 2})`}
          className="fill-slate-500 font-sans"
        >
          TPR (Sensitivity / Recall)
        </text>

        {/* Scale labels */}
        <text x={padding} y={padding + plotH + 12} fontSize="9" textAnchor="middle" className="fill-slate-400 font-mono">
          0
        </text>
        <text x={padding + plotW} y={padding + plotH + 12} fontSize="9" textAnchor="middle" className="fill-slate-400 font-mono">
          1
        </text>
        <text x={padding - 6} y={padding + plotH} fontSize="9" textAnchor="end" className="fill-slate-400 font-mono">
          0
        </text>
        <text x={padding - 6} y={padding + 4} fontSize="9" textAnchor="end" className="fill-slate-400 font-mono">
          1
        </text>
      </svg>
    </div>
  );
}
