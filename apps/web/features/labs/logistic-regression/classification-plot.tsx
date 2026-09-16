import type { DatasetPoint, TrainingState } from "@/types/training-run";

export type ClassificationPlotPoint = Pick<DatasetPoint, "x1" | "x2" | "label">;

type ClassificationPlotProps = { points: ClassificationPlotPoint[]; state: TrainingState | null };

export function getDecisionBoundary(points: ClassificationPlotPoint[], state: TrainingState | null): { x1: number; x2: number }[] {
      if (!state || points.length === 0) return [];
      const finitePoints = points.filter((point): point is { x1: number; x2: number; label?: number } => Number.isFinite(point.x1) && Number.isFinite(point.x2));
      if (finitePoints.length === 0 || !Number.isFinite(state.weights[0]) || !Number.isFinite(state.weights[1]) || !Number.isFinite(state.bias)) return [];
      const x1Values = finitePoints.map((point) => point.x1);
      const x1Min = Math.min(...x1Values); const x1Max = Math.max(...x1Values);
      const weightTwo = state.weights[1];
      if (Math.abs(weightTwo) < 1e-10) return [];
      return [x1Min, x1Max].map((x1) => ({ x1, x2: -(state.weights[0] * x1 + state.bias) / weightTwo }));
}

export function ClassificationPlot({ points, state }: ClassificationPlotProps) {
      if (!state || points.length === 0) return <div className="lab-chart empty-chart">No classification state is available to plot yet.</div>;
      const validPoints = points.filter((point): point is { x1: number; x2: number; label: number } => Number.isFinite(point.x1) && Number.isFinite(point.x2) && Number.isFinite(point.label));
      if (validPoints.length === 0) return <div className="lab-chart empty-chart">No classification points are available to plot yet.</div>;
      const x1Values = validPoints.map((point) => point.x1); const x2Values = validPoints.map((point) => point.x2);
      const x1Min = Math.min(...x1Values); const x1Max = Math.max(...x1Values); const x2Min = Math.min(...x2Values); const x2Max = Math.max(...x2Values);
      const pad = 36; const width = 640; const height = 340;
      const toX = (value: number) => pad + ((value - x1Min) / (x1Max - x1Min || 1)) * (width - pad * 2);
      const toY = (value: number) => height - pad - ((value - x2Min) / (x2Max - x2Min || 1)) * (height - pad * 2);
      const boundary = getDecisionBoundary(validPoints, state);
      const clipId = `classification-plot-${state.step}`;
      return <figure className="lab-chart"><figcaption>Decision boundary <span>step {state.step}</span></figcaption><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Classification points and current decision boundary"><defs><clipPath id={clipId}><rect x={pad} y={pad} width={width - pad * 2} height={height - pad * 2} /></clipPath></defs><line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} /><line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />{boundary.length === 2 && <line className="decision-boundary" clipPath={`url(#${clipId})`} x1={toX(boundary[0].x1)} y1={toY(boundary[0].x2)} x2={toX(boundary[1].x1)} y2={toY(boundary[1].x2)} />}{validPoints.map((point, index) => <circle className={point.label === 1 ? "class-one-point" : "class-zero-point"} cx={toX(point.x1)} cy={toY(point.x2)} key={`${point.x1}-${point.x2}-${index}`} r="4" />)}</svg><p>Points stay fixed. The boundary uses the selected state&apos;s two weights and bias.</p></figure>;
}