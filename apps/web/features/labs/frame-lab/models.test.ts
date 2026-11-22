import { describe, expect, it } from "vitest";

import { runBoosting } from "./models/boosting";
import { runKnn } from "./models/knn";
import { runPca } from "./models/pca";
import { runPoly } from "./models/poly";
import { runSvm } from "./models/svm";
import { runTree } from "./models/tree";

const m = (run: { frames: { metrics: Record<string, number> }[] }, k: string) => run.frames.map((f) => f.metrics[k]);
const show = (name: string, xs: number[]) => console.log(name, xs.map((v) => Number(v.toFixed(3))).join(" "));

describe("frame lab models", () => {
  it("decision tree: training accuracy climbs to 100% while test accuracy peaks earlier", () => {
    const run = runTree({ maxSplits: 30, maxDepth: 12, minLeaf: 1, samples: 200, noise: 0.25, seed: 0 });
    show("tree train", m(run, "train")); show("tree test", m(run, "test"));
    expect(m(run, "train").at(-1)).toBe(1);
    expect(Math.max(...m(run, "test"))).toBeGreaterThan(m(run, "test").at(-1)! - 1e-9);
    expect(run.frames[1].segments).toHaveLength(1);
  });
  it("gradient boosting: training error falls with every tree", () => {
    const run = runBoosting({ trees: 60, learningRate: 0.3, depth: 2, samples: 80, noise: 0.3, seed: 0 });
    show("boost train", m(run, "train").filter((_, i) => i % 6 === 0)); show("boost test", m(run, "test").filter((_, i) => i % 6 === 0));
    const tr = m(run, "train");
    tr.slice(1).forEach((v, i) => expect(v).toBeLessThanOrEqual(tr[i] + 1e-9));
    expect(tr.at(-1)!).toBeLessThan(tr[0] / 4);
  });
  it("knn: k = 1 is perfect on training data", () => {
    const run = runKnn({ maxK: 51, samples: 200, noise: 0.3, seed: 0 });
    show("knn train", m(run, "train")); show("knn test", m(run, "test"));
    expect(m(run, "train")[0]).toBe(1);
  });
  it("svm: objective goes down and margins form", () => {
    const run = runSvm({ epochs: 60, C: 10, learningRate: 0.5, samples: 80, spread: 0.6, seed: 0 });
    show("svm obj", m(run, "objective").filter((_, i) => i % 6 === 0)); show("svm width", m(run, "width").filter((_, i) => i % 6 === 0));
    expect(m(run, "objective").at(-1)!).toBeLessThan(m(run, "objective")[1]);
    expect(run.frames.at(-1)!.curves).toHaveLength(3);
  });
  it("pca: power iteration converges to the most stretched direction", () => {
    const run = runPca({ iterations: 12, angle: 30, stretch: 3, samples: 120, seed: 0 });
    show("pca share", m(run, "share")); show("pca angle", m(run, "angle"));
    expect(m(run, "angle").at(-1)!).toBeLessThan(0.5);
    expect(m(run, "share").at(-1)!).toBeGreaterThan(0.8);
  });
  it("polynomial: test error is U-shaped in the degree", () => {
    const run = runPoly({ maxDegree: 12, logLambda: -9, samples: 30, noise: 0.25, seed: 0 });
    show("poly train", m(run, "train")); show("poly test", m(run, "test"));
    const te = m(run, "test");
    const best = te.indexOf(Math.min(...te));
    expect(best).toBeGreaterThan(0);
    expect(te.at(-1)!).toBeGreaterThan(te[best]);
    const ridge = runPoly({ maxDegree: 12, logLambda: -2, samples: 30, noise: 0.25, seed: 0 });
    show("ridge test", m(ridge, "test"));
    expect(m(ridge, "test").at(-1)!).toBeLessThan(te.at(-1)!);
  });
});
