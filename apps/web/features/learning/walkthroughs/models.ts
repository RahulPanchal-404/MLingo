import type { Section } from "@/features/theory/topics";

const r = String.raw;

/**
 * Walkthroughs for the Regression and Classification lessons, drawn from the MLingo textbook draft
 * (Vol 1 Units 2, 6, 12; Vol 2 Units 6, 9, 11) and released one idea at a time.
 */
export const MODEL_WALKTHROUGHS: Record<string, Section[]> = {
  "linear-regression": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Linear regression in one line", body: "Linear regression predicts a number as a straight-line function of the inputs, ŷ = b₀ + b₁x, choosing b₀ and b₁ to make the sum of squared residuals as small as possible (ordinary least squares)." } },
        { p: "The **residual** for row $i$ is $e_i = y_i - \\hat y_i$: actual minus predicted. Least squares minimises $S(b_0, b_1) = \\sum_i (y_i - b_0 - b_1 x_i)^2$. Squaring stops positive and negative misses from cancelling, and punishes large misses more." },
      ],
    },
    {
      heading: "Intuition: compressor energy",
      blocks: [
        { p: "A cold-storage operator records compressor cycles $x = (1, 2, 3)$ and energy use $y = (2, 3, 5)$. We want the single straight line that sits closest to all three points, judged by squared vertical distances." },
      ],
    },
    {
      heading: "Step 1: derive the formulas",
      blocks: [
        { p: "Set the partial derivatives of $S$ to zero. The derivative for $b_0$ gives $\\sum_i (y_i - b_0 - b_1 x_i) = 0$, which means $b_0 = \\bar y - b_1\\bar x$. Substitute that into the derivative for $b_1$:" },
        { math: r`b_1 = \frac{\sum_i (x_i - \bar x)(y_i - \bar y)}{\sum_i (x_i - \bar x)^2}, \qquad b_0 = \bar y - b_1\bar x` },
        { p: "**Read it:** the top measures how $x$ and $y$ move together; the bottom measures how much $x$ varies. If every $x_i$ is identical, the bottom is 0 and the data cannot identify a slope." },
      ],
    },
    {
      heading: "Step 2: work it by hand",
      blocks: [
        {
          steps: [
            { title: "Means", body: "", math: r`\bar x = 2, \qquad \bar y = \tfrac{10}{3}` },
            { title: "Centred x", body: "(−1, 0, 1), so the denominator is 1 + 0 + 1 = 2." },
            { title: "Numerator", body: "", math: r`(-1)(2 - \tfrac{10}{3}) + 0 + (1)(5 - \tfrac{10}{3}) = \tfrac43 + \tfrac53 = 3` },
            { title: "Slope and intercept", body: "", math: r`b_1 = \tfrac32 = 1.5, \qquad b_0 = \tfrac{10}{3} - 1.5 \times 2 = \tfrac13` },
            { title: "Residuals", body: "Predictions 1.833, 3.333, 4.833 give residuals 0.167, −0.333, 0.167. They sum to zero because the model has an intercept. The squared-error sum is 1/6." },
          ],
        },
        { figure: { src: "/theory/figures/m_linear_fit.svg", alt: "Three points with the fitted line ŷ = 1/3 + 1.5x and red residual sticks.", caption: "The least-squares line through (1, 2), (2, 3), (3, 5). The red sticks are the residuals; no other line gives a smaller sum of their squares." } },
      ],
    },
    {
      heading: "Step 3: many features, the matrix form",
      blocks: [
        { p: "With $p$ inputs, $\\hat y_i = \\beta_0 + \\sum_j \\beta_j x_{ij}$. Put a column of ones in the design matrix $X$ for the intercept. The objective is $\\lVert y - X\\beta\\rVert^2$; differentiating gives the **normal equations**:" },
        { math: r`X^\top X\,\beta = X^\top y \quad\Rightarrow\quad \beta = (X^\top X)^{-1}X^\top y \text{ (when invertible)}` },
        { p: "If two columns are almost duplicates, $X^\\top X$ is badly conditioned: coefficients swing with small data changes while predictions barely move. That is **multicollinearity**. Remove redundant features, collect more varied data, or regularise." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Compressor energy example from the MLingo textbook (Vol 1, Unit 2.3)
import numpy as np
from sklearn.linear_model import LinearRegression

x = np.array([1.0, 2.0, 3.0])          # compressor cycles
y = np.array([2.0, 3.0, 5.0])          # energy use
x_bar, y_bar = x.mean(), y.mean()
b1 = np.sum((x - x_bar) * (y - y_bar)) / np.sum((x - x_bar) ** 2)
b0 = y_bar - b1 * x_bar
pred = b0 + b1 * x
res = y - pred
print(f"slope b1 = {b1:.4f}, intercept b0 = {b0:.4f}")
print("predictions:", pred.round(3), " residuals:", res.round(3), " sum of residuals:", abs(round(res.sum(), 12)))
print("sum of squared errors:", round(np.sum(res ** 2), 4), "(= 1/6)")

model = LinearRegression().fit(x.reshape(-1, 1), y)      # scikit-learn agrees
print("sklearn:", round(model.coef_[0], 4), round(model.intercept_, 4))
print("prediction at x = 10 (extrapolation, use with care):", round(model.predict([[10]])[0], 3))

# Output:
# slope b1 = 1.5000, intercept b0 = 0.3333
# predictions: [1.833 3.333 4.833]  residuals: [ 0.167 -0.333  0.167]  sum of residuals: 0.0
# sum of squared errors: 0.1667 (= 1/6)
# sklearn: 1.5 0.3333
# prediction at x = 10 (extrapolation, use with care): 15.333` },
        { p: "A fourth reading at $x = 10$ is far outside the observed range (1 to 3). The line will happily predict 15.3, but that is **extrapolation**, not evidence that energy use stays linear that far out." },
      ],
    },
    {
      heading: "Assumptions and checks",
      blocks: [
        { p: "Least squares gives good predictions without requiring normally distributed data. The textbook's checks for trustworthy coefficients and intervals:" },
        { list: ["The average relationship is adequately captured by the chosen features. A curved residual pattern suggests a missing non-linear term.", "Errors do not depend on each other. A repeated weekly cycle in residuals suggests serial dependence.", "Error spread is roughly constant. A widening fan suggests unequal variance.", "A small p-value on a coefficient does not fix a misspecified model, and coefficients are associations, not causal effects."] },
      ],
    },
    {
      heading: "Advantages and limitations",
      blocks: [
        { table: { head: ["Advantages", "Limitations"], rows: [["Fast, exact solution; easy to explain", "Only straight-line (linear-in-weights) shapes"], ["Coefficients have units and meaning", "Sensitive to outliers (squared error)"], ["A strong baseline for any regression task", "Unstable coefficients with collinear features"], ["Works with little data", "Extrapolates confidently beyond the data"]] } },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Why do the residuals sum to zero?", solution: [{ p: "The normal equation for the intercept is Σ(yᵢ − ŷᵢ) = 0. It holds whenever the model includes an intercept." }] } },
        { problem: { q: "Should I report R² or MAE?", solution: [{ p: "Both. MAE (or RMSE) is in the target's units; R² compares with predicting the mean. On a test set R² can be negative if the model is worse than that baseline." }] } },
        { problem: { q: "Is a large coefficient an important feature?", solution: [{ p: "Not necessarily: coefficients depend on units. Standardise features before comparing sizes, and remember a coefficient holds the other features fixed." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "Add a fourth point x = 4, y = 4 to the compressor data. Recompute b₁ and b₀.", solution: [{ p: "x̄ = 2.5, ȳ = 3.5. Centred x: −1.5, −0.5, 0.5, 1.5; centred y: −1.5, −0.5, 1.5, 0.5. Numerator 2.25 + 0.25 + 0.75 + 0.75 = 4; denominator 2.25 + 0.25 + 0.25 + 2.25 = 5. b₁ = 0.8 and b₀ = 3.5 − 0.8 × 2.5 = 1.5. The slope flattens: ordinary sensitivity to new data, not a bug." }] } },
      ],
    },
  ],

  "polynomial-regression": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Polynomial regression in one line", body: "Polynomial regression adds powers and products of the inputs as extra columns (x², x₁x₂, …) and then runs ordinary linear regression, so the prediction can curve while staying linear in its coefficients." } },
        { p: "For two inputs, a degree-two model uses the feature vector $\\phi(x) = (1, x_1, x_2, x_1^2, x_1x_2, x_2^2)$ and predicts $\\hat y = \\theta^\\top\\phi(x)$: quadratic in the inputs, linear in the six parameters." },
      ],
    },
    {
      heading: "Intuition: effects that depend on each other",
      blocks: [
        { p: "In building-energy forecasting, the effect of opening hours depends on outdoor temperature: a long day costs more energy on a hot day. A straight line cannot express that, but an **interaction** column $x_1x_2$ can." },
      ],
    },
    {
      heading: "Step 1: read an interaction",
      blocks: [
        { p: "Take $\\hat y = b_0 + b_1x_1 + b_2x_2 + b_3x_1x_2$. The change in $\\hat y$ for a small increase in $x_1$, holding $x_2$ fixed, is:" },
        { math: r`\frac{\partial\hat y}{\partial x_1} = b_1 + b_3\,x_2` },
        {
          steps: [
            { title: "A concrete model", body: "ŷ = 2 + 3x₁ + 4x₂ + 5x₁x₂." },
            { title: "At (1, 2)", body: "The terms are 2, 3, 8, 10, so ŷ = 23." },
            { title: "Raise x₁ to 2", body: "ŷ = 2 + 6 + 8 + 20 = 36, an increase of 13. The formula agrees: 3 + 5 × 2 = 13." },
            { title: "At x₂ = 0", body: "One more unit of x₁ adds only 3. The effect of x₁ is not one global number when there is an interaction." },
          ],
        },
      ],
    },
    {
      heading: "Step 2: count the columns before fitting",
      blocks: [
        { p: "With $p$ original features, all terms up to total degree $d$ (including the constant) number:" },
        { math: r`\binom{p + d}{d}` },
        { p: "Degree 2 with $p = 3$ gives 10 columns; with $p = 100$ it gives 5,151. This combinatorial growth means more computation and much more risk of overfitting. Add interactions from domain knowledge where possible, and regularise." },
      ],
    },
    {
      heading: "Step 3: too low, just right, too high",
      blocks: [
        { p: "Fit degrees 1, 2 and 9 to 15 noisy points from a curve, then test on 200 fresh points:" },
        { code: r`# Polynomial features and interactions, from the MLingo textbook (Vol 1, Unit 12.4)
import numpy as np
from math import comb
from sklearn.preprocessing import PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.pipeline import make_pipeline

def predict(x1, x2):                       # ŷ = 2 + 3x1 + 4x2 + 5x1x2
    return 2 + 3 * x1 + 4 * x2 + 5 * x1 * x2
print("ŷ(1,2) =", predict(1, 2), " ŷ(2,2) =", predict(2, 2), " change =", predict(2, 2) - predict(1, 2), "(= 3 + 5·x2)")
print("at x2 = 0, one more x1 changes ŷ by", predict(2, 0) - predict(1, 0))

for p in (3, 100):
    print(f"degree-2 columns for p={p}: {comb(p + 2, 2):,}")

# Fit degrees 1, 2 and 9 on 15 noisy points from a curve; test on fresh points
rng = np.random.default_rng(0)
f = lambda x: 1 + 0.6 * x - 0.3 * x ** 2
x_tr = np.sort(rng.uniform(-2, 2, 15)); y_tr = f(x_tr) + rng.normal(0, 0.3, 15)
x_te = np.linspace(-2, 2, 200);         y_te = f(x_te) + rng.normal(0, 0.3, 200)
for d in (1, 2, 9):
    m = make_pipeline(PolynomialFeatures(d), LinearRegression()).fit(x_tr[:, None], y_tr)
    tr = np.mean((m.predict(x_tr[:, None]) - y_tr) ** 2); te = np.mean((m.predict(x_te[:, None]) - y_te) ** 2)
    out = m.predict([[3.0]])[0]
    print(f"degree {d}: train MSE {tr:.3f}  test MSE {te:.3f}  prediction at x=3 (outside data): {out:8.2f}  (truth {f(3):.2f})")

# Output:
# ŷ(1,2) = 23  ŷ(2,2) = 36  change = 13 (= 3 + 5·x2)
# at x2 = 0, one more x1 changes ŷ by 3
# degree-2 columns for p=3: 10
# degree-2 columns for p=100: 5,151
# degree 1: train MSE 0.235  test MSE 0.281  prediction at x=3 (outside data):     2.64  (truth 0.10)
# degree 2: train MSE 0.033  test MSE 0.106  prediction at x=3 (outside data):    -0.62  (truth 0.10)
# degree 9: train MSE 0.018  test MSE 0.358  prediction at x=3 (outside data):   -56.68  (truth 0.10)` },
        { figure: { src: "/theory/figures/m_poly_degrees.svg", alt: "Training points with fitted curves of degree 1, 2 and 9; degree 9 wiggles and shoots off outside the data range.", caption: "Degree 1 underfits (too straight). Degree 2 matches the true curve. Degree 9 bends through the noise (lowest training error, worst test error) and explodes in the shaded region outside the training data." } },
        { p: "**Read the output:** training error always falls as degree rises, but test error is lowest at degree 2. Outside the data (x = 3), degree 9 predicts −56.7 when the truth is 0.1. A polynomial fitted in a narrow range can produce absurd values outside it." },
      ],
    },
    {
      heading: "Advantages and limitations",
      blocks: [
        { table: { head: ["Advantages", "Limitations"], rows: [["Captures curves and interactions with plain linear regression", "Columns grow combinatorially with degree"], ["Coefficients still solvable exactly", "High degrees overfit and extrapolate wildly"], ["Easy to add specific, meaningful terms", "Powers of large values need scaling"]] } },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Is polynomial regression a linear model?", solution: [{ p: "Yes, in the sense that matters for fitting: it is linear in its coefficients, so least squares still applies. It is non-linear in the original inputs." }] } },
        { problem: { q: "How do I choose the degree?", solution: [{ p: "Use validation or cross-validation error, not training error. Prefer the simplest degree near the minimum, and add regularisation if you keep many terms." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "For ŷ = 1 + 2x₁ − x₂ + 0.5x₁x₂, what is the effect of one more unit of x₁ when x₂ = 4?", solution: [{ p: "∂ŷ/∂x₁ = 2 + 0.5 × 4 = 4." }] } },
        { problem: { q: "How many columns does degree 3 create for p = 4 inputs?", solution: [{ p: "C(4 + 3, 3) = C(7, 3) = 35 columns, including the constant." }] } },
      ],
    },
  ],

  regularization: [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Regularisation in one line", body: "Regularisation adds a penalty on the size of the coefficients to the training loss, so among the coefficient vectors that fit the data reasonably well, the model prefers smaller, more stable ones." } },
        { p: "**Ridge** penalises the squared size ($\\lambda\\lVert\\beta\\rVert_2^2$) and shrinks everything smoothly. **Lasso** penalises absolute size ($\\lambda\\lVert\\beta\\rVert_1$) and can set coefficients exactly to zero. **Elastic net** uses both. The intercept is normally left unpenalised." },
      ],
    },
    {
      heading: "Intuition: correlated building features",
      blocks: [
        { p: "Predicting electricity use at public buildings, floor area and opening hours are correlated: bigger buildings tend to open longer. Many coefficient combinations fit the training months almost equally well. Regularisation picks the shortest, most stable one, which often predicts new months better." },
      ],
    },
    {
      heading: "Step 1: ridge, derived",
      blocks: [
        { math: r`J(\beta) = \lVert y - X\beta\rVert_2^2 + \lambda\lVert\beta\rVert_2^2` },
        { p: "Expand, differentiate and set to zero (as in least squares, plus $2\\lambda\\beta$ from the penalty):" },
        { math: r`\big(X^\top X + \lambda I\big)\,\beta = X^\top y` },
        { p: "For $\\lambda > 0$ the matrix $X^\\top X + \\lambda I$ is always invertible, because $v^\\top(X^\\top X + \\lambda I)v = \\lVert Xv\\rVert^2 + \\lambda\\lVert v\\rVert^2 > 0$. Ridge has one unique answer **even when columns are exact duplicates**." },
      ],
    },
    {
      heading: "Step 2: ridge on perfectly correlated columns, by hand",
      blocks: [
        { p: "Three centred rows $(-1, 1), (0, 0), (1, -1)$ with targets $(-2, 0, 2)$. The second column is minus the first, so every pair with $\\beta_1 - \\beta_2 = 2$ fits perfectly: least squares has no unique answer." },
        {
          steps: [
            { title: "Build the system", body: "", math: r`X^\top X = \begin{bmatrix}2 & -2\\-2 & 2\end{bmatrix} \text{ (singular)}, \qquad X^\top y = \begin{bmatrix}4\\-4\end{bmatrix}` },
            { title: "Add λ = 2", body: "", math: r`\begin{bmatrix}4 & -2\\-2 & 4\end{bmatrix}\beta = \begin{bmatrix}4\\-4\end{bmatrix}, \quad \det = 16 - 4 = 12` },
            { title: "Solve", body: "", math: r`\beta_1 = \tfrac{16 - 8}{12} = \tfrac23, \qquad \beta_2 = -\tfrac23` },
            { title: "Read it", body: "The prediction at (1, −1) is 4/3 rather than the observed 2. Ridge accepts some training error to get a short, unique coefficient vector, which helps when the training data is noisy." },
          ],
        },
        { p: "**One feature:** with $q = \\sum x_i^2 = 10$ and $z = \\sum x_i y_i = 20$, least squares gives $z/q = 2$ and ridge with $\\lambda = 5$ gives $z/(q + \\lambda) = 4/3$." },
      ],
    },
    {
      heading: "Step 3: lasso and the soft-threshold",
      blocks: [
        { math: r`J(\beta) = \tfrac12\lVert y - X\beta\rVert_2^2 + \lambda\sum_j |\beta_j|` },
        { p: "$|\\beta|$ has a corner at 0, where its slope can be anything in $[-1, 1]$. That corner is why lasso can land exactly on zero. For one feature the solution is the **soft-threshold**:" },
        { math: r`\beta = \frac{S(z, \lambda)}{q}, \qquad S(z, \lambda) = \operatorname{sign}(z)\,\max\{|z| - \lambda,\ 0\}` },
        { list: ["$q = 2$, $z = 4$, $\\lambda = 1$: $\\beta = (4 - 1)/2 = 1.5$.", "$q = 2$, $z = 0.5$, $\\lambda = 1$: $|z| \\le \\lambda$, so $\\beta = 0$ exactly. The feature is dropped.", "With many features, **coordinate descent** applies this update to one coefficient at a time, using the residual left by the others."] },
      ],
    },
    {
      heading: "Step 4: elastic net",
      blocks: [
        { math: r`\beta \leftarrow \frac{S(z, \lambda_1)}{q + \lambda_2}` },
        { p: "The L1 part can zero coefficients; the L2 part shrinks the survivors and shares weight among correlated features. With $q = 2$, $z = 4$, $\\lambda_1 = \\lambda_2 = 1$: $(4 - 1)/(2 + 1) = 1$." },
        { figure: { src: "/theory/figures/m_ridge_lasso.svg", alt: "Coefficient paths: ridge coefficients shrink smoothly towards zero; lasso coefficients drop to exactly zero one by one as the penalty grows.", caption: "As λ grows, ridge (left) shrinks every coefficient smoothly but never to exactly 0. Lasso (right) drops coefficients to exactly 0 one at a time, starting with the weakest; x2, a near-copy of x1, is dropped immediately." } },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Ridge, lasso and elastic net, from the MLingo textbook (Vol 1, Unit 12)
import math
import numpy as np

# 1) Ridge on two perfectly correlated centred columns (x2 = −x1)
X = np.array([[-1, 1], [0, 0], [1, -1]], dtype=float)
y = np.array([-2, 0, 2], dtype=float)
print("XᵀX =", (X.T @ X).tolist(), "  det =", round(np.linalg.det(X.T @ X), 6), "(no unique least-squares answer)")
lam = 2.0
beta = np.linalg.solve(X.T @ X + lam * np.eye(2), X.T @ y)
print("ridge λ=2:", beta.round(4), " prediction at (1,-1):", round(X[2] @ beta, 4), "(observed 2)")

# 2) One feature: ridge shrinks, lasso can zero out
q, z = 10.0, 20.0
print("single feature: OLS", z / q, " ridge λ=5:", round(z / (q + 5), 4))

def soft_threshold(value, penalty):
    return math.copysign(max(abs(value) - penalty, 0.0), value)

for q, z, lam1 in ((2, 4, 1), (2, 0.5, 1)):
    print(f"lasso q={q}, z={z}, λ={lam1}: β = {soft_threshold(z, lam1) / q}")
print("elastic net q=2, z=4, λ1=1, λ2=1: β =", soft_threshold(4, 1) / (2 + 1))

# Output:
# XᵀX = [[2.0, -2.0], [-2.0, 2.0]]   det = 0.0 (no unique least-squares answer)
# ridge λ=2: [ 0.6667 -0.6667]  prediction at (1,-1): 1.3333 (observed 2)
# single feature: OLS 2.0  ridge λ=5: 1.3333
# lasso q=2, z=4, λ=1: β = 1.5
# lasso q=2, z=0.5, λ=1: β = 0.0
# elastic net q=2, z=4, λ1=1, λ2=1: β = 1.0` },
      ],
    },
    {
      heading: "How to choose λ correctly",
      blocks: [
        { list: ["Scale features first (on training data only): the same λ treats a unit change of each column differently otherwise.", "Tune λ by cross-validation that matches deployment: later months for forecasting, whole held-out buildings for new buildings.", "Fit scaling, imputation and λ inside each training fold, then test once on an untouched later period.", "Too strong: predictions collapse towards the mean (underfit). Too weak: unstable coefficients and overfitting."] },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Why is the intercept not penalised?", solution: [{ p: "Penalising it would pull predictions towards zero for no reason. The usual approach is to centre the data, fit β, then recover b₀ = ȳ − Σβⱼx̄ⱼ." }] } },
        { problem: { q: "Lasso keeps switching which of two similar features it keeps. Is that a bug?", solution: [{ p: "No. With near-duplicate features, lasso keeps one somewhat arbitrarily. If forecasts are stable, that is fine; if you need stable selection, try elastic net. A selected feature is not proven to be a cause." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "One feature with q = 4, z = 6. Compute OLS, ridge (λ = 2), lasso (λ = 2) and lasso (λ = 7).", solution: [{ p: "OLS 6/4 = 1.5. Ridge 6/6 = 1.0. Lasso λ = 2: (6 − 2)/4 = 1.0. Lasso λ = 7: |6| ≤ 7, so β = 0." }] } },
      ],
    },
  ],

  "logistic-regression": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Logistic regression in one line", body: "Logistic regression computes a linear score z = b + wᵀx and passes it through the sigmoid σ(z) = 1/(1 + e⁻ᶻ) to get a probability between 0 and 1; the model is linear in the log-odds." } },
        { p: "Linear regression can predict values below 0 or above 1, which makes no sense for a probability. The sigmoid squashes any real score into $(0, 1)$, and its inverse is the log-odds: $\\ln\\frac{p}{1 - p} = z$." },
      ],
    },
    {
      heading: "Intuition: will a refrigeration unit need service?",
      blocks: [
        { p: "From the textbook: predict whether an industrial refrigeration unit needs an unscheduled service visit within 30 days, using compressor age, prior alerts and model family, all known at decision time. The output is a probability that feeds a decision, such as which five units to inspect today." },
      ],
    },
    {
      heading: "Step 1: odds, not probabilities",
      blocks: [
        { p: "Raising a feature by one unit adds its coefficient $w_j$ to the log-odds, so it **multiplies the odds** by $e^{w_j}$. It does not add a fixed amount of probability." },
        {
          steps: [
            { title: "Take w = ln 2", body: "The odds double." },
            { title: "Start at p = 0.1", body: "Odds are 1/9. Doubled: 2/9, so p = 2/11 ≈ 0.182, not 0.2." },
            { title: "Start at p = 0.5", body: "Odds are 1. Doubled: 2, so p = 2/3 ≈ 0.667." },
          ],
        },
        { figure: { src: "/theory/figures/m_sigmoid_odds.svg", alt: "Sigmoid curve with two arrows: from 0.1 to 0.182 and from 0.5 to 0.667, both from adding log 2 to the score.", caption: "The same step along the score axis (+ln 2, doubling the odds) moves the probability by 0.082 near the bottom and by 0.167 in the middle." } },
      ],
    },
    {
      heading: "Step 2: the loss comes from likelihood",
      blocks: [
        { p: "The probability given to the observed label is $p_i^{y_i}(1 - p_i)^{1 - y_i}$. Multiplying over rows and taking the negative average log gives **binary cross-entropy**:" },
        { math: r`J(w, b) = -\frac1n\sum_i\big[y_i\ln p_i + (1 - y_i)\ln(1 - p_i)\big]` },
        { p: "For $y = 1$: $p = 0.9$ costs 0.105, but $p = 0.01$ costs 4.605, so a confident miss is punished hard." },
      ],
    },
    {
      heading: "Step 3: the gradient simplifies beautifully",
      blocks: [
        { p: "The sigmoid's derivative is $p(1 - p)$, and combining it with the loss gives a derivative with respect to the score of simply $p_i - y_i$. So:" },
        { math: r`\nabla_w J = \frac1n X^\top(p - y), \qquad \frac{\partial J}{\partial b} = \frac1n\sum_i (p_i - y_i)` },
        {
          steps: [
            { title: "One observation", body: "x = 2, y = 1, intercept fixed at 0, start w = 0, η = 0.1." },
            { title: "Predict", body: "z = 0, so p = 0.5." },
            { title: "Gradient", body: "x(p − y) = 2(−0.5) = −1." },
            { title: "Update", body: "w = 0 − 0.1(−1) = 0.1. The new score is 0.2 and p ≈ 0.550: one step towards the true label." },
          ],
        },
        { p: "The loss is **convex**, so there is one best solution. But if one feature perfectly separates the classes, unpenalised coefficients grow without limit. Regularisation keeps them finite, and also check that the separating feature is not leakage." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Logistic regression, from the MLingo textbook (Vol 1 Unit 2.4, Vol 2 Unit 6)
import math

sigmoid = lambda z: 1 / (1 + math.exp(-z))

# Same coefficient (log 2 = odds double), different probability changes
for p0 in (0.1, 0.5):
    odds = p0 / (1 - p0) * 2
    print(f"start p={p0}: odds x2 -> p = {odds / (1 + odds):.4f}")

# Log loss for one positive example
for p in (0.9, 0.01):
    print(f"y=1, p={p}: loss {-math.log(p):.3f}")

# One gradient step: x = 2, y = 1, start β = 0, η = 0.1
x, y, beta, eta = 2.0, 1, 0.0, 0.1
p = sigmoid(beta * x)
grad = x * (p - y)
beta -= eta * grad
print(f"p before {p:.3f}, gradient {grad:.3f}, new β {beta:.3f}, new p {sigmoid(beta * x):.3f}")

# Output:
# start p=0.1: odds x2 -> p = 0.1818
# start p=0.5: odds x2 -> p = 0.6667
# y=1, p=0.9: loss 0.105
# y=1, p=0.01: loss 4.605
# p before 0.500, gradient -1.000, new β 0.100, new p 0.550` },
      ],
    },
    {
      heading: "From probabilities to actions",
      blocks: [
        { p: "The 0.5 threshold is a software default, not a rule. If the crew can inspect five units a day, sort by probability and inspect the top five. If costs differ by unit, maximise expected value. A model with probabilities 0.20 and 0.60 flags only the second at threshold 0.5 and with a capacity of one, but at threshold 0.1 flags both, exceeding capacity. Thresholds and capacity rules are different decisions." },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Why not use squared error for classification?", solution: [{ p: "Squared error with a sigmoid gives a non-convex loss with flat regions. Cross-entropy is the Bernoulli likelihood, is convex, and its gradient is simply Xᵀ(p − y)/n." }] } },
        { problem: { q: "Is e^w a probability ratio?", solution: [{ p: "No, it is an odds ratio. At p = 0.1, odds × 1.5 gives p ≈ 0.143; at p = 0.5, odds × 1.5 gives p = 0.6. The same coefficient changes probabilities by different amounts." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "A coefficient is ln 3. A unit starts at p = 0.25. What is p after one unit increase?", solution: [{ p: "Odds 0.25/0.75 = 1/3. Tripled: 1. p = 1/(1 + 1) = 0.5." }] } },
        { problem: { q: "One row x = 1, y = 0, w = 0, η = 0.5. Do one update.", solution: [{ p: "p = 0.5, gradient = 1 × (0.5 − 0) = 0.5, w = 0 − 0.5 × 0.5 = −0.25, new p = σ(−0.25) ≈ 0.438, moving towards 0." }] } },
      ],
    },
  ],

  "k-nearest-neighbors": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "KNN in one line", body: "K-nearest neighbours predicts a new point's class by finding the k training points closest to it (by a chosen distance) and taking a vote among their labels." } },
        { p: "KNN has no training step: it stores the data and does all the work at prediction time. A complete specification needs the distance, the value of $k$, the voting rule, and a **tie rule**." },
      ],
    },
    {
      heading: "Intuition: pump defects",
      blocks: [
        { p: "From the textbook: six pumps with two scaled sensor readings and a defect label." },
        { table: { head: ["Row", "Coordinates", "Defect"], rows: [["A", "(0, 0)", "0"], ["B", "(0, 2)", "0"], ["C", "(2, 0)", "0"], ["D", "(6, 6)", "1"], ["E", "(6, 8)", "1"], ["F", "(8, 6)", "1"]] } },
        { p: "A new pump's readings land somewhere on this map. Pumps that read similarly probably share its condition, so look at its closest neighbours." },
      ],
    },
    {
      heading: "Step 1: measure distance",
      blocks: [
        { math: r`d_2(x, z) = \sqrt{\textstyle\sum_j (x_j - z_j)^2} \;\;\text{(Euclidean)}, \qquad d_1(x, z) = \textstyle\sum_j |x_j - z_j| \;\;\text{(Manhattan)}` },
        { p: "To rank neighbours, squared distance is enough: taking the square root does not change the order." },
      ],
    },
    {
      heading: "Step 2: find the k nearest and vote",
      blocks: [
        {
          steps: [
            { title: "Query Q = (3, 4)", body: "Squared distances to A–F: 25, 13, 17, 13, 25, 29." },
            { title: "Sort", body: "B and D tie at 13, then C at 17. With the alphabetical tie rule, B comes before D." },
            { title: "Vote with k = 3", body: "Labels (0, 1, 0), so predict 0 (no defect)." },
            { title: "With k = 1", body: "The B/D tie means the answer depends entirely on the tie rule. \"Pick the nearest\" is incomplete on an equidistant boundary." },
            { title: "Query Q2 = (5, 6)", body: "Squared distances 61, 41, 45, 1, 5, 9. The three closest (D, E, F) are all 1, so predict defect." },
          ],
        },
        { figure: { src: "/theory/figures/m_knn_pumps.svg", alt: "Six pumps: three no-defect near the origin and three defect near (7,7); query stars at (3,4) and (5,6) with a dashed circle around (3,4).", caption: "The dashed circle around Q(3, 4) reaches its three nearest pumps B, D and C (two of them are no-defect). Q(5, 6) sits among the defect pumps." } },
      ],
    },
    {
      heading: "Step 3: scale features, or the units decide",
      blocks: [
        { p: "Query (vibration 2, age 100 days); A = (3, 100), B = (2, 110). With age in days, A is 1 away and B is 10 away, so A is nearer. With age in years, B is only 0.027 away and becomes nearest. The pumps did not change, only the units." },
        { p: "**Fix:** standardise each feature using the mean and spread from the training data only, and apply the same numbers to new points. Irrelevant features are a further problem: each pure-noise coordinate adds about 2 to the expected squared distance, swamping the useful signal." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# K-nearest neighbours, from the MLingo textbook (Vol 2, Unit 9): six scaled pump vectors
import numpy as np

rows = {"A": (0, 0), "B": (0, 2), "C": (2, 0), "D": (6, 6), "E": (6, 8), "F": (8, 6)}
label = {"A": 0, "B": 0, "C": 0, "D": 1, "E": 1, "F": 1}

def knn(query, k):
    d2 = {r: (query[0] - x) ** 2 + (query[1] - y) ** 2 for r, (x, y) in rows.items()}
    order = sorted(d2, key=lambda r: (d2[r], r))         # tie rule: alphabetical row ID
    nearest = order[:k]
    votes = [label[r] for r in nearest]
    return d2, nearest, max(set(votes), key=votes.count)

for q in ((3, 4), (5, 6)):
    d2, nearest, pred = knn(q, 3)
    print(f"query {q}: squared distances {d2} -> 3 nearest {nearest} -> predict {pred}")

# Units change who is "near": query (vibration=2, age=100 days)
q, A, B = np.array([2, 100.]), np.array([3, 100.]), np.array([2, 110.])
print("age in days : dist to A", np.linalg.norm(q - A), " dist to B", np.linalg.norm(q - B))
s = np.array([1, 1 / 365])
print("age in years: dist to A", np.linalg.norm((q - A) * s), " dist to B", round(np.linalg.norm((q - B) * s), 4))

# Output:
# query (3, 4): squared distances {'A': 25, 'B': 13, 'C': 17, 'D': 13, 'E': 25, 'F': 29} -> 3 nearest ['B', 'D', 'C'] -> predict 0
# query (5, 6): squared distances {'A': 61, 'B': 41, 'C': 45, 'D': 1, 'E': 5, 'F': 9} -> 3 nearest ['D', 'E', 'F'] -> predict 1
# age in days : dist to A 1.0  dist to B 10.0
# age in years: dist to A 1.0  dist to B 0.0274` },
      ],
    },
    {
      heading: "Choosing k and other options",
      blocks: [
        { list: ["**Small k:** follows local noise (high variance). **Large k:** blurs real boundaries (high bias). Choose by validation.", "**Distance weighting:** weight each vote by 1/d so very close points count more. If d = 0, use only the exact matches (never divide by zero).", "**Abstain** when the vote is tied or the nearest neighbour is very far away: send the case to a human and report how often that happens.", "**Cost:** prediction compares the query with all n rows, O(nd). Tree indexes or approximate search speed this up."] },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Is the share of neighbours voting 1 a probability?", solution: [{ p: "It is a score, not a calibrated probability: it depends on k, class prevalence and the features. Calibrate it on held-out data if you need real probabilities." }] } },
        { problem: { q: "Can I compute the scaling on all data before splitting?", solution: [{ p: "No: that leaks information from the test set. Scaling is part of the fitted model and must be learned from training data only." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "For query (1, 1) on the six pumps, which three are nearest and what is the prediction?", solution: [{ p: "Squared distances: A 2, B 2, C 2, D 50, E 74, F 74. The nearest are A, B, C (all 0), so predict no defect." }] } },
      ],
    },
  ],

  "decision-trees": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Decision tree in one line", body: "A decision tree splits the data with a sequence of yes/no questions on features, choosing each question to make the resulting groups as pure as possible, and predicts the majority class (or mean value) of the leaf a new point lands in." } },
      ],
    },
    {
      heading: "Intuition: component defects",
      blocks: [
        { p: "From the textbook: a manufacturer has 10 components, 4 defective and 6 sound. A tree asks questions such as \"is age above some threshold?\" and keeps the question that best separates defective from sound." },
      ],
    },
    {
      heading: "Step 1: measure impurity",
      blocks: [
        { math: r`G = 1 - \sum_k p_k^2 \;\;\text{(Gini)}, \qquad H = -\sum_k p_k\log_2 p_k \;\;\text{(entropy)}` },
        { p: "Both are 0 for a pure node. Gini is the chance that two labels drawn at random from the node disagree. For the parent (40% defective): $G = 1 - (0.4^2 + 0.6^2) = 0.48$ and $H \\approx 0.971$ bits." },
      ],
    },
    {
      heading: "Step 2: score a split by weighted child impurity",
      blocks: [
        { math: r`I_{\text{children}} = \frac{n_L}{n}I_L + \frac{n_R}{n}I_R, \qquad \text{gain} = I_{\text{parent}} - I_{\text{children}}` },
        {
          steps: [
            { title: "Split A: two halves of 5", body: "Left has 1 defect (Gini 0.32), right has 3 defects (Gini 0.48). Weighted 0.5 × 0.32 + 0.5 × 0.48 = 0.40. Gain 0.08." },
            { title: "Split B: 2 and 8", body: "The 2-row child holds 2 defects (pure, Gini 0). The 8-row child has 2 of 8 defective: 1 − (0.25² + 0.75²) = 0.375. Weighted 0.2 × 0 + 0.8 × 0.375 = 0.30. Gain 0.18." },
            { title: "With entropy", body: "Split A gains about 0.125 bits; split B gains about 0.322 bits. Both criteria prefer B here, though in general they can disagree." },
            { title: "Choose and repeat", body: "The tree takes split B, then repeats the search inside each child until a stopping rule (depth, minimum leaf size) is hit." },
          ],
        },
        { figure: { src: "/theory/figures/m_tree_splits.svg", alt: "Bars of weighted Gini and entropy for parent, split A and split B; split B is lowest.", caption: "Split B leaves the least impurity under both Gini and entropy. But its pure child has only 2 rows: a tiny leaf can be unstable on future data." } },
      ],
    },
    {
      heading: "Step 3: regression trees use squared error",
      blocks: [
        { p: "For predicting a number, a leaf predicts the **mean** of its rows, because $\\sum_i (y_i - c)^2$ is minimised at $c = \\bar y$. A split is scored by how much it reduces the total squared error. With absolute error, the leaf would predict the median instead." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Decision-tree splits, from the MLingo textbook (Vol 2, Unit 11): 10 components, 4 defective
from math import log2

gini = lambda p: 1 - (p ** 2 + (1 - p) ** 2)
entropy = lambda p: 0.0 if p in (0, 1) else -(p * log2(p) + (1 - p) * log2(1 - p))

def score(children, impurity):
    n = sum(size for size, _ in children)
    return sum(size / n * impurity(pos / size) for size, pos in children)

parent = [(10, 4)]
split_a = [(5, 1), (5, 3)]          # equal halves: 1 and 3 defects
split_b = [(2, 2), (8, 2)]          # a pure 2-row child, then 2 of 8
for name, imp in (("Gini", gini), ("entropy", entropy)):
    base = score(parent, imp)
    print(f"{name:<8} parent {base:.4f} | split A gain {base - score(split_a, imp):.4f} | split B gain {base - score(split_b, imp):.4f}")

# Output:
# Gini     parent 0.4800 | split A gain 0.0800 | split B gain 0.1800
# entropy  parent 0.9710 | split A gain 0.1245 | split B gain 0.3219` },
      ],
    },
    {
      heading: "Keep trees honest",
      blocks: [
        { list: ["**Depth and leaf size are regularisation:** limit `max_depth` and `min_samples_leaf`, or prune with a cost per leaf.", "**A 3-out-of-3 leaf is not certainty:** a raw proportion of 1.0 from three rows is weak evidence. Use a minimum leaf size and calibrate probabilities.", "**High-cardinality IDs** (plant ID, customer ID) can memorise rows. Check splits against held-out groups.", "**Leakage:** a post-inspection quality grade can split perfectly and be useless before inspection. Check timestamps first.", "**Gain is not causation:** information gain describes the training data, not why defects happen."] },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Do trees need feature scaling?", solution: [{ p: "No. Splits are thresholds on one feature at a time, so rescaling a feature does not change which rows go left or right." }] } },
        { problem: { q: "Gini or entropy?", solution: [{ p: "They usually choose similar splits. Gini is slightly cheaper (no logarithm); entropy has an information-theory meaning. Tune depth and leaf size first; they matter far more." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "A node has 5 positives and 5 negatives. A split gives children (4 pos, 1 neg) and (1 pos, 4 neg). Compute the Gini gain.", solution: [{ p: "Parent G = 0.5. Each child: 1 − (0.8² + 0.2²) = 0.32. Weighted 0.32, so the gain is 0.18." }] } },
      ],
    },
  ],
};
