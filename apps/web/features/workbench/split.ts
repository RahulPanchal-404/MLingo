import type { SplitConfig } from "./types";

/**
 * 32-bit seeded pseudo-random number generator (Mulberry32).
 */
function createSeededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function splitTrainTest<T>(
  items: T[],
  config: SplitConfig
): { train: T[]; test: T[] } {
  const n = items.length;
  if (n < 2) {
    throw new Error("Dataset must contain at least 2 samples to split");
  }
  if (config.trainRatio <= 0 || config.trainRatio >= 1) {
    throw new Error("trainRatio must be strictly between 0 and 1");
  }

  const rng = createSeededRandom(config.seed);

  // Fisher-Yates shuffle on indices
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }

  const trainCount = Math.max(1, Math.min(n - 1, Math.round(config.trainRatio * n)));

  const train: T[] = [];
  const test: T[] = [];

  indices.forEach((idx, pos) => {
    if (pos < trainCount) {
      train.push(items[idx]);
    } else {
      test.push(items[idx]);
    }
  });

  return { train, test };
}
