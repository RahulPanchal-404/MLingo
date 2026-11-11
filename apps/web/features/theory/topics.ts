/**
 * Theory & Math: the formal side of every topic. Text uses $…$ for inline maths;
 * `math` blocks are display equations (KaTeX syntax).
 */
export type Block = { p: string } | { math: string } | { list: string[] } | { code: string };
export type Section = { heading: string; blocks: Block[] };
export type TheoryTopic = {
  slug: string;
  group: "Prerequisites" | "Foundations" | "Regression" | "Classification" | "Clustering" | "Neural networks" | "Workflow";
  title: string;
  summary: string;
  /** Matching lesson or lab, if there is one. */
  learnHref?: string;
  /** Matching game level, if there is one. */
  playHref?: string;
  sections: Section[];
};

import { PREREQ_THEORY } from "./prereq-topics";

const r = String.raw;

const CORE_THEORY: TheoryTopic[] = [
  // ======================= Foundations =======================
  {
    slug: "what-is-machine-learning",
    group: "Foundations",
    title: "What is Machine Learning?",
    summary: "Learning a function from examples instead of writing rules by hand.",
    learnHref: "/learn/what-is-machine-learning",
    sections: [
      {
        heading: "The setup",
        blocks: [
          { p: "We have a dataset of $n$ examples. Each example has a feature vector $\\mathbf{x}_i \\in \\mathbb{R}^d$ and (in supervised learning) a target $y_i$." },
          { math: r`\mathcal{D} = \{(\mathbf{x}_1, y_1), (\mathbf{x}_2, y_2), \dots, (\mathbf{x}_n, y_n)\}` },
          { p: "A model is a function $f_\\theta$ with parameters $\\theta$ that maps features to a prediction $\\hat{y} = f_\\theta(\\mathbf{x})$. Learning means choosing $\\theta$ so the predictions are good." },
        ],
      },
      {
        heading: "Types of learning",
        blocks: [
          {
            list: [
              "Supervised: targets are given. Regression if $y \\in \\mathbb{R}$, classification if $y$ is a category.",
              "Unsupervised: no targets. Find structure, such as clusters, in the $\\mathbf{x}_i$ alone.",
              "Reinforcement: an agent learns from rewards over time (not covered here).",
            ],
          },
        ],
      },
      {
        heading: "Learning as optimisation",
        blocks: [
          { p: "We define a loss $\\ell(\\hat{y}, y)$ for one example and minimise the average loss over the data (the empirical risk):" },
          { math: r`\theta^* = \arg\min_\theta \; \frac{1}{n}\sum_{i=1}^{n} \ell\big(f_\theta(\mathbf{x}_i),\, y_i\big)` },
          { p: "What we really care about is the expected loss on new data from the same distribution. The gap between the two is the generalisation gap, which is why we evaluate on held-out data." },
        ],
      },
    ],
  },
  {
    slug: "how-models-learn",
    group: "Foundations",
    title: "How Models Learn",
    summary: "Predict, measure the error, compute the gradient, update. Repeat.",
    learnHref: "/learn/how-models-learn",
    sections: [
      {
        heading: "The training loop",
        blocks: [
          { list: ["Forward pass: compute $\\hat{y}_i = f_\\theta(\\mathbf{x}_i)$.", "Loss: $L(\\theta) = \\frac{1}{n}\\sum_i \\ell(\\hat{y}_i, y_i)$.", "Gradient: $\\nabla_\\theta L$, the direction of steepest increase.", "Update: move $\\theta$ a small step against the gradient."] },
          { math: r`\theta_{t+1} = \theta_t - \alpha \, \nabla_\theta L(\theta_t)` },
        ],
      },
      {
        heading: "Epochs, batches and SGD",
        blocks: [
          { p: "An epoch is one pass over the whole dataset. Full-batch gradient descent uses all $n$ examples per update. Stochastic gradient descent (SGD) estimates the gradient from a mini-batch $B$:" },
          { math: r`\nabla_\theta L \approx \frac{1}{|B|}\sum_{i \in B} \nabla_\theta\, \ell\big(f_\theta(\mathbf{x}_i), y_i\big)` },
          { p: "The estimate is noisy but much cheaper, and the noise can even help escape poor regions of the loss surface." },
        ],
      },
    ],
  },
  {
    slug: "loss-functions",
    group: "Foundations",
    title: "Loss Functions",
    summary: "MSE, MAE and cross-entropy: how we turn 'wrong' into a number.",
    learnHref: "/learn/loss-functions",
    playHref: "/games/bridge?level=line",
    sections: [
      {
        heading: "Regression losses",
        blocks: [
          { p: "Mean squared error squares each residual $e_i = \\hat{y}_i - y_i$, so large errors dominate:" },
          { math: r`\text{MSE} = \frac{1}{n}\sum_{i=1}^{n} (\hat{y}_i - y_i)^2 \qquad \text{MAE} = \frac{1}{n}\sum_{i=1}^{n} |\hat{y}_i - y_i|` },
          { p: "MSE is smooth with gradient $\\partial\\,\\text{MSE}/\\partial \\hat{y}_i = \\tfrac{2}{n}(\\hat{y}_i - y_i)$, and it corresponds to assuming Gaussian noise. MAE is more robust to outliers but not differentiable at $0$." },
        ],
      },
      {
        heading: "Classification loss: cross-entropy",
        blocks: [
          { p: "For a predicted probability $p_i = P(y_i = 1)$, binary cross-entropy (log-loss) is:" },
          { math: r`\text{BCE} = -\frac{1}{n}\sum_{i=1}^{n} \Big[ y_i \log p_i + (1 - y_i)\log(1 - p_i) \Big]` },
          { p: "It is the negative log-likelihood of a Bernoulli model. A confident wrong answer ($p \\to 0$ when $y = 1$) costs $-\\log p \\to \\infty$, so the model is pushed hard away from overconfidence." },
        ],
      },
    ],
  },
  {
    slug: "gradient-descent",
    group: "Foundations",
    title: "Gradient Descent",
    summary: "Follow the negative gradient downhill, and why scaling and momentum matter.",
    learnHref: "/learn/gradient-descent",
    playHref: "/games/descent?level=eyeball",
    sections: [
      {
        heading: "The update rule",
        blocks: [
          { p: "The gradient $\\nabla L(\\theta)$ points in the direction of steepest ascent. Taking a small step the other way decreases the loss (to first order):" },
          { math: r`\theta_{t+1} = \theta_t - \alpha\,\nabla L(\theta_t), \qquad L(\theta_{t+1}) \approx L(\theta_t) - \alpha\,\lVert \nabla L(\theta_t) \rVert^2` },
          { p: "Near a minimum $\\nabla L \\to 0$, so the steps shrink automatically even with a fixed $\\alpha$." },
        ],
      },
      {
        heading: "Example: linear regression",
        blocks: [
          { p: "For $\\hat{y} = wx + b$ and MSE loss the partial derivatives are:" },
          { math: r`\frac{\partial L}{\partial w} = \frac{2}{n}\sum_i (\hat{y}_i - y_i)\,x_i, \qquad \frac{\partial L}{\partial b} = \frac{2}{n}\sum_i (\hat{y}_i - y_i)` },
        ],
      },
      {
        heading: "Ill-conditioning and feature scaling",
        blocks: [
          { p: "Near a minimum the loss is roughly quadratic, $L \\approx \\tfrac{1}{2}(\\theta-\\theta^*)^\\top H (\\theta - \\theta^*)$. Gradient descent is stable only if $\\alpha < 2/\\lambda_{\\max}(H)$, and progress along the flattest direction is governed by $\\lambda_{\\min}$. The condition number $\\kappa = \\lambda_{\\max}/\\lambda_{\\min}$ measures how 'ravine-like' the bowl is." },
          { p: "Features on very different scales make $\\kappa$ huge. Standardizing each feature, $x' = (x - \\mu)/\\sigma$, makes the bowl rounder so one learning rate suits every direction." },
        ],
      },
      {
        heading: "Momentum",
        blocks: [
          { p: "Momentum keeps a running velocity, an exponentially weighted average of past gradients:" },
          { math: r`v_{t+1} = \beta\, v_t + \nabla L(\theta_t), \qquad \theta_{t+1} = \theta_t - \alpha\, v_{t+1}` },
          { p: "With $\\beta = 0.9$ the effective step in a consistent direction grows towards $\\alpha/(1-\\beta) = 10\\alpha$. That speed carries the parameters across small bumps and flat regions where plain gradient descent stalls." },
        ],
      },
    ],
  },
  {
    slug: "learning-rate",
    group: "Foundations",
    title: "Learning Rate",
    summary: "The stability limit 2/curvature, and what happens on either side of it.",
    learnHref: "/learn/learning-rate",
    playHref: "/games/descent?level=step-size",
    sections: [
      {
        heading: "One-dimensional analysis",
        blocks: [
          { p: "Take $L(w) = \\tfrac{c}{2}(w - w^*)^2$ with curvature $c$. One gradient step gives:" },
          { math: r`w_{t+1} - w^* = (1 - \alpha c)\,(w_t - w^*) \;\Rightarrow\; w_t - w^* = (1-\alpha c)^t (w_0 - w^*)` },
          {
            list: [
              "$0 < \\alpha < 1/c$: $0 < 1-\\alpha c < 1$, smooth monotone convergence (small $\\alpha$ = slow).",
              "$\\alpha = 1/c$: lands on the minimum in one step.",
              "$1/c < \\alpha < 2/c$: $-1 < 1-\\alpha c < 0$, oscillates but converges.",
              "$\\alpha > 2/c$: $|1-\\alpha c| > 1$, every step overshoots further. The loss diverges.",
            ],
          },
        ],
      },
      {
        heading: "In practice",
        blocks: [
          { p: "Real losses have many curvatures (the eigenvalues of the Hessian), so the largest one sets the stability limit. Practitioners use learning-rate schedules (decay, warm-up), adaptive optimisers such as Adam, and learning-rate range tests to find a good value." },
        ],
      },
    ],
  },

  // ======================= Regression =======================
  {
    slug: "linear-regression",
    group: "Regression",
    title: "Linear Regression",
    summary: "Least squares, the normal equations, and what the weights mean.",
    learnHref: "/learn/linear-regression",
    playHref: "/games/bridge?level=line",
    sections: [
      {
        heading: "Model",
        blocks: [
          { p: "With $d$ features, stacking the examples as rows of $X \\in \\mathbb{R}^{n \\times d}$ (plus a column of ones for the bias):" },
          { math: r`\hat{\mathbf{y}} = X\mathbf{w}, \qquad L(\mathbf{w}) = \frac{1}{n}\lVert X\mathbf{w} - \mathbf{y} \rVert^2` },
        ],
      },
      {
        heading: "Closed-form solution",
        blocks: [
          { p: "Setting the gradient $\\nabla L = \\tfrac{2}{n}X^\\top(X\\mathbf{w} - \\mathbf{y})$ to zero gives the normal equations:" },
          { math: r`X^\top X\,\mathbf{w} = X^\top \mathbf{y} \quad\Rightarrow\quad \mathbf{w}^* = (X^\top X)^{-1} X^\top \mathbf{y}` },
          { p: "For one feature this reduces to $w = \\frac{\\sum (x_i - \\bar{x})(y_i - \\bar{y})}{\\sum (x_i - \\bar{x})^2}$ and $b = \\bar{y} - w\\bar{x}$." },
          { p: "Solving costs $O(nd^2 + d^3)$; for very many features or rows, gradient descent is used instead." },
        ],
      },
      {
        heading: "Evaluating the fit",
        blocks: [
          { math: r`R^2 = 1 - \frac{\sum_i (y_i - \hat{y}_i)^2}{\sum_i (y_i - \bar{y})^2}` },
          { p: "$R^2 = 1$ is a perfect fit; $R^2 = 0$ is no better than always predicting the mean $\\bar{y}$." },
        ],
      },
      {
        heading: "Assumptions",
        blocks: [
          { list: ["The relationship is linear in the parameters.", "Errors are independent with constant variance; Gaussian errors make least squares the maximum-likelihood estimate.", "Features aren't perfectly collinear (otherwise $X^\\top X$ is not invertible)."] },
        ],
      },
    ],
  },
  {
    slug: "polynomial-regression",
    group: "Regression",
    title: "Polynomial Regression",
    summary: "Basis expansion, degree as complexity, and why test error turns upward.",
    learnHref: "/learn/polynomial-regression",
    playHref: "/games/bridge?level=degree",
    sections: [
      {
        heading: "Basis expansion",
        blocks: [
          { p: "Map each input to powers of itself and fit a linear model on the new features:" },
          { math: r`\phi(x) = (x, x^2, \dots, x^p), \qquad \hat{y} = b + \sum_{k=1}^{p} w_k x^k` },
          { p: "The model is non-linear in $x$ but still linear in $\\mathbf{w}$, so least squares still applies with $X$ replaced by the design matrix $\\Phi$." },
        ],
      },
      {
        heading: "Degree and generalisation",
        blocks: [
          { p: "Training MSE never increases as $p$ grows, because a degree-$p$ model contains every lower-degree model. With $n$ points, degree $p = n-1$ can interpolate them exactly, giving zero training error and usually wild oscillation between points." },
          { p: "Test error is U-shaped in $p$: it falls while the model learns real structure, then rises as it starts fitting noise. Choose $p$ by validation or cross-validation." },
        ],
      },
    ],
  },
  {
    slug: "regularization",
    group: "Regression",
    title: "Regularization: Ridge & Lasso",
    summary: "Penalised least squares, closed-form ridge, and why L1 gives exact zeros.",
    learnHref: "/learn/regularization",
    playHref: "/games/bridge?level=ridge",
    sections: [
      {
        heading: "Ridge (L2)",
        blocks: [
          { math: r`L_{\text{ridge}}(\mathbf{w}) = \frac{1}{n}\lVert X\mathbf{w} - \mathbf{y}\rVert^2 + \lambda \lVert \mathbf{w} \rVert_2^2 \;\Rightarrow\; \mathbf{w}^* = (X^\top X + n\lambda I)^{-1} X^\top \mathbf{y}` },
          { p: "Adding $n\\lambda I$ makes the matrix invertible even with collinear features, and shrinks every weight towards zero. The bias term is normally not penalised." },
        ],
      },
      {
        heading: "Lasso (L1)",
        blocks: [
          { math: r`L_{\text{lasso}}(\mathbf{w}) = \frac{1}{2n}\lVert X\mathbf{w} - \mathbf{y}\rVert^2 + \lambda \lVert \mathbf{w} \rVert_1` },
          { p: "There is no closed form. Coordinate descent updates one weight at a time with the soft-thresholding operator, where $\\rho_j$ is the correlation of feature $j$ with the current residual (excluding $j$):" },
          { math: r`w_j \leftarrow \frac{S(\rho_j, \lambda)}{\tfrac{1}{n}\sum_i x_{ij}^2}, \qquad S(\rho, \lambda) = \operatorname{sign}(\rho)\,\max(|\rho| - \lambda,\, 0)` },
          { p: "Whenever $|\\rho_j| \\le \\lambda$, the weight is set to exactly $0$: that's feature selection. Geometrically, the L1 ball has corners on the axes, and the loss contours tend to touch it there." },
        ],
      },
      {
        heading: "Choosing λ",
        blocks: [
          { p: "$\\lambda = 0$ recovers ordinary least squares (low bias, high variance). As $\\lambda \\to \\infty$ all weights go to zero (high bias, low variance). Pick $\\lambda$ by cross-validation, and standardize features first so the penalty treats them equally." },
        ],
      },
    ],
  },

  // ======================= Classification =======================
  {
    slug: "logistic-regression",
    group: "Classification",
    title: "Logistic Regression",
    summary: "The sigmoid, log-odds, cross-entropy and its gradient.",
    learnHref: "/learn/logistic-regression",
    playHref: "/games/threshold?level=sigmoid",
    sections: [
      {
        heading: "Model",
        blocks: [
          { math: r`z = \mathbf{w}^\top \mathbf{x} + b, \qquad p = \sigma(z) = \frac{1}{1 + e^{-z}}` },
          { p: "Equivalently the log-odds are linear: $\\log\\frac{p}{1-p} = \\mathbf{w}^\\top\\mathbf{x} + b$. A one-unit increase in $x_j$ multiplies the odds by $e^{w_j}$." },
        ],
      },
      {
        heading: "Training",
        blocks: [
          { p: "Minimise binary cross-entropy. Thanks to $\\sigma'(z) = \\sigma(z)(1-\\sigma(z))$ the gradient is remarkably simple:" },
          { math: r`\nabla_{\mathbf{w}} L = \frac{1}{n}\sum_{i=1}^{n} (p_i - y_i)\,\mathbf{x}_i, \qquad \frac{\partial L}{\partial b} = \frac{1}{n}\sum_{i=1}^n (p_i - y_i)` },
          { p: "The loss is convex, so gradient descent reaches the global minimum (if the classes are perfectly separable the weights grow without bound unless regularized)." },
        ],
      },
      {
        heading: "Decision boundary and threshold",
        blocks: [
          { p: "Predict class 1 when $p \\ge t$. For $t = 0.5$ the boundary is the hyperplane $\\mathbf{w}^\\top\\mathbf{x} + b = 0$. If a false negative costs $C_{FN}$ and a false positive $C_{FP}$, the expected-cost-minimising threshold is:" },
          { math: r`t^* = \frac{C_{FP}}{C_{FP} + C_{FN}}` },
          { p: "For example, if a miss costs 25 times a false alarm, $t^* = 1/26 \\approx 0.04$ (with calibrated probabilities)." },
        ],
      },
    ],
  },
  {
    slug: "k-nearest-neighbors",
    group: "Classification",
    title: "K-Nearest Neighbours",
    summary: "Distance metrics, majority voting, choosing K and the curse of dimensionality.",
    learnHref: "/learn/k-nearest-neighbors",
    playHref: "/games/sorter?level=knn",
    sections: [
      {
        heading: "Algorithm",
        blocks: [
          { p: "Store the training set. To classify $\\mathbf{x}$, find the set $N_K(\\mathbf{x})$ of the $K$ closest training points and vote:" },
          { math: r`\hat{y}(\mathbf{x}) = \arg\max_{c} \sum_{i \in N_K(\mathbf{x})} \mathbb{1}[y_i = c]` },
          { p: "Common distances: Euclidean $\\lVert\\mathbf{a}-\\mathbf{b}\\rVert_2$, Manhattan $\\lVert\\mathbf{a}-\\mathbf{b}\\rVert_1$, or cosine distance for text. Votes can be weighted by $1/d$." },
        ],
      },
      {
        heading: "Choosing K",
        blocks: [
          { p: "Small $K$ gives low bias and high variance: with $K = 1$ training accuracy is always 100% because every point is its own neighbour. Large $K$ averages over a wide region (high bias). Choose $K$ by cross-validation; odd $K$ avoids ties in two-class problems." },
        ],
      },
      {
        heading: "Scaling and dimensionality",
        blocks: [
          { p: "Distance sums over features, $d(\\mathbf{a},\\mathbf{b})^2 = \\sum_j (a_j - b_j)^2$, so a feature measured in hundreds swamps one measured in units. Standardize first." },
          { p: "In high dimensions all points become roughly equally far apart (the curse of dimensionality), so neighbours stop being meaningful. Prediction costs $O(nd)$ per query unless you use index structures like KD-trees." },
        ],
      },
    ],
  },
  {
    slug: "decision-trees",
    group: "Classification",
    title: "Decision Trees",
    summary: "Gini, entropy, information gain and greedy CART splitting.",
    learnHref: "/learn/decision-trees",
    playHref: "/games/sorter?level=tree",
    sections: [
      {
        heading: "Impurity measures",
        blocks: [
          { p: "For a node with class proportions $p_1, \\dots, p_K$:" },
          { math: r`\text{Gini} = 1 - \sum_{k=1}^{K} p_k^2, \qquad H = -\sum_{k=1}^{K} p_k \log_2 p_k` },
          { p: "Both are $0$ for a pure node and largest for an even mix (Gini $0.5$, entropy $1$ bit for two classes)." },
        ],
      },
      {
        heading: "Choosing a split",
        blocks: [
          { p: "A split sends $n_L$ examples left and $n_R$ right. Its quality is the drop in weighted impurity (information gain when using entropy):" },
          { math: r`\Delta = I(\text{parent}) - \frac{n_L}{n}\,I(\text{left}) - \frac{n_R}{n}\,I(\text{right})` },
          { p: "CART tries every feature and every threshold (midpoints between sorted values), takes the split with the largest $\\Delta$, and recurses on each child. This greedy search is fast but not guaranteed to find the globally best tree." },
        ],
      },
      {
        heading: "Controlling overfitting",
        blocks: [
          { list: ["Max depth and minimum samples per leaf stop growth early (pre-pruning).", "Cost-complexity pruning removes branches whose gain doesn't justify their size.", "Ensembles (random forests, gradient boosting) average many trees to cut variance."] },
          { p: "Trees split on thresholds, so they are unaffected by feature scaling and handle mixed feature types naturally." },
        ],
      },
    ],
  },
  {
    slug: "classification-metrics",
    group: "Classification",
    title: "Classification Metrics",
    summary: "Confusion matrix, precision, recall, F1, and the accuracy paradox.",
    playHref: "/games/threshold?level=fraud",
    sections: [
      {
        heading: "Confusion matrix",
        blocks: [
          { p: "Count true positives (TP), false positives (FP), false negatives (FN) and true negatives (TN). Then:" },
          { math: r`\text{Accuracy} = \frac{TP + TN}{TP + FP + FN + TN}, \quad \text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}` },
          { math: r`F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}` },
        ],
      },
      {
        heading: "The accuracy paradox",
        blocks: [
          { p: "If only a fraction $\\pi$ of examples are positive, the trivial model 'always negative' scores accuracy $1 - \\pi$ with zero recall. With $\\pi = 0.001$ that's 99.9% accuracy and useless. Use recall, precision, F1 or expected cost on imbalanced data." },
        ],
      },
      {
        heading: "Threshold curves",
        blocks: [
          { p: "Sweeping the threshold $t$ from 1 to 0 traces the ROC curve (true positive rate vs false positive rate) and the precision–recall curve. The area under the ROC curve (AUC) is the probability that a random positive is scored above a random negative." },
        ],
      },
    ],
  },

  // ======================= Clustering =======================
  {
    slug: "k-means",
    group: "Clustering",
    title: "K-Means",
    summary: "Lloyd's algorithm, why it converges, k-means++ and the elbow.",
    learnHref: "/learn/k-means",
    playHref: "/games/clusters?level=start",
    sections: [
      {
        heading: "Objective",
        blocks: [
          { p: "Partition the points into $K$ clusters $C_1,\\dots,C_K$ with centroids $\\boldsymbol{\\mu}_k$ to minimise the inertia (within-cluster sum of squares):" },
          { math: r`J = \sum_{k=1}^{K} \sum_{\mathbf{x}_i \in C_k} \lVert \mathbf{x}_i - \boldsymbol{\mu}_k \rVert^2` },
        ],
      },
      {
        heading: "Lloyd's algorithm",
        blocks: [
          { math: r`\text{Assign: } c_i = \arg\min_k \lVert \mathbf{x}_i - \boldsymbol{\mu}_k\rVert^2 \qquad \text{Update: } \boldsymbol{\mu}_k = \frac{1}{|C_k|}\sum_{\mathbf{x}_i \in C_k} \mathbf{x}_i` },
          { p: "Each step can only lower $J$: the assignment step picks the closest centroid for each point, and the mean is the point minimising squared distance to a set. Since there are finitely many partitions, the algorithm converges, but only to a local minimum." },
        ],
      },
      {
        heading: "Initialisation and K",
        blocks: [
          { p: "k-means++ picks the first centroid at random, then each next one with probability proportional to $D(\\mathbf{x})^2$, the squared distance to the nearest chosen centroid. This spreads the starts out and is $O(\\log K)$-competitive with the optimum in expectation." },
          { p: "$J$ decreases monotonically in $K$ (down to 0 at $K = n$), so choose $K$ at the elbow of the $J$ vs $K$ curve, or use the silhouette score. Standardize features first, because $J$ uses Euclidean distance." },
        ],
      },
    ],
  },
  {
    slug: "hierarchical-clustering",
    group: "Clustering",
    title: "Hierarchical Clustering",
    summary: "Agglomerative merging, linkage formulas and reading a dendrogram.",
    learnHref: "/learn/hierarchical-clustering",
    playHref: "/games/galaxy?level=dendro",
    sections: [
      {
        heading: "Agglomerative algorithm",
        blocks: [
          { list: ["Start with $n$ singleton clusters.", "Find the two clusters with the smallest linkage distance and merge them.", "Record the merge height; repeat until one cluster remains."] },
          { p: "A naive implementation costs $O(n^3)$ time; with priority queues $O(n^2 \\log n)$." },
        ],
      },
      {
        heading: "Linkage",
        blocks: [
          { math: r`d_{\text{single}}(A,B) = \min_{a \in A, b \in B} d(a,b), \qquad d_{\text{complete}}(A,B) = \max_{a \in A, b \in B} d(a,b)` },
          { math: r`d_{\text{average}}(A,B) = \frac{1}{|A||B|}\sum_{a \in A}\sum_{b \in B} d(a,b)` },
          { p: "Ward's method merges the pair that least increases the total within-cluster variance. Single linkage can follow arbitrary chains (and suffers from chaining through bridge points); complete linkage favours compact clusters of similar diameter." },
        ],
      },
      {
        heading: "The dendrogram",
        blocks: [
          { p: "Each merge is drawn at its height. Cutting at height $h$ gives the clusters formed from merges below $h$. A long vertical gap means the clusters below it are well separated, which is a natural place to cut." },
        ],
      },
    ],
  },
  {
    slug: "dbscan",
    group: "Clustering",
    title: "DBSCAN",
    summary: "ε-neighbourhoods, core points, density reachability and noise.",
    learnHref: "/learn/dbscan",
    playHref: "/games/galaxy?level=eps",
    sections: [
      {
        heading: "Definitions",
        blocks: [
          { math: r`N_\varepsilon(\mathbf{p}) = \{\mathbf{q} \in \mathcal{D} : d(\mathbf{p}, \mathbf{q}) \le \varepsilon\}` },
          { list: ["Core point: $|N_\\varepsilon(\\mathbf{p})| \\ge \\text{minPts}$ (counting itself).", "Directly density-reachable: $\\mathbf{q} \\in N_\\varepsilon(\\mathbf{p})$ with $\\mathbf{p}$ a core point.", "Density-reachable: connected through a chain of such steps. A cluster is a maximal set of density-connected points.", "Border points are reachable but not core; noise points are not reachable from any core point."] },
        ],
      },
      {
        heading: "Properties",
        blocks: [
          { p: "No $K$ is needed, clusters can have any shape, and outliers are labelled explicitly. With a spatial index the runtime is about $O(n \\log n)$; naively $O(n^2)$." },
          { p: "A single global $\\varepsilon$ struggles when clusters have very different densities (HDBSCAN and OPTICS address this). A common heuristic: plot each point's distance to its $k$-th nearest neighbour ($k = \\text{minPts}$) in sorted order and pick $\\varepsilon$ at the knee." },
        ],
      },
    ],
  },

  // ======================= Neural networks =======================
  {
    slug: "neural-networks",
    group: "Neural networks",
    title: "Neural Networks & Backpropagation",
    summary: "Layers, activations, the chain rule, and vanishing gradients.",
    learnHref: "/labs/neural-network",
    playHref: "/games/neurons?level=xor",
    sections: [
      {
        heading: "Forward pass",
        blocks: [
          { p: "A one-hidden-layer network with activation $g$:" },
          { math: r`\mathbf{h} = g(W_1 \mathbf{x} + \mathbf{b}_1), \qquad \hat{y} = \sigma(\mathbf{w}_2^\top \mathbf{h} + b_2)` },
          { p: "Without a non-linear $g$, the composition collapses to a single linear map $W_2 W_1 \\mathbf{x}$, so depth adds nothing. Common choices: $\\tanh(z)$, $\\sigma(z)$, $\\text{ReLU}(z) = \\max(0, z)$." },
        ],
      },
      {
        heading: "Backpropagation",
        blocks: [
          { p: "Apply the chain rule from the output backwards. With cross-entropy and a sigmoid output, $\\delta_{\\text{out}} = \\hat{y} - y$. Then:" },
          { math: r`\frac{\partial L}{\partial \mathbf{w}_2} = \delta_{\text{out}}\,\mathbf{h}, \qquad \boldsymbol{\delta}_h = (\mathbf{w}_2\,\delta_{\text{out}}) \odot g'(\mathbf{z}_1), \qquad \frac{\partial L}{\partial W_1} = \boldsymbol{\delta}_h\,\mathbf{x}^\top` },
          { p: "Each layer reuses the error signal from the layer above, so the full gradient costs about as much as one forward pass." },
        ],
      },
      {
        heading: "Why training gets stuck",
        blocks: [
          { list: ["Saturation: for large $|z|$, $\\sigma'(z) \\le 0.25$ and $\\tanh'(z) \\to 0$. Gradients vanish, especially with unscaled inputs. Standardize inputs and use sensible initialisation.", "Dead ReLUs: if $z < 0$ for every input, $\\text{ReLU}'(z) = 0$ and the unit never updates again. Too high a learning rate commonly causes this.", "Capacity: each hidden unit adds roughly one hyperplane to the decision boundary. Too few units underfit."] },
          { p: "The universal approximation theorem says a single hidden layer with enough units can approximate any continuous function on a compact set, but says nothing about how easy it is to train." },
        ],
      },
    ],
  },

  // ======================= Workflow =======================
  {
    slug: "feature-scaling",
    group: "Workflow",
    title: "Feature Scaling",
    summary: "Standardization, min–max scaling, and which models need them.",
    learnHref: "/workbench",
    playHref: "/games/sorter?level=scale",
    sections: [
      {
        heading: "Two common scalings",
        blocks: [
          { math: r`\text{Standardize: } x' = \frac{x - \mu}{\sigma} \qquad \text{Min–max: } x' = \frac{x - x_{\min}}{x_{\max} - x_{\min}}` },
          { p: "Fit $\\mu, \\sigma$ (or $x_{\\min}, x_{\\max}$) on the training set only, then apply the same transformation to validation and test data." },
        ],
      },
      {
        heading: "Who needs it",
        blocks: [
          { list: ["Distance-based: KNN, K-Means, DBSCAN, SVMs. Distances are dominated by large-scale features.", "Gradient-based: linear/logistic regression trained by gradient descent, neural networks. Scaling improves conditioning.", "Regularized models: the penalty $\\lambda\\lVert\\mathbf{w}\\rVert$ is only fair if features share a scale.", "Not needed: decision trees and tree ensembles, which split on thresholds."] },
        ],
      },
    ],
  },
  {
    slug: "train-test-split",
    group: "Workflow",
    title: "Train/Test Split & Data Leakage",
    summary: "Why we hold data out, cross-validation, and the ways information leaks.",
    learnHref: "/workbench",
    playHref: "/games/pipeline?level=leak",
    sections: [
      {
        heading: "Hold-out evaluation",
        blocks: [
          { p: "Split data into training (fit parameters), validation (choose hyperparameters) and test (final, one-time estimate). The test error estimates the true risk only if the test set influenced nothing." },
          { p: "$k$-fold cross-validation splits training data into $k$ folds, trains on $k-1$ and validates on the remaining one, rotating, and averages:" },
          { math: r`\text{CV}(\lambda) = \frac{1}{k}\sum_{j=1}^{k} L_{\text{fold } j}\big(\hat{f}_{\lambda}^{(-j)}\big)` },
        ],
      },
      {
        heading: "Leakage",
        blocks: [
          { list: ["Target leakage: a feature that is a consequence of the target or computed from it.", "Train–test contamination: fitting scalers, imputers, PCA or feature selection on all the data before splitting.", "Group leakage: the same entity (patient, user) in both train and test. Use group-aware splits.", "Temporal leakage: random splits on time series. Train on the past, test on the future."] },
          { p: "Rule of thumb: every step that learns from data must be fitted inside the training fold only. Pipelines enforce this automatically." },
        ],
      },
    ],
  },
  {
    slug: "bias-variance",
    group: "Workflow",
    title: "Bias, Variance & Overfitting",
    summary: "The bias–variance decomposition and how to diagnose a model.",
    learnHref: "/workbench",
    playHref: "/games/pipeline?level=overfit",
    sections: [
      {
        heading: "The decomposition",
        blocks: [
          { p: "For squared error, with $y = f(x) + \\varepsilon$ and noise variance $\\sigma^2$, the expected test error of a learned model $\\hat{f}$ at a point $x$ splits into three parts:" },
          { math: r`\mathbb{E}\big[(y - \hat{f}(x))^2\big] = \underbrace{\big(f(x) - \mathbb{E}[\hat{f}(x)]\big)^2}_{\text{bias}^2} + \underbrace{\operatorname{Var}\big(\hat{f}(x)\big)}_{\text{variance}} + \underbrace{\sigma^2}_{\text{irreducible}}` },
          { p: "Simple models have high bias (they can't represent $f$); flexible models have high variance (they change a lot with different training samples). Total error is minimised in between." },
        ],
      },
      {
        heading: "Diagnosis",
        blocks: [
          { list: ["High train error, high test error: underfitting (bias). Add features or capacity, reduce regularization.", "Low train error, high test error: overfitting (variance). Get more data, regularize, simplify, or stop early.", "Learning curves (error vs training-set size) show which regime you're in: a persistent gap means variance, two high converging curves mean bias."] },
        ],
      },
    ],
  },
];

export const THEORY: TheoryTopic[] = [...PREREQ_THEORY, ...CORE_THEORY];

export const THEORY_GROUPS = ["Prerequisites", "Foundations", "Regression", "Classification", "Clustering", "Neural networks", "Workflow"] as const;
export const getTheory = (slug: string) => THEORY.find((t) => t.slug === slug);
