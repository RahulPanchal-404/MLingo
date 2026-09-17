import { apiBaseUrl } from "@/lib/api";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

export async function createTrainingRun(request: TrainingRunRequest): Promise<TrainingRun> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/training-runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error(`Could not connect to the MLingo API at ${apiBaseUrl}. Please ensure the backend service is running.`);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = isRecord(body) && typeof body.detail === "string" ? body.detail : "Check the settings and try again.";
    throw new Error(`Training could not start. ${detail}`);
  }
  if (!isTrainingRun(body)) throw new Error("The training service returned an invalid run.");
  return body;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isTrainingRun(value: unknown): value is TrainingRun {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.algorithm === "string" && Array.isArray(value.dataset_points) && Array.isArray(value.history) && typeof value.total_steps === "number" && Array.isArray(value.markers) && isRecord(value.metadata);
}
