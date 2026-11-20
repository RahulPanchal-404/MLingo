import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Feature Scaling. */
export const SCALING: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Models compare numbers, not units. Scaling puts every feature on a similar range so a column does not dominate just because its numbers are bigger.",
      examples: [
        {
          at: 0,
          title: "Distance ruled by one column",
          blocks: [
            { p: "Two people: (height 1.6 m, income ₹50,000) and (height 1.9 m, income ₹51,000). The distance between them is" },
            { math: r`\sqrt{0.3^2 + 1000^2} \approx 1000` },
            { p: "The 30 cm height difference counts for almost nothing. Standardise both columns first and the height difference matters again." },
          ],
        },
      ],
    },
    "The main scalers": {
      plain: "Standardise (mean 0, spread 1) by default; min-max when you need a fixed 0–1 range; robust scaling when there are outliers.",
      examples: [
        {
          title: "One outlier, three scalers",
          blocks: [
            { p: "Column $(10, 12, 14, 100)$, from the code step below:" },
            { table: { head: ["Scaler", "10", "12", "14", "100"], rows: [["Standard", "−0.63", "−0.58", "−0.52", "1.73"], ["Min–max", "0.00", "0.02", "0.04", "1.00"], ["Robust", "−0.12", "−0.04", "0.04", "3.62"]] } },
            { p: "Min–max squeezes the three normal values into 0–0.04. The robust scaler keeps them spread out and leaves the outlier clearly far away." },
          ],
        },
      ],
    },
    "Worked example": {
      plain: "Learn the mean and spread from training data, then use the same two numbers for every new value.",
      code: [
        {
          goal: "Standardise and min-max scale by hand",
          code: r`import numpy as np

train = np.array([150, 162, 170, 178, 190])   # heights in cm
mu, sigma = train.mean(), train.std()           # learned from TRAIN only
lo, hi = train.min(), train.max()
print(f"mean {mu}, standard deviation {sigma:.2f}")
print("standardised:", ((train - mu) / sigma).round(2))
print("min-max:     ", ((train - lo) / (hi - lo)).round(2))

new = 200                                       # a new person, taller than anyone in training
print(f"new height 200: z = {(new - mu) / sigma:.2f}, min-max = {(new - lo) / (hi - lo):.2f}")

# Output:
# mean 170.0, standard deviation 13.62
# standardised: [-1.47 -0.59  0.    0.59  1.47]
# min-max:      [0.  0.3 0.5 0.7 1. ]
# new height 200: z = 2.20, min-max = 1.25`,
          walk: [
            { line: "mu, sigma = train.mean(), train.std()           # learned from TRAIN only", say: "The two numbers that define the scaler." },
            { line: "print(\"standardised:\", ((train - mu) / sigma).round(2))", say: "Subtract the mean, divide by the spread." },
            { line: "print(f\"new height 200: z = {(new - mu) / sigma:.2f}, min-max = {(new - lo) / (hi - lo):.2f}\")", say: "A new value uses the old numbers. Min–max gives 1.25, outside 0–1, which is fine." },
          ],
        },
      ],
    },
    "Which models need it?": {
      plain: "Anything that uses distances, gradients or weight penalties needs scaling. Trees only ask \"is $x$ above a threshold?\", so they do not.",
    },
    "1.22.2 Numeric scaling, distributions, and outliers": {
      plain: "Scaling changes which features count most in distances and penalties. Fit the scaler inside each training split, and check a big value before calling it an error.",
    },
    "1.23.1 Why and when to transform a numeric distribution": {
      plain: "A log turns \"twice as big\" into \"+ the same amount\". Box-Cox and Yeo-Johnson are families of such transforms; fit their parameter on training data only.",
      examples: [
        {
          at: 4,
          title: "Why the back-transformed prediction is too low",
          blocks: [
            { p: "Log incomes of a group: 10 and 12. Average log = 11, and $e^{11} \\approx 59{,}900$. But the actual incomes are $e^{10} \\approx 22{,}000$ and $e^{12} \\approx 162{,}800$, with mean 92,400. Exponentiating an average of logs gives something like the median, not the mean." },
          ],
        },
      ],
    },
    "1.23.2 Discretization, binarization, and information loss": {
      plain: "Binning turns a number into a category. It can help a linear model bend, but it throws away detail inside each bin and creates jumps at the edges.",
    },
  },
  code: {
    "In Python#0": {
      goal: "Scaling matters for KNN; compare the three scalers",
      code: r`import numpy as np
from sklearn.datasets import load_wine
from sklearn.model_selection import cross_val_score
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import MinMaxScaler, RobustScaler, StandardScaler

X, y = load_wine(return_X_y=True)          # 13 chemical measurements of 178 wines
print("feature ranges: smallest", X.std(axis=0).min().round(2), "| largest", X.std(axis=0).max().round(1))

for name, model in [
    ("KNN, no scaling", KNeighborsClassifier()),
    ("KNN + StandardScaler", make_pipeline(StandardScaler(), KNeighborsClassifier())),
]:
    print(f"{name:22s} CV accuracy {cross_val_score(model, X, y, cv=5).mean():.3f}")

col = np.array([[10.], [12.], [14.], [100.]])   # one column with an outlier
for scaler in (StandardScaler(), MinMaxScaler(), RobustScaler()):
    print(f"{type(scaler).__name__:15s}", scaler.fit_transform(col).ravel().round(2))

# Output:
# feature ranges: smallest 0.12 | largest 314.0
# KNN, no scaling        CV accuracy 0.691
# KNN + StandardScaler   CV accuracy 0.949
# StandardScaler  [-0.63 -0.58 -0.52  1.73]
# MinMaxScaler    [0.   0.02 0.04 1.  ]
# RobustScaler    [-0.12 -0.04  0.04  3.62]`,
      walk: [
        { line: "print(\"feature ranges: smallest\", X.std(axis=0).min().round(2), \"| largest\", X.std(axis=0).max().round(1))", say: "One feature varies by about 0.1, another by about 300." },
        { line: "(\"KNN + StandardScaler\", make_pipeline(StandardScaler(), KNeighborsClassifier())),", say: "In a pipeline the scaler is refitted inside every CV fold, so nothing leaks." },
        { line: "print(f\"{name:22s} CV accuracy {cross_val_score(model, X, y, cv=5).mean():.3f}\")", say: "Accuracy jumps from 0.69 to 0.95 just by scaling." },
        { line: "print(f\"{type(scaler).__name__:15s}\", scaler.fit_transform(col).ravel().round(2))", say: "How each scaler treats a column with one outlier." },
      ],
    },
  },
};

/** Easy layer: Train/Test Split and Leakage. */
export const SPLIT: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "The test set pretends to be the future. Anything that lets test information into training (fitting, choosing features, tuning) makes the score too good to be true.",
      examples: [
        {
          at: 3,
          title: "How precise is a test score?",
          blocks: [
            { p: "Accuracy 0.85 on 100 test rows: $\\text{SE} = \\sqrt{0.85 \\times 0.15/100} \\approx 0.036$, so roughly 0.78–0.92. On 1,000 rows: 0.011, so roughly 0.83–0.87. Two models 0.02 apart on 100 test rows are not clearly different." },
          ],
        },
      ],
    },
    "Three sets": {
      plain: "Train fits the weights, validation (or CV) picks the settings, test gives one final honest score.",
      examples: [
        {
          title: "5-fold CV on 100 rows",
          blocks: [
            { table: { head: ["Round", "Train on rows", "Validate on rows"], rows: [["1", "21–100", "1–20"], ["2", "1–20, 41–100", "21–40"], ["3", "1–40, 61–100", "41–60"], ["4", "1–60, 81–100", "61–80"], ["5", "1–80", "81–100"]] } },
            { p: "Every row is validated exactly once, and every model trains on 80 rows. Average the five scores." },
          ],
        },
      ],
    },
    "Splitting correctly": {
      plain: "Match the split to how the model will be used: keep class shares (stratify), keep people together (group), keep the future in the future (time).",
    },
    "Worked example: spotting leakage": {
      plain: "A score that looks too good usually is. Check each feature's timing, where preprocessing was fitted, and whether the same entity is on both sides.",
      code: [
        {
          goal: "Leakage in action: feature selection before CV on pure noise",
          code: r`import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline

rng = np.random.default_rng(0)
X = rng.normal(size=(100, 5000))     # 5000 columns of pure noise
y = rng.integers(0, 2, size=100)     # random labels: nothing can be predicted

# WRONG: pick the 20 "best" columns using all rows, then cross-validate
X_picked = SelectKBest(f_classif, k=20).fit_transform(X, y)
leaky = cross_val_score(LogisticRegression(), X_picked, y, cv=5).mean()

# RIGHT: selection is part of the pipeline, so it is redone inside each fold
pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())
honest = cross_val_score(pipe, X, y, cv=5).mean()

print(f"leaky CV accuracy:  {leaky:.2f}")
print(f"honest CV accuracy: {honest:.2f}   (random guessing is 0.50)")

# Output:
# leaky CV accuracy:  0.85
# honest CV accuracy: 0.48   (random guessing is 0.50)`,
          walk: [
            { line: "y = rng.integers(0, 2, size=100)     # random labels: nothing can be predicted", say: "Random labels: the honest answer is 50%." },
            { line: "X_picked = SelectKBest(f_classif, k=20).fit_transform(X, y)", say: "Wrong: the 20 columns are chosen by looking at every label, including the ones CV will later test on." },
            { line: "pipe = make_pipeline(SelectKBest(f_classif, k=20), LogisticRegression())", say: "Right: selection inside the pipeline is redone on each training fold." },
            { line: "print(f\"leaky CV accuracy:  {leaky:.2f}\")", say: "The leaky version reports 85% on pure noise; the honest one reports about 50%." },
          ],
        },
      ],
    },
    "Textbook case: Cross-Validation as a Reproducible Experiment": {
      plain: "A pump-fault model used to compare fold designs and keep every fitted step inside its fold.",
    },
    "1.18.1 Four fold designs and their exact questions": {
      plain: "K-fold, leave-one-out, stratified, grouped and time-based splits each answer a different question. Pick the one that matches deployment.",
      replace: {
        0: { p: "In ordinary $K$-fold validation, divide $n$ rows into $K$ disjoint validation folds. For each fold, fit on the other $K - 1$ folds and evaluate on the held-out rows; combine predictions or scores according to a stated procedure. If $K = 5$ and 100 independent rows are split evenly, each fit trains on 80 rows and validates on 20. Repeating five fits gives each row one out-of-fold prediction. These are not predictions from one single model trained on all 100 rows, and their quality can differ from a final model refitted on all development rows." },
        1: { p: "Leave-one-out cross-validation is the $K = n$ special case: $n$ fits, each training on $n - 1$ rows. It uses nearly all data per fit but can be expensive and highly sensitive to anomalous labels. Stratified $K$-fold preserves approximate class proportions in each fold; it can help rare-outcome fold stability, but row-level stratification does not protect repeated pumps or time order. Grouped $K$-fold keeps all rows from one pump, manufacturing lot, or another designated group together. A time-aware split trains before validation and may include a gap so delayed labels and overlapping windows do not cross the boundary. These designs answer different questions." },
      },
    },
    "1.18.2 Fit/transform isolation, out-of-fold predictions, and test hygiene": {
      plain: "Fit every learned step (fill values, scaling, encodings) on the training fold only, then apply it unchanged to the validation fold.",
    },
    "1.18.3 Grouped and rolling splits in executable form": {
      plain: "Group folds keep each pump on one side; time folds always train on earlier times than they validate on.",
    },
    "1.18.4 Aggregate metrics, uncertainty, and deployment decisions": {
      plain: "Averaging fold scores and pooling all predictions can give different numbers. Say which one you report, and give the counts.",
      replace: {
        1: { p: "For a simple example, fold A has 10 eligible packs and 1 fault, while fold B has 100 eligible packs and 10 faults. Suppose the model finds the sole fault in A and 5 of 10 in B. The mean of fold recalls is $(1 + 0.5)/2 = 0.75$; pooled recall is $(1 + 5)/(1 + 10) = 6/11 \\approx 0.545$. Both arithmetic results are correct; they answer different weighting questions. With only one positive in A, its observed 100% recall is not precise. Report counts and meaningful aggregation rather than presenting 0.75 without context." },
      },
    },
    "Textbook case: End-to-End Forecasting of Building Energy Demand": {
      plain: "A synthetic building-energy forecast taken from the prediction contract to a held-out-building test.",
    },
    "3.10.1 State the prediction contract and permissible inputs": {
      plain: "Write down when the forecast is made and which inputs exist at that moment. Hold out whole buildings if the model must work on new buildings.",
    },
    "3.10.2 Generate transparent synthetic records": {
      plain: "Generated data with a known formula let you check that the pipeline recovers what you put in.",
    },
    "3.10.3 Compare against a reproducible baseline": {
      plain: "Always compare with a simple baseline (here, the median). A model is only useful if it beats it.",
    },
    "3.10.4 Fit preprocessing and compare on a held-out building": {
      plain: "Choose the ridge strength with grouped folds on five buildings; test once on the sixth.",
    },
    "3.10.5 Diagnose failures and hand the model over": {
      plain: "Look at errors by building, day and temperature, then hand over the model with its contract and a fallback.",
    },
    "Textbook case: Forecasting and Temporal Validation": {
      plain: "EV-charger demand used to show issue time, seasonal baselines, rolling backtests and forecast intervals.",
    },
    "3.11.1 Forecast issue time and horizon": {
      plain: "Every forecast has a moment it is made and a moment it is for. Inputs must be known at the first moment.",
      examples: [
        {
          at: 3,
          title: "Answer to the exercise",
          blocks: [
            { p: "No: actual Tuesday rainfall is unknown on Monday at 00:00. Yes: a weather forecast published Sunday evening was available. A backtest must use the forecast as it was published then (an archived forecast), not today's records of what actually happened." },
          ],
        },
      ],
    },
    "3.11.2 Seasonal baselines and temporal features": {
      plain: "\"Same as last week\" is a strong, honest baseline for weekly patterns. Beat it before trusting a complex model.",
      replace: {
        0: { p: "A naive forecast can repeat the most recent observed demand: $\\hat y_{t+1} = y_t$. A seasonal naive forecast repeats demand at a matching earlier season: for daily observations with weekly seasonality, $\\hat y_{t+7} = y_t$ under a suitable indexing convention. These baselines should be evaluated before more elaborate models. A model predicting near their accuracy may still have value if it gives useful uncertainty or runs with fewer data dependencies, but the reason should be explicit." },
        4: { p: "Trend is a longer-term movement in level; seasonality is a recurring calendar pattern; residual variation includes fluctuations not explained by those components. A simple additive representation $y_t = \\text{trend}_t + \\text{seasonal}_t + \\text{error}_t$ can be useful for thinking, but some series have seasonal magnitude that grows with level, making a multiplicative or transformed representation more appropriate. Structural changes such as a new charging tariff do not necessarily repeat as ordinary seasonality." },
      },
      examples: [
        {
          at: 6,
          title: "Answer to the exercise",
          blocks: [
            { p: "Seasonal naive copies last Monday: 150. Adding the trend gives $150 + 15 = 165$, but only if growth stays at +15 a week. Three points cannot show that; a holiday or price change would break it. Compare both rules in a rolling backtest before choosing." },
          ],
        },
      ],
    },
    "3.11.3 Rolling-origin backtesting": {
      plain: "Train up to a date, forecast the next block, move the date forward, repeat. Each test uses only the past.",
    },
    "3.11.4 Forecast errors and uncertainty intervals": {
      plain: "MAE is the typical miss; RMSE punishes big misses more; pinball loss scores quantile forecasts. Avoid percentage errors when demand can be zero.",
      replace: {
        0: { p: "$\\text{MAE} = \\text{mean}\\,|y - \\hat y|$ measures average absolute error in charging sessions. $\\text{MSE} = \\text{mean}\\,(y - \\hat y)^2$ penalizes extreme misses more; RMSE is its square root. A percentage error can explode or be undefined when true demand is zero. Evaluate errors by station, weekday, and load level, because an overall mean can hide peak-day failures that cause unavailable chargers." },
        1: { p: "For actual daily sessions $(10, 20, 0)$ and forecasts $(12, 14, 4)$, errors (actual minus forecast) are $(-2, 6, -4)$. Absolute errors are $(2, 6, 4)$, so $\\text{MAE} = (2 + 6 + 4)/3 = 4$ sessions. Squared errors are $(4, 36, 16)$, so $\\text{MSE} = 56/3 \\approx 18.67$ sessions squared, and $\\text{RMSE} = \\sqrt{56/3} \\approx 4.32$ sessions. The zero-demand day makes the usual $|y - \\hat y|/|y|$ percentage error undefined. Do not simply delete it: zero-demand days may be central to staffing or outage questions. Instead choose a metric with an appropriate denominator or report absolute errors alongside a business cost." },
        2: { p: "A seasonal scaled error can compare performance across stations with different demand volumes. Under one common definition," },
        5: { p: "For a predicted upper quantile $q$ at probability level $\\tau$, pinball loss is $(\\tau - \\mathbf 1\\{y < q\\})(y - q)$. When $\\tau = 0.9$, actual demand $y = 10$ and $q = 8$, the underprediction costs $0.9 \\times (10 - 8) = 1.8$. If $q = 12$, the overprediction costs $(0.9 - 1) \\times (10 - 12) = 0.2$. The asymmetry is why a high quantile can be useful for capacity planning, although the chosen 0.9 does not automatically encode the actual relative costs. Validate whether about 90% of held-out demands lie below the proposed conditional 0.9 quantile, including on peak days. A prediction interval combines a lower and upper endpoint; evaluate both coverage and width under a stated sampling and time stability assumption." },
      },
      examples: [
        {
          at: 2,
          title: "MASE, written out",
          blocks: [
            { math: r`\text{MASE} = \frac{\text{mean}_{\text{test}}\,|y_t - \hat y_t|}{\text{mean}_{\text{train}}\,|y_t - y_{t-m}|}` },
            { p: "$m$ is the seasonal lag, and the denominator uses training data only. If the training seasonal-naive differences are $(2, 4, 6)$, the denominator is 4; a test MAE of 4 gives MASE = 1 (no better than seasonal naive). Below 1 beats it. If every training difference is zero, MASE is undefined." },
          ],
        },
      ],
    },
    "3.11.5 Change points and monitoring": {
      plain: "A sudden change (new tariff, new road) can break a correct model. Watch inputs right away and errors once outcomes arrive.",
    },
    "Textbook case: Forecasting With Honest Time Boundaries": {
      plain: "Library heating demand used to show horizons, baselines, autoregression, quantiles and cost-based decisions.",
    },
    "3.12.1 Forecast horizon defines the problem": {
      plain: "Predicting the next hour and predicting tomorrow are different problems with different usable inputs.",
    },
    "3.12.2 Seasonal baselines, trend, and residuals": {
      plain: "Split a series into trend + season + leftover to understand it; use \"same time last period\" as the baseline.",
    },
    "3.12.3 Autoregression, differencing, and serial dependence": {
      plain: "Autoregression predicts from recent values; differencing models the change instead of the level. Runs of same-sign errors mean the model is missing a pattern.",
    },
    "3.12.4 Point forecasts, quantiles, and interval coverage": {
      plain: "The mean minimises squared error, the median absolute error, a quantile pinball loss. Check that a 90% interval really contains about 90% of outcomes.",
    },
    "3.12.5 A forecast informs a decision under a cost model": {
      plain: "If running short costs 4 and over-stocking costs 1, plan for the 80th percentile: $4/(4 + 1) = 0.8$.",
    },
    "Textbook case: Forecasting at an Honest Issue Time": {
      plain: "Repair-hub requests forecast at 17:00 each day, used to show safe lag features and rolling evaluation.",
    },
    "3.13.1 Lagged features and the target's information set": {
      plain: "A lag feature is fine only if that value was recorded before the issue time. Realised future weather is leakage; a weather forecast published earlier is not.",
    },
    "3.13.2 Rolling-origin evaluation without temporal crossover": {
      plain: "Move the forecast origin forward step by step, training only on what was available at each origin.",
    },
    "3.13.3 Trend, seasonality, and interventions": {
      plain: "Encode weekdays and known events as features; treat outages and policy changes separately from normal seasonality.",
    },
    "3.13.4 Evaluate a feasible seasonal baseline": {
      plain: "On weekly data, \"same day last week\" beats \"yesterday\" by a wide margin: MAE 0.35 versus 2.0 in the code.",
    },
  },
  code: {
    "1.18.2 Fit/transform isolation, out-of-fold predictions, and test hygiene#0": {
      goal: "Fill missing values with the training mean only",
      code: r`def train_mean_fill(train, validation):
    measured = [value for value in train if value is not None]
    if not measured:
        raise ValueError("Training feature has no measured values")
    fitted_mean = sum(measured)/len(measured)
    return fitted_mean, [fitted_mean if x is None else x for x in validation]


trained_mean, transformed = train_mean_fill([10, 12, 14], [None, 100])
assert trained_mean == 12
assert transformed == [12, 100]
assert (10+12+14+100)/4 == 34  # The leaked pooled alternative.
print("training mean:", trained_mean, "| filled validation:", transformed)
print("leaky mean that also uses the validation value 100:", (10+12+14+100)/4)

# Output:
# training mean: 12.0 | filled validation: [12.0, 100]
# leaky mean that also uses the validation value 100: 34.0`,
      walk: [
        { line: "fitted_mean = sum(measured)/len(measured)", say: "Learn the fill value from training rows: 12." },
        { line: "return fitted_mean, [fitted_mean if x is None else x for x in validation]", say: "Apply it unchanged to validation rows." },
        { line: "assert (10+12+14+100)/4 == 34  # The leaked pooled alternative.", say: "Using all rows would give 34: the validation value 100 would leak into the fill." },
      ],
    },
    "1.18.3 Grouped and rolling splits in executable form#0": {
      goal: "Group folds and expanding time folds from scratch",
      code: r`def held_out_group_folds(group_ids):
    groups = list(dict.fromkeys(group_ids))
    if len(groups) < 2:
        raise ValueError("At least two independent groups required")
    for group in groups:
        train = [i for i, g in enumerate(group_ids) if g != group]
        valid = [i for i, g in enumerate(group_ids) if g == group]
        assert {group_ids[i] for i in train}.isdisjoint(
            {group_ids[i] for i in valid})
        yield train, valid


def expanding_time_folds(times, minimum_train, valid_size):
    if times != sorted(times) or minimum_train < 1 or valid_size < 1:
        raise ValueError("Need sorted times and positive fold sizes")
    stop = minimum_train
    while stop + valid_size <= len(times):
        train = list(range(stop))
        valid = list(range(stop, stop+valid_size))
        if times[train[-1]] >= times[valid[0]]:
            raise ValueError("Boundary must separate distinct timestamps")
        yield train, valid
        stop += valid_size


group_folds = list(held_out_group_folds(["a", "a", "b", "c"]))
assert len(group_folds) == 3
assert sorted(i for _, valid in group_folds for i in valid) == [0, 1, 2, 3]
time_folds = list(expanding_time_folds([1, 2, 3, 4, 5, 6], 2, 2))
assert time_folds == [([0, 1], [2, 3]), ([0, 1, 2, 3], [4, 5])]
for train, valid in group_folds:
    print("group fold  train rows", train, " validate rows", valid)
for train, valid in time_folds:
    print("time fold   train rows", train, " validate rows", valid)

# Output:
# group fold  train rows [2, 3]  validate rows [0, 1]
# group fold  train rows [0, 1, 3]  validate rows [2]
# group fold  train rows [0, 1, 2]  validate rows [3]
# time fold   train rows [0, 1]  validate rows [2, 3]
# time fold   train rows [0, 1, 2, 3]  validate rows [4, 5]`,
      walk: [
        { line: "valid = [i for i, g in enumerate(group_ids) if g == group]", say: "All rows of one group go to validation together." },
        { line: "train = list(range(stop))", say: "Time folds train on everything before the cut-off." },
        { line: "if times[train[-1]] >= times[valid[0]]:", say: "Refuse a fold whose training data reach into the validation period." },
      ],
    },
    "1.18.4 Aggregate metrics, uncertainty, and deployment decisions#0": {
      goal: "Mean of fold recalls versus pooled recall",
      code: r`def fold_recall_summary(fold_counts):
    # Each pair is (true_positives, false_negatives) for one validation fold.
    if not fold_counts or any(tp < 0 or fn < 0 for tp, fn in fold_counts):
        raise ValueError("Need nonnegative counts")
    if any(tp+fn == 0 for tp, fn in fold_counts):
        raise ValueError("Fold recall undefined without positive outcomes")
    mean_fold = sum(tp/(tp+fn) for tp, fn in fold_counts)/len(fold_counts)
    total_tp = sum(tp for tp, _ in fold_counts)
    total_positive = sum(tp+fn for tp, fn in fold_counts)
    return mean_fold, total_tp/total_positive


mean_recall, pooled_recall = fold_recall_summary([(1, 0), (5, 5)])
assert mean_recall == 0.75
assert abs(pooled_recall-6/11) < 1e-12
print("mean of fold recalls:", mean_recall, "| pooled recall:", round(pooled_recall, 3))

# Output:
# mean of fold recalls: 0.75 | pooled recall: 0.545`,
      walk: [
        { line: "mean_fold = sum(tp/(tp+fn) for tp, fn in fold_counts)/len(fold_counts)", say: "Each fold counts equally: $(1 + 0.5)/2 = 0.75$." },
        { line: "return mean_fold, total_tp/total_positive", say: "Every positive counts equally: $6/11 = 0.545$." },
      ],
    },
    "3.10.2 Generate transparent synthetic records#0": {
      goal: "Generate building-day records from a known formula",
      code: r`import pandas as pd

types = ['office','library','clinic','office','library','clinic']
offsets = [-7,-4,-1,2,5,8]
rows = []
for building in range(6):
    for day in range(12):
        hours = 6 + day % 5
        forecast_temp = 10 + (2 * day + building) % 8
        disturbance = [-2, 0, 2][(day + building) % 3]
        target = 50 + 3*hours + 2*forecast_temp + offsets[building] + disturbance
        rows.append({'building_id':f'b{building}', 'day':day,
                     'hours':hours, 'forecast_temp':forecast_temp,
                     'building_type':types[building], 'energy_kwh':target})
data = pd.DataFrame(rows)
assert len(data) == 72
assert data[['building_id','day']].duplicated().sum() == 0
assert data['energy_kwh'].notna().all()
print(data.head(3))
print(len(data), "rows:", data["building_id"].nunique(), "buildings x", data["day"].nunique(), "days")

# Output:
#   building_id  day  hours  forecast_temp building_type  energy_kwh
# 0          b0    0      6             10        office          79
# 1          b0    1      7             12        office          88
# 2          b0    2      8             14        office          97
# 72 rows: 6 buildings x 12 days`,
      walk: [
        { line: "target = 50 + 3*hours + 2*forecast_temp + offsets[building] + disturbance", say: "The true rule, so we know what a good model should find." },
        { line: "assert data[['building_id','day']].duplicated().sum() == 0", say: "One row per building per day." },
      ],
    },
    "3.10.4 Fit preprocessing and compare on a held-out building#0": {
      goal: "Grouped tuning, one held-out building, and a baseline",
      code: r`import pandas as pd

types = ['office','library','clinic','office','library','clinic']
offsets = [-7,-4,-1,2,5,8]
rows = []
for building in range(6):
    for day in range(12):
        hours = 6 + day % 5
        forecast_temp = 10 + (2 * day + building) % 8
        disturbance = [-2, 0, 2][(day + building) % 3]
        target = 50 + 3*hours + 2*forecast_temp + offsets[building] + disturbance
        rows.append({'building_id':f'b{building}', 'day':day,
                     'hours':hours, 'forecast_temp':forecast_temp,
                     'building_type':types[building], 'energy_kwh':target})
data = pd.DataFrame(rows)
assert len(data) == 72
assert data[['building_id','day']].duplicated().sum() == 0
assert data['energy_kwh'].notna().all()

# ---- this step ----
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

X = data[['hours','forecast_temp','building_type']]
y = data['energy_kwh']
is_test = data['building_id'].eq('b5')
X_dev, X_test = X.loc[~is_test], X.loc[is_test]
y_dev, y_test = y.loc[~is_test], y.loc[is_test]
groups = data.loc[~is_test, 'building_id']
def build(alpha):
    prepare = ColumnTransformer([
        ('numeric', Pipeline([('fill',SimpleImputer(strategy='median')),
                              ('scale',StandardScaler())]), ['hours','forecast_temp']),
        ('category', OneHotEncoder(handle_unknown='ignore'), ['building_type']),
    ])
    return Pipeline([('features',prepare),('ridge',Ridge(alpha=alpha))])

folds = GroupKFold(n_splits=5)
fold_mae = {}
for alpha in (0.1, 10.0):
    errors=[]
    for train, valid in folds.split(X_dev,y_dev,groups):
        assert set(groups.iloc[train]).isdisjoint(set(groups.iloc[valid]))
        fitted=build(alpha).fit(X_dev.iloc[train],y_dev.iloc[train])
        errors.append(mean_absolute_error(y_dev.iloc[valid],fitted.predict(X_dev.iloc[valid])))
    fold_mae[alpha]=sum(errors)/len(errors)
chosen=min(fold_mae,key=fold_mae.get)
final=build(chosen).fit(X_dev,y_dev)
baseline=DummyRegressor(strategy='median').fit(X_dev,y_dev)
model_mae=mean_absolute_error(y_test,final.predict(X_test))
baseline_mae=mean_absolute_error(y_test,baseline.predict(X_test))
assert len(X_test)==12 and len(set(groups))==5
assert np.isfinite([model_mae,baseline_mae]).all()
print({'selected_alpha':chosen,'fold_mae':fold_mae,
       'test_mae_kwh':round(model_mae,3),
       'baseline_test_mae_kwh':round(baseline_mae,3)})

# Output:
# {'selected_alpha': 10.0, 'fold_mae': {0.1: 7.626844096697499, 10.0: 6.496022023475485}, 'test_mae_kwh': 9.268, 'baseline_test_mae_kwh': 11.583}`,
      walk: [
        { line: "is_test = data['building_id'].eq('b5')", say: "Building b5 is the untouched test set." },
        { line: "def build(alpha):", say: "A fresh pipeline (fill, scale, one-hot, ridge) for every fit, so no fitted state carries over." },
        { line: "assert set(groups.iloc[train]).isdisjoint(set(groups.iloc[valid]))", say: "No building is on both sides of a fold." },
        { line: "chosen=min(fold_mae,key=fold_mae.get)", say: "$\\alpha = 10$ has the lower fold MAE (6.50 vs 7.63 kWh)." },
        { line: "baseline=DummyRegressor(strategy='median').fit(X_dev,y_dev)", say: "Test MAE 9.27 kWh versus 11.58 for the median baseline." },
      ],
    },
    "3.11.2 Seasonal baselines and temporal features#0": {
      goal: "Seasonal naive forecast: repeat last week",
      code: r`def repeat_last_week(observed, days=7):
    if days < 1 or len(observed) < days:
        raise ValueError("Need a complete observed seasonal period")
    return list(observed[-days:])


two_weeks = [10, 12, 11, 14, 13, 20, 21,
             15, 16, 14, 18, 19, 24, 25]
next_week = repeat_last_week(two_weeks)
assert next_week == [15, 16, 14, 18, 19, 24, 25]
assert len(next_week) == 7
print("forecast for next week:", next_week)

# Output:
# forecast for next week: [15, 16, 14, 18, 19, 24, 25]`,
      walk: [
        { line: "return list(observed[-days:])", say: "Next week's forecast is a copy of the last seven days." },
      ],
    },
    "3.11.3 Rolling-origin backtesting#0": {
      goal: "Rolling forecast windows",
      code: r`def rolling_windows(length, min_history, horizon, step):
    if min(length, min_history, horizon, step) < 1:
        raise ValueError("Positive window settings required")
    windows = []
    issue = min_history
    while issue+horizon <= length:
        train = range(issue)  # Every index here is strictly before issue.
        test = range(issue, issue+horizon)
        windows.append((list(train), list(test)))
        issue += step
    return windows


folds = rolling_windows(28, min_history=14, horizon=7, step=7)
assert [(len(train), list(test)) for train, test in folds] == [
    (14, list(range(14, 21))), (21, list(range(21, 28)))]
assert all(max(train) < min(test) for train, test in folds)
for train, test in folds:
    print(f"train on days 0-{max(train)}, test on days {min(test)}-{max(test)}")

# Output:
# train on days 0-13, test on days 14-20
# train on days 0-20, test on days 21-27`,
      walk: [
        { line: "train = range(issue)  # Every index here is strictly before issue.", say: "Train only on days before the forecast origin." },
        { line: "issue += step", say: "Move the origin forward a week and repeat." },
      ],
    },
    "3.12.4 Point forecasts, quantiles, and interval coverage#0": {
      goal: "Pinball loss and the seasonal baseline error",
      code: r`def pinball(actual, forecast, tau):
    if not 0 < tau < 1:
        raise ValueError('quantile level must be strictly between 0 and 1')
    gap = actual - forecast
    return gap * (tau - int(gap < 0))

assert pinball(20, 10, 0.9) == 9
assert abs(pinball(10, 20, 0.9) - 1) < 1e-12
week1 = [10,12,14,12,11,20,18]
week2 = [11,13,15,13,12,21,19]
assert sum(abs(actual - baseline) for actual, baseline in zip(week2, week1)) / 7 == 1
print("pinball loss, forecast 10 too low by 10:", pinball(20, 10, 0.9))
print("pinball loss, forecast 10 too high by 10:", round(pinball(10, 20, 0.9), 3))

# Output:
# pinball loss, forecast 10 too low by 10: 9.0
# pinball loss, forecast 10 too high by 10: 1.0`,
      walk: [
        { line: "return gap * (tau - int(gap < 0))", say: "For $\\tau = 0.9$, being 10 too low costs 9; being 10 too high costs only 1." },
        { line: "assert sum(abs(actual - baseline) for actual, baseline in zip(week2, week1)) / 7 == 1", say: "Copying week 1 misses every day of week 2 by exactly 1." },
      ],
    },
    "3.13.4 Evaluate a feasible seasonal baseline#0": {
      goal: "Seasonal naive versus last value on weekly data",
      code: r`import numpy as np

days=np.arange(70)
weekday_effect=np.array([2.,3.,2.,4.,5.,8.,7.])
demand=20.+.05*days+weekday_effect[days%7]
cutoff=49
test_days=np.arange(cutoff,70)
seasonal_pred=demand[test_days-7]
last_value_pred=demand[test_days-1]
truth=demand[test_days]
seasonal_mae=np.mean(np.abs(truth-seasonal_pred))
last_mae=np.mean(np.abs(truth-last_value_pred))
assert len(test_days)==21
assert np.isclose(seasonal_mae,.35)
assert seasonal_mae<last_mae
assert np.all(test_days-7<test_days)
print("seasonal naive MAE:", round(seasonal_mae, 3), "| last-value MAE:", round(last_mae, 3))

# Output:
# seasonal naive MAE: 0.35 | last-value MAE: 2.007`,
      walk: [
        { line: "seasonal_pred=demand[test_days-7]", say: "Same day last week." },
        { line: "last_value_pred=demand[test_days-1]", say: "Yesterday's value." },
        { line: "assert seasonal_mae<last_mae", say: "The weekly copy wins: 0.35 versus 2.01." },
      ],
    },
    "In Python#0": {
      goal: "Stratified split, cross-validation on training data, one final test",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)
print("share of class 1 in all / train / test:",
      round(y.mean(), 3), round(y_train.mean(), 3), round(y_test.mean(), 3))

pipe = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression(max_iter=1000))
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
scores = cross_val_score(pipe, X_train, y_train, cv=cv)   # preprocessing refit per fold
print("CV accuracy per fold:", scores.round(3), "mean", round(scores.mean(), 3))

pipe.fit(X_train, y_train)
print("test accuracy:", round(pipe.score(X_test, y_test), 3))   # look at this once, at the end

# Output:
# share of class 1 in all / train / test: 0.627 0.626 0.632
# CV accuracy per fold: [0.967 0.989 0.978 0.989 0.967] mean 0.978
# test accuracy: 0.982`,
      walk: [
        { line: "X, y, test_size=0.2, stratify=y, random_state=42)", say: "Hold out 20% with the same class share as the whole dataset." },
        { line: "pipe = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression(max_iter=1000))", say: "All preprocessing inside the pipeline." },
        { line: "scores = cross_val_score(pipe, X_train, y_train, cv=cv)   # preprocessing refit per fold", say: "Choose and compare models with CV on the training part only." },
        { line: "print(\"test accuracy:\", round(pipe.score(X_test, y_test), 3))   # look at this once, at the end", say: "The test score (0.982) agrees with CV (0.978), a sign that nothing leaked." },
      ],
    },
  },
};

/** Easy layer: Bias-Variance Trade-off. */
export const BIASVAR: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Bias: the model is too simple to capture the pattern. Variance: the model changes a lot with the training sample. Making a model more flexible lowers bias and raises variance.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Darts",
          blocks: [
            { p: "Each training set is one throw. High bias: all darts land close together, but off-centre. High variance: darts are centred on average but scattered all over. You want darts that are tight and centred, and noise is the wobble no thrower can remove." },
          ],
        },
      ],
    },
    "The decomposition": {
      plain: "Expected test error = (how wrong the average model is)² + (how much models disagree) + noise.",
      code: [
        {
          goal: "Measure bias² and variance by simulation",
          code: r`import numpy as np

rng = np.random.default_rng(0)
f = lambda x: np.sin(2 * np.pi * x)              # the true function
x_test = np.linspace(0.1, 0.9, 50)
noise_sd = 0.3

for degree in (1, 4, 9):
    preds = []
    for _ in range(300):                         # 300 different training sets of 30 points
        x = rng.uniform(0, 1, 30)
        y = f(x) + rng.normal(0, noise_sd, 30)
        coefs = np.polyfit(x, y, degree)
        preds.append(np.polyval(coefs, x_test))
    preds = np.array(preds)                      # shape (300, 50)
    avg = preds.mean(axis=0)                     # the "average model"
    bias2 = np.mean((avg - f(x_test)) ** 2)
    variance = np.mean(preds.var(axis=0))
    print(f"degree {degree:2d}: bias^2 {bias2:.3f}  variance {variance:.3f}  "
          f"expected test error {bias2 + variance + noise_sd**2:.3f}")

# Output:
# degree  1: bias^2 0.151  variance 0.019  expected test error 0.260
# degree  4: bias^2 0.003  variance 0.014  expected test error 0.107
# degree  9: bias^2 0.002  variance 0.661  expected test error 0.753`,
          walk: [
            { line: "for _ in range(300):                         # 300 different training sets of 30 points", say: "Draw many training sets from the same source and fit the same model to each." },
            { line: "avg = preds.mean(axis=0)                     # the \"average model\"", say: "The average prediction over all 300 fits." },
            { line: "bias2 = np.mean((avg - f(x_test)) ** 2)", say: "Bias²: how far the average model is from the truth." },
            { line: "variance = np.mean(preds.var(axis=0))", say: "Variance: how much individual fits scatter around their average." },
            { line: "f\"expected test error {bias2 + variance + noise_sd**2:.3f}\")", say: "Degree 1: bias dominates (0.26). Degree 9: variance dominates (0.75). Degree 4 is the bottom of the U (0.11)." },
          ],
        },
      ],
    },
    "Diagnose from two numbers": {
      plain: "Compare training and validation error: both high means bias; a big gap means variance.",
      examples: [
        {
          title: "Three models, three diagnoses",
          blocks: [
            { table: { head: ["Model", "Train error", "Validation error", "Diagnosis"], rows: [["Linear", "18%", "19%", "High bias: add capacity"], ["Deep tree", "0%", "15%", "High variance: regularise or get more data"], ["Tuned forest", "4%", "6%", "Good fit"]] } },
          ],
        },
      ],
    },
    "Worked example: reading learning curves": {
      plain: "If the curves meet high, more data won't help; if there's a gap that shrinks as data grows, more data will.",
    },
    "Model complexity knobs": {
      plain: "Every model has a dial between simple and flexible. Turn it with validation error, not training error.",
    },
    "1.17.5 Detect leakage and drift before tuning again": {
      plain: "Before tuning, rule out leakage (future information in features) and drift (the data changed). Retraining on broken data bakes the problem in.",
      examples: [
        {
          at: 3,
          title: "Answer to the exercise",
          blocks: [
            { list: ["Compare input distributions before and after the update: units, ranges, missing rates.", "Check whether the firmware changed what a field means (for example a new unit or scale).", "Score a fixed reference set of old inputs: if their scores are unchanged, the model is fine and the inputs moved."] },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Validation curve and learning curve for a decision tree",
      code: r`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import learning_curve, validation_curve
from sklearn.tree import DecisionTreeClassifier

X, y = load_breast_cancer(return_X_y=True)
depths = np.arange(1, 15)
train_s, val_s = validation_curve(DecisionTreeClassifier(random_state=0), X, y,
                                  param_name="max_depth", param_range=depths, cv=5)
for d in (1, 2, 14):
    print(f"depth {d:2d}: train accuracy {train_s[d-1].mean():.3f}  validation {val_s[d-1].mean():.3f}")
best = depths[val_s.mean(axis=1).argmax()]
print("best depth:", best)

sizes, tr, va = learning_curve(DecisionTreeClassifier(max_depth=best, random_state=0), X, y,
                               train_sizes=np.linspace(0.1, 1.0, 8), cv=5)
print("gap between train and validation, smallest vs largest training set:",
      round(tr[0].mean() - va[0].mean(), 3), round(tr[-1].mean() - va[-1].mean(), 3))

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(depths, train_s.mean(axis=1), marker="o", label="training")
ax.plot(depths, val_s.mean(axis=1), marker="o", label="validation")
ax.set(xlabel="max_depth (complexity)", ylabel="accuracy", title="Validation curve")
ax.legend()
fig.tight_layout()
fig.savefig("bv_curve.png")

# Output:
# depth  1: train accuracy 0.924  validation 0.900
# depth  2: train accuracy 0.952  validation 0.928
# depth 14: train accuracy 1.000  validation 0.917
# best depth: 2
# gap between train and validation, smallest vs largest training set: 0.183 0.024`,
      figure: { src: "/theory/figures/code/bv_curve.svg", alt: "Training accuracy rises to 1.0 with depth; validation accuracy peaks at depth 2 and then levels off lower." },
      walk: [
        { line: "train_s, val_s = validation_curve(DecisionTreeClassifier(random_state=0), X, y,", say: "Train and validation accuracy for each depth, with 5-fold CV." },
        { line: "print(f\"depth {d:2d}: train accuracy {train_s[d-1].mean():.3f}  validation {val_s[d-1].mean():.3f}\")", say: "Depth 14 is perfect on training data (1.000) but not better on validation: variance." },
        { line: "best = depths[val_s.mean(axis=1).argmax()]", say: "Pick the depth with the best validation score: 2." },
        { line: "sizes, tr, va = learning_curve(DecisionTreeClassifier(max_depth=best, random_state=0), X, y,", say: "Learning curve: scores for growing training sets." },
        { line: "round(tr[0].mean() - va[0].mean(), 3), round(tr[-1].mean() - va[-1].mean(), 3))", say: "The train–validation gap shrinks from 0.18 to 0.02 as data grow." },
      ],
    },
  },
};
