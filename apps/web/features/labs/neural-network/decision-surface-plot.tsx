"use client";

import { useMemo } from "react";
import type { DatasetPoint, TrainingState } from "@/types/training-run";
import { evaluateDecisionGrid } from "./math";

export type DecisionSurfacePlotProps = {
  points: Pick<DatasetPoint, "x1" | "x2" | "label">[];
  state: TrainingState | null;
  resolution?: number;
};

export function DecisionSurfacePlot({ points, state, resolution = 28 }: DecisionSurfacePlotProps) {
  const validPoints = useMemo(() => {
    return points.filter(
      (p): p is { x1: number; x2: number; label: number } =>
        Number.isFinite(p.x1) && Number.isFinite(p.x2) && Number.isFinite(p.label)
    );
  }, [points]);

  const bounds = useMemo(() => {
    if (validPoints.length === 0) {
      return { minX: -2.5, maxX: 2.5, minY: -2.5, maxY: 2.5 };
    }
    const x1Vals = validPoints.map((p) => p.x1);
    const x2Vals = validPoints.map((p) => p.x2);
    const marginX = 0.5;
    const marginY = 0.5;
    return {
      minX: Math.min(...x1Vals) - marginX,
      maxX: Math.max(...x1Vals) + marginX,
      minY: Math.min(...x2Vals) - marginY,
      maxY: Math.max(...x2Vals) + marginY,
    };
  }, [validPoints]);

  const grid = useMemo(() => {
    if (!state?.w1 || !state?.b1 || !state?.w2 || state?.b2 == null) {
      return null;
    }
    return evaluateDecisionGrid(state.w1, state.b1, state.w2, state.b2, bounds, resolution);
  }, [state, bounds, resolution]);

  if (!state || validPoints.length === 0) {
    return (
      <figure className="lab-chart">
        <figcaption>Nonlinear Decision Surface</figcaption>
        <div className="empty-chart">Waiting for recorded neural network frames...</div>
      </figure>
    );
  }

  const pad = 36;
  const width = 640;
  const height = 340;
  const chartW = width - pad * 2;
  const chartH = height - pad * 2;

  const toX = (val: number) =>
    pad + ((val - bounds.minX) / (bounds.maxX - bounds.minX || 1)) * chartW;
  const toY = (val: number) =>
    height - pad - ((val - bounds.minY) / (bounds.maxY - bounds.minY || 1)) * chartH;

  const cellW = chartW / (resolution - 1 || 1);
  const cellH = chartH / (resolution - 1 || 1);
  const clipId = `neural-surface-clip-${state.step}`;

  return (
    <figure className="lab-chart" aria-label="Neural Network Decision Surface">
      <figcaption>
        <span>Decision surface (P(y=1))</span>
        <span className="step-badge">Step {state.step}</span>
      </figcaption>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Scatter plot with neural network nonlinear probability surface"
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={pad} y={pad} width={chartW} height={chartH} />
          </clipPath>
        </defs>

        {/* Axis background frame */}
        <rect
          x={pad}
          y={pad}
          width={chartW}
          height={chartH}
          fill="var(--color-surface-sunken, #0f172a)"
          stroke="var(--color-border, rgba(255, 255, 255, 0.1))"
        />

        {/* Probability Heatmap / Grid Cells */}
        {grid && (
          <g clipPath={`url(#${clipId})`}>
            {grid.cells.map((cell, idx) => {
              const cx = toX(cell.x1);
              const cy = toY(cell.x2);
              const p = Math.max(0, Math.min(1, cell.probability));

              // Blend color: Blue (Class 0: rgba(59, 130, 246)) to Amber/Pink (Class 1: rgba(245, 158, 11))
              const r = Math.round(59 + (245 - 59) * p);
              const g = Math.round(130 + (158 - 130) * p);
              const b = Math.round(246 + (11 - 246) * p);
              // Slight contour emphasis near 0.5
              const isBoundary = Math.abs(p - 0.5) < 0.04;
              const alpha = isBoundary ? 0.65 : 0.32;

              return (
                <rect
                  key={idx}
                  x={cx - cellW / 2}
                  y={cy - cellH / 2}
                  width={cellW + 0.5}
                  height={cellH + 0.5}
                  fill={`rgba(${r}, ${g}, ${b}, ${alpha})`}
                />
              );
            })}
          </g>
        )}

        {/* Axes */}
        <line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} />
        <line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />

        {/* Data points */}
        <g clipPath={`url(#${clipId})`}>
          {validPoints.map((point, index) => {
            const isClassOne = point.label === 1;
            return (
              <circle
                key={`${point.x1}-${point.x2}-${index}`}
                className={isClassOne ? "class-one-point" : "class-zero-point"}
                cx={toX(point.x1)}
                cy={toY(point.x2)}
                r="4.5"
                stroke="#ffffff"
                strokeWidth="1"
              />
            );
          })}
        </g>
      </svg>

      <div className="surface-legend">
        <span className="legend-item">
          <span className="legend-dot class-zero-dot" /> Class 0 (y=0)
        </span>
        <span className="legend-item">
          <span className="legend-boundary-bar" /> Decision Region (p ≈ 0.5)
        </span>
        <span className="legend-item">
          <span className="legend-dot class-one-dot" /> Class 1 (y=1)
        </span>
      </div>
      <p>
        Colored field shows the forward sigmoid output P(y=1|x). The boundary curves smoothly as hidden neurons combine features.
      </p>
    </figure>
  );
}
