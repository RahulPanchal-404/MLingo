import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: Neural Networks. */
export const NEURAL: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Each neuron draws one line and says which side a point is on. A layer draws many lines; the next layer combines them into shapes. Training finds the lines that make the loss small.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "How layers build a face detector",
          blocks: [
            { p: "Nobody tells the network what to look for. After training on photos, units in layer 1 respond to edges, units in layer 2 to combinations of edges (an eye corner, a curve), and units in layer 3 to whole parts (an eye, a nose). The last layer answers \"is this a face?\" from those parts. Each layer reuses what the one before it found." },
          ],
        },
        {
          at: 2,
          title: "Counting parameters for a small network",
          blocks: [
            { p: "A network $30 \\to 16 \\to 8 \\to 1$ (the one in the code below):" },
            { math: r`\underbrace{30 \times 16 + 16}_{496} + \underbrace{16 \times 8 + 8}_{136} + \underbrace{8 \times 1 + 1}_{9} = 641` },
            { p: "Every layer adds (inputs × outputs) weights plus one bias per output." },
          ],
        },
      ],
    },
    "A neuron and a layer": {
      plain: "A neuron multiplies each input by a weight, adds them up with a bias, then applies an activation. A layer is many neurons reading the same inputs.",
      examples: [
        {
          at: 2,
          title: "One layer of two neurons by hand",
          blocks: [
            { p: "Input $\\mathbf x = (1, 2)$. Neuron 1 has weights $(1, -1)$ and bias 0; neuron 2 has weights $(0.5, 0.5)$ and bias $-2$." },
            { math: r`z_1 = 1 - 2 + 0 = -1, \qquad z_2 = 0.5 + 1 - 2 = -0.5` },
            { p: "With ReLU both outputs become 0: this input switches the whole layer off. With sigmoid they become $\\sigma(-1) = 0.27$ and $\\sigma(-0.5) = 0.38$. The activation decides how a negative score is passed on." },
          ],
        },
      ],
    },
    Backpropagation: {
      plain: "Run the network forward to get the loss. Then go backwards: each layer receives \"how much the loss changes if my output changes\", uses it to get its own weight gradients, and passes it on to the layer before.",
      code: [
        {
          goal: "A two-layer network trained from scratch with NumPy",
          code: r`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import make_moons

X, y = make_moons(n_samples=400, noise=0.2, random_state=0)   # two curved classes
y = y.reshape(-1, 1)                                          # column vector, shape (400, 1)

rng = np.random.default_rng(0)
W1 = rng.normal(0, np.sqrt(2 / 2), size=(2, 16))   # He initialisation: 2 inputs -> 16 hidden units
b1 = np.zeros(16)
W2 = rng.normal(0, np.sqrt(2 / 16), size=(16, 1))  # 16 hidden units -> 1 output
b2 = np.zeros(1)
lr = 0.5

def sigmoid(z):
    return 1 / (1 + np.exp(-z))

for epoch in range(3001):
    # forward pass
    Z1 = X @ W1 + b1               # (400, 16) pre-activations
    A1 = np.maximum(0, Z1)         # ReLU
    p = sigmoid(A1 @ W2 + b2)      # (400, 1) predicted probabilities
    loss = -np.mean(y * np.log(p + 1e-12) + (1 - y) * np.log(1 - p + 1e-12))

    # backward pass (chain rule, output to input)
    d2 = (p - y) / len(X)          # dL/dz2 for sigmoid + cross-entropy
    gW2 = A1.T @ d2
    gb2 = d2.sum(axis=0)
    d1 = (d2 @ W2.T) * (Z1 > 0)    # send the error back through W2, then through ReLU
    gW1 = X.T @ d1
    gb1 = d1.sum(axis=0)

    # gradient descent update
    W1 -= lr * gW1; b1 -= lr * gb1
    W2 -= lr * gW2; b2 -= lr * gb2

    if epoch % 1000 == 0:
        acc = np.mean((p > 0.5) == y)
        print(f"epoch {epoch:4d}: loss {loss:.3f}  accuracy {acc:.3f}")

# draw the learned decision boundary
xx, yy = np.meshgrid(np.linspace(-1.5, 2.5, 200), np.linspace(-1, 1.5, 200))
grid = np.c_[xx.ravel(), yy.ravel()]
prob = sigmoid(np.maximum(0, grid @ W1 + b1) @ W2 + b2).reshape(xx.shape)
fig, ax = plt.subplots(figsize=(5, 3.2))
ax.contourf(xx, yy, prob, levels=[0, 0.5, 1], alpha=0.25, colors=["tab:blue", "tab:orange"])
ax.scatter(X[:, 0], X[:, 1], c=y.ravel(), cmap="coolwarm", s=10)
ax.set(title="Decision boundary learned from scratch", xticks=[], yticks=[])
fig.tight_layout()
fig.savefig("nn_boundary.png")

# Output:
# epoch    0: loss 0.716  accuracy 0.560
# epoch 1000: loss 0.094  accuracy 0.960
# epoch 2000: loss 0.087  accuracy 0.965
# epoch 3000: loss 0.084  accuracy 0.968`,
          figure: { src: "/theory/figures/code/nn_boundary.svg", alt: "Two interleaved half-moons; the network's decision boundary curves between them." },
          walk: [
            { line: "W1 = rng.normal(0, np.sqrt(2 / 2), size=(2, 16))   # He initialisation: 2 inputs -> 16 hidden units", say: "Small random weights. They must not all be equal, or every hidden unit would learn the same thing." },
            { line: "A1 = np.maximum(0, Z1)         # ReLU", say: "Forward pass through the hidden layer." },
            { line: "d2 = (p - y) / len(X)          # dL/dz2 for sigmoid + cross-entropy", say: "The error signal at the output: predicted minus true." },
            { line: "d1 = (d2 @ W2.T) * (Z1 > 0)    # send the error back through W2, then through ReLU", say: "Backpropagation: the output error flows back through the weights, and is blocked where ReLU was off." },
            { line: "W1 -= lr * gW1; b1 -= lr * gb1", say: "Gradient descent step on every weight." },
            { line: "print(f\"epoch {epoch:4d}: loss {loss:.3f}  accuracy {acc:.3f}\")", say: "Loss falls from 0.72 to 0.08 and accuracy climbs to about 97%. A straight line cannot do that on moons." },
          ],
        },
      ],
    },
    "Worked example: one update by hand": {
      plain: "Forward to get the loss, backward to get each gradient, then subtract learning rate × gradient from each weight.",
    },
    "Training in practice": {
      examples: [
        {
          title: "Reading the loss curves",
          blocks: [
            { table: { head: ["What you see", "Diagnosis", "Try"], rows: [["Training loss 0.05, validation loss 0.60 and rising", "Overfitting", "Early stopping, dropout, weight decay, more data"], ["Both losses stuck at about 0.69 (binary)", "Not learning: predicting 50/50", "Check labels and scaling; raise the learning rate"], ["Loss jumps to NaN after a few steps", "Exploding updates", "Lower the learning rate; clip gradients"]] } },
          ],
        },
      ],
    },
    "Solving XOR by hand": {
      plain: "No single line separates XOR. Two hidden units turn the inputs into \"how many are on\" and \"are both on\", and then a simple subtraction gives the answer.",
      code: [
        {
          goal: "Check the hand-built XOR network",
          code: r`import numpy as np

X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
W1 = np.array([[1, 1], [1, 1]])     # both hidden units add x1 + x2
b1 = np.array([0, -1])              # the second unit also subtracts 1
w2 = np.array([1, -2])              # output = h1 - 2*h2

H = np.maximum(0, X @ W1 + b1)      # ReLU hidden layer
y_hat = H @ w2
for x, h, out in zip(X, H, y_hat):
    print(f"x = {x}  hidden = {h}  output = {out}")
print("XOR solved:", list(y_hat) == [0, 1, 1, 0])

# Output:
# x = [0 0]  hidden = [0 0]  output = 0
# x = [0 1]  hidden = [1 0]  output = 1
# x = [1 0]  hidden = [1 0]  output = 1
# x = [1 1]  hidden = [2 1]  output = 0
# XOR solved: True`,
          walk: [
            { line: "W1 = np.array([[1, 1], [1, 1]])     # both hidden units add x1 + x2", say: "Both hidden units compute $x_1 + x_2$." },
            { line: "b1 = np.array([0, -1])              # the second unit also subtracts 1", say: "The bias makes unit 2 fire only when both inputs are 1." },
            { line: "y_hat = H @ w2", say: "Output $h_1 - 2h_2$: 0, 1, 1, 0, exactly XOR." },
          ],
        },
      ],
    },
    "Textbook case: Neural-Network Mathematics and Sequence Models": {
      plain: "A reservoir-level forecast used to walk through layers, backpropagation, softmax, sequence models and attention.",
    },
    "3.18.1 Shapes, linear algebra, and a neural layer": {
      plain: "A batch of inputs is a matrix; a layer is one matrix multiplication plus a bias, then an activation. Write the shape next to every quantity.",
      replace: {
        0: { p: "Represent $n$ observations with $p$ measured inputs as a matrix $X$ of shape $n \\times p$. A batch is a subset of its rows. A dense layer with $p$ inputs and $h$ outputs has weight matrix $W$ of shape $p \\times h$ and a bias vector $b$ of length $h$. Its preactivation is $Z = XW + b$, where $b$ is broadcast across the $n$ rows. An activation function $\\phi$ is applied elementwise to obtain $H = \\phi(Z)$, shape $n \\times h$. A second layer can map $H$ to a final score. Writing shapes next to each quantity catches many bugs before training." },
        1: { p: "For one observation $x = [2, 3]$, $W = \\begin{bmatrix} 1 & -1 \\\\ 0.5 & 2 \\end{bmatrix}$ and $b = [0, -2]$, the preactivation is $xW + b = [2 \\cdot 1 + 3 \\cdot 0.5,\\; 2 \\cdot (-1) + 3 \\cdot 2 - 2] = [3.5, 2]$. With $\\text{ReLU}(z) = \\max(0, z)$, the activated vector is $[3.5, 2]$. If the second preactivation were negative, ReLU would output zero for that coordinate. ReLU is simple and avoids some saturation associated with sigmoid activations, though units that output zero for all examples may stop learning under an unfortunate initialization or step size." },
      },
      examples: [
        {
          at: 5,
          title: "Answer to the exercise",
          blocks: [
            { p: "$(32, 4) \\times (4, 8) \\to (32, 8)$, then $(32, 8) \\times (8, 1) \\to (32, 1)$: one score per row. If $W_1$ is stored as $(8, 4)$, $(32, 4) \\times (8, 4)$ is not defined (4 ≠ 8) and the code fails, which is the useful outcome. The silent danger is a square matrix stored transposed: the shapes still fit, but the wrong weights meet the wrong inputs." },
          ],
        },
      ],
    },
    "3.18.2 Backpropagation is repeated chain rule": {
      plain: "To find how one early weight affects the loss, multiply the small local slopes along the path from that weight to the loss.",
      replace: {
        0: { p: "A feedforward network produces a loss $L$ by composing operations. For one simple hidden unit, let $z_1 = w_1x + b_1$, $h = \\phi(z_1)$, $z_2 = w_2h + b_2$ and prediction $\\hat y = \\sigma(z_2)$. To update $w_1$, differentiate $L$ through every operation that connects $w_1$ to the loss:" },
        1: { math: r`\frac{\partial L}{\partial w_1} = \frac{\partial L}{\partial \hat y}\cdot\frac{\partial \hat y}{\partial z_2}\cdot\frac{\partial z_2}{\partial h}\cdot\frac{\partial h}{\partial z_1}\cdot\frac{\partial z_1}{\partial w_1}` },
        2: { p: "Each factor has a local meaning. $\\partial z_1/\\partial w_1 = x$, $\\partial z_2/\\partial h = w_2$, and for $\\sigma(s) = 1/(1 + e^{-s})$ the derivative is $\\sigma'(s) = \\sigma(s)[1 - \\sigma(s)]$. If $\\phi$ is ReLU, its derivative is one for positive $z_1$ and zero for negative $z_1$; at exactly zero a convention is used. Backpropagation evaluates these products efficiently from the output layer toward the inputs, sharing intermediate values across many parameters." },
        3: { p: "Under binary cross-entropy with a sigmoid output, the combined derivative of loss with respect to the final logit $z_2$ simplifies to $\\hat y - y$. If $y = 1$ and $\\hat y = 0.2$, the signal is $-0.8$, pushing parameters in a direction that increases the score under a suitable update. This simplification does not mean the rest of the hidden-layer derivative disappears; it must still be multiplied by downstream weights and activation derivatives." },
        5: { p: "Let $x = 2$, $w_1 = 1$, $b_1 = 0$, $\\phi = \\text{ReLU}$, $w_2 = 0.5$ and $b_2 = 0$. Then $z_1 = 2$, $h = 2$, $z_2 = 1$ and $\\hat y = \\sigma(1) \\approx 0.7311$. For a positive target $y = 1$, $\\partial L/\\partial z_2 = 0.7311 - 1 = -0.2689$. Therefore $\\partial L/\\partial w_2 = (-0.2689)h \\approx -0.5378$; $\\partial L/\\partial b_2 = -0.2689$; $\\partial L/\\partial w_1 = (-0.2689) \\cdot w_2 \\cdot 1 \\cdot x \\approx -0.2689$; and $\\partial L/\\partial b_1 = (-0.2689)w_2 \\approx -0.1345$. At learning rate 0.1, the new $w_1$ is approximately 1.02689 and the new $w_2$ approximately 0.55378. An actual optimizer updates all parameters according to their gradients from the same old forward pass, not by recomputing after each coordinate change unless its algorithm explicitly says so." },
      },
      examples: [
        {
          at: 7,
          title: "Answer to the exercise",
          blocks: [
            { p: "With $x = -2$: $z_1 = -2$, so $h = \\text{ReLU}(-2) = 0$ and the ReLU slope is 0. Every gradient that passes through this unit is multiplied by 0, so $\\partial L/\\partial w_1 = 0$: this row teaches $w_1$ nothing. If a unit is negative for every row, it never learns again (a \"dead ReLU\")." },
          ],
        },
      ],
    },
    "3.18.3 Softmax, cross-entropy, and multiclass outputs": {
      plain: "Softmax turns raw scores into probabilities that sum to 1. Cross-entropy is $-\\log$(probability of the true class), and its gradient is simply predicted minus true.",
      replace: {
        0: { p: "For $K$ mutually exclusive classes, a model can produce logits $z_1, \\dots, z_K$. Softmax converts them to probabilities $p_k = e^{z_k}/\\sum_j e^{z_j}$. Adding the same constant $c$ to every logit leaves the probabilities unchanged, because $e^c$ multiplies numerator and denominator equally. For numerical stability, subtract the largest logit before exponentiating." },
        1: { p: "For logits $[0, \\log 2, \\log 3]$, the exponentials are $[1, 2, 3]$, so the probabilities are $[1/6, 2/6, 3/6]$. If the correct class is the third, its negative log-likelihood is $-\\log(3/6) = \\log 2 \\approx 0.693$. If the correct class is the first, the loss is $-\\log(1/6) \\approx 1.792$. This objective penalizes the model more when it gives a small probability to the true category." },
        2: { p: "For one-hot target $y$, multiclass cross-entropy is $L = -\\sum_k y_k\\log p_k$. With softmax logits, the derivative with respect to $z_k$ is $p_k - y_k$. Thus the score assigned to the true class receives a negative derivative unless its probability is already one, while other classes receive positive derivatives. Gradient descent adjusts upstream weights through these signals. For classes that can co-occur, such as simultaneous sensor and gate faults, a softmax model forces competition among classes; separate sigmoid outputs with an appropriate multilabel objective may be a better formulation." },
        5: { p: "**Exercise:** For probabilities $[0.2, 0.3, 0.5]$ and one-hot target $[0, 1, 0]$, calculate cross-entropy $-\\log 0.3 \\approx 1.204$. Write the logit-gradient vector $p - y = [0.2, -0.7, 0.5]$. Which class's logit should increase under a gradient-descent step?" },
      },
      examples: [
        {
          at: 5,
          title: "Answer to the exercise",
          blocks: [
            { p: "Gradient descent moves opposite to the gradient. Class 2 has a negative gradient ($-0.7$), so its logit goes up; classes 1 and 3 have positive gradients, so theirs go down. The wrong class with the most probability (class 3, 0.5) is pushed down hardest." },
          ],
        },
      ],
    },
    "3.18.4 Spatial and sequential structure": {
      plain: "Convolutions reuse one small filter across an image; recurrent networks reuse one update across time. Reusing weights matches the structure of the data and saves parameters.",
      replace: {
        1: { p: "A recurrent model processes a sequence step by step. A simple recurrence $h_t = \\phi(W_xx_t + W_hh_{t-1} + b)$ passes a hidden state forward, allowing prior measurements to affect a later prediction. Backpropagation through time differentiates across the unrolled steps. Long dependencies can make gradients vanish or explode when repeated derivatives are very small or very large. Gated architectures such as LSTMs use learned gates that control which information is retained, updated, or exposed. These improve some sequence tasks but still require careful choice of history length, leakage-free time splits, and a baseline that uses simple rolling aggregates." },
      },
      examples: [
        {
          at: 0,
          title: "Why sharing weights saves so much",
          blocks: [
            { p: "A 28 × 28 image has 784 pixels. A dense layer to 100 units needs $784 \\times 100 = 78{,}400$ weights. A convolution layer with 100 filters of size 3 × 3 needs $9 \\times 100 = 900$ weights, and each filter still looks at the whole image by sliding over it." },
          ],
        },
      ],
    },
    "3.18.5 Attention and transformer computations": {
      plain: "Attention lets each position take a weighted average of other positions. The weights come from how well its query matches their keys.",
      replace: {
        0: { p: "Self-attention lets a sequence position combine information from other positions. For a sequence matrix $X$, learned projections produce queries $Q = XW_Q$, keys $K = XW_K$ and values $V = XW_V$. Scaled dot-product attention computes weights $\\operatorname{softmax}(QK^\\top/\\sqrt{d_k})$ along the key positions, then multiplies those weights by $V$. The factor $\\sqrt{d_k}$ controls the growth of dot-product magnitudes with key dimension under common scale assumptions. A mask can forbid attending to future positions in an autoregressive setting." },
        1: { p: "Consider one query with dot products $[0, \\log 2]$ after scaling. Its attention weights are $[1/3, 2/3]$. If the two one-dimensional values are $[3, 9]$, the attention output is $\\tfrac13 \\cdot 3 + \\tfrac23 \\cdot 9 = 7$. The output is a data-dependent weighted combination of values. This small calculation illustrates the operation but does not by itself explain what a trained model learns; the projection matrices and surrounding layers determine the useful representation." },
        4: { p: "**Exercise:** With key dimension $d_k = 4$, raw dot products $[0, 2]$ become $[0, 1]$ after division by $\\sqrt4$. Compute softmax weights $[1/(1+e),\\; e/(1+e)]$ and explain how they differ from the unscaled weights $[1/(1+e^2),\\; e^2/(1+e^2)]$." },
      },
      examples: [
        {
          at: 4,
          title: "Answer to the exercise",
          blocks: [
            { p: "Scaled: $[0.27, 0.73]$. Unscaled: $[0.12, 0.88]$. Without scaling, large dot products push softmax towards all-or-nothing weights, where its gradients are tiny. Dividing by $\\sqrt{d_k}$ keeps the weights softer and training stable." },
          ],
        },
      ],
    },
    "Textbook case: Neural Networks Through Tensor Algebra and Derivatives": {
      plain: "A three-class maintenance classifier used to practise shapes, backpropagation and a stable softmax, with every number checked in code.",
    },
    "3.19.1 From matrix multiplication to a multi-layer network": {
      plain: "Each layer is multiply, add bias, activate. Check that the shapes chain: $(n, d) \\to (n, h) \\to (n, k)$.",
    },
    "3.19.2 Backpropagation is repeated application of the chain rule": {
      plain: "The output error $\\delta_2$ gives the last layer's gradients; multiply it back through the weights and the activation slope to get the hidden error $\\delta_1$, and repeat.",
    },
    "3.19.3 Stable softmax, cross-entropy, and its gradient": {
      plain: "Subtract the largest logit before exponentiating so nothing overflows. The probabilities do not change.",
    },
    "3.19.4 Training dynamics, regularization, and reliable diagnostics": {
      plain: "Gradients multiply through layers, so they can shrink to nothing or blow up. Watch training and validation loss together to tell bugs, overfitting and data shift apart.",
    },
    "Textbook case: Neural Networks Through the Chain Rule": {
      plain: "A small energy-use network small enough to show every multiplication and derivative.",
    },
    "3.20.1 Specify shapes before operations": {
      plain: "Write the shape of every matrix first. A mismatch is a bug, not something to fix by reshaping until it runs.",
    },
    "3.20.2 Derive gradients for a squared-loss network": {
      plain: "Same chain rule in matrix form: output error, then last-layer gradients, then the error sent back through the hidden layer.",
    },
    "3.20.3 Work one scalar chain by hand": {
      plain: "One input, one hidden unit, one output: compute every derivative with numbers.",
    },
    "3.20.4 Verify a matrix implementation against finite differences": {
      plain: "Nudge each weight a tiny bit up and down and see how the loss changes. If that matches your formula, your backpropagation is right.",
    },
    "3.20.5 Train with a validation design and failure diagnostics": {
      plain: "Split by machine or time to match deployment, scale on training data, and check for saturated activations and exploding gradients.",
    },
  },
  code: {
    "3.19.2 Backpropagation is repeated application of the chain rule#0": {
      goal: "Backpropagate one example through a tiny two-layer network",
      code: r`x = [1.0, 2.0]
z1 = [-1.0, 2.0]
hidden = [max(0.0, z) for z in z1]
out_weights = [3.0, 4.0]
logit = sum(a * w for a, w in zip(hidden, out_weights)) + 1.0
target = 7.0
delta2 = logit - target
grad_w2 = [a * delta2 for a in hidden]
delta1 = [w * delta2 * (1.0 if z > 0 else 0.0)
          for w, z in zip(out_weights, z1)]
grad_w1 = [[value * signal for signal in delta1] for value in x]
assert logit == 9.0 and delta2 == 2.0
assert grad_w2 == [0.0, 4.0]
assert delta1 == [0.0, 8.0]
assert grad_w1 == [[0.0, 8.0], [0.0, 16.0]]
print("prediction:", logit, "| error signal delta2:", delta2)
print("output-weight gradients:", grad_w2)
print("hidden error delta1:", delta1, "(unit 1 gets 0: its ReLU was off)")
print("first-layer gradients:", grad_w1)

# Output:
# prediction: 9.0 | error signal delta2: 2.0
# output-weight gradients: [0.0, 4.0]
# hidden error delta1: [0.0, 8.0] (unit 1 gets 0: its ReLU was off)
# first-layer gradients: [[0.0, 8.0], [0.0, 16.0]]`,
      walk: [
        { line: "hidden = [max(0.0, z) for z in z1]", say: "ReLU: the first hidden unit (−1) switches off." },
        { line: "delta2 = logit - target", say: "Output error for half-squared loss: prediction 9 minus target 7 = 2." },
        { line: "delta1 = [w * delta2 * (1.0 if z > 0 else 0.0)", say: "Hidden error = output weight × output error × ReLU slope. The switched-off unit gets 0." },
        { line: "grad_w1 = [[value * signal for signal in delta1] for value in x]", say: "First-layer gradient = input × hidden error." },
      ],
    },
    "3.19.3 Stable softmax, cross-entropy, and its gradient#0": {
      goal: "Stable softmax and its gradient",
      code: r`from math import exp, log, isclose

logits = [2.0, 1.0, 0.0]
shifted = [exp(z - max(logits)) for z in logits]
total = sum(shifted)
probs = [v / total for v in shifted]
target = [0.0, 1.0, 0.0]
gradient = [p - y for p, y in zip(probs, target)]
assert isclose(sum(probs), 1.0)
assert isclose(sum(gradient), 0.0, abs_tol=1e-12)
assert isclose(-log(probs[1]), 1.4076059644443804)
print("probabilities:", [round(p, 4) for p in probs])
print("loss (true class = 2nd):", round(-log(probs[1]), 4))
print("logit gradient p - y:", [round(g, 4) for g in gradient])

# Output:
# probabilities: [0.6652, 0.2447, 0.09]
# loss (true class = 2nd): 1.4076
# logit gradient p - y: [0.6652, -0.7553, 0.09]`,
      walk: [
        { line: "shifted = [exp(z - max(logits)) for z in logits]", say: "Subtract the largest logit first, so the exponentials cannot overflow." },
        { line: "gradient = [p - y for p, y in zip(probs, target)]", say: "Predicted minus true: the true class gets a negative gradient, so its logit goes up." },
      ],
    },
    "3.20.4 Verify a matrix implementation against finite differences#0": {
      goal: "Gradient check: analytic backpropagation versus finite differences",
      code: r`import numpy as np

X=np.array([[1.,2.],[2.,-1.],[.5,.3]])
Y=np.array([[1.],[0.],[.7]])
W1=np.array([[.2,-.1],[.4,.3]])
b1=np.array([.05,-.02])
W2=np.array([[.6],[-.4]])
b2=np.array([.1])
def forward_loss(W1,b1,W2,b2):
    Z=X@W1+b1
    A=np.tanh(Z)
    pred=A@W2+b2
    return np.mean((pred-Y)**2)/2
def analytic(W1,b1,W2,b2):
    Z=X@W1+b1
    A=np.tanh(Z)
    pred=A@W2+b2
    d2=(pred-Y)/len(X)
    gW2=A.T@d2
    gb2=d2.sum(axis=0)
    d1=(d2@W2.T)*(1-A*A)
    gW1=X.T@d1
    gb1=d1.sum(axis=0)
    return gW1,gb1,gW2,gb2
params=[W1,b1,W2,b2]
grads=analytic(*params)
eps=1e-6
for group,param in enumerate(params):
    for index in np.ndindex(param.shape):
        plus=[p.copy() for p in params]
        minus=[p.copy() for p in params]
        plus[group][index]+=eps
        minus[group][index]-=eps
        numeric=(forward_loss(*plus)-forward_loss(*minus))/(2*eps)
        assert np.isclose(numeric,grads[group][index],
                          rtol=1e-5,atol=1e-7)
assert all(a.shape==b.shape for a,b in zip(params,grads))
print("all", sum(p.size for p in params), "analytic gradients match finite differences")
print("gradient for W2:", grads[2].ravel().round(4))

# Output:
# all 9 analytic gradients match finite differences
# gradient for W2: [-0.193  -0.1448]`,
      walk: [
        { line: "d1=(d2@W2.T)*(1-A*A)", say: "Backpropagate through tanh, whose slope is $1 - \\tanh^2$." },
        { line: "numeric=(forward_loss(*plus)-forward_loss(*minus))/(2*eps)", say: "Numerical slope: nudge one weight up and down by $10^{-6}$." },
        { line: "assert np.isclose(numeric,grads[group][index],", say: "Every analytic gradient must match its numerical estimate." },
      ],
    },
    "In Python#0": {
      goal: "A neural network classifier in scikit-learn",
      code: r`import matplotlib.pyplot as plt
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

X, y = load_breast_cancer(return_X_y=True)          # 569 tumours, 30 measurements each
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)

net = make_pipeline(
    StandardScaler(),                                # networks need scaled inputs
    MLPClassifier(hidden_layer_sizes=(16, 8), activation="relu",
                  solver="adam", alpha=1e-4, early_stopping=True,
                  max_iter=500, random_state=0),
)
net.fit(X_train, y_train)
mlp = net[-1]
print("layers (in -> hidden -> out):", [w.shape for w in mlp.coefs_])
print("parameters:", sum(w.size for w in mlp.coefs_) + sum(b.size for b in mlp.intercepts_))
print("stopped after", mlp.n_iter_, "epochs")
print("test accuracy:", round(net.score(X_test, y_test), 3))

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(mlp.loss_curve_, label="training loss")
ax.plot(mlp.validation_scores_, label="validation accuracy")
ax.set(xlabel="epoch", title="MLP training")
ax.legend()
fig.tight_layout()
fig.savefig("mlp_loss.png")

# Output:
# layers (in -> hidden -> out): [(30, 16), (16, 8), (8, 1)]
# parameters: 641
# stopped after 77 epochs
# test accuracy: 0.937`,
      figure: { src: "/theory/figures/code/mlp_loss.svg", alt: "Training loss falls quickly while validation accuracy rises and levels off." },
      walk: [
        { line: "StandardScaler(),                                # networks need scaled inputs", say: "Unscaled inputs make some weights learn much faster than others." },
        { line: "MLPClassifier(hidden_layer_sizes=(16, 8), activation=\"relu\",", say: "Two hidden layers of 16 and 8 ReLU units." },
        { line: "solver=\"adam\", alpha=1e-4, early_stopping=True,", say: "Adam optimiser, a little weight decay (`alpha`), and stop when an internal 10% validation split stops improving." },
        { line: "print(\"parameters:\", sum(w.size for w in mlp.coefs_) + sum(b.size for b in mlp.intercepts_))", say: "641 parameters, matching the hand count above." },
      ],
    },
  },
};

/** Easy layer: Training Neural Networks. */
export const TRAIN_NN: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Training deep networks is about keeping signals a healthy size through many layers, taking sensible steps, and stopping the network from memorising.",
      examples: [
        {
          at: 1,
          kind: "idea",
          title: "Momentum as a rolling ball",
          blocks: [
            { p: "Plain gradient descent is a hiker who looks only at the slope under their feet: in a narrow valley they zig-zag from wall to wall. Momentum is a ball rolling down: side-to-side pushes cancel out, while the push along the valley adds up, so it speeds towards the bottom." },
          ],
        },
      ],
    },
    Optimisers: {
      plain: "SGD steps along the gradient. Momentum steps along an average of recent gradients. Adam also divides by the typical gradient size, so every parameter takes steps of similar size.",
      examples: [
        {
          title: "Momentum building up",
          blocks: [
            { p: "With a constant gradient $g = 1$ and $\\beta = 0.9$: $v = 1$, then $0.9 + 1 = 1.9$, then $1.71 + 1 = 2.71$, … approaching $1/(1 - 0.9) = 10$. On a steady slope momentum takes steps up to 10 times larger; when the gradient keeps flipping sign, the terms cancel instead." },
          ],
        },
      ],
    },
    "Worked example: Adam's first step": {
      plain: "Bias correction undoes the zero start, so Adam's first step has size close to the learning rate, whatever the size of the gradient.",
      code: [
        {
          goal: "Adam step by step",
          code: r`import numpy as np

def adam_steps(grads, lr=0.001, b1=0.9, b2=0.999, eps=1e-8):
    theta, m, v = 0.0, 0.0, 0.0
    for t, g in enumerate(grads, start=1):
        m = b1 * m + (1 - b1) * g          # running mean of gradients
        v = b2 * v + (1 - b2) * g * g      # running mean of squared gradients
        m_hat = m / (1 - b1 ** t)          # bias correction (m and v start at 0)
        v_hat = v / (1 - b2 ** t)
        step = lr * m_hat / (np.sqrt(v_hat) + eps)
        theta -= step
        print(f"t={t}: g={g:>6}  m={m:.4f}  v={v:.6f}  step={step:.6f}")
    return theta

adam_steps([4.0])                      # the worked example: the first step is about lr = 0.001
print("--- same direction, very different sizes ---")
adam_steps([4.0, 400.0, 0.04])         # the step stays near lr whatever the gradient's scale

# Output:
# t=1: g=   4.0  m=0.4000  v=0.016000  step=0.001000
# --- same direction, very different sizes ---
# t=1: g=   4.0  m=0.4000  v=0.016000  step=0.001000
# t=2: g= 400.0  m=40.3600  v=160.015984  step=0.000751
# t=3: g=  0.04  m=36.3280  v=159.855970  step=0.000580`,
          walk: [
            { line: "m_hat = m / (1 - b1 ** t)          # bias correction (m and v start at 0)", say: "At $t = 1$ this divides by 0.1, undoing the zero start." },
            { line: "step = lr * m_hat / (np.sqrt(v_hat) + eps)", say: "Mean gradient ÷ typical gradient size: a number near 1, times the learning rate." },
            { line: "adam_steps([4.0, 400.0, 0.04])         # the step stays near lr whatever the gradient's scale", say: "The gradient jumps by 100 times and then falls by 10,000 times, yet every step stays at or below 0.001." },
          ],
        },
      ],
    },
    "Initialisation and normalisation": {
      plain: "Start weights at the right size so signals neither fade nor explode through the layers; batch norm re-standardises each layer during training.",
      code: [
        {
          goal: "See activations vanish or explode with bad initialisation",
          code: r`import numpy as np

rng = np.random.default_rng(0)
x = rng.normal(size=(1000, 256))         # a batch of 1000 inputs, 256 features each

for name, std in [("too small (0.01)", 0.01), ("He: sqrt(2/n_in)", np.sqrt(2 / 256)), ("too large (0.2)", 0.2)]:
    a = x
    spreads = []
    for layer in range(10):              # 10 ReLU layers of width 256
        W = rng.normal(0, std, size=(256, 256))
        a = np.maximum(0, a @ W)
        spreads.append(a.std())
    print(f"{name:18s} activation spread after layers 1, 5, 10: "
          f"{spreads[0]:.3g}, {spreads[4]:.3g}, {spreads[9]:.3g}")

# Output:
# too small (0.01)   activation spread after layers 1, 5, 10: 0.094, 1.59e-05, 3.04e-10
# He: sqrt(2/n_in)   activation spread after layers 1, 5, 10: 0.83, 0.832, 0.772
# too large (0.2)    activation spread after layers 1, 5, 10: 1.87, 58.8, 3.47e+03`,
          walk: [
            { line: "for name, std in [(\"too small (0.01)\", 0.01), (\"He: sqrt(2/n_in)\", np.sqrt(2 / 256)), (\"too large (0.2)\", 0.2)]:", say: "Three weight sizes for the same 10-layer ReLU network." },
            { line: "a = np.maximum(0, a @ W)", say: "Pass the batch through one more layer." },
            { line: "print(f\"{name:18s} activation spread after layers 1, 5, 10: \"", say: "Too small: the spread falls to about $10^{-10}$. Too large: it grows to about 3,000. He initialisation stays near 0.8 throughout." },
          ],
        },
      ],
    },
    Regularisation: {
      examples: [
        {
          title: "Inverted dropout on four units",
          blocks: [
            { p: "Activations $(2, 4, 6, 8)$, dropout $p = 0.5$, random mask $(1, 0, 1, 0)$. Keep the survivors and scale them by $1/(1 - p) = 2$: $(4, 0, 12, 0)$. Each unit keeps the same expected value, so at test time you use all units unchanged." },
          ],
        },
      ],
    },
    "Textbook case: Recurrent Models, Embeddings, and Attention From First Principles": {
      plain: "An irrigation forecast used to build RNNs, LSTMs, embeddings and attention from scratch, with shapes written next to every equation.",
    },
    "3.21.1 Recurrent networks and gradients across time": {
      plain: "An RNN applies the same update at every time step. Influence from far back gets multiplied many times, so it shrinks (vanishing) or grows (exploding).",
      replace: {
        1: { p: "A simple recurrent neural network processes one observation $x_t$ at a time. With $h_{t-1} \\in \\mathbb R^h$ and $x_t \\in \\mathbb R^d$, set" },
        5: { p: "For a loss applied only at final step $T$, define $\\delta_t$ as the derivative of the loss with respect to preactivation $a_t$. Start at the final step by multiplying the derivative with respect to $h_T$ by $\\phi'(a_T)$. At an earlier step without a direct loss, $\\delta_t = (W_h^\\top\\delta_{t+1}) \\odot \\phi'(a_t)$. If a separate loss is attached at time $t$, its direct derivative with respect to $h_t$ is added to $W_h^\\top\\delta_{t+1}$ before multiplication by $\\phi'(a_t)$. The shared recurrent weight gradient is the sum over times, $\\nabla_{W_h}L = \\sum_t\\delta_t h_{t-1}^\\top$, whose shape is $h \\times h$. Likewise $\\nabla_{W_x}L = \\sum_t\\delta_t x_t^\\top$ has shape $h \\times d$. This explicit sum prevents a common mistake: applying a gradient from only the final use of a parameter that was reused $T$ times." },
        6: { p: "For a scalar linear recurrence $h_t = a\\,h_{t-1} + x_t$ with $h_0 = 0$, the contribution of $x_{T-k}$ to $h_T$ is $a^k$. To verify this, expand $h_T = x_T + a\\,x_{T-1} + a^2x_{T-2} + \\cdots$. Consequently $\\partial h_T/\\partial x_{T-k} = a^k$. When $|a| < 1$, the influence of distant measurements shrinks geometrically; when $|a| > 1$, it can grow. With $a = 0.5$, a measurement ten steps back carries factor $0.5^{10} = 1/1024 \\approx 0.000977$. With $a = 1.2$ the factor is $1.2^{10} \\approx 6.192$. Nonlinear networks use products of Jacobians rather than just one scalar power, but the example exposes the mechanism behind vanishing and exploding gradients. Gradient clipping can limit unusually large updates; it does not restore lost long-range information in a vanishing-gradient case." },
        9: { p: "**Worked exercise.** Suppose $h_0 = 0$, $a = 0.8$ and hourly inputs are $(1, 0, 2)$. Then $h_1 = 1$, $h_2 = 0.8$ and $h_3 = 0.8 \\times 0.8 + 2 = 2.64$. The derivative of $h_3$ with respect to $x_1$ is $a^2 = 0.64$, while the derivative with respect to $x_3$ is one. Reusing the same parameter $a$ across steps does not make all past measurements contribute equally." },
      },
    },
    "3.21.2 LSTM gates, cell state, and their limits": {
      plain: "An LSTM keeps a separate memory (the cell). The forget gate decides how much old memory to keep, the input gate how much new information to add, and the output gate how much to show.",
      replace: {
        3: { p: "Each gate has $h$ entries if hidden width is $h$. The four affine maps each take $d + h$ inputs and return $h$ outputs, giving $4h(d + h)$ weights and $4h$ biases in this basic single-layer definition. For $d = 3$, $h = 5$, that is $4 \\cdot 5 \\cdot (3 + 5) + 4 \\cdot 5 = 180$ learned scalars. Framework variants can package gates differently, alter bias accounting, or use projections, so state the specific architecture used in code. Sigmoid gates produce values between zero and one; the candidate $g$ can be negative or positive. A gate is a learned modulation of a signal, not a binary human-readable instruction." },
        4: { p: "In an illustrative scalar step with $c_{t-1} = 0.4$, $f_t = 0.8$, $i_t = 0.5$, $g_t = 0.6$ and $o_t = 0.75$, the new cell state is $0.8 \\times 0.4 + 0.5 \\times 0.6 = 0.62$. The visible hidden state is $0.75\\tanh(0.62) \\approx 0.414$. If the gates were held fixed while differentiating this step, $\\partial c_t/\\partial c_{t-1} = f_t = 0.8$. A product of such forget gates can preserve a path better than repeatedly multiplying a small unconstrained recurrent Jacobian. In an actual network the gates depend on previous hidden state, so this partial derivative is only one path through the full computation; an LSTM does **not** guarantee retention of arbitrarily long dependencies." },
        8: { p: "**Worked exercise.** Keep $c_{t-1} = 0.4$ and the candidate/input values 0.6 and 0.5, but change the forget gate from 0.8 to 0.1. The new cell state becomes $0.1 \\times 0.4 + 0.5 \\times 0.6 = 0.34$ instead of 0.62. The previous memory contributes 0.04 rather than 0.32. The output gate still controls how much of $\\tanh(c_t)$ is exposed as hidden state." },
      },
    },
    "3.21.3 Token embeddings and a contrastive training objective": {
      plain: "An embedding is a learned table: one vector per word. Training pushes the vectors of words seen together to have a large dot product, and random pairs a small one.",
      replace: {
        5: { p: "For a tiny worked case, let center vector $u = (1, 0)$, positive context $v_{pos} = (0.5, 0)$ and one negative vector $v_{neg} = (-0.5, 0)$. The positive dot product is 0.5 and the negative dot product is $-0.5$. Both required sigmoid terms evaluate to $\\sigma(0.5) \\approx 0.622459$. The total loss is $-2\\log 0.622459 \\approx 0.948154$. If the negative vector changed to $v_{neg} = (0.5, 0)$, the negative term becomes $-\\log\\sigma(-0.5) \\approx 0.974$, making the total loss larger. The example separates the objective's mathematics from any claim that a specific word is intrinsically similar to another." },
        6: { p: "The parameter gradient follows from two elementary derivatives. For a positive score $s = u^\\top v_{pos}$, $\\frac{d}{ds}[-\\log\\sigma(s)] = \\sigma(s) - 1$. For a negative score $r = u^\\top v_{neg}$, $\\frac{d}{dr}[-\\log\\sigma(-r)] = \\sigma(r)$. Therefore the gradient with respect to center vector $u$ is $(\\sigma(s) - 1)v_{pos} + \\sum_j\\sigma(r_j)v_{neg,j}$. In the toy case, $\\sigma(0.5) - 1 = -0.377541$ and $\\sigma(-0.5) = 0.377541$, so the first coordinate of the center gradient is $(-0.377541)(0.5) + (0.377541)(-0.5) = -0.377541$ and the second is zero. Gradient descent would increase the center's first coordinate here, improving the positive score and reducing the negative score. This one update does not explain every property of embeddings fitted on a large corpus." },
        9: { p: "**Worked exercise.** If the one positive dot product grows from 0.5 to 2 while the negative dot product remains $-0.5$, the positive loss falls from $-\\log\\sigma(0.5) \\approx 0.474$ to $-\\log\\sigma(2) \\approx 0.127$. The negative loss remains about 0.474, so the total falls to about 0.601. The model is being rewarded for distinguishing observed contexts from sampled negatives; this does not by itself certify useful ticket routing." },
      },
    },
    "3.21.4 Scaled dot-product attention and masks": {
      plain: "Each query scores every key, softmax turns the scores into weights, and the output is the weighted average of the values. A mask sets forbidden scores to −∞ so they get weight 0.",
      replace: {
        4: { p: "For two tokens let $Q = K = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$ and $V = \\begin{bmatrix} 4 & 0 \\\\ 0 & 8 \\end{bmatrix}$, with $d_k = 2$. Without a mask the first query has scaled scores $(1/\\sqrt2, 0)$. Its weights are $\\big(e^{1/\\sqrt2}/(e^{1/\\sqrt2} + 1),\\; 1/(e^{1/\\sqrt2} + 1)\\big) \\approx (0.66976, 0.33024)$. Its output is about $(2.679, 2.642)$. The second query gets the weights in reverse order and output approximately $(1.321, 5.358)$. These weighted combinations are not probabilities over defect outcomes; they are intermediate sequence representations." },
        9: { p: "The sensitivity of the weighted output can be derived without a full network. For attention weights $a_j = \\operatorname{softmax}(s)_j$ and output $o = \\sum_j a_jv_j$, the softmax Jacobian is $\\partial a_j/\\partial s_k = a_j(\\mathbf 1\\{j = k\\} - a_k)$. Differentiating $o$ and collecting terms gives $\\partial o/\\partial s_k = a_k(v_k - o)$, a vector with the width of $V$. If a value $v_k$ already equals the current output, a small change in its score changes the output little even when its attention weight is large. Thus an attention weight alone is not a complete explanation of how a value affects a later prediction; downstream transformations and other heads also matter." },
      },
    },
    "3.21.5 Encoder-decoder models and transformer training boundaries": {
      plain: "A transformer block is attention plus a small feed-forward network, each wrapped in a residual connection and normalisation. Attention cost grows with the square of the sequence length.",
      replace: {
        1: { p: "Transformer blocks typically combine multi-head attention with a positionwise feed-forward network, residual connections, and normalization. In a pre-normalization form, one schematic block is $H' = H + \\text{Attention}(\\text{Norm}(H))$ and $H_{out} = H' + \\text{FFN}(\\text{Norm}(H'))$. The residual path allows information and gradients to bypass some nonlinear transformations; normalization controls feature scale according to the architecture's definition. Training also specifies tokenization, input length, optimizer, loss masking on padding positions, and an explicit learning-rate schedule. Saying only “use a transformer” omits essential parts of an executable experiment." },
        3: { p: "For self-attention, the dense pairwise-score calculation costs on the order of $T^2d_k$ per head and an attention matrix can require $O(T^2)$ space. Projection and feed-forward costs also matter and can dominate in some regimes. Recurrent processing is sequential in $T$, while transformer training can calculate many token positions in parallel. Those are computational structures, not evidence that one architecture always forecasts water levels better. For an irrigation forecast with just 24 input hours, a seasonal baseline and simple lagged-feature model may be more accurate, cheaper, and easier to audit." },
      },
    },
    "Textbook case: Self-Attention as a Weighted Information Map": {
      plain: "A three-token attention calculation worked fully by hand, then checked in code.",
    },
    "3.22.1 Queries, keys, values, and shapes": {
      plain: "Queries ask, keys answer, values carry the content. Scores are $T \\times T$, and each row of weights sums to 1.",
    },
    "3.22.2 Work a three-token attention row": {
      plain: "Dot products, divide by $\\sqrt{d_k}$, mask, softmax, then average the values: always in that order.",
    },
    "3.22.3 Multi-head attention, cost, and limits": {
      plain: "Several heads look at the sequence in different ways; their outputs are joined. A head's pattern is not a proof of what the model reasons about.",
    },
    "3.22.4 Execute the attention calculation": {
      plain: "The code reproduces the hand calculation, including the causal mask.",
      examples: [
        {
          at: 1,
          title: "Answer to exercise (1)",
          blocks: [
            { p: "Query 2 is $(0, 1)$. Dot products with the keys: $[0, 1, 1]$, scaled $[0, 0.707, 0.707]$, weights $[0.198, 0.401, 0.401]$. It mixes values 2 and 3 most, giving output $(0.797, 0.802)$, the second row printed by the code." },
          ],
        },
      ],
    },
    "Textbook case: Convolution, Receptive Fields, and Image Evaluation": {
      plain: "Corrosion photos used to compute a convolution by hand, count parameters and output sizes, and plan an honest image evaluation.",
    },
    "3.24.1 A convolution is shared local computation": {
      plain: "A small filter slides over the image, computing the same weighted sum at every position. Parameters depend on the filter size and channels, not the image size.",
    },
    "3.24.2 Compute one filter output by hand": {
      plain: "Multiply the filter with each patch element by element and add up the results. Do it for every position to get the feature map.",
    },
    "3.24.3 Backpropagation and boundary behavior": {
      plain: "A shared weight's gradient adds up contributions from every position it touched. Augmentations must keep the label true.",
    },
    "3.24.4 Check the arithmetic and evaluate the real task": {
      plain: "Code checks the hand numbers. A real study must also report rare-positive performance on unseen equipment.",
      examples: [
        {
          at: 2,
          title: "Answer to exercise (1)",
          blocks: [
            { math: r`\left\lfloor \frac{32 + 0 - 5}{2} \right\rfloor + 1 = 13 + 1 = 14` },
            { p: "So the output is 14 × 14." },
          ],
        },
      ],
    },
    "Textbook case: Text Representations and Attention With Worked Calculations": {
      plain: "Helpdesk messages used to compare word counts, embeddings, RNNs and attention, with masks handled properly.",
    },
    "2.23.1 Tokenization is a measurable transformation": {
      plain: "Splitting text into tokens is a design choice that changes everything downstream. Word counts lose word order.",
      replace: {
        2: { p: "For a simple count example, `bus late late` maps to $(2, 1, 0)$ under vocabulary order `(late, bus, not)`, whereas `bus not late` maps to $(1, 1, 1)$. Their dot product is $2(1) + 1(1) + 0(1) = 3$; their cosine similarity is $3/(\\sqrt5\\sqrt3) \\approx 0.7746$. Cosine compares angles and is undefined for a zero vector unless a policy is specified. It is a geometric similarity, not a probability that two messages share a label." },
      },
    },
    "2.23.2 Embeddings and sequence shape": {
      plain: "Token IDs $(n, T)$ become vectors $(n, T, d)$. When averaging, ignore the padding positions.",
    },
    "2.23.3 Scaled dot-product attention step by step": {
      plain: "Two keys, two values: compute the scores, softmax and weighted average with real numbers.",
    },
    "2.23.4 Recurrence and attention solve different computational problems": {
      plain: "RNNs pass information step by step (slow for long sequences); attention compares every pair (cost grows as $T^2$).",
    },
    "2.23.5 Evaluate text models beyond one aggregate score": {
      plain: "Split by account and time, watch for near-duplicates, and test misspellings and new wording.",
    },
    "Textbook case: Reproducible Text Classification and Sequence Computation": {
      plain: "A facilities helpdesk router built from a count baseline up to embeddings, gated memory and attention.",
    },
    "2.24.1 A count-based model is a measurable baseline": {
      plain: "Always start with TF-IDF + logistic regression. A neural model has to beat it to be worth the cost.",
    },
    "2.24.2 Embedding lookup and masks as tensor contracts": {
      plain: "A mask marks real tokens. Use it in pooling and attention so padding changes nothing.",
    },
    "2.24.3 From recurrent updates to gated memory": {
      plain: "Gates multiply the old memory by a number between 0 and 1 and add new information, which helps memory survive many steps.",
    },
    "2.24.4 Attention, masking, and matrix shape": {
      plain: "Shapes: $Q, K: T \\times d_k$, $V: T \\times d_v$, weights $T \\times T$, output $T \\times d_v$.",
    },
    "2.24.5 Architecture and evaluation are independent choices": {
      plain: "Compare architectures on the same split and budget. A higher score shows an advantage on that split, not why.",
    },
    "2.24.6 Train and inspect a minimal learned token embedding": {
      plain: "In PyTorch an embedding is a trainable table; `padding_idx` keeps the padding row fixed at zero.",
    },
    "Textbook case: Image Models, Explanations, and Human Review": {
      plain: "Elevator inspection photos used to cover image labels, base rates, convolutions, transfer learning, explanations and human review.",
    },
    "3.23.1 Image labels, data splits, and the base-rate problem": {
      plain: "With rare defects, accuracy is misleading: predicting \"no defect\" always can score 98%. Report recall and precision, and split by elevator, not by photo.",
    },
    "3.23.2 Convolutions: tensor shapes, receptive fields, and gradients": {
      plain: "Filter parameters = height × width × input channels × output channels (+ biases). Each layer lets a unit see a bigger patch of the image.",
      replace: {
        2: { math: r`Y_{i,j} = \sum_{a=0}^{K_h-1}\sum_{b=0}^{K_w-1} W_{a,b}\,X_{i+a,\,j+b} + \text{bias}` },
        3: { p: "The same $W$ is used at every valid spatial position: this is **weight sharing**. A filter responding to an edge in one location can respond to a similar edge elsewhere, though boundary handling, pooling, and the surrounding network affect exact translation behavior. With $C$ input channels and $F$ output channels, a $K_h \\times K_w$ layer has $K_hK_wCF$ weights, plus $F$ biases if one bias is learned per output channel. For a 3 × 3 filter, $C = 3$ and $F = 16$, that is $3 \\cdot 3 \\cdot 3 \\cdot 16 = 432$ weights and 16 biases, totaling 448 learnable scalars. The filter weights do not multiply by the number of image positions." },
        5: { math: r`H_{out} = \left\lfloor \frac{H + 2P - D(K - 1) - 1}{S} \right\rfloor + 1` },
        6: { p: "The same expression holds for width with its own values. The effective kernel width is $D(K - 1) + 1$. Check that the numerator permits at least one valid placement. With $H = 10$, $K = 3$, $P = 0$, $D = 1$, $S = 1$, output height is 8; with $P = 1$ it becomes 10. With $H = 10$, $K = 3$, $P = 0$, $D = 1$, $S = 2$ it becomes $\\lfloor 7/2\\rfloor + 1 = 4$. Different libraries may describe “same” padding and corner behavior differently, especially with even filters or stride greater than one; inspect the exact implementation when deploying." },
        8: { p: "Use a 3 × 3 one-channel image with rows $(1, 2, 3)$, $(4, 5, 6)$, $(7, 8, 9)$ and filter $W$ with rows $(1, 0)$, $(0, -1)$, no bias. The upper-left 2 × 2 patch gives $1 \\cdot 1 + 2 \\cdot 0 + 4 \\cdot 0 + 5 \\cdot (-1) = -4$. The other three placements give $2 - 6 = -4$, $4 - 8 = -4$ and $5 - 9 = -4$. Thus the valid output is a 2 × 2 grid of $-4$ values. A nonlinear activation such as ReLU would change those outputs to zero; the numbers here are **pre-activation** values so the linear operation and its gradient can be inspected." },
        10: { math: r`\frac{\partial L}{\partial W_{a,b}} = \sum_{\text{valid } (i,j)} X_{i+a,\,j+b}` },
        15: { p: "Stacking layers expands a unit's **receptive field** in the input. Let receptive size $R_0 = 1$ and jump $J_0 = 1$. For layer $l$ with effective filter width $K_l$ and stride $S_l$, $R_l = R_{l-1} + (K_l - 1)J_{l-1}$ and $J_l = J_{l-1}S_l$. Two 3 × 3 stride-one convolutions yield $R_1 = 3$, $J_1 = 1$, then $R_2 = 5$. If the first has stride two, $R_1 = 3$, $J_1 = 2$, and the second 3 × 3 stride-one filter yields $R_2 = 7$. The theoretical field describes which pixels could affect an output; it does not imply each pixel actually has equal influence." },
      },
    },
    "3.23.3 Transfer learning, augmentation, and generalization tests": {
      plain: "Start from a pretrained model when data are few, augment only in ways that keep the label true, and test on whole unseen elevators.",
    },
    "3.23.4 Explanations, permutation tests, and causal limits": {
      plain: "Shuffle a feature and see how much the error rises: that measures how much the model relies on it, not what causes the outcome.",
      replace: {
        1: { p: "For a linear score $f(x) = b + w^\\top x$, $w_j$ is the model's change in raw score for one unit of $x_j$ when other inputs are held fixed. If features are standardized, a one-unit change in standardized $x_j$ corresponds to one fitted training standard deviation, not one original engineering unit. A coefficient is not a causal effect unless strong additional assumptions and a suitable design support that interpretation. Correlated features make a “change one while keeping all others fixed” comparison potentially unrealistic." },
      },
    },
    "3.23.5 Abstention, human decisions, monitoring, and documentation": {
      plain: "The model is one step in a pipeline: reject unreadable images, route uncertain cases to people, and monitor for changes.",
    },
  },
  code: {
    "3.21.1 Recurrent networks and gradients across time#0": {
      goal: "A linear recurrence and how fast old inputs fade",
      code: r`def linear_recurrence(inputs, carry=0.5, initial=0.0):
    states = []
    h = initial
    for value in inputs:
        h = carry*h + value
        states.append(h)
    return states


sequence = [2.0, 0.0, 1.0]
assert linear_recurrence(sequence, carry=0.5) == [2.0, 1.0, 1.5]
assert abs(0.5**10 - 1/1024) < 1e-12
assert 6.19 < 1.2**10 < 6.20

# Check an early-input derivative against a finite difference.
eps = 1e-5
later = [0.0]*10
plus = linear_recurrence([2.0+eps]+later)[-1]
minus = linear_recurrence([2.0-eps]+later)[-1]
assert abs((plus-minus)/(2*eps) - 0.5**10) < 1e-10
print("states for inputs [2, 0, 1]:", linear_recurrence(sequence, carry=0.5))
print("influence of an input 10 steps back, a = 0.5:", 0.5**10)
print("influence of an input 10 steps back, a = 1.2:", round(1.2**10, 3))

# Output:
# states for inputs [2, 0, 1]: [2.0, 1.0, 1.5]
# influence of an input 10 steps back, a = 0.5: 0.0009765625
# influence of an input 10 steps back, a = 1.2: 6.192`,
      walk: [
        { line: "h = carry*h + value", say: "The same update at every step: keep part of the old state, add the new input." },
        { line: "assert abs((plus-minus)/(2*eps) - 0.5**10) < 1e-10", say: "Finite-difference check: an input 10 steps back has influence $0.5^{10} \\approx 0.001$." },
      ],
    },
    "3.21.2 LSTM gates, cell state, and their limits#0": {
      goal: "One LSTM step",
      code: r`import math


def one_lstm_step(cell_before, forget, input_gate, candidate, output_gate):
    if not all(0 <= gate <= 1 for gate in (forget, input_gate, output_gate)):
        raise ValueError("Gate values must be in [0, 1]")
    if not -1 <= candidate <= 1:
        raise ValueError("A tanh candidate must be in [-1, 1]")
    cell = forget*cell_before + input_gate*candidate
    hidden = output_gate*math.tanh(cell)
    return cell, hidden


cell, hidden = one_lstm_step(0.4, 0.8, 0.5, 0.6, 0.75)
assert abs(cell-0.62) < 1e-12
assert abs(hidden-0.75*math.tanh(0.62)) < 1e-12
print("new cell state:", round(cell, 3), "| new hidden state:", round(hidden, 3))
print("with forget gate 0.1 instead:", round(one_lstm_step(0.4, 0.1, 0.5, 0.6, 0.75)[0], 3))

# Output:
# new cell state: 0.62 | new hidden state: 0.413
# with forget gate 0.1 instead: 0.34`,
      walk: [
        { line: "cell = forget*cell_before + input_gate*candidate", say: "Keep 80% of the old memory, add half of the new candidate." },
        { line: "hidden = output_gate*math.tanh(cell)", say: "Show part of the squashed memory as the hidden state." },
      ],
    },
    "3.21.3 Token embeddings and a contrastive training objective#0": {
      goal: "Negative-sampling loss for word embeddings",
      code: r`import math


def log_sigmoid(z):
    # -log(1+exp(-z)), evaluated without positive exponential overflow.
    return -max(0.0, -z)-math.log1p(math.exp(-abs(z)))


def negative_sampling_loss(center, positive, negatives):
    dot = lambda a, b: sum(x*y for x, y in zip(a, b))
    if len(center) != len(positive) or any(len(v) != len(center)
                                            for v in negatives):
        raise ValueError("All vectors need the same width")
    return -log_sigmoid(dot(center, positive)) - sum(
        log_sigmoid(-dot(center, negative)) for negative in negatives)


loss = negative_sampling_loss((1, 0), (0.5, 0), [(-0.5, 0)])
assert abs(loss-0.9481539684) < 1e-9
assert negative_sampling_loss((1, 0), (0.5, 0), [(0.5, 0)]) > loss
print("loss with a far negative:", round(loss, 4))
print("loss when the negative looks like the positive:", round(negative_sampling_loss((1, 0), (0.5, 0), [(0.5, 0)]), 4))

# Output:
# loss with a far negative: 0.9482
# loss when the negative looks like the positive: 1.4482`,
      walk: [
        { line: "return -log_sigmoid(dot(center, positive)) - sum(", say: "Reward a high dot product with the real context and a low one with each random negative." },
        { line: "assert negative_sampling_loss((1, 0), (0.5, 0), [(0.5, 0)]) > loss", say: "If the negative looks like the positive, the loss rises (0.95 → 1.45)." },
      ],
    },
    "3.21.4 Scaled dot-product attention and masks#0": {
      goal: "Attention with and without a causal mask, in plain Python",
      code: r`import math


def scaled_attention(queries, keys, values, causal=False):
    if not queries or not keys or len(keys) != len(values):
        raise ValueError("Need aligned keys and values")
    width = len(keys[0])
    if width == 0 or any(len(k) != width for k in keys):
        raise ValueError("Key width must be fixed and positive")
    if any(len(q) != width for q in queries):
        raise ValueError("Query and key widths must match")
    value_width = len(values[0])
    if not value_width or any(len(v) != value_width for v in values):
        raise ValueError("Value width must be fixed and positive")
    output, all_weights = [], []
    for i, q in enumerate(queries):
        allowed = [j for j in range(len(keys)) if not causal or j <= i]
        if not allowed:
            raise ValueError("A query has no allowed keys")
        scores = [sum(a*b for a, b in zip(q, keys[j]))/math.sqrt(width)
                  for j in allowed]
        shift = max(scores)
        terms = [math.exp(score-shift) for score in scores]
        denominator = sum(terms)
        weights = [term/denominator for term in terms]
        row = [0.0]*len(keys)
        for j, weight in zip(allowed, weights):
            row[j] = weight
        all_weights.append(row)
        output.append([sum(row[j]*values[j][col]
                           for j in range(len(keys)))
                       for col in range(value_width)])
    return output, all_weights


Q = [[1, 0], [0, 1]]
V = [[4, 0], [0, 8]]
full, full_weights = scaled_attention(Q, Q, V)
masked, causal_weights = scaled_attention(Q, Q, V, causal=True)
assert masked[0] == [4.0, 0.0]
assert causal_weights[0] == [1.0, 0.0]
assert abs(sum(full_weights[0])-1) < 1e-12
assert abs(full[0][0]-4*full_weights[0][0]) < 1e-12
print("full attention weights:", [[round(w, 3) for w in row] for row in full_weights])
print("full attention output:", [[round(v, 3) for v in row] for row in full])
print("causal weights:", [[round(w, 3) for w in row] for row in causal_weights])

# Output:
# full attention weights: [[0.67, 0.33], [0.33, 0.67]]
# full attention output: [[2.679, 2.642], [1.321, 5.358]]
# causal weights: [[1.0, 0.0], [0.33, 0.67]]`,
      walk: [
        { line: "allowed = [j for j in range(len(keys)) if not causal or j <= i]", say: "Causal mask: a position may look only at itself and earlier positions." },
        { line: "scores = [sum(a*b for a, b in zip(q, keys[j]))/math.sqrt(width)", say: "Score = query · key ÷ $\\sqrt{d_k}$." },
        { line: "weights = [term/denominator for term in terms]", say: "Softmax: weights sum to 1." },
      ],
    },
    "3.22.4 Execute the attention calculation#0": {
      goal: "Attention for three tokens with NumPy",
      code: r`import numpy as np

Q=np.array([[1.,0.],[0.,1.],[1.,1.]])
K=Q.copy()
V=np.array([[2.,0.],[0.,1.],[1.,1.]])
score=Q@K.T/np.sqrt(2)
def row_softmax(a):
    z=a-a.max(axis=-1,keepdims=True)
    e=np.exp(z)
    return e/e.sum(axis=-1,keepdims=True)
A=row_softmax(score)
O=A@V
assert A.shape==(3,3) and O.shape==(3,2)
assert np.allclose(A.sum(axis=1),1)
assert np.allclose(A[0],[.401,.198,.401],atol=.002)
assert np.allclose(O[0],[1.203,.599],atol=.003)
masked=score.copy()
masked[np.triu_indices(3,1)]=-np.inf
causal=row_softmax(masked)
assert np.allclose(causal[0],[1.,0.,0.])
assert np.isclose(causal[1,2],0)
print("attention weights:\n", A.round(3))
print("output:\n", O.round(3))
print("causal weights:\n", causal.round(3))

# Output:
# attention weights:
#  [[0.401 0.198 0.401]
#  [0.198 0.401 0.401]
#  [0.248 0.248 0.503]]
# output:
#  [[1.203 0.599]
#  [0.797 0.802]
#  [1.    0.752]]
# causal weights:
#  [[1.    0.    0.   ]
#  [0.33  0.67  0.   ]
#  [0.248 0.248 0.503]]`,
      walk: [
        { line: "score=Q@K.T/np.sqrt(2)", say: "All query–key scores at once: a 3 × 3 matrix." },
        { line: "masked[np.triu_indices(3,1)]=-np.inf", say: "Hide future positions with −∞; softmax turns them into weight 0." },
      ],
    },
    "3.24.4 Check the arithmetic and evaluate the real task#0": {
      goal: "A convolution by hand, output sizes and parameter counts",
      code: r`import numpy as np

image=np.array([[1.,2.,0.],[0.,1.,3.],[2.,1.,1.]])
kernel=np.array([[1.,-1.],[0.,2.]])
out=np.empty((2,2))
for row in range(2):
    for col in range(2):
        out[row,col]=np.sum(image[row:row+2,col:col+2]*kernel)
assert np.array_equal(out,np.array([[1.,8.],[1.,0.]]))
def out_length(length,kernel,pad,stride,dilation=1):
    return (length+2*pad-dilation*(kernel-1)-1)//stride+1
assert out_length(8,3,1,2)==4
assert 3*3*3*16+16==448
print("feature map:\n", out)
print("output length for 8 inputs, kernel 3, pad 1, stride 2:", out_length(8, 3, 1, 2))
print("parameters in a 3x3 layer, 3 -> 16 channels:", 3*3*3*16 + 16)

# Output:
# feature map:
#  [[1. 8.]
#  [1. 0.]]
# output length for 8 inputs, kernel 3, pad 1, stride 2: 4
# parameters in a 3x3 layer, 3 -> 16 channels: 448`,
      walk: [
        { line: "out[row,col]=np.sum(image[row:row+2,col:col+2]*kernel)", say: "Slide the 2 × 2 filter: multiply with each patch and add up." },
        { line: "return (length+2*pad-dilation*(kernel-1)-1)//stride+1", say: "The output-size formula." },
      ],
    },
    "2.23.2 Embeddings and sequence shape#0": {
      goal: "Average token vectors while ignoring padding",
      code: r`vectors = {'bus': (1.0,0.0), 'late': (0.0,2.0), '<pad>': (0.0,0.0)}
tokens = ['bus','late','<pad>','<pad>']
mask = [1,1,0,0]
count = sum(mask)
pooled = tuple(sum(vectors[t][j]*m for t,m in zip(tokens,mask))/count for j in range(2))
assert pooled == (0.5,1.0)
print("masked mean:", pooled, "| naive mean over all 4 slots would be (0.25, 0.5)")

# Output:
# masked mean: (0.5, 1.0) | naive mean over all 4 slots would be (0.25, 0.5)`,
      walk: [
        { line: "pooled = tuple(sum(vectors[t][j]*m for t,m in zip(tokens,mask))/count for j in range(2))", say: "Sum only real tokens and divide by their count (2), not by 4." },
      ],
    },
    "2.23.3 Scaled dot-product attention step by step#0": {
      goal: "One query, two keys",
      code: r`from math import exp, sqrt, isclose
score = 1/sqrt(2)
weight_1 = exp(score)/(exp(score)+1)
weight_2 = 1-weight_1
output = (2*weight_1,4*weight_2)
assert isclose(weight_1+weight_2,1)
assert 1.33 < output[0] < 1.35
assert 1.31 < output[1] < 1.33
print("weights:", round(weight_1, 4), round(weight_2, 4))
print("output:", tuple(round(v, 4) for v in output))

# Output:
# weights: 0.6698 0.3302
# output: (1.3395, 1.321)`,
      walk: [
        { line: "weight_1 = exp(score)/(exp(score)+1)", say: "Softmax of $(1/\\sqrt2, 0)$: about 0.67 and 0.33." },
        { line: "output = (2*weight_1,4*weight_2)", say: "Weighted average of the two values." },
      ],
    },
    "2.24.1 A count-based model is a measurable baseline#0": {
      goal: "TF-IDF plus logistic regression as a text baseline",
      code: r`from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

messages = ['lamp dark','light flickers','pipe leaks','tap dripping',
            'lamp not working','ceiling light dark','water pipe dripping','tap leaks']
labels = [0,0,1,1,0,0,1,1]
model = Pipeline([('text', TfidfVectorizer(ngram_range=(1,2))),
                  ('classifier', LogisticRegression(max_iter=300))])
model.fit(messages, labels)
score = model.predict_proba(['tap water leaking'])[0]
assert score.shape == (2,)
assert abs(score.sum()-1) < 1e-12
assert (score >= 0).all() and (score <= 1).all()
print("P(lighting), P(plumbing) for 'tap water leaking':", score.round(3))

# Output:
# P(lighting), P(plumbing) for 'tap water leaking': [0.412 0.588]`,
      walk: [
        { line: "model = Pipeline([('text', TfidfVectorizer(ngram_range=(1,2))),", say: "Turn each message into word and word-pair weights, then fit logistic regression." },
        { line: "score = model.predict_proba(['tap water leaking'])[0]", say: "A new message leans towards plumbing (0.59). With eight training messages this is a mechanics check, not a real accuracy." },
      ],
    },
    "2.24.3 From recurrent updates to gated memory#0": {
      goal: "One gated memory step",
      code: r`from math import tanh, isclose
old_cell, forget, add_gate, candidate, out_gate = 2.0, 0.9, 0.4, -0.5, 0.8
new_cell = forget*old_cell + add_gate*candidate
hidden = out_gate*tanh(new_cell)
assert isclose(new_cell, 1.6)
assert isclose(hidden, 0.8*tanh(1.6))
print("new cell:", round(new_cell, 3), "| hidden:", round(hidden, 3))

# Output:
# new cell: 1.6 | hidden: 0.737`,
      walk: [
        { line: "new_cell = forget*old_cell + add_gate*candidate", say: "$0.9 \\times 2 + 0.4 \\times (-0.5) = 1.6$." },
      ],
    },
    "2.24.6 Train and inspect a minimal learned token embedding#0": {
      goal: "A trainable embedding table in PyTorch",
      code: r`import torch

torch.manual_seed(7)
# 0 is padding; 1=lamp, 2=dark, 3=pipe, 4=leaks, 5=tap.
indices = torch.tensor([[1,2,0],[1,1,2],[3,4,0],[5,4,0]],dtype=torch.long)
labels = torch.tensor([0,0,1,1])
mask = (indices!=0).unsqueeze(-1)
embedding = torch.nn.Embedding(num_embeddings=6,embedding_dim=3,padding_idx=0)
head = torch.nn.Linear(3,2)
optimizer = torch.optim.SGD([*embedding.parameters(),*head.parameters()],lr=0.05)

vectors = embedding(indices)
assert vectors.shape == (4,3,3)
pooled = (vectors*mask).sum(dim=1)/mask.sum(dim=1).clamp_min(1)
logits = head(pooled)
assert logits.shape == (4,2)
loss = torch.nn.functional.cross_entropy(logits,labels)
optimizer.zero_grad()
loss.backward()
assert torch.all(embedding.weight.grad[0]==0)
assert torch.any(embedding.weight.grad[4]!=0)
optimizer.step()
assert torch.isfinite(loss)
print("loss before the step:", round(loss.item(), 4))
print("padding row gradient:", embedding.weight.grad[0].tolist())
print("'leaks' row gradient:", [round(v, 4) for v in embedding.weight.grad[4].tolist()])

# Output:
# loss before the step: 0.3935
# padding row gradient: [0.0, 0.0, 0.0]
# 'leaks' row gradient: [0.0446, 0.0499, 0.0165]`,
      walk: [
        { line: "embedding = torch.nn.Embedding(num_embeddings=6,embedding_dim=3,padding_idx=0)", say: "A 6 × 3 table of learnable vectors; row 0 is padding." },
        { line: "pooled = (vectors*mask).sum(dim=1)/mask.sum(dim=1).clamp_min(1)", say: "Masked average over real tokens." },
        { line: "loss.backward()", say: "PyTorch computes every gradient by backpropagation." },
        { line: "assert torch.all(embedding.weight.grad[0]==0)", say: "The padding row receives no gradient, so it never changes." },
      ],
    },
    "3.23.2 Convolutions: tensor shapes, receptive fields, and gradients#0": {
      goal: "Convolution and its filter gradient in plain Python",
      code: r`def valid_correlation(image, kernel):
    h, w = len(image), len(image[0])
    kh, kw = len(kernel), len(kernel[0])
    if (h < kh or w < kw or any(len(row) != w for row in image)
            or any(len(row) != kw for row in kernel)):
        raise ValueError("Need rectangular grids and a fitting kernel")
    return [[sum(image[i+a][j+b] * kernel[a][b]
                 for a in range(kh) for b in range(kw))
             for j in range(w-kw+1)] for i in range(h-kh+1)]


def sum_output_filter_gradient(image, kh, kw):
    h, w = len(image), len(image[0])
    return [[sum(image[i+a][j+b]
                 for i in range(h-kh+1) for j in range(w-kw+1))
             for b in range(kw)] for a in range(kh)]


pixels = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
filter_weights = [[1, 0], [0, -1]]
assert valid_correlation(pixels, filter_weights) == [[-4, -4], [-4, -4]]
assert sum_output_filter_gradient(pixels, 2, 2) == [[12, 16], [24, 28]]
print("feature map:", valid_correlation(pixels, filter_weights))
print("filter gradient:", sum_output_filter_gradient(pixels, 2, 2))

# Output:
# feature map: [[-4, -4], [-4, -4]]
# filter gradient: [[12, 16], [24, 28]]`,
      walk: [
        { line: "return [[sum(image[i+a][j+b] * kernel[a][b]", say: "The sliding weighted sum." },
        { line: "return [[sum(image[i+a][j+b]", say: "The filter gradient: add up the pixels each weight touched." },
      ],
    },
    "3.23.3 Transfer learning, augmentation, and generalization tests#0": {
      goal: "Hold out whole elevators, not single photos",
      code: r`def reserve_elevators(records, test_ids):
    # Each record is (elevator_id, capture_day, image_key, label).
    train = [row for row in records if row[0] not in test_ids]
    test = [row for row in records if row[0] in test_ids]
    if not train or not test:
        raise ValueError("Need records on both sides of the split")
    assert set(row[0] for row in train).isdisjoint(row[0] for row in test)
    return train, test


photos = [("lift-a", 1, "a1", 0), ("lift-a", 1, "a2", 0),
          ("lift-b", 2, "b1", 1), ("lift-c", 2, "c1", 0)]
development, evaluation = reserve_elevators(photos, {"lift-b"})
assert len(development) == 3 and len(evaluation) == 1
assert {row[0] for row in evaluation} == {"lift-b"}
print("development lifts:", sorted({r[0] for r in development}), "| evaluation lifts:", sorted({r[0] for r in evaluation}))

# Output:
# development lifts: ['lift-a', 'lift-c'] | evaluation lifts: ['lift-b']`,
      walk: [
        { line: "test = [row for row in records if row[0] in test_ids]", say: "Every photo of a held-out elevator goes to the test set." },
        { line: "assert set(row[0] for row in train).isdisjoint(row[0] for row in test)", say: "No elevator appears on both sides." },
      ],
    },
    "3.23.4 Explanations, permutation tests, and causal limits#0": {
      goal: "Permutation importance on a tiny rule",
      code: r`def mse(observed, predicted):
    if not observed or len(observed) != len(predicted):
        raise ValueError("Need matching nonempty arrays")
    return sum((a-b)**2 for a, b in zip(observed, predicted))/len(observed)


def rule(feature, constant):
    return feature + constant


rows = [(0, 1), (1, 1), (2, 1), (3, 1)]
outcomes = [1, 2, 3, 4]
base = mse(outcomes, [rule(*row) for row in rows])
shuffled_first = [(rows[3-i][0], row[1]) for i, row in enumerate(rows)]
after = mse(outcomes, [rule(*row) for row in shuffled_first])
assert base == 0 and after == 5
print("error before shuffling:", base, "| after shuffling the first feature:", after)

# Output:
# error before shuffling: 0.0 | after shuffling the first feature: 5.0`,
      walk: [
        { line: "shuffled_first = [(rows[3-i][0], row[1]) for i, row in enumerate(rows)]", say: "Reverse the first feature across rows; outcomes stay attached to the original rows." },
        { line: "assert base == 0 and after == 5", say: "Error jumps from 0 to 5: the rule relies on this feature." },
      ],
    },
    "In Python#0": {
      goal: "A full PyTorch training loop with dropout, batch norm and early stopping",
      code: r`import torch, torch.nn as nn
import matplotlib.pyplot as plt
from torch.utils.data import DataLoader, TensorDataset
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

torch.manual_seed(0)
X, y = load_breast_cancer(return_X_y=True)
X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.25, stratify=y, random_state=0)
scaler = StandardScaler().fit(X_tr)                    # fit scaling on training rows only
to_t = lambda a: torch.tensor(a, dtype=torch.float32)
train_loader = DataLoader(TensorDataset(to_t(scaler.transform(X_tr)), to_t(y_tr)), batch_size=32, shuffle=True)
Xv, yv = to_t(scaler.transform(X_val)), to_t(y_val)

model = nn.Sequential(
    nn.Linear(30, 64), nn.BatchNorm1d(64), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(64, 32), nn.ReLU(), nn.Dropout(0.3),
    nn.Linear(32, 1))
opt = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
loss_fn = nn.BCEWithLogitsLoss()                       # sigmoid + cross-entropy in one stable step

best, best_state, wait, history = float("inf"), None, 0, []
for epoch in range(200):
    model.train()                                      # dropout + batchnorm in training mode
    for xb, yb in train_loader:
        opt.zero_grad()                                # clear old gradients
        loss = loss_fn(model(xb).squeeze(1), yb)
        loss.backward()                                # backprop
        opt.step()                                     # AdamW update
    model.eval()                                       # dropout off for validation
    with torch.no_grad():
        val_loss = loss_fn(model(Xv).squeeze(1), yv).item()
    history.append(val_loss)
    if val_loss < best - 1e-4:                         # early stopping: keep the best epoch
        best, wait = val_loss, 0
        best_state = {k: v.clone() for k, v in model.state_dict().items()}
    else:
        wait += 1
        if wait == 10:
            break

model.load_state_dict(best_state)
model.eval()
with torch.no_grad():
    acc = ((model(Xv).squeeze(1) > 0).float() == yv).float().mean().item()
print(f"stopped at epoch {epoch}; best validation loss {best:.3f} at epoch {history.index(best)}")
print(f"validation accuracy: {acc:.3f}")

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(history)
ax.axvline(history.index(best), ls="--", c="grey")
ax.set(xlabel="epoch", ylabel="validation loss", title="Early stopping keeps the best epoch")
fig.tight_layout()
fig.savefig("torch_curves.png")

# Output:
# stopped at epoch 30; best validation loss 0.087 at epoch 20
# validation accuracy: 0.958`,
      figure: { src: "/theory/figures/code/torch_curves.svg", alt: "Validation loss falls, reaches its minimum around epoch 20, then flattens; a dashed line marks the best epoch." },
      walk: [
        { line: "scaler = StandardScaler().fit(X_tr)                    # fit scaling on training rows only", say: "Scale with training statistics only, to avoid leakage." },
        { line: "nn.Linear(30, 64), nn.BatchNorm1d(64), nn.ReLU(), nn.Dropout(0.3),", say: "Linear layer, batch norm, ReLU, then dropout 30%." },
        { line: "opt.zero_grad()                                # clear old gradients", say: "PyTorch adds gradients up, so clear them every batch." },
        { line: "loss.backward()                                # backprop", say: "Compute all gradients." },
        { line: "model.eval()                                       # dropout off for validation", say: "Switch dropout off and use batch norm's running averages." },
        { line: "if val_loss < best - 1e-4:                         # early stopping: keep the best epoch", say: "Remember the best weights; stop after 10 epochs without improvement." },
      ],
    },
  },
};
