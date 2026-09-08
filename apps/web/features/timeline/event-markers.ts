import type { TrainingState } from "@/types/training-run";
import type { TimelineMarker } from "@/features/timeline/types";

const RAPID_DECREASE = 0.15;
const PLATEAU_DELTA = 0.002;
const PLATEAU_WINDOW = 4;
const CONVERGENCE_GRADIENT = 0.05;

export function detectTrainingEventMarkers(history: TrainingState[]): TimelineMarker[] {
      if (history.length < 2) return [];

      const markers: TimelineMarker[] = [];
      const rapidStep = history.findIndex((state, index) => {
            if (index === 0) return false;
            const previousLoss = history[index - 1].loss;
            return previousLoss > 0 && (previousLoss - state.loss) / previousLoss >= RAPID_DECREASE;
      });
      if (rapidStep > 0) markers.push({ id: "event-rapid-loss", step: rapidStep, title: "Rapid loss decrease", description: "Loss dropped sharply from the previous frame.", type: "event" });

      const plateauStep = history.findIndex((state, index) => {
            if (index < PLATEAU_WINDOW) return false;
            const window = history.slice(index - PLATEAU_WINDOW, index + 1);
            return window.slice(1).every((frame, offset) => Math.abs(window[offset].loss - frame.loss) <= PLATEAU_DELTA);
      });
      if (plateauStep > 0) markers.push({ id: "event-plateau", step: plateauStep, title: "Possible plateau", description: "Recent loss changes are small; inspect this stretch of training.", type: "event" });

      const convergenceStep = history.findIndex((state, index) => {
            if (index < 1) return false;
            return Math.abs(state.gradients[0] ?? 0) <= CONVERGENCE_GRADIENT && Math.abs(state.bias_gradient) <= CONVERGENCE_GRADIENT;
      });
      if (convergenceStep > 0) markers.push({ id: "event-convergence", step: convergenceStep, title: "Near convergence", description: "Both recorded gradients are small at this frame.", type: "event" });

      return markers;
}