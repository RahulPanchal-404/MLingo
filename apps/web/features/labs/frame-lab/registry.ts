import { runBoosting, type BoostConfig } from "./models/boosting";
import { runKnn, type KnnConfig } from "./models/knn";
import { runPca, type PcaConfig } from "./models/pca";
import { runPoly, type PolyConfig } from "./models/poly";
import { runSvm, type SvmConfig } from "./models/svm";
import { runTree, type TreeConfig } from "./models/tree";
import type { FrameLabDef } from "./types";

const decisionTree: FrameLabDef<TreeConfig> = {
  slug: "decision-tree",
  title: "Decision tree",
  summary: "A tree classifies points by asking yes/no questions about one feature at a time. Each frame adds one question, and the coloured regions show what the tree would predict anywhere on the map.",
  category: "Trees and ensembles",
  theory: "decision-trees",
  code: "decision-trees",
  defaults: { maxSplits: 25, maxDepth: 10, minLeaf: 1, samples: 200, noise: 0.25, seed: 0 },
  fields: [
    { key: "maxSplits", label: "Questions to add", min: 1, max: 60, step: 1, hint: "One frame per question." },
    { key: "maxDepth", label: "Max depth", min: 1, max: 12, step: 1, hint: "How many questions in a row the tree may ask." },
    { key: "minLeaf", label: "Min points per box", min: 1, max: 20, step: 1, hint: "A split is not allowed to leave fewer points than this." },
    { key: "samples", label: "Samples", min: 40, max: 400, step: 10 },
    { key: "noise", label: "Noise", min: 0, max: 0.6, step: 0.01, hint: "More noise means more overlapping, mislabelled-looking points." },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runTree,
  howToRead: [
    "Filled dots are training points; hollow dots are test points the tree never sees while growing.",
    "The background colour is the tree's prediction for that spot. The thick black line is the question added in this frame; thin lines are earlier questions.",
    "The chart on the right tracks accuracy on training points (teal) and test points (amber) after each question.",
  ],
  tryThis: [
    "Play the timeline and watch the two accuracy lines. Training accuracy keeps rising to 100%; find the frame where test accuracy stops improving.",
    "Set Max depth to 3 and train again. The tree can't carve tiny boxes around single noisy points, so the map stays simple.",
    "Raise Min points per box to 10. This is another way to stop the tree memorising noise.",
    "Set Noise to 0. With clean data, a deep tree does no harm.",
  ],
  idea: "At each step the tree tries every possible threshold on every feature and keeps the one that leaves the two sides least mixed. Mixing is measured with Gini impurity: 0 for a box with one class only, 0.5 for a half-and-half mix. Because the questions are always \"feature ≤ value\", the borders are straight and axis-aligned. A tree allowed to keep splitting will eventually give every training point its own box, which is overfitting; limiting depth or leaf size is how you control it.",
};

const boosting: FrameLabDef<BoostConfig> = {
  slug: "gradient-boosting",
  title: "Gradient boosting",
  summary: "Boosting builds a strong model from many small trees. Each new tree is trained on the errors the model still makes, and only a fraction of its correction is added.",
  category: "Trees and ensembles",
  theory: "gradient-boosting",
  code: "gradient-boosting",
  defaults: { trees: 60, learningRate: 0.3, depth: 2, samples: 80, noise: 0.3, seed: 0 },
  fields: [
    { key: "trees", label: "Trees", min: 1, max: 200, step: 1, hint: "One frame per tree." },
    { key: "learningRate", label: "Learning rate", min: 0.01, max: 1, step: 0.01, hint: "Share of each tree's correction that is added." },
    { key: "depth", label: "Tree depth", min: 1, max: 4, step: 1, hint: "1 means each tree asks a single question (a stump)." },
    { key: "samples", label: "Samples", min: 20, max: 300, step: 10 },
    { key: "noise", label: "Noise", min: 0, max: 0.8, step: 0.01 },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runBoosting,
  howToRead: [
    "The dashed curve is the true pattern; the solid curve is the model so far. Filled dots are training points, hollow dots are test points.",
    "Grey vertical lines are the current errors (residuals) on training points. The next tree is fitted to exactly these.",
    "The chart shows training error (teal) and test error (amber) after each tree.",
  ],
  tryThis: [
    "Scrub through the first 10 trees. The curve is built up from flat steps, because each small tree can only output a few constant values.",
    "Set Learning rate to 1. The early trees jump much further, and test error starts rising sooner.",
    "Set Learning rate to 0.05 and Trees to 200. Learning is slower but usually reaches a lower test error.",
    "Find the tree count where test error is lowest. Stopping there is called early stopping.",
  ],
  idea: "Each tree is weak on its own, but every new one is trained to predict what the model still gets wrong, so the errors shrink step by step. The learning rate (shrinkage) scales each tree's contribution down, which makes training slower but less likely to overfit. With squared error, the residuals are exactly the negative gradient of the loss, which is why it is called gradient boosting. XGBoost and LightGBM are fast, regularised versions of this idea.",
};

const knn: FrameLabDef<KnnConfig> = {
  slug: "k-nearest-neighbours",
  title: "K-nearest neighbours",
  summary: "KNN has no training step: to classify a point it looks at the k closest training points and takes a vote. Each frame uses a larger k, so you can see how k shapes the border.",
  category: "Classification",
  theory: "k-nearest-neighbors",
  code: "k-nearest-neighbors",
  defaults: { maxK: 61, samples: 200, noise: 0.3, seed: 0 },
  fields: [
    { key: "maxK", label: "Largest k", min: 3, max: 99, step: 2, hint: "Frames run k = 1, 3, 5 … up to this." },
    { key: "samples", label: "Samples", min: 40, max: 400, step: 10 },
    { key: "noise", label: "Noise", min: 0, max: 0.6, step: 0.01 },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runKnn,
  howToRead: [
    "The background shows which class KNN would predict at every spot on the map.",
    "Filled dots are the training points that vote; hollow dots are test points used only to measure accuracy.",
    "The chart shows training and test accuracy for each k.",
  ],
  tryThis: [
    "Look at k = 1. Training accuracy is 100%, because every training point is its own nearest neighbour, but the map has islands around noisy points.",
    "Play to the end. Very large k makes the border too smooth to follow the moons, and both accuracies fall.",
    "Find the k with the best test accuracy. That is the value cross-validation would pick.",
    "Set Noise to 0.05. With clean data, small k works well.",
  ],
  idea: "KNN assumes that nearby points share a label. Small k follows the training data closely, including its noise (high variance, overfitting). Large k averages over many neighbours and blurs the real border (high bias, underfitting). Because it compares distances, features must be on similar scales, and prediction gets slow on large datasets because every new point is compared with all training points.",
};

const svm: FrameLabDef<SvmConfig> = {
  slug: "support-vector-machine",
  title: "Support vector machine",
  summary: "A linear SVM looks for the boundary with the widest gap (margin) between the classes. Each frame is one training update; only the points on or inside the margin move the boundary.",
  category: "Classification",
  theory: "support-vector-machines",
  code: "support-vector-machines",
  defaults: { epochs: 80, C: 10, learningRate: 0.05, samples: 80, spread: 0.6, seed: 0 },
  fields: [
    { key: "epochs", label: "Updates", min: 5, max: 300, step: 5, hint: "One frame per update." },
    { key: "C", label: "C (error penalty)", min: 0.1, max: 100, step: 0.1, hint: "High C: avoid errors. Low C: prefer a wide margin." },
    { key: "learningRate", label: "Learning rate", min: 0.005, max: 1, step: 0.005 },
    { key: "samples", label: "Samples", min: 20, max: 300, step: 10 },
    { key: "spread", label: "Class spread", min: 0.2, max: 1.5, step: 0.05, hint: "Larger spread makes the classes overlap." },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runSvm,
  howToRead: [
    "The solid line is the decision boundary; the dashed lines are the edges of the margin on each side.",
    "Ringed points are support vectors: on or inside the margin. They are the only points that affect the boundary.",
    "The chart shows the objective being minimised: ½‖w‖² (which rewards a wide margin) plus C times the hinge loss (which punishes points inside the margin).",
  ],
  tryThis: [
    "Set C to 0.5. The margin gets wider and more points sit inside it: the model accepts some errors for a simpler boundary.",
    "Set C to 100. The margin narrows to squeeze points out of it.",
    "Raise Class spread to 1.2. When the classes overlap, no line separates them perfectly, and C decides the trade-off.",
    "Count the ringed points at the end: usually only a handful of points decide where the line goes.",
  ],
  idea: "Many lines can separate two groups; an SVM picks the one furthest from both. The margin width is 2/‖w‖, so keeping the weights small widens it. The hinge loss max(0, 1 − y·(w·x + b)) is zero for points safely outside the margin, which is why only support vectors matter. C sets how much errors cost compared with margin width. With a kernel, the same idea draws curved boundaries.",
};

const pca: FrameLabDef<PcaConfig> = {
  slug: "pca",
  title: "Principal component analysis",
  summary: "PCA finds the direction along which the data varies most. Here it is found by power iteration: start from a random direction and repeatedly multiply it by the covariance matrix. Each frame is one multiplication.",
  category: "Unsupervised learning",
  theory: "pca",
  code: "pca",
  defaults: { iterations: 10, angle: 30, stretch: 2, samples: 150, seed: 0 },
  fields: [
    { key: "iterations", label: "Steps", min: 1, max: 30, step: 1 },
    { key: "angle", label: "Cloud angle (°)", min: -90, max: 90, step: 1, hint: "Direction the data is stretched in." },
    { key: "stretch", label: "Stretch", min: 1, max: 6, step: 0.1, hint: "How much longer the cloud is than it is wide." },
    { key: "samples", label: "Samples", min: 20, max: 400, step: 10 },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runPca,
  howToRead: [
    "Each dot is one sample with two features, shifted so the average is at the centre.",
    "The solid line is the current direction; the grey lines show where each point lands when projected onto it.",
    "The chart shows what share of the total variance survives the projection.",
  ],
  tryThis: [
    "Step through from the start. The direction swings towards the long axis of the cloud and the share of variance rises.",
    "Set Stretch to 1.1. The cloud is nearly round, so no direction stands out: convergence is slow and PC1 keeps barely more than half of the variance.",
    "Set Stretch to 5. One direction dominates, and keeping only PC1 loses very little.",
  ],
  idea: "PCA rotates the axes so that the first new axis (principal component 1) captures as much spread as possible, the second captures the most of what remains, and so on. The components are the eigenvectors of the covariance matrix, and the variance along each is its eigenvalue. Dropping the low-variance components compresses the data with little loss, which is used for visualisation, noise reduction and speeding up other models. Always standardize features first, or the feature with the largest units dominates.",
};

const poly: FrameLabDef<PolyConfig> = {
  slug: "polynomial-regularization",
  title: "Polynomial regression and regularization",
  summary: "A curve with more terms can bend more. Each frame raises the polynomial degree by one, so you can watch the fit go from too simple to too wiggly, and see how a ridge penalty holds it back.",
  category: "Regression",
  theory: "regularization",
  code: "regularization",
  defaults: { maxDegree: 12, logLambda: -9, samples: 30, noise: 0.25, seed: 0 },
  fields: [
    { key: "maxDegree", label: "Highest degree", min: 2, max: 14, step: 1, hint: "Frames run degree 1, 2, 3 … up to this." },
    { key: "logLambda", label: "Penalty log₁₀ λ", min: -9, max: 1, step: 0.5, hint: "−9 means no penalty. −2 means λ = 0.01." },
    { key: "samples", label: "Samples", min: 10, max: 200, step: 5 },
    { key: "noise", label: "Noise", min: 0, max: 0.8, step: 0.01 },
    { key: "seed", label: "Seed", min: 0, max: 50, step: 1 },
  ],
  run: runPoly,
  howToRead: [
    "The dashed curve is the true pattern, a sine wave. The solid curve is the fitted polynomial.",
    "Filled dots are training points; hollow dots are test points the fit never sees.",
    "The chart shows training error (teal) and test error (amber) for each degree.",
  ],
  tryThis: [
    "Play through the degrees. Training error only goes down, but test error falls, flattens, then rises: the classic U shape.",
    "Look at degree 12 with no penalty: the curve swings wildly between training points.",
    "Set the penalty to −2 and train again. The high-degree curves stay smooth and test error stops exploding.",
    "Set Samples to 150. With more data, high degrees overfit much less.",
  ],
  idea: "A degree-d polynomial has d + 1 weights. More weights make the model more flexible, so it fits the training points better, but past a point it starts fitting the noise too, which is overfitting. Ridge regularization adds λ × (sum of squared weights) to the error, so large weights cost something and the curve stays smooth. The right degree or λ is the one with the lowest error on data the model hasn't seen.",
};

export const FRAME_LABS = [poly, knn, svm, decisionTree, boosting, pca] as const;
export type AnyFrameLab = (typeof FRAME_LABS)[number];
export const getFrameLab = (slug: string): AnyFrameLab | undefined => FRAME_LABS.find((l) => l.slug === slug);
