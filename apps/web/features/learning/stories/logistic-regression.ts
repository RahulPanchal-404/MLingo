export const story = String.raw`
## The bank manager's decision

Mr. Mehta is a loan officer at a bank. Every day, people apply for loans, and he has to decide: will this person repay, or not? He looks at their monthly income, their existing debts, and how many years they've been in their job.

His answer isn't a number like a price. It's a **yes or no**. But a good loan officer doesn't think in pure yes or no. He thinks in likelihoods: "this applicant is very likely to repay", "this one is a coin toss", "this one is risky". Only at the end does he turn that feeling into a decision.

**Logistic regression** works exactly like a careful loan officer. Despite the word "regression" in its name, it's used for **classification**: deciding which of two groups something belongs to. It first works out a probability, and then turns that probability into a decision.

## Why not just use linear regression?

You might think: label "will repay" as 1 and "won't repay" as 0, and fit a straight line with linear regression. The trouble is that a straight line doesn't stop. For a very high income, the line might predict 1.8. For a very low income, −0.6. What would a "−60% chance of repaying" even mean?

We need an output that always stays between 0 and 1, so it can be read as a probability. And we need it to change smoothly: low incomes near 0, high incomes near 1, and a gradual change in between.

## The S-shaped curve

Logistic regression solves this in two steps.

**Step 1** is exactly like linear regression. Combine the features with weights and add a bias:

z = w₁ × income + w₂ × debts + w₃ × years in job + b

This z is called the **score**, or logit. It can be any number, from very negative to very positive. A high score means "looks like a good borrower".

**Step 2** squashes that score into a probability using the **sigmoid** function:

p = 1 ÷ (1 + e^(−z))

You don't need to memorise the formula, just its shape. It's an S-shaped curve that turns any number into a value between 0 and 1:

- A very negative score, like −6, becomes almost 0.
- A score of 0 becomes exactly 0.5.
- A very positive score, like +6, becomes almost 1.

So the model's output p is the probability that the applicant belongs to the "will repay" group. A score of 2 gives about 0.88, an 88% chance.

## From probability to decision

A probability isn't a decision yet. To decide, we pick a **threshold**. The usual default is 0.5: if p is at least 0.5, predict "will repay"; otherwise "won't repay".

But 0.5 isn't always right. If giving a loan to someone who won't repay is very expensive, the bank might only approve applicants with p above 0.8. In a medical test, where missing a disease is worse than a false alarm, you might flag anyone above 0.2. Choosing the threshold is a business decision, not a mathematical one. The Gatekeeper game is all about this choice.

The set of points where p is exactly 0.5 is called the **decision boundary**. For logistic regression, it's a straight line (with two features) or a flat surface (with more). Everything on one side is predicted as one class, everything on the other side as the other class.

## Reading the weights

Each weight tells you how a feature pushes the decision:

- A **positive** weight for income: higher income raises the score and the probability of repaying.
- A **negative** weight for debts: more debt lowers the probability.
- A weight near **zero**: that feature hardly matters.

There's a precise interpretation too. Increasing a feature by one unit multiplies the **odds** of the positive class by e^w. Odds are p ÷ (1 − p); a probability of 0.75 means odds of 3 to 1. If the weight for "years in job" is 0.4, each extra year multiplies the odds of repaying by e^0.4 ≈ 1.5.

## How it learns: log loss

For linear regression, we used mean squared error. For logistic regression, we use **log loss**, also called **binary cross-entropy**. It looks at the probability the model gave to the **correct** answer:

- The applicant repaid and the model said 0.95: tiny loss. Confident and right.
- The applicant repaid and the model said 0.5: medium loss. Unsure.
- The applicant repaid and the model said 0.02: huge loss. Confident and badly wrong.

The formula is the negative logarithm of the probability given to the right answer, averaged over all examples. As that probability approaches 0, the loss shoots up towards infinity, so the model learns to avoid confident mistakes above everything else. Training uses gradient descent to find the weights with the lowest log loss, which you can watch in the Logistic Regression lab.

## More than two groups

What if there are three or more groups, like classifying news articles as sports, politics or business? Logistic regression extends naturally. The **softmax** version gives one score per group and turns all the scores into probabilities that add up to 1. The predicted group is the one with the highest probability.

## Strengths and limits

Logistic regression is fast, works well with modest amounts of data, gives real probabilities, and its weights are easy to explain. That's why it's still used everywhere, from credit scoring to medical risk, and why it's the baseline every classification project should start with.

Its main limit is that the decision boundary is straight. If the two groups are separated by a curve, like customers who buy only in a middle price range, logistic regression on the raw features can't follow it. You can add curved features, like in polynomial regression, or move on to models such as decision trees and neural networks.

## What to remember

Logistic regression is a classifier. It computes a weighted score like linear regression, then squashes it through the S-shaped sigmoid into a probability between 0 and 1. A threshold, 0.5 by default, turns the probability into a decision, and the right threshold depends on the cost of each kind of mistake. It learns by minimising log loss, which punishes confident wrong answers heavily.
`;
