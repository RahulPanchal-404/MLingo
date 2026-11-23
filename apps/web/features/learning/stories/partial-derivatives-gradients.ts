export const story = String.raw`
## Making the perfect cup of chai

Your grandmother makes the best chai in the family, and you're trying to copy it. You can change two things: how much sugar you add and how long you let it boil. Each time you make a cup, she tastes it and gives it a score for how far it is from perfect. Zero means perfect. Higher means worse.

You make a cup with 2 spoons of sugar and 4 minutes of boiling. She says 6 out of 10 wrong. Now what? You have two knobs to turn, and you need to know which way to turn each one.

A sensible plan is to test the knobs **one at a time**. Keep the boiling time fixed at 4 minutes, and try a little more sugar. If the score gets better, more sugar helps. Then put the sugar back, keep it fixed, and try boiling a little longer. Now you know how each knob, on its own, affects the taste.

That simple idea, changing one thing while freezing everything else, is called a **partial derivative**. When you collect the result for every knob into one list, you get the **gradient**. Together they tell a model with thousands of knobs exactly how to improve.

## From one knob to many

In the last lesson the foggy hillside had only one direction: left or right. The derivative told us which way was downhill.

Real models have many knobs. A model predicting house prices might have one weight for size, one for number of bedrooms, one for distance to the metro, one for the age of the building, and a bias on top. A neural network can have millions. The error of the model depends on all of them at once.

So the hillside is no longer a curve. With two knobs it's a landscape, like a real valley with hills on every side. With a million knobs it's a landscape we can't picture, but the maths works the same way. At any point, we need to know which direction is downhill, and now "direction" means a combination of moves on every knob.

## Partial derivatives: one knob at a time

A **partial derivative** measures how the output changes when you nudge **one** input and hold all the others still. It's written with a curly d, ∂, to remind you that the other inputs are frozen:

∂L/∂w₁ is read "the partial derivative of L with respect to w₁".

Let's take a small example that we can do by hand. Suppose the chai's "wrongness" depends on sugar s and boiling time t like this:

L(s, t) = (s − 3)² + (t − 5)²

The perfect cup is clearly 3 spoons and 5 minutes, where both brackets are zero. But pretend we don't know that and let the partial derivatives guide us.

- Freeze t and look only at s. The second bracket is now just a fixed number, so its slope is zero. The first bracket is a square, so ∂L/∂s = 2(s − 3).
- Freeze s and look only at t. By the same logic, ∂L/∂t = 2(t − 5).

At our first attempt, s = 2 and t = 4:

- ∂L/∂s = 2(2 − 3) = −2. Negative: adding sugar reduces the error. Add sugar.
- ∂L/∂t = 2(4 − 5) = −2. Negative: boiling longer reduces the error. Boil longer.

Each partial derivative is a little report from one knob: "turn me this way, and here's how much it matters."

## The gradient: all the reports in one list

Now stack all the partial derivatives into a single vector. That vector is called the **gradient**, written with an upside-down triangle, ∇ ("nabla"):

∇L = (∂L/∂s, ∂L/∂t) = (−2, −2)

The gradient has a beautiful property: as a direction, it points the way the error **increases fastest**. It's the steepest uphill direction on the landscape. So if we want to go downhill as fast as possible, we walk the **opposite** way, −∇L.

The length of the gradient also matters. A long gradient means the ground is steep and we're probably far from the bottom. A gradient of all zeros means the ground is flat in every direction, which is what happens at the bottom of the valley.

## The update rule that trains almost every model

Here's the step every model takes, over and over:

new knobs = old knobs − (step size) × gradient

Written with symbols:

θ ← θ − η ∇L

θ ("theta") stands for all the knobs together. η ("eta") is the **learning rate**, a small number that decides how big each step is. The arrow means "replace with".

Let's do it for the chai with a step size of η = 0.25:

- Sugar: 2 − 0.25 × (−2) = 2.5
- Boiling: 4 − 0.25 × (−2) = 4.5

The error was (2 − 3)² + (4 − 5)² = 2. Now it's (2.5 − 3)² + (4.5 − 5)² = 0.5. One step cut the error to a quarter. Repeat it a few more times and you'll land on 3 spoons and 5 minutes without ever being told the answer.

This process is called **gradient descent**, and you'll study it in depth in the Foundations chapter. For now, the important thing is that the gradient is just a list of partial derivatives, and the update simply walks against it.

## How the gradient looks for a real model

For linear regression with mean squared error, the formula for the gradient is short:

∂L/∂w = (2/n) × Xᵀ(Xw − y)

Don't let it scare you. Read it from the inside out:

- Xw is the model's predictions for every example.
- Xw − y is how wrong each prediction is.
- Xᵀ (the data matrix, flipped) multiplies each error by the feature values that caused it and adds them up, one total per weight.
- 2/n averages over the n examples.

So the gradient for each weight is roughly "the average of error times feature". If a feature is large whenever the model overshoots, the gradient says: shrink that weight.

## Why one-at-a-time is not a weakness

You might worry that measuring one knob at a time misses how knobs interact. For a single tiny step, it doesn't: when the step is small enough, the effects of the knobs simply add up. That's why we take small steps and recompute the gradient after each one. The landscape can curve, but over a short distance it's close to flat, and the gradient describes it accurately.

## What to remember

A partial derivative tells you how the output changes when you nudge one input and freeze all the others. The gradient puts every partial derivative into one vector, and that vector points uphill. Training takes small steps in the opposite direction: θ ← θ − η∇L. Whether a model has two knobs, like the chai, or two hundred million, like a large neural network, this one rule is how it learns.
`;
