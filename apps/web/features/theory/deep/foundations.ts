import type { Deep } from "./types";

const r = String.raw;

export const DEEP_FOUNDATIONS: Record<string, Deep> = {
  "what-is-machine-learning": {
    explain: [
      { p: "Every machine learning system has the same three ingredients. **Data**: examples of the situation you care about. **A model**: a family of functions with adjustable numbers (parameters), for example all straight lines $y = wx + b$. **A learning algorithm**: a procedure that searches that family for the member that fits the data best, measured by a loss. Change any one of the three and you get a different system." },
      { p: "The model family is a choice you make, and it limits what can be learned. If you choose straight lines, no amount of data will produce a curve. This built-in preference is called the **inductive bias**. Linear regression assumes straight-line relationships, KNN assumes nearby points behave alike, decision trees assume the answer changes in steps along individual features. Choosing a model is choosing an inductive bias that matches your problem." },
      { p: "Why can a model work on data it has never seen? Only because of an assumption: training data and future data come from the **same distribution**. Loan applications from 2025 resemble those from 2026; photos of cats resemble other photos of cats. When this breaks (the world changes, or you deploy in a different city), performance drops. This is called **distribution shift** or **data drift**, and it is one of the most common reasons real systems fail." },
      { p: "It also explains the central tension of the whole subject. A model flexible enough to capture the real pattern is often flexible enough to capture noise too. **Underfitting** means the model is too simple to capture the pattern; **overfitting** means it captured noise that will not repeat. Almost every technique in this course (regularisation, cross-validation, pruning, dropout, early stopping) exists to manage that trade-off." },
      {
        table: {
          head: ["Term", "Meaning", "Example (house prices)"],
          rows: [
            ["Feature / input $x$", "A measurable property used to predict", "Area, bedrooms, distance to metro"],
            ["Target / label $y$", "What you want to predict", "Sale price"],
            ["Example / sample / row", "One observation", "One house"],
            ["Parameters $\\theta$", "Numbers the algorithm learns", "Price per m², base price"],
            ["Hyperparameters", "Settings you choose before training", "Polynomial degree, regularisation strength"],
            ["Training set", "Data used to fit parameters", "80% of past sales"],
            ["Test set", "Data held back to measure generalisation", "The other 20%"],
            ["Inference", "Using the trained model to predict", "Pricing a new listing"],
          ],
        },
      },
      { p: "Two broad families of model are worth naming early. **Parametric** models (linear and logistic regression, neural networks) squeeze everything they learned into a fixed set of parameters; after training you can throw the data away. **Non-parametric** models (KNN, decision trees grown fully, kernel methods) keep a structure that grows with the data. Parametric models are compact and fast at prediction; non-parametric ones are flexible but heavier." },
    ],
    extra: [
      {
        heading: "When not to use machine learning",
        blocks: [
          {
            list: [
              "The rule is known exactly and stable (tax slabs, unit conversion). Write the rule.",
              "There is too little data, or labels cannot be obtained. Start by collecting data.",
              "Every mistake is unacceptable and must be explainable line by line, with no tolerance for error.",
              "The target is not actually predictable from the available features (lottery numbers).",
            ],
          },
          { p: "A useful sanity check before any project: could a domain expert make a decent prediction from the same features? If not, a model probably cannot either." },
        ],
      },
    ],
    practice: [
      {
        q: "Classify each task as regression, classification or clustering: (a) predicting tomorrow's temperature, (b) deciding if a tumour is malignant, (c) grouping news articles by topic with no labels, (d) predicting the number of app downloads next week.",
        solution: [{ p: "(a) Regression: a number. (b) Classification: two classes. (c) Clustering: no labels, find groups. (d) Regression: a count is a number (sometimes modelled with special count regression, but still regression)." }],
      },
      {
        q: "A model fitted on Bengaluru flat prices is used to price flats in a small town. Its errors are three times larger than on the test set. What went wrong?",
        solution: [{ p: "Distribution shift. The test set came from the same distribution as training (Bengaluru), so it gave an honest estimate for Bengaluru only. Small-town prices follow a different relationship. Fix: collect data from the new market, or at least evaluate on it before deploying." }],
      },
      {
        q: "For the model $\\hat{y} = 7x + 42.5$ (marks from hours studied), which numbers are parameters and which choices were hyperparameters?",
        solution: [{ p: "Parameters: the slope 7 and intercept 42.5, learned from data. Hyperparameter-like choices: using a straight line (degree 1), using squared error, any regularisation strength. You chose those before training." }],
      },
    ],
    interview: [
      { q: "What is the difference between AI, machine learning and deep learning?", a: "AI is the broad goal of machines doing tasks that need intelligence, including hand-written rules. Machine learning is the subset where behaviour is learned from data. Deep learning is the subset of ML that uses neural networks with many layers, which learn their own features from raw inputs like pixels or text." },
      { q: "Why do we need a separate test set?", a: "Training error is optimistic because the model has seen those examples and may have memorised noise. A test set the model never touched estimates performance on new data from the same distribution, which is what matters in use." },
      { q: "What is inductive bias? Give an example.", a: "The assumptions a model makes so it can generalise beyond the examples. Linear regression assumes the target changes linearly with the features; KNN assumes nearby points have similar labels. Without some bias, no generalisation is possible." },
      { q: "Is more data always better?", a: "More representative, correctly labelled data usually helps, especially for high-variance models. But biased or noisy data at scale stays biased, and a high-bias model will not improve with more data; it needs more capacity." },
    ],
    summary: [
      "ML learns parameters from examples instead of hand-writing rules.",
      "Ingredients: data, a model family, a loss, and an optimisation algorithm.",
      "Supervised (regression, classification), unsupervised (clustering, dimensionality reduction), reinforcement.",
      "Generalisation to new data is the goal; it relies on training and future data sharing a distribution.",
      "Always keep a test set the model never trains on.",
      "Underfitting = too simple; overfitting = memorised noise.",
    ],
    quiz: [
      { q: "Which statement about parameters and hyperparameters is correct?", options: ["Both are learned by gradient descent", "Parameters are learned; hyperparameters are set before training", "Hyperparameters are learned; parameters are set by you", "They are the same thing"], answer: 1, why: "Weights and biases are learned. Settings like learning rate, K or tree depth are chosen before training, usually by validation." },
      { q: "A spam filter trained in 2020 gets worse every year. The most likely cause is:", options: ["Too much training data", "Distribution shift: spam changed", "The test set was too large", "Underfitting from the start"], answer: 1, why: "Spammers change tactics, so new emails no longer resemble the training data." },
    ],
  },

  "how-models-learn": {
    explain: [
      { p: "Think of the loss as a landscape. Every possible setting of the parameters is a location; the height at that location is how wrong the model is there. Training is a hike downhill. With two parameters you can picture an actual surface; with a million parameters the idea is the same, just impossible to draw." },
      { p: "Why use the gradient rather than trying random changes? With $d$ parameters there are $d$ directions to try. The gradient gives the slope in every direction at once, computed in roughly the cost of one prediction (thanks to backpropagation). That is what makes training models with millions of parameters possible." },
      { p: "The loop has four steps, and each has a common bug. **Predict**: data and parameters must have matching shapes. **Measure**: the loss must suit the task (cross-entropy for classes, MSE for numbers). **Compute the gradient**: must be the gradient of that loss, with the right sign. **Update**: subtract (not add) a small multiple of it. Watching the loss after every epoch tells you whether all four are right: it should fall quickly at first, then flatten." },
      {
        table: {
          head: ["Loss curve shape", "What it usually means", "What to try"],
          rows: [
            ["Falls fast, then flattens", "Healthy training", "Check validation loss for overfitting"],
            ["Barely moves", "Learning rate too small, or a bug in gradients", "Raise η 10×; check the gradient sign"],
            ["Jumps around, no trend", "Learning rate too big, or batches too small", "Lower η; bigger batch"],
            ["Goes to NaN / infinity", "Diverging", "Lower η a lot; scale features"],
            ["Train falls, validation rises", "Overfitting", "Regularise, early stop, more data"],
          ],
        },
      },
      { p: "Training data is usually processed in **mini-batches**. A batch of 32 rows gives a noisy but cheap estimate of the full gradient. Noise sounds bad, but it helps: it shakes the parameters out of shallow dips and acts as a mild regulariser. One pass over all batches is one **epoch**, and training typically runs for tens to hundreds of epochs." },
      { p: "Finally, the difference between **closed-form** and **iterative** training. Linear regression can be solved in one formula because its loss is a simple bowl. Logistic regression, neural networks and most other models have no such formula, so we iterate. Even for linear regression, gradient descent wins when there are millions of rows or features, because the formula needs a large matrix inverse." },
    ],
    practice: [
      {
        q: "Model $\\hat{y} = wx$, data (1, 3) and (2, 6), MSE loss, $w_0 = 0$, $\\eta = 0.1$. Compute $w_1$ and the loss before and after the step.",
        solution: [
          { p: "Predictions at $w = 0$ are 0 and 0, errors −3 and −6. Loss $= (9 + 36)/2 = 22.5$." },
          { math: r`\frac{dL}{dw} = \frac{2}{2}\big[(-3)(1) + (-6)(2)\big] = -15, \qquad w_1 = 0 - 0.1(-15) = 1.5` },
          { p: "At $w = 1.5$: predictions 1.5 and 3, errors −1.5 and −3, loss $= (2.25 + 9)/2 = 5.625$. The true answer is $w = 3$." },
        ],
      },
      {
        q: "With 10,000 training rows and a batch size of 50, how many parameter updates happen in 20 epochs?",
        solution: [{ p: "10,000 / 50 = 200 batches per epoch, so 200 × 20 = 4,000 updates." }],
      },
      {
        q: "Your training loss goes 2.3, 2.3, 2.3, 2.3 for 50 epochs. List three things to check.",
        solution: [{ list: ["Is the learning rate far too small (try 10× bigger)?", "Are gradients actually reaching the parameters (sign, zero gradients, frozen layers)?", "Are inputs scaled and labels correct (e.g. all labels the same, or shuffled away from inputs)?"] }],
      },
    ],
    interview: [
      { q: "What is the difference between an epoch, a batch and an iteration?", a: "A batch is the subset of data used for one update. An iteration is one update. An epoch is one full pass over the training data, so it contains (n / batch size) iterations." },
      { q: "Why is stochastic (mini-batch) gradient descent used instead of full-batch?", a: "Each step is far cheaper, so you make progress after seeing a fraction of the data; it fits in GPU memory; and its noise helps escape shallow minima and saddle points, often generalising better." },
      { q: "How do you know when to stop training?", a: "Monitor validation loss; stop when it has not improved for a set number of epochs (early stopping) and keep the best checkpoint. Also stop if the training loss has plateaued and further epochs cost more than they gain." },
    ],
    summary: [
      "Training loop: predict → loss → gradient → update, repeated.",
      "The gradient points uphill; step the opposite way, scaled by the learning rate.",
      "Mini-batches give cheap, noisy gradient estimates; an epoch is one pass over the data.",
      "Parameters are learned; hyperparameters are chosen with validation data.",
      "Read the loss curve: it diagnoses learning rate, bugs and overfitting.",
    ],
    quiz: [
      { q: "The training loss becomes NaN after a few iterations. The most likely cause is:", options: ["Learning rate too small", "Learning rate too large", "Too few epochs", "Test set too small"], answer: 1, why: "Too-large steps overshoot and grow until numbers overflow." },
      { q: "With 6,400 rows and batch size 64, one epoch has how many iterations?", options: ["64", "100", "6,400", "409,600"], answer: 1, why: "6,400 / 64 = 100 updates per epoch." },
    ],
  },

  "loss-functions": {
    explain: [
      { p: "A loss turns a vague goal ('predict well') into a precise number an optimiser can push down. It must be cheap to compute, and for gradient-based training it should be differentiable, so the gradient can say which way to move. That is why we train on smooth losses like MSE and cross-entropy even when we report other metrics like accuracy, which is flat almost everywhere and has no useful gradient." },
      { p: "Look at how each loss grows with the error $e$. MSE grows like $e^2$: doubling an error quadruples its cost, so big errors dominate and the model works hardest to avoid them. MAE grows like $|e|$: every unit of error costs the same. That single difference explains their behaviour: MSE predicts the **mean** of the target for a given input, MAE predicts the **median**. If your data has outliers, the mean is pulled toward them and the median is not." },
      {
        derive: {
          title: "Why MSE gives the mean and MAE gives the median",
          blocks: [
            { p: "Suppose the model must predict one constant $c$ for values $y_1, \\dots, y_n$. For MSE, set the derivative to zero:" },
            { math: r`\frac{d}{dc}\sum_i (y_i - c)^2 = -2\sum_i (y_i - c) = 0 \;\Rightarrow\; c = \frac{1}{n}\sum_i y_i` },
            { p: "For MAE, the derivative of $|y_i - c|$ is $-1$ when $y_i > c$ and $+1$ when $y_i < c$. The sum is zero when as many points lie above $c$ as below: that is the median." },
          ],
        },
      },
      { p: "For classification, the model outputs a probability $p$ for the true class, and cross-entropy charges $-\\ln p$. If the model is sure and right ($p = 0.99$) the cost is 0.01. If it is sure and wrong ($p = 0.01$) the cost is 4.6. If it hedges ($p = 0.5$) the cost is 0.69. So cross-entropy rewards both being right and being **honest about confidence**, which is why its probabilities tend to be useful." },
      {
        table: {
          head: ["Predicted p for the true class", "0.99", "0.9", "0.5", "0.1", "0.01"],
          rows: [["Cross-entropy cost $-\\ln p$", "0.010", "0.105", "0.693", "2.303", "4.605"]],
        },
      },
      { p: "Two more losses you will meet. **Hinge loss** $\\max(0, 1 - y f(x))$ (SVMs) ignores points that are correctly classified with enough margin and penalises the rest linearly. **Log-cosh** and **quantile (pinball) loss** are used when you want smooth MAE-like behaviour or a specific quantile (for example, predicting the 90th percentile of delivery time so you rarely promise too early)." },
      { p: "Finally, the full training objective is often **loss + regularisation**: $J(\\theta) = \\frac{1}{n}\\sum \\ell + \\lambda R(\\theta)$. The loss measures fit to the data; the regulariser measures complexity. The ridge, lasso and weight-decay pages are all about the second term." },
    ],
    practice: [
      {
        q: "True values [10, 20, 30], predictions [12, 18, 36]. Compute MSE, RMSE and MAE.",
        solution: [
          { p: "Errors: +2, −2, +6. Squares: 4, 4, 36." },
          { math: r`\text{MSE} = \tfrac{44}{3} \approx 14.67, \quad \text{RMSE} \approx 3.83, \quad \text{MAE} = \tfrac{2 + 2 + 6}{3} \approx 3.33` },
        ],
      },
      {
        q: "A classifier gives probabilities 0.8, 0.6 and 0.3 for the true class of three examples. What is the average cross-entropy?",
        solution: [
          { math: r`\tfrac{1}{3}\big[-\ln 0.8 - \ln 0.6 - \ln 0.3\big] = \tfrac{1}{3}[0.223 + 0.511 + 1.204] \approx 0.646` },
        ],
      },
      {
        q: "Which single constant minimises MSE for targets [1, 2, 3, 10]? Which minimises MAE?",
        solution: [{ p: "MSE: the mean, 4. MAE: any value between the two middle points 2 and 3 (the median, commonly 2.5). The outlier 10 pulls the MSE answer up but barely affects MAE." }],
      },
    ],
    interview: [
      { q: "Why not train a classifier by directly maximising accuracy?", a: "Accuracy is a step function of the parameters: tiny changes rarely flip a prediction, so its gradient is zero almost everywhere and gradient descent gets no signal. Cross-entropy is smooth and still rewards correct, confident predictions." },
      { q: "When would you prefer MAE or Huber over MSE?", a: "When the data has outliers or heavy-tailed errors that you do not want to dominate training, for example data-entry errors or rare extreme values. Huber keeps MSE's smooth behaviour near zero and MAE's robustness far away." },
      { q: "What is the link between MSE and maximum likelihood?", a: "If you assume targets equal the prediction plus Gaussian noise, maximising the likelihood is the same as minimising squared error. Cross-entropy is the same idea for a Bernoulli (or categorical) model of the labels." },
    ],
    summary: [
      "Loss = one number measuring how wrong the model is; training minimises it.",
      "MSE punishes big errors (predicts the mean); MAE treats errors equally (predicts the median).",
      "Huber: MSE near zero, MAE for large errors.",
      "Cross-entropy for classification: $-\\ln p$ of the true class; harsh on confident mistakes.",
      "MSE and cross-entropy both come from maximum likelihood.",
      "Train on a smooth loss; report the metric that matters to people.",
    ],
    quiz: [
      { q: "A model predicts p = 0.5 for the true class. Its cross-entropy is about:", options: ["0", "0.5", "0.69", "1"], answer: 2, why: "−ln 0.5 = ln 2 ≈ 0.693." },
      { q: "Doubling every error multiplies MSE by:", options: ["2", "4", "√2", "It does not change"], answer: 1, why: "Each squared error becomes (2e)² = 4e²." },
    ],
  },

  "gradient-descent": {
    explain: [
      { p: "A **gradient** is a vector of slopes, one per parameter: $\\nabla L = (\\partial L/\\partial w_1, \\dots, \\partial L/\\partial w_d)$. Each entry answers: if I nudge this one parameter up a little, how much does the loss change? The vector as a whole points in the direction of steepest increase, so its negative points downhill." },
      { p: "Gradient descent's steps shrink automatically near the minimum, because the slope itself shrinks there. That is why it can use a fixed learning rate and still settle down. It also explains why it is slow on **flat** regions (tiny gradients, tiny steps) and why scaling matters: if one feature is in thousands and another in units, the loss surface becomes a long, narrow valley. The gradient then points mostly across the valley rather than along it, and the path zig-zags." },
      { p: "Gradient descent on two parameters, worked fully. Loss $L(w_1, w_2) = w_1^2 + 4w_2^2$ (a stretched bowl with its minimum at (0, 0)). Gradient: $(2w_1, 8w_2)$. Start at (4, 1), $\\eta = 0.1$." },
      {
        steps: [
          { title: "Step 1", body: "Gradient at (4, 1) is (8, 8).", math: r`(w_1, w_2) = (4, 1) - 0.1(8, 8) = (3.2,\; 0.2), \quad L: 20 \to 10.4` },
          { title: "Step 2", body: "Gradient (6.4, 1.6).", math: r`(3.2, 0.2) - 0.1(6.4, 1.6) = (2.56,\; 0.04), \quad L \approx 6.56` },
          { title: "What you see", body: "The steep direction $w_2$ (curvature 8) is solved almost immediately; the gentle direction $w_1$ (curvature 2) shrinks by only 20% per step. Convergence speed is set by the flattest direction, and the safe learning rate by the steepest one ($\\eta < 2/8$). The ratio of the two (the **condition number**, here 4) measures how hard the problem is." },
        ],
      },
      { p: "Stopping rules used in practice: a maximum number of iterations; the change in loss falls below a tolerance (e.g. $10^{-6}$); the gradient norm $\\lVert\\nabla L\\rVert$ falls below a tolerance; or the validation loss stops improving (early stopping)." },
      { p: "Local minima are less of a problem in practice than the pictures suggest. For convex losses (linear and logistic regression, SVMs) there is only one minimum. For neural networks, the biggest obstacles are usually saddle points and flat plateaus, which momentum, mini-batch noise and adaptive optimisers handle well." },
    ],
    extra: [
      {
        heading: "Gradient descent for linear regression",
        blocks: [
          { p: "For $\\hat{y}_i = wx_i + b$ with MSE, the partial derivatives are averages of error × input:" },
          { math: r`\frac{\partial L}{\partial w} = \frac{2}{n}\sum_i (\hat{y}_i - y_i)\,x_i, \qquad \frac{\partial L}{\partial b} = \frac{2}{n}\sum_i (\hat{y}_i - y_i)` },
          { p: "In matrix form for all weights at once: $\\nabla_{\\mathbf{w}} L = \\frac{2}{n}\\mathbf{X}^\\top(\\mathbf{X}\\mathbf{w} - \\mathbf{y})$. This one line is the whole training algorithm for linear regression." },
        ],
      },
    ],
    practice: [
      {
        q: "$L(w) = (w - 5)^2$, start $w_0 = 1$, $\\eta = 0.25$. Find $w_1$, $w_2$ and the general formula for $w_t$.",
        solution: [
          { p: "$L'(w) = 2(w - 5)$, so the error is multiplied by $1 - 2(0.25) = 0.5$ each step." },
          { math: r`w_1 = 1 - 0.25(-8) = 3, \quad w_2 = 3 - 0.25(-4) = 4, \quad w_t = 5 - 4(0.5)^t` },
        ],
      },
      {
        q: "Data (1, 2), (2, 3). Model $\\hat{y} = wx + b$, start $w = b = 0$, $\\eta = 0.1$, MSE. Do one step.",
        solution: [
          { p: "Errors $\\hat{y} - y$: −2, −3." },
          { math: r`\frac{\partial L}{\partial w} = \tfrac{2}{2}[(-2)(1) + (-3)(2)] = -8, \quad \frac{\partial L}{\partial b} = \tfrac{2}{2}[-2 - 3] = -5` },
          { math: r`w = 0.8, \quad b = 0.5` },
        ],
      },
      {
        q: "For $L(w_1, w_2) = w_1^2 + 9w_2^2$, what is the largest learning rate that still converges?",
        solution: [{ p: "Curvatures are 2 and 18. Each direction needs $\\eta < 2/\\text{curvature}$, so the binding one is $\\eta < 2/18 \\approx 0.111$." }],
      },
    ],
    interview: [
      { q: "Why does feature scaling speed up gradient descent?", a: "Unscaled features make the loss surface a long, narrow valley with very different curvatures. The learning rate must be small enough for the steepest direction, so progress along the flat direction is painfully slow and the path zig-zags. Scaling makes the bowl rounder." },
      { q: "Can gradient descent get stuck? Where?", a: "At any point with zero gradient: local minima, maxima or saddle points. For convex losses the only such point is the global minimum. For neural networks, saddle points and plateaus are the usual problem; momentum and mini-batch noise help." },
      { q: "Explain the difference between batch, stochastic and mini-batch gradient descent.", a: "Batch uses all examples per update (accurate, slow per step). Stochastic uses one example (very noisy, cheap). Mini-batch uses a small random subset, typically 32–256 (good balance and efficient on GPUs); it is what 'SGD' usually means in practice." },
    ],
    summary: [
      "Update: $\\theta \\leftarrow \\theta - \\eta\\nabla L$.",
      "The negative gradient is the direction of steepest decrease.",
      "Steps shrink automatically as the slope flattens near the minimum.",
      "Unscaled features → narrow valleys → zig-zag and slow convergence.",
      "Convex losses have one minimum; neural nets have saddles and plateaus.",
      "Momentum and Adam improve on the plain update.",
    ],
    quiz: [
      { q: "For L(w) = (w − 2)² and η = 0.5, starting from w = 0, where is w after one step?", options: ["1", "2", "4", "−2"], answer: 1, why: "L′(0) = −4, so w = 0 − 0.5(−4) = 2. With η = 1/(2a) and a = 1, it jumps straight to the minimum." },
      { q: "In mini-batch gradient descent, what does increasing the batch size mainly do?", options: ["Makes each gradient estimate less noisy", "Removes the need for a learning rate", "Guarantees the global minimum", "Increases the number of updates per epoch"], answer: 0, why: "Averaging over more examples reduces the noise; it also reduces updates per epoch." },
    ],
  },

  "learning-rate": {
    explain: [
      { p: "The learning rate converts a slope into a step. The gradient says 'the loss rises by 6 per unit of $w$ here'; the learning rate decides whether that means moving 0.06 units or 6 units. Because the right step depends on the shape of the loss, there is no universal good value; it has to be found for each model and dataset." },
      { p: "Picture the three regimes on a bowl. **Too small**: every step is safe but tiny, so training needs thousands of epochs and may stop (by time limit) far from the bottom. **Just right**: big early steps, then smaller ones as the slope flattens. **Too large**: the step jumps past the bottom onto the opposite wall, which is steeper there, so the next step is even bigger, and the loss explodes." },
      { p: "In real training, a good learning rate often sits just below the point where training becomes unstable. A practical way to find it is the **learning-rate range test**: start very small (1e−7), increase η exponentially every batch, and plot loss against η. The loss first stays flat, then falls quickly, then shoots up. Choose a value somewhat below where it is falling fastest, often about 10× below where it blows up." },
      { p: "Why decay the learning rate? Early on, the parameters are far from good, so large steps are efficient. Near the end, mini-batch noise means the parameters bounce around the minimum; smaller steps let them settle. Warm-up does the opposite at the very start: for large networks (especially with Adam), the first gradients can be erratic, so the learning rate ramps up over the first few hundred steps." },
      {
        table: {
          head: ["Setting", "Typical starting learning rate"],
          rows: [
            ["SGD on standardised features (linear/logistic)", "0.01–0.1"],
            ["SGD + momentum for CNNs", "0.1, with decay"],
            ["Adam / AdamW", "0.001 (1e−3); 1e−4 for fine-tuning"],
            ["Gradient boosting (shrinkage)", "0.05–0.1"],
          ],
        },
      },
      { p: "The learning rate interacts with other settings. Bigger batches give less noisy gradients and usually allow a bigger learning rate (a common rule: scale η roughly with batch size). Momentum effectively multiplies the step by about $1/(1 - \\beta)$, so adding momentum often requires lowering η." },
    ],
    practice: [
      {
        q: "For $L(w) = 3(w - 1)^2$, find the learning rates for (a) smooth convergence, (b) oscillating convergence, (c) divergence.",
        solution: [
          { p: "Here $a = 3$; the error is multiplied by $1 - 2a\\eta = 1 - 6\\eta$ each step." },
          { list: ["(a) $0 < \\eta < 1/6$: factor in (0, 1).", "(b) $1/6 < \\eta < 1/3$: factor in (−1, 0).", "(c) $\\eta > 1/3$: |factor| > 1."] },
        ],
      },
      {
        q: "A step decay schedule starts at $\\eta_0 = 0.1$ and multiplies by 0.5 every 10 epochs. What is η at epoch 35?",
        solution: [{ math: r`\eta_{35} = 0.1 \times 0.5^{\lfloor 35/10 \rfloor} = 0.1 \times 0.5^3 = 0.0125` }],
      },
      {
        q: "Cosine schedule $\\eta_t = \\tfrac{\\eta_0}{2}(1 + \\cos(\\pi t/T))$ with $\\eta_0 = 0.01$, $T = 100$. Find η at $t = 0, 50, 100$.",
        solution: [{ p: "$t = 0$: $\\cos 0 = 1$, so 0.01. $t = 50$: $\\cos(\\pi/2) = 0$, so 0.005. $t = 100$: $\\cos\\pi = -1$, so 0." }],
      },
    ],
    interview: [
      { q: "Your loss oscillates wildly. What do you change first?", a: "Lower the learning rate (try 3–10× smaller). Then check feature scaling and batch size. Oscillation that eventually explodes almost always means the steps are too large for the steepest direction of the loss." },
      { q: "Why use a learning-rate schedule?", a: "Large steps make fast progress early; small steps let the parameters settle into the minimum instead of bouncing because of gradient noise. Schedules get both, usually reaching a lower final loss than any fixed rate." },
      { q: "How does Adam change the role of the learning rate?", a: "Adam divides each parameter's step by a running estimate of its gradient size, so η becomes roughly the maximum step size per parameter, independent of the gradient's scale. It is less sensitive to tuning, but η still matters a lot." },
    ],
    summary: [
      "η scales every step: too small is slow, too large oscillates or diverges.",
      "For a quadratic with curvature c, diverges when η > 2/c.",
      "Search η on a log scale; the range test finds a good value quickly.",
      "Schedules: decay for fine settling; warm-up for stable starts.",
      "Re-tune η when you change batch size, optimiser or momentum.",
    ],
    quiz: [
      { q: "You double the batch size. A common heuristic for the learning rate is to:", options: ["Halve it", "Keep it exactly the same", "Roughly double it", "Set it to 1"], answer: 2, why: "Larger batches give less noisy gradients, so larger steps are usually safe (linear scaling rule, used with warm-up)." },
      { q: "During the learning-rate range test, the loss starts rising sharply at η = 0.1. A sensible choice is about:", options: ["0.5", "0.1", "0.01", "1e−6"], answer: 2, why: "Choose roughly an order of magnitude below the blow-up point, where the loss was still falling fast." },
    ],
  },
};
