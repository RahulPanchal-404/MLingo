import type { Deep } from "./types";

const r = String.raw;

export const DEEP_CLASSIFICATION: Record<string, Deep> = {
  "logistic-regression": {
    explain: [
      { p: "Why not use linear regression for a yes/no label? A straight line predicts values below 0 and above 1, which make no sense as probabilities, and a few far-away points tilt the line and move the decision point. Logistic regression keeps the linear score but passes it through the sigmoid, which squeezes any number into (0, 1) and flattens out at the extremes so far-away points stop pulling." },
      { p: "The cleanest way to understand the model is through **odds**. If $p = 0.8$, the odds are $0.8/0.2 = 4$ (four to one). Logistic regression says the **log of the odds** is linear in the features: $\\ln\\frac{p}{1-p} = w_0 + w_1x_1 + \\dots$. So each weight adds to the log-odds, and $e^{w_j}$ is an **odds ratio**: the factor by which the odds multiply for each one-unit increase in $x_j$. A weight of 0.7 means the odds roughly double ($e^{0.7} \\approx 2.01$)." },
      { p: "The decision boundary is where $p = 0.5$, i.e. where the score $z = 0$. That set is a straight line in 2-D, a plane in 3-D, a hyperplane in general. Changing the threshold from 0.5 to, say, 0.3 shifts the boundary parallel to itself; it does not change its angle. To get curved boundaries, add polynomial or interaction features." },
      { p: "Training maximises the likelihood of the observed labels, which is the same as minimising cross-entropy. The loss is convex, so there is one best solution. One edge case: if the classes are **perfectly separable**, the likelihood keeps improving as the weights grow, so unregularised weights run off to infinity. Regularisation (scikit-learn applies L2 by default with $C = 1$) keeps them finite." },
      {
        table: {
          head: ["Weight $w_j$", "Odds ratio $e^{w_j}$", "Meaning per +1 unit of $x_j$"],
          rows: [
            ["0", "1", "No effect on the odds"],
            ["0.693", "2", "Odds double"],
            ["−0.693", "0.5", "Odds halve"],
            ["2", "7.39", "Odds ×7.4"],
          ],
        },
      },
      { p: "Logistic regression produces reasonably **calibrated** probabilities: among cases it gives 0.8, roughly 80% really are positive (if the model is well specified). This makes it popular in credit scoring and medicine, where the probability itself is used for decisions, not just the class." },
    ],
    practice: [
      {
        q: "A model has $z = -3 + 0.8x$, where $x$ is years of experience. Find P(hired) for $x = 2$ and $x = 6$, and the experience at which P = 0.5.",
        solution: [
          { math: r`x = 2: z = -1.4,\; p = \sigma(-1.4) \approx 0.198 \qquad x = 6: z = 1.8,\; p \approx 0.858` },
          { math: r`p = 0.5 \iff z = 0 \iff x = 3/0.8 = 3.75 \text{ years}` },
        ],
      },
      {
        q: "A weight is 0.4. By what factor do the odds change for a 5-unit increase in that feature?",
        solution: [{ math: r`e^{0.4 \times 5} = e^{2} \approx 7.39` }],
      },
      {
        q: "For one example with $x = 2$, $y = 1$, current prediction $p = 0.3$. What is the gradient of cross-entropy with respect to the weight, and which way does the weight move?",
        solution: [{ p: "Gradient $= (p - y)x = (0.3 - 1)(2) = -1.4$. Negative gradient, so gradient descent increases the weight, which raises $p$ for this positive example." }],
      },
    ],
    interview: [
      { q: "Why is it called regression if it does classification?", a: "It regresses the log-odds of the positive class linearly on the features. The classification comes from thresholding the resulting probability." },
      { q: "What loss does logistic regression minimise and why not MSE?", a: "Binary cross-entropy (negative log-likelihood). With a sigmoid output, MSE makes the loss non-convex and gives tiny gradients when the model is confidently wrong; cross-entropy is convex and has the simple gradient (p − y)x." },
      { q: "How do you interpret a coefficient?", a: "It is the change in log-odds per unit increase of that feature, holding others fixed. Exponentiate it to get the odds ratio." },
      { q: "How does logistic regression handle multiple classes?", a: "Either one-vs-rest (one binary model per class) or multinomial/softmax regression, which models all class probabilities jointly with a softmax and cross-entropy loss." },
    ],
    summary: [
      "Score $z = \\mathbf{w}^\\top\\mathbf{x} + b$, probability $p = \\sigma(z)$.",
      "Log-odds are linear; $e^{w_j}$ is the odds ratio per unit of $x_j$.",
      "Decision boundary $z = 0$ is linear.",
      "Train with cross-entropy; gradient $(p - y)\\mathbf{x}$; convex.",
      "Regularise (C = 1/λ); essential for separable data.",
      "Softmax extends it to many classes.",
    ],
    quiz: [
      { q: "If a coefficient is −0.693, the odds of class 1 per unit increase:", options: ["Double", "Halve", "Stay the same", "Become negative"], answer: 1, why: "e^(−0.693) ≈ 0.5." },
      { q: "Lowering the threshold from 0.5 to 0.3 does what to the decision boundary?", options: ["Rotates it", "Shifts it parallel so more points are classed positive", "Makes it curved", "Nothing"], answer: 1, why: "The boundary becomes z = logit(0.3) instead of z = 0: same direction, shifted." },
    ],
  },

  "k-nearest-neighbors": {
    explain: [
      { p: "KNN rests on one assumption: points that are close in feature space tend to have the same label. To classify a new point, it finds the K training points with the smallest distance and lets them vote. For regression, it averages their targets instead. There is no formula being fitted, no weights learned: the training data itself is the model." },
      { p: "Distance is everything in KNN, so what counts as 'close' must be designed carefully. Scaling matters (a feature in lakhs swamps one in units). Irrelevant features matter too: every useless feature adds random differences to all distances, drowning out the useful ones. Feature selection and scaling often improve KNN more than tuning K." },
      { p: "The **curse of dimensionality** hits KNN hardest. In high dimensions, almost all points are far from each other and the nearest and farthest neighbours end up at nearly the same distance, so 'nearest' stops meaning much. In 1-D, covering 10% of the data needs a 10% interval; in 10-D, a cube covering 10% of the volume needs sides of $0.1^{1/10} \\approx 0.79$, i.e. 79% of each feature's range. Neighbourhoods are no longer local." },
      { p: "Choosing K is a bias–variance choice. K = 1 has zero training error (each point is its own neighbour) and a jagged boundary that follows noise: high variance. Large K smooths the boundary and may ignore small real regions: high bias. A common rule of thumb starts near $\\sqrt{n}$, then tunes by cross-validation." },
      {
        table: {
          head: ["Option", "Effect"],
          rows: [
            ["`weights='uniform'`", "Every neighbour votes equally"],
            ["`weights='distance'`", "Votes weighted by 1/distance; closer neighbours count more"],
            ["`metric='manhattan'`", "Often better with many features or outliers"],
            ["`algorithm='kd_tree'` / `'ball_tree'`", "Faster neighbour search in low dimensions"],
          ],
        },
      },
      { p: "Prediction cost is the main practical drawback: a naive search compares the query with all $n$ training points ($O(nd)$ per prediction). Tree structures (KD-tree, ball tree) speed this up in low dimensions; approximate nearest-neighbour libraries (FAISS, Annoy) are used for millions of points, such as in recommendation and image search." },
    ],
    practice: [
      {
        q: "Training points: A(1, 1, class 0), B(2, 2, class 0), C(4, 4, class 1), D(5, 4, class 1), E(3, 1, class 0). Classify Q = (4, 2) with K = 1 and K = 3 (Euclidean).",
        solution: [
          { p: "Distances: A $\\sqrt{10} \\approx 3.16$, B $2$, C $2$, D $\\sqrt{5} \\approx 2.24$, E $\\sqrt{2} \\approx 1.41$." },
          { p: "K = 1: E, class 0. K = 3: E (0), then B and C tied at 2 (0 and 1). Either way the vote is 2–1 for class 0. Ties like this are why odd K and distance weighting are used." },
        ],
      },
      {
        q: "KNN regression with K = 3: the three nearest houses sold for ₹50 L, ₹56 L and ₹62 L at distances 1, 2 and 3. Predict with uniform and with distance weights.",
        solution: [
          { p: "Uniform: (50 + 56 + 62)/3 = ₹56 L." },
          { math: r`\text{Distance-weighted: } \frac{50/1 + 56/2 + 62/3}{1/1 + 1/2 + 1/3} = \frac{50 + 28 + 20.67}{1.833} \approx ₹53.8\text{ L}` },
        ],
      },
      {
        q: "Features: age (18–60) and income (₹2–40 L, stored in rupees). Standardise these two values: age 30 (mean 35, sd 10) and income ₹12,00,000 (mean ₹10,00,000, sd ₹5,00,000).",
        solution: [{ p: "Age $z = (30 - 35)/10 = -0.5$. Income $z = (12 - 10)/5 = 0.4$ (in lakhs). Both now sit on comparable scales, so each affects the distance fairly." }],
      },
    ],
    interview: [
      { q: "Why is KNN called a lazy learner?", a: "It does no work at training time beyond storing the data. All computation (distances and voting) happens at prediction time, unlike eager learners that build a model up front." },
      { q: "What is the curse of dimensionality and how does it affect KNN?", a: "As dimensions grow, data becomes sparse and distances concentrate: nearest and farthest points are almost equally far. Neighbourhoods are no longer local, so KNN's similarity assumption breaks. Reduce dimensions or select features." },
      { q: "How would you choose K?", a: "Cross-validate over a range of odd values, look for the lowest validation error, and prefer larger K among near-ties for stability." },
    ],
    summary: [
      "Predict by majority vote (classification) or average (regression) of the K nearest points.",
      "No training; prediction cost grows with dataset size.",
      "Scale features and remove irrelevant ones: distance is everything.",
      "Small K: low bias, high variance. Large K: the reverse.",
      "Suffers in high dimensions (curse of dimensionality).",
    ],
    quiz: [
      { q: "What is the training error of 1-NN (no duplicate points with different labels)?", options: ["0", "50%", "Equal to the test error", "It cannot be computed"], answer: 0, why: "Each training point's nearest neighbour is itself, so it is always classified correctly." },
      { q: "Which change usually helps KNN the most on data with 50 features where only 5 matter?", options: ["Larger K", "Removing irrelevant features", "Using K = 1", "Skipping scaling"], answer: 1, why: "Irrelevant features add noise to every distance, hiding the informative ones." },
    ],
  },

  "decision-trees": {
    explain: [
      { p: "A decision tree asks one question at a time. Each internal node tests one feature against a threshold ('area > 80 m²?'), each branch is an answer, and each leaf holds a prediction: the majority class (classification) or the mean target (regression). Prediction is just following the questions from the root to a leaf." },
      { p: "How does the tree choose questions? Greedily: at every node it tries every feature and every sensible threshold (midpoints between sorted values) and picks the split that reduces impurity the most. It never looks ahead, so the final tree is not guaranteed to be the best possible tree, but greedy search is fast and works well in practice. The algorithm used by scikit-learn is CART (binary splits, Gini or entropy for classification, MSE for regression)." },
      { p: "Gini and entropy both measure mixture. Gini $1 - \\sum p_k^2$ is the chance that two random items from the node have different labels. Entropy $-\\sum p_k \\log_2 p_k$ is the average number of yes/no questions needed to identify an item's class. They usually pick the same splits; Gini is slightly faster to compute." },
      { p: "Trees have a strong pull toward overfitting: with no limit, they keep splitting until every leaf is pure, carving out a leaf for every noisy point. Two strategies control this. **Pre-pruning** stops growth early with limits (`max_depth`, `min_samples_leaf`). **Post-pruning** grows a full tree and then removes branches whose improvement does not justify their size; cost-complexity pruning minimises $\\text{error} + \\alpha \\times \\text{number of leaves}$." },
      {
        table: {
          head: ["Strength", "Weakness"],
          rows: [
            ["Readable rules; easy to explain", "Unstable: small data changes can change the whole tree"],
            ["No scaling needed; handles mixed feature types", "Greedy splits; boundaries are axis-aligned steps"],
            ["Captures non-linear effects and interactions", "Overfits without limits"],
            ["Fast prediction", "Poor at smooth trends and extrapolation"],
          ],
        },
      },
      { p: "Because decision boundaries are made of axis-aligned cuts, a diagonal boundary (like $x_1 > x_2$) needs a staircase of many splits. Linear models handle that easily; trees struggle. Conversely, trees handle interactions ('high income AND young') naturally where linear models need explicit interaction features." },
    ],
    extra: [
      {
        heading: "Regression trees",
        blocks: [
          { p: "For a numeric target, each leaf predicts the mean of its training targets and the split criterion is the reduction in variance (MSE):" },
          { math: r`\Delta = \text{MSE}(\text{parent}) - \Big[\tfrac{n_L}{n}\text{MSE}(L) + \tfrac{n_R}{n}\text{MSE}(R)\Big]` },
          { p: "Example: targets [10, 12, 30, 34]. Parent mean 21.5, MSE = 112.75. Splitting into [10, 12] and [30, 34] gives child MSEs 1 and 4, weighted 2.5: a reduction of 110.25." },
        ],
      },
    ],
    practice: [
      {
        q: "A node has 6 yes and 2 no. Compute Gini and entropy.",
        solution: [
          { math: r`\text{Gini} = 1 - (0.75^2 + 0.25^2) = 0.375` },
          { math: r`H = -0.75\log_2 0.75 - 0.25\log_2 0.25 \approx 0.311 + 0.5 = 0.811 \text{ bits}` },
        ],
      },
      {
        q: "Parent: 8 yes, 8 no. Split A: (7 yes, 1 no) and (1 yes, 7 no). Split B: (8 yes, 4 no) and (0 yes, 4 no). Which has the higher Gini gain?",
        solution: [
          { p: "Parent Gini = 0.5." },
          { math: r`A: \text{each child } 1 - (0.875^2 + 0.125^2) = 0.21875, \text{ weighted } 0.21875, \text{ gain } 0.281` },
          { math: r`B: \tfrac{12}{16}\big[1 - (\tfrac{2}{3})^2 - (\tfrac{1}{3})^2\big] + \tfrac{4}{16}(0) = 0.75 \times 0.444 = 0.333, \text{ gain } 0.167` },
          { p: "Split A wins." },
        ],
      },
      {
        q: "A regression node has targets [2, 4, 9, 11]. Find the variance reduction of splitting into [2, 4] and [9, 11].",
        solution: [
          { p: "Parent mean 6.5; squared deviations 20.25, 6.25, 6.25, 20.25; MSE = 13.25. Each child has MSE 1 (deviations ±1). Weighted child MSE = 1. Reduction = 12.25." },
        ],
      },
    ],
    interview: [
      { q: "How does a decision tree decide where to split?", a: "For each feature and candidate threshold, it computes the weighted impurity (Gini/entropy for classification, MSE for regression) of the two children and picks the split with the largest impurity reduction. This is repeated greedily at each node." },
      { q: "Why do decision trees overfit and how do you prevent it?", a: "They can keep splitting until each leaf is pure, memorising noise. Limit depth, require a minimum number of samples per leaf or split, prune with cost-complexity, or use ensembles like random forests and boosting." },
      { q: "Do trees need feature scaling?", a: "No. Splits compare a single feature to a threshold, so any monotonic rescaling just moves the threshold and gives the same tree." },
    ],
    summary: [
      "A tree of yes/no questions; leaves predict the majority class or mean.",
      "Splits chosen greedily to maximise impurity reduction (Gini, entropy, MSE).",
      "Unlimited trees overfit; control with depth, leaf size, pruning.",
      "Readable, no scaling needed, handles interactions; unstable alone.",
      "Ensembles (forests, boosting) fix most weaknesses.",
    ],
    quiz: [
      { q: "The entropy of a node with 50% A and 50% B is:", options: ["0", "0.5", "1 bit", "2 bits"], answer: 2, why: "−0.5 log₂ 0.5 × 2 = 1 bit, the maximum for two classes." },
      { q: "Which boundary is hardest for a single small decision tree?", options: ["x₁ > 3", "x₂ < 5", "x₁ > x₂ (a diagonal)", "x₁ > 3 and x₂ < 5"], answer: 2, why: "Trees cut parallel to the axes, so a diagonal needs a staircase of many splits." },
    ],
  },

  "classification-metrics": {
    explain: [
      { p: "Every classification mistake is one of two kinds. A **false positive** raises a false alarm (a genuine transaction blocked). A **false negative** misses a real case (fraud let through). They almost never cost the same, so the right metric depends on which mistake hurts more in your situation. Choosing the metric is a business decision before it is a technical one." },
      { p: "Precision and recall pull against each other. To catch more positives (raise recall), you flag more cases, which also flags more negatives (lowers precision). The **threshold** on the model's probability is the dial: a low threshold favours recall, a high one favours precision. The model is the same; only the decision rule changes." },
      { p: "F1 is the harmonic mean of precision and recall. The harmonic mean punishes imbalance: precision 1.0 and recall 0.1 give an arithmetic mean of 0.55 but an F1 of only 0.18. When one kind of error matters more, use $F_\\beta$: $\\beta > 1$ weights recall more (F2 for screening), $\\beta < 1$ weights precision more." },
      { math: r`F_\beta = (1 + \beta^2)\,\frac{P \cdot R}{\beta^2 P + R}` },
      { p: "The ROC curve plots the true positive rate (recall) against the false positive rate $FP/(FP + TN)$ at every threshold. Its area (AUC) has a clean meaning: the probability that a randomly chosen positive gets a higher score than a randomly chosen negative. It ignores the threshold and the class balance, which is both its strength (compares ranking quality) and its weakness (it can look excellent on very imbalanced data where precision is poor)." },
      {
        table: {
          head: ["Metric", "Formula", "Question it answers"],
          rows: [
            ["Accuracy", "$(TP + TN)/n$", "How often is it right overall?"],
            ["Precision (PPV)", "$TP/(TP + FP)$", "When it says positive, how often is it right?"],
            ["Recall (sensitivity, TPR)", "$TP/(TP + FN)$", "Of the real positives, how many did it catch?"],
            ["Specificity (TNR)", "$TN/(TN + FP)$", "Of the real negatives, how many did it clear?"],
            ["False positive rate", "$FP/(FP + TN)$", "How many negatives got flagged?"],
            ["Balanced accuracy", "(TPR + TNR)/2", "Accuracy that is fair to both classes"],
            ["Log loss", "Cross-entropy of predicted probabilities", "Are the probabilities good, not just the labels?"],
          ],
        },
      },
      { p: "Two more ideas worth knowing. **Calibration**: a model whose 0.7 predictions are right 70% of the time is well calibrated; check with a reliability diagram. **Cost-based thresholds**: if a missed fraud costs ₹10,000 and a false alarm ₹100, flag whenever the expected cost of not flagging exceeds the cost of flagging: $p \\times 10{,}000 > (1 - p) \\times 100$, i.e. $p > 0.0099$." },
    ],
    practice: [
      {
        q: "TP = 30, FP = 20, FN = 10, TN = 140. Compute accuracy, precision, recall, specificity and F1.",
        solution: [
          { math: r`\text{Acc} = \tfrac{170}{200} = 0.85, \quad P = \tfrac{30}{50} = 0.6, \quad R = \tfrac{30}{40} = 0.75, \quad \text{Spec} = \tfrac{140}{160} = 0.875` },
          { math: r`F_1 = \frac{2(0.6)(0.75)}{0.6 + 0.75} = \frac{0.9}{1.35} \approx 0.667` },
        ],
      },
      {
        q: "With the same counts, compute F2 (recall weighted more).",
        solution: [{ math: r`F_2 = 5 \cdot \frac{0.6 \times 0.75}{4(0.6) + 0.75} = \frac{2.25}{3.15} \approx 0.714` }],
      },
      {
        q: "Missing a disease costs 50 units, a false alarm costs 1. Above what predicted probability should you flag a patient?",
        solution: [{ math: r`50p > 1(1 - p) \;\Rightarrow\; 51p > 1 \;\Rightarrow\; p > \tfrac{1}{51} \approx 0.0196` }],
      },
    ],
    interview: [
      { q: "When is accuracy a bad metric?", a: "When classes are imbalanced or errors have different costs. With 1% positives, predicting all negatives gives 99% accuracy and catches nothing." },
      { q: "Explain precision vs recall with an example.", a: "In spam filtering, precision is the share of emails sent to spam that really are spam (low precision means real emails lost). Recall is the share of all spam that was caught (low recall means spam in the inbox). Here precision usually matters more." },
      { q: "What does an AUC of 0.5 mean? Of 0.9?", a: "0.5 means the model ranks a random positive above a random negative only half the time: no better than chance. 0.9 means it does so 90% of the time." },
      { q: "ROC-AUC or PR-AUC for fraud detection?", a: "PR-AUC. With very rare positives, the false positive rate stays small even with many false alarms, so ROC can look great while precision is poor. PR curves expose that." },
    ],
    summary: [
      "Confusion matrix: TP, FP, FN, TN; everything else is built from it.",
      "Precision: trust in a positive prediction. Recall: coverage of real positives.",
      "The threshold trades precision against recall.",
      "F1 / Fβ combine them; ROC-AUC measures ranking; PR-AUC for rare positives.",
      "Pick the metric from the cost of each error type.",
    ],
    quiz: [
      { q: "Precision 0.9, recall 0.3. What is F1?", options: ["0.60", "0.45", "0.27", "0.90"], answer: 1, why: "2 × 0.9 × 0.3 / (0.9 + 0.3) = 0.54 / 1.2 = 0.45." },
      { q: "Which metric is unchanged if you add 10,000 more true negatives?", options: ["Accuracy", "Specificity", "Precision", "False positive rate"], answer: 2, why: "Precision = TP / (TP + FP) never uses TN. Accuracy, specificity and FPR all change." },
    ],
  },

  "naive-bayes": {
    explain: [
      { p: "Naive Bayes reverses the question. Instead of learning 'given these words, is it spam?' directly, it learns how each class generates data ('in spam, how often does the word free appear?') and then uses Bayes' theorem to flip that around. Models that learn how each class produces its data are called **generative**; models like logistic regression that learn the boundary directly are **discriminative**." },
      { p: "Bayes' theorem in words: **posterior ∝ prior × likelihood**. The prior is how common each class is before seeing the email. The likelihood is how well each class explains the evidence. The posterior combines both. A rare class needs very strong evidence to win, which is the base-rate effect you can explore in the Try-it." },
      { p: "Why the naive assumption? Modelling $P(\\mathbf{x} \\mid y)$ for every combination of 10,000 words is impossible: there are $2^{10{,}000}$ combinations. Assuming independence reduces that to 10,000 separate probabilities per class, each estimated by simple counting. The probabilities it outputs are often too extreme (correlated words are counted as separate evidence), but the **ranking** of classes is usually right." },
      { p: "Gaussian Naive Bayes for continuous features estimates a mean $\\mu_{jy}$ and variance $\\sigma^2_{jy}$ for each feature in each class, and uses the normal density:" },
      { math: r`P(x_j \mid y) = \frac{1}{\sqrt{2\pi\sigma_{jy}^2}}\exp\!\Big(-\frac{(x_j - \mu_{jy})^2}{2\sigma_{jy}^2}\Big)` },
      { p: "In practice everything is done in log space: $\\ln P(y) + \\sum_j \\ln P(x_j \\mid y)$. Multiplying hundreds of probabilities like 0.001 underflows to 0 in floating point; adding their logs does not." },
    ],
    practice: [
      {
        q: "Gaussian NB, one feature (height). Class A: mean 170, sd 5. Class B: mean 160, sd 5. Equal priors. Which class for height 166?",
        solution: [
          { p: "With equal priors and equal variances, compare distances in standard deviations: A: $(166 - 170)/5 = -0.8$; B: $(166 - 160)/5 = 1.2$. The density is higher for the smaller $|z|$, so class A." },
          { p: "The boundary is at the midpoint 165 when variances and priors are equal." },
        ],
      },
      {
        q: "Using the spam example on the page (P(spam) = 0.4, P(free | spam) = 0.75, P(free | ham) = 1/6), what is P(spam | free) using only the word 'free'?",
        solution: [{ math: r`\frac{0.4 \times 0.75}{0.4 \times 0.75 + 0.6 \times \tfrac{1}{6}} = \frac{0.3}{0.3 + 0.1} = 0.75` }],
      },
      {
        q: "A word appears in 0 of 50 ham emails. With Laplace smoothing (α = 1, Bernoulli), what is P(word | ham)?",
        solution: [{ math: r`\frac{0 + 1}{50 + 2} = \frac{1}{52} \approx 0.019` }],
      },
    ],
    interview: [
      { q: "Why does Naive Bayes work well despite the independence assumption being false?", a: "Classification only needs the correct class to have the highest score. Correlated evidence inflates all scores in the same direction, so the probabilities are distorted but the ranking is often still right. It also has very low variance, which helps with small data." },
      { q: "What is Laplace smoothing and why is it needed?", a: "Adding a pseudo-count to every feature count so no probability is exactly zero. Without it, one word never seen with a class in training forces that class's probability to zero for any email containing it." },
      { q: "Generative vs discriminative models?", a: "Generative models (Naive Bayes) learn P(x | y) and P(y), then apply Bayes' rule. Discriminative models (logistic regression) learn P(y | x) or the boundary directly. Discriminative models usually win with plenty of data; generative ones can win with very little." },
    ],
    summary: [
      "Posterior ∝ prior × product of per-feature likelihoods.",
      "Naive = features independent given the class.",
      "Gaussian, Multinomial and Bernoulli variants for different feature types.",
      "Laplace smoothing prevents zero probabilities; work in logs.",
      "Fast, strong text baseline; probabilities are over-confident.",
    ],
    quiz: [
      { q: "Why compute Naive Bayes scores as sums of logs?", options: ["It is more accurate statistically", "To avoid numerical underflow from multiplying many small probabilities", "Because probabilities can be negative", "To remove the prior"], answer: 1, why: "Products of hundreds of small numbers underflow to 0; the log turns them into a manageable sum." },
      { q: "Naive Bayes is an example of a:", options: ["Discriminative model", "Generative model", "Clustering algorithm", "Ensemble"], answer: 1, why: "It models how each class generates features, P(x | y), and the class prior." },
    ],
  },

  "support-vector-machines": {
    explain: [
      { p: "Picture two groups of points and every line that separates them. Some lines pass very close to a point of one group; a slightly different new point would land on the wrong side. The SVM picks the line that is as far as possible from the nearest points on both sides, like the centre line of the widest road you can build between the two groups." },
      { p: "Only the points on the edge of the road matter. These **support vectors** pin down the boundary; you could delete every other training point and get the same SVM. That makes SVMs memory-efficient at prediction time and robust to points far from the boundary, but sensitive to the few points near it." },
      { p: "The soft margin handles overlap. Each point gets a **slack** $\\xi_i \\ge 0$ measuring how far it is on the wrong side of its margin edge. The objective balances a wide margin ($\\tfrac{1}{2}\\lVert\\mathbf{w}\\rVert^2$) against total slack ($C\\sum\\xi_i$). Seen this way, an SVM is just hinge loss plus L2 regularisation, with $C$ playing the role of $1/\\lambda$." },
      { math: r`\min_{\mathbf{w}, b, \boldsymbol\xi}\; \tfrac{1}{2}\lVert\mathbf{w}\rVert^2 + C\sum_i \xi_i \quad \text{s.t. } y_i(\mathbf{w}^\top\mathbf{x}_i + b) \ge 1 - \xi_i,\; \xi_i \ge 0` },
      { p: "The kernel trick in one example. For 2-D inputs, the polynomial kernel $K(\\mathbf{a}, \\mathbf{b}) = (\\mathbf{a}^\\top\\mathbf{b})^2$ equals the dot product of the feature vectors $(a_1^2, \\sqrt{2}a_1a_2, a_2^2)$. Computing the kernel takes one dot product and a square; building the features first would take more work, and for the RBF kernel the feature space is infinite-dimensional, so it could not be built at all." },
      { p: "In the **dual** form, the SVM's prediction is $f(\\mathbf{x}) = \\sum_i \\alpha_i y_i K(\\mathbf{x}_i, \\mathbf{x}) + b$, where $\\alpha_i > 0$ only for support vectors. Training cost grows quickly with $n$ (roughly $n^2$ to $n^3$), so kernel SVMs suit small to medium datasets (up to tens of thousands of rows)." },
      {
        table: {
          head: ["SVM variant", "Use"],
          rows: [
            ["SVC (kernel)", "Classification, small/medium data, non-linear boundaries"],
            ["LinearSVC", "Classification with many rows or text features"],
            ["SVR", "Regression: ignores errors inside a tube of width ε, penalises outside"],
            ["One-class SVM", "Anomaly detection: learns the region where normal data lives"],
          ],
        },
      },
    ],
    practice: [
      {
        q: "A linear SVM has $\\mathbf{w} = (1, 1)$, $b = -3$. Classify (1, 1) and (3, 2), find each point's distance from the boundary, and the margin width.",
        solution: [
          { p: "(1, 1): $1 + 1 - 3 = -1$ → class −1, distance $1/\\sqrt{2} \\approx 0.707$ (it lies exactly on the margin edge, so it is a support vector)." },
          { p: "(3, 2): $3 + 2 - 3 = 2$ → class +1, distance $2/\\sqrt{2} \\approx 1.414$." },
          { math: r`\text{margin} = \frac{2}{\lVert\mathbf{w}\rVert} = \frac{2}{\sqrt{2}} \approx 1.414` },
        ],
      },
      {
        q: "Compute the hinge loss for (y = +1, f = 2), (y = +1, f = 0.5), (y = −1, f = −0.2), (y = −1, f = 1).",
        solution: [{ p: "max(0, 1 − yf): 0, 0.5, 0.8, 2. Only the first is correct with enough margin; the second and third are correct but too close; the fourth is wrong." }],
      },
      {
        q: "RBF kernel with γ = 0.5. Compute $K(\\mathbf{a}, \\mathbf{b})$ for a = (0, 0), b = (1, 1) and for a = (0, 0), b = (2, 2).",
        solution: [{ math: r`e^{-0.5 \times 2} = e^{-1} \approx 0.368, \qquad e^{-0.5 \times 8} = e^{-4} \approx 0.018` }, { p: "Similarity falls off quickly with distance; larger γ makes it fall even faster." }],
      },
    ],
    interview: [
      { q: "What are support vectors?", a: "The training points that lie on or inside the margin (or are misclassified). They are the only points with non-zero weight in the solution, so they alone determine the boundary." },
      { q: "What does the C parameter control?", a: "The penalty for margin violations. Large C fits the training data tightly with a narrow margin (lower bias, higher variance); small C allows more violations for a wider, smoother margin (more regularisation)." },
      { q: "Explain the kernel trick.", a: "The SVM only needs dot products between points. A kernel computes the dot product in a high- or infinite-dimensional feature space directly from the original inputs, giving non-linear boundaries without explicitly building those features." },
    ],
    summary: [
      "Maximise the margin $2/\\lVert\\mathbf{w}\\rVert$ between classes.",
      "Support vectors alone define the boundary.",
      "Soft margin = hinge loss + L2 penalty; C ≈ 1/λ.",
      "Kernels (polynomial, RBF) give non-linear boundaries via dot products.",
      "Scale features; tune C and γ together; best on small/medium data.",
    ],
    quiz: [
      { q: "Doubling ‖w‖ in an SVM does what to the margin?", options: ["Doubles it", "Halves it", "No change", "Squares it"], answer: 1, why: "Margin = 2 / ‖w‖." },
      { q: "In the soft-margin SVM, setting C very large approaches:", options: ["The hard-margin SVM", "Logistic regression", "A constant predictor", "K-Means"], answer: 0, why: "Violations become extremely costly, so the model tries to separate the training data perfectly." },
    ],
  },

  "random-forests": {
    explain: [
      { p: "The idea behind any ensemble is the 'wisdom of crowds'. Ask many people to guess the weight of a cow: individuals are often far off, but the average is often surprisingly close, as long as their errors are not all in the same direction. Random forests build a crowd of decision trees and engineer their errors to differ." },
      { p: "Two sources of randomness make the trees different. **Bootstrap sampling** gives each tree a different version of the training set. **Feature subsampling** at each split means a dominant feature cannot be used at the top of every tree, so other useful features get a chance. Each tree is grown deep (low bias, high variance); averaging cancels much of the variance while keeping the low bias." },
      { p: "A forest's out-of-bag (OOB) score is a free cross-validation estimate. Each training row was left out of roughly a third of the trees; predict that row using only those trees and compare with its label. Averaged over all rows, this is usually close to a held-out test score, without spending any data on validation." },
      { p: "Feature importance comes in two flavours. **Impurity-based** (mean decrease in Gini) is computed for free during training but is biased toward continuous and high-cardinality features. **Permutation importance** shuffles one feature's values on held-out data and measures how much the score drops; it is slower but more trustworthy. Correlated features share importance in both, so a feature can look unimportant simply because a twin carries the same information." },
      {
        table: {
          head: ["", "Single deep tree", "Random forest"],
          rows: [
            ["Bias", "Low", "Low (similar)"],
            ["Variance", "High", "Much lower"],
            ["Interpretability", "High (readable rules)", "Lower (hundreds of trees)"],
            ["Training cost", "One tree", "B trees (parallel)"],
            ["Typical accuracy", "Moderate", "Strong baseline"],
          ],
        },
      },
      { p: "**Extra Trees** (extremely randomised trees) push randomness further by choosing split thresholds at random rather than the best one, which decorrelates the trees even more and trains faster. Forests also work for regression (average of tree predictions) and handle mixed feature types without scaling." },
    ],
    practice: [
      {
        q: "A forest of 7 trees votes [A, B, A, A, C, B, A]. What is the prediction, and the estimated probability of A?",
        solution: [{ p: "A has 4 of 7 votes, so predict A with an estimated probability of 4/7 ≈ 0.571 (scikit-learn actually averages each tree's leaf class proportions, which gives a similar number)." }],
      },
      {
        q: "Trees with variance σ² = 4 and pairwise correlation ρ = 0.5. What is the variance of the average of 10 trees? Of infinitely many?",
        solution: [
          { math: r`0.5(4) + \frac{0.5}{10}(4) = 2 + 0.2 = 2.2` },
          { p: "As B → ∞ the second term vanishes, leaving ρσ² = 2. More trees cannot beat the correlation floor; only less correlated trees can." },
        ],
      },
      {
        q: "With n = 5 rows, what is the probability a specific row is never chosen in a bootstrap sample?",
        solution: [{ math: r`(1 - \tfrac{1}{5})^5 = 0.8^5 \approx 0.328` }],
      },
    ],
    interview: [
      { q: "How does a random forest reduce overfitting compared with a single tree?", a: "Each tree overfits differently because of bootstrap samples and random feature subsets. Averaging many such trees cancels much of their variance while keeping their low bias." },
      { q: "What is the out-of-bag error?", a: "For each training row, predict using only the trees whose bootstrap sample did not include it, then compute the error over all rows. It estimates generalisation error without a separate validation set." },
      { q: "Does adding more trees cause overfitting?", a: "No. More trees reduce variance toward a floor set by tree correlation; the error plateaus. They only cost time and memory." },
    ],
    summary: [
      "Bagging: bootstrap samples + aggregate predictions.",
      "Random forest adds random feature subsets per split to decorrelate trees.",
      "Variance of the average: $\\rho\\sigma^2 + (1 - \\rho)\\sigma^2/B$.",
      "OOB score gives free validation; permutation importance is the trustworthy importance.",
      "Strong, low-tuning baseline; no scaling; does not extrapolate.",
    ],
    quiz: [
      { q: "Each bootstrap sample contains roughly what share of distinct original rows?", options: ["37%", "50%", "63%", "100%"], answer: 2, why: "1 − 1/e ≈ 0.632." },
      { q: "Which hyperparameter most directly reduces correlation between trees?", options: ["n_estimators", "max_features", "random_state", "n_jobs"], answer: 1, why: "Fewer candidate features per split makes trees choose different splits." },
    ],
  },

  "gradient-boosting": {
    explain: [
      { p: "Boosting works like a student correcting mistakes. The first model makes rough predictions. The second looks only at where the first was wrong and learns to correct those errors. The third corrects what is still wrong after the first two, and so on. Each model is weak on its own (a tree with a few splits), but the sum becomes very accurate." },
      { p: "Gradient boosting generalises 'fit the residuals' to any differentiable loss. At each round, compute for every training row the negative gradient of the loss with respect to the current prediction, the direction each prediction should move to reduce the loss, and fit a small tree to those values. For squared error this is literally the residual; for log loss it is $y - p$; for absolute error it is the sign of the residual." },
      { p: "The learning rate (shrinkage) $\\eta$ scales each tree's contribution. With $\\eta = 1$, each tree tries to fix all remaining error at once and quickly starts fitting noise. With $\\eta = 0.05$, each tree fixes a little, so you need more trees, but the ensemble generalises better. The standard recipe: small learning rate, many trees, early stopping on a validation set to pick the number of rounds." },
      { p: "Modern libraries add several tricks. **XGBoost** adds L1/L2 penalties on leaf values and uses second derivatives for better splits. **LightGBM** grows trees leaf-wise and bins features into histograms for speed. **CatBoost** handles categorical features natively with ordered target statistics to avoid leakage. scikit-learn's `HistGradientBoosting` uses the histogram idea too." },
      {
        table: {
          head: ["Symptom", "Likely cause", "Fix"],
          rows: [
            ["Train error ≪ validation error", "Overfitting", "Lower η, shallower trees, subsample < 1, more regularisation, early stopping"],
            ["Both errors high", "Underfitting", "More rounds, deeper trees, higher η"],
            ["Validation error rises after round N", "Too many rounds", "Early stopping at N"],
            ["Very slow training", "Large data", "Histogram-based implementation (LightGBM, HistGB)"],
          ],
        },
      },
      { p: "Boosted trees are often the strongest choice for tabular data (rows and columns of mixed features), beating neural networks in many competitions. Neural networks dominate on images, audio and text, where they learn features from raw inputs." },
    ],
    practice: [
      {
        q: "Continue the page's example: after round 1 the residuals are [−2, 0, 2] at x = [1, 2, 3]. Round 2 uses a stump split at x ≤ 1. With η = 0.5, what are the new predictions and MSE? (Current predictions [5, 5, 8], targets [3, 5, 10].)",
        solution: [
          { p: "Left leaf (x = 1) predicts −2; right leaf (x = 2, 3) predicts the mean of [0, 2] = 1." },
          { math: r`F_2 = [5 + 0.5(-2),\; 5 + 0.5(1),\; 8 + 0.5(1)] = [4,\; 5.5,\; 8.5]` },
          { math: r`\text{residuals} = [-1,\; -0.5,\; 1.5], \quad \text{MSE} = \tfrac{1 + 0.25 + 2.25}{3} \approx 1.17` },
        ],
      },
      {
        q: "AdaBoost: a weak classifier has weighted error ε = 0.1. What is its vote weight α? And for ε = 0.4?",
        solution: [{ math: r`\alpha = \tfrac{1}{2}\ln\tfrac{0.9}{0.1} = \tfrac{1}{2}\ln 9 \approx 1.10, \qquad \tfrac{1}{2}\ln\tfrac{0.6}{0.4} \approx 0.20` }],
      },
      {
        q: "For log loss, a row has label y = 1 and current predicted probability 0.2. What value (pseudo-residual) does the next tree try to fit for this row?",
        solution: [{ p: "$y - p = 1 - 0.2 = 0.8$. The next tree pushes this row's score up." }],
      },
    ],
    interview: [
      { q: "Bagging vs boosting?", a: "Bagging trains models independently on bootstrap samples and averages them, mainly reducing variance (random forests). Boosting trains models sequentially, each correcting the previous errors, mainly reducing bias (gradient boosting, AdaBoost)." },
      { q: "Why is it called gradient boosting?", a: "Each new tree is fitted to the negative gradient of the loss with respect to the current predictions, so adding it is a gradient-descent step in function space." },
      { q: "How do you prevent a gradient boosting model from overfitting?", a: "Small learning rate with early stopping on a validation set, shallow trees, row and column subsampling, minimum samples per leaf, and L1/L2 penalties on leaf values (XGBoost/LightGBM)." },
    ],
    summary: [
      "Sequentially add weak trees that fix the current errors.",
      "Each tree fits the negative gradient (residual for MSE, y − p for log loss).",
      "Small η + many trees + early stopping is the standard recipe.",
      "Boosting reduces bias; bagging reduces variance.",
      "XGBoost, LightGBM, CatBoost: top choice for tabular data.",
    ],
    quiz: [
      { q: "Unlike random forests, gradient boosting can overfit when you:", options: ["Use shallow trees", "Add too many trees without early stopping", "Use a small learning rate", "Subsample rows"], answer: 1, why: "Each extra tree fits remaining error, eventually including noise." },
      { q: "In AdaBoost, a classifier with error exactly 0.5 gets vote weight:", options: ["0", "0.5", "1", "Infinite"], answer: 0, why: "α = ½ ln(0.5/0.5) = 0: random guessing contributes nothing." },
    ],
  },
};
