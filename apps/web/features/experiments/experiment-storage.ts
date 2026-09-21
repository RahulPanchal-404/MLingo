import { useEffect, useState } from "react";
import type { TrainingRun } from "@/types/training-run";
import { readLearningActivity, recordLearningActivity } from "@/features/progress/activity";
import type { ExperimentMetricSummary, ExperimentRecord, SaveExperimentInput } from "./types";
import { formatNumber, formatPercentage } from "@/features/x-ray/x-ray-helpers";

export const EXPERIMENTS_STORAGE_KEY = "mlingo.experiments.v1";

export function useSavedExperiments(algorithmPrefix?: string): ExperimentRecord[] {
  const [records, setRecords] = useState<ExperimentRecord[]>([]);

  useEffect(() => {
    const update = () => {
      const all = getSavedExperiments();
      setRecords(
        algorithmPrefix
          ? all.filter((e) => e.algorithm.toLowerCase().startsWith(algorithmPrefix.toLowerCase()))
          : all
      );
    };

    const timer = window.setTimeout(update, 0);
    window.addEventListener("mlingo-experiments-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("mlingo-experiments-change", update);
      window.removeEventListener("storage", update);
    };
  }, [algorithmPrefix]);

  return records;
}

function getStorage(): Storage | null {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis && (globalThis as unknown as { localStorage: Storage }).localStorage) {
    return (globalThis as unknown as { localStorage: Storage }).localStorage;
  }
  return null;
}

function notifyExperimentChange() {
  if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
    window.dispatchEvent(new CustomEvent("mlingo-experiments-change"));
  } else if (typeof globalThis !== "undefined" && typeof (globalThis as unknown as { dispatchEvent?: (ev: Event) => void }).dispatchEvent === "function") {
    try {
      (globalThis as unknown as { dispatchEvent: (ev: Event) => void }).dispatchEvent(new CustomEvent("mlingo-experiments-change"));
    } catch {
      // ignore in test envs without CustomEvent support
    }
  }
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `exp-${crypto.randomUUID()}`;
  }
  return `exp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function generateDefaultTitle(run: TrainingRun): string {
  const algo = run.algorithm.toLowerCase();
  if (algo.startsWith("linear")) {
    return `Linear Regression (${run.training.epochs} epochs, lr=${run.training.learning_rate})`;
  }
  if (algo.startsWith("logistic")) {
    return `Logistic Regression (${run.training.epochs} epochs, lr=${run.training.learning_rate})`;
  }
  if (algo.startsWith("neural")) {
    const h = run.training.hidden_neurons ?? run.history[0]?.b1?.length ?? 3;
    return `Neural Network (h=${h}, ${run.training.epochs} epochs, lr=${run.training.learning_rate})`;
  }
  if (algo.startsWith("kmeans")) {
    const k = run.training.clusters ?? 3;
    const iters = run.training.iterations ?? run.total_steps;
    return `K-Means (${k} clusters, ${iters} iterations)`;
  }
  return `${run.algorithm} (${run.total_steps} steps)`;
}

export function isValidExperimentRecord(item: unknown): item is ExperimentRecord {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<ExperimentRecord>;

  if (typeof candidate.id !== "string" || candidate.id.trim() === "") return false;
  if (typeof candidate.createdAt !== "string") return false;
  if (typeof candidate.algorithm !== "string") return false;
  if (typeof candidate.title !== "string") return false;
  if (!candidate.run || typeof candidate.run !== "object") return false;

  const run = candidate.run as Partial<TrainingRun>;
  if (typeof run.id !== "string" || !Array.isArray(run.history) || !Array.isArray(run.dataset_points)) {
    return false;
  }

  return true;
}

export function getSavedExperiments(): ExperimentRecord[] {
  const storage = getStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(EXPERIMENTS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const validRecords: ExperimentRecord[] = [];
    for (const item of parsed) {
      if (isValidExperimentRecord(item)) {
        validRecords.push(item);
      }
    }

    // Sort newest first
    return validRecords.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export function getSavedExperimentById(id: string): ExperimentRecord | null {
  const all = getSavedExperiments();
  return all.find((item) => item.id === id) ?? null;
}

export function saveExperiment(input: SaveExperimentInput): ExperimentRecord | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    // Validate run
    if (!input.run || !Array.isArray(input.run.history)) {
      return null;
    }

    const title = input.title?.trim() || generateDefaultTitle(input.run);
    const newRecord: ExperimentRecord = {
      id: generateUUID(),
      createdAt: new Date().toISOString(),
      algorithm: input.run.algorithm,
      title,
      configuration: {
        dataset: input.run.dataset,
        training: input.run.training,
      },
      run: input.run,
      notes: input.notes?.trim() || undefined,
      preprocessing: input.preprocessing,
      split: input.split,
      evaluation: input.evaluation,
    };

    const currentRecords = getSavedExperiments();
    const updatedRecords = [newRecord, ...currentRecords];

    const serialized = JSON.stringify(updatedRecords);
    storage.setItem(EXPERIMENTS_STORAGE_KEY, serialized);

    // Notify listeners
    notifyExperimentChange();

    // Track activity
    try {
      const currentActivity = readLearningActivity();
      recordLearningActivity({
        experimentsSaved: (currentActivity.experimentsSaved ?? 0) + 1,
      });
    } catch {
      // safe fallback
    }

    return newRecord;
  } catch {
    return null;
  }
}

export function deleteExperiment(id: string): boolean {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    const current = getSavedExperiments();
    const filtered = current.filter((item) => item.id !== id);

    if (filtered.length === current.length) {
      return false;
    }

    storage.setItem(EXPERIMENTS_STORAGE_KEY, JSON.stringify(filtered));
    notifyExperimentChange();
    return true;
  } catch {
    return false;
  }
}

export function clearAllExperiments(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(EXPERIMENTS_STORAGE_KEY);
    notifyExperimentChange();
  } catch {
    // ignore
  }
}

export function formatExperimentMetric(record: ExperimentRecord): ExperimentMetricSummary {
  const history = record.run?.history;
  const lastState = history && history.length > 0 ? history[history.length - 1] : null;

  if (!lastState) {
    return { primaryLabel: "Final metric", primaryValue: "N/A" };
  }

  const algo = record.algorithm.toLowerCase();

  if (algo.startsWith("linear")) {
    const mse = lastState.metrics?.mean_squared_error ?? lastState.loss;
    return {
      primaryLabel: "Final MSE",
      primaryValue: formatNumber(mse),
    };
  }

  if (algo.startsWith("logistic") || algo.startsWith("neural")) {
    const bce = lastState.metrics?.binary_cross_entropy ?? lastState.loss;
    const acc = lastState.metrics?.accuracy;
    return {
      primaryLabel: "Final BCE",
      primaryValue: formatNumber(bce),
      secondaryLabel: "Accuracy",
      secondaryValue: acc != null ? formatPercentage(acc) : "N/A",
    };
  }

  if (algo.startsWith("kmeans")) {
    const inertia = lastState.inertia ?? lastState.metrics?.inertia ?? lastState.loss;
    return {
      primaryLabel: "Final Inertia",
      primaryValue: formatNumber(inertia),
    };
  }

  return {
    primaryLabel: "Final loss",
    primaryValue: formatNumber(lastState.loss),
  };
}

export const LAB_HANDOFF_KEY = "mlingo.lab_handoff.v1";

function getSessionOrFallbackStorage(): Storage | null {
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage;
  }
  return getStorage();
}

export function setLabHandoffRun(run: TrainingRun): boolean {
  const storage = getSessionOrFallbackStorage();
  if (!storage) return false;
  try {
    storage.setItem(LAB_HANDOFF_KEY, JSON.stringify(run));
    return true;
  } catch {
    return false;
  }
}

export function consumeLabHandoffRun(): TrainingRun | null {
  const storage = getSessionOrFallbackStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(LAB_HANDOFF_KEY);
    if (!raw) return null;
    storage.removeItem(LAB_HANDOFF_KEY);
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const run = parsed as Partial<TrainingRun>;
    if (typeof run.id === "string" && Array.isArray(run.history) && Array.isArray(run.dataset_points)) {
      return run as TrainingRun;
    }
    return null;
  } catch {
    return null;
  }
}

