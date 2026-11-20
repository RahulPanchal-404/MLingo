import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Random Forests. */
export const FOREST: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "One deep tree memorises its training data and changes a lot if the data change a little. A forest grows hundreds of trees, each on a slightly different random sample and with random feature choices, then averages them. The wobbles cancel out.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Wisdom of a crowd of trees",
          blocks: [
            { p: "Ask 300 people to guess the weight of a cow. Individual guesses are off by a lot, but in different directions, so their average is surprisingly close. A forest works the same way, as long as the trees make different mistakes. That is why each tree sees a different bootstrap sample and a random subset of features at each split." },
          ],
        },
      ],
    },
    "How it works": {
      examples: [
        {
          title: "One bootstrap sample",
          blocks: [
            { p: "Rows 0–9, draw 10 with replacement: $[3, 9, 8, 2, 5, 9, 7, 9, 1, 9]$. Row 9 appears four times; rows 0, 4 and 6 never appear. Those three are \"out of bag\" for this tree and can be used to test it." },
          ],
        },
      ],
    },
    "Hyperparameters": {
      examples: [
        {
          title: "A single tree versus a forest",
          blocks: [
            { p: "On the breast-cancer data (code step below): one unpruned tree scores 0.902 on test data; a 300-tree forest scores 0.944, and its out-of-bag estimate (0.962) came for free without a separate validation set." },
          ],
        },
      ],
    },
    "1.2.8 Trees, ensembles, and the danger of tiny leaves": {
      plain: "A tree splits to make groups purer; a forest averages many such trees; boosting adds trees one after another, each fixing the last one's mistakes.",
      replace: {
        0: { p: "A decision tree repeatedly partitions observations. A classification node containing class proportions $p_1, \\dots, p_K$ has Gini impurity $1 - \\sum_k p_k^2$. Its entropy is $-\\sum_k p_k\\log_2 p_k$, with zero-probability terms treated as zero. For a candidate split, compare parent impurity with the weighted average impurity of the left and right children. Weight each child by its number of training observations; a perfectly pure child containing only two trips should not dominate a large mixed child." },
      },
    },
    "2.10.4 Bootstrap forests and out-of-bag evidence": {
      plain: "Each tree misses about a third of the rows. Scoring each row only with the trees that never saw it gives a free validation estimate, as long as rows are independent.",
    },
    "2.12.2 Bagging, random forests, and out-of-bag estimates": {
      plain: "Averaging helps most when the trees' errors are not correlated. Random feature choice at each split makes the trees more different, so the average improves.",
      replace: {
        1: { p: "Bootstrap aggregation (bagging) fits $B$ base models on $B$ bootstrap resamples of the development dataset, each made by taking $n$ draws with replacement from $n$ training rows. A given row has probability $(1 - 1/n)^n$ of being omitted from one resample: every draw must choose one of the other $n - 1$ rows. As $n$ grows, this tends to $e^{-1} \\approx 0.368$. Hence the expected distinct fraction included in a large bootstrap resample is about $1 - e^{-1} = 0.632$. These are expectations, not guarantees for each actual resample." },
        2: { p: "For regression, averaging model predictions can reduce variance. If $B$ component prediction errors have common variance $\\sigma^2$ and a common pairwise correlation $\\rho$, the variance of their average is $\\sigma^2[1 + (B-1)\\rho]/B = \\sigma^2[\\rho + (1-\\rho)/B]$. Derive it by expanding the variance of $\\frac1B\\sum_b e_b$: $B$ diagonal variance terms and $B(B-1)$ covariance terms. If $\\rho = 1$, all predictions move together and averaging offers no variance reduction. If $\\rho = 0$, variance falls to $\\sigma^2/B$ under the simplifying assumption. Random forests add randomness to tree construction, commonly by considering a subset of candidate features at each split, to reduce correlations between trees while preserving useful predictive structure. The best subset size depends on the task and is tuned under honest validation." },
        6: { p: "**Worked exercise.** If five model errors have variance 4 each and pairwise error correlation 0.25 under the simplifying common-correlation setup, the variance of their average is $4[0.25 + 0.75/5] = 4 \\times 0.40 = 1.6$. If the errors were perfectly correlated, variance would remain 4 no matter how many copies of the same model were averaged." },
      },
      examples: [
        {
          at: 2,
          title: "How correlation limits averaging",
          blocks: [
            { table: { head: ["Correlation $\\rho$", "Variance of average of 100 trees ($\\sigma^2 = 4$)"], rows: [["0", "0.04"], ["0.25", "1.03"], ["0.6", "2.42"], ["1", "4"]] } },
            { p: "With correlated trees, adding more trees stops helping quickly. Making trees more different (lower $\\rho$) matters more than adding trees." },
          ],
        },
      ],
    },
    "2.13.1 Random forests: diversity, aggregation, and evaluation": {
      plain: "Bootstrap samples and random feature subsets make trees differ; averaging them gives a steadier prediction than any single tree.",
      replace: {
        1: { p: "If a particular original row is omitted from a tree's bootstrap sample, that tree can make an out-of-bag prediction for the row. Combining only trees that excluded it gives an out-of-bag estimate. The chance that a specified row is absent from $n$ draws is $(1 - 1/n)^n$, which approaches $e^{-1} \\approx 0.368$ as $n$ grows. Hence each row is omitted from roughly 36.8% of large bootstrap samples on average. This is a useful internal validation mechanism, but it does not automatically simulate a future time period or a new conveyor site." },
      },
    },
    "Textbook case: Bagging, Random Forests, and Honest Out-of-Bag Evidence": {
      plain: "Depot repair forecasts used to show why averaging works, what out-of-bag scores really measure, and how they can mislead when rows are related.",
    },
    "2.19.1 Why averaging unstable trees can help": {
      plain: "The variance of an average is $\\sigma^2[\\rho + (1-\\rho)/B]$: more trees shrink the second part, but the first part, set by how similar the trees are, never goes away.",
    },
    "2.19.2 Bootstrap sampling creates different training views": {
      plain: "Every tree gets its own resampled dataset, so early splits differ and the trees disagree in useful ways.",
    },
    "2.19.3 What an out-of-bag estimate actually measures": {
      plain: "Out-of-bag scoring tests each row with trees that did not see that row, but those trees may have seen its siblings (same depot, same week), so it can be too optimistic.",
    },
    "2.19.4 Bootstrap arithmetic and limits of naive uncertainty": {
      plain: "With few rows, the omission chance is not exactly 36.8%. Uncertainty estimates must resample the truly independent unit (depots, not rows).",
    },
    "2.19.5 Feature importance and failure diagnosis": {
      plain: "Impurity importance favours features with many possible split points. Permutation importance on held-out data is more honest, but correlated features share credit.",
    },
    "2.19.6 Verify the sampling probability and variance identity": {
      plain: "The code checks the omission probability and the ensemble variance formula.",
    },
  },
  code: {
    "2.10.4 Bootstrap forests and out-of-bag evidence#0": {
      goal: "Fit a forest with an out-of-bag score",
      code: r`import numpy as np
from sklearn.ensemble import RandomForestClassifier
X = np.array([[i % 4, (i//4) % 5] for i in range(80)], dtype=float)
y = np.array([int(a+b >= 4) for a,b in X])
forest = RandomForestClassifier(n_estimators=60, min_samples_leaf=2,
                                bootstrap=True, oob_score=True, random_state=9)
forest.fit(X,y)
assert len(forest.estimators_) == 60
assert np.isfinite(forest.oob_score_)
assert forest.predict_proba(X[:3]).shape == (3,2)
print("trees:", len(forest.estimators_), "| out-of-bag accuracy:", round(forest.oob_score_, 3))

# Output:
# trees: 60 | out-of-bag accuracy: 1.0`,
      walk: [
        { line: "y = np.array([int(a+b >= 4) for a,b in X])", say: "A simple rule generates the labels, so the forest should learn it almost perfectly." },
        { line: "assert np.isfinite(forest.oob_score_)", say: "With `oob_score=True`, each row is scored only by trees that did not train on it." },
      ],
    },
    "2.12.2 Bagging, random forests, and out-of-bag estimates#0": {
      goal: "Draw a bootstrap sample and list its out-of-bag rows",
      code: r`import random


def bootstrap_with_oob(n, *, seed):
    if n < 2:
        raise ValueError("At least two training rows required")
    rng = random.Random(seed)
    selected = [rng.randrange(n) for _ in range(n)]
    omitted = [i for i in range(n) if i not in set(selected)]
    return selected, omitted


selected, omitted = bootstrap_with_oob(10, seed=3)
assert len(selected) == 10
assert all(0 <= i < 10 for i in selected)
assert set(selected).isdisjoint(omitted)
assert len(set(selected)) + len(omitted) == 10
print("bootstrap sample:", selected, "| out-of-bag rows:", sorted(omitted))

# Output:
# bootstrap sample: [3, 9, 8, 2, 5, 9, 7, 9, 1, 9] | out-of-bag rows: [0, 4, 6]`,
      walk: [
        { line: "selected = [rng.randrange(n) for _ in range(n)]", say: "$n$ draws with replacement: some rows repeat, some never appear." },
        { line: "omitted = [i for i in range(n) if i not in set(selected)]", say: "The rows never drawn are out of bag for this tree." },
      ],
    },
    "2.19.6 Verify the sampling probability and variance identity#0": {
      goal: "Check the omission probability and the ensemble variance formula",
      code: r`import numpy as np

n=4
p_omitted=(1-1/n)**n
assert np.isclose(p_omitted,81/256)
p_no_oob_in_five=(1-p_omitted)**5
assert 0<p_no_oob_in_five<1

B=5
variance=4.
rho=.25
cov=variance*((1-rho)*np.eye(B)+rho*np.ones((B,B)))
weights=np.ones(B)/B
direct=weights@cov@weights
formula=variance*(rho+(1-rho)/B)
assert np.isclose(direct,formula)
assert np.isclose(formula,1.6)
assert np.linalg.eigvalsh(cov).min()>0
print("P(row omitted, n=4):", p_omitted, "=", round(p_omitted, 4), "| ensemble variance:", round(direct, 3), "= formula", formula)

# Output:
# P(row omitted, n=4): 0.31640625 = 0.3164 | ensemble variance: 1.6 = formula 1.6`,
      walk: [
        { line: "cov=variance*((1-rho)*np.eye(B)+rho*np.ones((B,B)))", say: "Covariance matrix of $B$ errors with equal variance and equal pairwise correlation." },
        { line: "direct=weights@cov@weights", say: "Variance of the average computed directly from the matrix." },
        { line: "formula=variance*(rho+(1-rho)/B)", say: "The shortcut formula gives the same 1.6." },
      ],
    },
    "In Python#0": {
      goal: "A random forest versus a single tree, with out-of-bag and permutation importance",
      code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.25, random_state=0, stratify=data.target)

tree = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
rf = RandomForestClassifier(n_estimators=300, max_features="sqrt", oob_score=True, n_jobs=-1, random_state=0)
rf.fit(X_train, y_train)
print("single tree test accuracy:", round(tree.score(X_test, y_test), 3))
print("forest out-of-bag accuracy:", round(rf.oob_score_, 3), "| forest test accuracy:", round(rf.score(X_test, y_test), 3))

imp = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)
top = np.argsort(imp.importances_mean)[::-1][:5]
print("top 5 features by permutation importance:")
for i in top:
    print(f"  {data.feature_names[i]:<22} {imp.importances_mean[i]:.4f}")

# Output:
# single tree test accuracy: 0.902
# forest out-of-bag accuracy: 0.962 | forest test accuracy: 0.944
# top 5 features by permutation importance:
#   worst perimeter        0.0084
#   worst area             0.0084
#   worst concave points   0.0070
#   mean concavity         0.0056
#   mean concave points    0.0056`,
      walk: [
        { line: "rf = RandomForestClassifier(n_estimators=300, max_features=\"sqrt\", oob_score=True, n_jobs=-1, random_state=0)", say: "300 trees; at each split consider $\\sqrt{30} \\approx 5$ random features; compute the out-of-bag score; use all CPU cores." },
        { line: "print(\"forest out-of-bag accuracy:\", round(rf.oob_score_, 3), \"| forest test accuracy:\", round(rf.score(X_test, y_test), 3))", say: "The forest beats the single tree on test data (0.944 vs 0.902)." },
        { line: "imp = permutation_importance(rf, X_test, y_test, n_repeats=10, random_state=0)", say: "Shuffle each feature on the test set and see how much accuracy drops." },
        { line: "top = np.argsort(imp.importances_mean)[::-1][:5]", say: "List the five features whose shuffling hurts most. Their values are small because many features carry overlapping information." },
      ],
    },
  },
};

/** Easy layer: Gradient Boosting. */
export const GBOOST: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Boosting builds a team of small trees one at a time. Each new tree looks at what the team still gets wrong and corrects a little of it. Many small corrections add up to a strong model.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Golf, one putt at a time",
          blocks: [
            { p: "The first shot lands 40 m short. The second aims at the remaining 40 m and lands 8 m short. The third aims at the remaining 8 m. Each shot corrects what is left. Boosting's trees do the same with prediction errors, and the learning rate is like hitting each shot a bit softer so you do not overshoot." },
          ],
        },
      ],
    },
    "Gradient boosting": {
      code: [
        {
          goal: "Gradient boosting from scratch, with training and test error",
          code: r`import numpy as np
from sklearn.tree import DecisionTreeRegressor

rng = np.random.default_rng(0)
x = rng.uniform(0, 6, 160).reshape(-1, 1)
y = np.sin(x[:, 0]) * 3 + rng.normal(0, 0.3, 160)     # wavy target, noise variance 0.09
x_tr, y_tr, x_te, y_te = x[:80], y[:80], x[80:], y[80:]

F_tr = np.full_like(y_tr, y_tr.mean())                 # round 0: predict the training mean
F_te = np.full_like(y_te, y_tr.mean())
eta = 0.3
for m in range(1, 201):
    residual = y_tr - F_tr                             # negative gradient of squared error
    tree = DecisionTreeRegressor(max_depth=2).fit(x_tr, residual)   # small tree fits the residuals
    F_tr = F_tr + eta * tree.predict(x_tr)             # take a shrunken step
    F_te = F_te + eta * tree.predict(x_te)             # apply the same step to held-out points
    if m in (1, 5, 20, 50, 200):
        print(f"after {m:>3} trees: train MSE {np.mean((y_tr - F_tr) ** 2):.4f}   test MSE {np.mean((y_te - F_te) ** 2):.4f}")

# Output:
# after   1 trees: train MSE 2.4446   test MSE 2.2176
# after   5 trees: train MSE 0.3561   test MSE 0.3565
# after  20 trees: train MSE 0.0542   test MSE 0.1313
# after  50 trees: train MSE 0.0237   test MSE 0.1447
# after 200 trees: train MSE 0.0003   test MSE 0.1931`,
          walk: [
            { line: "F_tr = np.full_like(y_tr, y_tr.mean())                 # round 0: predict the training mean", say: "Start from the simplest possible model: the mean." },
            { line: "residual = y_tr - F_tr                             # negative gradient of squared error", say: "For squared error, the negative gradient is just the residual." },
            { line: "tree = DecisionTreeRegressor(max_depth=2).fit(x_tr, residual)   # small tree fits the residuals", say: "A shallow tree learns the pattern in what is still wrong." },
            { line: "F_tr = F_tr + eta * tree.predict(x_tr)             # take a shrunken step", say: "Add only 30% of the tree's correction." },
            { line: "print(f\"after {m:>3} trees: train MSE {np.mean((y_tr - F_tr) ** 2):.4f}   test MSE {np.mean((y_te - F_te) ** 2):.4f}\")", say: "Training error keeps falling, but test error is best around 20 trees and then rises: too many trees overfit. Early stopping picks the right number." },
          ],
        },
      ],
    },
    "Worked example: two boosting rounds": {
      examples: [
        {
          title: "Why the learning rate matters",
          blocks: [
            { p: "Residuals $(-8/3, -2/3, 10/3)$ and a stump with leaves $-5/3$ and $10/3$. With $\\eta = 1$ the third point is fixed instantly (predicted 8), but the first two jump to 3 and are stuck there. With $\\eta = 0.5$ every point moves only half-way (the first two to 3.83, the third to 6.33), leaving room for later trees to split them differently." },
          ],
        },
      ],
    },
    "AdaBoost in brief": {
      examples: [
        {
          title: "How much say does a stump get?",
          blocks: [
            { table: { head: ["Weighted error $\\epsilon$", "$\\alpha = \\frac12\\ln\\frac{1-\\epsilon}{\\epsilon}$"], rows: [["0.1", "1.10"], ["0.25", "0.55"], ["0.4", "0.20"], ["0.5", "0 (no better than a coin)"]] } },
          ],
        },
      ],
    },
    "2.12.3 AdaBoost as a reweighted exponential objective": {
      plain: "AdaBoost's weights and votes come from minimising an exponential loss one stump at a time. Open the derivation for the steps.",
    },
    "2.12.4 Gradient boosting follows the derivative of a loss": {
      plain: "Each new tree fits the negative gradient of the loss. For squared error that is the residual; for log loss it is label minus predicted probability.",
      replace: {
        1: { p: "An additive model begins with a constant $F_0(x)$, then adds small functions: $F_m(x) = F_{m-1}(x) + \\eta h_m(x)$, where $\\eta$ is a learning rate and $h_m$ is a newly fitted base learner, often a shallow tree. For squared-error loss $L(y, F) = \\frac12(y - F)^2$, the derivative with respect to $F$ is $F - y$, so its negative gradient is $y - F$, the current residual. Fit a tree to these residual values and add $\\eta$ times its leaf predictions. Calling every such procedure \"residual fitting\" without specifying the loss would be misleading: for binary logistic loss expressed in logits $F$, the negative gradient is $y - \\sigma(F)$, and a second-order procedure uses curvatures as well." },
        2: { p: "Use three rows with a one-dimensional input $x = (0, 1, 2)$ and outcomes $y = (2, 4, 8)$. The constant squared-error fit is their mean, $F_0 = 14/3$. Residuals are $(-8/3, -2/3, 10/3)$. Suppose a depth-one regression tree splits at $x \\le 1.5$. The left residual mean is $(-8/3 - 2/3)/2 = -5/3$; the right leaf contains the last residual $10/3$. With $\\eta = 1/2$, new predictions for $x = 0$ and $x = 1$ become $14/3 - 5/6 = 23/6 \\approx 3.833$. The third becomes $14/3 + 5/3 = 19/3 \\approx 6.333$. The first point was overpredicted by the constant model and moves downward; the last was underpredicted and moves upward. This particular stump cannot distinguish the first two inputs and therefore does not fix them both." },
        5: { p: "**Worked exercise.** With $\\eta = 1$ instead of 1/2, the left prediction is $14/3 - 5/3 = 3$ and the right prediction is $14/3 + 10/3 = 8$. The last training residual becomes zero, but the first two are predicted 3 despite outcomes 2 and 4. A larger step can reduce training error quickly while making the fitting procedure more sensitive to tree choices or noise." },
      },
    },
    "2.13.2 Adaptive boosting with weighted examples": {
      plain: "AdaBoost gives every row a weight. Rows the last stump got wrong get heavier, so the next stump focuses on them. Good stumps get a bigger vote.",
      replace: {
        1: { p: "For binary labels $y_i \\in \\{-1, +1\\}$, start with nonnegative weights $w_i$ that sum to one. The weighted error of weak learner $h_t$ is $\\epsilon_t = \\sum_i w_i\\,\\mathbf 1[h_t(x_i) \\ne y_i]$. In a common discrete binary formulation, give the learner weight $\\alpha_t = \\frac12\\log[(1 - \\epsilon_t)/\\epsilon_t]$ when $0 < \\epsilon_t < 0.5$. Update each observation weight proportionally to $w_i\\exp[-\\alpha_t y_i h_t(x_i)]$ and renormalize. If $h_t$ is correct, $y_ih_t(x_i) = +1$ and the multiplier is $e^{-\\alpha_t}$; if wrong, it is $e^{+\\alpha_t}$. The next learner therefore pays more attention to mistakes." },
        3: { p: "Suppose three rows initially have weights 1/3 each and a weak classifier misses only the first. The weighted error is $\\epsilon = 1/3$ and $\\alpha = \\frac12\\log 2 \\approx 0.3466$. The missed row's unnormalized weight becomes $\\frac13 e^{0.3466} \\approx 0.4714$. Each correct row becomes $\\frac13 e^{-0.3466} \\approx 0.2357$. Their sum is about 0.9428; after normalization the missed row has weight 0.5 and each correct row 0.25. This calculation explains how a later learner can focus on the previously missed conveyor condition." },
        5: { p: "The final score in this binary formulation is $F(x) = \\sum_t \\alpha_t h_t(x)$, and the sign determines a class under the basic rule. A different application may require ranking by $F(x)$ or calibrating scores to probabilities; the sign alone is not an inspected-conveyor policy when maintenance capacity is constrained." },
        6: { p: "**Exercise:** For $\\epsilon = 0.25$, calculate $\\alpha = \\frac12\\log 3 \\approx 0.5493$. Explain why a learner with weighted error very close to 0.5 receives little influence under this formula." },
      },
    },
    "2.13.3 Gradient boosting follows a loss function": {
      plain: "Boosting can use any differentiable loss. The new tree always fits \"which way the loss wants each prediction to move\".",
      replace: {
        0: { p: "Gradient boosting constructs an additive score $F_M(x) = F_0(x) + \\sum_{m=1}^M \\eta f_m(x)$, where $\\eta$ is a learning rate and $f_m$ is a fitted weak learner, often a small tree. Unlike a rule that always upweights misclassified rows, its update follows the gradient of a chosen differentiable loss with respect to the current model output." },
        1: { p: "For squared-error regression, $L(y, F) = \\frac12(y - F)^2$ has negative derivative with respect to $F$ equal to $y - F$. The residual is therefore the negative gradient. Start with a constant $F_0$, often the training mean under squared loss. Fit a tree to the current residuals, add its predictions scaled by $\\eta$, and repeat. If the initial predicted delay for two shifts is 10 minutes and observed delays are 14 and 8, the initial residuals are 4 and −2. A weak learner approximating these residuals might predict 3 and −1; at $\\eta = 0.2$, the new predictions become 10.6 and 9.8. The residuals become 3.4 and −1.8. Additional learners can address the remaining pattern." },
        3: { p: "For binary cross-entropy, a common setup stores a raw score $F$, transforms it to $p = \\sigma(F)$, and minimizes $-[y\\log p + (1 - y)\\log(1 - p)]$. Its derivative with respect to $F$ is $p - y$, so the negative gradient is $y - p$. A learner fitted to these values adjusts the score, not the final class label directly. For one positive row at $p = 0.2$, $y - p = 0.8$; for one negative row at $p = 0.7$, $y - p = -0.7$. Both get substantial corrective signals because their current predictions are poor. Different implementations may use additional second-order information or optimized leaf values." },
        6: { p: "**Exercise:** Starting from $F = 0$ for a positive label, calculate $p = 0.5$ and negative gradient $y - p = 0.5$. If a learner adds 0.4 to $F$ after learning-rate scaling, the new probability is $\\sigma(0.4) \\approx 0.599$. Explain why the increase is not 0.4 probability points." },
      },
    },
    "2.13.5 Categorical predictors and target leakage": {
      plain: "Replacing a category with its average target is powerful but leaks the answer if a row's own label is used. Smooth rare categories and compute the averages out-of-fold.",
      replace: {
        1: { p: "Consider a supplier category appearing in only one training row, and suppose that row has an incident. A naive target encoding gives the category a rate of 1, making it appear perfectly predictive for that row. A smoothed estimate can combine its rate with a global prior: encoded rate $= (\\text{incidents in category} + \\alpha \\times \\text{global rate})/(\\text{count in category} + \\alpha)$. With global incident rate 0.10 and $\\alpha = 9$, a single incident yields $(1 + 0.9)/(1 + 9) = 0.19$. This is less extreme but still learned from that row's own label unless the training encoding is computed out-of-fold or by an appropriate ordered procedure." },
      },
    },
  },
  code: {
    "2.12.4 Gradient boosting follows the derivative of a loss#0": {
      goal: "One squared-error boosting step with a stump",
      code: r`def one_squared_error_boosting_step(xs, ys, threshold, learning_rate=0.5):
    if len(xs) != len(ys) or not xs or not 0 < learning_rate <= 1:
        raise ValueError("Need aligned rows and a valid step size")
    start = sum(ys)/len(ys)
    residuals = [y-start for y in ys]
    left = [r for x, r in zip(xs, residuals) if x <= threshold]
    right = [r for x, r in zip(xs, residuals) if x > threshold]
    if not left or not right:
        raise ValueError("A stump must create two nonempty leaves")
    corrections = (sum(left)/len(left), sum(right)/len(right))
    predictions = [start+learning_rate*corrections[int(x > threshold)]
                   for x in xs]
    return start, corrections, predictions


start, leaves, predictions = one_squared_error_boosting_step(
    [0, 1, 2], [2, 4, 8], 1.5)
assert abs(start-14/3) < 1e-12
assert all(abs(a-b) < 1e-12 for a, b in
           zip(leaves, (-5/3, 10/3)))
assert all(abs(a-b) < 1e-12 for a, b in
           zip(predictions, (23/6, 23/6, 19/3)))
print("start:", round(start, 4), "| leaf corrections:", [round(v, 4) for v in leaves], "| new predictions:", [round(v, 4) for v in predictions])

# Output:
# start: 4.6667 | leaf corrections: [-1.6667, 3.3333] | new predictions: [3.8333, 3.8333, 6.3333]`,
      walk: [
        { line: "def one_squared_error_boosting_step(xs, ys, threshold, learning_rate=0.5):", say: "Start at the mean, compute residuals, average them in each leaf of the stump, and take a half step." },
        { line: "zip(predictions, (23/6, 23/6, 19/3)))", say: "The new predictions match the hand calculation: 23/6, 23/6, 19/3." },
      ],
    },
    "In Python#0": {
      goal: "Histogram gradient boosting with early stopping",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

gb = HistGradientBoostingClassifier(
    learning_rate=0.05, max_iter=1000, max_depth=6,
    early_stopping=True, validation_fraction=0.1, n_iter_no_change=30,
    random_state=0)
gb.fit(X_train, y_train)
print("boosting rounds actually used:", gb.n_iter_, "of a maximum of 1000")
print("test accuracy:", round(gb.score(X_test, y_test), 3))

# Output:
# boosting rounds actually used: 122 of a maximum of 1000
# test accuracy: 0.937`,
      walk: [
        { line: "learning_rate=0.05, max_iter=1000, max_depth=6,", say: "Small steps, up to 1,000 trees, each at most 6 levels deep." },
        { line: "early_stopping=True, validation_fraction=0.1, n_iter_no_change=30,", say: "Hold out 10% of training rows and stop when 30 rounds pass without improvement." },
        { line: "print(\"boosting rounds actually used:\", gb.n_iter_, \"of a maximum of 1000\")", say: "Early stopping used only 122 trees." },
      ],
    },
  },
};

/** Easy layer: AdaBoost & XGBoost, step by step. */
export const ADAXGB: EasyTopic = {
  sections: {
    "Part 1, AdaBoost: Step 1, weighted error": {
      examples: [
        {
          title: "Weighted error with unequal weights",
          blocks: [
            { p: "Weights $(0.4, 0.3, 0.2, 0.1)$; the stump gets rows 1 and 4 wrong. Weighted error $= 0.4 + 0.1 = 0.5$: no better than chance, even though it got half the rows right. Missing a heavy row costs more than missing a light one." },
          ],
        },
      ],
    },
    "XGBoost Step 2: the best value for one leaf": {
      examples: [
        {
          title: "Leaf value with and without λ",
          blocks: [
            { p: "A leaf has gradients summing to $G = -6$ and Hessians to $H = 4$. Without penalty, $w^* = 6/4 = 1.5$. With $\\lambda = 2$, $w^* = 6/6 = 1$. With $\\lambda = 8$, $w^* = 6/12 = 0.5$. Bigger $\\lambda$ means more cautious leaves." },
          ],
        },
      ],
    },
    "XGBoost Step 3: the gain of a split": {
      examples: [
        {
          title: "When γ rejects a split",
          blocks: [
            { p: "Four rows, $\\lambda = 1$: the raw improvement from splitting positives from negatives is $2/3 \\approx 0.667$. With $\\gamma = 0.1$ the gain is $0.567$, so split. With $\\gamma = 0.7$ the gain is $-0.033$, so do not split. $\\gamma$ is the minimum improvement a split must deliver." },
          ],
        },
      ],
    },
    "2.12.5 Second-order tree boosting and split gain": {
      plain: "XGBoost approximates the loss with a parabola (using first and second derivatives), which gives a formula for the best leaf value and for how much a split helps.",
      replace: {
        1: { p: "For current prediction $F_i$ and a candidate new tree output $f_i$, expand a differentiable per-row loss to second order: $L(y_i, F_i + f_i) \\approx L(y_i, F_i) + g_if_i + \\frac12h_if_i^2$, where $g_i$ is the first derivative with respect to $F_i$ and $h_i$ the second. If tree leaf $j$ assigns one constant $w_j$ to all its rows $I_j$, aggregate $G_j = \\sum_{i \\in I_j} g_i$ and $H_j = \\sum_{i \\in I_j} h_i$. With L2 leaf penalty $\\lambda w_j^2/2$ and leaf-count penalty $\\gamma$ per leaf, the part of the objective involving $w_j$ is $G_jw_j + (H_j + \\lambda)w_j^2/2 + \\gamma$. Differentiation gives the minimizing leaf value $w_j^* = -G_j/(H_j + \\lambda)$ when the denominator is positive. Substitution gives the best leaf objective $-G_j^2/[2(H_j + \\lambda)] + \\gamma$, ignoring the common old loss." },
        3: { math: r`\text{Gain} = \frac12\left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{G_P^2}{H_P + \lambda}\right] - \gamma` },
        5: { p: "For binary logistic loss in logit $F$ with $p = \\sigma(F)$, $g_i = p - y_i$ and $h_i = p(1 - p)$. Consider four rows with outcomes $(1, 1, 0, 0)$ and initial $p = 0.5$ each. Their gradients are $(-0.5, -0.5, +0.5, +0.5)$, and each Hessian is 0.25. Split the two positives to L and two negatives to R. Then $(G_L, H_L) = (-1, 0.5)$, $(G_R, H_R) = (1, 0.5)$ and $(G_P, H_P) = (0, 1)$. With $\\lambda = 1$ and $\\gamma = 0.1$, Gain $= 0.5(1/1.5 + 1/1.5 - 0) - 0.1 = 2/3 - 0.1 = 17/30 \\approx 0.5667$. The left leaf value is $-(-1)/1.5 = 2/3$ and the right is $-1/1.5 = -2/3$. With learning rate $\\eta$, the tree's values are multiplied by $\\eta$ before adding to the old logits." },
        8: { p: "**Worked exercise.** Keep the same four rows and $\\lambda = 1$, but raise $\\gamma$ from 0.1 to 0.7. Raw improvement before leaf cost is 2/3, so gain becomes $2/3 - 0.7 = -1/30$: the proposed split should be rejected under this objective. A rejected training split is a regularization decision, not evidence that the measured feature has no connection to fault risk." },
      },
    },
    "2.13.4 Second-order tree boosting and split gain": {
      plain: "The same leaf and gain formulas, derived again with a numerical split that turns out not to be worth making.",
      replace: {
        0: { p: "Some boosted-tree algorithms approximate the change in loss from adding a new tree using both first and second derivatives. For training row $i$, let $g_i$ be the first derivative of the current loss with respect to its raw score and $h_i$ the second derivative. If a proposed leaf assigns one constant score increment $w$ to the rows in that leaf, a regularized second-order approximation is $\\sum_i (g_iw + \\frac12h_iw^2) + \\frac12\\lambda w^2$. Define $G = \\sum_i g_i$ and $H = \\sum_i h_i$. This becomes $Gw + \\frac12(H + \\lambda)w^2$. Its derivative is $G + (H + \\lambda)w$, so the minimizing leaf value is $w = -G/(H + \\lambda)$, provided the denominator is positive." },
        1: { p: "Substitution yields an approximate leaf improvement proportional to $\\frac12G^2/(H + \\lambda)$. To evaluate a proposed split into left and right children, compare the two child improvements with the unsplit parent's improvement and subtract a penalty $\\gamma$ for adding another leaf or split under the chosen formulation:" },
        2: { math: r`\text{gain} = \frac12\left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{G_P^2}{H_P + \lambda}\right] - \gamma` },
        5: { p: "Suppose the parent has $G_P = -4$ and $H_P = 8$, with $\\lambda = 2$. A candidate split yields left $G_L = -3$, $H_L = 4$ and right $G_R = -1$, $H_R = 4$. Before $\\gamma$, the gain is $0.5[9/6 + 1/6 - 16/10] = 0.5[1.6667 - 1.6] \\approx 0.0333$. With $\\gamma = 0.05$ the net gain is about $-0.0167$, so this split is not worthwhile under these approximations. If the split separated stronger gradient patterns, the gain might be positive." },
        7: { p: "**Exercise:** Set $\\gamma = 0$ in the numerical example. Explain why the small positive gain still may not be a reliable improvement on future shifts, even if the local training objective accepts it." },
      },
    },
    "Textbook case: Ensemble Algorithms With Auditable Updates": {
      plain: "Building-sensor data used to trace exactly how each boosting step changes weights and scores.",
    },
    "2.15.1 AdaBoost weights change which errors matter next": {
      plain: "After one round, the single misclassified row carries half of all the weight, so the next stump is forced to deal with it.",
    },
    "2.15.2 Gradient boosting follows a specified loss": {
      plain: "Each round fits the negative gradient of the chosen loss; with second-order information, leaves get the optimal value $-G/(H + \\lambda)$.",
    },
    "2.15.3 Stacking must learn from honest base predictions": {
      plain: "A stacking model must learn from predictions the base models made on rows they did not train on, or it will trust overconfident in-sample predictions.",
    },
    "2.15.4 Search, stopping, and resource tradeoffs": {
      plain: "More trees, deeper trees and smaller learning rates trade accuracy against training time and prediction latency. A slightly better model that is too slow to serve is not better.",
    },
    "Textbook case: Second-Order Boosting and Categorical Leakage in Detail": {
      plain: "A building-fault model used to derive leaf values, split gains, missing-value routes and leakage-free category encodings.",
    },
    "2.16.1 Expand a loss around the current ensemble score": {
      plain: "Near the current score, the loss looks like a parabola. Its slope ($g$) and curvature ($h$) are all the next tree needs.",
    },
    "2.16.2 Derive an optimal constant leaf output": {
      plain: "Minimise $Gw + \\frac12(H + \\lambda)w^2$ and you get $w^* = -G/(H + \\lambda)$. Open the derivation for the steps.",
    },
    "2.16.3 Gain, missing routes, and search complexity": {
      plain: "Splits are scored by gain; rows with missing values are sent to whichever side improves the gain more; histograms make the search fast.",
    },
    "2.16.4 Ordered target statistics preserve self-exclusion": {
      plain: "Encode a category using only the labels of earlier rows, never the row's own label. That is what CatBoost's ordered statistics do.",
      examples: [
        {
          at: 1,
          title: "Ordered encoding row by row",
          blocks: [
            { table: { head: ["Row", "Label", "Labels seen before", "Encoding with prior 0.4, strength 2"], rows: [["1", "1", "none", "(0 + 0.8)/(0 + 2) = 0.40"], ["2", "0", "1", "(1 + 0.8)/(1 + 2) = 0.60"], ["3", "1", "1, 0", "(1 + 0.8)/(2 + 2) = 0.45"]] } },
            { p: "No row ever sees its own label, so the encoding cannot leak it." },
          ],
        },
      ],
    },
    "2.16.5 Interpret scores and tune against a stable objective": {
      plain: "Boosted classifiers output scores, not probabilities; calibrate before reading them as probabilities. Tune on validation data and test once.",
    },
    "Textbook case: Regularized Second-Order Tree Boosting": {
      plain: "Pump-service prediction used to walk through XGBoost-style updates: raw scores, gradients, Hessians, leaf weights and split gain.",
    },
    "2.17.1 Add trees to raw scores, not to probabilities": {
      plain: "Trees add to the logit (raw score); only at the end is the score turned into a probability with the sigmoid.",
    },
    "2.17.2 Derive the best weight for one leaf": {
      plain: "Open the derivation: the same $-G/(H + \\lambda)$ result, derived for one leaf.",
    },
    "2.17.3 Score a split with a regularized gain": {
      plain: "A split is accepted only if its gain beats the cost $\\gamma$. A minimum Hessian per child blocks splits on very little evidence.",
    },
    "2.17.4 Distinguish approximations and implementation choices": {
      plain: "Exact and histogram split searches, depth limits and sampling all trade a little accuracy for speed. Compare settings at matched compute.",
    },
    "2.17.5 Execute the tiny boosting calculation": {
      plain: "The code performs one split and one update and confirms that the log loss went down.",
    },
    "Textbook case: Two Boosting Rounds Worked From First Principles": {
      plain: "Six data points, two boosting rounds, every number computed by hand and checked in code.",
    },
    "2.18.1 Establish the loss and initial score": {
      plain: "For squared error, each row's gradient is prediction minus target and its Hessian is 1. Start from the mean.",
    },
    "2.18.2 Evaluate candidate first splits": {
      plain: "Score every threshold with the gain formula, take the best, and add η × leaf weight to the predictions.",
    },
    "2.18.3 Recompute gradients for the next round": {
      plain: "After the update, gradients shrink; the next round repeats the same steps on the new gradients.",
    },
    "2.18.4 Regularization and operational interpretation": {
      plain: "$\\lambda$ shrinks leaf values, $\\gamma$ can veto splits, and a minimum Hessian per child stops tiny leaves.",
    },
    "2.18.5 Execute every stage and assert the numbers": {
      plain: "The code reproduces both rounds: gradients, gains, leaf weights, predictions and loss.",
    },
  },
  code: {
    "2.12.5 Second-order tree boosting and split gain#0": {
      goal: "XGBoost-style split gain and leaf values",
      code: r`def second_order_split_gain(left, right, ridge=1.0, leaf_cost=0.1):
    gl, hl = left
    gr, hr = right
    if min(hl, hr, ridge, leaf_cost) < 0:
        raise ValueError("Curvature and regularizers must be nonnegative")
    if hl+ridge <= 0 or hr+ridge <= 0 or hl+hr+ridge <= 0:
        raise ValueError("Leaf denominators must be positive")
    gain = (0.5*(gl*gl/(hl+ridge)+gr*gr/(hr+ridge)
                 -(gl+gr)**2/(hl+hr+ridge))-leaf_cost)
    return gain, -gl/(hl+ridge), -gr/(hr+ridge)


gain, left_value, right_value = second_order_split_gain(
    (-1, 0.5), (1, 0.5))
assert abs(gain-17/30) < 1e-12
assert abs(left_value-2/3) < 1e-12
assert abs(right_value+2/3) < 1e-12
print("gain:", round(gain, 4), "(= 17/30) | leaf values:", round(left_value, 4), round(right_value, 4))

# Output:
# gain: 0.5667 (= 17/30) | leaf values: 0.6667 -0.6667`,
      walk: [
        { line: "def second_order_split_gain(left, right, ridge=1.0, leaf_cost=0.1):", say: "Sum gradients and Hessians on each side, then apply the gain formula with $\\lambda$ (ridge) and $\\gamma$ (leaf_cost)." },
        { line: "assert abs(gain-17/30) < 1e-12", say: "Matches the hand calculation: 17/30." },
      ],
    },
    "2.15.1 AdaBoost weights change which errors matter next#0": {
      goal: "One AdaBoost reweighting step",
      code: r`from math import log,exp,isclose
weights=[0.25]*4
correct=[True,True,True,False]
err=sum(w for w,c in zip(weights,correct) if not c)
alpha=0.5*log((1-err)/err)
raw=[w*exp(-alpha if c else alpha) for w,c in zip(weights,correct)]
updated=[w/sum(raw) for w in raw]
assert isclose(alpha,0.5*log(3))
assert all(isclose(w,1/6) for w in updated[:3])
assert isclose(updated[-1],0.5)
print("alpha:", round(alpha, 4), "| new weights:", [round(w, 4) for w in updated])

# Output:
# alpha: 0.5493 | new weights: [0.1667, 0.1667, 0.1667, 0.5]`,
      walk: [
        { line: "err=sum(w for w,c in zip(weights,correct) if not c)", say: "Weighted error: total weight of the misclassified rows (0.25)." },
        { line: "alpha=0.5*log((1-err)/err)", say: "The stump's vote: $\\frac12\\ln 3 \\approx 0.549$." },
        { line: "raw=[w*exp(-alpha if c else alpha) for w,c in zip(weights,correct)]", say: "Shrink correct rows, grow wrong ones." },
        { line: "updated=[w/sum(raw) for w in raw]", say: "Renormalise: the missed row now carries half the weight." },
      ],
    },
    "2.17.5 Execute the tiny boosting calculation#0": {
      goal: "One second-order boosting update for logistic loss",
      code: r`import numpy as np

labels=np.array([1.,1.,0.,0.])
raw=np.zeros(4)
sigmoid=lambda z: 1/(1+np.exp(-z))
prob=sigmoid(raw)
grad=prob-labels
hess=prob*(1-prob)
lam=1.; gamma=.1; eta=.3
left=np.array([0,1]);right=np.array([2,3])
def stats(index):
    return grad[index].sum(),hess[index].sum()
g_l,h_l=stats(left)
g_r,h_r=stats(right)
g_p,h_p=stats(np.arange(4))
w_l=-g_l/(h_l+lam)
w_r=-g_r/(h_r+lam)
gain=.5*(g_l*g_l/(h_l+lam)+g_r*g_r/(h_r+lam)
         -g_p*g_p/(h_p+lam))-gamma
assert np.allclose([w_l,w_r],[2/3,-2/3])
assert np.isclose(gain,2/3-.1)
updated=raw.copy()
updated[left]+=eta*w_l
updated[right]+=eta*w_r
assert np.allclose(sigmoid(updated),[.5498339973,.5498339973,
                                     .4501660027,.4501660027])
def logloss(y,z):
    return np.mean(np.logaddexp(0,z)-y*z)
assert logloss(labels,updated)<logloss(labels,raw)
print("leaf weights:", round(w_l, 4), round(w_r, 4), "| gain:", round(gain, 4))
print("log loss before:", round(logloss(labels, raw), 4), "-> after:", round(logloss(labels, updated), 4))

# Output:
# leaf weights: 0.6667 -0.6667 | gain: 0.5667
# log loss before: 0.6931 -> after: 0.5981`,
      walk: [
        { line: "w_l=-g_l/(h_l+lam)", say: "Optimal left leaf weight $-G_L/(H_L + \\lambda)$." },
        { line: "gain=.5*(g_l*g_l/(h_l+lam)+g_r*g_r/(h_r+lam)", say: "Split gain from the second-order formula." },
        { line: "assert logloss(labels,updated)<logloss(labels,raw)", say: "After the update the log loss falls from 0.693 to 0.598." },
      ],
    },
    "2.18.5 Execute every stage and assert the numbers#0": {
      goal: "Two XGBoost-style rounds on six points, every number checked",
      code: r`import numpy as np

x=np.arange(6)
y=np.array([2.,3.,4.,7.,8.,9.])
pred=np.full(6,y.mean())
lam=1.; gamma=.5; eta=.4
loss=lambda f: np.sum((y-f)**2)/2
def split_gain(grad, mask):
    g_left=grad[mask].sum();h_left=int(mask.sum())
    g_right=grad[~mask].sum();h_right=int((~mask).sum())
    g_total=grad.sum();h_total=len(grad)
    return .5*(g_left**2/(h_left+lam)+g_right**2/(h_right+lam)
               -g_total**2/(h_total+lam))-gamma
mask=x<2.5
initial_grad=pred-y
assert np.allclose(initial_grad,[3.5,2.5,1.5,-1.5,-2.5,-3.5])
assert np.isclose(loss(pred),20.75)
assert np.isclose(split_gain(initial_grad,mask),13.5625)
assert np.isclose(split_gain(initial_grad,x<1.5),9.1)
stages=[pred.copy()]
for _ in range(2):
    grad=pred-y
    w_left=-grad[mask].sum()/(mask.sum()+lam)
    w_right=-grad[~mask].sum()/((~mask).sum()+lam)
    pred=pred+eta*np.where(mask,w_left,w_right)
    stages.append(pred.copy())
assert np.allclose(stages[1],[4.75]*3+[6.25]*3)
assert np.allclose(stages[2],[4.225]*3+[6.775]*3)
assert np.allclose([loss(v) for v in stages],
                   [20.75,11.1875,6.501875])
print("initial gradients:", initial_grad, "| loss:", loss(stages[0]))
print("gain x<2.5:", split_gain(initial_grad, mask), "| gain x<1.5:", round(split_gain(initial_grad, x<1.5), 4))
for k, v in enumerate(stages):
    print(f"after round {k}: predictions {v.round(3)}  loss {loss(v):.4f}")

# Output:
# initial gradients: [ 3.5  2.5  1.5 -1.5 -2.5 -3.5] | loss: 20.75
# gain x<2.5: 13.5625 | gain x<1.5: 9.1
# after round 0: predictions [5.5 5.5 5.5 5.5 5.5 5.5]  loss 20.7500
# after round 1: predictions [4.75 4.75 4.75 6.25 6.25 6.25]  loss 11.1875
# after round 2: predictions [4.225 4.225 4.225 6.775 6.775 6.775]  loss 6.5019`,
      walk: [
        { line: "def split_gain(grad, mask):", say: "Gain for a split, with Hessians all 1 for squared error." },
        { line: "initial_grad=pred-y", say: "Gradients at the start: prediction (5.5) minus target." },
        { line: "assert np.isclose(split_gain(initial_grad,mask),13.5625)", say: "The split $x < 2.5$ has gain 13.5625, beating $x < 1.5$ (9.1)." },
        { line: "assert np.allclose(stages[1],[4.75]*3+[6.25]*3)", say: "After round 1 the predictions step apart: 4.75 and 6.25." },
      ],
    },
    "In Python#0": {
      goal: "AdaBoost reweighting by hand, then 200 stumps in scikit-learn",
      walk: [
        { line: "alpha = 0.5 * np.log((1 - err) / err)      # this stump's vote", say: "A stump with 20% weighted error gets $\\alpha = \\frac12\\ln 4 = 0.693$." },
        { line: "w = w * np.exp(np.where(wrong, alpha, -alpha))", say: "Wrong rows are multiplied by $e^{\\alpha}$, right rows by $e^{-\\alpha}$." },
        { line: "ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200, random_state=0).fit(X_tr, y_tr)", say: "200 boosted stumps far outperform one stump on test data." },
      ],
    },
    "In Python#1": {
      goal: "Two XGBoost rounds from scratch",
      walk: [
        { line: "lam, gamma, eta = 1.0, 0.5, 0.4           # leaf penalty λ, split cost γ, learning rate η", say: "The three main XGBoost knobs." },
        { line: "gains = {float(t): round(float(gain(g, h, x < t)), 4) for t in (0.5 + np.arange(5))}", say: "Score every threshold between neighbouring $x$ values." },
        { line: "w_L = -g[left].sum() / (h[left].sum() + lam)      # optimal leaf weight  −G/(H+λ)", say: "Optimal leaf weights from the formula." },
        { line: "F = F + eta * np.where(left, w_L, w_R)", say: "Add the shrunken tree to the predictions." },
      ],
    },
  },
};

/** Easy layer: Ensemble Methods. */
export const ENSEMBLE: EasyTopic = {
  sections: {
    "Step 2: voting in practice, hard vs soft": {
      examples: [
        {
          title: "Hard and soft votes can disagree",
          blocks: [
            { p: "Three models give P(positive) = 0.9, 0.4, 0.45. Hard vote: positive, negative, negative, so negative wins 2–1. Soft vote: average $(0.9 + 0.4 + 0.45)/3 = 0.58$, so positive. The confident model outweighs two lukewarm ones." },
          ],
        },
      ],
    },
    "Step 5: stacking, learn how to combine": {
      examples: [
        {
          kind: "idea",
          title: "Why stacking needs out-of-fold predictions",
          blocks: [
            { p: "A deep tree scores 99% on its own training rows but 70% on new rows. If the meta-model learns from the tree's training-row predictions, it concludes \"always trust the tree\" and fails in practice. Out-of-fold predictions show it the tree's real 70% behaviour." },
          ],
        },
      ],
    },
    "Textbook case: Combining Models Without Inflating the Evidence": {
      plain: "Electric-bus repair forecasts used to compare voting, bagging, boosting and stacking, and to keep every evaluation honest.",
    },
    "2.14.1 Voting classification and averaged regression": {
      plain: "Hard voting counts labels; soft voting averages probabilities. Averaging regression predictions helps most when the models' errors differ.",
      examples: [
        {
          at: 2,
          title: "Averaging two independent predictors",
          blocks: [
            { p: "Two unbiased predictors, each with error variance 4 and independent errors: their average has error variance $(4 + 4)/4 = 2$. Half the variance, for free, as long as the errors really are independent." },
          ],
        },
      ],
    },
    "2.14.2 Bagging, random feature selection, and variance": {
      plain: "Bagging trains copies of a model on bootstrap samples and averages them. Random forests also randomise the features each split may use, making the trees more different.",
    },
    "2.14.3 Additive boosting and second-order tree fitting": {
      plain: "Boosting adds small trees one at a time, each correcting the current errors; second-order versions choose leaf values with $-G/(H + \\lambda)$.",
    },
    "2.14.4 Ordered categorical statistics and leakage in boosted trees": {
      plain: "Encode categories using only earlier rows' labels so no row sees its own answer.",
    },
    "2.14.5 Stacking, blending, and model explanations": {
      plain: "Stacking learns how much to trust each base model, using out-of-fold predictions. Compare models by what they achieve at your real capacity, not only by AUC.",
    },
    "2.14.6 Test a forest's feature reliance on held-out units": {
      plain: "Permutation importance on held-out units shows which features the model truly relies on. Impurity importance can credit a useless feature.",
    },
    "2.5.4 Voting, stacking, and the origin of meta-features": {
      plain: "Meta-features for stacking must come from models that never trained on that row. The code builds such a fold plan.",
    },
  },
  code: {
    "2.14.6 Test a forest's feature reliance on held-out units#0": {
      goal: "Impurity versus permutation importance on held-out units",
      code: r`import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.metrics import roc_auc_score

rng=np.random.default_rng(377)
sensor=rng.normal(size=440)
cycles=rng.normal(size=440)
unrelated=rng.normal(size=440)
X=np.column_stack((sensor,cycles,unrelated))
y=(sensor+0.35*cycles+0.2*rng.normal(size=440)>0).astype(int)
X_train,X_test=X[:320],X[320:]
y_train,y_test=y[:320],y[320:]
model=RandomForestClassifier(n_estimators=80,min_samples_leaf=4,
                             max_features=2,random_state=377,n_jobs=1)
model.fit(X_train,y_train)
base=roc_auc_score(y_test,model.predict_proba(X_test)[:,1])
permuted=permutation_importance(model,X_test,y_test,scoring='roc_auc',
                                n_repeats=12,random_state=377,n_jobs=1)
assert 0.5<=base<=1
assert len(model.feature_importances_)==X.shape[1]
assert np.isclose(model.feature_importances_.sum(),1)
assert permuted.importances.shape==(X.shape[1],12)
assert permuted.importances_mean[0]>0
print("test AUC:", round(base, 3))
print("impurity importance:   ", model.feature_importances_.round(3))
print("permutation importance:", permuted.importances_mean.round(3))

# Output:
# test AUC: 0.985
# impurity importance:    [0.826 0.148 0.027]
# permutation importance: [ 0.47   0.036 -0.001]`,
      walk: [
        { line: "y=(sensor+0.35*cycles+0.2*rng.normal(size=440)>0).astype(int)", say: "The label depends strongly on `sensor`, weakly on `cycles`, and not at all on `unrelated`." },
        { line: "permuted=permutation_importance(model,X_test,y_test,scoring='roc_auc',", say: "Shuffle each feature on held-out rows and measure the AUC drop." },
        { line: "assert permuted.importances_mean[0]>0", say: "The strong sensor clearly matters; the unrelated feature scores about zero." },
      ],
    },
    "2.5.4 Voting, stacking, and the origin of meta-features#0": {
      goal: "Plan out-of-fold fitting so no row is scored by a model that trained on it",
      code: r`def out_of_fold_index_plan(groups):
    unique = list(dict.fromkeys(groups))
    if len(unique) < 2:
        raise ValueError("Need at least two groups")
    plan = []
    for holdout in unique:
        fit = [i for i, group in enumerate(groups) if group != holdout]
        predict = [i for i, group in enumerate(groups) if group == holdout]
        assert set(fit).isdisjoint(predict)
        assert {groups[i] for i in fit}.isdisjoint({groups[i] for i in predict})
        plan.append((fit, predict))
    return plan


folds = out_of_fold_index_plan(["pack-A", "pack-A", "pack-B", "pack-C"])
assert sum(len(predict) for _, predict in folds) == 4
assert any(predict == [0, 1] for _, predict in folds)
for fit_rows, predict_rows in folds:
    print("fit on rows", fit_rows, "-> predict rows", predict_rows)

# Output:
# fit on rows [2, 3] -> predict rows [0, 1]
# fit on rows [0, 1, 3] -> predict rows [2]
# fit on rows [0, 1, 2] -> predict rows [3]`,
      walk: [
        { line: "def out_of_fold_index_plan(groups):", say: "For each group (pack), fit on all other groups and predict this one." },
        { line: "assert any(predict == [0, 1] for _, predict in folds)", say: "Both rows of pack A are predicted together by a model that saw neither." },
      ],
    },
    "In Python#0": {
      goal: "Compare voting, bagging and stacking on the same data",
      walk: [
        { line: "\"soft vote\": VotingClassifier(base, voting=\"soft\"),", say: "Average the three models' probabilities." },
        { line: "\"bagging (100 trees)\": BaggingClassifier(DecisionTreeClassifier(random_state=0), n_estimators=100, oob_score=True, random_state=0),", say: "100 trees on bootstrap samples, with an out-of-bag estimate." },
        { line: "\"stacking\": StackingClassifier(base, final_estimator=LogisticRegression(), cv=5),", say: "A logistic regression learns how to weight the three base models from out-of-fold predictions." },
      ],
    },
  },
};
