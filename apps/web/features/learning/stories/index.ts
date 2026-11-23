import { story as dbscan } from "./dbscan";
import { story as decisionTrees } from "./decision-trees";
import { story as derivativesChainRule } from "./derivatives-chain-rule";
import { story as gradientDescent } from "./gradient-descent";
import { story as hierarchicalClustering } from "./hierarchical-clustering";
import { story as howModelsLearn } from "./how-models-learn";
import { story as kMeans } from "./k-means";
import { story as kNearestNeighbors } from "./k-nearest-neighbors";
import { story as learningRate } from "./learning-rate";
import { story as linearRegression } from "./linear-regression";
import { story as logisticRegression } from "./logistic-regression";
import { story as lossFunctions } from "./loss-functions";
import { story as partialDerivativesGradients } from "./partial-derivatives-gradients";
import { story as polynomialRegression } from "./polynomial-regression";
import { story as probabilityStatistics } from "./probability-statistics";
import { story as pythonNumpyPandas } from "./python-numpy-pandas";
import { story as pythonPlottingSklearn } from "./python-plotting-sklearn";
import { story as regularization } from "./regularization";
import { story as vectorsMatricesNotation } from "./vectors-matrices-notation";
import { story as whatIsMachineLearning } from "./what-is-machine-learning";

/** Long-form, story-led introductions that open each Learn lesson, keyed by lesson slug. */
export const STORIES: Record<string, string> = {
  "dbscan": dbscan,
  "decision-trees": decisionTrees,
  "derivatives-chain-rule": derivativesChainRule,
  "gradient-descent": gradientDescent,
  "hierarchical-clustering": hierarchicalClustering,
  "how-models-learn": howModelsLearn,
  "k-means": kMeans,
  "k-nearest-neighbors": kNearestNeighbors,
  "learning-rate": learningRate,
  "linear-regression": linearRegression,
  "logistic-regression": logisticRegression,
  "loss-functions": lossFunctions,
  "partial-derivatives-gradients": partialDerivativesGradients,
  "polynomial-regression": polynomialRegression,
  "probability-statistics": probabilityStatistics,
  "python-numpy-pandas": pythonNumpyPandas,
  "python-plotting-sklearn": pythonPlottingSklearn,
  "regularization": regularization,
  "vectors-matrices-notation": vectorsMatricesNotation,
  "what-is-machine-learning": whatIsMachineLearning,
};
