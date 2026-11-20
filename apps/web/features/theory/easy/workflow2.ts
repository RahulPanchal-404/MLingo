import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Cross-Validation and Hyperparameter Tuning. */
export const CVTUNE: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Cross-validation scores a recipe (preprocessing + model + settings) by training it several times on different parts of the data. Tuning tries many settings and keeps the one with the best CV score.",
      examples: [
        {
          at: 2,
          title: "Why random search covers more",
          blocks: [
            { p: "Budget: 16 fits. Suppose only the learning rate matters and the other setting does nothing. A 4 × 4 grid tries just 4 different learning rates (each 4 times). Random search tries 16 different learning rates. Same cost, four times the coverage of what matters." },
          ],
        },
      ],
    },
    "Cross-validation schemes": {
      plain: "Report the mean and spread of the fold scores. Choose the scheme that matches the data: stratified for classes, group for repeated people, time split for ordered data.",
    },
    "Worked example": {
      plain: "Average the fold scores, look at their spread, and treat differences smaller than the spread as a tie.",
      code: [
        {
          goal: "5-fold cross-validation written out by hand",
          code: r`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import KFold
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)
folds = KFold(n_splits=5, shuffle=True, random_state=0)

scores = []
for k, (train_idx, val_idx) in enumerate(folds.split(X), start=1):
    model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
    model.fit(X[train_idx], y[train_idx])            # a fresh model for every fold
    acc = model.score(X[val_idx], y[val_idx])        # scored on rows it never saw
    scores.append(acc)
    print(f"fold {k}: train on {len(train_idx)} rows, validate on {len(val_idx)} -> accuracy {acc:.3f}")

print(f"CV accuracy = {np.mean(scores):.3f} ± {np.std(scores):.3f}")

# Output:
# fold 1: train on 455 rows, validate on 114 -> accuracy 0.965
# fold 2: train on 455 rows, validate on 114 -> accuracy 0.982
# fold 3: train on 455 rows, validate on 114 -> accuracy 0.956
# fold 4: train on 455 rows, validate on 114 -> accuracy 0.956
# fold 5: train on 456 rows, validate on 113 -> accuracy 1.000
# CV accuracy = 0.972 ± 0.017`,
          walk: [
            { line: "for k, (train_idx, val_idx) in enumerate(folds.split(X), start=1):", say: "`KFold` hands out the row numbers for each round." },
            { line: "model.fit(X[train_idx], y[train_idx])            # a fresh model for every fold", say: "A brand-new pipeline each round, so the scaler never sees validation rows." },
            { line: "print(f\"CV accuracy = {np.mean(scores):.3f} ± {np.std(scores):.3f}\")", say: "0.972 ± 0.017. Another model scoring 0.975 would be a tie." },
          ],
        },
      ],
    },
    "Search strategies": {
      plain: "Grid for 1–3 settings, random search for more, Bayesian search when fits are expensive. Search strengths like C or λ on a log scale.",
      code: [
        {
          goal: "See how picking the best of many settings flatters the score",
          code: r`import numpy as np
from sklearn.model_selection import GridSearchCV, KFold, cross_val_score
from sklearn.svm import SVC

grid = {"C": [0.01, 0.1, 1, 10, 100, 1000], "gamma": [0.0001, 0.001, 0.01, 0.1, 1, 10]}
inner = KFold(5, shuffle=True, random_state=0)
outer = KFold(5, shuffle=True, random_state=1)

optimistic, honest = [], []
for seed in range(10):                        # 10 different noise datasets
    rng = np.random.default_rng(seed)
    X = rng.normal(size=(60, 20))             # pure noise
    y = rng.integers(0, 2, size=60)           # random labels: true accuracy is 50%
    search = GridSearchCV(SVC(), grid, cv=inner).fit(X, y)
    optimistic.append(search.best_score_)     # best of 36 settings on the same folds
    nested = cross_val_score(GridSearchCV(SVC(), grid, cv=inner), X, y, cv=outer)
    honest.append(nested.mean())              # search redone inside each outer fold

print(f"best score inside the search (optimistic): {np.mean(optimistic):.2f}")
print(f"nested CV estimate (honest):               {np.mean(honest):.2f}   (truth: 0.50)")

# Output:
# best score inside the search (optimistic): 0.58
# nested CV estimate (honest):               0.53   (truth: 0.50)`,
          walk: [
            { line: "y = rng.integers(0, 2, size=60)           # random labels: true accuracy is 50%", say: "Random labels: no setting can truly beat 50%." },
            { line: "optimistic.append(search.best_score_)     # best of 36 settings on the same folds", say: "The winner's own CV score benefits from lucky folds." },
            { line: "nested = cross_val_score(GridSearchCV(SVC(), grid, cv=inner), X, y, cv=outer)", say: "Nested CV: the whole search runs inside each outer training split." },
            { line: "print(f\"nested CV estimate (honest):               {np.mean(honest):.2f}   (truth: 0.50)\")", say: "The search reports 0.58; nested CV gives 0.53, close to the truth." },
          ],
        },
      ],
    },
    "Textbook case: Model Search Without Reusing the Test Set": {
      plain: "Predicting when a library branch needs an extra evening desk, used to separate tuning evidence from the final test.",
    },
    "1.19.1 Distinguish parameters, hyperparameters, and selection evidence": {
      plain: "Parameters are learned from data (weights); hyperparameters are set before training (λ, depth). A validation score picks hyperparameters; it is not the final estimate.",
    },
    "1.19.2 Grid, random, and adaptive search": {
      plain: "A grid of 3 settings with 5 values each is already 125 combinations. Random search samples instead; sample positive strengths on a log scale.",
      examples: [
        {
          at: 2,
          title: "Counting the cost",
          blocks: [
            { math: r`\underbrace{5 \times 5 \times 5}_{\text{grid}} \times \underbrace{5}_{\text{folds}} = 625 \text{ fits}, \qquad \underbrace{30}_{\text{random trials}} \times 5 = 150 \text{ fits}` },
          ],
        },
      ],
    },
    "1.19.3 Put the entire fitted pipeline inside cross-validation": {
      plain: "Put filling, scaling and the model in one pipeline and tune the pipeline, so every fold refits every step.",
    },
    "1.19.4 Nested evaluation and the selection gap": {
      plain: "The best score from a search is optimistic. Nested CV wraps the search in an outer loop to estimate how the whole procedure performs.",
    },
    "1.19.5 Search results need operating and resource checks": {
      plain: "The best CV score is not enough: check speed, memory, calibration, and whether it works within real limits like staff capacity.",
    },
    "2.5.3 Hyperparameter search and nested evaluation": {
      plain: "Count fits, not just trials; give each fold enough rare positives; keep every learned step inside the folds.",
    },
    "Textbook case: Fitted Pipelines and Honest Validation": {
      plain: "Hospital spare-parts demand used to show the information boundary, fold-only preprocessing, grouped validation and serving.",
    },
    "3.9.1 Establish the information boundary": {
      plain: "A feature is usable only if it has arrived by the time the prediction runs, not just if it exists in the export.",
    },
    "3.9.2 Fit preprocessing only on training rows": {
      plain: "Medians, means, categories and encodings are learned. Learn them on the training fold and reuse them unchanged.",
    },
    "3.9.3 Run a grouped mixed-type pipeline": {
      plain: "Numbers get filled and scaled, categories get one-hot encoded, hospitals stay on one side of each fold, and a mean baseline sets the bar.",
    },
    "3.9.4 Search and evaluate at different levels": {
      plain: "Inner folds choose settings; outer folds or a final test measure the result. Never let the same data do both.",
    },
    "3.9.5 Serve and monitor the same model": {
      plain: "Save the whole fitted pipeline and test it on awkward inputs (unseen category, missing value) before deployment.",
    },
    "3.4.3 Automated model search has a selection cost": {
      plain: "Try 100 equally good models and the luckiest one will look better than it is. Compare against a baseline and check practical costs.",
    },
  },
  code: {
    "1.19.3 Put the entire fitted pipeline inside cross-validation#0": {
      goal: "Randomised search over a whole pipeline with grouped folds",
      code: r`import numpy as np
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.model_selection import GroupKFold, RandomizedSearchCV

rows=[]; targets=[]; groups=[]
for branch in range(8):
    for hour in range(6):
        occupancy=5+hour+branch%3
        rows.append([float(occupancy) if hour!=2 else np.nan])
        targets.append(2*occupancy + branch%3)
        groups.append(branch)
X=np.asarray(rows); y=np.asarray(targets); groups=np.asarray(groups)
dev=groups!=7
model=Pipeline([('fill',SimpleImputer(strategy='median')),
                ('scale',StandardScaler()),('ridge',Ridge())])
search=RandomizedSearchCV(model,{'ridge__alpha':[0.01,0.1,1,10]},
                          n_iter=4,scoring='neg_mean_absolute_error',
                          cv=GroupKFold(n_splits=4),random_state=3,refit=True)
search.fit(X[dev],y[dev],groups=groups[dev])
assert set(search.best_params_)=={'ridge__alpha'}
assert search.best_estimator_.predict(X[~dev]).shape==(6,)
assert np.isfinite(search.best_score_)
print("best alpha:", search.best_params_["ridge__alpha"], "| best CV MAE:", round(-search.best_score_, 3))
print("predictions for the held-out branch:", search.best_estimator_.predict(X[~dev]).round(2))

# Output:
# best alpha: 0.01 | best CV MAE: 1.116
# predictions for the held-out branch: [12.18 14.3  18.53 18.53 20.64 22.76]`,
      walk: [
        { line: "model=Pipeline([('fill',SimpleImputer(strategy='median')),", say: "Fill, scale and ridge as one estimator." },
        { line: "search=RandomizedSearchCV(model,{'ridge__alpha':[0.01,0.1,1,10]},", say: "`ridge__alpha` means \"the alpha of the step called ridge\"." },
        { line: "cv=GroupKFold(n_splits=4),random_state=3,refit=True)", say: "Branches never split across folds; the winner is refitted on all development rows." },
        { line: "search.fit(X[dev],y[dev],groups=groups[dev])", say: "Branch 7 stays out of the search entirely." },
      ],
    },
    "3.9.3 Run a grouped mixed-type pipeline#0": {
      goal: "Mixed numeric and categorical pipeline with grouped folds and a baseline",
      code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import Ridge
from sklearn.dummy import DummyRegressor
from sklearn.model_selection import GroupKFold
from sklearn.metrics import mean_absolute_error

rng=np.random.default_rng(31)
records=[]
for hospital in range(12):
    kind='regional' if hospital%3 else 'district'
    for week in range(6):
        prior=3+hospital%4+week%3
        age=2+hospital%5
        records.append((hospital,week,prior,
                        np.nan if week==2 else float(age),kind,
                        2*prior+.5*age+(kind=='regional')+rng.normal(0,.7)))
frame=pd.DataFrame(records,columns=['hospital','week','prior','age','kind','demand'])
X=frame[['prior','age','kind']]
y=frame['demand'].to_numpy()
groups=frame['hospital'].to_numpy()
prep=ColumnTransformer([
    ('num',Pipeline([('fill',SimpleImputer(strategy='median',
                                            add_indicator=True)),
                     ('scale',StandardScaler())]),['prior','age']),
    ('cat',OneHotEncoder(handle_unknown='ignore'),['kind'])
])
model=Pipeline([('prepare',prep),('ridge',Ridge(alpha=2.))])
folds=GroupKFold(n_splits=4)
model_mae=[];base_mae=[]
for train,val in folds.split(X,y,groups):
    assert set(groups[train]).isdisjoint(set(groups[val]))
    model.fit(X.iloc[train],y[train])
    baseline=DummyRegressor(strategy='mean').fit(X.iloc[train],y[train])
    model_mae.append(mean_absolute_error(y[val],model.predict(X.iloc[val])))
    base_mae.append(mean_absolute_error(y[val],baseline.predict(X.iloc[val])))
assert len(model_mae)==4
assert np.all(np.isfinite(model_mae))
assert np.mean(model_mae)<np.mean(base_mae)
print("model MAE per fold:   ", np.round(model_mae, 2))
print("baseline MAE per fold:", np.round(base_mae, 2))

# Output:
# model MAE per fold:    [0.6  0.62 0.51 0.42]
# baseline MAE per fold: [4.26 1.92 1.83 3.61]`,
      walk: [
        { line: "('num',Pipeline([('fill',SimpleImputer(strategy='median',", say: "Numbers: fill with the training median." },
        { line: "add_indicator=True)),", say: "…and add a \"was missing\" column so the model can use missingness." },
        { line: "('cat',OneHotEncoder(handle_unknown='ignore'),['kind'])", say: "Categories: one-hot, ignoring categories unseen in training." },
        { line: "baseline=DummyRegressor(strategy='mean').fit(X.iloc[train],y[train])", say: "The model's fold MAE (about 0.5) is far below the mean baseline (about 2–4)." },
      ],
    },
    "In Python#0": {
      goal: "Randomised search for a random forest, then one test score",
      code: r`from scipy.stats import loguniform, randint
from sklearn.datasets import load_breast_cancer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import RandomizedSearchCV, StratifiedKFold, train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
search = RandomizedSearchCV(
    RandomForestClassifier(random_state=0),
    {"n_estimators": randint(100, 400), "max_depth": randint(3, 20),
     "min_samples_leaf": randint(1, 10), "max_features": loguniform(0.1, 1.0)},
    n_iter=15, cv=cv, scoring="f1", n_jobs=-1, random_state=0)
search.fit(X_train, y_train)                      # 15 settings x 5 folds = 75 fits, then one refit
print("best settings:", {k: round(float(v), 3) if k == "max_features" else int(v) for k, v in search.best_params_.items()})
print("best CV F1:", round(search.best_score_, 3))
print("test F1:", round(search.score(X_test, y_test), 3))      # once, at the very end

# Output:
# best settings: {'max_depth': 17, 'max_features': 0.526, 'min_samples_leaf': 2, 'n_estimators': 365}
# best CV F1: 0.974
# test F1: 0.961`,
      walk: [
        { line: "{\"n_estimators\": randint(100, 400), \"max_depth\": randint(3, 20),", say: "Distributions to sample from, not fixed lists." },
        { line: "\"min_samples_leaf\": randint(1, 10), \"max_features\": loguniform(0.1, 1.0)},", say: "`loguniform` spreads samples evenly across orders of magnitude." },
        { line: "n_iter=15, cv=cv, scoring=\"f1\", n_jobs=-1, random_state=0)", say: "15 settings × 5 folds; score by F1 because that is what we care about." },
        { line: "print(\"test F1:\", round(search.score(X_test, y_test), 3))      # once, at the very end", say: "Test F1 0.961 is a bit below the best CV F1 0.974, as expected after selection." },
      ],
    },
  },
};

/** Easy layer: Imbalanced Data. */
export const IMBALANCED: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "With a rare class, a model can score high accuracy by ignoring it. Measure the rare class directly, and often just lowering the threshold fixes it.",
      examples: [
        {
          at: 1,
          title: "A good ranking with a bad threshold",
          blocks: [
            { p: "Five frauds score 0.21, 0.28, 0.33, 0.35 and 0.40; every normal transaction scores below 0.2. The ranking is perfect, but a 0.5 threshold catches none of them. A threshold of 0.2 catches all five without a single false alarm, and no retraining is needed." },
          ],
        },
      ],
    },
    Toolbox: {
      plain: "Fix the metric first (recall, precision, PR-AUC), then the threshold, then try class weights, and resample only inside training data.",
      code: [
        {
          goal: "SMOTE from scratch",
          code: r`import numpy as np
from sklearn.neighbors import NearestNeighbors

def smote(X_min, n_new, k=5, seed=0):
    """Make n_new synthetic minority rows by interpolating towards minority neighbours."""
    rng = np.random.default_rng(seed)
    nn = NearestNeighbors(n_neighbors=k + 1).fit(X_min)
    _, idx = nn.kneighbors(X_min)             # idx[:, 0] is the point itself
    new = []
    for _ in range(n_new):
        i = rng.integers(len(X_min))          # pick a minority point
        j = idx[i, rng.integers(1, k + 1)]    # and one of its k minority neighbours
        lam = rng.uniform()                   # how far along the line to go
        new.append(X_min[i] + lam * (X_min[j] - X_min[i]))
    return np.array(new)

X_min = np.array([[2, 10], [4, 14], [3, 11], [5, 13]], dtype=float)
synthetic = smote(X_min, n_new=3, k=2)
print("synthetic minority rows:\n", synthetic.round(2))

# Output:
# synthetic minority rows:
#  [[ 4.46 12.46]
#  [ 4.02 13.98]
#  [ 4.74 12.74]]`,
          walk: [
            { line: "_, idx = nn.kneighbors(X_min)             # idx[:, 0] is the point itself", say: "Find each minority point's nearest minority neighbours." },
            { line: "lam = rng.uniform()                   # how far along the line to go", say: "A random fraction $\\lambda$ between 0 and 1." },
            { line: "new.append(X_min[i] + lam * (X_min[j] - X_min[i]))", say: "The new point lies on the line between a point and its neighbour." },
          ],
        },
      ],
    },
    "Worked example": {
      plain: "At 1% fraud, \"never fraud\" scores 99% accuracy and catches nothing. Balanced weights make each fraud count about 100 times as much.",
    },
    "Textbook case: Rare Outcomes, Resampling, and Decision Thresholds": {
      plain: "Cargo-bike failures used to show why rare labels change metrics, what resampling really does, and how to adjust probabilities.",
    },
    "2.4.1 A rare label changes the meaning of a good-looking score": {
      plain: "Always show the four confusion counts. The same model has very different precision when the event is rarer or more common.",
    },
    "2.4.2 Resampling changes the training distribution": {
      plain: "Undersampling drops normal rows, oversampling repeats rare ones, SMOTE invents new ones in between, and class weights change the loss instead. Do any of these on training folds only.",
    },
    "2.4.3 Prior shift and probability adjustment": {
      plain: "A model trained on balanced data overstates probabilities. Multiply its odds by the ratio of real to training prior odds to correct them.",
    },
    "2.4.4 A resampling pipeline needs an untouched evaluation population": {
      plain: "Resample training data if you like, but measure on data with the real class balance.",
    },
    "2.4.5 Evaluate fairness of attention, uncertainty, and cost": {
      plain: "Equal precision across groups can hide very unequal recall. Check both for each group.",
    },
    "2.5.1 Imbalanced outcomes and the geometry of evaluation": {
      plain: "All the rare-event metrics come from the four counts TP, FP, FN, TN. Open the derivation for each formula.",
    },
    "2.5.2 Resampling, class weighting, synthetic data, and prior shift": {
      plain: "Each technique changes the training data or the loss, never how many real failures will happen. Correct probabilities back to the real rate before using them.",
      replace: {
        1: { p: "Random undersampling discards many nonfailure training rows, reducing fit cost but potentially removing important normal conditions. Random oversampling repeats failure rows, increasing their effective weight without adding new independent evidence. A cost-sensitive loss can assign larger weight to failure examples without duplicating data. Synthetic interpolation such as a SMOTE-style step constructs $x_{new} = x + u(z - x)$ from a failure row $x$, a suitable failure neighbor $z$, and $u \\in [0, 1]$. These methods target the training distribution or training objective; they cannot alter how many actual future failures occur in deployment." },
        2: { p: "With $x = (10, 2)$, $z = (14, 6)$ and $u = 0.25$, the constructed vector is $(11, 3)$. That arithmetic does not certify physical plausibility. Battery model IDs cannot be averaged as integers. A synthetic charge-rate and age pair may be impossible for the device type. Neighbor search must use features scaled from the training fold and should respect subgroups if interpolation across battery types is invalid. Generate synthetic rows only from a fold's **training** portion; adding generated siblings to validation would leak training construction into evaluation. For repeated packs, split packs before sampling." },
        5: { math: r`\text{odds}_{\text{deploy}}(y = 1 \mid x) = \text{odds}_{\text{train}}(y = 1 \mid x)\cdot\frac{\pi_{\text{deploy}}/(1 - \pi_{\text{deploy}})}{\pi_{\text{train}}/(1 - \pi_{\text{train}})}` },
        6: { p: "Here $\\pi$ is the share of positives (the prior) in training and in deployment." },
        7: { p: "Derive this from Bayes' rule: posterior odds equal the likelihood ratio $P(x \\mid y = 1)/P(x \\mid y = 0)$ times prior odds, and the likelihood ratio cancels when dividing deployment by training posterior odds. This is conditional on genuine prior shift and a calibrated original model; it is not a universal cure for duplicated cases, selection bias, or changing hardware. For example, if training is balanced ($\\pi_{\\text{train}} = 0.5$) and deployment prevalence is 0.01, a training posterior of 0.5 gives training odds one, deployment odds $1/99$ and corrected probability 0.01. It would be wrong to display 50% for that uninformative example. Verify calibration on untouched data with natural prevalence." },
      },
    },
    "2.5.5 Time, battery grouping, calibration, and delayed labels": {
      plain: "A \"no failure yet\" row is not a negative until its outcome window has fully passed. Split by battery and by time.",
    },
  },
  code: {
    "2.4.3 Prior shift and probability adjustment#0": {
      goal: "Correct a probability for a new class balance",
      code: r`from math import isclose
def adjust_prior(p, train_prior, deploy_prior):
    if not all(0 < v < 1 for v in [p,train_prior,deploy_prior]):
        raise ValueError('strict probabilities required')
    odds = p/(1-p)
    correction = (deploy_prior/(1-deploy_prior))/(train_prior/(1-train_prior))
    new_odds=odds*correction
    return new_odds/(1+new_odds)
assert isclose(adjust_prior(0.8,0.5,0.02),4/53)
print("0.8 on balanced training data becomes", round(adjust_prior(0.8, 0.5, 0.02), 4), "at 2% prevalence")
print("0.5 becomes", round(adjust_prior(0.5, 0.5, 0.01), 4), "at 1% prevalence")

# Output:
# 0.8 on balanced training data becomes 0.0755 at 2% prevalence
# 0.5 becomes 0.01 at 1% prevalence`,
      walk: [
        { line: "odds = p/(1-p)", say: "Turn the probability into odds: $0.8 \\to 4$." },
        { line: "correction = (deploy_prior/(1-deploy_prior))/(train_prior/(1-train_prior))", say: "Real prior odds ÷ training prior odds: $(0.02/0.98)/1$." },
        { line: "return new_odds/(1+new_odds)", say: "Back to a probability: 0.8 becomes about 0.075." },
      ],
    },
    "2.5.2 Resampling, class weighting, synthetic data, and prior shift#0": {
      goal: "The SMOTE interpolation step",
      code: r`def interpolate_numeric_pair(first, second, fraction):
    if len(first) != len(second) or not 0 <= fraction <= 1:
        raise ValueError("Need aligned numeric vectors and fraction in [0, 1]")
    return tuple(a+fraction*(b-a) for a, b in zip(first, second))


assert interpolate_numeric_pair((10, 2), (14, 6), 0.25) == (11.0, 3.0)
print("synthetic point a quarter of the way from (10, 2) to (14, 6):", interpolate_numeric_pair((10, 2), (14, 6), 0.25))

# Output:
# synthetic point a quarter of the way from (10, 2) to (14, 6): (11.0, 3.0)`,
      walk: [
        { line: "return tuple(a+fraction*(b-a) for a, b in zip(first, second))", say: "Move a quarter of the way from one minority point to another." },
      ],
    },
    "In Python#0": {
      goal: "Class weights, SMOTE and threshold moving compared",
      code: r`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, precision_recall_curve, recall_score
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors

def smote(X_min, n_new, k=5, seed=0):
    """Make n_new synthetic minority rows by interpolating towards minority neighbours."""
    rng = np.random.default_rng(seed)
    nn = NearestNeighbors(n_neighbors=k + 1).fit(X_min)
    _, idx = nn.kneighbors(X_min)             # idx[:, 0] is the point itself
    new = []
    for _ in range(n_new):
        i = rng.integers(len(X_min))          # pick a minority point
        j = idx[i, rng.integers(1, k + 1)]    # and one of its k minority neighbours
        lam = rng.uniform()                   # how far along the line to go
        new.append(X_min[i] + lam * (X_min[j] - X_min[i]))
    return np.array(new)

X, y = make_classification(n_samples=5000, n_features=10, n_informative=4, weights=[0.97],
                           n_clusters_per_class=1, class_sep=0.6, random_state=0)
X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.3, stratify=y, random_state=0)
print("fraud share in training data:", round(y_train.mean(), 3))

plain = LogisticRegression(max_iter=1000).fit(X_train, y_train)
weighted = LogisticRegression(class_weight="balanced", max_iter=1000).fit(X_train, y_train)
X_min = X_train[y_train == 1]                    # SMOTE uses training rows only
X_syn = smote(X_min, n_new=len(X_train) - 2 * len(X_min))
X_bal = np.vstack([X_train, X_syn])
y_bal = np.r_[y_train, np.ones(len(X_syn), dtype=int)]
smoted = LogisticRegression(max_iter=1000).fit(X_bal, y_bal)

for name, m in [("plain", plain), ("class weights", weighted), ("SMOTE", smoted)]:
    p = m.predict_proba(X_val)[:, 1]             # validation keeps its natural 3% rate
    print(f"{name:14s} PR-AUC {average_precision_score(y_val, p):.3f}   "
          f"recall at 0.5 {recall_score(y_val, p >= 0.5):.2f}")

p = plain.predict_proba(X_val)[:, 1]
prec, rec, thr = precision_recall_curve(y_val, p)
ok = rec[:-1] >= 0.8                             # thresholds that keep recall >= 0.8
best = thr[ok][np.argmax(prec[:-1][ok])]
print(f"plain model, threshold {best:.3f}: recall {rec[:-1][ok][np.argmax(prec[:-1][ok])]:.2f}, "
      f"precision {prec[:-1][ok].max():.2f}")

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(rec, prec)
ax.axhline(y_val.mean(), ls="--", c="grey", label="random guessing")
ax.set(xlabel="recall", ylabel="precision", title="Precision-recall curve (plain model)")
ax.legend()
fig.tight_layout()
fig.savefig("pr_curve.png")

# Output:
# fraud share in training data: 0.035
# plain          PR-AUC 0.762   recall at 0.5 0.62
# class weights  PR-AUC 0.746   recall at 0.5 0.75
# SMOTE          PR-AUC 0.743   recall at 0.5 0.73
# plain model, threshold 0.033: recall 0.81, precision 0.34`,
      figure: { src: "/theory/figures/code/pr_curve.svg", alt: "Precision–recall curve well above the dashed random-guessing line at about 0.03." },
      walk: [
        { line: "X, y = make_classification(n_samples=5000, n_features=10, n_informative=4, weights=[0.97],", say: "Generated data with about 3% positives." },
        { line: "weighted = LogisticRegression(class_weight=\"balanced\", max_iter=1000).fit(X_train, y_train)", say: "Class weights: rare-class mistakes cost more in the loss." },
        { line: "X_min = X_train[y_train == 1]                    # SMOTE uses training rows only", say: "Synthetic rows come only from training data; validation keeps its natural rate. (The `imbalanced-learn` package offers a ready-made SMOTE.)" },
        { line: "f\"recall at 0.5 {recall_score(y_val, p >= 0.5):.2f}\")", say: "PR-AUC is about the same for all three (≈ 0.75): the ranking barely changes. Weights and SMOTE mainly raise recall at the 0.5 threshold (0.62 → 0.75)." },
        { line: "ok = rec[:-1] >= 0.8                             # thresholds that keep recall >= 0.8", say: "Threshold moving: the plain model at threshold 0.033 reaches recall 0.81 without any retraining." },
      ],
    },
  },
};
