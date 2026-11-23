export const story = String.raw`
## Asking for directions

You're lost in a big city and need to reach the railway station. You can ask people for directions, and you have a choice about how to do it.

**Option one:** before taking a single step, ask every one of the thousand people on the street, collect all their answers, and average them. You'll get an excellent direction, but it will take you all day before you move at all.

**Option two:** ask one random person, walk a bit in the direction they point, ask the next random person, walk a bit more. Some people will point slightly wrong, so your path will wobble. But you'll start moving immediately, and on average you'll head towards the station.

**Option three:** ask a small group, say twenty people, take their average direction, walk, then ask another twenty. Much more reliable than one person, much faster than a thousand.

These three options are exactly the three versions of gradient descent: **batch**, **stochastic** and **mini-batch**. They all go downhill on the loss. They differ in how many training examples they look at before each step.

## Batch gradient descent: everyone, every step

The plain gradient descent from the Foundations chapter computes the gradient using **every** training example, then takes one step. This is called **batch gradient descent**.

Its steps are accurate: the gradient is the true slope of the loss on the training data, so every step heads properly downhill, and the path is smooth.

The problem is cost. If you have ten million examples, each step needs a full pass through all ten million. Training might need thousands of steps. That's slow, and the whole dataset might not even fit in memory at once.

## Stochastic gradient descent: one example per step

**Stochastic gradient descent (SGD)** goes to the opposite extreme. It picks **one** random training example, computes the gradient using just that example, takes a step, and moves to the next example. ("Stochastic" just means "involving randomness".)

Each step is incredibly cheap, so the model starts improving after seeing just a few examples. But each step is noisy: one example can point quite far from the true downhill direction. The path zig-zags. Close to the bottom, it never quite settles; it keeps jittering around the minimum.

Surprisingly, that noise can be useful. On bumpy loss landscapes, the jitter can shake the model out of small dips (local minima) and flat areas that would trap smooth batch steps. And SGD is perfect for data that arrives as a stream, like clicks on a website, where you never have the full dataset at once.

## Mini-batch: the practical middle

In practice, almost everyone uses **mini-batch gradient descent**: compute the gradient on a small random group of examples, typically 32 to 512 of them, take a step, then use the next group.

It combines the best of both:

- The average over 32 or more examples is much less noisy than a single one.
- It's still far cheaper than the whole dataset.
- Computers, especially GPUs, are very good at doing the same calculation on a batch of examples all at once, so a batch of 64 takes barely longer than one example.

Some vocabulary you'll see everywhere:

- **Batch size**: how many examples per step.
- **Iteration** or **step**: one update of the weights, using one mini-batch.
- **Epoch**: one full pass through the training data. With 10,000 examples and a batch size of 100, one epoch is 100 steps.

Shuffle the data at the start of each epoch, so the mini-batches are different each time and don't follow some accidental order in the file, like all the expensive houses at the end.

## Why feature scaling changes the path

Imagine the loss landscape for a model with two weights. If both features are on similar scales, the landscape is a round bowl, and gradient descent walks straight to the bottom.

Now suppose one feature is income in rupees (values in the lakhs) and the other is age in years (values under 100). The loss becomes a long, narrow canyon: extremely steep across the income direction, nearly flat along the age direction. Gradient descent bounces from one canyon wall to the other while creeping slowly along the floor. A step size small enough not to bounce out is far too small to make progress along the canyon.

**Standardising** the features turns the canyon back into a round bowl, and the same algorithm suddenly converges in a fraction of the steps. This is one of the most practical lessons in all of optimisation, and you can feel it yourself in the "Canyon run" level of the Skier game.

## How big can a step be?

There's a limit to the learning rate, and it depends on how sharply the loss curves. Think of a valley shaped like a U. In a narrow, steep U, even a moderate step overshoots to the far side. In a wide, gentle U, you can take big steps safely.

For a simple bowl, there's an exact rule: if the step size is more than 2 divided by the curvature of the steepest direction, every step overshoots by more than the last and training explodes. The sharpest direction sets the speed limit for every direction, which is another way of seeing why narrow canyons make training slow.

## Smarter optimisers

Researchers have improved on plain mini-batch gradient descent in a few important ways:

- **Momentum**: keep part of the previous step's movement, like a ball rolling downhill. It smooths out zig-zags and rolls through small bumps.
- **Adaptive step sizes**: methods like RMSProp and **Adam** give each weight its own step size, smaller for weights whose gradients are large or jumpy and larger for weights that rarely change. Adam, which combines momentum with adaptive step sizes, is the default choice for most neural networks today.
- **Learning rate schedules**: start with bigger steps for fast progress, then shrink them to settle precisely at the bottom.

## What to remember

Batch gradient descent uses all the data for each step: accurate but slow. Stochastic gradient descent uses one example per step: cheap and noisy, and the noise can help escape small dips. Mini-batch, with groups of 32 to 512 examples, is the practical middle and what almost everyone uses. Scaling features turns a narrow canyon into a round bowl, and the steepest direction sets the speed limit for the learning rate. Momentum and Adam build on these ideas.
`;
