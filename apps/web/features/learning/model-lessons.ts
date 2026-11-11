import type { LessonDefinition } from "./lessons-data";

/** Lessons for the models: regression, classification and clustering. Same teaching format as the foundations. */
export const MODEL_LESSONS: LessonDefinition[] = [
  // ---------------- Regression ----------------
  {
    id: "lesson-06",
    slug: "linear-regression",
    number: "06",
    tag: "Regression / 01",
    title: "Linear Regression",
    subtitle: "Predict a number by drawing the best straight line through the data.",
    difficulty: "Beginner",
    estimatedMinutes: 8,
    prerequisites: "Foundations 03–05 (Loss, Gradient Descent, Learning Rate).",
    whatAmILearning: [
      "The model: prediction ŷ = w·x + b. The weight w is the slope, the bias b is where the line crosses the axis.",
      "With several features it becomes ŷ = w₁x₁ + w₂x₂ + … + b: one weight per feature.",
      "The best line is the one with the smallest mean squared error (MSE) over the training data.",
      "You can find it with gradient descent, or exactly with a formula (least squares).",
    ],
    whyItMatters:
      "Linear regression is the first model every data scientist reaches for: house prices, sales forecasts, salary estimates. It is fast, easy to explain (each weight says how much a feature moves the prediction), and it is the building block inside neural networks.",
    keyIdea:
      "A linear model assumes each feature pushes the prediction up or down by a fixed amount. Training just means finding the weights that make the squared errors as small as possible.",
    visual: {
      type: "equation",
      title: "Anatomy of a Linear Model",
      items: [
        { label: "ŷ = w·x + b", detail: "The prediction is a weighted input plus a bias." },
        { label: "w (slope)", detail: "How much the prediction changes when x goes up by 1." },
        { label: "b (bias)", detail: "The prediction when every feature is 0." },
        { label: "MSE = mean((ŷ − y)²)", detail: "The loss training tries to minimise.", highlight: true },
      ],
    },
    concreteExample: {
      context: "Predicting salary from years of experience",
      input: "Model learned w = 4.5 (lakh per year of experience), b = 3.0 (lakh). Candidate has x = 4 years.",
      prediction: "ŷ = 4.5 × 4 + 3.0 = 21.0 lakh",
      target: "Actual salary y = 19.5 lakh",
      errorNote: "Error = 21.0 − 19.5 = 1.5, squared error = 2.25. Training averages these over all people and adjusts w and b to shrink it.",
    },
    thinkPrompt: {
      question: "A model has w = −2 for the feature 'distance from city centre (km)'. What does that mean?",
      options: [
        { text: "Every extra km from the centre lowers the predicted price by 2 units.", correct: true, feedback: "Exactly. The weight is the change in prediction per unit of the feature, and its sign gives the direction." },
        { text: "The feature is useless because the weight is negative.", correct: false, feedback: "A negative weight is just as useful: it means the feature pushes the prediction down." },
        { text: "Prices are 2 times lower outside the city.", correct: false, feedback: "Linear weights add a fixed amount per unit; they don't multiply the price." },
      ],
    },
    nowTryIt: {
      headline: "Build the straightest, strongest bridge across the data",
      buttonLabel: "Play Bridge Builder · Straight bridge →",
      href: "/games/bridge?level=line",
      whatToObserve: [
        "Drag the bridge ends and watch the MSE (the red gaps) shrink.",
        "Compare your bridge to the least-squares bridge revealed at the end.",
        "Notice how one far-away pillar pulls the whole line: squared errors punish big misses hardest.",
      ],
    },
    prevLesson: { title: "Learning Rate", slug: "learning-rate" },
    nextLesson: { title: "Polynomial Regression", slug: "polynomial-regression" },
  },
  {
    id: "lesson-07",
    slug: "polynomial-regression",
    number: "07",
    tag: "Regression / 02",
    title: "Polynomial Regression & Overfitting",
    subtitle: "Bend the line to fit curves, and learn why bending too much backfires.",
    difficulty: "Beginner",
    estimatedMinutes: 8,
    prerequisites: "Regression 01 (Linear Regression).",
    whatAmILearning: [
      "Add powers of x as new features: ŷ = w₁x + w₂x² + w₃x³ + … + b. The model is still linear in its weights.",
      "The degree controls flexibility: degree 1 is a line, degree 2 a parabola, high degrees wiggle.",
      "Training error always falls as the degree rises. Test error falls, then rises again.",
      "Too simple = underfitting (high bias). Too flexible = overfitting (high variance).",
    ],
    whyItMatters:
      "Choosing model complexity is the central decision in all of machine learning. Polynomial regression makes it visible: you can literally see a high-degree curve chasing noise between the training points.",
    keyIdea:
      "A model is judged on data it has never seen. The best degree is the one with the lowest test (validation) error, not the lowest training error.",
    visual: {
      type: "comparison",
      title: "Three Degrees on the Same Data",
      items: [
        { label: "Degree 1 (underfit)", detail: "A straight line misses the curve: high train and test error." },
        { label: "Degree 3 (good fit)", detail: "Follows the trend, ignores the noise: low train and test error.", highlight: true },
        { label: "Degree 12 (overfit)", detail: "Passes through every training point, wild between them: train ≈ 0, test huge." },
      ],
    },
    concreteExample: {
      context: "Fitting 15 noisy points from a gentle curve",
      input: "Try degrees 1, 3 and 12 and measure error on 15 held-out test points",
      prediction: "Train MSE: 4.1 → 0.9 → 0.02",
      target: "Test MSE: 4.3 → 1.0 → 37.5",
      errorNote: "Degree 12 has the best training score and by far the worst test score. Degree 3 generalises.",
    },
    thinkPrompt: {
      question: "Your degree-10 model has train error 0.01 and test error 25. What should you try first?",
      options: [
        { text: "Increase the degree so it fits even better.", correct: false, feedback: "Training fit is already near perfect. More flexibility makes the overfitting worse." },
        { text: "Lower the degree or add regularization.", correct: true, feedback: "Right. The gap between train and test error is the signature of overfitting: reduce flexibility or penalise big weights." },
        { text: "Train for more epochs.", correct: false, feedback: "This model already memorised the training set. More training won't fix generalisation." },
      ],
    },
    nowTryIt: {
      headline: "Choose how bendy your bridge is, then send the test trucks across",
      buttonLabel: "Play Bridge Builder · Bendy bridge →",
      href: "/games/bridge?level=degree",
      whatToObserve: [
        "Raise the degree and watch the training gaps vanish.",
        "Release the test trucks: count how many fall off a wiggly bridge.",
        "Find the degree where the most trucks cross.",
      ],
    },
    prevLesson: { title: "Linear Regression", slug: "linear-regression" },
    nextLesson: { title: "Regularization", slug: "regularization" },
  },
  {
    id: "lesson-08",
    slug: "regularization",
    number: "08",
    tag: "Regression / 03",
    title: "Regularization: Ridge & Lasso",
    subtitle: "Keep a flexible model in check by charging it for large weights.",
    difficulty: "Intermediate",
    estimatedMinutes: 9,
    prerequisites: "Regression 02 (Polynomial Regression & Overfitting).",
    whatAmILearning: [
      "Regularized loss = MSE + λ × penalty on the weights. λ (lambda) sets how strict the penalty is.",
      "Ridge (L2) penalises the sum of squared weights: it shrinks all weights smoothly toward zero.",
      "Lasso (L1) penalises the sum of absolute weights: it pushes useless weights to exactly zero, so it also selects features.",
      "λ = 0 is plain regression (can overfit); a huge λ flattens the model (underfits). The right λ is found on validation data.",
    ],
    whyItMatters:
      "Real datasets have many features and limited rows, so models overfit easily. Ridge and Lasso are the standard, cheap fix, and Lasso doubles as automatic feature selection.",
    keyIdea:
      "Big weights let a model bend sharply to chase noise. Charging a price for big weights forces the model to bend only where the data really demands it.",
    visual: {
      type: "comparison",
      title: "Ridge vs Lasso",
      items: [
        { label: "Ridge: λ·Σw²", detail: "All weights get smaller; none become exactly zero." },
        { label: "Lasso: λ·Σ|w|", detail: "Weak features drop to exactly zero: a simpler model.", highlight: true },
        { label: "λ too large", detail: "Every weight is crushed: the model underfits." },
      ],
    },
    concreteExample: {
      context: "8 candidate features, only 3 actually matter",
      input: "Fit plain regression, then Lasso with λ = 0.1",
      prediction: "Plain: all 8 weights non-zero, test MSE 6.2",
      target: "Lasso: 5 junk weights become 0, the 3 real ones survive, test MSE 2.1",
      errorNote: "Removing the junk features stopped the model from fitting noise, so it generalises better.",
    },
    thinkPrompt: {
      question: "You want a model that uses as few features as possible so it is easy to explain. Which do you choose?",
      options: [
        { text: "Ridge", correct: false, feedback: "Ridge shrinks weights but keeps every feature slightly non-zero." },
        { text: "Lasso", correct: true, feedback: "Yes. The L1 penalty drives unhelpful weights to exactly zero, leaving a small set of features." },
        { text: "No regularization", correct: false, feedback: "Plain regression keeps every feature, including the noisy ones." },
      ],
    },
    nowTryIt: {
      headline: "Stiffen the bridge, then cut the useless support beams",
      buttonLabel: "Play Bridge Builder · Stiff bridge →",
      href: "/games/bridge?level=ridge",
      whatToObserve: [
        "Slide λ up and watch the wiggly bridge calm down.",
        "Find the λ where the most test trucks cross.",
        "In the Lasso level, watch junk beams disappear as their weights hit zero.",
      ],
    },
    prevLesson: { title: "Polynomial Regression", slug: "polynomial-regression" },
    nextLesson: { title: "Logistic Regression", slug: "logistic-regression" },
  },

  // ---------------- Classification ----------------
  {
    id: "lesson-09",
    slug: "logistic-regression",
    number: "09",
    tag: "Classification / 01",
    title: "Logistic Regression",
    subtitle: "Turn a weighted score into a probability, then into a yes/no decision.",
    difficulty: "Beginner",
    estimatedMinutes: 8,
    prerequisites: "Regression 01 (Linear Regression).",
    whatAmILearning: [
      "Compute a linear score z = w·x + b, then squash it with the sigmoid σ(z) = 1 / (1 + e⁻ᶻ) into a probability between 0 and 1.",
      "The decision boundary is where the probability equals the threshold (0.5 by default): a straight line in feature space.",
      "Training minimises log-loss (cross-entropy), which punishes confident wrong answers very hard.",
      "Moving the threshold trades false positives against false negatives.",
    ],
    whyItMatters:
      "Logistic regression powers spam filters, credit scoring and medical risk scores. It gives calibrated probabilities and every weight is interpretable, so it is often the first and the deployed model.",
    keyIdea:
      "The model never says yes or no: it says how likely. You decide the threshold, and the right threshold depends on what each mistake costs.",
    visual: {
      type: "flow",
      title: "From Features to Decision",
      items: [
        { label: "Score z = w·x + b", detail: "Any number from −∞ to +∞." },
        { label: "Probability p = σ(z)", detail: "Squashed into 0–1." },
        { label: "Decision: p ≥ threshold?", detail: "Yes → class 1, no → class 0.", highlight: true },
      ],
    },
    concreteExample: {
      context: "Spam filter with two features",
      input: "w = [1.8 (links), 0.9 (CAPS words)], b = −4. Email has 2 links and 1 CAPS word.",
      prediction: "z = 1.8×2 + 0.9×1 − 4 = 0.5, p = σ(0.5) = 0.62",
      target: "The email really is spam (y = 1)",
      errorNote: "With threshold 0.5 it is flagged correctly. Log-loss = −ln(0.62) = 0.48: correct but not very confident.",
    },
    thinkPrompt: {
      question: "Why not just use linear regression and call anything above 0.5 'spam'?",
      options: [
        { text: "Linear outputs aren't probabilities: they can be −3 or 7, and far-away points distort the line.", correct: true, feedback: "Exactly. The sigmoid keeps outputs in 0–1 and log-loss trains them as probabilities." },
        { text: "Linear regression can't use more than one feature.", correct: false, feedback: "It can use many features. The issue is the output range and the loss." },
        { text: "There is no difference.", correct: false, feedback: "The sigmoid and the log-loss make a real difference in how the model learns." },
      ],
    },
    nowTryIt: {
      headline: "Guard the castle gate with a probability and a threshold",
      buttonLabel: "Play Gatekeeper →",
      href: "/games/threshold?level=sigmoid",
      whatToObserve: [
        "Each stranger's suspicion bar is a predicted probability.",
        "Move the gate (the threshold) and watch false alarms trade against misses.",
        "Then open the Logistic Regression lab to see the sigmoid being trained.",
      ],
    },
    prevLesson: { title: "Regularization", slug: "regularization" },
    nextLesson: { title: "K-Nearest Neighbours", slug: "k-nearest-neighbors" },
  },
  {
    id: "lesson-10",
    slug: "k-nearest-neighbors",
    number: "10",
    tag: "Classification / 02",
    title: "K-Nearest Neighbours (KNN)",
    subtitle: "Classify something by asking the most similar examples you've already seen.",
    difficulty: "Beginner",
    estimatedMinutes: 7,
    prerequisites: "Classification 01 (Logistic Regression).",
    whatAmILearning: [
      "No training phase: KNN just stores the labelled examples.",
      "To classify a new point, find the K closest stored points (usually by Euclidean distance) and take a majority vote.",
      "Small K follows every quirk of the data (overfit); large K smooths everything out (underfit).",
      "Distances are dominated by large-number features, so features must be standardized first.",
    ],
    whyItMatters:
      "KNN is the simplest 'learn from examples' model and the idea behind recommendation systems and similarity search. It also teaches why distance and scaling matter for many other algorithms.",
    keyIdea:
      "Similar things tend to share labels. K decides how many neighbours get a vote, and that one number controls the bias–variance trade-off.",
    visual: {
      type: "comparison",
      title: "Choosing K",
      items: [
        { label: "K = 1", detail: "Copies the single nearest example: jagged boundary, fooled by noise." },
        { label: "K = 7", detail: "A neighbourhood vote: smooth, robust boundary.", highlight: true },
        { label: "K = all points", detail: "Always predicts the majority class: useless." },
      ],
    },
    concreteExample: {
      context: "Is this fruit an apple or an orange?",
      input: "New fruit: weight 150 g, roughness 0.3. K = 5.",
      prediction: "The 5 nearest fruits are: apple, apple, orange, apple, apple",
      target: "Vote: 4 apples vs 1 orange",
      errorNote: "Predicted apple with 80% of the vote. If roughness weren't standardized, weight (hundreds of grams) would decide the distance alone.",
    },
    thinkPrompt: {
      question: "Your KNN with K = 1 is 100% accurate on training data but 70% on test data. What's happening?",
      options: [
        { text: "Each training point is its own nearest neighbour, so training accuracy is meaningless: it overfits.", correct: true, feedback: "Exactly. Increase K so predictions come from a neighbourhood, not a single point." },
        { text: "K = 1 is always best.", correct: false, feedback: "K = 1 is the most sensitive to noise." },
        { text: "KNN needs more epochs.", correct: false, feedback: "KNN has no training epochs: it only stores the data." },
      ],
    },
    nowTryIt: {
      headline: "Sort mystery creatures by asking their neighbours",
      buttonLabel: "Play Creature Sorter · Ask the neighbours →",
      href: "/games/sorter?level=knn",
      whatToObserve: [
        "Slide K and watch the colour map change from jagged to smooth.",
        "Release the test creatures and see which K sorts the most correctly.",
        "In the next level, see what happens when one feature is in grams and the other in metres.",
      ],
    },
    prevLesson: { title: "Logistic Regression", slug: "logistic-regression" },
    nextLesson: { title: "Decision Trees", slug: "decision-trees" },
  },
  {
    id: "lesson-11",
    slug: "decision-trees",
    number: "11",
    tag: "Classification / 03",
    title: "Decision Trees",
    subtitle: "A flowchart of yes/no questions that the computer builds by itself.",
    difficulty: "Intermediate",
    estimatedMinutes: 9,
    prerequisites: "Classification 02 (KNN).",
    whatAmILearning: [
      "A tree asks one question per node (e.g. 'weight < 2 kg?') and sends the example left or right until it reaches a leaf with a label.",
      "At each node the algorithm tries every question and picks the one that makes the groups purest, measured by Gini impurity or entropy.",
      "Deeper trees ask more questions. Too deep and every leaf holds one training example: overfitting.",
      "Max depth and minimum samples per leaf are the main controls.",
    ],
    whyItMatters:
      "Trees are easy to explain to anyone (they're a flowchart), handle mixed feature types without scaling, and are the building block of random forests and gradient boosting, which win most tabular-data competitions.",
    keyIdea:
      "A good question is one that splits a mixed group into purer groups. The tree is built greedily: the best question first, then the best question inside each half, and so on.",
    visual: {
      type: "diagram",
      title: "Scoring a Question with Gini Impurity",
      items: [
        { label: "Gini = 1 − Σ pₖ²", detail: "0 means the group is pure; 0.5 means a 50/50 mix of two classes." },
        { label: "Good split", detail: "Children have much lower Gini than the parent.", highlight: true },
        { label: "Bad split", detail: "Children are as mixed as the parent: the question told us nothing." },
      ],
    },
    concreteExample: {
      context: "10 creatures: 5 birds, 5 fish. Candidate question: 'has wings?'",
      input: "Parent Gini = 1 − (0.5² + 0.5²) = 0.5",
      prediction: "Yes branch: 5 birds, 0 fish (Gini 0). No branch: 0 birds, 5 fish (Gini 0).",
      target: "Weighted child Gini = 0",
      errorNote: "Impurity drop = 0.5 − 0 = 0.5, the best possible. 'Weighs over 1 kg?' might only drop it to 0.4.",
    },
    thinkPrompt: {
      question: "A tree with depth 20 scores 100% on training data and 68% on test data. What should you do?",
      options: [
        { text: "Limit the depth (or require more samples per leaf).", correct: true, feedback: "Yes. A shallower tree can't memorise individual examples, so it generalises better." },
        { text: "Make it deeper.", correct: false, feedback: "It already memorised the training set." },
        { text: "Standardize the features.", correct: false, feedback: "Trees split on thresholds, so feature scaling doesn't change them." },
      ],
    },
    nowTryIt: {
      headline: "Build a sorting tree by choosing the best questions",
      buttonLabel: "Play Creature Sorter · Ask the right question →",
      href: "/games/sorter?level=tree",
      whatToObserve: [
        "Compare the Gini drop of each candidate question before you pick.",
        "Watch the creatures split into purer groups at each node.",
        "In the depth level, find where extra questions stop helping test accuracy.",
      ],
    },
    prevLesson: { title: "K-Nearest Neighbours", slug: "k-nearest-neighbors" },
    nextLesson: { title: "K-Means Clustering", slug: "k-means" },
  },

  // ---------------- Clustering ----------------
  {
    id: "lesson-12",
    slug: "k-means",
    number: "12",
    tag: "Clustering / 01",
    title: "K-Means Clustering",
    subtitle: "Find K groups in unlabelled data by moving centres back and forth.",
    difficulty: "Beginner",
    estimatedMinutes: 8,
    prerequisites: "Foundations 01 (What is Machine Learning?).",
    whatAmILearning: [
      "Unsupervised learning: no labels, the algorithm finds structure on its own.",
      "Repeat two steps: assign each point to its nearest centroid, then move each centroid to the mean of its points.",
      "It stops when no point changes cluster. The result minimises inertia (total squared distance to the centroids), but only locally.",
      "You must choose K (use the elbow) and good starting centroids (k-means++), and scale features first.",
    ],
    whyItMatters:
      "K-Means is the go-to method for customer segmentation, image colour compression and grouping documents. It's fast enough for millions of points.",
    keyIdea:
      "Assign, then update, then repeat. Each step can only lower the inertia, so the algorithm always settles, but where it settles depends on where it started.",
    visual: {
      type: "flow",
      title: "One K-Means Iteration",
      items: [
        { label: "1. Assign", detail: "Each point joins the cluster of its nearest centroid." },
        { label: "2. Update", detail: "Each centroid moves to the average position of its points." },
        { label: "3. Repeat", detail: "Stop when assignments no longer change.", highlight: true },
      ],
    },
    concreteExample: {
      context: "6 customers on (visits, spend), K = 2",
      input: "Start centroids at (1, 1) and (9, 9)",
      prediction: "After assignment: 3 low-spenders join centroid A, 3 high-spenders join B",
      target: "Update: A moves to the mean of its 3 points, (2, 1.7); B to (8, 8.3)",
      errorNote: "A second pass changes no assignments, so it converged. Inertia dropped from 41 to 6.8.",
    },
    thinkPrompt: {
      question: "Why can two runs of K-Means on the same data give different clusters?",
      options: [
        { text: "Different random starting centroids can settle in different local optima.", correct: true, feedback: "Right. That's why libraries use k-means++ and keep the best of several restarts." },
        { text: "K-Means adds random noise to the data.", correct: false, feedback: "The data is unchanged; only the starting centroids differ." },
        { text: "It's a bug.", correct: false, feedback: "It's an expected property of a greedy, local algorithm." },
      ],
    },
    nowTryIt: {
      headline: "Herd sheep with K-Means: dogs are centroids, whistles are iterations",
      buttonLabel: "Play Sheepdog →",
      href: "/games/clusters?level=elbow",
      whatToObserve: [
        "Hire dogs and read the cost bars to find the elbow.",
        "Drop dogs badly on purpose and watch them get stuck.",
        "Then open the K-Means lab to scrub through iterations.",
      ],
    },
    prevLesson: { title: "Decision Trees", slug: "decision-trees" },
    nextLesson: { title: "Hierarchical Clustering", slug: "hierarchical-clustering" },
  },
  {
    id: "lesson-13",
    slug: "hierarchical-clustering",
    number: "13",
    tag: "Clustering / 02",
    title: "Hierarchical Clustering",
    subtitle: "Merge the closest groups step by step and draw the whole family tree.",
    difficulty: "Intermediate",
    estimatedMinutes: 8,
    prerequisites: "Clustering 01 (K-Means).",
    whatAmILearning: [
      "Agglomerative clustering starts with every point as its own cluster and repeatedly merges the two closest clusters.",
      "The merge history is drawn as a dendrogram: a tree where the height of each join is the distance at which it happened.",
      "Cut the dendrogram at a height to get clusters. You don't have to choose K in advance.",
      "Linkage defines 'distance between clusters': single (closest pair), complete (farthest pair), average, or Ward.",
    ],
    whyItMatters:
      "Used in biology (gene and species trees), document taxonomies and customer segments where you want to see groups within groups. The dendrogram shows structure at every scale at once.",
    keyIdea:
      "Instead of one answer, hierarchical clustering gives you every answer from N clusters down to 1. Where you cut the tree decides how many groups you get.",
    visual: {
      type: "comparison",
      title: "Linkage Choices",
      items: [
        { label: "Single linkage", detail: "Distance of the closest pair. Follows long chains, but one bridge point can merge two groups." },
        { label: "Complete linkage", detail: "Distance of the farthest pair. Makes compact, round groups.", highlight: true },
        { label: "Ward", detail: "Merges the pair that increases variance least, similar in spirit to K-Means." },
      ],
    },
    concreteExample: {
      context: "5 stars at positions A=1, B=2, C=6, D=7, E=15 (single linkage)",
      input: "Merge closest first",
      prediction: "A+B at 1, C+D at 1, (AB)+(CD) at 4, then E joins at 8",
      target: "Cut at height 5 → 2 clusters: {A,B,C,D} and {E}",
      errorNote: "Cut at height 2 → 3 clusters: {A,B}, {C,D}, {E}. One tree, many possible answers.",
    },
    thinkPrompt: {
      question: "Two dense groups are connected by a thin line of points. Which linkage is most likely to wrongly merge them early?",
      options: [
        { text: "Single linkage", correct: true, feedback: "Yes. Single linkage only needs one close pair, so it hops along the chain (the 'chaining effect')." },
        { text: "Complete linkage", correct: false, feedback: "Complete linkage looks at the farthest pair, so a thin bridge doesn't make the groups look close." },
        { text: "Neither, linkage doesn't matter", correct: false, feedback: "Linkage can completely change the result." },
      ],
    },
    nowTryIt: {
      headline: "Map the galaxies by cutting the star family tree",
      buttonLabel: "Play Star Mapper · Cut the tree →",
      href: "/games/galaxy?level=dendro",
      whatToObserve: [
        "Drag the cut line up and down the dendrogram and watch the galaxies recolour.",
        "Look for a big gap in merge heights: that's where to cut.",
        "Compare single and complete linkage on chained star fields.",
      ],
    },
    prevLesson: { title: "K-Means Clustering", slug: "k-means" },
    nextLesson: { title: "DBSCAN", slug: "dbscan" },
  },
  {
    id: "lesson-14",
    slug: "dbscan",
    number: "14",
    tag: "Clustering / 03",
    title: "DBSCAN: Density-Based Clustering",
    subtitle: "Find clusters of any shape and flag outliers, without choosing K.",
    difficulty: "Intermediate",
    estimatedMinutes: 8,
    prerequisites: "Clustering 01 (K-Means).",
    whatAmILearning: [
      "Two settings: ε (eps), the neighbourhood radius, and minPts, how many neighbours make a point 'dense'.",
      "Core points have at least minPts neighbours within ε. Clusters grow by chaining core points that are within ε of each other.",
      "Points near a cluster but not dense themselves are border points. Points far from everything are noise (outliers).",
      "No K needed, and clusters can be any shape: rings, moons, snakes.",
    ],
    whyItMatters:
      "DBSCAN is used for geographic hotspots, anomaly and fraud detection, and any data with odd-shaped groups or lots of noise, where K-Means fails.",
    keyIdea:
      "A cluster is a region where points are packed closely together. Grow it outward through dense points; anything left alone in sparse space is noise.",
    visual: {
      type: "diagram",
      title: "Three Kinds of Point",
      items: [
        { label: "Core point", detail: "At least minPts neighbours within ε. Clusters grow from these.", highlight: true },
        { label: "Border point", detail: "Within ε of a core point but not dense itself. Joins that cluster." },
        { label: "Noise", detail: "Not near any core point. Labelled as an outlier." },
      ],
    },
    concreteExample: {
      context: "Delivery GPS pings, ε = 200 m, minPts = 5",
      input: "A street corner has 40 pings within 200 m of each other; one ping is 3 km away",
      prediction: "The 40 pings chain into one cluster (a busy pickup spot)",
      target: "The lone ping has no neighbours within 200 m",
      errorNote: "It's labelled noise: maybe a GPS glitch. K-Means would have forced it into some cluster.",
    },
    thinkPrompt: {
      question: "You set ε very large. What happens?",
      options: [
        { text: "Everything becomes one big cluster.", correct: true, feedback: "Yes. With a huge radius every point is a neighbour of every other, so all chains merge." },
        { text: "Everything becomes noise.", correct: false, feedback: "That happens when ε is too small." },
        { text: "Nothing changes.", correct: false, feedback: "ε is the most sensitive DBSCAN setting." },
      ],
    },
    nowTryIt: {
      headline: "Set how far starlight reaches and watch galaxies form",
      buttonLabel: "Play Star Mapper · Reach of light →",
      href: "/games/galaxy?level=eps",
      whatToObserve: [
        "Slide ε: too small and every star is alone; too big and everything merges.",
        "Watch grey noise stars appear as you raise minPts.",
        "Compare with Sheepdog's 'Strange shapes' level, where K-Means fails on rings.",
      ],
    },
    prevLesson: { title: "Hierarchical Clustering", slug: "hierarchical-clustering" },
  },
];
