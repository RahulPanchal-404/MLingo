/** Small deterministic math helpers shared by the game engines. No randomness at runtime. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sampler (Box–Muller) driven by a seeded uniform source. */
export function gaussian(rand: () => number): () => number {
  return () => {
    const u = Math.max(rand(), 1e-12);
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
}

export const sigmoid = (z: number) => 1 / (1 + Math.exp(-Math.max(-35, Math.min(35, z))));
export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
export const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
export const std = (xs: number[]) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / xs.length) || 1;
};

export function fmt(v: number, digits = 3): string {
  if (!Number.isFinite(v)) return "∞";
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e5 || a < 1e-3)) return v.toExponential(1);
  return Number(v.toFixed(digits)).toString();
}

export const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Map a 0..1000 slider position to a log-scaled value and back. */
export function logValue(pos: number, min: number, max: number): number {
  return Math.exp(Math.log(min) + (pos / 1000) * (Math.log(max) - Math.log(min)));
}
export function logPosition(value: number, min: number, max: number): number {
  return Math.round(((Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 1000);
}

/** Score helper: 1000 at the target, scaling down smoothly as the result gets worse. */
export function scoreFromRatio(achieved: number, target: number, lowerIsBetter = true): number {
  if (!Number.isFinite(achieved)) return 0;
  const ratio = lowerIsBetter ? target / Math.max(achieved, 1e-12) : achieved / Math.max(target, 1e-12);
  return Math.round(clamp(ratio, 0, 1.2) * 800 + 40);
}
