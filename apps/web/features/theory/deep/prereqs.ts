import type { Deep } from "./types";

const r = String.raw;

export const DEEP_PREREQS: Record<string, Deep> = {
  "vectors-matrices-notation": {
    explain: [
      { p: "Think of a dataset with $n$ rows and $d$ columns as a matrix $\\mathbf{X}$ of shape $n \\times d$. Row $i$ is one example $\\mathbf{x}_i$; column $j$ is one feature across all examples. A linear model's weights $\\mathbf{w}$ form a vector of length $d$. The single product $\\mathbf{X}\\mathbf{w}$ computes a weighted sum for every row at once, giving $n$ predictions. Almost every formula in this course is built from a few such operations." },
      { p: "Notation used throughout: plain italics for scalars ($x$, $\\lambda$), bold lowercase for vectors ($\\mathbf{x}$, $\\mathbf{w}$), bold uppercase for matrices ($\\mathbf{X}$, $\\mathbf{W}$). Subscripts pick entries: $x_{ij}$ is row $i$, column $j$. Vectors are columns by default, so $\\mathbf{w}^\\top\\mathbf{x}$ (row times column) is a single number: the dot product." },
      {
        table: {
          head: ["Operation", "Notation", "Shape rule", "Meaning"],
          rows: [
            ["Transpose", "$\\mathbf{A}^\\top$", "$m \\times n \\to n \\times m$", "Swap rows and columns"],
            ["Dot product", "$\\mathbf{a}^\\top\\mathbf{b}$", "Both length $d$ → scalar", "Sum of products; similarity"],
            ["Matrix × vector", "$\\mathbf{A}\\mathbf{x}$", "$(m \\times n)(n) \\to m$", "Each row dotted with $\\mathbf{x}$"],
            ["Matrix × matrix", "$\\mathbf{A}\\mathbf{B}$", "$(m \\times n)(n \\times p) \\to m \\times p$", "All row–column dot products"],
            ["Element-wise", "$\\mathbf{a} \\odot \\mathbf{b}$", "Same shape", "Multiply matching entries"],
            ["Identity", "$\\mathbf{I}$", "Square", "$\\mathbf{A}\\mathbf{I} = \\mathbf{A}$"],
            ["Inverse", "$\\mathbf{A}^{-1}$", "Square, invertible", "$\\mathbf{A}^{-1}\\mathbf{A} = \\mathbf{I}$"],
          ],
        },
      },
      { p: "The dot product has a geometric meaning: $\\mathbf{a}^\\top\\mathbf{b} = \\lVert\\mathbf{a}\\rVert\\,\\lVert\\mathbf{b}\\rVert\\cos\\theta$, where $\\theta$ is the angle between them. It is positive when they point in similar directions, zero when perpendicular (**orthogonal**), negative when opposite. Dividing by the lengths gives **cosine similarity**, used to compare documents and embeddings." },
      { p: "**Inverse and determinant.** A square matrix is invertible when it does not squash space flat. The determinant measures how much a matrix scales area (2-D) or volume; if it is 0, the matrix squashes some direction to nothing and has no inverse. For a 2 × 2 matrix:" },
      { math: r`\mathbf{A} = \begin{bmatrix} a & b \\ c & d \end{bmatrix}, \quad \det\mathbf{A} = ad - bc, \quad \mathbf{A}^{-1} = \frac{1}{ad - bc}\begin{bmatrix} d & -b \\ -c & a \end{bmatrix}` },
      { p: "**Rank** is the number of truly independent columns. If one feature is an exact copy (or combination) of others, $\\mathbf{X}$ loses rank and $\\mathbf{X}^\\top\\mathbf{X}$ cannot be inverted, which is why perfectly correlated features break the normal equation of linear regression." },
      { p: "**Eigenvectors** of a square matrix $\\mathbf{A}$ are directions it only stretches, without turning: $\\mathbf{A}\\mathbf{v} = \\lambda\\mathbf{v}$. The stretch factor $\\lambda$ is the eigenvalue. PCA uses the eigenvectors of the covariance matrix; the eigenvalues of the Hessian describe the curvature that limits gradient descent's learning rate." },
    ],
    practice: [
      {
        q: "Compute $\\mathbf{A}\\mathbf{x}$ for $\\mathbf{A} = \\begin{bmatrix} 1 & 2 \\\\ 3 & 4 \\\\ 0 & -1 \\end{bmatrix}$, $\\mathbf{x} = (2, 1)$.",
        solution: [{ math: r`\mathbf{A}\mathbf{x} = (1 \cdot 2 + 2 \cdot 1,\; 3 \cdot 2 + 4 \cdot 1,\; 0 \cdot 2 - 1 \cdot 1) = (4,\; 10,\; -1)` }],
      },
      {
        q: "Find the determinant and inverse of $\\begin{bmatrix} 4 & 7 \\\\ 2 & 6 \\end{bmatrix}$.",
        solution: [{ math: r`\det = 24 - 14 = 10, \qquad \mathbf{A}^{-1} = \frac{1}{10}\begin{bmatrix} 6 & -7 \\ -2 & 4 \end{bmatrix} = \begin{bmatrix} 0.6 & -0.7 \\ -0.2 & 0.4 \end{bmatrix}` }],
      },
      {
        q: "Cosine similarity of $\\mathbf{a} = (1, 2, 2)$ and $\\mathbf{b} = (2, 0, 1)$.",
        solution: [{ math: r`\frac{2 + 0 + 2}{\sqrt{9}\,\sqrt{5}} = \frac{4}{3 \times 2.236} \approx 0.596` }],
      },
      {
        q: "Verify that $\\mathbf{v} = (1, 1)$ is an eigenvector of $\\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$ and find its eigenvalue.",
        solution: [{ math: r`\begin{bmatrix} 2 & 1 \\ 1 & 2 \end{bmatrix}\begin{bmatrix} 1 \\ 1 \end{bmatrix} = \begin{bmatrix} 3 \\ 3 \end{bmatrix} = 3\begin{bmatrix} 1 \\ 1 \end{bmatrix} \;\Rightarrow\; \lambda = 3` }],
      },
    ],
    interview: [
      { q: "What does the dot product tell you geometrically?", a: "How aligned two vectors are: |a||b|cos θ. Positive for similar directions, zero for perpendicular, negative for opposite. Normalised, it is cosine similarity." },
      { q: "Why does a singular matrix matter in ML?", a: "A singular (non-invertible) XᵀX means some features are exact linear combinations of others, so the least-squares weights are not unique. Remove redundant features or add ridge regularisation, which makes XᵀX + λI invertible." },
      { q: "What is an eigenvector, intuitively?", a: "A direction that the matrix only stretches or flips, without rotating. The eigenvalue is how much it is stretched." },
    ],
    summary: [
      "Data matrix X is n × d; weights w have length d; Xw gives all predictions.",
      "Matrix multiply needs matching inner sizes: (m × n)(n × p) → m × p.",
      "Dot product = alignment; cosine similarity normalises it.",
      "Determinant 0 ⇔ no inverse ⇔ redundant columns.",
      "Eigenvectors: directions only stretched; used in PCA and curvature.",
    ],
    quiz: [
      { q: "Two vectors have dot product 0. They are:", options: ["Identical", "Orthogonal (perpendicular)", "Opposite", "Both zero"], answer: 1, why: "cos θ = 0 means θ = 90°." },
      { q: "det of [[3, 6], [1, 2]] is:", options: ["0", "12", "6", "−6"], answer: 0, why: "3 × 2 − 6 × 1 = 0, so the matrix is not invertible (the second column is twice the first)." },
      { q: "If X is 100 × 5, what is the shape of XᵀX?", options: ["100 × 100", "5 × 5", "5 × 100", "100 × 5"], answer: 1, why: "(5 × 100)(100 × 5) = 5 × 5." },
    ],
  },

  "derivatives-chain-rule": {
    explain: [
      { p: "A derivative is a rate of change: how fast the output moves when the input moves a tiny amount. Formally it is the limit of the slope between two points as they get closer:" },
      { math: r`f'(x) = \lim_{h \to 0}\frac{f(x + h) - f(x)}{h}` },
      { p: "In ML the 'input' is a parameter and the 'output' is the loss. The derivative tells you whether to increase or decrease the parameter, and roughly by how much the loss will change. Positive derivative: increasing the parameter increases the loss, so decrease it. Negative: increase it. Zero: you are at a flat point (a minimum, maximum or saddle)." },
      {
        table: {
          head: ["Function", "Derivative", "Where it appears"],
          rows: [
            ["$x^n$", "$nx^{n-1}$", "Squared error, polynomials"],
            ["$e^x$", "$e^x$", "Softmax, sigmoid"],
            ["$\\ln x$", "$1/x$", "Cross-entropy, log-likelihood"],
            ["$\\sigma(x) = 1/(1 + e^{-x})$", "$\\sigma(x)(1 - \\sigma(x))$", "Logistic regression, neural nets"],
            ["$\\tanh x$", "$1 - \\tanh^2 x$", "Neural nets"],
            ["$\\text{ReLU}(x) = \\max(0, x)$", "1 if $x > 0$, 0 if $x < 0$", "Neural nets"],
            ["$|x|$", "$\\operatorname{sign}(x)$ (undefined at 0)", "MAE, lasso"],
          ],
        },
      },
      { p: "The combination rules: **sum** $(f + g)' = f' + g'$; **constant multiple** $(cf)' = cf'$; **product** $(fg)' = f'g + fg'$; **quotient** $(f/g)' = (f'g - fg')/g^2$; **chain** $(f(g(x)))' = f'(g(x))\\,g'(x)$. The chain rule is the one that powers backpropagation: a network is a long chain of functions, and its gradient is the product of each link's local derivative." },
      { p: "**Second derivative and convexity.** The second derivative $f''(x)$ is the rate of change of the slope: how curved the function is. If $f''(x) > 0$ everywhere, the function is **convex** (bowl-shaped), and any point with $f'(x) = 0$ is the global minimum. MSE for linear regression and cross-entropy for logistic regression are convex, which is why their training is reliable." },
      { p: "**Linear approximation.** Near a point, a smooth function looks like a straight line: $f(x + h) \\approx f(x) + f'(x)h$. This is exactly the reasoning behind gradient descent: a small step $h = -\\eta f'(x)$ changes the loss by about $-\\eta f'(x)^2$, which is negative, so the loss goes down if the step is small enough." },
    ],
    practice: [
      {
        q: "Differentiate $f(x) = 3x^4 - 2x^2 + 5x - 7$.",
        solution: [{ math: r`f'(x) = 12x^3 - 4x + 5` }],
      },
      {
        q: "Use the chain rule: $f(x) = (2x + 1)^3$ and $g(x) = \\ln(1 + x^2)$.",
        solution: [{ math: r`f'(x) = 3(2x + 1)^2 \cdot 2 = 6(2x + 1)^2, \qquad g'(x) = \frac{2x}{1 + x^2}` }],
      },
      {
        q: "Show that $\\sigma'(x) = \\sigma(x)(1 - \\sigma(x))$ and evaluate it at $x = 0$.",
        solution: [
          { math: r`\sigma(x) = (1 + e^{-x})^{-1} \;\Rightarrow\; \sigma'(x) = \frac{e^{-x}}{(1 + e^{-x})^2} = \frac{1}{1 + e^{-x}}\cdot\frac{e^{-x}}{1 + e^{-x}} = \sigma(x)(1 - \sigma(x))` },
          { p: "At 0: $\\sigma(0) = 0.5$, so $\\sigma'(0) = 0.25$, the sigmoid's steepest slope. It is never larger, which is one reason deep sigmoid networks suffer vanishing gradients." },
        ],
      },
      {
        q: "Find the minimum of $L(w) = w^2 - 6w + 10$ using derivatives and confirm it is a minimum.",
        solution: [{ p: "$L'(w) = 2w - 6 = 0 \\Rightarrow w = 3$. $L''(w) = 2 > 0$, so convex: global minimum $L(3) = 1$." }],
      },
    ],
    interview: [
      { q: "Why is the chain rule central to deep learning?", a: "A neural network is a composition of many functions. The chain rule expresses the derivative of the loss with respect to any early weight as a product of local derivatives along the path, which backpropagation computes efficiently from the output backwards." },
      { q: "What does a second derivative tell you about optimisation?", a: "Curvature. Positive second derivative means a bowl (a minimum at a zero slope); large curvature means a smaller safe learning rate. Convex functions (non-negative second derivative everywhere) have no bad local minima." },
      { q: "ReLU is not differentiable at 0. Is that a problem?", a: "Not in practice. Frameworks use a subgradient (0 or 1) at exactly 0, and inputs land exactly on 0 with negligible probability." },
    ],
    summary: [
      "Derivative = rate of change = slope of the tangent.",
      "Rules: power, exp, log, sum, product, quotient, chain.",
      "Know σ′ = σ(1 − σ), tanh′ = 1 − tanh², ReLU′ ∈ {0, 1}.",
      "Second derivative = curvature; convex functions have one minimum.",
      "f(x + h) ≈ f(x) + f′(x)h is the idea behind gradient descent.",
    ],
    quiz: [
      { q: "The derivative of ln(3x) is:", options: ["3/x", "1/x", "1/(3x)", "ln 3"], answer: 1, why: "Chain rule: (1/(3x)) × 3 = 1/x." },
      { q: "A function with f′(a) = 0 and f″(a) < 0 has at x = a a:", options: ["Minimum", "Maximum", "Saddle", "Discontinuity"], answer: 1, why: "Zero slope and downward curvature: a local maximum." },
    ],
  },

  "partial-derivatives-gradients": {
    explain: [
      { p: "A loss depends on many parameters at once. A **partial derivative** $\\partial L/\\partial w_j$ asks: if I nudge only $w_j$ and keep every other parameter fixed, how fast does the loss change? You compute it with ordinary derivative rules, treating every other variable as a constant." },
      { p: "Collecting all partial derivatives gives the **gradient**, a vector the same shape as the parameters. It points in the direction of steepest increase, its length is how steep that is, and it is perpendicular to the contour lines (lines of equal loss). At a minimum every partial derivative is zero, so the gradient is the zero vector." },
      { p: "The **directional derivative** in a unit direction $\\mathbf{u}$ is $\\nabla L^\\top\\mathbf{u}$: how fast the loss changes if you move in that direction. It is largest when $\\mathbf{u}$ points along the gradient, which is the formal reason gradient descent moves against the gradient." },
      {
        table: {
          head: ["Function of a vector", "Gradient", "Used in"],
          rows: [
            ["$\\mathbf{a}^\\top\\mathbf{w}$", "$\\mathbf{a}$", "Linear models"],
            ["$\\mathbf{w}^\\top\\mathbf{w} = \\lVert\\mathbf{w}\\rVert^2$", "$2\\mathbf{w}$", "Ridge / weight decay"],
            ["$\\mathbf{w}^\\top\\mathbf{A}\\mathbf{w}$ ($\\mathbf{A}$ symmetric)", "$2\\mathbf{A}\\mathbf{w}$", "Quadratic losses, PCA"],
            ["$\\lVert\\mathbf{y} - \\mathbf{X}\\mathbf{w}\\rVert^2$", "$-2\\mathbf{X}^\\top(\\mathbf{y} - \\mathbf{X}\\mathbf{w})$", "Linear regression"],
          ],
        },
      },
      { p: "**The multivariable chain rule.** If $L$ depends on $u$ and $v$, and both depend on $w$, then $\\frac{dL}{dw} = \\frac{\\partial L}{\\partial u}\\frac{du}{dw} + \\frac{\\partial L}{\\partial v}\\frac{dv}{dw}$: add up the contribution along every path. In a neural network, a weight affects the loss through every unit downstream of it, and backpropagation adds up those paths efficiently." },
      { p: "Two matrices of derivatives come up. The **Jacobian** collects the partial derivatives of a vector-valued function (each output with respect to each input); backprop multiplies Jacobians layer by layer. The **Hessian** collects second partial derivatives $\\partial^2 L/\\partial w_i\\partial w_j$; its eigenvalues are the curvatures in different directions, which determine how hard the loss is for gradient descent." },
      { p: "**Gradient checking.** To test a hand-written gradient, compare it with a numerical estimate: $\\frac{\\partial L}{\\partial w_j} \\approx \\frac{L(w_j + h) - L(w_j - h)}{2h}$ with a small $h$ such as $10^{-5}$. If they disagree, the analytic gradient has a bug." },
    ],
    practice: [
      {
        q: "Find all partial derivatives of $f(x, y) = x^2y + 3xy^2 - 4y$ and the gradient at (1, 2).",
        solution: [
          { math: r`\frac{\partial f}{\partial x} = 2xy + 3y^2, \qquad \frac{\partial f}{\partial y} = x^2 + 6xy - 4` },
          { math: r`\nabla f(1, 2) = (4 + 12,\; 1 + 12 - 4) = (16,\; 9)` },
        ],
      },
      {
        q: "For $L(w, b) = (wx + b - y)^2$ with $x = 2$, $y = 5$, compute the gradient at $w = 1$, $b = 1$.",
        solution: [
          { p: "Error $e = 2 + 1 - 5 = -2$." },
          { math: r`\frac{\partial L}{\partial w} = 2e\,x = -8, \qquad \frac{\partial L}{\partial b} = 2e = -4` },
        ],
      },
      {
        q: "Numerically check $\\partial L/\\partial w$ from the previous problem with $h = 0.01$.",
        solution: [{ math: r`\frac{(2(1.01) + 1 - 5)^2 - (2(0.99) + 1 - 5)^2}{0.02} = \frac{(-1.98)^2 - (-2.02)^2}{0.02} = \frac{3.9204 - 4.0804}{0.02} = -8` }],
      },
      {
        q: "The Hessian of $L(w_1, w_2) = 3w_1^2 + w_2^2$ is diagonal. What are the curvatures and the largest safe gradient-descent learning rate?",
        solution: [{ p: "Second derivatives: 6 and 2, so the Hessian is diag(6, 2). The steepest curvature is 6, so η < 2/6 ≈ 0.333." }],
      },
    ],
    interview: [
      { q: "What is the gradient and why does it point uphill?", a: "The vector of partial derivatives. The directional derivative in direction u is ∇Lᵀu, which is maximised when u is parallel to ∇L, so the gradient is the direction of steepest increase." },
      { q: "What is gradient checking?", a: "Comparing an analytically computed gradient with a finite-difference estimate (central differences) to catch implementation bugs." },
      { q: "What does the Hessian tell you?", a: "The curvature of the loss in every direction. Its eigenvalues set how fast gradient descent can converge and which learning rates are stable; their ratio is the condition number." },
    ],
    summary: [
      "Partial derivative: vary one variable, hold the rest fixed.",
      "Gradient = vector of partials; steepest uphill; zero at optima.",
      "Key identities: ∇(aᵀw) = a, ∇‖w‖² = 2w, ∇‖y − Xw‖² = −2Xᵀ(y − Xw).",
      "Multivariable chain rule: sum over all paths.",
      "Jacobian for vector outputs; Hessian for curvature; check gradients numerically.",
    ],
    quiz: [
      { q: "For f(x, y) = 3x + 2y², ∂f/∂y at (5, 1) is:", options: ["3", "2", "4", "15"], answer: 2, why: "∂f/∂y = 4y = 4 at y = 1; x does not appear." },
      { q: "At a minimum of a smooth loss, the gradient is:", options: ["Very large", "The zero vector", "Equal to the parameters", "Undefined"], answer: 1, why: "Every partial derivative is zero at a stationary point." },
    ],
  },

  "probability-statistics": {
    explain: [
      { p: "Machine learning is learning under uncertainty: noisy measurements, labels that are sometimes wrong, and a future that will not look exactly like the past. Probability is the language for that uncertainty, and statistics is how we estimate things from samples." },
      { p: "A **random variable** is a quantity whose value depends on chance, such as the outcome of a die or the price of a house drawn at random. Its **expectation** $\\mathbb{E}[X]$ is the long-run average; its **variance** $\\operatorname{Var}(X) = \\mathbb{E}[(X - \\mathbb{E}[X])^2]$ measures spread. Two rules used constantly: $\\mathbb{E}[aX + b] = a\\mathbb{E}[X] + b$ and $\\operatorname{Var}(aX + b) = a^2\\operatorname{Var}(X)$." },
      {
        table: {
          head: ["Distribution", "Models", "Mean", "Variance"],
          rows: [
            ["Bernoulli($p$)", "One yes/no outcome", "$p$", "$p(1 - p)$"],
            ["Binomial($n, p$)", "Number of yes in $n$ trials", "$np$", "$np(1 - p)$"],
            ["Poisson($\\lambda$)", "Counts per interval (calls per hour)", "$\\lambda$", "$\\lambda$"],
            ["Uniform($a, b$)", "Every value in a range equally likely", "$(a + b)/2$", "$(b - a)^2/12$"],
            ["Normal($\\mu, \\sigma^2$)", "Sums of many small effects; noise", "$\\mu$", "$\\sigma^2$"],
          ],
        },
      },
      { p: "**Conditional probability** $P(A \\mid B) = P(A \\cap B)/P(B)$ is the probability of $A$ once you know $B$ happened. $A$ and $B$ are **independent** if knowing $B$ does not change $A$: $P(A \\mid B) = P(A)$. **Bayes' theorem** flips a conditional: $P(A \\mid B) = P(B \\mid A)P(A)/P(B)$. Classifiers output conditional probabilities $P(y \\mid \\mathbf{x})$." },
      { p: "**The central limit theorem** says that the average of many independent samples is approximately normally distributed, whatever the original distribution, with standard deviation $\\sigma/\\sqrt{n}$ (the **standard error**). This is why averages of test accuracies, cross-validation folds or A/B test results can be given confidence intervals, and why errors are often modelled as normal." },
      { p: "**Maximum likelihood estimation (MLE)** chooses parameters that make the observed data most probable. For coin flips with 7 heads in 10, the likelihood $p^7(1 - p)^3$ is largest at $p = 0.7$. Minimising MSE is MLE under normal noise; minimising cross-entropy is MLE for Bernoulli labels. So most loss functions are likelihoods in disguise." },
      { p: "**Hypothesis tests and p-values** in one paragraph: assume nothing interesting is happening (the null hypothesis), compute how surprising the observed data would be under that assumption, and call that probability the p-value. A small p-value (often < 0.05) means the data would be unusual if the null were true. It does **not** give the probability that the null is true, and statistical significance is not the same as practical importance." },
    ],
    practice: [
      {
        q: "Values [2, 4, 4, 4, 5, 5, 7, 9]. Compute the mean, median, population variance and standard deviation.",
        solution: [
          { p: "Mean = 40/8 = 5. Median = (4 + 5)/2 = 4.5. Squared deviations: 9, 1, 1, 1, 0, 0, 4, 16; sum 32." },
          { math: r`\sigma^2 = 32/8 = 4, \qquad \sigma = 2` },
        ],
      },
      {
        q: "A test has 90% sensitivity and 95% specificity for a condition affecting 2% of people. What is P(condition | positive)?",
        solution: [{ math: r`\frac{0.9 \times 0.02}{0.9 \times 0.02 + 0.05 \times 0.98} = \frac{0.018}{0.018 + 0.049} \approx 0.269` }, { p: "Only about 27%, because positives from the large healthy group outnumber true positives." }],
      },
      {
        q: "Heights are normal with mean 170 cm and sd 8 cm. Roughly what share of people are between 154 and 186 cm?",
        solution: [{ p: "That is μ ± 2σ, so about 95% (the 68–95–99.7 rule)." }],
      },
      {
        q: "$X$ has mean 10 and variance 4. Find the mean and variance of $Y = 3X - 5$.",
        solution: [{ math: r`\mathbb{E}[Y] = 3(10) - 5 = 25, \qquad \operatorname{Var}(Y) = 3^2 \times 4 = 36` }],
      },
    ],
    interview: [
      { q: "What is the difference between correlation and causation?", a: "Correlation means two variables move together; causation means changing one changes the other. A confounder can cause both (ice-cream sales and drownings both rise in summer). ML models learn correlations; causal claims need experiments or causal methods." },
      { q: "What is maximum likelihood estimation?", a: "Choosing parameters that maximise the probability of the observed data under the model. Common losses are negative log-likelihoods: MSE under Gaussian noise, cross-entropy under Bernoulli or categorical labels." },
      { q: "What does a p-value mean?", a: "The probability of seeing data at least as extreme as observed if the null hypothesis were true. It is not the probability the null is true, and a small p-value does not mean a large or important effect." },
    ],
    summary: [
      "Expectation = average; variance = spread; Var(aX + b) = a²Var(X).",
      "Know Bernoulli, binomial, Poisson, uniform, normal.",
      "Conditional probability, independence and Bayes' theorem.",
      "CLT: averages are roughly normal with SE = σ/√n.",
      "MLE links probability to loss functions.",
    ],
    quiz: [
      { q: "A fair die's expected value is:", options: ["3", "3.5", "4", "6"], answer: 1, why: "(1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5." },
      { q: "Doubling the sample size changes the standard error of a mean by a factor of:", options: ["1/2", "1/√2", "2", "√2"], answer: 1, why: "SE = σ/√n." },
    ],
  },

  "python-numpy-pandas": {
    explain: [
      { p: "NumPy's core object is the `ndarray`: a block of numbers of one type with a **shape**. A vector has shape `(d,)`, a dataset `(n, d)`, a batch of colour images `(n, height, width, 3)`. Most bugs in ML code are shape bugs, so print `.shape` often." },
      { p: "**Vectorisation** means writing operations on whole arrays instead of Python loops. `X @ w` computes all $n$ predictions in compiled code, often 50–100× faster than looping over rows in Python. If you find yourself writing `for i in range(len(X))` to do arithmetic, there is usually a vectorised version." },
      { p: "The `axis` argument says which dimension to collapse. For a data matrix of shape `(n, d)`, `X.mean(axis=0)` averages down the rows and gives one mean per **column** (shape `(d,)`), which is what you need for feature scaling. `X.mean(axis=1)` gives one value per row." },
      {
        table: {
          head: ["Task", "NumPy", "pandas"],
          rows: [
            ["Select rows by condition", "`X[X[:, 0] > 5]`", "`df[df['age'] > 30]`"],
            ["Column means", "`X.mean(axis=0)`", "`df.mean(numeric_only=True)`"],
            ["Reshape", "`a.reshape(-1, 1)`", "—"],
            ["Missing values", "`np.isnan(a)`", "`df.isna().sum()`, `df.fillna(...)`"],
            ["Group statistics", "—", "`df.groupby('city')['price'].mean()`"],
            ["Join tables", "—", "`pd.merge(a, b, on='id', how='left')`"],
            ["Category counts", "`np.unique(a, return_counts=True)`", "`df['city'].value_counts()`"],
          ],
        },
      },
      { p: "**Broadcasting** lets arrays of different shapes combine: shapes are compared from the right, and a dimension of size 1 stretches to match. `X - X.mean(axis=0)` subtracts a `(d,)` vector from an `(n, d)` matrix, centring every column in one line. If shapes do not line up, NumPy raises an error, which is a useful safety check." },
      { p: "pandas adds labels: a `DataFrame` is a table with named columns and an index, and each column is a `Series`. Use `.loc[rows, cols]` to select by label and `.iloc[rows, cols]` by position. Chained assignment like `df[df.a > 0]['b'] = 1` may silently modify a copy; write `df.loc[df.a > 0, 'b'] = 1` instead." },
    ],
    practice: [
      {
        q: "X has shape (100, 3). What are the shapes of `X.mean(axis=0)`, `X.mean(axis=1)`, `X.T @ X` and `X[:, 0]`?",
        solution: [{ p: "(3,), (100,), (3, 3) and (100,)." }],
      },
      {
        q: "Write one line that standardises every column of a NumPy array X.",
        solution: [{ code: "Xs = (X - X.mean(axis=0)) / X.std(axis=0)" }, { p: "Broadcasting applies the (d,) means and standard deviations to every row." }],
      },
      {
        q: "A DataFrame `df` has columns city and price. Get the average price per city, sorted from highest to lowest.",
        solution: [{ code: "df.groupby('city')['price'].mean().sort_values(ascending=False)" }],
      },
      {
        q: "Why does `model.fit(df['area'], y)` fail in scikit-learn and how do you fix it?",
        solution: [{ p: "A single Series is 1-D, but scikit-learn expects a 2-D feature matrix (rows × features). Use `df[['area']]` (double brackets, a one-column DataFrame) or `.values.reshape(-1, 1)`." }],
      },
    ],
    interview: [
      { q: "Why is vectorised NumPy faster than Python loops?", a: "The loop runs in optimised compiled code over contiguous memory, avoiding Python's per-element interpreter overhead, and can use CPU vector instructions." },
      { q: "What is broadcasting?", a: "NumPy's rule for combining arrays of different shapes: compare dimensions from the right; sizes must be equal or one of them 1, which is stretched virtually without copying." },
      { q: "loc vs iloc?", a: "loc selects by labels (index values and column names, end-inclusive slices); iloc selects by integer positions (end-exclusive, like Python)." },
    ],
    summary: [
      "ndarray = numbers + shape; check shapes constantly.",
      "Vectorise instead of looping; @ for matrix multiply.",
      "axis=0 collapses rows (per-column results).",
      "Broadcasting matches shapes from the right; size-1 dims stretch.",
      "pandas for labelled tables: groupby, merge, isna, loc/iloc.",
    ],
    quiz: [
      { q: "Which shape broadcasts with (5, 3)?", options: ["(5,)", "(3,)", "(2, 3)", "(3, 5)"], answer: 1, why: "Compared from the right, 3 matches 3; the missing dimension is treated as 1 and stretched to 5." },
      { q: "scikit-learn expects X to be:", options: ["A 1-D array", "A 2-D array of shape (n_samples, n_features)", "A Python list of strings", "A 3-D array"], answer: 1, why: "Even one feature must be a column: shape (n, 1)." },
    ],
  },

  "python-plotting-sklearn": {
    explain: [
      { p: "Before modelling, look at the data. Summary statistics can hide very different shapes: four datasets can share the same mean, variance and correlation yet look completely different when plotted (Anscombe's quartet). Plots reveal outliers, skew, non-linear relationships, clusters and data errors that numbers alone miss." },
      {
        table: {
          head: ["Question", "Plot"],
          rows: [
            ["How is one numeric feature distributed?", "Histogram or box plot"],
            ["How do two numeric features relate?", "Scatter plot"],
            ["How does a numeric value differ across categories?", "Box plot or bar chart of means"],
            ["How does something change over time?", "Line plot"],
            ["Which features correlate?", "Correlation heatmap"],
            ["Is the model fitting well?", "Predicted vs actual; residual plot; learning curve"],
          ],
        },
      },
      { p: "A short exploratory checklist: shape and column types (`df.info()`); missing values per column; summary statistics (`df.describe()`); target distribution (balanced? skewed?); histograms of numeric features; scatter plots of the strongest features against the target; obvious errors (negative ages, duplicated rows)." },
      { p: "scikit-learn gives every algorithm the same small interface. **Estimators** have `fit(X, y)`. **Transformers** (scalers, encoders, PCA) add `transform(X)` and `fit_transform(X)`. **Predictors** add `predict(X)` and often `predict_proba(X)` or `score(X, y)`. Learned values get a trailing underscore: `coef_`, `mean_`, `n_features_in_`. Because the interface is shared, swapping one model for another is one line." },
      { p: "**Pipelines** chain transformers and a final model into one estimator. They guarantee that every preprocessing step is fitted only on training data, including inside cross-validation, and that exactly the same steps run at prediction time. `ColumnTransformer` applies different preprocessing to different columns (scale numbers, one-hot categories). Save the whole fitted pipeline with `joblib.dump`, so production uses the identical preprocessing." },
      { p: "Reproducibility: set `random_state` on splits and models so results can be repeated; record library versions; keep the test set fixed. Two runs that differ only by random seed can differ by a percent or more, so compare models over several seeds or with cross-validation." },
    ],
    practice: [
      {
        q: "A feature's histogram has a long right tail (most values small, a few huge). What two things might you do before a linear model?",
        solution: [{ p: "Apply a log transform (`np.log1p`) to compress the tail, and/or use a robust scaler. Also check whether the huge values are genuine or errors." }],
      },
      {
        q: "Write a pipeline that imputes missing values with the median, standardises, and fits logistic regression, then reports 5-fold CV accuracy.",
        solution: [{ code: "from sklearn.pipeline import make_pipeline\nfrom sklearn.impute import SimpleImputer\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.linear_model import LogisticRegression\nfrom sklearn.model_selection import cross_val_score\n\npipe = make_pipeline(SimpleImputer(strategy='median'), StandardScaler(), LogisticRegression())\nprint(cross_val_score(pipe, X, y, cv=5).mean())" }],
      },
      {
        q: "What is wrong with calling `scaler.fit_transform(X_test)`?",
        solution: [{ p: "It refits the scaler on test data, so test features are scaled with different numbers than training features (and test statistics leak into the process). Use `scaler.transform(X_test)` with the scaler fitted on training data." }],
      },
    ],
    interview: [
      { q: "fit, transform and fit_transform: what is the difference?", a: "fit learns parameters from data (e.g. means). transform applies them. fit_transform does both on the same data and is used on training data only; test data gets transform." },
      { q: "Why use a Pipeline?", a: "It bundles preprocessing and model so that cross-validation refits preprocessing within each fold (no leakage), prediction applies identical steps, and the whole thing can be tuned and saved as one object." },
      { q: "What plots would you make first on a new dataset?", a: "Target distribution, histograms of numeric features, value counts of categories, scatter or box plots of key features against the target, a correlation heatmap and a missing-value summary." },
    ],
    summary: [
      "Plot before modelling: distributions, relationships, outliers, errors.",
      "scikit-learn API: fit, transform, predict; learned values end in _.",
      "Pipelines + ColumnTransformer prevent leakage and keep steps identical.",
      "Never fit preprocessing on test data.",
      "Set random_state and save the fitted pipeline.",
    ],
    quiz: [
      { q: "Which plot best shows how house price varies with area?", options: ["Pie chart", "Scatter plot", "Histogram of price", "Bar chart of counts"], answer: 1, why: "Two numeric variables: a scatter plot shows the relationship and outliers." },
      { q: "In scikit-learn, attributes learned during fit are named with:", options: ["A leading underscore", "A trailing underscore (coef_)", "All capitals", "A dollar sign"], answer: 1, why: "The convention marks learned state, e.g. coef_, mean_, classes_." },
    ],
  },
};
