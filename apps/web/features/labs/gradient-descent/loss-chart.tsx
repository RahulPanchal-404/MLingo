import type { TrainingState } from "@/types/training-run";
import { EmptyChart } from "@/features/labs/gradient-descent/regression-plot";

export function LossChart({ history, currentStep, label = "MSE" }: { history: TrainingState[]; currentStep: number; label?: string }) {
  if (history.length === 0) return <EmptyChart message="Loss history will appear after training." />;
  const width = 640; const height = 210; const pad = 28; const losses = history.map((state) => state.loss); const min = Math.min(...losses); const max = Math.max(...losses);
  const x = (index: number) => pad + (index / Math.max(history.length - 1, 1)) * (width - pad * 2);
  const y = (value: number) => height - pad - ((value - min) / (max - min || 1)) * (height - pad * 2);
  const line = history.map((state, index) => `${x(index)},${y(state.loss)}`).join(" "); const active = history[currentStep] ?? history[0]; const selectedStep = Math.min(Math.max(currentStep, 0), history.length - 1);
  return <figure className="lab-chart loss-chart"><figcaption>Loss over time <span>{label}</span></figcaption><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label} history with current training step`}><polyline className="loss-line" points={line} /><line className="playhead-line" x1={x(selectedStep)} y1={pad} x2={x(selectedStep)} y2={height - pad} /><circle className="loss-dot" cx={x(selectedStep)} cy={y(active.loss)} r="5" /></svg><p>Step {active.step} · loss {formatNumber(active.loss)}</p></figure>;
}

function formatNumber(value: number) { return value.toLocaleString(undefined, { maximumFractionDigits: 5 }); }
