"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TrainingRun } from "@/types/training-run";
import { readLearningActivity, recordLearningActivity } from "@/features/progress/activity";
import {
  deleteExperiment,
  formatExperimentMetric,
  getSavedExperiments,
} from "./experiment-storage";
import type { ExperimentRecord } from "./types";

export type MyExperimentsListProps = {
  onReplayRun?: (run: TrainingRun, record: ExperimentRecord) => void;
  activeRunId?: string | null;
};

export function MyExperimentsList({ onReplayRun, activeRunId }: MyExperimentsListProps) {
  const [experiments, setExperiments] = useState<ExperimentRecord[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

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
  };

  const getComparisonHref = (record: ExperimentRecord) => {
    const algo = record.algorithm.toLowerCase();
    if (algo.startsWith("logistic")) {
      return `/labs/logistic-regression/compare?loadA=${encodeURIComponent(record.id)}`;
    }
    if (algo.startsWith("kmeans")) {
      return `/labs/k-means/compare?loadA=${encodeURIComponent(record.id)}`;
    }
    return `/labs/gradient-descent/compare?loadA=${encodeURIComponent(record.id)}`;
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
        <span className="experiments-count-badge">
          {experiments.length} saved {experiments.length === 1 ? "run" : "runs"}
        </span>
      </div>

      {experiments.length === 0 ? (
        <div className="empty-state-box">
          <p>No saved experiments in this browser yet.</p>
          <small>
            Run an experiment above or complete a run in any of the three labs, then click &quot;Save experiment&quot; to inspect or compare it anytime.
          </small>
        </div>
      ) : (
        <div className="experiments-grid">
          {experiments.map((record) => {
            const metric = formatExperimentMetric(record);
            const isCurrentlyActive = activeRunId === record.run.id;

            return (
              <article
                key={record.id}
                className={`experiment-card ${isCurrentlyActive ? "active-experiment-card" : ""}`}
              >
                <div className="experiment-card-top">
                  <div className="card-title-group">
                    <span className="algo-badge">{record.algorithm}</span>
                    <h3 className="experiment-card-title">{record.title}</h3>
                  </div>
                  <time className="experiment-date" dateTime={record.createdAt}>
                    {formatDateTime(record.createdAt)}
                  </time>
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
                        Confirm Delete
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
