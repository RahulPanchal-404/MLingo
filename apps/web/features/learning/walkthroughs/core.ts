import type { Section } from "@/features/theory/topics";

const r = String.raw;

/**
 * Step-by-step walkthroughs for the Core ideas lessons.
 * Content is drawn from the MLingo textbook draft (Volume 1: Units 1, 2, 13–16), restructured to
 * release one idea at a time: definition → intuition → steps → formula → worked example →
 * graph → code with output → pros/cons → uses → FAQs → practice.
 */
export const CORE_WALKTHROUGHS: Record<string, Section[]> = {
  "what-is-machine-learning": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Machine learning in one line", body: "Machine learning builds a prediction rule from data: you supply examples of inputs with their outcomes, a training algorithm fits a function, and that fitted function predicts outcomes for inputs it has never seen." } },
        { p: "Two words get mixed up, so separate them first. An **algorithm** is a procedure (for example, \"fit a straight line by least squares\"). A **fitted model** is what you get when you run that procedure on particular data under particular assumptions: concrete numbers you can use to predict." },
        { p: "**Artificial intelligence** is the broad family of systems that do tasks associated with reasoning, perception, language or decisions. **Machine learning** is one way to build such a system: fit its behaviour from data. **Deep learning** uses many-layered trainable representations, and sits inside machine learning. The nesting does not mean every problem needs a neural network: with only a few reliable labelled examples, a transparent threshold can beat an elaborate network." },
      ],
    },
    {
      heading: "Intuition: the library queue",
      blocks: [
        { p: "Our running example (from the textbook): a city library decides whether to open an extra service desk for the next hour. The **input** is information known before the hour starts (day, time, last week's visitors, published staff roster). The **outcome** is the number of visitors who had to wait more than five minutes." },
        { p: "Nobody can write an exact formula for that number. But the library has months of past hours, each with its inputs and its true waiting count. Machine learning looks at those examples and fits a rule that maps \"what we know at the start of the hour\" to \"how many people will wait\"." },
        { p: "The same problem can be framed in different ways, and the framing changes the task:" },
        { list: ["Predict the **number** of delayed visitors: supervised **regression**.", "Predict **whether** that number exceeds ten: supervised **classification**.", "Group hours into busy/quiet patterns with no target: **unsupervised** clustering, which does not directly predict waiting; you must check whether the groups help a later task."] },
      ],
    },
    {
      heading: "Kinds of feedback a learner can get",
      blocks: [
        { table: { head: ["Type", "What the data contains", "What is learned", "Library example"], rows: [["Supervised", "inputs paired with a target $y$", "a function $f$ that predicts $y$ for new inputs", "delayed-visitor count for each past hour"], ["Unsupervised", "inputs only, no designated target", "groupings, densities or a lower-dimensional summary", "clusters of similar hours"], ["Reinforcement", "actions, and feedback that arrives over time", "a policy: which action to take in which state", "learning when to open desks from the results of past choices"]] } },
        { p: "These names describe **the feedback available**, not how sophisticated the code looks. \"Labelled\" also does not mean error-free: if staff only record visitors who reach the desk, people who gave up and left are missing, so the label undercounts real waiting." },
      ],
    },
    {
      heading: "The formula, built in three pieces",
      blocks: [
        { p: "**Piece 1, a loss for one prediction.** Choose $\\ell(f(x), y)$, for example the absolute miss $|f(x) - y|$ in visitors." },
        { p: "**Piece 2, what we actually want: low error on the future.** The expected loss over the future population of hours that matter is called the **risk**:" },
        { math: r`R(f) = \mathbb{E}_{(X, Y) \sim P_{\text{future}}}\big[\ell(f(X), Y)\big]` },
        { p: "**Piece 3, what we can actually compute: the average loss on past data**, the **empirical risk**. Training minimises this, perhaps plus a penalty for complexity:" },
        { math: r`\hat R(f) = \frac{1}{n}\sum_{i=1}^{n} \ell\big(f(x_i),\, y_i\big)` },
        { p: "There is no automatic guarantee that a low $\\hat R$ means a low $R$. The historical hours might exclude weekends, labels might be recorded inconsistently, or a policy might change after the data was collected. That gap between past and future is why we keep a held-out test set." },
      ],
    },
    {
      heading: "Three sources of uncertainty",
      blocks: [
        { list: ["**Outcome noise:** two hours that look identical in the data can still get different numbers of visitors. No model removes this.", "**Parameter uncertainty:** a finite sample supports several plausible fitted functions; more data narrows them down.", "**Shift:** the future process changes, e.g. a nearby transit station closes. A prediction interval that ignores shift cannot claim to cover it."] },
        { p: "So a forecast of 12 delayed visitors is not a promise that exactly 12 will wait. It is a best estimate with uncertainty around it." },
      ],
    },
    {
      heading: "The workflow, step by step",
      blocks: [
        {
          steps: [
            { title: "Specify the decision and the prediction time", body: "Here: decide at the start of each hour whether to open a desk." },
            { title: "Write down the label and which inputs are legal", body: "Only information available before the hour starts may be an input. A same-hour final attendance total leaks the answer." },
            { title: "Collect and validate the data", body: "Check units, time zones, duplicates and how each column was recorded." },
            { title: "Split by the deployment unit", body: "Training data fits parameters, validation data chooses settings, and a test set judges the frozen choice once. For future weeks, hold out later weeks; for new branches, hold out whole branches." },
            { title: "Establish a simple baseline", body: "For example, \"same hour last week\". A model must beat it to be worth deploying." },
            { title: "Train, select, freeze, then test once", body: "Choose the model on validation data, freeze it, and assess it once on held-out data. Re-checking the test score to pick models turns it into a second validation set." },
            { title: "Deploy with input contracts and monitoring", body: "Check incoming data matches what training expected, and measure outcomes as labels arrive. Errors can reveal a badly defined task, not just a parameter that needs tuning." },
          ],
        },
      ],
    },
    {
      heading: "Worked example: prediction vs decision",
      blocks: [
        { p: "An extra desk costs 40 units per hour and saves 4 units of waiting cost per delayed visitor." },
        {
          steps: [
            { title: "Forecast 12 delayed visitors", body: "Saving 12 × 4 = 48. Net gain 48 − 40 = +8, so open the desk." },
            { title: "Forecast 8", body: "Saving 32. Net gain −8, so do not open it." },
            { title: "Read the threshold", body: "The break-even point is 10 visitors. It comes from the costs, not from a classifier's accuracy. If the waiting cost is uncertain, compare several plausible values before fixing the policy." },
          ],
        },
        { p: "**Comparing two models.** Four hours have actual delayed counts (0, 0, 10, 10). Model A predicts (2, 2, 8, 8): every miss is 2, so MAE = 2 and MSE = 4. Model B predicts (0, 0, 6, 10): one miss of 4, so MAE = 1 and MSE = 4. MAE prefers B and MSE calls it a tie. If B's 4-visitor miss lands in the rush hour, a cost-weighted metric might prefer A. **Write the decision loss before celebrating a metric gain.**" },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Library example from the MLingo textbook (Vol 1, Unit 1)
import numpy as np

# 1) Prediction -> decision: extra desk costs 40, each delayed visitor costs 4
desk_cost, wait_cost = 40, 4
for forecast in (12, 8):
    net = forecast * wait_cost - desk_cost
    print(f"forecast {forecast:>2} delayed visitors -> net gain {net:+d} -> {'open desk' if net > 0 else 'do not open'}")
print("break-even forecast:", desk_cost / wait_cost, "visitors")

# 2) Comparing two models on four hours: actual delayed counts (0, 0, 10, 10)
y = np.array([0, 0, 10, 10])
model_a = np.array([2, 2, 8, 8])
model_b = np.array([0, 0, 6, 10])
for name, pred in (("A", model_a), ("B", model_b)):
    e = y - pred
    print(f"model {name}: errors {e}  MAE {np.mean(np.abs(e)):.1f}  MSE {np.mean(e ** 2):.1f}")

# 3) A data tensor: 3 branches x 4 hours x 2 measurements
data = np.zeros((3, 4, 2))
print("tensor shape:", data.shape, "-> flattened rows:", data.reshape(-1, 2).shape)

# Output:
# forecast 12 delayed visitors -> net gain +8 -> open desk
# forecast  8 delayed visitors -> net gain -8 -> do not open
# break-even forecast: 10.0 visitors
# model A: errors [-2 -2  2  2]  MAE 2.0  MSE 4.0
# model B: errors [0 0 4 0]  MAE 1.0  MSE 4.0
# tensor shape: (3, 4, 2) -> flattened rows: (12, 2)` },
        { p: "**Shapes are contracts.** Three branches × four hours × two measurements is a tensor of shape (3, 4, 2). Flattening it to (12, 2) throws away which rows belong to which branch, and a random split of those 12 rows can put hours from the same branch in both training and test data. Keep the branch identifier outside the feature matrix so that grouped splits remain possible." },
      ],
    },
    {
      heading: "Data leakage: the most common way ML fails",
      blocks: [
        { p: "A branch-hour prediction uses a `staff_on_duty` column. The roster was amended at 10:30, but the prediction was issued at 09:00. If the training table stores the final 10:30 roster, the model learns from information it would not have had. It will look excellent in testing and disappoint in use." },
        { p: "**Fix:** store the version of each input as it existed at prediction time, or treat it as missing. For every feature record its unit, when it first becomes available, its source and a fallback, and name an owner who can verify each entry." },
      ],
    },
    {
      heading: "Advantages and limitations",
      blocks: [
        { table: { head: ["Advantages", "Limitations"], rows: [["Learns rules too complex to write by hand", "Needs representative data with trustworthy labels"], ["Improves as more examples arrive", "Learns biases and recording errors in the data"], ["Gives a repeatable, testable decision input", "Fails quietly when the world shifts"], ["Scales to many decisions", "Low training error proves nothing without a proper held-out test"]] } },
      ],
    },
    {
      heading: "Where machine learning is used",
      blocks: [
        { list: ["**Operations:** staffing forecasts (like the library desk), demand forecasting, inventory.", "**Maintenance:** ranking equipment by failure risk so a limited crew inspects the right units.", "**Finance:** fraud detection, credit risk.", "**Healthcare:** reading scans, predicting readmission.", "**Language and vision:** translation, search, spam filters, face unlock."] },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "What is the difference between an algorithm and a model?", solution: [{ p: "The algorithm is the procedure (\"least squares\"). The model is the result of running it on your data: specific fitted numbers that make predictions." }] } },
        { problem: { q: "Why not judge a model by its training error?", solution: [{ p: "Training minimises the empirical risk on past rows, which is optimistic. Only data held out in the way the model will be used (later weeks, or unseen branches) estimates future error." }] } },
        { problem: { q: "Is a random train/test split always fine?", solution: [{ p: "No. The split must mirror deployment. Random rows from the same branch in both sets only measure performance on branches already seen. Use time-based splits for forecasting and group-based splits for new units." }] } },
        { problem: { q: "Does a good prediction automatically give a good decision?", solution: [{ p: "No. The decision also needs costs and constraints: the desk threshold of 10 visitors came from costs, not from the model." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "Frame the library task as regression and as classification. What is y in each?", solution: [{ p: "Regression: y = number of visitors waiting more than five minutes in the hour. Classification: y = 1 if that number exceeds ten, else 0." }] } },
        { problem: { q: "With desk cost 50 and waiting cost 5 per delayed visitor, what forecast justifies opening the desk?", solution: [{ p: "Open when forecast × 5 > 50, i.e. a forecast above 10 delayed visitors." }] } },
        { problem: { q: "Name one leaking column for the library model and a legal replacement.", solution: [{ p: "Leaking: final attendance for the same hour (known only after it). Legal: attendance in the same hour last week, which is known before the hour starts." }] } },
      ],
    },
  ],

  "how-models-learn": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Training in one line", body: "Training is an optimisation problem: write down an objective that measures error, compute how it changes with each parameter, and repeatedly move the parameters in the direction that lowers it." } },
        { p: "Keep three things separate. The **objective** (what counts as a good fit), the **numerical algorithm** (how we minimise it, e.g. gradient descent), and the **statistical question** (does the result predict unseen data?). A perfectly optimised objective can still predict badly, and the textbook's warning is that it can even optimise the wrong objective." },
      ],
    },
    {
      heading: "Intuition: streetlight energy",
      blocks: [
        { p: "A city predicts next-hour electricity use at streetlight controllers from scheduled illumination hours. Three training rows: (x, y) = (0, 1), (1, 3), (2, 5). The model is a line $\\hat y = wx + b$, starting from $w = b = 0$. We will watch it learn, one update at a time." },
      ],
    },
    {
      heading: "Step 1: write the objective",
      blocks: [
        { p: "Use the **mean half-squared error**. The ½ cancels the 2 that appears when you differentiate a square, and averaging by $n$ keeps the gradient's size from depending on how many rows there are:" },
        { math: r`J(w, b) = \frac{1}{2n}\sum_{i=1}^{n} (wx_i + b - y_i)^2` },
        { p: "At $w = b = 0$ the residuals $e_i = wx_i + b - y_i$ are $(-1, -3, -5)$, so $J = (1 + 9 + 25)/6 = 35/6 \\approx 5.833$." },
      ],
    },
    {
      heading: "Step 2: derive the gradient",
      blocks: [
        { p: "By the chain rule (derivative of the square, times derivative of the inside):" },
        { math: r`\frac{\partial J}{\partial w} = \frac{1}{n}\sum_i e_i x_i, \qquad \frac{\partial J}{\partial b} = \frac{1}{n}\sum_i e_i` },
        { p: "At the start: $\\partial J/\\partial w = [(-1)(0) + (-3)(1) + (-5)(2)]/3 = -13/3 \\approx -4.333$ and $\\partial J/\\partial b = (-1 - 3 - 5)/3 = -3$. Both are negative, so increasing $w$ and $b$ will lower the error." },
      ],
    },
    {
      heading: "Step 3: update both parameters together",
      blocks: [
        { math: r`w \leftarrow w - \alpha\,\frac{\partial J}{\partial w}, \qquad b \leftarrow b - \alpha\,\frac{\partial J}{\partial b}` },
        { p: "With learning rate $\\alpha = 0.1$: $w' = 0 - 0.1(-13/3) = 13/30 \\approx 0.433$ and $b' = 0 - 0.1(-3) = 0.3$. The new predictions (0.3, 0.733, 1.167) are still poor, but better: $J$ drops from 5.833 to 3.387." },
        { callout: { title: "Simultaneous means both use the old values", body: "Compute both gradients at the old (w, b), then update both. Updating w first and then computing b's gradient with the new w is a different algorithm." } },
      ],
    },
    {
      heading: "Step 4: repeat, and compare with the known answer",
      blocks: [
        { p: "These three rows fit a line exactly: $w = 2$, $b = 1$. (Check with the formula $\\hat w = \\sum(x_i - \\bar x)(y_i - \\bar y)/\\sum(x_i - \\bar x)^2 = 4/2 = 2$ and $\\hat b = \\bar y - \\hat w\\bar x = 3 - 2 = 1$.) Gradient descent should approach that answer." },
        { figure: { src: "/theory/figures/core_training_loop.svg", alt: "Left: training objective falling on a log scale over 100 updates. Right: the three data points and lines after updates 1, 10 and 100 approaching the data.", caption: "Left: the objective falls quickly, then slowly. Right: after update 1 the line is far too flat; by update 10 it is close; by update 100 it sits almost on the data." } },
      ],
    },
    {
      heading: "Step 5: check the gradient independently",
      blocks: [
        { p: "A sign or averaging mistake in gradient code can still look like it trains. Compare the formula with a **central finite difference**:" },
        { math: r`\frac{\partial J}{\partial w} \approx \frac{J(w + h, b) - J(w - h, b)}{2h}, \qquad h \approx 10^{-5}` },
        { p: "If the analytic and numerical values agree at several points, the code is right. This check catches bugs in the code; it cannot prove the task itself is defined correctly." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Streetlight energy example from the MLingo textbook (Vol 1, Unit 14)
x = [0.0, 1.0, 2.0]
y = [1.0, 3.0, 5.0]

def objective(w, b):                       # mean half-squared error J(w, b)
    return sum((w * xi + b - yi) ** 2 for xi, yi in zip(x, y)) / (2 * len(x))

def gradient(w, b):
    error = [w * xi + b - yi for xi, yi in zip(x, y)]
    return (sum(e * xi for e, xi in zip(error, x)) / len(x), sum(error) / len(x))

w, b, lr = 0.0, 0.0, 0.1
for step in range(1, 1001):
    gw, gb = gradient(w, b)                # both use the OLD w and b (simultaneous update)
    w, b = w - lr * gw, b - lr * gb
    if step in (1, 2, 10, 100, 1000):
        print(f"step {step:>4}: w={w:.4f}  b={b:.4f}  J={objective(w, b):.6f}")
print("known answer: w=2, b=1 (all three rows fit exactly)")

# Check the analytic gradient with central finite differences
h = 1e-5
for w0, b0 in [(0.0, 0.0), (1.25, -0.5)]:
    aw, ab = gradient(w0, b0)
    nw = (objective(w0 + h, b0) - objective(w0 - h, b0)) / (2 * h)
    nb = (objective(w0, b0 + h) - objective(w0, b0 - h)) / (2 * h)
    print(f"at ({w0}, {b0}): analytic ({aw:.6f}, {ab:.6f})  numeric ({nw:.6f}, {nb:.6f})")

# Output:
# step    1: w=0.4333  b=0.3000  J=3.387037
# step    2: w=0.7644  b=0.5267  J=1.969016
# step   10: w=1.7252  b=1.1346  J=0.035009
# step  100: w=1.9877  b=1.0171  J=0.000062
# step 1000: w=2.0000  b=1.0000  J=0.000000
# known answer: w=2, b=1 (all three rows fit exactly)
# at (0.0, 0.0): analytic (-4.333333, -3.000000)  numeric (-4.333333, -3.000000)
# at (1.25, -0.5): analytic (-2.750000, -2.250000)  numeric (-2.750000, -2.250000)` },
        { p: "**Explanation:** the first update matches our hand calculation (0.4333, 0.3). By 1,000 updates the parameters equal the exact answer (2, 1), and the gradient check agrees to six decimals." },
      ],
    },
    {
      heading: "Converging is not the same as generalising",
      blocks: [
        { p: "Suppose training loss falls from 12 to 2 while the validation loss (on later buildings) falls from 13 to 7, then rises to 9. Picking the checkpoint with validation loss 7 is **model selection** (early stopping), so its validation score is no longer an untouched estimate. Evaluate that frozen checkpoint once on a separate test set." },
        { p: "The textbook's warning: a model reaching training MAE 0.1 kWh using `actual_energy_today` (known only after the forecast) is meaningless, while a legal seasonal baseline gets 8 kWh. The fix is removing the illegal feature, not a better optimiser." },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Why the ½ and the 1/n in the objective?", solution: [{ p: "The ½ cancels the 2 from differentiating a square. Dividing by n keeps the gradient's size independent of the number of rows, so the same learning rate works for different dataset sizes." }] } },
        { problem: { q: "What is the difference between a parameter and a hyperparameter?", solution: [{ p: "Parameters (w, b) are fitted from data. Hyperparameters (learning rate, number of updates, regularisation strength) are chosen by you, using validation data." }] } },
        { problem: { q: "When should training stop?", solution: [{ p: "When the gradient is near zero and the training objective stops falling (numerical convergence), or earlier if validation loss starts rising (early stopping). Report the final score from an untouched test set." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "From (w, b) = (0.4333, 0.3), compute the next gradients for the three streetlight rows.", solution: [{ p: "Predictions 0.3, 0.733, 1.167; residuals −0.7, −2.267, −3.833. ∂J/∂w = (0 − 2.267 − 7.667)/3 ≈ −3.311; ∂J/∂b = (−0.7 − 2.267 − 3.833)/3 ≈ −2.267. With α = 0.1: w ≈ 0.764, b ≈ 0.527, matching the code's step 2." }] } },
        { problem: { q: "Training loss keeps falling but validation loss rose after epoch 30. What do you do?", solution: [{ p: "Stop around epoch 30 (early stopping), check for leakage or a split mismatch, then consider regularisation or more representative data. Confirm on an untouched test set." }] } },
      ],
    },
  ],

  "loss-functions": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Loss in one line", body: "A loss function converts each prediction error into a cost, and the choice of loss decides which mistakes the model works hardest to avoid, so it should express the real decision, not just how close a line looks." } },
        { p: "Everything starts from the **residual** $e_i = y_i - \\hat y_i$ (actual minus predicted) for the same unit and time. The sign tells you about persistent over- or under-prediction; absolute and squared losses throw the sign away." },
      ],
    },
    {
      heading: "Intuition: forecasting device demand",
      blocks: [
        { p: "A logistics team predicts how many replacement devices each region will request next week. Four regions, actual demand (10, 20, 30, 40), predictions (11, 18, 28, 47). The residuals are (−1, 2, 2, −7). One question decides the loss: is a single big miss of 7 devices much worse than several small misses?" },
      ],
    },
    {
      heading: "Step 1: mean absolute error (MAE)",
      blocks: [
        { math: r`\text{MAE} = \frac{1}{N}\sum_i |e_i| = \frac{1 + 2 + 2 + 7}{4} = 3` },
        { p: "Three devices per region on average, in the target's own units. Every unit of error counts equally. MAE is minimised by the conditional **median**." },
      ],
    },
    {
      heading: "Step 2: mean squared error (MSE) and RMSE",
      blocks: [
        { math: r`\text{MSE} = \frac{1}{N}\sum_i e_i^2 = \frac{1 + 4 + 4 + 49}{4} = 14.5, \qquad \text{RMSE} = \sqrt{14.5} \approx 3.808` },
        { p: "Squaring makes the 7-device miss contribute 49 of the 58 total (about 84.5%). RMSE returns to devices but keeps that sensitivity. Always $\\text{MAE} \\le \\text{RMSE}$, with equality only when every miss has the same size. MSE is minimised by the conditional **mean**." },
        { p: "**One fix changes the picture:** change only the last prediction from 47 to 41. MAE falls to 1.5 and RMSE to $\\sqrt{10/4} \\approx 1.581$. A model with many small misses and one with rare large misses can swap ranks depending on the metric." },
        { figure: { src: "/theory/figures/core_losses.svg", alt: "Left: MSE parabola, MAE V-shape and Huber curve. Right: log loss for true labels 1 and 0 against predicted probability.", caption: "Left: squared loss grows fastest for big errors, absolute loss linearly, and Huber is in between. Right: log loss rises sharply as a confident prediction turns out wrong." } },
      ],
    },
    {
      heading: "Step 3: asymmetric costs, so predict a quantile",
      blocks: [
        { p: "If running short of devices costs more than overstocking, neither MAE nor MSE fits. With shortage cost $c_u$ and overstock cost $c_o$, the best forecast is the demand **quantile**:" },
        { math: r`q = \frac{c_u}{c_u + c_o}` },
        { p: "Shortage cost 3 and overstock cost 1 give $q = 0.75$: forecast the 75th percentile of demand, not the average. The matching training loss is the quantile (pinball) loss." },
      ],
    },
    {
      heading: "Step 4: classification loss from likelihood",
      blocks: [
        { p: "For a yes/no label, a model gives probability $p$. The probability it assigned to what actually happened is $p$ if $y = 1$ and $1 - p$ if $y = 0$, written compactly as $p^{y}(1 - p)^{1-y}$. Multiply over rows (assuming independence) to get the likelihood, then take the negative log:" },
        { math: r`L = -\sum_i \big[y_i \ln p_i + (1 - y_i)\ln(1 - p_i)\big]` },
        { p: "That is **binary cross-entropy** (log loss). For a true 1, $p = 0.9$ costs $-\\ln 0.9 \\approx 0.105$, but $p = 0.01$ costs about 4.605: a confident miss is punished heavily. For labels (1, 0) with probabilities (0.8, 0.25), the total is about 0.511 (mean 0.255)." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Device-demand example from the MLingo textbook (Vol 1, Unit 16)
import numpy as np

y = np.array([10, 20, 30, 40])          # actual devices requested
p = np.array([11, 18, 28, 47])          # predicted
e = y - p                                # residual convention: actual - predicted
print("residuals:", e)
print(f"MAE {np.mean(np.abs(e)):.3f}  MSE {np.mean(e ** 2):.3f}  RMSE {np.sqrt(np.mean(e ** 2)):.3f}  mean signed error {e.mean():.2f}")
print("share of squared error from the 7-device miss:", f"{49 / np.sum(e ** 2):.3f}")
print(f"R² = {1 - np.sum(e ** 2) / np.sum((y - y.mean()) ** 2):.3f}")

p2 = p.copy(); p2[-1] = 41               # fix only the big miss
e2 = y - p2
print(f"after fixing the big miss: MAE {np.mean(np.abs(e2)):.3f}  RMSE {np.sqrt(np.mean(e2 ** 2)):.3f}")

# Asymmetric costs: shortage costs 3, overstock costs 1 -> forecast the 75th percentile
c_under, c_over = 3, 1
print("best quantile to forecast:", c_under / (c_under + c_over))

# Log loss (binary cross-entropy) from the textbook's Unit 2 and Unit 6 examples
for prob in (0.9, 0.01):
    print(f"true label 1, predicted p={prob}: loss {-np.log(prob):.3f}")
labels, probs = np.array([1, 0]), np.array([0.8, 0.25])
nll = -np.sum(labels * np.log(probs) + (1 - labels) * np.log(1 - probs))
print(f"labels (1,0), probs (0.8,0.25): total {nll:.4f}, mean {nll / 2:.4f}, deviance {2 * nll:.4f}")

# Output:
# residuals: [-1  2  2 -7]
# MAE 3.000  MSE 14.500  RMSE 3.808  mean signed error -1.00
# share of squared error from the 7-device miss: 0.845
# R² = 0.884
# after fixing the big miss: MAE 1.500  RMSE 1.581
# best quantile to forecast: 0.75
# true label 1, predicted p=0.9: loss 0.105
# true label 1, predicted p=0.01: loss 4.605
# labels (1,0), probs (0.8,0.25): total 0.5108, mean 0.2554, deviance 1.0217` },
      ],
    },
    {
      heading: "How to choose",
      blocks: [
        { table: { head: ["If the real cost of error…", "Use", "Note"], rows: [["grows with each unit of miss", "MAE", "robust; targets the median"], ["grows much faster for big misses", "MSE / RMSE", "targets the mean; sensitive to outliers"], ["is different for over vs under", "quantile loss at $q = c_u/(c_u + c_o)$", "connects the forecast to stock decisions"], ["is about probabilities of yes/no", "log loss", "rewards honest probabilities"], ["needs a relative %", "MAPE, with care", "undefined at zero and explodes near zero"]] } },
        { p: "**R² compares to a baseline:** here $R^2 = 1 - 58/500 = 0.884$. It does not mean \"88.4% accurate\": a high R² can still hide unacceptable shortages. Compare with a forecast you could actually deploy, such as \"same week last month\"." },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Is the training loss the same as the reported metric?", solution: [{ p: "Not necessarily. The loss must be smooth enough to optimise (log loss, MSE); the metric expresses the business question (stock-outs, MAE in devices, precision at capacity)." }] } },
        { problem: { q: "Why is MAPE risky?", solution: [{ p: "It divides by the actual value. A 1-device miss when demand is 1 counts as 100%, while a 10-device miss at demand 1,000 counts as 1%, and it is undefined at zero. Dropping zero rows changes the population; state the treatment." }] } },
        { problem: { q: "Why does log loss pair with logistic regression?", solution: [{ p: "It is the negative log-likelihood of a Bernoulli (yes/no) outcome, and with the sigmoid its gradient simplifies to Xᵀ(p − y), giving a convex objective." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "Actual (5, 5, 5, 5), predicted (6, 4, 6, 4). Compute MAE and RMSE. Why are they equal?", solution: [{ p: "Every |error| is 1, so MAE = 1 and RMSE = √1 = 1. They are equal because all the misses are the same size." }] } },
        { problem: { q: "Shortage costs 9, overstock costs 1. Which quantile should you forecast?", solution: [{ p: "q = 9/(9 + 1) = 0.9: forecast the 90th percentile, because running short is nine times worse." }] } },
      ],
    },
  ],

  "gradient-descent": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Gradient descent in one line", body: "Gradient descent repeatedly moves the parameters a small step against the gradient, θ ← θ − η∇J(θ), because that direction lowers the loss fastest for a small enough step." } },
      ],
    },
    {
      heading: "Why stepping against the gradient works",
      blocks: [
        { p: "Near the current point, a small change $\\Delta$ changes the loss by about the gradient times that change:" },
        { math: r`J(\theta + \Delta) \approx J(\theta) + \nabla J(\theta)^\top \Delta` },
        { p: "Choose $\\Delta = -\\eta\\,\\nabla J$. The predicted change is $-\\eta\\,\\lVert\\nabla J\\rVert^2$, which is never positive, so the loss goes down. But this is only a **local** approximation: a large step leaves the region where it is accurate, and the loss can go up." },
      ],
    },
    {
      heading: "Worked example: one row, a good step and a bad step",
      blocks: [
        { p: "One row $x = 2$, $y = 5$. Model $\\hat y = wx + b$, loss $L = \\tfrac12(\\hat y - y)^2$, start at $w = 1$, $b = 0$." },
        {
          steps: [
            { title: "Predict and measure", body: "Prediction 2, error e = 2 − 5 = −3, loss ½ × 9 = 4.5." },
            { title: "Gradient by the chain rule", body: "", math: r`\frac{\partial L}{\partial w} = e\,x = -6, \qquad \frac{\partial L}{\partial b} = e = -3` },
            { title: "Step size 0.1", body: "(w, b) = (1.6, 0.3). New prediction 3.5, loss 1.125: down from 4.5." },
            { title: "Step size 1", body: "(w, b) = (7, 3). New prediction 17, loss 72: far worse. The derivative was correct; the step was too big." },
          ],
        },
      ],
    },
    {
      heading: "The algorithm, step by step",
      blocks: [
        {
          steps: [
            { title: "Write the objective", body: "For linear least squares, J(θ) = ‖Xθ − y‖² / 2n." },
            { title: "Derive the gradient", body: "∇J = Xᵀ(Xθ − y)/n. Check the shapes: Xᵀ is (p × n) and the residual is (n × 1), so the gradient is (p × 1), one entry per parameter." },
            { title: "Update", body: "θ ← θ − η∇J(θ)." },
            { title: "Monitor", body: "Track the training objective and gradient norm (convergence), and separately the validation loss (generalisation)." },
          ],
        },
        { p: "**A scalar bowl to see the pattern:** $J(w) = \\tfrac12(w - 4)^2$ has gradient $w - 4$. From $w_0 = 0$ with $\\eta = 0.25$: $w_1 = 1$, $w_2 = 1.75$, $w_3 = 2.3125$. The distance to 4 shrinks by the factor $(1 - \\eta) = 0.75$ every step: $w_k - 4 = (1 - \\eta)^k (w_0 - 4)$." },
        { figure: { src: "/theory/figures/core_gd_path.svg", alt: "Elliptical contours of the streetlight objective with a red path from (0,0) to the minimum at (2,1).", caption: "The streetlight rows (0, 1), (1, 3), (2, 5) with η = 0.1. Early steps are long because the slope is steep; near the minimum (2, 1) the steps become tiny." } },
      ],
    },
    {
      heading: "Batch, stochastic and mini-batch",
      blocks: [
        { p: "The full gradient averages the row gradients. At one point, suppose four rows have gradients (2, 4, −3, 1): the full gradient is 1. Picking one row at random gives 1 **on average**, an unbiased but noisy estimate. That is stochastic gradient descent." },
        {
          steps: [
            { title: "Data", body: "(1, 2), (2, 4), (3, 6) with ŷ = wx, J = (1/2n)Σ(wx − y)², start w = 0, η = 0.1." },
            { title: "Per-row gradients at w = 0", body: "x(wx − y) = (−2, −8, −18). Full-batch gradient = −28/3, so w = 14/15 ≈ 0.933." },
            { title: "Mini-batch of rows 1–2", body: "Gradient (−2 − 8)/2 = −5, so w = 0.5." },
            { title: "Then row 3 alone", body: "Gradient 3(0.5 × 3 − 6) = −13.5, so w = 1.85. Change the order and you get a different path, and that is not a bug." },
          ],
        },
        { p: "An **epoch** is one pass through the data, not one update. With 1,000 rows and batch size 100 there are 10 updates per epoch; with batch size 10 there are 100. Shuffle each epoch, unless the data is a time sequence that must stay in order." },
      ],
    },
    {
      heading: "Code with output",
      blocks: [
        { code: r`# Gradient-descent examples from the MLingo textbook (Vol 1, Units 13 and 15)
import numpy as np

# 1) One row, half-squared error: x=2, y=5, start w=1, b=0
x, y = 2.0, 5.0
def loss(w, b): return (w * x + b - y) ** 2 / 2
w, b = 1.0, 0.0
e = w * x + b - y
gw, gb = e * x, e
print(f"error {e}, gradients ({gw}, {gb}), loss {loss(w, b)}")
for step in (0.1, 1.0):
    nw, nb = w - step * gw, b - step * gb
    print(f"step size {step}: new (w, b) = ({nw:.1f}, {nb:.1f}), loss {loss(nw, nb):.3f}")

# 2) Scalar bowl J(w) = ½(w − 4)², learning rate 0.25
w = 0.0
path = []
for _ in range(3):
    w -= 0.25 * (w - 4)
    path.append(w)
print("J = ½(w−4)², η = 0.25:", path)

# 3) Full batch vs mini-batch on (1,2), (2,4), (3,6) with ŷ = wx
X = np.array([1.0, 2.0, 3.0]); Y = np.array([2.0, 4.0, 6.0])
per_row = X * (0 * X - Y)                  # per-row gradients at w = 0
print("per-row gradients:", per_row, " full-batch gradient:", round(per_row.mean(), 4))
print("full-batch step  -> w =", round(0 - 0.1 * per_row.mean(), 4))
print("mini-batch rows 1-2 -> gradient", per_row[:2].mean(), "-> w =", 0 - 0.1 * per_row[:2].mean())
w = 0.5; g3 = 3 * (w * 3 - 6)
print("then row 3 alone at w=0.5 -> gradient", g3, "-> w =", round(w - 0.1 * g3, 4))

# Output:
# error -3.0, gradients (-6.0, -3.0), loss 4.5
# step size 0.1: new (w, b) = (1.6, 0.3), loss 1.125
# step size 1.0: new (w, b) = (7.0, 3.0), loss 72.000
# J = ½(w−4)², η = 0.25: [1.0, 1.75, 2.3125]
# per-row gradients: [ -2.  -8. -18.]  full-batch gradient: -9.3333
# full-batch step  -> w = 0.9333
# mini-batch rows 1-2 -> gradient -5.0 -> w = 0.5
# then row 3 alone at w=0.5 -> gradient -13.5 -> w = 1.85` },
      ],
    },
    {
      heading: "Convex bowls, saddles and better optimisers",
      blocks: [
        { list: ["**Convex** objectives (least squares, logistic regression): any point with zero gradient is the global minimum.", "**Saddle points:** the gradient is zero but it is not a minimum; neural-network losses have many.", "**Momentum:** $v \\leftarrow \\beta v + g$, $\\theta \\leftarrow \\theta - \\eta v$. A running velocity smooths alternating gradients in narrow valleys.", "**AdaGrad / RMSProp / Adam:** scale each coordinate's step by its gradient history; Adam adds momentum and bias correction. They are not guaranteed to generalise better than plain SGD, so compare them at equal compute."] },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "The loss became NaN or exploded. What is wrong?", solution: [{ p: "Usually the step is too large, features are badly scaled, a log is taken of 0, or the gradient code is wrong. Lower η, standardise features (using training statistics only), and run a finite-difference check." }] } },
        { problem: { q: "The loss is flat at a poor value. Why?", solution: [{ p: "The step may be tiny, the gradients may vanish, parameters may be accidentally frozen, or the objective may be coded wrongly. Check the gradient norm and test on a case with a known answer." }] } },
        { problem: { q: "Does summing instead of averaging the loss matter?", solution: [{ p: "Yes. A sum makes the gradient n times larger, so the same numeric learning rate behaves completely differently. Use one convention consistently." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "J(w) = ½(w − 4)², start w = 0, η = 0.5. Compute three steps and the general formula.", solution: [{ p: "w − 4 shrinks by (1 − 0.5) = 0.5 each step: w = 2, 3, 3.5. In general w_k = 4 − 4(0.5)^k." }] } },
        { problem: { q: "For the one-row example (x = 2, y = 5, start w = 1, b = 0), what step size lands the prediction exactly on 5?", solution: [{ p: "After a step α the prediction is (1 + 6α)·2 + 3α = 2 + 15α. Setting it to 5 gives α = 0.2." }] } },
      ],
    },
  ],

  "learning-rate": [
    {
      heading: "Definition",
      blocks: [
        { callout: { title: "Learning rate in one line", body: "The learning rate η sets the size of every gradient step; there is a hard upper limit set by the curvature of the loss, η < 2/L, and above it training diverges." } },
        { p: "η is a **hyperparameter**: chosen by you, not fitted. It interacts with feature scaling, batch size and how the loss is normalised." },
      ],
    },
    {
      heading: "Intuition: why too big overshoots",
      blocks: [
        { p: "Take the simplest bowl, $J(\\theta) = \\theta^2/2$. Its gradient is $\\theta$, so one step gives $\\theta \\leftarrow (1 - \\alpha)\\,\\theta$. With $\\alpha = 0.5$ the distance halves each step. With $\\alpha = 1$ you land on 0. With $\\alpha = 1.5$ you jump to the other side at half the distance, still converging. With $\\alpha = 2$ you bounce between $\\pm\\theta$ forever, and with $\\alpha > 2$ each bounce is bigger: divergence. So here the stable range is $0 < \\alpha < 2$." },
      ],
    },
    {
      heading: "Step 1: the scalar rule",
      blocks: [
        { p: "For $J(w) = \\tfrac12(w - 4)^2$ (curvature 1): $w_k - 4 = (1 - \\eta)^k (w_0 - 4)$. The error contracts when $|1 - \\eta| < 1$, i.e. $0 < \\eta < 2$. With curvature $c$ (for example $J = \\tfrac{c}{2}(w - 4)^2$) the factor becomes $(1 - \\eta c)$, so the limit is $\\eta < 2/c$. Steeper bowls need smaller steps." },
      ],
    },
    {
      heading: "Step 2: many parameters, the steepest direction wins",
      blocks: [
        { p: "For least squares $J(\\theta) = \\lVert D\\theta - y\\rVert^2/2n$, the curvature is the constant Hessian $H = D^\\top D/n$. In each eigen-direction $j$ of $H$ (eigenvalue $\\lambda_j$) the error obeys:" },
        { math: r`e_{t+1,j} = (1 - \eta\,\lambda_j)\, e_{t,j}` },
        { p: "Every direction must contract, so $\\eta < 2/\\lambda_j$ for all $j$. The largest eigenvalue $L = \\lambda_{\\max}$ is the strictest:" },
        { math: r`0 < \eta < \frac{2}{L}` },
        { p: "Directions with tiny $\\lambda_j$ contract slowly even with a stable step. That is why a slowly falling loss is not necessarily a bug: some directions are just flat." },
      ],
    },
    {
      heading: "Step 3: units and scaling change the limit",
      blocks: [
        { p: "Record a sensor in watts instead of kilowatts and its column is multiplied by 1,000. Its curvature grows by a factor of a million, and the safe learning rate shrinks by the same factor. One learning rate cannot then suit both the steep and the flat directions." },
        { p: "**Fix:** standardise each feature with the training mean and standard deviation (and apply the same numbers to validation and test rows). Do not standardise the intercept column. Scaling improves the geometry but cannot fix exactly duplicated columns or bad labels." },
      ],
    },
    {
      heading: "Worked check: the textbook's verified fit",
      blocks: [
        { p: "Thirty synthetic sensor readings follow $y = 1 + 0.6x - 0.3x^2 + \\text{noise}$. With standardised $x$ and $x^2$ columns plus an intercept, compute $L$, then train once at $0.8/L$ (inside the limit) and once at $2.1/L$ (outside it)." },
        { code: r`# Curvature and the step-size limit, from the MLingo textbook (Vol 1, Unit 15.9)
import numpy as np

rng = np.random.default_rng(62)
x_train = np.linspace(-2, 2, 30)
y_train = 1 + 0.6 * x_train - 0.3 * x_train ** 2 + rng.normal(0, 0.12, len(x_train))

raw = np.column_stack((x_train, x_train ** 2))
center, scale = raw.mean(axis=0), raw.std(axis=0)          # fitted on training rows only
D = np.column_stack((np.ones(len(x_train)), (raw - center) / scale))

H = D.T @ D / len(D)                                        # Hessian of J = ‖Dθ − y‖² / 2n
L = np.linalg.eigvalsh(H)[-1]                               # steepest curvature
print(f"largest Hessian eigenvalue L = {L:.4f}  ->  stable if η < 2/L = {2 / L:.4f}")

def loss(theta): return np.mean((D @ theta - y_train) ** 2) / 2
def fit(rate, steps):
    theta = np.zeros(D.shape[1]); hist = [loss(theta)]
    for _ in range(steps):
        theta -= rate * D.T @ (D @ theta - y_train) / len(D)
        hist.append(loss(theta))
    return theta, np.array(hist)

theta, stable = fit(0.8 / L, 300)
exact = np.linalg.lstsq(D, y_train, rcond=None)[0]
print(f"η = 0.8/L : loss {stable[0]:.3f} -> {stable[-1]:.5f}, matches least squares: {np.allclose(theta, exact, atol=1e-4)}")
_, unstable = fit(2.1 / L, 16)
print(f"η = 2.1/L : loss {unstable[0]:.3f} -> {unstable[-1]:.3f} after 16 steps (diverging)")

# Units change curvature: the same column in watts instead of kilowatts
D_watts = D.copy(); D_watts[:, 1] *= 1000
L_w = np.linalg.eigvalsh(D_watts.T @ D_watts / len(D))[-1]
print(f"one column x1000 -> L = {L_w:,.0f}, safe η now below {2 / L_w:.2e}")

# Output:
# largest Hessian eigenvalue L = 1.0000  ->  stable if η < 2/L = 2.0000
# η = 0.8/L : loss 0.536 -> 0.00533, matches least squares: True
# η = 2.1/L : loss 0.536 -> 11.215 after 16 steps (diverging)
# one column x1000 -> L = 1,000,000, safe η now below 2.00e-06` },
        { figure: { src: "/theory/figures/core_lr.svg", alt: "Left: training loss falling to about 0.005 for η=0.8/L and rising above 10 for η=2.1/L. Right: step decay, cosine and warm-up schedules.", caption: "Left: the same starting point, two step sizes. Inside the 2/L limit the loss falls to the least-squares minimum; just outside it, the loss grows with every step. Right: common schedules that lower η during training." } },
      ],
    },
    {
      heading: "Schedules: change η during training",
      blocks: [
        { list: ["**Step decay:** halve η every few epochs (0.1 → 0.05 → 0.025).", "**Cosine:** $\\eta_t = \\tfrac{\\eta_0}{2}(1 + \\cos(\\pi t/T))$, gliding from $\\eta_0$ to 0.", "**Warm-up:** ramp up from a tiny value over the first epochs, then decay.", "**Why decay with SGD?** A constant step keeps bouncing around the minimum because of sampling noise; shrinking it lets training settle. The schedule is itself a hyperparameter, chosen on validation data."] },
      ],
    },
    {
      heading: "How to choose a learning rate",
      blocks: [
        {
          steps: [
            { title: "Standardise features first", body: "Using training statistics only." },
            { title: "Try a log grid briefly", body: "1e−4, 1e−3, 1e−2, 1e−1, 1." },
            { title: "Read the curves", body: "Spikes or growth: too large. A flat line: too small (or a bug)." },
            { title: "Take the largest smooth value, then decay it", body: "Confirm on validation data, never on the final test set." },
          ],
        },
      ],
    },
    {
      heading: "Frequently asked questions",
      blocks: [
        { problem: { q: "Is the 2/L rule exact for neural networks?", solution: [{ p: "No. It is exact for quadratic losses such as least squares. For neural networks the curvature changes as training moves, but the intuition still holds: steep directions limit the safe step." }] } },
        { problem: { q: "Does changing the batch size change the right learning rate?", solution: [{ p: "Yes. Bigger batches give less noisy gradients, so larger steps are often stable. Also check whether your loss is summed or averaged." }] } },
        { problem: { q: "Adam has a default learning rate. Is that enough?", solution: [{ p: "Adam adapts per-coordinate steps, but its base rate (often 0.001) still matters and should be tuned on validation data." }] } },
      ],
    },
    {
      heading: "Practice",
      blocks: [
        { problem: { q: "For J(w) = ½(3w − 6)², what is the largest stable fixed learning rate? Why is it different from the ½(w − 4)² case?", solution: [{ p: "The second derivative is 3² = 9, so η < 2/9 ≈ 0.222. The bowl is nine times steeper than ½(w − 4)² (curvature 1), so the step must be nine times smaller." }] } },
        { problem: { q: "A Hessian has eigenvalues 0.5 and 50. What is the step limit, and which direction converges slowly?", solution: [{ p: "η < 2/50 = 0.04. With η = 0.04 the flat direction contracts by |1 − 0.04 × 0.5| = 0.98 per step, very slowly. This is why scaling, which evens out the eigenvalues, speeds things up." }] } },
      ],
    },
  ],
};
