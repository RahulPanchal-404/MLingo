export function stableSigmoid(z: number): number {
  const clipped = Math.max(-25, Math.min(25, z));
  return 1 / (1 + Math.exp(-clipped));
}

export type GridCell = {
  x1: number;
  x2: number;
  probability: number;
};

export type DecisionGridResult = {
  cells: GridCell[];
  resolution: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export function evaluateDecisionGrid(
  w1: number[][] | null | undefined,
  b1: number[] | null | undefined,
  w2: number[][] | null | undefined,
  b2: number | null | undefined,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  resolution = 25
): DecisionGridResult {
  const { minX, maxX, minY, maxY } = bounds;
  const cells: GridCell[] = [];

  if (!w1 || !b1 || !w2 || b2 === undefined || b2 === null || w1.length < 2) {
    return { cells, resolution, minX, maxX, minY, maxY };
  }

  const hiddenCount = b1.length;
  const stepX = (maxX - minX) / (resolution - 1 || 1);
  const stepY = (maxY - minY) / (resolution - 1 || 1);

  for (let row = 0; row < resolution; row++) {
    const x2 = minY + row * stepY;
    for (let col = 0; col < resolution; col++) {
      const x1 = minX + col * stepX;

      // Hidden layer forward: a1_j = sigmoid(x1 * w1[0][j] + x2 * w1[1][j] + b1[j])
      let z2 = b2;
      for (let j = 0; j < hiddenCount; j++) {
        const w1_0 = w1[0]?.[j] ?? 0;
        const w1_1 = w1[1]?.[j] ?? 0;
        const bias1 = b1[j] ?? 0;
        const z1_j = x1 * w1_0 + x2 * w1_1 + bias1;
        const a1_j = stableSigmoid(z1_j);

        const w2_j = w2[j]?.[0] ?? 0;
        z2 += a1_j * w2_j;
      }

      const probability = stableSigmoid(z2);
      cells.push({ x1, x2, probability });
    }
  }

  return { cells, resolution, minX, maxX, minY, maxY };
}
