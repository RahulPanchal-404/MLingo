/**
 * Prerequisites: the maths and Python a learner needs before the ML topics.
 * Each page follows the same order so it can be used as a reference:
 * idea → definitions → worked example → in Python → where ML uses it → check yourself.
 */
import type { TheoryTopic } from "./topics";

const r = String.raw;

export const PREREQ_THEORY: TheoryTopic[] = [
  {
    slug: "vectors-matrices-notation",
    group: "Prerequisites",
    title: "Vectors, Matrices & Notation",
    summary: "The language every ML formula is written in: vectors, matrices, dot products and the shapes that must line up.",
    learnHref: "/learn/vectors-matrices-notation",
    sections: [
      {
        heading: "Why you need this",
        blocks: [
          { p: "A dataset is a table of numbers. Linear algebra is the shorthand for doing the same calculation on every row at once. Once you can read $\\mathbf{X}\\mathbf{w}$, most model equations become one line." },
        ],
      },
      {
        heading: "Scalars, vectors and matrices",
        blocks: [
          {
            list: [
              "A **scalar** is one number, written in plain italics: $x = 3.5$.",
              "A **vector** is an ordered list of numbers, written in bold lowercase. One example with $d$ features is a vector $\\mathbf{x} \\in \\mathbb{R}^d$.",
              "A **matrix** is a grid of numbers, written in bold uppercase. A dataset with $n$ rows and $d$ features is $\\mathbf{X} \\in \\mathbb{R}^{n \\times d}$.",
              "Subscripts pick entries: $x_j$ is feature $j$; $x_{ij}$ is row $i$, column $j$; $\\mathbf{x}_i$ is the whole row $i$.",
            ],
          },
          { math: r`\mathbf{x} = \begin{bmatrix} x_1 \\ x_2 \\ \vdots \\ x_d \end{bmatrix}, \qquad \mathbf{X} = \begin{bmatrix} x_{11} & \cdots & x_{1d} \\ \vdots & \ddots & \vdots \\ x_{n1} & \cdots & x_{nd} \end{bmatrix}` },
        ],
      },
      {
        heading: "The dot product",
        blocks: [
          { p: "Multiply matching entries and add them up. The result is a single number." },
          { math: r`\mathbf{w}^\top \mathbf{x} = \sum_{j=1}^{d} w_j x_j = w_1 x_1 + w_2 x_2 + \dots + w_d x_d` },
          { p: "This is exactly what a linear model computes: each feature times its weight, summed. Geometrically, $\\mathbf{a}^\\top\\mathbf{b} = \\lVert\\mathbf{a}\\rVert\\,\\lVert\\mathbf{b}\\rVert \\cos\\theta$, so it also measures how much two vectors point the same way." },
        ],
      },
      {
        heading: "Matrix multiplication and shapes",
        blocks: [
          { p: "To multiply $\\mathbf{A}$ ($m \\times k$) by $\\mathbf{B}$ ($k \\times n$), the inner sizes must match. The result is $m \\times n$, and each entry is a dot product of a row of $\\mathbf{A}$ with a column of $\\mathbf{B}$." },
          { math: r`(\mathbf{A}\mathbf{B})_{ij} = \sum_{t=1}^{k} a_{it}\, b_{tj}` },
          { p: "Predictions for a whole dataset at once: $\\mathbf{X}$ is $n \\times d$, $\\mathbf{w}$ is $d \\times 1$, so $\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}$ is $n \\times 1$, one prediction per row. Checking shapes like this catches most bugs before you run anything." },
          {
            list: [
              "**Transpose** $\\mathbf{A}^\\top$ swaps rows and columns.",
              "**Identity** $\\mathbf{I}$ has 1s on the diagonal: $\\mathbf{I}\\mathbf{x} = \\mathbf{x}$.",
              "**Inverse** $\\mathbf{A}^{-1}$ undoes $\\mathbf{A}$: $\\mathbf{A}^{-1}\\mathbf{A} = \\mathbf{I}$ (only for some square matrices).",
              "Order matters: in general $\\mathbf{A}\\mathbf{B} \\neq \\mathbf{B}\\mathbf{A}$.",
            ],
          },
        ],
      },
      {
        heading: "Norms: the size of a vector",
        blocks: [
          { math: r`\lVert \mathbf{x} \rVert_2 = \sqrt{\textstyle\sum_j x_j^2}, \qquad \lVert \mathbf{x} \rVert_1 = \textstyle\sum_j |x_j|` },
          { p: "The L2 norm is ordinary length; distance between two points is $\\lVert \\mathbf{a} - \\mathbf{b} \\rVert_2$ (used by KNN and K-Means). The L1 norm adds absolute values (used by Lasso). Ridge penalises $\\lVert \\mathbf{w} \\rVert_2^2$." },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Two houses, two features (size in 100 m², rooms). Weights $\\mathbf{w} = [3, 1]^\\top$." },
          { math: r`\mathbf{X}\mathbf{w} = \begin{bmatrix} 1.2 & 3 \\ 0.8 & 2 \end{bmatrix} \begin{bmatrix} 3 \\ 1 \end{bmatrix} = \begin{bmatrix} 1.2\cdot 3 + 3 \cdot 1 \\ 0.8 \cdot 3 + 2 \cdot 1 \end{bmatrix} = \begin{bmatrix} 6.6 \\ 4.4 \end{bmatrix}` },
          { p: "Shapes: $(2 \\times 2)(2 \\times 1) = (2 \\times 1)$, one prediction per house." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np

X = np.array([[1.2, 3], [0.8, 2]])   # shape (2, 2): 2 rows, 2 features
w = np.array([3, 1])                  # shape (2,)

X @ w                  # matrix-vector product -> array([6.6, 4.4])
X.T                    # transpose
np.linalg.norm(w)      # L2 norm  -> 3.162...
np.abs(w).sum()        # L1 norm  -> 4
X.shape, w.shape       # always check shapes first`,
          },
        ],
      },
      {
        heading: "Where ML uses this",
        blocks: [
          {
            list: [
              "Linear and logistic regression: $\\hat{y} = \\mathbf{w}^\\top\\mathbf{x} + b$.",
              "Neural networks: every layer is $\\mathbf{h} = \\sigma(\\mathbf{W}\\mathbf{x} + \\mathbf{b})$.",
              "KNN and K-Means: distances are norms of differences.",
              "Ridge and Lasso: penalties are norms of the weights.",
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "$\\mathbf{A}$ is $5 \\times 3$ and $\\mathbf{B}$ is $3 \\times 4$. What shape is $\\mathbf{A}\\mathbf{B}$? (Answer: $5 \\times 4$.)",
              "What is $[1, 2, 3]^\\top [4, 0, -1]$? (Answer: $4 + 0 - 3 = 1$.)",
              "Why can't you compute $\\mathbf{B}\\mathbf{A}$ here? (Inner sizes 4 and 5 don't match.)",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "derivatives-chain-rule",
    group: "Prerequisites",
    title: "Derivatives & the Chain Rule",
    summary: "Slopes tell a model which way to move. The chain rule lets us find slopes through layers of functions.",
    learnHref: "/learn/derivatives-chain-rule",
    sections: [
      {
        heading: "Why you need this",
        blocks: [
          { p: "Training a model means making the loss smaller. The derivative of the loss tells you, for each parameter, whether nudging it up makes the loss go up or down, and how fast. Gradient descent is nothing more than following that information." },
        ],
      },
      {
        heading: "What a derivative is",
        blocks: [
          { p: "The derivative of $f$ at $x$ is the slope of the curve there: how much $f$ changes per tiny change in $x$." },
          { math: r`f'(x) = \frac{df}{dx} = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}` },
          {
            list: [
              "$f'(x) > 0$: the function is going up, so decrease $x$ to go down.",
              "$f'(x) < 0$: the function is going down, so increase $x$.",
              "$f'(x) = 0$: a flat point, possibly a minimum.",
            ],
          },
        ],
      },
      {
        heading: "The rules you will actually use",
        blocks: [
          { math: r`\frac{d}{dx}c = 0 \qquad \frac{d}{dx}x^n = n x^{n-1} \qquad \frac{d}{dx}e^x = e^x \qquad \frac{d}{dx}\ln x = \frac{1}{x}` },
          { math: r`(f + g)' = f' + g' \qquad (c f)' = c f' \qquad (fg)' = f'g + fg'` },
        ],
      },
      {
        heading: "The chain rule",
        blocks: [
          { p: "If $y$ depends on $u$, and $u$ depends on $x$, multiply the two slopes:" },
          { math: r`\frac{dy}{dx} = \frac{dy}{du} \cdot \frac{du}{dx}` },
          { p: "Read it as a chain of effects: how much $x$ moves $u$, times how much $u$ moves $y$. A neural network is a long chain of functions, and backpropagation is the chain rule applied from the loss back to every weight." },
        ],
      },
      {
        heading: "Worked example: the slope of a squared error",
        blocks: [
          { p: "One data point $(x, y) = (2, 7)$, a model $\\hat{y} = wx$, and loss $L = (\\hat{y} - y)^2$. How does $L$ change with $w$?" },
          { math: r`L = (u)^2,\; u = wx - y \;\Rightarrow\; \frac{dL}{dw} = \frac{dL}{du}\cdot\frac{du}{dw} = 2u \cdot x = 2(wx - y)\,x` },
          { p: "At $w = 2$: $u = 4 - 7 = -3$, so $\\frac{dL}{dw} = 2 \\cdot (-3) \\cdot 2 = -12$. The slope is negative, so increasing $w$ lowers the loss. That is the direction gradient descent will move." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `def loss(w, x=2.0, y=7.0):
    return (w * x - y) ** 2

def dloss_dw(w, x=2.0, y=7.0):        # from the chain rule
    return 2 * (w * x - y) * x

w = 2.0
h = 1e-5
numeric = (loss(w + h) - loss(w - h)) / (2 * h)   # finite-difference check
print(dloss_dw(w), numeric)          # -12.0  -12.000000...`,
          },
          { p: "Comparing your formula with a finite-difference estimate is the standard way to check a hand-derived gradient." },
        ],
      },
      {
        heading: "Where ML uses this",
        blocks: [
          {
            list: [
              "Gradient descent uses $\\frac{dL}{dw}$ to update every weight.",
              "The sigmoid's derivative, $\\sigma'(z) = \\sigma(z)(1 - \\sigma(z))$, drives logistic regression training.",
              "Backpropagation multiplies local derivatives layer by layer (the chain rule).",
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "Derivative of $3x^2 + 5x$? (Answer: $6x + 5$.)",
              "Derivative of $(4x + 1)^3$? (Answer: $3(4x+1)^2 \\cdot 4$.)",
              "If $\\frac{dL}{dw} = 8$, should $w$ go up or down to reduce $L$? (Down.)",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "partial-derivatives-gradients",
    group: "Prerequisites",
    title: "Partial Derivatives & Gradients",
    summary: "Models have many parameters. The gradient collects every slope into one vector that points uphill.",
    learnHref: "/learn/partial-derivatives-gradients",
    sections: [
      {
        heading: "Why you need this",
        blocks: [
          { p: "A real model has many weights, so the loss is a function of many variables. You need the slope with respect to each one separately. Stacked together, those slopes are the gradient, and the gradient is what every optimiser uses." },
        ],
      },
      {
        heading: "Partial derivatives",
        blocks: [
          { p: "Hold every variable fixed except one, and take the ordinary derivative in that one." },
          { math: r`f(w, b) = w^2 + 3wb \quad\Rightarrow\quad \frac{\partial f}{\partial w} = 2w + 3b, \qquad \frac{\partial f}{\partial b} = 3w` },
        ],
      },
      {
        heading: "The gradient",
        blocks: [
          { math: r`\nabla_{\boldsymbol\theta} L = \begin{bmatrix} \dfrac{\partial L}{\partial \theta_1} & \cdots & \dfrac{\partial L}{\partial \theta_p} \end{bmatrix}^\top` },
          { p: "The gradient points in the direction of steepest increase. Its negative points steepest downhill, which gives the gradient descent update:" },
          { math: r`\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta\, \nabla_{\boldsymbol\theta} L` },
          { p: "Here $\\eta$ is the learning rate: how big a step to take." },
        ],
      },
      {
        heading: "Worked example: gradient of MSE for a line",
        blocks: [
          { p: "Model $\\hat{y}_i = w x_i + b$, loss $L = \\frac{1}{n}\\sum_i (\\hat{y}_i - y_i)^2$. Using the chain rule on each term:" },
          { math: r`\frac{\partial L}{\partial w} = \frac{2}{n}\sum_{i=1}^{n} (\hat{y}_i - y_i)\, x_i, \qquad \frac{\partial L}{\partial b} = \frac{2}{n}\sum_{i=1}^{n} (\hat{y}_i - y_i)` },
          { p: "In vector form for $\\hat{\\mathbf{y}} = \\mathbf{X}\\mathbf{w}$: $\\nabla_{\\mathbf{w}} L = \\frac{2}{n}\\mathbf{X}^\\top(\\mathbf{X}\\mathbf{w} - \\mathbf{y})$. This one line is the core of linear regression training." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(-1, 1, 50)
y = 1.6 * x + 0.9 + rng.normal(0, 0.2, 50)

w, b, lr = 0.0, 0.0, 0.1
for step in range(200):
    y_hat = w * x + b
    grad_w = 2 * np.mean((y_hat - y) * x)
    grad_b = 2 * np.mean(y_hat - y)
    w -= lr * grad_w
    b -= lr * grad_b

print(round(w, 2), round(b, 2))   # close to 1.6 and 0.9`,
          },
        ],
      },
      {
        heading: "Where ML uses this",
        blocks: [
          {
            list: [
              "Every gradient-based model: linear and logistic regression, neural networks.",
              "Optimisers like SGD, Momentum and Adam are all variations on $\\boldsymbol\\theta - \\eta\\nabla L$.",
              "Feature scaling matters because very different feature ranges make the gradient lopsided, which slows descent.",
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "For $f(x, y) = x^2 y$, what are $\\partial f/\\partial x$ and $\\partial f/\\partial y$? (Answer: $2xy$ and $x^2$.)",
              "If the gradient is $[4, -2]$, which way does gradient descent move each parameter? (First down, second up.)",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "probability-statistics",
    group: "Prerequisites",
    title: "Probability & Statistics Essentials",
    summary: "Mean, variance, distributions, probability rules and Bayes: the tools for describing data and uncertainty.",
    learnHref: "/learn/probability-statistics",
    sections: [
      {
        heading: "Why you need this",
        blocks: [
          { p: "Before modelling data you need to describe it: where it is centred, how spread out it is, how features move together. Many models also output probabilities, and evaluating any model is a statistical question." },
        ],
      },
      {
        heading: "Describing data",
        blocks: [
          { math: r`\bar{x} = \frac{1}{n}\sum_{i=1}^{n} x_i, \qquad s^2 = \frac{1}{n-1}\sum_{i=1}^{n} (x_i - \bar{x})^2, \qquad s = \sqrt{s^2}` },
          {
            list: [
              "**Mean** $\\bar{x}$: the balance point. Sensitive to outliers.",
              "**Median**: the middle value. Robust to outliers.",
              "**Variance** $s^2$ and **standard deviation** $s$: typical distance from the mean. ($n-1$ corrects the bias of estimating from a sample.)",
            ],
          },
        ],
      },
      {
        heading: "Covariance and correlation",
        blocks: [
          { math: r`\text{cov}(x, y) = \frac{1}{n-1}\sum_i (x_i - \bar{x})(y_i - \bar{y}), \qquad r = \frac{\text{cov}(x, y)}{s_x\, s_y} \in [-1, 1]` },
          { p: "Correlation $r$ near $+1$: the features rise together. Near $-1$: one rises as the other falls. Near $0$: no linear relationship (there may still be a curved one). Correlation is not causation." },
        ],
      },
      {
        heading: "Probability basics",
        blocks: [
          {
            list: [
              "$0 \\le P(A) \\le 1$, and $P(\\text{not } A) = 1 - P(A)$.",
              "**Conditional probability**: $P(A \\mid B) = \\dfrac{P(A \\cap B)}{P(B)}$, the probability of $A$ once you know $B$ happened.",
              "**Independence**: $P(A \\cap B) = P(A)\\,P(B)$.",
            ],
          },
          { p: "**Bayes' rule** flips a conditional around. It underlies Naive Bayes and the idea of updating a belief with evidence:" },
          { math: r`P(A \mid B) = \frac{P(B \mid A)\, P(A)}{P(B)}` },
        ],
      },
      {
        heading: "The normal distribution",
        blocks: [
          { math: r`\mathcal{N}(x \mid \mu, \sigma^2) = \frac{1}{\sigma\sqrt{2\pi}} \exp\!\left(-\frac{(x - \mu)^2}{2\sigma^2}\right)` },
          { p: "The bell curve. About 68% of values fall within $\\mu \\pm \\sigma$ and 95% within $\\mu \\pm 2\\sigma$. Standardising, $z = (x - \\mu)/\\sigma$, puts any feature on this common scale, which is exactly what feature scaling does." },
        ],
      },
      {
        heading: "Worked example: Bayes with a test",
        blocks: [
          { p: "1% of emails are spam. A filter flags 90% of spam, and wrongly flags 5% of normal emails. An email is flagged: how likely is it spam?" },
          { math: r`P(\text{spam}\mid\text{flag}) = \frac{0.9 \times 0.01}{0.9 \times 0.01 + 0.05 \times 0.99} = \frac{0.009}{0.0585} \approx 0.15` },
          { p: "Only about 15%, because spam is rare. This is why accuracy alone can mislead on imbalanced data, and why precision and recall exist." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np
import pandas as pd

scores = np.array([62, 71, 58, 90, 75, 68, 81])
scores.mean(), np.median(scores), scores.std(ddof=1)   # ddof=1 -> sample std

df = pd.DataFrame({"hours": [1, 2, 3, 4, 5], "marks": [52, 58, 65, 70, 79]})
df.describe()                 # count, mean, std, min, quartiles, max
df["hours"].corr(df["marks"]) # Pearson correlation -> ~0.996

z = (scores - scores.mean()) / scores.std(ddof=1)        # standardise`,
          },
        ],
      },
      {
        heading: "Where ML uses this",
        blocks: [
          {
            list: [
              "Feature scaling (standardisation) uses mean and standard deviation.",
              "Logistic regression and neural network classifiers output probabilities.",
              "Loss functions like cross-entropy come from probability (maximum likelihood).",
              "Evaluation (precision, recall, confidence in results) is statistics.",
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "Data: 2, 4, 4, 4, 5, 5, 7, 9. Mean? (Answer: 5.)",
              "Two features have $r = 0.02$. Does that prove they are unrelated? (No, only that they have no linear relationship.)",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "python-numpy-pandas",
    group: "Prerequisites",
    title: "Python for ML: NumPy & pandas",
    summary: "The two libraries every ML notebook starts with: fast arrays for maths, and DataFrames for real tabular data.",
    learnHref: "/learn/python-numpy-pandas",
    sections: [
      {
        heading: "What Python you need first",
        blocks: [
          {
            list: [
              "Variables, numbers, strings, lists and dictionaries.",
              "`if` / `for` / functions with `def`, and list comprehensions.",
              "Importing libraries and reading error messages (the last line usually says what went wrong).",
              "Running code in a Jupyter notebook or Google Colab.",
            ],
          },
          { p: "You do not need classes, decorators or advanced Python to start ML. You do need to be comfortable with arrays and tables, which is what the rest of this page covers." },
        ],
      },
      {
        heading: "NumPy arrays",
        blocks: [
          { p: "A NumPy array is a grid of numbers of one type. Operations apply to every element at once (vectorisation), which is both shorter and far faster than a Python loop." },
          {
            code: `import numpy as np

a = np.array([1.0, 2.0, 3.0])
a * 2            # array([2., 4., 6.])   elementwise, no loop
a + a            # array([2., 4., 6.])
a.mean(), a.sum(), a.max()

M = np.arange(6).reshape(2, 3)   # [[0 1 2] [3 4 5]], shape (2, 3)
M[:, 1]          # column 1 -> array([1, 4])
M[M > 2]         # boolean mask -> array([3, 4, 5])
M.mean(axis=0)   # mean of each column`,
          },
        ],
      },
      {
        heading: "Broadcasting",
        blocks: [
          { p: "When shapes differ, NumPy stretches the smaller one along missing dimensions. It is how you subtract a column-wise mean from a whole matrix in one line, which is exactly standardisation:" },
          { code: `X = np.array([[1., 200.], [2., 300.], [3., 400.]])
X_scaled = (X - X.mean(axis=0)) / X.std(axis=0)   # (3,2) minus (2,) -> broadcasts per column` },
        ],
      },
      {
        heading: "pandas DataFrames",
        blocks: [
          { p: "A DataFrame is a table with named columns, each of which can have its own type. Real datasets arrive as CSV files and live in DataFrames until you hand NumPy arrays to a model." },
          {
            code: `import pandas as pd

df = pd.read_csv("students.csv")
df.head()                     # first 5 rows
df.info()                     # column types and missing values
df.describe()                 # summary statistics

df["passed"] = df["marks"] >= 40          # new column
df[df["hours"] > 3]                       # filter rows
df.groupby("section")["marks"].mean()     # average per group
df.isna().sum()                           # missing values per column
df["hours"] = df["hours"].fillna(df["hours"].median())

X = df[["hours", "attendance"]].to_numpy()   # features for a model
y = df["passed"].to_numpy()                  # target`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            list: [
              "Writing Python loops over rows instead of vectorised operations.",
              "Shape mismatches: an array of shape `(n,)` is not the same as `(n, 1)`. Print `.shape` often.",
              "Chained indexing like `df[df.a > 0]['b'] = 1` silently fails to modify `df`. Use `df.loc[df.a > 0, 'b'] = 1`.",
              "Filling missing values using statistics from the whole dataset before splitting (data leakage).",
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "What does `M.mean(axis=0)` return for a `(100, 4)` array? (A length-4 array: one mean per column.)",
              "How do you keep only rows where `age` is at least 18? (`df[df['age'] >= 18]`.)",
            ],
          },
        ],
      },
    ],
  },
  {
    slug: "python-plotting-sklearn",
    group: "Prerequisites",
    title: "Plotting & the scikit-learn Workflow",
    summary: "Look at your data with Matplotlib, then train and evaluate any model with the same five scikit-learn steps.",
    learnHref: "/learn/python-plotting-sklearn",
    sections: [
      {
        heading: "Always plot first",
        blocks: [
          { p: "A few plots catch problems no summary statistic will: outliers, skew, a curved relationship a straight line cannot fit, or classes that overlap completely." },
          {
            code: `import matplotlib.pyplot as plt

plt.hist(df["marks"], bins=20)                  # distribution of one feature
plt.show()

plt.scatter(df["hours"], df["marks"])           # relationship between two
plt.xlabel("hours studied"); plt.ylabel("marks")
plt.show()

plt.plot(losses)                                # a training curve
plt.xlabel("epoch"); plt.ylabel("loss")
plt.show()`,
          },
        ],
      },
      {
        heading: "The scikit-learn pattern",
        blocks: [
          { p: "Every scikit-learn model has the same interface, so once you know these steps you can swap in any algorithm:" },
          {
            list: [
              "**Split** the data into train and test sets.",
              "**Preprocess** (for example scale features), fitting the preprocessing on the training set only.",
              "**Fit** the model: `model.fit(X_train, y_train)`.",
              "**Predict**: `model.predict(X_test)`.",
              "**Evaluate** with a metric that matches the problem.",
            ],
          },
          {
            code: `from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y)

model = make_pipeline(StandardScaler(), LogisticRegression())
model.fit(X_train, y_train)          # scaler is fitted on train only

pred = model.predict(X_test)
print(accuracy_score(y_test, pred))
print(classification_report(y_test, pred))`,
          },
        ],
      },
      {
        heading: "Why the pipeline matters",
        blocks: [
          { p: "Putting the scaler inside the pipeline guarantees its mean and standard deviation come from the training data only. Scaling the full dataset before splitting lets test-set information leak into training and makes results look better than they will be in real use." },
        ],
      },
      {
        heading: "Swapping models",
        blocks: [
          {
            code: `from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

for clf in [LogisticRegression(), KNeighborsClassifier(5), DecisionTreeClassifier(max_depth=4)]:
    m = make_pipeline(StandardScaler(), clf).fit(X_train, y_train)
    print(type(clf).__name__, m.score(X_test, y_test))`,
          },
          { p: "Same five steps, different algorithm. Every model lesson in MLingo maps onto one of these classes." },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          {
            list: [
              "Why call `fit` on the training set and only `predict` on the test set? (The test set must stay unseen to estimate real performance.)",
              "You scaled all the data, then split. What is the problem? (Data leakage from the test set into the scaler.)",
            ],
          },
        ],
      },
    ],
  },
];
