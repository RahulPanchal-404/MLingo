"use client";

import { useId, useState } from "react";
import { formatNumber } from "@/features/x-ray/x-ray-helpers";

export type ParameterMetricPoint = {
  runId: string;
  parameterValue: number;
  metricValue: number;
  metricLabel: string;
  status: "completed" | "failed";
  error?: string;
};

export type ParameterMetricChartProps = {
  points: ParameterMetricPoint[];
  parameterName: string;
  metricLabel: string;
  selectedRunId?: string | null;
  onSelectRun?: (runId: string) => void;
};

export function ParameterMetricChart({
  points,
  parameterName,
  metricLabel,
  selectedRunId,
  onSelectRun,
}: ParameterMetricChartProps) {
  const chartId = useId();
  const [hoveredPoint, setHoveredPoint] = useState<ParameterMetricPoint | null>(null);

  const completedPoints = points.filter((p) => p.status === "completed");

  if (completedPoints.length === 0) {
    return (
      <div className="empty-chart-box">
        <p>No completed runs available to plot.</p>
      </div>
    );
  }

  // Dimensions
  const width = 540;
  const height = 240;
  const padding = { top: 30, right: 35, bottom: 45, left: 60 };
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // X range
  const xValues = completedPoints.map((p) => p.parameterValue);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const xSpan = maxX === minX ? 1 : maxX - minX;

  // Y range
  const yValues = completedPoints.map((p) => p.metricValue);
  let minY = Math.min(...yValues);
  let maxY = Math.max(...yValues);
  if (minY === maxY) {
    minY = Math.max(0, minY - 1);
    maxY = maxY + 1;
  }
  const ySpan = maxY - minY;

  const scaleX = (val: number) => padding.left + ((val - minX) / xSpan) * plotWidth;
  const scaleY = (val: number) => padding.top + plotHeight - ((val - minY) / ySpan) * plotHeight;

  // Sort points by parameter value for continuous line
  const sorted = [...completedPoints].sort((a, b) => a.parameterValue - b.parameterValue);
  const linePath = sorted
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.parameterValue).toFixed(2)} ${scaleY(p.metricValue).toFixed(2)}`)
    .join(" ");

  // Generate 4 Y-ticks
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = minY + pct * ySpan;
    return { val, y: scaleY(val) };
  });

  return (
    <div className="sweep-chart-container" aria-label={`${parameterName} versus ${metricLabel} chart`}>
      <div className="chart-header">
        <h4>{parameterName} vs Final {metricLabel}</h4>
        <span className="chart-subtitle">{completedPoints.length} data points</span>
      </div>

      <svg
        className="sweep-svg"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${parameterName} versus final ${metricLabel}`}
      >
        <defs>
          <linearGradient id={`lineGrad-${chartId}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
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
        {sorted.map((p, idx) => {
          const x = scaleX(p.parameterValue);
          return (
            <text
              key={idx}
              x={x}
              y={padding.top + plotHeight + 18}
              fill="rgba(255, 255, 255, 0.6)"
              fontSize="11"
              textAnchor="middle"
            >
              {p.parameterValue}
            </text>
          );
        })}

        {/* Axis Titles */}
        <text
          x={padding.left + plotWidth / 2}
          y={height - 8}
          fill="rgba(255, 255, 255, 0.7)"
          fontSize="12"
          textAnchor="middle"
          fontWeight="500"
        >
          {parameterName} →
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

        {/* Trend line */}
        {sorted.length > 1 && (
          <path
            d={linePath}
            fill="none"
            stroke={`url(#lineGrad-${chartId})`}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {sorted.map((p) => {
          const cx = scaleX(p.parameterValue);
          const cy = scaleY(p.metricValue);
          const isSelected = selectedRunId === p.runId;
          const isHovered = hoveredPoint?.runId === p.runId;

          return (
            <g
              key={p.runId}
              className="chart-point-group"
              onClick={() => {
                if (onSelectRun) onSelectRun(p.runId);
              }}
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: onSelectRun ? "pointer" : "default" }}
              tabIndex={0}
              role="button"
              aria-label={`${parameterName}: ${p.parameterValue}, ${metricLabel}: ${formatNumber(p.metricValue)}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  if (onSelectRun) onSelectRun(p.runId);
                }
              }}
            >
              {/* Outer halo when active or hovered */}
              {(isSelected || isHovered) && (
                <circle cx={cx} cy={cy} r="10" fill="#38bdf8" opacity="0.3" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isSelected ? "6" : "4.5"}
                fill={isSelected ? "#38bdf8" : "#818cf8"}
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>

      {/* Dynamic tooltip box */}
      <div className="chart-tooltip-status">
        {hoveredPoint ? (
          <span>
            <strong>{parameterName}:</strong> {hoveredPoint.parameterValue} &nbsp;|&nbsp;{" "}
            <strong>Final {metricLabel}:</strong> {formatNumber(hoveredPoint.metricValue, 5)}
          </span>
        ) : (
          <span className="tooltip-hint">Hover or click a data point to inspect that run</span>
        )}
      </div>
    </div>
  );
}
