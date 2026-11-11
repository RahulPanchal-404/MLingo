/** Tiny dense linear algebra for the regression games. */

/** Solves A x = b by Gaussian elimination with partial pivoting. A is n×n. */
export function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / d;
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / (M[r][r] || 1e-12);
  }
  return x;
}

/** Ridge least squares with an unpenalised intercept: minimise mean((Xw + b − y)²) + λ·Σw². */
export function ridgeFit(X: number[][], y: number[], lambda: number): { w: number[]; b: number } {
  const n = X.length;
  const d = X[0].length;
  const mx = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const my = y.reduce((a, c) => a + c, 0) / n;
  const Xc = X.map((r) => r.map((v, j) => v - mx[j]));
  const A = Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => Xc.reduce((s, r) => s + r[i] * r[j], 0) / n + (i === j ? lambda + 1e-10 : 0)));
  const rhs = Array.from({ length: d }, (_, i) => Xc.reduce((s, r, k) => s + r[i] * (y[k] - my), 0) / n);
  const w = solve(A, rhs);
  return { w, b: my - w.reduce((s, wi, j) => s + wi * mx[j], 0) };
}

/** Lasso by coordinate descent: minimise mean((Xw + b − y)²)/2 + λ·Σ|w|. Features should be standardized. */
export function lassoFit(X: number[][], y: number[], lambda: number, iters = 300): { w: number[]; b: number } {
  const n = X.length;
  const d = X[0].length;
  const w = new Array<number>(d).fill(0);
  const my = y.reduce((a, c) => a + c, 0) / n;
  const mx = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  const Xc = X.map((r) => r.map((v, j) => v - mx[j]));
  const yc = y.map((v) => v - my);
  const sq = Array.from({ length: d }, (_, j) => Xc.reduce((s, r) => s + r[j] * r[j], 0) / n);
  const resid = [...yc];
  for (let it = 0; it < iters; it++) {
    for (let j = 0; j < d; j++) {
      let rho = 0;
      for (let i = 0; i < n; i++) rho += Xc[i][j] * (resid[i] + Xc[i][j] * w[j]);
      rho /= n;
      const nw = Math.sign(rho) * Math.max(0, Math.abs(rho) - lambda) / (sq[j] || 1e-12);
      const delta = nw - w[j];
      if (delta) for (let i = 0; i < n; i++) resid[i] -= Xc[i][j] * delta;
      w[j] = nw;
    }
  }
  return { w, b: my - w.reduce((s, wi, j) => s + wi * mx[j], 0) };
}

export const predictLinear = (x: number[], m: { w: number[]; b: number }) => x.reduce((s, v, j) => s + v * m.w[j], m.b);
export const mse = (pred: number[], y: number[]) => pred.reduce((s, p, i) => s + (p - y[i]) ** 2, 0) / y.length;
