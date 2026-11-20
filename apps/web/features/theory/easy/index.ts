import type { EasyTopic } from "./types";
import { DERIVATIVES, PARTIALS, PROBABILITY } from "./calc";
import { GD, GDV, HML, LOSS, LR, RL, WIML } from "./foundations";
import { LINEAR_ALGEBRA, VECTORS } from "./prereqs";
import { DIAGNOSTICS, LINEAR, METRICS, MULTIPLE, POLY, REGULARIZATION, TREE_KNN } from "./regression";
import { NUMPY_PANDAS, PLOTTING_SKLEARN, STATS_INFERENCE } from "./python";

/** The easy layer, by theory slug. */
export const EASY: Record<string, EasyTopic> = {
  "vectors-matrices-notation": VECTORS,
  "linear-algebra-for-ml": LINEAR_ALGEBRA,
  "derivatives-chain-rule": DERIVATIVES,
  "partial-derivatives-gradients": PARTIALS,
  "probability-statistics": PROBABILITY,
  "python-numpy-pandas": NUMPY_PANDAS,
  "python-plotting-sklearn": PLOTTING_SKLEARN,
  "statistics-inference": STATS_INFERENCE,
  "what-is-machine-learning": WIML,
  "how-models-learn": HML,
  "loss-functions": LOSS,
  "gradient-descent": GD,
  "gradient-descent-variants": GDV,
  "learning-rate": LR,
  "reinforcement-learning": RL,
  "linear-regression": LINEAR,
  "multiple-linear-regression": MULTIPLE,
  "polynomial-regression": POLY,
  "regression-diagnostics": DIAGNOSTICS,
  "regression-metrics": METRICS,
  "regularization": REGULARIZATION,
  "tree-knn-regression": TREE_KNN,
};
