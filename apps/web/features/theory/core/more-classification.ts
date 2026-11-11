import type { TheoryTopic } from "../topics";

const r = String.raw;

export const MORE_CLASSIFICATION_THEORY: TheoryTopic[] = [
  {
    slug: "naive-bayes",
    group: "Classification",
    title: "Naive Bayes",
    summary: "Bayes' theorem plus one bold shortcut: treat every feature as independent given the class.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Naive Bayes picks the class with the highest posterior probability, computed with Bayes' theorem under the 'naive' assumption that features are independent once you know the class." } },
          { p: "The independence assumption is almost never true (in an email, 'free' and 'offer' tend to appear together), yet Naive Bayes often classifies well because it only needs the **ranking** of classes to be right, not the exact probabilities. It trains in one pass over the data and is a strong baseline for text." },
        ],
      },
      {
        heading: "The maths",
        blocks: [
          { math: r`P(y \mid \mathbf{x}) = \frac{P(\mathbf{x} \mid y)\,P(y)}{P(\mathbf{x})} \;\propto\; P(y)\prod_{j=1}^{d} P(x_j \mid y)` },
          { math: r`\hat{y} = \arg\max_{y}\; \Big[\ln P(y) + \sum_{j=1}^{d}\ln P(x_j \mid y)\Big]` },
          { p: "$P(\\mathbf{x})$ is the same for every class, so it can be dropped when comparing. Logs turn the product into a sum and stop tiny probabilities underflowing to 0." },
          {
            table: {
              head: ["Variant", "Feature type", "Models $P(x_j \\mid y)$ as", "Typical use"],
              rows: [
                ["Gaussian NB", "Continuous", "Normal distribution with a per-class mean and variance", "Sensor readings, measurements"],
                ["Multinomial NB", "Counts", "Word-count frequencies", "Text classification (bag of words)"],
                ["Bernoulli NB", "Binary present/absent", "Probability the feature is present", "Short text, yes/no features"],
              ],
            },
          },
          { p: "**Laplace smoothing**: if a word never appears in one class during training, its probability would be 0 and wipe out the whole product. Add a pseudo-count $\\alpha$ (usually 1):" },
          { math: r`P(x_j = 1 \mid y) = \frac{\text{count}(x_j = 1,\, y) + \alpha}{\text{count}(y) + 2\alpha}` },
        ],
      },
      {
        heading: "Worked example: is this email spam?",
        blocks: [
          { p: "Training: 10 emails, 4 spam and 6 ham. 'free' appears in 3 of 4 spam and 1 of 6 ham. 'meeting' appears in 1 of 4 spam and 4 of 6 ham. A new email contains 'free' but not 'meeting'." },
          {
            steps: [
              { title: "Priors", body: "", math: r`P(\text{spam}) = 0.4, \qquad P(\text{ham}) = 0.6` },
              { title: "Likelihoods (Bernoulli)", body: "Not containing 'meeting' has probability 1 − P(meeting | class).", math: r`P(\text{free} \mid s) = \tfrac{3}{4},\; P(\neg\text{meeting} \mid s) = \tfrac{3}{4}; \quad P(\text{free} \mid h) = \tfrac{1}{6},\; P(\neg\text{meeting} \mid h) = \tfrac{2}{6}` },
              { title: "Unnormalised scores", body: "", math: r`\text{spam}: 0.4 \times 0.75 \times 0.75 = 0.225, \qquad \text{ham}: 0.6 \times \tfrac{1}{6} \times \tfrac{2}{6} \approx 0.0333` },
              { title: "Normalise", body: "Divide by the total to get a probability. The email is classified as spam.", math: r`P(\text{spam} \mid \mathbf{x}) = \frac{0.225}{0.225 + 0.0333} \approx 0.871` },
              { title: "Why smoothing matters", body: "If 'lottery' appeared in 0 of 6 ham emails, any ham email containing it would get probability 0. With α = 1 it becomes (0 + 1)/(6 + 2) = 0.125 instead." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "bayes", caption: "Bayes' theorem on its own: a rare class stays unlikely even after a fairly accurate flag. Naive Bayes multiplies one such update per feature." }],
      },
      {
        heading: "Strengths and weaknesses",
        blocks: [
          {
            table: {
              head: ["Strengths", "Weaknesses"],
              rows: [
                ["Very fast to train and predict", "Independence assumption makes probabilities over-confident"],
                ["Works with little data and many features (text)", "Correlated features get double-counted"],
                ["Handles many classes naturally", "Gaussian NB assumes bell-shaped features"],
                ["Easy to explain: per-feature evidence", "Usually beaten by logistic regression with enough data"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, GaussianNB
from sklearn.pipeline import make_pipeline

spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))
spam.fit(train_texts, train_labels)
spam.predict(["claim your free prize now"])

gnb = GaussianNB().fit(X_train, y_train)      # continuous features
gnb.predict_proba(X_test)[:5]`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Trusting the predicted probabilities as calibrated", fix: "Use the ranking, or calibrate with CalibratedClassifierCV." },
              { mistake: "Turning smoothing off (α = 0)", fix: "One unseen word then zeroes a class. Keep α > 0." },
              { mistake: "Feeding negative values to MultinomialNB", fix: "It expects counts or TF-IDF (non-negative). Use GaussianNB for general numbers." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "What does the 'naive' in Naive Bayes refer to?", options: ["It ignores the prior P(y)", "It assumes features are independent given the class", "It only works with two classes", "It uses no training data"], answer: 1, why: "That assumption lets P(x | y) factor into a product of one-feature terms, which is what makes the model so cheap." } },
        ],
      },
    ],
  },
  {
    slug: "support-vector-machines",
    group: "Classification",
    title: "Support Vector Machines",
    summary: "Find the boundary with the widest possible margin; kernels let it bend.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "An SVM chooses the separating boundary that stays as far as possible from the nearest points of each class, and kernels let it draw curved boundaries without building curved features by hand." } },
          { p: "Many lines can separate two clouds of points. The SVM prefers the one with the biggest gap (margin) on both sides, because a wide margin leaves room for new points to land slightly off and still be classified correctly. Only the points on the edge of the margin, the **support vectors**, decide where the boundary goes." },
        ],
      },
      {
        heading: "The maths",
        blocks: [
          { p: "Labels are $y_i \\in \\{-1, +1\\}$. The boundary is $\\mathbf{w}^\\top\\mathbf{x} + b = 0$ and the margin edges are where it equals ±1. The margin width is $2 / \\lVert\\mathbf{w}\\rVert$, so maximising the margin means minimising $\\lVert\\mathbf{w}\\rVert$:" },
          { math: r`\text{Hard margin: } \min_{\mathbf{w}, b}\; \tfrac{1}{2}\lVert\mathbf{w}\rVert^2 \quad \text{s.t. } y_i(\mathbf{w}^\top\mathbf{x}_i + b) \ge 1 \;\; \forall i` },
          { p: "Real data overlaps, so the **soft-margin** SVM allows violations and pays for them with the hinge loss:" },
          { math: r`\min_{\mathbf{w}, b}\; \tfrac{1}{2}\lVert\mathbf{w}\rVert^2 + C\sum_i \max\big(0,\; 1 - y_i(\mathbf{w}^\top\mathbf{x}_i + b)\big)` },
          { p: "Large $C$: violations are expensive, so the margin narrows to fit the training data (risk of overfitting). Small $C$: a wider margin that tolerates mistakes (more regularisation)." },
          {
            derive: {
              title: "Why the margin is 2 / ‖w‖",
              blocks: [
                { p: "The distance from a point $\\mathbf{x}$ to the plane $\\mathbf{w}^\\top\\mathbf{x} + b = 0$ is $|\\mathbf{w}^\\top\\mathbf{x} + b| / \\lVert\\mathbf{w}\\rVert$. A point on a margin edge has $|\\mathbf{w}^\\top\\mathbf{x} + b| = 1$, so it sits $1/\\lVert\\mathbf{w}\\rVert$ from the boundary. Both edges together give:" },
                { math: r`\text{margin} = \frac{1}{\lVert\mathbf{w}\rVert} + \frac{1}{\lVert\mathbf{w}\rVert} = \frac{2}{\lVert\mathbf{w}\rVert}` },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "A trained linear SVM has $\\mathbf{w} = (3, 4)$ and $b = -10$." },
          {
            steps: [
              { title: "Margin width", body: "", math: r`\lVert\mathbf{w}\rVert = \sqrt{3^2 + 4^2} = 5, \qquad \text{margin} = \tfrac{2}{5} = 0.4` },
              { title: "Classify (3, 2)", body: "Positive score, so class +1. Its distance from the boundary is 7/5.", math: r`3(3) + 4(2) - 10 = 7 \;\Rightarrow\; +1, \quad \text{distance} = \tfrac{7}{5} = 1.4` },
              { title: "A point on the boundary", body: "(2, 1) scores exactly 0: the model is undecided.", math: r`3(2) + 4(1) - 10 = 0` },
              { title: "Hinge loss", body: "A correct point beyond the margin (score ≥ 1) costs nothing. A correct but too-close point still costs something; a wrong one costs more.", math: r`y = +1,\, f = 1.5: 0 \qquad y = +1,\, f = 0.4: 0.6 \qquad y = -1,\, f = 0.4: 1.4` },
            ],
          },
        ],
      },
      {
        heading: "Kernels: curved boundaries",
        blocks: [
          { p: "The SVM solution only needs dot products between points. Replacing $\\mathbf{x}_i^\\top\\mathbf{x}_j$ with a **kernel** $K(\\mathbf{x}_i, \\mathbf{x}_j)$ is the same as working in a much richer feature space, without ever computing those features (the kernel trick)." },
          {
            table: {
              head: ["Kernel", "$K(\\mathbf{a}, \\mathbf{b})$", "Boundary"],
              rows: [
                ["Linear", "$\\mathbf{a}^\\top\\mathbf{b}$", "Straight; best for many features (text)"],
                ["Polynomial", "$(\\mathbf{a}^\\top\\mathbf{b} + c)^p$", "Polynomial curves"],
                ["RBF (Gaussian)", "$\\exp(-\\gamma\\lVert\\mathbf{a} - \\mathbf{b}\\rVert^2)$", "Smooth, flexible; the default"],
              ],
            },
          },
          { p: "For RBF, $\\gamma$ sets how far one point's influence reaches. Large $\\gamma$: very local, wiggly boundary (overfit). Small $\\gamma$: smooth, almost linear. Tune $C$ and $\\gamma$ together on a log grid." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.svm import SVC, LinearSVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
grid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10, 100],
                           "svc__gamma": [0.001, 0.01, 0.1, 1]}, cv=5)
grid.fit(X_train, y_train)
print(grid.best_params_, grid.score(X_test, y_test))

# Many samples or text features: the linear version is much faster
fast = make_pipeline(StandardScaler(), LinearSVC(C=1.0)).fit(X_train, y_train)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Not scaling features", fix: "Margins and RBF distances depend on scale. Always standardise." },
              { mistake: "Using kernel SVC on hundreds of thousands of rows", fix: "Training time grows roughly with n² to n³. Use LinearSVC or SGDClassifier." },
              { mistake: "Expecting probabilities by default", fix: "SVC outputs scores. Set probability=True (slower) or use decision_function for ranking." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "An RBF SVM scores 100% on training data and 70% on validation. Which change helps most?", options: ["Increase γ", "Increase C", "Decrease C and/or γ", "Switch off scaling"], answer: 2, why: "Large C and γ let the boundary wrap around individual points. Lowering them widens the margin and smooths the boundary, reducing overfitting." } },
        ],
      },
    ],
  },
  {
    slug: "random-forests",
    group: "Classification",
    title: "Bagging & Random Forests",
    summary: "Train many different trees on resampled data and let them vote: the errors average out.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A random forest trains many decision trees, each on a bootstrap sample with a random subset of features at every split, and averages their predictions to cut variance." } },
          { p: "One deep tree is accurate but jumpy: change a few training rows and it changes a lot. Many trees that make **different** mistakes, averaged together, keep the accuracy and cancel much of the jumpiness. The randomness exists to make the trees different." },
        ],
      },
      {
        heading: "How it works",
        blocks: [
          {
            steps: [
              { title: "Bootstrap", body: "For each tree, sample n rows from the training set **with replacement**. Some rows appear several times, about 37% not at all." },
              { title: "Grow a tree with random features", body: "At each split, consider only a random subset of features (often √d for classification, d/3 for regression). This stops every tree from splitting on the same strong feature." },
              { title: "Repeat B times", body: "Hundreds of trees, each trained independently (easy to run in parallel)." },
              { title: "Aggregate", body: "Classification: majority vote (or average probabilities). Regression: average the predictions." },
            ],
          },
          { p: "Bootstrap + aggregate = **bagging**. Random forests add the random feature subsets on top." },
          { math: r`\operatorname{Var}\big(\bar{f}\big) = \rho\sigma^2 + \frac{1 - \rho}{B}\,\sigma^2` },
          { p: "$\\sigma^2$ is one tree's variance and $\\rho$ the correlation between trees. More trees shrink the second term; random features shrink $\\rho$, which shrinks the first. That formula is the whole design rationale." },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          {
            steps: [
              { title: "How much does each tree see?", body: "The chance a given row is never drawn in n draws approaches 1/e. So each tree sees about 63% of the distinct rows.", math: r`\Big(1 - \tfrac{1}{n}\Big)^n \to e^{-1} \approx 0.368` },
              { title: "Out-of-bag (OOB) score", body: "The ~37% of rows a tree did not see form a free validation set. Averaging each row's predictions from the trees that never saw it gives the OOB score, without a separate split." },
              { title: "Variance reduction", body: "Trees with σ² = 1 and correlation ρ = 0.3, B = 100 trees:", math: r`0.3(1) + \frac{0.7}{100}(1) = 0.307 \quad (\text{vs } 1 \text{ for one tree})` },
              { title: "Why voting helps", body: "If 5 independent trees are each right 70% of the time, the majority is right whenever at least 3 are.", math: r`P(\ge 3 \text{ correct}) = \textstyle\sum_{k=3}^{5}\binom{5}{k}0.7^k\,0.3^{5-k} \approx 0.837` },
            ],
          },
          { p: "In practice trees are correlated, so the gain is smaller than the independent case suggests, which is exactly why random feature subsets matter." },
        ],
      },
      {
        heading: "Hyperparameters",
        blocks: [
          {
            table: {
              head: ["Hyperparameter", "Effect", "Starting point"],
              rows: [
                ["`n_estimators`", "Number of trees; more is never worse, just slower", "200–500"],
                ["`max_features`", "Features tried per split; lower = less correlated trees", "'sqrt' (classification)"],
                ["`max_depth` / `min_samples_leaf`", "Limits each tree", "Often unlimited depth, leaf 1–5"],
                ["`oob_score`", "Free validation estimate", "True"],
              ],
            },
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gini", caption: "Each tree in the forest chooses its splits with this impurity measure, but only among a random handful of features." }],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

rf = RandomForestClassifier(n_estimators=300, max_features="sqrt",
                            oob_score=True, n_jobs=-1, random_state=0)
rf.fit(X_train, y_train)
print(rf.oob_score_, rf.score(X_test, y_test))

imp = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
print(imp.importances_mean)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Expecting a forest to extrapolate", fix: "Predictions are averages of training targets; they never go beyond the training range." },
              { mistake: "Reading impurity importances as truth", fix: "They favour high-cardinality features. Use permutation importance on held-out data." },
              { mistake: "Tuning n_estimators as if it overfits", fix: "More trees do not overfit; stop when the score plateaus to save time." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Why does a random forest pick a random subset of features at each split?", options: ["To train faster only", "To make trees less correlated so averaging removes more variance", "To reduce bias", "Because trees cannot handle many features"], answer: 1, why: "Without it, every tree would split on the same strong features and make similar mistakes. Decorrelated trees average out better (the ρσ² term shrinks)." } },
        ],
      },
    ],
  },
  {
    slug: "gradient-boosting",
    group: "Classification",
    title: "Boosting: AdaBoost & Gradient Boosting",
    summary: "Add small models one at a time, each fixing the mistakes of the ones before.",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Boosting builds an ensemble sequentially: each new weak model (usually a small tree) is trained to correct the errors the current ensemble still makes." } },
          { p: "Bagging trains strong trees in parallel to reduce variance. Boosting trains **weak** trees in sequence to reduce bias. Gradient-boosted trees (XGBoost, LightGBM, CatBoost) are usually the best off-the-shelf models for tabular data." },
          {
            table: {
              head: ["", "Bagging / Random forest", "Boosting"],
              rows: [
                ["Trees trained", "Independently, in parallel", "One after another"],
                ["Each tree", "Deep (low bias, high variance)", "Shallow (high bias, low variance)"],
                ["Mainly reduces", "Variance", "Bias"],
                ["Overfits with more trees?", "No", "Yes, eventually: use early stopping"],
              ],
            },
          },
        ],
      },
      {
        heading: "Gradient boosting",
        blocks: [
          { p: "Start with a constant, then repeatedly fit a small tree $h_m$ to the **negative gradient** of the loss (for squared error, that is just the residual) and add a shrunken copy of it:" },
          { math: r`F_0(\mathbf{x}) = \arg\min_c \sum_i \ell(y_i, c), \qquad r_{im} = -\frac{\partial \ell(y_i, F(\mathbf{x}_i))}{\partial F(\mathbf{x}_i)}\Big|_{F = F_{m-1}}` },
          { math: r`F_m(\mathbf{x}) = F_{m-1}(\mathbf{x}) + \eta\, h_m(\mathbf{x})` },
          { p: "This is gradient descent, but in the space of functions: each tree is one step downhill. The learning rate $\\eta$ (0.01–0.3) trades more trees for better generalisation." },
          {
            derive: {
              title: "Why residuals are the gradient for squared error",
              blocks: [
                { p: "With $\\ell = \\tfrac{1}{2}(y - F)^2$, the derivative with respect to the prediction is $\\partial\\ell/\\partial F = -(y - F)$. The negative gradient is $y - F$: the residual. For log loss in classification, the same recipe gives $y - p$, the gap between the label and the predicted probability." },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: two boosting rounds",
        blocks: [
          { p: "Targets $y = [3, 5, 10]$ at $x = [1, 2, 3]$, squared error, $\\eta = 0.5$, stumps (one-split trees)." },
          {
            steps: [
              { title: "Round 0: a constant", body: "The best constant for squared error is the mean.", math: r`F_0 = 6, \quad \text{residuals} = [-3, -1, 4], \quad \text{MSE} = \tfrac{9 + 1 + 16}{3} \approx 8.67` },
              { title: "Fit a stump to the residuals", body: "Split at x ≤ 2: left leaf predicts the mean residual −2, right leaf predicts 4." },
              { title: "Update with a shrunken step", body: "", math: r`F_1 = [6 + 0.5(-2),\; 6 + 0.5(-2),\; 6 + 0.5(4)] = [5, 5, 8]` },
              { title: "New residuals", body: "MSE fell from 8.67 to 2.67 with one small tree. The next tree is fitted to [−2, 0, 2], and so on.", math: r`[3 - 5,\; 5 - 5,\; 10 - 8] = [-2, 0, 2], \quad \text{MSE} = \tfrac{4 + 0 + 4}{3} \approx 2.67` },
            ],
          },
        ],
      },
      {
        heading: "AdaBoost in brief",
        blocks: [
          { p: "AdaBoost (the original boosting method) re-weights the **data** instead of fitting residuals. After each weak classifier with weighted error $\\varepsilon_m$:" },
          { math: r`\alpha_m = \tfrac{1}{2}\ln\frac{1 - \varepsilon_m}{\varepsilon_m}, \qquad w_i \leftarrow w_i\, e^{-\alpha_m y_i h_m(\mathbf{x}_i)}` },
          { p: "Misclassified points get heavier, so the next classifier focuses on them. A classifier with $\\varepsilon = 0.2$ gets a vote of $\\alpha = \\tfrac{1}{2}\\ln 4 \\approx 0.69$; one at $\\varepsilon = 0.5$ (random guessing) gets 0. Final prediction: $\\operatorname{sign}\\big(\\sum_m \\alpha_m h_m(\\mathbf{x})\\big)$." },
        ],
      },
      {
        heading: "Hyperparameters",
        blocks: [
          {
            table: {
              head: ["Hyperparameter", "Effect", "Typical range"],
              rows: [
                ["`learning_rate` (η)", "Shrinks each tree; smaller needs more trees but generalises better", "0.01–0.1"],
                ["`n_estimators`", "Number of rounds; too many overfits", "Set high, use early stopping"],
                ["`max_depth`", "Tree size; controls interaction depth", "3–8"],
                ["`subsample`", "Fraction of rows per tree (stochastic boosting)", "0.5–0.9"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.ensemble import HistGradientBoostingClassifier

gb = HistGradientBoostingClassifier(
    learning_rate=0.05, max_iter=1000, max_depth=6,
    early_stopping=True, validation_fraction=0.1, n_iter_no_change=30,
    random_state=0)
gb.fit(X_train, y_train)
print(gb.n_iter_, gb.score(X_test, y_test))   # rounds actually used`,
          },
          { p: "XGBoost and LightGBM have the same core idea plus regularisation terms on the trees and very fast split finding. Their APIs mirror scikit-learn's." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Huge learning rate with many trees", fix: "Lower η and rely on early stopping to pick the number of trees." },
              { mistake: "Deep trees in boosting", fix: "Boosting wants weak learners; depth 3–8 is usually enough." },
              { mistake: "Early stopping on the test set", fix: "Stop on a validation split carved from the training data." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "In gradient boosting with squared error, what does each new tree try to predict?", options: ["The original targets y", "The residuals of the current ensemble", "The class probabilities", "Random noise"], answer: 1, why: "For squared error the negative gradient is y − F(x), the residual. Each tree learns what the ensemble still gets wrong." } },
        ],
      },
    ],
  },
];
