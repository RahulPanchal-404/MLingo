import type { CodeExtras } from "./tuning-types";

/** Per topic: settings a learner can tune in the code, and variations of the code to try. */
export const CODE_EXTRAS: Record<string, CodeExtras> = {
  "vectors-matrices-notation": {
    tune: [
      { name: "the vector values", what: "The numbers inside each array. Every result (dot product, length, angle) is computed from them.", try: "Make two vectors point the same way, e.g. `[1, 2]` and `[2, 4]`: the angle becomes 0° and the cosine 1. Make them perpendicular, `[1, 0]` and `[0, 1]`: the dot product becomes 0." },
      { name: "matrix shape", what: "Rows × columns. `A @ B` needs A's columns to equal B's rows.", try: "Change a 2 × 3 matrix to 3 × 2 and multiply again; read the error, then fix it with `.T` (transpose)." },
    ],
    vary: [
      { title: "Check a rule by computer", how: "Pick random matrices with `np.random.rand(3, 3)` and check $(AB)^\\top = B^\\top A^\\top$ with `np.allclose`. Then check that $AB \\ne BA$ in general." },
      { title: "Write it without NumPy", how: "Write the dot product as a loop: `sum(a[i] * b[i] for i in range(len(a)))` and compare with `a @ b`." },
      { title: "Bigger data", how: "Make a 1000 × 5 data matrix and a weight vector of length 5; compute all 1000 predictions with one `X @ w`." },
    ],
  },
  "derivatives-chain-rule": {
    tune: [
      { name: "h (the step in a numerical derivative)", what: "How far you nudge $x$ when estimating a slope as $(f(x + h) - f(x - h))/2h$.", try: "Try `h = 1e-1`, `1e-5`, `1e-12`. Too big gives a rough answer; too small gives rounding noise. Around `1e-5` is usually best." },
      { name: "the function", what: "The formula being differentiated.", try: "Swap in `np.sin(x)`, `np.exp(x)` or `x**3` and check that the numerical slope matches $\\cos x$, $e^x$, $3x^2$." },
    ],
    vary: [
      { title: "Chain rule check", how: "For $f(x) = (3x + 1)^2$, compute the slope numerically and compare with the chain-rule answer $6(3x + 1)$ at a few values of $x$." },
      { title: "Plot function and slope", how: "Plot $f(x)$ and its derivative on the same axes with matplotlib; check that the slope is 0 exactly where $f$ has a peak or valley." },
      { title: "Sigmoid's slope", how: "Check numerically that $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$ and find where it is largest (at $z = 0$, value 0.25)." },
    ],
  },
  "partial-derivatives-gradients": {
    tune: [
      { name: "the point (x, y)", what: "Where the gradient is evaluated. The gradient changes from point to point.", try: "Move the point around and watch the gradient arrow's direction and length change; at a minimum it becomes $(0, 0)$." },
      { name: "learning rate in the descent loop", what: "How far each step moves along $-\\nabla f$.", try: "Try 0.01, 0.1, 0.5, 1.1 on $f = x^2 + y^2$: slow, fast, very fast, and finally diverging." },
    ],
    vary: [
      { title: "Numerical gradient", how: "Estimate each partial derivative by nudging one variable at a time, and compare with the formula." },
      { title: "A stretched bowl", how: "Use $f = x^2 + 10y^2$ and watch gradient descent zig-zag in the steep $y$ direction; then rescale $y$ and watch the zig-zag disappear." },
      { title: "Draw the gradient field", how: "Use `plt.quiver` on a grid to draw $-\\nabla f$ arrows; they all point downhill towards the minimum." },
    ],
  },
  "probability-statistics": {
    tune: [
      { name: "sample size n", what: "How many random draws you take.", try: "Raise `n` from 10 to 10,000 and watch the sample mean settle near the true mean (law of large numbers)." },
      { name: "random seed", what: "Which random numbers are drawn.", try: "Change the seed and see how much a small-sample result moves; with large `n` it barely changes." },
      { name: "distribution parameters", what: "Mean and spread (normal), $p$ (Bernoulli/binomial), rate (Poisson).", try: "Double the standard deviation and check the histogram gets twice as wide." },
    ],
    vary: [
      { title: "Simulate Bayes' rule", how: "Simulate 100,000 people with a 1% disease rate and a 95%-accurate test; count how many positive tests are real. Compare with the formula." },
      { title: "Central limit theorem", how: "Average 30 dice rolls, repeat 10,000 times, and plot the averages: a bell curve, even though one die is flat." },
      { title: "Confidence interval coverage", how: "Draw many samples, build a 95% interval from each, and count how often the true mean falls inside (about 95%)." },
    ],
  },
  "python-numpy-pandas": {
    tune: [
      { name: "axis", what: "`axis=0` works down columns, `axis=1` across rows.", try: "Compute `X.mean(axis=0)` and `X.mean(axis=1)` and compare the shapes of the results." },
      { name: "dtype", what: "The type stored in an array or column (int, float, string, category).", try: "Convert a text column with `astype(\"category\")` and compare `memory_usage(deep=True)` before and after." },
    ],
    vary: [
      { title: "Loop versus vectorised", how: "Time a Python loop and the NumPy version of the same sum with `%timeit` or `time.perf_counter()`; NumPy is typically many times faster." },
      { title: "Group and summarise", how: "Use `df.groupby(\"col\").agg([\"mean\", \"count\"])` on a column of your choice." },
      { title: "Missing values", how: "Put a few `np.nan` into a column, then compare `dropna()`, `fillna(df[col].median())` and `isna().sum()`." },
    ],
  },
  "python-plotting-sklearn": {
    tune: [
      { name: "test_size and random_state", what: "How much data is held out, and which rows.", try: "Change `random_state` a few times and see how much the test score moves; that spread is why we use cross-validation." },
      { name: "the model", what: "Every scikit-learn model has the same `fit` / `predict` / `score` interface.", try: "Swap `LogisticRegression()` for `KNeighborsClassifier()` or `DecisionTreeClassifier()` without changing any other line." },
    ],
    vary: [
      { title: "Plot predictions", how: "Scatter true values against predictions; a perfect model puts every point on the diagonal line." },
      { title: "Pipeline", how: "Wrap `StandardScaler()` and the model in `make_pipeline` and check the score with `cross_val_score`." },
      { title: "Another dataset", how: "Try `load_wine`, `load_digits` or `load_diabetes` with the same code." },
    ],
  },
  "linear-algebra-for-ml": {
    tune: [
      { name: "the matrix entries", what: "What the transformation does: stretch, rotate, shear or squash.", try: "Make the two columns parallel, e.g. `[[1, 2], [2, 4]]`: the determinant becomes 0 and the matrix cannot be inverted." },
      { name: "number of components kept (SVD)", what: "How many singular values you keep when approximating a matrix.", try: "Rebuild the matrix from 1, 2, 3… components and print the reconstruction error each time." },
    ],
    vary: [
      { title: "Eigenvectors stay on their line", how: "Multiply an eigenvector by the matrix and check the result is just the eigenvalue times the same vector." },
      { title: "Solve a system", how: "Solve $Ax = b$ with `np.linalg.solve` and with `np.linalg.inv(A) @ b`; both agree, but `solve` is faster and more accurate." },
      { title: "Least squares", how: "Fit a line with `np.linalg.lstsq` and check it matches the normal-equation answer $(X^\\top X)^{-1}X^\\top y$." },
    ],
  },
  "statistics-inference": {
    tune: [
      { name: "sample size", what: "More data gives narrower intervals and smaller p-values for the same real effect.", try: "Quadruple `n`: the standard error halves." },
      { name: "significance level α", what: "The false-alarm rate you accept, usually 0.05.", try: "Run a test on data with no real effect 1,000 times and count how often $p < 0.05$ (about 5%)." },
      { name: "bootstrap resamples", what: "How many times you resample with replacement.", try: "Compare intervals from 100, 1,000 and 10,000 resamples; they stabilise as the number grows." },
    ],
    vary: [
      { title: "Permutation test", how: "Shuffle the group labels 10,000 times and see how often the shuffled difference beats the real one." },
      { title: "Two models compared", how: "Bootstrap the difference in accuracy between two models on the same test set and check whether its interval includes 0." },
      { title: "Multiple testing", how: "Test 100 pure-noise features against a target and count how many look \"significant\" at 0.05." },
    ],
  },
  "what-is-machine-learning": {
    tune: [
      { name: "training size", what: "How many examples the model learns from.", try: "Train on 10%, 50% and 100% of the training rows and compare test scores." },
      { name: "the model", what: "The kind of rule the computer can learn.", try: "Compare a `DummyClassifier` (always guesses the most common class) with a real model to see what learning adds." },
    ],
    vary: [
      { title: "Rule versus learned", how: "Write a hand-made if/else rule for the same task and compare its accuracy with the learned model." },
      { title: "Overfit on purpose", how: "Fit a very deep decision tree and compare training accuracy (near 100%) with test accuracy." },
    ],
  },
  "how-models-learn": {
    tune: [
      { name: "learning rate", what: "Step size of each update.", try: "Try 0.001, 0.01, 0.1 and 1.0 and plot the loss per step." },
      { name: "number of steps", what: "How long training runs.", try: "Stop after 10, 100 and 1,000 steps and compare the fitted line with the data." },
      { name: "starting weights", what: "Where the search begins.", try: "Start from different values; for a bowl-shaped loss all starts reach the same answer." },
    ],
    vary: [
      { title: "Watch the loss", how: "Print or plot the loss every few steps; it should fall quickly, then level off." },
      { title: "Different loss", how: "Replace squared error with absolute error and see how an outlier pulls the line less." },
    ],
  },
  "loss-functions": {
    tune: [
      { name: "the loss", what: "What counts as a mistake and how much it costs.", try: "Compare MSE, MAE and Huber on data with one big outlier; MSE is pulled hardest." },
      { name: "Huber delta (δ)", what: "Errors below δ are squared, errors above it grow linearly.", try: "Try δ = 0.5, 1, 5: small δ behaves like MAE, large δ like MSE." },
    ],
    vary: [
      { title: "Plot the losses", how: "Plot each loss against the error from −3 to 3 to see their shapes side by side." },
      { title: "Best constant", how: "Find the constant prediction with the lowest MSE (the mean) and the lowest MAE (the median) by trying many values." },
      { title: "Log loss and confidence", how: "Compute log loss for a correct prediction at probability 0.6, 0.9 and 0.99, and for a wrong one at 0.99 (very costly)." },
    ],
  },
  "gradient-descent": {
    tune: [
      { name: "learning rate (lr)", what: "Step size along the negative gradient.", try: "Try values from 0.001 to 1; find the largest one that still converges." },
      { name: "iterations", what: "Number of update steps.", try: "Stop at 10, 100, 1,000 steps and compare the loss." },
      { name: "feature scaling", what: "Whether inputs are standardised first.", try: "Run with and without `StandardScaler`; unscaled features usually need many more steps." },
    ],
    vary: [
      { title: "Compare with the exact answer", how: "Compare the gradient-descent weights with `LinearRegression().fit(X, y).coef_`." },
      { title: "Stopping rule", how: "Stop when the loss improves by less than `1e-6` instead of after a fixed number of steps." },
      { title: "Plot the path", how: "Store the weights at each step and plot them over a contour plot of the loss." },
    ],
  },
  "learning-rate": {
    tune: [
      { name: "learning rate", what: "The single most important training setting.", try: "Sweep 1e-4 to 1 on a log scale and plot the final loss for each." },
      { name: "schedule", what: "How the learning rate changes during training (constant, step decay, cosine).", try: "Start at 0.5 and halve it every 50 steps; compare with a constant 0.05." },
    ],
    vary: [
      { title: "Learning-rate range test", how: "Increase the learning rate a little each step and plot loss against learning rate; pick a value just before the loss blows up." },
      { title: "Warm-up", how: "Grow the learning rate from 0 to its full value over the first 10 steps, then keep it constant." },
    ],
  },
  "gradient-descent-variants": {
    tune: [
      { name: "batch size", what: "Rows used per update: all (batch), one (SGD) or a few (mini-batch).", try: "Try 1, 32 and all rows; plot loss against number of updates and against time." },
      { name: "momentum β", what: "How much of the previous step is carried forward.", try: "Try 0, 0.5, 0.9, 0.99 on a stretched bowl and compare the zig-zag." },
      { name: "Adam β₁, β₂, ε", what: "Averaging rates for the gradient and its square, and a tiny safety number.", try: "Keep the defaults (0.9, 0.999, 1e-8) and change only the learning rate first." },
    ],
    vary: [
      { title: "Same problem, three optimisers", how: "Run SGD, momentum and Adam from the same start and plot their loss curves together." },
      { title: "Shuffle or not", how: "Run mini-batch SGD with and without shuffling the rows each epoch, on data sorted by the target." },
    ],
  },
  "reinforcement-learning": {
    tune: [
      { name: "α (learning rate)", what: "How strongly each new experience changes the Q-value.", try: "Try 0.01, 0.1, 0.5: small learns slowly but steadily; large learns fast but noisily." },
      { name: "γ (discount)", what: "How much future rewards count compared with immediate ones.", try: "Try 0.5 and 0.99 and see whether the agent prefers a quick small reward or a distant big one." },
      { name: "ε (exploration)", what: "Chance of trying a random action instead of the best known one.", try: "Compare fixed ε = 0.1 with ε decaying from 1 to 0.01." },
    ],
    vary: [
      { title: "Bigger grid", how: "Make the grid world larger or add a pit with reward −10 and watch the learned path avoid it." },
      { title: "Plot rewards", how: "Plot total reward per episode; it should rise as the agent learns." },
      { title: "SARSA versus Q-learning", how: "Change the update to use the action actually taken next (SARSA) and compare the paths near danger." },
    ],
  },
  "linear-regression": {
    tune: [
      { name: "fit_intercept", what: "Whether the line may cross the y-axis anywhere (True) or must go through 0 (False).", try: "Set `fit_intercept=False` on data that doesn't pass through the origin and watch the fit get worse." },
      { name: "features used", what: "Which columns go into $X$.", try: "Add or remove one feature and compare test $R^2$." },
    ],
    vary: [
      { title: "Normal equation versus scikit-learn", how: "Compute $(X^\\top X)^{-1}X^\\top y$ yourself and check it matches `coef_` and `intercept_`." },
      { title: "Add an outlier", how: "Add one extreme point and see how far the line moves; then try `HuberRegressor`." },
      { title: "Residual plot", how: "Plot residuals against predictions; a curve or funnel shape means the straight line is missing something." },
    ],
  },
  "polynomial-regression": {
    tune: [
      { name: "degree", what: "Highest power of $x$ in the model: how bendy the curve can be.", try: "Try degrees 1 to 15 and plot training and test error; test error is lowest somewhere in the middle." },
      { name: "include_bias / interaction_only", what: "Options of `PolynomialFeatures` that add a constant column or only cross terms.", try: "With two inputs, compare `interaction_only=True` (just $x_1x_2$) and the full degree-2 set." },
      { name: "Ridge alpha", what: "A penalty that keeps a high-degree curve from wiggling.", try: "Fit degree 12 with `Ridge(alpha)` for alpha 0.001, 1, 100." },
    ],
    vary: [
      { title: "Scale before expanding", how: "Put `StandardScaler()` before `PolynomialFeatures` and compare; large $x^{10}$ values cause numerical trouble without it." },
      { title: "Pick the degree by CV", how: "Use `GridSearchCV` over `polynomialfeatures__degree`." },
    ],
  },
  regularization: {
    tune: [
      { name: "alpha (λ)", what: "Strength of the penalty on the weights. Bigger alpha means smaller weights and a simpler model.", try: "Sweep alpha on a log scale from 1e-4 to 1e4 and plot the coefficients (a regularisation path)." },
      { name: "Ridge, Lasso or ElasticNet", what: "Ridge shrinks all weights; Lasso can set some exactly to zero; ElasticNet mixes both.", try: "Count how many coefficients are exactly 0 under Lasso as alpha grows." },
      { name: "l1_ratio (ElasticNet)", what: "Mix between Lasso (1) and Ridge (0).", try: "Try 0.1, 0.5, 0.9 on correlated features." },
    ],
    vary: [
      { title: "Always scale", how: "Fit Lasso with and without `StandardScaler`; without scaling, the penalty unfairly hits features with small units." },
      { title: "Let CV choose", how: "Use `RidgeCV` or `LassoCV` and print the chosen alpha." },
    ],
  },
  "multiple-linear-regression": {
    tune: [
      { name: "features included", what: "Which predictors are in the model.", try: "Add a nearly duplicate feature and watch the two coefficients become unstable (multicollinearity)." },
      { name: "interaction terms", what: "Products like $x_1x_2$ that let one feature's effect depend on another.", try: "Add an interaction column and compare test error." },
    ],
    vary: [
      { title: "Check VIF", how: "Compute variance inflation factors; values above about 10 signal strongly correlated features." },
      { title: "Standardised coefficients", how: "Scale all features first, then compare coefficient sizes to see which features matter most." },
    ],
  },
  "regression-metrics": {
    tune: [
      { name: "the metric", what: "MAE (typical miss), RMSE (punishes big misses), $R^2$ (share of variance explained), MAPE (percentage).", try: "Add one huge error and see RMSE jump far more than MAE." },
    ],
    vary: [
      { title: "Baseline comparison", how: "Compute every metric for a `DummyRegressor` that predicts the mean; $R^2$ is exactly 0 for it on the training data." },
      { title: "Errors by group", how: "Compute MAE separately for small and large target values; one overall number can hide a bad region." },
      { title: "Zero targets", how: "Put a 0 in the targets and see MAPE break (division by zero)." },
    ],
  },
  "regression-diagnostics": {
    tune: [
      { name: "influence thresholds", what: "Cut-offs such as Cook's distance > $4/n$ for flagging influential points.", try: "Lower or raise the threshold and see which points get flagged." },
    ],
    vary: [
      { title: "Plant a bad point", how: "Add a point with extreme $x$ and wrong $y$; check that its leverage and Cook's distance stand out." },
      { title: "Fix a funnel", how: "Generate data whose noise grows with $x$, see the funnel in the residual plot, then model $\\log y$." },
      { title: "Q–Q plot", how: "Plot residual quantiles against normal quantiles with `scipy.stats.probplot`." },
    ],
  },
  "tree-knn-regression": {
    tune: [
      { name: "max_depth / min_samples_leaf (trees)", what: "How many splits the tree may make and how small a leaf may get.", try: "Try depth 2, 5, None; deeper trees fit training data more closely and can overfit." },
      { name: "n_neighbors (KNN)", what: "How many neighbours are averaged.", try: "Try K = 1, 5, 25: K = 1 copies noise; large K over-smooths." },
      { name: "weights (KNN)", what: "`\"uniform\"` averages equally; `\"distance\"` trusts closer neighbours more.", try: "Compare both on the same K." },
    ],
    vary: [
      { title: "Plot the predictions", how: "Plot both models' predictions on a fine grid; the tree is a staircase, KNN is bumpy." },
      { title: "Extrapolation", how: "Predict beyond the training range; both models flatten out, unlike a linear model." },
    ],
  },
  "logistic-regression": {
    tune: [
      { name: "C", what: "Inverse regularisation strength: small C means strong penalty and a simpler model.", try: "Try C = 0.01, 1, 100 and compare test accuracy and coefficient sizes." },
      { name: "threshold", what: "Probability above which we predict class 1 (default 0.5).", try: "Lower it to 0.3 and watch recall rise and precision fall." },
      { name: "class_weight", what: "`\"balanced\"` makes mistakes on the rare class cost more.", try: "Compare recall on the rare class with and without it." },
      { name: "penalty", what: "`\"l2\"` shrinks weights; `\"l1\"` (with `solver=\"liblinear\"` or `\"saga\"`) can zero some out.", try: "Count non-zero coefficients under L1 as C shrinks." },
    ],
    vary: [
      { title: "From scratch versus scikit-learn", how: "Compare your gradient-descent weights with `LogisticRegression(C=1e6)` (almost no penalty)." },
      { title: "Read the coefficients", how: "Compute `np.exp(coef_)` to get odds ratios: how the odds change per unit of each feature." },
      { title: "Calibration", how: "Plot a calibration curve with `CalibrationDisplay.from_estimator`." },
    ],
  },
  "k-nearest-neighbors": {
    tune: [
      { name: "n_neighbors (K)", what: "How many neighbours vote.", try: "Plot CV accuracy for K = 1…30; small K overfits, large K underfits." },
      { name: "weights", what: "`\"uniform\"` or `\"distance\"` (closer neighbours count more).", try: "Compare both at the best K." },
      { name: "metric / p", what: "How distance is measured: `p=2` Euclidean, `p=1` Manhattan.", try: "Compare p = 1 and p = 2." },
    ],
    vary: [
      { title: "Remove the scaler", how: "Drop `StandardScaler` from the pipeline and see accuracy fall when features have different units." },
      { title: "Decision boundary", how: "Plot the boundary for K = 1 and K = 15 on 2-D data with `DecisionBoundaryDisplay`." },
      { title: "Add useless features", how: "Append 20 columns of random noise and watch accuracy drop: distances get swamped." },
    ],
  },
  "decision-trees": {
    tune: [
      { name: "max_depth", what: "Maximum number of questions from root to leaf.", try: "Try 1, 3, 5, None and compare training and test accuracy." },
      { name: "min_samples_leaf", what: "Smallest number of rows allowed in a leaf.", try: "Try 1, 5, 20: larger leaves give smoother, less overfit trees." },
      { name: "criterion", what: "`\"gini\"` or `\"entropy\"`: how split quality is measured.", try: "Compare both; results are usually very close." },
      { name: "ccp_alpha", what: "Cost-complexity pruning: removes branches that add little.", try: "Use `cost_complexity_pruning_path` and pick alpha by CV." },
    ],
    vary: [
      { title: "Draw the tree", how: "Use `plot_tree(model, filled=True)` or `export_text(model)` to read the rules." },
      { title: "Instability", how: "Refit on a bootstrap sample of the data and see how much the tree changes; this is why forests help." },
      { title: "Feature importance", how: "Print `feature_importances_` and compare with permutation importance." },
    ],
  },
  "classification-metrics": {
    tune: [
      { name: "threshold", what: "The cut-off that turns probabilities into yes/no.", try: "Move it from 0.1 to 0.9 and print precision, recall and F1 at each value." },
      { name: "average", what: "For multiclass: `\"macro\"` (classes equal), `\"weighted\"` (by class size), `\"micro\"` (all rows equal).", try: "Compare them on an imbalanced multiclass problem." },
      { name: "beta (F-beta)", what: "β > 1 favours recall, β < 1 favours precision.", try: "Compare `fbeta_score` with β = 0.5, 1, 2." },
    ],
    vary: [
      { title: "Confusion matrix", how: "Plot it with `ConfusionMatrixDisplay` and compute every metric from the four counts by hand." },
      { title: "Accuracy trap", how: "On data with 95% negatives, compare a model that always says \"no\" with a real one." },
    ],
  },
  "naive-bayes": {
    tune: [
      { name: "alpha (Multinomial/Bernoulli)", what: "Laplace smoothing: adds a pseudo-count so unseen words don't get probability 0.", try: "Try alpha = 0.01, 1, 10 and compare accuracy." },
      { name: "var_smoothing (Gaussian)", what: "Adds a little variance so a feature with tiny spread doesn't dominate.", try: "Try 1e-9 (default), 1e-5, 1e-2." },
      { name: "priors", what: "Class probabilities before seeing the features.", try: "Set equal priors and see how predictions on borderline cases change." },
    ],
    vary: [
      { title: "Text classifier", how: "Combine `CountVectorizer` and `MultinomialNB` in a pipeline on a few labelled sentences." },
      { title: "Check calibration", how: "Naive Bayes probabilities are often too extreme; compare with a calibration curve." },
    ],
  },
  "support-vector-machines": {
    tune: [
      { name: "C", what: "How much margin violations cost. Small C: wide margin, more mistakes allowed. Large C: tight fit.", try: "Try 0.01, 1, 100 and plot the boundary each time." },
      { name: "kernel", what: "`\"linear\"`, `\"rbf\"`, `\"poly\"`: the shape of boundary allowed.", try: "Compare linear and RBF on circles data (`make_circles`)." },
      { name: "gamma (RBF)", what: "How far one training point's influence reaches. Large gamma: very local, wiggly boundary.", try: "Grid-search C and gamma together on a log scale." },
    ],
    vary: [
      { title: "Support vectors", how: "Print `len(model.support_)` for different C; smaller C keeps more support vectors." },
      { title: "Without scaling", how: "Remove `StandardScaler` and watch the RBF SVM get much worse." },
      { title: "Probabilities", how: "Set `probability=True` to get `predict_proba` (slower, uses internal CV)." },
    ],
  },
  "random-forests": {
    tune: [
      { name: "n_estimators", what: "Number of trees. More trees: more stable, never more overfit, but slower.", try: "Plot OOB error for 10, 50, 100, 300 trees." },
      { name: "max_features", what: "Features considered at each split. Fewer: trees differ more.", try: "Try `\"sqrt\"`, 0.5, 1.0." },
      { name: "max_depth / min_samples_leaf", what: "How big each tree may grow.", try: "Limit depth to speed up training and see whether accuracy changes." },
      { name: "oob_score", what: "Scores each row with the trees that did not see it: a free validation score.", try: "Set `oob_score=True` and compare `oob_score_` with CV." },
    ],
    vary: [
      { title: "One tree versus the forest", how: "Compare a single deep tree with the forest on the same split." },
      { title: "Importance", how: "Compare `feature_importances_` with `permutation_importance` on test data." },
    ],
  },
  "gradient-boosting": {
    tune: [
      { name: "learning_rate", what: "How much each new tree's correction counts.", try: "Try 0.3, 0.1, 0.03; smaller needs more trees but often generalises better." },
      { name: "n_estimators", what: "Number of boosting rounds.", try: "Plot test error against rounds with `staged_predict`; it falls, then rises when overfitting." },
      { name: "max_depth", what: "Size of each tree (usually 2–5).", try: "Compare depth 1 (stumps), 3, 6." },
      { name: "subsample", what: "Fraction of rows used per tree (stochastic boosting).", try: "Try 0.5 and 0.8 against 1.0." },
    ],
    vary: [
      { title: "Early stopping", how: "Set `n_iter_no_change=10, validation_fraction=0.1` and print `n_estimators_`." },
      { title: "Faster version", how: "Swap in `HistGradientBoostingClassifier`; it is much faster on large data and handles missing values itself." },
    ],
  },
  "multiclass-softmax": {
    tune: [
      { name: "multi-class strategy", what: "One softmax model for all classes, or one-vs-rest binary models.", try: "Compare `LogisticRegression()` with `OneVsRestClassifier(LogisticRegression())`." },
      { name: "C", what: "Regularisation strength, as in binary logistic regression.", try: "Try 0.01, 1, 100." },
      { name: "temperature", what: "Dividing logits by T before softmax: T > 1 flattens probabilities, T < 1 sharpens them.", try: "Compute softmax of the same logits with T = 0.5, 1, 2." },
    ],
    vary: [
      { title: "Confusion matrix", how: "Find which pairs of classes get mixed up most." },
      { title: "Top-k accuracy", how: "Count a prediction correct if the true class is among the 3 highest probabilities (`top_k_accuracy_score`)." },
    ],
  },
  "roc-auc-calibration": {
    tune: [
      { name: "threshold", what: "Each point on the ROC curve is one threshold.", try: "Pick the threshold giving recall ≥ 0.9 and report its false-positive rate." },
      { name: "calibration method", what: "`\"sigmoid\"` (Platt) or `\"isotonic\"` in `CalibratedClassifierCV`.", try: "Compare the Brier score before and after each." },
      { name: "n_bins", what: "Number of bins in a calibration curve.", try: "Try 5, 10, 20; few rows per bin makes the curve noisy." },
    ],
    vary: [
      { title: "ROC versus PR", how: "Plot both for a rare-class problem; PR shows the difficulty much more clearly." },
      { title: "Calibrate a forest", how: "Random forest probabilities are often squeezed towards the middle; calibrate them and redraw the curve." },
    ],
  },
  "adaboost-xgboost": {
    tune: [
      { name: "n_estimators", what: "Number of weak learners added.", try: "Track test error as rounds increase with `staged_predict`." },
      { name: "learning_rate", what: "Shrinks each learner's vote.", try: "Pair a smaller rate with more rounds and compare." },
      { name: "estimator depth", what: "AdaBoost usually uses stumps (depth 1).", try: "Try depth 1, 2, 3." },
      { name: "XGBoost: max_depth, subsample, colsample_bytree, reg_lambda", what: "Tree size, row and column sampling, and L2 penalty on leaf values.", try: "Tune them one at a time with early stopping on a validation set." },
    ],
    vary: [
      { title: "Label noise", how: "Flip 10% of the labels; AdaBoost focuses hard on mislabelled points and can degrade." },
      { title: "Compare boosters", how: "Run AdaBoost, `GradientBoostingClassifier` and `HistGradientBoostingClassifier` on the same split." },
    ],
  },
  "ensemble-methods": {
    tune: [
      { name: "voting", what: "`\"hard\"` counts votes; `\"soft\"` averages probabilities.", try: "Compare both with the same three models." },
      { name: "final_estimator (stacking)", what: "The model that combines the base models' predictions.", try: "Try logistic regression and a small tree." },
      { name: "base model variety", what: "Ensembles help most when the models make different mistakes.", try: "Combine three similar trees, then a tree, KNN and logistic regression; compare." },
    ],
    vary: [
      { title: "Measure disagreement", how: "Count how often two base models disagree on the test set." },
      { title: "Bagging any model", how: "Wrap KNN in `BaggingClassifier` and compare with plain KNN." },
    ],
  },
  "k-means": {
    tune: [
      { name: "n_clusters (k)", what: "Number of groups.", try: "Plot inertia and silhouette for k = 2…10; look for the elbow and the silhouette peak." },
      { name: "n_init", what: "Number of random starts; the best one is kept.", try: "Use `n_init=1` with different seeds and see inertia change; then use 10." },
      { name: "init", what: "`\"k-means++\"` spreads starting centres out; `\"random\"` doesn't.", try: "Compare inertia for both with `n_init=1`." },
    ],
    vary: [
      { title: "Unscaled features", how: "Remove the scaler and watch clusters split only along the largest-unit feature." },
      { title: "Shapes K-means can't handle", how: "Run it on `make_moons`; compare with DBSCAN." },
      { title: "Mini-batch", how: "Use `MiniBatchKMeans` on 100,000 points and compare speed and inertia." },
    ],
  },
  "hierarchical-clustering": {
    tune: [
      { name: "linkage", what: "`\"ward\"`, `\"complete\"`, `\"average\"`, `\"single\"`: how distance between groups is measured.", try: "Draw the dendrogram for each; single linkage tends to chain points together." },
      { name: "where to cut", what: "Number of clusters (`t` with `maxclust`) or a height (`distance`).", try: "Cut at 2, 3, 4 clusters and compare silhouette scores." },
      { name: "metric", what: "Distance between points (Euclidean, Manhattan, cosine).", try: "Use cosine for text-like data with `average` linkage." },
    ],
    vary: [
      { title: "Compare with K-means", how: "Cluster the same data both ways and count how many points get the same group." },
      { title: "Cophenetic correlation", how: "Use `scipy.cluster.hierarchy.cophenet` to measure how well the tree keeps the original distances." },
    ],
  },
  dbscan: {
    tune: [
      { name: "eps (ε)", what: "Neighbourhood radius.", try: "Read it from the k-distance plot; then try half and double that value." },
      { name: "min_samples", what: "Neighbours needed (including the point itself) to be a core point.", try: "Try 3, 5, 10: larger values call more points noise." },
      { name: "metric", what: "How distance is measured.", try: "Try Manhattan (`metric=\"manhattan\"`)." },
    ],
    vary: [
      { title: "Count noise", how: "Print `(labels == -1).sum()` for different eps values." },
      { title: "Varying density", how: "Make two blobs with different spreads; one eps can't fit both. Try `HDBSCAN` (scikit-learn ≥ 1.3)." },
    ],
  },
  pca: {
    tune: [
      { name: "n_components", what: "Number of directions kept; a fraction like 0.95 keeps enough for 95% of the variance.", try: "Plot cumulative `explained_variance_ratio_` and the downstream score for several values." },
      { name: "whiten", what: "Rescales the components to unit variance.", try: "Compare a classifier's score with and without whitening." },
      { name: "scaling first", what: "Whether features are standardised before PCA.", try: "Run PCA with and without `StandardScaler` and compare the first component." },
    ],
    vary: [
      { title: "Reconstruct images", how: "Use `inverse_transform` to rebuild digit images from 5, 20, 40 components and plot them." },
      { title: "PCA versus t-SNE", how: "Plot digits with both; t-SNE separates groups more but distorts distances." },
      { title: "Inside a pipeline", how: "Put PCA in a pipeline and tune `pca__n_components` with `GridSearchCV`." },
    ],
  },
  "neural-networks": {
    tune: [
      { name: "hidden_layer_sizes", what: "Number of layers and units per layer, e.g. `(16, 8)`.", try: "Try `(4,)`, `(16, 8)`, `(128, 64)` and compare training and test scores." },
      { name: "activation", what: "`\"relu\"`, `\"tanh\"` or `\"logistic\"`.", try: "Compare relu and tanh on the moons data." },
      { name: "alpha", what: "L2 weight penalty.", try: "Try 1e-5, 1e-3, 1e-1." },
      { name: "learning rate (lr / learning_rate_init)", what: "Step size of each update.", try: "In the NumPy code, try `lr = 0.05`, `0.5`, `5`; in scikit-learn change `learning_rate_init`." },
    ],
    vary: [
      { title: "No hidden layer", how: "In the NumPy network, remove the hidden layer; accuracy on moons drops because the boundary must be a straight line." },
      { title: "Change the activation", how: "Replace ReLU with tanh in the NumPy code; its derivative is `1 - A1**2`." },
      { title: "More noise", how: "Set `noise=0.4` in `make_moons` and see how a big network overfits." },
    ],
  },
  "training-neural-networks": {
    tune: [
      { name: "optimiser and lr", what: "SGD, SGD + momentum, Adam/AdamW, and the learning rate.", try: "Swap `torch.optim.AdamW` for `torch.optim.SGD(..., lr=0.01, momentum=0.9)`." },
      { name: "Dropout(p)", what: "Share of units switched off in each training step.", try: "Try 0, 0.3, 0.5 and compare validation loss." },
      { name: "weight_decay", what: "L2 penalty on the weights.", try: "Try 0, 1e-4, 1e-2." },
      { name: "batch_size", what: "Rows per update.", try: "Try 8, 32, 128." },
      { name: "patience (early stopping)", what: "Epochs to wait without improvement before stopping.", try: "Try 3, 10, 30." },
    ],
    vary: [
      { title: "Remove BatchNorm", how: "Delete `nn.BatchNorm1d(64)` and compare how fast validation loss falls." },
      { title: "Learning-rate schedule", how: "Add `torch.optim.lr_scheduler.StepLR(opt, step_size=20, gamma=0.5)` and call `scheduler.step()` each epoch." },
      { title: "Bad initialisation", how: "In the initialisation demo, try `std=0.05` and `std=0.1` and see where activations vanish or explode." },
    ],
  },
  "feature-scaling": {
    tune: [
      { name: "the scaler", what: "`StandardScaler`, `MinMaxScaler`, `RobustScaler`, `MaxAbsScaler`.", try: "Swap each into the KNN pipeline and compare CV accuracy." },
      { name: "feature_range (MinMaxScaler)", what: "Target range, default (0, 1).", try: "Try (−1, 1)." },
      { name: "quantile_range (RobustScaler)", what: "Which quantiles define the spread, default (25, 75).", try: "Try (10, 90)." },
    ],
    vary: [
      { title: "Trees don't care", how: "Swap KNN for `DecisionTreeClassifier` and compare scaled and unscaled scores (almost identical)." },
      { title: "Log, then scale", how: "Add `FunctionTransformer(np.log1p)` before the scaler for a skewed column." },
    ],
  },
  "train-test-split": {
    tune: [
      { name: "test_size", what: "Share of rows held out.", try: "Try 0.1, 0.2, 0.4 and repeat with several seeds to see how stable the test score is." },
      { name: "stratify", what: "Keeps class shares equal in train and test.", try: "Split a rare-class dataset with and without `stratify=y` and compare class shares." },
      { name: "splitter", what: "`KFold`, `StratifiedKFold`, `GroupKFold`, `TimeSeriesSplit`.", try: "Use `TimeSeriesSplit(n_splits=5)` on time-ordered data and print the indices." },
    ],
    vary: [
      { title: "Leak on purpose", how: "Fit the scaler on all data before splitting and compare with the pipeline score." },
      { title: "Duplicate rows", how: "Duplicate every row, then split randomly; the test score jumps because copies sit on both sides." },
    ],
  },
  "bias-variance": {
    tune: [
      { name: "model complexity", what: "Degree, depth, K, alpha: the dial between simple and flexible.", try: "In the simulation, try degrees 1–12 and plot bias², variance and total." },
      { name: "training size", what: "More data lowers variance.", try: "Change the 30 training points to 100 and rerun the simulation." },
      { name: "noise level", what: "`noise_sd`: the error no model can remove.", try: "Set it to 0 and to 1 and see the floor of the error move." },
    ],
    vary: [
      { title: "Bagging lowers variance", how: "Repeat the simulation with `BaggingRegressor` around a deep tree." },
      { title: "Learning curve plot", how: "Plot `learning_curve` scores against training size for a shallow and a deep tree." },
    ],
  },
  "cross-validation-tuning": {
    tune: [
      { name: "n_splits", what: "Number of folds.", try: "Compare 3, 5, 10 folds: mean and spread of the scores." },
      { name: "n_iter (random search)", what: "Number of settings sampled.", try: "Try 5, 15, 50 and see whether the best score keeps improving." },
      { name: "scoring", what: "The metric the search optimises.", try: "Search with `\"f1\"` and with `\"accuracy\"` and compare the chosen settings." },
      { name: "parameter distributions", what: "What ranges are searched.", try: "Replace `loguniform(0.1, 1.0)` with `uniform(0.1, 0.9)` and compare." },
    ],
    vary: [
      { title: "Grid search", how: "Replace `RandomizedSearchCV` with `GridSearchCV` on a small grid and count the fits." },
      { title: "Halving search", how: "Try `HalvingRandomSearchCV` (needs `from sklearn.experimental import enable_halving_search_cv`)." },
      { title: "Repeated CV", how: "Use `RepeatedStratifiedKFold(n_splits=5, n_repeats=3)` for a steadier estimate." },
    ],
  },
  "feature-engineering": {
    tune: [
      { name: "imputer strategy", what: "`\"mean\"`, `\"median\"`, `\"most_frequent\"`, `\"constant\"`.", try: "Compare mean and median on a column with outliers." },
      { name: "add_indicator", what: "Adds a \"was missing\" column for each column with gaps.", try: "Turn it on and compare CV accuracy." },
      { name: "OneHotEncoder options", what: "`handle_unknown=\"ignore\"`, `drop=\"first\"`, `min_frequency` (group rare categories).", try: "Set `min_frequency=0.05` and see rare cities merged." },
      { name: "transform", what: "`np.log1p`, `PowerTransformer`, `QuantileTransformer` for skewed columns.", try: "Swap them into the income pipeline and compare." },
    ],
    vary: [
      { title: "KNN and iterative imputers", how: "Replace `SimpleImputer` with `KNNImputer(n_neighbors=5)` or `IterativeImputer` (needs `from sklearn.experimental import enable_iterative_imputer`)." },
      { title: "Target encoding", how: "Use `TargetEncoder` (scikit-learn ≥ 1.3) on a many-category column; it does the out-of-fold step for you." },
      { title: "New features", how: "Add a ratio such as income per age, or sine/cosine of the hour, and compare CV accuracy." },
    ],
  },
  "imbalanced-data": {
    tune: [
      { name: "class_weight", what: "`\"balanced\"` or a dict like `{0: 1, 1: 10}`.", try: "Try weights 1, 5, 20, 50 for the rare class and track recall and precision." },
      { name: "threshold", what: "The probability cut-off.", try: "Choose it on validation data for the recall you need, then freeze it." },
      { name: "SMOTE k", what: "Neighbours used when creating synthetic points.", try: "Try k = 1, 5, 10 in the SMOTE function." },
    ],
    vary: [
      { title: "Undersampling", how: "Randomly keep only as many majority rows as minority rows and compare PR-AUC." },
      { title: "Balanced forest", how: "Use `RandomForestClassifier(class_weight=\"balanced_subsample\")`." },
      { title: "imbalanced-learn", how: "With `pip install imbalanced-learn`, use `imblearn.pipeline.make_pipeline(SMOTE(), model)` so SMOTE runs inside each CV fold." },
    ],
  },
};
