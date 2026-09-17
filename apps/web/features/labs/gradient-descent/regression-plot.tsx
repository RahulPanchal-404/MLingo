import { useId } from "react";

import type { DatasetPoint, TrainingState } from "@/types/training-run";

export type RegressionYDomain = { min: number; max: number };

type RegressionPlotProps = { points: DatasetPoint[]; state: TrainingState | null; yDomain?: RegressionYDomain };

function safeDomain(values: Array<number | undefined>): RegressionYDomain {
  const finiteValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (finiteValues.length === 0) return { min: 0, max: 1 };
  return { min: Math.min(...finiteValues), max: Math.max(...finiteValues) };
}

function getDatasetXDomain(points: DatasetPoint[]): [number, number] {
  const xDomain = safeDomain(points.map((point) => Number(point.feature)));
  return [xDomain.min, xDomain.max];
}

export function getDatasetYDomain(points: DatasetPoint[]): RegressionYDomain {
  return safeDomain(points.map((point) => Number(point.target)));
}

export function getRunYDomain(points: DatasetPoint[], history: TrainingState[]): RegressionYDomain {
  const [xMin, xMax] = getDatasetXDomain(points);
  const lineValues = history.flatMap((trainingState) => {
    const weight = trainingState.weights[0];
    const bias = trainingState.bias;
    if (!Number.isFinite(weight) || !Number.isFinite(bias)) return [];
    return [weight * xMin + bias, weight * xMax + bias];
  });
  return safeDomain([...points.map((point) => point.target), ...lineValues]);
}

export function getPlotYCoordinate(value: number, domain: RegressionYDomain): number {
  const pad = 36; const height = 340;
  return height - pad - ((value - domain.min) / (domain.max - domain.min || 1)) * (height - pad * 2);
}

export function RegressionPlot({ points, state, yDomain }: RegressionPlotProps) {
  const clipPathId = useId().replaceAll(":", "");
  if (!state || points.length === 0) return <EmptyChart message="No training state is available to plot yet." />;
  const [xMin, xMax] = getDatasetXDomain(points);
  const lineValues = [xMin, xMax].map((feature) => (Number(state.weights[0]) ?? 0) * feature + Number(state.bias));
  const plotYDomain = yDomain && Number.isFinite(yDomain.min) && Number.isFinite(yDomain.max) ? yDomain : getDatasetYDomain(points);
  const pad = 36; const width = 640; const height = 340;
  const toX = (value: number) => pad + ((value - xMin) / (xMax - xMin || 1)) * (width - pad * 2);
  const toY = (value: number) => getPlotYCoordinate(value, plotYDomain);
  const hasFiniteLine = lineValues.every(Number.isFinite);
  return <figure className="lab-chart"><figcaption>Regression fit <span>step {state.step}</span></figcaption><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Dataset points and current regression line"><defs><clipPath id={clipPathId}><rect x={pad} y={pad} width={width - pad * 2} height={height - pad * 2} /></clipPath></defs><line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} /><line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} />{hasFiniteLine && <line clipPath={`url(#${clipPathId})`} className="fit-line" x1={toX(xMin)} y1={toY(lineValues[0])} x2={toX(xMax)} y2={toY(lineValues[1])} />}{points.map((point, index) => {
    const feature = Number(point.feature);
    const target = Number(point.target);
    return Number.isFinite(feature) && Number.isFinite(target) && <circle className="data-point" cx={toX(feature)} cy={toY(target)} key={`${feature}-${index}`} r="4" />;
  })}</svg><p>Points are the exact dataset used for this training run. The line uses the selected state&apos;s weight and bias.</p></figure>;
}

export function EmptyChart({ message }: { message: string }) { return <div className="lab-chart empty-chart">{message}</div>; }
