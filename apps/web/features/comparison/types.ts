import type { TrainingRun } from "@/types/training-run";

export type RunComparison = {
      runA: TrainingRun;
      runB: TrainingRun;
      sharedStepCount: number;
};

export function createRunComparison(runA: TrainingRun, runB: TrainingRun): RunComparison {
      return {
            runA,
            runB,
            sharedStepCount: Math.min(runA.history.length, runB.history.length),
      };
}