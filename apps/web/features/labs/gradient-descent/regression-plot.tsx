import type { DatasetPoint, TrainingState } from "@/types/training-run";

type RegressionPlotProps = { points: DatasetPoint[]; state: TrainingState | null };

export function RegressionPlot({ points, state }: RegressionPlotProps) {
  if (!state || points.length === 0) return <EmptyChart message="No training state is available to plot yet." />;
  const xValues = points.map((point) => point.feature);
  const xMin = Math.min(...xValues); const xMax = Math.max(...xValues);
  const lineValues = [xMin, xMax].map((feature) => state.weights[0] * feature + state.bias);
  const yValues = [...points.map((point) => point.target), ...lineValues];
  const yMin = Math.min(...yValues); const yMax = Math.max(...yValues);
  const pad = 36; const width = 640; const height = 340;
  const toX = (value: number) => pad + ((value - xMin) / (xMax - xMin || 1)) * (width - pad * 2);
  const toY = (value: number) => height - pad - ((value - yMin) / (yMax - yMin || 1)) * (height - pad * 2);
  return <figure className="lab-chart"><figcaption>Regression fit <span>step {state.step}</span></figcaption><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Dataset points and current regression line"><line className="chart-axis" x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} /><line className="chart-axis" x1={pad} y1={pad} x2={pad} y2={height - pad} /><line className="fit-line" x1={toX(xMin)} y1={toY(lineValues[0])} x2={toX(xMax)} y2={toY(lineValues[1])} />{points.map((point, index) => <circle className="data-point" cx={toX(point.feature)} cy={toY(point.target)} key={`${point.feature}-${index}`} r="4" />)}</svg><p>Points are the exact dataset used for this training run. The line uses the selected state&apos;s weight and bias.</p></figure>;
}

export function EmptyChart({ message }: { message: string }) { return <div className="lab-chart empty-chart">{message}</div>; }
