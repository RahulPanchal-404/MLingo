export const story = String.raw`
## Sorting the post

Imagine working at a big post office. Letters arrive in a huge pile, and each must go into one of several bins: Delhi, Mumbai, Chennai, Kolkata or Bengaluru. This isn't a yes-or-no question anymore. Each letter has exactly one correct bin out of five.

Logistic regression, which you met earlier, is built for two choices: spam or not, fraud or not. Most real problems have more: which digit is in this photo (10 choices), which language is this sentence (dozens), which product category is this item (hundreds). This page is about how to extend the two-class idea to many classes, and the key tool is the **softmax** function.

## The quick hack: one against the rest

The simplest approach reuses what we already have. Train one yes/no classifier for each class:

- Model 1: "Is it Delhi, or something else?"
- Model 2: "Is it Mumbai, or something else?"
- … and so on, one model per city.

For a new letter, ask all five models and pick the one that's most confident. This is called **one-vs-rest**. It works, and it's what some libraries do behind the scenes. But it has awkward flaws. Each model was trained separately, so their confidence scores aren't on a common scale, and their "probabilities" don't add up to 1. One letter might get 80% from the Delhi model and 70% from the Mumbai model, which makes no sense as probabilities for a single letter.

## A better idea: one score per class, trained together

Instead of five separate models, build one model that gives each class a **score** at the same time. Each class gets its own set of weights, and its score is the familiar weighted sum of the features:

score for Delhi = w_Delhi · x + b_Delhi, and the same for every other city.

A higher score means the model thinks that class is more likely. Scores can be any number: 3.2 for Delhi, 1.1 for Mumbai, −0.5 for Chennai. We need to turn them into proper probabilities: each between 0 and 1, all adding up to exactly 1.

## Softmax: turning scores into probabilities

**Softmax** does that in two steps:

- **Make every score positive** by raising e to the power of it: e^score. Big scores become very big, small or negative scores become small positive numbers.
- **Divide each by the total**, so they add up to 1.

Let's try it with three classes and scores 2, 1 and 0:

- e² ≈ 7.39, e¹ ≈ 2.72, e⁰ = 1. Total ≈ 11.11.
- Probabilities: 7.39 ÷ 11.11 ≈ **0.67**, 2.72 ÷ 11.11 ≈ **0.24**, 1 ÷ 11.11 ≈ **0.09**.

They add up to 1, and the order of the scores is kept: the highest score gets the highest probability. Notice something else: a difference of just 1 in the scores became a big gap in probabilities, 0.67 against 0.24. Softmax exaggerates differences, which is why it's called a "soft" version of picking the maximum: it leans strongly towards the top class without completely ignoring the others.

One useful fact: adding the same number to every score doesn't change the probabilities at all. Only the **differences** between scores matter. Software uses this to avoid huge numbers by subtracting the largest score first.

And here's a satisfying connection: with exactly two classes, softmax turns into the sigmoid function from logistic regression. Multiclass softmax is the natural big brother of logistic regression.

## Training: categorical cross-entropy

To train the model, we need a loss. The idea is the same as log loss for two classes: look at the probability the model gave to the **correct** class, and punish it if that probability is low.

loss = −log(probability given to the correct class)

- The letter really was for Delhi, and the model gave Delhi 0.9: loss ≈ 0.11. Small.
- It gave Delhi only 0.1: loss ≈ 2.30. Large.
- It gave Delhi 0.001: loss ≈ 6.9. Very large: confident and wrong.

This is called **categorical cross-entropy**. Averaged over all training examples, it's what the model minimises. It only cares about the probability of the right answer, but because all probabilities must add up to 1, raising the right one automatically pushes the wrong ones down.

## A beautifully simple gradient

When you work out the gradient of softmax with cross-entropy, a lot of messy terms cancel, and you're left with something remarkably simple. For each class, the gradient of the loss with respect to its score is:

predicted probability − true answer

where the true answer is 1 for the correct class and 0 for the others. If the model says Delhi 0.7 and Delhi is correct, the gradient for Delhi's score is 0.7 − 1 = −0.3: push Delhi's score up. If it says Mumbai 0.2 and Mumbai is wrong, the gradient is 0.2 − 0 = 0.2: push Mumbai's score down. It's exactly the "prediction minus truth" pattern you saw for linear and logistic regression.

## Where you'll meet softmax

- **Multinomial logistic regression**: softmax on top of a linear model, the standard multiclass version of logistic regression.
- **Neural networks**: almost every classification network ends with a softmax layer, from digit recognisers to image classifiers.
- **Language models**: predicting the next word is a classification over tens of thousands of possible words, and it's done with softmax.

## What to remember

For more than two classes, give each class its own score, a weighted sum of the features. Softmax turns the scores into probabilities by exponentiating them and dividing by the total, so they're positive, add up to 1 and keep the scores' order; only differences between scores matter, and with two classes it becomes the sigmoid. Training minimises categorical cross-entropy, −log of the probability of the correct class, and its gradient is simply predicted probability minus truth.
`;
