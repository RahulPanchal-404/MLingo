export const story = String.raw`
## Pricing a cup of coffee

A café owner wants to understand what makes customers happy to pay more. She notices three things matter: the size of the cup, whether it has extra toppings, and whether it's served in the comfortable seating area or at the takeaway counter. Each one adds something to what people will pay, more or less independently.

If she could find out how much each factor is worth on its own, she could price every combination: a large cup with toppings at the counter, a small plain cup in the lounge, and everything in between. That's what **multiple linear regression** does. It's the same straight-line idea from the Linear Regression lesson, but with several inputs instead of one, and with a clean formula that finds the best weights in one go.

## One weight per feature

With a single feature, the model was ŷ = w × x + b. With several, each feature gets its own weight:

ŷ = w₁ × size + w₂ × toppings + w₃ × lounge + b

Read every weight as an answer to one question: **how much does the prediction change when this feature goes up by one, with every other feature held fixed?** If w₂ = 30, then adding toppings raises the predicted price by ₹30, whether the cup is small or large, in the lounge or at the counter.

That "holding everything else fixed" part is what makes multiple regression powerful. Suppose lounge customers also tend to buy bigger cups. A simple one-feature model of price against seating would mix the two effects together and give the lounge credit for the bigger cups. Multiple regression separates them, giving each feature only its own share.

## Writing every row at once

With hundreds of customers, writing a separate equation for each is tedious. Instead, stack all the customers into a matrix X, one row per customer and one column per feature. Add a column of 1s so the bias b can be treated like just another weight. Then the predictions for everyone are one product:

ŷ = Xw

This is exactly the matrix–vector product from the Vectors lesson: each prediction is the dot product of one customer's row with the weight vector. The errors for everyone are the vector y − Xw, and the loss is the sum of their squares.

## Finding the best weights in one step

In Foundations, the model found its weights by walking downhill with gradient descent. For linear regression with squared error, there's a shortcut: the exact best weights can be calculated directly.

The idea is simple even if the algebra looks heavy. At the bottom of the loss valley, the slope is zero in every direction. Write down the slope of the squared error with respect to every weight, set it all to zero, and solve. The result is called the **normal equation**:

w = (XᵀX)⁻¹ Xᵀy

You don't need to memorise it. Read it as: "combine the features with each other (XᵀX), combine the features with the target (Xᵀy), and divide one by the other". In practice, libraries don't literally compute that inverse; they use more stable methods that give the same answer. But it's useful to know that the answer exists in closed form, with no learning rate and no iterations.

When should you use gradient descent instead? When the data is huge. The normal equation needs to work with a d × d matrix, where d is the number of features, and its cost grows roughly with d³. With a few hundred features, it's instant. With millions of rows and many thousands of features, gradient descent wins.

## When the weights can't be trusted

Multiple regression has one famous weak spot. Imagine you include a flat's area in square feet **and** its area in square metres as two separate features. They carry exactly the same information. How should the model split the credit between them? It can't decide: one could be +1,000 and the other −1,000, or +5 and +5, and the predictions would be identical.

This is **multicollinearity**: when features are strongly related to each other. The predictions can still be fine, but the individual weights become unstable. A tiny change in the data can make them swing wildly, even flip sign. In matrix language, XᵀX is nearly impossible to invert, which is exactly where the normal equation struggles.

You'll recognise it when:

- weights have surprising signs, like more bedrooms *lowering* the price,
- weights change a lot when you add or remove a few rows,
- two features are known to be closely related.

Fixes: drop one of the overlapping features, combine them into one, or use Ridge regression, which keeps the weights calm by penalising their size.

## Categories need special care

Features like "city" or "seating area" aren't numbers. You can't multiply a weight by "Mumbai". The standard fix is **one-hot encoding**: create a 0/1 column for each category, like is_mumbai, is_pune, is_delhi.

There's a trap here. If every row has exactly one 1 across those columns, the columns always add up to 1, which is the same as the column of 1s for the bias. The features are perfectly overlapping. The usual fix is to drop one category and treat it as the baseline. Then each remaining weight means "how much more (or less) than the baseline city". This is called avoiding the **dummy variable trap**.

## Reading a fitted model

Suppose the café's fitted model is:

price = 120 + 40 × size_large + 30 × toppings + 25 × lounge

You can read it like a menu: a small plain takeaway coffee is about ₹120; going large adds ₹40, toppings add ₹30, sitting in the lounge adds ₹25. A large coffee with toppings in the lounge is predicted at 120 + 40 + 30 + 25 = ₹215. That clarity is why multiple regression is still used everywhere decisions need explaining.

## What to remember

Multiple linear regression gives every feature its own weight, and each weight means "the change in prediction per unit of this feature, with all other features held fixed". All the predictions are one matrix product, ŷ = Xw, and the best weights come straight from the normal equation without any iterations. When features overlap strongly, the weights become unstable, so drop or combine duplicates, encode categories with one baseline left out, or use Ridge.
`;
