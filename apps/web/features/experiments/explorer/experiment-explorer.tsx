"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { createTrainingRun } from "@/features/labs/gradient-descent/api";
import { SaveExperimentButton } from "@/features/experiments/save-experiment-button";
import { setLabHandoffRun } from "@/features/experiments/experiment-storage";
import { readLearningActivity, recordLearningActivity } from "@/features/progress/activity";
import { formatNumber } from "@/features/x-ray/x-ray-helpers";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";
import {
  MAX_SWEEP_RUNS,
  SWEEP_PARAMETERS,
  buildSweepRequest,
  extractSweepMetric,
  generateSweepInsights,
  validateAndGenerateSweepValues,
} from "./sweep-engine";
import { ParameterMetricChart, type ParameterMetricPoint } from "./parameter-metric-chart";
import { SweepCurvesChart, type CurveRunItem } from "./sweep-curves-chart";
import type { ExperimentSweep, SweepRun } from "./types";

export type ExperimentExplorerProps = {
  onInspectRun?: (run: TrainingRun) => void;
  inspectedRunId?: string | null;
};

const defaultBaseRequests: Record<TrainingRunRequest["algorithm"], TrainingRunRequest> = {
  linear_regression: {
    algorithm: "linear_regression",
    dataset: { samples: 32, slope: 2, intercept: 1, noise: 0, seed: 0 },
    training: { learning_rate: 0.1, epochs: 40, initial_weight: 0, initial_bias: 0 },
  },
  logistic_regression: {
    algorithm: "logistic_regression",
    dataset: { samples: 48, noise: 0.1, seed: 0 },
    training: { learning_rate: 0.1, epochs: 40, initial_weight: 0, initial_bias: 0 },
  },
  kmeans: {
    algorithm: "kmeans",
    dataset: { samples: 45, noise: 0.1, seed: 0 },
    training: { learning_rate: 0.1, epochs: 12, initial_weight: 0, initial_bias: 0, clusters: 3, iterations: 12, seed: 0 },
  },
};

export function ExperimentExplorer({ onInspectRun, inspectedRunId }: ExperimentExplorerProps) {
  const [algorithm, setAlgorithm] = useState<TrainingRunRequest["algorithm"]>("linear_regression");
  const paramDef = SWEEP_PARAMETERS[algorithm];

  const [startValue, setStartValue] = useState<number>(paramDef.defaultStart);
  const [endValue, setEndValue] = useState<number>(paramDef.defaultEnd);
  const [stepValue, setStepValue] = useState<number>(paramDef.defaultStep);

  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<{ current: number; total: number; value: number } | null>(null);
  const [currentSweep, setCurrentSweep] = useState<ExperimentSweep | null>(null);
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [sweepError, setSweepError] = useState<string | null>(null);

  const progressStatusId = useId();

  // Validate range & calculate expected runs live
  const validation = useMemo(() => {
    return validateAndGenerateSweepValues(startValue, endValue, stepValue, paramDef.isInteger, MAX_SWEEP_RUNS);
  }, [startValue, endValue, stepValue, paramDef.isInteger]);

  const handleAlgorithmChange = (nextAlgo: TrainingRunRequest["algorithm"]) => {
    setAlgorithm(nextAlgo);
    const nextDef = SWEEP_PARAMETERS[nextAlgo];
    setStartValue(nextDef.defaultStart);
    setEndValue(nextDef.defaultEnd);
    setStepValue(nextDef.defaultStep);
    setSweepError(null);
  };

  const executeSweep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validation.isValid || validation.previewValues.length === 0) return;

    setIsSweeping(true);
    setSweepError(null);
    setSelectedRunId(null);

    const valuesToRun = validation.previewValues;
    const baseRequest = defaultBaseRequests[algorithm];
    const completedRuns: SweepRun[] = [];

    for (let i = 0; i < valuesToRun.length; i++) {
      const val = valuesToRun[i];
      setSweepProgress({ current: i + 1, total: valuesToRun.length, value: val });

      const request = buildSweepRequest(baseRequest, paramDef.key, val);
      try {
        const run = await createTrainingRun(request);
        completedRuns.push({
          id: `sweep-${run.id}`,
          parameterName: paramDef.label,
          parameterValue: val,
          trainingRun: run,
          status: "completed",
        });

        // Record individual run activity
        try {
          const act = readLearningActivity();
          recordLearningActivity({ experimentsRun: act.experimentsRun + 1 });
        } catch {
          // ignore
        }
      } catch (caught) {
        completedRuns.push({
          id: `sweep-err-${i}-${val}`,
          parameterName: paramDef.label,
          parameterValue: val,
          trainingRun: null,
          status: "failed",
          error: caught instanceof Error ? caught.message : "Run execution failed.",
        });
      }
    }

    const newSweep: ExperimentSweep = {
      id: `sweep-${Date.now()}`,
      algorithm,
      parameterKey: paramDef.key,
      parameterName: paramDef.label,
      startValue,
      endValue,
      stepValue,
      baseRequest,
      runs: completedRuns,
      createdAt: new Date().toISOString(),
    };

    setCurrentSweep(newSweep);
    setIsSweeping(false);
    setSweepProgress(null);

    // Track sweep progress
    const successfulCount = completedRuns.filter((r) => r.status === "completed").length;
    if (successfulCount > 0) {
      try {
        const act = readLearningActivity();
        recordLearningActivity({ sweepsCompleted: (act.sweepsCompleted ?? 0) + 1 });
      } catch {
        // safe fallback
      }

      // Auto-inspect the first successful run
      const firstSuccess = completedRuns.find((r) => r.status === "completed");
      if (firstSuccess && firstSuccess.trainingRun) {
        setSelectedRunId(firstSuccess.trainingRun.id);
        if (onInspectRun) {
          onInspectRun(firstSuccess.trainingRun);
        }
      }
    } else {
      setSweepError("All experiments in this sweep failed. Check backend connection.");
    }
  };

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    if (!currentSweep || !onInspectRun) return;

    const item = currentSweep.runs.find(
      (r) => r.trainingRun?.id === runId || r.id === runId
    );
    if (item && item.trainingRun) {
      onInspectRun(item.trainingRun);
      // Smooth scroll to inspection section
      const inspectionEl = document.querySelector(".recorded-experiment");
      if (inspectionEl) {
        inspectionEl.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleOpenInLab = (run: TrainingRun) => {
    setLabHandoffRun(run);
  };

  const getLabHref = (algo: string) => {
    const a = algo.toLowerCase();
    if (a.startsWith("logistic")) return "/labs/logistic-regression";
    if (a.startsWith("kmeans")) return "/labs/k-means";
    return "/labs/gradient-descent";
  };

  // Prepare chart data
  const metricLabel = algorithm === "kmeans" ? "Inertia" : algorithm.startsWith("logistic") ? "BCE" : "MSE";

  const chartPoints: ParameterMetricPoint[] = useMemo(() => {
    if (!currentSweep) return [];
    return currentSweep.runs.map((r) => {
      const metric = r.trainingRun ? extractSweepMetric(r.trainingRun) : { label: metricLabel, value: 0 };
      return {
        runId: r.trainingRun?.id || r.id,
        parameterValue: r.parameterValue,
        metricValue: metric.value,
        metricLabel: metric.label,
        status: r.status,
        error: r.error,
      };
    });
  }, [currentSweep, metricLabel]);

  const curveRuns: CurveRunItem[] = useMemo(() => {
    if (!currentSweep) return [];
    return currentSweep.runs
      .filter((r) => r.status === "completed" && r.trainingRun)
      .map((r) => ({
        runId: r.trainingRun!.id,
        parameterValue: r.parameterValue,
        parameterName: paramDef.label,
        run: r.trainingRun!,
      }));
  }, [currentSweep, paramDef.label]);

  const sweepInsights = useMemo(() => {
    return currentSweep ? generateSweepInsights(currentSweep) : [];
  }, [currentSweep]);

  return (
    <section className="experiment-explorer-section" aria-label="Experiment Explorer">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Controlled Parameter Sweeps</p>
          <h2>Experiment Explorer</h2>
          <p>
            Vary one parameter across multiple real training runs and observe how training dynamics change.
          </p>
        </div>
        <span className="max-runs-pill">Max 7 runs per sweep</span>
      </div>

      {/* Sweep Configuration Form */}
      <form className="sweep-config-form" onSubmit={executeSweep}>
        <div className="sweep-form-grid">
          <label className="number-control">
            <span>Algorithm</span>
            <select
              aria-label="Algorithm for sweep"
              value={algorithm}
              disabled={isSweeping}
              onChange={(e) => handleAlgorithmChange(e.target.value as TrainingRunRequest["algorithm"])}
            >
              <option value="linear_regression">Linear Regression</option>
              <option value="logistic_regression">Logistic Regression</option>
              <option value="kmeans">K-Means Clustering</option>
            </select>
          </label>

          <label className="number-control">
            <span>Parameter to vary</span>
            <input
              type="text"
              value={paramDef.label}
              disabled
              aria-label="Swept parameter"
              className="read-only-input"
            />
          </label>

          <label className="number-control">
            <span>Start value</span>
            <input
              type="number"
              step={paramDef.isInteger ? "1" : "0.001"}
              min={paramDef.min}
              max={paramDef.max}
              value={startValue}
              disabled={isSweeping}
              aria-label="Sweep start value"
              onChange={(e) => setStartValue(Number(e.target.value))}
              required
            />
          </label>

          <label className="number-control">
            <span>End value</span>
            <input
              type="number"
              step={paramDef.isInteger ? "1" : "0.001"}
              min={paramDef.min}
              max={paramDef.max}
              value={endValue}
              disabled={isSweeping}
              aria-label="Sweep end value"
              onChange={(e) => setEndValue(Number(e.target.value))}
              required
            />
          </label>

          <label className="number-control">
            <span>Step size</span>
            <input
              type="number"
              step={paramDef.isInteger ? "1" : "0.001"}
              min={paramDef.isInteger ? "1" : "0.001"}
              max={paramDef.max}
              value={stepValue}
              disabled={isSweeping}
              aria-label="Sweep step size"
              onChange={(e) => setStepValue(Number(e.target.value))}
              required
            />
          </label>
        </div>

        {/* Live Preview / Validation feedback */}
        <div className="sweep-preview-banner">
          <div className="preview-copy">
            <strong>Sweep preview: </strong>
            <span>
              {paramDef.label}: {startValue} → {endValue} (step {stepValue}) &nbsp;·&nbsp;
              <span className={validation.isValid ? "preview-count-valid" : "preview-count-invalid"}>
                {validation.expectedRunCount} {validation.expectedRunCount === 1 ? "run" : "runs"}
              </span>
            </span>
            {validation.isValid && validation.previewValues.length > 0 && (
              <span className="preview-sequence">
                &nbsp;[{validation.previewValues.join(", ")}]
              </span>
            )}
          </div>

          {!validation.isValid && (
            <p className="sweep-validation-error" role="alert">
              ⚠️ {validation.error}
            </p>
          )}
        </div>

        {/* Action button & progress */}
        <div className="sweep-submit-row">
          <button
            className="primary-button sweep-btn"
            type="submit"
            disabled={!validation.isValid || isSweeping}
          >
            {isSweeping ? "Running parameter sweep..." : "⚡ Run Parameter Sweep"}
          </button>

          {isSweeping && sweepProgress && (
            <div
              className="sweep-progress-box"
              id={progressStatusId}
              role="status"
              aria-live="polite"
            >
              <span className="loading-spinner" aria-hidden="true" />
              <span>
                Running experiment {sweepProgress.current} of {sweepProgress.total}... ({paramDef.label} = {sweepProgress.value})
              </span>
            </div>
          )}
        </div>
      </form>

      {sweepError && (
        <div className="lab-alert" role="alert">
          <strong>Sweep execution notice:</strong> <span>{sweepError}</span>
        </div>
      )}

      {/* Sweep Results Section */}
      {currentSweep && (
        <section className="sweep-results-section" aria-label="Sweep Results">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">Sweep Analysis</p>
              <h3>Experiment Results</h3>
              <p>
                {currentSweep.runs.filter((r) => r.status === "completed").length} of {currentSweep.runs.length} experiments completed.
              </p>
            </div>
          </div>

          {/* Visualizations Grid: Parameter vs Metric + Training Curves */}
          <div className="sweep-visual-grid">
            <ParameterMetricChart
              points={chartPoints}
              parameterName={paramDef.label}
              metricLabel={metricLabel}
              selectedRunId={selectedRunId || inspectedRunId}
              onSelectRun={handleSelectRun}
            />
            <SweepCurvesChart
              runs={curveRuns}
              metricLabel={metricLabel}
              selectedRunId={selectedRunId || inspectedRunId}
              onSelectRun={handleSelectRun}
            />
          </div>

          {/* Deterministic Sweep Insights */}
          {sweepInsights.length > 0 && (
            <div className="sweep-insights-box">
              <div className="insights-header">
                <span className="insights-icon">💡</span>
                <h4>Sweep Observations</h4>
              </div>
              <ul className="sweep-insights-list">
                {sweepInsights.map((insight, idx) => (
                  <li key={idx}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Results Table */}
          <div className="sweep-table-container">
            <table className="sweep-results-table">
              <thead>
                <tr>
                  <th>{paramDef.label}</th>
                  <th>Final {metricLabel}</th>
                  <th>Total Frames</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentSweep.runs.map((r) => {
                  const isSuccess = r.status === "completed" && r.trainingRun !== null;
                  const runId = r.trainingRun?.id || r.id;
                  const isCurrent = (selectedRunId || inspectedRunId) === runId;
                  const metric = r.trainingRun ? extractSweepMetric(r.trainingRun) : null;

                  return (
                    <tr
                      key={r.id}
                      className={`sweep-row ${isCurrent ? "active-sweep-row" : ""}`}
                    >
                      <td>
                        <strong>{r.parameterValue}</strong>
                      </td>
                      <td>
                        {metric ? (
                          <span>{formatNumber(metric.value, 4)}</span>
                        ) : (
                          <span className="text-muted">N/A</span>
                        )}
                      </td>
                      <td>{r.trainingRun ? r.trainingRun.total_steps : "—"}</td>
                      <td>
                        {isSuccess ? (
                          <span className="status-badge success-badge">✓ Completed</span>
                        ) : (
                          <span className="status-badge failure-badge" title={r.error}>
                            ✕ Failed
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="sweep-actions-cell">
                          {isSuccess && r.trainingRun && (
                            <>
                              <button
                                className="secondary-button sweep-action-sm"
                                type="button"
                                onClick={() => handleSelectRun(r.trainingRun!.id)}
                              >
                                {isCurrent ? "✓ Inspected" : "Inspect run"}
                              </button>

                              <SaveExperimentButton
                                run={r.trainingRun}
                                className="sweep-save-btn"
                              />

                              <Link
                                className="secondary-button sweep-action-sm lab-handoff-link"
                                href={getLabHref(r.trainingRun.algorithm)}
                                onClick={() => handleOpenInLab(r.trainingRun!)}
                                title="Open this recorded run in the algorithm lab without re-running training"
                              >
                                Open in Lab →
                              </Link>
                            </>
                          )}
                          {!isSuccess && <small className="text-error">{r.error}</small>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </section>
  );
}
