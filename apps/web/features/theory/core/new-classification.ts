import type { TheoryTopic } from "../topics";

const r = String.raw;

/** Classification section additions, built step by step. Code blocks come from executed scripts. */
export const NEW_CLASSIFICATION_THEORY: TheoryTopic[] = [
  // ───────────────────────────────────────────── Multiclass & softmax
  {
    slug: "multiclass-softmax",
    group: "Classification",
    title: "Multiclass Classification & Softmax",
    summary: "From yes/no to many classes: one-vs-rest, the softmax function, categorical cross-entropy and its beautifully simple gradient.",
    learnHref: "/learn/logistic-regression",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Softmax turns one raw score per class into probabilities that are positive and sum to 1, and training pushes up the probability of the correct class with the loss $-\\ln p_{\\text{true}}$." } },
          { p: "Logistic regression answers yes/no questions: spam or not, pass or fail. Many real problems have more than two answers: which digit is this (10 classes), which animal (cat, dog, bird), which topic is this news article about. We build up the answer in steps: first the quick hack (one-vs-rest), then the proper tool (softmax), then how to train it." },
          { p: "**Multiclass vs multilabel.** Multiclass means exactly one correct class per example (a photo is a cat or a dog or a bird). Multilabel means several labels can be true at once (a movie can be comedy and romance). Multilabel uses one independent sigmoid per label; multiclass uses softmax. This page is about multiclass." },
        ],
      },
      {
        heading: "Step 1: the quick hack, one-vs-rest",
        blocks: [
          { p: "Train one binary classifier per class: \"cat vs not-cat\", \"dog vs not-dog\", \"bird vs not-bird\". To predict, run all three and pick the one that is most confident." },
          { list: ["**Pro:** works with any binary model (SVM, logistic regression, trees).", "**Con:** the three scores were trained separately, so they do not add up to 1 and are not comparable probabilities. A photo could get 0.9 from \"cat\" and 0.8 from \"dog\"."] },
          { p: "(**One-vs-one** trains a classifier for every pair of classes, $K(K-1)/2$ of them, and takes a vote. SVMs often use this.) What we really want is one model that outputs a proper probability distribution over all classes at once." },
        ],
      },
      {
        heading: "Step 2: one score per class",
        blocks: [
          { p: "Give each class $k$ its own weight vector $\\mathbf w_k$ and bias $b_k$. For an input $\\mathbf x$, each class gets a raw score, called a **logit**:" },
          { math: r`z_k = \mathbf w_k^\top \mathbf x + b_k, \qquad k = 1, \dots, K` },
          { p: "Example: a photo gets scores $z = (2.0, 1.0, 0.1)$ for (cat, dog, bird). Cat has the highest score, but these numbers are not probabilities: they can be negative, and they do not sum to 1." },
        ],
      },
      {
        heading: "Step 3: softmax turns scores into probabilities",
        blocks: [
          { p: "Two fixes, applied in order. **Make every score positive** with $e^{z}$ (which also exaggerates gaps: a bigger score gets a much bigger share). **Make them sum to 1** by dividing by the total:" },
          { math: r`p_k = \operatorname{softmax}(\mathbf z)_k = \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}}` },
          {
            steps: [
              { title: "Exponentiate", body: "", math: r`e^{2.0} = 7.389,\quad e^{1.0} = 2.718,\quad e^{0.1} = 1.105` },
              { title: "Add them up", body: "", math: r`7.389 + 2.718 + 1.105 = 11.212` },
              { title: "Divide each by the total", body: "Cat gets about 66%, dog 24%, bird 10%, and they sum to 1.", math: r`p = \left(\tfrac{7.389}{11.212},\ \tfrac{2.718}{11.212},\ \tfrac{1.105}{11.212}\right) = (0.659,\ 0.242,\ 0.099)` },
            ],
          },
          { figure: { src: "/theory/figures/cls_softmax.svg", alt: "Two bar charts: logits 2.0, 1.0, 0.1 and softmax probabilities 0.659, 0.242, 0.099 for cat, dog, bird.", caption: "Softmax keeps the ranking of the scores but turns them into probabilities that sum to 1. The gap between 2.0 and 1.0 becomes a 66% vs 24% split." } },
          { callout: { title: "Two facts worth remembering", body: "(1) Adding the same number to every score changes nothing, because it cancels between top and bottom. Code uses this to subtract the largest score before exponentiating, which avoids overflow. (2) With two classes, softmax is exactly the sigmoid of the score difference: $p_1 = 1/(1 + e^{-(z_1 - z_0)})$. Logistic regression is the $K = 2$ case of softmax regression." } },
        ],
      },
      {
        heading: "Step 4: the loss, categorical cross-entropy",
        blocks: [
          { p: "Write the true class as a **one-hot** vector: cat is $\\mathbf y = (1, 0, 0)$. The loss is the negative log of the probability given to the true class:" },
          { math: r`L = -\sum_{k=1}^{K} y_k \ln p_k = -\ln p_{\text{true}}` },
          { p: "For our photo (truly a cat), $L = -\\ln 0.659 = 0.417$. If the model had said cat with 0.99, the loss would be 0.010; if it had said 0.01, the loss would be 4.6. Confident mistakes are punished hard. For $K = 2$ this is exactly the binary log-loss of logistic regression." },
        ],
      },
      {
        heading: "Step 5: the gradient is just prediction minus truth",
        blocks: [
          { p: "To train with gradient descent we need $\\partial L / \\partial z_k$. The answer is remarkably simple:" },
          { math: r`\frac{\partial L}{\partial z_k} = p_k - y_k` },
          {
            derive: {
              title: "Derive p − y in four lines",
              blocks: [
                { p: "**Derivative of softmax.** Differentiating $p_j = e^{z_j}/\\sum_m e^{z_m}$ with the quotient rule gives, using $\\delta_{jk} = 1$ if $j = k$ else 0:" },
                { math: r`\frac{\partial p_j}{\partial z_k} = p_j(\delta_{jk} - p_k)` },
                { p: "**Chain rule** through $L = -\\sum_j y_j \\ln p_j$:" },
                { math: r`\frac{\partial L}{\partial z_k} = -\sum_j \frac{y_j}{p_j}\, p_j(\delta_{jk} - p_k) = -\sum_j y_j(\delta_{jk} - p_k)` },
                { p: "**Simplify.** The $\\delta$ picks out $y_k$, and $\\sum_j y_j = 1$ for a one-hot vector:" },
                { math: r`\frac{\partial L}{\partial z_k} = -y_k + p_k \sum_j y_j = p_k - y_k` },
              ],
            },
          },
          { p: "For our photo: $p - y = (0.659 - 1,\\ 0.242,\\ 0.099) = (-0.341,\\ 0.242,\\ 0.099)$. A gradient step therefore **raises** the cat score (negative gradient) and **lowers** dog and bird, each in proportion to how much probability it wrongly took. Then $\\partial L / \\partial \\mathbf w_k = (p_k - y_k)\\,\\mathbf x$, exactly the same form as in binary logistic regression." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

def softmax(z):
    z = z - z.max()              # subtract the max: same result, no overflow
    e = np.exp(z)
    return e / e.sum()

z = np.array([2.0, 1.0, 0.1])            # scores for cat, dog, bird
p = softmax(z)
y = np.array([1, 0, 0])                  # the true class is cat (one-hot)
print("probabilities :", p.round(3), " sum =", p.sum())
print("cross-entropy :", round(-np.log(p[0]), 3))
print("gradient p - y:", (p - y).round(3))
print("add 100 to every score:", softmax(z + 100).round(3), "(unchanged)")

# Multinomial (softmax) logistic regression on a real 3-class dataset
X, t = load_iris(return_X_y=True)
X_tr, X_te, t_tr, t_te = train_test_split(X, t, test_size=0.3, random_state=1, stratify=t)
clf = LogisticRegression(max_iter=1000).fit(X_tr, t_tr)
print("test accuracy :", round(clf.score(X_te, t_te), 3))
print("one flower's class probabilities:", clf.predict_proba(X_te[:1]).round(3))

# Output:
# probabilities : [0.659 0.242 0.099]  sum = 1.0
# cross-entropy : 0.417
# gradient p - y: [-0.341  0.242  0.099]
# add 100 to every score: [0.659 0.242 0.099] (unchanged)
# test accuracy : 0.978
# one flower's class probabilities: [[0.   0.08 0.92]]` },
          { p: "scikit-learn's `LogisticRegression` uses softmax (multinomial) automatically when there are more than two classes. In neural networks, the last layer is a linear layer with $K$ outputs followed by softmax, trained with cross-entropy." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Using softmax when several labels can be true at once", fix: "That is multilabel: use one sigmoid per label with binary cross-entropy." },
              { mistake: "Computing $e^{z}$ directly on large scores", fix: "Subtract the maximum score first; the result is identical and never overflows." },
              { mistake: "Applying softmax, then a loss that applies softmax again", fix: "In PyTorch, `CrossEntropyLoss` expects raw logits. Do not softmax them first." },
              { mistake: "Treating one-vs-rest scores as probabilities", fix: "They are trained separately and do not sum to 1. Use softmax or calibrate them." },
              { mistake: "Encoding classes as 0, 1, 2 and running regression", fix: "That invents an order and distance between classes. Use a classifier with one output per class." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Temperature.** Dividing scores by $T$ before softmax controls confidence: $T < 1$ sharpens towards the top class and $T > 1$ flattens towards uniform. Temperature scaling (fitting one $T$ on validation data) is a simple, effective way to calibrate neural network probabilities." },
          { p: "**Redundancy.** Adding the same vector to every $\\mathbf w_k$ leaves all probabilities unchanged, so the weights are not unique. Regularisation (or fixing one class's weights to 0) removes this freedom." },
          { p: "**Metrics for many classes.** Accuracy, a $K \\times K$ confusion matrix, and per-class precision/recall averaged as **macro** (every class equal) or **weighted** (by class size). Macro averaging exposes poor performance on rare classes that plain accuracy hides." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Scores are $z = (1, 1, 1)$. What are the softmax probabilities? What if they are $(3, 3, 3)$?", solution: [{ p: "Both give (1/3, 1/3, 1/3). Equal scores mean equal probabilities, and adding a constant to all scores changes nothing." }] } },
          { problem: { q: "Two classes with scores $z_0 = 0.5$, $z_1 = 2.5$. Compute $p_1$ with softmax and with the sigmoid of the difference.", solution: [{ math: r`p_1 = \frac{e^{2.5}}{e^{0.5} + e^{2.5}} = \frac{1}{1 + e^{-2}} \approx 0.881` }, { p: "Identical: dividing top and bottom by $e^{2.5}$ turns softmax into the sigmoid of $z_1 - z_0 = 2$." }] } },
          { problem: { q: "True class is dog, $p = (0.2, 0.7, 0.1)$ for (cat, dog, bird). Compute the loss and the gradient with respect to the scores.", solution: [{ p: "Loss = −ln 0.7 ≈ 0.357. With y = (0, 1, 0) the gradient is p − y = (0.2, −0.3, 0.1): raise dog, lower cat and bird." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Difference between multiclass and multilabel classification? Which output function goes with each?", "Why does softmax use $e^{z}$ rather than just normalising the raw scores?", "Show that softmax with two classes equals the sigmoid.", "Derive the gradient of cross-entropy with softmax.", "Why subtract the maximum score before computing softmax?", "One-vs-rest vs one-vs-one vs softmax: trade-offs?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["One score (logit) per class: $z_k = \\mathbf w_k^\\top \\mathbf x + b_k$.", "Softmax: $p_k = e^{z_k}/\\sum_j e^{z_j}$, positive and summing to 1.", "Loss: $-\\ln p_{\\text{true}}$ (categorical cross-entropy).", "Gradient: $p - y$, the same simple form as logistic regression.", "Multilabel problems use independent sigmoids instead."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Scores (2, 1, 0.1) become (12, 11, 10.1). The softmax probabilities…", options: ["all increase", "stay exactly the same", "become uniform", "no longer sum to 1"], answer: 1, why: "Adding the same constant to every score multiplies the top and the bottom of softmax by the same $e^{10}$, which cancels." } },
          { quiz: { q: "A news article can be tagged politics AND economy. You should use…", options: ["softmax over tags", "one sigmoid per tag", "linear regression", "k-means"], answer: 1, why: "Several tags can be true together (multilabel), so each tag gets its own independent probability." } },
          { quiz: { q: "For the true class, the gradient $p_k - y_k$ is…", options: ["always positive", "negative (so its score goes up)", "zero", "undefined"], answer: 1, why: "For the true class $y_k = 1$ and $p_k < 1$, so $p_k - 1 < 0$; gradient descent moves against it and raises that score." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── ROC, AUC, PR, calibration
  {
    slug: "roc-auc-calibration",
    group: "Classification",
    title: "ROC Curves, AUC, Precision–Recall & Calibration",
    summary: "Judge a classifier across every threshold: build a ROC curve by hand, read AUC as a ranking probability, see when precision–recall is better, and check whether probabilities can be trusted.",
    learnHref: "/learn/logistic-regression",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A confusion matrix judges one threshold; a ROC or precision–recall curve judges every threshold at once, and calibration asks a different question: when the model says 30%, does it happen 30% of the time?" } },
          { p: "Most classifiers output a **score** (often a probability), not a yes/no. You pick a threshold to turn scores into decisions, and every threshold gives a different confusion matrix. We will move in steps: one threshold, then all thresholds (ROC), then a single number (AUC), then the rare-positive case (precision–recall), and finally whether the scores mean what they say (calibration)." },
          { p: "Running example: a water company ranks 8 meter alerts by a model's leak score. 1 means a real leak was found." },
          { table: { head: ["Alert", "1", "2", "3", "4", "5", "6", "7", "8"], rows: [["Score", "0.92", "0.79", "0.74", "0.58", "0.51", "0.44", "0.23", "0.12"], ["Real leak?", "1", "0", "1", "0", "1", "0", "0", "0"]] } },
        ],
      },
      {
        heading: "Step 1: one threshold, one confusion matrix",
        blocks: [
          { p: "Inspect everything with score ≥ 0.50. That selects alerts 1–5:" },
          { table: { head: ["", "Predicted leak", "Predicted no leak"], rows: [["Real leak (3)", "TP = 3", "FN = 0"], ["No leak (5)", "FP = 2", "TN = 3"]] } },
          { p: "Two rates describe this threshold, each relative to its own row:" },
          { math: r`\text{TPR (recall)} = \frac{TP}{TP + FN} = \frac{3}{3} = 1.0, \qquad \text{FPR} = \frac{FP}{FP + TN} = \frac{2}{5} = 0.4` },
          { p: "We caught every leak, but 40% of the non-leaks were also sent an inspector. Raising the threshold would save inspections and miss leaks; lowering it does the opposite. One matrix cannot show this trade-off." },
        ],
      },
      {
        heading: "Step 2: every threshold, the ROC curve",
        blocks: [
          { p: "Start with the threshold above every score: nothing selected, so (FPR, TPR) = (0, 0). Lower it past one alert at a time. Each real leak moves the point **up** by 1/3 (there are 3 positives); each non-leak moves it **right** by 1/5 (there are 5 negatives)." },
          {
            steps: [
              { title: "Add alert 1 (leak)", body: "Up: (0, 0.33)." },
              { title: "Add alert 2 (no leak)", body: "Right: (0.2, 0.33)." },
              { title: "Add alert 3 (leak)", body: "Up: (0.2, 0.67)." },
              { title: "Add alert 4 (no leak)", body: "Right: (0.4, 0.67)." },
              { title: "Add alert 5 (leak)", body: "Up: (0.4, 1.0). This is our threshold 0.50." },
              { title: "Add alerts 6–8 (no leaks)", body: "Right to (1, 1): everything is selected." },
            ],
          },
          { figure: { src: "/theory/figures/cls_roc_pr.svg", alt: "Left: a staircase ROC curve from (0,0) to (1,1) above the diagonal, AUC 0.80, with threshold 0.50 marked at (0.4, 1.0). Right: a precision–recall curve with points for each top-k cut and a dotted prevalence line at 0.375.", caption: "Left: the ROC staircase for the 8 alerts. The dotted diagonal is random guessing, and the closer the curve hugs the top-left corner, the better. Right: precision against recall for the same ranking. The dotted line is the precision you would get by inspecting at random (the prevalence, 3/8)." } },
        ],
      },
      {
        heading: "Step 3: AUC, one number for the whole curve",
        blocks: [
          { p: "The **area under the ROC curve** summarises every threshold. It has a beautiful meaning that needs no geometry:" },
          { callout: { title: "AUC as a probability", body: "AUC = the probability that a randomly chosen positive gets a higher score than a randomly chosen negative (ties count half)." } },
          { p: "Check it by counting pairs. There are 3 leaks × 5 non-leaks = 15 pairs:" },
          { list: ["The leak scored 0.92 beats all 5 non-leaks.", "The leak scored 0.74 beats 4 non-leaks (0.58, 0.44, 0.23, 0.12) but loses to 0.79.", "The leak scored 0.51 beats 3 non-leaks (0.44, 0.23, 0.12)."] },
          { math: r`\text{AUC} = \frac{5 + 4 + 3}{15} = \frac{12}{15} = 0.80` },
          { list: ["AUC = 1.0: every positive outranks every negative.", "AUC = 0.5: no better than shuffling (the diagonal).", "AUC < 0.5: worse than random, so the scores are reversed (check your labels)."] },
          { p: "**AUC only cares about order.** Cube every score, or take the square root, and AUC stays exactly 0.80. That makes it threshold-free, but it also means AUC says **nothing** about whether a score of 0.9 really means 90%." },
        ],
      },
      {
        heading: "Step 4: when positives are rare, use precision–recall",
        blocks: [
          { p: "FPR divides by the number of negatives. When negatives vastly outnumber positives (fraud, rare disease, leaks across a whole city), a tiny FPR can still mean a flood of false alarms. **Precision** asks the question the inspector cares about: of the alerts I visit, how many are real?" },
          { math: r`\text{precision} = \frac{TP}{TP + FP}` },
          { p: "Precision depends on how common positives are (the prevalence $\\pi$). By Bayes' rule, for a model with recall $r$ and false-positive rate $f$:" },
          { math: r`\text{precision} = \frac{r\,\pi}{r\,\pi + f\,(1 - \pi)}` },
          { p: "Same model, $r = 0.8$, $f = 0.1$. With 10% leaks: precision = 0.08/(0.08 + 0.09) ≈ **0.47**. With 1% leaks: 0.008/(0.008 + 0.099) ≈ **0.075**. The ROC point did not move at all, yet 12 out of 13 inspections are now wasted." },
          { p: "The precision–recall curve plots precision against recall over all thresholds. Its baseline is the prevalence, not 0.5. **Average precision (AP)** summarises it (0.756 for our 8 alerts). Prefer PR curves and AP when positives are rare and false alarms are costly." },
        ],
      },
      {
        heading: "Step 5: choosing the threshold from costs",
        blocks: [
          { p: "Curves describe the options; the threshold is a business decision. If inspecting costs $C_I$ and catching a leak saves $C_M$, inspect when the expected saving beats the cost:" },
          { math: r`p \cdot C_M > C_I \quad\Longleftrightarrow\quad p > \frac{C_I}{C_M}` },
          { p: "With an inspection cost of 12 and a saved loss of 120, inspect whenever $p > 0.1$, far below the default 0.5. This only works if $p$ is a real probability, which brings us to calibration. With a fixed daily capacity (say 3 inspections), simply take the top 3 scores instead." },
        ],
      },
      {
        heading: "Step 6: calibration, can the probabilities be trusted?",
        blocks: [
          { p: "A model is **calibrated** if, among all cases it scores near 0.3, about 30% are positive. Check with a **reliability diagram**: bin the predictions, and plot the average prediction in each bin against the fraction that were actually positive. Perfect calibration lies on the diagonal." },
          { figure: { src: "/theory/figures/cls_calibration.svg", alt: "Reliability diagram: a well-calibrated curve on the diagonal and an over-confident curve that is flatter than the diagonal.", caption: "A well-calibrated model follows the diagonal. An over-confident model is flatter: when it says 0.05 the true rate is about 0.14, and when it says 0.95 it is only about 0.85." } },
          { p: "Two scores measure probability quality (lower is better). The **Brier score** is the mean squared error of the probabilities, $\\frac{1}{n}\\sum (p_i - y_i)^2$; **log loss** is $-\\frac{1}{n}\\sum [y_i \\ln p_i + (1 - y_i)\\ln(1 - p_i)]$. For a positive case, predicting 0.8 costs 0.04 (Brier) or 0.223 (log loss); predicting 0.01 costs 0.980 or 4.605. Log loss punishes confident mistakes far harder." },
          { p: "**Fixing calibration:** fit a monotone mapping from scores to probabilities on held-out data, either Platt scaling (a small logistic regression) or isotonic regression (`CalibratedClassifierCV`). Because the mapping is monotone, AUC does not change: calibration and ranking are separate properties." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.metrics import roc_auc_score, roc_curve, average_precision_score, brier_score_loss

score = np.array([0.92, 0.79, 0.74, 0.58, 0.51, 0.44, 0.23, 0.12])   # model scores, sorted
y     = np.array([1,    0,    1,    0,    1,    0,    0,    0])      # 1 = real leak

# One threshold -> one confusion matrix
pred = (score >= 0.50).astype(int)
tp = int(((pred == 1) & (y == 1)).sum()); fp = int(((pred == 1) & (y == 0)).sum())
fn = int(((pred == 0) & (y == 1)).sum()); tn = int(((pred == 0) & (y == 0)).sum())
print(f"t=0.50  TP={tp} FP={fp} FN={fn} TN={tn}  TPR={tp/(tp+fn):.2f}  FPR={fp/(fp+tn):.2f}")

# Every threshold -> the ROC curve
fpr, tpr, thr = roc_curve(y, score)
print("ROC points (FPR, TPR):", [(round(float(a), 2), round(float(b), 2)) for a, b in zip(fpr, tpr)])

# AUC two ways: library, and "fraction of positive-negative pairs ranked correctly"
pos, neg = score[y == 1], score[y == 0]
pairs = [(p > n) + 0.5 * (p == n) for p in pos for n in neg]
print("AUC sklearn:", float(roc_auc_score(y, score)), "  AUC by pairs:", float(sum(pairs) / len(pairs)))
print("average precision:", round(average_precision_score(y, score), 3))
print("AUC after cubing scores:", float(roc_auc_score(y, score ** 3)), "(ranking unchanged)")
print("Brier score:", round(brier_score_loss(y, score), 3))

# Output:
# t=0.50  TP=3 FP=2 FN=0 TN=3  TPR=1.00  FPR=0.40
# ROC points (FPR, TPR): [(0.0, 0.0), (0.0, 0.33), (0.2, 0.33), (0.2, 0.67), (0.4, 0.67), (0.4, 1.0), (1.0, 1.0)]
# AUC sklearn: 0.8   AUC by pairs: 0.8
# average precision: 0.756
# AUC after cubing scores: 0.8 (ranking unchanged)
# Brier score: 0.192` },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Reporting accuracy or AUC alone on a rare-positive problem", fix: "Add precision–recall (AP), precision at your real capacity (top-k), and the prevalence." },
              { mistake: "Assuming 0.5 is the right threshold", fix: "Choose it from costs, capacity or a target recall on validation data, never on the test set." },
              { mistake: "Reading a high AUC as good probabilities", fix: "AUC ignores calibration. Check a reliability diagram and the Brier score." },
              { mistake: "Quoting precision from a balanced test set", fix: "Precision depends on prevalence. Recompute it for the real-world positive rate." },
              { mistake: "Calibrating on the training data", fix: "Fit the calibrator on held-out or out-of-fold predictions." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Why ROC is prevalence-free.** TPR is computed only among positives and FPR only among negatives, so changing the class mix leaves the curve unchanged. That is a strength for comparing models, but it hides the false-alarm burden that precision exposes." },
          { p: "**Ties.** If a positive and a negative share a score, no threshold can separate them, so the pair contributes 0.5 to AUC. This makes AUC independent of the arbitrary order of tied rows." },
          { p: "**Other single numbers.** F1 $= 2PR/(P + R)$ balances precision and recall at one threshold. Balanced accuracy averages TPR and TNR. The Matthews correlation coefficient uses all four cells and stays informative under heavy imbalance. For our threshold 0.50: F1 = 0.75, balanced accuracy = 0.8, MCC = 0.6." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "For the 8 alerts, use threshold 0.70 (alerts 1–3 selected). Compute TP, FP, FN, TN, TPR, FPR and precision.", solution: [{ p: "Selected: 0.92 (leak), 0.79 (no), 0.74 (leak), so TP = 2, FP = 1. Not selected: one leak (0.51), so FN = 1, TN = 4. TPR = 2/3 ≈ 0.67, FPR = 1/5 = 0.2, precision = 2/3 ≈ 0.67. This is the point (0.2, 0.67) on the ROC curve." }] } },
          { problem: { q: "Swap the scores of alerts 2 and 3 (the leak now scores 0.79 and the non-leak 0.74). What is the new AUC?", solution: [{ p: "Now the second leak beats all 5 non-leaks. Pairs won: 5 + 5 + 3 = 13 of 15, so AUC = 13/15 ≈ 0.867." }] } },
          { problem: { q: "A screening test has recall 0.9 and FPR 0.05. What is the precision if 2% of people are positive?", solution: [{ math: r`\frac{0.9 \times 0.02}{0.9 \times 0.02 + 0.05 \times 0.98} = \frac{0.018}{0.018 + 0.049} \approx 0.27` }, { p: "Only about 27% of positive results are real, despite a test that sounds excellent. This is the base-rate effect." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["How is a ROC curve built? What are its axes?", "Give the probabilistic interpretation of AUC.", "When is a precision–recall curve better than ROC?", "Why can precision collapse while the ROC curve stays the same?", "What is calibration, and how do you measure and fix it?", "How would you pick a threshold for a fraud model?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["One threshold gives one confusion matrix; ROC plots TPR against FPR over all thresholds.", "AUC = probability a random positive outranks a random negative; it depends only on ranking.", "With rare positives, use precision–recall and AP, because precision depends on prevalence.", "Pick the threshold from costs or capacity on validation data.", "Calibration (do probabilities match frequencies?) is separate from ranking; check with a reliability diagram, Brier score or log loss."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A model's AUC is 0.5. This means…", options: ["it is perfect", "it ranks positives above negatives no better than chance", "half its predictions are correct", "it is perfectly calibrated"], answer: 1, why: "AUC 0.5 means a random positive outranks a random negative only half the time, the same as random scores." } },
          { quiz: { q: "You square every predicted probability. What happens to the AUC?", options: ["It drops", "It is unchanged", "It rises", "It becomes 0.5"], answer: 1, why: "Squaring is strictly increasing on [0, 1], so the ranking (and therefore AUC) is unchanged, although calibration changes." } },
          { quiz: { q: "Fraud is 0.1% of transactions. Which view best shows how many alerts will be false alarms?", options: ["ROC curve", "Precision–recall curve", "Accuracy", "R²"], answer: 1, why: "Precision directly measures the share of alerts that are real, and it reflects the rarity of fraud; ROC hides it." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── AdaBoost & XGBoost math
  {
    slug: "adaboost-xgboost",
    group: "Classification",
    title: "AdaBoost & XGBoost: The Math of Boosting",
    summary: "How boosting learns from its mistakes: AdaBoost's reweighting, then the second-order maths behind XGBoost, with leaf weights and split gain worked out by hand for two full rounds.",
    learnHref: "/learn/decision-trees",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Boosting builds many small trees one after another, each one focused on what the previous trees still get wrong, and adds them up." } },
          { p: "A single shallow tree (a **stump**) is a weak learner: barely better than guessing. Boosting turns a sequence of weak learners into a strong one. The two big families differ in **how** the next tree knows what to fix:" },
          { list: ["**AdaBoost** reweights the training rows: misclassified rows get heavier, so the next stump is forced to pay attention to them.", "**Gradient boosting / XGBoost** fits the next tree to the **gradient of the loss**, a direct \"which way should each prediction move\" signal. XGBoost also uses the second derivative and adds regularisation."] },
          { p: "If you have not read the gradient boosting page, it covers the residual-fitting intuition. This page does the maths." },
        ],
      },
      {
        heading: "Part 1, AdaBoost: Step 1, weighted error",
        blocks: [
          { p: "Labels are $y_i \\in \\{-1, +1\\}$. Every row starts with weight $w_i = 1/n$. Train a stump $h_1$ on the weighted data and measure its **weighted error**: the total weight of the rows it gets wrong." },
          { math: r`\varepsilon_t = \sum_{i:\, h_t(x_i) \neq y_i} w_i` },
          { p: "Example: 5 rows, each with weight 0.2. The first stump misclassifies only row 3, so $\\varepsilon_1 = 0.2$." },
        ],
      },
      {
        heading: "AdaBoost Step 2: how much say does this stump get?",
        blocks: [
          { math: r`\alpha_t = \frac{1}{2}\ln\frac{1 - \varepsilon_t}{\varepsilon_t}` },
          { p: "For $\\varepsilon = 0.2$: $\\alpha_1 = \\tfrac12 \\ln 4 \\approx 0.693$. A stump with low error gets a big vote; $\\varepsilon = 0.5$ (coin flip) gets $\\alpha = 0$, no say at all; and $\\varepsilon > 0.5$ gets a negative vote (its predictions are flipped)." },
        ],
      },
      {
        heading: "AdaBoost Step 3: reweight, so mistakes get heavier",
        blocks: [
          { math: r`w_i \leftarrow w_i \, e^{-\alpha_t\, y_i\, h_t(x_i)}, \quad \text{then divide every } w_i \text{ by their sum}` },
          { p: "Correct rows have $y_i h_t(x_i) = +1$, so they are multiplied by $e^{-\\alpha}$ (shrink). Wrong rows have $-1$, so they are multiplied by $e^{\\alpha}$ (grow)." },
          {
            steps: [
              { title: "Multiply", body: "e^{0.693} = 2 and e^{−0.693} = 0.5.", math: r`\text{row 3: } 0.2 \times 2 = 0.4, \qquad \text{others: } 0.2 \times 0.5 = 0.1` },
              { title: "Normalise", body: "The total is 0.4 + 4 × 0.1 = 0.8.", math: r`\text{row 3: } 0.5, \qquad \text{others: } 0.125 \text{ each}` },
              { title: "Read it", body: "The one mistake now carries half of all the weight. The next stump will fail badly unless it gets row 3 right." },
            ],
          },
          { figure: { src: "/theory/figures/cls_adaboost_weights.svg", alt: "Bar chart: five equal weights of 0.2 before; after round one, point 3 has 0.5 and the others 0.125.", caption: "After one round the misclassified point holds 50% of the total weight. (With the α formula this always happens: the wrong rows always end up with exactly half the weight.)" } },
        ],
      },
      {
        heading: "AdaBoost Step 4: the final vote",
        blocks: [
          { math: r`H(x) = \operatorname{sign}\Big(\sum_{t=1}^{T} \alpha_t\, h_t(x)\Big)` },
          { p: "Each stump votes +1 or −1, weighted by its $\\alpha$. Under the hood AdaBoost is greedily minimising the **exponential loss** $\\sum_i e^{-y_i F(x_i)}$, which explains its strength (fast progress) and its weakness: that loss grows exponentially for badly misclassified points, so noisy labels and outliers can grab a lot of weight." },
        ],
      },
      {
        heading: "Part 2, XGBoost: Step 1, a second-order look at the loss",
        blocks: [
          { p: "Gradient boosting keeps a running prediction $F_i$ for every row and adds a new tree $f$ each round: $F_i \\leftarrow F_i + \\eta f(x_i)$. Which tree should we add? XGBoost approximates the loss around the current prediction with a **Taylor expansion** up to the second derivative:" },
          { math: r`\ell(y_i, F_i + w) \approx \ell(y_i, F_i) + g_i\, w + \tfrac12 h_i\, w^2, \qquad g_i = \frac{\partial \ell}{\partial F_i},\; h_i = \frac{\partial^2 \ell}{\partial F_i^2}` },
          { table: { head: ["Loss", "Gradient $g_i$", "Hessian $h_i$"], rows: [["Squared error $\\tfrac12(y - F)^2$", "$F_i - y_i$ (minus the residual)", "$1$"], ["Log loss (classification, F is a log-odds score)", "$p_i - y_i$", "$p_i(1 - p_i)$"]] } },
          { p: "Every row is now summarised by two numbers, $g_i$ and $h_i$. That is what makes XGBoost work with any loss you can differentiate twice." },
        ],
      },
      {
        heading: "XGBoost Step 2: the best value for one leaf",
        blocks: [
          { p: "A tree puts every row in a leaf, and each leaf $j$ adds one constant $w_j$. Sum the approximation over the rows in that leaf, with $G_j = \\sum g_i$ and $H_j = \\sum h_i$, and add an L2 penalty $\\tfrac12 \\lambda w_j^2$ to discourage big jumps:" },
          { math: r`\text{obj}_j(w_j) = G_j\, w_j + \tfrac12 (H_j + \lambda)\, w_j^2` },
          { p: "This is a parabola in $w_j$. Set its derivative $G_j + (H_j + \\lambda) w_j$ to zero:" },
          { math: r`w_j^{*} = -\frac{G_j}{H_j + \lambda}, \qquad \text{obj}_j^{*} = -\frac{1}{2}\,\frac{G_j^2}{H_j + \lambda}` },
          { p: "Read the formula: the leaf moves predictions **against** the summed gradient, and λ shrinks the move. For squared error with λ = 0, $w^* = $ the average residual in the leaf, exactly the intuition of plain gradient boosting." },
        ],
      },
      {
        heading: "XGBoost Step 3: the gain of a split",
        blocks: [
          { p: "A split is worth making if the two children together score better than the parent. Using $\\text{obj}^* = -\\tfrac12 G^2/(H + \\lambda)$ for each:" },
          { math: r`\text{Gain} = \frac{1}{2}\left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{H_L + H_R + \lambda}\right] - \gamma` },
          { p: "$\\gamma$ is a fixed cost per extra leaf. If the best gain is below zero, the split is not made. That is XGBoost's built-in pruning. XGBoost evaluates this gain for every candidate threshold of every feature and keeps the best one." },
        ],
      },
      {
        heading: "Worked example: two XGBoost rounds by hand",
        blocks: [
          { p: "Six rows, one feature $x = (0, 1, 2, 3, 4, 5)$, targets $y = (2, 3, 4, 7, 8, 9)$. Squared error, so $g_i = F_i - y_i$ and $h_i = 1$. Settings: λ = 1, γ = 0.5, learning rate η = 0.4." },
          {
            steps: [
              { title: "Round 0: start from the mean", body: "F = 5.5 for everyone. Gradients g = F − y = (3.5, 2.5, 1.5, −1.5, −2.5, −3.5). Loss ½Σ(y − F)² = 20.75." },
              { title: "Try the split x < 2.5", body: "Left: G_L = 3.5 + 2.5 + 1.5 = 7.5, H_L = 3. Right: G_R = −7.5, H_R = 3. Parent: G = 0, H = 6.", math: r`\text{Gain} = \tfrac12\left[\tfrac{7.5^2}{4} + \tfrac{7.5^2}{4} - \tfrac{0^2}{7}\right] - 0.5 = 13.5625` },
              { title: "Compare with x < 1.5", body: "G_L = 6, H_L = 2; G_R = −6, H_R = 4.", math: r`\text{Gain} = \tfrac12\left[\tfrac{36}{3} + \tfrac{36}{5}\right] - 0.5 = 9.1` },
              { title: "Pick the best", body: "Gains for thresholds 0.5, 1.5, 2.5, 3.5, 4.5 are 3.58, 9.1, 13.56, 9.1, 3.58. The split x < 2.5 wins." },
              { title: "Leaf weights", body: "", math: r`w_L = -\frac{7.5}{3 + 1} = -1.875, \qquad w_R = +1.875` },
              { title: "Update with the learning rate", body: "New predictions 4.75 (left three) and 6.25 (right three). Loss falls from 20.75 to 11.1875.", math: r`F = 5.5 + 0.4 \times (\mp 1.875)` },
              { title: "Round 2: new gradients", body: "g = (2.75, 1.75, 0.75, −0.75, −1.75, −2.75). The same split wins again (gain 6.39). Leaf weights ∓5.25/4 = ∓1.3125, predictions 4.225 and 6.775, loss 6.501875." },
              { title: "What we learned", body: "Each round fits the current gradients, not the original targets. The improvement shrinks each round because the easy error is already gone. To capture the trend within each side, a later tree would need a different split or more depth." },
            ],
          },
          { figure: { src: "/theory/figures/cls_boosting_stages.svg", alt: "Six target points with three step functions: flat at 5.5, then 4.75/6.25, then 4.225/6.775.", caption: "Round 0 predicts the mean. Each shrunken tree moves the left side down and the right side up, a little closer to the targets each time." } },
        ],
      },
      {
        heading: "The regularisation knobs",
        blocks: [
          {
            table: {
              head: ["Knob", "Where it appears", "Effect"],
              rows: [
                ["λ (`reg_lambda`)", "denominator $H + \\lambda$", "shrinks every leaf weight"],
                ["γ (`gamma`, min split loss)", "subtracted from the gain", "blocks splits that do not gain enough"],
                ["η (`learning_rate`)", "$F \\leftarrow F + \\eta f$", "smaller steps, so more trees are needed but generalise better"],
                ["`max_depth`", "tree shape", "limits feature interactions"],
                ["`min_child_weight`", "minimum $H$ per child", "no leaves with too little evidence"],
                ["`subsample`, `colsample_bytree`", "rows/columns per tree", "randomness that reduces overfitting"],
              ],
            },
          },
          { p: "Use early stopping on a validation set to pick the number of trees, and tune the rest with cross-validation." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.ensemble import AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split

# One AdaBoost round by hand: 5 points, the first stump gets point 3 wrong
w = np.full(5, 1 / 5)                      # start with equal weights
wrong = np.array([False, False, True, False, False])
err = w[wrong].sum()                       # weighted error = 0.2
alpha = 0.5 * np.log((1 - err) / err)      # this stump's vote
w = w * np.exp(np.where(wrong, alpha, -alpha))
w = w / w.sum()                            # renormalise
print(f"error {err:.2f}  alpha {alpha:.3f}  new weights {w.round(3)}")

# The library version: many rounds of depth-1 stumps
X, y = make_classification(n_samples=600, n_features=8, n_informative=4, random_state=0)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)
stump = DecisionTreeClassifier(max_depth=1).fit(X_tr, y_tr)
ada = AdaBoostClassifier(DecisionTreeClassifier(max_depth=1), n_estimators=200, random_state=0).fit(X_tr, y_tr)
print("one stump test accuracy :", round(stump.score(X_te, y_te), 3))
print("AdaBoost (200 stumps)   :", round(ada.score(X_te, y_te), 3))

# Output:
# error 0.20  alpha 0.693  new weights [0.125 0.125 0.5   0.125 0.125]
# one stump test accuracy : 0.733
# AdaBoost (200 stumps)   : 0.933` },
          { code: r`import numpy as np

# Six rows, one feature. Squared-error loss L = ½(y − F)²  →  g = F − y, h = 1
x = np.arange(6)
y = np.array([2., 3., 4., 7., 8., 9.])
lam, gamma, eta = 1.0, 0.5, 0.4           # leaf penalty λ, split cost γ, learning rate η

def gain(g, h, left):
    G_L, H_L = g[left].sum(), h[left].sum()
    G_R, H_R = g[~left].sum(), h[~left].sum()
    score = lambda G, H: G ** 2 / (H + lam)
    return 0.5 * (score(G_L, H_L) + score(G_R, H_R) - score(G_L + G_R, H_L + H_R)) - gamma

F = np.full(6, y.mean())                  # round 0: predict the mean, 5.5
for rnd in (1, 2):
    g, h = F - y, np.ones(6)
    gains = {float(t): round(float(gain(g, h, x < t)), 4) for t in (0.5 + np.arange(5))}
    best = max(gains, key=gains.get)
    left = x < best
    w_L = -g[left].sum() / (h[left].sum() + lam)      # optimal leaf weight  −G/(H+λ)
    w_R = -g[~left].sum() / (h[~left].sum() + lam)
    F = F + eta * np.where(left, w_L, w_R)
    print(f"round {rnd}: gains {gains}")
    print(f"         split x<{best}  leaf weights {w_L:.4f}, {w_R:.4f}  ->  predictions {F.round(4)}")
    print(f"         training loss ½Σ(y−F)² = {0.5 * ((y - F) ** 2).sum():.6f}")

# Output:
# round 1: gains {0.5: 3.5833, 1.5: 9.1, 2.5: 13.5625, 3.5: 9.1, 4.5: 3.5833}
#          split x<2.5  leaf weights -1.8750, 1.8750  ->  predictions [4.75 4.75 4.75 6.25 6.25 6.25]
#          training loss ½Σ(y−F)² = 11.187500
# round 2: gains {0.5: 2.0208, 1.5: 4.9, 2.5: 6.3906, 3.5: 4.9, 4.5: 2.0208}
#          split x<2.5  leaf weights -1.3125, 1.3125  ->  predictions [4.225 4.225 4.225 6.775 6.775 6.775]
#          training loss ½Σ(y−F)² = 6.501875` },
          { p: "In real projects use `xgboost.XGBRegressor` / `XGBClassifier` (or LightGBM / CatBoost). Their parameters map directly onto the λ, γ and η above." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Using AdaBoost on noisy labels", fix: "Mislabelled rows get exponentially more weight. Clean the labels, or use gradient boosting with a robust loss." },
              { mistake: "A high learning rate with many trees", fix: "Lower η (0.01–0.1) and use early stopping on validation data." },
              { mistake: "Reading the gain as the drop in training loss", fix: "Gain includes λ and γ and assumes the full, unshrunk leaf weight. The actual loss drop after applying η is smaller." },
              { mistake: "Tuning the number of trees on the test set", fix: "Early-stop on a validation split, then report the test score once." },
              { mistake: "Adding trees to probabilities in classification", fix: "Trees add to the log-odds score; the sigmoid is applied at the end." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Why the Hessian helps.** In log-loss classification, a row predicted at $p = 0.99$ has $h = 0.0099$ while one at $p = 0.5$ has $h = 0.25$. Dividing by $H$ makes leaf weights larger where the loss curve is flat and smaller where it is steep: a Newton step instead of a plain gradient step." },
          { p: "**Missing values.** At each split XGBoost tries sending rows with a missing feature to the left and to the right, and keeps the direction with the higher gain, so it learns a default route for missing data." },
          { p: "**AdaBoost is gradient boosting too.** AdaBoost is exactly forward stagewise additive modelling with exponential loss. Gradient boosting generalises the idea to any differentiable loss." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "A stump has weighted error 0.1. Compute α, and the factor by which the weights of correct and wrong rows are multiplied.", solution: [{ p: "α = ½ ln(0.9/0.1) = ½ ln 9 ≈ 1.099. Wrong rows are multiplied by e^{1.099} = 3 and correct rows by e^{−1.099} ≈ 0.333, before normalising." }] } },
          { problem: { q: "Redo the first-round gain of the split x < 2.5 with λ = 0 and γ = 0.", solution: [{ math: r`\tfrac12\left[\tfrac{7.5^2}{3} + \tfrac{7.5^2}{3} - 0\right] = 18.75` }, { p: "With no penalty the leaf weights are ∓7.5/3 = ∓2.5, the plain average residuals, and the gain is larger." }] } },
          { problem: { q: "A leaf in a log-loss model holds two rows with $p = 0.8$, $y = 1$ and $p = 0.6$, $y = 0$. With λ = 1, what is the leaf weight?", solution: [{ p: "g = p − y: −0.2 and 0.6, so G = 0.4. h = p(1 − p): 0.16 and 0.24, so H = 0.4. w = −0.4/(0.4 + 1) ≈ −0.286: the leaf lowers the log-odds slightly." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["How does AdaBoost decide each learner's weight? Derive α.", "What happens to sample weights after each AdaBoost round?", "Why does XGBoost use the second derivative?", "Derive the optimal leaf weight $-G/(H + \\lambda)$.", "Write the split gain formula. What do λ and γ do?", "Bagging vs boosting: which reduces variance and which reduces bias?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Boosting adds weak learners sequentially, each one fixing what is left.", "AdaBoost: error ε, vote α = ½ ln((1 − ε)/ε), and wrong rows grow by $e^{\\alpha}$ (exponential loss).", "XGBoost: a second-order Taylor expansion with g and h per row.", "Leaf weight $w^* = -G/(H + \\lambda)$; split gain $\\tfrac12[G_L^2/(H_L + \\lambda) + G_R^2/(H_R + \\lambda) - G^2/(H + \\lambda)] - \\gamma$.", "Control overfitting with λ, γ, η, depth, subsampling and early stopping."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "An AdaBoost stump has weighted error exactly 0.5. Its α is…", options: ["1", "0", "−1", "infinite"], answer: 1, why: "α = ½ ln(0.5/0.5) = ½ ln 1 = 0: a coin-flip learner gets no say." } },
          { quiz: { q: "Increasing λ in XGBoost…", options: ["makes leaf weights larger", "shrinks leaf weights towards 0", "adds more trees", "removes the learning rate"], answer: 1, why: "λ is added to H in the denominator of $-G/(H + \\lambda)$, so every leaf weight gets smaller in magnitude." } },
          { quiz: { q: "For squared-error loss, the XGBoost gradient $g_i$ equals…", options: ["$y_i$", "$F_i - y_i$ (minus the residual)", "$1$", "$p_i(1 - p_i)$"], answer: 1, why: "The derivative of ½(y − F)² with respect to F is F − y, the negative residual; the Hessian is 1." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── Ensembles
  {
    slug: "ensemble-methods",
    group: "Classification",
    title: "Ensembles: Voting, Bagging & Stacking",
    summary: "Why combining models can beat any single one, and when it cannot: majority and soft voting, bagging and out-of-bag estimates, and stacking with honest out-of-fold predictions.",
    learnHref: "/learn/decision-trees",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "An ensemble combines several models so that their individual mistakes cancel out, which only works if the models are reasonably good and make different mistakes." } },
          { p: "Ask one doctor and you get one opinion; ask a panel and the odd mistake gets outvoted. Ensembles do the same with models. There are three main recipes, and we will build them in order of sophistication:" },
          { list: ["**Voting**: train different models, combine their answers.", "**Bagging**: train the same model on different random samples of the data, then average (random forests are bagging plus random features).", "**Stacking**: train a second-level model that learns how best to combine the first-level models."] },
          { p: "(**Boosting** is the fourth family; it trains models in sequence. It has its own pages.)" },
        ],
      },
      {
        heading: "Step 1: why a majority vote can beat its members",
        blocks: [
          { p: "Three independent classifiers, each 70% accurate. The majority is right when at least 2 of the 3 are right:" },
          { math: r`P(\text{majority right}) = \underbrace{0.7^3}_{\text{all 3}} + \underbrace{3 \times 0.7^2 \times 0.3}_{\text{exactly 2}} = 0.343 + 0.441 = 0.784` },
          { p: "From 70% to 78.4% for free, and with more voters it keeps climbing. But look at the two conditions hidden in that calculation:" },
          { figure: { src: "/theory/figures/cls_voting.svg", alt: "Line chart of majority-vote accuracy against the number of models: rising towards 1 for 70% and 60% models, flat at 0.5 for 50% models.", caption: "With independent models better than chance, adding voters drives accuracy up. With coin-flip models (50%) voting does nothing, and correlated models behave like far fewer voters than they appear." } },
          { list: ["**Each model must beat chance.** With 50% models the majority stays at 50%; with 40% models it gets worse.", "**Their errors must be independent.** Three copies of the same model make the same mistakes, so voting gains nothing. Real models are correlated, so real gains are smaller than this ideal."] },
        ],
      },
      {
        heading: "Step 2: voting in practice, hard vs soft",
        blocks: [
          { p: "**Hard voting:** each model outputs a class and the most common class wins. **Soft voting:** average the predicted probabilities, then take the highest. Soft voting uses confidence (a model that is 95% sure counts more than one at 51%), so it usually wins when the models' probabilities are reasonably calibrated." },
          { math: r`\hat p(\text{class } k) = \frac{1}{M}\sum_{m=1}^{M} p_m(\text{class } k)` },
          { p: "Mix model types (a linear model, a tree, KNN) to get diverse errors. And always compare against the best single model: in our code below, a 3-model vote does **not** beat the best member (KNN). That is a real outcome, and it happens when one model is clearly stronger than the others." },
        ],
      },
      {
        heading: "Step 3: bagging, same model, different data",
        blocks: [
          { p: "Decision trees are **unstable**: small changes in the data give a very different tree (high variance). **Bagging** (bootstrap aggregating) exploits that instability:" },
          { list: ["Draw a **bootstrap sample**: $n$ rows sampled with replacement from the $n$ training rows.", "Train one deep tree on it.", "Repeat for $B$ trees; average their predictions (regression) or vote (classification)."] },
          { p: "Averaging reduces variance. If each tree's prediction has variance $\\sigma^2$ and any two trees have correlation $\\rho$:" },
          { math: r`\operatorname{Var}\Big(\frac{1}{B}\sum_b \hat f_b\Big) = \rho\,\sigma^2 + \frac{1 - \rho}{B}\,\sigma^2` },
          { p: "More trees shrink the second term towards 0, but the first term $\\rho\\sigma^2$ stays. To go lower you must **decorrelate** the trees. That is exactly what a random forest adds: each split considers only a random subset of features." },
        ],
      },
      {
        heading: "Step 4: out-of-bag (OOB), a free validation set",
        blocks: [
          { p: "In a bootstrap sample, what is the chance that a particular row is never drawn? Each of the $n$ draws misses it with probability $1 - 1/n$:" },
          { math: r`\left(1 - \frac{1}{n}\right)^{n} \;\xrightarrow{\;n \to \infty\;}\; e^{-1} \approx 0.368` },
          { p: "So each tree never sees about 36.8% of the rows. Predict every row using only the trees that did not train on it, and you get an **out-of-bag score**: a validation estimate without setting aside any data. It is a good guide for tuning, but keep a final untouched test set for the last word." },
        ],
      },
      {
        heading: "Step 5: stacking, learn how to combine",
        blocks: [
          { p: "Voting gives every model the same say. **Stacking** trains a **meta-model** (often a simple logistic regression) whose inputs are the base models' predictions, so it can learn to trust the KNN more on some cases and the tree on others." },
          { p: "The crucial detail: the meta-model must learn from **out-of-fold** predictions. If a base model predicts on rows it was trained on, its predictions look unrealistically good, and the meta-model learns to trust it far too much." },
          {
            steps: [
              { title: "Split the training data into K folds", body: "For example K = 5." },
              { title: "Out-of-fold predictions", body: "For each fold, train every base model on the other 4 folds and predict the held-out fold. After 5 rounds every row has an honest prediction from every base model." },
              { title: "Train the meta-model", body: "Its features are those out-of-fold predictions; its target is the true label." },
              { title: "Refit the base models", body: "Retrain each base model on all the training data for use at prediction time." },
              { title: "Evaluate honestly", body: "Score the whole stack on a test set it never touched. (Blending is a cheaper variant that uses one holdout split instead of K folds.)" },
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.ensemble import VotingClassifier, BaggingClassifier, StackingClassifier

X, y = make_classification(n_samples=1000, n_features=10, n_informative=5, flip_y=0.05, random_state=3)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=0)

base = [("logreg", LogisticRegression(max_iter=1000)),
        ("tree", DecisionTreeClassifier(max_depth=5, random_state=0)),
        ("knn", KNeighborsClassifier(15))]
for name, m in base:
    print(f"{name:<9} {m.fit(X_tr, y_tr).score(X_te, y_te):.3f}")

models = {
    "hard vote": VotingClassifier(base, voting="hard"),
    "soft vote": VotingClassifier(base, voting="soft"),
    "bagging (100 trees)": BaggingClassifier(DecisionTreeClassifier(random_state=0), n_estimators=100, oob_score=True, random_state=0),
    # cv=5: the meta-model learns from OUT-OF-FOLD predictions, never from predictions on rows a base model trained on
    "stacking": StackingClassifier(base, final_estimator=LogisticRegression(), cv=5),
}
for name, m in models.items():
    m.fit(X_tr, y_tr)
    extra = f"   (out-of-bag estimate {m.oob_score_:.3f})" if hasattr(m, "oob_score_") else ""
    print(f"{name:<20} {m.score(X_te, y_te):.3f}{extra}")

# Why bootstrap leaves ~36.8% of rows out of each sample
n = 1000
print("P(row never drawn) =", round((1 - 1 / n) ** n, 4), "≈ 1/e =", round(np.exp(-1), 4))

# Output:
# logreg    0.833
# tree      0.880
# knn       0.917
# hard vote            0.907
# soft vote            0.897
# bagging (100 trees)  0.903   (out-of-bag estimate 0.897)
# stacking             0.923
# P(row never drawn) = 0.3677 ≈ 1/e = 0.3679` },
          { p: "Notice the honest result: stacking (0.923) edges past the best single model (KNN, 0.917), while plain voting does not. Ensembles are a tool to test, not a guaranteed win." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Ensembling near-identical models", fix: "Diversity is the point: mix model types, features or data samples." },
              { mistake: "Training a stacker on in-sample predictions", fix: "Use out-of-fold predictions (`StackingClassifier(cv=5)` does this)." },
              { mistake: "Assuming the ensemble must beat every member", fix: "Compare against the best single model on validation data, and keep the simpler model if it wins." },
              { mistake: "Using OOB as the final reported score after tuning on it", fix: "OOB is fine for tuning; report the final score on an untouched test set." },
              { mistake: "Soft voting with badly calibrated models", fix: "Calibrate the probabilities first, or use hard voting." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Bias and variance.** Bagging and random forests mainly reduce **variance** (deep, low-bias trees, averaged). Boosting mainly reduces **bias** (shallow, high-bias trees, added in sequence). That is why forests use deep trees and boosting uses shallow ones." },
          { p: "**Cost.** An ensemble of $M$ models is roughly $M$ times slower to predict and harder to explain. In production, check that the accuracy gain is worth the latency and maintenance." },
          { p: "**Feature importance in forests.** Impurity-based importance favours features with many distinct values. Permutation importance on held-out data (shuffle a feature and measure the score drop) is more trustworthy." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Five independent classifiers, each 60% accurate, take a majority vote. What is the ensemble's accuracy?", solution: [{ math: r`\sum_{k=3}^{5}\binom{5}{k}0.6^k 0.4^{5-k} = 0.3456 + 0.2592 + 0.0778 \approx 0.683` }, { p: "From 60% to about 68%, but only because the errors are assumed independent." }] } },
          { problem: { q: "With n = 10 rows, what fraction of rows is out-of-bag for a tree on average?", solution: [{ p: "(1 − 1/10)^10 = 0.9^10 ≈ 0.349, close to the limit e^{−1} ≈ 0.368." }] } },
          { problem: { q: "Trees each have variance σ² = 4 and pairwise correlation ρ = 0.5. What is the variance of an average of 100 trees, and the limit as B → ∞?", solution: [{ p: "ρσ² + (1 − ρ)σ²/B = 2 + 2/100 = 2.02. As B → ∞ it approaches ρσ² = 2. More trees cannot get below that; only lower correlation can." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Why can a majority vote beat each of its members? What are the conditions?", "Hard vs soft voting?", "How does bagging reduce variance? Why do random forests also sample features?", "Derive the 36.8% out-of-bag fraction.", "How does stacking avoid leakage?", "Bagging vs boosting: which reduces bias and which variance?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Ensembles cancel errors only if members beat chance and make different mistakes.", "Voting: hard (majority class) or soft (average probability).", "Bagging: bootstrap samples plus averaging reduces variance; random forests also decorrelate by sampling features.", "About 36.8% of rows are out-of-bag for each tree, giving a free validation estimate.", "Stacking learns the combination from out-of-fold predictions; always compare with the best single model."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "You vote with 5 copies of the same trained tree. Accuracy compared with one tree is…", options: ["much higher", "exactly the same", "lower", "random"], answer: 1, why: "Identical models make identical mistakes, so the vote always equals the single tree's answer." } },
          { quiz: { q: "Why does a random forest sample features at each split?", options: ["To train faster only", "To decorrelate the trees so averaging removes more variance", "To reduce bias", "To handle missing values"], answer: 1, why: "Averaging cannot remove the shared $\\rho\\sigma^2$ part of the variance; feature sampling lowers $\\rho$." } },
          { quiz: { q: "In stacking, the meta-model should be trained on…", options: ["the base models' predictions on their own training rows", "out-of-fold predictions", "the test set", "the raw features only"], answer: 1, why: "Out-of-fold predictions mimic how base models behave on unseen data, so the meta-model learns honest trust levels." } },
        ],
      },
    ],
  },
];
