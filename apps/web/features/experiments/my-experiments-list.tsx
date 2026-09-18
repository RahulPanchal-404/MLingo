"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { TrainingRun } from "@/types/training-run";
import { readLearningActivity, recordLearningActivity } from "@/features/progress/activity";
import {
  deleteExperiment,
  formatExperimentMetric,
  getSavedExperiments,
} from "./experiment-storage";
import { compareSavedExperiments } from "./explorer/sweep-engine";
import type { ExperimentRecord } from "./types";

export type MyExperimentsListProps = {
  onReplayRun?: (run: TrainingRun, record: ExperimentRecord) => void;
  activeRunId?: string | null;
};

export function MyExperimentsList({ onReplayRun, activeRunId }: MyExperimentsListProps) {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const update = () => setExperiments(getSavedExperiments());
    update();

    window.addEventListener("mlingo-experiments-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("mlingo-experiments-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleReplay = (record: ExperimentRecord) => {
    try {
      const current = readLearningActivity();
      recordLearningActivity({
        experimentsReplayed: (current.experimentsReplayed ?? 0) + 1,
      });
    } catch {
      // safe fallback
    }

    if (onReplayRun) {
      onReplayRun(record.run, record);
      // Scroll to recorded experiment smoothly
      const element = document.querySelector(".recorded-experiment");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleDelete = (id: string) => {
    deleteExperiment(id);
    setConfirmDeleteId(null);
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleToggleSelect = (record: ExperimentRecord) => {
    setSelectedIds((prev) => {
      if (prev.includes(record.id)) {
        return prev.filter((id) => id !== record.id);
      }
      // If previous selections exist from a different algorithm, reset selection to this algorithm
      const existingSelected = experiments.filter((e) => prev.includes(e.id));
      if (existingSelected.length > 0 && existingSelected[0].algorithm !== record.algorithm) {
        return [record.id];
      }
      return [...prev, record.id];
    });
  };

  const selectedRecords = useMemo(() => {
    return experiments.filter((e) => selectedIds.includes(e.id));
  }, [experiments, selectedIds]);

  const analysis = useMemo(() => {
    if (selectedRecords.length < 2) return null;
    return compareSavedExperiments(selectedRecords);
  }, [selectedRecords]);

  const getComparisonHref = (recordA: ExperimentRecord, recordB?: ExperimentRecord) => {
    const algo = recordA.algorithm.toLowerCase();
    let path = "/labs/gradient-descent/compare";
    if (algo.startsWith("logistic")) {
      path = "/labs/logistic-regression/compare";
    } else if (algo.startsWith("kmeans")) {
      path = "/labs/k-means/compare";
    }

    const params = new URLSearchParams();
    params.set("loadA", recordA.id);
    if (recordB) {
      params.set("loadB", recordB.id);
    }
    return `${path}?${params.toString()}`;
  };

  const formatDateTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  const formatKeyConfig = (record: ExperimentRecord) => {
    const run = record.run;
    const algo = record.algorithm.toLowerCase();
    if (algo.startsWith("kmeans")) {
      const k = run.training.clusters ?? 3;
      const iters = run.training.iterations ?? run.total_steps;
      return `k=${k}, ${iters} iterations, ${run.dataset.samples} samples, noise ${run.dataset.noise}`;
    }
    return `lr=${run.training.learning_rate}, ${run.training.epochs} epochs, ${run.dataset.samples} samples, noise ${run.dataset.noise}`;
  };

  return (
    <section className="my-experiments-section" aria-label="My Experiments">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Local storage history</p>
          <h2>My Experiments</h2>
          <p>
            Replay recorded training runs frame by frame or compare configurations without re-running models on the backend.
          </p>
        </div>
        <div className="experiments-heading-badges">
          <span className="experiments-count-badge">
            {experiments.length} saved {experiments.length === 1 ? "run" : "runs"}
          </span>
          {selectedIds.length > 0 && (
            <button
              className="secondary-button clear-selection-btn"
              type="button"
              onClick={() => setSelectedIds([])}
            >
              Clear selection ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Factual Multi-Run Comparative Analysis Panel */}
      {analysis && (
        <section className="saved-runs-analysis-panel" aria-label="Selected runs analysis">
          <div className="analysis-panel-header">
            <div>
              <span className="eyebrow">Comparative Analysis</span>
              <h3>Comparing {selectedRecords.length} Saved {analysis.algorithm} Runs</h3>
            </div>
            {selectedRecords.length >= 2 && (
              <Link
                className="primary-button compare-selected-btn"
                href={getComparisonHref(selectedRecords[0], selectedRecords[1])}
              >
                Open in A/B Comparison Lab →
              </Link>
            )}
          </div>

          <div className="analysis-grid">
            <div className="analysis-card">
              <h4>Configuration Differences</h4>
              <ul>
                {analysis.differences.map((diff, idx) => (
                  <li key={idx}>{diff}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-card">
              <h4>Final Metric Results</h4>
              <ul>
                {analysis.metricComparison.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="analysis-card">
              <h4>Diagnostic Trajectories</h4>
              <ul>
                {analysis.diagnosticNotes.map((d, idx) => (
                  <li key={idx}>{d}</li>
                ))}
              </ul>
            </div>
          </div>

          {analysis.insights.length > 0 && (
            <div className="analysis-observations">
              <strong>Factual Observations: </strong>
              <span>{analysis.insights.join(" ")}</span>
            </div>
          )}
        </section>
      )}

      {experiments.length === 0 ? (
        <div className="empty-state-box">
          <p>No saved experiments in this browser yet.</p>
          <small>
            Run an experiment above, execute a parameter sweep, or complete a run in any of the three labs, then click &quot;Save experiment&quot; to inspect or compare it anytime.
          </small>
        </div>
      ) : (
        <div className="experiments-grid">
          {experiments.map((record) => {
            const metric = formatExperimentMetric(record);
            const isCurrentlyActive = activeRunId === record.run.id;
            const isSelected = selectedIds.includes(record.id);

            return (
              <article
                key={record.id}
                className={`experiment-card ${isCurrentlyActive ? "active-experiment-card" : ""} ${isSelected ? "selected-experiment-card" : ""}`}
              >
                <div className="experiment-card-top">
                  <div className="card-selection-header">
                    <label className="select-run-checkbox-label">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(record)}
                        aria-label={`Select ${record.title} for comparison`}
                      />
                      <span className="checkbox-custom" />
                      <span className="algo-badge">{record.algorithm}</span>
                    </label>
                    <time className="experiment-date" dateTime={record.createdAt}>
                      {formatDateTime(record.createdAt)}
                    </time>
                  </div>
                  <h3 className="experiment-card-title">{record.title}</h3>
                </div>

                <p className="experiment-config-line">{formatKeyConfig(record)}</p>

                {record.notes && (
                  <p className="experiment-notes">
                    <em>&ldquo;{record.notes}&rdquo;</em>
                  </p>
                )}

                <dl className="experiment-metric-row">
                  <div>
                    <dt>{metric.primaryLabel}</dt>
                    <dd>{metric.primaryValue}</dd>
                  </div>
                  {metric.secondaryLabel && metric.secondaryValue && (
                    <div>
                      <dt>{metric.secondaryLabel}</dt>
                      <dd>{metric.secondaryValue}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Total frames</dt>
                    <dd>{record.run.total_steps}</dd>
                  </div>
                </dl>

                <div className="experiment-actions-row">
                  <button
                    className="primary-button card-action-btn"
                    onClick={() => handleReplay(record)}
                    type="button"
                  >
                    {isCurrentlyActive ? "✓ Viewing run" : "▶ Replay run"}
                  </button>

                  <Link
                    className="secondary-button card-action-btn"
                    href={getComparisonHref(record)}
                  >
                    Compare →
                  </Link>

                  {confirmDeleteId === record.id ? (
                    <div className="delete-confirm-group">
                      <button
                        className="danger-button card-action-btn"
                        onClick={() => handleDelete(record.id)}
                        type="button"
                      >
                        Confirm
                      </button>
                      <button
                        className="secondary-button card-action-btn"
                        onClick={() => setConfirmDeleteId(null)}
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      className="delete-trigger-btn"
                      onClick={() => setConfirmDeleteId(record.id)}
                      type="button"
                      aria-label={`Delete experiment ${record.title}`}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
