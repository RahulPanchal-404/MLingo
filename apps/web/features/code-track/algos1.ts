import type { AlgoGuide } from "./types";

const r = String.raw;

/** Practical guides for Getting started, preprocessing, training and regression topics. */
export const ALGO_GUIDES_1: Record<string, AlgoGuide> = {
  "python-plotting-sklearn": {
    use: ["Every supervised project: scikit-learn gives every model the same `fit`, `predict` and `score` interface.", "Comparing several model families quickly inside one search."],
    avoid: ["Deep learning on images, audio or long text: use PyTorch.", "Data that does not fit in memory: use batch or out-of-core tools."],
    prep: ["Put all preprocessing in a `Pipeline` so it is refitted on each training fold.", "Keep data as a pandas DataFrame so column names travel with it."],
    recipe: {
      goal: "The scikit-learn project template: pipeline, model search, save and reload",
      code: r`import joblib
from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

pipe = Pipeline([("scale", StandardScaler()), ("model", LogisticRegression(max_iter=5000))])
grid = [{"model": [LogisticRegression(max_iter=5000)], "model__C": [0.1, 1, 10]},
        {"model": [RandomForestClassifier(random_state=0)], "scale": ["passthrough"], "model__n_estimators": [100, 300]}]
search = GridSearchCV(pipe, grid, cv=5).fit(X_train, y_train)
print("best model:", type(search.best_params_["model"]).__name__, "| CV accuracy:", round(search.best_score_, 3))
print("test accuracy:", round(search.score(X_test, y_test), 3))

joblib.dump(search.best_estimator_, "wine_model.joblib")
loaded = joblib.load("wine_model.joblib")
print("prediction for a new wine:", loaded.predict(X_test.iloc[[0]])[0], "| probabilities:", loaded.predict_proba(X_test.iloc[[0]]).round(3)[0])

# Output:
# best model: RandomForestClassifier | CV accuracy: 0.979
# test accuracy: 1.0
# prediction for a new wine: 1 | probabilities: [0.01 0.98 0.01]`,
      walk: [
        { line: "pipe = Pipeline([(\"scale\", StandardScaler()), (\"model\", LogisticRegression(max_iter=5000))])", say: "Name every step. Names let you reach a step's settings as `step__setting`." },
        { line: "grid = [{\"model\": [LogisticRegression(max_iter=5000)], \"model__C\": [0.1, 1, 10]},", say: "A search over model types as well as their settings." },
        { line: "{\"model\": [RandomForestClassifier(random_state=0)], \"scale\": [\"passthrough\"], \"model__n_estimators\": [100, 300]}]", say: "`\"passthrough\"` switches the scaler off for the forest, which does not need it." },
        { line: "joblib.dump(search.best_estimator_, \"wine_model.joblib\")", say: "Save the best fitted pipeline, preprocessing included." },
        { line: "print(\"prediction for a new wine:\", loaded.predict(X_test.iloc[[0]])[0], \"| probabilities:\", loaded.predict_proba(X_test.iloc[[0]]).round(3)[0])", say: "Pass a one-row DataFrame (double brackets) so column names match training." },
      ],
    },
    checks: [
      { if: "Columns need different treatment", do: "Use `ColumnTransformer` inside the pipeline (see Pipelines and ColumnTransformer)." },
      { if: "You need a fair comparison of models", do: "Use the same CV splitter (`StratifiedKFold(..., random_state=)`) for all of them." },
    ],
    optimise: [
      { what: "Model family", when: "At the start: compare 2–3 different families with defaults", not: "Before you have a baseline and a validation setup" },
      { what: "The chosen model's settings", when: "After picking a family, with CV", not: "On the test set" },
    ],
  },
  "python-numpy-pandas": {
    use: ["Loading, cleaning, joining and reshaping data before any model.", "Vectorised maths on arrays (NumPy) instead of Python loops."],
    avoid: ["Learned preprocessing (medians, scaling) done in pandas on the full dataset: do it in a scikit-learn pipeline."],
    prep: ["Parse dates on load (`parse_dates=`), fix types (`astype`), standardise text categories."],
    checks: [
      { if: "A numeric column has dtype `object`/`str`", do: "Find the bad values: `pd.to_numeric(df[c], errors=\"coerce\")` and inspect the new NaNs." },
      { if: "A join changes the number of rows", do: "Use `merge(..., validate=\"one_to_one\")` or `\"many_to_one\"` to catch duplicate keys." },
      { if: "Large data is slow", do: "Use categories for text columns and vectorised operations; avoid `apply` with Python functions on big tables." },
    ],
    optimise: [
      { what: "Memory (dtypes)", when: "Tables with millions of rows", not: "Small datasets: clarity matters more" },
    ],
  },
  "what-is-machine-learning": {
    use: ["A task where examples of inputs and correct outputs exist, and writing the rules by hand is hard."],
    avoid: ["A simple rule already solves it reliably.", "No labelled examples and no way to get them."],
    prep: ["Define the target and the moment of prediction before touching any model."],
    checks: [
      { if: "You are not sure ML adds value", do: "Compare against a `DummyClassifier`/`DummyRegressor` and a hand-written rule." },
    ],
    optimise: [
      { what: "The problem definition", when: "Always first: target, metric, what a good result is worth", not: "" },
    ],
  },
  "how-models-learn": {
    use: ["Understanding what `fit` does: start from a guess, measure the loss, adjust, repeat."],
    avoid: [],
    prep: ["Scale features before gradient-based training."],
    checks: [
      { if: "Training loss does not fall", do: "Lower the learning rate, check scaling, check labels." },
    ],
    optimise: [
      { what: "Learning rate and number of steps", when: "Gradient-trained models (linear models with SGD, neural networks)", not: "Models with a closed-form or tree-based fit" },
    ],
  },
  "loss-functions": {
    use: ["Choosing what \"wrong\" means for your problem: squared error, absolute error, Huber, log loss, quantile (pinball) loss."],
    avoid: ["Picking a loss only because it is the default when the business cost is clearly different."],
    prep: ["Look at the target's distribution and outliers first: they decide between squared and robust losses."],
    recipe: {
      goal: "The same data fitted with four different losses",
      code: r`import numpy as np
from sklearn.linear_model import HuberRegressor, LinearRegression, QuantileRegressor

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 200).reshape(-1, 1)
y = 2 * x.ravel() + 1 + rng.normal(0, 1, 200)
y[:10] += 40
for name, m in [("squared loss (LinearRegression)", LinearRegression()),
                ("Huber loss (HuberRegressor)", HuberRegressor(epsilon=1.35)),
                ("absolute loss (median, QuantileRegressor)", QuantileRegressor(quantile=0.5, alpha=0)),
                ("pinball loss, 90th percentile", QuantileRegressor(quantile=0.9, alpha=0))]:
    m.fit(x, y)
    print(f"{name:42s} slope {m.coef_[0]:.2f}  intercept {m.intercept_:.2f}")

# Output:
# squared loss (LinearRegression)            slope 2.00  intercept 2.92
# Huber loss (HuberRegressor)                slope 1.97  intercept 1.12
# absolute loss (median, QuantileRegressor)  slope 1.95  intercept 1.15
# pinball loss, 90th percentile              slope 2.12  intercept 1.99`,
      walk: [
        { line: "y[:10] += 40", say: "Ten points get a huge error, like data-entry mistakes." },
        { line: "(\"squared loss (LinearRegression)\", LinearRegression()),", say: "Squared loss: big errors dominate, so the outliers drag the intercept up (2.92 instead of about 1)." },
        { line: "(\"Huber loss (HuberRegressor)\", HuberRegressor(epsilon=1.35)),", say: "Huber: squared for small errors, linear for large ones. Barely moved by the outliers." },
        { line: "(\"absolute loss (median, QuantileRegressor)\", QuantileRegressor(quantile=0.5, alpha=0)),", say: "Absolute loss predicts the median: robust too." },
        { line: "(\"pinball loss, 90th percentile\", QuantileRegressor(quantile=0.9, alpha=0))]:", say: "Pinball loss at 0.9 predicts a value that 90% of outcomes fall below: useful for planning capacity." },
      ],
    },
    checks: [
      { if: "Target has outliers you cannot remove", do: "Use Huber or absolute loss, and report MAE." },
      { if: "Under-predicting costs more than over-predicting", do: "Use a quantile (pinball) loss at the matching level." },
      { if: "Classification with probabilities", do: "Log loss (cross-entropy); judge decisions separately with a threshold." },
    ],
    optimise: [
      { what: "Huber `epsilon`", when: "Outliers present: smaller values are more robust", not: "Clean data: plain squared loss is fine" },
      { what: "Quantile level", when: "The cost of over- vs under-prediction is known", not: "You only need the typical value" },
    ],
  },
  "gradient-descent": {
    use: ["Very large datasets where the exact solution is too slow (`SGDRegressor`, `SGDClassifier`).", "Every neural network."],
    avoid: ["Small linear problems: `LinearRegression` solves them exactly and instantly."],
    prep: ["Always scale features: unscaled features make gradient descent slow and unstable."],
    recipe: {
      goal: "Gradient descent in scikit-learn, with and without scaling",
      code: r`from sklearn.datasets import load_diabetes
from sklearn.linear_model import LinearRegression, SGDRegressor
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X * 100, y, test_size=0.25, random_state=0)

exact = LinearRegression().fit(X_train, y_train)
print("exact solution test R^2:", round(exact.score(X_test, y_test), 3))
for scale in [False, True]:
    sgd = SGDRegressor(learning_rate="invscaling", eta0=0.01, max_iter=2000, tol=1e-4, early_stopping=True, random_state=0)
    model = make_pipeline(StandardScaler(), sgd) if scale else sgd
    model.fit(X_train, y_train)
    print(f"SGD {'with' if scale else 'without'} scaling: test R^2 {model.score(X_test, y_test):.3f}, epochs {model[-1].n_iter_ if scale else sgd.n_iter_}")

# Output:
# exact solution test R^2: 0.359
# SGD without scaling: test R^2 0.316, epochs 23
# SGD with scaling: test R^2 0.347, epochs 13`,
      walk: [
        { line: "X_train, X_test, y_train, y_test = train_test_split(X * 100, y, test_size=0.25, random_state=0)", say: "Multiply the features by 100 to imitate unscaled real-world columns." },
        { line: "exact = LinearRegression().fit(X_train, y_train)", say: "The exact answer, for reference." },
        { line: "sgd = SGDRegressor(learning_rate=\"invscaling\", eta0=0.01, max_iter=2000, tol=1e-4, early_stopping=True, random_state=0)", say: "Stochastic gradient descent: `eta0` is the starting learning rate, `invscaling` shrinks it over time, and `early_stopping` stops when a validation split stops improving." },
        { line: "model = make_pipeline(StandardScaler(), sgd) if scale else sgd", say: "With scaling it gets closer to the exact answer, in fewer epochs." },
      ],
    },
    checks: [
      { if: "Features have different units", do: "Standardise them in the pipeline before any gradient-based model." },
      { if: "Loss becomes NaN or huge", do: "The learning rate is too high: divide it by 10." },
      { if: "Millions of rows", do: "Use `SGD*` models or `partial_fit` on batches." },
    ],
    optimise: [
      { what: "`eta0` / learning rate", when: "Always for SGD models", not: "Exact solvers (`LinearRegression`, `lbfgs`)" },
      { what: "`max_iter`, `tol`, early stopping", when: "Training stops too early or takes too long", not: "Before the learning rate is sensible" },
    ],
  },
  "learning-rate": {
    use: ["Any model trained by gradient steps: SGD models, neural networks, gradient boosting (`learning_rate` there means shrinkage)."],
    avoid: [],
    prep: ["Scale features; a good learning rate depends on the scale of the inputs."],
    recipe: {
      goal: "Sweep the learning rate and schedule for SGD regression",
      code: r`import warnings
from sklearn.datasets import load_diabetes
from sklearn.exceptions import ConvergenceWarning
from sklearn.linear_model import SGDRegressor
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore", category=ConvergenceWarning)
X, y = load_diabetes(return_X_y=True)
for eta0 in [1e-5, 1e-3, 1e-2, 1e-1, 1.0]:
    for schedule in ["constant", "invscaling"]:
        model = make_pipeline(StandardScaler(), SGDRegressor(learning_rate=schedule, eta0=eta0, max_iter=50, random_state=0))
        r2 = cross_val_score(model, X, y, cv=5, scoring="r2").mean()
        verdict = f"{r2:.3f}" if r2 > -1 else ("failed: steps too small, barely moved" if eta0 < 1e-3 else "failed: steps too big, blew up")
        print(f"eta0 {eta0:<6g} {schedule:10s} CV R^2 {verdict}")

# Output:
# eta0 1e-05  constant   CV R^2 failed: steps too small, barely moved
# eta0 1e-05  invscaling CV R^2 failed: steps too small, barely moved
# eta0 0.001  constant   CV R^2 0.480
# eta0 0.001  invscaling CV R^2 0.411
# eta0 0.01   constant   CV R^2 0.468
# eta0 0.01   invscaling CV R^2 0.480
# eta0 0.1    constant   CV R^2 -0.307
# eta0 0.1    invscaling CV R^2 0.466
# eta0 1      constant   CV R^2 failed: steps too big, blew up
# eta0 1      invscaling CV R^2 failed: steps too big, blew up`,
      walk: [
        { line: "for eta0 in [1e-5, 1e-3, 1e-2, 1e-1, 1.0]:", say: "Search on a log scale: learning rates differ by orders of magnitude." },
        { line: "for schedule in [\"constant\", \"invscaling\"]:", say: "Constant steps, or steps that shrink as training goes on." },
        { line: "model = make_pipeline(StandardScaler(), SGDRegressor(learning_rate=schedule, eta0=eta0, max_iter=50, random_state=0))", say: "Only 50 epochs, so a tiny learning rate has no time to get anywhere." },
        { line: "verdict = f\"{r2:.3f}\" if r2 > -1 else (\"failed: steps too small, barely moved\" if eta0 < 1e-3 else \"failed: steps too big, blew up\")", say: "Both extremes fail in opposite ways. The middle range (0.001–0.01) works; a shrinking schedule rescues 0.1." },
      ],
    },
    checks: [
      { if: "Loss jumps around or explodes", do: "Learning rate too high." },
      { if: "Loss falls very slowly", do: "Learning rate too low, or features not scaled." },
    ],
    optimise: [
      { what: "Learning rate", when: "First thing to tune for any gradient-trained model; search on a log scale", not: "Exact solvers and plain trees" },
      { what: "Schedule (decay, warm-up)", when: "Long training runs, neural networks", not: "Short runs where a constant rate already converges" },
    ],
  },
  "gradient-descent-variants": {
    use: ["Neural network training: Adam or SGD with momentum.", "Large data: mini-batches."],
    avoid: [],
    prep: ["Scale inputs; shuffle rows every epoch."],
    recipe: {
      goal: "Plain SGD, momentum and Adam with two batch sizes",
      code: r`import warnings
from sklearn.datasets import load_digits
from sklearn.exceptions import ConvergenceWarning
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

warnings.filterwarnings("ignore", category=ConvergenceWarning)
X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(StandardScaler().fit_transform(X), y, test_size=0.25, random_state=0)
settings = [("sgd", dict(solver="sgd", learning_rate_init=0.01, momentum=0.0)),
            ("sgd + momentum", dict(solver="sgd", learning_rate_init=0.01, momentum=0.9)),
            ("adam", dict(solver="adam", learning_rate_init=0.001))]
for name, kw in settings:
    for batch in [32, 256]:
        m = MLPClassifier(hidden_layer_sizes=(64,), max_iter=30, batch_size=batch, random_state=0, **kw).fit(X_train, y_train)
        print(f"{name:15s} batch {batch:3d}: test accuracy after 30 epochs {m.score(X_test, y_test):.3f}")

# Output:
# sgd             batch  32: test accuracy after 30 epochs 0.960
# sgd             batch 256: test accuracy after 30 epochs 0.758
# sgd + momentum  batch  32: test accuracy after 30 epochs 0.973
# sgd + momentum  batch 256: test accuracy after 30 epochs 0.962
# adam            batch  32: test accuracy after 30 epochs 0.973
# adam            batch 256: test accuracy after 30 epochs 0.956`,
      walk: [
        { line: "(\"sgd + momentum\", dict(solver=\"sgd\", learning_rate_init=0.01, momentum=0.9)),", say: "Momentum carries part of the previous step forward." },
        { line: "(\"adam\", dict(solver=\"adam\", learning_rate_init=0.001))]", say: "Adam adapts the step size per weight. Its usual starting rate is 0.001." },
        { line: "for batch in [32, 256]:", say: "Rows per update. Bigger batches mean fewer updates per epoch." },
        { line: "m = MLPClassifier(hidden_layer_sizes=(64,), max_iter=30, batch_size=batch, random_state=0, **kw).fit(X_train, y_train)", say: "Same network and budget (30 epochs) for all. Plain SGD with big batches falls far behind; momentum and Adam do not." },
      ],
    },
    checks: [
      { if: "You need a reliable default", do: "Adam (or AdamW) with learning rate 1e-3." },
      { if: "Batch size goes up", do: "Expect to raise the learning rate or train for more epochs." },
    ],
    optimise: [
      { what: "Optimiser", when: "Once, at the start of a neural network project", not: "Every experiment: pick one and tune its learning rate" },
      { what: "Batch size", when: "Memory or speed limits, or noisy training", not: "Before the learning rate is tuned" },
      { what: "Momentum / Adam betas", when: "Rarely: defaults (0.9; 0.9, 0.999) work for most problems", not: "As a first step" },
    ],
  },
  "statistics-inference": {
    use: ["Deciding whether one model is really better than another, or whether a result could be luck."],
    avoid: ["Running many tests and reporting only the significant ones."],
    prep: ["Evaluate both models on the same test rows, so the comparison is paired."],
    recipe: {
      goal: "Is model A really better? A bootstrap confidence interval for the difference",
      code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
a = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).predict(X_test) == y_test
b = DecisionTreeClassifier(max_depth=4, random_state=0).fit(X_train, y_train).predict(X_test) == y_test
print(f"accuracy: logistic {a.mean():.3f}, tree {b.mean():.3f}, difference {a.mean() - b.mean():.3f}")

rng = np.random.default_rng(0)
diffs = []
for _ in range(10000):
    idx = rng.integers(0, len(a), len(a))
    diffs.append(a[idx].mean() - b[idx].mean())
lo, hi = np.percentile(diffs, [2.5, 97.5])
print(f"95% bootstrap interval for the difference: {lo:.3f} to {hi:.3f}", "(includes 0: not clearly different)" if lo <= 0 <= hi else "(excludes 0)")

# Output:
# accuracy: logistic 0.959, tree 0.906, difference 0.053
# 95% bootstrap interval for the difference: 0.018 to 0.094 (excludes 0)`,
      walk: [
        { line: "a = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)).fit(X_train, y_train).predict(X_test) == y_test", say: "For each test row: was model A right?" },
        { line: "idx = rng.integers(0, len(a), len(a))", say: "Resample the test rows with replacement." },
        { line: "diffs.append(a[idx].mean() - b[idx].mean())", say: "The accuracy difference on the same resampled rows (a paired comparison)." },
        { line: "lo, hi = np.percentile(diffs, [2.5, 97.5])", say: "The middle 95% of differences. If it excludes 0, the gap is unlikely to be luck." },
      ],
    },
    checks: [
      { if: "Small test set", do: "Report an interval, not just a single number." },
      { if: "Comparing on CV folds", do: "Compare fold by fold with the same splits; repeated CV gives a steadier picture." },
    ],
    optimise: [
      { what: "Number of bootstrap resamples", when: "Intervals look jumpy: use 10,000", not: "Beyond that: no gain" },
    ],
  },
  "linear-regression": {
    use: ["Predicting a number when the relationship is roughly straight-line.", "You need to explain the effect of each feature.", "As the first baseline for any regression problem."],
    avoid: ["Strongly curved relationships (try polynomial features or trees).", "Many correlated features without regularisation."],
    prep: ["Impute missing values; one-hot encode categories.", "Scaling is not required for the fit, but makes coefficients comparable and is required with regularisation."],
    recipe: {
      goal: "Linear regression with a baseline, cross-validation and readable coefficients",
      code: r`from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.dummy import DummyRegressor
from sklearn.metrics import mean_absolute_error, r2_score

X, y = load_diabetes(return_X_y=True, as_frame=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

model = make_pipeline(StandardScaler(), LinearRegression())
cv_r2 = cross_val_score(model, X_train, y_train, cv=5, scoring="r2")
print(f"CV R^2: {cv_r2.mean():.3f} ± {cv_r2.std():.3f}")

model.fit(X_train, y_train)
pred = model.predict(X_test)
baseline = DummyRegressor().fit(X_train, y_train).predict(X_test)
print(f"test MAE: {mean_absolute_error(y_test, pred):.1f}  (baseline {mean_absolute_error(y_test, baseline):.1f})")
print(f"test R^2: {r2_score(y_test, pred):.3f}")

coefs = {c: float(w) for c, w in zip(X.columns, model[-1].coef_.round(1))}
print("biggest effects (per 1 std):", sorted(coefs.items(), key=lambda kv: -abs(kv[1]))[:3])
print("prediction for the first test patient:", model.predict(X_test.iloc[[0]]).round(1))

# Output:
# CV R^2: 0.526 ± 0.035
# test MAE: 46.2  (baseline 59.2)
# test R^2: 0.332
# biggest effects (per 1 std): [('s5', 35.8), ('s1', -31.2), ('bmi', 27.5)]
# prediction for the first test patient: [238.5]`,
      walk: [
        { line: "X, y = load_diabetes(return_X_y=True, as_frame=True)", say: "442 patients, 10 measurements, target = disease progression after one year." },
        { line: "model = make_pipeline(StandardScaler(), LinearRegression())", say: "Scaling makes each coefficient mean \"change in target per one standard deviation\"." },
        { line: "cv_r2 = cross_val_score(model, X_train, y_train, cv=5, scoring=\"r2\")", say: "Cross-validated R² on training data." },
        { line: "baseline = DummyRegressor().fit(X_train, y_train).predict(X_test)", say: "Always compare with predicting the mean: MAE 46 vs 59." },
        { line: "coefs = {c: float(w) for c, w in zip(X.columns, model[-1].coef_.round(1))}", say: "`model[-1]` is the last pipeline step, the fitted regression." },
        { line: "print(\"biggest effects (per 1 std):\", sorted(coefs.items(), key=lambda kv: -abs(kv[1]))[:3])", say: "The largest effects. s1 and s5 are correlated, so read their signs with care." },
      ],
    },
    checks: [
      { if: "Residuals show a curve", do: "Add polynomial or spline features, or try a tree model." },
      { if: "Some features are highly correlated", do: "Use Ridge, or drop one of each correlated pair." },
      { if: "Target is skewed (prices, incomes)", do: "Model `log1p(y)` with `TransformedTargetRegressor`." },
      { if: "Outliers in the target", do: "Try `HuberRegressor` and report MAE." },
    ],
    optimise: [
      { what: "Features (selection, interactions)", when: "Domain knowledge suggests a missing effect", not: "By trying hundreds of combinations on the same CV" },
      { what: "Regularisation (switch to Ridge/Lasso)", when: "Many or correlated features", not: "Few, uncorrelated features and plenty of rows" },
      { what: "Target transform", when: "Skewed target, multiplicative effects", not: "Target already roughly symmetric" },
    ],
  },
  "polynomial-regression": {
    use: ["A smooth curve with a single bend or two in one or a few features."],
    avoid: ["Many input features: the number of terms explodes.", "Predicting beyond the training range: high-degree curves shoot off."],
    prep: ["`PolynomialFeatures`, then `StandardScaler`, then a regularised model (Ridge)."],
    recipe: {
      goal: "Choose the degree and the penalty together with cross-validation",
      code: r`import numpy as np
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.linear_model import Ridge

rng = np.random.default_rng(0)
x = rng.uniform(-3, 3, 200).reshape(-1, 1)
y = 0.5 * x.ravel() ** 3 - x.ravel() ** 2 + rng.normal(0, 2, 200)
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.25, random_state=0)

pipe = make_pipeline(PolynomialFeatures(include_bias=False), StandardScaler(), Ridge())
grid = {"polynomialfeatures__degree": [1, 2, 3, 5, 9], "ridge__alpha": [0.01, 1, 10]}
search = GridSearchCV(pipe, grid, cv=5, scoring="neg_mean_absolute_error").fit(X_train, y_train)
print("best:", search.best_params_, "CV MAE:", round(-search.best_score_, 2))
for d in [1, 3, 9]:
    row = search.cv_results_["params"].index({"polynomialfeatures__degree": d, "ridge__alpha": 0.01})
    print(f"degree {d}: CV MAE {-search.cv_results_['mean_test_score'][row]:.2f}")
print("test MAE:", round(np.mean(np.abs(search.predict(X_test) - y_test)), 2))

# Output:
# best: {'polynomialfeatures__degree': 3, 'ridge__alpha': 0.01} CV MAE: 1.57
# degree 1: CV MAE 3.30
# degree 3: CV MAE 1.57
# degree 9: CV MAE 1.58
# test MAE: 1.8`,
      walk: [
        { line: "y = 0.5 * x.ravel() ** 3 - x.ravel() ** 2 + rng.normal(0, 2, 200)", say: "A cubic curve plus noise, so degree 3 is the truth." },
        { line: "pipe = make_pipeline(PolynomialFeatures(include_bias=False), StandardScaler(), Ridge())", say: "Expand, scale (x⁹ is huge otherwise), then a penalised linear model." },
        { line: "grid = {\"polynomialfeatures__degree\": [1, 2, 3, 5, 9], \"ridge__alpha\": [0.01, 1, 10]}", say: "Tune degree and penalty together." },
        { line: "print(f\"degree {d}: CV MAE {-search.cv_results_['mean_test_score'][row]:.2f}\")", say: "Degree 1 underfits (3.30); degree 3 is best (1.57); degree 9 is no better, only riskier." },
      ],
    },
    checks: [
      { if: "Two or more inputs", do: "Consider `interaction_only=True` or splines (`SplineTransformer`) instead of full polynomials." },
      { if: "Predictions far outside training values", do: "Do not trust polynomial predictions there." },
    ],
    optimise: [
      { what: "`degree`", when: "Always, by CV", not: "Above 3–4 without a strong reason" },
      { what: "`ridge__alpha`", when: "Degree above 2", not: "Degree 1–2 with plenty of data" },
    ],
  },
  regularization: {
    use: ["Many features, correlated features, or more features than you can trust.", "Lasso when you also want automatic feature selection."],
    avoid: ["Unscaled features: the penalty would treat columns unfairly."],
    prep: ["Always `StandardScaler` before Ridge, Lasso or ElasticNet."],
    recipe: {
      goal: "Plain, Ridge and Lasso regression with 20 useless noise features",
      code: r`import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, RidgeCV, LassoCV

X, y = load_diabetes(return_X_y=True, as_frame=True)
rng = np.random.default_rng(0)
for i in range(20):
    X[f"noise{i}"] = rng.normal(size=len(X))
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

alphas = np.logspace(-3, 3, 30)
models = {
    "plain": make_pipeline(StandardScaler(), LinearRegression()),
    "ridge": make_pipeline(StandardScaler(), RidgeCV(alphas=alphas)),
    "lasso": make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5, random_state=0)),
}
for name, m in models.items():
    m.fit(X_train, y_train)
    print(f"{name:5s} test R^2 {m.score(X_test, y_test):.3f}", end="")
    if name != "plain":
        print(f"   alpha {m[-1].alpha_:.3g}", end="")
    print()
lasso = models["lasso"][-1]
kept = X.columns[lasso.coef_ != 0]
print("lasso kept", len(kept), "of", X.shape[1], "features; noise kept:", [c for c in kept if c.startswith("noise")])

# Output:
# plain test R^2 0.371
# ridge test R^2 0.394   alpha 57.4
# lasso test R^2 0.385   alpha 3.29
# lasso kept 11 of 30 features; noise kept: ['noise4', 'noise8', 'noise12', 'noise13', 'noise14']`,
      walk: [
        { line: "X[f\"noise{i}\"] = rng.normal(size=len(X))", say: "Add 20 columns of pure noise to see what each model does with them." },
        { line: "alphas = np.logspace(-3, 3, 30)", say: "Penalty strengths from 0.001 to 1,000 on a log scale." },
        { line: "\"ridge\": make_pipeline(StandardScaler(), RidgeCV(alphas=alphas)),", say: "`RidgeCV` picks alpha by efficient built-in cross-validation." },
        { line: "\"lasso\": make_pipeline(StandardScaler(), LassoCV(alphas=alphas, cv=5, random_state=0)),", say: "`LassoCV` picks alpha with 5-fold CV and sets many weights to exactly zero." },
        { line: "print(\"lasso kept\", len(kept), \"of\", X.shape[1], \"features; noise kept:\", [c for c in kept if c.startswith(\"noise\")])", say: "Lasso dropped 19 of 30 columns but kept 5 noise columns: selection is helpful, not perfect." },
      ],
    },
    checks: [
      { if: "Features are correlated in groups", do: "Prefer Ridge or ElasticNet; Lasso picks one of a group at random." },
      { if: "You need a short list of features", do: "Lasso, then check the selection is stable across folds." },
      { if: "Classification", do: "The same idea: `C` in `LogisticRegression` (C = 1/alpha)." },
    ],
    optimise: [
      { what: "`alpha`", when: "Always, by CV on a log scale (`RidgeCV`, `LassoCV`)", not: "On the test set" },
      { what: "`l1_ratio` (ElasticNet)", when: "Correlated features and you want some selection", not: "When Ridge already does well and selection is not needed" },
    ],
  },
  "multiple-linear-regression": {
    use: ["Several inputs explain a number together, and you want each one's effect while holding the others fixed."],
    avoid: ["Interpreting coefficients when features are strongly correlated."],
    prep: ["Encode categories, scale for comparable coefficients, check correlations and VIF."],
    recipe: {
      goal: "Find correlated features and see whether dropping one matters",
      code: r`import numpy as np
import pandas as pd
from sklearn.datasets import load_diabetes
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression

X, y = load_diabetes(return_X_y=True, as_frame=True)
corr = X.corr().abs().where(~np.eye(X.shape[1], dtype=bool))
pair = corr.stack().idxmax()
print("most correlated pair:", pair, round(corr.stack().max(), 2))

def vif(df):
    out = {}
    for c in df.columns:
        r2 = LinearRegression().fit(df.drop(columns=c), df[c]).score(df.drop(columns=c), df[c])
        out[c] = round(1 / (1 - r2), 1)
    return pd.Series(out).sort_values(ascending=False)
print("VIF (above ~10 = trouble):", vif(X).head(3).to_dict())

model = make_pipeline(StandardScaler(), LinearRegression())
full = cross_val_score(model, X, y, cv=5, scoring="r2").mean()
fewer = cross_val_score(model, X.drop(columns=["s1"]), y, cv=5, scoring="r2").mean()
print(f"CV R^2 all features {full:.3f} | without s1 {fewer:.3f}")

# Output:
# most correlated pair: ('s1', 's2') 0.9
# VIF (above ~10 = trouble): {'s1': 59.2, 's2': 39.2, 's3': 15.4}
# CV R^2 all features 0.482 | without s1 0.478`,
      walk: [
        { line: "corr = X.corr().abs().where(~np.eye(X.shape[1], dtype=bool))", say: "Absolute correlations between features, ignoring each feature with itself." },
        { line: "r2 = LinearRegression().fit(df.drop(columns=c), df[c]).score(df.drop(columns=c), df[c])", say: "VIF: how well the other features predict this one." },
        { line: "out[c] = round(1 / (1 - r2), 1)", say: "VIF = 1/(1 − R²). s1 has 59: it is almost fully explained by the others." },
        { line: "fewer = cross_val_score(model, X.drop(columns=[\"s1\"]), y, cv=5, scoring=\"r2\").mean()", say: "Dropping s1 barely changes accuracy (0.482 → 0.478) but makes the remaining coefficients much more stable." },
      ],
    },
    checks: [
      { if: "VIF above about 10", do: "Drop or combine features, or use Ridge, before interpreting coefficients." },
      { if: "A category has many levels", do: "One-hot with `min_frequency`, or target encoding." },
      { if: "An effect depends on another feature", do: "Add an interaction term (product of the two)." },
    ],
    optimise: [
      { what: "Which features to include", when: "Interpretation matters", not: "Pure prediction with Ridge, where correlated features are harmless" },
    ],
  },
  "tree-knn-regression": {
    use: ["Non-linear relationships without designing features by hand.", "KNN: small data with meaningful distances. Trees: mixed feature types, no scaling needed."],
    avoid: ["Predicting outside the training range: both flatten out.", "KNN with many features or millions of rows."],
    prep: ["KNN: scale, impute, encode. Trees: encode categories; no scaling."],
    recipe: {
      goal: "Tune KNN and a decision tree for regression and compare",
      code: r`from sklearn.datasets import load_diabetes
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor

X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=0)

knn = GridSearchCV(make_pipeline(StandardScaler(), KNeighborsRegressor()),
                   {"kneighborsregressor__n_neighbors": [3, 5, 10, 20, 40],
                    "kneighborsregressor__weights": ["uniform", "distance"]},
                   cv=5, scoring="neg_mean_absolute_error").fit(X_train, y_train)
tree = GridSearchCV(DecisionTreeRegressor(random_state=0),
                    {"max_depth": [2, 3, 4, 6, None], "min_samples_leaf": [1, 5, 20]},
                    cv=5, scoring="neg_mean_absolute_error").fit(X_train, y_train)
for name, s in [("KNN", knn), ("tree", tree)]:
    test_mae = abs(s.predict(X_test) - y_test).mean()
    print(f"{name:4s} best {s.best_params_}  CV MAE {-s.best_score_:.1f}  test MAE {test_mae:.1f}")

# Output:
# KNN  best {'kneighborsregressor__n_neighbors': 10, 'kneighborsregressor__weights': 'distance'}  CV MAE 45.1  test MAE 46.6
# tree best {'max_depth': 3, 'min_samples_leaf': 20}  CV MAE 46.9  test MAE 55.2`,
      walk: [
        { line: "knn = GridSearchCV(make_pipeline(StandardScaler(), KNeighborsRegressor()),", say: "KNN always gets a scaler first." },
        { line: "\"kneighborsregressor__weights\": [\"uniform\", \"distance\"]},", say: "Distance weighting trusts closer neighbours more." },
        { line: "{\"max_depth\": [2, 3, 4, 6, None], \"min_samples_leaf\": [1, 5, 20]},", say: "The two settings that control a tree's size." },
        { line: "print(f\"{name:4s} best {s.best_params_}  CV MAE {-s.best_score_:.1f}  test MAE {test_mae:.1f}\")", say: "The single tree's test error is far worse than its CV error: one tree is unstable. A forest fixes that." },
      ],
    },
    checks: [
      { if: "Single tree results vary a lot", do: "Use a random forest or gradient boosting instead." },
      { if: "KNN is slow at prediction time", do: "Reduce features (PCA) or switch to a tree ensemble." },
    ],
    optimise: [
      { what: "`n_neighbors`, `weights`", when: "KNN, always", not: "" },
      { what: "`max_depth`, `min_samples_leaf`", when: "Single trees, always", not: "Leave defaults only for a quick look" },
    ],
  },
};
