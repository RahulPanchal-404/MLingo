export const story = String.raw`
## Parking a car

Think about parking a car in a tight spot. If you press the accelerator gently, you creep forward a few centimetres at a time. It's safe, but painfully slow, and the people waiting behind you start honking. If you press hard, you shoot forward, overshoot the spot, slam the brakes, reverse too fast, overshoot again, and end up swinging back and forth while everyone watches.

The skill is in the right pressure: strong enough to make progress, gentle enough to stop where you want. Gradient descent has exactly this problem, and its accelerator pedal is called the **learning rate**.

## Where the learning rate lives

In the last lesson, every gradient descent step used this rule:

w_new = w_old − α × slope

The slope tells us which direction is downhill. The **learning rate**, α, decides **how far** to step in that direction. It's a small positive number that you choose before training starts, which makes it a **hyperparameter**. The model never learns it by itself.

Changing α doesn't change where the bottom of the valley is. It only changes how you travel there, and whether you arrive at all.

## Too small: safe but slow

Let's use the same simple valley as before, L(w) = (w − 3)², with its bottom at w = 3. Its slope is 2(w − 3), and we start at w = 0.

With α = 0.01, the first step moves w from 0 to just 0.06. Each step closes only 2% of the remaining gap. After 100 steps, w has only reached about 2.6. The model is heading in the right direction, but training takes ages. With a real model and real data, "ages" can mean hours of wasted computer time, or a model that stops training before it ever gets good.

The giveaway on a loss chart: the loss goes down, but in a long, slow, gentle slope that never seems to flatten out.

## Just right: fast and steady

With α = 0.1, each step closes 20% of the gap. After about 30 steps, w is within 0.004 of the bottom. The loss drops quickly at first and then levels off neatly. This is what a healthy training run looks like.

## Too big: overshooting

Now try α = 0.9. The slope at w = 0 is −6, so the step is 0.9 × 6 = 5.4. We jump from w = 0 straight past the bottom to w = 5.4. Now we're on the other side of the valley. The slope there is +4.8, so we jump back, to about 1.08. Then back to about 4.5. Each jump overshoots, but each one is a little smaller, so we zig-zag our way towards the bottom. It works, but it's wasteful, like the car swinging back and forth.

## Far too big: blowing up

Finally, α = 1.1. From w = 0, the step is 1.1 × 6 = 6.6, landing at w = 6.6. That's 3.6 away from the bottom, further than where we started! Now the slope is bigger, so the next jump is even bigger, landing at about −1.32, which is 4.32 away. Every jump overshoots by more than the last.

The loss gets bigger and bigger until the computer can't even represent the numbers and they turn into "infinity" or "NaN" (not a number). This is called **divergence**, and it's one of the most common ways training fails. If your loss suddenly shoots up and turns into NaN, the first thing to check is the learning rate.

## Why the right value depends on the valley

There's no single "correct" learning rate. It depends on how steep the loss landscape is. In a steep, narrow valley, even a medium step overshoots. In a wide, gentle valley, you can take big steps safely.

For the simple valley (w − 3)², any learning rate below 1 eventually reaches the bottom, and anything above 1 blows up. A steeper valley would have a lower limit. This is also why **feature scaling** matters so much: if one feature is measured in thousands and another in single digits, the landscape becomes a long, narrow canyon, steep in one direction and nearly flat in the other. No single learning rate suits both directions. Standardising the features turns the canyon into a round bowl where one learning rate works everywhere.

## How people choose it in practice

There's no magic formula, but there are reliable habits:

- **Start with a common default**, like 0.01 or 0.001, depending on the model and optimiser.
- **Try values spread out by factors of 10**: 0.0001, 0.001, 0.01, 0.1, 1. Learning rates vary over a huge range, so equal steps like 0.1, 0.2, 0.3 miss most of the interesting values.
- **Watch the loss curve.** Smooth drop and flatten: good. Slow crawl: raise it. Zig-zag or explosion: lower it.
- **Lower it over time.** Many training runs start with a larger learning rate to make fast progress, then shrink it as training goes on to settle precisely at the bottom. This is called a **learning rate schedule**.
- **Use adaptive optimisers.** Methods like Adam automatically adjust the effective step size for each parameter, which makes them much less sensitive to the exact value you pick. They still need a starting learning rate, though.

## What to remember

The learning rate decides how big each gradient descent step is. Too small and training crawls; just right and the loss drops quickly and settles; too big and it zig-zags or even blows up into NaN. The right value depends on how steep the loss landscape is, which is one reason feature scaling helps. Try values spread by factors of 10 and let the loss curve tell you what's happening.
`;
