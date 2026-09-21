import type { DataQualityReport } from "./types";

export function analyzeDataQuality(
  rows: Array<Record<string, string | number | null>>,
  targetColumn?: string
): DataQualityReport {
  if (!rows || rows.length === 0) {
    throw new Error("Cannot analyze quality of empty rows");
  }

  const allColumns = Object.keys(rows[0]);
  let totalMissing = 0;
  const colsWithMissing: string[] = [];
  const constantCols: string[] = [];
  const numericCols: string[] = [];
  const categoricalCols: string[] = [];

  for (const col of allColumns) {
    const values = rows.map((r) => r[col]);
    const missing = values.filter((v) => v === null || v === undefined).length;
    totalMissing += missing;
    if (missing > 0) {
      colsWithMissing.push(col);
    }

    const nonNulls = values.filter((v): v is string | number => v !== null && v !== undefined);
    const unique = new Set(nonNulls);
    if (unique.size <= 1 && rows.length > 1) {
      constantCols.push(col);
    }

    const isNumeric = nonNulls.every((v) => typeof v === "number" && !Number.isNaN(v));
    if (isNumeric) {
      numericCols.push(col);
    } else {
      categoricalCols.push(col);
    }
  }

  // Detect duplicates
  const serializedSet = new Set<string>();
  let duplicateCount = 0;
  for (const row of rows) {
    const key = JSON.stringify(Object.entries(row).sort());
    if (serializedSet.has(key)) {
      duplicateCount += 1;
    } else {
      serializedSet.add(key);
    }
  }

  // Class balance if classification
  let classBalance: Record<string, number> | undefined;
  if (targetColumn && allColumns.includes(targetColumn)) {
    const targetValues = rows
      .map((r) => r[targetColumn])
      .filter((v): v is string | number => v !== null && v !== undefined);
    const uniqueTargets = Array.from(new Set(targetValues));
    if (uniqueTargets.length === 2 && targetValues.length > 0) {
      classBalance = {};
      for (const t of uniqueTargets) {
        const count = targetValues.filter((v) => v === t).length;
        classBalance[String(t)] = Number((count / targetValues.length).toFixed(3));
      }
    }
  }

  return {
    totalMissingValues: totalMissing,
    columnsWithMissing: colsWithMissing,
    duplicateRowsCount: duplicateCount,
    constantColumns: constantCols,
    numericColumns: numericCols,
    categoricalColumns: categoricalCols,
    classBalance,
  };
}
