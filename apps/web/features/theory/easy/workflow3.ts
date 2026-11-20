import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Feature Engineering. */
export const FEATURES: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Feature engineering turns what you know about the problem into columns: fill gaps sensibly, encode categories correctly, and add derived features the model could not invent on its own.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "A feature the model cannot invent",
          blocks: [
            { p: "Predicting food-delivery time from latitude and longitude alone is hard: the model must learn the city's geography from scratch. Add one column, \"road distance from restaurant to customer\", and a simple model does well. You put knowledge into the data that the model would need thousands of rows to discover." },
          ],
        },
        {
          at: 4,
          title: "Smoothed target encoding by hand",
          blocks: [
            { p: "Global failure rate $\\bar y = 0.2$, smoothing $m = 10$. City A has 2 rows, both failures ($\\bar y_A = 1$). City B has 200 rows with rate 0.3." },
            { math: r`\text{TE}(A) = \frac{2 \times 1 + 10 \times 0.2}{2 + 10} = 0.33, \qquad \text{TE}(B) = \frac{200 \times 0.3 + 10 \times 0.2}{200 + 10} = 0.295` },
            { p: "Two lucky rows cannot push city A to 1.0; city B, with plenty of data, keeps almost its own rate." },
          ],
        },
      ],
    },
    "Missing values": {
      plain: "Fill numbers with the training median, categories with the most common value or \"Unknown\", and add a \"was missing\" flag when the gap itself may mean something.",
    },
    "Encoding categories": {
      plain: "One-hot for categories with no order, ordinal for ordered ones, target encoding (computed out-of-fold) for categories with many levels.",
    },
    "Transforms and new features": {
      plain: "Log for long tails, ratios and differences for relationships, date parts for time effects, sine/cosine for anything that wraps around.",
    },
    "Worked example": {
      plain: "Learn the fill value, the category list and the order mapping from training data, then apply them unchanged to new rows.",
      code: [
        {
          goal: "Fill, one-hot, ordinal and cyclical features with pandas",
          code: r`import numpy as np
import pandas as pd
pd.set_option("display.width", 120)
pd.set_option("display.max_columns", 20)

train = pd.DataFrame({
    "age":  [22, 25, np.nan, 30, 41],
    "city": ["Mysuru", "Pune", "Mysuru", "Bengaluru", "Pune"],
    "room": ["S", "L", "M", "M", "S"],
    "hour": [23, 0, 6, 12, 18],
})

age_fill = train["age"].median()                         # 27.5, learned from training rows
train["age_missing"] = train["age"].isna().astype(int)   # flag BEFORE filling
train["age"] = train["age"].fillna(age_fill)

cities = sorted(train["city"].unique())                  # the training vocabulary
for c in cities:
    train[f"city_{c}"] = (train["city"] == c).astype(int)   # one-hot

train["room_code"] = train["room"].map({"S": 0, "M": 1, "L": 2})   # real order -> ordinal

train["hour_sin"] = np.sin(2 * np.pi * train["hour"] / 24)   # hour on a circle
train["hour_cos"] = np.cos(2 * np.pi * train["hour"] / 24)

print("age fill value:", age_fill)
print(train.drop(columns=["city", "room"]).round(2) + 0.0)
d = lambda a, b: np.hypot(*(train.loc[a, ["hour_sin", "hour_cos"]] - train.loc[b, ["hour_sin", "hour_cos"]]))
print(f"distance 23:00 to 00:00 = {d(0, 1):.2f}, 00:00 to 12:00 = {d(1, 3):.2f}")

# Output:
# age fill value: 27.5
#     age  hour  age_missing  city_Bengaluru  city_Mysuru  city_Pune  room_code  hour_sin  hour_cos
# 0  22.0  23.0          0.0             0.0          1.0        0.0        0.0     -0.26      0.97
# 1  25.0   0.0          0.0             0.0          0.0        1.0        2.0      0.00      1.00
# 2  27.5   6.0          1.0             0.0          1.0        0.0        1.0      1.00      0.00
# 3  30.0  12.0          0.0             1.0          0.0        0.0        1.0      0.00     -1.00
# 4  41.0  18.0          0.0             0.0          0.0        1.0        0.0     -1.00      0.00
# distance 23:00 to 00:00 = 0.26, 00:00 to 12:00 = 2.00`,
          walk: [
            { line: "age_fill = train[\"age\"].median()                         # 27.5, learned from training rows", say: "Median of the known ages: 27.5." },
            { line: "train[\"age_missing\"] = train[\"age\"].isna().astype(int)   # flag BEFORE filling", say: "Make the flag first; after filling there would be nothing left to flag." },
            { line: "train[f\"city_{c}\"] = (train[\"city\"] == c).astype(int)   # one-hot", say: "One 0/1 column per city in the training list." },
            { line: "train[\"room_code\"] = train[\"room\"].map({\"S\": 0, \"M\": 1, \"L\": 2})   # real order -> ordinal", say: "S < M < L really are ordered, so numbers 0, 1, 2 are fair." },
            { line: "train[\"hour_sin\"] = np.sin(2 * np.pi * train[\"hour\"] / 24)   # hour on a circle", say: "Place each hour on a circle with sine and cosine." },
            { line: "print(f\"distance 23:00 to 00:00 = {d(0, 1):.2f}, 00:00 to 12:00 = {d(1, 3):.2f}\")", say: "23:00 and 00:00 are now close (0.26); midnight and noon are opposite (2.00)." },
          ],
        },
      ],
    },
    "1.2.7 Feature preparation is part of the estimator": {
      plain: "Scaling, transforms and fill values are learned from training data, so they are part of the model and must be saved with it.",
      replace: {
        1: { p: "For a numeric feature $x$, standardization uses $z = (x - \\mu_{\\text{train}})/\\sigma_{\\text{train}}$. The mean and standard deviation are learned from training rows only. Min-max scaling maps $x$ to $(x - \\min_{\\text{train}})/(\\max_{\\text{train}} - \\min_{\\text{train}})$, typically into $[0, 1]$ for training observations when the range is nonzero; a future observation may lie outside $[0, 1]$. Robust scaling uses the training median and interquartile range $\\text{IQR} = Q_3 - Q_1$. It is less driven by a small number of extreme values, though it does not make every distribution symmetric. Define what happens when a fitted scale denominator is zero." },
        2: { p: "A log transform compresses a positive long tail. If zero is a valid value, $\\log(1 + x)$ is defined for $x \\ge 0$. Box-Cox power transforms require strictly positive values, while Yeo-Johnson can handle zero and negative values; both have fitted parameters. A transformation should be judged by whether it improves the task or stabilizes a specified analysis, not by whether a histogram looks bell-shaped." },
      },
    },
    "1.20.1 Missing data is a modeling assumption": {
      plain: "Why a value is missing matters more than how you fill it. MCAR, MAR and MNAR are assumptions about that reason, not facts you can read off a chart.",
      replace: {
        1: { p: "Let $R_j = 1$ if feature $j$ is observed and $R_j = 0$ if missing. “Missing completely at random” requires the distribution of $R_j$ not to depend on any observed or unobserved variables in the relevant model. “Missing at random” permits dependence on variables already observed; for example, a reader may fail more often at stations with recorded low battery voltage. “Missing not at random” allows missingness to continue depending on an unavailable value even after conditioning on observed variables. These are assumptions about the mechanism, not conclusions one can prove from a missingness chart alone." },
      },
    },
    "1.20.2 A data pipeline is an executable definition": {
      plain: "Write preprocessing as code in a fixed order (types, split, fit, transform) so it can be tested and reused exactly.",
      replace: {
        5: { p: "If daily rentals have a long right tail and include zero, $\\log(1 + x)$ compresses larger values. Power transformations fit a shape parameter; they can sometimes stabilize a statistical model but do not guarantee a better downstream forecast. Binning replaces a numeric variable with intervals. Equal-width boundaries depend on the range; quantile boundaries depend on training ranks. A learned bin boundary can change if refitted next month, so version the transform. Keeping the original numeric feature alongside a meaningful “near capacity” indicator may preserve information while adding an interpretable operational threshold." },
      },
    },
    "1.20.3 Outlier rules can erase the target signal": {
      plain: "An unusual value may be the very event you want to predict. Check where it came from before removing or capping it.",
      replace: {
        1: { p: "For an approximately symmetric reference distribution, $z = (x - \\mu)/\\sigma$ expresses distance from the mean in standard-deviation units. If the distribution is skewed, a threshold like $|z| > 3$ has no universal tail-probability interpretation. A quartile-based fence uses $\\text{IQR} = Q_3 - Q_1$ and flags $x$ below $Q_1 - 1.5\\,\\text{IQR}$ or above $Q_3 + 1.5\\,\\text{IQR}$. The factor 1.5 is conventional, not a physical law. Percentile thresholds flag rows beyond fitted quantiles such as the 1st and 99th percentiles." },
      },
    },
    "Textbook case: Missing Data, Imputation, and Uncertainty": {
      plain: "Rooftop heat sensors with gaps, used to compare deleting rows, simple filling, nearest-neighbour filling, chained filling and multiple imputation.",
    },
    "1.21.1 Missingness mechanisms, selection bias, and complete cases": {
      plain: "Deleting incomplete rows is only safe if the gaps are random. If hot days are the ones missing, the remaining average is too low.",
      replace: {
        1: { p: "Let $X$ denote a would-be measurement and let $R_X = 1$ if it is recorded and $R_X = 0$ if missing. For several variables, $R$ is a vector of such indicators. Partition the complete underlying data into observed components $X_{obs}$ and unobserved components $X_{mis}$. These definitions make three commonly used assumptions precise:" },
        2: { list: ["**Missing completely at random (MCAR):** $P(R \\mid X_{obs}, X_{mis}) = P(R)$. The recording pattern is independent of the values under discussion.", "**Missing at random (MAR):** $P(R \\mid X_{obs}, X_{mis}) = P(R \\mid X_{obs})$. Once the observed information used by the model is given, recording does not additionally depend on the missing values.", "**Missing not at random (MNAR):** dependence on unobserved values remains even after conditioning on the observed information used by the model."] },
        5: { p: "Complete-case analysis keeps a row only if every variable selected for that analysis is present. Define $C = 1$ when the row is complete. A complete-case estimate of the mean is an estimate of $\\mathbb E[X \\mid C = 1]$. The desired population mean may be $\\mathbb E[X]$. These are the same only under appropriate conditions. In particular, MCAR makes selection independent of $X$ and protects a simple sample mean from selection bias, although precision still falls because fewer rows remain. Some regression parameters can remain valid under weaker, model-specific selection assumptions; saying that MCAR is always required for every complete-case regression would be too broad." },
      },
    },
    "1.21.2 Simple filling, indicators, random draws, and leakage-free code": {
      plain: "Fill with a training statistic, add a missing flag, and reuse the same fitted numbers for every later row.",
      replace: {
        1: { p: "For a numeric feature with observed training values $x_1, \\dots, x_m$, mean imputation uses $a = \\frac1m\\sum_i x_i$. Median imputation uses the middle order statistic (or the mean of the two middle observations if $m$ is even). These summaries are parameters learned from training data. The same fitted number must fill training-validation and later records; recomputing a fresh mean on a validation period uses information from that period and can make the reported performance unrealistic. With time-ordered forecasting, fit on dates available before each evaluation cutoff." },
        4: { p: "Let $M_i = 1$ when $x_i$ was originally missing and $M_i = 0$ when recorded. Adding $M$ alongside the filled $x$ lets a predictor learn different behavior for recorded versus filled values when the training data support it. Keep the flag fixed to the original missing pattern: computing it after imputation produces an all-zero feature. Indicators do not make a missing value correct; their relation to the target can also change when sensors are repaired. Monitor missing rates and performance by indicator status after deployment." },
      },
    },
    "1.21.3 K-nearest-neighbor imputation when coordinates are incomplete": {
      plain: "Find the most similar complete rows and copy (or average) their value for the missing column. Closer rows can get more weight.",
      replace: {
        3: { math: r`d(x, z) = \sqrt{\frac{p}{|O(x, z)|}\sum_{r \in O(x, z)}(x_r - z_r)^2}` },
        5: { p: "For uniform weights, average the $j$-th values of the closest $k$ eligible donors. With inverse-distance weights $w_l = 1/d_l$ for positive $d_l$, the estimate is $\\sum_l w_lz_{lj}/\\sum_l w_l$. If one or more donors have distance zero, use only the zero-distance donors rather than divide by zero or let nonzero neighbors contribute. If fewer than $k$ donors qualify, explicitly decide whether to use those available or fall back to a simpler fitted statistic. Missing-aware distance and neighbor selection can be computationally costly at prediction time." },
        7: { p: "Suppose a new row has (humidity, elevation, voltage) = (40, 3, missing). Three development rows are (35, 3, 11), (42, 3, 12) and (70, 5, 14). Distances on the two complete predictor coordinates are 5, 2 and $\\sqrt{30^2 + 2^2} = \\sqrt{904} \\approx 30.07$. With $k = 2$ the first two donors in distance order have voltages 12 and 11, so a uniform estimate is $(12 + 11)/2 = 11.5$. Inverse-distance weights are $1/2$ and $1/5$, giving $(12/2 + 11/5)/(1/2 + 1/5) = 8.2/0.7 \\approx 11.714$. The larger weight on the closer row accounts for the difference. These units and scales are artificial for instruction; with real data, a five-point humidity difference and a one-unit elevation difference require contextual interpretation." },
        8: { p: "If elevation were missing in the target, only humidity would overlap; using $p = 2$ above multiplies the squared difference by two. This does not create the lost elevation information. If humidity were also missing, no distance is defined. A practical implementation should track the overlap count and reject or flag low-overlap imputations." },
        13: { p: "**Worked exercise.** If the humidity of the second donor changes from 42 to 41 while other coordinates stay fixed, its distance becomes 1. The closest two donor voltages remain 12 and 11, so the uniform result stays 11.5; inverse-distance weighting becomes $(12/1 + 11/5)/(1 + 1/5) = 14.2/1.2 \\approx 11.833$. Which answer is more reliable cannot be settled from the two distances alone; inspect how humidity relates to voltage and whether the donor pool represents the later weeks." },
      },
    },
    "1.21.4 Chained conditional imputation and its limitations": {
      plain: "Start with simple fills, then repeatedly predict each incomplete column from the others and refill. Measured values never change.",
      replace: {
        2: { p: "Consider an illustrative two-column training table with humidity $H$ and temperature $T$. Four complete rows are $(H, T) = (30, 27), (40, 26), (50, 25), (60, 24)$. Two additional rows are $(55, \\text{missing})$ and $(\\text{missing}, 23.5)$. Initial means from observed entries, including 23.5 for $T$ and 55 for $H$ where present, are $H = (30 + 40 + 50 + 60 + 55)/5 = 47$ and $T = (27 + 26 + 25 + 24 + 23.5)/5 = 25.1$. The initial completed rows are $(55, 25.1)$ and $(47, 23.5)$. At the temperature step, fit $T$ from $H$ using the five rows whose $T$ is observed; one such row has an initially filled $H$ of 47. Update the $T$ gap at $H = 55$. At the humidity step, fit $H$ from $T$ using the five rows whose $H$ is observed, now including the freshly updated $T$ in the row with $H = 55$; update the remaining $H$ gap. A second sweep refits both regressions on the updated table. This concrete sequence explains why update order matters." },
        3: { p: "Ordinary least squares with one predictor minimizes $\\sum_i[y_i - (a + bx_i)]^2$ over observed-target rows. Differentiating with respect to $a$ and $b$ and setting both derivatives to zero yields" },
        4: { math: r`b = \frac{\sum_i(x_i - \bar x)(y_i - \bar y)}{\sum_i(x_i - \bar x)^2}, \qquad a = \bar y - b\bar x` },
        14: { p: "**Worked exercise.** If the two columns are perfectly related by $T = 30 - 0.1H$ in every genuinely observed row, a missing $T$ with $H = 50$ predicts 25. But if both $H$ and $T$ are absent in that row, neither conditional regression has a measured starting input from that row; initial fills drive the first pass and can dominate later results. Additional independent measurements, not merely more sweeps, are needed to identify its particular values." },
      },
    },
    "1.21.5 Multiple imputation, pooled variance, and honest uncertainty": {
      plain: "Fill the gaps several plausible ways, analyse each, then combine. The spread between the analyses tells you how much the missing data add to the uncertainty.",
      replace: {
        3: { math: r`\bar q = \frac1m\sum_{l=1}^m q_l, \quad \bar U = \frac1m\sum_{l=1}^m U_l, \quad B = \frac{1}{m-1}\sum_{l=1}^m(q_l - \bar q)^2, \quad T = \bar U + \Big(1 + \frac1m\Big)B` },
        4: { p: "The first component $\\bar U$ reflects sampling uncertainty inside each completed dataset. The second reflects disagreement between plausible completions, with a finite-$m$ adjustment. The standard error is $\\sqrt T$. An interval needs an appropriate reference distribution and degrees of freedom; treating $\\bar q \\pm 1.96\\sqrt T$ as universally exact, especially for small $m$, would be unjustified. If $B = 0$, the completions happen to give the same estimate; that does not prove missingness harmless or the imputation model valid." },
        6: { p: "Suppose $m = 3$ analyses of plausible completed heat datasets give a coefficient estimate $q = (2, 3, 4)$ degrees per chosen covariate unit. Each reports estimated within-dataset variance $U = 0.25$. Then $\\bar q = (2 + 3 + 4)/3 = 3$, $\\bar U = 0.25$ and $B = [(2 - 3)^2 + (3 - 3)^2 + (4 - 3)^2]/(3 - 1) = 1$. Total variance $T = 0.25 + (1 + 1/3) \\times 1 = 19/12 \\approx 1.5833$. The standard error is $\\sqrt{19/12} \\approx 1.2583$. Reporting $\\sqrt{0.25} = 0.5$ as the standard error would ignore the much larger disagreement between completions." },
        11: { p: "**Worked exercise.** If three completed analyses all yield $q_l = 3$ and all report $U_l = 0.25$, then $\\bar q = 3$, $B = 0$, $T = 0.25$, and the standard error is 0.5 under the stated combining rule. These arithmetic outputs do not demonstrate that the unmeasured temperatures were all known; three identical estimates might indicate an imputation routine that fails to propagate variation. Inspect the generation of the completed datasets before interpreting the interval." },
      },
    },
    "1.22.1 Feature engineering as a mathematical and temporal map": {
      plain: "A feature is a function of data known at prediction time. Keep a register of each feature's unit, source and when it becomes available.",
    },
    "1.22.3 Nominal, ordinal, and mixed category encoding": {
      plain: "Never give unordered categories numbers 0, 1, 2 for a distance or linear model. Ordered categories can get numbers, but the spacing is an assumption.",
    },
    "1.22.4 Missingness, imputation, and a worked preprocessing contract": {
      plain: "Fit the fill value, centre and scale once on training data, save them, and apply the same three numbers to future rows.",
    },
    "1.22.5 Encode categories with a fitted vocabulary and an unseen-value contract": {
      plain: "Fix the category list from training data and decide in advance what happens with a new category or a missing one.",
    },
    "1.22.6 Derive time features only from information available at issue time": {
      plain: "\"Days since last service\" is fine; \"days until next repair\" is the future. Compute time features as of the prediction moment.",
    },
    "1.23.3 Complete-case analysis and imputation assumptions": {
      plain: "Dropping rows changes who is in the data; filling values assumes something about the gaps. State which assumption you are making.",
    },
    "1.23.4 A pipeline is an ordered estimator, not a collection of one-time fixes": {
      plain: "Unit conversion, filling, scaling, encoding and model run in a fixed order and are fitted together on training data.",
    },
    "Textbook case: A Dataset From Raw Records to Valid Features": {
      plain: "Synthetic cooling-unit records taken from inspection and schema checks to a grouped, leak-free model.",
    },
    "3.7.1 Inspect the records and their provenance": {
      plain: "Before modelling, check each column's type, unit, range, missing rate and when it becomes known.",
    },
    "3.7.2 Missingness and transformations depend on the prediction use": {
      plain: "The right fill, scaling and outlier rule depend on the model and the decision it supports.",
    },
    "3.7.3 A small executable schema and grouped test": {
      plain: "Check the data in code, keep sites on one side of each fold, and beat a mean baseline.",
    },
    "Textbook case: Joins, Event Time, and Reliable Feature Tables": {
      plain: "Separate inventory and alert tables joined into one feature table without double-counting or peeking at the future.",
    },
    "3.8.1 Define grain and keys before joining": {
      plain: "Decide what one row means (one unit per day) and check that every join keeps that: no duplicates, no lost rows.",
    },
    "3.8.2 Aggregate events with a closed observation window": {
      plain: "Count events in a window that ends at the issue time, and only those that had arrived by then.",
    },
    "3.8.3 Build and check an as-of feature in Python": {
      plain: "Filter by event time and arrival time, count per unit, join, and fill \"no alerts\" with 0.",
    },
    "3.8.4 Detect duplicates, changing schemas, and bad aggregates": {
      plain: "A duplicated alert inflates a count; a unit change breaks a feature silently. Test for both.",
    },
    "Textbook case: Detecting Unusual Measurements Without Erasing Evidence": {
      plain: "Air sensors with occasional tenfold spikes, used to separate data errors from genuine extremes.",
    },
    "2.26.1 Define what an outlier means for the task": {
      plain: "\"Unusual\" is not \"wrong\". Check the sensor, unit and firmware before deciding.",
    },
    "2.26.2 Z scores, robust fences, percentiles, and winsorization": {
      plain: "z-scores use mean and standard deviation (which outliers distort); IQR fences use quartiles (which they barely move). Capping keeps the row but limits its size.",
      examples: [
        {
          at: 1,
          title: "Why the z-score misses the outlier",
          blocks: [
            { p: "For $(2, 3, 3, 4, 28)$, the 28 drags the mean to 8 and inflates the standard deviation to 10, so its z-score is only 2.0: below the usual cut-off of 3. The IQR fence is not fooled: on $(2, 3, 3, 4, 5, 6, 28)$ it flags 28 because 28 > 10.5." },
          ],
        },
      ],
    },
    "2.26.3 Compare policies on the cases they affect": {
      plain: "Capping can improve ordinary days while ruining the rare high days. Compare errors on the affected cases, not only overall.",
    },
  },
  code: {
    "1.21.2 Simple filling, indicators, random draws, and leakage-free code#0": {
      goal: "A fit/transform imputer with missing flags, in plain Python",
      code: r`from collections import Counter
from statistics import median


def fit_simple_imputer(train_rows):
    observed_heat = [float(row["heat"]) for row in train_rows
                     if row["heat"] is not None]
    observed_device = [row["device"] for row in train_rows
                       if row["device"] is not None]
    if not observed_heat or not observed_device:
        raise ValueError("Each imputed column needs observed training data")
    if any(not __import__("math").isfinite(v) for v in observed_heat):
        raise ValueError("Heat readings must be finite")
    counts = Counter(observed_device)
    mode = sorted(counts, key=lambda value: (-counts[value], str(value)))[0]
    return {"heat_median": median(observed_heat), "device_mode": mode}


def transform_simple(rows, learned):
    result = []
    for row in rows:
        item = dict(row)
        item["heat_missing"] = int(row["heat"] is None)
        item["device_missing"] = int(row["device"] is None)
        if item["heat_missing"]:
            item["heat"] = learned["heat_median"]
        if item["device_missing"]:
            item["device"] = learned["device_mode"]
        result.append(item)
    return result


training = [
    {"heat": 20, "device": "alpha"},
    {"heat": None, "device": "alpha"},
    {"heat": 26, "device": None},
]
later = [{"heat": None, "device": None}]
learned = fit_simple_imputer(training)
assert learned == {"heat_median": 23, "device_mode": "alpha"}
assert transform_simple(later, learned) == [
    {"heat": 23, "device": "alpha", "heat_missing": 1, "device_missing": 1}
]
assert later == [{"heat": None, "device": None}]
print("learned from training:", learned)
print("later row after filling:", transform_simple(later, learned))

# Output:
# learned from training: {'heat_median': 23.0, 'device_mode': 'alpha'}
# later row after filling: [{'heat': 23.0, 'device': 'alpha', 'heat_missing': 1, 'device_missing': 1}]`,
      walk: [
        { line: "return {\"heat_median\": median(observed_heat), \"device_mode\": mode}", say: "Fit: learn the median and the most common device from training rows." },
        { line: "item[\"heat_missing\"] = int(row[\"heat\"] is None)", say: "Record the flag from the original value." },
        { line: "item[\"heat\"] = learned[\"heat_median\"]", say: "Transform: fill with the saved training median." },
        { line: "assert later == [{\"heat\": None, \"device\": None}]", say: "The input rows are not modified in place." },
      ],
    },
    "1.21.3 K-nearest-neighbor imputation when coordinates are incomplete#0": {
      goal: "Fill one value from its nearest neighbours",
      code: r`import math


def impute_one_knn(target, donors, feature, *, k=2, weighting="uniform"):
    if not isinstance(k, int) or isinstance(k, bool) or k < 1:
        raise ValueError("k must be a positive integer")
    if weighting not in {"uniform", "inverse_distance"}:
        raise ValueError("Unknown weighting rule")
    p = len(target)
    if not 0 <= feature < p or target[feature] is not None:
        raise ValueError("Specify an index of a missing target feature")
    candidates = []
    for number, donor in enumerate(donors):
        if len(donor) != p or donor[feature] is None:
            continue
        shared = [r for r in range(p) if r != feature
                  and target[r] is not None and donor[r] is not None]
        if not shared:
            continue
        distance = math.sqrt((p - 1) / len(shared) * sum(
            (target[r] - donor[r]) ** 2 for r in shared))
        if not math.isfinite(distance) or not math.isfinite(donor[feature]):
            continue
        candidates.append((distance, number, donor[feature]))
    candidates.sort()  # Distance first, then donor position for ties.
    selected = candidates[:k]
    if not selected:
        raise ValueError("No eligible donors with shared predictors")
    if weighting == "uniform":
        return sum(value for _, _, value in selected) / len(selected)
    zero = [value for distance, _, value in selected if distance == 0]
    if zero:
        return sum(zero) / len(zero)
    weights = [1 / distance for distance, _, _ in selected]
    return sum(w * row[2] for w, row in zip(weights, selected)) / sum(weights)


donors = [(35, 3, 11), (42, 3, 12), (70, 5, 14)]
assert impute_one_knn((40, 3, None), donors, 2) == 11.5
assert abs(impute_one_knn((40, 3, None), donors, 2,
                          weighting="inverse_distance") - 11.7142857143) < 1e-9
print("uniform average of the 2 nearest donors:", impute_one_knn((40, 3, None), donors, 2))
print("inverse-distance weighted:", round(impute_one_knn((40, 3, None), donors, 2, weighting="inverse_distance"), 3))

# Output:
# uniform average of the 2 nearest donors: 11.5
# inverse-distance weighted: 11.714`,
      walk: [
        { line: "shared = [r for r in range(p) if r != feature", say: "Compare only on coordinates both rows have." },
        { line: "distance = math.sqrt((p - 1) / len(shared) * sum(", say: "Missing-aware distance, rescaled for the number of shared coordinates." },
        { line: "return sum(value for _, _, value in selected) / len(selected)", say: "Uniform: plain average of the $k$ nearest values (11.5)." },
        { line: "weights = [1 / distance for distance, _, _ in selected]", say: "Inverse distance: closer rows count more (11.714)." },
      ],
    },
    "1.21.4 Chained conditional imputation and its limitations#0": {
      goal: "Chained (iterative) imputation of two columns",
      code: r`def line_fit(pairs):
    x_bar = sum(x for x, _ in pairs) / len(pairs)
    y_bar = sum(y for _, y in pairs) / len(pairs)
    denominator = sum((x - x_bar) ** 2 for x, _ in pairs)
    slope = (sum((x - x_bar) * (y - y_bar) for x, y in pairs)
             / denominator if denominator else 0.0)
    return y_bar - slope * x_bar, slope


def fill_two_columns(rows, sweeps=3):
    if sweeps < 1:
        raise ValueError("Need at least one sweep")
    if any(h is None and t is None for h, t in rows):
        raise ValueError("At least one value per row is required here")
    present_h = [h for h, _ in rows if h is not None]
    present_t = [t for _, t in rows if t is not None]
    if len(present_h) < 2 or len(present_t) < 2:
        raise ValueError("Too few measured values for this example")
    h_mean = sum(present_h) / len(present_h)
    t_mean = sum(present_t) / len(present_t)
    observed_h = [h is not None for h, _ in rows]
    observed_t = [t is not None for _, t in rows]
    filled = [[h if h is not None else h_mean,
               t if t is not None else t_mean] for h, t in rows]
    history = []
    for _ in range(sweeps):
        a, b = line_fit([(h, t) for (h, t), observed
                         in zip(filled, observed_t) if observed])
        for index, measured in enumerate(observed_t):
            if not measured:
                filled[index][1] = a + b * filled[index][0]
        a, b = line_fit([(t, h) for (h, t), observed
                         in zip(filled, observed_h) if observed])
        for index, measured in enumerate(observed_h):
            if not measured:
                filled[index][0] = a + b * filled[index][1]
        history.append((filled[4][1], filled[5][0]))
    return filled, history


sensor_rows = [(30, 27), (40, 26), (50, 25), (60, 24),
               (55, None), (None, 23.5)]
completed, passes = fill_two_columns(sensor_rows)
assert all(completed[i] == list(sensor_rows[i]) for i in range(4))
assert completed[4][0] == 55 and completed[5][1] == 23.5
assert len(passes) == 3 and sensor_rows[4][1] is None
for sweep, (t_fill, h_fill) in enumerate(passes, start=1):
    print(f"sweep {sweep}: temperature filled at H=55 -> {t_fill:.3f}, humidity filled at T=23.5 -> {h_fill:.3f}")

# Output:
# sweep 1: temperature filled at H=55 -> 24.085, humidity filled at T=23.5 -> 62.948
# sweep 2: temperature filled at H=55 -> 24.434, humidity filled at T=23.5 -> 64.698
# sweep 3: temperature filled at H=55 -> 24.490, humidity filled at T=23.5 -> 64.957`,
      walk: [
        { line: "filled = [[h if h is not None else h_mean,", say: "Start by filling every gap with its column mean." },
        { line: "a, b = line_fit([(h, t) for (h, t), observed", say: "Fit temperature from humidity on rows where temperature was measured." },
        { line: "filled[index][1] = a + b * filled[index][0]", say: "Refill only the cells that were missing." },
        { line: "history.append((filled[4][1], filled[5][0]))", say: "The filled values settle over the sweeps (24.09 → 24.43 → 24.49)." },
      ],
    },
    "1.21.5 Multiple imputation, pooled variance, and honest uncertainty#0": {
      goal: "Pool estimates from several imputed datasets",
      code: r`import math


def pool_estimates(estimates, variances):
    m = len(estimates)
    if m < 2 or len(variances) != m:
        raise ValueError("Need at least two matching estimates and variances")
    if any(not math.isfinite(q) for q in estimates):
        raise ValueError("Estimates must be finite")
    if any(not math.isfinite(u) or u < 0 for u in variances):
        raise ValueError("Variances must be finite and nonnegative")
    mean = sum(estimates) / m
    within = sum(variances) / m
    between = sum((q - mean) ** 2 for q in estimates) / (m - 1)
    total = within + (1 + 1 / m) * between
    return {"estimate": mean, "within": within,
            "between": between, "variance": total,
            "standard_error": math.sqrt(total)}


result = pool_estimates([2, 3, 4], [0.25, 0.25, 0.25])
assert result["estimate"] == 3
assert result["between"] == 1
assert abs(result["variance"] - 19 / 12) < 1e-12
assert abs(result["standard_error"] - math.sqrt(19 / 12)) < 1e-12
print({k: round(v, 4) for k, v in result.items()})

# Output:
# {'estimate': 3.0, 'within': 0.25, 'between': 1.0, 'variance': 1.5833, 'standard_error': 1.2583}`,
      walk: [
        { line: "between = sum((q - mean) ** 2 for q in estimates) / (m - 1)", say: "How much the completed analyses disagree: $B = 1$." },
        { line: "total = within + (1 + 1 / m) * between", say: "Total variance $19/12$: much bigger than the within-dataset 0.25." },
      ],
    },
    "1.22.4 Missingness, imputation, and a worked preprocessing contract#0": {
      goal: "Fill, centre and scale with saved training numbers",
      code: r`from math import sqrt
from statistics import median

training = [10.0, None, 14.0, 18.0]
observed = [x for x in training if x is not None]
fill = median(observed)  # 14, computed from training only
complete = [fill if x is None else x for x in training]
center = sum(complete) / len(complete)
scale = sqrt(sum((x - center) ** 2 for x in complete) / len(complete))
assert fill == 14.0 and center == 14.0 and scale > 0

def transform(diameters, fill, center, scale):
    if scale <= 0:
        raise ValueError("training scale must be positive")
    return [((fill if x is None else x) - center) / scale for x in diameters], [int(x is None) for x in diameters]

train_z, train_missing = transform(training, fill, center, scale)
future_z, future_missing = transform([None, 22.0], fill, center, scale)
assert future_z[0] == 0 and future_missing == [1, 0]
assert abs(future_z[1] - 8 / scale) < 1e-12
assert train_missing == [0, 1, 0, 0]
print("fill", fill, "| center", center, "| scale", round(scale, 3))
print("future rows [None, 22]:", [round(z, 3) for z in future_z], "missing flags", future_missing)

# Output:
# fill 14.0 | center 14.0 | scale 2.828
# future rows [None, 22]: [0.0, 2.828] missing flags [1, 0]`,
      walk: [
        { line: "fill = median(observed)  # 14, computed from training only", say: "Learn the fill value from training data." },
        { line: "scale = sqrt(sum((x - center) ** 2 for x in complete) / len(complete))", say: "Learn the spread after filling." },
        { line: "future_z, future_missing = transform([None, 22.0], fill, center, scale)", say: "Future rows reuse the same three numbers." },
      ],
    },
    "1.22.5 Encode categories with a fitted vocabulary and an unseen-value contract#0": {
      goal: "One-hot with explicit \"unseen\" and \"missing\" columns, plus an ordinal tier",
      code: r`train = [
    {'family':'rotary','tier':'low','failed':0},
    {'family':'screw','tier':'medium','failed':1},
    {'family':'rotary','tier':'high','failed':1},
    {'family':None,'tier':None,'failed':0},
    {'family':'screw','tier':'low','failed':0},
    {'family':'rotary','tier':'medium','failed':1},
]
valid = [{'family':'scroll','tier':'medium'},
         {'family':None,'tier':None}]
vocabulary = tuple(sorted({r['family'] for r in train
                           if r['family'] is not None}))
assert vocabulary == ('rotary','screw')
def nominal(row, known):
    value = row['family']
    return tuple(int(value == name) for name in known) + (
        int(value is not None and value not in known),
        int(value is None),
    )
def ordered(row):
    scores = {'low':0.,'medium':1.,'high':2.}
    value = row['tier']
    if value is not None and value not in scores:
        raise ValueError('unrecognized tier: decide its meaning before scoring')
    return (scores.get(value,0.), int(value is None))
def transform(rows):
    return [nominal(row,vocabulary)+ordered(row) for row in rows]

train_X,valid_X = transform(train),transform(valid)
assert len({len(row) for row in train_X+valid_X}) == 1
assert valid_X[0][:4] == (0,0,1,0)  # observed but unseen
assert valid_X[1][:4] == (0,0,0,1)  # absent measurement
assert valid_X[0][-2:] == (1.,0)
assert valid_X[1][-2:] == (0.,1)
for row, x in zip(valid, valid_X):
    print(row, "->", x)

# Output:
# {'family': 'scroll', 'tier': 'medium'} -> (0, 0, 1, 0, 1.0, 0)
# {'family': None, 'tier': None} -> (0, 0, 0, 1, 0.0, 1)`,
      walk: [
        { line: "vocabulary = tuple(sorted({r['family'] for r in train", say: "The category list comes from training rows only." },
        { line: "int(value is not None and value not in known),", say: "A column for \"seen value, but new category\" (scroll)." },
        { line: "int(value is None),", say: "A separate column for \"no value at all\"." },
      ],
    },
    "1.22.5 Encode categories with a fitted vocabulary and an unseen-value contract#1": {
      goal: "Out-of-fold smoothed target encoding",
      code: r`train = [
    {'family':'rotary','tier':'low','failed':0},
    {'family':'screw','tier':'medium','failed':1},
    {'family':'rotary','tier':'high','failed':1},
    {'family':None,'tier':None,'failed':0},
    {'family':'screw','tier':'low','failed':0},
    {'family':'rotary','tier':'medium','failed':1},
]
valid = [{'family':'scroll','tier':'medium'},
         {'family':None,'tier':None}]
vocabulary = tuple(sorted({r['family'] for r in train
                           if r['family'] is not None}))
assert vocabulary == ('rotary','screw')
def nominal(row, known):
    value = row['family']
    return tuple(int(value == name) for name in known) + (
        int(value is not None and value not in known),
        int(value is None),
    )
def ordered(row):
    scores = {'low':0.,'medium':1.,'high':2.}
    value = row['tier']
    if value is not None and value not in scores:
        raise ValueError('unrecognized tier: decide its meaning before scoring')
    return (scores.get(value,0.), int(value is None))
def transform(rows):
    return [nominal(row,vocabulary)+ordered(row) for row in rows]

train_X,valid_X = transform(train),transform(valid)
assert len({len(row) for row in train_X+valid_X}) == 1
assert valid_X[0][:4] == (0,0,1,0)  # observed but unseen
assert valid_X[1][:4] == (0,0,0,1)  # absent measurement
assert valid_X[0][-2:] == (1.,0)
assert valid_X[1][-2:] == (0.,1)

# ---- this step ----
folds = ([0,2,4],[1,3,5])
def smooth_rate(reference, category, m=3):
    prior = sum(r['failed'] for r in reference)/len(reference)
    matches = [r['failed'] for r in reference if r['family']==category]
    return (sum(matches)+m*prior)/(len(matches)+m)
oof = [None]*len(train)
for held in folds:
    reference = [r for j,r in enumerate(train) if j not in held]
    for j in held:
        oof[j] = smooth_rate(reference,train[j]['family'])
assert all(0 <= value <= 1 for value in oof)
assert len(oof)==len(train)
future_unknown = smooth_rate(train,'scroll')
assert future_unknown == sum(r['failed'] for r in train)/len(train)
print("out-of-fold target encodings:", [round(v, 3) for v in oof])
print("unseen family 'scroll' gets the overall rate:", round(future_unknown, 3))

# Output:
# out-of-fold target encodings: [0.75, 0.25, 0.75, 0.333, 0.75, 0.4]
# unseen family 'scroll' gets the overall rate: 0.5`,
      walk: [
        { line: "return (sum(matches)+m*prior)/(len(matches)+m)", say: "Smoothed rate: few rows → close to the overall rate." },
        { line: "reference = [r for j,r in enumerate(train) if j not in held]", say: "Each row's encoding is computed without that row's own label." },
        { line: "future_unknown = smooth_rate(train,'scroll')", say: "An unseen category gets the overall rate, 0.5." },
      ],
    },
    "3.7.3 A small executable schema and grouped test#0": {
      goal: "Schema checks and a grouped pipeline on synthetic cooling units",
      code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.dummy import DummyRegressor
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import GroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

rng=np.random.default_rng(221)
rows=[]
for site in range(15):
    service_type='cooling' if site%2 else 'storage'
    for week in range(4):
        age=8+site%7+week
        alerts=1+site%3+week%2
        observed_age=np.nan if week==2 else float(age)
        next_count=.25*age+1.8*alerts+(service_type=='cooling')
        next_count+=rng.normal(0,.3)
        rows.append((site,week,observed_age,alerts,service_type,next_count))
frame=pd.DataFrame(rows,columns=['site','week','age_months','alerts_7d',
                                  'service_type','next_count'])
assert len(frame)==60 and frame['site'].nunique()==15
assert frame['age_months'].isna().sum()==15
assert (frame['alerts_7d']>=0).all()
assert frame['next_count'].notna().all()

X=frame[['age_months','alerts_7d','service_type']]
y=frame['next_count'].to_numpy()
groups=frame['site'].to_numpy()
num=Pipeline([('fill',SimpleImputer(strategy='median',
                                    add_indicator=True)),
              ('scale',StandardScaler())])
prep=ColumnTransformer([
    ('num',num,['age_months','alerts_7d']),
    ('cat',OneHotEncoder(handle_unknown='ignore'),['service_type'])
])
model=Pipeline([('prep',prep),('ridge',Ridge(alpha=1.))])
errors=[];baselines=[]
for tr,va in GroupKFold(n_splits=5).split(X,y,groups):
    assert not set(groups[tr]).intersection(groups[va])
    model.fit(X.iloc[tr],y[tr])
    base=DummyRegressor(strategy='mean').fit(X.iloc[tr],y[tr])
    errors.append(mean_absolute_error(y[va],model.predict(X.iloc[va])))
    baselines.append(mean_absolute_error(y[va],base.predict(X.iloc[va])))
assert len(errors)==5 and np.all(np.isfinite(errors))
assert np.mean(errors)<np.mean(baselines)
print("model MAE per site fold:   ", np.round(errors, 2))
print("baseline MAE per site fold:", np.round(baselines, 2))

# Output:
# model MAE per site fold:    [0.27 0.26 0.39 0.38 0.42]
# baseline MAE per site fold: [1.39 1.27 1.29 1.7  2.4 ]`,
      walk: [
        { line: "assert frame['age_months'].isna().sum()==15", say: "Schema check: exactly the expected missing ages." },
        { line: "num=Pipeline([('fill',SimpleImputer(strategy='median',", say: "Fill (with a missing flag) and scale the numeric columns." },
        { line: "for tr,va in GroupKFold(n_splits=5).split(X,y,groups):", say: "Whole sites are held out in each fold." },
        { line: "assert np.mean(errors)<np.mean(baselines)", say: "Model MAE about 0.3 versus 1.3–2.4 for the mean baseline." },
      ],
    },
    "3.8.3 Build and check an as-of feature in Python#0": {
      goal: "Count alerts in a 7-day window, as of the issue time",
      code: r`import pandas as pd

inventory=pd.DataFrame({
    'unit_id':['u1','u2'],
    'site_id':['north','south'],
    'age_months':[18,9]
})
alerts=pd.DataFrame({
    'unit_id':['u1','u1','u1','u2'],
    'event_time':pd.to_datetime([
        '2026-03-03 10:00','2026-03-09 16:00',
        '2026-03-09 16:30','2026-03-08 11:00']),
    'ingest_time':pd.to_datetime([
        '2026-03-03 11:00','2026-03-09 16:05',
        '2026-03-09 18:00','2026-03-08 12:00'])
})
issue=pd.Timestamp('2026-03-09 17:00')
window_start=issue-pd.Timedelta(days=7)
eligible=alerts[
    (alerts.event_time>=window_start)&
    (alerts.event_time<issue)&
    (alerts.ingest_time<=issue)
]
counts=eligible.groupby('unit_id').size().rename('alert_count_7d')
assert inventory.unit_id.is_unique
features=inventory.merge(counts,left_on='unit_id',right_index=True,
                         how='left',validate='one_to_one')
features['alert_count_7d']=features['alert_count_7d'].fillna(0).astype(int)
assert features.set_index('unit_id')['alert_count_7d'].to_dict()=={
    'u1':2,'u2':1}
assert len(features)==len(inventory)
print(features)

# Output:
#   unit_id site_id  age_months  alert_count_7d
# 0      u1   north          18               2
# 1      u2   south           9               1`,
      walk: [
        { line: "(alerts.event_time>=window_start)&", say: "Only events in the 7 days before issue…" },
        { line: "(alerts.ingest_time<=issue)", say: "…that had actually arrived by the issue time. The 16:30 alert arrived at 18:00, so it is excluded." },
        { line: "features=inventory.merge(counts,left_on='unit_id',right_index=True,", say: "Join the counts to the unit table." },
        { line: "how='left',validate='one_to_one')", say: "`validate` makes pandas fail if the join would duplicate rows." },
      ],
    },
    "2.26.2 Z scores, robust fences, percentiles, and winsorization#0": {
      goal: "z-score of an outlier and a saved upper cap",
      code: r`from statistics import mean, pstdev

values = [2.0, 3.0, 3.0, 4.0, 28.0]
center = mean(values)
spread = pstdev(values)
z_large = (28.0 - center) / spread
assert center == 8.0
assert 1.9 < z_large < 2.1

training_upper = 12.0  # illustrative saved training-fold threshold
def cap_upper(x):
    return min(x, training_upper)

assert cap_upper(40.0) == cap_upper(13.0) == 12.0
print("mean", center, "| z-score of 28:", round(z_large, 2), "| 40 capped to", cap_upper(40.0))

# Output:
# mean 8.0 | z-score of 28: 2.0 | 40 capped to 12.0`,
      walk: [
        { line: "z_large = (28.0 - center) / spread", say: "The outlier inflates its own yardstick: z is only 2.0." },
        { line: "return min(x, training_upper)", say: "Capping uses a threshold saved from the training fold." },
      ],
    },
    "In Python#0": {
      goal: "A full preprocessing pipeline with ColumnTransformer",
      code: r`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import FunctionTransformer, OneHotEncoder, OrdinalEncoder, StandardScaler

rng = np.random.default_rng(0)
n = 1000
df = pd.DataFrame({
    "age": rng.integers(18, 70, n).astype(float),
    "income": rng.lognormal(10, 1, n),                       # long right tail
    "city": rng.choice(["Mysuru", "Bengaluru", "Pune"], n),
    "room_size": rng.choice(["S", "M", "L"], n),
})
df.loc[rng.random(n) < 0.1, "age"] = np.nan                  # 10% missing ages
df.loc[rng.random(n) < 0.05, "city"] = np.nan                # 5% missing cities
logit = 0.05 * (df["age"].fillna(40) - 40) + 1.0 * (np.log(df["income"]) - 10) \
        + 1.5 * (df["city"] == "Bengaluru") + 1.0 * df["room_size"].map({"S": 0, "M": 1, "L": 2}) - 1.5
y = (rng.random(n) < 1 / (1 + np.exp(-logit))).astype(int)

numeric = make_pipeline(SimpleImputer(strategy="median"), StandardScaler())
skewed = make_pipeline(SimpleImputer(strategy="median"), FunctionTransformer(np.log1p, feature_names_out="one-to-one"), StandardScaler())
nominal = make_pipeline(SimpleImputer(strategy="most_frequent"), OneHotEncoder(handle_unknown="ignore"))
ordinal = OrdinalEncoder(categories=[["S", "M", "L"]])
prep = ColumnTransformer([
    ("num", numeric, ["age"]), ("skew", skewed, ["income"]),
    ("cat", nominal, ["city"]), ("ord", ordinal, ["room_size"])])

model = make_pipeline(prep, LogisticRegression())
print("columns after preparation:", list(prep.fit(df).get_feature_names_out()))
print("CV accuracy, prepared features:", round(cross_val_score(model, df, y, cv=5).mean(), 3))

raw = make_pipeline(ColumnTransformer([("num", SimpleImputer(strategy="median"), ["age", "income"])]),
                    LogisticRegression(max_iter=5000))
print("CV accuracy, raw age and income only:", round(cross_val_score(raw, df, y, cv=5).mean(), 3))

# Output:
# columns after preparation: ['num__age', 'skew__income', 'cat__city_Bengaluru', 'cat__city_Mysuru', 'cat__city_Pune', 'ord__room_size']
# CV accuracy, prepared features: 0.759
# CV accuracy, raw age and income only: 0.661`,
      walk: [
        { line: "skewed = make_pipeline(SimpleImputer(strategy=\"median\"), FunctionTransformer(np.log1p, feature_names_out=\"one-to-one\"), StandardScaler())", say: "Income: fill, take log(1 + x) to tame the long tail, then scale." },
        { line: "nominal = make_pipeline(SimpleImputer(strategy=\"most_frequent\"), OneHotEncoder(handle_unknown=\"ignore\"))", say: "City: fill with the most common city, then one-hot." },
        { line: "ordinal = OrdinalEncoder(categories=[[\"S\", \"M\", \"L\"]])", say: "Room size: give the order explicitly so S < M < L." },
        { line: "(\"cat\", nominal, [\"city\"]), (\"ord\", ordinal, [\"room_size\"])])", say: "`ColumnTransformer` sends each column to its own recipe." },
        { line: "print(\"CV accuracy, raw age and income only:\", round(cross_val_score(raw, df, y, cv=5).mean(), 3))", say: "Prepared features: 0.76 accuracy; raw age and income only: 0.66." },
      ],
    },
  },
};
