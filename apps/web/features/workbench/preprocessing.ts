import type { PreprocessingConfig } from "./types";

export type ScalerState = {
  means?: Record<string, number>;
  stds?: Record<string, number>;
  mins?: Record<string, number>;
  maxs?: Record<string, number>;
};

export type ImputerState = {
  means: Record<string, number>;
  modes: Record<string, string>;
};

export type EncoderState = {
  categories: Record<string, string[]>;
};

export type FittedPipeline = {
  scaler?: ScalerState;
  imputer?: ImputerState;
  encoder?: EncoderState;
  numericColumns: string[];
  categoricalColumns: string[];
};

export function fitPreprocessing(
  trainRows: Array<Record<string, string | number | null>>,
  config: PreprocessingConfig,
  targetColumn?: string
): FittedPipeline {
  if (trainRows.length === 0) {
    throw new Error("Cannot fit preprocessing on empty training rows");
  }

  const allColumns = Object.keys(trainRows[0]).filter((c) => c !== targetColumn);
  const numericColumns: string[] = [];
  const categoricalColumns: string[] = [];

  for (const col of allColumns) {
    const vals = trainRows.map((r) => r[col]).filter((v) => v !== null && v !== undefined);
    const isNum = vals.every((v) => typeof v === "number" && !Number.isNaN(v));
    if (isNum) {
      numericColumns.push(col);
    } else {
      categoricalColumns.push(col);
    }
  }

  let imputer: ImputerState | undefined;
  if (config.missingImputation === "mean_mode") {
    const means: Record<string, number> = {};
    for (const col of numericColumns) {
      const numVals = trainRows
        .map((r) => r[col])
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      means[col] = numVals.length > 0 ? numVals.reduce((a, b) => a + b, 0) / numVals.length : 0;
    }

    const modes: Record<string, string> = {};
    for (const col of categoricalColumns) {
      const strVals = trainRows
        .map((r) => r[col])
        .filter((v): v is string => typeof v === "string");
      if (strVals.length > 0) {
        const counts: Record<string, number> = {};
        for (const s of strVals) counts[s] = (counts[s] ?? 0) + 1;
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        modes[col] = sorted[0][0];
      } else {
        modes[col] = "";
      }
    }
    imputer = { means, modes };
  }

  let encoder: EncoderState | undefined;
  if (config.categoricalEncoding === "onehot") {
    const categories: Record<string, string[]> = {};
    for (const col of categoricalColumns) {
      const uniqueCats = Array.from(
        new Set(
          trainRows
            .map((r) => r[col])
            .filter((v): v is string => typeof v === "string")
        )
      ).sort();
      categories[col] = uniqueCats;
    }
    encoder = { categories };
  }

  let scaler: ScalerState | undefined;
  if (config.numericScaling === "standard") {
    const means: Record<string, number> = {};
    const stds: Record<string, number> = {};
    for (const col of numericColumns) {
      // If imputer was fitted, use imputed values for scaling calculation
      const vals = trainRows.map((r) => {
        const v = r[col];
        if (typeof v === "number") return v;
        if (imputer && col in imputer.means) return imputer.means[col];
        return 0;
      });
      const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
      const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (vals.length || 1);
      const std = Math.sqrt(variance);
      means[col] = mean;
      stds[col] = std === 0 ? 1 : std;
    }
    scaler = { means, stds };
  } else if (config.numericScaling === "minmax") {
    const mins: Record<string, number> = {};
    const maxs: Record<string, number> = {};
    for (const col of numericColumns) {
      const vals = trainRows.map((r) => {
        const v = r[col];
        if (typeof v === "number") return v;
        if (imputer && col in imputer.means) return imputer.means[col];
        return 0;
      });
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      mins[col] = min;
      maxs[col] = max;
    }
    scaler = { mins, maxs };
  }

  return {
    scaler,
    imputer,
    encoder,
    numericColumns,
    categoricalColumns,
  };
}

export function transformWithPipeline(
  rows: Array<Record<string, string | number | null>>,
  pipeline: FittedPipeline,
  targetColumn?: string
): Array<Record<string, number>> {
  return rows.map((row) => {
    const transformed: Record<string, number> = {};

    // 1. Impute & scale numeric features
    for (const col of pipeline.numericColumns) {
      let val = row[col];
      if (val === null || val === undefined || typeof val !== "number" || Number.isNaN(val)) {
        val = pipeline.imputer?.means[col] ?? 0;
      }

      if (pipeline.scaler?.means && pipeline.scaler?.stds) {
        const mean = pipeline.scaler.means[col] ?? 0;
        const std = pipeline.scaler.stds[col] ?? 1;
        val = (val - mean) / std;
      } else if (pipeline.scaler?.mins && pipeline.scaler?.maxs) {
        const min = pipeline.scaler.mins[col] ?? 0;
        const max = pipeline.scaler.maxs[col] ?? 1;
        const denom = max - min === 0 ? 1 : max - min;
        val = (val - min) / denom;
      }

      transformed[col] = Number(val.toFixed(4));
    }

    // 2. Impute & encode categorical features
    for (const col of pipeline.categoricalColumns) {
      let strVal = String(row[col] ?? "");
      if (!strVal || strVal === "null" || strVal === "undefined") {
        strVal = pipeline.imputer?.modes[col] ?? "";
      }

      if (pipeline.encoder?.categories[col]) {
        const cats = pipeline.encoder.categories[col];
        for (const cat of cats) {
          transformed[`${col}_${cat}`] = strVal === cat ? 1 : 0;
        }
      }
    }

    // 3. Preserve target unmodified if present
    if (targetColumn && row[targetColumn] !== undefined && row[targetColumn] !== null) {
      transformed[targetColumn] = Number(row[targetColumn]);
    }

    return transformed;
  });
}
