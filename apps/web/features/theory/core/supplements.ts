import type { Section, TheoryTopic } from "../topics";

const r = String.raw;

/**
 * Extra step-by-step sections for existing topics, filling concepts they did not yet cover.
 * Inserted just before each topic's "In Python" section.
 */
export const SUPPLEMENTS: Record<string, Section[]> = {
  "logistic-regression": [
    {
      heading: "Reading a coefficient: odds ratios, step by step",
      blocks: [
        { p: "A weight in linear regression adds a fixed amount to the prediction. A weight in logistic regression does not add a fixed amount to the **probability**. We build up what it does in three steps." },
        {
          steps: [
            { title: "The weight adds to the log-odds", body: "Raising feature $x_j$ by 1 (others fixed) adds $\\beta_j$ to the log-odds:", math: r`\ln\frac{p}{1-p} \;\longrightarrow\; \ln\frac{p}{1-p} + \beta_j` },
            { title: "So it multiplies the odds", body: "Exponentiate both sides: the odds are multiplied by $e^{\\beta_j}$, the **odds ratio**.", math: r`\frac{p}{1-p} \;\longrightarrow\; \frac{p}{1-p}\cdot e^{\beta_j}` },
            { title: "Same odds ratio, different probability change", body: "Take $\\beta_j = \\ln 2$ (odds double). Starting at p = 0.2 (odds 0.25): odds become 0.5, so p = 1/3, a rise of 0.133. Starting at p = 0.8 (odds 4): odds become 8, so p = 8/9 ≈ 0.889, a rise of only 0.089." },
            { title: "Read it", body: "Say \"each extra unit doubles the odds\", not \"adds 13 percentage points\". The probability change depends on where you start, and it is largest near p = 0.5." },
          ],
        },
      ],
    },
    {
      heading: "Where the loss comes from: maximum likelihood and deviance",
      blocks: [
        { p: "Why cross-entropy and not squared error? Treat each label as a coin flip with probability $p_i$. The probability of seeing exactly the labels we observed is the **likelihood**:" },
        { math: r`\mathcal L = \prod_i p_i^{\,y_i}(1 - p_i)^{1 - y_i}` },
        { p: "(For a 1 the factor is $p_i$; for a 0 it is $1 - p_i$.) Products of many small numbers underflow, so take the log, and flip the sign so we can minimise:" },
        { math: r`-\ln\mathcal L = -\sum_i \big[y_i\ln p_i + (1 - y_i)\ln(1 - p_i)\big]` },
        { p: "That is exactly the cross-entropy loss: **minimising cross-entropy = maximising likelihood**. Its gradient is $X^\\top(\\mathbf p - \\mathbf y)$, and it is convex, unlike squared error pushed through a sigmoid." },
        { p: "Statisticians report **deviance** $= -2\\ln\\mathcal L$. Example: labels (1, 0) with predicted probabilities (0.8, 0.25) give $-\\ln 0.8 - \\ln 0.75 \\approx 0.223 + 0.288 = 0.511$, so the deviance is about 1.02. Comparing the deviance of a model with and without a feature gives the likelihood-ratio test of whether that feature helps." },
      ],
    },
  ],
  "classification-metrics": [
    {
      heading: "When accuracy lies: balanced accuracy and MCC",
      blocks: [
        { p: "1,000 card transactions, 10 of them fraud. Build the metrics up from the confusion matrix in steps." },
        {
          steps: [
            { title: "The lazy model", body: "Predict \"legit\" for everything: TP = 0, FN = 10, FP = 0, TN = 990. Accuracy = 99%, yet it catches no fraud at all." },
            { title: "A useful model", body: "TP = 8, FN = 2, FP = 40, TN = 950. Accuracy = 958/1000 = 95.8%, lower than the lazy model even though it is far more useful. Accuracy is dominated by the 990 legit rows." },
            { title: "Balanced accuracy", body: "Average the recall of each class, so each class counts equally. Lazy model: (0 + 1)/2 = 0.5. Useful model: (0.8 + 0.960)/2 ≈ 0.88.", math: r`\text{balanced acc} = \tfrac12\left(\frac{TP}{TP + FN} + \frac{TN}{TN + FP}\right)` },
            { title: "Matthews correlation coefficient", body: "Uses all four cells; ranges from −1 (always wrong) through 0 (no better than chance) to +1 (perfect). Lazy model: 0. Useful model:", math: r`\text{MCC} = \frac{TP\cdot TN - FP\cdot FN}{\sqrt{(TP{+}FP)(TP{+}FN)(TN{+}FP)(TN{+}FN)}} = \frac{8\cdot 950 - 40\cdot 2}{\sqrt{48 \cdot 10 \cdot 990 \cdot 952}} \approx 0.35` },
            { title: "Read them together", body: "Precision is only 8/48 ≈ 0.17 (5 of 6 alerts are false alarms) and F1 ≈ 0.28. MCC 0.35 says: clearly better than chance, far from perfect. With rare positives, report recall, precision, MCC or balanced accuracy, and the ROC/PR curves, never accuracy alone." },
          ],
        },
      ],
    },
  ],
  "decision-trees": [
    {
      heading: "Which features matter? Two kinds of importance",
      blocks: [
        { p: "`tree.feature_importances_` is tempting, but it measures something specific. Build the idea in two steps." },
        { p: "**Step 1, impurity importance.** Add up how much each feature's splits reduced impurity (Gini or entropy) during training. It is free to compute, but it is measured on the **training** data and it is biased towards features with many distinct values: a unique row ID can be split on endlessly and look important while being useless." },
        { p: "**Step 2, permutation importance.** On **held-out** data, shuffle one feature's column (destroying its link to the target) and measure how much the score drops. A useless feature gives a drop of about 0. It costs more to compute, but it answers the question you actually care about: does the model rely on this feature to predict new data?" },
        { code: r`import numpy as np
from sklearn.datasets import make_classification
from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1000, n_features=2, n_informative=2, n_redundant=0, flip_y=0.1, random_state=1)
rng = np.random.default_rng(0)
row_id = rng.permutation(len(X)).reshape(-1, 1)          # a useless, unique-per-row "ID" column
noise = rng.normal(size=(len(X), 1))                       # pure noise
X = np.hstack([X, noise, row_id])
names = ["signal_1", "signal_2", "noise", "row_id"]

X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
forest = RandomForestClassifier(n_estimators=200, random_state=0).fit(X_tr, y_tr)

perm = permutation_importance(forest, X_te, y_te, n_repeats=20, random_state=0)
print(f"{'feature':<10} {'impurity':>9} {'permutation (test)':>19}")
for n, imp, p in zip(names, forest.feature_importances_, perm.importances_mean):
    print(f"{n:<10} {imp:9.3f} {p:19.3f}")

# Output:
# feature     impurity  permutation (test)
# signal_1       0.591               0.319
# signal_2       0.168               0.035
# noise          0.119               0.001
# row_id         0.122              -0.002` },
        { p: "The pure-noise column and the row ID each get about 12% impurity importance, but permutation importance correctly gives them about 0. Use permutation importance (or SHAP) for reporting. Remember also that correlated features share importance, and that importance is not causation." },
      ],
    },
  ],
};

/** Inserts supplement sections before "In Python" (or before "Common mistakes" if there is no Python section). */
export function applySupplements(t: TheoryTopic): TheoryTopic {
  const extra = SUPPLEMENTS[t.slug];
  if (!extra) return t;
  const anchor = t.sections.findIndex((s) => s.heading === "In Python");
  const mistakes = t.sections.findIndex((s) => s.heading === "Common mistakes");
  const at = anchor >= 0 ? anchor : mistakes >= 0 ? mistakes : t.sections.length;
  return { ...t, sections: [...t.sections.slice(0, at), ...extra, ...t.sections.slice(at)] };
}
