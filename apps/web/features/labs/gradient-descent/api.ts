import { trainLocally } from "@/features/labs/engine/train";
import type { TrainingRun, TrainingRunRequest } from "@/types/training-run";

/**
 * Record a training run. Lab models are small (at most a few hundred points and epochs),
 * so they train in the browser: no API request, no server cost, and no wait for a cold start.
 * The work is deferred one tick so the loading state can paint first.
 */
export async function createTrainingRun(request: TrainingRunRequest): Promise<TrainingRun> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  try {
    return trainLocally(request);
  } catch (caught) {
    throw new Error(`Training could not start. ${caught instanceof Error ? caught.message : "Check the settings and try again."}`);
  }
}
