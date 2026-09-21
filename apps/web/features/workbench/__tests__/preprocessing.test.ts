import { describe, expect, it } from "vitest";
import { fitPreprocessing, transformWithPipeline } from "../preprocessing";
import type { PreprocessingConfig } from "../types";

describe("Preprocessing Pipeline & Leakage Isolation", () => {
  it("fits standard scaler strictly on training split and transforms test data with training parameters", () => {
    // Training partition: mean = 10, std = 2
    const trainRows = [
      { x: 8, target: 1 },
      { x: 10, target: 1 },
      { x: 12, target: 2 },
    ];
    // Test partition: extreme values that should NOT change the training mean/std
    const testRows = [
      { x: 4, target: 1 },
      { x: 16, target: 2 },
    ];

    const config: PreprocessingConfig = {
      numericScaling: "standard",
      missingImputation: "none",
      categoricalEncoding: "none",
    };

    const pipeline = fitPreprocessing(trainRows, config, "target");

    expect(pipeline.scaler?.means?.["x"]).toBeCloseTo(10, 2);

    const transformedTrain = transformWithPipeline(trainRows, pipeline, "target");
    const transformedTest = transformWithPipeline(testRows, pipeline, "target");

    // Train values should be standardized to unit scale
    expect(transformedTrain[1].x).toBeCloseTo(0, 2); // 10 -> 0

    // Test values must be scaled using train mean (10)
    expect(transformedTest[0].x).toBeLessThan(0); // 4 -> negative
    expect(transformedTest[1].x).toBeGreaterThan(0); // 16 -> positive

    // Target must remain unmodified
    expect(transformedTrain[0].target).toBe(1);
    expect(transformedTest[1].target).toBe(2);
  });

  it("fits min-max scaler on training split", () => {
    const trainRows = [{ x: 10 }, { x: 20 }, { x: 30 }];
    const testRows = [{ x: 0 }, { x: 40 }];

    const config: PreprocessingConfig = {
      numericScaling: "minmax",
      missingImputation: "none",
      categoricalEncoding: "none",
    };

    const pipeline = fitPreprocessing(trainRows, config);
    expect(pipeline.scaler?.mins?.["x"]).toBe(10);
    expect(pipeline.scaler?.maxs?.["x"]).toBe(30);

    const transformedTrain = transformWithPipeline(trainRows, pipeline);
    const transformedTest = transformWithPipeline(testRows, pipeline);

    expect(transformedTrain[0].x).toBe(0);
    expect(transformedTrain[2].x).toBe(1);

    // Test out of bounds: 0 -> (0-10)/20 = -0.5
    expect(transformedTest[0].x).toBe(-0.5);
    // 40 -> (40-10)/20 = 1.5
    expect(transformedTest[1].x).toBe(1.5);
  });

  it("imputes missing values using training mean/mode only", () => {
    const trainRows = [
      { num: 2, cat: "A" },
      { num: 4, cat: "B" },
      { num: null, cat: "A" },
    ];
    const testRows = [{ num: null, cat: null }];

    const config: PreprocessingConfig = {
      numericScaling: "none",
      missingImputation: "mean_mode",
      categoricalEncoding: "none",
    };

    const pipeline = fitPreprocessing(trainRows, config);
    expect(pipeline.imputer?.means["num"]).toBe(3); // (2+4)/2 = 3
    expect(pipeline.imputer?.modes["cat"]).toBe("A"); // "A" is mode

    const transformedTest = transformWithPipeline(testRows, pipeline);
    expect(transformedTest[0].num).toBe(3);
  });

  it("one-hot encodes nominal categories learned from train", () => {
    const trainRows = [{ city: "Mysuru" }, { city: "Bengaluru" }, { city: "Mysuru" }];
    const testRows = [{ city: "Bengaluru" }, { city: "Unknown" }];

    const config: PreprocessingConfig = {
      numericScaling: "none",
      missingImputation: "none",
      categoricalEncoding: "onehot",
    };

    const pipeline = fitPreprocessing(trainRows, config);
    expect(pipeline.encoder?.categories["city"]).toEqual(["Bengaluru", "Mysuru"]);

    const transformedTrain = transformWithPipeline(trainRows, pipeline);
    expect(transformedTrain[0]["city_Mysuru"]).toBe(1);
    expect(transformedTrain[0]["city_Bengaluru"]).toBe(0);

    const transformedTest = transformWithPipeline(testRows, pipeline);
    // Unknown category should have 0 across all learned indicator columns
    expect(transformedTest[1]["city_Mysuru"]).toBe(0);
    expect(transformedTest[1]["city_Bengaluru"]).toBe(0);
  });
});
