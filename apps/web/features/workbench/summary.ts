import type { WorkbenchDatasetRecord } from "./datasets";
import type { DatasetSummary, FeatureMetadata, TargetMetadata } from "./types";

export function computeDatasetSummary(record: WorkbenchDatasetRecord): DatasetSummary {
  const { rows, targetColumn, taskType } = record;
  if (!rows || rows.length === 0) {
    throw new Error("Cannot summarize empty dataset");
  }

  const rowCount = rows.length;
  const allKeys = Object.keys(rows[0]);
  const featureNames = allKeys.filter((k) => k !== targetColumn);

  const features: FeatureMetadata[] = featureNames.map((col) => {
    const rawValues = rows.map((r) => r[col]);
    const nonNullValues = rawValues.filter((v): v is string | number => v !== null && v !== undefined);
    const missingCount = rawValues.filter((v) => v === null || v === undefined).length;
    const uniqueCount = new Set(nonNullValues).size;

    const isNumeric = nonNullValues.every((v) => typeof v === "number" && !Number.isNaN(v));
    const dtype: "numeric" | "categorical" = isNumeric ? "numeric" : "categorical";

    return {
      name: col,
      dtype,
      missingCount,
      uniqueCount,
      sampleValues: nonNullValues.slice(0, 3),
    };
  });

  let target: TargetMetadata | undefined;
  if (targetColumn) {
    const rawTargets = rows.map((r) => r[targetColumn]).filter((v): v is string | number => v !== null && v !== undefined);
    const uniqueValues = Array.from(new Set(rawTargets));

    if (taskType === "classification") {
      const dist: Record<string, number> = {};
      for (const val of rawTargets) {
        const key = String(val);
        dist[key] = (dist[key] ?? 0) + 1;
      }
      target = {
        name: targetColumn,
        taskType,
        uniqueCount: uniqueValues.length,
        classDistribution: dist,
      };
    } else {
      const numVals = rawTargets.map(Number).filter((n) => !Number.isNaN(n));
      const minVal = numVals.length > 0 ? Math.min(...numVals) : 0;
      const maxVal = numVals.length > 0 ? Math.max(...numVals) : 0;
      const meanVal = numVals.length > 0 ? numVals.reduce((a, b) => a + b, 0) / numVals.length : 0;

      target = {
        name: targetColumn,
        taskType,
        uniqueCount: uniqueValues.length,
        minValue: Number(minVal.toFixed(2)),
        maxValue: Number(maxVal.toFixed(2)),
        meanValue: Number(meanVal.toFixed(2)),
      };
    }
  }

  return {
    id: record.id,
    name: record.name,
    taskType,
    description: record.description,
    rowCount,
    featureCount: features.length,
    features,
    target,
  };
}
