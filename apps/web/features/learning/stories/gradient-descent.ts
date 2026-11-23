export const story = String.raw`
## Finding the lowest point in a dark room

Imagine you're dropped into a large, completely dark room with a bumpy floor, like a giant bowl. Somewhere in the room is the lowest point, and that's where you need to be. You have no torch and no map. All you can do is stand still and feel which way the floor tilts under your feet.

What would you do? You'd feel the tilt, take a small step in the downhill direction, stop, feel again, and take another step. Step by step, always going downhill, you'd end up at the bottom of the bowl.

That's the whole algorithm. It's called **gradient descent**, and it's how almost every machine learning model in the world is trained, from a simple straight line to a large language model. The rest of this lesson just makes each part of that dark-room story precise.

## What the "room" is

In the last lesson, you learned that the **loss** is a single number that says how wrong a model is. The loss depends on the model's parameters. Change the parameters, and the loss changes.

Picture a model with just one parameter, a weight w. For every possible value of w, there's a loss. Plot loss against w and you get a curve, often shaped like a U. The bottom of the U is the value of w where the model is least wrong. That's what we want.

With two parameters, the curve becomes a surface, like a real valley in the hills. With a million parameters, it's a landscape we can't draw, but the idea is identical. The "dark room" is this **loss landscape**, and your position in it is the current set of parameters.

## Feeling the slope

Standing at some value of w, we need to know which way is downhill. That's what the **slope**, or **derivative**, tells us:

- If the slope is **positive**, the loss goes up as w increases. Downhill is towards smaller w. So we **decrease** w.
- If the slope is **negative**, the loss goes down as w increases. Downhill is towards larger w. So we **increase** w.
- If the slope is **zero**, the ground is flat. We're at the bottom (or at least a flat spot).

Notice the pattern: we always move in the **opposite direction** to the slope. With many parameters, the list of all the slopes is the **gradient**, and we move opposite to the gradient. That's where the name comes from: gradient *descent*, going down the gradient.

## The update rule

Every step of gradient descent uses the same rule:

w_new = w_old − α × slope

α ("alpha") is the **learning rate**, a small positive number that controls how big each step is. The minus sign is what makes us go downhill.

Let's do one step by hand. Suppose:

- the current weight is w = 1.5,
- the slope of the loss at that point is +4.0,
- the learning rate is α = 0.1.

Then: w_new = 1.5 − 0.1 × 4.0 = 1.5 − 0.4 = **1.1**.

The slope was positive, so we moved to a smaller w, downhill. Next, we'd compute the slope again at w = 1.1, and take another step. And again. And again.

## Why the steps shrink on their own

Here's a beautiful detail. The step size is learning rate × slope. Far from the bottom, the valley is steep, so the slope is big and the steps are big. As you get close to the bottom, the valley flattens, the slope gets smaller, and the steps get smaller automatically. By the time you're at the bottom, the slope is nearly zero and you barely move.

So gradient descent naturally rushes when it's far away and slows down carefully as it arrives, without anyone telling it to. That's why the loss curve of a training run usually drops steeply at first and then flattens out.

## A full run, step by step

Let's watch a tiny example. The loss is L(w) = (w − 3)², a simple valley with its lowest point at w = 3. Its slope is 2(w − 3). We start at w = 0 with learning rate 0.1.

| Step | w | Slope 2(w − 3) | Loss (w − 3)² |
| --- | --- | --- | --- |
| 0 | 0.00 | −6.00 | 9.00 |
| 1 | 0.60 | −4.80 | 5.76 |
| 2 | 1.08 | −3.84 | 3.69 |
| 3 | 1.46 | −3.07 | 2.36 |
| 10 | 2.68 | −0.64 | 0.10 |
| 30 | 2.996 | −0.007 | 0.00001 |

Each step closes 20% of the remaining gap to 3. The model never jumps to the answer, and it never needs to know where the answer is. It just keeps going downhill.

## When the floor is bumpy

Real loss landscapes aren't always one perfect bowl. Some have several dips. Gradient descent can walk into a small dip and stop there, because the ground is flat in every direction, even though a deeper valley exists elsewhere. Such a dip is called a **local minimum**; the deepest point overall is the **global minimum**.

For the simple models in the early chapters, like linear and logistic regression, this doesn't happen: their loss is a single smooth bowl, so gradient descent always finds the best answer. For neural networks, the landscape is bumpy, and tricks like **momentum** (carrying some speed from the previous step to roll through small dips) help. You can feel this yourself in the Skier game.

## Using a little data at a time

Computing the exact slope means looking at every training example, which is slow when there are millions. So in practice, models often estimate the slope from a small random handful of examples, called a **mini-batch**, take a step, then grab another handful. This is **stochastic gradient descent** (SGD). The steps are a bit noisy, but they're far cheaper, and the noise even helps escape small dips.

## What to remember

Gradient descent finds good parameters by repeatedly feeling the slope of the loss and stepping the opposite way: w ← w − α × slope. Steps are automatically large where the loss is steep and small near the bottom. For simple models it always reaches the best answer; for bumpy landscapes, tricks like momentum help. In the next lesson, you'll see why the learning rate α can make or break the whole process.
`;
