import type { TheoryTopic } from "../topics";

const r = String.raw;

/** Basics additions (prerequisites and foundations), built step by step. Code blocks come from executed scripts. */
export const NEW_BASICS_THEORY: TheoryTopic[] = [
  // ───────────────────────────────────────────── Linear algebra for ML
  {
    slug: "linear-algebra-for-ml",
    group: "Prerequisites",
    title: "Linear Algebra for ML: Rank, Inverse, Eigenvectors & SVD",
    summary: "The matrix ideas behind regression, PCA and numerical stability: matrices as transformations, rank and inverses, eigenvectors, and the SVD.",
    learnHref: "/learn/vectors-matrices-notation",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A matrix is a machine that moves vectors; rank, inverse, eigenvectors and the SVD are four ways of describing what that machine does." } },
          { p: "You already know vectors, matrix shapes and the dot product (see Vectors, Matrices & Notation). This page adds the ideas that ML formulas keep using: why $(X^\\top X)^{-1}$ sometimes does not exist, what PCA's \"principal components\" really are, and why some models are numerically unstable. Each step builds on the one before." },
          { p: "We use one small matrix throughout: $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$." },
        ],
      },
      {
        heading: "Step 1: a matrix transforms space",
        blocks: [
          { p: "Multiplying a vector by $A$ moves it to a new place:" },
          { math: r`A\begin{bmatrix}1\\0\end{bmatrix} = \begin{bmatrix}2\\1\end{bmatrix}, \qquad A\begin{bmatrix}0\\1\end{bmatrix} = \begin{bmatrix}1\\2\end{bmatrix}` },
          { p: "The columns of $A$ are exactly where the basic directions $(1, 0)$ and $(0, 1)$ land. Every other vector is a mix of those two, so it lands at the same mix of the columns. Apply $A$ to every point of a circle and you get an ellipse: the matrix **stretches, rotates and squashes** space." },
          { p: "In ML, $X\\boldsymbol\\beta$ is the same operation: the weight vector is transformed into a vector of predictions, one per row." },
        ],
      },
      {
        heading: "Step 2: rank, how many directions survive",
        blocks: [
          { p: "The **rank** of a matrix is the number of independent directions in its output: the number of columns that are not combinations of the others." },
          { list: ["$A$ above has rank 2: its two columns point in different directions, so the output fills the whole plane.", "$\\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$ has rank 1: the second column is twice the first, so every output lies on one line. A whole dimension is squashed flat."] },
          { p: "**Why ML cares:** a design matrix $X$ whose columns are dependent (a feature in metres and the same feature in centimetres) does not have full column rank. Then $X^\\top X$ cannot be inverted and least squares has no unique answer." },
        ],
      },
      {
        heading: "Step 3: the inverse and the determinant",
        blocks: [
          { p: "The **inverse** $A^{-1}$ undoes $A$: $A^{-1}A = I$. For a 2×2 matrix there is a formula. Swap the diagonal, negate the off-diagonal, and divide by the **determinant**:" },
          { math: r`\begin{bmatrix} a & b \\ c & d \end{bmatrix}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}` },
          {
            steps: [
              { title: "Determinant", body: "The determinant is the factor by which the matrix scales area.", math: r`\det A = 2 \cdot 2 - 1 \cdot 1 = 3` },
              { title: "Inverse", body: "", math: r`A^{-1} = \frac{1}{3}\begin{bmatrix} 2 & -1 \\ -1 & 2 \end{bmatrix} = \begin{bmatrix} 0.667 & -0.333 \\ -0.333 & 0.667 \end{bmatrix}` },
              { title: "Check", body: "Multiply A by A⁻¹: the first row times the first column is (2·2 − 1·1)/3 = 1, and the off-diagonals cancel to 0, giving the identity." },
              { title: "When it fails", body: "For the rank-1 matrix [[1, 2], [2, 4]] the determinant is 1·4 − 2·2 = 0. It squashes the plane onto a line, and you cannot un-squash a line back into a plane: there is no inverse." },
            ],
          },
          { callout: { title: "Determinant 0 = rank-deficient = no inverse", body: "These three statements are the same fact for a square matrix. A determinant that is merely very close to 0 is the danger zone: the inverse exists but its entries are enormous, so small noise in the data becomes huge noise in the answer." } },
        ],
      },
      {
        heading: "Step 4: eigenvectors, directions that only stretch",
        blocks: [
          { p: "Most vectors change direction when multiplied by $A$. A few special ones only get longer or shorter. These are the **eigenvectors**, and the stretch factor is the **eigenvalue** $\\lambda$:" },
          { math: r`A\mathbf v = \lambda\mathbf v` },
          { p: "For our matrix: $A(1, 1)^\\top = (3, 3)^\\top = 3 \\cdot (1, 1)^\\top$, so $(1, 1)$ is an eigenvector with $\\lambda = 3$. And $A(1, -1)^\\top = (1, -1)^\\top$, so $(1, -1)$ is an eigenvector with $\\lambda = 1$." },
          {
            derive: {
              title: "Find the eigenvalues yourself",
              blocks: [
                { p: "$A\\mathbf v = \\lambda\\mathbf v$ means $(A - \\lambda I)\\mathbf v = 0$ for a non-zero $\\mathbf v$, which requires $A - \\lambda I$ to squash something to zero, i.e. its determinant is 0:" },
                { math: r`\det\begin{bmatrix} 2 - \lambda & 1 \\ 1 & 2 - \lambda \end{bmatrix} = (2 - \lambda)^2 - 1 = 0 \;\Rightarrow\; \lambda = 3 \text{ or } \lambda = 1` },
                { p: "Plug each $\\lambda$ back in: $\\lambda = 3$ gives $-v_1 + v_2 = 0$, so $\\mathbf v \\propto (1, 1)$; $\\lambda = 1$ gives $v_1 + v_2 = 0$, so $\\mathbf v \\propto (1, -1)$." },
              ],
            },
          },
          { figure: { src: "/theory/figures/basics_eigen.svg", alt: "A unit circle with two arrows becomes an ellipse; the (1,1) arrow is stretched three times and the (1,−1) arrow keeps its length.", caption: "The circle becomes an ellipse. The eigenvectors are the ellipse's axes: (1, 1) is stretched ×3 and (1, −1) ×1. Every other direction gets rotated as well as stretched." } },
          { p: "**Why ML cares:** for a symmetric matrix such as a covariance matrix, the eigenvectors are perpendicular and point along the directions of greatest and least spread. **PCA is exactly this**: the principal components are the eigenvectors of the covariance matrix, and each eigenvalue is the variance along its component." },
        ],
      },
      {
        heading: "Step 5: the SVD, eigenvectors for any matrix",
        blocks: [
          { p: "Eigenvectors need a square matrix. The **singular value decomposition** works for any $n \\times p$ matrix, such as a data matrix with 1000 rows and 5 columns:" },
          { math: r`X = U\,\Sigma\,V^\top` },
          { list: ["$V^\\top$: rotate the input space.", "$\\Sigma$: stretch along each axis by a **singular value** $\\sigma_1 \\ge \\sigma_2 \\ge \\dots \\ge 0$.", "$U$: rotate into the output space."] },
          { p: "Every matrix is a rotation, a stretch, then another rotation. Three facts make the SVD a workhorse:" },
          { list: ["**Rank** = number of non-zero singular values.", "**Compression:** keeping only the largest $k$ singular values gives the best rank-$k$ approximation of $X$ (the basis of PCA, image compression and recommender systems).", "**Condition number** $\\sigma_{\\max}/\\sigma_{\\min}$ measures how much the matrix amplifies errors. Near-duplicate columns give a tiny $\\sigma_{\\min}$ and a huge condition number, which is the multicollinearity problem from regression."] },
          { p: "Example: $X$ with rows $(1, 2), (2, 4.1), (3, 6)$, whose second column is almost twice the first. Its singular values are 8.41 and 0.038, a condition number of about 224. Almost all of $X$ lives in one direction, and the second direction is nearly noise." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np

A = np.array([[2.0, 1.0],
              [1.0, 2.0]])

# 1) A matrix moves vectors
print("A @ [1, 0] =", A @ np.array([1.0, 0.0]))
print("A @ [1, 1] =", A @ np.array([1.0, 1.0]), " <- same direction, stretched x3")

# 2) Determinant, rank, inverse
print("det:", round(np.linalg.det(A), 6), " rank:", np.linalg.matrix_rank(A))
print("inverse:\n", np.linalg.inv(A).round(4))

# 3) Eigen-decomposition (A is symmetric, so use eigh)
vals, vecs = np.linalg.eigh(A)
print("eigenvalues:", vals.round(4))
print("eigenvectors (columns):\n", vecs.round(4))

# 4) SVD works for any matrix, even non-square
X = np.array([[1.0, 2.0], [2.0, 4.1], [3.0, 6.0]])   # column 2 ≈ 2 × column 1
U, s, Vt = np.linalg.svd(X, full_matrices=False)
print("singular values:", s.round(4))
print("condition number:", round(s[0] / s[1], 1), " <- huge: the columns are nearly dependent")
print("rank-1 approximation error:", round(np.linalg.norm(X - s[0] * np.outer(U[:, 0], Vt[0])), 4))

# Output:
# A @ [1, 0] = [2. 1.]
# A @ [1, 1] = [3. 3.]  <- same direction, stretched x3
# det: 3.0  rank: 2
# inverse:
#  [[ 0.6667 -0.3333]
#  [-0.3333  0.6667]]
# eigenvalues: [1. 3.]
# eigenvectors (columns):
#  [[-0.7071  0.7071]
#  [ 0.7071  0.7071]]
# singular values: [8.4148 0.0376]
# condition number: 223.9  <- huge: the columns are nearly dependent
# rank-1 approximation error: 0.0376` },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Computing `np.linalg.inv(X.T @ X)` to solve least squares", fix: "Use `np.linalg.solve` or `lstsq`. They are faster and far more accurate when the matrix is nearly singular." },
              { mistake: "Using `eig` on a symmetric matrix", fix: "Use `eigh`: it is faster, guarantees real eigenvalues and returns orthonormal eigenvectors." },
              { mistake: "Thinking a non-zero determinant means the matrix is safe", fix: "A tiny determinant (or a huge condition number) still makes results unstable. Check the condition number." },
              { mistake: "Forgetting to centre data before PCA via SVD", fix: "Subtract the column means first; otherwise the first component just points at the mean." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**SVD and eigenvectors are linked.** The columns of $V$ are the eigenvectors of $X^\\top X$, and the eigenvalues of $X^\\top X$ are the squared singular values $\\sigma_i^2$. Centred and divided by $n - 1$, $X^\\top X$ is the covariance matrix, which is why PCA can be computed either way." },
          { p: "**Why ridge regression fixes ill-conditioning.** Ridge solves $(X^\\top X + \\lambda I)\\boldsymbol\\beta = X^\\top\\mathbf y$. Adding $\\lambda$ raises every eigenvalue of $X^\\top X$ by $\\lambda$, so the smallest one can no longer be near zero and the condition number drops." },
          { p: "**Projection matrices.** $H = X(X^\\top X)^{-1}X^\\top$ projects any vector onto the column space of $X$. Projecting twice changes nothing ($H^2 = H$). Least-squares predictions are $\\hat{\\mathbf y} = H\\mathbf y$." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "Find the determinant and inverse of $B = \\begin{bmatrix} 4 & 2 \\\\ 1 & 3 \\end{bmatrix}$.", solution: [{ p: "det B = 4·3 − 2·1 = 10." }, { math: r`B^{-1} = \frac{1}{10}\begin{bmatrix} 3 & -2 \\ -1 & 4 \end{bmatrix} = \begin{bmatrix} 0.3 & -0.2 \\ -0.1 & 0.4 \end{bmatrix}` }] } },
          { problem: { q: "Find the eigenvalues of $\\begin{bmatrix} 3 & 0 \\\\ 0 & 1 \\end{bmatrix}$ and describe what the matrix does.", solution: [{ p: "A diagonal matrix's eigenvalues are its diagonal entries: 3 and 1, with eigenvectors along the x- and y-axes. It stretches the x-direction ×3 and leaves y unchanged." }] } },
          { problem: { q: "A data matrix has singular values 50, 20, 0.001. What is its effective rank, and what does that suggest about its features?", solution: [{ p: "Effectively rank 2: the third singular value is essentially zero, so one feature is (almost) a combination of the others. The condition number is 50/0.001 = 50,000, so least squares on it will be unstable unless you remove the redundancy or regularise." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["What does the rank of a matrix tell you?", "When is a square matrix not invertible?", "Define eigenvalues and eigenvectors. Why are they useful in PCA?", "What is the SVD and how does it relate to eigen-decomposition?", "What is the condition number and why does it matter for regression?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["A matrix transforms vectors; its columns are the images of the basic directions.", "Rank = number of independent directions; dependent columns mean no unique least-squares solution.", "Determinant 0 = no inverse; a near-zero determinant means instability.", "Eigenvectors only stretch: $A\\mathbf v = \\lambda\\mathbf v$; covariance eigenvectors are PCA's components.", "SVD $X = U\\Sigma V^\\top$ works for any matrix; singular values give rank, compression and the condition number."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A 3×3 matrix has determinant 0. Which is true?", options: ["It has three non-zero eigenvalues", "It has no inverse and rank below 3", "It is the identity", "It is orthogonal"], answer: 1, why: "A zero determinant means the matrix squashes space into fewer dimensions: rank below 3, so it cannot be undone." } },
          { quiz: { q: "In PCA, the first principal component is…", options: ["the first column of the data", "the eigenvector of the covariance matrix with the largest eigenvalue", "the mean of the data", "a random direction"], answer: 1, why: "The largest eigenvalue's eigenvector points along the direction of greatest variance." } },
          { quiz: { q: "A design matrix has condition number 10⁶. The most likely cause is…", options: ["too many rows", "nearly duplicate (collinear) features", "a missing intercept", "features that are already scaled"], answer: 1, why: "A huge condition number means the smallest singular value is nearly zero: some columns are almost combinations of others." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── Statistics & inference
  {
    slug: "statistics-inference",
    group: "Prerequisites",
    title: "Statistical Inference: Confidence Intervals, Tests & the Bootstrap",
    summary: "From one sample to a claim about everyone: standard errors, confidence intervals, hypothesis tests and p-values, choosing the right test, and the bootstrap.",
    learnHref: "/learn/probability-statistics",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A sample's average is a noisy estimate of the truth; inference measures that noise so we can say how far the truth could plausibly be, and whether a difference is real or just luck." } },
          { p: "You know means, standard deviations and distributions (see Probability & Statistics Essentials). In ML you constantly compare things measured on samples: is model A's accuracy really higher than B's? Did the new recommendation engine really raise sales? This page builds the tools in order: the standard error, then confidence intervals, then hypothesis tests, then which test to choose, and finally the bootstrap, which works when the formulas do not." },
          { p: "Running example: a food-delivery app promises 30-minute delivery. We time 8 orders: 31, 28, 35, 30, 33, 29, 36, 32 minutes." },
        ],
      },
      {
        heading: "Step 1: a sample mean is itself random",
        blocks: [
          { p: "Our 8 orders average $\\bar x = 31.75$ minutes. A different 8 orders would give a different average. If we could repeat the sampling forever, those averages would form a distribution of their own: the **sampling distribution** of the mean. Its spread is the **standard error (SE)**:" },
          { math: r`\text{SE} = \frac{s}{\sqrt{n}}, \qquad s = \sqrt{\frac{1}{n - 1}\sum_i (x_i - \bar x)^2}` },
          {
            steps: [
              { title: "Sample standard deviation", body: "Deviations from 31.75 squared sum to 55.5; divide by n − 1 = 7 (one degree of freedom is used up by estimating the mean).", math: r`s = \sqrt{55.5/7} \approx 2.816` },
              { title: "Standard error", body: "", math: r`\text{SE} = \frac{2.816}{\sqrt 8} \approx 0.996` },
            ],
          },
          { p: "**Two different spreads.** $s \\approx 2.8$ describes how much single deliveries vary. $\\text{SE} \\approx 1.0$ describes how much the average of 8 would vary. Quadrupling the sample size halves the SE: more data, sharper estimate." },
        ],
      },
      {
        heading: "Step 2: confidence intervals",
        blocks: [
          { p: "By the central limit theorem, sample means are roughly normal. So the truth is usually within a couple of standard errors of our estimate. With small samples we use the slightly wider $t$-distribution instead of the normal:" },
          { math: r`\bar x \pm t^{*}_{n-1} \cdot \text{SE} = 31.75 \pm 2.365 \times 0.996 = [29.40,\ 34.10]` },
          { p: "($t^* = 2.365$ is the 97.5th percentile of the $t$-distribution with 7 degrees of freedom; with large $n$ it approaches the familiar 1.96.)" },
          { callout: { title: "What \"95% confident\" really means", body: "If we repeated the whole study many times, 95% of the intervals built this way would contain the true mean. It does NOT mean \"there is a 95% chance the true mean is in this particular interval\": the true mean is fixed, and this interval either contains it or not." } },
          { figure: { src: "/theory/figures/basics_ci_coverage.svg", alt: "25 horizontal confidence intervals around a dashed line at 50; two red intervals miss it.", caption: "25 samples from the same population give 25 different intervals. Most cover the true mean (dashed line); a few, shown in red, miss it. Over many repeats about 5% miss, which is exactly what 95% confidence promises." } },
        ],
      },
      {
        heading: "Step 3: hypothesis tests and p-values",
        blocks: [
          { p: "Is the app really slower than promised, or did we get unlucky? A hypothesis test makes the question precise:" },
          {
            steps: [
              { title: "Null hypothesis H₀", body: "The boring explanation: the true mean is 30 minutes." },
              { title: "Test statistic", body: "How many standard errors is our result from the null?", math: r`t = \frac{\bar x - 30}{\text{SE}} = \frac{31.75 - 30}{0.996} \approx 1.76` },
              { title: "p-value", body: "If H₀ were true, how often would we see a result at least this extreme (in either direction)? For t = 1.76 with 7 degrees of freedom, p ≈ 0.12." },
              { title: "Decision", body: "With the usual threshold α = 0.05, p = 0.12 is not small enough. We do NOT have convincing evidence that deliveries are slower than 30 minutes. That is not the same as proving they are on time: 8 orders is simply too few to tell." },
            ],
          },
          { callout: { title: "The p-value in plain words", body: "The probability of data at least this surprising, assuming the null hypothesis is true. It is NOT the probability that the null is true, and it says nothing about how big or important the effect is." } },
          { table: { head: ["", "H₀ actually true", "H₀ actually false"], rows: [["Reject H₀", "Type I error (false alarm), rate α", "Correct (power = 1 − β)"], ["Keep H₀", "Correct", "Type II error (missed effect), rate β"]] } },
          { p: "Small samples have low **power**: real effects often go undetected. Plan the sample size before running an experiment." },
        ],
      },
      {
        heading: "Step 4: an A/B test in ML",
        blocks: [
          { p: "The old recommender converts 120 of 1000 visitors (12%); the new one converts 150 of 1000 (15%). Is the 3-point gain real? Use a **two-proportion z-test**:" },
          {
            steps: [
              { title: "Pool the rate under H₀ (no difference)", body: "", math: r`\hat p = \frac{120 + 150}{2000} = 0.135` },
              { title: "Standard error of the difference", body: "", math: r`\text{SE} = \sqrt{0.135 \times 0.865 \times \left(\tfrac{1}{1000} + \tfrac{1}{1000}\right)} \approx 0.0153` },
              { title: "z and p", body: "p ≈ 0.0496: just under 0.05. Statistically significant, but only barely; a sensible team would also look at the size of the gain, its business value and a confidence interval for the difference.", math: r`z = \frac{0.15 - 0.12}{0.0153} \approx 1.96` },
            ],
          },
        ],
      },
      {
        heading: "Step 5: choosing the right test",
        blocks: [
          {
            table: {
              head: ["Question", "Data", "Test"],
              rows: [
                ["Is one mean different from a target?", "one numeric sample", "one-sample t-test"],
                ["Do two groups have different means?", "numeric, two independent groups", "two-sample (Welch) t-test"],
                ["Did the same units change (before/after)?", "numeric, paired", "paired t-test"],
                ["Do 3+ groups have different means?", "numeric, several groups", "ANOVA (F-test)"],
                ["Are two categorical variables related?", "counts in a table", "chi-square test of independence"],
                ["Do two rates differ?", "successes / trials", "two-proportion z-test"],
                ["Are two numeric variables related?", "pairs of numbers", "Pearson (linear) or Spearman (rank) correlation"],
              ],
            },
          },
          { p: "If assumptions are doubtful (very skewed data, tiny samples), use a non-parametric alternative (Mann–Whitney, Wilcoxon) or the bootstrap." },
        ],
      },
      {
        heading: "Step 6: the bootstrap, when formulas run out",
        blocks: [
          { p: "Formulas exist for means and proportions. What about a median, an F1 score or an AUC? The **bootstrap** estimates any statistic's uncertainty by simulation:" },
          { list: ["Resample $n$ rows **with replacement** from your data (some rows repeat, some are left out).", "Compute the statistic on that resample.", "Repeat thousands of times; the middle 95% of the results is a 95% interval."] },
          { p: "For the delivery data, 10,000 bootstrap means give a 95% interval of about [30.0, 33.6], close to the t-interval. For model evaluation, bootstrap the **test-set rows** to put an interval around accuracy or AUC, and always resample the right unit: if a customer has many rows, resample customers, not rows." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np
from scipy import stats

# Delivery times (minutes) for 8 orders
x = np.array([31, 28, 35, 30, 33, 29, 36, 32], dtype=float)
n, mean, sd = len(x), x.mean(), x.std(ddof=1)        # ddof=1: sample standard deviation
se = sd / np.sqrt(n)
t_crit = stats.t.ppf(0.975, df=n - 1)
print(f"mean {mean:.2f}  sd {sd:.3f}  SE {se:.3f}  t* {t_crit:.3f}")
print(f"95% CI: {mean - t_crit * se:.2f} to {mean + t_crit * se:.2f}")

# One-sample t-test: is the mean different from the promised 30 minutes?
t_stat, p = stats.ttest_1samp(x, 30)
print(f"t = {t_stat:.3f}, p = {p:.4f}")

# A/B test: two proportions
conv = np.array([120, 150]); visitors = np.array([1000, 1000])
p_pool = conv.sum() / visitors.sum()
z = (conv[1] / 1000 - conv[0] / 1000) / np.sqrt(p_pool * (1 - p_pool) * (2 / 1000))
print(f"A/B: rates {conv / visitors}, z = {z:.3f}, two-sided p = {2 * stats.norm.sf(abs(z)):.4f}")

# Bootstrap CI for the mean: resample the data with replacement
rng = np.random.default_rng(0)
boot = [rng.choice(x, n, replace=True).mean() for _ in range(10_000)]
print("bootstrap 95% CI:", np.percentile(boot, [2.5, 97.5]).round(2))

# Output:
# mean 31.75  sd 2.816  SE 0.996  t* 2.365
# 95% CI: 29.40 to 34.10
# t = 1.758, p = 0.1222
# A/B: rates [0.12 0.15], z = 1.963, two-sided p = 0.0496
# bootstrap 95% CI: [30.   33.62]` },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Reading p as the probability the null hypothesis is true", fix: "p assumes H₀ is true and measures how surprising the data is." },
              { mistake: "Treating p > 0.05 as proof of no effect", fix: "It means not enough evidence. Check the power and the confidence interval." },
              { mistake: "Confusing statistical and practical significance", fix: "With huge samples tiny, useless effects become \"significant\". Report effect sizes and intervals." },
              { mistake: "Running many tests and reporting the significant one", fix: "With 20 tests at α = 0.05, one false positive is expected. Pre-register or correct for multiple comparisons." },
              { mistake: "Bootstrapping rows when rows are not independent", fix: "Resample the independent unit (customers, days, patients)." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Why n − 1?** Deviations are measured from the sample mean, which is itself fitted to the data, so they are slightly too small on average. Dividing by $n - 1$ instead of $n$ corrects that bias (Bessel's correction)." },
          { p: "**Confidence interval ⇔ test.** A two-sided test at α = 0.05 rejects $H_0: \\mu = \\mu_0$ exactly when $\\mu_0$ lies outside the 95% confidence interval. Our interval [29.40, 34.10] contains 30, matching p = 0.12 > 0.05." },
          { p: "**Comparing two ML models.** Evaluate both on the same test rows and analyse the paired differences (McNemar's test for classifiers, or a paired bootstrap), because the two models' errors on the same rows are correlated." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "A sample of 25 has mean 80 and standard deviation 10. Compute the SE and an approximate 95% CI (use t* ≈ 2.06).", solution: [{ p: "SE = 10/√25 = 2. CI = 80 ± 2.06 × 2 = [75.88, 84.12]." }] } },
          { problem: { q: "A test gives p = 0.003. A colleague says \"there is a 0.3% chance the null is true\". What is wrong?", solution: [{ p: "p is P(data this extreme | H₀ true), not P(H₀ true | data). Turning one into the other needs a prior (Bayes' rule). The right statement: if H₀ were true, data this extreme would happen only 0.3% of the time." }] } },
          { problem: { q: "You want to know whether payment method (card, UPI, cash) is related to whether a customer churns. Which test?", solution: [{ p: "Both variables are categorical, so use a chi-square test of independence on the 3 × 2 table of counts." }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Difference between standard deviation and standard error?", "Interpret a 95% confidence interval correctly.", "What is a p-value? What is it not?", "Type I vs Type II error; what is power?", "How would you test whether a new model improved conversion?", "What is the bootstrap and when do you use it?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["SE = s/√n measures how much a sample mean varies; more data gives a smaller SE.", "CI = estimate ± t*·SE; \"95%\" describes the method's long-run hit rate.", "Test: assume H₀, compute how surprising the data is (p-value), and reject if p < α.", "Pick the test by question and data type; report effect sizes, not just p.", "The bootstrap gives intervals for any statistic, provided you resample the right unit."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Sample size goes from 100 to 400. The standard error…", options: ["doubles", "halves", "stays the same", "quarters"], answer: 1, why: "SE = s/√n; √400 is twice √100, so the SE halves." } },
          { quiz: { q: "A 95% CI for a difference in means is [−0.5, 2.1]. A test of \"no difference\" at α = 0.05 would…", options: ["reject", "not reject", "need more information", "give p = 0.95"], answer: 1, why: "0 is inside the interval, so the matching two-sided test does not reject." } },
          { quiz: { q: "To put an interval around a model's test-set F1 score, the simplest general method is…", options: ["a t-test", "bootstrapping the test rows", "chi-square", "increasing the threshold"], answer: 1, why: "F1 has no simple standard-error formula; resampling the test rows and recomputing F1 gives its sampling distribution." } },
        ],
      },
    ],
  },

  // ───────────────────────────────────────────── GD variants
  {
    slug: "gradient-descent-variants",
    group: "Foundations",
    title: "Gradient Descent Variants: Batch, Stochastic & Mini-batch",
    summary: "How much data to use per step, why scaling changes the path, the curvature limit on the learning rate, and how to check a gradient numerically.",
    learnHref: "/learn/gradient-descent",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Every gradient descent step uses some of the data to estimate the downhill direction; batch uses all of it, stochastic uses one row, and mini-batch uses a small handful, trading accuracy per step for speed per step." } },
          { p: "You know the update rule $w \\leftarrow w - \\eta\\,\\nabla L(w)$ (see Gradient Descent). But $L$ is an average over all training rows, so computing its exact gradient means touching every row, for every single step. With a million rows that is slow. This page answers four practical questions in order: how many rows per step, why scaling matters, how big a step is safe, and how to know your gradient code is right." },
        ],
      },
      {
        heading: "Step 1: batch gradient descent",
        blocks: [
          { p: "Use **all** $n$ rows to compute the gradient, then take one step:" },
          { math: r`\mathbf w \leftarrow \mathbf w - \eta \cdot \frac{1}{n}\sum_{i=1}^{n} \nabla \ell_i(\mathbf w)` },
          { list: ["**Pro:** the exact gradient; smooth, predictable progress.", "**Con:** one step costs a full pass over the data. With huge datasets that is very slow, and the data may not fit in memory."] },
        ],
      },
      {
        heading: "Step 2: stochastic gradient descent (SGD)",
        blocks: [
          { p: "Use **one random row** per step:" },
          { math: r`\mathbf w \leftarrow \mathbf w - \eta\, \nabla \ell_i(\mathbf w), \qquad i \text{ chosen at random}` },
          { p: "One row's gradient is a noisy estimate of the full gradient, but on average it points the right way (it is an **unbiased** estimate). You get $n$ cheap steps for the cost of one batch step." },
          { list: ["**Pro:** fast, light on memory, works on streaming data; the noise can even help escape shallow bad spots.", "**Con:** a jittery path that never fully settles unless the learning rate shrinks over time."] },
        ],
      },
      {
        heading: "Step 3: mini-batch, the practical middle",
        blocks: [
          { p: "Use a small random batch $B$ of rows (typically 32–512):" },
          { math: r`\mathbf w \leftarrow \mathbf w - \eta \cdot \frac{1}{|B|}\sum_{i \in B} \nabla \ell_i(\mathbf w)` },
          { p: "Averaging $|B|$ gradients cuts the noise (its standard deviation falls like $1/\\sqrt{|B|}$), and GPUs process a batch of rows in parallel almost as fast as a single row. Nearly all deep learning uses mini-batches. One full pass over the data is called an **epoch**: with 1000 rows and batch size 32 that is 32 updates per epoch." },
          {
            steps: [
              { title: "One mini-batch by hand", body: "Model ŷ = w·x, loss (ŷ − y)², current w = 1. Batch: (x, y) = (1, 3) and (2, 5)." },
              { title: "Per-row gradients", body: "d/dw (wx − y)² = 2(wx − y)x.", math: r`2(1 - 3)(1) = -4, \qquad 2(2 - 5)(2) = -12` },
              { title: "Average and step (η = 0.1)", body: "", math: r`\bar g = \frac{-4 - 12}{2} = -8, \qquad w \leftarrow 1 - 0.1 \times (-8) = 1.8` },
              { title: "Check", body: "The best w for these two rows is about 2.6, so the step moved w the right way, and a smaller step than a full jump." },
            ],
          },
          { figure: { src: "/theory/figures/basics_gd_variants.svg", alt: "Left: training loss against update number for batch, mini-batch and stochastic; batch and mini-batch drop quickly and overlap, stochastic is noisy and slower. Right: zig-zag path on stretched contours vs a straight path on round contours.", caption: "Left: per update, mini-batch (32 rows) is almost as good as full batch at a tiny fraction of the cost, while single-row SGD is noisy. Right: when features have very different scales the loss bowl is stretched and gradient descent zig-zags (red); after scaling it heads straight to the minimum (green)." } },
        ],
      },
      {
        heading: "Step 4: why feature scaling changes the path",
        blocks: [
          { p: "If one feature is in rupees (values in lakhs) and another is a 0–1 ratio, the loss surface becomes a long, narrow valley. The gradient points mostly across the valley, not along it, so steps bounce from wall to wall. And the learning rate must be small enough for the steep direction, which makes progress along the flat direction painfully slow." },
          { p: "**Standardising** each feature (subtract the mean, divide by the standard deviation) makes the bowl rounder, so the gradient points nearly straight at the minimum. Same model, same optimum, far fewer steps." },
        ],
      },
      {
        heading: "Step 5: how big can a step be? The curvature limit",
        blocks: [
          { p: "Take the simplest bowl, $f(w) = \\tfrac{L}{2}w^2$, whose curvature (second derivative) is $L$. One gradient step gives:" },
          { math: r`w \leftarrow w - \eta L w = (1 - \eta L)\, w` },
          { list: ["If $|1 - \\eta L| < 1$, i.e. $0 < \\eta < 2/L$, $w$ shrinks every step: convergence.", "At $\\eta = 1/L$ it lands on the minimum in one step.", "If $\\eta > 2/L$, $|1 - \\eta L| > 1$: every step overshoots further and $w$ explodes."] },
          { figure: { src: "/theory/figures/basics_lr_limit.svg", alt: "Three paths of w: η=0.3 decays smoothly, η=0.9 oscillates but decays, η=1.05 oscillates with growing size.", caption: "For $f(w) = w^2$ (curvature $L = 2$) the limit is $\\eta < 1$. At 0.3 it glides in, at 0.9 it overshoots but still settles, and at 1.05 every overshoot grows: divergence." } },
          { p: "With many weights, the limit is set by the **steepest** direction: $\\eta < 2/\\lambda_{\\max}$, where $\\lambda_{\\max}$ is the largest eigenvalue of the Hessian. Unscaled features make $\\lambda_{\\max}$ huge, which is the mathematical reason they force a tiny learning rate." },
        ],
      },
      {
        heading: "Step 6: check your gradient with finite differences",
        blocks: [
          { p: "A bug in hand-written gradient code can still \"train\", just badly. Compare it with a numerical estimate from the definition of a derivative:" },
          { math: r`\frac{\partial L}{\partial w_j} \approx \frac{L(\mathbf w + \epsilon\,\mathbf e_j) - L(\mathbf w - \epsilon\,\mathbf e_j)}{2\epsilon}, \qquad \epsilon \approx 10^{-6}` },
          { p: "($\\mathbf e_j$ is the vector with 1 in position $j$.) If the analytic and numerical gradients agree to many decimal places, the code is right. This check is slow, so use it while developing, not during training." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          { code: r`import numpy as np

rng = np.random.default_rng(0)
n = 1000
x = rng.uniform(0, 10, n)
y = 4 + 3 * x + rng.normal(0, 2, n)            # true line: intercept 4, slope 3
X = np.c_[np.ones(n), (x - x.mean()) / x.std()]  # scaled feature (see "scaling" above)

def mse_grad(w, Xb, yb):
    return 2 / len(yb) * Xb.T @ (Xb @ w - yb)   # gradient of mean squared error

def train(batch_size, lr=0.1, epochs=20):
    w = np.zeros(2)
    for _ in range(epochs):
        idx = rng.permutation(n)                 # shuffle every epoch
        for start in range(0, n, batch_size):
            b = idx[start:start + batch_size]
            w -= lr * mse_grad(w, X[b], y[b])
    loss = np.mean((X @ w - y) ** 2)
    updates = epochs * int(np.ceil(n / batch_size))
    return w, loss, updates

for name, bs in [("batch (all 1000)", n), ("mini-batch (32)", 32), ("stochastic (1)", 1)]:
    w, loss, updates = train(bs, lr=0.1 if bs > 1 else 0.01)
    print(f"{name:<18} weights {w.round(3)}  MSE {loss:.3f}  updates {updates}")

best = np.linalg.lstsq(X, y, rcond=None)[0]
print(f"{'exact least squares':<18} weights {best.round(3)}  MSE {np.mean((X @ best - y) ** 2):.3f}")
print("(slope is per standard deviation of x: 3 x", round(x.std(), 2), "=", round(3 * x.std(), 2), ")")

# Finite-difference check: does our analytic gradient match a numerical one?
w0 = np.array([1.0, -2.0]); eps = 1e-6
num = np.array([(np.mean((X @ (w0 + eps * e) - y) ** 2) - np.mean((X @ (w0 - eps * e) - y) ** 2)) / (2 * eps) for e in np.eye(2)])
print("analytic gradient :", mse_grad(w0, X, y).round(5))
print("numerical gradient:", num.round(5))

# Output:
# batch (all 1000)   weights [19.259  8.427]  MSE 4.267  updates 20
# mini-batch (32)    weights [19.543  8.625]  MSE 4.220  updates 640
# stochastic (1)     weights [19.376  8.871]  MSE 4.337  updates 20000
# exact least squares weights [19.483  8.526]  MSE 4.206
# (slope is per standard deviation of x: 3 x 2.85 = 8.54 )
# analytic gradient : [-36.96638 -21.05154]
# numerical gradient: [-36.96638 -21.05154]` },
          { p: "After the same 20 epochs, all three land near the exact least-squares answer. Mini-batch gets there with modest cost per update, which is why it is the default in practice." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Not shuffling the data between epochs", fix: "Ordered data (e.g. sorted by label) gives biased mini-batches. Shuffle every epoch." },
              { mistake: "Keeping a constant learning rate with SGD", fix: "Decay it over time (or use Adam) so the noisy steps settle." },
              { mistake: "Skipping feature scaling", fix: "Standardise features; otherwise you need a tiny learning rate and many more steps." },
              { mistake: "Comparing optimisers by epochs only", fix: "Also compare wall-clock time and number of updates; their costs per epoch differ." },
              { mistake: "Trusting hand-written gradients", fix: "Run a finite-difference check on a few weights first." },
            ],
          },
        ],
      },
      {
        heading: "Explained in depth",
        blocks: [
          { p: "**Batch size and learning rate move together.** A larger batch gives a less noisy gradient, so a larger learning rate becomes safe. A common heuristic scales the learning rate roughly in proportion to the batch size (with a warm-up period)." },
          { p: "**Momentum and Adam** build on mini-batch SGD. Momentum keeps a running average of past gradients, which smooths zig-zags in narrow valleys. Adam also rescales each weight's step by a running estimate of its gradient size, a kind of automatic per-feature scaling. The page on training neural networks covers them." },
          { p: "**Optimisation ≠ generalisation.** Reaching a lower training loss is not the goal; a lower test error is. Early stopping on a validation set often matters more than squeezing out the last bit of training loss." },
        ],
      },
      {
        heading: "Practice problems",
        blocks: [
          { problem: { q: "You have 50,000 rows and batch size 250. How many updates are in one epoch, and in 10 epochs?", solution: [{ p: "50,000 / 250 = 200 updates per epoch, so 2,000 updates in 10 epochs. Batch GD would make only 10 updates in the same 10 passes." }] } },
          { problem: { q: "Loss $f(w) = 5w^2$. What is the largest learning rate that still converges, and which rate converges in one step?", solution: [{ p: "Curvature L = f''(w) = 10. Convergence needs η < 2/10 = 0.2. One step: η = 1/L = 0.1." }] } },
          { problem: { q: "With w = 0 and the batch (x, y) = (1, 2), (3, 6) for ŷ = wx and squared error, compute one mini-batch step with η = 0.05.", solution: [{ p: "Gradients 2(0·1 − 2)(1) = −4 and 2(0·3 − 6)(3) = −36; average −20. w ← 0 − 0.05 × (−20) = 1.0. (The best w here is 2.)" }] } },
        ],
      },
      {
        heading: "Interview and viva questions",
        blocks: [
          { list: ["Compare batch, stochastic and mini-batch gradient descent.", "Why is the SGD gradient an unbiased estimate?", "What is an epoch?", "Why does feature scaling speed up gradient descent?", "What sets the maximum stable learning rate?", "How do you verify a hand-coded gradient?"] },
        ],
      },
      {
        heading: "Summary",
        blocks: [
          { list: ["Batch: exact gradient, one step per pass. SGD: one row per step, noisy but cheap. Mini-batch: the practical middle.", "An epoch = one pass over the data; updates per epoch = n / batch size.", "Scaling features rounds the loss bowl and removes zig-zagging.", "Stable learning rate: $\\eta < 2/\\lambda_{\\max}$ (twice over the steepest curvature).", "Check gradients numerically with central differences before trusting them."] },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Which variant uses the exact gradient of the training loss at every step?", options: ["stochastic", "mini-batch", "batch", "all of them"], answer: 2, why: "Only batch gradient descent averages over every training row for each step." } },
          { quiz: { q: "Training loss explodes after a few steps. The most likely fix is…", options: ["increase the learning rate", "decrease the learning rate", "add more epochs", "remove shuffling"], answer: 1, why: "Exploding loss is the signature of $\\eta > 2/\\lambda_{\\max}$: steps overshoot by more each time." } },
          { quiz: { q: "Why does mini-batch training suit GPUs?", options: ["it needs no gradients", "a batch of rows can be processed in parallel almost as fast as one row", "it uses less data overall", "it avoids scaling"], answer: 1, why: "GPUs perform the same operation on many rows at once, so a batch costs little more than a single row while giving a much less noisy gradient." } },
        ],
      },
    ],
  },
];
