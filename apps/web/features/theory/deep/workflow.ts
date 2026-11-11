import type { Deep } from "./types";

const r = String.raw;

export const DEEP_WORKFLOW: Record<string, Deep> = {
  "feature-scaling": {
    explain: [
      { p: "A model only sees numbers, not units. If one column is height in metres (1.5–1.9) and another is income in rupees (20,000–1,20,000), the model sees one column that barely varies and one that varies by a hundred thousand. Any algorithm that adds up differences across features (distances, penalties, gradient steps) will be ruled by the big-number column, whether or not it is more useful." },
      { p: "Three families of model care, for three different reasons. **Distance-based** models (KNN, K-Means, DBSCAN, RBF SVMs) compute distances in which large-range features dominate. **Gradient-based** models (linear/logistic regression with gradient descent, neural networks) get stretched loss surfaces that make descent zig-zag. **Penalised** models (ridge, lasso, SVMs) penalise weight sizes, and weight size depends on units. Trees are immune because each split looks at one feature at a time." },
      { p: "Standardisation does not make data normal (bell-shaped); it only shifts and rescales, so the shape stays the same. A right-skewed income column is still right-skewed after standardisation. If the skew itself is a problem, transform first (log, Box-Cox, Yeo-Johnson via `PowerTransformer`), then standardise." },
      { p: "The fitted numbers (mean, standard deviation, min, max) are **learned from training data** and are part of the model. They must be saved with it and applied unchanged to every future input. Recomputing them on test or production data changes the meaning of the features and silently breaks predictions." },
      {
        table: {
          head: ["Transform", "Formula", "Robust to outliers?", "Output range"],
          rows: [
            ["Standard", "$(x - \\mu)/\\sigma$", "No", "Unbounded, mean 0, sd 1"],
            ["Min–max", "$(x - x_{\\min})/(x_{\\max} - x_{\\min})$", "No", "[0, 1] on training data"],
            ["Robust", "$(x - \\text{median})/\\text{IQR}$", "Yes", "Unbounded"],
            ["Max-abs", "$x/\\max|x|$", "No", "[−1, 1]; keeps sparsity"],
            ["Power (Yeo-Johnson)", "Learned power transform", "Partly", "Roughly normal"],
          ],
        },
      },
      { p: "For sparse data (text counts, one-hot), avoid centring: subtracting the mean turns all the zeros into non-zeros and destroys sparsity. Use `MaxAbsScaler` or `StandardScaler(with_mean=False)` instead." },
    ],
    practice: [
      {
        q: "Training ages: [20, 30, 40, 50, 60]. Standardise age 35 (population sd) and min–max scale age 35 and age 70.",
        solution: [
          { p: "Mean 40, sd $\\sqrt{(400 + 100 + 0 + 100 + 400)/5} = \\sqrt{200} \\approx 14.14$." },
          { math: r`z_{35} = \tfrac{35 - 40}{14.14} \approx -0.354, \qquad \text{minmax}(35) = \tfrac{15}{40} = 0.375, \qquad \text{minmax}(70) = \tfrac{50}{40} = 1.25` },
        ],
      },
      {
        q: "Incomes (₹ thousand): [20, 25, 30, 35, 500]. Compute the standardised and robust-scaled value for 30. Which is more useful?",
        solution: [
          { p: "Mean 122, sd ≈ 188.9, so $z_{30} \\approx -0.49$; the outlier inflates σ and squashes all normal incomes into a narrow band." },
          { p: "Median 30, IQR = Q3 − Q1 = 35 − 25 = 10, so robust value = 0. Normal incomes spread from −1 to 0.5 and the outlier sits far out at 47. Robust scaling keeps the normal values distinguishable." },
        ],
      },
      {
        q: "List which of these need scaling: decision tree, KNN, logistic regression with L2, random forest, neural network, K-Means.",
        solution: [{ p: "Need it: KNN, logistic regression with L2, neural network, K-Means. Do not: decision tree, random forest." }],
      },
    ],
    interview: [
      { q: "Standardisation vs normalisation?", a: "Standardisation (z-score) centres to mean 0 and scales to sd 1; normalisation usually means min–max scaling to [0, 1]. Standardisation is the default; min–max is used when a bounded range is needed. Neither changes the distribution's shape." },
      { q: "Why fit the scaler only on training data?", a: "Fitting on all data lets test-set statistics influence training (leakage), making evaluation optimistic. In production you only have training statistics anyway, so the test should mimic that." },
      { q: "Which algorithms do not need scaling and why?", a: "Tree-based models (decision trees, random forests, gradient boosting), because they split on one feature at a time using thresholds, and rescaling only moves the threshold." },
    ],
    summary: [
      "Scale so no feature dominates because of its units.",
      "Needed for distance-based, gradient-based and penalised models; not for trees.",
      "Standard (default), min–max (bounded), robust (outliers), max-abs (sparse).",
      "Scaling does not change distribution shape; transform skew separately.",
      "Fit on training data only; reuse the same numbers forever.",
    ],
    quiz: [
      { q: "After standardisation, a feature's distribution is:", options: ["Always normal", "The same shape, with mean 0 and sd 1", "Uniform on [0, 1]", "Free of outliers"], answer: 1, why: "It is a shift and a rescale: shape is unchanged." },
      { q: "Which scaler should you use on a sparse TF-IDF matrix?", options: ["StandardScaler with centring", "MaxAbsScaler", "MinMaxScaler with centring", "No scaler can be used"], answer: 1, why: "Max-abs scaling keeps zeros as zeros, preserving sparsity." },
    ],
  },

  "train-test-split": {
    explain: [
      { p: "The whole point of a test set is to simulate the future: data the model has never seen, arriving after all decisions have been made. Every rule about splitting follows from protecting that simulation. If anything about the test data influences training, preprocessing or model choice, the simulation is broken and the score is optimistic." },
      { p: "Leakage is information in the training process that would not be available at prediction time. It is the most common reason a model looks brilliant in a notebook and fails in production. A useful test: for every feature, ask 'at the exact moment I would make this prediction in real life, would I already know this value?' If not, it leaks." },
      { p: "Common leaks in practice: a 'days until account closed' feature when predicting churn; normalising each patient's lab values using statistics from the whole dataset; images of the same person in both train and test (face recognition); removing outliers or selecting features by looking at all the data; and random splits of time-ordered data, where tomorrow's rows help predict yesterday's." },
      { p: "How big should the test set be? Big enough that the score is stable. With 100 test examples, an accuracy of 0.85 has a standard error of about $\\sqrt{0.85 \\times 0.15/100} \\approx 0.036$, so the true value could easily be anywhere from 0.78 to 0.92. With 10,000 examples it is ±0.004. Small datasets therefore lean on cross-validation and use a modest test set." },
      { math: r`\text{SE}(\text{accuracy}) \approx \sqrt{\frac{p(1 - p)}{n_{\text{test}}}}` },
      {
        table: {
          head: ["Dataset size", "Typical approach"],
          rows: [
            ["Hundreds of rows", "Cross-validation for model selection; small test set or nested CV"],
            ["Thousands to hundreds of thousands", "80/20 or 70/15/15 split, CV on the training part"],
            ["Millions", "A small percentage (1–2%) is plenty for validation and test"],
          ],
        },
      },
    ],
    practice: [
      {
        q: "A test set of 400 examples gives accuracy 0.90. Estimate the standard error and a rough 95% interval.",
        solution: [{ math: r`\text{SE} = \sqrt{\tfrac{0.9 \times 0.1}{400}} = 0.015, \qquad 0.90 \pm 2(0.015) = [0.87,\; 0.93]` }],
      },
      {
        q: "Predicting whether a customer will default next month. Which features leak? (a) income at application, (b) number of missed payments next month, (c) number of collection calls received, (d) age.",
        solution: [{ p: "(b) and (c) leak: both are only known after the outcome. (a) and (d) are known at prediction time." }],
      },
      {
        q: "You have daily sales from 2022–2025 and want to forecast 2026. How do you split?",
        solution: [{ p: "By time: train on 2022–2024, validate on early 2025 (or use expanding-window time-series CV), test on the latest months of 2025. Never shuffle: random splits let the model learn from the future." }],
      },
    ],
    interview: [
      { q: "What is data leakage? Give two examples.", a: "When information unavailable at prediction time influences training. Examples: a feature computed from the target or after the outcome (collections calls for default prediction); fitting a scaler or imputer on the full dataset before splitting." },
      { q: "Why do we need both validation and test sets?", a: "The validation set (or CV) is used repeatedly to choose models and hyperparameters, so its score becomes optimistic. The test set is used once at the end for an unbiased estimate." },
      { q: "When is a random split wrong?", a: "With time-ordered data (use a time-based split), with grouped data such as several rows per patient (use group splits), and with strong class imbalance (use stratified splits)." },
    ],
    summary: [
      "Test set = a simulation of the future; touch it once.",
      "Validation / CV for all choices; test for the final number.",
      "Stratify for imbalance; group split for repeated entities; time split for time series.",
      "Leakage: anything not available at prediction time; fit preprocessing inside pipelines.",
      "Small test sets give noisy scores; report uncertainty.",
    ],
    quiz: [
      { q: "Which split is correct for images where each patient has 20 scans?", options: ["Random split by image", "Group split by patient", "Stratified by pixel value", "Train on all, test on all"], answer: 1, why: "Scans of the same patient in both sets let the model recognise the patient rather than the disease." },
      { q: "Quadrupling the test set size changes the standard error of accuracy by a factor of:", options: ["4", "2", "1/2", "1/4"], answer: 2, why: "SE ∝ 1/√n, so 4× the data halves it." },
    ],
  },

  "bias-variance": {
    explain: [
      { p: "Imagine training the same kind of model on many different random training sets from the same source. **Bias** is how far the average of all those models is from the truth: a systematic error that more data of the same kind will not remove. **Variance** is how much the individual models disagree with each other: sensitivity to the particular sample you happened to get. **Noise** is randomness in the targets themselves that no model can predict." },
      { p: "Simple models (a straight line for a curved relationship) have high bias: every training set gives nearly the same wrong line. Complex models (a degree-15 polynomial) have high variance: each training set gives a very different wiggly curve. As complexity rises, bias falls and variance rises, and total error traces a U shape. The bottom of the U is the best complexity for that amount of data." },
      { p: "More data shifts the balance. Variance shrinks as the training set grows (each model sees more of the true pattern and less of any one sample's noise), so bigger datasets can support more complex models. This is why deep networks with millions of parameters work on huge datasets but overfit tiny ones." },
      { p: "A modern twist: very large neural networks sometimes show **double descent**, where test error falls, rises near the point where the model can just barely fit the training data perfectly, and then falls again as the model grows further. Implicit regularisation from gradient descent seems to favour smooth solutions among the many that fit perfectly. The classical U-curve is still the right mental model for most classical algorithms." },
      {
        table: {
          head: ["Technique", "Reduces", "Increases"],
          rows: [
            ["Regularisation (larger λ)", "Variance", "Bias"],
            ["More features / higher degree", "Bias", "Variance"],
            ["More training data", "Variance", "Nothing"],
            ["Bagging (random forest)", "Variance", "Little"],
            ["Boosting", "Bias", "Variance (if overdone)"],
            ["Early stopping / dropout", "Variance", "Bias (a little)"],
          ],
        },
      },
    ],
    practice: [
      {
        q: "Train error 2%, validation error 3%, human-level error 1%. Is the problem bias or variance?",
        solution: [{ p: "Gap to human level (avoidable bias) is 1 point; train–validation gap (variance) is 1 point. Both are small and similar; improving either helps a little. If train error were 8% and validation 9%, it would clearly be bias." }],
      },
      {
        q: "Train error 1%, validation error 15%. Suggest three fixes in order of what you would try.",
        solution: [{ list: ["Add regularisation or simplify the model (lower degree, shallower trees, dropout).", "Get more training data or use augmentation.", "Check for leakage or a mismatch between training and validation data, since a gap this large can also mean the two sets differ."] }],
      },
      {
        q: "A model's expected test MSE at a point is 10, the noise variance is 3 and the variance of the model's prediction is 4. What is the squared bias?",
        solution: [{ math: r`\text{bias}^2 = 10 - 4 - 3 = 3` }],
      },
    ],
    interview: [
      { q: "Explain the bias–variance trade-off.", a: "Error from a model can be split into bias (wrong assumptions, systematic error), variance (sensitivity to the training sample) and irreducible noise. Making a model more flexible lowers bias but raises variance; the best model balances the two for the data available." },
      { q: "How do you tell if a model has high bias or high variance?", a: "Compare training and validation errors. Both high and close: high bias. Training low and validation much higher: high variance. Learning curves (error versus training size) confirm which one more data would fix." },
      { q: "Does more data help a high-bias model?", a: "Not much. A model that cannot represent the pattern will stay wrong. It needs more capacity or better features first." },
    ],
    summary: [
      "Expected error = bias² + variance + noise.",
      "Simple models: high bias. Flexible models: high variance.",
      "Diagnose with train vs validation error and learning curves.",
      "Regularisation, data and bagging lower variance; capacity and boosting lower bias.",
      "Noise sets a floor no model can beat.",
    ],
    quiz: [
      { q: "Which technique primarily reduces bias?", options: ["Stronger regularisation", "Bagging", "Adding polynomial features", "Early stopping"], answer: 2, why: "More flexible features let the model represent patterns it previously could not." },
      { q: "If you collect 10× more data, which component shrinks most?", options: ["Bias", "Variance", "Irreducible noise", "None"], answer: 1, why: "More data makes the fitted model less sensitive to any particular sample." },
    ],
  },

  "cross-validation-tuning": {
    explain: [
      { p: "Cross-validation answers: 'if I trained this exact recipe on similar data, how well would it do on new data, and how much does that vary?' The recipe includes preprocessing, model type and hyperparameters. The answer is an average over several train/validation splits, so it depends much less on luck than a single split." },
      { p: "Each fold's model is thrown away after scoring; CV evaluates the procedure, not a particular fitted model. After choosing the best settings, retrain once on all the training data and evaluate on the test set. `GridSearchCV` does that final refit automatically (`refit=True`)." },
      { p: "Why random search beats grid search in practice: usually only one or two hyperparameters really matter. A 4 × 4 grid tests just 4 distinct values of the important one; 16 random trials test 16 distinct values. Bayesian optimisation goes further by modelling which regions look promising and sampling there, often finding good settings in a few dozen trials." },
      { p: "Selecting the best of many configurations on the same CV folds makes its score optimistic: some configuration will look good partly by luck. **Nested cross-validation** puts the entire search inside an outer CV loop, so each outer fold scores a model whose settings were chosen without seeing that fold. Use it when you need an honest estimate and have no separate test set (common in research and small datasets)." },
      {
        table: {
          head: ["k", "Training share per fold", "Bias of estimate", "Variance / cost"],
          rows: [
            ["3", "67%", "Pessimistic (less data per fit)", "Low cost"],
            ["5", "80%", "Small", "Moderate; common default"],
            ["10", "90%", "Smaller", "Higher cost"],
            ["n (LOO)", "≈100%", "Nearly unbiased", "Very costly, high variance"],
          ],
        },
      },
      { p: "Pick the scoring metric to match the goal (`scoring='f1'`, `'roc_auc'`, `'neg_mean_absolute_error'`). Tuning for accuracy and then reporting recall makes little sense: the search will optimise the wrong thing." },
    ],
    practice: [
      {
        q: "1,000 rows, 5-fold CV. How many rows does each model train on and validate on? How many models are trained?",
        solution: [{ p: "Each fold holds 200 rows: train on 800, validate on 200. 5 models (plus one final refit on all 1,000 if you choose that configuration)." }],
      },
      {
        q: "Model A: CV accuracy 0.871 ± 0.020. Model B: 0.876 ± 0.025. A is 10× faster. Which do you pick?",
        solution: [{ p: "A. The 0.005 difference is far smaller than the fold-to-fold spread, so it is not meaningful, and A is much cheaper." }],
      },
      {
        q: "Nested CV with 5 outer folds, 3 inner folds and 20 random-search candidates. How many fits?",
        solution: [{ math: r`5 \times (20 \times 3 + 1) = 5 \times 61 = 305 \text{ fits (including each outer fold's refit)}` }],
      },
    ],
    interview: [
      { q: "What is k-fold cross-validation?", a: "Split the training data into k folds; train on k − 1 and validate on the remaining one, rotating so each fold is used once for validation; average the k scores (and report their spread)." },
      { q: "Grid search vs random search?", a: "Grid search tries every combination of listed values; random search samples combinations from distributions. For the same budget, random search explores more distinct values of each parameter and usually finds better settings when only a few parameters matter." },
      { q: "What is nested cross-validation and when do you need it?", a: "An outer CV loop for evaluation with the entire hyperparameter search inside each outer training fold. It gives an unbiased estimate of a tuned model's performance when there is no separate test set." },
    ],
    summary: [
      "CV averages scores over k splits: report mean ± std.",
      "Stratified, group and time-series variants match the data structure.",
      "Grid for few parameters; random or Bayesian for more.",
      "Search on log scales; pick the scoring metric that matches the goal.",
      "best_score_ is optimistic; use a test set or nested CV for the final estimate.",
    ],
    quiz: [
      { q: "In 10-fold CV, what fraction of the data trains each fold's model?", options: ["10%", "50%", "90%", "100%"], answer: 2, why: "Nine of ten folds are used for training each time." },
      { q: "After GridSearchCV finds the best parameters, which model makes final predictions by default?", options: ["The best fold's model", "An average of fold models", "A model refitted on all training data with the best parameters", "No model"], answer: 2, why: "With refit=True, it retrains on the full training set." },
    ],
  },

  "feature-engineering": {
    explain: [
      { p: "Feature engineering is encoding what you know about the problem into columns the model can use. A model of delivery time cannot invent 'is it raining' or 'is it a festival day'; you can add them. A model of house prices may struggle with raw latitude and longitude but easily uses 'distance to nearest metro station'. Good features often matter more than the choice of algorithm." },
      { p: "Missing data comes in three kinds, and the kind decides how risky imputation is. **MCAR** (missing completely at random): a sensor randomly drops readings; simple imputation is fine. **MAR** (missing at random given other columns): older users skip a question more often; impute using those other columns. **MNAR** (missing not at random): people with high income refuse to state it; the missingness itself carries information, so add a 'was missing' indicator." },
      { p: "Encoding must match what the category means. One-hot treats every category as unrelated and equally different. Ordinal encoding imposes an order and equal spacing, right for S/M/L but wrong for cities. Target encoding replaces each category with the average target for that category, compact and powerful for high-cardinality columns, but it peeks at the target, so it must be computed out-of-fold and usually smoothed toward the overall mean for rare categories." },
      { math: r`\text{smoothed TE}(c) = \frac{n_c\,\bar{y}_c + m\,\bar{y}}{n_c + m}` },
      { p: "Here $n_c$ is the number of rows in category $c$, $\\bar{y}_c$ its mean target, $\\bar{y}$ the global mean and $m$ a smoothing strength. Rare categories are pulled toward the global mean, so one lucky row cannot give a category an extreme value." },
      {
        table: {
          head: ["Data type", "Useful engineered features"],
          rows: [
            ["Dates / times", "Hour, weekday, month, holiday flag, days since last event, cyclical sin/cos of hour"],
            ["Text", "Length, word counts, TF-IDF, sentence embeddings"],
            ["Locations", "Distances to landmarks, region clusters"],
            ["Transactions", "Counts, sums and averages over windows (last 7/30 days)"],
            ["Numeric pairs", "Ratios, differences, products"],
          ],
        },
      },
      { p: "Cyclical features need care: hour 23 and hour 0 are close, but as numbers they are 23 apart. Encode them as $\\sin(2\\pi h/24)$ and $\\cos(2\\pi h/24)$ so the model sees a circle." },
    ],
    practice: [
      {
        q: "One-hot encode colour for rows [red, blue, red, green] with columns in the order [blue, green, red].",
        solution: [{ p: "red → [0, 0, 1]; blue → [1, 0, 0]; red → [0, 0, 1]; green → [0, 1, 0]." }],
      },
      {
        q: "Smoothed target encoding: global default rate 0.10, m = 10. City A: 200 rows, rate 0.15. City B: 2 rows, rate 0.50. Compute both encodings.",
        solution: [
          { math: r`A: \frac{200(0.15) + 10(0.10)}{210} = \frac{31}{210} \approx 0.148, \qquad B: \frac{2(0.50) + 10(0.10)}{12} = \frac{2}{12} \approx 0.167` },
          { p: "City B's extreme raw rate (based on 2 rows) is pulled strongly toward the global mean; City A barely changes." },
        ],
      },
      {
        q: "Encode hour = 6 and hour = 18 as (sin, cos) of $2\\pi h/24$.",
        solution: [{ p: "6 → angle π/2 → (1, 0). 18 → angle 3π/2 → (−1, 0). And 0 → (0, 1), 12 → (0, −1): opposite times of day sit opposite on the circle." }],
      },
    ],
    interview: [
      { q: "How do you handle missing values?", a: "First understand why values are missing. Then drop (if few and random), impute with median/mode or a model, and add a missing-indicator when missingness may be informative. Always fit imputers on training data only." },
      { q: "One-hot vs label (ordinal) encoding?", a: "One-hot for nominal categories without order, especially for linear models; ordinal for categories with a real order. Label-encoding nominal categories invents a fake order, though tree models tolerate it better." },
      { q: "What is target encoding and its risk?", a: "Replacing a category with the mean target for that category. Risk: leakage and overfitting, especially for rare categories. Mitigate with out-of-fold computation and smoothing toward the global mean." },
    ],
    summary: [
      "Encode domain knowledge as features; it often beats changing algorithms.",
      "Missing data: understand MCAR/MAR/MNAR; impute and consider indicators.",
      "One-hot (nominal), ordinal (ordered), target/frequency (high cardinality).",
      "Logs for skew, sin/cos for cycles, ratios and windows for behaviour.",
      "Fit every transformation on training data inside a pipeline.",
    ],
    quiz: [
      { q: "Income is often missing for high earners who refuse to share it. This is:", options: ["MCAR", "MAR", "MNAR", "Not missing data"], answer: 2, why: "Missingness depends on the missing value itself." },
      { q: "Why encode hour of day with sin and cos?", options: ["To scale it to [0, 1]", "So 23:00 and 00:00 are close to each other", "To remove outliers", "Because models cannot read integers"], answer: 1, why: "A circle captures the wrap-around that a plain number misses." },
    ],
  },

  "imbalanced-data": {
    explain: [
      { p: "Imbalance is a problem mainly because standard training optimises average performance over all rows. If 99 out of 100 rows are negative, the cheapest way to lower average loss is to get negatives right and largely ignore positives. The model is doing exactly what it was asked; it was asked the wrong question." },
      { p: "Often the model's **ranking** is fine and only the threshold is wrong. A model can give all frauds higher scores than most normal transactions, yet if those scores are 0.2–0.4, a 0.5 threshold flags none of them. Before resampling, check PR-AUC or ROC-AUC: if they are good, simply moving the threshold may solve the problem." },
      { p: "Class weights and resampling are two ways to say the same thing: 'mistakes on the rare class matter more'. Class weights do it inside the loss without changing the data. Oversampling repeats or synthesises minority rows; undersampling removes majority rows. Weights are usually the first thing to try because they are simple, deterministic and do not distort the dataset. Note that both shift predicted probabilities upward; if you need calibrated probabilities, recalibrate afterwards." },
      { p: "SMOTE generates synthetic points along lines between nearby minority points. It helps some models, but it can create unrealistic points in regions overlapping the majority class, and it never adds genuinely new information. **Collecting more minority examples** (or better features that separate them) usually beats any resampling trick." },
      {
        table: {
          head: ["Approach", "Pros", "Cons"],
          rows: [
            ["Threshold moving", "No retraining; uses the model's ranking", "Needs a validation set to choose"],
            ["Class weights", "Simple; no data change", "Probabilities shift; not all models support it"],
            ["Random oversampling", "Easy", "Exact duplicates can cause overfitting"],
            ["SMOTE", "Synthetic variety", "Can create noise near class overlap"],
            ["Undersampling", "Faster training", "Throws away data"],
            ["Anomaly detection", "Works with very few positives", "Different problem framing"],
          ],
        },
      },
      { p: "With extreme imbalance (one positive in 10,000), it can help to reframe the task as anomaly detection: learn what normal looks like (isolation forest, one-class SVM, autoencoders) and flag anything unusual, rather than trying to learn the rare class from a handful of examples." },
    ],
    practice: [
      {
        q: "5,000 rows: 4,750 class 0 and 250 class 1. Compute balanced class weights.",
        solution: [{ math: r`w_0 = \frac{5000}{2 \times 4750} \approx 0.526, \qquad w_1 = \frac{5000}{2 \times 250} = 10` }],
      },
      {
        q: "Minority point (2, 3) and its minority neighbour (4, 7). SMOTE draws λ = 0.25. What is the synthetic point?",
        solution: [{ math: r`(2, 3) + 0.25\big((4, 7) - (2, 3)\big) = (2, 3) + (0.5, 1) = (2.5, 4)` }],
      },
      {
        q: "On validation data, thresholds give (precision, recall): 0.5 → (0.80, 0.40), 0.3 → (0.62, 0.71), 0.2 → (0.45, 0.85), 0.1 → (0.25, 0.95). The business needs recall ≥ 0.8 with the best possible precision. Which threshold?",
        solution: [{ p: "Thresholds meeting recall ≥ 0.8: 0.2 (precision 0.45) and 0.1 (0.25). Choose 0.2 for the higher precision." }],
      },
    ],
    interview: [
      { q: "How do you deal with imbalanced classes?", a: "Use appropriate metrics (precision, recall, F1, PR-AUC), stratified splits, class weights or resampling inside the training folds, and tune the decision threshold on validation data. Collect more minority data or better features where possible." },
      { q: "Why is SMOTE applied only to training data?", a: "Synthetic points derived from test rows would leak test information into training, and evaluating on balanced synthetic data would not reflect the real class ratio the model faces." },
      { q: "Would you balance the test set?", a: "No. The test set should have the real-world class ratio so precision and other metrics reflect what will happen in production." },
    ],
    summary: [
      "Accuracy misleads; use precision, recall, F1 and PR-AUC.",
      "Check ranking quality first; threshold moving may be enough.",
      "Class weights $n/(K n_k)$ are the simplest training fix.",
      "Resample (SMOTE, under/oversampling) only inside training folds.",
      "Keep validation and test at the real class ratio.",
    ],
    quiz: [
      { q: "A model's ROC-AUC is 0.95 but it flags no positives at threshold 0.5. The quickest fix is:", options: ["Collect new data", "Lower the decision threshold", "Switch to K-Means", "Remove the minority class"], answer: 1, why: "The ranking is good; the probabilities just sit below 0.5 for positives." },
      { q: "Class weighting tends to make predicted probabilities for the minority class:", options: ["Lower", "Higher than the true rate", "Perfectly calibrated", "Unchanged"], answer: 1, why: "Upweighting the minority pushes its scores up; recalibrate if you need true probabilities." },
    ],
  },
};
