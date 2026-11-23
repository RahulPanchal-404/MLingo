export const story = String.raw`
## Walking down a hill in the fog

Imagine you are on a hillside near Ooty early in the morning. The fog is so thick you can't see more than a metre in front of you. Your friends are waiting at the bottom of the valley, and you need to get down to them.

You can't see the valley. You can't see a path. The only thing you can do is feel the ground under your feet. If the ground tilts downwards to your left, you step left. If it tilts downwards in front of you, you step forward. You keep doing this, one careful step at a time, and eventually you reach the bottom.

This is exactly the situation a machine learning model is in. It can't "see" the best answer. It can only measure, at the spot where it currently stands, which way is downhill. The tool that measures "which way is downhill, and how steep" is the **derivative**. This lesson is about that tool, and about the **chain rule**, which lets us use it even when the hill is built from many pieces stacked together.

## Slope: how fast one thing changes when another changes

Forget hills for a moment and think about an auto-rickshaw meter. Suppose the fare is ₹30 to start, plus ₹15 for every kilometre. Write it as:

fare = 15 × km + 30

If you ride 1 km more, the fare goes up by ₹15. If you ride 2 km more, it goes up by ₹30. The fare grows at a steady rate of **₹15 per km**. That rate is the **slope**. On a graph, the fare is a straight line, and the slope tells you how steeply it climbs.

For a straight line, the slope is the same everywhere. You can find it from any two points: change in fare divided by change in distance. Going from 2 km (₹60) to 4 km (₹90), the fare changed by 30 while the distance changed by 2, so the slope is 30 ÷ 2 = 15.

## When the slope keeps changing

Real hills aren't straight lines. Think of a cricket ball hit high into the air. It rises fast at first, slows down near the top, stops for an instant, and then falls faster and faster. Its height changes at a different rate at every moment.

So "the slope" of a curve isn't one number. It's a different number at each point. At the very top of the ball's flight, the height isn't increasing or decreasing for that instant, so the slope there is exactly zero. Just after it leaves the bat, the slope is large and positive. As it comes down, the slope is negative.

The **derivative** is the slope of a curve **at one exact point**. Here's the idea of how it's measured. Pick a point on the curve. Move a tiny distance to the right, say 0.001. See how much the height changed. Divide the change in height by 0.001. As the tiny step gets smaller and smaller, that ratio settles on a single number. That number is the derivative at that point.

## Your first real derivative

Take the simplest curved function there is, f(x) = x². It makes a U shape, a valley with its lowest point at x = 0.

Let's measure the slope at x = 3 the honest way. f(3) = 9. Step a tiny bit right to x = 3.001: f(3.001) = 9.006001. The height went up by 0.006001 while x went up by 0.001, so the slope is about 0.006001 ÷ 0.001 ≈ 6.

Try it at x = 5 and you'll get about 10. At x = −2 you'll get about −4. Notice the pattern: the slope of x² at any point x is **2x**. Mathematicians write this as:

f(x) = x²  →  f′(x) = 2x

The little dash in f′ (said "f prime") means "the derivative of f". Another common way to write it is df/dx, read as "the change in f for a tiny change in x".

Now look at what the derivative tells our foggy hiker standing on the valley x²:

- At x = 3 the slope is +6. Positive means the ground rises to the right, so downhill is to the **left**. Step left.
- At x = −2 the slope is −4. Negative means the ground falls to the right, so downhill is to the **right**. Step right.
- At x = 0 the slope is 0. The ground is flat. You're at the bottom.

That's the whole secret of how models learn: **move in the direction opposite to the slope**. The size of the slope says how steep it is: big slope, far from the bottom; small slope, nearly there.

## A few rules you'll use again and again

You don't have to measure every derivative with tiny steps. A handful of rules cover almost everything in this course:

| Function | Derivative | In words |
| --- | --- | --- |
| a number, like 7 | 0 | a constant never changes |
| a × x | a | a straight line has a fixed slope |
| x² | 2x | the valley gets steeper as you move away from 0 |
| xⁿ | n × xⁿ⁻¹ | the general power rule |
| eˣ | eˣ | the function that is its own slope |
| ln(x) | 1/x | the natural logarithm |

And two rules for combining them: the derivative of a sum is the sum of the derivatives, and a constant multiplier just comes along for the ride. So the derivative of 3x² + 5x + 2 is 6x + 5.

## Where this shows up in machine learning

In the Foundations chapter, you'll measure how wrong a model is with a single number called the **loss**. For example, if a model predicts a house is worth ₹62 lakh and it really sold for ₹60 lakh, one common loss is the squared error, (62 − 60)² = 4.

The model has a knob, a weight w, that changes its predictions. Turning the knob changes the loss. The loss as a function of w is our foggy hillside. The derivative of the loss with respect to w answers the only question that matters: "if I turn this knob a tiny bit up, does the error go up or down, and how fast?" Training is just asking that question over and over and turning the knob the downhill way.

## The chain rule: slopes through a chain of steps

Real models are built in stages: one calculation feeds into the next, which feeds into the next. To find the slope of the final answer with respect to something at the very start, we need the **chain rule**.

Here's an everyday version. You're buying petrol in another country. Each litre costs 2 local coins. Each local coin costs ₹40. How many rupees does one extra litre cost you?

- One extra litre costs 2 more coins.
- Each extra coin costs ₹40.
- So one extra litre costs 2 × 40 = **₹80**.

You multiplied the rates along the chain. That's the chain rule in one sentence: **when one thing depends on a second, which depends on a third, the overall rate is the product of the rates along the way.**

In symbols, if y depends on u and u depends on x:

dy/dx = (dy/du) × (du/dx)

## The chain rule on a real calculation

Let's do one that looks like machine learning. Suppose the prediction is ŷ = 3w and the true answer is 12, and the loss is the squared error:

L = (ŷ − 12)²

We want dL/dw: how the loss changes when we nudge the weight. Break it into a chain: w changes ŷ, and ŷ changes L.

- How does L change with ŷ? L is (something)², so its slope is 2 × (ŷ − 12).
- How does ŷ change with w? ŷ = 3w, so its slope is 3.
- Multiply: dL/dw = 2(ŷ − 12) × 3.

If w = 2 right now, then ŷ = 6, and dL/dw = 2 × (6 − 12) × 3 = −36. The slope is negative, so increasing w lowers the loss. That makes sense: the prediction 6 is too small, and a bigger w makes it bigger. Turn the knob up.

## Why the chain rule is the backbone of deep learning

A neural network is a long chain: inputs go through layer 1, then layer 2, then layer 3, then the loss. To know how a weight in layer 1 affects the final loss, you multiply the slopes back through every layer, from the loss to that weight. This process has a famous name, **backpropagation**, and it is nothing more than the chain rule applied carefully, layer by layer, from the end back to the start.

## What to remember

A derivative is the slope of a curve at one point: how fast the output changes when you nudge the input. Its sign tells you which way is uphill, so the opposite direction is downhill, and its size tells you how steep. The chain rule says that when calculations are chained together, you multiply the slopes along the chain. With just these two ideas, a model can feel its way down the fog-covered hill of its own errors, one step at a time.
`;
