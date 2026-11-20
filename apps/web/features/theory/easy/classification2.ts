import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Classification Metrics. */
export const CMETRICS: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Every classification metric is built from four counts: correct alarms (TP), false alarms (FP), misses (FN) and correct all-clears (TN). Different metrics divide them differently, because different mistakes cost different things.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Why 99% accuracy can be useless",
          blocks: [
            { p: "1% of transactions are fraud. A model that says \"not fraud\" every time is 99% accurate and catches zero fraud. Accuracy rewards it for the 99 easy cases and ignores the one that matters." },
          ],
        },
      ],
    },
    "The confusion matrix": {
      examples: [
        {
          title: "Fill in the table",
          blocks: [
            { p: "A covid test on 100 people: 10 are infected. The test flags 12 people, 8 of them infected." },
            { table: { head: ["", "Flagged", "Not flagged"], rows: [["Infected", "TP = 8", "FN = 2"], ["Healthy", "FP = 4", "TN = 86"]] } },
            { p: "Precision $= 8/12 = 0.67$, recall $= 8/10 = 0.8$, specificity $= 86/90 = 0.96$, accuracy $= 94/100 = 0.94$." },
          ],
        },
      ],
    },
    "Thresholds, ROC and PR curves": {
      examples: [
        {
          title: "One model, three thresholds",
          blocks: [
            { table: { head: ["Threshold", "Recall", "Precision"], rows: [["0.5", "0.887", "0.979"], ["0.3", "0.962", "0.927"], ["0.1", "1.000", "0.779"]] } },
            { p: "From the logistic-regression code on the breast-cancer data: lowering the threshold catches more malignant tumours but raises false alarms. The ROC and PR curves show every threshold at once." },
          ],
        },
      ],
    },
    "Multiclass averaging": {
      examples: [
        {
          title: "Macro versus weighted",
          blocks: [
            { p: "Class A (90 examples) has F1 0.95; class B (10 examples) has F1 0.40. Macro average: $(0.95 + 0.40)/2 = 0.675$. Weighted average: $(90 \\times 0.95 + 10 \\times 0.40)/100 = 0.895$. Macro exposes the weak rare class; weighted hides it." },
          ],
        },
      ],
    },
    "1.2.6 Classification metrics when incidents are rare": {
      plain: "Evaluate a classifier where its output becomes an action. Precision asks \"of what we flagged, how much was real?\"; recall asks \"of what was real, how much did we flag?\".",
      replace: {
        1: { p: "Precision $= TP/(TP + FP)$ estimates the fraction of selected trips that experienced an incident. Recall, also called sensitivity or true-positive rate, is $TP/(TP + FN)$, the fraction of incidents selected. Specificity $= TN/(TN + FP)$ is the fraction of non-incident trips not selected. The false-positive rate $FP/(FP + TN)$ equals $1 - $ specificity. If a denominator is zero, the corresponding ratio is undefined under its elementary formula; choose and document a reporting convention rather than quietly substituting zero." },
        3: { p: "The $F_1$ score is the harmonic mean of precision $P$ and recall $R$: $F_1 = 2PR/(P + R) = 2TP/(2TP + FP + FN)$ when defined. The $F_\\beta$ family gives recall $\\beta$ times as much relative emphasis through $F_\\beta = (1 + \\beta^2)PR/(\\beta^2P + R)$. Choosing $\\beta$ is a statement about priorities, not something an algorithm can determine from labels alone. If the actual decision is limited to five inspections per day, also measure incident capture at five and the number of days with more than five candidate trips." },
      },
      examples: [
        {
          at: 3,
          title: "F1 versus F2",
          blocks: [
            { p: "With precision 0.30 and recall 0.60: $F_1 = 2(0.3)(0.6)/0.9 = 0.40$; $F_2 = 5(0.3)(0.6)/(4 \\times 0.3 + 0.6) = 0.9/1.8 = 0.50$. $F_2$ is higher because it weights recall more, and recall is this model's stronger side." },
          ],
        },
      ],
    },
    "2.2.2 Read a confusion matrix before a single score": {
      plain: "Always look at the four counts before quoting a single number. A trivial model that flags nothing can still score high accuracy.",
      examples: [
        {
          at: 1,
          title: "The do-nothing baseline",
          blocks: [
            { p: "Same 200 boxes, 20 truly fill. Flag nothing: TP = 0, FP = 0, FN = 20, TN = 180. Accuracy 0.90, higher than the real policy's 0.825, yet recall is 0. This is why accuracy alone is not enough." },
          ],
        },
      ],
    },
    "2.2.3 ROC curves, precision-recall curves, and ranking": {
      plain: "AUC is the chance that a random positive is scored above a random negative. A PR curve shows how precision falls as you catch more positives, which matters most when positives are rare.",
    },
    "2.2.4 Calibration and a cost-aware threshold": {
      plain: "A probability of 0.2 should come true about 20% of the time. If it does, you can pick the threshold from costs: act when probability × cost of a miss exceeds the cost of acting.",
    },
    "2.2.6 Derive a ROC curve from ranked inspection scores": {
      plain: "Sort cases by score and walk down the list: every positive moves the curve up, every negative moves it right.",
    },
    "2.1.5 Error analysis by group, time, and operational risk": {
      plain: "An average score can rise while the errors that matter most get worse. Break results down by class, group and time, and show the counts behind each rate.",
    },
  },
  code: {
    "2.2.2 Read a confusion matrix before a single score#0": {
      goal: "Precision, recall, specificity and F1 from the four counts",
      code: r`from math import isclose
tp, fp, fn, tn = 15, 30, 5, 150
precision, recall = tp / (tp + fp), tp / (tp + fn)
specificity = tn / (tn + fp)
f1 = 2 * precision * recall / (precision + recall)
assert isclose(precision, 1 / 3)
assert isclose(recall, 3 / 4)
assert isclose(specificity, 5 / 6)
assert isclose(f1, 6 / 13)
print(f"precision {precision:.3f} | recall {recall:.3f} | specificity {specificity:.3f} | F1 {f1:.4f}")

# Output:
# precision 0.333 | recall 0.750 | specificity 0.833 | F1 0.4615`,
      walk: [
        { line: "precision, recall = tp / (tp + fp), tp / (tp + fn)", say: "Precision divides by everything flagged; recall divides by everything actually positive." },
        { line: "specificity = tn / (tn + fp)", say: "Specificity: the share of negatives correctly left alone." },
        { line: "f1 = 2 * precision * recall / (precision + recall)", say: "F1, the harmonic mean: low if either precision or recall is low." },
      ],
    },
    "2.2.3 ROC curves, precision-recall curves, and ranking#0": {
      goal: "AUC as the share of correctly ordered positive-negative pairs",
      code: r`positives = [0.9, 0.6]
negatives = [0.8, 0.2]
auc = sum(1.0 if p > n else 0.5 if p == n else 0.0
          for p in positives for n in negatives) / 4
assert auc == 0.75
print("pairwise AUC:", auc)

# Output:
# pairwise AUC: 0.75`,
      walk: [
        { line: "auc = sum(1.0 if p > n else 0.5 if p == n else 0.0", say: "Score 1 for each pair where the positive outranks the negative, ½ for a tie." },
        { line: "for p in positives for n in negatives) / 4", say: "Average over all 2 × 2 = 4 pairs: 3/4 = 0.75." },
      ],
    },
    "In Python#0": {
      goal: "Confusion matrix, classification report, ROC AUC and average precision",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score, average_precision_score

X, y = load_breast_cancer(return_X_y=True)
y = 1 - y                                             # 1 = malignant
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(C=0.05)).fit(X_train, y_train)

y_pred = model.predict(X_test)
tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
print(f"TN={tn} FP={fp} FN={fn} TP={tp}")
print(classification_report(y_test, y_pred, digits=3, target_names=["benign", "malignant"]))

scores = model.predict_proba(X_test)[:, 1]
print("ROC AUC:", round(roc_auc_score(y_test, scores), 3), "| average precision:", round(average_precision_score(y_test, scores), 3))

# Output:
# TN=89 FP=1 FN=6 TP=47
#               precision    recall  f1-score   support
# 
#       benign      0.937     0.989     0.962        90
#    malignant      0.979     0.887     0.931        53
# 
#     accuracy                          0.951       143
#    macro avg      0.958     0.938     0.946       143
# weighted avg      0.953     0.951     0.950       143
# 
# ROC AUC: 0.996 | average precision: 0.993`,
      walk: [
        { line: "tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()", say: "scikit-learn's confusion matrix is [[TN, FP], [FN, TP]]; `ravel()` unpacks it." },
        { line: "print(classification_report(y_test, y_pred, digits=3, target_names=[\"benign\", \"malignant\"]))", say: "Precision, recall and F1 for each class, plus macro and weighted averages." },
        { line: "scores = model.predict_proba(X_test)[:, 1]", say: "AUC and average precision need scores, not hard labels." },
      ],
    },
  },
};

/** Easy layer: ROC, AUC & Calibration. */
export const ROC: EasyTopic = {
  sections: {
    "Step 1: one threshold, one confusion matrix": {
      examples: [
        {
          title: "Move the threshold, change the counts",
          blocks: [
            { p: "Same eight alerts. At threshold 0.70, three are flagged (0.92, 0.79, 0.74): TP = 2, FP = 1, FN = 1, TN = 4, so TPR = 0.67 and FPR = 0.2. At 0.50 it was TPR = 1.0 and FPR = 0.4. Each threshold is one point on the ROC curve." },
          ],
        },
      ],
    },
    "Step 4: when positives are rare, use precision–recall": {
      examples: [
        {
          title: "Same test, rarer disease",
          blocks: [
            { p: "TPR 0.9 and FPR 0.05 at a threshold. With 10% prevalence (out of 1,000: 100 sick): TP = 90, FP = 45, precision 0.67. With 1% prevalence (10 sick): TP = 9, FP = 49.5, precision 0.15. The ROC point did not move; precision collapsed." },
          ],
        },
      ],
    },
    "Step 5: choosing the threshold from costs": {
      examples: [
        {
          title: "Threshold from two costs",
          blocks: [
            { p: "A false alarm costs ₹500 of staff time; a missed fault costs ₹5,000. Act when $p \\times 5000 > (1 - p) \\times 500$, i.e. $p > 500/5500 = 0.091$. If misses cost ₹50,000, the threshold drops to $500/50{,}500 \\approx 0.01$." },
          ],
        },
      ],
    },
    "Step 6: calibration, can the probabilities be trusted?": {
      code: [
        {
          goal: "Check calibration with a reliability table, then fix it with isotonic calibration",
          code: r`import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import brier_score_loss, roc_auc_score

X, y = make_classification(n_samples=6000, n_features=20, n_informative=6, random_state=0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.5, random_state=0)

raw = GaussianNB().fit(X_train, y_train)                                   # tends to be overconfident
calibrated = CalibratedClassifierCV(GaussianNB(), method="isotonic", cv=5).fit(X_train, y_train)

def reliability(p, y, bins=(0, 0.2, 0.4, 0.6, 0.8, 1.0)):
    rows = []
    for lo, hi in zip(bins[:-1], bins[1:]):
        m = (p >= lo) & (p < hi if hi < 1 else p <= hi)
        if m.sum():
            rows.append(f"[{lo:.1f},{hi:.1f}) n={m.sum():4d} mean forecast {p[m].mean():.2f} observed {y[m].mean():.2f}")
    return rows

for name, model in (("raw naive Bayes", raw), ("isotonic-calibrated", calibrated)):
    p = model.predict_proba(X_test)[:, 1]
    print(f"{name}: AUC {roc_auc_score(y_test, p):.3f}, Brier {brier_score_loss(y_test, p):.3f}")
    for row in reliability(p, y_test):
        print("   ", row)

# Output:
# raw naive Bayes: AUC 0.925, Brier 0.117
#     [0.0,0.2) n=1193 mean forecast 0.03 observed 0.08
#     [0.2,0.4) n= 197 mean forecast 0.30 observed 0.41
#     [0.4,0.6) n= 181 mean forecast 0.51 observed 0.45
#     [0.6,0.8) n= 219 mean forecast 0.71 observed 0.62
#     [0.8,1.0) n=1210 mean forecast 0.96 observed 0.89
# isotonic-calibrated: AUC 0.925, Brier 0.111
#     [0.0,0.2) n=1036 mean forecast 0.07 observed 0.06
#     [0.2,0.4) n= 347 mean forecast 0.29 observed 0.33
#     [0.4,0.6) n= 305 mean forecast 0.51 observed 0.52
#     [0.6,0.8) n= 369 mean forecast 0.70 observed 0.67
#     [0.8,1.0) n= 943 mean forecast 0.96 observed 0.95`,
          walk: [
            { line: "raw = GaussianNB().fit(X_train, y_train)                                   # tends to be overconfident", say: "Naive Bayes ranks well but pushes probabilities towards 0 and 1." },
            { line: "calibrated = CalibratedClassifierCV(GaussianNB(), method=\"isotonic\", cv=5).fit(X_train, y_train)", say: "Learn a monotone correction from out-of-fold predictions." },
            { line: "rows.append(f\"[{lo:.1f},{hi:.1f}) n={m.sum():4d} mean forecast {p[m].mean():.2f} observed {y[m].mean():.2f}\")", say: "For each band of forecasts, compare the average forecast with how often the event actually happened." },
            { line: "print(f\"{name}: AUC {roc_auc_score(y_test, p):.3f}, Brier {brier_score_loss(y_test, p):.3f}\")", say: "Calibration leaves AUC unchanged (the ranking is the same) but lowers the Brier score: in the 0.8–1.0 band, forecasts of 0.96 now come true 95% of the time instead of 89%." },
          ],
        },
      ],
    },
    "Textbook case: Ranking, Probability, and Inspection Decisions": {
      plain: "Water-meter alerts: the crew needs a ranking (which to visit first) and honest probabilities (how many leaks to expect). These are different properties, checked differently.",
    },
    "2.3.1 Build the decision table": {
      plain: "Pick a threshold, sort every alert into TP, FP, FN or TN, and every metric follows from those four counts.",
    },
    "2.3.2 Understand ROC AUC by enumerating pairs": {
      plain: "Pair every leak with every non-leak and count how often the leak scored higher. That share is the AUC.",
      examples: [
        {
          at: 1,
          title: "Counting the 15 pairs",
          blocks: [
            { table: { head: ["Leak score", "Beats non-leaks (0.79, 0.58, 0.44, 0.23, 0.12)", "Wins"], rows: [["0.92", "all five", "5"], ["0.74", "0.58, 0.44, 0.23, 0.12", "4"], ["0.51", "0.44, 0.23, 0.12", "3"]] } },
            { p: "$5 + 4 + 3 = 12$ wins out of 15 pairs: AUC $= 0.8$." },
          ],
        },
      ],
    },
    "2.3.3 Derive prevalence-sensitive precision": {
      plain: "Precision depends on how common positives are. The derivation shows exactly how, using Bayes' rule.",
    },
    "2.3.4 Make the action rule explicit": {
      plain: "Act when the expected saving beats the cost of acting. With limited capacity, rank by expected net value and take the top ones.",
      replace: {
        0: { p: "If inspecting costs $C_I$ and a successful intervention avoids loss $C_M$ when a leak exists, a calibrated probability $p$ supports inspection when $pC_M > C_I$, assuming certain prevention and no other consequences. With effectiveness $q$, use $pqC_M > C_I$. At costs 12 and 120, $q = 1$ gives threshold 0.1. If six cases exceed that threshold but only three can be visited, take up to three with the highest positive net expected values $p_iq_iC_{M,i} - C_{I,i}$. Probability ranking is equivalent only when costs and effectiveness are constant. Travel constraints can turn the problem into route optimization." },
      },
      examples: [
        {
          at: 0,
          title: "Rank by net value",
          blocks: [
            { table: { head: ["Meter", "$p$", "Loss avoided", "Net value $p \\times C_M - 12$"], rows: [["A", "0.6", "120", "60"], ["B", "0.3", "400", "108"], ["C", "0.8", "50", "28"]] } },
            { p: "By probability alone the order is C, A, B. By expected net value it is B, A, C: meter B has a lower chance of a leak, but its leak would be expensive." },
          ],
        },
      ],
    },
    "2.3.5 Distinguish calibration from ranking": {
      plain: "Ranking: do positives score higher than negatives? Calibration: do the numbers mean what they say? A model can do one well and the other badly.",
      replace: {
        0: { p: "Calibration asks whether cases assigned probabilities near 0.2 experience events around 20% of the time in a representative population. A reliability plot compares mean forecasts with observed fractions in bins; show denominators and uncertainty. The Brier score is the mean squared probability error, $\\operatorname{mean}[(p - y)^2]$. Log loss is $\\operatorname{mean}[-y\\log p - (1 - y)\\log(1 - p)]$. For a positive case, probability 0.8 contributes 0.04 to Brier and about 0.223 to log loss; probability 0.01 contributes 0.9801 and about 4.605. Both scores combine calibration and discrimination properties; neither is a standalone calibration guarantee." },
      },
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Great ranking, useless probabilities",
          blocks: [
            { p: "Take a well-calibrated model and divide every probability by 10. The order of cases is unchanged, so the AUC is exactly the same, but every \"0.3\" now reads \"0.03\". Anyone planning staff from those numbers would expect ten times too few leaks." },
          ],
        },
      ],
    },
    "2.3.6 Check the arithmetic in Python": {
      plain: "The code repeats the confusion counts, the pairwise AUC and a top-3 capacity rule.",
    },
    "2.3.7 Match the sampling unit to the claim": {
      plain: "Test the way the model will be used: later dates for known meters, unseen meters for new installations.",
    },
    "2.1.4 Calibration, thresholds, and resource-limited actions": {
      plain: "With honest probabilities and known costs, the best threshold is $c_{FP}/(c_{FP} + c_{FN})$. With a hard daily capacity, simply take the top-scored cases.",
      replace: {
        3: { p: "For binary decisions under a **specific simplified cost model**, suppose flagging a nonurgent ticket costs $c_{FP} = 1$, missing an urgent ticket costs $c_{FN} = 10$, and a correct action costs zero. If calibrated $p$ is the probability of urgency and each action has the assumed effect, the expected cost of flagging is $(1 - p)c_{FP}$; the expected cost of not flagging is $pc_{FN}$. Flag when" },
        4: { math: r`(1 - p)\,c_{FP} < p\,c_{FN} \quad\Longleftrightarrow\quad p > \frac{c_{FP}}{c_{FP} + c_{FN}} = \frac{1}{11} \approx 0.0909` },
        6: { p: "Precision $= TP/(TP + FP)$ asks how many flagged tickets were truly urgent. Recall $= TP/(TP + FN)$ asks how many urgent tickets were flagged. The false-positive rate $FP/(FP + TN)$ uses nonurgent tickets as its denominator. For capacity planning, also report the raw flagged count per shift. When there are no actual positives, recall is undefined; when no tickets are flagged, precision is undefined. State any zero-denominator policy rather than quietly outputting 100%." },
      },
    },
    "Explained in depth": {
      examples: [
        {
          at: 0,
          title: "Brier score by hand",
          blocks: [
            { p: "Forecasts 0.9, 0.2, 0.6 for outcomes 1, 0, 0: Brier $= [(0.1)^2 + (0.2)^2 + (0.6)^2]/3 = (0.01 + 0.04 + 0.36)/3 = 0.137$. The confident wrong 0.6 contributes most." },
          ],
        },
      ],
    },
  },
  code: {
    "2.3.6 Check the arithmetic in Python#0": {
      goal: "Confusion counts, pairwise AUC and a top-3 capacity rule",
      code: r`import numpy as np
score=np.array([.92,.79,.74,.58,.51,.44,.23,.12])
y=np.array([1,0,1,0,1,0,0,0])
selected=score>=.50
tp=int(np.sum(selected & (y==1)))
fp=int(np.sum(selected & (y==0)))
fn=int(np.sum(~selected & (y==1)))
tn=int(np.sum(~selected & (y==0)))
assert (tp,fp,fn,tn)==(3,2,0,3)
pos=score[y==1]; neg=score[y==0]
auc=np.mean([float(a>b)+.5*float(a==b) for a in pos for b in neg])
assert np.isclose(auc,.8)
top3=np.argsort(-score,kind='stable')[:3]
assert (int(y[top3].sum()),len(top3))==(2,3)
print(f"TP={tp} FP={fp} FN={fn} TN={tn} | pairwise AUC = {auc} | positives in top 3: {int(y[top3].sum())}")

# Output:
# TP=3 FP=2 FN=0 TN=3 | pairwise AUC = 0.8 | positives in top 3: 2`,
      walk: [
        { line: "selected=score>=.50", say: "Flag every alert scoring at least 0.5." },
        { line: "auc=np.mean([float(a>b)+.5*float(a==b) for a in pos for b in neg])", say: "Pairwise AUC: 12 of 15 pairs correctly ordered." },
        { line: "top3=np.argsort(-score,kind='stable')[:3]", say: "A capacity rule: visit the three highest scores. Two of the three are real leaks." },
      ],
    },
    "2.1.4 Calibration, thresholds, and resource-limited actions#0": {
      goal: "Threshold rule versus a fixed-capacity rule",
      code: r`import math


def binary_counts(labels, probabilities, *, threshold):
    if len(labels) != len(probabilities) or not labels:
        raise ValueError("Need matching nonempty labels and scores")
    if not math.isfinite(threshold) or not 0 <= threshold <= 1:
        raise ValueError("Threshold must be in [0, 1]")
    if any(y not in (0, 1) for y in labels):
        raise ValueError("Labels must be binary")
    if any(not math.isfinite(p) or not 0 <= p <= 1 for p in probabilities):
        raise ValueError("Scores must be probabilities in [0, 1]")
    predicted = [int(p >= threshold) for p in probabilities]
    tp = sum(y == 1 and a == 1 for y, a in zip(labels, predicted))
    fp = sum(y == 0 and a == 1 for y, a in zip(labels, predicted))
    fn = sum(y == 1 and a == 0 for y, a in zip(labels, predicted))
    tn = sum(y == 0 and a == 0 for y, a in zip(labels, predicted))
    return {"tp": tp, "fp": fp, "fn": fn, "tn": tn,
            "precision": tp / (tp + fp) if tp + fp else None,
            "recall": tp / (tp + fn) if tp + fn else None,
            "fpr": fp / (fp + tn) if fp + tn else None}


def top_capacity(probabilities, capacity):
    if not 0 <= capacity <= len(probabilities):
        raise ValueError("Capacity outside number of tickets")
    if any(not math.isfinite(p) or not 0 <= p <= 1 for p in probabilities):
        raise ValueError("Expected finite probabilities in [0, 1]")
    selected = sorted(range(len(probabilities)),
                      key=lambda i: (-probabilities[i], i))[:capacity]
    return sorted(selected)


small_labels = [1, 0, 1, 0, 0]
small_probabilities = [0.90, 0.80, 0.60, 0.40, 0.20]
assert binary_counts(small_labels, small_probabilities, threshold=0.5) == {
    "tp": 2, "fp": 1, "fn": 0, "tn": 2,
    "precision": 2/3, "recall": 1.0, "fpr": 1/3}
assert top_capacity(small_probabilities, 2) == [0, 1]
print(binary_counts(small_labels, small_probabilities, threshold=0.5))
print("top-2 capacity picks rows:", top_capacity(small_probabilities, 2))

# Output:
# {'tp': 2, 'fp': 1, 'fn': 0, 'tn': 2, 'precision': 0.6666666666666666, 'recall': 1.0, 'fpr': 0.3333333333333333}
# top-2 capacity picks rows: [0, 1]`,
      walk: [
        { line: "predicted = [int(p >= threshold) for p in probabilities]", say: "Threshold rule: flag every ticket above the cut-off, however many that is." },
        { line: "\"precision\": tp / (tp + fp) if tp + fp else None,", say: "Return `None` instead of a fake number when the denominator is zero." },
        { line: "key=lambda i: (-probabilities[i], i))[:capacity]", say: "Capacity rule: take the top-$k$ scores, breaking ties by position." },
      ],
    },
    "In Python#0": {
      goal: "ROC points, AUC two ways, average precision and Brier score",
      walk: [
        { line: "fpr, tpr, thr = roc_curve(y, score)", say: "Every useful threshold and its (FPR, TPR) point." },
        { line: "pairs = [(p > n) + 0.5 * (p == n) for p in pos for n in neg]", say: "AUC by counting pairs gives the same 0.8 as scikit-learn." },
        { line: "print(\"AUC after cubing scores:\", float(roc_auc_score(y, score ** 3)), \"(ranking unchanged)\")", say: "Any order-preserving change leaves AUC untouched: AUC only cares about ranking." },
        { line: "print(\"Brier score:\", round(brier_score_loss(y, score), 3))", say: "Brier score: mean squared difference between probability and outcome." },
      ],
    },
  },
};

/** Easy layer: Naive Bayes. */
export const NB: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Naive Bayes multiplies together how likely each word (or feature) is in each class, times how common the class is, and picks the class with the biggest product. It pretends features are independent, which is wrong but often works.",
      examples: [
        {
          at: 2,
          kind: "idea",
          title: "Why \"naive\" still works",
          blocks: [
            { p: "\"Hong\" and \"Kong\" almost always appear together, so naive Bayes counts that evidence twice. The probabilities come out too extreme, but if \"Hong Kong\" points to the right class, the ranking of classes is usually still correct." },
          ],
        },
      ],
    },
    "The maths": {
      examples: [
        {
          title: "Why smoothing is needed",
          blocks: [
            { p: "The word \"invoice\" never appeared in 100 training spam emails. Without smoothing, $P(\\text{invoice} \\mid \\text{spam}) = 0$, so any email containing \"invoice\" gets spam probability exactly 0, however spammy the rest is. With add-one smoothing (vocabulary 1,000 words, 5,000 spam tokens): $P = 1/6000$, small but not zero." },
          ],
        },
      ],
    },
    "Textbook case: Text Features and Probabilistic Classification": {
      plain: "Short messages to a repair desk are routed to water, lighting or roads. The case builds naive Bayes by hand and asks what it can and cannot be trusted for.",
    },
    "2.21.1 Define a text task before tokenizing": {
      plain: "Decide what the label means and what the model will be used for before turning text into features. Overlapping categories need a different setup than one-label-per-message.",
    },
    "2.21.2 Multinomial naive Bayes with smoothing": {
      plain: "Count each word in each class, smooth the counts, turn them into probabilities, then add up log-probabilities for the words in a new message.",
      replace: {
        0: { p: "For class $c$, multinomial naive Bayes estimates a prior $P(c)$ and token probabilities $P(t \\mid c)$. If the count of token $t$ in training messages of class $c$ is $N_{tc}$, the total token count in that class is $N_c$, and the vocabulary has $V$ tokens, additive smoothing gives $P(t \\mid c) = (N_{tc} + \\alpha)/(N_c + \\alpha V)$ for $\\alpha > 0$. This treats each token position as a draw under the model. Repeated tokens contribute repeatedly to the score." },
        3: { math: r`\log \text{score}(c) = \log P(c) + \sum_t \text{count}(t, \text{message})\,\log P(t \mid c)` },
        9: { p: "The log score avoids multiplying many tiny probabilities: $\\log P(c) + \\sum_t n_t\\log[(N_{tc} + \\alpha)/(N_c + \\alpha V)]$. To produce a normalized distribution, subtract the largest class log score before exponentiating and divide by the sum of the resulting exponentials. A token absent from all training messages is outside the vocabulary; the small implementation below ignores it and therefore returns the class priors for a message consisting entirely of unknown words. That is a documented fallback, not evidence of understanding the unknown message. The routing interface may choose human review instead." },
      },
      examples: [
        {
          at: 6,
          title: "Answer to the exercise",
          blocks: [
            { p: "\"lamp road\": lighting score $0.5 \\times (5/30) \\times (2/30) = 5/900$; roads score $0.5 \\times (1/30) \\times (4/30) = 2/900$. $P(\\text{lighting}) = 5/7 \\approx 0.71$. A person might read \"lamp road\" as a lamp on a road (lighting) or a road issue; the model just multiplies word evidence and \"lamp\" is the stronger word." },
          ],
        },
      ],
    },
    "2.21.3 Bernoulli and Gaussian variants": {
      plain: "Bernoulli naive Bayes asks whether each word is present or absent (absence counts as evidence too). Gaussian naive Bayes models each numeric feature as a bell curve within each class.",
      replace: {
        2: { p: "Gaussian naive Bayes models continuous feature $x_j$ within class $c$ with an estimated mean $\\mu_{jc}$ and variance $\\sigma_{jc}^2$. Its density is" },
        3: { math: r`f(x_j \mid c) = \frac{1}{\sqrt{2\pi\sigma_{jc}^2}}\exp\!\left[-\frac{(x_j - \mu_{jc})^2}{2\sigma_{jc}^2}\right]` },
      },
    },
    "2.21.4 Compare text models on real triage decisions": {
      plain: "Always compare against simple baselines (most common label, a keyword rule) and judge by the decision that matters, such as how many emergencies are caught.",
    },
    "2.21.5 Similarity and learned text representations": {
      plain: "Embeddings turn text into vectors; cosine similarity compares their directions. They capture meaning better than raw word counts but need their own testing.",
    },
    "Textbook case: Text Features, Sparse Counts, and Naive Bayes": {
      plain: "Maintenance tickets triaged as urgent or routine: tokenising, counting, TF-IDF and naive Bayes, with a full pipeline at the end.",
    },
    "2.22.1 A text feature is a fitted measurement rule": {
      plain: "Tokenising, counting and TF-IDF all learn something (a vocabulary, document frequencies) from training text, so fit them on training data only.",
      examples: [
        {
          at: 2,
          title: "TF-IDF for one word",
          blocks: [
            { p: "100 tickets; \"leak\" appears in 5 of them, \"the\" in 95. With the formula $\\log[(1 + n)/(1 + df)] + 1$: \"leak\" gets $\\log(101/6) + 1 = 3.82$, \"the\" gets $\\log(101/96) + 1 = 1.05$. Rare, specific words get more weight." },
          ],
        },
      ],
    },
    "2.22.2 Derive the multinomial Naive Bayes score": {
      plain: "Open the derivation to see how Bayes' rule plus the independence assumption gives the log-score formula.",
    },
    "2.22.3 Evaluate a complete text pipeline": {
      plain: "Put the vectoriser and the model in one pipeline and split by incident, so near-duplicate tickets cannot leak between training and test.",
    },
    "2.22.4 When word order matters": {
      plain: "Word counts cannot tell \"valve blocks pump\" from \"pump blocks valve\". Sequence models and transformers use word order.",
    },
  },
  code: {
    "2.21.2 Multinomial naive Bayes with smoothing#0": {
      goal: "Multinomial naive Bayes from scratch: fit, smooth, predict",
      code: r`import math
import re
from collections import Counter


def tokenize(message):
    return re.findall(r"[a-z]+", message.lower())


def fit_multinomial_nb(messages, classes, smoothing=1.0):
    if len(messages) != len(classes) or not messages or smoothing <= 0:
        raise ValueError("Need labeled messages and positive smoothing")
    by_class = {}
    for message, label in zip(messages, classes):
        record = by_class.setdefault(label, {"documents": 0, "tokens": Counter()})
        record["documents"] += 1
        record["tokens"].update(tokenize(message))
    vocabulary = set().union(*(set(group["tokens"]) for group in by_class.values()))
    if not vocabulary:
        raise ValueError("Training vocabulary cannot be empty")
    return {"classes": by_class, "vocabulary": vocabulary,
            "documents": len(messages), "smoothing": smoothing}


def predict_multinomial_nb(message, learned):
    counts = Counter(token for token in tokenize(message)
                     if token in learned["vocabulary"])
    scores = {}
    for label, group in learned["classes"].items():
        denominator = (sum(group["tokens"].values())
                       + learned["smoothing"]*len(learned["vocabulary"]))
        value = math.log(group["documents"]/learned["documents"])
        for token, count in counts.items():
            value += count*math.log((group["tokens"][token]
                                     + learned["smoothing"])/denominator)
        scores[label] = value
    shift = max(scores.values())
    weights = {label: math.exp(score-shift) for label, score in scores.items()}
    total = sum(weights.values())
    return {label: weight/total for label, weight in weights.items()}


messages = ["lamp dim", "lamp out", "pothole deep", "pothole wet"]
labels = ["lighting", "lighting", "roads", "roads"]
trained = fit_multinomial_nb(messages, labels)
assert abs(predict_multinomial_nb("lamp out", trained)["lighting"]-6/7) < 1e-12
assert predict_multinomial_nb("unknown text", trained) == {
    "lighting": 0.5, "roads": 0.5}
print("P(class | 'lamp out'):", {k: round(v, 4) for k, v in predict_multinomial_nb("lamp out", trained).items()})
print("P(class | 'unknown text'):", predict_multinomial_nb("unknown text", trained))

# Output:
# P(class | 'lamp out'): {'lighting': 0.8571, 'roads': 0.1429}
# P(class | 'unknown text'): {'lighting': 0.5, 'roads': 0.5}`,
      walk: [
        { line: "def fit_multinomial_nb(messages, classes, smoothing=1.0):", say: "Training is counting: class frequencies and word counts per class." },
        { line: "def predict_multinomial_nb(message, learned):", say: "Prediction: add log prior and log word probabilities, then normalise." },
        { line: "assert abs(predict_multinomial_nb(\"lamp out\", trained)[\"lighting\"]-6/7) < 1e-12", say: "Matches the hand calculation: 6/7." },
      ],
    },
    "2.21.3 Bernoulli and Gaussian variants#0": {
      goal: "Gaussian naive Bayes score for one numeric feature",
      code: r`import math


def gaussian_log_score(value, mean, variance, prior):
    if variance <= 0 or not 0 < prior < 1:
        raise ValueError("Need positive variance and a valid class prior")
    return (math.log(prior)-0.5*math.log(2*math.pi*variance)
            -(value-mean)**2/(2*variance))


log0 = gaussian_log_score(2, 0, 1, 0.5)
log1 = gaussian_log_score(2, 2, 1, 0.5)
probability1 = 1/(1+math.exp(log0-log1))
assert abs(probability1-1/(1+math.exp(-2))) < 1e-12
assert abs(gaussian_log_score(1, 0, 1, 0.5)
           -gaussian_log_score(1, 2, 1, 0.5)) < 1e-12
print("P(class 1 | x=2):", round(probability1, 4), "(= e^2/(1+e^2))")

# Output:
# P(class 1 | x=2): 0.8808 (= e^2/(1+e^2))`,
      walk: [
        { line: "def gaussian_log_score(value, mean, variance, prior):", say: "Log prior plus the log of the normal density at the observed value." },
        { line: "assert abs(probability1-1/(1+math.exp(-2))) < 1e-12", say: "At $x = 2$ the posterior for class 1 is $e^2/(1 + e^2) = 0.881$, as in the text." },
      ],
    },
    "2.22.3 Evaluate a complete text pipeline#0": {
      goal: "A full text pipeline with held-out predictions",
      code: r`import numpy as np
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline

train_text=[
 "alarm coolant pressure drop",
 "compressor alarm high temperature",
 "coolant leak alarm",
 "urgent pressure loss",
 "routine filter inspection",
 "scheduled cleaning filter",
 "routine sensor check",
 "normal scheduled inspection",
]
train_y=np.array([1,1,1,1,0,0,0,0])
model=Pipeline([
 ("counts",CountVectorizer(ngram_range=(1,2),min_df=1)),
 ("nb",MultinomialNB(alpha=1.))
])
model.fit(train_text,train_y)
held_out=["coolant alarm","scheduled sensor check"]
scores=model.predict_proba(held_out)
assert scores.shape==(2,2)
assert np.allclose(scores.sum(axis=1),1)
assert model.predict(held_out).tolist()==[1,0]

urgent=np.array([3.,2.,1.]); routine=np.array([0.,1.,5.])
pu=(urgent+1)/(urgent.sum()+3)
pr=(routine+1)/(routine.sum()+3)
assert np.isclose(pu[0]/pr[0],4)
assert np.isclose((pu[1]*pu[2])/(pr[1]*pr[2]),.5)
print("held-out predictions:", model.predict(held_out).tolist(), "| probabilities:", scores.round(3).tolist())

# Output:
# held-out predictions: [1, 0] | probabilities: [[0.087, 0.913], [0.969, 0.031]]`,
      walk: [
        { line: "assert np.allclose(scores.sum(axis=1),1)", say: "Each row of predicted probabilities sums to 1." },
        { line: "assert model.predict(held_out).tolist()==[1,0]", say: "The two held-out tickets are classified urgent and routine." },
      ],
    },
    "In Python#0": {
      goal: "Naive Bayes for text and for numeric features with scikit-learn",
      code: r`from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB, GaussianNB
from sklearn.pipeline import make_pipeline
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split

train_texts = ["win a free prize now", "free cash offer claim now", "limited offer win money",
               "meeting moved to monday", "please review the report", "lunch with the team tomorrow"]
train_labels = ["spam", "spam", "spam", "ham", "ham", "ham"]

spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))   # word counts -> naive Bayes
spam.fit(train_texts, train_labels)
for text in ["claim your free prize now", "team meeting about the report"]:
    proba = {str(c): float(p) for c, p in zip(spam.classes_, spam.predict_proba([text])[0].round(3))}
    print(f"{text!r:<34} -> {spam.predict([text])[0]}  {proba}")

X, y = load_iris(return_X_y=True)                  # continuous features: Gaussian naive Bayes
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0, stratify=y)
gnb = GaussianNB().fit(X_train, y_train)
print("Gaussian NB on iris, test accuracy:", round(gnb.score(X_test, y_test), 3))
print("first test flower's class probabilities:", gnb.predict_proba(X_test[:1]).round(3))

# Output:
# 'claim your free prize now'        -> spam  {'ham': 0.027, 'spam': 0.973}
# 'team meeting about the report'    -> ham  {'ham': 0.96, 'spam': 0.04}
# Gaussian NB on iris, test accuracy: 0.978
# first test flower's class probabilities: [[0. 0. 1.]]`,
      walk: [
        { line: "spam = make_pipeline(CountVectorizer(), MultinomialNB(alpha=1.0))   # word counts -> naive Bayes", say: "`CountVectorizer` learns the vocabulary and counts words; `alpha=1` is add-one smoothing." },
        { line: "proba = {str(c): float(p) for c, p in zip(spam.classes_, spam.predict_proba([text])[0].round(3))}", say: "Class probabilities for each message." },
        { line: "gnb = GaussianNB().fit(X_train, y_train)", say: "For continuous measurements, each feature gets a normal distribution per class." },
      ],
    },
  },
};

/** Easy layer: Support Vector Machines. */
export const SVM: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "An SVM draws the boundary that leaves the widest possible gap (margin) to the nearest points of each class. Only those nearest points, the support vectors, decide where it goes.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "The widest road between two villages",
          blocks: [
            { p: "Houses of two villages sit on a field. Many straight roads could separate them. The SVM picks the road that is as wide as possible without touching any house. Move a house far from the road and nothing changes; move a house at the road's edge and the road moves." },
          ],
        },
        {
          at: 4,
          title: "C as a strictness dial",
          blocks: [
            { p: "Small C (say 0.1): the SVM accepts a few points inside the margin to keep it wide, so the boundary is smooth. Large C (say 100): every violation is expensive, so the boundary twists to classify every training point, risking overfitting." },
          ],
        },
      ],
    },
    "The maths": {
      examples: [
        {
          title: "Margin from the weights",
          blocks: [
            { p: "$\\mathbf w = (3, 4)$, so $\\lVert\\mathbf w\\rVert = 5$ and the margin width is $2/5 = 0.4$. Halve the weights to $(1.5, 2)$ while keeping every point outside the margin and the width doubles to $2/2.5 = 0.8$. That is why the SVM minimises $\\lVert\\mathbf w\\rVert$." },
          ],
        },
      ],
    },
    "Kernels: curved boundaries": {
      examples: [
        {
          title: "A kernel value by hand",
          blocks: [
            { p: "Points $x = (1, 2)$, $z = (2, 1)$: $x^\\top z = 4$. Polynomial kernel $(x^\\top z + 1)^2 = 25$. RBF with $\\gamma = 0.5$: $\\lVert x - z\\rVert^2 = 2$, so $K = e^{-1} = 0.37$. The RBF value is near 1 for close points and near 0 for distant ones." },
          ],
        },
      ],
    },
    "1.2.9 Distance, margins, and nonlinear similarity": {
      plain: "KNN uses distances directly; SVMs use them through a margin and, with kernels, through a similarity score. Either way, feature scaling changes the answer.",
      replace: {
        1: { p: "A support vector machine seeks a separating boundary with a margin. For labels $y_i \\in \\{-1, +1\\}$, a linear score $f(x) = w^\\top x + b$ induces a hard-margin constraint $y_if(x_i) \\ge 1$ when the training data can be separated exactly. Minimizing $\\frac12\\lVert w\\rVert^2$ under those constraints maximizes the geometric margin under this scaling. Real measurements usually overlap, so a soft-margin formulation allows nonnegative slack $\\xi_i$ and minimizes $\\frac12\\lVert w\\rVert^2 + C\\sum_i\\xi_i$ subject to $y_if(x_i) \\ge 1 - \\xi_i$. Larger $C$ generally penalizes violations more strongly; tune it on held-out data instead of treating a parameter value as intrinsically good." },
        2: { p: "Some boundaries become linear after a feature expansion. If two sensor measurements $x_1$ and $x_2$ interact, a feature $x_1x_2$ can represent a pattern a plain two-feature linear model misses. A kernel $K(x, z)$ computes an inner product in a transformed feature space without explicitly constructing all those coordinates. A polynomial kernel can encode interactions; a radial basis function (RBF) kernel uses similarity that decays with squared distance, commonly $\\exp(-\\gamma\\lVert x - z\\rVert^2)$. The parameter $\\gamma$ controls how local the resemblance is. Scaling, $C$ and $\\gamma$ jointly affect the boundary." },
      },
      examples: [
        {
          at: 4,
          title: "Answer to the exercise",
          blocks: [
            { p: "Multiply the first coordinate by 100: $(100, 2)$ and $(400, 6)$. Differences $(300, 4)$: Euclidean $\\sqrt{90000 + 16} \\approx 300.03$, Manhattan $304$. The first coordinate now completely dominates both distances." },
          ],
        },
      ],
    },
    "2.1.2 Margins, hinge loss, and what an SVM optimizes": {
      plain: "Hinge loss charges nothing for points safely on the right side (margin at least 1) and charges linearly as points get closer to, or cross, the boundary.",
      replace: {
        1: { p: "For a binary problem, let $y_i$ be $-1$ or $+1$ and let a linear score be $f(x_i) = w^\\top x_i + b$. The predicted side of the boundary is the sign of $f(x_i)$; the boundary is $w^\\top x + b = 0$. The signed functional margin is $y_if(x_i)$. Scaling $w$ and $b$ by any positive factor scales this functional margin without changing the boundary, so it is not on its own a geometric distance. For nonzero $w$, the signed perpendicular distance to the boundary is $y_if(x_i)/\\lVert w\\rVert_2$." },
        2: { p: "When data are linearly separable, choose a scaling convention $y_i(w^\\top x_i + b) \\ge 1$ for every training point. The nearest points then lie at geometric distance $1/\\lVert w\\rVert$ from the boundary, and the width between the two supporting parallel planes $w^\\top x + b = +1$ and $w^\\top x + b = -1$ is $2/\\lVert w\\rVert$. Maximizing this width is equivalent to minimizing $\\lVert w\\rVert^2/2$ under those constraints. The formulation uses the squared norm because it has the same minimizer for positive norms and a simple derivative $w$." },
        3: { p: "Real tickets are rarely perfectly separable. Define the hinge loss for a row as $h_i = \\max(0, 1 - y_if(x_i))$. A common soft-margin primal objective is" },
      },
      examples: [
        {
          at: 3,
          title: "Hinge loss for four points",
          blocks: [
            { table: { head: ["$y \\cdot f(x)$", "Situation", "Hinge loss"], rows: [["2.0", "right side, outside the margin", "0"], ["1.0", "exactly on the margin", "0"], ["0.4", "right side but inside the margin", "0.6"], ["−0.5", "wrong side", "1.5"]] } },
          ],
        },
      ],
    },
    "Textbook case: Margins, Kernels, and the Geometry of Classification": {
      plain: "Rooftop sensor readings classified for review, used to work through margins, hinge loss and kernels with real numbers.",
    },
    "2.7.1 A separating hyperplane and geometric margin": {
      plain: "The score $w^\\top x + b$ divided by $\\lVert w\\rVert$ is the point's distance from the boundary; its sign says which side.",
    },
    "2.7.2 Slack variables, hinge loss, and the meaning of C": {
      plain: "Slack lets points break the margin at a price $C$ per unit. SVM scores rank cases but are not probabilities.",
    },
    "2.7.3 Map features implicitly with a kernel": {
      plain: "A kernel computes similarity as if the data had been mapped to many extra features, without building them.",
    },
    "2.7.4 A complete kernel decision calculation": {
      plain: "A kernel SVM's score is a weighted sum of similarities to the support vectors. Points near positive support vectors score positive.",
    },
    "2.7.5 Computational cost, validation, and failure modes": {
      plain: "Kernel SVMs get slow on large datasets because they compare against many support vectors. Tune C and γ inside cross-validation.",
      examples: [
        {
          at: 2,
          title: "Finish the comparison",
          blocks: [
            { p: "Linear: 60 found with 100 inspections, precision 0.60. RBF: 65 found with 200 inspections, precision 0.325. Five more roofs caught for 100 extra inspections: worth it only if a missed roof costs more than about 20 inspections." },
          ],
        },
      ],
    },
    "Textbook case: Margins, Kernels, and Support Vectors": {
      plain: "Manufacturing sensor windows, used to derive the hard margin, soft margin and dual form, and check them in code.",
    },
    "2.8.1 Geometric margin and the hard-margin problem": {
      plain: "With perfectly separable data, the SVM finds the boundary with the largest gap. In one dimension, that is the midpoint between the closest points of each class.",
    },
    "2.8.2 Soft margins and hinge loss": {
      plain: "Allow violations, but charge for them. Scale features first, because the penalty on $\\lVert w\\rVert$ depends on units.",
    },
    "2.8.3 The dual explains support vectors and kernels": {
      plain: "The dual form writes the weights as a combination of training points; only support vectors get non-zero weight, and only inner products are needed, which is what makes kernels possible.",
    },
    "2.8.4 A tiny calculation and implementation checks": {
      plain: "The code checks the support points, hinge losses and that an RBF similarity matrix is valid.",
    },
    "2.8.5 Choose the model for the operating question": {
      plain: "Judge an SVM by recall and precision at the number of reviews you can actually do.",
    },
  },
  code: {
    "2.7.4 A complete kernel decision calculation#0": {
      goal: "Compute a kernel SVM's decision score from its support vectors",
      code: r`from math import exp, isclose

def rbf(a, b, gamma):
    return exp(-gamma * sum((u - v) ** 2 for u, v in zip(a, b)))

def kernel_score(query):
    vectors = [((0.0,), +1, 0.8), ((2.0,), -1, 0.8)]
    return sum(weight * label * rbf(vector, query, 1.0)
               for vector, label, weight in vectors)

assert isclose(rbf((0.0,), (0.0,), 1.0), 1.0)
assert isclose(kernel_score((0.5,)), 0.8 * (exp(-0.25) - exp(-2.25)))
assert isclose(kernel_score((1.0,)), 0.0, abs_tol=1e-12)
print("score at x=0.5:", round(kernel_score((0.5,)), 4), "| at x=1.0:", round(kernel_score((1.0,)), 4) + 0.0)

# Output:
# score at x=0.5: 0.5387 | at x=1.0: 0.0`,
      walk: [
        { line: "def rbf(a, b, gamma):", say: "RBF similarity: $e^{-\\gamma\\lVert a - b\\rVert^2}$." },
        { line: "def kernel_score(query):", say: "The SVM score: sum over support vectors of $\\alpha_i y_i K(x_i, x)$, plus $b$." },
        { line: "assert isclose(kernel_score((1.0,)), 0.0, abs_tol=1e-12)", say: "At $x = 1$, exactly halfway, the two support vectors cancel: the boundary." },
      ],
    },
    "2.8.4 A tiny calculation and implementation checks#0": {
      goal: "Check margins, hinge losses and an RBF Gram matrix",
      code: r`import numpy as np

x=np.array([0.,1.,3.,4.])
y=np.array([-1.,-1.,1.,1.])
w=1.; b=-2.
aligned=y*(w*x+b)
hinge=np.maximum(0,1-aligned)
assert np.all(aligned>=1)
assert np.allclose(aligned,[2.,1.,1.,2.])
assert np.allclose(hinge,0)
assert np.isclose(1/abs(w),1.)
assert np.isclose(2/abs(w),2.)
assert np.isclose(max(0,1-1*.2),.8)
assert np.isclose(max(0,1-(-1)*.2),1.2)

gamma=.5
gram=np.exp(-gamma*(x[:,None]-x[None,:])**2)
assert np.allclose(gram,gram.T)
assert np.linalg.eigvalsh(gram).min()>-1e-10
print("aligned margins:", aligned, "| hinge losses:", hinge, "| margin width 2/|w| =", 2/abs(w))
print("RBF Gram matrix:")
print(gram.round(3))

# Output:
# aligned margins: [2. 1. 1. 2.] | hinge losses: [0. 0. 0. 0.] | margin width 2/|w| = 2.0
# RBF Gram matrix:
# [[1.    0.607 0.011 0.   ]
#  [0.607 1.    0.135 0.011]
#  [0.011 0.135 1.    0.607]
#  [0.    0.011 0.607 1.   ]]`,
      walk: [
        { line: "assert np.allclose(aligned,[2.,1.,1.,2.])", say: "Label × score for each point: the support points sit exactly at 1." },
        { line: "assert np.isclose(2/abs(w),2.)", say: "Margin width $2/|w| = 2$." },
        { line: "assert np.linalg.eigvalsh(gram).min()>-1e-10", say: "A valid kernel gives a matrix with no negative eigenvalues." },
      ],
    },
    "In Python#0": {
      goal: "Linear SVM versus RBF SVM on curved data, with C and γ tuned by cross-validation",
      code: r`from sklearn.datasets import make_moons
from sklearn.svm import SVC, LinearSVC
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = make_moons(n_samples=600, noise=0.25, random_state=0)      # two curved, interlocking classes
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=0)

linear = make_pipeline(StandardScaler(), LinearSVC(C=1.0)).fit(X_train, y_train)
print("linear SVM test accuracy:", round(linear.score(X_test, y_test), 3))

pipe = make_pipeline(StandardScaler(), SVC(kernel="rbf"))
grid = GridSearchCV(pipe, {"svc__C": [0.1, 1, 10, 100], "svc__gamma": [0.01, 0.1, 1, 10]}, cv=5)
grid.fit(X_train, y_train)
best = grid.best_estimator_[-1]
print("best RBF settings:", grid.best_params_, "| test accuracy:", round(grid.score(X_test, y_test), 3))
print("support vectors kept:", int(best.n_support_.sum()), "of", len(X_train), "training points")

# Output:
# linear SVM test accuracy: 0.856
# best RBF settings: {'svc__C': 10, 'svc__gamma': 1} | test accuracy: 0.911
# support vectors kept: 65 of 420 training points`,
      walk: [
        { line: "X, y = make_moons(n_samples=600, noise=0.25, random_state=0)      # two curved, interlocking classes", say: "Two half-moon shapes: no straight line separates them well." },
        { line: "linear = make_pipeline(StandardScaler(), LinearSVC(C=1.0)).fit(X_train, y_train)", say: "A linear SVM: about 86% accuracy." },
        { line: "grid = GridSearchCV(pipe, {\"svc__C\": [0.1, 1, 10, 100], \"svc__gamma\": [0.01, 0.1, 1, 10]}, cv=5)", say: "Try 16 combinations of C and γ with 5-fold cross-validation." },
        { line: "print(\"support vectors kept:\", int(best.n_support_.sum()), \"of\", len(X_train), \"training points\")", say: "The RBF SVM reaches about 91% and keeps only 65 of 420 training points as support vectors." },
      ],
    },
  },
};
