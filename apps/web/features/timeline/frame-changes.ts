import type { TrainingState } from "@/types/training-run";

export type FrameChanges = {
      weight: number;
      bias: number;
      loss: number;
      gradient: number;
};

export function getFrameChanges(history: TrainingState[], currentStep: number): FrameChanges | null {
      const current = history[currentStep];
      const previous = history[currentStep - 1];
      if (!current || !previous) return null;

      return {
            weight: (current.weights[0] ?? 0) - (previous.weights[0] ?? 0),
            bias: current.bias - previous.bias,
            loss: current.loss - previous.loss,
            gradient: (current.gradients[0] ?? 0) - (previous.gradients[0] ?? 0),
      };
}