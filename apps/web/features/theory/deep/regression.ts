import type { Deep } from "./types";

const r = String.raw;

export const DEEP_REGRESSION: Record<string, Deep> = {
  "linear-regression": {
    explain: [
      { p: "Linear regression draws the line (or plane) that keeps the vertical gaps between points and line as small as possible, measured by the sum of squared gaps. Squaring does two jobs: it makes every gap positive, and it makes the loss a smooth bowl with exactly one bottom, which is why there is a clean formula for the answer." },
      { p: "Read the slope as a rate: $w = 0.6$ means 'one more unit of $x$ goes with 0.6 more units of $y$, on average'. The intercept $b$ is the prediction when every feature is 0, which may be meaningless (a house with 0 m²) but is needed to place the line correctly. With several features, each weight is a **partial** effect: the change in prediction for one feature with all the others held fixed." },
      { p: "The slope formula has an intuitive form: $w = \\text{Cov}(x, y)/\\text{Var}(x)$. Covariance measures whether $x$ and $y$ move together; dividing by the variance of $x$ turns that into 'units of $y$ per unit of $x$'. It also links to correlation: $w = r\\,(s_y/s_x)$, where $r$ is the correlation coefficient. With standardised variables, the slope **is** the correlation." },
      { p: "Geometrically, least squares projects the target vector $\\mathbf{y}$ onto the space spanned by the feature columns. The residual vector $\\mathbf{y} - \\hat{\\mathbf{y}}$ is perpendicular to every feature column, which is exactly the normal equation $\\mathbf{X}^\\top(\\mathbf{y} - \\mathbf{X}\\mathbf{w}) = 0$. Two useful consequences: the residuals always sum to zero (when there is an intercept), and the fitted line passes through $(\\bar{x}, \\bar{y})$." },
      {
        table: {
          head: ["Quantity", "Formula", "Meaning"],
          rows: [
            ["SST (total)", "$\\sum (y_i - \\bar{y})^2$", "Variation in y around its mean"],
            ["SSE (residual)", "$\\sum (y_i - \\hat{y}_i)^2$", "Variation the model failed to explain"],
            ["SSR (regression)", "$\\sum (\\hat{y}_i - \\bar{y})^2$", "Variation the model explained"],
            ["Identity", "SST = SSR + SSE", "Holds for least squares with an intercept"],
            ["$R^2$", "SSR / SST = 1 − SSE / SST", "Share explained"],
          ],
        },
      },
      { p: "**Multicollinearity** is when features are strongly correlated with each other (area in m² and number of rooms). Predictions stay fine, but individual weights become unstable: the model can trade weight between the two features with almost no change in fit, so small data changes swing the coefficients wildly and their signs can even flip. The **variance inflation factor** $\\text{VIF}_j = 1/(1 - R_j^2)$, where $R_j^2$ comes from predicting feature $j$ from the others, flags it: above 5–10 is a warning." },
    ],
    extra: [
      {
        heading: "Categorical features and interactions",
        blocks: [
          { p: "Categories enter as one-hot (dummy) columns, dropping one category as the baseline. With city ∈ {Mysuru, Pune, Bengaluru} and Mysuru as baseline, the model $\\hat{y} = b + w_1\\,\\text{area} + w_2[\\text{Pune}] + w_3[\\text{Bengaluru}]$ says: Pune flats cost $w_2$ more than identical Mysuru flats." },
          { p: "An **interaction** term $x_1x_2$ lets one feature's effect depend on another. With $\\text{area} \\times [\\text{Bengaluru}]$, the price per m² can differ by city rather than only the base price." },
        ],
      },
      {
        heading: "Inference: is a weight real or noise?",
        blocks: [
          { p: "Statistics packages report a **standard error** for each weight, a t-statistic $t = w/\\text{SE}(w)$, and a p-value. Roughly, $|t| > 2$ suggests the weight is unlikely to be zero by chance, under the assumptions listed earlier on this page. scikit-learn focuses on prediction and does not report these; use `statsmodels` (`sm.OLS(y, sm.add_constant(X)).fit().summary()`) when you need them." },
        ],
      },
    ],
    practice: [
      {
        q: "Fit $\\hat{y} = wx + b$ to (1, 1), (2, 3), (3, 2), (4, 4). Then compute $R^2$.",
        solution: [
          { p: "$\\bar{x} = 2.5$, $\\bar{y} = 2.5$. Deviations of $x$: −1.5, −0.5, 0.5, 1.5; of $y$: −1.5, 0.5, −0.5, 1.5." },
          { math: r`w = \frac{2.25 - 0.25 - 0.25 + 2.25}{2.25 + 0.25 + 0.25 + 2.25} = \frac{4}{5} = 0.8, \qquad b = 2.5 - 0.8(2.5) = 0.5` },
          { p: "Predictions 1.3, 2.1, 2.9, 3.7; residuals −0.3, 0.9, −0.9, 0.3; SSE = 0.09 + 0.81 + 0.81 + 0.09 = 1.8. SST = 2.25 + 0.25 + 0.25 + 2.25 = 5." },
          { math: r`R^2 = 1 - \tfrac{1.8}{5} = 0.64` },
        ],
      },
      {
        q: "A model has $R^2 = 0.82$ on training data and $0.41$ on test data. What does this suggest and what would you try?",
        solution: [{ p: "Overfitting: the model explains the training data far better than new data. Try fewer features, ridge or lasso regularisation, more data, or check for leakage in the features that exist only in training." }],
      },
      {
        q: "Correlation between hours and marks is $r = 0.9$, the standard deviation of hours is 2 and of marks is 10. What is the regression slope of marks on hours?",
        solution: [{ math: r`w = r\,\frac{s_y}{s_x} = 0.9 \times \frac{10}{2} = 4.5 \text{ marks per hour}` }],
      },
    ],
    interview: [
      { q: "What are the assumptions of linear regression?", a: "Linearity in the parameters, independent errors, constant error variance (homoscedasticity), no perfect multicollinearity, and (for valid p-values and intervals) normally distributed errors. Prediction can still work when the last ones are violated; inference cannot." },
      { q: "Why squared error rather than absolute error?", a: "Squared error is smooth and gives a closed-form solution (the normal equation), corresponds to maximum likelihood under Gaussian noise, and predicts the conditional mean. Absolute error is more robust to outliers but has no closed form." },
      { q: "What happens to R² when you add a useless feature?", a: "Training R² never decreases, so it goes up slightly or stays the same. That is why adjusted R² or held-out evaluation is used to judge whether a feature helps." },
      { q: "How do you handle a non-linear relationship with linear regression?", a: "Transform features (polynomial terms, logs, splines, interactions) or the target. The model stays linear in the weights, so the same fitting method works." },
    ],
    summary: [
      "Model: $\\hat{y} = \\mathbf{w}^\\top\\mathbf{x} + b$; minimise squared error.",
      "Closed form: $\\mathbf{w} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{y}$; or gradient descent for big data.",
      "Slope = Cov(x, y) / Var(x); line passes through the means.",
      "$R^2$ = share of variance explained; compare on held-out data.",
      "Check residual plots for curves and funnels.",
      "Multicollinearity makes weights unstable, not predictions.",
    ],
    quiz: [
      { q: "With an intercept, the residuals of a least-squares fit always:", options: ["Are all positive", "Sum to zero", "Are normally distributed", "Equal the targets"], answer: 1, why: "The normal equation for the intercept is Σ(yᵢ − ŷᵢ) = 0." },
      { q: "Two features have a VIF of 25. What is the main consequence?", options: ["Predictions become wrong", "Individual coefficients become unstable and hard to interpret", "The model cannot be trained", "R² drops to zero"], answer: 1, why: "Strong collinearity inflates the variance of the weights, but the combined prediction is still fine." },
    ],
  },

  "polynomial-regression": {
    explain: [
      { p: "Many relationships curve: fuel use rises faster at high speed, crop yield rises with fertiliser and then falls. A straight line cannot follow that. Adding $x^2$ lets the model bend once, $x^3$ lets it change bend direction, and so on: a degree-$p$ polynomial can turn around up to $p - 1$ times." },
      { p: "Each extra degree adds flexibility, and flexibility is double-edged. With $n$ points, a polynomial of degree $n - 1$ can pass through every point exactly (zero training error) while swinging wildly between them. This is **Runge's phenomenon**: high-degree polynomials oscillate near the edges of the data. The training error is a terrible guide to the right degree; validation error is the right one." },
      { p: "Polynomial features are highly correlated with each other ($x$, $x^2$ and $x^3$ all increase together for positive $x$), which makes the weights unstable. Two habits help: **centre** $x$ before expanding (subtract the mean so the powers are less correlated), and **scale** after expanding. Adding ridge regularisation on top lets you use a generous degree while keeping the curve smooth." },
      { p: "With several inputs, the polynomial expansion includes **interaction terms**. Degree 2 on $(x_1, x_2)$ gives $1, x_1, x_2, x_1^2, x_1x_2, x_2^2$. The $x_1x_2$ term means the effect of $x_1$ depends on the value of $x_2$. If you only want interactions without powers, scikit-learn has `interaction_only=True`." },
      {
        table: {
          head: ["Alternative", "Idea", "Why use it"],
          rows: [
            ["Splines", "Piecewise low-degree polynomials joined smoothly at knots", "Flexible without wild edges"],
            ["Log / sqrt transforms", "Transform $x$ or $y$", "Simple curvature with one parameter"],
            ["Trees and boosting", "Step functions learned from data", "No need to choose the curve shape"],
            ["Kernel methods", "Implicit polynomial or RBF features", "High flexibility, regularised"],
          ],
        },
      },
    ],
    practice: [
      {
        q: "Expand the inputs $(x_1, x_2) = (2, 3)$ to all polynomial features up to degree 2 (including the bias).",
        solution: [{ math: r`[1,\; x_1,\; x_2,\; x_1^2,\; x_1x_2,\; x_2^2] = [1,\; 2,\; 3,\; 4,\; 6,\; 9]` }],
      },
      {
        q: "How many features does a full degree-2 expansion of 20 inputs produce (including the bias)?",
        solution: [{ math: r`\binom{20 + 2}{2} = \binom{22}{2} = 231` }],
      },
      {
        q: "Validation MSE by degree: 1 → 4.1, 2 → 1.2, 3 → 1.1, 4 → 1.15, 6 → 2.8. Which degree do you choose and why?",
        solution: [{ p: "Degree 3 has the lowest validation error, but degree 2 is almost as good (1.2 vs 1.1) and simpler. If the difference is within cross-validation noise, prefer degree 2; otherwise 3. Never pick 6, whose validation error is rising (overfitting)." }],
      },
    ],
    interview: [
      { q: "Is polynomial regression a linear model? Explain.", a: "Yes. It is linear in the parameters: the prediction is a weighted sum of fixed features (powers of x). Only the features are non-linear in x, so ordinary least squares still applies." },
      { q: "How do you choose the polynomial degree?", a: "Treat it as a hyperparameter and choose it by cross-validation, or use a high degree with ridge regularisation and tune the penalty instead. Plotting train and validation error against degree shows the bias–variance trade-off." },
      { q: "Why do high-degree polynomials behave badly at the edges of the data?", a: "Powers like x¹⁰ grow extremely fast, so small coefficient errors produce huge swings where data is sparse, especially beyond the training range (Runge's phenomenon)." },
    ],
    summary: [
      "Add $x^2, x^3, \\dots$ as features; fit with ordinary least squares.",
      "Degree controls flexibility: too low underfits, too high overfits.",
      "Pick the degree by validation or cross-validation, not training error.",
      "Centre and scale; consider ridge for high degrees.",
      "Never extrapolate a high-degree polynomial.",
    ],
    quiz: [
      { q: "With 6 data points, which degree can always fit them with zero training error?", options: ["2", "3", "5", "6"], answer: 2, why: "A polynomial of degree n − 1 = 5 has 6 coefficients, enough to pass through 6 points (with distinct x values)." },
      { q: "Degree 2 expansion of (x₁, x₂) includes which interaction term?", options: ["x₁ + x₂", "x₁x₂", "x₁/x₂", "x₁³"], answer: 1, why: "Degree-2 terms are x₁², x₁x₂ and x₂²." },
    ],
  },

  regularization: {
    explain: [
      { p: "Regularisation is a deliberate preference for simpler models, written into the loss. The penalty term says: 'large weights cost extra, so only use them if they buy a real reduction in error'. A weight that only helps fit noise in one training sample is not worth its penalty and gets shrunk." },
      { p: "Why do large weights signal overfitting? An overfit model often balances large positive and negative weights on correlated features to hit each training point exactly. That balance is fragile: a small change in input produces a big change in output. Penalising weight size forces smoother functions that change gently with the input, and those generalise better." },
      { p: "The penalty strength $\\lambda$ moves the model along the bias–variance trade-off. $\\lambda = 0$: ordinary least squares (lowest bias, highest variance). Increasing $\\lambda$: weights shrink, variance falls, bias rises. Very large $\\lambda$: all weights near 0, the model predicts roughly the mean (high bias). The best $\\lambda$ is where validation error is lowest, found by cross-validation on a log grid." },
      { p: "Ridge also has a Bayesian reading: it is the same as assuming each weight has a Gaussian prior centred at 0 and finding the most probable weights (MAP estimate). Lasso corresponds to a Laplace prior, which has a sharp peak at 0, which is why it produces exact zeros. Larger $\\lambda$ means a tighter prior: a stronger belief that weights should be small." },
      {
        table: {
          head: ["Situation", "Good choice"],
          rows: [
            ["Many features, most probably useful", "Ridge"],
            ["Many features, few probably matter", "Lasso"],
            ["Groups of correlated features, want selection", "Elastic net"],
            ["More features than rows (p > n)", "Ridge or elastic net (lasso picks at most n features)"],
            ["Need a model you can explain with a few features", "Lasso"],
          ],
        },
      },
      { p: "Always standardise before regularising. The penalty adds up raw weight sizes, but a weight's size depends on its feature's units: income in rupees needs a tiny weight, income in lakhs a large one. Without scaling, the penalty would punish features based on their units rather than their usefulness." },
    ],
    extra: [
      {
        heading: "The regularisation path",
        blocks: [
          { p: "Plotting every weight against $\\log\\lambda$ shows the **regularisation path**. For ridge, all curves shrink smoothly toward 0 together. For lasso, curves hit 0 one by one; the order in which features drop out is a rough ranking of their importance. scikit-learn's `lasso_path` and `enet_path` compute these." },
        ],
      },
    ],
    practice: [
      {
        q: "One feature, no intercept, $\\sum x^2 = 10$, $\\sum xy = 30$. Find the ridge weight for $\\lambda = 0, 5, 20$.",
        solution: [{ math: r`w = \frac{30}{10 + \lambda}: \quad \lambda = 0 \to 3, \quad \lambda = 5 \to 2, \quad \lambda = 20 \to 1` }],
      },
      {
        q: "Same data with lasso (loss $\\sum(y - wx)^2 + \\lambda|w|$). For which λ is the weight exactly 0?",
        solution: [
          { math: r`w = \frac{\max(30 - \lambda/2,\; 0)}{10}` },
          { p: "The weight is 0 once $\\lambda/2 \\ge 30$, i.e. $\\lambda \\ge 60$." },
        ],
      },
      {
        q: "Cross-validated MSE: λ = 0.01 → 12.1, 0.1 → 10.4, 1 → 9.8, 10 → 11.9, 100 → 20.3. Which λ, and what is happening at each end?",
        solution: [{ p: "Choose λ = 1 (lowest CV error). At small λ the model is close to unregularised and overfits (higher variance); at large λ it is shrunk too far and underfits (higher bias)." }],
      },
    ],
    interview: [
      { q: "What is the difference between L1 and L2 regularisation?", a: "L2 (ridge) adds the sum of squared weights and shrinks all weights smoothly, keeping them non-zero. L1 (lasso) adds the sum of absolute weights, which can set weights exactly to zero, performing feature selection." },
      { q: "Why does L1 produce sparse solutions?", a: "Its constraint region (a diamond in 2-D) has corners on the axes, and the error contours usually first touch it at a corner, where some weights are zero. Algebraically, its subgradient leads to soft-thresholding, which zeroes small weights." },
      { q: "Should the intercept be regularised?", a: "No. Penalising the intercept would make predictions depend on where the target's zero happens to be, which is arbitrary. Libraries leave it unpenalised by default." },
    ],
    summary: [
      "Loss + λ × (size of weights): prefer simpler fits.",
      "Ridge (L2) shrinks all; lasso (L1) zeroes some; elastic net mixes both.",
      "λ trades variance for bias; choose it by cross-validation on a log grid.",
      "Always standardise features first; do not penalise the intercept.",
      "Bayesian view: ridge = Gaussian prior, lasso = Laplace prior.",
    ],
    quiz: [
      { q: "As λ → ∞ in ridge regression, the predictions approach:", options: ["The training targets exactly", "The mean of the target (the intercept)", "Infinity", "Zero for every feature but one"], answer: 1, why: "All feature weights shrink to 0, leaving only the unpenalised intercept, which equals the mean of y." },
      { q: "You have 200 rows and 5,000 features. Which statement about lasso is true?", options: ["It can select at most 200 non-zero features", "It always selects all 5,000", "It cannot be used", "It is identical to ridge here"], answer: 0, why: "With p > n, the lasso solution has at most n non-zero coefficients." },
    ],
  },
};
