export const story = String.raw`
## The ice-cream seller's puzzle

Arjun sells ice cream on the beach in Goa. He noticed that hotter days bring more customers, so he tried a simple rule: sales go up by a fixed amount for every degree of temperature. A straight line.

It worked in spring. Then summer arrived. On the hottest days, above 38°C, sales actually **dropped**. It was so hot that people stayed indoors. His straight line kept predicting more and more sales as the temperature rose, and he ended up with tubs of melting ice cream on the hottest afternoons.

The real relationship wasn't a straight line. It rose, reached a peak, and came back down, more like the shape of a hill. A straight line simply can't bend to follow that. **Polynomial regression** is the fix: it lets the line curve.

## When straight lines aren't enough

Many real relationships curve:

- A car's fuel efficiency improves as speed goes up from 20 to 60 km/h, then gets worse at high speeds.
- A crop's yield rises with fertiliser, levels off, and falls if you add too much.
- The time a website takes to load grows faster and faster as more users arrive at once.

If you fit a straight line to curved data, the line will be wrong in a predictable way: too high in some places, too low in others. This is called **underfitting**. The model is too simple to capture the real pattern, no matter how much data you give it.

## The trick: invent new features

Here's the surprisingly simple idea behind polynomial regression. Instead of inventing a whole new kind of model, we keep linear regression and give it **extra features made from the original one**.

If x is the temperature, we also give the model x² (temperature squared) and maybe x³ (temperature cubed). The model becomes:

ŷ = w₁ × x + w₂ × x² + b

It's still linear regression, a weighted sum of features, but because one of those features is x², the prediction can curve. With a negative w₂, the curve rises and then falls, exactly the hill shape Arjun needed.

The highest power you include is called the **degree**:

- Degree 1: a straight line. ŷ = w₁x + b.
- Degree 2: a single bend, like a hill or a valley. ŷ = w₁x + w₂x² + b.
- Degree 3: up to two bends, like an S shape.
- Degree 10: up to nine bends, a very wiggly curve.

Each extra degree adds one more weight for the model to learn, and one more possible bend.

## The danger: bending too much

If degree 2 is good, is degree 15 better? On the training data, almost always yes. A wigglier curve can pass closer to every single point, so the training error keeps going down as the degree goes up.

But look at what a degree-15 curve actually does. It twists and turns to pass through every point, including the ones that are a bit off because of random noise: the day a school group happened to visit, the day a power cut closed the freezer. Between the points, it swings wildly up and down in places where there's no data at all. Ask it about a new day, and its prediction can be absurd.

This is **overfitting**: the model has learned the noise in the training data, not the real pattern. It's like a student who memorises the answers to last year's exam paper word for word. Perfect on that paper, lost on a new one.

## Finding the sweet spot

So we have two opposite dangers:

- **Too simple** (low degree): misses the real shape. High error on training data and on new data. This is underfitting.
- **Too complex** (high degree): copies the noise. Low error on training data, high error on new data. This is overfitting.

Somewhere in the middle is the degree that captures the real pattern without the noise. You can't find it by looking at training error, because training error always rewards more complexity. You find it by checking the error on data the model **hasn't seen**: a validation set, or better, cross-validation.

If you plot error against degree, you'll see a famous picture. Training error falls steadily. Validation error falls at first, reaches a lowest point, then rises again as overfitting kicks in. The bottom of that U is the degree to choose. You can watch this happen in the Polynomial Regression lab.

## Practical tips

- **Scale the input first.** Powers of large numbers explode quickly: 100¹⁰ is 10²⁰. Standardising x before creating powers keeps the numbers manageable.
- **With several features, it grows fast.** A degree-2 expansion of 10 features creates 65 features, because it includes every pair multiplied together (like size × floor). Higher degrees grow much faster still.
- **Don't trust the curve outside your data.** A polynomial can shoot off to huge values just beyond the range you trained on. If you trained on temperatures from 20°C to 40°C, don't ask it about 45°C.
- **Combine it with regularization.** The next lesson shows how to let a model be flexible while discouraging wild wiggles.

## What to remember

When the relationship curves, add powers of the input as new features, and linear regression can fit curves. The degree controls how many bends the curve can have. Too low a degree underfits, too high overfits, and the right choice is the one with the lowest error on data the model hasn't seen, not on the training data.
`;
