import { story as adaboostXgboost } from "./adaboost-xgboost";
import { story as classificationMetrics } from "./classification-metrics";
import { story as ensembleMethods } from "./ensemble-methods";
import { story as gradientBoosting } from "./gradient-boosting";
import { story as gradientDescentVariants } from "./gradient-descent-variants";
import { story as linearAlgebraForMl } from "./linear-algebra-for-ml";
import { story as multiclassSoftmax } from "./multiclass-softmax";
import { story as multipleLinearRegression } from "./multiple-linear-regression";
import { story as naiveBayes } from "./naive-bayes";
import { story as randomForests } from "./random-forests";
import { story as regressionDiagnostics } from "./regression-diagnostics";
import { story as regressionMetrics } from "./regression-metrics";
import { story as rocAucCalibration } from "./roc-auc-calibration";
import { story as statisticsInference } from "./statistics-inference";
import { story as supportVectorMachines } from "./support-vector-machines";
import { story as treeKnnRegression } from "./tree-knn-regression";

/** Story-led openings for the theory pages, keyed by topic slug. */
export const THEORY_STORIES: Record<string, string> = {
  "adaboost-xgboost": adaboostXgboost,
  "classification-metrics": classificationMetrics,
  "ensemble-methods": ensembleMethods,
  "gradient-boosting": gradientBoosting,
  "gradient-descent-variants": gradientDescentVariants,
  "linear-algebra-for-ml": linearAlgebraForMl,
  "multiclass-softmax": multiclassSoftmax,
  "multiple-linear-regression": multipleLinearRegression,
  "naive-bayes": naiveBayes,
  "random-forests": randomForests,
  "regression-diagnostics": regressionDiagnostics,
  "regression-metrics": regressionMetrics,
  "roc-auc-calibration": rocAucCalibration,
  "statistics-inference": statisticsInference,
  "support-vector-machines": supportVectorMachines,
  "tree-knn-regression": treeKnnRegression,
};
