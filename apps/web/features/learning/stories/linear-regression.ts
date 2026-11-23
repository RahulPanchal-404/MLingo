export const story = String.raw`
## The estate agent's rule of thumb

Priya has worked as an estate agent in Bengaluru for fifteen years. When someone asks her what their flat is worth, she doesn't need a computer. She thinks for a moment and says something like: "Flats in this area go for about ₹6,000 per square foot, plus a bit extra for being near the metro."

Without realising it, Priya is using a **linear model**. She starts with a base amount, adds a fixed amount for every square foot, and adjusts for a couple of other things. Each factor pushes the price up or down by a steady amount. Her rule of thumb came from years of watching sales. Linear regression does the same thing, but it learns the rule from data in seconds, and it can weigh dozens of factors at once.

## Drawing a line through points

Let's start with just one factor: the size of a flat. Suppose you collect the sizes and selling prices of 50 flats and plot them, size on the horizontal axis and price on the vertical axis. You'll see a cloud of dots that roughly rises from left to right. Bigger flats cost more, though not perfectly: a flat next to a noisy road sells for less, one with a lake view sells for more.

**Linear regression** draws the single straight line that best follows that cloud. Once you have the line, predicting is easy: find the flat's size on the horizontal axis, go up to the line, and read off the price.

A straight line is described by two numbers:

ŷ = w × x + b

- x is the input, here the size of the flat.
- w is the **slope**, or **weight**: how much the price goes up for each extra square foot.
- b is the **intercept**, or **bias**: where the line crosses the vertical axis, a base amount.
- ŷ is the predicted price.

If the model learns w = 6,000 and b = 5,00,000, it's saying: "start at ₹5 lakh and add ₹6,000 for every square foot". A 1,000 sq ft flat would be predicted at ₹5,00,000 + ₹60,00,000 = ₹65 lakh. That's Priya's rule of thumb, written as an equation.

## What makes one line "best"?

You could draw many lines through the cloud. Which one is best? We need a way to score each line, and you already know how from the loss lesson.

For each flat, the vertical gap between its real price and the line's prediction is the error, also called the **residual**. Square every residual, average them, and you get the **mean squared error (MSE)**. The best line is the one with the smallest MSE. Because it minimises the sum of squared errors, it's also called the **least squares** line.

Squaring matters here. It means a line that misses one flat by ₹20 lakh is punished much more than a line that misses four flats by ₹5 lakh each. So the best line tries hard to stay reasonably close to every point rather than nailing some and ignoring others.

## How the model finds the line

There are two ways to find the best w and b.

The first is **gradient descent**, which you learned in Foundations. Start with any line, measure the MSE, work out which way to tilt and shift the line to reduce it, and take a small step. Repeat until the line stops moving. This is how the Linear Regression lab works, and it's how models with millions of examples are trained.

The second is a direct formula, called the **normal equation**, that calculates the best weights in one go using matrix algebra. scikit-learn's LinearRegression uses a closely related exact method. It's fast and precise for small and medium datasets. Both approaches find the same line; gradient descent just walks there step by step.

## More than one factor

Real prices depend on more than size: the number of bedrooms, the distance to the metro, the age of the building, the floor. Linear regression handles this naturally. Each feature gets its own weight:

ŷ = w₁ × size + w₂ × bedrooms + w₃ × distance to metro + w₄ × age + b

This is called **multiple linear regression**. In the vector notation from the first lessons, it's just a dot product: ŷ = w · x + b.

The weights are the model's explanation. A weight of −2,00,000 for distance to metro means: "every extra kilometre from the metro lowers the price by about ₹2 lakh, if everything else stays the same." This is one of linear regression's biggest strengths. You can read exactly what it learned.

## Reading the weights carefully

Two warnings about interpreting weights.

**First, units change the size of a weight.** If you measure distance in metres instead of kilometres, its weight becomes a thousand times smaller, even though the effect is identical. So you can't compare weights to see which feature "matters most" unless the features are on the same scale. Standardising features first fixes this.

**Second, weights describe association, not cause.** If flats with more bathrooms sell for more, the model will give bathrooms a positive weight. That doesn't prove that adding a bathroom will raise the price by that amount; maybe bigger, fancier flats just tend to have more bathrooms.

## Checking if the line is any good

After training, you check the model on flats it hasn't seen. Common measures:

- **MAE**: the average size of the errors, in rupees. Easy to explain: "on average we're off by ₹3.2 lakh".
- **RMSE**: like MAE but punishes big errors more.
- **R²** ("R-squared"): the share of the variation in prices that the model explains. 1 means perfect, 0 means no better than always guessing the average price.

It also helps to plot the residuals. If they look like random noise around zero, the line is doing its job. If they curve, for example the model underestimates both very small and very large flats, the real relationship isn't a straight line, and you'll need the next lesson, polynomial regression.

## When linear regression fits, and when it doesn't

Linear regression works well when the effect of each feature is roughly steady: each extra square foot adds about the same amount, whatever the size. It's fast, it needs little data, and it's easy to explain, which is why it's often the first model people try, and a baseline that fancier models must beat.

It struggles when relationships curve, when features interact (a sea view adds more to a big flat than a small one), and when there are extreme outliers that drag the line towards them. Many of the later lessons are about fixing exactly these weaknesses.

## What to remember

Linear regression predicts a number as a weighted sum of the features plus a constant: ŷ = w · x + b. The best weights are the ones that minimise the mean squared error, found either with gradient descent or an exact formula. Each weight tells you how much the prediction changes per unit of that feature, holding the others fixed. It's simple, fast and explainable, and it's the foundation that most other models build on.
`;
