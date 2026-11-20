import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Logistic Regression. */
export const LOGISTIC: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Logistic regression computes a score like linear regression, then squeezes it into a probability between 0 and 1 with the sigmoid. It is trained to give high probability to what actually happened.",
      examples: [
        {
          at: 1,
          title: "Score to probability for three students",
          blocks: [
            { p: "Model: score $z = -5 + 1 \\times$ hours studied, $P(\\text{pass}) = \\sigma(z)$." },
            { table: { head: ["Hours", "Score $z$", "$P(\\text{pass})$"], rows: [["3", "−2", "0.12"], ["5", "0", "0.50"], ["7", "2", "0.88"]] } },
            { p: "At 5 hours the model is undecided. Each extra hour adds 1 to the score, which multiplies the odds of passing by $e^1 = 2.7$." },
          ],
        },
        {
          at: 3,
          kind: "idea",
          title: "Why not just use linear regression on 0/1 labels?",
          blocks: [
            { p: "A straight line fitted to pass/fail labels predicts 1.3 for a student who studied 12 hours and −0.2 for one who studied 0. Neither is a probability. The sigmoid keeps every prediction between 0 and 1 and flattens out at the extremes, which matches how probabilities behave." },
          ],
        },
      ],
    },
    "Training": {
      examples: [
        {
          title: "One gradient step by hand",
          blocks: [
            { p: "Two students: hours $x = (2, 8)$, results $y = (0, 1)$. Start with $w = 0$, $b = 0$: both probabilities are 0.5, so the errors $p - y$ are $(0.5, -0.5)$." },
            { list: ["$\\partial J/\\partial w = \\frac{1}{2}[0.5 \\times 2 + (-0.5) \\times 8] = -1.5$.", "$\\partial J/\\partial b = \\frac{1}{2}(0.5 - 0.5) = 0$.", "With $\\eta = 0.1$: $w = 0.15$, $b = 0$. Now $P(\\text{pass} \\mid 8\\text{ h}) = \\sigma(1.2) = 0.77$ and $P(\\text{pass} \\mid 2\\text{ h}) = \\sigma(0.3) = 0.57$. The 8-hour student now scores clearly higher than the 2-hour student. Both rose a little because the intercept has not moved yet; later steps lower it."] },
          ],
        },
      ],
      code: [
        {
          goal: "Logistic regression from scratch with gradient descent",
          code: r`import numpy as np

rng = np.random.default_rng(0)
n = 2000
hours = rng.uniform(0, 10, n)
passed = (rng.random(n) < 1 / (1 + np.exp(-(hours - 5)))).astype(float)   # true model: logit = hours - 5
X = np.c_[np.ones(n), hours]                     # column of 1s for the intercept

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

w = np.zeros(2)
for step in range(5000):
    p = sigmoid(X @ w)                           # predicted probabilities
    grad = X.T @ (p - passed) / n                # gradient of mean log loss: X^T (p - y) / n
    w -= 0.1 * grad                              # gradient descent step

p = sigmoid(X @ w)
loss = -np.mean(passed * np.log(p) + (1 - passed) * np.log(1 - p))
print("intercept, slope:", w.round(3), "(true values -5 and 1)")
print("mean log loss:", round(loss, 4))
print("P(pass) after 3, 5, 7 hours:", sigmoid(np.array([[1, 3], [1, 5], [1, 7]]) @ w).round(3))
print("odds multiply by", round(np.exp(w[1]), 2), "for each extra hour")

# Output:
# intercept, slope: [-4.983  0.987] (true values -5 and 1)
# mean log loss: 0.3194
# P(pass) after 3, 5, 7 hours: [0.117 0.488 0.873]
# odds multiply by 2.68 for each extra hour`,
          walk: [
            { line: "passed = (rng.random(n) < 1 / (1 + np.exp(-(hours - 5)))).astype(float)   # true model: logit = hours - 5", say: "Simulate 2,000 students from a known model so we can check what gradient descent finds." },
            { line: "p = sigmoid(X @ w)                           # predicted probabilities", say: "Score every student, then squash to probabilities." },
            { line: "grad = X.T @ (p - passed) / n                # gradient of mean log loss: X^T (p - y) / n", say: "The famous \"prediction minus label\" gradient." },
            { line: "w -= 0.1 * grad                              # gradient descent step", say: "Step downhill. After 5,000 steps $w \\approx (-4.98, 0.99)$, close to the true $(-5, 1)$." },
            { line: "print(\"odds multiply by\", round(np.exp(w[1]), 2), \"for each extra hour\")", say: "Exponentiating a coefficient gives an odds ratio." },
          ],
        },
      ],
    },
    "More than two classes": {
      examples: [
        {
          title: "Softmax for three classes",
          blocks: [
            { p: "Scores (cat, dog, bird) $= (2, 1, 0.1)$. $e^2 = 7.39$, $e^1 = 2.72$, $e^{0.1} = 1.11$; total 11.22. Probabilities: $(0.66, 0.24, 0.10)$." },
          ],
        },
      ],
    },
    "1.6.5 Binary likelihood, odds, and deviance": {
      plain: "Odds are $p/(1-p)$. Logistic regression says the log of the odds is a straight line in the features, so each coefficient adds to the log odds and multiplies the odds.",
    },
    "2.6.1 Build a probability from a linear score": {
      plain: "Any number can be turned into a probability by the sigmoid. Doubling the odds does not double the probability: how much the probability moves depends on where you start.",
      examples: [
        {
          at: 1,
          title: "Doubling the odds from different starts",
          blocks: [
            { table: { head: ["Start $p$", "Start odds", "Odds × 2", "New $p$"], rows: [["0.10", "0.111", "0.222", "0.18"], ["0.50", "1", "2", "0.67"], ["0.90", "9", "18", "0.95"]] } },
          ],
        },
      ],
    },
    "2.6.2 Derive cross-entropy and its gradient": {
      plain: "The loss is the negative log of the probability given to the true label. Its gradient comes out beautifully simple: (predicted probability − label) × features.",
    },
    "2.6.3 A hand-calculated gradient step": {
      plain: "A full gradient step worked by hand on two data points, with the loss checked before and after.",
    },
    "2.6.4 Regularization, class weighting, and the intercept": {
      plain: "Penalties keep coefficients from growing too large. Class weights make mistakes on one class cost more. The 0.5 threshold is a default, not a rule: choose it from costs or capacity.",
      examples: [
        {
          at: 2,
          title: "Choosing a threshold from capacity",
          blocks: [
            { p: "Scores for 6 units: 0.9, 0.8, 0.45, 0.4, 0.2, 0.1. With threshold 0.5, two units are serviced. If the team can service four per day, use the top four (threshold effectively 0.4). If it can only service one, take just the 0.9 unit." },
          ],
        },
      ],
    },
    "2.6.6 Verify derivatives and stable loss": {
      plain: "Check the gradient numerically, check one update by hand, and make sure the loss stays finite even for extreme scores.",
    },
    "2.1.3 Likelihood, deviance, and interpretations of pseudo R-squared": {
      plain: "The likelihood multiplies the probabilities the model gave to what actually happened. Deviance and pseudo $R^2$ are ways of comparing likelihoods; none of them is the same as linear-regression $R^2$.",
      replace: {
        1: { p: "If ticket $i$ has binary outcome $y_i \\in \\{0, 1\\}$ and a model gives $p_i = P(Y_i = 1 \\mid x_i)$, the Bernoulli probability of the observed outcome is $p_i^{y_i}(1 - p_i)^{1 - y_i}$. Under a conditional independence likelihood, multiplying across observations gives $L = \\prod_i p_i^{y_i}(1 - p_i)^{1 - y_i}$. Taking logs turns the product into a sum:" },
        6: { p: "For a statistical family, deviance is commonly $D = 2(\\ell_{\\text{sat}} - \\ell_{\\text{model}})$, where $\\ell_{\\text{sat}}$ is the log likelihood of a hypothetical saturated model fitting each observed outcome as closely as that family allows. For individual ungrouped Bernoulli outcomes under the usual limiting convention, $\\ell_{\\text{sat}} = 0$, so $D = -2\\ell_{\\text{model}}$. In the four-row example, $D$ is about 2.12493. For grouped binomial outcomes or other families the saturated value need not be this simple; specify the family and aggregation." },
        7: { p: "For two **nested** models fitted to the same observations with compatible likelihoods, a likelihood-ratio statistic is $2(\\ell_{\\text{full}} - \\ell_{\\text{restricted}})$. Here comparing the toy fitted probabilities with the intercept-only fit would give about $2(-1.06247 + 2.77259) = 3.42023$. Invoking an asymptotic chi-square reference distribution requires further regularity conditions, an appropriate degrees-of-freedom difference, and a genuine inferential comparison of fitted models. Treating arbitrary hand-specified probabilities as a formal likelihood-ratio test would be unjustified. Neither a small training deviance nor a statistically significant fit difference guarantees later operational improvement." },
        8: { p: "One common likelihood-based pseudo $R^2$ is McFadden's $R^2_{\\text{McF}} = 1 - \\ell_{\\text{model}}/\\ell_0$ when the relevant log likelihoods are negative and $\\ell_0$ is an intercept-only baseline on the same cases. On these toy likelihoods it is $1 - (-1.06247)/(-2.77259)$, about 0.6168. This is a **relative log-likelihood comparison** under a convention. It is not the proportion of binary outcomes whose variance has been explained. Other pseudo $R^2$ definitions exist; always state which was used and provide held-out log loss and action-oriented metrics alongside it." },
      },
    },
    "2.2.5 Multiclass and nonlinear logistic decision boundaries": {
      plain: "With several classes each gets its own score, and softmax turns the scores into probabilities. Adding features like $x^2$ lets a linear model draw curved boundaries.",
    },
  },
  code: {
    "2.6.6 Verify derivatives and stable loss#0": {
      goal: "Check the logistic gradient numerically and keep the loss finite",
      code: r`import numpy as np

X=np.array([[0.],[1.]])
y=np.array([0.,1.])
sigmoid=lambda z: 1/(1+np.exp(-z))
def objective(w,b):
    z=X[:,0]*w+b
    return np.mean(np.logaddexp(0,z)-y*z)
def derivatives(w,b):
    p=sigmoid(X[:,0]*w+b)
    return np.mean(X[:,0]*(p-y)),np.mean(p-y)
gw,gb=derivatives(0.,0.)
assert np.allclose([gw,gb],[-.25,0.])
step=.4
w,b=0.-step*gw,0.-step*gb
assert np.allclose(sigmoid(X[:,0]*w+b),[.5,.5249791875])
eps=1e-5
num=(objective(.3+eps,-.2)-objective(.3-eps,-.2))/(2*eps)
assert np.isclose(num,derivatives(.3,-.2)[0],rtol=1e-8)
assert np.isfinite(np.logaddexp(0,-1000.)-1.*(-1000.))
print("gradients at 0:", gw, gb, "| probabilities after one step:", sigmoid(X[:,0]*w+b).round(4))
print("numeric vs analytic slope gradient:", round(num, 8), round(derivatives(.3,-.2)[0], 8))

# Output:
# gradients at 0: -0.25 0.0 | probabilities after one step: [0.5   0.525]
# numeric vs analytic slope gradient: -0.23751041 -0.23751041`,
      walk: [
        { line: "return np.mean(np.logaddexp(0,z)-y*z)", say: "`logaddexp(0, z)` computes $\\log(1 + e^z)$ without overflow: the stable log loss." },
        { line: "return np.mean(X[:,0]*(p-y)),np.mean(p-y)", say: "Analytic gradients for slope and intercept." },
        { line: "num=(objective(.3+eps,-.2)-objective(.3-eps,-.2))/(2*eps)", say: "Numerical check at another point; it matches to 8 decimals." },
      ],
    },
    "2.1.3 Likelihood, deviance, and interpretations of pseudo R-squared#0": {
      goal: "Log likelihood, log loss, deviance and McFadden's pseudo R²",
      code: r`import math


def bernoulli_diagnostics(labels, probabilities):
    if not labels or len(labels) != len(probabilities):
        raise ValueError("Need matching nonempty sequences")
    if any(y not in (0, 1) for y in labels):
        raise ValueError("Labels must be binary")
    if any(not math.isfinite(p) or not 0 < p < 1 for p in probabilities):
        raise ValueError("Use finite probabilities strictly between 0 and 1")
    log_likelihood = sum(y * math.log(p) + (1-y) * math.log1p(-p)
                         for y, p in zip(labels, probabilities))
    prevalence = sum(labels) / len(labels)
    if not 0 < prevalence < 1:
        raise ValueError("Intercept comparison needs both observed classes")
    null_log_likelihood = sum(
        y * math.log(prevalence) + (1-y) * math.log1p(-prevalence)
        for y in labels)
    return {"log_likelihood": log_likelihood,
            "mean_log_loss": -log_likelihood / len(labels),
            "bernoulli_deviance": -2 * log_likelihood,
            "mcfadden_pseudo_r2": 1 - log_likelihood / null_log_likelihood}


diagnostics = bernoulli_diagnostics([1, 0, 1, 0],
                                    [0.8, 0.2, 0.6, 0.1])
assert abs(diagnostics["log_likelihood"] + 1.0624732421) < 1e-9
assert abs(diagnostics["bernoulli_deviance"] - 2.1249464842) < 1e-9
for k, v in diagnostics.items():
    print(f"{k:<20} {v:.4f}")

# Output:
# log_likelihood       -1.0625
# mean_log_loss        0.2656
# bernoulli_deviance   2.1249
# mcfadden_pseudo_r2   0.6168`,
      walk: [
        { line: "log_likelihood = sum(y * math.log(p) + (1-y) * math.log1p(-p)", say: "For each row, the log of the probability given to the outcome that happened." },
        { line: "prevalence = sum(labels) / len(labels)", say: "The intercept-only model predicts the overall positive rate (0.5 here) for everyone." },
        { line: "\"mcfadden_pseudo_r2\": 1 - log_likelihood / null_log_likelihood}", say: "How much better than the intercept-only model, on the log-likelihood scale." },
      ],
    },
    "In Python#0": {
      goal: "Logistic regression in scikit-learn, and moving the threshold",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import precision_score, recall_score

X, y = load_breast_cancer(return_X_y=True)
y = 1 - y                                         # make 1 = malignant, the class we must not miss
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=1, stratify=y)

clf = make_pipeline(StandardScaler(), LogisticRegression(C=0.05))  # C = 1/lambda: smaller C = stronger L2 penalty
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_test)[:, 1]           # P(malignant) for each test tumour
for threshold in (0.5, 0.3, 0.1):
    pred = (proba >= threshold).astype(int)       # turn probabilities into decisions
    print(f"threshold {threshold}: recall {recall_score(y_test, pred):.3f}, precision {precision_score(y_test, pred):.3f}")

# Output:
# threshold 0.5: recall 0.887, precision 0.979
# threshold 0.3: recall 0.962, precision 0.927
# threshold 0.1: recall 1.000, precision 0.779`,
      walk: [
        { line: "y = 1 - y                                         # make 1 = malignant, the class we must not miss", say: "Recode so the positive class is the one where a miss is dangerous." },
        { line: "clf = make_pipeline(StandardScaler(), LogisticRegression(C=0.05))  # C = 1/lambda: smaller C = stronger L2 penalty", say: "Scale, then logistic regression with an L2 penalty." },
        { line: "proba = clf.predict_proba(X_test)[:, 1]           # P(malignant) for each test tumour", say: "Probabilities, not just labels." },
        { line: "pred = (proba >= threshold).astype(int)       # turn probabilities into decisions", say: "Lowering the threshold from 0.5 to 0.1 raises recall from 0.89 to 1.00, at the cost of precision (0.98 → 0.78)." },
      ],
    },
  },
};

/** Easy layer: Multiclass Classification & Softmax. */
export const SOFTMAX: EasyTopic = {
  sections: {
    "Step 1: the quick hack, one-vs-rest": {
      examples: [
        {
          title: "Three yes/no models",
          blocks: [
            { p: "Fruit classifier: \"apple vs not\" says 0.7, \"banana vs not\" says 0.6, \"cherry vs not\" says 0.1. These do not add to 1 (they add to 1.4), so they are not probabilities over the three classes. You can still pick the highest (apple), but you cannot say \"70% apple\"." },
          ],
        },
      ],
    },
    "Step 4: the loss, categorical cross-entropy": {
      examples: [
        {
          title: "Loss for confident, unsure and wrong",
          blocks: [
            { table: { head: ["$P$(true class)", "Loss $-\\ln p$"], rows: [["0.9", "0.105"], ["0.33", "1.10"], ["0.05", "3.00"]] } },
            { p: "Only the probability of the true class matters. Being confidently wrong costs about 30 times more than being confidently right." },
          ],
        },
      ],
    },
    "2.1.1 Multiclass and multilabel models, softmax, and loss gradients": {
      plain: "Multiclass: exactly one answer is right (which team owns a ticket). Multilabel: several can be right at once (tags). Softmax suits the first; separate sigmoids suit the second.",
      replace: {
        3: { p: "A joint linear softmax model computes $z_k = w_k^\\top x + b_k$ for each class and then" },
        5: { p: "Every $p_k$ is positive and their sum is one. Because adding the same constant $c$ to every $z_k$ multiplies the numerator and denominator by $e^c$, the probabilities are unchanged. Subtract $\\max_j z_j$ before exponentiating; then every exponent is at most zero and the calculation avoids overflow for large positive logits. A well-formed probability vector is not necessarily calibrated on new tickets." },
        "7.d.0": { p: "For one observed class $y$, write $L = -\\log p_y = -z_y + \\log\\sum_j e^{z_j}$. Differentiating with respect to logit $z_k$ gives" },
        "7.d.2": { math: r`= p_k - \mathbf 1\{k = y\}` },
        "7.d.3": { p: "Here $\\mathbf 1\\{k = y\\}$ equals one if $k$ is the observed class and zero otherwise. By the chain rule, if $z_k = w_k^\\top x + b_k$, then $\\partial L/\\partial w_k = (p_k - \\mathbf 1\\{k = y\\})x$ and $\\partial L/\\partial b_k = p_k - \\mathbf 1\\{k = y\\}$. An average over $n$ training rows divides the summed gradients by $n$. Regularization contributes its own derivative; for $\\lambda\\sum_k \\lVert w_k\\rVert^2/2$, the additional gradient for $w_k$ is $\\lambda w_k$. The dimensions are worth checking: $p_k - \\mathbf 1\\{k = y\\}$ is a scalar and $x$ has $p$ coordinates, so the weight gradient has $p$ coordinates. This derivation explains the familiar \"predicted minus observed\" form without treating it as a memorized rule." },
      },
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Multiclass or multilabel?",
          blocks: [
            { list: ["Which digit is in this image (0–9)? **Multiclass**: one answer.", "Which topics does this news article cover (sport, politics, business)? **Multilabel**: an article about a cricket board election is both sport and politics."] },
          ],
        },
      ],
    },
    "2.6.5 Multiclass extension and its gradients": {
      plain: "The binary logistic recipe extends directly: one score per class, softmax, cross-entropy, and the gradient is again prediction minus truth.",
    },
  },
  code: {
    "2.1.1 Multiclass and multilabel models, softmax, and loss gradients#0": {
      goal: "A numerically stable softmax, its loss and its gradient",
      code: r`import math


def stable_softmax(logits):
    if not logits or any(not math.isfinite(z) for z in logits):
        raise ValueError("Need finite logits")
    offset = max(logits)
    values = [math.exp(z - offset) for z in logits]
    total = sum(values)
    return [value / total for value in values]


def softmax_loss_and_gradient(logits, true_index):
    if not 0 <= true_index < len(logits):
        raise ValueError("Class index out of range")
    probabilities = stable_softmax(logits)
    offset = max(logits)
    loss = offset + math.log(sum(math.exp(z - offset) for z in logits)) - logits[true_index]
    gradient = [p - int(j == true_index)
                for j, p in enumerate(probabilities)]
    return loss, gradient


loss, gradient = softmax_loss_and_gradient([1, 2, 0], 1)
assert abs(loss - 0.4076059644) < 1e-9
assert abs(sum(stable_softmax([1, 2, 0])) - 1) < 1e-12
assert abs(sum(gradient)) < 1e-12
assert abs(softmax_loss_and_gradient([1000, -1000], 1)[0] - 2000) < 1e-12
assert all(abs(a - b) < 1e-12 for a, b in zip(
    stable_softmax([1, 2, 0]), stable_softmax([1001, 1002, 1000])))
print("probabilities:", [round(p, 4) for p in stable_softmax([1, 2, 0])])
print("loss:", round(loss, 4), "| gradient (p - one-hot):", [round(g, 4) for g in gradient])

# Output:
# probabilities: [0.2447, 0.6652, 0.09]
# loss: 0.4076 | gradient (p - one-hot): [0.2447, -0.3348, 0.09]`,
      walk: [
        { line: "offset = max(logits)", say: "Subtract the largest logit before exponentiating, so no exponent is positive and nothing overflows." },
        { line: "loss = offset + math.log(sum(math.exp(z - offset) for z in logits)) - logits[true_index]", say: "Cross-entropy written as log-sum-exp minus the true class's logit: stable even for logits like 1000." },
        { line: "gradient = [p - int(j == true_index)", say: "The gradient: probability minus 1 for the true class, probability minus 0 for the others." },
      ],
    },
    "In Python#0": {
      goal: "Softmax by hand, then multinomial logistic regression on iris",
      walk: [
        { line: "z = z - z.max()              # subtract the max: same result, no overflow", say: "The stability trick." },
        { line: "print(\"gradient p - y:\", (p - y).round(3))", say: "Negative for the true class (push its score up), positive for the others (push down)." },
        { line: "clf = LogisticRegression(max_iter=1000).fit(X_tr, t_tr)", say: "With three classes, scikit-learn fits a softmax (multinomial) model by default." },
      ],
    },
  },
};

/** Easy layer: K-Nearest Neighbours. */
export const KNN: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "KNN stores the training data. To classify a new point it finds the $k$ closest stored points and takes a vote. No training, but every prediction searches the data, and distances only make sense if features are on similar scales.",
      examples: [
        {
          at: 1,
          title: "A vote of five neighbours",
          blocks: [
            { p: "A new fruit's 5 nearest neighbours are apple, apple, orange, apple, orange. Majority: apple (3 votes to 2). With $k = 1$ only the single nearest counts; with $k = 15$ the answer may drift towards whichever fruit is most common overall." },
          ],
        },
      ],
    },
    "Distance": {
      examples: [
        {
          title: "Euclidean versus Manhattan",
          blocks: [
            { p: "Points $(1, 2)$ and $(4, 6)$: differences $(3, 4)$. Euclidean: $\\sqrt{9 + 16} = 5$ (straight line). Manhattan: $3 + 4 = 7$ (walking along a city grid)." },
          ],
        },
      ],
    },
    "Choosing K": {
      examples: [
        {
          title: "Cross-validated accuracy by k",
          blocks: [
            { table: { head: ["$k$", "1", "3", "5", "7", "9", "15"], rows: [["CV accuracy", "0.955", "0.974", "0.962", "0.970", "0.963", "0.958"]] } },
            { p: "From the code step below (breast-cancer data, scaled). $k = 1$ is a little worse (too sensitive to single points); beyond $k = 7$ accuracy slowly drops (too smooth)." },
          ],
        },
      ],
    },
    "2.9.1 K-nearest neighbors classification from the decision rule": {
      plain: "Compute the distance to every training row, keep the $k$ smallest, and vote. Decide in advance how to break ties, both between equally distant rows and between equal vote counts.",
      replace: {
        1: { p: "Let training rows be $(x_i, y_i)$ for $i = 1, \\dots, n$, with feature vectors $x_i \\in \\mathbb{R}^p$ and class labels $y_i$. At prediction time, calculate a chosen distance $d(x, x_i)$ from new row $x$ to each eligible training row, order rows by distance under a fixed tie rule, and retain the first $k$. Under uniform voting, count each class among these $k$ neighbors and choose the largest count. A vote tie needs its own documented rule: for example, select the class with the smaller mean distance among tied voters, then use a fixed class order if still tied. A label produced by voting is not automatically a calibrated probability. The fraction of neighbors with label one can be a score but depends on $k$, prevalence, feature space, and repeated records." },
        2: { p: "For Euclidean coordinates, $d_2(x, z) = \\sqrt{\\sum_{j=1}^p (x_j - z_j)^2}$. For Manhattan distance, $d_1(x, z) = \\sum_j |x_j - z_j|$. More generally $d_r(x, z) = \\big[\\sum_j |x_j - z_j|^r\\big]^{1/r}$ for $r \\ge 1$. These are metrics on suitable numeric vectors, but different $r$ values can rank neighbors differently. A categorical code such as pump type 1, 2, 3 should not be treated as a numeric interval without engineering justification. A binary mismatch count or carefully weighted mixed-feature distance may be more appropriate; it requires its own validation and missing-value policy." },
      },
    },
    "2.9.3 Scaling, geometry, and the curse of irrelevant dimensions": {
      plain: "Change a feature's units and the nearest neighbour can change. Irrelevant features add noise to every distance until everything looks equally far away.",
      examples: [
        {
          at: 2,
          title: "Noise features drown the signal",
          blocks: [
            { p: "Two points differ by 1 in the one useful feature: squared distance 1. Add 50 pure-noise features, each adding about 2 to the squared distance on average: total about 101. A point that differs by 3 in the useful feature has about 109. Before, 1 vs 9 was a clear ranking; now 101 vs 109 is lost in the noise." },
          ],
        },
      ],
    },
    "2.9.4 Choosing k, testing transfer, and diagnosing failure": {
      plain: "Pick $k$ with validation that matches real use. If the same pump appears in training and test, KNN can simply recognise the pump, and the score will be misleadingly high.",
    },
  },
  code: {
    "2.9.1 K-nearest neighbors classification from the decision rule#0": {
      goal: "KNN classification from scratch, with tie rules",
      code: r`import math


def knn_classify(train_x, train_y, query, *, k=3, weighted=False):
    if not train_x or len(train_x) != len(train_y) or not 1 <= k <= len(train_x):
        raise ValueError("Need aligned training rows and valid k")
    p = len(query)
    if p < 1 or any(len(row) != p for row in train_x):
        raise ValueError("Feature dimensions must match")
    if any(not math.isfinite(v) for row in train_x for v in row):
        raise ValueError("Training coordinates must be finite")
    if any(not math.isfinite(v) for v in query):
        raise ValueError("Query coordinates must be finite")
    ranked = sorted(
        (sum((a-b)**2 for a, b in zip(query, row)), i, train_y[i])
        for i, row in enumerate(train_x))[:k]
    zero = [item for item in ranked if item[0] == 0]
    if weighted and zero:
        ranked = zero  # Exact matches alone determine the vote.
    scores, distances = {}, {}
    for squared, _, label in ranked:
        weight = (1/math.sqrt(squared) if weighted and squared > 0 else 1.0)
        scores[label] = scores.get(label, 0.0)+weight
        distances.setdefault(label, []).append(math.sqrt(squared))
    # Highest vote, then lowest mean voter distance, then class as a string.
    best = min(scores, key=lambda label: (
        -scores[label], sum(distances[label])/len(distances[label]),
        str(label)))
    return best, scores, ranked


train_x = [(0,0),(0,2),(2,0),(6,6),(6,8),(8,6)]
train_y = [0,0,0,1,1,1]
assert knn_classify(train_x,train_y,(3,4),k=3)[0] == 0
assert knn_classify(train_x,train_y,(5,6),k=3)[0] == 1
assert knn_classify(train_x,train_y,(6,6),k=3,weighted=True)[0] == 1
print("query (3, 4):", knn_classify(train_x, train_y, (3, 4), k=3)[:2])
print("query (5, 6):", knn_classify(train_x, train_y, (5, 6), k=3)[:2])

# Output:
# query (3, 4): (0, {0: 2.0, 1: 1.0})
# query (5, 6): (1, {1: 3.0})`,
      walk: [
        { line: "(sum((a-b)**2 for a, b in zip(query, row)), i, train_y[i])", say: "Squared distance to every training row (no square root needed for ranking), plus the row index for tie-breaking." },
        { line: "for i, row in enumerate(train_x))[:k]", say: "Sort and keep the $k$ closest." },
        { line: "weight = (1/math.sqrt(squared) if weighted and squared > 0 else 1.0)", say: "Uniform votes, or inverse-distance votes when `weighted=True`." },
        { line: "best = min(scores, key=lambda label: (", say: "Highest vote wins; ties go to the class whose voters are closer on average." },
      ],
    },
    "In Python#0": {
      goal: "Choose k with cross-validation, and see what scaling is worth",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import GridSearchCV, train_test_split

X, y = load_breast_cancer(return_X_y=True)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())   # scale first: KNN uses distances
grid = GridSearchCV(pipe, {"kneighborsclassifier__n_neighbors": [1, 3, 5, 7, 9, 15]}, cv=5)
grid.fit(X_train, y_train)

for k, score in zip(grid.cv_results_["param_kneighborsclassifier__n_neighbors"], grid.cv_results_["mean_test_score"]):
    print(f"k = {k:>2}: cross-validated accuracy {score:.3f}")
print("best:", grid.best_params_, "| test accuracy:", round(grid.score(X_test, y_test), 3))

unscaled = KNeighborsClassifier(5).fit(X_train, y_train)
print("same k = 5 without scaling: test accuracy", round(unscaled.score(X_test, y_test), 3))

# Output:
# k =  1: cross-validated accuracy 0.955
# k =  3: cross-validated accuracy 0.974
# k =  5: cross-validated accuracy 0.962
# k =  7: cross-validated accuracy 0.970
# k =  9: cross-validated accuracy 0.963
# k = 15: cross-validated accuracy 0.958
# best: {'kneighborsclassifier__n_neighbors': 3} | test accuracy: 0.951
# same k = 5 without scaling: test accuracy 0.916`,
      walk: [
        { line: "pipe = make_pipeline(StandardScaler(), KNeighborsClassifier())   # scale first: KNN uses distances", say: "Scaling inside the pipeline, so each fold scales with its own training rows." },
        { line: "grid = GridSearchCV(pipe, {\"kneighborsclassifier__n_neighbors\": [1, 3, 5, 7, 9, 15]}, cv=5)", say: "Try six values of $k$ with 5-fold cross-validation." },
        { line: "unscaled = KNeighborsClassifier(5).fit(X_train, y_train)", say: "The same model without scaling: test accuracy drops from about 0.95 to 0.92 because large-valued features dominate the distance." },
      ],
    },
  },
};

/** Easy layer: Decision Trees. */
export const TREES: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "A tree asks yes/no questions one after another (\"income above 50k?\", \"age below 30?\"), choosing each question to make the groups as pure as possible. Its leaves give the prediction.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "A loan tree a person could read",
          blocks: [
            { list: ["Is income above ₹6 lakh? **No** → reject (most such applicants defaulted).", "**Yes** → Is existing debt above ₹10 lakh? **Yes** → reject. **No** → approve."] },
            { p: "Each path from the top to a leaf is a rule. That readability is the tree's biggest strength." },
          ],
        },
      ],
    },
    "Measuring impurity": {
      examples: [
        {
          title: "Gini and entropy for three nodes",
          blocks: [
            { table: { head: ["Node (yes, no)", "Gini $1 - \\sum p^2$", "Entropy (bits)"], rows: [["(10, 0)", "0", "0"], ["(8, 2)", "1 − 0.64 − 0.04 = 0.32", "0.72"], ["(5, 5)", "0.5", "1"]] } },
            { p: "Both measures are 0 for a pure node and largest for a 50/50 node." },
          ],
        },
      ],
    },
    "Controlling overfitting": {
      examples: [
        {
          title: "Depth versus accuracy",
          blocks: [
            { table: { head: ["max_depth", "Leaves", "Train accuracy", "Test accuracy"], rows: [["1", "2", "0.930", "0.888"], ["3", "8", "0.977", "0.916"], ["unlimited", "18", "1.000", "0.902"]] } },
            { p: "From the code step below. The unlimited tree is perfect on training data but worse on test data than the depth-3 tree: it memorised." },
          ],
        },
      ],
    },
    "Regression trees": {
      examples: [
        {
          title: "Leaf predictions",
          blocks: [
            { p: "A leaf holds house prices 50, 55 and 60 lakh: it predicts their mean, 55. Any new house that lands in this leaf gets 55, whatever its exact features." },
          ],
        },
      ],
    },
    "2.10.1 Classification impurity and candidate thresholds": {
      plain: "A split is good if the children are purer than the parent, weighted by how many rows go each way.",
    },
    "2.10.3 Grow, prune, and evaluate a tree": {
      plain: "Grow a tree, then cut back branches that do not pay for themselves on validation data. Compare trees by the real cost of their mistakes, not just accuracy.",
      examples: [
        {
          at: 1,
          title: "Finish the cost comparison",
          blocks: [
            { p: "12-leaf tree: $5 \\times 10 + 25 \\times 1 = 75$. 4-leaf tree: $7 \\times 10 + 12 \\times 1 = 82$. The bigger tree costs less here because misses are expensive. If a miss cost only 3: $15 + 25 = 40$ against $21 + 12 = 33$, and the smaller tree wins." },
          ],
        },
      ],
    },
    "2.10.5 Interpret fitted paths with sample size and provenance": {
      plain: "A leaf built from five rows is weak evidence, especially if all five came from the same station. Always show how many rows a leaf is based on.",
    },
    "2.11.1 A split is an optimization over candidate partitions": {
      plain: "The tree tries every threshold of every feature and keeps the one with the biggest weighted drop in impurity.",
    },
    "2.11.2 Work an entropy calculation and understand information gain": {
      plain: "Information gain is the drop in entropy from parent to children. It tells you how useful a split was on the training data, nothing more.",
    },
    "2.11.4 Why depth and leaf size are regularization": {
      plain: "Limiting depth or requiring a minimum number of rows per leaf stops the tree from carving out tiny leaves around individual training points.",
    },
    "2.11.5 Inspect a path without asserting causality": {
      plain: "A tree path describes where the model puts rows, not why things happen in the world.",
    },
    "2.11.6 Check impurity and squared-loss computations": {
      plain: "The code repeats the Gini, entropy and squared-error calculations above.",
    },
    "1.17.3 Information gain and category splits": {
      plain: "A split that creates a tiny pure child can look great on information gain but rarely holds up on new data.",
      replace: {
        0: { p: "For a classification node with class proportions $p_k$, entropy is $H = -\\sum_k p_k\\log_2 p_k$. A pure node has entropy zero; for two equally represented classes entropy is one bit. A split's information gain is parent entropy minus the size-weighted average child entropy. This is a training criterion for local partitioning, not a measure of the causal importance of a feature." },
      },
      examples: [
        {
          at: 3,
          title: "Answer to the exercise",
          blocks: [
            { p: "Children (2, 0) and (4, 6): entropies 0 and 0.971. Weighted: $(2/12)(0) + (10/12)(0.971) = 0.809$, gain $1 - 0.809 = 0.191$. The balanced split (5, 1) / (1, 5) gains 0.350, almost twice as much, even though it has no pure child." },
          ],
        },
      ],
    },
    "1.17.4 Pruning and leaf reliability": {
      plain: "Pruning removes branches that only fit a few unusual rows. Choose how much to prune from the real cost of misses and false alarms.",
    },
    "2.12.1 Decision-tree splits, impurity, and reliable leaves": {
      plain: "Impurity measures how mixed a node is. A leaf with one row has a \"probability\" of 0 or 1, which is not trustworthy; smoothing pulls it towards something more sensible.",
      replace: {
        1: { p: "A classification tree recursively partitions rows. At a node containing $n$ rows, let $p_c$ be the observed fraction of class $c$. Two common impurity functions are entropy $H = -\\sum_c p_c\\log_2 p_c$ (with $0\\log 0$ defined by its limit as zero) and Gini impurity $G = 1 - \\sum_c p_c^2$. For two equally represented classes $H = 1$ bit and $G = 1/2$; for a pure node both are zero. These are mathematical measures of label mixture, not estimates of future harm or proofs that a split feature causes the outcome." },
        6: { p: "A tree leaf's raw positive fraction $\\hat p = m/n_{\\text{leaf}}$ is based on training records. A leaf with one fault among one case has fraction one, but that is not a well-supported probability prediction. One simple smoothed estimate, under an explicit symmetric pseudo-count $\\alpha$, is $(m + \\alpha)/(n_{\\text{leaf}} + 2\\alpha)$; with $\\alpha = 1$, a one-of-one leaf gives 2/3, not one. This is a modeling assumption, not automatic calibration. On later data report raw leaf counts and calibration, especially for rare high-risk faults." },
      },
    },
  },
  code: {
    "Which features matter? Two kinds of importance#0": {
      goal: "Impurity importance versus permutation importance",
      walk: [
        { line: "row_id = rng.permutation(len(X)).reshape(-1, 1)          # a useless, unique-per-row \"ID\" column", say: "A fake ID column: unique for every row, useless for prediction." },
        { line: "perm = permutation_importance(forest, X_te, y_te, n_repeats=20, random_state=0)", say: "Shuffle each feature on the test set and measure how much accuracy drops." },
        { line: "for n, imp, p in zip(names, forest.feature_importances_, perm.importances_mean):", say: "Impurity importance gives the ID column 0.12 (it was used for splits); permutation importance correctly gives it about 0." },
      ],
    },
    "2.10.1 Classification impurity and candidate thresholds#0": {
      goal: "Gini and entropy for a node, and the gain of a split",
      code: r`from math import isclose, log2
def gini(yes, no):
    n = yes + no
    return 1 - (yes/n)**2 - (no/n)**2
def entropy(yes, no):
    n = yes + no
    return -sum(p*log2(p) for p in [yes/n,no/n] if p)
assert isclose(gini(8,8), 0.5)
assert isclose(gini(6,2), 0.375)
assert isclose(gini(8,8) - (gini(6,2)+gini(2,6))/2, 0.125)
assert isclose(entropy(8,8)-entropy(6,2), 0.18872187554086717)
print("gini(8,8) =", gini(8, 8), "| gini(6,2) =", gini(6, 2), "| entropy(6,2) =", round(entropy(6, 2), 4))

# Output:
# gini(8,8) = 0.5 | gini(6,2) = 0.375 | entropy(6,2) = 0.8113`,
      walk: [
        { line: "return 1 - (yes/n)**2 - (no/n)**2", say: "Gini impurity: 1 minus the sum of squared class shares." },
        { line: "return -sum(p*log2(p) for p in [yes/n,no/n] if p)", say: "Entropy in bits; `if p` skips a zero share ($0 \\log 0 = 0$)." },
      ],
    },
    "2.11.6 Check impurity and squared-loss computations#0": {
      goal: "Compare two candidate splits by Gini and entropy gain",
      code: r`import numpy as np

def gini(labels):
    values,counts=np.unique(labels,return_counts=True)
    p=counts/counts.sum()
    return 1-np.sum(p*p)

def entropy(labels):
    _,counts=np.unique(labels,return_counts=True)
    p=counts/counts.sum()
    return -np.sum(p*np.log2(p))

# Four positive labels and six negative labels.
left=np.array([1,0,0,0,0])
right=np.array([1,1,1,0,0])
parent=np.r_[left,right]
gain_a=gini(parent)-(len(left)*gini(left)+len(right)*gini(right))/len(parent)
assert np.isclose(gain_a,.08)
alt_left=np.array([1,1])
alt_right=np.array([1,1,0,0,0,0,0,0])
gain_b=gini(parent)-(len(alt_left)*gini(alt_left)+len(alt_right)*gini(alt_right))/len(parent)
assert np.isclose(gain_b,.18)
assert gain_b>gain_a
entropy_gain=entropy(parent)-(2*entropy(alt_left)+8*entropy(alt_right))/10
assert np.isclose(entropy_gain,.3219280948873623)

demand=np.array([1.,2.,8.,9.])
sse=lambda a: np.sum((a-a.mean())**2)
assert np.isclose(sse(demand),50.)
assert np.isclose(sse(demand[:2])+sse(demand[2:]),1.)
print("Gini gain, split A:", round(gain_a, 3), "| split B:", round(gain_b, 3), "| entropy gain B:", round(entropy_gain, 4))

# Output:
# Gini gain, split A: 0.08 | split B: 0.18 | entropy gain B: 0.3219`,
      walk: [
        { line: "gain_a=gini(parent)-(len(left)*gini(left)+len(right)*gini(right))/len(parent)", say: "Gini gain: parent impurity minus the size-weighted child impurity." },
        { line: "assert gain_b>gain_a", say: "Split B (a pure child of 2) beats split A here." },
        { line: "assert np.isclose(sse(demand[:2])+sse(demand[2:]),1.)", say: "The same idea for regression: squared error drops from 50 to 1." },
      ],
    },
    "2.12.1 Decision-tree splits, impurity, and reliable leaves#0": {
      goal: "A reusable information-gain function",
      code: r`import math


def entropy(positive, negative):
    n = positive + negative
    if n <= 0:
        raise ValueError("Node must contain rows")
    return -sum(p*math.log2(p) for p in (positive/n, negative/n) if p)


def gini(positive, negative):
    n = positive + negative
    if n <= 0:
        raise ValueError("Node must contain rows")
    return 1-(positive/n)**2-(negative/n)**2


def gain(parent, children, impurity=entropy):
    n = sum(parent)
    if sum(sum(child) for child in children) != n:
        raise ValueError("Children must contain exactly the parent rows")
    return impurity(*parent) - sum(
        sum(child)/n*impurity(*child) for child in children)


assert abs(gain((6, 6), [(5, 1), (1, 5)])-0.3499775784) < 1e-9
assert abs(gain((6, 6), [(5, 1), (1, 5)], gini)-2/9) < 1e-12
assert gain((6, 6), [(5, 1), (1, 5)]) > gain((6, 6), [(2, 0), (4, 6)])
print("entropy gain (5,1)|(1,5):", round(gain((6, 6), [(5, 1), (1, 5)]), 4), "| (2,0)|(4,6):", round(gain((6, 6), [(2, 0), (4, 6)]), 4))

# Output:
# entropy gain (5,1)|(1,5): 0.35 | (2,0)|(4,6): 0.1909`,
      walk: [
        { line: "if sum(sum(child) for child in children) != n:", say: "Safety check: the children must contain exactly the parent's rows." },
        { line: "sum(child)/n*impurity(*child) for child in children)", say: "Weight each child's impurity by its share of the rows." },
      ],
    },
    "In Python#0": {
      goal: "Train trees of different depths and print the learned rules",
      code: r`from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

data = load_breast_cancer()
X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.25, random_state=0, stratify=data.target)

for depth in (1, 3, None):
    tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)
    print(f"max_depth={str(depth):<4} leaves={tree.get_n_leaves():>2}  train acc {tree.score(X_train, y_train):.3f}  test acc {tree.score(X_test, y_test):.3f}")

tree = DecisionTreeClassifier(max_depth=2, random_state=0).fit(X_train, y_train)
print(export_text(tree, feature_names=list(data.feature_names)))   # the learned rules, readable

# Output:
# max_depth=1    leaves= 2  train acc 0.930  test acc 0.888
# max_depth=3    leaves= 8  train acc 0.977  test acc 0.916
# max_depth=None leaves=18  train acc 1.000  test acc 0.902
# |--- worst perimeter <= 106.10
# |   |--- worst concave points <= 0.13
# |   |   |--- class: 1
# |   |--- worst concave points >  0.13
# |   |   |--- class: 0
# |--- worst perimeter >  106.10
# |   |--- worst concave points <= 0.14
# |   |   |--- class: 0
# |   |--- worst concave points >  0.14
# |   |   |--- class: 0`,
      walk: [
        { line: "tree = DecisionTreeClassifier(max_depth=depth, random_state=0).fit(X_train, y_train)", say: "Limit depth to 1, 3, or not at all." },
        { line: "print(f\"max_depth={str(depth):<4} leaves={tree.get_n_leaves():>2}  train acc {tree.score(X_train, y_train):.3f}  test acc {tree.score(X_test, y_test):.3f}\")", say: "Compare training and test accuracy: the unlimited tree is perfect on training data but not the best on test data." },
        { line: "print(export_text(tree, feature_names=list(data.feature_names)))   # the learned rules, readable", say: "Print the tree as nested if/else rules." },
      ],
    },
  },
};
