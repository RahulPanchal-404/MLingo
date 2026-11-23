export const story = String.raw`
## Learning to throw darts

The first time you throw a dart, it lands nowhere near the bullseye. Maybe it hits the top-left of the board. What do you do with the next throw?

You don't throw randomly. You look at where the last dart landed, notice it was too high and too far left, and adjust: aim a little lower, a little to the right. The next dart lands closer. You look again, adjust again. After twenty or thirty throws, your darts cluster near the middle.

Notice what you did *not* do. You didn't work out the physics of the throw. You didn't calculate the perfect angle in advance. You simply repeated a small loop: **throw, see how far off you were, adjust a little, throw again**. That loop is exactly how a machine learning model learns. This lesson walks through it step by step.

## Starting with a model that knows nothing

Let's use a real example. You want to predict a delivery rider's monthly earnings from the number of deliveries they make. You guess the relationship is roughly a straight line:

earnings = w × deliveries + b

Here w and b are the model's **parameters**, its knobs. w says how many rupees each delivery adds. b is a base amount everyone gets, whatever the number of deliveries. If we knew the right w and b, we could predict anyone's earnings.

But we don't know them. So training starts with a guess, often w = 0 and b = 0, or small random numbers. With w = 0 and b = 0, the model predicts ₹0 for everyone. It's a terrible model. That's fine. Every model starts terrible. What matters is the process that makes it better.

## The learning loop

Training is a loop with four steps, repeated many times.

### Step 1: Predict

Take the training examples and let the current model make its predictions. Suppose one rider made 200 deliveries and earned ₹18,000. With w = 0 and b = 0, the model predicts 0 × 200 + 0 = ₹0.

### Step 2: Compare

Compare each prediction with the real answer. The difference is the **error**. Here the prediction is ₹18,000 too low.

### Step 3: Measure the total damage

One rider isn't enough to judge the model. We combine the errors from every training example into a single number that says "how wrong is the model overall?" That number is called the **loss**. A big loss means the model is bad; a loss of zero means every prediction is perfect. The next lesson is all about how to calculate it.

### Step 4: Adjust

Now the clever part. We work out how the loss would change if we nudged each knob a tiny bit. If increasing w would lower the loss, we increase w a little. If increasing b would raise the loss, we decrease b a little. The tool that tells us the direction is the **gradient**, which you met in the Before-you-start lessons. Then we go back to step 1 with the new knob settings.

Each trip around this loop is called a **training step**. One complete pass through all the training examples is called an **epoch**. A model might train for hundreds or thousands of epochs, and the loss usually drops quickly at first, then more and more slowly as the model gets close to its best.

## Watching it improve

Imagine the first few steps for our delivery model:

| Step | w (₹ per delivery) | b (₹ base) | Typical error |
| --- | --- | --- | --- |
| Start | 0 | 0 | very large |
| After a few steps | 40 | 900 | still large |
| After many steps | 78 | 2,100 | small |
| Near the end | 80 | 2,000 | tiny |

The model never jumps straight to the answer. It creeps towards it, a small step each time, just like your darts. Eventually, the adjustments become so small that the knobs barely change. We say the model has **converged**.

## Why small steps?

You might wonder why we don't just make one big correction. The reason is that the gradient only tells you which way is downhill **right where you're standing**. Further away, the ground may slope differently. Take a huge step and you might overshoot the bottom of the valley and land higher up on the other side. Take small steps and recheck the slope each time, and you'll reliably work your way down. How big each step should be is controlled by the **learning rate**, which has its own lesson later in this chapter.

## Parameters are what the model learned

When training finishes, the knob values **are** the model. For our delivery example, w = 80 and b = 2,000 mean: "each delivery is worth about ₹80, plus a base of about ₹2,000". Everything the model learned from thousands of examples has been squeezed into those numbers.

This is true of much bigger models too. A modern image or language model is the same idea with millions or billions of knobs instead of two. Training is the same loop: predict, compare, measure, adjust.

## Parameters versus hyperparameters

There's one more word you'll hear a lot. **Parameters** are the knobs the model learns by itself during training, like w and b. **Hyperparameters** are the settings *you* choose before training starts, such as how big each step should be or how many epochs to train for. The model never changes its hyperparameters. Choosing good ones is part of your job, and you'll learn how to do it properly in later chapters.

## What to remember

A model learns by repeating a simple loop: make predictions, compare them with the real answers, combine the errors into one loss number, and nudge every parameter in the direction that lowers the loss. Small, repeated steps make it steadily less wrong until it converges. The learned parameter values are the model; the settings you choose beforehand are hyperparameters.
`;
