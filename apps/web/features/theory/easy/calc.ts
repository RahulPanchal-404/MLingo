import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Derivatives & the Chain Rule. Numbers checked in Python. */
export const DERIVATIVES: EasyTopic = {
  sections: {
    "Why you need this": {
      plain: "A derivative answers one question: if I turn this knob a little, does the error go up or down, and how fast? Training a model is just turning every knob in the direction that lowers the error.",
    },
    "Explained in depth": {
      plain: "Below: what a derivative is, the rules for computing one, the chain rule, what the second derivative tells you, and why a small step against the slope lowers the loss. Each idea has a small example with numbers.",
      examples: [
        {
          at: 1,
          title: "Watch the slope settle down",
          blocks: [
            { p: "Take $f(x) = x^2$ at $x = 3$ and shrink the gap $h$:" },
            { table: { head: ["$h$", "$\\dfrac{f(3+h) - f(3)}{h}$"], rows: [["1", "(16 − 9)/1 = 7"], ["0.1", "(9.61 − 9)/0.1 = 6.1"], ["0.01", "(9.0601 − 9)/0.01 = 6.01"]] } },
            { p: "The values close in on **6**, which is exactly what the rule gives: $f'(x) = 2x = 6$." },
          ],
        },
        {
          at: 3,
          title: "Use the table",
          blocks: [
            { list: ["Sigmoid at 0: $\\sigma(0) = 0.5$, so $\\sigma'(0) = 0.5 \\times 0.5 = 0.25$. This is the largest slope the sigmoid ever has.", "$\\ln x$ at $x = 2$: slope $1/2 = 0.5$.", "ReLU at $x = -3$: slope 0, so a weight feeding a negative ReLU input gets no gradient at all."] },
          ],
        },
        {
          at: 4,
          title: "Product rule and chain rule with numbers",
          blocks: [
            {
              steps: [
                { title: "Product rule", body: "f = x² and g = eˣ. At x = 1 this is 3e ≈ 8.155.", math: r`\frac{d}{dx}\left(x^2 e^x\right) = 2x\,e^x + x^2 e^x` },
                { title: "Chain rule", body: "Outer function u², inner function u = 3x + 1. At x = 1: 2 × 4 × 3 = 24.", math: r`\frac{d}{dx}(3x + 1)^2 = 2(3x + 1) \cdot 3` },
              ],
            },
          ],
        },
        {
          at: 5,
          title: "Find the minimum of a bowl",
          blocks: [
            { p: "$f(x) = x^2 - 4x + 5$. Slope $f'(x) = 2x - 4$ is zero at $x = 2$. The second derivative $f''(x) = 2$ is positive, so the curve is a bowl and $x = 2$ is the lowest point: $f(2) = 1$." },
          ],
        },
        {
          at: 6,
          title: "One gradient step, checked",
          blocks: [
            { p: "$f(x) = x^2$ at $x = 3$, slope 6, learning rate $\\eta = 0.1$." },
            { list: ["Step: $x \\to 3 - 0.1 \\times 6 = 2.4$.", "Predicted change: $-\\eta f'(x)^2 = -0.1 \\times 36 = -3.6$.", "Actual change: $f(2.4) - f(3) = 5.76 - 9 = -3.24$. Close to the prediction, and negative: the loss went down."] },
          ],
        },
      ],
    },
    "What a derivative is": {
      examples: [
        {
          kind: "idea",
          title: "Which way should the weight move?",
          blocks: [
            { p: "Loss $L(w) = (w - 3)^2$. At $w = 1$ the slope is $2(1 - 3) = -4$: negative, so increasing $w$ lowers the loss. At $w = 5$ the slope is $+4$: decrease $w$. At $w = 3$ the slope is 0: we are at the bottom." },
          ],
        },
      ],
    },
    "The rules you will actually use": {
      examples: [
        {
          title: "Differentiate term by term",
          blocks: [
            { math: r`\frac{d}{dx}\left(4x^3 - 2x + 7\right) = 12x^2 - 2, \qquad \frac{d}{dx}\left(5\ln x\right) = \frac{5}{x}, \qquad \frac{d}{dx}\left(3e^x\right) = 3e^x` },
            { p: "The power rule turns $4x^3$ into $4 \\cdot 3x^2$, the constant 7 disappears, and constants in front just come along." },
          ],
        },
      ],
    },
    "The chain rule": {
      examples: [
        {
          title: "A two-link chain",
          blocks: [
            { p: "$y = u^3$ with $u = 2x + 1$. At $x = 1$: $u = 3$." },
            { math: r`\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx} = 3u^2 \cdot 2 = 3(9)(2) = 54` },
            { p: "Check by nudging: $x = 1.001$ gives $u = 3.002$ and $y = 27.054$, a change of 0.054 for a change of 0.001 in $x$, so the slope is about 54." },
          ],
        },
        {
          kind: "idea",
          title: "Chains of effects in everyday life",
          blocks: [
            { p: "One extra hour of study adds 4 marks, and each extra mark adds ₹100 of scholarship. So one extra hour adds 4 × 100 = ₹400. The chain rule is just this multiplication, and a neural network is a long chain of such links." },
          ],
        },
      ],
    },
    "1.13.1 Derivatives, the chain rule, and the direction of an update": {
      plain: "Near any point, a smooth loss looks like a straight line. Stepping a little against the slope therefore lowers it. Step too far and the straight-line picture breaks, and the loss can go up.",
      examples: [
        {
          at: 3,
          title: "Check the gradient numerically",
          blocks: [
            { p: "Same row: $x = 2$, $y = 5$, $b = 0$, half-squared error, analytic slope $\\partial L/\\partial w = -6$ at $w = 1$. Nudge $w$ by $\\epsilon = 0.001$ both ways:" },
            { math: r`\frac{L(1.001) - L(0.999)}{0.002} = \frac{4.494002 - 4.506002}{0.002} = -6.000` },
            { p: "The numeric estimate matches the formula, so the derivative is right." },
          ],
        },
      ],
    },
    "1.20.4 Gradient methods from derivatives": {
      plain: "Gradient descent repeats one move: compute the slope, take a small step downhill, recompute. Here we do it by hand on a two-point dataset and watch the weight walk towards the answer.",
      replace: {
        0: { p: "An optimizer chooses parameters to reduce a specified loss. Consider a linear forecast $\\hat y = wx$ for a tiny dataset $(x, y) = (1, 2), (2, 4)$, with mean squared error" },
        1: { math: r`L(w) = \frac{(2 - w)^2 + (4 - 2w)^2}{2}, \qquad \frac{dL}{dw} = -\big[(2 - w)(1) + (4 - 2w)(2)\big] = -10 + 5w` },
        2: { p: "The derivative vanishes at $w = 2$, which gives zero training error for this constructed dataset. Starting at $w = 0$ with learning rate $\\eta = 0.1$, one gradient step gives $w_{\\text{new}} = 0 - 0.1 \\times (-10) = 1$. The new loss is $[(2-1)^2 + (4-2)^2]/2 = 2.5$, down from $[2^2 + 4^2]/2 = 10$. A second step at $w = 1$ sees derivative $-5$, giving $w = 1.5$. The steps approach the minimum without jumping directly there." },
        6: { p: "For a squared-error linear model with design matrix $X$, the mean loss $L(\\theta) = \\frac{1}{n}\\lVert X\\theta - y\\rVert^2$ has gradient $\\frac{2}{n}X^\\top(X\\theta - y)$. Some conventions use $\\frac{1}{2n}$ in the loss, removing the factor 2 from the gradient. State the objective before comparing formulas, because both conventions can be correct. An L2 penalty adds a derivative proportional to the penalized coefficient vector; an L1 penalty has a corner at zero and needs a subgradient or a suitable optimization method." },
        7: { p: "**Exercise:** In the two-row example, compute the next update from $w = 1.5$ at $\\eta = 0.1$. The derivative is $-10 + 5(1.5) = -2.5$, so $w_{\\text{new}} = 1.75$. Explain why reaching exactly $w = 2$ is not required to obtain a useful model on noisy real data." },
      },
      examples: [
        {
          at: 2,
          title: "Five steps in a table",
          blocks: [
            { table: { head: ["Step", "$w$", "$dL/dw$", "Loss"], rows: [["0", "0", "−10", "10"], ["1", "1", "−5", "2.5"], ["2", "1.5", "−2.5", "0.625"], ["3", "1.75", "−1.25", "0.156"], ["4", "1.875", "−0.625", "0.039"]] } },
            { p: "Each step halves the distance to $w = 2$ (the update simplifies to $w_{\\text{new}} = 0.5w + 1$), and the loss drops by a factor of 4 each time. The slope shrinks as we approach the bottom, so the steps shrink automatically." },
          ],
        },
      ],
      code: [
        {
          goal: "Run gradient descent on the two-point example and print every step",
          code: r`# Data (x, y) = (1, 2) and (2, 4); model y_hat = w * x.
# Loss from the text: L(w) = [(2 - w)^2 + (4 - 2w)^2] / 2
def L(w):
    return ((2 - w) ** 2 + (4 - 2 * w) ** 2) / 2

def dL(w):
    return -10 + 5 * w                # derivative worked out by hand

w, eta = 0.0, 0.1
print("step   w        dL/dw    loss")
for step in range(6):
    print(f"{step:>4}   {w:<7.4f}  {dL(w):<7.3f}  {L(w):.5f}")
    w = w - eta * dL(w)               # gradient descent update

# Output:
# step   w        dL/dw    loss
#    0   0.0000   -10.000  10.00000
#    1   1.0000   -5.000   2.50000
#    2   1.5000   -2.500   0.62500
#    3   1.7500   -1.250   0.15625
#    4   1.8750   -0.625   0.03906
#    5   1.9375   -0.312   0.00977`,
          walk: [
            { line: "return ((2 - w) ** 2 + (4 - 2 * w) ** 2) / 2", say: "The loss: average squared error of the two points, halved as in the text." },
            { line: "return -10 + 5 * w", say: "The derivative we worked out by hand. Writing it as its own function lets us check it separately." },
            { line: "w, eta = 0.0, 0.1", say: "Start at $w = 0$ with learning rate 0.1." },
            { line: "w = w - eta * dL(w)", say: "The whole algorithm in one line: move against the slope, scaled by the learning rate." },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Code a derivative and check it against a numerical estimate",
      code: r`def loss(w, x=2.0, y=7.0):
    return (w * x - y) ** 2           # squared error of the model y_hat = w * x

def dloss_dw(w, x=2.0, y=7.0):
    return 2 * (w * x - y) * x        # chain rule: 2u * du/dw, with u = w*x - y

w = 2.0
h = 1e-5
numeric = (loss(w + h) - loss(w - h)) / (2 * h)   # central finite difference
print("formula:", dloss_dw(w))
print("numeric:", round(numeric, 6))
print("slope is negative, so increase w. One step with learning rate 0.05:")
w_new = w - 0.05 * dloss_dw(w)
print("w:", w, "->", w_new, "| loss:", loss(w), "->", round(loss(w_new), 4))

# Output:
# formula: -12.0
# numeric: -12.0
# slope is negative, so increase w. One step with learning rate 0.05:
# w: 2.0 -> 2.6 | loss: 9.0 -> 3.24`,
      walk: [
        { line: "return (w * x - y) ** 2", say: "The loss for one point (x, y) = (2, 7) and the model $\\hat y = wx$." },
        { line: "return 2 * (w * x - y) * x", say: "The derivative from the chain rule: $2u \\cdot x$ with $u = wx - y$." },
        { line: "numeric = (loss(w + h) - loss(w - h)) / (2 * h)", say: "Nudge $w$ a tiny bit up and down and measure the change. If this disagrees with the formula, the formula has a bug." },
        { line: "w_new = w - 0.05 * dloss_dw(w)", say: "Use the slope: one small step downhill. The loss falls from 9 to 3.24." },
      ],
    },
  },
};

/** Easy layer: Partial Derivatives & Gradients. */
export const PARTIALS: EasyTopic = {
  sections: {
    "Why you need this": {
      plain: "With many weights, you ask the same question for each weight separately: \"if only this one changes, what happens to the loss?\" The list of answers is the gradient.",
    },
    "Explained in depth": {
      plain: "Partial derivatives, then the gradient (the list of them), then which way the gradient points, then the chain rule with several paths, and finally how to check a gradient numerically.",
      examples: [
        {
          at: 0,
          title: "Freeze one knob, turn the other",
          blocks: [
            { p: "$L(w, b) = (2w + b - 5)^2$ at $w = 1$, $b = 0$, so the inside is $2 + 0 - 5 = -3$." },
            { list: ["Hold $b$ fixed: $\\partial L/\\partial w = 2(2w + b - 5) \\cdot 2 = 2(-3)(2) = -12$.", "Hold $w$ fixed: $\\partial L/\\partial b = 2(2w + b - 5) \\cdot 1 = -6$.", "The loss is twice as sensitive to $w$ as to $b$, because $w$ is multiplied by 2."] },
          ],
        },
        {
          at: 1,
          title: "The gradient is the list",
          blocks: [
            { p: "From the example above, $\\nabla L = (-12, -6)$. Both entries are negative, so increasing either $w$ or $b$ lowers the loss. Gradient descent with $\\eta = 0.05$ moves to $(w, b) = (1.6, 0.3)$, where the inside is $3.2 + 0.3 - 5 = -1.5$ and the loss has dropped from 9 to 2.25." },
          ],
        },
        {
          at: 2,
          title: "Steepest direction",
          blocks: [
            { p: "With $\\nabla L = (3, 4)$ (length 5), moving one unit along $(1, 0)$ changes the loss by about 3; along $(0, 1)$ by 4; along the gradient's own direction $(0.6, 0.8)$ by $3(0.6) + 4(0.8) = 5$, the most possible. Moving along $(-0.6, -0.8)$ lowers it by 5, the fastest way down." },
          ],
        },
        {
          at: 4,
          title: "Adding up two paths",
          blocks: [
            { p: "$L = u + v^2$ with $u = 3w$ and $v = w$. At $w = 2$:" },
            { math: r`\frac{dL}{dw} = \underbrace{1 \cdot 3}_{\text{through } u} + \underbrace{2v \cdot 1}_{\text{through } v} = 3 + 4 = 7` },
            { p: "Check directly: $L = 3w + w^2$, so $dL/dw = 3 + 2w = 7$. Backpropagation does this adding-up for every weight in a network." },
          ],
        },
      ],
    },
    "Partial derivatives": {
      examples: [
        {
          title: "Plug in numbers",
          blocks: [
            { p: "For $f(w, b) = w^2 + 3wb$ at $(w, b) = (2, 1)$: $\\partial f/\\partial w = 2(2) + 3(1) = 7$ and $\\partial f/\\partial b = 3(2) = 6$. Nudging $w$ by 0.01 raises $f$ by about 0.07; nudging $b$ by 0.01 raises it by about 0.06." },
          ],
        },
      ],
    },
    "The gradient": {
      examples: [
        {
          kind: "idea",
          title: "A ball on a hillside",
          blocks: [
            { p: "Stand on a hill in fog. You cannot see the valley, but you can feel which way the ground slopes under your feet. The gradient is that feeling; gradient descent is taking a small step in the downhill direction, then feeling again. The learning rate is your stride length." },
          ],
        },
      ],
    },
    "Worked example: gradient of MSE for a line": {
      examples: [
        {
          title: "Compute it for three points",
          blocks: [
            { p: "Points $(0, 1), (1, 3), (2, 5)$ and the starting line $w = 0$, $b = 0$. Predictions are all 0, so the errors $\\hat y_i - y_i$ are $(-1, -3, -5)$." },
            { math: r`\frac{\partial L}{\partial w} = \frac{2}{3}\big[(-1)(0) + (-3)(1) + (-5)(2)\big] = -8.67, \qquad \frac{\partial L}{\partial b} = \frac{2}{3}(-1 - 3 - 5) = -6` },
            { p: "Both negative: raise the slope and the intercept. (With the half-squared loss used in the textbook below, both numbers are halved: −4.33 and −3.)" },
          ],
        },
      ],
    },
    "Textbook case: Numerical Optimization From Objective to Verified Update": {
      plain: "The textbook follows one tiny forecasting problem from start to finish: write the loss, derive the gradient, take a step, and check every number in code.",
    },
    "1.14.1 Form the objective and derive both gradients": {
      plain: "Write the loss, use the chain rule to get one slope per parameter, and update both parameters at the same time. The numbers in the second paragraph are a full worked example.",
    },
    "1.14.2 Establish the least-squares solution for comparison": {
      plain: "For a straight line there is an exact answer you can compute directly. Knowing it lets you test whether gradient descent is really heading to the right place.",
      examples: [
        {
          at: 0,
          title: "The closed-form answer, step by step",
          blocks: [
            {
              steps: [
                { title: "Means", body: "x̄ = (0 + 1 + 2)/3 = 1, ȳ = (1 + 3 + 5)/3 = 3." },
                { title: "Slope", body: "Products of deviations over squared x-deviations.", math: r`\hat w = \frac{(-1)(-2) + (0)(0) + (1)(2)}{1 + 0 + 1} = \frac{4}{2} = 2` },
                { title: "Intercept", body: "", math: r`\hat b = \bar y - \hat w \bar x = 3 - 2(1) = 1` },
                { title: "Compare", body: "Gradient descent from (0, 0) reaches (2.000, 1.000) within 2,000 steps at α = 0.1 (see the code step). The closed form gets there instantly, but gradient descent also works when no closed form exists." },
              ],
            },
          ],
        },
      ],
    },
    "1.14.3 Verify a derivative independently with finite differences": {
      plain: "To test a gradient formula, nudge each parameter a tiny bit up and down and measure how much the loss changes. If the measurement and the formula disagree, the formula is wrong.",
    },
    "1.14.4 Compare batch, stochastic, and mini-batch updates": {
      plain: "Full batch uses every row for each step: accurate but slow. SGD uses one row: fast but noisy. Mini-batch uses a handful: the usual compromise.",
      examples: [
        {
          at: 1,
          title: "Five different first steps from the same start",
          blocks: [
            { table: { head: ["Rows used", "Gradient $(w, b)$", "New $(w, b)$ at $\\alpha = 0.1$"], rows: [["All three (full batch)", "(−4.33, −3)", "(0.43, 0.30)"], ["Row 1 only", "(0, −1)", "(0, 0.10)"], ["Row 2 only", "(−3, −3)", "(0.30, 0.30)"], ["Row 3 only", "(−10, −5)", "(1.00, 0.50)"], ["Rows 2 and 3 (mini-batch)", "(−6.5, −4)", "(0.65, 0.40)"]] } },
            { p: "Each single-row step points somewhere different, but on average they point the same way as the full batch. After 300 shuffled passes, SGD also lands on $w = 2$, $b = 1$." },
          ],
        },
      ],
      code: [
        {
          goal: "Compare full-batch, SGD and mini-batch updates",
          code: r`import numpy as np

x = np.array([0., 1., 2.])
y = np.array([1., 3., 5.])
alpha = 0.1

def grad(w, b, idx):
    e = w * x[idx] + b - y[idx]           # residuals of the chosen rows only
    return np.mean(e * x[idx]), np.mean(e)

print("one update from (0, 0) using different rows:")
for name, idx in [("full batch (all rows)", [0, 1, 2]), ("SGD, row 1 only", [0]), ("SGD, row 2 only", [1]), ("SGD, row 3 only", [2]), ("mini-batch rows 2-3", [1, 2])]:
    gw, gb = grad(0.0, 0.0, idx)
    print(f"  {name:<22} gradient ({gw:6.3f}, {gb:6.3f}) -> (w, b) = ({-alpha * gw + 0.0:.3f}, {-alpha * gb + 0.0:.3f})")

rng = np.random.default_rng(0)
w = b = 0.0
for epoch in range(300):                  # SGD: shuffle, then one row per update
    for i in rng.permutation(3):
        gw, gb = grad(w, b, [i])
        w, b = w - alpha * gw, b - alpha * gb
print("SGD after 300 epochs (900 updates):", round(w, 3), round(b, 3))

# Output:
# one update from (0, 0) using different rows:
#   full batch (all rows)  gradient (-4.333, -3.000) -> (w, b) = (0.433, 0.300)
#   SGD, row 1 only        gradient ( 0.000, -1.000) -> (w, b) = (0.000, 0.100)
#   SGD, row 2 only        gradient (-3.000, -3.000) -> (w, b) = (0.300, 0.300)
#   SGD, row 3 only        gradient (-10.000, -5.000) -> (w, b) = (1.000, 0.500)
#   mini-batch rows 2-3    gradient (-6.500, -4.000) -> (w, b) = (0.650, 0.400)
# SGD after 300 epochs (900 updates): 2.0 1.0`,
          walk: [
            { line: "e = w * x[idx] + b - y[idx]", say: "Residuals for the chosen rows only. `idx` decides whether this is a full batch, one row, or a mini-batch." },
            { line: "return np.mean(e * x[idx]), np.mean(e)", say: "The half-squared-error gradient, averaged over those rows." },
            { line: "for i in rng.permutation(3):", say: "SGD: shuffle the rows each epoch, then update once per row." },
            { line: "w, b = w - alpha * gw, b - alpha * gb", say: "Both parameters are updated together, using the gradient from that single row." },
          ],
        },
      ],
    },
    "1.14.5 Convergence, early stopping, and generalization are separate": {
      plain: "Three different questions: has the optimizer finished? (convergence) Should we stop before it finishes? (early stopping) Will the model work on new data? (generalization) A yes to one is not a yes to the others.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Reading the loss curves",
          blocks: [
            { table: { head: ["Epoch", "Training loss", "Validation loss"], rows: [["1", "12", "13"], ["10", "5", "8"], ["20", "3", "7 ← best"], ["40", "2", "9"]] } },
            { p: "Training keeps improving, but after epoch 20 validation gets worse: the model has started memorising. Keep the epoch-20 checkpoint, then measure it once on a separate test set." },
          ],
        },
      ],
    },
  },
  code: {
    "1.14.1 Form the objective and derive both gradients#0": {
      goal: "Code the loss and both gradients, take one step, then keep going to the exact answer",
      code: r`x = [0., 1., 2.]
y = [1., 3., 5.]

def objective(w, b):
    # mean half-squared error J(w, b)
    return sum((w * xi + b - yi) ** 2 for xi, yi in zip(x, y)) / (2 * len(x))

def gradient(w, b):
    error = [w * xi + b - yi for xi, yi in zip(x, y)]         # residuals e_i
    dw = sum(e * xi for e, xi in zip(error, x)) / len(x)      # dJ/dw = mean(e * x)
    db = sum(error) / len(x)                                  # dJ/db = mean(e)
    return dw, db

w, b, alpha = 0.0, 0.0, 0.1
print("J(0, 0) =", round(objective(w, b), 4))
gw, gb = gradient(w, b)
print("gradient:", round(gw, 4), round(gb, 4))
w, b = w - alpha * gw, b - alpha * gb                         # one simultaneous update
print("after one step: w =", round(w, 4), " b =", round(b, 4), " J =", round(objective(w, b), 4))

for _ in range(2000):                                         # keep going
    gw, gb = gradient(w, b)
    w, b = w - alpha * gw, b - alpha * gb
print("after 2001 steps: w =", round(w, 4), " b =", round(b, 4), "(exact answer: w = 2, b = 1)")

# Output:
# J(0, 0) = 5.8333
# gradient: -4.3333 -3.0
# after one step: w = 0.4333  b = 0.3  J = 3.387
# after 2001 steps: w = 2.0  b = 1.0 (exact answer: w = 2, b = 1)`,
      walk: [
        { line: "return sum((w * xi + b - yi) ** 2 for xi, yi in zip(x, y)) / (2 * len(x))", say: "Mean half-squared error $J(w, b)$: square each residual, add them, divide by $2n$." },
        { line: "error = [w * xi + b - yi for xi, yi in zip(x, y)]", say: "Residuals $e_i = wx_i + b - y_i$." },
        { line: "dw = sum(e * xi for e, xi in zip(error, x)) / len(x)", say: "$\\partial J/\\partial w$ is the average of residual × x." },
        { line: "db = sum(error) / len(x)", say: "$\\partial J/\\partial b$ is the average residual." },
        { line: "w, b = w - alpha * gw, b - alpha * gb", say: "Update both at once, using gradients computed at the old point. Updating $w$ first and then using the new $w$ for $b$ would be a different (wrong) algorithm." },
      ],
    },
    "1.14.3 Verify a derivative independently with finite differences#0": {
      goal: "Check the hand-derived gradient against a numerical estimate at three points",
      code: r`x = [0., 1., 2.]
y = [1., 3., 5.]

def objective(w, b):
    return sum((w * xi + b - yi) ** 2 for xi, yi in zip(x, y)) / (2 * len(x))

def gradient(w, b):
    error = [w * xi + b - yi for xi, yi in zip(x, y)]
    return sum(e * xi for e, xi in zip(error, x)) / len(x), sum(error) / len(x)

h = 1e-5
for w, b in [(0., 0.), (1.25, -0.5), (2., 1.)]:
    analytic_w, analytic_b = gradient(w, b)
    numeric_w = (objective(w + h, b) - objective(w - h, b)) / (2 * h)   # nudge w both ways
    numeric_b = (objective(w, b + h) - objective(w, b - h)) / (2 * h)   # nudge b both ways
    print(f"at ({w}, {b}): analytic ({analytic_w:.6f}, {analytic_b:.6f})  numeric ({numeric_w:.6f}, {numeric_b:.6f})")
    assert abs(analytic_w - numeric_w) < 1e-8 and abs(analytic_b - numeric_b) < 1e-8
print("all gradients match")

# Output:
# at (0.0, 0.0): analytic (-4.333333, -3.000000)  numeric (-4.333333, -3.000000)
# at (1.25, -0.5): analytic (-2.750000, -2.250000)  numeric (-2.750000, -2.250000)
# at (2.0, 1.0): analytic (0.000000, 0.000000)  numeric (0.000000, 0.000000)
# all gradients match`,
      walk: [
        { line: "numeric_w = (objective(w + h, b) - objective(w - h, b)) / (2 * h)", say: "Central difference for $w$: nudge only $w$, keep $b$ fixed." },
        { line: "numeric_b = (objective(w, b + h) - objective(w, b - h)) / (2 * h)", say: "Same for $b$, keeping $w$ fixed: this is what \"partial\" means." },
        { line: "assert abs(analytic_w - numeric_w) < 1e-8 and abs(analytic_b - numeric_b) < 1e-8", say: "Stop with an error if formula and measurement disagree. At (2, 1) both are 0: that is the minimum." },
      ],
    },
    "In Python#0": {
      goal: "Fit a line to noisy data with gradient descent in NumPy",
      code: r`import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(-1, 1, 50)                      # 50 random inputs
y = 1.6 * x + 0.9 + rng.normal(0, 0.2, 50)      # true line plus noise

w, b, lr = 0.0, 0.0, 0.1                        # start at zero
for step in range(200):
    y_hat = w * x + b                           # predictions
    grad_w = 2 * np.mean((y_hat - y) * x)       # dL/dw for mean squared error
    grad_b = 2 * np.mean(y_hat - y)             # dL/db
    w -= lr * grad_w                            # step downhill
    b -= lr * grad_b

print("learned w, b:", round(w, 2), round(b, 2), "(true values 1.6 and 0.9)")

# Output:
# learned w, b: 1.65 0.9 (true values 1.6 and 0.9)`,
      walk: [
        { line: "y = 1.6 * x + 0.9 + rng.normal(0, 0.2, 50)", say: "Make data from a known line plus noise, so we know the right answer." },
        { line: "grad_w = 2 * np.mean((y_hat - y) * x)", say: "The MSE gradient for $w$, for all 50 points at once (vectorised, no loop over rows)." },
        { line: "w -= lr * grad_w", say: "Step downhill. After 200 steps $w \\approx 1.65$, close to the true 1.6 (the noise shifts it slightly)." },
      ],
    },
  },
};

/** Extra code steps for probability (Bayes simulation, normal distribution). */
const PROBABILITY_EXTRA_CODE = {
  bayes: {
    goal: "Simulate a million trips to check Bayes' theorem",
    code: r`import numpy as np

rng = np.random.default_rng(1)
n = 1_000_000
incident = rng.random(n) < 0.01                         # P(I) = 1%
alarm = np.where(incident, rng.random(n) < 0.80,        # P(A | I) = 80%
                           rng.random(n) < 0.10)        # P(A | not I) = 10%

print("simulated P(I | A):", round(incident[alarm].mean(), 4))
print("simulated P(A | I):", round(alarm[incident].mean(), 4))

p_a = 0.80 * 0.01 + 0.10 * 0.99                         # law of total probability
print("Bayes formula P(I | A):", round(0.80 * 0.01 / p_a, 4))

# Output:
# simulated P(I | A): 0.0751
# simulated P(A | I): 0.7997
# Bayes formula P(I | A): 0.0748`,
    walk: [
      { line: "incident = rng.random(n) < 0.01", say: "Each trip has a 1% chance of an incident: an array of True/False values." },
      { line: "alarm = np.where(incident, rng.random(n) < 0.80,", say: "If there was an incident, the alarm fires 80% of the time; otherwise 10% of the time." },
      { line: "print(\"simulated P(I | A):\", round(incident[alarm].mean(), 4))", say: "Keep only the trips with an alarm and ask what share had an incident: about 7.5%." },
      { line: "p_a = 0.80 * 0.01 + 0.10 * 0.99", say: "The same answer from the formula: total alarm rate, then Bayes." },
    ],
  },
  normal: {
    goal: "Check the 68 / 95 rule by sampling from a normal distribution",
    code: r`import numpy as np

rng = np.random.default_rng(0)
heights = rng.normal(loc=165, scale=8, size=100_000)    # mean 165 cm, sd 8 cm
within1 = np.mean(np.abs(heights - 165) < 8)
within2 = np.mean(np.abs(heights - 165) < 16)
print("share within 1 sd:", round(within1, 3), "| within 2 sd:", round(within2, 3))

z = (181 - 165) / 8                                     # standardise one value
print("z-score of 181 cm:", z)

# Output:
# share within 1 sd: 0.684 | within 2 sd: 0.955
# z-score of 181 cm: 2.0`,
    walk: [
      { line: "heights = rng.normal(loc=165, scale=8, size=100_000)", say: "Draw 100,000 heights from a normal distribution with mean 165 and standard deviation 8." },
      { line: "within1 = np.mean(np.abs(heights - 165) < 8)", say: "Share within one standard deviation of the mean: about 0.68." },
      { line: "z = (181 - 165) / 8", say: "Standardise a single value: 181 cm is 2 standard deviations above the mean." },
    ],
  },
};

/** Easy layer: Probability & Statistics. */
export const PROBABILITY: EasyTopic = {
  sections: {
    "Why you need this": {
      plain: "Data are noisy and models are never certain. Statistics describes the data you have; probability describes how sure you can be about what you have not seen yet.",
    },
    "Explained in depth": {
      plain: "Random variables, expectation and variance, the common distributions, conditional probability and Bayes, the central limit theorem, maximum likelihood and p-values. Each has a small example.",
      examples: [
        {
          at: 1,
          title: "Expectation and variance of a die",
          blocks: [
            { p: "A fair die shows 1 to 6, each with probability 1/6." },
            { list: ["$\\mathbb{E}[X] = (1 + 2 + \\dots + 6)/6 = 3.5$.", "$\\mathbb{E}[X^2] = (1 + 4 + 9 + 16 + 25 + 36)/6 = 91/6$, so $\\operatorname{Var}(X) = 91/6 - 3.5^2 = 2.92$.", "Score 2 × die + 10: mean $2(3.5) + 10 = 17$, variance $2^2 \\times 2.92 = 11.67$. Adding 10 shifts the mean but not the spread."] },
          ],
        },
        {
          at: 2,
          title: "Pick the distribution",
          blocks: [
            { list: ["Does one customer click? Bernoulli(0.03): mean 0.03.", "How many of 200 visitors click? Binomial(200, 0.03): mean $200 \\times 0.03 = 6$, variance $6 \\times 0.97 = 5.82$.", "Calls to a help desk per hour, average 4: Poisson(4), mean 4 and variance 4."] },
          ],
        },
        {
          at: 3,
          title: "Conditional probability from a table",
          blocks: [
            { table: { head: ["", "Rain", "No rain", "Total"], rows: [["Cloudy", "30", "20", "50"], ["Clear", "5", "45", "50"], ["Total", "35", "65", "100"]] } },
            { p: "$P(\\text{rain}) = 35/100 = 0.35$, but $P(\\text{rain} \\mid \\text{cloudy}) = 30/50 = 0.6$. Knowing it is cloudy changes the answer, so rain and clouds are **not** independent." },
          ],
        },
        {
          at: 4,
          title: "Standard error shrinks with more data",
          blocks: [
            { p: "Single test scores have $\\sigma = 10$. The average of 25 scores has standard error $10/\\sqrt{25} = 2$; of 100 scores, $10/\\sqrt{100} = 1$. Four times the data halves the uncertainty." },
          ],
        },
        {
          at: 5,
          title: "Maximum likelihood by trying values",
          blocks: [
            { table: { head: ["$p$", "Likelihood $p^7(1-p)^3$"], rows: [["0.5", "0.00098"], ["0.6", "0.00179"], ["0.7", "**0.00222**"], ["0.8", "0.00168"]] } },
            { p: "7 heads in 10 flips: $p = 0.7$ makes the data most probable, which is just the observed fraction." },
          ],
        },
        {
          at: 6,
          kind: "idea",
          title: "What a p-value says",
          blocks: [
            { p: "A coin lands heads 9 times in 10. If it were fair, a result this lopsided (9 or 10 heads, or 9 or 10 tails) happens with probability about 0.021. So p ≈ 0.02: unusual for a fair coin. It does **not** mean there is a 2% chance the coin is fair." },
          ],
        },
      ],
    },
    "Describing data": {
      examples: [
        {
          title: "Mean, median and spread of five salaries",
          blocks: [
            { p: "Salaries (₹ lakh): 4, 5, 5, 6, 30." },
            { list: ["Mean = 50/5 = **10**, pulled up by the one large salary.", "Median = **5**, the middle value, which describes a typical person better.", "Sample variance = $[36 + 25 + 25 + 16 + 400]/4 = 125.5$, so $s = 11.2$. The outlier dominates the spread too."] },
          ],
        },
      ],
    },
    "Covariance and correlation": {
      examples: [
        {
          title: "Correlation of study hours and marks",
          blocks: [
            { p: "Hours $(1, 2, 3)$, marks $(50, 60, 75)$. Means: 2 and 61.67." },
            {
              steps: [
                { title: "Deviations", body: "Hours: (−1, 0, 1). Marks: (−11.67, −1.67, 13.33)." },
                { title: "Covariance", body: "Multiply matching deviations, add, divide by n − 1 = 2.", math: r`\text{cov} = \frac{(-1)(-11.67) + 0 + (1)(13.33)}{2} = 12.5` },
                { title: "Correlation", body: "s_hours = 1 and s_marks = 12.58.", math: r`r = \frac{12.5}{1 \times 12.58} = 0.99` },
              ],
            },
          ],
        },
      ],
    },
    "Probability basics": {
      examples: [
        {
          title: "Two dice",
          blocks: [
            { list: ["$P(\\text{first die is 6}) = 1/6$, $P(\\text{not 6}) = 5/6$.", "Independent dice: $P(\\text{both 6}) = 1/6 \\times 1/6 = 1/36$.", "$P(\\text{sum} = 8 \\mid \\text{first die is 6}) = 1/6$ (second must be 2), but $P(\\text{sum} = 8) = 5/36$: knowing the first die changes the probability."] },
          ],
        },
      ],
    },
    "The normal distribution": {
      code: [PROBABILITY_EXTRA_CODE.normal],
      examples: [
        {
          title: "Heights",
          blocks: [
            { p: "Adult heights: mean 165 cm, standard deviation 8 cm." },
            { list: ["About 68% are between 157 and 173 cm ($\\mu \\pm \\sigma$).", "About 95% are between 149 and 181 cm ($\\mu \\pm 2\\sigma$).", "Someone 181 cm tall has $z = (181 - 165)/8 = 2$: two standard deviations above average, taller than about 97.7% of people."] },
          ],
        },
      ],
    },
    "1.1.2 Supervision, dataset structure, and label timing": {
      plain: "Before modelling, write down what one row is, when its features are known, and when its label is measured. A feature that is only known after the moment you predict is cheating, even if it is in the table.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Allowed and not allowed",
          blocks: [
            { table: { head: ["Candidate feature for \"wait time in the 10:00 hour\"", "Known at 10:00?", "Use it?"], rows: [["Visitors in the same hour last week", "Yes", "Yes"], ["Staff rota published the day before", "Yes", "Yes"], ["Total visitors at the end of the 10:00 hour", "No", "No: leaks the answer"]] } },
          ],
        },
      ],
    },
    "1.2.2 Probability for rare events": {
      code: [PROBABILITY_EXTRA_CODE.bayes],
      plain: "$P(\\text{incident} \\mid \\text{alarm})$ and $P(\\text{alarm} \\mid \\text{incident})$ are different questions. When incidents are rare, even a good alarm is usually a false alarm.",
      examples: [
        {
          at: 1,
          title: "The 10,000 trips as a table",
          blocks: [
            { table: { head: ["", "Alarm", "No alarm", "Total"], rows: [["Incident", "80", "20", "100"], ["No incident", "990", "8,910", "9,900"], ["Total", "1,070", "8,930", "10,000"]] } },
            { list: ["Read across the Incident row: $80/100 = 80\\%$ of incidents trigger the alarm.", "Read down the Alarm column: only $80/1{,}070 = 7.5\\%$ of alarms are real incidents.", "The 990 false alarms swamp the 80 true ones because incident-free trips are 99 times more common."] },
          ],
        },
      ],
    },
    "2.2.1 Conditional probability and the base-rate effect": {
      plain: "How likely a flag is to be right depends on how common the real thing is. The same test is much more trustworthy when the condition is common.",
      examples: [
        {
          at: 1,
          title: "Same flag, different base rates",
          blocks: [
            { p: "Sensitivity 80%, false-flag rate 10%." },
            { table: { head: ["Share of boxes that fill", "Chance a flagged box really fills"], rows: [["1%", "0.008/0.107 = 7.5%"], ["5%", "0.04/0.135 = 29.6%"], ["30%", "0.24/0.31 = 77.4%"]] } },
          ],
        },
      ],
    },
    "1.20.5 Sampling and uncertainty in an A/B test": {
      plain: "An A/B test compares a new rule with the old one on similar groups. The p-value says how surprising the difference would be if the rule did nothing; it does not say how big or how valuable the difference is.",
      examples: [
        {
          at: 3,
          kind: "idea",
          title: "Significant but not worth it",
          blocks: [
            { p: "Across 2 million requests, unmet requests fall from 5.0% to 4.9%. With that much data the difference is statistically clear, but it is 0.1 percentage points: 2,000 fewer failures out of 2 million. If the new rule needs an extra truck fleet, it may still not pay for itself." },
          ],
        },
      ],
    },
  },
  code: {
    "In Python#0": {
      goal: "Describe data: mean, median, standard deviation, correlation and z-scores",
      code: r`import numpy as np
import pandas as pd

scores = np.array([62, 71, 58, 90, 75, 68, 81])
print("mean:", round(scores.mean(), 2), "| median:", np.median(scores), "| sample std:", round(scores.std(ddof=1), 2))

df = pd.DataFrame({"hours": [1, 2, 3, 4, 5], "marks": [52, 58, 65, 70, 79]})
print(df.describe().round(2))
print("correlation hours-marks:", round(df["hours"].corr(df["marks"]), 3))

z = (scores - scores.mean()) / scores.std(ddof=1)   # standardise
print("z-scores:", z.round(2))

# Output:
# mean: 72.14 | median: 71.0 | sample std: 11.01
#        hours  marks
# count   5.00   5.00
# mean    3.00  64.80
# std     1.58  10.47
# min     1.00  52.00
# 25%     2.00  58.00
# 50%     3.00  65.00
# 75%     4.00  70.00
# max     5.00  79.00
# correlation hours-marks: 0.996
# z-scores: [-0.92 -0.1  -1.28  1.62  0.26 -0.38  0.8 ]`,
      walk: [
        { line: "round(scores.std(ddof=1), 2)", say: "`ddof=1` divides by $n - 1$, the sample standard deviation. NumPy's default (`ddof=0`) divides by $n$." },
        { line: "print(df.describe().round(2))", say: "pandas summary: count, mean, std, min, quartiles and max for every column at once." },
        { line: "round(df[\"hours\"].corr(df[\"marks\"]), 3)", say: "Pearson correlation: 0.996, so hours and marks rise together almost perfectly in this toy data." },
        { line: "z = (scores - scores.mean()) / scores.std(ddof=1)", say: "Standardise: how many standard deviations each score is from the mean. 90 marks is 1.62 SD above." },
      ],
    },
  },
};

