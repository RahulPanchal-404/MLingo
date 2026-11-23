export const story = String.raw`
## The archery coach's scorecard

An archery coach is training two students. Each one shoots three arrows at a target. Afterwards, the coach wants to know: which student did better?

She can't just say "they both missed sometimes". She needs a **score**: one number per student that sums up how far off the arrows were. Once she has that number, she can compare students, track improvement from week to week, and tell each student whether a change in technique helped.

A machine learning model needs exactly the same thing. During training, it makes predictions, and we need a single number that says how wrong all those predictions are together. That number is called the **loss**, and the formula that calculates it is the **loss function**. Choosing it carefully matters more than most beginners expect, because the model will do whatever makes this number small.

## Errors: how far off is each prediction?

Let's switch to a simple prediction problem. A model predicts the price of second-hand phones. For three phones:

| Phone | Real price (₹) | Predicted (₹) | Error |
| --- | --- | --- | --- |
| A | 10,000 | 8,000 | −2,000 |
| B | 20,000 | 23,000 | +3,000 |
| C | 15,000 | 15,000 | 0 |

The **error** for each phone is the prediction minus the real price. Negative means the model guessed too low; positive means too high.

Now we need to combine these three errors into one number. The obvious idea is to average them: (−2,000 + 3,000 + 0) ÷ 3 ≈ +333. That makes it look like the model is nearly perfect, off by only ₹333 on average!

But it clearly isn't. It was ₹2,000 too low on one phone and ₹3,000 too high on another. The positive and negative errors **cancelled each other out**. A plain average of errors is useless as a loss, because a model could be wildly wrong in both directions and still score zero.

## Fix 1: ignore the sign (Mean Absolute Error)

The simplest fix is to ignore whether each error is too high or too low and just use its size. The size of a number without its sign is called its **absolute value**: |−2,000| = 2,000.

Average the sizes and you get the **Mean Absolute Error (MAE)**: (2,000 + 3,000 + 0) ÷ 3 ≈ ₹1,667.

This has a lovely, plain meaning: "on average, the model's predictions are about ₹1,667 off." Anyone can understand that, which makes MAE great for reporting results to people.

## Fix 2: square the errors (Mean Squared Error)

The other common fix is to **square** each error before averaging. Squaring also removes the sign, since a negative number times itself is positive. This gives the **Mean Squared Error (MSE)**:

MSE = average of (prediction − real)²

For our phones: (−2,000)² = 4,000,000, (3,000)² = 9,000,000, and 0² = 0. The average is 13,000,000 ÷ 3 ≈ 4,333,333.

That number looks huge and strange because it's in "rupees squared", which isn't a unit anyone thinks in. To bring it back to rupees, people often take the square root and call it the **Root Mean Squared Error (RMSE)**: √4,333,333 ≈ ₹2,082.

## Why squaring is so popular

If MAE is easier to understand, why do so many models use MSE for training? Two reasons.

**First, squaring punishes big mistakes much more than small ones.** An error of 2 becomes 4, but an error of 10 becomes 100. So a model trained on MSE works very hard to avoid large errors. If being badly wrong once is much worse than being slightly wrong often, like when estimating the load a bridge can carry, that's exactly what you want.

**Second, MSE is smooth.** Its graph is a gentle U-shaped valley with a single bottom and no sharp corners. That makes it easy to find the slope at every point, which is exactly what gradient descent needs. MAE has a sharp V-shaped corner at zero, which is a little more awkward to work with.

The flip side is that MSE is very sensitive to **outliers**. If one phone in the data has a typo, listed at ₹2,00,000 instead of ₹20,000, its squared error will be enormous, and the model will bend itself out of shape to reduce it. MAE is much calmer about outliers. Choosing between them is a real decision about what kind of mistake you care about.

## Losses for classification

When the model predicts a category instead of a number, like "spam or not spam", the loss works differently. A good classifier gives a **probability**, such as "92% likely to be spam". The loss should reward being confident and right, and punish being confident and wrong.

The standard choice is called **log loss** or **cross-entropy**. You'll meet it properly in the logistic regression lesson, but here's the intuition:

- The email really is spam and the model said 92%: small loss. Good.
- The email really is spam and the model said 50%: medium loss. It wasn't sure.
- The email really is spam and the model said 1%: very large loss. It was confidently wrong, and that gets punished hard.

## The loss is what the model optimises

This is the most important idea in the lesson. A model doesn't know what "good" means. It only knows how to make the loss smaller. Whatever the loss function rewards, the model will chase.

Choose MSE, and the model will avoid big errors at the cost of many small ones. Choose MAE, and it will treat every rupee of error equally. If your loss ignores something you care about, like a missed fraud case costing far more than a false alarm, the model will happily ignore it too. Choosing the loss is choosing what "good" means for your problem.

## What to remember

The loss is a single number that sums up how wrong all the predictions are. You can't just average errors, because positives and negatives cancel. MAE averages the error sizes and is easy to explain; MSE averages the squared errors, punishes big mistakes heavily and is smooth to optimise, but it's sensitive to outliers. Classifiers use log loss, which punishes confident wrong answers. Training is nothing more than searching for the parameters that make the loss as small as possible.
`;
