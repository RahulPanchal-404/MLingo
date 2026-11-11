import type { TheoryTopic } from "../topics";

const r = String.raw;

export const REGRESSION_THEORY: TheoryTopic[] = [
  {
    slug: "linear-regression",
    group: "Regression",
    title: "Linear Regression",
    summary: "Fit the straight line (or flat plane) that makes the squared errors as small as possible.",
    learnHref: "/learn/linear-regression",
    playHref: "/games/bridge?level=line",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Linear regression predicts a number as a weighted sum of the features plus a constant, choosing the weights that minimise the mean squared error." } },
          { p: "Each weight answers one question: if this feature goes up by one unit and everything else stays the same, how much does the prediction change? That makes linear regression the easiest model to explain to anyone." },
        ],
      },
      {
        heading: "The model",
        blocks: [
          { math: r`\hat{y} = b + w_1x_1 + w_2x_2 + \dots + w_dx_d = \mathbf{w}^\top\mathbf{x} + b` },
          { p: "Stack the $n$ examples into a matrix $\\mathbf{X}$ (with a column of 1s for the intercept) and the predictions become $\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}$. The loss is the MSE:" },
          { math: r`L(\mathbf{w}) = \frac{1}{n}\lVert\mathbf{y} - \mathbf{X}\mathbf{w}\rVert^2` },
          { p: "With one feature, the best line has a simple closed form:" },
          { math: r`w = \frac{\sum_i (x_i - \bar{x})(y_i - \bar{y})}{\sum_i (x_i - \bar{x})^2}, \qquad b = \bar{y} - w\bar{x}` },
          {
            derive: {
              title: "Deriving the normal equation",
              blocks: [
                { p: "Expand the loss (dropping the constant $\\tfrac{1}{n}$): $L = \\mathbf{y}^\\top\\mathbf{y} - 2\\mathbf{w}^\\top\\mathbf{X}^\\top\\mathbf{y} + \\mathbf{w}^\\top\\mathbf{X}^\\top\\mathbf{X}\\mathbf{w}$. Take the gradient and set it to zero:" },
                { math: r`\nabla_{\mathbf{w}} L = -2\mathbf{X}^\top\mathbf{y} + 2\mathbf{X}^\top\mathbf{X}\mathbf{w} = \mathbf{0} \;\Rightarrow\; \mathbf{X}^\top\mathbf{X}\,\mathbf{w} = \mathbf{X}^\top\mathbf{y}` },
                { math: r`\hat{\mathbf{w}} = (\mathbf{X}^\top\mathbf{X})^{-1}\mathbf{X}^\top\mathbf{y}` },
                { p: "The loss is convex, so this stationary point is the global minimum. If two features are perfectly correlated, $\\mathbf{X}^\\top\\mathbf{X}$ cannot be inverted; ridge regression fixes that by adding $\\lambda\\mathbf{I}$." },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Five points: $x = [1, 2, 3, 4, 5]$, $y = [2, 4, 5, 4, 5]$." },
          {
            steps: [
              { title: "Means", body: "Centre everything on the means.", math: r`\bar{x} = 3, \qquad \bar{y} = 4` },
              { title: "Slope", body: "Deviations of $x$: −2, −1, 0, 1, 2. Deviations of $y$: −2, 0, 1, 0, 1.", math: r`w = \frac{(-2)(-2) + 0 + 0 + 0 + (2)(1)}{4 + 1 + 0 + 1 + 4} = \frac{6}{10} = 0.6` },
              { title: "Intercept", body: "The line always passes through $(\\bar{x}, \\bar{y})$.", math: r`b = 4 - 0.6 \times 3 = 2.2 \;\Rightarrow\; \hat{y} = 0.6x + 2.2` },
              { title: "Residuals and R²", body: "Predictions 2.8, 3.4, 4.0, 4.6, 5.2. Residuals −0.8, 0.6, 1.0, −0.6, −0.2. Squared errors sum to 2.4; total variation around the mean is 6. So the line explains 60% of the variation in $y$.", math: r`R^2 = 1 - \frac{\text{SSE}}{\text{SST}} = 1 - \frac{2.4}{6} = 0.6` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "mse-line", caption: "Find the slope and intercept by hand. You have found the least-squares line when no nudge of either slider lowers the MSE." }],
      },
      {
        heading: "Assumptions (and what breaks)",
        blocks: [
          {
            table: {
              head: ["Assumption", "Meaning", "Check", "If violated"],
              rows: [
                ["Linearity", "Target changes linearly with each feature", "Residuals vs predictions plot shows no curve", "Add polynomial / log features"],
                ["Independence", "Errors do not depend on each other", "No pattern over time or order", "Time-series models"],
                ["Constant variance", "Error spread is the same everywhere", "Residual plot has no funnel shape", "Transform target (e.g. log)"],
                ["No strong multicollinearity", "Features are not near-copies", "Correlation matrix, VIF", "Drop features or use ridge"],
                ["Normal errors (for p-values)", "Residuals roughly bell-shaped", "Histogram / Q–Q plot", "Predictions still fine; intervals unreliable"],
              ],
            },
          },
        ],
      },
      {
        heading: "Evaluation metrics",
        blocks: [
          {
            table: {
              head: ["Metric", "Formula", "Read as"],
              rows: [
                ["MAE", "$\\frac{1}{n}\\sum|y_i - \\hat{y}_i|$", "Average miss, in target units"],
                ["RMSE", "$\\sqrt{\\frac{1}{n}\\sum(y_i - \\hat{y}_i)^2}$", "Typical miss, punishing big ones"],
                ["$R^2$", "$1 - \\text{SSE}/\\text{SST}$", "Share of variance explained (1 is perfect, 0 is 'predict the mean')"],
                ["Adjusted $R^2$", "$1 - (1 - R^2)\\frac{n - 1}{n - d - 1}$", "$R^2$ penalised for adding useless features"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error

X = np.array([[1], [2], [3], [4], [5]]); y = np.array([2, 4, 5, 4, 5])
model = LinearRegression().fit(X, y)
print(model.coef_, model.intercept_)   # [0.6] 2.2
print(r2_score(y, model.predict(X)))   # 0.6

# The normal equation by hand
Xb = np.c_[np.ones(len(X)), X]
print(np.linalg.solve(Xb.T @ Xb, Xb.T @ y))   # [2.2 0.6]`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Reading coefficients as importance when features have different units", fix: "Standardise features first, then compare coefficient sizes." },
              { mistake: "Treating correlation as causation", fix: "A weight says 'associated with', not 'causes'. Confounders can drive both." },
              { mistake: "Celebrating a high training R²", fix: "Report R² on held-out data; adding features always raises training R²." },
              { mistake: "Ignoring the residual plot", fix: "A curve or funnel in residuals means the model is missing structure." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A model of flat prices has the weight +4,000 for 'area in m²'. What does that mean?", options: ["Each extra m² causes ₹4,000 more value", "Holding other features fixed, each extra m² is associated with ₹4,000 higher predicted price", "Area is the most important feature", "The model's error is ₹4,000"], answer: 1, why: "A linear weight is the change in prediction per unit change of that feature with the others held constant. It is an association, and its size depends on units." } },
        ],
      },
    ],
  },
  {
    slug: "polynomial-regression",
    group: "Regression",
    title: "Polynomial Regression",
    summary: "Still linear regression, but on curved features like x², x³, so the fit can bend.",
    learnHref: "/learn/polynomial-regression",
    playHref: "/games/bridge?level=degree",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Polynomial regression creates new features x², x³, … and fits an ordinary linear regression on them, so the curve can bend while the maths stays linear in the weights." } },
          { p: "The trick: 'linear' in linear regression means linear in the **weights**, not in $x$. Once $x^2$ is just another column, the same least-squares machinery works unchanged." },
        ],
      },
      {
        heading: "The model",
        blocks: [
          { math: r`\hat{y} = w_0 + w_1x + w_2x^2 + \dots + w_px^p` },
          { p: "Feature expansion for one input with degree $p$: $x \\mapsto [1, x, x^2, \\dots, x^p]$. With $d$ inputs, all terms up to degree $p$ (including interactions like $x_1x_2$) give this many features:" },
          { math: r`\binom{d + p}{p} \qquad \text{e.g. } d = 10,\; p = 3 \;\Rightarrow\; \binom{13}{3} = 286` },
          { p: "Feature counts explode quickly, which is one reason high degrees overfit." },
        ],
      },
      {
        heading: "Worked example: expanding one row",
        blocks: [
          {
            steps: [
              { title: "Start with one feature", body: "A row with $x = 2$." },
              { title: "Expand to degree 3", body: "The row becomes four columns.", math: r`[1,\; x,\; x^2,\; x^3] = [1,\; 2,\; 4,\; 8]` },
              { title: "Fit as usual", body: "Suppose fitting gives $w = [1, -0.5, 0.25, 0.1]$. The prediction is a dot product, exactly like linear regression.", math: r`\hat{y} = 1(1) - 0.5(2) + 0.25(4) + 0.1(8) = 1.8` },
              { title: "Mind the scale", body: "At $x = 10$ the columns are 1, 10, 100, 1000. Without scaling, the big columns dominate gradient descent and the weights become unstable." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "poly-degree", caption: "Raise the degree. Training error keeps falling; test error falls, then shoots up. The best degree is where test error is lowest." }],
      },
      {
        heading: "Choosing the degree",
        blocks: [
          {
            table: {
              head: ["Degree", "Fit", "Train error", "Test error"],
              rows: [
                ["Too low (1 for a curve)", "Underfits: misses the bend", "High", "High"],
                ["About right", "Follows the trend", "Low", "Lowest"],
                ["Too high", "Wiggles through every point", "Near zero", "High, explodes outside the data"],
              ],
            },
          },
          { p: "Choose the degree with cross-validation, or keep a high degree and add regularisation (ridge) to calm the wiggles." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import cross_val_score

for degree in [1, 2, 3, 5, 9]:
    model = make_pipeline(PolynomialFeatures(degree, include_bias=False),
                          StandardScaler(), LinearRegression())
    score = cross_val_score(model, X, y, cv=5, scoring="neg_mean_squared_error").mean()
    print(degree, -score)   # pick the degree with the lowest CV error`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Picking the degree with the lowest training error", fix: "That is always the highest degree. Use validation or cross-validation error." },
              { mistake: "Extrapolating a polynomial", fix: "High-degree polynomials shoot to ±∞ just outside the data range." },
              { mistake: "Forgetting to scale after expansion", fix: "Put StandardScaler after PolynomialFeatures in the pipeline." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Why is polynomial regression still called a linear model?", options: ["Because the curve is approximately straight", "Because the prediction is linear in the weights", "Because it only works with one feature", "Because it uses gradient descent"], answer: 1, why: "x² and x³ are just extra columns; the prediction is still a weighted sum of columns, so the least-squares solution is the same." } },
        ],
      },
    ],
  },
  {
    slug: "regularization",
    group: "Regression",
    title: "Regularization: Ridge & Lasso",
    summary: "Add a penalty for large weights so the model prefers simpler fits that generalise.",
    learnHref: "/learn/regularization",
    playHref: "/games/bridge?level=ridge",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Regularisation adds a cost for large weights to the loss, trading a little training accuracy for a model that is less sensitive to noise." } },
          { p: "An overfit model usually has huge, finely balanced weights that cancel each other to hit every training point. Penalising weight size makes those fragile solutions expensive." },
        ],
      },
      {
        heading: "The losses",
        blocks: [
          { math: r`\text{Ridge (L2):}\quad \sum_i (y_i - \hat{y}_i)^2 + \lambda\sum_j w_j^2` },
          { math: r`\text{Lasso (L1):}\quad \sum_i (y_i - \hat{y}_i)^2 + \lambda\sum_j |w_j|` },
          { math: r`\text{Elastic net:}\quad \sum_i (y_i - \hat{y}_i)^2 + \lambda\Big(\alpha\sum_j |w_j| + (1 - \alpha)\sum_j w_j^2\Big)` },
          { p: "$\\lambda \\ge 0$ sets the strength. $\\lambda = 0$ is plain least squares; very large $\\lambda$ pushes all weights toward 0. The intercept is normally **not** penalised." },
          {
            table: {
              head: ["", "Ridge (L2)", "Lasso (L1)"],
              rows: [
                ["Effect on weights", "Shrinks all smoothly toward 0", "Shrinks and sets some exactly to 0"],
                ["Feature selection", "No", "Yes"],
                ["Correlated features", "Shares weight between them", "Tends to keep one, drop the others"],
                ["Closed form", "$(\\mathbf{X}^\\top\\mathbf{X} + \\lambda\\mathbf{I})^{-1}\\mathbf{X}^\\top\\mathbf{y}$", "No; solved by coordinate descent"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: one weight, by hand",
        blocks: [
          { p: "Data $x = [1, 2, 3]$, $y = [2, 4, 6]$, model $\\hat{y} = wx$. Here $\\sum xy = 28$ and $\\sum x^2 = 14$." },
          {
            steps: [
              { title: "No penalty", body: "Least squares gives the exact fit.", math: r`w = \frac{\sum xy}{\sum x^2} = \frac{28}{14} = 2` },
              { title: "Ridge with λ = 14", body: "The penalty adds λ to the denominator, so the weight shrinks but never reaches 0.", math: r`w = \frac{\sum xy}{\sum x^2 + \lambda} = \frac{28}{14 + 14} = 1` },
              { title: "Lasso with λ = 28", body: "Lasso subtracts λ/2 from the numerator (soft thresholding).", math: r`w = \frac{\max(28 - \lambda/2,\; 0)}{14} = \frac{14}{14} = 1` },
              { title: "Lasso with λ = 56", body: "The numerator hits 0, so the weight is exactly 0: the feature is removed.", math: r`w = \frac{\max(28 - 28,\; 0)}{14} = 0` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "ridge-lasso", caption: "Slide λ up. Ridge weights shrink together; lasso weights drop to exactly zero one by one." }],
      },
      {
        heading: "Why lasso gives exact zeros",
        blocks: [
          {
            derive: {
              title: "The geometry and the subgradient",
              blocks: [
                { p: "Equivalently, minimise the squared error subject to a budget: $\\sum w_j^2 \\le t$ (a circle) for ridge, $\\sum |w_j| \\le t$ (a diamond) for lasso. The error contours usually touch the diamond at a corner, where some weights are exactly 0. A circle has no corners." },
                { p: "Algebraically, for one weight with $\\rho = \\sum x_iy_i$ and $z = \\sum x_i^2$, setting the subgradient of $\\sum(y_i - wx_i)^2 + \\lambda|w|$ to zero gives soft thresholding:" },
                { math: r`w = \frac{\operatorname{sign}(\rho)\,\max\!\left(|\rho| - \tfrac{\lambda}{2},\; 0\right)}{z}` },
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.linear_model import RidgeCV, LassoCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np

alphas = np.logspace(-3, 2, 30)          # scikit-learn calls λ "alpha"
ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=alphas)).fit(X_train, y_train)
lasso = make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5)).fit(X_train, y_train)

print(lasso[-1].alpha_)                  # chosen λ
print((lasso[-1].coef_ == 0).sum(), "features dropped")`,
          },
          { p: "scikit-learn scales the lasso squared-error term by $\\tfrac{1}{2n}$, so its `alpha` values are not numerically the same as the λ above; the behaviour is the same." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Regularising unscaled features", fix: "The penalty treats all weights equally, so features must be on the same scale. Standardise first." },
              { mistake: "Choosing λ by eye", fix: "Use RidgeCV / LassoCV or a grid search with cross-validation." },
              { mistake: "Reading lasso's dropped features as useless", fix: "With correlated features lasso picks one somewhat arbitrarily; the dropped one may carry the same information." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "You have 500 features and suspect only about 20 matter. Which is the better first try?", options: ["Ridge", "Lasso", "Plain linear regression", "Polynomial regression of degree 5"], answer: 1, why: "Lasso sets many weights exactly to zero, so it performs feature selection and leaves a smaller, easier-to-read model." } },
        ],
      },
    ],
  },
];

export const CLASSIFICATION_THEORY: TheoryTopic[] = [
  {
    slug: "logistic-regression",
    group: "Classification",
    title: "Logistic Regression",
    summary: "A linear score squashed through the sigmoid into a probability between 0 and 1.",
    learnHref: "/learn/logistic-regression",
    playHref: "/games/threshold?level=sigmoid",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Logistic regression computes a linear score z = w·x + b, turns it into a probability with the sigmoid, and is trained by minimising cross-entropy." } },
          { p: "Despite the name, it is a **classifier**. The 'regression' part is the linear score underneath; the sigmoid turns that score into a probability you can threshold." },
        ],
      },
      {
        heading: "The model",
        blocks: [
          { math: r`z = \mathbf{w}^\top\mathbf{x} + b, \qquad p = \sigma(z) = \frac{1}{1 + e^{-z}}` },
          { p: "The sigmoid maps any real number into $(0, 1)$: $\\sigma(0) = 0.5$, large positive $z$ gives values near 1, large negative near 0. Predict class 1 when $p \\ge 0.5$, i.e. when $z \\ge 0$. So the **decision boundary** $\\mathbf{w}^\\top\\mathbf{x} + b = 0$ is a straight line (a plane in more dimensions)." },
          { p: "Rearranging shows what the weights mean: the score is the log-odds." },
          { math: r`\ln\frac{p}{1 - p} = \mathbf{w}^\top\mathbf{x} + b \qquad\Rightarrow\qquad \text{one unit more of } x_j \text{ multiplies the odds by } e^{w_j}` },
        ],
      },
      {
        heading: "Training",
        blocks: [
          { p: "Minimise binary cross-entropy. Its gradient is remarkably simple:" },
          { math: r`L = -\frac{1}{n}\sum_i \big[y_i\ln p_i + (1 - y_i)\ln(1 - p_i)\big], \qquad \frac{\partial L}{\partial \mathbf{w}} = \frac{1}{n}\sum_i (p_i - y_i)\,\mathbf{x}_i` },
          {
            derive: {
              title: "Deriving the gradient",
              blocks: [
                { p: "Use $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$. For one example, $\\frac{\\partial \\ell}{\\partial p} = -\\frac{y}{p} + \\frac{1 - y}{1 - p}$ and $\\frac{\\partial p}{\\partial z} = p(1 - p)$. Multiply (chain rule):" },
                { math: r`\frac{\partial \ell}{\partial z} = \left(-\frac{y}{p} + \frac{1 - y}{1 - p}\right)p(1 - p) = -y(1 - p) + (1 - y)p = p - y` },
                { p: "Since $z = \\mathbf{w}^\\top\\mathbf{x} + b$, $\\frac{\\partial z}{\\partial \\mathbf{w}} = \\mathbf{x}$, giving $(p - y)\\mathbf{x}$. The loss is convex, so gradient descent finds the global minimum. There is no closed-form solution." },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Predict pass (1) or fail (0) from hours studied. Trained weights: $w = 2$, $b = -5$." },
          {
            steps: [
              { title: "3 hours", body: "Score is positive, so predict pass.", math: r`z = 2(3) - 5 = 1, \qquad p = \sigma(1) \approx 0.731` },
              { title: "2 hours", body: "Score is negative, so predict fail.", math: r`z = 2(2) - 5 = -1, \qquad p = \sigma(-1) \approx 0.269` },
              { title: "Decision boundary", body: "Where $z = 0$.", math: r`2x - 5 = 0 \;\Rightarrow\; x = 2.5 \text{ hours}` },
              { title: "Interpret the weight", body: "Each extra hour multiplies the odds of passing by $e^2 \\approx 7.39$." },
              { title: "One gradient step", body: "If the 3-hour student actually failed ($y = 0$): error $p - y = 0.731$, so the gradient for $w$ is $0.731 \\times 3 \\approx 2.19$ and $w$ decreases." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "sigmoid", caption: "Move the score z. Notice that probability changes fastest near z = 0 and barely moves once |z| is large." }],
      },
      {
        heading: "More than two classes",
        blocks: [
          { p: "**Softmax** generalises the sigmoid to $K$ classes, with one score $z_k$ per class:" },
          { math: r`P(y = k \mid \mathbf{x}) = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}` },
          { p: "Alternatively, one-vs-rest trains $K$ binary classifiers. scikit-learn's `LogisticRegression` uses softmax (multinomial) by default for multiclass problems." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

clf = make_pipeline(StandardScaler(), LogisticRegression(C=1.0))  # C = 1/λ (L2 strength)
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_test)[:, 1]     # P(class 1)
pred = (proba >= 0.3).astype(int)           # custom threshold when recall matters`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Always using the 0.5 threshold", fix: "Choose the threshold from the cost of each error type (precision–recall trade-off)." },
              { mistake: "Expecting a curved boundary", fix: "The boundary is linear. Add polynomial features or use a non-linear model." },
              { mistake: "Forgetting that C is inverse regularisation", fix: "Smaller C = stronger penalty in scikit-learn." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A logistic model gives z = 0 for a customer. What probability does it assign to class 1?", options: ["0", "0.5", "1", "It depends on the weights"], answer: 1, why: "σ(0) = 1 / (1 + e⁰) = 0.5. z = 0 is exactly the decision boundary." } },
        ],
      },
    ],
  },
  {
    slug: "k-nearest-neighbors",
    group: "Classification",
    title: "K-Nearest Neighbours",
    summary: "Classify a point by a vote among the K training points closest to it.",
    learnHref: "/learn/k-nearest-neighbors",
    playHref: "/games/sorter?level=knn",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "KNN stores the training data and, for a new point, takes a majority vote (or average, for regression) of its K nearest neighbours." } },
          { p: "There is no training step at all: KNN is a **lazy learner**. All the work happens at prediction time, which makes it quick to set up and slow to use on big datasets." },
        ],
      },
      {
        heading: "Distance",
        blocks: [
          { math: r`\text{Euclidean: } d(\mathbf{a}, \mathbf{b}) = \sqrt{\sum_j (a_j - b_j)^2} \qquad \text{Manhattan: } \sum_j |a_j - b_j|` },
          { math: r`\text{Minkowski: } \Big(\sum_j |a_j - b_j|^p\Big)^{1/p} \quad (p = 1 \text{ Manhattan},\; p = 2 \text{ Euclidean})` },
          { p: "Because distance adds up raw differences, a feature measured in thousands (income) swamps one measured in units (age). **Always scale features** before KNN." },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Query point $q = (3, 3)$. Training points: R1 $(2, 3)$ red, B1 $(4, 4)$ blue, B2 $(3, 5)$ blue, B3 $(5, 2)$ blue, R2 $(1, 1)$ red." },
          {
            steps: [
              { title: "Compute distances", body: "Euclidean distance from $q$ to each point.", math: r`\text{R1}: 1,\quad \text{B1}: \sqrt{2} \approx 1.41,\quad \text{B2}: 2,\quad \text{B3}: \sqrt{5} \approx 2.24,\quad \text{R2}: \sqrt{8} \approx 2.83` },
              { title: "K = 1", body: "The single nearest point is R1, so predict **red**." },
              { title: "K = 3", body: "Nearest three: R1 (red), B1 (blue), B2 (blue). Vote 2–1, so predict **blue**." },
              { title: "The lesson", body: "Small K follows individual points (and noise); larger K smooths the boundary. The right K comes from validation." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "distance", caption: "Move the two points. Manhattan is never shorter than Euclidean; they are equal only when the points share a row or column." }],
      },
      {
        heading: "Choosing K",
        blocks: [
          {
            table: {
              head: ["K", "Boundary", "Risk"],
              rows: [
                ["1", "Very jagged, islands around single points", "Overfits; one mislabelled point flips nearby predictions"],
                ["Moderate (e.g. 5–15)", "Smooth but follows real structure", "Usually best; pick by cross-validation"],
                ["Very large", "Almost flat; drifts toward the majority class", "Underfits"],
              ],
            },
          },
          { p: "Use an odd K for two classes to avoid ties. `weights='distance'` makes closer neighbours count more." },
        ],
      },
      {
        heading: "Strengths and weaknesses",
        blocks: [
          {
            table: {
              head: ["Strengths", "Weaknesses"],
              rows: [
                ["No training; easy to explain", "Prediction is slow: compares against every stored point"],
                ["Naturally handles many classes", "Needs scaled features"],
                ["Any boundary shape", "Struggles in high dimensions (distances become similar)"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 7, 9, 15]}, cv=5)
grid.fit(X_train, y_train)
print(grid.best_params_, grid.score(X_test, y_test))`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Skipping feature scaling", fix: "Put StandardScaler in the pipeline before the classifier." },
              { mistake: "Choosing K by training accuracy", fix: "K = 1 always scores 100% on training data. Use cross-validation." },
              { mistake: "Using KNN on hundreds of raw features", fix: "Reduce dimensions (PCA, feature selection) first." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Features are age (20–60) and salary (₹2–20 lakh, stored in rupees). Without scaling, what happens?", options: ["Age dominates the distance", "Salary dominates the distance", "Both count equally", "KNN refuses to run"], answer: 1, why: "Salary differences are in hundreds of thousands, age differences in tens, so salary decides almost every distance." } },
        ],
      },
    ],
  },
  {
    slug: "decision-trees",
    group: "Classification",
    title: "Decision Trees",
    summary: "A flowchart of yes/no questions, each chosen to make the groups as pure as possible.",
    learnHref: "/learn/decision-trees",
    playHref: "/games/sorter?level=tree",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A decision tree repeatedly splits the data on the feature and threshold that make the resulting groups most pure, then predicts the majority class of the leaf a point lands in." } },
          { p: "A trained tree reads like a flowchart: 'Is income > ₹8 lakh? If yes, is age < 30?' That makes trees among the most explainable models, as long as they stay small." },
        ],
      },
      {
        heading: "Measuring impurity",
        blocks: [
          { p: "For a node where class $k$ has proportion $p_k$:" },
          { math: r`\text{Gini} = 1 - \sum_k p_k^2 \qquad\qquad \text{Entropy} = -\sum_k p_k\log_2 p_k` },
          { p: "Both are 0 for a pure node. For two classes, Gini peaks at 0.5 and entropy at 1 bit when the split is 50/50. A split is scored by the drop in **weighted** impurity:" },
          { math: r`\text{Gain} = I(\text{parent}) - \sum_{c \in \text{children}} \frac{n_c}{n}\, I(c)` },
          { p: "With entropy, this gain is called **information gain**. For regression trees, the impurity is the variance (MSE) in the node, and a leaf predicts the mean." },
        ],
      },
      {
        heading: "Worked example: choosing a split",
        blocks: [
          { p: "A node has 10 samples: 5 A and 5 B. Gini $= 1 - (0.5^2 + 0.5^2) = 0.5$. Two candidate splits:" },
          {
            steps: [
              { title: "Split 1: left 4A + 1B, right 1A + 4B", body: "Both children have the same impurity.", math: r`I = 1 - (0.8^2 + 0.2^2) = 0.32, \qquad \text{weighted} = \tfrac{5}{10}(0.32) + \tfrac{5}{10}(0.32) = 0.32` },
              { title: "Gain of split 1", body: "", math: r`0.5 - 0.32 = 0.18` },
              { title: "Split 2: left 5A + 3B, right 0A + 2B", body: "The right child is pure, but the left is still mixed.", math: r`I_L = 1 - (0.625^2 + 0.375^2) \approx 0.469, \qquad \text{weighted} = \tfrac{8}{10}(0.469) + \tfrac{2}{10}(0) = 0.375` },
              { title: "Pick the winner", body: "Split 1 gains 0.18 versus 0.125 for split 2, so the tree uses split 1. A tiny pure child does not beat two cleaner halves." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gini", caption: "Set a node's class counts. Gini and entropy both hit zero for a pure node and peak at a 50/50 mix." }],
      },
      {
        heading: "Controlling overfitting",
        blocks: [
          { p: "Left alone, a tree keeps splitting until every leaf is pure, memorising the training data. Limit it with hyperparameters:" },
          {
            table: {
              head: ["Hyperparameter", "Effect"],
              rows: [
                ["`max_depth`", "Maximum number of questions on any path"],
                ["`min_samples_split`", "A node needs at least this many samples to split"],
                ["`min_samples_leaf`", "Every leaf keeps at least this many samples"],
                ["`ccp_alpha`", "Cost-complexity pruning: remove branches that do not earn their keep"],
              ],
            },
          },
          { p: "Ensembles fix the instability of single trees: a **random forest** averages many trees trained on bootstrap samples with random feature subsets; **gradient boosting** adds small trees one at a time, each correcting the previous errors." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.ensemble import RandomForestClassifier

tree = DecisionTreeClassifier(max_depth=3, criterion="gini", random_state=0).fit(X_train, y_train)
print(export_text(tree, feature_names=list(feature_names)))   # readable rules
print(tree.feature_importances_)

forest = RandomForestClassifier(n_estimators=300, random_state=0).fit(X_train, y_train)
print(forest.score(X_test, y_test))`,
          },
          { p: "Trees split on thresholds, so they do **not** need feature scaling." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Growing a tree with no depth limit", fix: "Tune max_depth / min_samples_leaf with cross-validation." },
              { mistake: "Trusting feature_importances_ blindly", fix: "Impurity importance favours features with many distinct values. Cross-check with permutation importance." },
              { mistake: "Expecting smooth predictions", fix: "Trees predict in steps. For smooth trends, linear models or boosting may fit better." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A node contains 8 samples of class A and 0 of class B. What is its Gini impurity?", options: ["0", "0.5", "1", "0.8"], answer: 0, why: "p(A) = 1, so Gini = 1 − 1² = 0. The node is pure and will not be split further." } },
        ],
      },
    ],
  },
  {
    slug: "classification-metrics",
    group: "Classification",
    title: "Classification Metrics",
    summary: "Accuracy, precision, recall, F1 and ROC: which errors does your model make, and which matter?",
    playHref: "/games/threshold?level=fraud",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Different metrics count different mistakes; pick the one that matches the real cost of a false alarm versus a missed case." } },
          { p: "Accuracy alone hides a lot. A fraud detector that says 'not fraud' every time is 99% accurate when 1% of transactions are fraud, and catches nothing." },
        ],
      },
      {
        heading: "The confusion matrix",
        blocks: [
          {
            table: {
              head: ["", "Predicted positive", "Predicted negative"],
              rows: [
                ["Actually positive", "TP (true positive)", "FN (false negative, a miss)"],
                ["Actually negative", "FP (false positive, a false alarm)", "TN (true negative)"],
              ],
            },
          },
          { math: r`\text{Accuracy} = \frac{TP + TN}{n} \quad \text{Precision} = \frac{TP}{TP + FP} \quad \text{Recall} = \frac{TP}{TP + FN} \quad F_1 = \frac{2PR}{P + R}` },
          {
            list: [
              "**Precision**: of everything flagged, how much was right? Matters when false alarms are expensive (spam filter deleting real mail).",
              "**Recall** (sensitivity): of all real positives, how many did we catch? Matters when misses are expensive (cancer screening, fraud).",
              "**Specificity**: $TN / (TN + FP)$, the recall of the negative class.",
              "**F1**: harmonic mean of precision and recall; low if either is low.",
            ],
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "1,000 transactions, 60 of them fraud. The model flags 50: 40 real fraud, 10 genuine." },
          {
            steps: [
              { title: "Fill the matrix", body: "TP = 40, FP = 10, FN = 60 − 40 = 20, TN = 940 − 10 = 930." },
              { title: "Accuracy looks great", body: "But a model that never flags anything scores 940/1000 = 0.94, so 0.97 is not as impressive as it sounds.", math: r`\frac{40 + 930}{1000} = 0.97` },
              { title: "Precision and recall", body: "80% of flags are real, but a third of fraud slips through.", math: r`P = \frac{40}{50} = 0.80, \qquad R = \frac{40}{60} \approx 0.667` },
              { title: "F1", body: "", math: r`F_1 = \frac{2(0.8)(0.667)}{0.8 + 0.667} \approx 0.727` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "confusion", caption: "Push true negatives up while keeping the others fixed: accuracy rises, precision and recall do not move at all." }],
      },
      {
        heading: "Thresholds, ROC and PR curves",
        blocks: [
          { p: "Most classifiers output a score or probability. Lowering the threshold flags more cases: recall rises, precision usually falls. Curves show every threshold at once:" },
          {
            table: {
              head: ["Curve", "Axes", "Summary number", "Best for"],
              rows: [
                ["ROC", "True positive rate vs false positive rate", "AUC: probability a random positive scores above a random negative (0.5 = random, 1 = perfect)", "Balanced classes, ranking quality"],
                ["Precision–Recall", "Precision vs recall", "Average precision", "Rare positives (fraud, disease)"],
              ],
            },
          },
        ],
      },
      {
        heading: "Multiclass averaging",
        blocks: [
          {
            list: [
              "**Macro**: compute the metric per class and take the plain average. Every class counts equally, so rare classes matter.",
              "**Weighted**: average weighted by class size.",
              "**Micro**: pool all TP/FP/FN first. For single-label multiclass, micro-F1 equals accuracy.",
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.metrics import (confusion_matrix, classification_report,
                             roc_auc_score, precision_recall_curve)

y_pred = model.predict(X_test)
print(confusion_matrix(y_test, y_pred))        # [[TN FP] [FN TP]]
print(classification_report(y_test, y_pred))   # precision, recall, F1 per class

scores = model.predict_proba(X_test)[:, 1]
print(roc_auc_score(y_test, scores))
precision, recall, thresholds = precision_recall_curve(y_test, scores)`,
          },
          { p: "Note scikit-learn's layout: rows are actual classes, columns are predicted, with the negative class first." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Reporting accuracy on imbalanced data", fix: "Report precision, recall and PR-AUC, and compare with the 'always majority' baseline." },
              { mistake: "Tuning the threshold on the test set", fix: "Pick it on validation data, then report test results once." },
              { mistake: "Computing AUC from hard 0/1 predictions", fix: "Pass probabilities or scores, not predicted labels." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A disease screening test must miss as few sick patients as possible; follow-up tests can sort out false alarms. Which metric should drive the threshold?", options: ["Precision", "Recall", "Accuracy", "Specificity"], answer: 1, why: "Missing a sick patient is a false negative. Recall = TP / (TP + FN) is what goes down when you miss them." } },
        ],
      },
    ],
  },
];
