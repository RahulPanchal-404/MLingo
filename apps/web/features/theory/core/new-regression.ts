import type { TheoryTopic } from "../topics";

const r = String.raw;

/**
 * Regression section additions. Written step by step: each section adds one idea on top of the previous one.
 * Code blocks are inserted from scripts that were executed; their printed output is shown underneath.
 */
export const NEW_REGRESSION_THEORY: TheoryTopic[] = [
  // ───────────────────────────────────────────── Multiple linear regression
  {
    slug: "multiple-linear-regression",
    group: "Regression",
    title: "Multiple Linear Regression & the Normal Equation",
    summary: "From one input to many: the design matrix, the normal equation derived line by line, and why near-duplicate features make coefficients unreliable.",
    learnHref: "/learn/linear-regression",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Multiple linear regression predicts a number as a weighted sum of several inputs, $\\hat y = \\beta_0 + \\beta_1 x_1 + \\dots + \\beta_p x_p$, and picks the weights that make the squared errors as small as possible." } },
          { p: "Simple linear regression used one input: salary from years of experience. Real targets depend on more than one thing. Salary also depends on how many projects someone has shipped. Multiple regression keeps the same idea (a straight-line relationship, squared error, least squares) and just gives every input its own weight." },
          { p: "We will build it in four small steps: **(1)** write the model for one row, **(2)** stack all rows into a matrix, **(3)** derive the best weights, **(4)** learn when those weights can be trusted." },
        ],
      },
      {
        heading: "Step 1: the model for one row",
        blocks: [
          { p: "Our running example: predict salary (\\$k) from experience (years) and projects shipped." },
          {
            table: {
              head: ["Person", "Experience $x_1$", "Projects $x_2$", "Salary $y$"],
              rows: [["A", "1", "2", "32"], ["B", "2", "1", "35"], ["C", "3", "4", "45"], ["D", "4", "3", "46"], ["E", "5", "6", "58"], ["F", "6", "5", "59"]],
            },
          },
          { p: "For one person the prediction is a starting value plus one contribution per input:" },
          { math: r`\hat y = \beta_0 + \beta_1 x_1 + \beta_2 x_2` },
          { list: ["$\\beta_0$ is the **intercept**: the prediction when every input is 0.", "$\\beta_1$ is the change in predicted salary for **one extra year of experience, holding projects fixed**.", "$\\beta_2$ is the change for **one extra project, holding experience fixed**."] },
          { callout: { title: "\"Holding the others fixed\" is the whole point", body: "In simple regression the experience slope also absorbs the effect of anything that grows with experience. In multiple regression each coefficient is the effect of its feature after the other features are accounted for. That is why a coefficient can change, or even flip sign, when you add or remove another feature." } },
        ],
      },
      {
        heading: "Step 2: stack every row into a matrix",
        blocks: [
          { p: "Writing six separate equations is clumsy. Put the inputs in a **design matrix** $X$: one row per example, one column per input, plus a first column of 1s so the intercept is just another weight." },
          { math: r`X = \begin{bmatrix} 1 & 1 & 2 \\ 1 & 2 & 1 \\ 1 & 3 & 4 \\ 1 & 4 & 3 \\ 1 & 5 & 6 \\ 1 & 6 & 5 \end{bmatrix}, \qquad \boldsymbol\beta = \begin{bmatrix} \beta_0 \\ \beta_1 \\ \beta_2 \end{bmatrix}, \qquad \hat{\mathbf y} = X\boldsymbol\beta` },
          { p: "Multiplying row $i$ of $X$ by $\\boldsymbol\\beta$ gives exactly $\\beta_0 \\cdot 1 + \\beta_1 x_{i1} + \\beta_2 x_{i2}$. One matrix product makes all six predictions at once. Shapes: $X$ is $n \\times (p+1)$, $\\boldsymbol\\beta$ is $(p+1) \\times 1$, so $\\hat{\\mathbf y}$ is $n \\times 1$." },
          { p: "**Linear means linear in the weights**, not in the inputs. A column of $x_1^2$ or $x_1 x_2$ is still allowed: it is just another column. That is how polynomial regression and interaction terms fit inside this same framework." },
        ],
      },
      {
        heading: "Step 3: derive the best weights (the normal equation)",
        blocks: [
          { p: "The loss is the same as before: the sum of squared residuals. In matrix form the residual vector is $\\mathbf y - X\\boldsymbol\\beta$, and the sum of its squares is its dot product with itself:" },
          { math: r`L(\boldsymbol\beta) = \lVert \mathbf y - X\boldsymbol\beta \rVert^2 = (\mathbf y - X\boldsymbol\beta)^\top(\mathbf y - X\boldsymbol\beta)` },
          {
            derive: {
              title: "From the loss to the normal equation, one line at a time",
              blocks: [
                { p: "**Expand** the product, like $(a-b)^2 = a^2 - 2ab + b^2$:" },
                { math: r`L = \mathbf y^\top\mathbf y - 2\boldsymbol\beta^\top X^\top\mathbf y + \boldsymbol\beta^\top X^\top X\boldsymbol\beta` },
                { p: "**Differentiate** with respect to $\\boldsymbol\\beta$. The first term has no $\\boldsymbol\\beta$; the second is linear (derivative $-2X^\\top\\mathbf y$); the third is a quadratic form (derivative $2X^\\top X\\boldsymbol\\beta$, because $X^\\top X$ is symmetric):" },
                { math: r`\nabla_{\boldsymbol\beta} L = -2X^\top\mathbf y + 2X^\top X\boldsymbol\beta` },
                { p: "**Set the gradient to zero** (the bottom of the bowl) and divide by 2:" },
                { math: r`X^\top X\,\hat{\boldsymbol\beta} = X^\top\mathbf y` },
                { p: "These are the **normal equations**. If $X^\\top X$ can be inverted:" },
                { math: r`\hat{\boldsymbol\beta} = (X^\top X)^{-1}X^\top\mathbf y` },
                { p: "The loss is a convex bowl (its second derivative $2X^\\top X$ is positive semi-definite), so this flat point is the global minimum, not a maximum or a saddle." },
              ],
            },
          },
          { p: "Let us check it by hand on a tiny case you can do on paper: one input, three rows, $x = (0, 1, 2)$, $y = (1, 3, 4)$." },
          {
            steps: [
              { title: "Build X with a column of ones", body: "Each row is (1, x).", math: r`X = \begin{bmatrix}1&0\\1&1\\1&2\end{bmatrix},\quad \mathbf y = \begin{bmatrix}1\\3\\4\end{bmatrix}` },
              { title: "Compute XᵀX", body: "Top-left counts the rows, off-diagonal sums x, bottom-right sums x².", math: r`X^\top X = \begin{bmatrix}3 & 3\\ 3 & 5\end{bmatrix}` },
              { title: "Compute Xᵀy", body: "Top sums y; bottom sums x·y = 0·1 + 1·3 + 2·4.", math: r`X^\top\mathbf y = \begin{bmatrix}8\\11\end{bmatrix}` },
              { title: "Invert the 2×2 matrix", body: "Swap the diagonal, negate the off-diagonal, divide by the determinant 3·5 − 3·3 = 6.", math: r`(X^\top X)^{-1} = \frac{1}{6}\begin{bmatrix}5 & -3\\ -3 & 3\end{bmatrix}` },
              { title: "Multiply", body: "The intercept is 7/6 ≈ 1.167 and the slope is 1.5.", math: r`\hat{\boldsymbol\beta} = \frac{1}{6}\begin{bmatrix}5\cdot 8 - 3\cdot 11\\ -3\cdot 8 + 3\cdot 11\end{bmatrix} = \begin{bmatrix}7/6\\ 3/2\end{bmatrix}` },
              { title: "Check the residuals", body: "Predictions are 7/6, 8/3, 25/6, so residuals are −1/6, 1/3, −1/6. They sum to 0, and their dot product with x is 0·(−1/6) + 1·(1/3) + 2·(−1/6) = 0. That is exactly what the normal equations demand." },
            ],
          },
          { callout: { title: "Geometric picture", body: "$X^\\top(\\mathbf y - \\hat{\\mathbf y}) = 0$ says the residual vector is perpendicular to every column of $X$. Least squares drops a perpendicular from $\\mathbf y$ onto the space of all possible predictions: $\\hat{\\mathbf y}$ is the **projection** of $\\mathbf y$, the closest point the model can reach." } },
        ],
      },
      {
        heading: "Step 4: when the weights cannot be trusted",
        blocks: [
          { p: "The formula needs $(X^\\top X)^{-1}$. Two situations break it." },
          { p: "**Exact duplicates (perfect collinearity).** If one column is an exact combination of others (salary in rupees and salary in dollars, or all three one-hot columns plus an intercept) then $X^\\top X$ has determinant 0 and no inverse. Infinitely many weight vectors give the same predictions, so no single answer exists. This is the **dummy variable trap**: with an intercept, use $k-1$ indicator columns for $k$ categories." },
          { p: "**Near duplicates (multicollinearity).** If two columns are almost copies (years of experience and months worked), the inverse exists but is huge. Tiny changes in the data swing the two coefficients wildly in opposite directions, while the predictions barely change." },
          { figure: { src: "/theory/figures/mlr_multicollinearity.svg", alt: "Two panels of fitted coefficients across eight resamples. Left: experience and months coefficients swing between about −40 and +45. Right: experience and projects coefficients stay near 4 and 1.", caption: "Refit on 8 resamples of the same data. Left: experience and months worked are near-duplicates, so their coefficients swing wildly (one large positive, the other large negative). Right: with distinct features the coefficients barely move." } },
          { p: "Measure it with the **variance inflation factor**: regress feature $j$ on all the other features and get $R_j^2$." },
          { math: r`\text{VIF}_j = \frac{1}{1 - R_j^2}` },
          { list: ["VIF = 1: feature $j$ shares nothing with the others.", "VIF above about 5–10: its coefficient is poorly determined; do not interpret it on its own.", "Fixes: drop or merge the redundant feature, collect more varied data, or use ridge regression, which adds $\\lambda I$ to $X^\\top X$ so it is always invertible."] },
          { callout: { title: "Prediction vs explanation", body: "Multicollinearity mostly hurts **interpretation**. If you only need good predictions on data like your training data, near-duplicate features are often harmless. If you want to say \"each project adds \\$2.3k\", they are not." } },
        ],
      },
      {
        heading: "Worked example: fit the salary data",
        blocks: [
          {
            steps: [
              { title: "Solve the normal equations", body: "With the six rows above (the code below does the arithmetic):", math: r`\hat y = 23.96 + 3.96\,x_{\text{exp}} + 2.29\,x_{\text{proj}}` },
              { title: "Read the coefficients", body: "Holding projects fixed, one more year of experience adds about \\$3.96k. Holding experience fixed, one more project adds about \\$2.29k. The intercept (about \\$24k) is the prediction at 0 years and 0 projects: an extrapolation, so do not over-read it." },
              { title: "Check the fit", body: "Predictions are 32.5, 34.2, 45.0, 46.7, 57.5, 59.2. The squared-error sum is about 1.67, against a total spread of 630.8 around the mean salary.", math: r`R^2 = 1 - \frac{1.67}{630.8} \approx 0.997` },
              { title: "Predict a new person", body: "7 years and 6 projects:", math: r`23.96 + 3.96 \times 7 + 2.29 \times 6 \approx 65.4 \text{ (\$k)}` },
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { p: "Three ways to get the same weights: the normal equation, a numerically stable least-squares solver, and scikit-learn. Then a VIF check on near-duplicate features." },
          { code: r`import numpy as np
from sklearn.linear_model import LinearRegression

# experience (years), projects shipped -> salary ($k)
X = np.array([[1, 2], [2, 1], [3, 4], [4, 3], [5, 6], [6, 5]], dtype=float)
y = np.array([32, 35, 45, 46, 58, 59], dtype=float)

# 1) Normal equation by hand: add a column of ones for the intercept
A = np.c_[np.ones(len(X)), X]
beta = np.linalg.solve(A.T @ A, A.T @ y)          # solves (AᵀA)β = Aᵀy
print("normal equation :", beta.round(3))

# 2) The numerically safer way (QR/SVD under the hood)
beta_lstsq, *_ = np.linalg.lstsq(A, y, rcond=None)
print("lstsq           :", beta_lstsq.round(3))

# 3) scikit-learn gives the same numbers
model = LinearRegression().fit(X, y)
print("sklearn         :", round(model.intercept_, 3), model.coef_.round(3))

residuals = y - A @ beta
print("residual sum    :", round(residuals.sum(), 10))     # 0 because there is an intercept
print("Xᵀ · residuals  :", (A.T @ residuals).round(10))    # all 0: residuals ⟂ every column
print("predict 7 yrs, 6 projects:", model.predict([[7, 6]]).round(2))

# Output:
# normal equation : [23.958  3.958  2.292]
# lstsq           : [23.958  3.958  2.292]
# sklearn         : 23.958 [3.958 2.292]
# residual sum    : 0.0
# Xᵀ · residuals  : [0. 0. 0.]
# predict 7 yrs, 6 projects: [65.42]` },
          { code: r`import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
n = 50
experience = rng.uniform(1, 10, n)
months = 12 * experience + rng.normal(0, 0.5, n)   # almost a copy of experience
projects = rng.uniform(0, 10, n)
X = np.c_[experience, months, projects]

def vif(X, j):
    """Variance inflation factor: 1 / (1 - R²) of feature j regressed on the others."""
    others = np.delete(X, j, axis=1)
    r2 = LinearRegression().fit(others, X[:, j]).score(others, X[:, j])
    return 1 / (1 - r2)

for j, name in enumerate(["experience", "months", "projects"]):
    print(f"VIF {name:<10} {vif(X, j):10.1f}")

# Output:
# VIF experience     4086.9
# VIF months         4089.9
# VIF projects          1.0` },
          { p: "In practice prefer `lstsq` or scikit-learn over computing an explicit inverse: forming $X^\\top X$ squares the condition number and loses precision when features are nearly collinear." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Reading a coefficient as \"the effect of $x_j$\" without the others held fixed", fix: "Say \"holding the other features fixed\". Adding or removing a correlated feature changes every coefficient." },
              { mistake: "Including all $k$ one-hot columns and an intercept", fix: "Drop one category (the reference) or drop the intercept, otherwise $X^\\top X$ is singular." },
              { mistake: "Comparing raw coefficient sizes to rank feature importance", fix: "Coefficients carry units. Standardise the features first, or use held-out permutation importance." },
              { mistake: "Treating coefficients as causal effects", fix: "Regression measures association in this data. Causal claims need an experiment or a causal design." },
              { mistake: "Computing $(X^\\top X)^{-1}$ explicitly in code", fix: "Use `np.linalg.lstsq` or `LinearRegression`, which solve via QR or SVD and are more stable." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Why the residuals sum to zero.** The first column of $X$ is all 1s. The normal equation for that column says $\\mathbf 1^\\top(\\mathbf y - \\hat{\\mathbf y}) = 0$, i.e. the residuals sum to zero. This only holds when the model has an intercept." },
          { p: "**Interactions.** A column $x_1 x_2$ lets the slope of $x_1$ depend on $x_2$. With temperature $t$ and a weekend flag $w$, the model $\\beta_0 + \\beta_t t + \\beta_w w + \\beta_{tw} t w$ has slope $\\beta_t$ on weekdays and $\\beta_t + \\beta_{tw}$ at weekends. The two lines can cross, so being equal at one temperature does not mean there is no weekend effect." },
          { p: "**More columns than rows.** If $p + 1 > n$, $X^\\top X$ is always singular: the model can fit the training data perfectly in infinitely many ways. You need more data, fewer features, or regularisation." },
          { p: "**Coefficient uncertainty.** Under the classic assumptions (independent errors with constant variance $\\sigma^2$), $\\operatorname{Var}(\\hat{\\boldsymbol\\beta}) = \\sigma^2 (X^\\top X)^{-1}$. A nearly singular $X^\\top X$ has a huge inverse, which is the formula behind the multicollinearity picture above." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Add a fourth point $(x, y) = (3, 4)$ to the tiny dataset $x = (0, 1, 2)$, $y = (1, 3, 4)$. Recompute $X^\\top X$, $X^\\top\\mathbf y$ and the weights.", solution: [{ math: r`X^\top X = \begin{bmatrix}4 & 6\\6 & 14\end{bmatrix},\quad X^\top\mathbf y = \begin{bmatrix}12\\23\end{bmatrix}` }, { p: "The determinant is 4·14 − 6·6 = 20. Slope = (4·23 − 6·12)/20 = 20/20 = 1.0. Intercept = (14·12 − 6·23)/20 = 30/20 = 1.5. The new point lies below the old line (which predicted 5.67 at x = 3), so the line flattens. That is ordinary sensitivity to data, not a bug." }] } },
          { problem: { q: "A model has an intercept and one-hot columns for City = {Delhi, Mumbai, Pune}. Why does least squares fail, and what are two fixes?", solution: [{ p: "The three indicator columns always add up to the column of 1s, so the columns are linearly dependent and $X^\\top X$ is singular. Fix 1: drop one city (it becomes the reference, and the other coefficients are differences from it). Fix 2: keep all three and drop the intercept. Both give the same predictions." }] } },
          { problem: { q: "Feature $x_3$ has $R_3^2 = 0.95$ when regressed on the other features. What is its VIF, and what does it mean?", solution: [{ math: r`\text{VIF}_3 = \frac{1}{1 - 0.95} = 20` }, { p: "The variance of its coefficient is 20 times what it would be with an uncorrelated feature. Its individual coefficient is unreliable; consider removing or merging it, or use ridge regression." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Derive the normal equation from $\\lVert \\mathbf y - X\\boldsymbol\\beta \\rVert^2$.", "Why do the residuals of a model with an intercept sum to zero?", "What is multicollinearity, how do you detect it, and does it hurt prediction or interpretation?", "What is the dummy variable trap?", "Why is solving with QR/SVD preferred to computing $(X^\\top X)^{-1}$?", "What does \"linear\" in linear regression actually refer to?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Model: $\\hat{\\mathbf y} = X\\boldsymbol\\beta$, with a column of 1s for the intercept.", "Least squares gives the normal equations $X^\\top X\\hat{\\boldsymbol\\beta} = X^\\top\\mathbf y$.", "Residuals are perpendicular to every column of $X$; with an intercept they sum to 0.", "Each coefficient is an effect **holding the other features fixed**.", "Exact duplicates make $X^\\top X$ singular; near duplicates make coefficients unstable (check VIF)."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Why does the design matrix get a first column of 1s?", options: ["To scale the features", "So the intercept becomes one of the weights", "To avoid overfitting", "So $X^\\top X$ is diagonal"], answer: 1, why: "Multiplying the 1s column by $\\beta_0$ adds the intercept to every prediction, so it can be solved for like any other weight." } },
          { quiz: { q: "Two features are near-copies of each other. What typically happens?", options: ["Predictions become very poor", "The coefficients become unstable, but predictions stay similar", "The intercept becomes 0", "Training fails with an error"], answer: 1, why: "The model can trade weight between the two copies almost freely, so individual coefficients swing while their combined effect (and the predictions) stay similar." } },
          { quiz: { q: "In the normal equations $X^\\top X\\hat{\\boldsymbol\\beta} = X^\\top\\mathbf y$, what does $X^\\top(\\mathbf y - \\hat{\\mathbf y}) = 0$ mean geometrically?", options: ["Residuals are all zero", "Residuals are perpendicular to every feature column", "Predictions equal the mean", "The loss is maximal"], answer: 1, why: "Each entry is the dot product of a column of $X$ with the residual vector. All of them being zero means the residuals are orthogonal to the column space: $\\hat{\\mathbf y}$ is the projection of $\\mathbf y$." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── Regression metrics
  {
    slug: "regression-metrics",
    group: "Regression",
    title: "Regression Metrics: MAE, MSE, RMSE, R² and Friends",
    summary: "How to measure a regression model's error, what each metric is sensitive to, and why every score needs a baseline next to it.",
    learnHref: "/learn/linear-regression",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Every regression metric starts from the same thing, the residual $e_i = y_i - \\hat y_i$, and differs only in how it turns many residuals into one number." } },
          { p: "A model predicted house prices. Is it good? \"Good\" needs a number, and different numbers answer different questions. How far off am I usually? Do big misses matter more? Am I better than a trivial guess? We will build the metrics one at a time from a single small example." },
          { table: { head: ["House", "Actual $y$ (\\$k)", "Predicted $\\hat y$", "Residual $e = y - \\hat y$"], rows: [["1", "200", "210", "−10"], ["2", "250", "240", "+10"], ["3", "300", "320", "−20"], ["4", "350", "330", "+20"], ["5", "400", "380", "+20"]] } },
          { p: "Why not just average the residuals? $(-10 + 10 - 20 + 20 + 20)/5 = 4$. Positive and negative misses cancel, so a terrible model could score 0. Every real metric first removes the sign." },
        ],
      },
      {
        heading: "Step 1: MAE, the typical miss",
        blocks: [
          { p: "Remove the sign with an absolute value, then average:" },
          { math: r`\text{MAE} = \frac{1}{n}\sum_{i=1}^{n} |y_i - \hat y_i| = \frac{10 + 10 + 20 + 20 + 20}{5} = 16` },
          { p: "**Read it as:** on average the prediction is \\$16k away from the true price. It is in the same units as the target and every dollar of error counts the same. A \\$40k miss counts exactly twice as much as a \\$20k miss." },
        ],
      },
      {
        heading: "Step 2: MSE and RMSE, punish big misses",
        blocks: [
          { p: "Remove the sign by squaring instead:" },
          { math: r`\text{MSE} = \frac{1}{n}\sum_{i=1}^{n} (y_i - \hat y_i)^2 = \frac{100 + 100 + 400 + 400 + 400}{5} = 280` },
          { p: "Squaring makes a 20 count four times as much as a 10, not twice. MSE is the loss linear regression minimises, and it is smooth, so gradients are easy. But its unit is \"dollars squared\", which nobody can picture. Take the square root to get back to dollars:" },
          { math: r`\text{RMSE} = \sqrt{\text{MSE}} = \sqrt{280} \approx 16.7` },
          { p: "RMSE is always at least MAE. The gap between them tells you how uneven the errors are: equal-sized misses give RMSE = MAE, while a few huge misses push RMSE far above MAE." },
          { figure: { src: "/theory/figures/reg_metrics_outlier.svg", alt: "Bar chart. Original errors: MAE 16.0, RMSE 16.7. After one miss becomes 120: MAE 36.0, RMSE 55.5.", caption: "Change one miss from 20 to 120. MAE goes from 16 to 36, while RMSE jumps from 16.7 to 55.5. Use RMSE when big misses are disproportionately costly, and MAE when every unit of error costs the same." } },
        ],
      },
      {
        heading: "Step 3: R², compared with a baseline",
        blocks: [
          { p: "Is an RMSE of 16.7 good? It depends on how spread out prices are. Compare with the laziest possible model: always predict the mean price, $\\bar y = 300$." },
          {
            steps: [
              { title: "Baseline error (total sum of squares)", body: "Squared distance of each price from the mean 300:", math: r`\text{SST} = 100^2 + 50^2 + 0^2 + 50^2 + 100^2 = 25\,000` },
              { title: "Model error (residual sum of squares)", body: "Squared residuals from the table:", math: r`\text{SSE} = 100 + 100 + 400 + 400 + 400 = 1\,400` },
              { title: "Fraction of baseline error removed", body: "", math: r`R^2 = 1 - \frac{\text{SSE}}{\text{SST}} = 1 - \frac{1\,400}{25\,000} = 0.944` },
            ],
          },
          { p: "**Read it as:** the model removes 94.4% of the squared error that predicting the mean would make." },
          { list: ["$R^2 = 1$: perfect predictions.", "$R^2 = 0$: no better than predicting the mean.", "$R^2 < 0$: **worse than predicting the mean**. This is impossible on the training data for least squares with an intercept, but common on test data when a model overfits or the data has shifted."] },
          { callout: { title: "R² is not accuracy", body: "R² depends on how spread out the target is. The same RMSE gives a high R² on widely spread prices and a low R² on tightly bunched ones. Always report an error in real units (MAE or RMSE) next to R²." } },
        ],
      },
      {
        heading: "Step 4: adjusted R², a penalty for extra features",
        blocks: [
          { p: "On training data, adding any feature (even random noise) can never lower R². Adjusted R² charges for every feature $p$ given the sample size $n$:" },
          { math: r`R^2_{\text{adj}} = 1 - (1 - R^2)\,\frac{n - 1}{n - p - 1}` },
          { p: "Example: $R^2 = 0.80$ with $n = 20$ rows. With $p = 3$ features, $R^2_{\\text{adj}} = 1 - 0.2 \\times 19/16 = 0.7625$. With $p = 10$, $R^2_{\\text{adj}} = 1 - 0.2 \\times 19/9 \\approx 0.578$. The same fit looks much worse when it needed ten features to get there." },
          { p: "Adjusted R² is a training-set statistic. It does not replace a held-out test set or cross-validation." },
        ],
      },
      {
        heading: "Step 5: percentage errors (MAPE) and their trap",
        blocks: [
          { math: r`\text{MAPE} = \frac{100\%}{n}\sum_{i=1}^{n}\left|\frac{y_i - \hat y_i}{y_i}\right|` },
          { p: "For our houses: $(10/200 + 10/250 + 20/300 + 20/350 + 20/400)/5 \\approx 5.28\\%$. Percentages are easy to explain to non-technical people." },
          { p: "**The trap:** dividing by $y_i$ explodes when the actual value is near 0. Predicting 10 when the truth is 1 is a 900% error. MAPE also punishes over-prediction and under-prediction asymmetrically. Use it only when the target is always well away from zero." },
        ],
      },
      {
        heading: "Which metric should I use?",
        blocks: [
          {
            table: {
              head: ["Metric", "Units", "Big misses", "Use when"],
              rows: [
                ["MAE", "target units", "count linearly", "every unit of error costs the same; robust to outliers"],
                ["MSE", "units²", "count quadratically", "training loss; comparing models mathematically"],
                ["RMSE", "target units", "count quadratically", "large errors are disproportionately bad"],
                ["R²", "none", "via SSE", "comparing to the mean baseline on the same data"],
                ["Adjusted R²", "none", "via SSE", "comparing training fits with different numbers of features"],
                ["MAPE", "%", "relative", "the target is always far from zero and you need percentages"],
              ],
            },
          },
          { p: "Pick the metric **before** training, from the real cost of being wrong. Then always show the same metric for a simple baseline (mean, median or last value) alongside your model." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_true = np.array([200, 250, 300, 350, 400])   # house prices ($k)
y_pred = np.array([210, 240, 320, 330, 380])

mae = mean_absolute_error(y_true, y_pred)
mse = mean_squared_error(y_true, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_true, y_pred)
mape = np.mean(np.abs((y_true - y_pred) / y_true)) * 100

n, p = len(y_true), 1                       # 1 feature used by the model
adj_r2 = 1 - (1 - r2) * (n - 1) / (n - p - 1)

print(f"MAE  {mae:.1f}   MSE {mse:.1f}   RMSE {rmse:.2f}")
print(f"R²   {r2:.3f}   adjusted R² {adj_r2:.3f}   MAPE {mape:.2f}%")

# Always compare with a baseline that predicts the training mean
baseline = np.full_like(y_true, y_true.mean(), dtype=float)
print(f"baseline MAE {mean_absolute_error(y_true, baseline):.1f}  R² {r2_score(y_true, baseline):.1f}")

# Output:
# MAE  16.0   MSE 280.0   RMSE 16.73
# R²   0.944   adjusted R² 0.925   MAPE 5.28%
# baseline MAE 60.0  R² 0.0` },
          { p: "The baseline line is the most important: an R² of 0.0 is the bar to beat. An MAE of 16 next to a baseline MAE of 60 tells a stakeholder far more than either number alone." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Averaging raw residuals", fix: "Positive and negative errors cancel. Use absolute values or squares." },
              { mistake: "Reporting R² alone", fix: "Also report MAE or RMSE in target units and the same metric for a baseline." },
              { mistake: "Computing metrics on the training data", fix: "Training error is optimistic. Measure on a held-out test set or with cross-validation." },
              { mistake: "Using MAPE when targets can be near zero", fix: "Use MAE, RMSE or a scaled error instead." },
              { mistake: "Comparing RMSE across different targets", fix: "RMSE has units. You can only compare it between models predicting the same target on the same data." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Which single prediction is best?** If you must predict one constant for everyone, the constant that minimises MSE is the **mean**, while the constant that minimises MAE is the **median**. That is why MSE-trained models get pulled by outliers and MAE-trained ones do not." },
          { p: "**Why R² can be negative on test data.** SST on the test set uses the test mean, which the model never saw. A model that overfits or meets shifted data can have a larger SSE than that simple baseline, giving $1 - \\text{SSE}/\\text{SST} < 0$." },
          { p: "**Units tell you a lot.** An RMSE of 16.7 (\\$k) on houses averaging \\$300k is about a 5.6% typical error. Converting to a relative scale like this is often more useful to stakeholders than the raw number." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Actual = (3, 5, 8), predicted = (2, 5, 11). Compute MAE, MSE, RMSE and R².", solution: [{ p: "Residuals: 1, 0, −3. MAE = (1 + 0 + 3)/3 ≈ 1.333. MSE = (1 + 0 + 9)/3 ≈ 3.333. RMSE ≈ 1.826. The mean is 16/3 ≈ 5.333, so SST = (−2.333)² + (−0.333)² + (2.667)² ≈ 5.444 + 0.111 + 7.111 = 12.667. SSE = 10, so R² = 1 − 10/12.667 ≈ 0.211." }] } },
          { problem: { q: "A test-set R² is −0.4. What does that mean, and what would you check?", solution: [{ p: "The model's squared error is 40% larger than simply predicting the test mean. Check for overfitting (compare with the training R²), data leakage in training that is absent at test time, a distribution shift between train and test, or a bug such as misaligned rows." }] } },
          { problem: { q: "Model A: MAE 10, RMSE 12. Model B: MAE 9, RMSE 25. Which would you deploy for ambulance arrival times?", solution: [{ p: "Model B is usually slightly closer but sometimes misses badly (RMSE much larger than MAE). For ambulance arrival times a rare huge miss is dangerous, so Model A, with consistent errors, is the safer choice. The metric must follow the real cost of error." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Why is RMSE always ≥ MAE? When are they equal?", "Can R² be negative? When?", "Why use adjusted R² instead of R²?", "What constant minimises MSE? What minimises MAE?", "When is MAPE a bad choice?", "Why should every metric be shown next to a baseline?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Every metric summarises residuals $y - \\hat y$; first remove the sign.", "MAE: typical miss, linear in error, robust. RMSE: squared penalty, back in target units.", "R² = 1 − SSE/SST: the improvement over predicting the mean, which can be negative on test data.", "Adjusted R² penalises extra features; MAPE breaks near zero.", "Pick the metric from the real cost of errors, and always show a baseline."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Errors are (2, 2, 2, 2). Which is true?", options: ["RMSE > MAE", "RMSE = MAE", "RMSE < MAE", "R² = 1"], answer: 1, why: "When every error has the same size, squaring then rooting gives back that same size, so RMSE = MAE = 2." } },
          { quiz: { q: "A model scores R² = 0 on the test set. What does it mean?", options: ["Perfect predictions", "No better than predicting the test mean", "All predictions are 0", "The model is untrained"], answer: 1, why: "R² = 0 means SSE = SST: the model's squared error equals that of the constant mean prediction." } },
          { quiz: { q: "You add 5 random-noise features and training R² rises from 0.70 to 0.72. Adjusted R² most likely…", options: ["rises a lot", "falls or barely moves", "becomes negative", "equals 0.72"], answer: 1, why: "Adjusted R² charges for each extra feature; a tiny gain from noise usually does not cover that charge." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── Assumptions & diagnostics
  {
    slug: "regression-diagnostics",
    group: "Regression",
    title: "Regression Assumptions & Residual Diagnostics",
    summary: "What linear regression quietly assumes, how residual plots expose each violation, and what to do about curves, fans, outliers and correlated errors.",
    learnHref: "/learn/linear-regression",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A good fit is not enough: plot the residuals, because a pattern left in them is something the model failed to learn or an assumption that does not hold." } },
          { p: "Least squares will always find a line. Whether that line is trustworthy (whether its predictions, its coefficients and their p-values mean anything) depends on a few assumptions. We will take them one at a time, and for each one: what it says, how to see it break, and how to fix it." },
          { p: "The single most useful tool is the **residuals-vs-fitted plot**: predicted value on the x-axis, residual $y - \\hat y$ on the y-axis. If the model captured everything, it looks like a shapeless horizontal band around 0." },
          { figure: { src: "/theory/figures/reg_residual_patterns.svg", alt: "Three residual plots: a flat random band; a U-shaped curve; a fan that widens to the right.", caption: "The three plots you will meet most. Left: healthy, no pattern. Middle: a U-shape, so the model missed a curve (add $x^2$ or transform). Right: a fan, so the error spread grows with the prediction (heteroscedasticity)." } },
        ],
      },
      {
        heading: "Assumption 1: the relationship is linear (in the weights)",
        blocks: [
          { p: "**What it says:** the average of $y$ really is a weighted sum of the features you supplied." },
          { p: "**How it breaks:** the truth curves (salary grows faster with seniority, demand peaks at mid temperatures). The residual plot shows a **U or arch**: positive residuals at both ends and negative in the middle, or the reverse." },
          { p: "**Fix:** add the missing shape as a column ($x^2$, $\\log x$, an interaction $x_1 x_2$) or use a flexible model such as a tree ensemble. The model stays linear in its weights." },
        ],
      },
      {
        heading: "Assumption 2: errors are independent",
        blocks: [
          { p: "**What it says:** one row's error tells you nothing about another row's error." },
          { p: "**How it breaks:** time series (today's error resembles yesterday's) and grouped data (many rows from the same customer, store or patient). Plot residuals **in time order**. Long runs above then below zero mean autocorrelation." },
          { p: "**Why it matters:** the predictions may still be fine, but standard errors and p-values assume independent rows, so they come out far too confident. Validation also breaks: a random split leaks information between correlated rows." },
          { p: "**Fix:** add lagged features, use time-aware or group-aware splits, or use models built for dependence (time-series models, mixed models)." },
        ],
      },
      {
        heading: "Assumption 3: constant error spread (homoscedasticity)",
        blocks: [
          { p: "**What it says:** errors have roughly the same spread everywhere. A \\$50k house and a \\$5M house should be predicted with similar absolute uncertainty." },
          { p: "**How it breaks:** a **fan or cone** in the residual plot. Expensive houses have much bigger errors than cheap ones. This is called **heteroscedasticity**." },
          { p: "**Fix:** model $\\log y$ instead of $y$ (which turns multiplicative errors into additive ones), use weighted least squares, or report robust (heteroscedasticity-consistent) standard errors. The coefficients from ordinary least squares stay unbiased; it is their stated uncertainty that is wrong." },
        ],
      },
      {
        heading: "Assumption 4: errors are roughly normal (only for small-sample inference)",
        blocks: [
          { p: "**What it says:** the errors follow a bell curve. This is needed for exact t-tests and confidence intervals on coefficients with small samples. It is **not** needed for least squares to produce good predictions." },
          { p: "**How to check:** a histogram of residuals, or a Q–Q plot (residual quantiles against normal quantiles should fall on a straight line). Heavy tails show up as points peeling away at the ends." },
          { p: "**Fix:** usually nothing for prediction. With a large sample the central limit theorem rescues inference. If tails are extreme, look for outliers or use a robust loss (Huber, MAE)." },
        ],
      },
      {
        heading: "Outliers, leverage and influence",
        blocks: [
          { p: "Three different ideas that are easily confused:" },
          {
            table: {
              head: ["Term", "Meaning", "Example"],
              rows: [
                ["Outlier", "unusual **y** for its x (large residual)", "a 2-bedroom flat priced like a mansion"],
                ["High leverage", "unusual **x** (far from other inputs)", "the only 40-year-experience person in the data"],
                ["Influential", "removing it **changes the fit** a lot", "a high-leverage point that is also off-trend"],
              ],
            },
          },
          { p: "A high-leverage point can have a small residual precisely because it drags the line towards itself, so residual size alone will not find it. **Cook's distance** combines leverage and residual size to measure influence." },
          { callout: { title: "Never delete a point just because it is inconvenient", body: "First check whether it is a data error (a typo, a unit mix-up, a duplicate). If it is real, it is information: fit with and without it, report both, or use a robust method. Removing real extremes makes the model look better and behave worse." } },
        ],
      },
      {
        heading: "Worked example: spot the missing curve",
        blocks: [
          { p: "Data generated as $y = 3 + 0.5x^2 + \\text{noise}$, but we first fit a straight line. Sort the predictions into thirds and average the residuals in each third:" },
          {
            steps: [
              { title: "Straight line", body: "Residual means by third: +1.60, −3.36, +1.78. Positive at both ends and negative in the middle: a U-shape. The line is systematically wrong in a predictable way." },
              { title: "Read the spread", body: "Residual spreads by third are 3.86, 1.93, 3.66: uneven, because the curve's mismatch is largest at the ends." },
              { title: "Add the x² column", body: "Residual means become −0.12, 0.14, −0.01 (all near 0) and spreads 1.66, 1.90, 1.81 (even, and close to the true noise level of 2). The pattern is gone." },
              { title: "Lesson", body: "The fix was not a different algorithm, just a better feature. The residual pattern told us exactly which feature was missing." },
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(1)
x = rng.uniform(0, 10, 200).reshape(-1, 1)
y = 3 + 0.5 * x[:, 0] ** 2 + rng.normal(0, 2, 200)    # the truth is curved

def residual_report(X, y, label):
    model = LinearRegression().fit(X, y)
    pred = model.predict(X)
    res = y - pred
    # Split predictions into thirds: a healthy model has residual mean ≈ 0 in every third
    third = np.array_split(np.argsort(pred), 3)
    means = [float(res[i].mean().round(2)) for i in third]
    spreads = [float(res[i].std().round(2)) for i in third]
    print(f"{label:<14} residual mean by third {means}  spread {spreads}")

residual_report(x, y, "straight line")
residual_report(np.c_[x, x ** 2], y, "with x² term")

# Output:
# straight line  residual mean by third [1.6, -3.36, 1.78]  spread [3.86, 1.93, 3.66]
# with x² term   residual mean by third [-0.12, 0.14, -0.01]  spread [1.66, 1.9, 1.81]` },
          { p: "In a notebook, also plot `pred` against `res` (and residuals in time order for time data). The eye catches patterns no single number does." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Believing least squares needs normally distributed x or y", fix: "Prediction needs none of that. Normal errors only matter for exact small-sample inference." },
              { mistake: "Judging the model by R² and skipping the residual plot", fix: "A high R² can hide a clear curve or fan. Always look at the residuals." },
              { mistake: "Deleting points with large residuals", fix: "Check them for data errors; if they are real, keep them or use a robust method and report it." },
              { mistake: "Trusting p-values on time-series or grouped data", fix: "Correlated errors make standard errors too small. Use time-aware methods or clustered errors." },
              { mistake: "Fixing a fan by dropping the big values", fix: "Transform the target (log), weight the rows, or use robust standard errors." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**The classic model.** $Y = X\\beta + \\varepsilon$ with $E[\\varepsilon \\mid X] = 0$ (correct mean), $\\operatorname{Var}(\\varepsilon \\mid X) = \\sigma^2 I$ (independent, constant spread), and optionally $\\varepsilon \\sim \\mathcal N$. Under the first two (the Gauss–Markov conditions), least squares is the best linear unbiased estimator." },
          { p: "**Confidence vs prediction intervals.** A confidence interval covers the average $y$ at a given x. A prediction interval covers a new single $y$, so it must add the noise variance. With mean uncertainty SD 1 and noise SD 3, the prediction SD is $\\sqrt{1^2 + 3^2} \\approx 3.16$, much wider than the confidence interval." },
          { p: "**Leverage formula.** Leverage is the diagonal of the hat matrix $H = X(X^\\top X)^{-1}X^\\top$, which maps $\\mathbf y$ to $\\hat{\\mathbf y} = H\\mathbf y$. Values well above the average $(p + 1)/n$ flag unusual inputs." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "A residual plot shows residuals near 0 for small predictions and spreading to ±50 for large ones. Name the problem and two fixes.", solution: [{ p: "Heteroscedasticity (non-constant variance). Fixes: model log(y) so errors become proportional; use weighted least squares; or keep the model and report heteroscedasticity-robust standard errors." }] } },
          { problem: { q: "Daily sales residuals plotted in date order show a 7-day wave. What assumption fails, and what feature would you add?", solution: [{ p: "Independence of errors fails (seasonal autocorrelation). Add a day-of-week feature (or sales from the same weekday last week) and validate with a time-ordered split." }] } },
          { problem: { q: "A point has a tiny residual but removing it changes the slope a lot. How?", solution: [{ p: "It has high leverage (an extreme x value). The line passes close to it because it pulls the line towards itself, so its residual is small, yet the fit depends heavily on it. Cook's distance would flag it as influential." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["List the assumptions of linear regression. Which ones are needed for prediction and which for inference?", "What does a U-shaped residual plot mean?", "What is heteroscedasticity and how do you handle it?", "Difference between an outlier, a high-leverage point and an influential point?", "Difference between a confidence interval and a prediction interval?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Plot residuals vs fitted values: a shapeless band means healthy.", "U-shape: missing non-linearity. Fan: changing variance. Waves over time: dependent errors.", "Normal errors only matter for small-sample inference, not for prediction.", "Leverage is about unusual x, outliers about unusual y, influence about changing the fit.", "Fix with features, transforms, weights or robust errors, not by deleting inconvenient points."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Residuals form a U-shape against predicted values. Best first fix?", options: ["Remove the outliers", "Add a non-linear feature such as $x^2$", "Increase the learning rate", "Use MAPE instead"], answer: 1, why: "A U-shape means the model is systematically wrong in a curved way; adding the missing curved feature removes the pattern." } },
          { quiz: { q: "Which assumption is NOT needed for least squares to give good predictions?", options: ["The mean relationship is correctly specified", "Errors are normally distributed", "Training and test data come from the same process", "Features are measured before the target"], answer: 1, why: "Normality only matters for exact small-sample p-values and intervals. Prediction quality does not depend on it." } },
          { quiz: { q: "Heteroscedasticity mainly damages…", options: ["the coefficient estimates (they become biased)", "the stated standard errors and p-values", "the training speed", "the intercept only"], answer: 1, why: "OLS coefficients stay unbiased; the usual formula for their uncertainty assumes constant variance, so it becomes wrong." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── Tree & KNN regression
  {
    slug: "tree-knn-regression",
    group: "Regression",
    title: "Regression Trees & KNN Regression",
    summary: "Two non-linear regression models that need no equation: split the input space into boxes and predict each box's average, or average the nearest neighbours.",
    learnHref: "/learn/decision-trees",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A regression tree predicts the average target of the training rows that land in the same leaf; KNN regression predicts the average target of the $k$ closest training rows." } },
          { p: "Linear regression assumes a straight-line shape. Many relationships are not straight: prices jump between neighbourhoods, and demand flattens after a threshold. Trees and KNN make **no assumption about shape**. They predict from nearby examples. You already know both models as classifiers; for regression, swap \"majority vote\" for \"average\"." },
          { p: "Running example: six points, $x = (1, 2, 3, 4, 5, 6)$ and $y = (5, 6, 5, 12, 13, 14)$. There is a clear jump between $x = 3$ and $x = 4$." },
        ],
      },
      {
        heading: "Step 1: a leaf predicts the mean",
        blocks: [
          { p: "Suppose a leaf holds the targets $5, 6, 5$. Which single number $c$ should it predict? Choose the $c$ that minimises the squared error $\\sum_i (y_i - c)^2$:" },
          { math: r`\frac{d}{dc}\sum_i (y_i - c)^2 = -2\sum_i (y_i - c) = 0 \;\Rightarrow\; c = \frac{1}{n}\sum_i y_i = \bar y` },
          { p: "So a regression leaf predicts the **mean** of its rows: $(5 + 6 + 5)/3 \\approx 5.33$. (If you trained with absolute error instead, the best constant would be the **median**.)" },
        ],
      },
      {
        heading: "Step 2: choose the split that reduces error most",
        blocks: [
          { p: "A classification tree splits to reduce Gini or entropy. A regression tree splits to reduce the **sum of squared errors (SSE)**: try every threshold, give each side its own mean, and keep the threshold with the smallest total SSE." },
          {
            steps: [
              { title: "Before any split", body: "One leaf predicting the overall mean 55/6 ≈ 9.17.", math: r`\text{SSE}_{\text{root}} = \sum_i (y_i - 9.17)^2 \approx 90.83` },
              { title: "Try x < 2.5", body: "Left {5, 6}, mean 5.5, SSE 0.5. Right {5, 12, 13, 14}, mean 11, SSE 50.", math: r`\text{SSE} = 0.5 + 50 = 50.5` },
              { title: "Try x < 3.5", body: "Left {5, 6, 5}, mean 5.33, SSE 0.67. Right {12, 13, 14}, mean 13, SSE 2.", math: r`\text{SSE} = 0.67 + 2 = 2.67` },
              { title: "Try x < 4.5", body: "Left {5, 6, 5, 12}, mean 7, SSE 34. Right {13, 14}, mean 13.5, SSE 0.5.", math: r`\text{SSE} = 34 + 0.5 = 34.5` },
              { title: "Pick the best", body: "Of all the thresholds (1.5 gives 70, 2.5 gives 50.5, 3.5 gives 2.67, 4.5 gives 34.5, 5.5 gives 62.8), x < 3.5 wins. It cuts the error from 90.83 to 2.67: a 97% reduction, found by brute force." },
            ],
          },
          { p: "The tree then repeats this inside each side (recursive binary splitting) until a stopping rule is hit: a maximum depth, a minimum number of samples per leaf, or a minimum error reduction." },
          { figure: { src: "/theory/figures/reg_tree_knn.svg", alt: "Left: a step function at 5.33 for x below 3.5 and 13 above. Right: KNN predictions with k=1 (a step through every point) and k=3 (smoother steps).", caption: "Left: the depth-1 tree predicts 5.33 for x < 3.5 and 13 otherwise, a step function. Right: KNN with k = 1 copies the nearest point exactly (overfits noise), while k = 3 averages three neighbours and is smoother." } },
        ],
      },
      {
        heading: "Step 3: KNN regression averages neighbours",
        blocks: [
          { p: "KNN needs no training. To predict at a new $x$: find the $k$ nearest training points and average their targets. Predict at $x = 3.4$ with $k = 3$:" },
          {
            steps: [
              { title: "Distances", body: "|3.4 − 3| = 0.4, |3.4 − 4| = 0.6, |3.4 − 2| = 1.4 (the next ones are farther)." },
              { title: "Plain average", body: "", math: r`\hat y = \frac{5 + 12 + 6}{3} \approx 7.67` },
              { title: "Distance-weighted average", body: "Weight each neighbour by 1/distance, so closer points count more.", math: r`\hat y = \frac{5/0.4 + 12/0.6 + 6/1.4}{1/0.4 + 1/0.6 + 1/1.4} \approx 7.54` },
            ],
          },
          { p: "**Choosing k** is the bias–variance dial. $k = 1$ reproduces training data exactly (low bias, high variance); a large $k$ smooths everything towards the global mean (high bias, low variance). Pick $k$ by cross-validation, and always **scale features** first, because distance is dominated by whichever feature has the largest units." },
        ],
      },
      {
        heading: "Trees vs KNN vs linear regression",
        blocks: [
          {
            table: {
              head: ["", "Linear regression", "Regression tree", "KNN regression"],
              rows: [
                ["Shape assumed", "straight line / plane", "none (step function)", "none (local average)"],
                ["Needs scaling", "only for regularisation / GD", "no", "yes, essential"],
                ["Extrapolates beyond data", "yes (continues the line)", "no: flat at the edge leaf", "no: averages edge points"],
                ["Training cost", "fast", "fast", "none (stores data)"],
                ["Prediction cost", "tiny", "tiny (one path)", "slow on big data (distances)"],
                ["Main risk", "wrong shape (underfit)", "deep trees overfit", "bad k / unscaled features"],
              ],
            },
          },
          { callout: { title: "Neither can extrapolate", body: "Ask a tree or KNN for x = 100 when training stopped at 6 and both answer 13 or so, the value at the edge. If your test data can go beyond the training range (prices that keep rising over time), linear models or engineered trend features are safer." } },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.tree import DecisionTreeRegressor
from sklearn.neighbors import KNeighborsRegressor

X = np.array([[1], [2], [3], [4], [5], [6]], dtype=float)
y = np.array([5, 6, 5, 12, 13, 14], dtype=float)

tree = DecisionTreeRegressor(max_depth=1).fit(X, y)
print("tree split at :", tree.tree_.threshold[0])          # 3.5
print("leaf values   :", tree.predict([[2], [5]]).round(3))  # [5.333 13.]

for k in (1, 3):
    knn = KNeighborsRegressor(n_neighbors=k).fit(X, y)
    print(f"KNN k={k} at 3.4:", knn.predict([[3.4]]).round(3))

knn_w = KNeighborsRegressor(n_neighbors=3, weights="distance").fit(X, y)
print("KNN k=3 distance-weighted at 3.4:", knn_w.predict([[3.4]]).round(3))

# Neither model can predict beyond the range it saw
print("tree at x=100 :", tree.predict([[100]]), "  KNN at x=100:", KNeighborsRegressor(3).fit(X, y).predict([[100]]))

# Output:
# tree split at : 3.5
# leaf values   : [ 5.333 13.   ]
# KNN k=1 at 3.4: [5.]
# KNN k=3 at 3.4: [7.667]
# KNN k=3 distance-weighted at 3.4: [7.537]
# tree at x=100 : [13.]   KNN at x=100: [13.]` },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Growing a regression tree until every leaf has one row", fix: "That memorises noise. Limit `max_depth` or `min_samples_leaf` and tune them with cross-validation." },
              { mistake: "Running KNN on unscaled features", fix: "Standardise first; otherwise the feature with the biggest units decides every distance." },
              { mistake: "Expecting trees or KNN to predict beyond the training range", fix: "They return values near the edge. Use a linear or trend component if extrapolation matters." },
              { mistake: "Picking k by training error", fix: "k = 1 always has zero training error. Choose k on validation data." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Why trees are greedy.** Finding the best possible tree is computationally intractable, so trees choose the best split now without looking ahead. A split that looks weak alone might enable great splits later; the greedy tree will miss it. Ensembles (random forests, gradient boosting) largely fix this." },
          { p: "**Cost-complexity pruning.** Grow a big tree, then remove branches whose error reduction is less than $\\alpha$ times the number of leaves they add: minimise $\\text{SSE} + \\alpha \\cdot |\\text{leaves}|$. Larger $\\alpha$ gives a smaller tree. Choose $\\alpha$ by cross-validation (`ccp_alpha` in scikit-learn)." },
          { p: "**Curse of dimensionality for KNN.** In many dimensions, all points become nearly equally far apart, so \"nearest\" stops meaning \"similar\". KNN works best with few, informative, scaled features." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Targets in a leaf are 10, 12, 20. What does the leaf predict under squared error? Under absolute error?", solution: [{ p: "Squared error: the mean, 14. Absolute error: the median, 12. The outlier 20 pulls the mean but not the median." }] } },
          { problem: { q: "Using the six-point data, what is the SSE for the split x < 1.5?", solution: [{ p: "Left {5}: SSE 0. Right {6, 5, 12, 13, 14}: mean 10, SSE = 16 + 25 + 4 + 9 + 16 = 70. Total 70, much worse than the split at 3.5." }] } },
          { problem: { q: "With k = 5 on the six points, what does KNN predict at x = 3.4? Why is it worse than k = 3?", solution: [{ p: "The five nearest are x = 3, 4, 2, 5, 1 with targets 5, 12, 6, 13, 5, so the prediction is 41/5 = 8.2. Large k mixes in points from both sides of the jump, blurring it (higher bias)." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["What does a regression tree leaf predict and why?", "What criterion does a regression tree use to choose splits?", "How does KNN regression differ from KNN classification?", "Why can't trees or KNN extrapolate?", "How does k control the bias–variance trade-off?", "What is cost-complexity pruning?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["A regression leaf predicts the mean (squared error) or median (absolute error) of its rows.", "Splits are chosen to give the largest drop in total SSE.", "KNN regression averages the k nearest targets, optionally weighted by 1/distance.", "Both models fit any shape but cannot extrapolate beyond the training range.", "Control overfitting with depth / leaf size (trees) and k (KNN); scale features for KNN."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Which split does a regression tree choose?", options: ["The one with the highest Gini", "The one that most reduces the sum of squared errors", "The middle of the feature range", "A random one"], answer: 1, why: "Regression trees use variance or SSE reduction; Gini and entropy are for classification." } },
          { quiz: { q: "Training data has x from 0 to 10. A tree is asked for x = 50. It predicts…", options: ["a value continuing the trend", "the value of the leaf at the right edge", "NaN", "zero"], answer: 1, why: "x = 50 follows the same splits as the largest training x, so it lands in the edge leaf and gets that leaf's mean." } },
          { quiz: { q: "KNN regression with k = 1 has zero training error. This means…", options: ["it is the best model", "it is probably overfitting", "features are scaled", "k should be 0"], answer: 1, why: "Each training point is its own nearest neighbour, so training error is always 0 for k = 1. That tells you nothing about test error." } },
        ],
      },
    ],
  },
];
