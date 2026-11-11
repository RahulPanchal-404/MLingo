import type { Concept } from "./framework/types";

/** Game level → the concept it teaches. Keyed by `${gameId}:${levelId}`. */
export const CONCEPTS: Record<string, Concept> = {
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
    href: "/labs/logistic-regression",
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
    href: "/labs/k-means",
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
    href: "/labs/k-means",
    played: "The dogs measured distance in raw numbers, so income (tens of thousands) drowned out visits (under 30) and two flocks that differed only in visits merged. Fixing the map scale (standardizing) let both features count.",
    matters: "Any distance-based method (K-Means, KNN, SVM) is dominated by large-number features. Standardize before clustering, every time.",
  },
  "clusters:rings": {
    title: "K-Means vs density-based clustering",
    href: "/labs/k-means",
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
