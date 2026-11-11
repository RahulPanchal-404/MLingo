import type { Concept } from "./framework/types";

/** Game level → the concept it teaches. Keyed by `${gameId}:${levelId}`. */
export const CONCEPTS: Record<string, Concept> = {
  "bridge:line": {
    title: "Linear regression",
    href: "/learn/linear-regression",
    played: "Your straight bridge was the model ŷ = w·x + b: the height of its left and right ends set the slope w and the bias b. The red lines were the errors, and the score compared your error with the least-squares line.",
    matters: "Linear regression is the first model for any 'predict a number' problem, and the least-squares idea (make the squared errors small) underlies almost every model you'll train.",
  },
  "bridge:degree": {
    title: "Polynomial regression and overfitting",
    href: "/learn/polynomial-regression",
    played: "Bendiness was the polynomial degree. Low degrees couldn't follow the canyon (underfit). High degrees hit every pillar but wiggled between them, so test trucks fell (overfit). The best bridge had the lowest test error, not the lowest training error.",
    matters: "Choosing model complexity is the central decision in ML, and it must be made on held-out data.",
  },
  "bridge:ridge": {
    title: "Ridge regularization",
    href: "/learn/regularization",
    played: "Stiffness was λ in Ridge regression. With λ near zero the degree-12 bridge wiggled through every pillar; with a huge λ it went flat. The right λ kept the shape without the wiggles.",
    matters: "Regularization lets you use a flexible model without overfitting. Tuning λ on validation data is routine in practice.",
  },
  "bridge:lasso": {
    title: "Lasso and feature selection",
    href: "/learn/regularization",
    played: "Each beam was a feature and its thickness its weight. Raising Lasso's λ cut junk beams (weights became exactly zero) while the real ones survived, until λ got so big it cut real beams too.",
    matters: "Lasso gives simpler, more explainable models and automatically drops irrelevant features.",
  },
  "sorter:knn": {
    title: "K-Nearest Neighbours",
    href: "/learn/k-nearest-neighbors",
    played: "Each spot on the map was sorted by a vote of its K nearest known creatures. K = 1 copied single creatures, including mislabelled ones (jagged map, worse on new arrivals). Very large K blurred everything. The middle won.",
    matters: "KNN shows the bias–variance trade-off with a single dial, and it's the idea behind similarity search and recommendations.",
  },
  "sorter:scale": {
    title: "Feature scaling for distance-based models",
    href: "/learn/k-nearest-neighbors",
    played: "Weight in grams had numbers in the hundreds, so raw distances ignored wing length, which actually decided the species. Putting features in the same units (standardizing) fixed it instantly.",
    matters: "KNN, K-Means and SVMs all measure distance. Always standardize features before using them.",
  },
  "sorter:tree": {
    title: "Decision tree splits and Gini impurity",
    href: "/learn/decision-trees",
    played: "At each node you chose the question that split the group into the purest halves. The score was the impurity (Gini) drop of your question compared with the best one available.",
    matters: "This greedy 'best question first' search is exactly how decision trees, random forests and gradient boosting build their trees.",
  },
  "sorter:depth": {
    title: "Tree depth and overfitting",
    href: "/learn/decision-trees",
    played: "Deep trees kept asking questions until every region held one creature: 100% on known creatures, worse on new ones. Shallow trees couldn't follow the shape. The best depth was in between.",
    matters: "Max depth (and min samples per leaf) is the main control against overfitting in tree models.",
  },
  "galaxy:dendro": {
    title: "Hierarchical clustering and dendrograms",
    href: "/learn/hierarchical-clustering",
    played: "The family tree recorded every merge of the closest groups and the distance at which it happened. Your cut height decided how many galaxies you got: the best cut sat in the biggest gap.",
    matters: "Dendrograms show structure at every scale and let you pick the number of clusters after seeing the data.",
  },
  "galaxy:linkage": {
    title: "Linkage methods",
    href: "/learn/hierarchical-clustering",
    played: "Single linkage (closest pair) followed long streams and rings but glued galaxies together through a thin bridge. Complete linkage (farthest pair) kept them compact.",
    matters: "The linkage choice can completely change hierarchical clustering results, so match it to the shape of your data.",
  },
  "galaxy:eps": {
    title: "DBSCAN and the eps radius",
    href: "/learn/dbscan",
    played: "ε was how far each star's light reached. Stars within reach of dense stars chained into one galaxy. Too small and everything was noise; too large and galaxies merged.",
    matters: "DBSCAN finds clusters of any shape without choosing K, but ε has to suit the data's density.",
  },
  "galaxy:noise": {
    title: "Outliers and minPts",
    href: "/learn/dbscan",
    played: "minPts set how many neighbours a star needed to count as dense. Raising it marked lonely dust as noise instead of forcing it into a galaxy.",
    matters: "DBSCAN is widely used for anomaly detection because it labels points in sparse regions as outliers.",
  },
  "descent:eyeball": {
    title: "Gradient descent",
    href: "/learn/gradient-descent",
    played: "You were the skier in the fog: you couldn't see the bottom, only the slope under your feet, and you jumped the opposite way to it. The mountain was the loss, your position was the model's weight, and the slope reading was the gradient.",
    matters: "A real model never sees the whole loss landscape either. All it can compute is the gradient where it stands, so training is exactly this: step against the gradient, again and again, until the loss stops falling.",
  },
  "descent:step-size": {
    title: "Learning rate",
    href: "/learn/learning-rate",
    played: "Your jump power was the learning rate. Too weak and you ran out of fuel (training too slow), too strong and each jump overshot further than the last until you flew into the lava (divergence). Steeper mountains needed gentler jumps.",
    matters: "Picking the learning rate is the most common tuning job in ML. When a training loss explodes to NaN or barely moves, the learning rate is the first thing to check.",
  },
  "descent:ravine": {
    title: "Feature scaling for gradient descent",
    href: "/learn/gradient-descent",
    played: "The canyon was what the loss looks like when one feature has much bigger numbers than another. A jump big enough to move along the canyon smashed you into the walls. Waxing the skis (standardizing) turned the canyon into a round bowl.",
    matters: "Real datasets mix scales (age in years, income in lakhs). Without standardization gradient descent zig-zags and crawls; with it, one learning rate works for every feature.",
  },
  "descent:trap": {
    title: "Local minima and momentum",
    href: "/learn/gradient-descent",
    played: "The small dip was a local minimum: the slope there is flat, so plain gradient descent stopped. Momentum boots kept part of your previous speed and carried you over the bump to the deep valley.",
    matters: "Neural-network losses are full of dips and flat stretches. Optimizers used in practice (SGD with momentum, Adam) all carry momentum for exactly this reason.",
  },
  "threshold:sigmoid": {
    title: "Logistic regression and the decision threshold",
    href: "/learn/logistic-regression",
    played: "The oracle's suspicion bar was a classifier's predicted probability. Your gate level was the threshold that turns that probability into a yes or no decision.",
    matters: "Logistic regression and most classifiers output probabilities, not decisions. Someone has to choose the cut-off, and 0.5 is only a default.",
  },
  "threshold:balanced": {
    title: "False positives vs false negatives",
    href: "/labs/logistic-regression",
    played: "When the oracle was unsure, monsters and villagers overlapped. Lowering the gate refused more villagers (false positives); raising it let in more monsters (false negatives). You can't remove both.",
    matters: "Every real classifier faces this trade-off. The confusion matrix counts these two mistakes, and moving the threshold trades one for the other.",
  },
  "threshold:screening": {
    title: "Cost-sensitive thresholds",
    href: "/challenges/threshold-tradeoff",
    played: "A plague carrier getting in cost 25 times more than refusing a healthy traveller, so the best gate was low: you accepted many false alarms to stop the expensive misses. Accuracy went down while damage went down.",
    matters: "Medical screening, fraud and safety systems all set thresholds from the cost of each mistake, not from accuracy. A missed cancer is not the same as an extra test.",
  },
  "threshold:fraud": {
    title: "Class imbalance and the accuracy trap",
    href: "/challenges/threshold-tradeoff",
    played: "Only 1 merchant in 20 was a spy, so letting everyone in was already 95% accurate and caught nobody. You had to judge by spies caught and damage, not accuracy.",
    matters: "Fraud, disease and defects are rare. On imbalanced data accuracy hides a useless model; recall, precision and costs show the truth.",
  },
  "clusters:elbow": {
    title: "Choosing K (the elbow method)",
    href: "/learn/k-means",
    played: "Walking distance was the inertia (total squared distance to the nearest centroid) and each dog was one cluster. More dogs always meant less walking, so you used the point where another dog stopped saving much: the elbow.",
    matters: "K-Means can't tell you how many clusters exist. The elbow on the inertia curve is the standard first way to pick K.",
  },
  "clusters:start": {
    title: "K-Means initialization",
    href: "/challenges/stable-clustering",
    played: "Each whistle was one K-Means step: assign every sheep to its nearest dog, then move each dog to the middle of its flock. When two dogs started in one flock they split it and never moved again: a bad local optimum.",
    matters: "K-Means results depend on the starting centroids. Libraries use k-means++ and several restarts by default to avoid exactly this.",
  },
  "clusters:units": {
    title: "Feature scaling for clustering",
    href: "/learn/k-means",
    played: "The dogs measured distance in raw numbers, so income (tens of thousands) drowned out visits (under 30) and two flocks that differed only in visits merged. Fixing the map scale (standardizing) let both features count.",
    matters: "Any distance-based method (K-Means, KNN, SVM) is dominated by large-number features. Standardize before clustering, every time.",
  },
  "clusters:rings": {
    title: "K-Means vs density-based clustering",
    href: "/learn/dbscan",
    played: "Sheepdogs (K-Means) each guard a round patch with straight borders, so they sliced rings and moons in half. Follow-the-leader (DBSCAN) chained close neighbours together and followed any shape.",
    matters: "K-Means assumes round, similar-sized blobs. For curved or irregular groups (and for finding outliers) use a density method like DBSCAN.",
  },
  "neurons:xor": {
    title: "Non-linear activation functions",
    href: "/labs/neural-network",
    played: "With a linear activation the shield could only be one straight wall, so it could never trap invaders in opposite corners. Switching to tanh, sigmoid or ReLU let the network bend the shield.",
    matters: "Stacking linear layers is still just a straight line. Non-linear activations are what make neural networks able to learn curved boundaries at all.",
  },
  "neurons:capacity": {
    title: "Model capacity (hidden neurons)",
    href: "/labs/neural-network",
    played: "Each hidden neuron added roughly one straight edge to the shield. One neuron could not enclose the ring of invaders; three or more could.",
    matters: "A model with too little capacity underfits however long it trains. Adding neurons or layers increases what the model can represent.",
  },
  "neurons:saturate": {
    title: "Input scaling and vanishing gradients",
    href: "/labs/neural-network",
    played: "Radar positions in the thousands pushed the sigmoid neurons into their flat ends, where the gradient is almost zero, so the shield barely learned. Calibrating (standardizing) the inputs fixed it instantly.",
    matters: "Unscaled inputs are a classic reason a network 'won't train'. Normalizing inputs keeps neurons in their sensitive range so gradients can flow.",
  },
  "neurons:lr": {
    title: "Learning rate and dead ReLU neurons",
    href: "/challenges/neural-learning-slowdown",
    played: "With the learning rate cranked too high, big updates pushed ReLU neurons permanently below zero, where they output nothing and stop learning: the dead-neuron counter. A moderate rate trained fast and kept them alive.",
    matters: "Dead ReLUs silently shrink a network. Sensible learning rates, good initialization and variants like Leaky ReLU are the usual fixes.",
  },
  "pipeline:leak": {
    title: "Data leakage",
    href: "/workbench",
    played: "The guilty suspects were features that only exist after the outcome (a cancellation reason), features computed from the answer (price per square foot), and a split that put the same people in train and test.",
    matters: "Leakage gives brilliant test scores and a model that fails in production. Ask of every feature: would I really have this at prediction time?",
  },
  "pipeline:overfit": {
    title: "Overfitting vs underfitting",
    href: "/workbench",
    played: "The con artist had tiny training error and huge test error (it memorised). The slacker was bad on both (too simple). The checkpoint to ship was the one with the lowest validation loss.",
    matters: "Comparing train and validation error is how you diagnose every model. It tells you whether to add capacity, add data, regularize, or stop early.",
  },
  "pipeline:order": {
    title: "Train/test split and pipeline order",
    href: "/workbench",
    played: "You rebuilt the timelines so the test set is split off first and every learned step (scaler, imputer, tuning) is fitted on training data only. For time series, the past trains and the future tests.",
    matters: "Fitting anything on the full dataset before splitting lets test information leak into training, which makes the reported score a lie.",
  },
  "pipeline:metric": {
    title: "Choosing evaluation metrics",
    href: "/workbench",
    played: "The witnesses were metrics. Accuracy lied about the rare fraud case, recall told the truth for screening (misses are costly), and precision for the spam filter (false alarms are costly).",
    matters: "The metric decides which model you ship. Pick it from the cost of each mistake before you start comparing models.",
  },
};

export const conceptFor = (gameId: string, levelId: string) => CONCEPTS[`${gameId}:${levelId}`];
