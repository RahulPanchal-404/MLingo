import { describe, expect, it } from "vitest";
import { splitTrainTest } from "../split";

describe("Train/Test Deterministic Splitter", () => {
  it("splits dataset into disjoint partitions with correct proportions", () => {
    const data = Array.from({ length: 20 }, (_, i) => ({ id: i }));
    const { train, test } = splitTrainTest(data, { trainRatio: 0.8, seed: 42 });

    expect(train).toHaveLength(16);
    expect(test).toHaveLength(4);

    const trainIds = new Set(train.map((d) => d.id));
    const testIds = new Set(test.map((d) => d.id));

    // Zero overlap
    for (const id of testIds) {
      expect(trainIds.has(id)).toBe(false);
    }

    // Complete coverage
    expect(train.length + test.length).toBe(20);
  });

  it("is reproducible given the same seed and ratio", () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    const res1 = splitTrainTest(data, { trainRatio: 0.75, seed: 12345 });
    const res2 = splitTrainTest(data, { trainRatio: 0.75, seed: 12345 });

    expect(res1.train).toEqual(res2.train);
    expect(res1.test).toEqual(res2.test);
  });

  it("produces different splits with different seeds", () => {
    const data = Array.from({ length: 50 }, (_, i) => ({ id: i }));

    const res1 = splitTrainTest(data, { trainRatio: 0.8, seed: 1 });
    const res2 = splitTrainTest(data, { trainRatio: 0.8, seed: 999 });

    expect(res1.train).not.toEqual(res2.train);
  });

  it("throws validation errors on invalid inputs", () => {
    expect(() => splitTrainTest([{ id: 1 }], { trainRatio: 0.8, seed: 1 })).toThrow(
      "at least 2 samples"
    );
    expect(() => splitTrainTest([{ id: 1 }, { id: 2 }], { trainRatio: 1.2, seed: 1 })).toThrow(
      "strictly between 0 and 1"
    );
  });
});
