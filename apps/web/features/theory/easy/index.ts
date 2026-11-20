import type { EasyTopic } from "./types";
import { DERIVATIVES, PARTIALS, PROBABILITY } from "./calc";
import { KNN, LOGISTIC, SOFTMAX, TREES } from "./classification1";
import { CMETRICS, NB, ROC, SVM } from "./classification2";
import { ADAXGB, ENSEMBLE, FOREST, GBOOST } from "./classification3";
import { GD, GDV, HML, LOSS, LR, RL, WIML } from "./foundations";
import { LINEAR_ALGEBRA, VECTORS } from "./prereqs";
import { DBSCAN, HIER, KMEANS, PCA } from "./unsupervised";
import { NEURAL, TRAIN_NN } from "./neural";
import { BIASVAR, SCALING, SPLIT } from "./workflow1";
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
  "logistic-regression": LOGISTIC,
  "multiclass-softmax": SOFTMAX,
  "k-nearest-neighbors": KNN,
  "decision-trees": TREES,
  "classification-metrics": CMETRICS,
  "roc-auc-calibration": ROC,
  "naive-bayes": NB,
  "support-vector-machines": SVM,
  "random-forests": FOREST,
  "gradient-boosting": GBOOST,
  "adaboost-xgboost": ADAXGB,
  "ensemble-methods": ENSEMBLE,
  "k-means": KMEANS,
  "hierarchical-clustering": HIER,
  "dbscan": DBSCAN,
  "pca": PCA,
  "neural-networks": NEURAL,
  "training-neural-networks": TRAIN_NN,
  "feature-scaling": SCALING,
  "train-test-split": SPLIT,
  "bias-variance": BIASVAR,
};
