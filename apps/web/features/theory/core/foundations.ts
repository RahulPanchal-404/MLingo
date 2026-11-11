import type { TheoryTopic } from "../topics";

const r = String.raw;

export const FOUNDATIONS_THEORY: TheoryTopic[] = [
  {
    slug: "what-is-machine-learning",
    group: "Foundations",
    title: "What is Machine Learning?",
    summary: "Learning a function from examples instead of writing the rules by hand.",
    learnHref: "/learn/what-is-machine-learning",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Machine learning finds the rule from examples: you give it inputs and the answers you want, and it adjusts a model until its answers match." } },
          { p: "Traditional programming: you write the rules, the computer applies them. Machine learning flips this: you supply examples of inputs with the right outputs, and an algorithm searches for rules (parameters) that reproduce them, and that also work on examples it has never seen." },
          {
            table: {
              head: ["", "Traditional program", "Machine learning"],
              rows: [
                ["You provide", "Rules + data", "Data + answers"],
                ["Computer produces", "Answers", "Rules (a trained model)"],
                ["Works well when", "Rules are known and few", "Rules are fuzzy, many or unknown"],
                ["Example", "Tax calculation", "Spam detection, price prediction"],
              ],
            },
          },
        ],
      },
      {
        heading: "The formal setup",
        blocks: [
          { p: "We have a dataset of $n$ examples. Each has a feature vector $\\mathbf{x}_i \\in \\mathbb{R}^d$ and (in supervised learning) a target $y_i$." },
          { math: r`\mathcal{D} = \{(\mathbf{x}_1, y_1), (\mathbf{x}_2, y_2), \dots, (\mathbf{x}_n, y_n)\}` },
          { p: "A model is a function $f_{\\boldsymbol\\theta}$ with parameters $\\boldsymbol\\theta$. Learning means choosing $\\boldsymbol\\theta$ to make the average loss small:" },
          { math: r`\hat{\boldsymbol\theta} = \arg\min_{\boldsymbol\theta} \; \frac{1}{n}\sum_{i=1}^{n} \ell\big(f_{\boldsymbol\theta}(\mathbf{x}_i),\, y_i\big)` },
          { p: "The real goal is not the training data. It is **generalisation**: low error on new data drawn from the same source. That is why we always keep a test set the model never trains on." },
        ],
      },
      {
        heading: "Types of machine learning",
        blocks: [
          {
            table: {
              head: ["Type", "What you have", "Goal", "Examples in MLingo"],
              rows: [
                ["Supervised: regression", "Inputs + numeric targets", "Predict a number", "Linear, polynomial, ridge/lasso"],
                ["Supervised: classification", "Inputs + category labels", "Predict a class", "Logistic regression, KNN, decision trees"],
                ["Unsupervised", "Inputs only", "Find structure", "K-Means, hierarchical, DBSCAN"],
                ["Reinforcement", "Actions + rewards", "Learn a strategy", "Game-playing agents (not covered yet)"],
              ],
            },
          },
        ],
      },
      {
        heading: "The ML workflow",
        blocks: [
          {
            steps: [
              { title: "Define the question", body: "What exactly do you want to predict, and how will you measure success? 'Will this student pass?' is classification; 'what mark will they get?' is regression." },
              { title: "Collect and explore data", body: "Load it, look at distributions and missing values, plot relationships. Most surprises are found here." },
              { title: "Split before anything else", body: "Hold out a test set (often 20%). Every later decision is made using the training data only." },
              { title: "Prepare features", body: "Handle missing values, encode categories, scale numeric features, all fitted on the training set." },
              { title: "Train and tune", body: "Fit candidate models, tune hyperparameters with cross-validation on the training data." },
              { title: "Evaluate once on the test set", body: "Report the test score of the final model. If you keep tuning against the test set, it stops being an honest estimate." },
            ],
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Predict exam marks from hours studied. Training data: (1 h, 50), (2 h, 55), (3 h, 65), (4 h, 70). Least squares (the usual fitting method) finds $\\hat{y} = 7x + 42.5$." },
          {
            steps: [
              { title: "The model is a rule with two learned numbers", body: "Slope $w = 7$ marks per hour and intercept $b = 42.5$. Nobody wrote these; they were fitted to the four examples." },
              { title: "Check it on the training data", body: "Predictions: 49.5, 56.5, 63.5, 70.5. Errors: −0.5, +1.5, −1.5, +0.5. Small, but not zero, because real data is noisy." },
              { title: "Use it on a new input", body: "For 5 hours the model predicts 77.5. This is generalisation: an answer for an input it never saw.", math: r`\hat{y} = 7 \times 5 + 42.5 = 77.5` },
              { title: "Know its limits", body: "For 20 hours the rule predicts 182.5 marks out of 100. A model is only trustworthy near the data it was trained on." },
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.linear_model import LinearRegression
import numpy as np

X = np.array([[1], [2], [3], [4]])    # hours studied (2-D: rows x features)
y = np.array([50, 55, 65, 70])        # marks

model = LinearRegression().fit(X, y)  # learn w and b from examples
print(model.coef_, model.intercept_)  # [7.]  42.5   (least squares)
print(model.predict([[5]]))           # [77.5]`,
          },
          { p: "The pattern never changes: `fit` learns the parameters from examples, `predict` applies them to new inputs." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Judging a model by its training score", fix: "Always report performance on data it never trained on." },
              { mistake: "Using ML when a simple rule works", fix: "If you can write the rule in a few lines, do that. ML is for fuzzy or unknown rules." },
              { mistake: "Trusting predictions far outside the training range", fix: "Models interpolate well and extrapolate badly. Check what range your data covers." },
              { mistake: "Thinking more data always fixes it", fix: "Biased or wrong labels stay wrong at any scale. Quality first." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "You have customer purchase histories but no labels, and want to find groups of similar customers. Which kind of ML is this?", options: ["Regression", "Classification", "Unsupervised learning (clustering)", "Reinforcement learning"], answer: 2, why: "There are no target labels, and the goal is to discover structure, which is unsupervised learning." } },
        ],
      },
    ],
  },
  {
    slug: "how-models-learn",
    group: "Foundations",
    title: "How Models Learn",
    summary: "Predict, measure the error, compute which way to adjust, update, repeat.",
    learnHref: "/learn/how-models-learn",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Training is a loop: make predictions, measure how wrong they are with a loss, use the gradient to nudge every parameter in the direction that reduces the loss, and repeat." } },
          { p: "A model starts with arbitrary parameters, so its first predictions are bad. Each pass through the loop makes them slightly less bad. After enough passes, the parameters settle where the loss is (close to) its minimum." },
        ],
      },
      {
        heading: "The training loop",
        blocks: [
          { math: r`\underbrace{\hat{\mathbf{y}} = f_{\boldsymbol\theta}(\mathbf{X})}_{\text{1. predict}} \;\rightarrow\; \underbrace{L(\boldsymbol\theta) = \tfrac{1}{n}\textstyle\sum_i \ell(\hat{y}_i, y_i)}_{\text{2. measure}} \;\rightarrow\; \underbrace{\nabla_{\boldsymbol\theta} L}_{\text{3. direction}} \;\rightarrow\; \underbrace{\boldsymbol\theta \leftarrow \boldsymbol\theta - \eta \nabla_{\boldsymbol\theta} L}_{\text{4. update}}` },
          {
            list: [
              "**Epoch**: one full pass over the training data.",
              "**Batch**: the subset of examples used for one update. Full batch uses all; mini-batch uses e.g. 32.",
              "**Iteration / step**: one update of the parameters.",
              "**Convergence**: the loss stops improving meaningfully.",
            ],
          },
        ],
      },
      {
        heading: "Parameters vs hyperparameters",
        blocks: [
          {
            table: {
              head: ["", "Parameters", "Hyperparameters"],
              rows: [
                ["Who sets them", "Learned by training", "Chosen by you before training"],
                ["Examples", "Weights $w$, bias $b$, network weights", "Learning rate $\\eta$, $K$ in KNN, tree depth, $\\lambda$"],
                ["How to choose", "Gradient descent / closed form", "Validation set or cross-validation"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: three updates by hand",
        blocks: [
          { p: "Data: $(x, y) = (1, 2)$ and $(2, 4)$. Model $\\hat{y} = wx$ (no bias). Loss: MSE. Start at $w = 0$, learning rate $\\eta = 0.1$. Gradient: $\\frac{dL}{dw} = \\frac{2}{n}\\sum (\\hat{y}_i - y_i)x_i$." },
          {
            steps: [
              { title: "Step 1: predict and measure at w = 0", body: "Predictions 0 and 0, errors −2 and −4.", math: r`L = \tfrac{(-2)^2 + (-4)^2}{2} = 10` },
              { title: "Step 2: compute the gradient", body: "Negative gradient means increasing $w$ lowers the loss.", math: r`\frac{dL}{dw} = \tfrac{2}{2}\big[(-2)(1) + (-4)(2)\big] = -10` },
              { title: "Step 3: update", body: "Move against the gradient.", math: r`w \leftarrow 0 - 0.1 \times (-10) = 1, \qquad L = \tfrac{1 + 4}{2} = 2.5` },
              { title: "Step 4: repeat", body: "At $w = 1$ the gradient is $-5$, so $w \\leftarrow 1.5$ and the loss drops to $0.625$. Each step halves the distance to the answer $w = 2$.", math: r`w: 0 \to 1 \to 1.5 \to 1.75 \to \cdots \to 2` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gd-step", caption: "The same loop on a one-parameter loss. Change the learning rate and watch how many steps it takes to reach the minimum." }],
      },
      {
        heading: "Closed form vs iterative",
        blocks: [
          { p: "Some models, like linear regression, have a formula that gives the best parameters directly (the normal equation). Most models do not, so we use the iterative loop. Even when a formula exists, the loop scales better to huge datasets because it never inverts a large matrix." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np

x = np.array([1.0, 2.0]); y = np.array([2.0, 4.0])
w, lr = 0.0, 0.1
for step in range(6):
    y_hat = w * x
    loss = np.mean((y_hat - y) ** 2)
    grad = 2 * np.mean((y_hat - y) * x)
    print(step, round(w, 4), round(loss, 4))
    w -= lr * grad
# 0 0.0 10.0 | 1 1.0 2.5 | 2 1.5 0.625 | 3 1.75 0.1562 ...`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Training until the training loss is zero", fix: "Watch validation loss and stop when it stops improving (early stopping)." },
              { mistake: "Tuning hyperparameters on the test set", fix: "Use a validation split or cross-validation; touch the test set once." },
              { mistake: "Forgetting to shuffle mini-batches", fix: "Ordered data (e.g. sorted by label) makes each batch biased and training unstable." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Which of these is a hyperparameter rather than a parameter?", options: ["The slope of a linear regression", "A weight inside a neural network", "The maximum depth of a decision tree", "The bias term b"], answer: 2, why: "Tree depth is chosen before training. Slopes, weights and biases are learned by training." } },
        ],
      },
    ],
  },
  {
    slug: "loss-functions",
    group: "Foundations",
    title: "Loss Functions",
    summary: "One number that says how wrong the model is, and the choice of which mistakes matter most.",
    learnHref: "/learn/loss-functions",
    playHref: "/games/bridge?level=line",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A loss function turns all the model's mistakes into a single number to minimise, and its shape decides which mistakes the model cares about most." } },
          { p: "Training can only improve what it can measure. The loss is that measurement. Pick a loss that punishes big errors heavily and the model will avoid big errors; pick one that treats all errors equally and it will be calmer about outliers." },
        ],
      },
      {
        heading: "Regression losses",
        blocks: [
          { math: r`\text{MSE} = \frac{1}{n}\sum_{i=1}^{n}(\hat{y}_i - y_i)^2 \qquad \text{RMSE} = \sqrt{\text{MSE}} \qquad \text{MAE} = \frac{1}{n}\sum_{i=1}^{n}|\hat{y}_i - y_i|` },
          { p: "**Huber loss** is quadratic for small errors and linear for large ones, with a switch point $\\delta$:" },
          { math: r`\ell_\delta(e) = \begin{cases} \tfrac{1}{2}e^2 & |e| \le \delta \\ \delta\left(|e| - \tfrac{1}{2}\delta\right) & |e| > \delta \end{cases}` },
        ],
      },
      {
        heading: "Classification losses",
        blocks: [
          { p: "For a predicted probability $p = P(y = 1)$, **binary cross-entropy** (log loss) is:" },
          { math: r`\text{BCE} = -\frac{1}{n}\sum_{i=1}^{n}\Big[y_i \ln p_i + (1 - y_i)\ln(1 - p_i)\Big]` },
          { p: "For $K$ classes with predicted probabilities $p_{ik}$ and one-hot labels $y_{ik}$: $\\text{CE} = -\\frac{1}{n}\\sum_i\\sum_k y_{ik}\\ln p_{ik}$. Confident wrong answers are punished hard: predicting $p = 0.01$ for a true positive costs $-\\ln 0.01 \\approx 4.6$." },
        ],
      },
      {
        heading: "Choosing a loss",
        blocks: [
          {
            table: {
              head: ["Loss", "Use for", "Behaviour", "Watch out"],
              rows: [
                ["MSE", "Regression (default)", "Squares errors: big errors dominate", "Sensitive to outliers"],
                ["MAE", "Regression with outliers", "All errors count linearly", "Gradient is constant, so less smooth to optimise"],
                ["Huber", "Regression, some outliers", "MSE near 0, MAE far away", "Need to choose $\\delta$"],
                ["Cross-entropy", "Classification", "Punishes confident wrong probabilities", "Needs probabilities, not raw scores"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: one outlier",
        blocks: [
          { p: "Four predictions with errors $e = [1, -1, 2, 10]$. The last one is an outlier." },
          {
            steps: [
              { title: "MSE squares each error", body: "The outlier contributes 100 of the 106 total.", math: r`\text{MSE} = \tfrac{1 + 1 + 4 + 100}{4} = 26.5` },
              { title: "MAE takes absolute values", body: "The outlier contributes 10 of 14.", math: r`\text{MAE} = \tfrac{1 + 1 + 2 + 10}{4} = 3.5` },
              { title: "What that means for training", body: "Minimising MSE will bend the model a lot to reduce that one big error. Minimising MAE cares about it less. Neither is 'right': it depends on whether the outlier is a real case you must predict or a data error." },
              { title: "Cross-entropy for a classifier", body: "True label 1. A prediction of 0.9 costs $-\\ln 0.9 \\approx 0.105$; a prediction of 0.1 costs $-\\ln 0.1 \\approx 2.303$, about 22 times more.", math: r`-\ln 0.9 \approx 0.105, \qquad -\ln 0.1 \approx 2.303` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "mse-line", caption: "Drag the line. MSE reacts strongly to the furthest point; MAE changes more evenly." }],
      },
      {
        heading: "Why MSE and cross-entropy? (the probability view)",
        blocks: [
          {
            derive: {
              title: "Both losses come from maximum likelihood",
              blocks: [
                { p: "Assume each target is the prediction plus Gaussian noise: $y_i = \\hat{y}_i + \\varepsilon_i$, $\\varepsilon_i \\sim \\mathcal{N}(0, \\sigma^2)$. The likelihood of the data is a product of normal densities; its negative log is:" },
                { math: r`-\ln \prod_i \mathcal{N}(y_i \mid \hat{y}_i, \sigma^2) = \frac{1}{2\sigma^2}\sum_i (y_i - \hat{y}_i)^2 + \text{const}` },
                { p: "So minimising MSE is the same as maximising likelihood under Gaussian noise. For a binary label with $P(y_i = 1) = p_i$ (a Bernoulli model), the negative log-likelihood is exactly binary cross-entropy:" },
                { math: r`-\ln \prod_i p_i^{y_i}(1 - p_i)^{1 - y_i} = -\sum_i \big[y_i \ln p_i + (1 - y_i)\ln(1 - p_i)\big]` },
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, log_loss

y_true = np.array([3.0, 5.0, 2.0, 7.0]); y_pred = np.array([4.0, 4.0, 4.0, 17.0])
mean_squared_error(y_true, y_pred)    # 26.5
mean_absolute_error(y_true, y_pred)   # 3.5

log_loss([1, 1], [0.9, 0.1])          # (0.105 + 2.303) / 2 = 1.204`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Comparing MSE values across different datasets", fix: "MSE is in squared target units. Use RMSE or a relative metric to compare." },
              { mistake: "Using MSE for classification probabilities", fix: "Use cross-entropy: it gives stronger gradients when the model is confidently wrong." },
              { mistake: "Confusing the training loss with the business metric", fix: "Train with a smooth loss, then report the metric people care about (accuracy, recall, ₹ error)." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Your house-price data contains a few mansions that are probably data-entry errors. Which loss is least distorted by them?", options: ["MSE", "MAE", "RMSE", "MSE with a bigger learning rate"], answer: 1, why: "MAE grows linearly with the error, so a few huge errors pull the model far less than with squared losses." } },
        ],
      },
    ],
  },
  {
    slug: "gradient-descent",
    group: "Foundations",
    title: "Gradient Descent",
    summary: "Walk downhill on the loss surface, one step at a time, using the gradient as the compass.",
    learnHref: "/learn/gradient-descent",
    playHref: "/games/descent?level=eyeball",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Gradient descent repeatedly moves the parameters a small step in the direction that decreases the loss fastest: the negative gradient." } },
          { p: "Picture standing on a foggy hillside wanting to reach the valley floor. You cannot see the valley, but you can feel the slope under your feet. Step downhill, feel again, step again. That is gradient descent." },
        ],
      },
      {
        heading: "The update rule",
        blocks: [
          { math: r`\boldsymbol\theta_{t+1} = \boldsymbol\theta_t - \eta\, \nabla_{\boldsymbol\theta} L(\boldsymbol\theta_t)` },
          { p: "$\\eta$ (the learning rate) sets the step size. Stop when the gradient is close to zero, the loss stops improving, or after a fixed number of steps." },
          {
            derive: {
              title: "Why the negative gradient is the steepest way down",
              blocks: [
                { p: "For a small step $\\Delta$, a first-order Taylor expansion gives $L(\\boldsymbol\\theta + \\Delta) \\approx L(\\boldsymbol\\theta) + \\nabla L^\\top \\Delta$. Among all steps of fixed length $\\lVert\\Delta\\rVert = \\epsilon$, the change $\\nabla L^\\top\\Delta$ is most negative when $\\Delta$ points opposite to $\\nabla L$ (Cauchy–Schwarz):" },
                { math: r`\nabla L^\top \Delta \ge -\lVert\nabla L\rVert\,\lVert\Delta\rVert, \quad \text{with equality when } \Delta = -\epsilon\,\frac{\nabla L}{\lVert\nabla L\rVert}` },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: L(w) = (w − 3)²",
        blocks: [
          { p: "Gradient: $L'(w) = 2(w - 3)$. Start at $w_0 = 0$ with $\\eta = 0.1$." },
          {
            steps: [
              { title: "Step 1", body: "Slope at 0 is $-6$, so move right.", math: r`w_1 = 0 - 0.1 \times (-6) = 0.6, \qquad L: 9 \to 5.76` },
              { title: "Step 2", body: "Slope at 0.6 is $-4.8$: smaller, because we are closer.", math: r`w_2 = 0.6 - 0.1 \times (-4.8) = 1.08, \qquad L = 3.6864` },
              { title: "The pattern", body: "Each step multiplies the distance to the minimum by $(1 - 2\\eta) = 0.8$. Steps shrink automatically as the slope flattens.", math: r`w_t - 3 = (0 - 3)(0.8)^t \;\Rightarrow\; w_{20} \approx 2.965` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gd-step", caption: "Start far from 3 and watch the steps shrink as the slope flattens. Then try η = 0.9 (zig-zag) and η = 1.05 (blow-up)." }],
      },
      {
        heading: "Batch, stochastic and mini-batch",
        blocks: [
          {
            table: {
              head: ["Variant", "Gradient from", "Pros", "Cons"],
              rows: [
                ["Batch GD", "All $n$ examples", "Smooth, exact direction", "Slow per step on big data"],
                ["Stochastic (SGD)", "One random example", "Very cheap steps, can escape shallow minima", "Noisy path"],
                ["Mini-batch", "A random batch (e.g. 32–256)", "Best of both; fast on GPUs", "Batch size is another hyperparameter"],
              ],
            },
          },
        ],
      },
      {
        heading: "Convexity, local minima and saddle points",
        blocks: [
          { p: "If the loss is **convex** (bowl-shaped), like MSE for linear regression or log loss for logistic regression, any minimum gradient descent finds is the global minimum. Neural network losses are not convex: they have many local minima and saddle points (flat in some directions, curved in others). In practice, noise from mini-batches and momentum help move past saddles, and many local minima turn out to be almost as good as the best." },
        ],
      },
      {
        heading: "Better optimisers",
        blocks: [
          { p: "**Momentum** keeps a running velocity so consistent directions speed up and zig-zags cancel out:" },
          { math: r`\mathbf{v}_{t+1} = \beta\mathbf{v}_t + \nabla L(\boldsymbol\theta_t), \qquad \boldsymbol\theta_{t+1} = \boldsymbol\theta_t - \eta\,\mathbf{v}_{t+1}` },
          { p: "**Adam** also scales each parameter's step by a running average of its squared gradients, so parameters with large, noisy gradients take smaller steps. It is the default for neural networks." },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# From scratch: L(w) = (w - 3)^2
w, lr = 0.0, 0.1
for t in range(20):
    w -= lr * 2 * (w - 3)
print(round(w, 3))        # 2.965

# With scikit-learn (stochastic gradient descent on a linear model)
rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (200, 1)); y = 3 * X[:, 0] + 5 + rng.normal(0, 1, 200)
model = make_pipeline(StandardScaler(), SGDRegressor(max_iter=1000, random_state=0)).fit(X, y)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Not scaling features", fix: "Very different feature ranges stretch the loss surface into a narrow valley and gradient descent zig-zags. Standardise first." },
              { mistake: "Using a fixed number of steps without checking the loss", fix: "Plot the loss curve. It should fall and flatten, not wobble or rise." },
              { mistake: "Assuming the minimum found is the global one", fix: "Only guaranteed for convex losses. For neural nets, try several random starts." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "At the current parameters the gradient is exactly zero. What does gradient descent do next?", options: ["Takes a large random step", "Stays where it is", "Reverses direction", "Doubles the learning rate"], answer: 1, why: "The update subtracts η × 0, so nothing changes. That is a minimum, maximum or saddle point; plain gradient descent cannot tell which." } },
        ],
      },
    ],
  },
  {
    slug: "learning-rate",
    group: "Foundations",
    title: "Learning Rate",
    summary: "The step size of gradient descent: too small crawls, too big overshoots or explodes.",
    learnHref: "/learn/learning-rate",
    playHref: "/games/descent?level=step-size",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "The learning rate η scales every gradient step; it is usually the single most important hyperparameter to get right." } },
          {
            table: {
              head: ["η", "What happens", "Loss curve looks like"],
              rows: [
                ["Too small", "Tiny steps; training takes forever and may stall", "A very slow, almost straight decline"],
                ["About right", "Fast, steady progress to the minimum", "Steep drop, then flattens"],
                ["Too big", "Overshoots the minimum and bounces", "Jagged, stuck high"],
                ["Far too big", "Each step overshoots more than the last", "Rises to infinity / NaN"],
              ],
            },
          },
        ],
      },
      {
        heading: "Exactly when it diverges (1-D case)",
        blocks: [
          { p: "For $L(w) = a(w - w^*)^2$ the update is $w_{t+1} - w^* = (1 - 2a\\eta)(w_t - w^*)$. The error is multiplied by $(1 - 2a\\eta)$ every step:" },
          {
            list: [
              "$0 < \\eta < \\frac{1}{2a}$: factor between 0 and 1, smooth convergence.",
              "$\\frac{1}{2a} < \\eta < \\frac{1}{a}$: factor between −1 and 0, converges while zig-zagging.",
              "$\\eta > \\frac{1}{a}$: $|$factor$| > 1$, diverges.",
            ],
          },
          {
            derive: {
              title: "The general rule: η < 2 / L",
              blocks: [
                { p: "If the gradient is $L$-Lipschitz (curvature at most $L$ in every direction), gradient descent is guaranteed to decrease the loss for $\\eta < 2/L$, and $\\eta = 1/L$ is a safe choice. For a quadratic, $L$ is the largest eigenvalue of the Hessian. In 1-D with $L(w) = a(w - w^*)^2$, the curvature is $2a$, giving $\\eta < 1/a$, matching the case above." },
                { math: r`L(\boldsymbol\theta - \eta\nabla L) \le L(\boldsymbol\theta) - \eta\left(1 - \tfrac{L\eta}{2}\right)\lVert\nabla L\rVert^2` },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: η = 1.1 on L(w) = (w − 3)²",
        blocks: [
          { p: "Here $a = 1$, so anything above $\\eta = 1$ diverges. The factor is $1 - 2(1.1) = -1.2$." },
          {
            steps: [
              { title: "Start at w = 0", body: "Error $e_0 = -3$." },
              { title: "Step 1", body: "Overshoots past 3.", math: r`e_1 = -3 \times (-1.2) = 3.6 \;\Rightarrow\; w_1 = 6.6` },
              { title: "Step 2", body: "Overshoots back, further away.", math: r`e_2 = 3.6 \times (-1.2) = -4.32 \;\Rightarrow\; w_2 = -1.32` },
              { title: "Step 3 and beyond", body: "The distance grows by 20% every step: $|e_t| = 3 \\times 1.2^t$. After 50 steps it is about 27,000.", math: r`w_3 = 8.184, \quad |e_{50}| \approx 2.7 \times 10^4` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "gd-step", caption: "Find the three regimes: η = 0.1 (smooth), 0.8 (zig-zag but converges), 1.05 (diverges)." }],
      },
      {
        heading: "Schedules and warm-up",
        blocks: [
          { p: "A common strategy is to start larger (fast progress) and shrink η over time (fine-tuning near the minimum):" },
          {
            table: {
              head: ["Schedule", "Formula", "Typical use"],
              rows: [
                ["Step decay", "$\\eta_t = \\eta_0 \\cdot \\gamma^{\\lfloor t/s \\rfloor}$", "Drop by 10× every few epochs"],
                ["Exponential", "$\\eta_t = \\eta_0 e^{-kt}$", "Smooth decay"],
                ["Cosine", "$\\eta_t = \\tfrac{\\eta_0}{2}(1 + \\cos(\\pi t/T))$", "Modern deep learning"],
                ["Warm-up", "Increase linearly for the first few hundred steps", "Large models, Adam"],
              ],
            },
          },
        ],
      },
      {
        heading: "How to choose it",
        blocks: [
          {
            list: [
              "Search on a log scale: 0.0001, 0.001, 0.01, 0.1, 1.",
              "Pick the largest value whose loss curve still falls smoothly.",
              "Common defaults: about 0.01 for SGD on scaled data, 0.001 for Adam.",
              "If the loss becomes NaN, the learning rate is almost always too big.",
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `import numpy as np

def run(lr, steps=50, w=0.0):
    for _ in range(steps):
        w -= lr * 2 * (w - 3)
    return w

for lr in [0.01, 0.1, 0.8, 1.05]:
    print(lr, run(lr))
# 0.01 -> 1.91 (too slow), 0.1 -> 3.0, 0.8 -> 3.0 (zig-zags), 1.05 -> about -350 (diverged)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Keeping the learning rate after changing the batch size", fix: "Bigger batches usually tolerate (and need) a bigger learning rate. Re-tune." },
              { mistake: "Searching on a linear grid (0.1, 0.2, 0.3)", fix: "Useful values span orders of magnitude; search 10× apart." },
              { mistake: "Blaming the model when the loss explodes", fix: "Lower η first. Exploding loss is the classic too-big symptom." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "For L(w) = 2(w − 1)², which learning rate diverges?", options: ["η = 0.1", "η = 0.3", "η = 0.45", "η = 0.6"], answer: 3, why: "Here a = 2, so gradient descent diverges when η > 1/a = 0.5. Only 0.6 is above that." } },
        ],
      },
    ],
  },
];
