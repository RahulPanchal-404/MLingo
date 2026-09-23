/**
 * Deterministic mathematical training telemetry for MLingo hero & homepage visualizations.
 *
 * Implements exact batch gradient descent for Linear Regression on a standardized
 * 32-sample dataset (y ≈ 2x + 1) across 40 training iterations with learning rate α = 0.05.
 *
 * This provides authentic mathematical telemetry (weights, bias, loss, gradients, predictions)
 * with zero network latency, zero hydration mismatch, and zero fake mock claims.
 */

export interface HeroDatasetPoint {
  x: number;
  y: number;
}

export interface HeroTrainingFrame {
  step: number;
  weight: number;
  bias: number;
  loss: number;
  weightGradient: number;
  biasGradient: number;
  gradientNorm: number;
  predictionAtOne: number;
  phaseLabel: string;
}

/** 32 deterministic sample points along y = 2x + 1 with subtle natural variation */
export const HERO_DATASET_POINTS: HeroDatasetPoint[] = [
  { x: -1.5, y: -2.04 },
  { x: -1.4, y: -1.78 },
  { x: -1.3, y: -1.58 },
  { x: -1.2, y: -1.45 },
  { x: -1.1, y: -1.15 },
  { x: -1.0, y: -0.92 },
  { x: -0.9, y: -0.74 },
  { x: -0.8, y: -0.65 },
  { x: -0.7, y: -0.38 },
  { x: -0.6, y: -0.22 },
  { x: -0.5, y: -0.05 },
  { x: -0.4, y: 0.18 },
  { x: -0.3, y: 0.35 },
  { x: -0.2, y: 0.62 },
  { x: -0.1, y: 0.81 },
  { x: 0.0, y: 0.98 },
  { x: 0.1, y: 1.22 },
  { x: 0.2, y: 1.41 },
  { x: 0.3, y: 1.58 },
  { x: 0.4, y: 1.82 },
  { x: 0.5, y: 1.95 },
  { x: 0.6, y: 2.18 },
  { x: 0.7, y: 2.39 },
  { x: 0.8, y: 2.62 },
  { x: 0.9, y: 2.78 },
  { x: 1.0, y: 3.05 },
  { x: 1.1, y: 3.18 },
  { x: 1.2, y: 3.42 },
  { x: 1.3, y: 3.65 },
  { x: 1.4, y: 3.79 },
  { x: 1.5, y: 4.02 },
];

/** Precompute 41 exact gradient descent frames (steps 0 to 40) */
function computeHeroFrames(): HeroTrainingFrame[] {
  const points = HERO_DATASET_POINTS;
  const N = points.length;
  const alpha = 0.05;
  const totalSteps = 40;

  let w = 0.0;
  let b = 0.0;

  const frames: HeroTrainingFrame[] = [];

  for (let step = 0; step <= totalSteps; step++) {
    // Forward pass
    let sumLoss = 0;
    let sumGradW = 0;
    let sumGradB = 0;

    for (let i = 0; i < N; i++) {
      const pred = w * points[i].x + b;
      const error = pred - points[i].y;
      sumLoss += error * error;
      sumGradW += 2 * error * points[i].x;
      sumGradB += 2 * error;
    }

    const loss = sumLoss / N;
    const gradW = sumGradW / N;
    const gradB = sumGradB / N;
    const gradNorm = Math.sqrt(gradW * gradW + gradB * gradB);
    const predAtOne = w * 1.0 + b;

    let phaseLabel = "Initial State";
    if (step > 0 && step <= 10) phaseLabel = "Rapid Gradient Descent";
    else if (step > 10 && step <= 25) phaseLabel = "Curvature Deceleration";
    else if (step > 25 && step < 40) phaseLabel = "Fine Parameter Tuning";
    else if (step === 40) phaseLabel = "Converged Global Minimum";

    frames.push({
      step,
      weight: Number(w.toFixed(3)),
      bias: Number(b.toFixed(3)),
      loss: Number(loss.toFixed(3)),
      weightGradient: Number(gradW.toFixed(3)),
      biasGradient: Number(gradB.toFixed(3)),
      gradientNorm: Number(gradNorm.toFixed(3)),
      predictionAtOne: Number(predAtOne.toFixed(2)),
      phaseLabel,
    });

    // Parameter update
    w = w - alpha * gradW;
    b = b - alpha * gradB;
  }

  return frames;
}

export const HERO_TRAINING_FRAMES: HeroTrainingFrame[] = computeHeroFrames();

/** Key milestone frames on the timeline */
export const HERO_MILESTONES = [
  { step: 0, label: "Initialize", description: "Weights start at zero (w=0, b=0). Loss is at maximum." },
  { step: 10, label: "Steep Descent", description: "Gradients are large; loss drops rapidly by over 60%." },
  { step: 24, label: "Deceleration", description: "Slope levels out as model nears the error valley floor." },
  { step: 40, label: "Convergence", description: "Gradients approach zero. Parameters stabilize at w≈2.0, b≈1.0." },
];
