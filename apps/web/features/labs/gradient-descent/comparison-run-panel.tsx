import { LossChart } from "@/features/labs/gradient-descent/loss-chart";
import { RegressionPlot } from "@/features/labs/gradient-descent/regression-plot";
import { getFrameChanges } from "@/features/timeline/frame-changes";
import type { TrainingRun, TrainingState } from "@/types/training-run";

type ComparisonRunPanelProps = {
      label: "Run A" | "Run B";
      run: TrainingRun;
      state: TrainingState | null;
      currentStep: number;
};

export function ComparisonRunPanel({ label, run, state, currentStep }: ComparisonRunPanelProps) {
      const changes = getFrameChanges(run.history, currentStep);
      return (
            <section aria-label={`${label} comparison`} className={`comparison-run-panel ${label === "Run A" ? "run-a" : "run-b"}`}>
                  <div className="comparison-run-heading">
                        <div>
                              <p className="eyebrow">{label}</p>
                              <h2>{run.algorithm}</h2>
                        </div>
                        <span>{run.history.length} frames</span>
                  </div>
                  <dl className="run-configuration">
                        <div><dt>Learning rate</dt><dd>{run.training.learning_rate}</dd></div>
                        <div><dt>Samples</dt><dd>{run.dataset.samples}</dd></div>
                        <div><dt>Noise</dt><dd>{run.dataset.noise}</dd></div>
                  </dl>
                  <div className="comparison-charts">
                        <RegressionPlot points={run.dataset_points} state={state} />
                        <LossChart currentStep={currentStep} history={run.history} />
                  </div>
                  <div className="comparison-state">
                        <div>
                              <p className="eyebrow">Selected state</p>
                              <h3>{state ? `Step ${state.step}` : "No state available"}</h3>
                        </div>
                        {state ? <dl className="comparison-metrics">
                              <Metric change={changes?.weight} label="Weight" value={state.weights[0]} />
                              <Metric change={changes?.bias} label="Bias" value={state.bias} />
                              <Metric change={changes?.loss} label="Loss / MSE" value={state.metrics.mean_squared_error} />
                              <Metric change={changes?.gradient} label="Weight gradient" value={state.gradients[0]} />
                              <Metric label="Bias gradient" value={state.bias_gradient} />
                        </dl> : <p className="empty-state">This run has no state at the shared frame.</p>}
                  </div>
            </section>
      );
}

function Metric({ label, value, change }: { label: string; value: number | null | undefined; change?: number }) {
      return <div><dt>{label}</dt><dd>{formatNumber(value)}</dd><small>{change === undefined ? "No previous frame." : formatDelta(change)}</small></div>;
}

function formatNumber(value: number | null | undefined): string {
      if (value == null) return "N/A";
      return value.toLocaleString(undefined, { maximumFractionDigits: 5 });
}

function formatDelta(value: number): string {
      return `${value >= 0 ? "+" : ""}${formatNumber(value)}`;
}
