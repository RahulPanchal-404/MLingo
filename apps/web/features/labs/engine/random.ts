/**
 * Small seeded random number generator so every lab run is reproducible from its seed.
 * mulberry32 for uniforms, Box-Muller for normals.
 */
export function makeRng(seed: number) {
  let a = (seed >>> 0) + 0x6d2b79f5;
  const uniform = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  let spare: number | null = null;
  const normal = (mean = 0, sd = 1) => {
    if (spare !== null) {
      const v = spare;
      spare = null;
      return mean + sd * v;
    }
    let u = 0;
    while (u === 0) u = uniform();
    const v = uniform();
    const r = Math.sqrt(-2 * Math.log(u));
    spare = r * Math.sin(2 * Math.PI * v);
    return mean + sd * r * Math.cos(2 * Math.PI * v);
  };
  /** k distinct indices from 0..n-1. */
  const choice = (n: number, k: number) => {
    const pool = Array.from({ length: n }, (_, i) => i);
    for (let i = 0; i < k; i += 1) {
      const j = i + Math.floor(uniform() * (n - i));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, k);
  };
  return { uniform, normal, choice };
}

export type Rng = ReturnType<typeof makeRng>;
