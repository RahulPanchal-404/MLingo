import type { AlgoGuide } from "./types";

const r = String.raw;

/** Practical guides for workflow and evaluation topics. */
export const ALGO_GUIDES_3: Record<string, AlgoGuide> = {
  "feature-scaling": {
    use: ["Before any model that uses distances, gradients or weight penalties: KNN, SVM, linear/logistic regression with penalties, neural networks, PCA, K-means."],
    avoid: ["Tree-based models (decision trees, forests, boosting): scaling changes nothing for them."],
    prep: ["Fit the scaler on training data only, inside the pipeline."],
    recipe: {
      goal: "Which models need scaling, and which scaler? Four models × four choices",
      code: r`import numpy as np
from sklearn.datasets import load_wine
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MinMaxScaler, RobustScaler, StandardScaler
from sklearn.svm import SVC

X, y = load_wine(return_X_y=True)
print("feature std: min", X.std(0).min().round(2), "max", X.std(0).max().round(1))

models = {"KNN": KNeighborsClassifier(), "SVM (rbf)": SVC(),
          "LogReg": LogisticRegression(max_iter=10000), "RandomForest": RandomForestClassifier(random_state=0)}
scalers = {"none": None, "standard": StandardScaler(), "minmax": MinMaxScaler(), "robust": RobustScaler()}
print(f"{'':13s}" + "".join(f"{s:>10s}" for s in scalers))
for name, model in models.items():
    row = []
    for s in scalers.values():
        pipe = model if s is None else make_pipeline(s, model)
        row.append(cross_val_score(pipe, X, y, cv=5).mean())
    print(f"{name:13s}" + "".join(f"{v:10.3f}" for v in row))

# Output:
# feature std: min 0.12 max 314.0
#                    none  standard    minmax    robust
# KNN               0.691     0.949     0.950     0.938
# SVM (rbf)         0.663     0.983     0.978     0.983
# LogReg            0.961     0.983     0.978     0.989
# RandomForest      0.983     0.983     0.983     0.983`,
      walk: [
        { line: "print(\"feature std: min\", X.std(0).min().round(2), \"max\", X.std(0).max().round(1))", say: "Feature spreads range from 0.12 to 314: a 2,600-fold difference." },
        { line: "scalers = {\"none\": None, \"standard\": StandardScaler(), \"minmax\": MinMaxScaler(), \"robust\": RobustScaler()}", say: "No scaling and the three common scalers." },
        { line: "pipe = model if s is None else make_pipeline(s, model)", say: "Scaler inside the pipeline, refitted on each training fold." },
        { line: "print(f\"{name:13s}\" + \"\".join(f\"{v:10.3f}\" for v in row))", say: "KNN and SVM jump from about 0.68 to 0.95–0.98 with any scaler. Logistic regression gains a little. The random forest is identical in every column." },
      ],
    },
    checks: [
      { if: "Distance, gradient or penalty-based model", do: "`StandardScaler` by default." },
      { if: "Outliers you must keep", do: "`RobustScaler`." },
      { if: "Inputs must be in a fixed range (images, some neural networks)", do: "`MinMaxScaler`, or divide pixels by 255." },
      { if: "Sparse data (TF-IDF, one-hot)", do: "`MaxAbsScaler` or no scaling: centring would destroy sparsity." },
      { if: "Tree models", do: "Skip scaling." },
    ],
    optimise: [
      { what: "Which scaler", when: "Outliers or skew present: compare standard vs robust (vs log first)", not: "Clean data: StandardScaler is enough; trees: none" },
    ],
  },
  "train-test-split": {
    use: ["Every project: an honest estimate of performance on new data."],
    avoid: ["Random splits when rows are grouped (several per customer, patient, machine) or ordered in time."],
    prep: ["Split before any learned preprocessing; keep the test set locked until the end."],
    recipe: {
      goal: "Stratified CV, one final test, and why one random split is not enough",
      code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GroupKFold, StratifiedKFold, TimeSeriesSplit, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))

X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
scores = cross_val_score(model, X_dev, y_dev, cv=StratifiedKFold(5, shuffle=True, random_state=0))
print(f"stratified 5-fold CV: {scores.mean():.3f} ± {scores.std():.3f}")
print("final test (used once):", round(model.fit(X_dev, y_dev).score(X_test, y_test), 3))

tests = []
for seed in range(10):
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=seed)
    tests.append(model.fit(X_tr, y_tr).score(X_te, y_te))
print(f"one random split, 10 different seeds: {min(tests):.3f} to {max(tests):.3f}")

groups = np.arange(len(X)) // 5
test_groups = sorted({int(g) for g in groups[next(GroupKFold(5).split(X, y, groups))[1]]})
print("GroupKFold, first fold test groups:", test_groups[:5], "... (each group entirely in test)")
tr, te = list(TimeSeriesSplit(3).split(X))[0]
print(f"TimeSeriesSplit fold 1: train rows 0-{tr.max()}, test rows {te.min()}-{te.max()}")

# Output:
# stratified 5-fold CV: 0.978 ± 0.010
# final test (used once): 0.982
# one random split, 10 different seeds: 0.965 to 0.991
# GroupKFold, first fold test groups: [2, 7, 12, 17, 22] ... (each group entirely in test)
# TimeSeriesSplit fold 1: train rows 0-142, test rows 143-284`,
      walk: [
        { line: "X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)", say: "Lock away 20% as the test set, keeping class proportions." },
        { line: "scores = cross_val_score(model, X_dev, y_dev, cv=StratifiedKFold(5, shuffle=True, random_state=0))", say: "All comparing and tuning happens with CV on the development data." },
        { line: "print(f\"one random split, 10 different seeds: {min(tests):.3f} to {max(tests):.3f}\")", say: "A single split's score moves from 0.965 to 0.991 with the seed alone. CV averages that noise out." },
        { line: "test_groups = sorted({int(g) for g in groups[next(GroupKFold(5).split(X, y, groups))[1]]})", say: "`GroupKFold` keeps every row of a group (customer, patient) on the same side." },
        { line: "tr, te = list(TimeSeriesSplit(3).split(X))[0]", say: "`TimeSeriesSplit` always trains on earlier rows and tests on later ones." },
      ],
    },
    checks: [
      { if: "Classification", do: "Stratify (`stratify=y`, `StratifiedKFold`)." },
      { if: "Several rows per entity", do: "`GroupKFold` / `StratifiedGroupKFold` with the entity ID." },
      { if: "Data ordered in time", do: "`TimeSeriesSplit`, or a cut-off date. Never shuffle." },
      { if: "Fewer than ~1,000 rows", do: "Rely on (repeated) CV; keep the test set small or use nested CV." },
    ],
    optimise: [
      { what: "Number of folds", when: "Small data: 10 or repeated 5-fold", not: "Huge data: a single validation split is fine" },
      { what: "Test size", when: "Enough rows for a stable final number (hundreds of positives if possible)", not: "" },
    ],
  },
  "feature-engineering": {
    use: ["When raw columns do not express what matters: ratios, time since, cyclical time, counts, text length, flags for missing values."],
    avoid: ["Features computed with information from after the prediction time, or from the whole dataset (target averages without cross-fitting)."],
    prep: ["Pure row-wise features (ratios, date parts) can be made before the split; anything learned from data goes in the pipeline."],
    recipe: {
      goal: "Engineered features with a linear model vs raw columns",
      code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer, make_column_selector
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng = np.random.default_rng(0)
n = 1500
df = pd.DataFrame({
    "age": rng.integers(18, 70, n).astype(float),
    "income": rng.lognormal(10, 1, n),
    "city": rng.choice(["Mysuru", "Bengaluru", "Pune", "Delhi"], n, p=[0.3, 0.4, 0.2, 0.1]),
    "signup_hour": rng.integers(0, 24, n),
})
df.loc[rng.random(n) < 0.15, "income"] = np.nan
night = (df["signup_hour"] >= 22) | (df["signup_hour"] <= 4)
logit = 0.06 * (df["age"] - 40) + 2.5 * night + 1.5 * (df["city"] == "Bengaluru") - 1.5 + 2.0 * df["income"].isna()
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

def add_features(d):
    d = d.copy()
    d["log_income"] = np.log1p(d["income"])
    d["hour_sin"] = np.sin(2 * np.pi * d["signup_hour"] / 24)
    d["hour_cos"] = np.cos(2 * np.pi * d["signup_hour"] / 24)
    return d.drop(columns=["income", "signup_hour"])

X = add_features(df)
prep = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median", add_indicator=True), StandardScaler()),
     make_column_selector(dtype_include="number")),
    ("cat", OneHotEncoder(handle_unknown="ignore"), ["city"]),
])
for name, model in [("logistic + engineered features", make_pipeline(prep, LogisticRegression(max_iter=2000))),
                    ("boosting on raw columns", make_pipeline(
                        ColumnTransformer([("cat", OneHotEncoder(handle_unknown="ignore"), ["city"])], remainder="passthrough"),
                        HistGradientBoostingClassifier(random_state=0)))]:
    data = X if name.startswith("logistic") else df
    print(f"{name:31s} CV accuracy {cross_val_score(model, data, y, cv=5).mean():.3f}")
simple = make_pipeline(ColumnTransformer([("num", SimpleImputer(strategy="median"), ["age", "income", "signup_hour"])]),
                       StandardScaler(), LogisticRegression(max_iter=2000))
print(f"{'logistic on raw numbers only':31s} CV accuracy {cross_val_score(simple, df, y, cv=5).mean():.3f}")

# Output:
# logistic + engineered features  CV accuracy 0.727
# boosting on raw columns         CV accuracy 0.724
# logistic on raw numbers only    CV accuracy 0.659`,
      walk: [
        { line: "def add_features(d):", say: "A function of each row only, so it is safe to apply before splitting." },
        { line: "d[\"log_income\"] = np.log1p(d[\"income\"])", say: "Log of a long-tailed column." },
        { line: "d[\"hour_sin\"] = np.sin(2 * np.pi * d[\"signup_hour\"] / 24)", say: "Hour on a circle, so 23:00 and 01:00 are close: this lets a linear model see \"night-time\"." },
        { line: "(\"num\", make_pipeline(SimpleImputer(strategy=\"median\", add_indicator=True), StandardScaler()),", say: "The missing-income flag is itself a predictive feature here." },
        { line: "print(f\"{'logistic on raw numbers only':31s} CV accuracy {cross_val_score(simple, df, y, cv=5).mean():.3f}\")", say: "Engineered features lift the linear model from 0.66 to 0.73, level with boosting on raw columns, while staying easy to explain." },
      ],
    },
    checks: [
      { if: "Times and dates", do: "Day of week, month, holiday flags, time since an event, cyclical encodings." },
      { if: "Amounts across entities", do: "Ratios (per person, per square metre) and differences." },
      { if: "Event logs", do: "Counts and sums over windows that end before the prediction time." },
      { if: "Tree models", do: "Fewer hand-made features needed; still add domain features and time-since features." },
    ],
    optimise: [
      { what: "New features", when: "Validation error is driven by a pattern you can describe", not: "Generating hundreds blindly and selecting on the same CV" },
    ],
  },
  "imbalanced-data": {
    use: ["Rare positive class: fraud, failure, disease, churn."],
    avoid: ["Accuracy as the metric.", "Resampling before the split, or on validation/test data."],
    prep: ["Stratified splits. Keep validation and test sets at the real class balance."],
    recipe: {
      goal: "Class weights versus a threshold chosen on cross-validation",
      code: r`import numpy as np
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_score, recall_score
from sklearn.model_selection import cross_val_predict, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = make_classification(n_samples=20000, n_features=12, n_informative=5, weights=[0.98],
                           n_clusters_per_class=1, class_sep=1.2, random_state=0)
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
print(f"positives: {y.mean():.1%} | always-'no' accuracy: {1 - y_test.mean():.3f}")

for cw in [None, "balanced"]:
    model = make_pipeline(StandardScaler(), LogisticRegression(class_weight=cw, max_iter=2000))
    oof = cross_val_predict(model, X_dev, y_dev, cv=5, method="predict_proba")[:, 1]
    ts = np.linspace(0.005, 0.995, 199)
    ok = [t for t in ts if recall_score(y_dev, oof >= t) >= 0.8]
    t = max(ok)
    model.fit(X_dev, y_dev)
    p = model.predict_proba(X_test)[:, 1]
    print(f"class_weight={cw!s:8s} PR-AUC {average_precision_score(y_test, p):.3f} | at 0.5: recall {recall_score(y_test, p >= 0.5):.2f} "
          f"| threshold {t:.2f} (chosen on CV): recall {recall_score(y_test, p >= t):.2f}, precision {precision_score(y_test, p >= t):.2f}")

# Output:
# positives: 2.5% | always-'no' accuracy: 0.975
# class_weight=None     PR-AUC 0.778 | at 0.5: recall 0.69 | threshold 0.01 (chosen on CV): recall 0.80, precision 0.11
# class_weight=balanced PR-AUC 0.778 | at 0.5: recall 0.76 | threshold 0.27 (chosen on CV): recall 0.80, precision 0.11`,
      walk: [
        { line: "print(f\"positives: {y.mean():.1%} | always-'no' accuracy: {1 - y_test.mean():.3f}\")", say: "With 2.5% positives, predicting \"no\" every time already scores 97.5% accuracy." },
        { line: "oof = cross_val_predict(model, X_dev, y_dev, cv=5, method=\"predict_proba\")[:, 1]", say: "Out-of-fold probabilities on development data, used only to choose the threshold." },
        { line: "ok = [t for t in ts if recall_score(y_dev, oof >= t) >= 0.8]", say: "All thresholds that catch at least 80% of positives." },
        { line: "print(f\"class_weight={cw!s:8s} PR-AUC {average_precision_score(y_test, p):.3f} | at 0.5: recall {recall_score(y_test, p >= 0.5):.2f} \"", say: "Class weights raise recall at 0.5 but leave PR-AUC unchanged: the ranking is the same. Choosing the threshold gives the same recall/precision either way." },
      ],
    },
    checks: [
      { if: "Positives under ~10%", do: "Use PR-AUC, recall, precision; never accuracy alone." },
      { if: "A target recall or precision is required", do: "Choose the threshold on validation (out-of-fold) data, then freeze it." },
      { if: "Model ignores the rare class", do: "`class_weight=\"balanced\"` (or `scale_pos_weight` in XGBoost)." },
      { if: "Trying SMOTE or undersampling", do: "Only inside the training folds, e.g. with `imblearn.pipeline`." },
    ],
    optimise: [
      { what: "Threshold", when: "Always, for the final decision", not: "On the test set" },
      { what: "Class weights", when: "The model barely predicts the rare class at all", not: "Expecting a better ranking: they mostly move the threshold" },
      { what: "Resampling", when: "After weights and threshold, if still needed", not: "As the first step" },
    ],
  },
  "bias-variance": {
    use: ["Deciding what to do next when a model is not good enough: more capacity, more regularisation or more data."],
    avoid: [],
    prep: ["A fixed CV setup so training and validation scores are comparable."],
    recipe: {
      goal: "Diagnose underfitting and overfitting with learning curves",
      code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import learning_curve
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
sizes = np.linspace(0.1, 1.0, 5)
for name, model in [("stump (depth 1)", DecisionTreeClassifier(max_depth=1, random_state=0)),
                    ("deep tree", DecisionTreeClassifier(random_state=0)),
                    ("random forest", RandomForestClassifier(200, random_state=0))]:
    n, tr, va = learning_curve(model, X, y, train_sizes=sizes, cv=5)
    gap = tr.mean(1) - va.mean(1)
    print(f"{name:15s} train {tr.mean(1)[-1]:.3f}  validation {va.mean(1)[-1]:.3f}  gap {gap[-1]:.3f}  "
          f"validation with {n[0]} vs {n[-1]} rows: {va.mean(1)[0]:.3f} -> {va.mean(1)[-1]:.3f}")

# Output:
# stump (depth 1) train 0.924  validation 0.900  gap 0.025  validation with 45 vs 455 rows: 0.909 -> 0.900
# deep tree       train 1.000  validation 0.917  gap 0.083  validation with 45 vs 455 rows: 0.817 -> 0.917
# random forest   train 1.000  validation 0.960  gap 0.040  validation with 45 vs 455 rows: 0.759 -> 0.960`,
      walk: [
        { line: "for name, model in [(\"stump (depth 1)\", DecisionTreeClassifier(max_depth=1, random_state=0)),", say: "Three models from very simple to flexible." },
        { line: "n, tr, va = learning_curve(model, X, y, train_sizes=sizes, cv=5)", say: "Training and validation scores for growing amounts of training data." },
        { line: "gap = tr.mean(1) - va.mean(1)", say: "The gap between training and validation: large means variance (overfitting)." },
        { line: "f\"validation with {n[0]} vs {n[-1]} rows: {va.mean(1)[0]:.3f} -> {va.mean(1)[-1]:.3f}\")", say: "The stump does not improve with more data (bias). The deep tree and forest do (variance): more data helps them." },
      ],
    },
    checks: [
      { if: "Training and validation scores both low", do: "High bias: more features, a more flexible model, less regularisation." },
      { if: "Training high, validation much lower", do: "High variance: regularise, simplify, add data, or use an ensemble." },
      { if: "Validation still rising at full data size", do: "More data will help." },
    ],
    optimise: [
      { what: "Model complexity", when: "Guided by the train/validation gap", not: "Guided by training score alone" },
    ],
  },
  "cross-validation-tuning": {
    use: ["Choosing settings for any model in a way that holds up on new data."],
    avoid: ["Tuning on the test set.", "Huge grids on small data (you will find lucky settings)."],
    prep: ["Put all preprocessing in the pipeline you tune."],
    recipe: {
      goal: "Defaults, grid search and random search for an SVM with the same budget",
      code: r`from scipy.stats import loguniform
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold, cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = load_breast_cancer(return_X_y=True)
X_dev, X_test, y_dev, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)
pipe = make_pipeline(StandardScaler(), SVC())
cv = StratifiedKFold(5, shuffle=True, random_state=0)

print("defaults, CV:", round(cross_val_score(pipe, X_dev, y_dev, cv=cv).mean(), 3))
grid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [1e-3, 1e-2, 1e-1, 1]}, cv=cv).fit(X_dev, y_dev)
rand = RandomizedSearchCV(pipe, {"svc__C": loguniform(1e-2, 1e3), "svc__gamma": loguniform(1e-4, 1)},
                          n_iter=16, cv=cv, random_state=0).fit(X_dev, y_dev)
for name, s in [("grid (16 fits x 5)", grid), ("random (16 fits x 5)", rand)]:
    p = {k: round(float(v), 4) for k, v in s.best_params_.items()}
    print(f"{name:21s} best {p}  CV {s.best_score_:.3f}  test {s.score(X_test, y_test):.3f}")

# Output:
# defaults, CV: 0.98
# grid (16 fits x 5)    best {'svc__C': 10.0, 'svc__gamma': 0.01}  CV 0.982  test 0.974
# random (16 fits x 5)  best {'svc__C': 10.3233, 'svc__gamma': 0.0151}  CV 0.980  test 0.974`,
      walk: [
        { line: "print(\"defaults, CV:\", round(cross_val_score(pipe, X_dev, y_dev, cv=cv).mean(), 3))", say: "Always score the defaults first: here 0.980." },
        { line: "grid = GridSearchCV(pipe, {\"svc__C\": [0.1, 1, 10, 100], \"svc__gamma\": [1e-3, 1e-2, 1e-1, 1]}, cv=cv).fit(X_dev, y_dev)", say: "Grid: every combination of 4 × 4 values." },
        { line: "rand = RandomizedSearchCV(pipe, {\"svc__C\": loguniform(1e-2, 1e3), \"svc__gamma\": loguniform(1e-4, 1)},", say: "Random search samples 16 settings from log-uniform ranges." },
        { line: "print(f\"{name:21s} best {p}  CV {s.best_score_:.3f}  test {s.score(X_test, y_test):.3f}\")", say: "Both searches beat the defaults by only 0.002 and score lower on test: on easy data, tuning adds little. Know when to stop." },
      ],
    },
    checks: [
      { if: "Two or three settings", do: "`GridSearchCV`." },
      { if: "Four or more settings, or continuous ranges", do: "`RandomizedSearchCV` with log-uniform distributions, or Optuna." },
      { if: "Expensive models", do: "`HalvingRandomSearchCV` or Optuna with pruning." },
      { if: "You report the tuned score as the final result", do: "Use a held-out test set or nested CV instead: the best CV score is optimistic." },
    ],
    optimise: [
      { what: "Search budget (`n_iter`)", when: "The best score is still improving as you add trials", not: "Gains smaller than the fold-to-fold spread" },
      { what: "Scoring metric", when: "Always set it to what you care about", not: "Leave it as accuracy for imbalanced data" },
    ],
  },
  "regression-metrics": {
    use: ["Reporting how far regression predictions are from the truth, in units people understand."],
    avoid: ["MAPE when targets can be zero or tiny.", "R² alone, without an error in real units."],
    prep: ["Compare against a baseline (predict the mean or median)."],
    recipe: {
      goal: "MAE, RMSE and R² against a baseline, by segment, and with one large error",
      code: r`import numpy as np
from sklearn.datasets import load_diabetes
from sklearn.dummy import DummyRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

X, y = load_diabetes(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0)
for name, m in [("mean baseline", DummyRegressor()), ("linear", LinearRegression())]:
    p = m.fit(X_train, y_train).predict(X_test)
    print(f"{name:13s} MAE {mean_absolute_error(y_test, p):5.1f}  RMSE {mean_squared_error(y_test, p) ** 0.5:5.1f}  R^2 {r2_score(y_test, p):6.3f}")
p = LinearRegression().fit(X_train, y_train).predict(X_test)
err = np.abs(y_test - p)
low = y_test < np.median(y_test)
print(f"MAE for low targets {err[low].mean():.1f} vs high targets {err[~low].mean():.1f}")
p_bad = p.copy(); p_bad[0] += 300
print(f"one prediction off by 300 more: MAE {mean_absolute_error(y_test, p_bad):.1f}, RMSE {mean_squared_error(y_test, p_bad) ** 0.5:.1f}")

# Output:
# mean baseline MAE  58.3  RMSE  70.5  R^2 -0.000
# linear        MAE  45.1  RMSE  56.4  R^2  0.359
# MAE for low targets 43.8 vs high targets 46.4
# one prediction off by 300 more: MAE 46.4, RMSE 59.7`,
      walk: [
        { line: "for name, m in [(\"mean baseline\", DummyRegressor()), (\"linear\", LinearRegression())]:", say: "Every metric means more next to a baseline." },
        { line: "print(f\"{name:13s} MAE {mean_absolute_error(y_test, p):5.1f}  RMSE {mean_squared_error(y_test, p) ** 0.5:5.1f}  R^2 {r2_score(y_test, p):6.3f}\")", say: "MAE is the typical miss, RMSE punishes big misses, R² is the share of variance explained." },
        { line: "print(f\"MAE for low targets {err[low].mean():.1f} vs high targets {err[~low].mean():.1f}\")", say: "Break the error down by segment: one overall number can hide a weak region." },
        { line: "p_bad = p.copy(); p_bad[0] += 300", say: "Make one prediction much worse." },
      ],
    },
    checks: [
      { if: "Large errors are especially costly", do: "Optimise and report RMSE." },
      { if: "Outliers in the target", do: "Report MAE (and median absolute error)." },
      { if: "Targets span orders of magnitude", do: "Use errors on the log scale (RMSLE) or relative errors." },
    ],
    optimise: [
      { what: "The metric you tune for", when: "Choose it to match the cost of errors", not: "Switch metrics after seeing results" },
    ],
  },
  "regression-diagnostics": {
    use: ["Checking a fitted linear model: curvature, unequal spread, influential points."],
    avoid: [],
    prep: ["Fit the model, then analyse residuals on training and validation data."],
    recipe: {
      goal: "Find an influential point and a funnel-shaped residual pattern",
      code: r`import numpy as np
from sklearn.linear_model import LinearRegression

rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 100)
y = 3 + 2 * x + rng.normal(0, 0.5 + 0.3 * x)
x = np.append(x, 25); y = np.append(y, 10)
X = np.column_stack([np.ones_like(x), x])

fit = LinearRegression().fit(x.reshape(-1, 1), y)
resid = y - fit.predict(x.reshape(-1, 1))
H = X @ np.linalg.inv(X.T @ X) @ X.T
lev = np.diag(H)
p, n = X.shape[1], len(y)
s2 = resid @ resid / (n - p)
cooks = resid ** 2 / (p * s2) * lev / (1 - lev) ** 2
print("slope with the odd point:", round(fit.coef_[0], 2))
print("highest leverage:", lev.argmax(), round(lev.max(), 3), "| highest Cook's D:", cooks.argmax(), round(cooks.max(), 2), "(rule of thumb > 4/n =", round(4 / n, 3), ")")
keep = np.arange(n) != cooks.argmax()
print("slope without it:", round(LinearRegression().fit(x[keep].reshape(-1, 1), y[keep]).coef_[0], 2))
lo, hi = x[keep] < 5, x[keep] >= 5
print(f"residual spread for x < 5: {resid[keep][lo].std():.2f}, x >= 5: {resid[keep][hi].std():.2f}  (growing = funnel)")

# Output:
# slope with the odd point: 1.33
# highest leverage: 100 0.298 | highest Cook's D: 100 15.16 (rule of thumb > 4/n = 0.04 )
# slope without it: 1.95
# residual spread for x < 5: 1.76, x >= 5: 2.92  (growing = funnel)`,
      walk: [
        { line: "y = 3 + 2 * x + rng.normal(0, 0.5 + 0.3 * x)", say: "True slope 2, with noise that grows with x." },
        { line: "x = np.append(x, 25); y = np.append(y, 10)", say: "One point far to the right with a wrong y value." },
        { line: "H = X @ np.linalg.inv(X.T @ X) @ X.T", say: "The hat matrix; its diagonal is each point's leverage." },
        { line: "cooks = resid ** 2 / (p * s2) * lev / (1 - lev) ** 2", say: "Cook's distance combines leverage and residual size." },
        { line: "print(\"slope without it:\", round(LinearRegression().fit(x[keep].reshape(-1, 1), y[keep]).coef_[0], 2))", say: "One point pulled the slope from 1.95 to 1.33." },
        { line: "print(f\"residual spread for x < 5: {resid[keep][lo].std():.2f}, x >= 5: {resid[keep][hi].std():.2f}  (growing = funnel)\")", say: "Spread grows with x: consider a log target or weighted regression." },
      ],
    },
    checks: [
      { if: "Residuals curve", do: "Add non-linear terms or use a non-linear model." },
      { if: "Residual spread grows with the prediction", do: "Log-transform the target, or use weighted regression." },
      { if: "A point has large Cook's distance", do: "Check it for errors; report results with and without it." },
    ],
    optimise: [
      { what: "Model form", when: "Diagnostics show a pattern", not: "Residuals look like random noise" },
    ],
  },
  "classification-metrics": {
    use: ["Reporting how a classifier makes mistakes, and choosing an operating point."],
    avoid: ["Accuracy alone on imbalanced data."],
    prep: ["Decide which mistake is worse (missed positive or false alarm) before choosing the metric."],
    recipe: {
      goal: "The confusion matrix and its metrics at three thresholds",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, f1_score, fbeta_score, precision_score, recall_score
from sklearn.model_selection import cross_val_predict
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
y = (y == 0).astype(int)
model = make_pipeline(StandardScaler(), LogisticRegression(C=0.05, max_iter=5000))
proba = cross_val_predict(model, X, y, cv=5, method="predict_proba")[:, 1]
for t in (0.2, 0.5, 0.8):
    pred = proba >= t
    tn, fp, fn, tp = confusion_matrix(y, pred).ravel()
    print(f"threshold {t}: TP {tp} FP {fp} FN {fn} TN {tn} | precision {precision_score(y, pred):.3f} recall {recall_score(y, pred):.3f} "
          f"F1 {f1_score(y, pred):.3f} F2 {fbeta_score(y, pred, beta=2):.3f}")

# Output:
# threshold 0.2: TP 209 FP 38 FN 3 TN 319 | precision 0.846 recall 0.986 F1 0.911 F2 0.954
# threshold 0.5: TP 199 FP 2 FN 13 TN 355 | precision 0.990 recall 0.939 F1 0.964 F2 0.949
# threshold 0.8: TP 171 FP 0 FN 41 TN 357 | precision 1.000 recall 0.807 F1 0.893 F2 0.839`,
      walk: [
        { line: "proba = cross_val_predict(model, X, y, cv=5, method=\"predict_proba\")[:, 1]", say: "Out-of-fold probabilities: every row predicted by a model that did not train on it." },
        { line: "tn, fp, fn, tp = confusion_matrix(y, pred).ravel()", say: "The four counts every metric is built from." },
        { line: "f\"F1 {f1_score(y, pred):.3f} F2 {fbeta_score(y, pred, beta=2):.3f}\")", say: "F2 weights recall twice as much as precision: it prefers the 0.2 threshold, F1 prefers 0.5." },
      ],
    },
    checks: [
      { if: "Missed positives are costly (disease, fraud)", do: "Recall, F2, or recall at a fixed precision." },
      { if: "False alarms are costly (spam filter)", do: "Precision, or F0.5." },
      { if: "Several classes", do: "Per-class report plus macro F1." },
    ],
    optimise: [
      { what: "Threshold", when: "Pick it for the metric that matches your costs", not: "On the test set" },
    ],
  },
};
