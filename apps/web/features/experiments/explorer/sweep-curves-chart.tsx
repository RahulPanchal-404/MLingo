"use client";

import { useId, useState } from "react";
import type { TrainingRun } from "@/types/training-run";
import { formatNumber } from "@/features/x-ray/x-ray-helpers";

const RUN_COLORS = [
  "#38bdf8", // Sky blue
  "#34d399", // Emerald green
  "#f472b6", // Pink
  "#fbbf24", // Amber
  "#a78bfa", // Purple
  "#fb923c", // Orange
  "#60a5fa", // Indigo blue
];

export type CurveRunItem = {
  runId: string;
  parameterValue: number;
  parameterName: string;
  run: TrainingRun;
};

export type SweepCurvesChartProps = {
  runs: CurveRunItem[];
  metricLabel: string;
  selectedRunId?: string | null;
  onSelectRun?: (runId: string) => void;
};

export function SweepCurvesChart({
  runs,
  metricLabel,
  selectedRunId,
  onSelectRun,
}: SweepCurvesChartProps) {
  const chartId = useId();
  const [hiddenRunIds, setHiddenRunIds] = useState<Set<string>>(new Set());
  const [hoveredRunId, setHoveredRunId] = useState<string | null>(null);

  if (runs.length === 0) {
    return null;
  }

  const toggleRunVisibility = (id: string) => {
    setHiddenRunIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Prevent hiding all runs
        if (next.size < runs.length - 1) {
          next.add(id);
        }
      }
      return next;
    });
  };

  const visibleRuns = runs.filter((r) => !hiddenRunIds.has(r.runId));

  // Determine bounds
  let maxStep = 1;
  let minLoss = Infinity;
  let maxLoss = -Infinity;

  for (const item of runs) {
    const history = item.run.history;
    if (history.length > maxStep) maxStep = history.length;
    for (const st of history) {
      const loss = st.loss;
      if (Number.isFinite(loss)) {
        if (loss < minLoss) minLoss = loss;
        if (loss > maxLoss) maxLoss = loss;
      }
    }
  }

  if (!Number.isFinite(minLoss) || !Number.isFinite(maxLoss)) {
    minLoss = 0;
    maxLoss = 1;
  }
  if (minLoss === maxLoss) {
    minLoss = Math.max(0, minLoss - 1);
    maxLoss = maxLoss + 1;
  }

  const width = 540;
  const height = 240;
  const padding = { top: 25, right: 35, bottom: 45, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  const scaleX = (step: number) => padding.left + (step / Math.max(1, maxStep - 1)) * plotWidth;
  const scaleY = (loss: number) => padding.top + plotHeight - ((loss - minLoss) / (maxLoss - minLoss)) * plotHeight;

  // 4 Y-ticks
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minLoss + pct * (maxLoss - minLoss);
    return { val, y: scaleY(val) };
  });

  return (
    <div className="sweep-chart-container" aria-label={`Training curves comparison chart (${metricLabel})`}>
      <div className="chart-header">
        <h4>Training Curves Comparison</h4>
        <span className="chart-subtitle">{metricLabel} over frames</span>
      </div>

      {/* Interactive Legend / Run Toggles */}
      <div className="curves-legend" role="group" aria-label="Toggle visible training curves">
        {runs.map((item, idx) => {
          const color = RUN_COLORS[idx % RUN_COLORS.length];
          const isHidden = hiddenRunIds.has(item.runId);
          const isSelected = selectedRunId === item.runId;
          const isHovered = hoveredRunId === item.runId;

          return (
            <button
              key={item.runId}
              type="button"
              className={`legend-pill ${isHidden ? "pill-hidden" : ""} ${isSelected ? "pill-selected" : ""}`}
              onClick={() => toggleRunVisibility(item.runId)}
              onMouseEnter={() => setHoveredRunId(item.runId)}
              onMouseLeave={() => setHoveredRunId(null)}
              aria-pressed={!isHidden}
              title={`Toggle run with ${item.parameterName}=${item.parameterValue}`}
            >
              <span
                className="legend-color-dot"
                style={{ backgroundColor: isHidden ? "rgba(255, 255, 255, 0.3)" : color }}
              />
              <span>
                {item.parameterName}: {item.parameterValue}
              </span>
              {isHovered && <span className="pill-action-hint"> (click to toggle)</span>}
            </button>
          );
        })}
      </div>

      <svg
        className="sweep-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Overlay of ${visibleRuns.length} training curves`}
      >
        <defs>
          <clipPath id={`clip-${chartId}`}>
            <rect x={padding.left} y={padding.top} width={plotWidth} height={plotHeight} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {yTicks.map((tick, idx) => (
          <g key={idx}>
            <line
              x1={padding.left}
              y1={tick.y}
              x2={width - padding.right}
              y2={tick.y}
              stroke="rgba(255, 255, 255, 0.08)"
              strokeDasharray="3 3"
            />
            <text
              x={padding.left - 8}
              y={tick.y + 4}
              fill="rgba(255, 255, 255, 0.5)"
              fontSize="11"
              textAnchor="end"
            >
              {formatNumber(tick.val, 3)}
            </text>
          </g>
        ))}

        {/* Axes */}
        <line
          x1={padding.left}
          y1={padding.top + plotHeight}
          x2={width - padding.right}
          y2={padding.top + plotHeight}
          stroke="rgba(255, 255, 255, 0.2)"
        />
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={padding.top + plotHeight}
          stroke="rgba(255, 255, 255, 0.2)"
        />

        {/* X-axis labels */}
        {[0, Math.floor((maxStep - 1) / 2), maxStep - 1].map((step, idx) => (
          <text
            key={idx}
            x={scaleX(step)}
            y={padding.top + plotHeight + 18}
            fill="rgba(255, 255, 255, 0.6)"
            fontSize="11"
            textAnchor="middle"
          >
            Step {step}
          </text>
        ))}

        {/* Axis Titles */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 8}
          fill="rgba(255, 255, 255, 0.7)"
          fontSize="12"
          textAnchor="middle"
          fontWeight="500"
        >
          Training Step →
        </text>
        <text
          x={14}
          y={padding.top + plotHeight / 2}
          fill="rgba(255, 255, 255, 0.7)"
          fontSize="12"
          textAnchor="middle"
          transform={`rotate(-90 14 ${padding.top + plotHeight / 2})`}
          fontWeight="500"
        >
          {metricLabel} →
        </text>

        {/* Curves */}
        <g clipPath={`url(#clip-${chartId})`}>
          {runs.map((item, idx) => {
            if (hiddenRunIds.has(item.runId)) return null;

            const color = RUN_COLORS[idx % RUN_COLORS.length];
            const isHovered = hoveredRunId === item.runId;
            const isSelected = selectedRunId === item.runId;

            const history = item.run.history;
            const path = history
              .map((st, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(2)} ${scaleY(st.loss).toFixed(2)}`)
              .join(" ");

            return (
              <g
                key={item.runId}
                className="curve-series"
                onClick={() => onSelectRun && onSelectRun(item.runId)}
                onMouseEnter={() => setHoveredRunId(item.runId)}
                onMouseLeave={() => setHoveredRunId(null)}
                style={{ cursor: onSelectRun ? "pointer" : "default" }}
              >
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={isHovered || isSelected ? "3.5" : "2"}
                  opacity={isHovered || isSelected ? 1 : 0.85}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
