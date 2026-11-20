import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: What is Machine Learning? */
export const WIML: EasyTopic = {
  sections: {
    "The idea": {
      plain: "Normally you write the rules and the computer follows them. In machine learning you show the computer examples with the right answers, and it works out the rules for itself.",
      examples: [
        {
          kind: "idea",
          title: "Spam filter, two ways",
          blocks: [
            { list: ["**Rules by hand:** \"if the email contains 'lottery' or 'free money', mark it spam.\" Spammers switch to 'l0ttery' and the rule breaks.", "**Machine learning:** give the system 10,000 emails already marked spam or not. It learns which words, senders and patterns go with spam, and can be retrained when spammers change tactics."] },
          ],
        },
      ],
    },
    "Explained in depth": {
      plain: "Every ML system has data, a model with adjustable numbers, a loss that scores mistakes, and an optimiser that adjusts the numbers. It works on new data only if the new data resemble the old.",
      examples: [
        {
          at: 0,
          title: "The four ingredients for house prices",
          blocks: [
            { table: { head: ["Ingredient", "House-price example"], rows: [["Data", "1,000 past sales: area, bedrooms, price"], ["Model", "price = $w_1 \\times$ area $+ w_2 \\times$ bedrooms $+ b$"], ["Loss", "Mean squared difference between predicted and actual price"], ["Optimiser", "Gradient descent adjusts $w_1, w_2, b$ to lower the loss"]] } },
          ],
        },
        {
          at: 2,
          kind: "idea",
          title: "When the same-distribution assumption breaks",
          blocks: [
            { p: "A model trained on 2019 restaurant orders predicts 2020 orders badly: lockdowns changed everything. The model did not get worse; the world it was trained on stopped existing." },
          ],
        },
        {
          at: 3,
          title: "Underfit, good fit, overfit",
          blocks: [
            { table: { head: ["Model", "Training error", "Test error", "Verdict"], rows: [["Straight line through a curved pattern", "High", "High", "Underfitting"], ["Gentle curve", "Low", "Low", "Good"], ["Wiggly curve through every point", "Almost 0", "High", "Overfitting"]] } },
          ],
        },
      ],
    },
    "The formal setup": {
      examples: [
        {
          title: "Reading the formula with real numbers",
          blocks: [
            { p: "Two training examples $(x, y) = (1, 3)$ and $(2, 5)$, model $f_\\theta(x) = \\theta x$, squared-error loss. For $\\theta = 2$: losses are $(2 - 3)^2 = 1$ and $(4 - 5)^2 = 1$, average 1. For $\\theta = 2.6$: $(2.6 - 3)^2 = 0.16$ and $(5.2 - 5)^2 = 0.04$, average 0.10. The arg min picks the $\\theta$ with the smallest average; here it is $\\theta = 2.6$ exactly." },
          ],
        },
      ],
    },
    "Types of machine learning": {
      examples: [
        {
          kind: "idea",
          title: "Name the type",
          blocks: [
            { list: ["Predict tomorrow's temperature in °C: **regression** (a number).", "Decide whether a transaction is fraud: **classification** (a category).", "Group customers by shopping habits with no labels: **clustering** (unsupervised).", "Teach a robot to walk by rewarding forward progress: **reinforcement learning**."] },
          ],
        },
      ],
    },
    "When not to use machine learning": {
      examples: [
        {
          kind: "idea",
          title: "Rule or model?",
          blocks: [
            { list: ["Converting Celsius to Fahrenheit: write $F = 1.8C + 32$. No model needed.", "Calculating GST on a bill: a fixed rule set by law.", "Recognising handwritten digits: nobody can write the rule, but there are millions of labelled examples. Use ML."] },
          ],
        },
      ],
    },
    "1.1.1 What a model learns, what it does not, and where it belongs": {
      plain: "A model is what you get after training an algorithm on particular data. It predicts; it does not decide. Deciding what to do with a prediction needs costs, rules and people.",
      examples: [
        {
          at: 6,
          title: "Prediction versus decision",
          blocks: [
            { p: "Forecast: 12 delayed visitors next hour. Saving from an extra desk: $12 \\times 4 = 48$. Cost of the desk: 40. Net gain 8, so open the desk. If the forecast were 9: saving 36 < 40, so do not. The same model supports different actions depending on costs." },
          ],
        },
      ],
    },
    "1.1.3 Choose the evaluation unit before any model is fitted": {
      plain: "Decide how the model will be used before you split the data. If it must work for new branches, test on branches it never saw. If it must forecast the future, test on later dates.",
      examples: [
        {
          at: 4,
          title: "Same MSE, different MAE",
          blocks: [
            { table: { head: ["", "Errors", "MAE", "MSE"], rows: [["Model A", "2, 2, 2, 2", "2", "4"], ["Model B", "0, 0, 4, 0", "1", "4"]] } },
            { p: "MSE calls them equal; MAE prefers B. Which is better depends on whether one big miss hurts more than several small ones." },
          ],
        },
      ],
    },
    "1.1.4 The people, artifacts, and boundaries in an ML project": {
      plain: "An ML project is teamwork with hand-offs: data, labels, features, model, deployment. Each hand-off needs a written contract and someone responsible for it.",
    },
    "1.2.1 A prediction problem is a contract": {
      plain: "Before choosing an algorithm, write down five things: what one row is, when the prediction is made, what is being predicted, what action follows, and which period you will test on.",
      examples: [
        {
          at: 4,
          kind: "idea",
          title: "Columns that leak the answer",
          blocks: [
            { p: "To predict whether a fridge truck will overheat on its next trip, \"temperature at arrival\" and \"repair ticket opened during the trip\" look extremely predictive, but neither exists before the trip starts. A model using them would score brilliantly in testing and be useless in practice." },
          ],
        },
      ],
    },
    "1.17.1 Batch, incremental, and instance-based prediction": {
      plain: "Batch models are retrained from time to time on a snapshot. Online models update as new labelled examples arrive. Instance-based models (like KNN) keep the training rows and look up similar ones.",
    },
    "3.1.5 The production lifecycle is more than `fit`": {
      plain: "Training is one step of many: define the problem, get and check data, build features, compare with a baseline, deploy, monitor, and repeat.",
    },
    "Textbook case: From a Fitted Model to a Reliable Service": {
      plain: "How a trained model becomes a service other software can call: a clear input format, version numbers, checks on every request, and monitoring after release.",
    },
    "3.25.1 Define an inference contract before writing an endpoint": {
      plain: "Decide exactly what a prediction request must contain (fields, types, units, allowed values) and what the response means, before writing any server code.",
    },
    "3.25.2 Package, version, and reproduce a prediction": {
      plain: "Ship the model together with its preprocessing, input format and version. Then the same input always gives the same output, and you can tell which model produced it.",
      examples: [
        {
          at: 3,
          title: "A unit change breaks the model silently",
          blocks: [
            { p: "Trained with booked seats in people (mean 10, scale 5). The feed switches to tens of people, so 12 people arrives as 1.2. Scaled input: $(1.2 - 10)/5 = -1.76$ instead of $(12 - 10)/5 = 0.4$. The model still returns a probability, just a wrong one. A range check on the input would catch it." },
          ],
        },
      ],
    },
    "3.25.3 Evaluate before and after release without moving the goalposts": {
      plain: "Test offline first, then run the model in the background (shadow mode), then roll it out carefully. Fix the success measure before you look at the results.",
    },
    "3.25.4 Monitor inputs, outcomes, and the action policy": {
      plain: "After release, watch the inputs (are they still in range?), the outputs (has the alert rate jumped?) and, once known, the real outcomes.",
    },
    "3.25.5 Interpretation, explanations, and causal caution": {
      plain: "Explanations describe how the model reacts to its inputs. They do not show what would happen in the real world if you changed those inputs.",
    },
  },
  code: {
    "3.25.1 Define an inference contract before writing an endpoint#0": {
      goal: "A prediction function that validates its input and returns a labelled result",
      code: r`from math import exp

MODEL = {'version': 'library-queue-demo-v1',
         'mean_seats': 10.0, 'scale_seats': 5.0,
         'intercept': -1.0, 'coef_seats': 0.6,
         'coef_workshop': 0.8}

def predict_queue(request):
    if not isinstance(request, dict):
        raise TypeError('JSON object required')
    seats = request.get('booked_seats')
    event = request.get('event_type')
    if isinstance(seats, bool) or not isinstance(seats, (int, float)) or not 0 <= seats <= 500:
        raise ValueError('booked_seats must be a finite in-range number')
    if event not in {'quiet', 'reading', 'workshop'}:
        raise ValueError('event_type is unknown')
    scaled = (seats - MODEL['mean_seats']) / MODEL['scale_seats']
    logit = MODEL['intercept'] + MODEL['coef_seats'] * scaled + MODEL['coef_workshop'] * (event == 'workshop')
    probability = 1 / (1 + exp(-logit))
    return {'model_version': MODEL['version'],
            'event': 'more_than_ten_visitors_wait_over_five_minutes_next_hour',
            'probability': probability}

assert 0 < predict_queue({'booked_seats': 12, 'event_type': 'reading'})['probability'] < 1
assert predict_queue({'booked_seats': 10, 'event_type': 'workshop'})['probability'] > predict_queue({'booked_seats': 10, 'event_type': 'quiet'})['probability']
print(predict_queue({"booked_seats": 12, "event_type": "reading"}))
print(predict_queue({"booked_seats": 10, "event_type": "workshop"})["probability"].__round__(3), "vs quiet", predict_queue({"booked_seats": 10, "event_type": "quiet"})["probability"].__round__(3))

# Output:
# {'model_version': 'library-queue-demo-v1', 'event': 'more_than_ten_visitors_wait_over_five_minutes_next_hour', 'probability': 0.31864626621097447}
# 0.45 vs quiet 0.269`,
      walk: [
        { line: "MODEL = {'version': 'library-queue-demo-v1',", say: "The saved model: its version, the scaling numbers and the coefficients, fixed after training." },
        { line: "if isinstance(seats, bool) or not isinstance(seats, (int, float)) or not 0 <= seats <= 500:", say: "Reject anything that is not a sensible number of seats before scoring." },
        { line: "scaled = (seats - MODEL['mean_seats']) / MODEL['scale_seats']", say: "Apply exactly the scaling learned in training." },
        { line: "probability = 1 / (1 + exp(-logit))", say: "The sigmoid turns the score into a probability between 0 and 1." },
        { line: "return {'model_version': MODEL['version'],", say: "Return the probability together with the model version and what the probability is about." },
      ],
    },
    "In Python#0": {
      goal: "Fit and use your first model with scikit-learn",
      walk: [
        { line: "X = np.array([[1], [2], [3], [4]])    # hours studied (2-D: rows x features)", say: "Features must be 2-D: one row per student, one column per feature." },
        { line: "model = LinearRegression().fit(X, y)  # learn w and b from examples", say: "`fit` finds the slope and intercept from the four examples." },
        { line: "print(model.predict([[5]]))           # [77.5]", say: "`predict` applies the learned rule to a new input: 7 × 5 + 42.5 = 77.5." },
      ],
    },
  },
};

/** Easy layer: How Models Learn. */
export const HML: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Training is a loop: predict, measure the error, work out which way to change each number, change it a little, repeat. Most training problems show up in the shape of the loss curve.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Why not just try random changes?",
          blocks: [
            { p: "A small image model has 1 million weights. Trying each weight up and down separately needs 2 million loss calculations per step. The gradient gives all 1 million slopes at once for about the cost of one prediction plus one backward pass." },
          ],
        },
        {
          at: 3,
          title: "Diagnose from the curve",
          blocks: [
            { list: ["Loss goes 2.3, 2.3, 2.3, 2.3: nothing is learning. Check the learning rate (too small?) or the gradient code.", "Loss goes 2.3, 1.1, 0.7, 0.6, 0.6: healthy. Now compare with validation loss.", "Loss goes 2.3, 5.8, 41, NaN: diverging. Lower the learning rate."] },
          ],
        },
      ],
    },
    "The training loop": {
      examples: [
        {
          title: "Counting epochs, batches and steps",
          blocks: [
            { p: "1,000 training rows, batch size 100: each epoch has 1,000/100 = 10 steps. Training for 5 epochs means 50 parameter updates. With batch size 10 it would be 500 updates in the same 5 epochs." },
          ],
        },
      ],
    },
    "Parameters vs hyperparameters": {
      examples: [
        {
          kind: "idea",
          title: "Sort these",
          blocks: [
            { list: ["The slope $w$ of a fitted line: **parameter** (learned).", "$K = 5$ in KNN: **hyperparameter** (you choose it, ideally with cross-validation).", "A tree's maximum depth: **hyperparameter**.", "The split threshold \"age < 30\" inside a fitted tree: **parameter**."] },
          ],
        },
      ],
    },
    "Closed form vs iterative": {
      examples: [
        {
          kind: "idea",
          title: "Formula or loop?",
          blocks: [
            { p: "For linear regression with 3 features, the normal equation solves a 3 × 3 system instantly. With 1 million text features, that system is 1 million × 1 million, far too big to solve directly, so even linear models switch to iterative methods like SGD." },
          ],
        },
      ],
    },
    "1.13.5 Optimization and statistical evaluation are different checks": {
      plain: "A low training loss means the optimiser worked. It does not mean the model is useful: it may be using information it will not have in real life.",
    },
    "1.15.1 State the objective and its units": {
      plain: "Write the loss exactly, including whether it is averaged and whether the bias is penalised. Gradient formulas only match when the loss definitions match.",
      examples: [
        {
          at: 2,
          title: "A shape check catches bugs",
          blocks: [
            { p: "$X$ is $100 \\times 3$, $\\theta$ has 3 entries, so $X\\theta - y$ has 100 entries and $X^\\top(X\\theta - y)$ has 3 entries: one slope per parameter. If your gradient came out with 100 entries, you forgot the $X^\\top$." },
          ],
        },
      ],
    },
    "1.15.2 Derive the update rather than memorizing it": {
      plain: "The update rule comes from one idea: near the current point the loss is nearly a straight slope, so a small step downhill must lower it.",
    },
    "1.15.6 Check derivatives with finite differences": {
      plain: "Test your gradient code by nudging the parameters and measuring the change in loss. Then test the whole training loop on data whose answer you already know.",
    },
    "1.15.7 Diagnose failure with separate plots and tests": {
      plain: "Plot the training loss against steps, and validation loss alongside it. Spikes, flat lines and a growing gap each point to a different problem.",
    },
  },
  code: {
    "1.15.6 Check derivatives with finite differences#0": {
      goal: "Check a gradient numerically, then train with mini-batches and compare with the exact answer",
      code: r`import numpy as np

x = np.array([1., 2., 3.])
y = np.array([2., 4., 6.])
def loss(w):
    return np.mean((w*x-y)**2)/2
def gradient(w):
    return np.mean(x*(w*x-y))
assert np.isclose(gradient(0.), -28/3)
assert np.isclose(0.-0.1*gradient(0.), 14/15)
eps=1e-5
for w in (-1.2, 0.0, 1.4):
    numeric=(loss(w+eps)-loss(w-eps))/(2*eps)
    assert np.isclose(numeric,gradient(w),rtol=1e-8)

rng=np.random.default_rng(41)
X=np.column_stack([np.ones(120),rng.normal(size=(120,2))])
target=X@np.array([5.,2.,-3.])+rng.normal(scale=.2,size=120)
theta=np.zeros(3)
for epoch in range(250):
    for batch in rng.permutation(len(X)).reshape(12,10):
        grad=X[batch].T@(X[batch]@theta-target[batch])/len(batch)
        theta-=.05*grad
reference=np.linalg.lstsq(X,target,rcond=None)[0]
objective=lambda w: np.mean((X@w-target)**2)/2
assert objective(theta)<objective(np.zeros(3))
assert abs(objective(theta)-objective(reference))<.005
print("gradient at w=0:", round(gradient(0.), 4), "| one step to:", round(0.-0.1*gradient(0.), 4))
print("mini-batch SGD theta:", theta.round(3), "| least squares:", reference.round(3))

# Output:
# gradient at w=0: -9.3333 | one step to: 0.9333
# mini-batch SGD theta: [ 5.006  1.998 -2.985] | least squares: [ 5.009  1.998 -2.986]`,
      walk: [
        { line: "return np.mean(x*(w*x-y))", say: "The hand-derived gradient of the mean half-squared error." },
        { line: "numeric=(loss(w+eps)-loss(w-eps))/(2*eps)", say: "The numerical estimate to compare against, at three different $w$ values." },
        { line: "for batch in rng.permutation(len(X)).reshape(12,10):", say: "Shuffle the 120 rows and cut them into 12 mini-batches of 10." },
        { line: "grad=X[batch].T@(X[batch]@theta-target[batch])/len(batch)", say: "The gradient on this mini-batch only." },
        { line: "reference=np.linalg.lstsq(X,target,rcond=None)[0]", say: "The exact least-squares answer. Mini-batch SGD lands within 0.003 of it." },
      ],
    },
    "In Python#0": {
      goal: "Run the training loop by hand and print each step",
      walk: [
        { line: "y_hat = w * x", say: "1. Predict with the current weight." },
        { line: "loss = np.mean((y_hat - y) ** 2)", say: "2. Measure: mean squared error." },
        { line: "grad = 2 * np.mean((y_hat - y) * x)", say: "3. Gradient: which way, and how strongly, to change $w$." },
        { line: "w -= lr * grad", say: "4. Update. The loss falls 10 → 2.5 → 0.625 as $w$ approaches 2." },
      ],
    },
  },
};

/** Easy layer: Loss Functions. */
export const LOSS: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "A loss turns \"how wrong are we?\" into one number. Its shape decides what the model cares about: squared loss hates big misses, absolute loss treats all misses alike, cross-entropy hates confident wrong answers.",
      examples: [
        {
          at: 1,
          title: "One error, three costs",
          blocks: [
            { table: { head: ["Error $e$", "MSE cost $e^2$", "MAE cost $|e|$", "Huber cost ($\\delta = 1$)"], rows: [["0.5", "0.25", "0.5", "0.125"], ["2", "4", "2", "1.5"], ["10", "100", "10", "9.5"]] } },
            { p: "An error 20 times bigger (0.5 → 10) costs 400 times more under MSE but only 20 times more under MAE. Huber is squared for small errors and linear for big ones." },
          ],
        },
        {
          at: 6,
          title: "Loss plus penalty",
          blocks: [
            { p: "Fit error (MSE) = 4.0, weights $\\mathbf{w} = (3, -1)$, ridge penalty $\\lambda \\lVert\\mathbf{w}\\rVert^2$ with $\\lambda = 0.1$: total $= 4.0 + 0.1 \\times (9 + 1) = 5.0$. A model with MSE 4.2 but weights $(1, 0)$ scores $4.2 + 0.1 = 4.3$ and wins: slightly worse fit, much simpler." },
          ],
        },
      ],
    },
    "Regression losses": {
      examples: [
        {
          title: "Compute all three",
          blocks: [
            { p: "Actual $(10, 20, 30)$, predicted $(12, 18, 36)$: errors $(2, -2, 6)$." },
            { list: ["MSE $= (4 + 4 + 36)/3 = 14.67$.", "RMSE $= \\sqrt{14.67} = 3.83$, back in the original units.", "MAE $= (2 + 2 + 6)/3 = 3.33$.", "Huber ($\\delta = 1$): each error is above 1, so each costs $|e| - 0.5$: $(1.5 + 1.5 + 5.5)/3 = 2.83$."] },
          ],
        },
      ],
    },
    "Classification losses": {
      examples: [
        {
          title: "Binary cross-entropy for three emails",
          blocks: [
            { table: { head: ["Email", "True label", "Predicted $P(\\text{spam})$", "Cost"], rows: [["1", "spam (1)", "0.9", "$-\\ln 0.9 = 0.105$"], ["2", "not spam (0)", "0.2", "$-\\ln 0.8 = 0.223$"], ["3", "spam (1)", "0.3", "$-\\ln 0.3 = 1.204$"]] } },
            { p: "Average: $(0.105 + 0.223 + 1.204)/3 = 0.511$. Email 3 dominates because the model was fairly sure it was not spam." },
          ],
        },
      ],
    },
    "Choosing a loss": {
      examples: [
        {
          kind: "idea",
          title: "Match the loss to the cost of mistakes",
          blocks: [
            { list: ["Delivery-time predictions where a few GPS glitches report 10-hour trips: MAE or Huber, so the glitches do not drag the model.", "Pricing where one huge mistake is very expensive: MSE, which punishes big errors most.", "Medical risk scores that must be honest probabilities: cross-entropy."] },
          ],
        },
      ],
    },
    "1.2.4 Binary classification, likelihood, and gradients": {
      plain: "Logistic regression squeezes a linear score into a probability with the sigmoid. Its loss, cross-entropy, is the negative log of the probability the model gave to what actually happened.",
      replace: {
        0: { p: "Linear regression can predict numbers below zero or above one, which is awkward when the output is intended as a binary event probability. Logistic regression instead computes a linear score $z_i = b_0 + \\sum_j b_j x_{ij}$ and passes it through $\\sigma(z) = 1/(1 + e^{-z})$. The resulting $p_i$ is strictly between zero and one for finite $z$." },
        1: { p: "The odds of an event are $p/(1-p)$. For the sigmoid model, $\\log[p/(1-p)] = z$. Thus increasing a feature by one unit while holding others fixed adds its coefficient to the log odds and multiplies the odds by $e^{b_j}$. It does not add a constant amount to probability: the probability change depends on the starting score. If $b_j = \\log 2$, a one-unit increase doubles the fitted odds, but it can move a probability from 0.1 to about 0.182 or from 0.5 to about 0.667." },
        3: { p: "For a binary label $y_i$, the probability assigned to the observed outcome is $p_i$ if $y_i = 1$ and $1 - p_i$ if $y_i = 0$. This can be written $p_i^{y_i}(1-p_i)^{1-y_i}$. Assuming independent observations conditional on the model, multiply across training rows to form a likelihood. Taking a negative logarithm changes a product into a sum and yields the binary cross-entropy objective:" },
        7: {
          derive: {
            title: "Show the derivation: Derivative and an update",
            blocks: [
              { p: "The sigmoid derivative is $\\sigma(z)[1 - \\sigma(z)] = p(1-p)$. Combining it with the cross-entropy derivative gives a compact gradient for the weight vector when rows are stored in matrix $X$: $\\nabla = X^\\top(p - y)$, or $X^\\top(p - y)/n$ if using mean rather than summed loss. A gradient-descent update is $b_{\\text{new}} = b_{\\text{old}} - \\eta\\nabla$, where $\\eta$ is the learning rate." },
              { p: "For one observation with $x=2$, $y=1$, intercept held fixed at zero, and starting $\\beta=0$, the logit is $z=0$ and $p=0.5$. The mean-loss gradient for b is $x(p-y)=2(-0.5)=-1$. With $\\eta=0.1$, $\\beta_{\\mathrm{new}}=0-0.1(-1)=0.1$. The new score $z=0.2$ gives $p\\approx0.550$; this example moves toward the observed positive label. One update is not a trained model, and a step size that works for this toy case may fail on scaled, multi-feature data." },
              { p: "Mini-batch descent averages gradients over a subset of training rows, providing an update cheaper than full-batch training and less noisy than a single-row stochastic step. Feature scaling and learning-rate selection influence convergence. Stop based on a suitable optimization and validation procedure; do not look at final-test performance each epoch and then choose the best epoch from that test." },
            ],
          },
        },
        9: { p: "A logistic coefficient is an estimated log-odds change. Its estimated standard error reflects sampling uncertainty under the model and sampling assumptions. A commonly reported Wald statistic is $z_j = \\hat b_j/\\mathrm{SE}(\\hat b_j)$ for the null hypothesis that $b_j = 0$. Large absolute values can indicate evidence against that null under an appropriate approximation, but the calculation can become unreliable with small samples, rare events, correlated features, or nearly perfect separation. It does not show that changing the feature causes a different outcome." },
        10: { p: "For a binary indicator such as \"unit uses the newer compressor design,\" the exponentiated coefficient $e^{b_j}$ is an estimated odds ratio conditional on the other included variables. If $b_j = \\log 1.5$, the fitted odds are multiplied by 1.5 for otherwise equal feature vectors. A ratio of odds is not the same as a ratio of probabilities. At baseline probability 0.10, odds are 1/9; multiplying by 1.5 gives odds 1/6 and probability 1/7, about 0.143. At baseline probability 0.50, multiplying odds by 1.5 gives probability 0.60. The same coefficient produces different absolute probability differences." },
        11: { p: "A likelihood-ratio comparison considers a full model and a restricted model fitted to the same eligible observations: $\\mathrm{LR} = 2[\\log L_{\\text{full}} - \\log L_{\\text{restricted}}]$. Under regularity conditions, an appropriate reference distribution can be used to assess the added parameters. This is a model comparison under assumptions; it is not a check of future operational usefulness. Some reports give a pseudo $R^2$, such as McFadden's $1 - \\log L_{\\text{full}}/\\log L_{\\text{intercept only}}$. Because both log likelihoods are normally negative, the ratio needs careful interpretation; this statistic is not the proportion of outcome variance explained by the model and should not be interchanged with linear-regression $R^2$." },
      },
      examples: [
        {
          at: 1,
          title: "Score to probability to odds",
          blocks: [
            { table: { head: ["Score $z$", "Probability $\\sigma(z)$", "Odds $p/(1-p)$"], rows: [["−2", "0.119", "0.135"], ["0", "0.5", "1"], ["0.693 (= ln 2)", "0.667", "2"], ["2", "0.881", "7.39"]] } },
            { p: "Adding $\\ln 2$ to the score always doubles the odds, but the change in probability depends on where you start." },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Compute MSE, MAE and log loss with scikit-learn",
      code: r`import numpy as np
from sklearn.metrics import mean_squared_error, mean_absolute_error, log_loss

y_true = np.array([3.0, 5.0, 2.0, 7.0])
y_pred = np.array([4.0, 4.0, 4.0, 17.0])          # errors 1, -1, 2, 10
print("MSE:", mean_squared_error(y_true, y_pred))
print("MAE:", mean_absolute_error(y_true, y_pred))

# Two positive examples, predicted probabilities 0.9 and 0.1
print("log loss:", round(log_loss([1, 1], [0.9, 0.1], labels=[0, 1]), 3))

# Output:
# MSE: 26.5
# MAE: 3.5
# log loss: 1.204`,
      walk: [
        { line: "y_pred = np.array([4.0, 4.0, 4.0, 17.0])          # errors 1, -1, 2, 10", say: "The worked example: three small errors and one outlier." },
        { line: "print(\"MSE:\", mean_squared_error(y_true, y_pred))", say: "26.5: the outlier contributes 100 of the 106 total." },
        { line: "print(\"log loss:\", round(log_loss([1, 1], [0.9, 0.1], labels=[0, 1]), 3))", say: "Average of $-\\ln 0.9$ and $-\\ln 0.1$. `labels=[0, 1]` is needed because only one class appears in `y_true`; without it scikit-learn raises an error." },
      ],
    },
  },
};

/** Extra code: losses from scratch. */
const LOSS_SCRATCH = {
  goal: "Write MSE, MAE, Huber and cross-entropy from scratch",
  code: r`import numpy as np

def mse(e):
    return np.mean(e ** 2)

def mae(e):
    return np.mean(np.abs(e))

def huber(e, delta=1.0):
    small = np.abs(e) <= delta
    return np.mean(np.where(small, 0.5 * e ** 2, delta * (np.abs(e) - 0.5 * delta)))

def bce(y, p):
    p = np.clip(p, 1e-12, 1 - 1e-12)              # avoid log(0)
    return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))

e = np.array([1.0, -1.0, 2.0, 10.0])
print("MSE:", mse(e), "| MAE:", mae(e), "| Huber (delta=1):", huber(e))
print("cross-entropy, confident and right (p=0.99):", round(bce(np.array([1]), np.array([0.99])), 3))
print("cross-entropy, confident and wrong (p=0.01):", round(bce(np.array([1]), np.array([0.01])), 3))

# Output:
# MSE: 26.5 | MAE: 3.5 | Huber (delta=1): 3.0
# cross-entropy, confident and right (p=0.99): 0.01
# cross-entropy, confident and wrong (p=0.01): 4.605`,
  walk: [
    { line: "return np.mean(np.where(small, 0.5 * e ** 2, delta * (np.abs(e) - 0.5 * delta)))", say: "Huber: half-squared for errors within $\\delta$, linear beyond it. The two pieces meet smoothly at $|e| = \\delta$." },
    { line: "p = np.clip(p, 1e-12, 1 - 1e-12)              # avoid log(0)", say: "A probability of exactly 0 or 1 would give $\\log 0$; clipping keeps the loss finite." },
    { line: "return -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))", say: "Binary cross-entropy: for each row, $-\\log$ of the probability given to the true class." },
  ],
};
LOSS.sections!["Choosing a loss"].code = [LOSS_SCRATCH];

/** Easy layer: Gradient Descent. */
export const GD: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "The gradient lists one slope per parameter. Step against it, recompute, repeat. Steps shrink by themselves near the bottom because the slope shrinks.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Why scaling matters",
          blocks: [
            { p: "Feature 1 is income in rupees (around 500,000), feature 2 is age (around 40). The loss changes enormously for a tiny change in the income weight and slowly for the age weight. One learning rate cannot suit both: small enough for income means age barely moves. Standardising both features fixes this." },
          ],
        },
      ],
      code: [
        {
          goal: "Run gradient descent on a stretched two-parameter bowl",
          code: r`import numpy as np

def grad(w):
    return np.array([2 * w[0], 8 * w[1]])     # gradient of L = w1^2 + 4 w2^2

def loss(w):
    return w[0] ** 2 + 4 * w[1] ** 2

w = np.array([4.0, 1.0])
for step in range(1, 6):
    w = w - 0.1 * grad(w)
    print(f"step {step}: w = ({w[0]:.3f}, {w[1]:.4f}), loss = {loss(w):.4f}")

# Output:
# step 1: w = (3.200, 0.2000), loss = 10.4000
# step 2: w = (2.560, 0.0400), loss = 6.5600
# step 3: w = (2.048, 0.0080), loss = 4.1946
# step 4: w = (1.638, 0.0016), loss = 2.6844
# step 5: w = (1.311, 0.0003), loss = 1.7180`,
          walk: [
            { line: "return np.array([2 * w[0], 8 * w[1]])     # gradient of L = w1^2 + 4 w2^2", say: "One slope per parameter. The second is 4 times steeper." },
            { line: "w = w - 0.1 * grad(w)", say: "The same update for both parameters at once." },
          ],
        },
      ],
    },
    "The update rule": {
      examples: [
        {
          title: "One update with two parameters",
          blocks: [
            { p: "$\\boldsymbol\\theta = (1, 2)$, gradient $(4, -6)$, $\\eta = 0.1$: $\\boldsymbol\\theta \\leftarrow (1 - 0.4,\\; 2 + 0.6) = (0.6, 2.6)$. The first parameter goes down because its slope is positive; the second goes up because its slope is negative." },
          ],
        },
      ],
    },
    "Batch, stochastic and mini-batch": {
      examples: [
        {
          title: "Cost per epoch",
          blocks: [
            { p: "50,000 rows. Batch GD: 1 update per epoch, each using 50,000 rows. SGD: 50,000 updates, each using 1 row. Mini-batch of 64: about 782 updates, each using 64 rows. Every option touches all 50,000 rows once per epoch; they differ in how often they update." },
          ],
        },
      ],
    },
    "Convexity, local minima and saddle points": {
      examples: [
        {
          kind: "idea",
          title: "A saddle point",
          blocks: [
            { p: "$L(w_1, w_2) = w_1^2 - w_2^2$ at $(0, 0)$: the gradient is zero, but moving along $w_1$ goes uphill and moving along $w_2$ goes downhill, like the middle of a horse's saddle. Plain gradient descent started exactly there would stay stuck; a tiny bit of noise lets it slide off downhill." },
          ],
        },
      ],
    },
    "Better optimisers": {
      examples: [
        {
          kind: "idea",
          title: "Momentum as a rolling ball",
          blocks: [
            { p: "In a long narrow valley, plain gradient descent zig-zags between the walls. A heavy ball keeps its speed along the valley floor and the side-to-side pushes cancel out. With the same starting point, momentum reaches a loss of about $3 \\times 10^{-8}$ in 60 steps where plain descent reaches about $10^{-3}$ (see the code step)." },
          ],
        },
      ],
      code: [
        {
          goal: "Compare plain gradient descent, momentum and Adam from scratch",
          code: r`import numpy as np

def grad(w):
    return np.array([2 * w[0], 40 * w[1]])    # a long narrow valley: L = w1^2 + 20 w2^2

def loss(w):
    return w[0] ** 2 + 20 * w[1] ** 2

def run(method, steps=60):
    w = np.array([5.0, 1.0])
    v = np.zeros(2); m = np.zeros(2); s = np.zeros(2)
    for t in range(1, steps + 1):
        g = grad(w)
        if method == "plain":
            w = w - 0.04 * g                   # near the largest stable step (2/40 = 0.05)
        elif method == "momentum":
            v = 0.7 * v + g                    # velocity: decaying sum of past gradients
            w = w - 0.02 * v
        elif method == "adam":
            m = 0.9 * m + 0.1 * g              # running average of gradients
            s = 0.999 * s + 0.001 * g * g      # running average of squared gradients
            m_hat, s_hat = m / (1 - 0.9 ** t), s / (1 - 0.999 ** t)   # bias correction
            w = w - 0.3 * m_hat / (np.sqrt(s_hat) + 1e-8)            # per-weight scaled step
    return w

for method in ("plain", "momentum", "adam"):
    w = run(method)
    print(f"{method:<9} after 60 steps: w = ({w[0]:.5f}, {w[1]:.5f}), loss = {loss(w):.2e}")

# Output:
# plain     after 60 steps: w = (0.03359, 0.00000), loss = 1.13e-03
# momentum  after 60 steps: w = (0.00016, -0.00002), loss = 3.24e-08
# adam      after 60 steps: w = (0.20213, 0.01351), loss = 4.45e-02`,
          walk: [
            { line: "w = w - 0.04 * g                   # near the largest stable step (2/40 = 0.05)", say: "Plain descent: the steep direction (curvature 40) caps the step size, so progress along the gentle direction is slow." },
            { line: "v = 0.7 * v + g                    # velocity: decaying sum of past gradients", say: "Momentum keeps 70% of the previous velocity. Consistent directions build up speed; alternating ones cancel." },
            { line: "m_hat, s_hat = m / (1 - 0.9 ** t), s / (1 - 0.999 ** t)   # bias correction", say: "Adam's running averages start at 0, so early steps are corrected upwards." },
            { line: "w = w - 0.3 * m_hat / (np.sqrt(s_hat) + 1e-8)            # per-weight scaled step", say: "Each weight's step is divided by its typical gradient size. On this smooth toy problem Adam is not the fastest: adaptive optimisers shine on noisy, badly scaled problems, not everywhere." },
          ],
        },
      ],
    },
    "Gradient descent for linear regression": {
      examples: [
        {
          title: "One step on real numbers",
          blocks: [
            { p: "Points $(1, 3), (2, 5)$, start $w = 0$, $b = 0$: errors $\\hat y - y = (-3, -5)$. $\\partial L/\\partial w = \\frac{2}{2}[(-3)(1) + (-5)(2)] = -13$ and $\\partial L/\\partial b = \\frac{2}{2}(-3 - 5) = -8$. With $\\eta = 0.05$: $w = 0.65$, $b = 0.4$." },
          ],
        },
      ],
    },
    "1.13.2 Batch, stochastic, and mini-batch estimators": {
      plain: "A single row's gradient is a noisy guess of the full gradient, but on average it is right. That is why SGD works, and why it jitters.",
      examples: [
        {
          at: 1,
          title: "Noisy but unbiased",
          blocks: [
            { p: "Row gradients $(2, 4, -3, 1)$; full gradient $= 1$. Picking one row at random gives 2, 4, −3 or 1, each with probability 1/4: average $(2 + 4 - 3 + 1)/4 = 1$. Any single pick may even point the wrong way (−3), but on average the steps go the right way." },
          ],
        },
      ],
    },
    "1.15.8 Extensions and their limits": {
      plain: "Momentum, AdaGrad, RMSProp and Adam all reshape the basic step. None is guaranteed to give a better final model; compare them fairly on validation data.",
    },
  },
  code: {
    "In Python#0": {
      goal: "Gradient descent from scratch, then the same idea in scikit-learn",
      code: r`import numpy as np
from sklearn.linear_model import SGDRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline

# 1) From scratch on L(w) = (w - 3)^2, whose slope is 2(w - 3)
w, lr = 0.0, 0.1
for t in range(1, 21):
    w -= lr * 2 * (w - 3)                 # step against the slope
    if t in (1, 2, 3, 10, 20):
        print(f"step {t:>2}: w = {w:.4f}, loss = {(w - 3) ** 2:.4f}")

# 2) The same idea inside scikit-learn: SGD on a linear model
rng = np.random.default_rng(0)
X = rng.uniform(0, 10, (200, 1))
y = 3 * X[:, 0] + 5 + rng.normal(0, 1, 200)          # true slope 3, intercept 5
model = make_pipeline(StandardScaler(), SGDRegressor(max_iter=1000, random_state=0)).fit(X, y)
sgd = model.named_steps["sgdregressor"]
scaler = model.named_steps["standardscaler"]
slope = sgd.coef_[0] / scaler.scale_[0]                # undo the scaling to compare
print("sklearn SGD slope:", round(slope, 3), "| intercept:", round(sgd.intercept_[0] - slope * scaler.mean_[0], 3))

# Output:
# step  1: w = 0.6000, loss = 5.7600
# step  2: w = 1.0800, loss = 3.6864
# step  3: w = 1.4640, loss = 2.3593
# step 10: w = 2.6779, loss = 0.1038
# step 20: w = 2.9654, loss = 0.0012
# sklearn SGD slope: 2.972 | intercept: 5.045`,
      walk: [
        { line: "w -= lr * 2 * (w - 3)                 # step against the slope", say: "The whole algorithm for $L(w) = (w - 3)^2$: the slope is $2(w - 3)$." },
        { line: "model = make_pipeline(StandardScaler(), SGDRegressor(max_iter=1000, random_state=0)).fit(X, y)", say: "scikit-learn's SGDRegressor runs stochastic gradient descent on a linear model. Scaling first keeps the steps well behaved." },
        { line: "slope = sgd.coef_[0] / scaler.scale_[0]                # undo the scaling to compare", say: "The coefficient is per standard deviation; dividing by the scale converts it back to per unit of x: about 2.97 against the true 3." },
      ],
    },
  },
};

/** Easy layer: Batch, Stochastic & Mini-batch Gradient Descent. */
export const GDV: EasyTopic = {
  sections: {
    "Step 1: batch gradient descent": {
      examples: [
        {
          kind: "idea",
          title: "Asking everyone before every step",
          blocks: [
            { p: "Imagine surveying all 1,000 students before changing a single school rule. The decision is well informed, but it takes a whole day per change. That is batch gradient descent." },
          ],
        },
      ],
    },
    "Step 2: stochastic gradient descent (SGD)": {
      examples: [
        {
          title: "One row, one step",
          blocks: [
            { p: "Model $\\hat y = wx$, $w = 1$, row $(x, y) = (2, 5)$, squared error. Gradient $2(wx - y)x = 2(2 - 5)(2) = -12$. With $\\eta = 0.05$: $w \\leftarrow 1 + 0.6 = 1.6$. The next row might push $w$ somewhere slightly different, hence the jittery path." },
          ],
        },
      ],
    },
    "Step 4: why feature scaling changes the path": {
      examples: [
        {
          title: "Standardising two features",
          blocks: [
            { p: "Salary values (₹ lakh): 4, 6, 8 → mean 6, standard deviation 1.63 → scaled $-1.22, 0, 1.22$. Age: 25, 35, 45 → mean 35, standard deviation 8.16 → scaled $-1.22, 0, 1.22$. Both features now live on the same scale, so one learning rate suits both." },
          ],
        },
      ],
    },
    "Step 5: how big can a step be? The curvature limit": {
      examples: [
        {
          title: "Find the limit",
          blocks: [
            { p: "$f(w) = 5w^2$ has curvature $L = 10$, so the step must be below $2/10 = 0.2$. At $\\eta = 0.1$ ($= 1/L$) one step lands exactly on 0. At $\\eta = 0.25$ each step multiplies $w$ by $1 - 2.5 = -1.5$: it flips sign and grows." },
          ],
        },
      ],
    },
    "Step 6: check your gradient with finite differences": {
      examples: [
        {
          title: "Catching a bug",
          blocks: [
            { p: "Loss $L(w) = (3w - 6)^2$ at $w = 1$. Correct gradient: $2(3w - 6) \\cdot 3 = -18$. A buggy version that forgot the inner 3 gives $-6$. The numerical check $[L(1.000001) - L(0.999999)]/0.000002 \\approx -18.0$ exposes the bug at once." },
          ],
        },
      ],
    },
    "1.15.4 Compare full-batch, stochastic, and mini-batch gradients": {
      plain: "All three estimate the same gradient. Bigger batches give a steadier estimate but fewer updates per pass; smaller batches give more, noisier updates.",
      examples: [
        {
          at: 1,
          title: "Noise shrinks with batch size",
          blocks: [
            { p: "If one row's gradient has standard deviation 4, a batch of 16 averages it down to $4/\\sqrt{16} = 1$, and a batch of 64 to $4/\\sqrt{64} = 0.5$. Four times the batch halves the noise." },
          ],
        },
      ],
    },
    "1.15.5 Work one mini-batch by hand": {
      plain: "Open the derivation for a full hand calculation of one mini-batch update, step by step.",
    },
  },
  code: {
    "In Python#0": {
      goal: "Train the same linear model with batch, mini-batch and stochastic updates",
      walk: [
        { line: "X = np.c_[np.ones(n), (x - x.mean()) / x.std()]  # scaled feature (see \"scaling\" above)", say: "A column of 1s for the intercept, plus the standardised feature." },
        { line: "return 2 / len(yb) * Xb.T @ (Xb @ w - yb)   # gradient of mean squared error", say: "The MSE gradient on whichever rows are passed in: all of them, 32 of them, or 1." },
        { line: "idx = rng.permutation(n)                 # shuffle every epoch", say: "Shuffle so each epoch sees the rows in a new order." },
        { line: "b = idx[start:start + batch_size]", say: "Take the next slice of shuffled rows as one batch." },
        { line: "w, loss, updates = train(bs, lr=0.1 if bs > 1 else 0.01)", say: "SGD gets a smaller learning rate because single-row gradients are much noisier." },
        { line: "print(\"numerical gradient:\", num.round(5))", say: "The finite-difference check matches the analytic gradient to 5 decimals." },
      ],
    },
  },
};

/** Easy layer: Learning Rate. */
export const LR: EasyTopic = {
  sections: {
    "The idea": {
      examples: [
        {
          title: "Three learning rates, same start",
          blocks: [
            { p: "$L(w) = (w - 3)^2$, start at $w = 0$, 50 steps:" },
            { table: { head: ["$\\eta$", "Final $w$", "What happened"], rows: [["0.01", "1.91", "Too small: still far from 3"], ["0.1", "3.00", "Just right"], ["1.05", "about −350", "Too big: diverged"]] } },
          ],
        },
      ],
    },
    "Explained in depth": {
      plain: "The gradient says which way and how steep; the learning rate decides how far to go. Too small wastes time, too big jumps over the valley.",
      examples: [
        {
          at: 2,
          kind: "idea",
          title: "A learning-rate range test",
          blocks: [
            { table: { head: ["$\\eta$", "Loss after a few batches"], rows: [["$10^{-5}$", "2.30 (no change)"], ["$10^{-3}$", "1.90"], ["$10^{-2}$", "1.10 (falling fastest)"], ["$10^{-1}$", "3.80 (exploding)"]] } },
            { p: "Pick a value a little below where the loss falls fastest, here about $3 \\times 10^{-3}$ to $10^{-2}$." },
          ],
        },
        {
          at: 3,
          title: "Step decay",
          blocks: [
            { p: "Start at $\\eta_0 = 0.1$ and divide by 10 every 30 epochs: epochs 0–29 use 0.1, 30–59 use 0.01, 60–89 use 0.001." },
          ],
        },
      ],
    },
    "Exactly when it diverges (1-D case)": {
      examples: [
        {
          title: "Plug in each regime",
          blocks: [
            { p: "For $L(w) = (w - 3)^2$, $a = 1$, so the factor is $1 - 2\\eta$:" },
            { list: ["$\\eta = 0.25$: factor 0.5, the error halves each step.", "$\\eta = 0.75$: factor −0.5, the error halves and flips side each step.", "$\\eta = 1.5$: factor −2, the error doubles and flips: divergence."] },
          ],
        },
      ],
    },
    "Schedules and warm-up": {
      examples: [
        {
          title: "Cosine schedule values",
          blocks: [
            { p: "$\\eta_0 = 0.1$, $T = 100$ epochs: epoch 0 gives $0.1$; epoch 50 gives $0.05\\,(1 + \\cos(\\pi/2)) = 0.05$; epoch 100 gives $0.05\\,(1 + \\cos\\pi) = 0$. A smooth glide from full speed to a stop." },
          ],
        },
      ],
    },
    "1.15.3 Scaling changes the optimization geometry": {
      plain: "Features on very different scales make the loss a long, thin valley, and no single learning rate suits every direction. Scale features first, using training data only.",
    },
    "1.15.9 Curvature gives a measurable step-size boundary": {
      plain: "The largest safe learning rate is set by the steepest direction of the loss: $\\eta < 2/\\lambda_{\\max}$. You can compute $\\lambda_{\\max}$ for linear regression and check the rule.",
      examples: [
        {
          at: 1,
          title: "The rule with numbers",
          blocks: [
            { p: "Suppose $H = D^\\top D/n$ has eigenvalues 4 and 0.5. Safe steps satisfy $\\eta < 2/4 = 0.5$. At $\\eta = 0.4$ the two directions shrink by $|1 - 1.6| = 0.6$ and $|1 - 0.2| = 0.8$ per step. At $\\eta = 0.6$ the steep direction gets factor $|1 - 2.4| = 1.4$ and blows up, even though the gentle direction would be fine." },
          ],
        },
      ],
    },
  },
  code: {
    "1.15.9 Curvature gives a measurable step-size boundary#0": {
      goal: "Compute the curvature limit and show a stable and an unstable run",
      code: r`import numpy as np

rng = np.random.default_rng(62)
x_train = np.linspace(-2, 2, 30)
x_test = np.linspace(-1.9, 1.9, 12)
def target(x, noise):
    return 1 + 0.6*x - 0.3*x*x + noise
y_train = target(x_train, rng.normal(0, 0.12, len(x_train)))
y_test = target(x_test, rng.normal(0, 0.12, len(x_test)))

raw_train = np.column_stack((x_train, x_train*x_train))
raw_test = np.column_stack((x_test, x_test*x_test))
center, scale = raw_train.mean(axis=0), raw_train.std(axis=0)
assert np.all(scale > 0)
D = np.column_stack((np.ones(len(x_train)), (raw_train-center)/scale))
D_test = np.column_stack((np.ones(len(x_test)), (raw_test-center)/scale))
H = D.T @ D / len(D)
L = np.linalg.eigvalsh(H)[-1]
eta = 0.8/L
def loss(theta):
    return np.mean((D@theta-y_train)**2)/2
def fit_steps(rate, steps):
    theta = np.zeros(D.shape[1])
    history = [loss(theta)]
    for _ in range(steps):
        theta -= rate * (D.T@(D@theta-y_train))/len(D)
        history.append(loss(theta))
    return theta, np.array(history)

theta, stable = fit_steps(eta, 300)
least_squares = np.linalg.lstsq(D, y_train, rcond=None)[0]
assert np.all(np.diff(stable) <= 1e-12)
assert np.allclose(theta, least_squares, atol=1e-4)
_, unstable = fit_steps(2.1/L, 16)
assert unstable[-1] > unstable[0]
test_mse = np.mean((D_test@theta-y_test)**2)
assert np.isfinite(test_mse) and test_mse >= 0
print("largest Hessian eigenvalue L:", round(L, 3), "| step used 0.8/L:", round(eta, 3))
print("stable run final loss:", round(stable[-1], 5), "| unstable (2.1/L) loss after 16 steps:", round(unstable[-1], 2))
print("held-out MSE:", round(test_mse, 4))

# Output:
# largest Hessian eigenvalue L: 1.0 | step used 0.8/L: 0.8
# stable run final loss: 0.00533 | unstable (2.1/L) loss after 16 steps: 11.22
# held-out MSE: 0.01`,
      walk: [
        { line: "center, scale = raw_train.mean(axis=0), raw_train.std(axis=0)", say: "Scaling numbers learned from the training rows only." },
        { line: "H = D.T @ D / len(D)", say: "The Hessian of the half-MSE loss: it does not depend on the weights for linear regression." },
        { line: "L = np.linalg.eigvalsh(H)[-1]", say: "Its largest eigenvalue: the steepest curvature." },
        { line: "eta = 0.8/L", say: "A step comfortably below the limit $2/L$." },
        { line: "_, unstable = fit_steps(2.1/L, 16)", say: "Just above the limit: the loss grows instead of shrinking." },
      ],
    },
    "In Python#0": {
      goal: "Try four learning rates on the same problem",
      walk: [
        { line: "w -= lr * 2 * (w - 3)", say: "Gradient descent on $(w - 3)^2$." },
        { line: "for lr in [0.01, 0.1, 0.8, 1.05]:", say: "Too small, good, large but stable (zig-zags), and too large (diverges)." },
      ],
    },
  },
};

/** Easy layer: Reinforcement Learning. */
export const RL: EasyTopic = {
  sections: {
    "The idea": {
      plain: "An agent tries actions, sees rewards, and learns which actions pay off over time, including actions that cost something now but avoid a bigger cost later.",
      examples: [
        {
          kind: "idea",
          title: "Learning to play a game",
          blocks: [
            { p: "Nobody tells a chess program the right move. It plays, and finds out at the end whether it won (+1) or lost (−1). Reinforcement learning works out which earlier moves deserve the credit or blame." },
          ],
        },
      ],
    },
    "The Bellman equation, step by step": {
      examples: [
        {
          title: "Discounted return",
          blocks: [
            { p: "Rewards 0, 0, 10 over three steps with $\\gamma = 0.9$: return $= 0 + 0.9(0) + 0.81(10) = 8.1$. The same 10 arriving immediately would be worth 10. Discounting makes later rewards count a little less." },
          ],
        },
      ],
    },
    "Textbook case: Sequential Decisions and Bellman Equations": {
      plain: "A pump can be inspected now (a small cost) or left (risking a big failure later). The textbook solves this exactly.",
    },
    "3.17.1 Define a small Markov decision process": {
      plain: "An MDP lists the states, the actions, what happens after each action (with probabilities), and the reward for each outcome.",
    },
    "3.17.2 Derive policy evaluation and optimality": {
      plain: "The value of a state equals the reward now plus the discounted value of where you end up, averaged over what might happen. Open the derivation for the steps.",
    },
    "3.17.3 Solve the tiny case by iteration": {
      plain: "Start with all values at 0, apply the Bellman update to every state, and repeat until nothing changes.",
      examples: [
        {
          at: 0,
          title: "The first two sweeps by hand",
          blocks: [
            { table: { head: ["Sweep", "$V(H)$", "$V(W)$"], rows: [["0", "0", "0"], ["1", "max(wait 0, inspect −2) = 0", "max(wait −4, inspect −2) = −2"], ["2", "wait: 0.9(0.9·0) + 0.1(0.9·−2) = −0.18", "inspect: −2 + 0.9(0) = −2"]] } },
            { p: "The values settle at $V(H) = -1.651$ and $V(W) = -3.486$: wait while healthy, inspect at warning." },
          ],
        },
      ],
    },
    "3.17.4 Separate exploration, estimation, and evaluation": {
      plain: "Learning from past decisions is tricky: if experts only inspected risky pumps, the data mix the effect of inspecting with the risk itself.",
    },
    "Textbook case: Sequential Decisions, Forecasting, and Deployment": {
      plain: "Releasing water today changes tomorrow's reservoir, so each decision affects the next. This case covers values, Q-learning, policy gradients and forecasting.",
    },
    "3.14.1 States, actions, rewards, and policies": {
      plain: "A state describes the situation, an action is a choice, a reward scores the result, and a policy says which action to take in each state.",
      replace: {
        0: { p: "A Markov decision process specifies states $s$, actions $a$, transition probabilities $P(s' \\mid s, a)$ and reward $r(s, a, s')$. A policy $\\pi(a \\mid s)$ gives a distribution over actions in each state. The goal is often to maximize expected discounted return $G_t = r_t + \\gamma r_{t+1} + \\gamma^2 r_{t+2} + \\dots$, with discount factor $\\gamma \\in [0, 1)$ for the infinite-horizon form. Discounting can encode a preference for earlier rewards and keeps some infinite sums finite; it does not remove the need to include long-term safety costs." },
      },
    },
    "3.14.2 Bellman equations and value iteration": {
      plain: "Compare actions by \"reward now + γ × value of the next state\". An action with a big reward now can still lose if it leads somewhere bad.",
      replace: {
        0: { p: "The state-value function under policy $\\pi$ is $V^\\pi(s) = \\mathbb{E}_\\pi[G_t \\mid s_t = s]$. The action-value function is $Q^\\pi(s, a) = \\mathbb{E}_\\pi[G_t \\mid s_t = s, a_t = a]$. Because return separates into immediate reward and later return, the Bellman expectation equation is" },
        1: { math: r`V^\pi(s) = \sum_a \pi(a \mid s) \sum_{s'} P(s' \mid s, a)\big[r(s, a, s') + \gamma V^\pi(s')\big]` },
        2: { p: "An optimal value function obeys $V^*(s) = \\max_a \\sum_{s'} P(s' \\mid s, a)[r(s, a, s') + \\gamma V^*(s')]$, under the usual stationary assumptions. This equation is a fixed-point relation: the best present action accounts for the value of the future state it leads to." },
        5: { p: "With $\\gamma = 0.9$, one deterministic option providing reward 1 now followed by a state valued at 10 has total one-step value $1 + 0.9(10) = 10$. Another providing reward 4 now followed by a state valued at 2 has total $4 + 0.9(2) = 5.8$. The apparently attractive immediate reward loses once future value is included. These illustrative values are assumed, not estimated from actual water records." },
        6: { p: "**Exercise:** Recalculate the one-step comparison above at $\\gamma = 0.1$. The first value becomes 2 and the second 4.2, so the preferred action changes. Explain why choosing $\\gamma$ is part of the problem definition, not a tuning detail." },
      },
    },
    "3.14.3 Temporal-difference and Q-learning updates": {
      plain: "Q-learning does not need the transition probabilities. After each experience it nudges its estimate towards \"reward + γ × best next estimate\".",
      replace: {
        1: { math: r`Q_{\text{new}}(s, a) = Q_{\text{old}}(s, a) + \alpha\Big[r + \gamma \max_{a'} Q_{\text{old}}(s', a') - Q_{\text{old}}(s, a)\Big]` },
        3: { p: "Suppose $Q_{\\text{old}}(s, a) = 5$, reward $r = 2$, $\\gamma = 0.9$, and the largest next-state $Q$ is 6. Then the target is $2 + 0.9 \\times 6 = 7.4$ and the error is $7.4 - 5 = 2.4$. With $\\alpha = 0.25$, $Q_{\\text{new}} = 5 + 0.25 \\times 2.4 = 5.6$. One update is an incremental correction, not proof that the action is safe. A function approximator such as a neural network can represent Q values for large state spaces, but correlation among sequential observations and moving bootstrapped targets make training harder than fitting an ordinary static label." },
        5: { p: "**Exercise:** Recalculate $Q_{\\text{new}}$ if $\\alpha$ changes to 0.5 in the example: $5 + 0.5 \\times 2.4 = 6.2$. Why can a larger $\\alpha$ adapt faster but also make value estimates unstable when rewards are noisy?" },
      },
      code: [
        {
          goal: "Learn the inspect-or-wait policy with Q-learning, without knowing the probabilities",
          code: r`import numpy as np

rng = np.random.default_rng(0)
H, W, F = 0, 1, 2
WAIT, INSPECT = 0, 1

def step(state, action):
    # The environment: the agent never sees these probabilities, only the outcomes.
    if action == INSPECT:
        return H, -2.0
    if state == H:
        return (W if rng.random() < 0.1 else H), 0.0
    return (F, -20.0) if rng.random() < 0.2 else (W, 0.0)

Q = np.zeros((3, 2))
alpha, gamma, epsilon = 0.05, 0.9, 0.2
for episode in range(3000):
    s = H
    for _ in range(50):
        a = rng.integers(2) if rng.random() < epsilon else int(np.argmax(Q[s]))   # explore or exploit
        s2, r = step(s, a)
        target = r if s2 == F else r + gamma * Q[s2].max()                      # TD target
        Q[s, a] += alpha * (target - Q[s, a])                                    # move part-way
        if s2 == F:
            break
        s = s2

for s, name in ((H, "healthy"), (W, "warning")):
    print(f"{name:<8} Q(wait) = {Q[s, WAIT]:7.3f}   Q(inspect) = {Q[s, INSPECT]:7.3f}   -> {'wait' if Q[s, WAIT] > Q[s, INSPECT] else 'inspect'}")
print("value iteration gave: healthy -> wait (-1.651), warning -> inspect (-3.486)")

# Output:
# healthy  Q(wait) =  -1.688   Q(inspect) =  -3.514   -> wait
# warning  Q(wait) =  -6.443   Q(inspect) =  -3.541   -> inspect
# value iteration gave: healthy -> wait (-1.651), warning -> inspect (-3.486)`,
          walk: [
            { line: "def step(state, action):", say: "The environment. The agent only sees the next state and reward it returns, never the 10% and 20% inside." },
            { line: "a = rng.integers(2) if rng.random() < epsilon else int(np.argmax(Q[s]))   # explore or exploit", say: "ε-greedy: 20% of the time try a random action, otherwise take the best-looking one." },
            { line: "target = r if s2 == F else r + gamma * Q[s2].max()                      # TD target", say: "Reward plus the discounted best estimate from the next state; a failure ends the episode, so it has no future." },
            { line: "Q[s, a] += alpha * (target - Q[s, a])                                    # move part-way", say: "Move the estimate 5% of the way towards the target." },
            { line: "print(\"value iteration gave: healthy -> wait (-1.651), warning -> inspect (-3.486)\")", say: "From experience alone, Q-learning finds the same policy and values close to the exact ones." },
          ],
        },
      ],
    },
    "3.14.4 Policy gradients and preference-based feedback": {
      plain: "Instead of learning values, a policy-gradient method directly makes rewarding actions more likely. Preference feedback replaces a hand-written reward with \"which of these two outcomes is better?\".",
      replace: {
        0: { p: "Some policies are parameterized directly as $\\pi_\\theta(a \\mid s)$. A policy-gradient method changes $\\theta$ to increase expected return. One form of the score-function identity yields a gradient proportional to $\\mathbb{E}[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t \\mid s_t)\\, G_t]$. A baseline that does not depend on the selected action in the relevant expectation can reduce variance without changing the expected gradient; replacing $G_t$ with an advantage estimate compares an action with a state-dependent reference. The estimator's variance, sampling policy, and delayed rewards matter as much as the algebra." },
        1: { p: "For a two-action softmax policy with logits $[0, \\log 3]$, action probabilities are $[0.25, 0.75]$. If the less likely action later yields a high return, a sampled gradient step can increase its log probability. That does not mean the action should always be selected: one rollout is noisy, and safety constraints can forbid it regardless of reward. Evaluate across episodes and seeds, with a design that measures both return and constraint violations." },
      },
    },
    "3.14.5 Forecasts, backtests, and operational drift": {
      plain: "Forecasting tomorrow's inflow is a different job from deciding today's release. Test forecasts by rolling the cutoff forward through time.",
    },
    "Textbook case: Sequential Decisions and Learning from Feedback": {
      plain: "A battery that can be saved or used each evening, used to practise MDP design, exact solutions and learning from transitions.",
    },
    "3.15.1 Model the decision process before optimizing it": {
      plain: "Write down states, actions, rewards, the horizon and what is known when each decision is made. A wrong state description cannot be fixed by a clever algorithm.",
    },
    "3.15.2 Bellman equations, terminal states, and an exact small solution": {
      plain: "A terminal state has value 0 once its final reward is counted. Small problems can be solved exactly and used to test larger solvers.",
      examples: [
        {
          at: 8,
          title: "The third sweep",
          blocks: [
            { p: "From $V_2(\\text{low}) = 0.5$, $V_2(\\text{high}) = 5$: low → charge gives $-2 + 0.5(5) = 0.5$, stop gives 0, so $V_3(\\text{low}) = 0.5$; high → use gives $5 + 0.5(0.5) = 5.25$, so $V_3(\\text{high}) = 5.25$. The values keep climbing towards $2/3$ and $16/3$." },
          ],
        },
      ],
    },
    "3.15.3 Learning from transitions: Monte Carlo, temporal difference, and control": {
      plain: "Monte Carlo waits for the end of an episode and averages real returns. Temporal-difference learning updates after every step using its own estimate of the future.",
    },
    "3.15.4 Policy gradients, variance, and evaluating a new policy offline": {
      plain: "To judge a new policy from old logs, reweight each logged action by how much more (or less) often the new policy would choose it.",
    },
    "Textbook case: Function Approximation and Human Feedback in Sequential Learning": {
      plain: "When there are too many states for a table, a model estimates the values instead. The same ideas extend to learning rewards from human preferences.",
    },
    "3.16.1 Approximate value functions when a table cannot fit": {
      plain: "A neural network can estimate Q-values for states it has never seen by sharing what it learned across similar states.",
    },
    "3.16.2 Off-policy sampling, importance ratios, and double estimation": {
      plain: "Taking the maximum of noisy estimates tends to overestimate. Double estimation uses one network to pick the action and another to score it.",
    },
    "3.16.3 From pairwise preferences to a reward proxy": {
      plain: "Raters say which of two answers is better; a reward model learns scores that agree with those choices. The score difference becomes a probability through the sigmoid.",
    },
    "3.16.4 A constrained policy objective and its interpretation": {
      plain: "When tuning a policy with a learned reward, a KL penalty keeps it from drifting too far from a trusted reference policy.",
    },
  },
  code: {
    "3.17.3 Solve the tiny case by iteration#0": {
      goal: "Value iteration on the inspect-or-wait problem",
      code: r`import numpy as np

discount=.9
# states: 0 healthy, 1 warning, 2 failed (terminal)
transitions={
    (0,0):[(.9,0,0.),(.1,1,0.)],   # wait
    (0,1):[(1.,0,-2.)],            # inspect
    (1,0):[(.8,1,0.),(.2,2,-20.)], # wait
    (1,1):[(1.,0,-2.)],            # inspect
}
def qvalue(state,action,value):
    return sum(prob*(reward+discount*value[next_state])
               for prob,next_state,reward in transitions[(state,action)])
value=np.zeros(3)
for iteration in range(10000):
    new=value.copy()
    for state in (0,1):
        new[state]=max(qvalue(state,a,value) for a in (0,1))
    if np.max(np.abs(new-value))<1e-12:
        value=new
        break
    value=new
policy=[int(np.argmax([qvalue(s,a,value) for a in (0,1)]))
        for s in (0,1)]
assert iteration<10000
assert np.isclose(value[2],0)
assert policy==[0,1]
assert np.allclose([qvalue(s,policy[s],value) for s in (0,1)],
                   value[:2],atol=1e-10)
print("values:", value.round(3), "| policy (0 = wait, 1 = inspect):", policy)

# Output:
# values: [-1.651 -3.486  0.   ] | policy (0 = wait, 1 = inspect): [0, 1]`,
      walk: [
        { line: "(1,0):[(.8,1,0.),(.2,2,-20.)], # wait", say: "Each entry lists (probability, next state, reward). Waiting at warning: 80% stay, 20% fail with cost 20." },
        { line: "return sum(prob*(reward+discount*value[next_state])", say: "Q-value: average over outcomes of reward plus discounted value of the next state." },
        { line: "new[state]=max(qvalue(state,a,value) for a in (0,1))", say: "Bellman optimality update: keep the better action's value." },
        { line: "if np.max(np.abs(new-value))<1e-12:", say: "Stop when no value changes any more." },
        { line: "policy=[int(np.argmax([qvalue(s,a,value) for a in (0,1)]))", say: "Read off the best action in each state: wait (0) when healthy, inspect (1) at warning." },
      ],
    },
    "3.15.2 Bellman equations, terminal states, and an exact small solution#0": {
      goal: "Synchronous value iteration with a terminal state",
      walk: [
        { line: "new = {s: max(sum(p * (r + gamma * value[next_s])", say: "Every state is updated from the previous sweep's values (synchronous)." },
        { line: "new[\"done\"] = 0.0", say: "The terminal state's value stays 0." },
      ],
    },
    "3.15.3 Learning from transitions: Monte Carlo, temporal difference, and control#0": {
      goal: "One Q-learning update, including a terminal transition",
      code: r`def q_step(q, state, action, reward, next_state, terminal,
           next_actions, alpha=0.25, gamma=0.5):
    old = q.get((state, action), 0.0)
    future = 0.0 if terminal else max(q.get((next_state, a), 0.0)
                                       for a in next_actions)
    target = reward + gamma * future
    q[(state, action)] = old + alpha * (target - old)
    return target

q = {("low", "charge"): 1.0, ("high", "use"): 4.0,
     ("high", "stop"): 1.0}
assert q_step(q, "low", "charge", -2, "high", False,
              ["use", "stop"]) == 0.0
assert q[("low", "charge")] == 0.75
assert q_step(q, "high", "stop", 1, "done", True, []) == 1.0
assert q[("high", "stop")] == 1.0
print("Q after both updates:", q)

# Output:
# Q after both updates: {('low', 'charge'): 0.75, ('high', 'use'): 4.0, ('high', 'stop'): 1.0}`,
      walk: [
        { line: "future = 0.0 if terminal else max(q.get((next_state, a), 0.0)", say: "No future after a terminal transition; otherwise the best next action's value." },
        { line: "q[(state, action)] = old + alpha * (target - old)", say: "Move 25% of the way from the old estimate to the target: $1 + 0.25(0 - 1) = 0.75$." },
      ],
    },
    "3.15.4 Policy gradients, variance, and evaluating a new policy offline#0": {
      goal: "Estimate a new policy's reward from logged decisions",
      code: r`rows = [
    {"action": "use", "reward": 4.0, "behavior_prob": 0.5},
    {"action": "save", "reward": 2.0, "behavior_prob": 0.5},
]
target_prob = {"use": 0.8, "save": 0.2}
weights = [target_prob[row["action"]] / row["behavior_prob"]
           for row in rows]
ips = sum(w * row["reward"] for w, row in zip(weights, rows)) / len(rows)
snips = sum(w * row["reward"] for w, row in zip(weights, rows)) / sum(weights)
assert weights == [1.6, 0.4]
assert abs(ips - 3.6) < 1e-12 and abs(snips - 3.6) < 1e-12
print("weights:", weights, "| IPS estimate:", round(ips, 3), "| self-normalised:", round(snips, 3))

# Output:
# weights: [1.6, 0.4] | IPS estimate: 3.6 | self-normalised: 3.6`,
      walk: [
        { line: "weights = [target_prob[row[\"action\"]] / row[\"behavior_prob\"]", say: "Importance weight: new policy's probability over the logging policy's probability (0.8/0.5 = 1.6 and 0.2/0.5 = 0.4)." },
        { line: "ips = sum(w * row[\"reward\"] for w, row in zip(weights, rows)) / len(rows)", say: "Inverse propensity score: average of weight × reward." },
        { line: "snips = sum(w * row[\"reward\"] for w, row in zip(weights, rows)) / sum(weights)", say: "Self-normalised version: divide by the total weight instead, which is steadier when weights vary a lot." },
      ],
    },
    "3.16.1 Approximate value functions when a table cannot fit#0": {
      goal: "Compute a temporal-difference target safely",
      code: r`def td_target(reward, next_values, gamma, terminal, feasible_indices):
    if terminal:
        return reward
    if not feasible_indices:
        raise ValueError('a nonterminal state must have a feasible action')
    return reward + gamma * max(next_values[i] for i in feasible_indices)

assert td_target(-2, [5.0, 8.0], 0.9, False, [0]) == 2.5
assert td_target(-2, [5.0, 8.0], 0.9, True, []) == -2
print("nonterminal target:", td_target(-2, [5.0, 8.0], 0.9, False, [0]), "| terminal target:", td_target(-2, [5.0, 8.0], 0.9, True, []))

# Output:
# nonterminal target: 2.5 | terminal target: -2`,
      walk: [
        { line: "if terminal:", say: "A terminal transition's target is just its reward." },
        { line: "return reward + gamma * max(next_values[i] for i in feasible_indices)", say: "Only actions that are actually allowed in the next state may count in the maximum." },
      ],
    },
    "In Python#0": {
      goal: "Value iteration on the textbook's maintenance problem, sweep by sweep",
      walk: [
        { line: "(W, WAIT):    [(0.8, W, 0.0), (0.2, F, -20.0)],", say: "Waiting at warning: 80% stay at warning, 20% fail with reward −20." },
        { line: "return sum(p * (r + discount * V[s2]) for p, s2, r in transitions[(state, action)])", say: "Q-value of an action: expected reward now plus discounted value later." },
        { line: "new[s] = max(q(s, WAIT, V), q(s, INSPECT, V))", say: "Each state takes the value of its best action." },
        { line: "print(f\"{label:<8} V*={V[s]:.3f}  Q={qs}  best action: {max(qs, key=qs.get)}\")", say: "Final values and the best action in each state." },
      ],
    },
  },
};
