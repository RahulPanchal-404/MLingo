"use client";

import Link from "next/link";
import { useState } from "react";
import type { TrainingRun } from "@/types/training-run";
import { generateDefaultTitle, saveExperiment } from "./experiment-storage";

export type SaveExperimentButtonProps = {
  run: TrainingRun | null;
  className?: string;
};

export function SaveExperimentButton({ run, className = "" }: SaveExperimentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!run) return null;

  const defaultTitle = generateDefaultTitle(run);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const record = saveExperiment({
      run,
      title: title.trim() || defaultTitle,
      notes: notes.trim() || undefined,
    });

    if (record) {
      setSavedId(record.id);
      setIsOpen(false);
    } else {
      setError("Unable to save experiment to local storage. Storage may be full or disabled.");
    }
  };

  return (
    <div className={`save-experiment-container ${className}`}>
      {savedId ? (
        <div className="save-experiment-success">
          <span className="save-badge">✓ Experiment saved</span>
          <Link className="save-link" href="/experiments">
            View in My Experiments →
          </Link>
        </div>
      ) : !isOpen ? (
        <button
          className="secondary-button save-experiment-trigger"
          onClick={() => setIsOpen(true)}
          type="button"
        >
          💾 Save experiment
        </button>
      ) : (
        <form className="save-experiment-form" onSubmit={handleSave}>
          <div className="save-form-header">
            <h4>Save Experiment to History</h4>
            <button
              className="save-close-btn"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              type="button"
              aria-label="Close save form"
            >
              ✕
            </button>
          </div>

          <label className="save-field">
            <span>Experiment title (optional)</span>
            <input
              type="text"
              placeholder={defaultTitle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </label>

          <label className="save-field">
            <span>Notes (optional)</span>
            <textarea
              placeholder="Hypothesis, observations, or conclusions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={300}
            />
          </label>

          {error && <p className="save-error-text" role="alert">{error}</p>}

          <div className="save-actions">
            <button className="primary-button" type="submit">
              Save record
            </button>
            <button
              className="secondary-button"
              onClick={() => {
                setIsOpen(false);
                setError(null);
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
