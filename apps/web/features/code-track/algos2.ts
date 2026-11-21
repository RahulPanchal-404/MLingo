import type { AlgoGuide } from "./types";

const r = String.raw;

/** Practical guides for classification, unsupervised and neural network topics. */
export const ALGO_GUIDES_2: Record<string, AlgoGuide> = {
  "logistic-regression": {
    use: ["Yes/no or multiclass prediction with probabilities you can explain.", "The first baseline for any classification problem.", "Text classification with TF-IDF features."],
    avoid: ["Strongly non-linear boundaries, unless you engineer features."],
    prep: ["Impute, one-hot encode, and scale (the penalty and the solver both need it)."],
    recipe: {
      goal: "Tune C and class weights, then choose a threshold",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

X, y = load_breast_cancer(return_X_y=True)
y = (y == 0).astype(int)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

pipe = make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))
grid = {"logisticregression__C": [0.01, 0.1, 1, 10, 100],
        "logisticregression__class_weight": [None, "balanced"]}
cv = StratifiedKFold(5, shuffle=True, random_state=0)
search = GridSearchCV(pipe, grid, cv=cv, scoring="f1").fit(X_train, y_train)
print("best:", search.best_params_, "CV F1:", round(search.best_score_, 3))

proba = search.predict_proba(X_test)[:, 1]
for t in (0.3, 0.5, 0.7):
    pred = (proba >= t).astype(int)
    print(f"threshold {t}: missed {((pred == 0) & (y_test == 1)).sum()}, false alarms {((pred == 1) & (y_test == 0)).sum()}")
print(classification_report(y_test, search.predict(X_test), digits=3))

# Output:
# best: {'logisticregression__C': 1, 'logisticregression__class_weight': None} CV F1: 0.976
# threshold 0.3: missed 2, false alarms 6
# threshold 0.5: missed 2, false alarms 1
# threshold 0.7: missed 4, false alarms 0
#               precision    recall  f1-score   support
# 
#            0      0.973     0.986     0.979        72
#            1      0.976     0.952     0.964        42
# 
#     accuracy                          0.974       114
#    macro avg      0.974     0.969     0.972       114
# weighted avg      0.974     0.974     0.974       114`,
      walk: [
        { line: "y = (y == 0).astype(int)", say: "Make \"malignant\" the positive class (1), so recall means \"cancers caught\"." },
        { line: "grid = {\"logisticregression__C\": [0.01, 0.1, 1, 10, 100],", say: "C is the inverse penalty: small C = simpler model." },
        { line: "\"logisticregression__class_weight\": [None, \"balanced\"]}", say: "Try weighting the rarer class more." },
        { line: "search = GridSearchCV(pipe, grid, cv=cv, scoring=\"f1\").fit(X_train, y_train)", say: "Score by F1 because both missed cancers and false alarms matter." },
        { line: "pred = (proba >= t).astype(int)", say: "The threshold is a separate decision: lower it to miss fewer positives at the cost of more false alarms." },
        { line: "print(classification_report(y_test, search.predict(X_test), digits=3))", say: "Precision, recall and F1 for each class on the test set." },
      ],
    },
    checks: [
      { if: "Classes are imbalanced", do: "`class_weight=\"balanced\"` and/or a tuned threshold; judge with recall, precision, PR-AUC." },
      { if: "Many features or text", do: "Keep the L2 penalty; try L1 (`solver=\"saga\"`) for a sparse model." },
      { if: "You need trustworthy probabilities", do: "Check a calibration curve; logistic regression is usually well calibrated." },
      { if: "Convergence warning", do: "Scale the features, then raise `max_iter`." },
    ],
    optimise: [
      { what: "`C`", when: "Always, by CV on a log scale", not: "" },
      { what: "Threshold", when: "Missing a positive and a false alarm have different costs", not: "Only accuracy matters and classes are balanced" },
      { what: "`class_weight`", when: "Rare positive class", not: "Balanced classes" },
      { what: "`penalty` (l1/l2/elasticnet)", when: "You want feature selection", not: "Before C is tuned" },
    ],
  },
  "k-nearest-neighbors": {
    use: ["Small to medium tabular data where \"similar rows have similar labels\" is true.", "A quick non-linear baseline with no training time."],
    avoid: ["Many features (distances lose meaning).", "Large data with fast predictions required.", "Unscaled features."],
    prep: ["Scaling is mandatory. Impute missing values. One-hot encode categories, or use a suitable distance."],
    recipe: {
      goal: "Tune K, weighting and the distance metric",
      code: r`from sklearn.datasets import load_wine
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier

X, y = load_wine(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())
grid = {"kneighborsclassifier__n_neighbors": [1, 3, 5, 9, 15, 25],
        "kneighborsclassifier__weights": ["uniform", "distance"],
        "kneighborsclassifier__p": [1, 2]}
search = GridSearchCV(pipe, grid, cv=5).fit(X_train, y_train)
print("best:", search.best_params_, "CV accuracy:", round(search.best_score_, 3))
print("test accuracy:", round(search.score(X_test, y_test), 3))
res = search.cv_results_
for k in (1, 5, 25):
    i = res["params"].index({"kneighborsclassifier__n_neighbors": k, "kneighborsclassifier__weights": "uniform", "kneighborsclassifier__p": 2})
    print(f"K = {k:2d}: CV accuracy {res['mean_test_score'][i]:.3f}")

# Output:
# best: {'kneighborsclassifier__n_neighbors': 25, 'kneighborsclassifier__p': 1, 'kneighborsclassifier__weights': 'uniform'} CV accuracy: 0.955
# test accuracy: 0.978
# K =  1: CV accuracy 0.918
# K =  5: CV accuracy 0.940
# K = 25: CV accuracy 0.955`,
      walk: [
        { line: "pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())", say: "Scaler first: without it, the feature with the biggest numbers decides every distance." },
        { line: "grid = {\"kneighborsclassifier__n_neighbors\": [1, 3, 5, 9, 15, 25],", say: "Odd K values avoid ties in two-class problems." },
        { line: "\"kneighborsclassifier__p\": [1, 2]}", say: "p = 1 Manhattan distance, p = 2 Euclidean." },
        { line: "print(f\"K = {k:2d}: CV accuracy {res['mean_test_score'][i]:.3f}\")", say: "K = 1 copies noise (0.918); larger K smooths it out (0.955)." },
      ],
    },
    checks: [
      { if: "More than ~20 features", do: "Reduce with PCA or feature selection first." },
      { if: "Classes are imbalanced", do: "`weights=\"distance\"` and check recall per class." },
      { if: "Predictions are slow", do: "Use fewer rows/features or switch models." },
    ],
    optimise: [
      { what: "`n_neighbors`", when: "Always", not: "" },
      { what: "`weights`", when: "Always worth one comparison", not: "" },
      { what: "`p` / `metric`", when: "Features are counts or have outliers", not: "Before scaling is in place" },
    ],
  },
  "decision-trees": {
    use: ["You need rules a person can read.", "Mixed numeric and categorical data with no scaling.", "As the building block of forests and boosting."],
    avoid: ["As your final model when accuracy matters: a single tree is unstable."],
    prep: ["Encode categories (ordinal is fine for trees). No scaling. Impute (or use HistGradientBoosting, which handles NaN)."],
    recipe: {
      goal: "Limit the tree's size with CV and read its rules",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.2, stratify=data.target, random_state=0)

grid = {"max_depth": [2, 3, 4, 6, None], "min_samples_leaf": [1, 5, 10, 20]}
search = GridSearchCV(DecisionTreeClassifier(random_state=0), grid, cv=5).fit(X_train, y_train)
tree = search.best_estimator_
print("best:", search.best_params_, "CV accuracy:", round(search.best_score_, 3))
print("test accuracy:", round(tree.score(X_test, y_test), 3))

full = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)
print(f"unlimited tree: {full.get_depth()} levels, train {full.score(X_train, y_train):.3f}, test {full.score(X_test, y_test):.3f}")
print(export_text(tree, feature_names=list(data.feature_names), max_depth=1))

# Output:
# best: {'max_depth': 4, 'min_samples_leaf': 1} CV accuracy: 0.949
# test accuracy: 0.939
# unlimited tree: 7 levels, train 1.000, test 0.939
# |--- worst concave points <= 0.14
# |   |--- worst area <= 952.90
# |   |   |--- truncated branch of depth 3
# |   |--- worst area >  952.90
# |   |   |--- truncated branch of depth 3
# |--- worst concave points >  0.14
# |   |--- area error <= 21.93
# |   |   |--- truncated branch of depth 3
# |   |--- area error >  21.93
# |   |   |--- class: 0`,
      walk: [
        { line: "grid = {\"max_depth\": [2, 3, 4, 6, None], \"min_samples_leaf\": [1, 5, 10, 20]}", say: "Depth and leaf size control how much the tree may memorise." },
        { line: "full = DecisionTreeClassifier(random_state=0).fit(X_train, y_train)", say: "An unlimited tree for comparison." },
        { line: "print(f\"unlimited tree: {full.get_depth()} levels, train {full.score(X_train, y_train):.3f}, test {full.score(X_test, y_test):.3f}\")", say: "100% on training data is memorisation, not skill." },
        { line: "print(export_text(tree, feature_names=list(data.feature_names), max_depth=1))", say: "Print the top of the tree as readable if/else rules." },
      ],
    },
    checks: [
      { if: "You need accuracy, not rules", do: "Use a random forest or gradient boosting." },
      { if: "Imbalanced classes", do: "`class_weight=\"balanced\"`." },
    ],
    optimise: [
      { what: "`max_depth`, `min_samples_leaf`", when: "Always", not: "" },
      { what: "`ccp_alpha` (pruning)", when: "You want the smallest tree that keeps accuracy", not: "When depth limits already work" },
      { what: "`criterion`", when: "Rarely matters", not: "Spend time elsewhere" },
    ],
  },
  "naive-bayes": {
    use: ["Text classification with little data (spam, topics).", "A very fast baseline."],
    avoid: ["When you need well-calibrated probabilities (they are often too extreme).", "Strongly dependent features where accuracy matters most."],
    prep: ["Text: `CountVectorizer` or TF-IDF with `MultinomialNB`. Numeric: `GaussianNB` (scaling not needed)."],
    recipe: {
      goal: "Gaussian NB on numbers and Multinomial NB on text",
      code: r`from sklearn.datasets import load_wine
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.model_selection import cross_val_score
from sklearn.naive_bayes import GaussianNB, MultinomialNB
from sklearn.pipeline import make_pipeline

X, y = load_wine(return_X_y=True)
print("GaussianNB on numeric wine data, CV accuracy:", round(cross_val_score(GaussianNB(), X, y, cv=5).mean(), 3))

texts = ["win cash now", "cheap pills offer", "win a free prize", "claim your free cash",
         "meeting at noon", "lunch tomorrow?", "project notes attached", "see you at the meeting"]
labels = [1, 1, 1, 1, 0, 0, 0, 0]
spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0)).fit(texts, labels)
for msg in ["free cash prize", "notes for the meeting", "free lunch"]:
    print(f"{msg!r}: P(spam) = {spam.predict_proba([msg])[0, 1]:.2f}")

# Output:
# GaussianNB on numeric wine data, CV accuracy: 0.966
# 'free cash prize': P(spam) = 0.95
# 'notes for the meeting': P(spam) = 0.08
# 'free lunch': P(spam) = 0.60`,
      walk: [
        { line: "print(\"GaussianNB on numeric wine data, CV accuracy:\", round(cross_val_score(GaussianNB(), X, y, cv=5).mean(), 3))", say: "Gaussian NB assumes each feature is bell-shaped within each class." },
        { line: "spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0)).fit(texts, labels)", say: "Word counts plus Multinomial NB: the classic spam filter. `alpha` smooths unseen words." },
        { line: "print(f\"{msg!r}: P(spam) = {spam.predict_proba([msg])[0, 1]:.2f}\")", say: "\"free lunch\" is borderline (0.60): \"free\" is spammy, \"lunch\" is not." },
      ],
    },
    checks: [
      { if: "Text data", do: "`MultinomialNB` (counts) or `ComplementNB` (imbalanced text)." },
      { if: "Binary word presence", do: "`BernoulliNB`." },
      { if: "Probabilities will drive decisions", do: "Calibrate with `CalibratedClassifierCV`." },
    ],
    optimise: [
      { what: "`alpha`", when: "Text models: try 0.01–1", not: "" },
      { what: "Vectoriser settings", when: "Usually matter more than alpha", not: "" },
    ],
  },
  "support-vector-machines": {
    use: ["Small to medium data with complex boundaries (RBF kernel).", "High-dimensional data such as text (linear SVM)."],
    avoid: ["More than about 50,000 rows with a kernel (slow).", "When you need probabilities by default."],
    prep: ["Scaling is mandatory. Impute and encode."],
    recipe: {
      goal: "Linear versus RBF kernel, tuning C and gamma together",
      code: r`from sklearn.datasets import make_circles
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

X, y = make_circles(n_samples=400, noise=0.1, factor=0.5, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

pipe = make_pipeline(StandardScaler(), SVC())
grid = [{"svc__kernel": ["linear"], "svc__C": [0.1, 1, 10]},
        {"svc__kernel": ["rbf"], "svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.01, 0.1, 1, 10]}]
search = GridSearchCV(pipe, grid, cv=5).fit(X_train, y_train)
print("best:", search.best_params_, "CV accuracy:", round(search.best_score_, 3))
lin = max(s for p, s in zip(search.cv_results_["params"], search.cv_results_["mean_test_score"]) if p["svc__kernel"] == "linear")
print("best linear kernel CV accuracy:", round(lin, 3))
print("test accuracy:", round(search.score(X_test, y_test), 3), "| support vectors:", len(search.best_estimator_[-1].support_))

# Output:
# best: {'svc__C': 1, 'svc__gamma': 0.1, 'svc__kernel': 'rbf'} CV accuracy: 1.0
# best linear kernel CV accuracy: 0.577
# test accuracy: 1.0 | support vectors: 122`,
      walk: [
        { line: "X, y = make_circles(n_samples=400, noise=0.1, factor=0.5, random_state=0)", say: "One class inside a ring of the other: no straight line can separate them." },
        { line: "grid = [{\"svc__kernel\": [\"linear\"], \"svc__C\": [0.1, 1, 10]},", say: "A list of grids: linear needs only C." },
        { line: "{\"svc__kernel\": [\"rbf\"], \"svc__C\": [0.1, 1, 10, 100], \"svc__gamma\": [0.01, 0.1, 1, 10]}]", say: "RBF needs C and gamma, tuned together on a log scale." },
        { line: "print(\"best linear kernel CV accuracy:\", round(lin, 3))", say: "Linear manages only 0.58 here; RBF reaches 1.0." },
      ],
    },
    checks: [
      { if: "Many rows", do: "`LinearSVC` or `SGDClassifier(loss=\"hinge\")`, or switch to gradient boosting." },
      { if: "Text or very many features", do: "`LinearSVC` is usually enough." },
      { if: "Need probabilities", do: "`CalibratedClassifierCV(LinearSVC())` or `SVC(probability=True)` (slower)." },
    ],
    optimise: [
      { what: "`C`", when: "Always", not: "" },
      { what: "`gamma`", when: "RBF kernel, together with C", not: "Linear kernel" },
      { what: "`kernel`", when: "Compare linear and RBF once", not: "`poly` rarely beats RBF" },
    ],
  },
  "random-forests": {
    use: ["A strong default for tabular data with little tuning.", "Mixed feature types, non-linear effects and interactions."],
    avoid: ["Extrapolating beyond the training range.", "When model size or prediction speed is tightly limited."],
    prep: ["Encode categories; no scaling. Impute missing values (recent scikit-learn versions also accept NaN in forests)."],
    recipe: {
      goal: "Defaults with an out-of-bag score, a light search, and permutation importance",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import RandomizedSearchCV, train_test_split

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.2, stratify=data.target, random_state=0)

base = RandomForestClassifier(n_estimators=300, oob_score=True, n_jobs=-1, random_state=0).fit(X_train, y_train)
print(f"defaults: OOB accuracy {base.oob_score_:.3f}, test {base.score(X_test, y_test):.3f}")

search = RandomizedSearchCV(RandomForestClassifier(n_estimators=300, n_jobs=-1, random_state=0),
                            {"max_features": ["sqrt", 0.3, 0.6], "min_samples_leaf": [1, 3, 10], "max_depth": [None, 8, 16]},
                            n_iter=10, cv=5, random_state=0).fit(X_train, y_train)
print("tuned:", search.best_params_, "CV", round(search.best_score_, 3), "test", round(search.score(X_test, y_test), 3))

imp = permutation_importance(base, X_test, y_test, n_repeats=10, random_state=0)
top = imp.importances_mean.argsort()[::-1][:3]
print("most important (permutation):", [str(data.feature_names[i]) for i in top])

# Output:
# defaults: OOB accuracy 0.965, test 0.947
# tuned: {'min_samples_leaf': 1, 'max_features': 0.6, 'max_depth': 16} CV 0.969 test 0.93
# most important (permutation): ['worst radius', 'worst area', 'mean texture']`,
      walk: [
        { line: "base = RandomForestClassifier(n_estimators=300, oob_score=True, n_jobs=-1, random_state=0).fit(X_train, y_train)", say: "300 trees, all CPU cores, and an out-of-bag score: a free validation estimate from rows each tree did not see." },
        { line: "{\"max_features\": [\"sqrt\", 0.3, 0.6], \"min_samples_leaf\": [1, 3, 10], \"max_depth\": [None, 8, 16]},", say: "The settings that matter most for forests." },
        { line: "print(\"tuned:\", search.best_params_, \"CV\", round(search.best_score_, 3), \"test\", round(search.score(X_test, y_test), 3))", say: "Tuning raised the CV score a little but not the test score. Forests' defaults are strong; do not over-tune." },
        { line: "imp = permutation_importance(base, X_test, y_test, n_repeats=10, random_state=0)", say: "Shuffle each feature on test data and measure the drop: more reliable than the built-in importances." },
      ],
    },
    checks: [
      { if: "Imbalanced classes", do: "`class_weight=\"balanced_subsample\"` and a tuned threshold." },
      { if: "Very large data", do: "Limit `max_depth` or `max_samples`, or use HistGradientBoosting." },
      { if: "You need the best possible accuracy", do: "Try gradient boosting next." },
    ],
    optimise: [
      { what: "`n_estimators`", when: "Raise until the OOB score stops improving", not: "Expect it to cause overfitting: more trees never do" },
      { what: "`max_features`", when: "The most useful single setting", not: "" },
      { what: "`min_samples_leaf` / `max_depth`", when: "Noisy data, or to shrink the model", not: "Clean data where defaults already win" },
    ],
  },
  "gradient-boosting": {
    use: ["Usually the most accurate choice for tabular data.", "Large datasets: `HistGradientBoosting*` is fast and handles missing values."],
    avoid: ["Very small datasets where simpler models are as good and easier to trust."],
    prep: ["No scaling. Missing values allowed (Hist version). Categories via `categorical_features` or ordinal encoding."],
    recipe: {
      goal: "HistGradientBoosting with early stopping and a small grid",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

model = HistGradientBoostingClassifier(max_iter=1000, early_stopping=True, validation_fraction=0.15,
                                       n_iter_no_change=20, random_state=0)
grid = {"learning_rate": [0.03, 0.1, 0.3], "max_depth": [2, 3, None], "l2_regularization": [0.0, 1.0]}
search = GridSearchCV(model, grid, cv=5).fit(X_train, y_train)
best = search.best_estimator_
print("best:", search.best_params_, "CV accuracy:", round(search.best_score_, 3))
print("trees actually used (early stopping):", best.n_iter_)
print("test accuracy:", round(best.score(X_test, y_test), 3))

# Output:
# best: {'l2_regularization': 0.0, 'learning_rate': 0.3, 'max_depth': 3} CV accuracy: 0.965
# trees actually used (early stopping): 67
# test accuracy: 0.956`,
      walk: [
        { line: "model = HistGradientBoostingClassifier(max_iter=1000, early_stopping=True, validation_fraction=0.15,", say: "Allow up to 1,000 trees but stop when an internal 15% validation split stops improving." },
        { line: "n_iter_no_change=20, random_state=0)", say: "Patience: 20 rounds without improvement." },
        { line: "grid = {\"learning_rate\": [0.03, 0.1, 0.3], \"max_depth\": [2, 3, None], \"l2_regularization\": [0.0, 1.0]}", say: "Learning rate, tree size and a penalty: the main levers." },
        { line: "print(\"trees actually used (early stopping):\", best.n_iter_)", say: "Early stopping chose the number of trees for you." },
      ],
    },
    checks: [
      { if: "Missing values", do: "Leave them as NaN for HistGradientBoosting." },
      { if: "Categorical columns", do: "Pass `categorical_features=\"from_dtype\"` with pandas category columns." },
      { if: "Imbalanced classes", do: "`class_weight=\"balanced\"` and a tuned threshold." },
    ],
    optimise: [
      { what: "`learning_rate` + number of trees", when: "Always; use early stopping for the number of trees", not: "Tune the number of trees by hand" },
      { what: "`max_depth` / `max_leaf_nodes`", when: "Always worth a small search", not: "" },
      { what: "`l2_regularization`, `min_samples_leaf`", when: "Overfitting (train ≫ validation)", not: "Before the learning rate is set" },
    ],
  },
  "multiclass-softmax": {
    use: ["More than two mutually exclusive classes."],
    avoid: ["Labels that can be true together (multilabel): use one sigmoid output per label."],
    prep: ["Same as the underlying model (logistic regression: impute, encode, scale)."],
    recipe: {
      goal: "Multiclass logistic regression on digits, with top-2 accuracy and the most common mix-up",
      code: r`from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix, top_k_accuracy_score
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

search = GridSearchCV(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)),
                      {"logisticregression__C": [0.01, 0.1, 1, 10]}, cv=5).fit(X_train, y_train)
proba = search.predict_proba(X_test)
print("best C:", search.best_params_["logisticregression__C"], "| test accuracy:", round(search.score(X_test, y_test), 3))
print("top-2 accuracy:", round(top_k_accuracy_score(y_test, proba, k=2), 3))
cm = confusion_matrix(y_test, search.predict(X_test))
cm[range(10), range(10)] = 0
i, j = divmod(cm.argmax(), 10)
print(f"most common mix-up: true {i} predicted as {j} ({cm[i, j]} times)")
print("probabilities for one image sum to", round(proba[0].sum(), 6))

# Output:
# best C: 1 | test accuracy: 0.969
# top-2 accuracy: 0.998
# most common mix-up: true 8 predicted as 1 (3 times)
# probabilities for one image sum to 1.0`,
      walk: [
        { line: "search = GridSearchCV(make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000)),", say: "`LogisticRegression` uses softmax automatically when there are more than two classes." },
        { line: "print(\"top-2 accuracy:\", round(top_k_accuracy_score(y_test, proba, k=2), 3))", say: "Correct if the true class is in the model's top two guesses: useful when a human picks from suggestions." },
        { line: "cm[range(10), range(10)] = 0", say: "Remove correct answers from the confusion matrix to find the worst mistake." },
        { line: "print(f\"most common mix-up: true {i} predicted as {j} ({cm[i, j]} times)\")", say: "8s are mistaken for 1s most often." },
      ],
    },
    checks: [
      { if: "Some classes are rare", do: "Report macro-averaged F1, not only accuracy." },
      { if: "Labels can co-occur", do: "`MultiOutputClassifier` or one binary model per label." },
    ],
    optimise: [
      { what: "`C`", when: "Always", not: "" },
      { what: "One-vs-rest vs softmax", when: "Rarely makes a big difference", not: "Spend time on features first" },
    ],
  },
  "roc-auc-calibration": {
    use: ["Comparing models independently of a threshold (ROC-AUC, PR-AUC).", "When predicted probabilities are used as real probabilities (risk scores, expected cost)."],
    avoid: ["ROC-AUC alone for rare positives: use PR-AUC too."],
    prep: ["Calibrate on data the model was not trained on (`CalibratedClassifierCV` handles this with internal CV)."],
    recipe: {
      goal: "Measure ranking and calibration, then calibrate a random forest",
      code: r`from sklearn.calibration import CalibratedClassifierCV, calibration_curve
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import average_precision_score, brier_score_loss, roc_auc_score, roc_curve
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=6000, n_features=20, n_informative=6, weights=[0.9], random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)

raw = RandomForestClassifier(300, random_state=0).fit(X_train, y_train)
cal = CalibratedClassifierCV(RandomForestClassifier(300, random_state=0), method="isotonic", cv=5).fit(X_train, y_train)
for name, m in [("raw forest", raw), ("calibrated", cal)]:
    p = m.predict_proba(X_test)[:, 1]
    frac, mean_p = calibration_curve(y_test, p, n_bins=5)
    print(f"{name:10s} ROC-AUC {roc_auc_score(y_test, p):.3f}  PR-AUC {average_precision_score(y_test, p):.3f}  Brier {brier_score_loss(y_test, p):.4f}")
    print(f"{'':10s} predicted {mean_p.round(2)} vs observed {frac.round(2)}")

p = cal.predict_proba(X_test)[:, 1]
fpr, tpr, thr = roc_curve(y_test, p)
i = (tpr >= 0.9).argmax()
print(f"threshold {thr[i]:.3f} catches {tpr[i]:.0%} of positives with {fpr[i]:.1%} false-positive rate")

# Output:
# raw forest ROC-AUC 0.922  PR-AUC 0.779  Brier 0.0420
#            predicted [0.04 0.27 0.51 0.72 0.89] vs observed [0.03 0.29 0.69 0.89 0.95]
# calibrated ROC-AUC 0.917  PR-AUC 0.780  Brier 0.0408
#            predicted [0.02 0.27 0.49 0.71 0.97] vs observed [0.03 0.31 0.5  0.78 0.92]
# threshold 0.020 catches 92% of positives with 34.7% false-positive rate`,
      walk: [
        { line: "cal = CalibratedClassifierCV(RandomForestClassifier(300, random_state=0), method=\"isotonic\", cv=5).fit(X_train, y_train)", say: "Isotonic calibration fitted with 5-fold internal CV." },
        { line: "frac, mean_p = calibration_curve(y_test, p, n_bins=5)", say: "Group predictions into bins and compare the average prediction with the actual share of positives." },
        { line: "print(f\"{name:10s} ROC-AUC {roc_auc_score(y_test, p):.3f}  PR-AUC {average_precision_score(y_test, p):.3f}  Brier {brier_score_loss(y_test, p):.4f}\")", say: "ROC-AUC and PR-AUC measure ranking; the Brier score also checks the probabilities." },
        { line: "i = (tpr >= 0.9).argmax()", say: "Find the first threshold that catches 90% of positives and report the price in false positives." },
      ],
    },
    checks: [
      { if: "Positives under 10%", do: "Report PR-AUC alongside ROC-AUC." },
      { if: "Probabilities feed a decision or cost", do: "Check the calibration curve; calibrate if it bends away from the diagonal." },
      { if: "Fewer than ~1,000 rows", do: "Prefer `method=\"sigmoid\"`; isotonic needs more data." },
    ],
    optimise: [
      { what: "Calibration method", when: "Probabilities are used as numbers", not: "Only the ranking matters" },
      { what: "Threshold", when: "Always for the final decision, on validation data", not: "On the test set" },
    ],
  },
  "adaboost-xgboost": {
    use: ["Boosting when you want to compare implementations; XGBoost/LightGBM for very large tabular data and competitions."],
    avoid: ["AdaBoost on noisy labels: it chases mislabelled points."],
    prep: ["No scaling. XGBoost and LightGBM handle missing values natively."],
    recipe: {
      goal: "Watch test accuracy round by round for AdaBoost and gradient boosting",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import AdaBoostClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=0)

ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=300, learning_rate=0.5, random_state=0).fit(X_train, y_train)
gb = GradientBoostingClassifier(n_estimators=300, learning_rate=0.1, max_depth=2, subsample=0.8, random_state=0).fit(X_train, y_train)
for name, m in [("AdaBoost", ada), ("GradBoost", gb)]:
    staged = [((p == y_test).mean()) for p in m.staged_predict(X_test)]
    best = max(range(len(staged)), key=staged.__getitem__)
    print(f"{name:9s} test accuracy after 10 / 100 / 300 rounds: {staged[9]:.3f} / {staged[99]:.3f} / {staged[-1]:.3f}  (best at round {best + 1})")

# Output:
# AdaBoost  test accuracy after 10 / 100 / 300 rounds: 0.947 / 0.956 / 0.965  (best at round 255)
# GradBoost test accuracy after 10 / 100 / 300 rounds: 0.939 / 0.930 / 0.939  (best at round 222)`,
      walk: [
        { line: "ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=300, learning_rate=0.5, random_state=0).fit(X_train, y_train)", say: "AdaBoost with stumps (one-split trees), shrunk by a learning rate of 0.5." },
        { line: "gb = GradientBoostingClassifier(n_estimators=300, learning_rate=0.1, max_depth=2, subsample=0.8, random_state=0).fit(X_train, y_train)", say: "Gradient boosting with small trees and row sampling (`subsample`)." },
        { line: "staged = [((p == y_test).mean()) for p in m.staged_predict(X_test)]", say: "`staged_predict` gives predictions after each round, so you can see where accuracy peaks. Choose the number of rounds on validation data, not test data." },
      ],
    },
    checks: [
      { if: "Millions of rows", do: "`HistGradientBoosting*`, XGBoost (`tree_method=\"hist\"`) or LightGBM." },
      { if: "Label noise", do: "Prefer gradient boosting with `subsample` over AdaBoost." },
    ],
    optimise: [
      { what: "`learning_rate` with number of rounds", when: "Always, with early stopping", not: "" },
      { what: "Tree depth", when: "Always: stumps for AdaBoost, 3–8 levels for XGBoost", not: "" },
      { what: "Sampling (`subsample`, `colsample_bytree`) and penalties", when: "Overfitting", not: "Before the basics are tuned" },
    ],
  },
  "ensemble-methods": {
    use: ["Combining different strong models for a final small gain.", "When models make different kinds of mistakes."],
    avoid: ["Combining weak or near-identical models.", "When simplicity and explanation matter more than a small gain."],
    prep: ["Each member keeps its own preprocessing pipeline."],
    recipe: {
      goal: "Compare three models with a soft-voting and a stacking ensemble",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier, StackingClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
members = [
    ("lr", make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))),
    ("knn", make_pipeline(StandardScaler(), KNeighborsClassifier(7))),
    ("rf", RandomForestClassifier(300, random_state=0)),
]
models = members + [
    ("soft vote", VotingClassifier(members, voting="soft")),
    ("stacking", StackingClassifier(members, final_estimator=LogisticRegression(), cv=5)),
]
for name, m in models:
    print(f"{name:9s} CV accuracy {cross_val_score(m, X, y, cv=5).mean():.3f}")

# Output:
# lr        CV accuracy 0.981
# knn       CV accuracy 0.970
# rf        CV accuracy 0.963
# soft vote CV accuracy 0.974
# stacking  CV accuracy 0.979`,
      walk: [
        { line: "(\"lr\", make_pipeline(StandardScaler(), LogisticRegression(max_iter=5000))),", say: "Each member carries its own preprocessing." },
        { line: "(\"soft vote\", VotingClassifier(members, voting=\"soft\")),", say: "Average the members' probabilities." },
        { line: "(\"stacking\", StackingClassifier(members, final_estimator=LogisticRegression(), cv=5)),", say: "A second model learns how to combine the members from their out-of-fold predictions." },
        { line: "print(f\"{name:9s} CV accuracy {cross_val_score(m, X, y, cv=5).mean():.3f}\")", say: "Here no ensemble beats plain logistic regression: an ensemble is not automatically better. Always compare." },
      ],
    },
    checks: [
      { if: "Members agree on almost every row", do: "An ensemble will not help; add a different kind of model." },
      { if: "One member is much weaker", do: "Drop it, or let stacking learn to ignore it." },
    ],
    optimise: [
      { what: "Which members to include", when: "Choose diverse, individually good models", not: "Add more of the same" },
      { what: "`voting` / `final_estimator`", when: "After members are tuned", not: "Before" },
    ],
  },
  "k-means": {
    use: ["Grouping similar rows into round, similarly sized clusters (customer segments, colour quantisation)."],
    avoid: ["Clusters of irregular shape or very different sizes and densities.", "Unscaled features or many categorical columns."],
    prep: ["Scale all features. Encode categories or use another method. Consider PCA first when there are many features."],
    recipe: {
      goal: "Choose k with inertia and silhouette, and check the effect of scaling",
      code: r`import numpy as np
from sklearn.cluster import KMeans
from sklearn.datasets import load_wine
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

for k in range(2, 7):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    print(f"k = {k}: inertia {km.inertia_:7.1f}  silhouette {silhouette_score(Xs, km.labels_):.3f}")

km = KMeans(n_clusters=3, n_init=10, random_state=0).fit(Xs)
print("cluster sizes:", np.bincount(km.labels_))
print("agreement with the real wine types (ARI):", round(adjusted_rand_score(y, km.labels_), 3))
raw = KMeans(n_clusters=3, n_init=10, random_state=0).fit(X)
print("same, without scaling (ARI):", round(adjusted_rand_score(y, raw.labels_), 3))
print("new wine goes to cluster:", km.predict(Xs[:1])[0])

# Output:
# k = 2: inertia  1659.0  silhouette 0.268
# k = 3: inertia  1277.9  silhouette 0.285
# k = 4: inertia  1180.7  silhouette 0.246
# k = 5: inertia  1110.4  silhouette 0.203
# k = 6: inertia  1044.5  silhouette 0.196
# cluster sizes: [65 51 62]
# agreement with the real wine types (ARI): 0.897
# same, without scaling (ARI): 0.371
# new wine goes to cluster: 2`,
      walk: [
        { line: "Xs = StandardScaler().fit_transform(X)", say: "Scale first: K-means is pure distance." },
        { line: "km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)", say: "Ten random starts per k; the best is kept." },
        { line: "print(f\"k = {k}: inertia {km.inertia_:7.1f}  silhouette {silhouette_score(Xs, km.labels_):.3f}\")", say: "Silhouette peaks at k = 3." },
        { line: "print(\"agreement with the real wine types (ARI):\", round(adjusted_rand_score(y, km.labels_), 3))", say: "These wines have known types, so we can check: 0.90 agreement." },
        { line: "print(\"same, without scaling (ARI):\", round(adjusted_rand_score(y, raw.labels_), 3))", say: "Without scaling, agreement drops to 0.37." },
        { line: "print(\"new wine goes to cluster:\", km.predict(Xs[:1])[0])", say: "New rows can be assigned with `predict` (scaled with the same scaler)." },
      ],
    },
    checks: [
      { if: "Clusters look like rings, moons or chains", do: "Use DBSCAN or hierarchical (single linkage)." },
      { if: "Large data", do: "`MiniBatchKMeans`." },
      { if: "Mixed numeric and categorical data", do: "Encode carefully, or use a method designed for mixed data (k-prototypes)." },
    ],
    optimise: [
      { what: "`n_clusters`", when: "Always: silhouette, elbow, and whether the groups are useful", not: "By inertia alone (it always falls)" },
      { what: "`n_init`", when: "Results change between runs: raise it", not: "" },
    ],
  },
  "hierarchical-clustering": {
    use: ["Small to medium data where you want to see the nested structure (dendrogram) and choose the number of groups afterwards."],
    avoid: ["More than ~10,000 rows (memory and time grow fast)."],
    prep: ["Scale features; pick a distance that suits the data."],
    recipe: {
      goal: "Compare linkage methods on the same data",
      code: r`import numpy as np
from scipy.cluster.hierarchy import fcluster, linkage
from sklearn.datasets import load_wine
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler

X, y = load_wine(return_X_y=True)
Xs = StandardScaler().fit_transform(X)

for method in ["ward", "average", "complete", "single"]:
    Z = linkage(Xs, method=method)
    labels = fcluster(Z, t=3, criterion="maxclust")
    print(f"{method:8s} sizes {np.bincount(labels)[1:]}  silhouette {silhouette_score(Xs, labels):.3f}  ARI {adjusted_rand_score(y, labels):.3f}")

Z = linkage(Xs, method="ward")
print("last 4 merge heights:", Z[-4:, 2].round(1))

# Output:
# ward     sizes [56 64 58]  silhouette 0.277  ARI 0.790
# average  sizes [  3 174   1]  silhouette 0.158  ARI -0.005
# complete sizes [69 51 58]  silhouette 0.204  ARI 0.577
# single   sizes [  3 174   1]  silhouette 0.183  ARI -0.007
# last 4 merge heights: [12.2 12.6 27.7 35.4]`,
      walk: [
        { line: "for method in [\"ward\", \"average\", \"complete\", \"single\"]:", say: "Four ways to measure distance between groups." },
        { line: "labels = fcluster(Z, t=3, criterion=\"maxclust\")", say: "Cut each tree into 3 clusters." },
        { line: "print(f\"{method:8s} sizes {np.bincount(labels)[1:]}  silhouette {silhouette_score(Xs, labels):.3f}  ARI {adjusted_rand_score(y, labels):.3f}\")", say: "Average and single linkage put almost everything in one cluster (sizes 3, 174, 1); Ward gives balanced, meaningful groups." },
        { line: "print(\"last 4 merge heights:\", Z[-4:, 2].round(1))", say: "The jump from 12.6 to 27.7 says three clusters is a natural cut." },
      ],
    },
    checks: [
      { if: "Default choice", do: "Ward linkage with Euclidean distance on scaled data." },
      { if: "Non-Euclidean distances (cosine, custom)", do: "Average or complete linkage; Ward needs Euclidean." },
    ],
    optimise: [
      { what: "Linkage", when: "Always compare Ward with one alternative", not: "" },
      { what: "Where to cut", when: "Use merge-height jumps and silhouette", not: "" },
    ],
  },
  dbscan: {
    use: ["Clusters of any shape, plus automatic detection of noise points.", "You do not know the number of clusters."],
    avoid: ["Clusters with very different densities (try HDBSCAN).", "Many features."],
    prep: ["Scale features. Choose eps from a k-distance plot."],
    recipe: {
      goal: "Read eps from the k-distance values, then see what each eps does",
      code: r`import numpy as np
from sklearn.cluster import DBSCAN
from sklearn.datasets import make_moons
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

X, _ = make_moons(n_samples=500, noise=0.07, random_state=0)
X = np.vstack([X, np.random.default_rng(0).uniform(-1.5, 2.5, size=(15, 2))])
Xs = StandardScaler().fit_transform(X)

min_samples = 5
dist, _ = NearestNeighbors(n_neighbors=min_samples).fit(Xs).kneighbors(Xs)
kdist = np.sort(dist[:, -1])
print("k-distance at 50% / 90% / 98% of points:", np.percentile(kdist, [50, 90, 98]).round(3))

for eps in [0.1, 0.2, 0.3, 0.6]:
    labels = DBSCAN(eps=eps, min_samples=min_samples).fit_predict(Xs)
    n_clusters = len(set(labels)) - (-1 in labels)
    print(f"eps {eps}: {n_clusters} clusters, {np.sum(labels == -1)} noise points")

# Output:
# k-distance at 50% / 90% / 98% of points: [0.092 0.157 0.459]
# eps 0.1: 23 clusters, 117 noise points
# eps 0.2: 2 clusters, 16 noise points
# eps 0.3: 2 clusters, 11 noise points
# eps 0.6: 1 clusters, 10 noise points`,
      walk: [
        { line: "X = np.vstack([X, np.random.default_rng(0).uniform(-1.5, 2.5, size=(15, 2))])", say: "Two moons plus 15 random noise points." },
        { line: "dist, _ = NearestNeighbors(n_neighbors=min_samples).fit(Xs).kneighbors(Xs)", say: "Each point's distance to its 5th nearest neighbour (counting itself)." },
        { line: "print(\"k-distance at 50% / 90% / 98% of points:\", np.percentile(kdist, [50, 90, 98]).round(3))", say: "Most points are within 0.16; the steep rise after that marks the noise. A good eps is around there." },
        { line: "print(f\"eps {eps}: {n_clusters} clusters, {np.sum(labels == -1)} noise points\")", say: "eps 0.1 shatters the data into 23 pieces; 0.2–0.3 finds the 2 moons; 0.6 merges everything." },
      ],
    },
    checks: [
      { if: "Densities differ a lot", do: "`HDBSCAN` (in scikit-learn 1.3+)." },
      { if: "Many features", do: "Reduce with PCA first." },
    ],
    optimise: [
      { what: "`eps`", when: "Always, from the k-distance curve", not: "By guessing" },
      { what: "`min_samples`", when: "Raise for noisier data; a common start is 2 × number of features", not: "" },
    ],
  },
  pca: {
    use: ["Compressing many correlated features.", "Visualising data in 2-D.", "Speeding up or stabilising distance-based models."],
    avoid: ["When you need to explain predictions in terms of original features.", "Tree models, which rarely benefit."],
    prep: ["Scale features first (otherwise large-unit columns dominate the components). Impute missing values."],
    recipe: {
      goal: "How many components? Check variance kept and downstream accuracy",
      code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.decomposition import PCA
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import GridSearchCV
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
pca = PCA().fit(StandardScaler().fit_transform(X))
cum = np.cumsum(pca.explained_variance_ratio_)
print("components for 80% / 95% / 99% variance:", [int(np.searchsorted(cum, v) + 1) for v in (0.8, 0.95, 0.99)])

pipe = make_pipeline(StandardScaler(), PCA(), LogisticRegression(max_iter=5000))
search = GridSearchCV(pipe, {"pca__n_components": [2, 5, 10, 20, 30]}, cv=5).fit(X, y)
for k, s in zip([2, 5, 10, 20, 30], search.cv_results_["mean_test_score"]):
    print(f"{k:2d} components: CV accuracy {s:.3f}")

# Output:
# components for 80% / 95% / 99% variance: [5, 10, 17]
#  2 components: CV accuracy 0.951
#  5 components: CV accuracy 0.970
# 10 components: CV accuracy 0.981
# 20 components: CV accuracy 0.977
# 30 components: CV accuracy 0.981`,
      walk: [
        { line: "pca = PCA().fit(StandardScaler().fit_transform(X))", say: "Fit PCA with all components on scaled data to see how variance is spread." },
        { line: "print(\"components for 80% / 95% / 99% variance:\", [int(np.searchsorted(cum, v) + 1) for v in (0.8, 0.95, 0.99)])", say: "10 of 30 components keep 95% of the variance." },
        { line: "pipe = make_pipeline(StandardScaler(), PCA(), LogisticRegression(max_iter=5000))", say: "PCA inside the pipeline, so it is fitted on training folds only." },
        { line: "search = GridSearchCV(pipe, {\"pca__n_components\": [2, 5, 10, 20, 30]}, cv=5).fit(X, y)", say: "Choose the number of components by the final model's score." },
      ],
    },
    checks: [
      { if: "Features have different units", do: "Always scale before PCA." },
      { if: "You only want a 2-D picture", do: "PCA first; t-SNE or UMAP for a picture of local groups (not for modelling)." },
    ],
    optimise: [
      { what: "`n_components`", when: "Always: by downstream score, or a variance share such as 0.95", not: "" },
      { what: "`whiten`", when: "Models that assume equal-variance inputs", not: "Usually unnecessary" },
    ],
  },
  "neural-networks": {
    use: ["Images, audio, text and other unstructured data.", "Very large tabular datasets where boosting has plateaued."],
    avoid: ["Small tabular data: gradient boosting is usually better and easier."],
    prep: ["Scale inputs. Encode categories (one-hot or embeddings). Hold out validation data for early stopping."],
    recipe: {
      goal: "A scikit-learn neural network tuned for size and weight penalty",
      code: r`from sklearn.datasets import load_digits
from sklearn.model_selection import GridSearchCV, train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_digits(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

pipe = make_pipeline(StandardScaler(), MLPClassifier(max_iter=500, early_stopping=True, random_state=0))
grid = {"mlpclassifier__hidden_layer_sizes": [(32,), (128,), (128, 64)],
        "mlpclassifier__alpha": [1e-4, 1e-2, 1.0]}
search = GridSearchCV(pipe, grid, cv=3, n_jobs=-1).fit(X_train, y_train)
print("best:", search.best_params_, "CV accuracy:", round(search.best_score_, 3))
print("test accuracy:", round(search.score(X_test, y_test), 3))
print("epochs until early stopping:", search.best_estimator_[-1].n_iter_)

# Output:
# best: {'mlpclassifier__alpha': 0.0001, 'mlpclassifier__hidden_layer_sizes': (128, 64)} CV accuracy: 0.949
# test accuracy: 0.969
# epochs until early stopping: 35`,
      walk: [
        { line: "pipe = make_pipeline(StandardScaler(), MLPClassifier(max_iter=500, early_stopping=True, random_state=0))", say: "Scale, then a multi-layer network that stops when its internal validation score stops improving." },
        { line: "grid = {\"mlpclassifier__hidden_layer_sizes\": [(32,), (128,), (128, 64)],", say: "Network size: one small layer, one big layer, two layers." },
        { line: "\"mlpclassifier__alpha\": [1e-4, 1e-2, 1.0]}", say: "`alpha` is an L2 penalty on the weights." },
        { line: "print(\"epochs until early stopping:\", search.best_estimator_[-1].n_iter_)", say: "Early stopping decided how long to train." },
      ],
    },
    checks: [
      { if: "Tabular data", do: "Compare with HistGradientBoosting before investing in a network." },
      { if: "Images, text, audio", do: "Use PyTorch and a pretrained model (see Training neural networks)." },
      { if: "Training accuracy ≫ validation accuracy", do: "More `alpha`, dropout, early stopping, or more data." },
    ],
    optimise: [
      { what: "Learning rate", when: "First, always", not: "" },
      { what: "Size (`hidden_layer_sizes`)", when: "Underfitting: grow it; overfitting: shrink or regularise", not: "Bigger by default" },
      { what: "`alpha`, early stopping", when: "Overfitting", not: "" },
    ],
  },
  "training-neural-networks": {
    use: ["Custom networks in PyTorch: when you need control over architecture, loss and training loop."],
    avoid: ["Writing a custom loop when an `MLPClassifier` or a pretrained model already does the job."],
    prep: ["Scale inputs with statistics from training data; convert to tensors; build batches; keep a validation set."],
    recipe: {
      goal: "A compact PyTorch training function, run with four settings",
      code: r`import torch, torch.nn as nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

torch.manual_seed(0)
X, y = load_digits(return_X_y=True)
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
sc = StandardScaler().fit(X_tr)
X_tr, X_val = (torch.tensor(sc.transform(a), dtype=torch.float32) for a in (X_tr, X_val))
y_tr, y_val = torch.tensor(y_tr), torch.tensor(y_val)

def train(lr, dropout, weight_decay, epochs=60, batch=64):
    model = nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Dropout(dropout), nn.Linear(128, 10))
    opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    loss_fn = nn.CrossEntropyLoss()
    best = 0.0
    for epoch in range(epochs):
        model.train()
        perm = torch.randperm(len(X_tr))
        for i in range(0, len(X_tr), batch):
            idx = perm[i:i + batch]
            opt.zero_grad()
            loss_fn(model(X_tr[idx]), y_tr[idx]).backward()
            opt.step()
        model.eval()
        with torch.no_grad():
            best = max(best, (model(X_val).argmax(1) == y_val).float().mean().item())
    return best

for lr, dropout, wd in [(1e-1, 0.0, 0.0), (1e-3, 0.0, 0.0), (1e-3, 0.3, 1e-2), (1e-5, 0.3, 1e-2)]:
    print(f"lr {lr:g}, dropout {dropout}, weight decay {wd:g}: best validation accuracy {train(lr, dropout, wd):.3f}")

# Output:
# lr 0.1, dropout 0.0, weight decay 0: best validation accuracy 0.967
# lr 0.001, dropout 0.0, weight decay 0: best validation accuracy 0.980
# lr 0.001, dropout 0.3, weight decay 0.01: best validation accuracy 0.984
# lr 1e-05, dropout 0.3, weight decay 0.01: best validation accuracy 0.573`,
      walk: [
        { line: "sc = StandardScaler().fit(X_tr)", say: "Fit scaling on training data only." },
        { line: "def train(lr, dropout, weight_decay, epochs=60, batch=64):", say: "Wrap training in a function so you can compare settings fairly." },
        { line: "model = nn.Sequential(nn.Linear(64, 128), nn.ReLU(), nn.Dropout(dropout), nn.Linear(128, 10))", say: "64 pixel inputs → 128 hidden units → 10 class scores." },
        { line: "opt = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)", say: "AdamW: Adam with weight decay applied correctly." },
        { line: "loss_fn(model(X_tr[idx]), y_tr[idx]).backward()", say: "Forward pass, loss, backpropagation for one mini-batch." },
        { line: "model.eval()", say: "Evaluation mode: dropout off." },
        { line: "print(f\"lr {lr:g}, dropout {dropout}, weight decay {wd:g}: best validation accuracy {train(lr, dropout, wd):.3f}\")", say: "lr 0.1 is too high, 1e-5 far too low; 1e-3 with a little dropout and weight decay is best." },
      ],
    },
    checks: [
      { if: "Loss is NaN", do: "Lower the learning rate; check inputs for NaN; clip gradients." },
      { if: "Validation loss rises while training loss falls", do: "Early stopping, dropout, weight decay, augmentation." },
      { if: "Few labelled examples", do: "Start from a pretrained model and fine-tune." },
    ],
    optimise: [
      { what: "Learning rate (+ schedule)", when: "First and most important", not: "" },
      { what: "Dropout, weight decay", when: "Overfitting", not: "Underfitting: they make it worse" },
      { what: "Batch size", when: "Memory limits or unstable training", not: "Before the learning rate" },
      { what: "Architecture", when: "After the training setup is solid", not: "First" },
    ],
  },
};
