import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Linear Regression. */
export const LINEAR: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Linear regression draws the straight line that keeps the squared vertical gaps to the points as small as possible. The slope says how much $y$ changes per unit of $x$; the intercept places the line.",
      examples: [
        {
          at: 1,
          title: "Reading a fitted line",
          blocks: [
            { p: "Rent model: rent (₹ thousand) $= 4 + 0.15 \\times$ area (m²). A 60 m² flat is predicted at $4 + 9 = 13$ thousand. Each extra 10 m² adds 1.5 thousand. The intercept 4 would be the rent of a 0 m² flat: meaningless on its own, but it puts the line in the right place." },
          ],
        },
        {
          at: 2,
          title: "Slope from covariance",
          blocks: [
            { p: "For $x = (1, 2, 3, 4, 5)$, $y = (2, 4, 5, 4, 5)$: Cov$(x, y) = 6/4 = 1.5$ and Var$(x) = 10/4 = 2.5$, so $w = 1.5/2.5 = 0.6$, the same slope as the worked example below." },
          ],
        },
        {
          at: 4,
          title: "SST = SSR + SSE with numbers",
          blocks: [
            { p: "Same five points, line $\\hat y = 2.2 + 0.6x$, predictions $(2.8, 3.4, 4.0, 4.6, 5.2)$." },
            { list: ["SST $= 4 + 0 + 1 + 0 + 1 = 6$ (spread of $y$ around its mean 4).", "SSE $= 0.64 + 0.36 + 1 + 0.36 + 0.04 = 2.4$ (what the line misses).", "SSR $= 1.44 + 0.36 + 0 + 0.36 + 1.44 = 3.6$ (what the line explains). $3.6 + 2.4 = 6$, and $R^2 = 3.6/6 = 0.6$."] },
          ],
        },
        {
          at: 5,
          kind: "idea",
          title: "Multicollinearity in practice",
          blocks: [
            { p: "Price from area in m² **and** area in square feet. Fits giving (m² weight 50, sq ft weight 0) or (0, 4.6) or (25, 2.3) predict almost identically, so the model cannot tell which column deserves the credit and the two weights swing from sample to sample. Drop one of them." },
          ],
        },
      ],
    },
    "The model": {
      examples: [
        {
          title: "Predictions for three houses at once",
          blocks: [
            { math: r`\hat{\mathbf y} = \mathbf X\mathbf w = \begin{bmatrix} 1 & 50 & 2 \\ 1 & 80 & 3 \\ 1 & 120 & 4 \end{bmatrix}\begin{bmatrix} 10 \\ 0.5 \\ 5 \end{bmatrix} = \begin{bmatrix} 10 + 25 + 10 \\ 10 + 40 + 15 \\ 10 + 60 + 20 \end{bmatrix} = \begin{bmatrix} 45 \\ 65 \\ 90 \end{bmatrix}` },
            { p: "Columns: the 1s for the intercept (10), area (weight 0.5) and bedrooms (weight 5)." },
          ],
        },
      ],
    },
    "Assumptions (and what breaks)": {
      examples: [
        {
          kind: "idea",
          title: "One assumption broken, one symptom",
          blocks: [
            { list: ["Linearity broken (sales rise then fall with price): residuals form a U-shape.", "Independence broken (daily sales): residuals come in long runs above and below zero.", "Constant spread broken (big houses vary more): residuals fan out as predictions grow."] },
          ],
        },
      ],
    },
    "Evaluation metrics": {
      examples: [
        {
          title: "Metrics for the worked example",
          blocks: [
            { p: "Residuals $(-0.8, 0.6, 1.0, -0.6, -0.2)$: MAE $= 3.2/5 = 0.64$, RMSE $= \\sqrt{2.4/5} = 0.69$, $R^2 = 1 - 2.4/6 = 0.6$." },
          ],
        },
      ],
    },
    "Categorical features and interactions": {
      examples: [
        {
          title: "Dummy columns with numbers",
          blocks: [
            { p: "Fit: price (₹ lakh) $= 10 + 0.08 \\times$ area $+ 12 \\times$[Pune] $+ 25 \\times$[Bengaluru], baseline Mysuru. A 70 m² flat: Mysuru $10 + 5.6 = 15.6$; Pune $27.6$; Bengaluru $40.6$. Same area, different city, different base price." },
          ],
        },
      ],
    },
    "Inference: is a weight real or noise?": {
      examples: [
        {
          title: "Reading a t-statistic",
          blocks: [
            { p: "Weight 0.6 with standard error 0.25: $t = 0.6/0.25 = 2.4$, beyond 2, so the slope is unlikely to be pure chance. Weight 0.6 with standard error 0.5: $t = 1.2$, so the data cannot rule out a true slope of 0." },
          ],
        },
      ],
    },
    "1.2.3 Linear regression, least squares, and diagnostics": {
      plain: "Least squares picks the intercept and slope that make the sum of squared residuals smallest. Setting the two partial derivatives to zero gives the formulas; the worked numbers below follow them line by line.",
      replace: {
        0: { p: "A regression model predicts a numeric response. For one input, the linear model is $\\hat y_i = b_0 + b_1 x_i$. The residual is $e_i = y_i - \\hat y_i$. Ordinary least squares chooses $b_0$ and $b_1$ to minimize" },
        1: { math: r`S(b_0, b_1) = \sum_i \big[y_i - b_0 - b_1 x_i\big]^2` },
        3: { p: "Squaring prevents positive and negative residuals from canceling and penalizes large misses more strongly. Setting $\\partial S/\\partial b_0 = 0$ gives $\\sum_i (y_i - b_0 - b_1 x_i) = 0$, so $b_0 = \\bar y - b_1 \\bar x$; substituting into $\\partial S/\\partial b_1 = 0$ gives the slope formula above, provided not all $x_i$ are identical. The numerator captures how the variables move together, and the denominator captures variation in $x$. If every $x_i$ is the same, the data cannot identify a slope." },
        5: { p: "Suppose a small calibration study records compressor cycles $x = (1, 2, 3)$ and energy use $y = (2, 3, 5)$ in arbitrary units. Then $\\bar x = 2$ and $\\bar y = 10/3$. The centered $x$ values are $(-1, 0, 1)$, so the denominator is $1 + 0 + 1 = 2$. The numerator is $(-1)(2 - 10/3) + 0 + (1)(5 - 10/3) = 4/3 + 5/3 = 3$. Thus $b_1 = 3/2 = 1.5$ and $b_0 = 10/3 - 1.5 \\times 2 = 1/3$. The fitted predictions at $x = 1, 2, 3$ are approximately 1.833, 3.333 and 4.833." },
        6: { p: "The residuals are approximately 0.167, −0.333 and 0.167. Their sum is zero to rounding because this fitted model has an intercept. The squared-error sum is $(1/6)^2 + (-1/3)^2 + (1/6)^2 = 1/6$. A fourth reading at $x = 10$ would be far outside the observed range; using the fitted line to predict there is extrapolation, not evidence that energy use stays linear that far away." },
        9: { p: "If two columns are almost duplicates, $X^\\top X$ can be poorly conditioned. Their individual coefficients can vary sharply with small data changes even while predictions remain similar. This is multicollinearity. Remove redundant features, collect more varied data, or use regularization if it improves the intended prediction task. Coefficients are conditional associations within the fitted model and should not be presented as causal effects without a separate design." },
        14: { p: "**Exercise:** Add a fourth point $x = 4$, $y = 4$ to the tiny dataset. Recalculate $\\bar x$, $\\bar y$, $b_1$ and $b_0$. Compare the new fit with the three-point fit and explain whether the change indicates a bug or ordinary sensitivity to additional observations." },
      },
      examples: [
        {
          at: 14,
          title: "Answer to the exercise",
          blocks: [
            { p: "Now $x = (1, 2, 3, 4)$, $y = (2, 3, 5, 4)$: $\\bar x = 2.5$, $\\bar y = 3.5$. Deviations: $x$: $(-1.5, -0.5, 0.5, 1.5)$; $y$: $(-1.5, -0.5, 1.5, 0.5)$. Numerator $2.25 + 0.25 + 0.75 + 0.75 = 4$, denominator $5$, so $b_1 = 0.8$ and $b_0 = 3.5 - 0.8 \\times 2.5 = 1.5$. The slope dropped from 1.5 to 0.8 because the new point lies below the old line: ordinary sensitivity with tiny data, not a bug." },
          ],
        },
      ],
      code: [
        {
          goal: "Least squares from scratch: slope, intercept, residuals and R²",
          code: r`x = [1.0, 2.0, 3.0]
y = [2.0, 3.0, 5.0]
n = len(x)

x_bar = sum(x) / n
y_bar = sum(y) / n
num = sum((xi - x_bar) * (yi - y_bar) for xi, yi in zip(x, y))   # how x and y move together
den = sum((xi - x_bar) ** 2 for xi in x)                          # how much x varies
b1 = num / den
b0 = y_bar - b1 * x_bar
print(f"slope b1 = {num:.4f} / {den:.4f} = {b1:.4f}, intercept b0 = {b0:.4f}")

pred = [b0 + b1 * xi for xi in x]
resid = [yi - pi for yi, pi in zip(y, pred)]
sse = sum(e ** 2 for e in resid)
sst = sum((yi - y_bar) ** 2 for yi in y)
print("predictions:", [round(p, 3) for p in pred])
print("residuals:  ", [round(e, 3) for e in resid], "| sum:", round(sum(resid), 10) + 0.0)
print(f"SSE = {sse:.4f}, SST = {sst:.4f}, R^2 = {1 - sse / sst:.4f}")

# Output:
# slope b1 = 3.0000 / 2.0000 = 1.5000, intercept b0 = 0.3333
# predictions: [1.833, 3.333, 4.833]
# residuals:   [0.167, -0.333, 0.167] | sum: 0.0
# SSE = 0.1667, SST = 4.6667, R^2 = 0.9643`,
          walk: [
            { line: "num = sum((xi - x_bar) * (yi - y_bar) for xi, yi in zip(x, y))   # how x and y move together", say: "The numerator of the slope formula." },
            { line: "den = sum((xi - x_bar) ** 2 for xi in x)                          # how much x varies", say: "The denominator. If every $x$ were equal it would be 0 and there would be no slope." },
            { line: "b0 = y_bar - b1 * x_bar", say: "The intercept makes the line pass through the point of means." },
            { line: "print(\"residuals:  \", [round(e, 3) for e in resid], \"| sum:\", round(sum(resid), 10) + 0.0)", say: "Residuals sum to zero whenever the model has an intercept." },
            { line: "print(f\"SSE = {sse:.4f}, SST = {sst:.4f}, R^2 = {1 - sse / sst:.4f}\")", say: "$R^2$: the share of the spread in $y$ that the line explains." },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Fit with scikit-learn, then check with the normal equation",
      walk: [
        { line: "model = LinearRegression().fit(X, y)", say: "scikit-learn finds the least-squares slope and intercept." },
        { line: "print(r2_score(y, model.predict(X)))   # 0.6", say: "$R^2 = 0.6$ on the training data." },
        { line: "Xb = np.c_[np.ones(len(X)), X]", say: "Add a column of 1s so the intercept becomes an ordinary weight." },
        { line: "print(np.linalg.solve(Xb.T @ Xb, Xb.T @ y))   # [2.2 0.6]", say: "Solve the normal equations $X^\\top X w = X^\\top y$: the same 2.2 and 0.6." },
      ],
    },
  },
};

/** Easy layer: Multiple Linear Regression. */
export const MULTIPLE: EasyTopic = {
  sections: {
    "Step 2: stack every row into a matrix": {
      examples: [
        {
          title: "One row of the product",
          blocks: [
            { p: "Person C's row is $(1, 3, 4)$. With $\\boldsymbol\\beta = (23.96, 3.96, 2.29)$: $23.96 + 3.96 \\times 3 + 2.29 \\times 4 = 23.96 + 11.88 + 9.16 = 45.0$. The actual salary is 45." },
          ],
        },
      ],
    },
    "Step 4: when the weights cannot be trusted": {
      examples: [
        {
          title: "VIF from R²",
          blocks: [
            { list: ["Projects regressed on experience gives $R^2 = 0.5$: VIF $= 1/(1 - 0.5) = 2$. Fine.", "Months regressed on experience gives $R^2 = 0.99$: VIF $= 1/0.01 = 100$. Its coefficient cannot be trusted on its own."] },
          ],
        },
      ],
    },
    "1.6.1 Design matrices make assumptions visible": {
      plain: "Every column you put in the design matrix is an assumption about how the target works. Squares and interactions are allowed: \"linear\" means linear in the weights.",
      examples: [
        {
          at: 2,
          title: "The dummy-variable trap",
          blocks: [
            { table: { head: ["Intercept", "office", "shop", "school"], rows: [["1", "1", "0", "0"], ["1", "0", "1", "0"], ["1", "0", "0", "1"]] } },
            { p: "office + shop + school always equals the intercept column, so the columns are dependent and $X^\\top X$ has no inverse. Drop one category (say school) and it becomes the baseline." },
          ],
        },
      ],
    },
    "1.6.2 Derive least squares and understand nonidentifiability": {
      plain: "The derivation sets the gradient of the squared error to zero. If a column is a combination of others, many weight vectors fit equally well, and no single answer can be called \"the\" coefficients.",
    },
    "1.6.4 Linear models connect tests, contrasts, and categorical effects": {
      plain: "Comparing group averages is a linear regression with a 0/1 group column: the intercept is group A's mean and the coefficient is the difference between groups.",
    },
  },
  code: {
    "In Python#0": {
      goal: "Get the same weights three ways: normal equation, lstsq and scikit-learn",
      walk: [
        { line: "A = np.c_[np.ones(len(X)), X]", say: "Design matrix with a column of 1s for the intercept." },
        { line: "beta = np.linalg.solve(A.T @ A, A.T @ y)          # solves (AᵀA)β = Aᵀy", say: "Solve the normal equations directly." },
        { line: "beta_lstsq, *_ = np.linalg.lstsq(A, y, rcond=None)", say: "The numerically safer solver: same answer without forming $A^\\top A$." },
        { line: "print(\"Xᵀ · residuals  :\", (A.T @ residuals).round(10))    # all 0: residuals ⟂ every column", say: "Residuals are perpendicular to every column: the defining property of least squares." },
      ],
    },
    "In Python#1": {
      goal: "Measure multicollinearity with the variance inflation factor",
      walk: [
        { line: "months = 12 * experience + rng.normal(0, 0.5, n)   # almost a copy of experience", say: "A feature that is nearly a copy of another." },
        { line: "r2 = LinearRegression().fit(others, X[:, j]).score(others, X[:, j])", say: "How well the other features predict feature $j$." },
        { line: "return 1 / (1 - r2)", say: "VIF: about 4,000 for the near-copies, 1 for the independent feature." },
      ],
    },
  },
};

/** Easy layer: Polynomial Regression. */
export const POLY: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Add $x^2$, $x^3$, … as extra columns and ordinary linear regression can fit curves. Each extra degree adds flexibility, which helps until it starts fitting noise.",
      examples: [
        {
          at: 0,
          title: "A curve a line cannot follow",
          blocks: [
            { p: "Crop yield (tonnes) at fertiliser 0, 1, 2, 3, 4 units: 2, 5, 6, 5, 2. A straight line through these is flat at 4 (slope 0), missing everything. The parabola $\\hat y = 2 + 4x - x^2$ hits all five points exactly: rises, peaks at $x = 2$, falls." },
          ],
        },
        {
          at: 2,
          title: "Why centring helps",
          blocks: [
            { p: "For $x = 1, 2, 3, 4, 5$, $x$ and $x^2$ have correlation 0.98: almost the same column. Centre first ($x - 3 = -2, -1, 0, 1, 2$) and the correlation between $(x-3)$ and $(x-3)^2$ becomes 0." },
          ],
        },
      ],
    },
    "The model": {
      examples: [
        {
          title: "Count the features",
          blocks: [
            { list: ["2 inputs, degree 2: $\\binom{4}{2} = 6$ terms ($1, x_1, x_2, x_1^2, x_1x_2, x_2^2$).", "5 inputs, degree 2: $\\binom{7}{2} = 21$.", "5 inputs, degree 4: $\\binom{9}{4} = 126$. With 100 rows, that is more columns than data."] },
          ],
        },
      ],
    },
    "Choosing the degree": {
      examples: [
        {
          title: "Reading cross-validation results",
          blocks: [
            { table: { head: ["Degree", "1", "2", "3", "5", "9"], rows: [["CV error", "7.19", "1.21", "1.24", "1.13", "1.33"]] } },
            { p: "Degree 1 is clearly too simple. Degrees 2, 3 and 5 are within noise of each other, so choose the simplest, degree 2 (which is the true shape of this data). Degree 9 starts to get worse." },
          ],
        },
      ],
    },
    "1.12.4 Polynomial features, interactions, and extrapolation": {
      plain: "An interaction term $x_1x_2$ lets the effect of one input depend on the other. Feature counts grow fast with degree, and polynomials behave badly outside the range they were fitted on.",
      replace: {
        1: { p: "For original numeric features $x_1$ and $x_2$, a degree-two model can use" },
        3: { p: "The prediction is quadratic in the original inputs but linear in the six parameters $\\theta$. If the target is building energy, the $x_1x_2$ term can express that the effect of opening hours depends on outdoor temperature. For a simpler interaction model $\\hat y = b_0 + b_1x_1 + b_2x_2 + b_3x_1x_2$, the marginal change for a small increase in $x_1$ at fixed $x_2$ is $\\partial\\hat y/\\partial x_1 = b_1 + b_3x_2$. Thus the hours effect is not a single global coefficient when $b_3$ is nonzero." },
        4: { p: "Count the dimensions before fitting. With $p$ original features, including intercept, all monomials through total degree two number $1 + p + p(p+1)/2$. For $p = 3$ this is $1 + 3 + 6 = 10$ columns; for $p = 100$ it is 5,151. More generally, the number through total degree $d$ is $\\binom{p+d}{d}$, including the constant. This combinatorial growth creates computation and overfitting risks. Design interactions using physical knowledge where possible and use suitable regularization and validation. A polynomial fitted in a narrow temperature range can produce implausible values well outside it; test the intended prediction range and communicate extrapolation limits." },
        6: { p: "Let $\\hat y = 2 + 3x_1 + 4x_2 + 5x_1x_2$. At $(x_1, x_2) = (1, 2)$ the terms are 2, 3, 8, 10 and the result is 23. Increase $x_1$ to 2 while keeping $x_2 = 2$: the result is $2 + 6 + 8 + 20 = 36$, an increase of 13. The derivative formula gives $3 + 5 \\times 2 = 13$. At $x_2 = 0$, increasing $x_1$ by one changes the prediction by only 3. The interaction does not mean either input literally causes the other; it specifies a conditional association in the fitted function." },
        9: { p: "**Worked exercise.** Suppose energy $\\hat y = 10 + 2h + 3t + 0.5ht$ for opening hours $h$ and temperature $t$. At $h = 8$, $t = 20$ the prediction is $10 + 16 + 60 + 80 = 166$. At $h = 9$, $t = 20$ the prediction rises by $2 + 0.5 \\times 20 = 12$. At $h = 8$, $t = 10$ the same additional opening hour raises it by 7. These are model-based comparisons at specified inputs, not causal effects proven by observational data." },
      },
    },
    "1.17.2 Bias, variance, and learning curves": {
      plain: "High error on training and validation means the model is too simple (bias). Low training error but high validation error suggests it memorised the training data (variance), or that the data shifted.",
      examples: [
        {
          at: 3,
          title: "Answer to the exercise",
          blocks: [
            { list: ["Model A (train 0.40, validation 0.43): both errors are similar and fairly high, so it may be underfitting. Try a richer model or better features and see if both drop.", "Model B (train 0.02, validation 0.50): a huge gap. Check for overfitting with a learning curve (does more data close the gap?), and check the split for leakage or a shift between periods."] },
          ],
        },
      ],
    },
  },
  code: {
    "1.12.4 Polynomial features, interactions, and extrapolation#0": {
      goal: "Build degree-2 features by hand and evaluate an interaction model",
      code: r`def degree_two_features(row):
    p = len(row)
    return ([1.0] + list(row)
            + [row[i] * row[j] for i in range(p)
               for j in range(i, p)])


assert degree_two_features([2, 3]) == [1.0, 2, 3, 4, 6, 9]
assert len(degree_two_features([1, 2, 3])) == 10
def interaction_forecast(x1, x2):
    return 2 + 3*x1 + 4*x2 + 5*x1*x2

assert interaction_forecast(1, 2) == 23
assert interaction_forecast(2, 2) == 36
assert interaction_forecast(2, 0)-interaction_forecast(1, 0) == 3
print("degree-2 features of [2, 3]:", degree_two_features([2, 3]))
print("forecast at (1, 2):", interaction_forecast(1, 2), "| at (2, 2):", interaction_forecast(2, 2))

# Output:
# degree-2 features of [2, 3]: [1.0, 2, 3, 4, 6, 9]
# forecast at (1, 2): 23 | at (2, 2): 36`,
      walk: [
        { line: "return ([1.0] + list(row)", say: "Start with the constant and the original features." },
        { line: "+ [row[i] * row[j] for i in range(p)", say: "Add every product $x_ix_j$ with $i \\le j$: squares and interactions." },
        { line: "return 2 + 3*x1 + 4*x2 + 5*x1*x2", say: "An interaction model: the effect of $x_1$ is $3 + 5x_2$, so it depends on $x_2$." },
      ],
    },
    "In Python#0": {
      goal: "Choose the polynomial degree with cross-validation",
      code: r`import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, cross_val_score

rng = np.random.default_rng(0)
X = rng.uniform(-3, 3, (60, 1))
y = 1 + 0.5 * X[:, 0] - 0.8 * X[:, 0] ** 2 + rng.normal(0, 1, 60)   # the truth is a parabola

cv = KFold(5, shuffle=True, random_state=0)
for degree in [1, 2, 3, 5, 9]:
    model = make_pipeline(PolynomialFeatures(degree, include_bias=False),
                          StandardScaler(), LinearRegression())
    score = cross_val_score(model, X, y, cv=cv, scoring="neg_mean_squared_error").mean()
    print(f"degree {degree}: cross-validated MSE = {-score:.3f}")

# Output:
# degree 1: cross-validated MSE = 7.191
# degree 2: cross-validated MSE = 1.205
# degree 3: cross-validated MSE = 1.235
# degree 5: cross-validated MSE = 1.125
# degree 9: cross-validated MSE = 1.325`,
      walk: [
        { line: "y = 1 + 0.5 * X[:, 0] - 0.8 * X[:, 0] ** 2 + rng.normal(0, 1, 60)   # the truth is a parabola", say: "Data from a known parabola plus noise, so we know degree 2 is right." },
        { line: "model = make_pipeline(PolynomialFeatures(degree, include_bias=False),", say: "Expand the features, scale them, then fit ordinary least squares." },
        { line: "score = cross_val_score(model, X, y, cv=cv, scoring=\"neg_mean_squared_error\").mean()", say: "5-fold cross-validated error (scikit-learn reports it negated, so higher is better)." },
      ],
    },
  },
};

/** Easy layer: Regression Diagnostics. */
export const DIAGNOSTICS: EasyTopic = {
  sections: {
    "Outliers, leverage and influence": {
      examples: [
        {
          title: "One far-out point drags the line",
          blocks: [
            { p: "Five points near $y = 2x$ plus one at $x = 12$, $y = 14$ (the trend would say 24). That point has leverage 0.89 (the average is $2/6 = 0.33$) and Cook's distance 16, far above 1. With it the fitted slope is 1.03; without it, 1.99. One point changed the slope by half." },
          ],
        },
      ],
      code: [
        {
          goal: "Compute leverage and Cook's distance to find influential points",
          code: r`import numpy as np

x = np.array([1., 2., 3., 4., 5., 12.])          # the last point is far out (high leverage)
y = np.array([2.1, 3.9, 6.2, 7.8, 10.1, 14.0])   # ...and below the trend of the others
X = np.c_[np.ones(len(x)), x]

beta = np.linalg.lstsq(X, y, rcond=None)[0]
resid = y - X @ beta
H = X @ np.linalg.inv(X.T @ X) @ X.T             # hat matrix: y_hat = H y
leverage = np.diag(H)
p = X.shape[1]
s2 = resid @ resid / (len(x) - p)                # residual variance
cooks = resid ** 2 / (p * s2) * leverage / (1 - leverage) ** 2

print("fitted line: y =", beta.round(3))
for xi, h, d in zip(x, leverage, cooks):
    flag = "  <- influential" if d > 1 else ""
    print(f"x = {xi:>4}: leverage {h:.3f}, Cook's distance {d:.3f}{flag}")
beta_without = np.linalg.lstsq(X[:-1], y[:-1], rcond=None)[0]
print("line without the last point:", beta_without.round(3))

# Output:
# fitted line: y = [2.719 1.029]
# x =  1.0: leverage 0.325, Cook's distance 0.361
# x =  2.0: leverage 0.247, Cook's distance 0.063
# x =  3.0: leverage 0.196, Cook's distance 0.009
# x =  4.0: leverage 0.170, Cook's distance 0.043
# x =  5.0: leverage 0.170, Cook's distance 0.230
# x = 12.0: leverage 0.892, Cook's distance 16.434  <- influential
# line without the last point: [0.05 1.99]`,
          walk: [
            { line: "H = X @ np.linalg.inv(X.T @ X) @ X.T             # hat matrix: y_hat = H y", say: "The hat matrix turns actual values into fitted values." },
            { line: "leverage = np.diag(H)", say: "Leverage: how unusual each row's inputs are. The point at $x = 12$ scores 0.89." },
            { line: "cooks = resid ** 2 / (p * s2) * leverage / (1 - leverage) ** 2", say: "Cook's distance combines residual size and leverage: how much the fit would move without this point." },
            { line: "beta_without = np.linalg.lstsq(X[:-1], y[:-1], rcond=None)[0]", say: "Refit without the point to see its effect directly." },
          ],
        },
      ],
    },
    "1.6.3 Error assumptions, intervals, and goodness of fit": {
      plain: "Least squares gives sensible predictions without assuming normal errors. Confidence intervals and p-values need extra assumptions, and a prediction interval for one new value is always wider than a confidence interval for the average.",
      examples: [
        {
          at: 4,
          title: "Confidence versus prediction interval",
          blocks: [
            { p: "Mean estimate 10 with standard deviation 1; individual noise standard deviation 3. Combined: $\\sqrt{1^2 + 3^2} = 3.16$. A rough 95% confidence interval for the average is $10 \\pm 2$; for a single new value it is $10 \\pm 6.3$." },
          ],
        },
      ],
    },
    "1.6.6 Read residual diagnostics without mistaking fit for validity": {
      plain: "Residual plots tell you whether the model fits the training data well. Whether it will work on new data is a separate question, answered by a held-out test.",
    },
    "1.2.5 Regularization, generalization, and evaluation": {
      plain: "Penalties on large weights stop a model chasing noise. Every preparation step must be fitted inside each cross-validation fold, or the validation score is too optimistic.",
      replace: {
        3: { math: r`J_{\text{ridge}}(b) = \sum_i \big(y_i - x_i^\top b\big)^2 + \lambda\sum_{j \ge 1} b_j^2` },
        4: { p: "The intercept is commonly excluded from the penalty. Increasing $\\lambda$ discourages large fitted coefficients. Lasso uses $\\lambda\\sum_{j \\ge 1}|b_j|$, which can produce exact zeros; elastic net combines L1 and L2 terms. The coefficient scale depends on feature units, so standardize relevant numeric features inside a training-only pipeline before comparing penalty strengths." },
      },
      examples: [
        {
          at: 8,
          kind: "idea",
          title: "How a global median leaks",
          blocks: [
            { p: "Fill missing temperatures with the median of **all** rows, then cross-validate: each validation fold has helped choose the fill value. Correct: inside each fold, compute the median from the training part only and apply it to the validation part. A pipeline does this automatically." },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Spot a missing curve from residual averages",
      walk: [
        { line: "y = 3 + 0.5 * x[:, 0] ** 2 + rng.normal(0, 2, 200)    # the truth is curved", say: "Data from a curve, so a straight line should leave a pattern." },
        { line: "third = np.array_split(np.argsort(pred), 3)", say: "Sort rows by prediction and cut them into thirds." },
        { line: "residual_report(np.c_[x, x ** 2], y, \"with x² term\")", say: "With $x^2$ added, residual means in all thirds are near 0: the pattern is gone." },
      ],
    },
  },
};

/** Easy layer: Regression Metrics. */
export const METRICS: EasyTopic = {
  sections: {
    "Textbook case: Regression Error, Targets, and Model Comparison": {
      plain: "Predicting device requests per region: choose a metric that matches the cost of mistakes, and always compare against a simple baseline.",
    },
    "1.16.1 Define the evaluation population before an error": {
      plain: "Decide what you are averaging over (regions? devices? weeks?) before computing an error. Different averages answer different questions.",
      examples: [
        {
          at: 1,
          title: "Per region or per device?",
          blocks: [
            { p: "Region A (10 devices) has error 2; region B (1,000 devices) has error 50. Average per region: $(2 + 50)/2 = 26$. Weighted by devices: $(10 \\times 2 + 1000 \\times 50)/1010 = 49.5$. Both are correct; say which one you report." },
          ],
        },
      ],
    },
    "1.16.2 Derive MAE and MSE from residuals": {
      plain: "MAE averages the sizes of the misses; MSE averages their squares, so one big miss can dominate it.",
      replace: {
        "0.d.1": { p: "Consider four invented actual values $(10, 20, 30, 40)$ and predictions $(11, 18, 28, 47)$. The residuals are $(-1, 2, 2, -7)$, absolute errors $(1, 2, 2, 7)$ and squared errors $(1, 4, 4, 49)$. Thus MAE $= 12/4 = 3$, MSE $= 58/4 = 14.5$ and RMSE $\\approx 3.808$. Mean signed error is $-4/4 = -1$: the model overpredicts on average under this residual convention. A single seven-device miss contributes $49/58$ of the total squared-error sum, so RMSE emphasizes it. Replacing only that prediction with 41 changes the residual to $-1$, MAE to 1.5 and RMSE to $\\sqrt{10/4} \\approx 1.581$. The choice of metric can reverse model rankings if one model has many small misses and the other has rare large misses." },
      },
    },
    "1.16.3 Compare a model to an explicit baseline": {
      plain: "$R^2$ compares your squared error with that of always predicting the average. It can be negative on new data, and a high $R^2$ does not mean every prediction is close.",
    },
    "1.16.4 Adjusted R-squared and model complexity": {
      plain: "Adjusted $R^2$ charges for every extra feature, so a feature has to improve the fit enough to pay for itself. It is still a training-data number.",
    },
    "1.16.5 Percentage errors require a defensible denominator": {
      plain: "Percentage errors divide by the actual value, so they explode when actual values are small. Weighted versions divide total error by total actual.",
      examples: [
        {
          at: 1,
          title: "MAPE versus WAPE",
          blocks: [
            { p: "Actual (1, 1000), predicted (2, 990). MAPE $= (100\\% + 1\\%)/2 = 50.5\\%$, dominated by a one-unit miss. WAPE $= (1 + 10)/(1 + 1000) = 1.1\\%$. If big regions matter most, WAPE reflects the business better." },
          ],
        },
      ],
    },
    "1.16.6 Validate with one reusable calculation": {
      plain: "The code repeats every hand calculation above, so a mistake in either would show up.",
    },
  },
  code: {
    "1.16.6 Validate with one reusable calculation#0": {
      goal: "Compute MAE, MSE, RMSE, R² and adjusted R² and check them",
      code: r`import numpy as np

actual=np.array([10.,20.,30.,40.])
pred=np.array([11.,18.,28.,47.])
resid=actual-pred
mae=np.mean(np.abs(resid))
mse=np.mean(resid**2)
rmse=np.sqrt(mse)
r2=1-np.sum(resid**2)/np.sum((actual-actual.mean())**2)
assert np.isclose(mae,3.)
assert np.isclose(mse,14.5)
assert np.isclose(rmse,np.sqrt(14.5))
assert np.isclose(r2,.884)
assert np.isclose(resid.mean(),-1.)
assert mae<=rmse
p=4;n=100;train_r2=.8
adjusted=1-(1-train_r2)*(n-1)/(n-p-1)
assert np.isclose(adjusted,1-.2*99/95)
print(f"MAE {mae:.3f} | MSE {mse:.3f} | RMSE {rmse:.3f} | R^2 {r2:.3f} | mean residual {resid.mean():.1f}")
print(f"adjusted R^2 (n=100, p=4, R^2=0.8): {adjusted:.4f}")

# Output:
# MAE 3.000 | MSE 14.500 | RMSE 3.808 | R^2 0.884 | mean residual -1.0
# adjusted R^2 (n=100, p=4, R^2=0.8): 0.7916`,
      walk: [
        { line: "resid=actual-pred", say: "Residuals: actual minus predicted." },
        { line: "r2=1-np.sum(resid**2)/np.sum((actual-actual.mean())**2)", say: "$R^2 = 1 - \\text{SSE}/\\text{SST} = 1 - 58/500 = 0.884$." },
        { line: "adjusted=1-(1-train_r2)*(n-1)/(n-p-1)", say: "Adjusted $R^2$ for $n = 100$, $p = 4$." },
      ],
    },
    "In Python#0": {
      goal: "All the common regression metrics, plus a baseline",
      walk: [
        { line: "mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100", say: "MAPE by hand: average of absolute errors divided by actual values." },
        { line: "adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)", say: "Adjusted $R^2$ with one feature." },
        { line: "baseline = np.full_like(y_true, y_true.mean(), dtype=float)", say: "The baseline that always predicts the mean. Its $R^2$ is exactly 0 and its MAE is 60." },
      ],
    },
  },
};

/** Easy layer: Regularization. */
export const REGULARIZATION: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Regularisation adds a price for large weights. The model only keeps a big weight if it buys a real drop in error. $\\lambda$ sets the price.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Fragile weights",
          blocks: [
            { p: "Two nearly identical features. Weights $(+500, -498)$ fit the training data perfectly, but a tiny difference between the two features gets multiplied by 500, so predictions swing wildly. Weights $(1, 1)$ fit almost as well and are calm. Ridge prefers $(1, 1)$ because $1^2 + 1^2 = 2$ is far cheaper than $500^2 + 498^2$." },
          ],
        },
        {
          at: 5,
          title: "Why scaling first matters",
          blocks: [
            { p: "Income in rupees needs a weight like 0.00002; the same income in lakhs needs 2. Ridge would barely penalise the first and heavily penalise the second, even though they carry the same information. Standardising puts every feature on the same footing." },
          ],
        },
      ],
    },
    "The losses": {
      examples: [
        {
          title: "Three penalties for the same weights",
          blocks: [
            { p: "Weights $(3, -1, 0)$, $\\lambda = 0.5$." },
            { list: ["Ridge: $0.5 \\times (9 + 1 + 0) = 5$.", "Lasso: $0.5 \\times (3 + 1 + 0) = 2$.", "Elastic net with $\\alpha = 0.5$: $0.5 \\times (0.5 \\times 4 + 0.5 \\times 10) = 3.5$."] },
          ],
        },
      ],
    },
    "The regularisation path": {
      examples: [
        {
          title: "Lasso dropping features one by one",
          blocks: [
            { p: "One-feature lasso with $q = 2$, $z = 3$: $\\lambda = 0, 1, 2, 3, 4$ gives coefficients $1.5, 1.0, 0.5, 0, 0$. The coefficient shrinks by $\\lambda/q$ each time and hits exactly 0 once $\\lambda \\ge |z|$." },
          ],
        },
      ],
    },
    "1.12.1 Ridge regression: normal equations, uniqueness, and spectral shrinkage": {
      plain: "Ridge adds $\\lambda$ to the diagonal of $X^\\top X$, which always makes it invertible. The result: one unique, smaller set of weights even when features duplicate each other.",
      replace: {
        "0.d.0": { p: "Ordinary least squares seeks $\\beta$ minimizing $\\lVert y - X\\beta\\rVert_2^2$. Ridge adds a nonnegative quadratic penalty. In the convention used here," },
        "0.d.6": { p: "For $\\lambda > 0$ and a penalty on all $p$ coefficients in this centered representation, $X^\\top X + \\lambda I_p$ is positive definite: for a nonzero vector $v$, $v^\\top(X^\\top X + \\lambda I)v = \\lVert Xv\\rVert^2 + \\lambda\\lVert v\\rVert^2 > 0$. Consequently there is one minimizing coefficient vector even when $X$ has linearly dependent columns. At $\\lambda = 0$, a singular $X^\\top X$ can have multiple least-squares coefficient solutions, although their fitted training predictions can still agree. In numerical work, solve the linear system with a stable factorization; forming a matrix inverse explicitly is unnecessary and often less reliable." },
        "0.d.7": { p: "An intercept should usually be unpenalized. If design matrix $Z$ contains a leading all-ones column, use a penalty matrix $P = \\operatorname{diag}(0, 1, \\dots, 1)$, producing $(Z^\\top Z + \\lambda P)\\theta = Z^\\top y$. Because this matrix need not be positive definite merely from $\\lambda > 0$ in every degenerate design, the clean uniqueness statement above applies directly to the centered, intercept-free coefficient problem. In practice, compute training means, center inputs and target, fit $\\beta$, then recover $b_0 = \\bar y - \\sum_j \\beta_j \\bar x_j$. Use the same centers and scales at evaluation time." },
        2: { p: "Consider three centered rows $x_1 = (-1, 1)$, $x_2 = (0, 0)$, $x_3 = (1, -1)$ and targets $(-2, 0, 2)$. The second column is the negative of the first, so infinitely many unpenalized pairs $(\\beta_1, \\beta_2)$ with $\\beta_1 - \\beta_2 = 2$ fit perfectly. Specifically:" },
      },
    },
    "1.12.2 Lasso: subgradients, zeros, and coordinate updates": {
      plain: "Lasso's absolute-value penalty has a sharp corner at zero, so a weight can land exactly on zero. The update is \"soft thresholding\": shrink towards zero by $\\lambda$, and stop at zero.",
      replace: {
        3: { p: "The factor 1/2 is chosen so differentiating squared error does not introduce a factor two; compare implementations only after checking this convention. At $\\beta_j = 0$, $|\\beta_j|$ does not have one ordinary derivative. Its subgradients fill $[-1, 1]$. This interval means the optimum can satisfy a first-order condition at zero for a range of data correlations, which explains exact sparsity." },
        4: { p: "Suppose one centered feature has $q = \\sum_i x_i^2 > 0$ and $z = \\sum_i x_i y_i$. Up to constants not depending on $\\beta$, the objective is $q\\beta^2/2 - z\\beta + \\lambda|\\beta|$. For $\\beta > 0$, the derivative $q\\beta - z + \\lambda$ gives $\\beta = (z - \\lambda)/q$, valid only when $z > \\lambda$. For $\\beta < 0$, the derivative $q\\beta - z - \\lambda$ gives $\\beta = (z + \\lambda)/q$, valid only when $z < -\\lambda$. At zero, a subgradient exists that satisfies $-z + \\lambda s = 0$ for some $s \\in [-1, 1]$ precisely when $|z| \\le \\lambda$. Combining the three cases yields" },
        6: { p: "For $q = 2$, $z = 4$, $\\lambda = 1$: $\\beta = (4 - 1)/2 = 1.5$. If $z = 0.5$ at the same $\\lambda$, the optimum is zero. The threshold is on the correlation with the current residual, not a claim that a zeroed feature is scientifically irrelevant." },
        7: { p: "For many correlated features, a coordinate-descent algorithm updates one $\\beta_j$ while holding the others fixed. Define the partial residual $r_i^{(j)} = y_i - \\sum_{l \\ne j} x_{il}\\beta_l$. Then $z_j = \\sum_i x_{ij} r_i^{(j)}$, $q_j = \\sum_i x_{ij}^2$, and $\\beta_j \\leftarrow S(z_j, \\lambda)/q_j$. Iterate until a convergence criterion is met. The objective is convex, but coefficients can be nonunique under collinearity, and stopping tolerance matters. When two building features carry nearly identical information, lasso may keep one and zero the other; which one is selected can change under a modest dataset perturbation. Examine predictive stability as well as selected names." },
        12: { p: "**Worked exercise.** With $q = 2$, $z = -3$ and $\\lambda = 1$, the negative-branch solution is $(-3 + 1)/2 = -1$. Its sign matches the data association. At $\\lambda = 3$ it becomes zero, including the boundary case $|z| = \\lambda$. If the same feature is rescaled, $q$ and $z$ change, so tune the penalty after defining a consistent feature representation." },
      },
      examples: [
        {
          at: 6,
          title: "Soft thresholding as a picture in numbers",
          blocks: [
            { table: { head: ["$z$", "−5", "−2", "−1", "0", "1", "2", "5"], rows: [["$S(z, 2)$", "−3", "0", "0", "0", "0", "0", "3"]] } },
            { p: "Everything within 2 of zero is set to exactly 0; everything else is pulled 2 closer to zero." },
          ],
        },
      ],
    },
    "1.12.3 Elastic net and validation of penalty strength": {
      plain: "Elastic net mixes both penalties: L1 can zero out weights, L2 shares weight between correlated features. Choose the strength with validation that matches how the model will be used.",
      replace: {
        3: { p: "with $\\lambda_1, \\lambda_2 \\ge 0$. For a single coordinate with partial-residual correlation $z$ and $q = \\sum_i x_i^2$, the coordinate objective is $(q + \\lambda_2)\\beta^2/2 - z\\beta + \\lambda_1|\\beta|$. Using the same sign and zero-subgradient reasoning as lasso gives" },
        5: { p: "The L1 term can set coefficients exactly to zero, while L2 smoothly shrinks those that remain and can help with correlated predictors. At $q = 2$, $z = 4$, $\\lambda_1 = 1$, $\\lambda_2 = 1$, the coordinate update is $(4 - 1)/(2 + 1) = 1$. Some APIs instead parameterize an overall strength and an L1 fraction; identical parameter names need not mean identical objectives. Always write down the implemented objective before comparing strengths or explaining the meaning of a fitted coefficient." },
      },
    },
    "1.12.5 Penalized logistic regression, intercepts, and probability quality": {
      plain: "The same penalties work for logistic regression. Compute the loss in a numerically safe way, and remember that two models can rank cases identically yet give very different probabilities.",
      replace: {
        "0.d.0": { p: "For binary label $y_i \\in \\{0, 1\\}$, let $z_i = b_0 + \\beta^\\top x_i$ and $p_i = 1/(1 + e^{-z_i})$. The mean negative Bernoulli log likelihood with L2 penalty is" },
        2: { p: "Computing $\\log(1 + e^z)$ directly can overflow when $z$ is large. The identity $\\log(1 + e^z) = \\max(0, z) + \\log(1 + e^{-|z|})$ yields a numerically safer negative log likelihood $\\log(1 + e^z) - yz$. The function below evaluates that loss and the corresponding gradient for a small numeric dataset; it assumes features have already been prepared using training-only transformations." },
      },
      examples: [
        {
          at: 2,
          title: "Why the safe formula matters",
          blocks: [
            { p: "At $z = 800$, `math.exp(800)` overflows and the program crashes. The safe form computes $\\max(0, 800) + \\log(1 + e^{-800}) = 800 + 0 = 800$ with no problem." },
          ],
        },
      ],
    },
    "1.13.3 Derive ridge regression and interpret the penalty": {
      plain: "Setting the gradient of the ridge loss to zero gives $(X^\\top X + \\lambda I)\\beta = X^\\top y$. Open the derivation for the steps.",
    },
    "1.13.4 Why lasso can select features and elastic net can share effects": {
      plain: "With one feature, lasso's answer is ordinary least squares shrunk towards zero and cut off at zero. Which feature lasso keeps among near-duplicates can flip from sample to sample.",
    },
  },
  code: {
    "1.12.1 Ridge regression: normal equations, uniqueness, and spectral shrinkage#0": {
      goal: "Solve two-feature ridge regression by hand",
      code: r`import math


def ridge_two_features(centered_rows, centered_targets, strength):
    if (not centered_rows or len(centered_rows) != len(centered_targets)
            or not math.isfinite(strength) or strength <= 0):
        raise ValueError("Need matching centered rows and positive strength")
    if any(len(row) != 2 or any(not math.isfinite(v) for v in row)
           for row in centered_rows):
        raise ValueError("Need finite rows with exactly two features")
    if any(not math.isfinite(y) for y in centered_targets):
        raise ValueError("Targets must be finite")
    a = sum(x1*x1 for x1, _ in centered_rows) + strength
    c = sum(x2*x2 for _, x2 in centered_rows) + strength
    b = sum(x1*x2 for x1, x2 in centered_rows)
    u = sum(x1*y for (x1, _), y in zip(centered_rows, centered_targets))
    v = sum(x2*y for (_, x2), y in zip(centered_rows, centered_targets))
    det = a*c - b*b
    return ((u*c-b*v)/det, (a*v-b*u)/det)


rows = [(-1, 1), (0, 0), (1, -1)]
targets = [-2, 0, 2]
fit = ridge_two_features(rows, targets, 2)
assert all(abs(a-b) < 1e-12 for a, b in zip(fit, (2/3, -2/3)))
assert abs(sum(x*b for x, b in zip(rows[-1], fit)) - 4/3) < 1e-12
print("ridge coefficients:", tuple(round(b, 4) for b in fit))

# Output:
# ridge coefficients: (0.6667, -0.6667)`,
      walk: [
        { line: "a = sum(x1*x1 for x1, _ in centered_rows) + strength", say: "Top-left of $X^\\top X + \\lambda I$: sum of squares of feature 1, plus $\\lambda$." },
        { line: "b = sum(x1*x2 for x1, x2 in centered_rows)", say: "Off-diagonal: how the two features move together." },
        { line: "det = a*c - b*b", say: "The determinant. Thanks to $\\lambda$ it is positive even though the features are exact opposites." },
        { line: "return ((u*c-b*v)/det, (a*v-b*u)/det)", say: "Solve the 2 × 2 system with the inverse formula: $(2/3, -2/3)$." },
      ],
    },
    "1.12.2 Lasso: subgradients, zeros, and coordinate updates#0": {
      goal: "Lasso by coordinate descent with soft thresholding",
      code: r`import math


def soft_threshold(value, penalty):
    return math.copysign(max(abs(value) - penalty, 0.0), value)


def lasso_centered(rows, targets, penalty, *, max_sweeps=1000, tol=1e-10):
    if (not rows or len(rows) != len(targets) or not math.isfinite(penalty)
            or penalty < 0 or not isinstance(max_sweeps, int)
            or max_sweeps < 1 or not math.isfinite(tol) or tol < 0):
        raise ValueError("Need matching data and a nonnegative penalty")
    p = len(rows[0])
    if not p or any(len(row) != p for row in rows):
        raise ValueError("Need rectangular rows")
    if (any(not math.isfinite(v) for row in rows for v in row)
            or any(not math.isfinite(y) for y in targets)):
        raise ValueError("Need finite numeric values")
    coefficients = [0.0] * p
    norms = [sum(row[j]**2 for row in rows) for j in range(p)]
    for _ in range(max_sweeps):
        maximum_change = 0.0
        for j in range(p):
            if norms[j] == 0:
                continue  # A constant centered column carries no information.
            z = sum(row[j] * (y - sum(row[l] * coefficients[l]
                                       for l in range(p) if l != j))
                    for row, y in zip(rows, targets))
            updated = soft_threshold(z, penalty) / norms[j]
            maximum_change = max(maximum_change,
                                 abs(updated - coefficients[j]))
            coefficients[j] = updated
        if maximum_change <= tol:
            break
    return coefficients


one_column = [(-1,), (0,), (1,)]
assert abs(lasso_centered(one_column, [-2, 0, 2], 1)[0] - 1.5) < 1e-12
assert lasso_centered(one_column, [-2, 0, 2], 4)[0] == 0.0
print("lambda=1:", lasso_centered(one_column, [-2, 0, 2], 1), "| lambda=4:", lasso_centered(one_column, [-2, 0, 2], 4))

# Output:
# lambda=1: [1.5] | lambda=4: [0.0]`,
      walk: [
        { line: "return math.copysign(max(abs(value) - penalty, 0.0), value)", say: "Soft thresholding: shrink towards 0 by the penalty and stop at 0." },
        { line: "z = sum(row[j] * (y - sum(row[l] * coefficients[l]", say: "Correlation of feature $j$ with what the other features have not yet explained (the partial residual)." },
        { line: "updated = soft_threshold(z, penalty) / norms[j]", say: "The lasso update for one coordinate." },
        { line: "if maximum_change <= tol:", say: "Stop when no coefficient moved by more than the tolerance in a full sweep." },
      ],
    },
    "1.12.5 Penalized logistic regression, intercepts, and probability quality#0": {
      goal: "A numerically safe penalised logistic loss and its gradient",
      code: r`import math


def sigmoid(z):
    if z >= 0:
        return 1 / (1 + math.exp(-z))
    e = math.exp(z)
    return e / (1 + e)


def regularized_logistic(rows, labels, intercept, coefficients, strength):
    n = len(rows)
    if (n == 0 or n != len(labels) or len(coefficients) != len(rows[0])
            or strength < 0 or not math.isfinite(strength)
            or not math.isfinite(intercept)
            or any(not math.isfinite(b) for b in coefficients)):
        raise ValueError("Invalid data shape or penalty")
    p = len(coefficients)
    if (any(len(row) != p or any(not math.isfinite(x) for x in row)
            for row in rows) or any(y not in (0, 1) for y in labels)):
        raise ValueError("Need finite rows and binary labels")
    loss = strength * sum(b*b for b in coefficients) / 2
    grad0 = 0.0
    grad = [strength * b for b in coefficients]
    for row, y in zip(rows, labels):
        z = intercept + sum(b*x for b, x in zip(coefficients, row))
        loss += (max(0.0, z) + math.log1p(math.exp(-abs(z))) - y*z) / n
        residual = (sigmoid(z) - y) / n
        grad0 += residual
        for j in range(p):
            grad[j] += residual * row[j]
    return loss, (grad0, grad)


inputs = [(0., 1.), (1., 0.), (2., 1.)]
labels = [0, 0, 1]
value, (g0, g) = regularized_logistic(inputs, labels, 0., [0., 0.], 1.)
assert abs(value - math.log(2)) < 1e-12
assert abs(g0 - 1/6) < 1e-12
assert abs(g[0] + 1/6) < 1e-12
assert abs(g[1] - 0.0) < 1e-12
print("loss:", round(value, 4), "(= log 2)", "| intercept gradient:", round(g0, 4), "| feature gradients:", [round(v, 4) for v in g])

# Output:
# loss: 0.6931 (= log 2) | intercept gradient: 0.1667 | feature gradients: [-0.1667, 0.0]`,
      walk: [
        { line: "e = math.exp(z)", say: "For negative $z$, compute the sigmoid as $e^z/(1 + e^z)$ so nothing overflows." },
        { line: "loss += (max(0.0, z) + math.log1p(math.exp(-abs(z))) - y*z) / n", say: "The safe form of the log loss for one row." },
        { line: "residual = (sigmoid(z) - y) / n", say: "Predicted probability minus label: the core of the logistic gradient." },
        { line: "grad = [strength * b for b in coefficients]", say: "The L2 penalty adds $\\lambda\\beta$ to each coefficient's gradient (the intercept is not penalised)." },
      ],
    },
    "1.13.4 Why lasso can select features and elastic net can share effects#0": {
      goal: "One-feature lasso across several penalty strengths",
      code: r`def soft_threshold(c, lam):
    return (1 if c > 0 else -1 if c < 0 else 0) * max(abs(c) - lam, 0.0)

def one_feature_lasso(c, d, lam):
    if d <= 0 or lam < 0:
        raise ValueError('d must be positive and lambda nonnegative')
    return soft_threshold(c, lam) / d

assert one_feature_lasso(3, 2, 1) == 1
assert one_feature_lasso(3, 2, 4) == 0
assert one_feature_lasso(-3, 2, 1) == -1
print([one_feature_lasso(3, 2, lam) for lam in (0, 1, 2, 3, 4)], "for lambda = 0, 1, 2, 3, 4")

# Output:
# [1.5, 1.0, 0.5, 0.0, 0.0] for lambda = 0, 1, 2, 3, 4`,
      walk: [
        { line: "return (1 if c > 0 else -1 if c < 0 else 0) * max(abs(c) - lam, 0.0)", say: "Soft thresholding written out." },
        { line: "return soft_threshold(c, lam) / d", say: "Divide by the feature's sum of squares to get the coefficient." },
      ],
    },
    "In Python#0": {
      goal: "Ridge and lasso with cross-validated penalty on a real dataset",
      code: r`import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.linear_model import RidgeCV, LassoCV, LinearRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True)                # 442 patients, 10 measurements
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)

alphas = np.logspace(-3, 2, 30)                      # scikit-learn calls the penalty strength "alpha"
ols = make_pipeline(StandardScaler(), LinearRegression()).fit(X_train, y_train)
ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=alphas)).fit(X_train, y_train)
lasso = make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5)).fit(X_train, y_train)

for name, m in [("plain OLS", ols), ("ridge", ridge), ("lasso", lasso)]:
    print(f"{name:<9} test R^2 = {m.score(X_test, y_test):.3f}")
print("ridge chose alpha =", round(ridge[-1].alpha_, 3), "| lasso chose alpha =", round(lasso[-1].alpha_, 3))
print("lasso set", int((lasso[-1].coef_ == 0).sum()), "of 10 coefficients exactly to zero")

# Output:
# plain OLS test R^2 = 0.359
# ridge     test R^2 = 0.362
# lasso     test R^2 = 0.356
# ridge chose alpha = 20.434 | lasso chose alpha = 1.887
# lasso set 3 of 10 coefficients exactly to zero`,
      walk: [
        { line: "X, y = load_diabetes(return_X_y=True)                # 442 patients, 10 measurements", say: "A dataset that ships with scikit-learn: disease progression from 10 measurements." },
        { line: "ridge = make_pipeline(StandardScaler(), RidgeCV(alphas=alphas)).fit(X_train, y_train)", say: "Scale first, then let `RidgeCV` pick the best penalty from 30 candidates." },
        { line: "lasso = make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5)).fit(X_train, y_train)", say: "The same for lasso, with 5-fold cross-validation." },
        { line: "print(\"lasso set\", int((lasso[-1].coef_ == 0).sum()), \"of 10 coefficients exactly to zero\")", say: "Lasso dropped 3 features with almost no loss in test $R^2$: a simpler model for free." },
      ],
    },
  },
};

/** Easy layer: Regression Trees & KNN Regression. */
export const TREE_KNN: EasyTopic = {
  sections: {
    "Step 2: choose the split that reduces error most": {
      code: [
        {
          goal: "Find the best regression-tree split by trying every threshold",
          code: r`x = [1, 2, 3, 4, 5, 6]
y = [5, 6, 5, 12, 13, 14]

def sse(values):
    if not values:
        return 0.0
    m = sum(values) / len(values)
    return sum((v - m) ** 2 for v in values)          # squared error around the leaf mean

best = None
for i in range(1, len(x)):
    threshold = (x[i - 1] + x[i]) / 2                # midpoint between neighbouring x values
    left = [yi for xi, yi in zip(x, y) if xi < threshold]
    right = [yi for xi, yi in zip(x, y) if xi >= threshold]
    total = sse(left) + sse(right)
    print(f"split at {threshold}: SSE = {sse(left):.2f} + {sse(right):.2f} = {total:.2f}")
    if best is None or total < best[1]:
        best = (threshold, total, left, right)

t, total, left, right = best
print(f"best split x < {t}: left leaf predicts {sum(left) / len(left):.3f}, right leaf predicts {sum(right) / len(right):.3f}")

# Output:
# split at 1.5: SSE = 0.00 + 70.00 = 70.00
# split at 2.5: SSE = 0.50 + 50.00 = 50.50
# split at 3.5: SSE = 0.67 + 2.00 = 2.67
# split at 4.5: SSE = 34.00 + 0.50 = 34.50
# split at 5.5: SSE = 62.80 + 0.00 = 62.80
# best split x < 3.5: left leaf predicts 5.333, right leaf predicts 13.000`,
          walk: [
            { line: "return sum((v - m) ** 2 for v in values)          # squared error around the leaf mean", say: "A leaf predicts its mean; its cost is the squared error around that mean." },
            { line: "threshold = (x[i - 1] + x[i]) / 2                # midpoint between neighbouring x values", say: "Candidate thresholds sit halfway between neighbouring $x$ values." },
            { line: "total = sse(left) + sse(right)", say: "Score a split by the total error of its two leaves." },
            { line: "if best is None or total < best[1]:", say: "Keep the threshold with the smallest total: 3.5, where the jump in the data is." },
          ],
        },
      ],
    },
    "2.9.2 K-nearest neighbors regression and local averaging": {
      plain: "KNN regression averages the targets of the $k$ closest training rows. Weighting by inverse distance lets closer neighbours count more.",
      replace: {
        0: { p: "KNN regression replaces voting with an aggregation of numeric outcomes from the nearest eligible rows. With uniform weights, $\\hat y(x) = \\frac{1}{k}\\sum_{i \\in N_k(x)} y_i$. With positive weights $w_i$, $\\hat y(x) = \\sum_i w_iy_i/\\sum_i w_i$. For inverse distance $w_i = 1/d_i$, exact matches again require a separate rule: use only exact-match targets, averaging them if there are multiple matches. If two identical feature vectors have very different repair times, the recorded features do not determine one unambiguous outcome; smoothing cannot resolve that missing information." },
        1: { p: "Suppose a new pump's three nearest prior repair cases have distances 1, 2, 4 and repair durations 3, 5, 20 hours. With $k = 2$, the uniform estimate is $(3 + 5)/2 = 4$ hours. Inverse-distance weighting of the first two gives $(3/1 + 5/2)/(1 + 1/2) = 5.5/1.5 = 11/3$, about 3.667 hours. With $k = 3$, the uniform estimate is $(3 + 5 + 20)/3 = 28/3$, about 9.333 hours. The far, long repair affects $k = 3$ strongly even though it is less similar; inverse-distance weighting reduces but does not remove its contribution. The choice of $k$ trades local variability against mixing dissimilar cases, conditional on the metric and feature representation." },
        2: { p: "Under squared-error loss, the unweighted mean minimizes $\\sum_i (y_i - a)^2$ over the chosen neighbors: the derivative $-2\\sum_i (y_i - a) = 0$ implies $a$ is their mean. Under absolute-error loss, a median minimizes $\\sum_i |y_i - a|$ over those neighbors, with an interval of minimizers possible for even $k$. The aggregation rule should match the decision objective. If the repair desk needs a high quantile for staffing, a mean alone is insufficient; estimate an appropriate distribution or quantile and evaluate coverage on later repairs." },
        5: { p: "**Worked exercise.** Keep distances 1 and 2 but replace the second repair time 5 by 9. The $k = 2$ mean becomes 6; the inverse-distance prediction becomes $(3 + 9/2)/(1 + 1/2) = 7.5/1.5 = 5$. The closer 3-hour case has greater influence in the weighted prediction. Neither answer is a confidence interval, because neither calculation models uncertainty across possible future repairs." },
      },
    },
    "2.10.2 Regression leaves and their training objective": {
      plain: "A leaf's prediction is the average of its training targets. A tree can never predict outside the range of those averages, so it cannot extrapolate.",
    },
    "2.11.3 Regression trees choose leaf values under a loss": {
      plain: "A split is worth making if it cuts the total squared error a lot. A cost per leaf ($\\alpha$) stops the tree growing splits that barely help.",
      examples: [
        {
          at: 2,
          title: "Pruning with a cost per leaf",
          blocks: [
            { p: "Defect counts [1, 2, 8, 9]: one leaf has error 50; two leaves have error 1. With cost $\\alpha = 10$ per leaf: one leaf costs $50 + 10 = 60$, two leaves cost $1 + 20 = 21$, so split. With $\\alpha = 60$: $50 + 60 = 110$ against $1 + 120 = 121$, so keep one leaf." },
          ],
        },
      ],
    },
  },
  code: {
    "2.9.2 K-nearest neighbors regression and local averaging#0": {
      goal: "KNN regression with uniform and inverse-distance weights",
      code: r`def knn_regress(distances_and_targets, *, k, inverse_distance=False):
    if not distances_and_targets or not 1 <= k <= len(distances_and_targets):
        raise ValueError("Need records and k within range")
    chosen = sorted(distances_and_targets, key=lambda row: row[0])[:k]
    if any(d < 0 for d, _ in chosen):
        raise ValueError("Distances must be nonnegative")
    if inverse_distance:
        exact = [y for d, y in chosen if d == 0]
        if exact:
            return sum(exact)/len(exact)
        weights = [1/d for d, _ in chosen]
    else:
        weights = [1.0]*len(chosen)
    return sum(w*y for w, (_, y) in zip(weights, chosen))/sum(weights)


cases = [(1,3),(2,5),(4,20)]
assert knn_regress(cases,k=2) == 4.0
assert abs(knn_regress(cases,k=2,inverse_distance=True)-11/3) < 1e-12
assert abs(knn_regress(cases,k=3)-28/3) < 1e-12
print("k=2:", knn_regress(cases, k=2), "| k=2 inverse-distance:", round(knn_regress(cases, k=2, inverse_distance=True), 3), "| k=3:", round(knn_regress(cases, k=3), 3))

# Output:
# k=2: 4.0 | k=2 inverse-distance: 3.667 | k=3: 9.333`,
      walk: [
        { line: "chosen = sorted(distances_and_targets, key=lambda row: row[0])[:k]", say: "Sort by distance and keep the $k$ closest." },
        { line: "weights = [1/d for d, _ in chosen]", say: "Inverse-distance weights: a neighbour at distance 1 counts twice as much as one at distance 2." },
        { line: "return sum(w*y for w, (_, y) in zip(weights, chosen))/sum(weights)", say: "Weighted average of the neighbours' targets." },
      ],
    },
    "In Python#0": {
      goal: "A depth-1 regression tree and KNN with k = 1 and 3",
      walk: [
        { line: "tree = DecisionTreeRegressor(max_depth=1).fit(X, y)", say: "A tree with a single split." },
        { line: "print(\"tree split at :\", tree.tree_.threshold[0])          # 3.5", say: "scikit-learn finds the same threshold, 3.5, as the hand search." },
        { line: "knn = KNeighborsRegressor(n_neighbors=k).fit(X, y)", say: "KNN just stores the data; predictions average the $k$ nearest targets." },
      ],
    },
  },
};
