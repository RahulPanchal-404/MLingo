export const story = String.raw`
## The quiz show audience

On the TV quiz show *Who Wants to Be a Millionaire*, a stuck contestant has a few lifelines. One is to phone a friend: a single expert. Another is to ask the audience: hundreds of ordinary people press a button, and the contestant sees the votes.

You'd expect the expert friend to be more reliable. But in practice, the audience vote tends to pick the right answer more often than the phone-a-friend. No single audience member is an expert, but their mistakes point in different directions, while the right answer collects votes from everyone who happens to know it.

An **ensemble** in machine learning is that audience: several models whose predictions are combined into one. Done well, the combination is more accurate and more stable than any of its members. This page covers the three main ways to build one: **voting**, **bagging** and **stacking**.

## Why a vote can beat its members

Let's do a quick calculation. Suppose you have three classifiers, each correct 70% of the time, and, importantly, their mistakes are **independent**: one being wrong says nothing about the others.

Take a majority vote. The vote is right whenever at least two of the three are right:

- All three right: 0.7 × 0.7 × 0.7 = 0.343
- Exactly two right (three ways it can happen): 3 × 0.7 × 0.7 × 0.3 = 0.441

Total: 0.343 + 0.441 = **0.784**. Three 70% models make a 78% team. With more independent models, the vote gets better still.

The catch is in that word **independent**. If all three models are copies of each other, they make the same mistakes and the vote is no better than one of them. Ensembles work only when the members are **accurate and different**. The rest of this page is really about ways to make models that are different.

## Voting: combining different kinds of models

The simplest ensemble takes completely different models, say logistic regression, a random forest and an SVM, trains each on the same data, and combines their predictions. Different kinds of models see patterns differently, so their mistakes are naturally less related.

There are two ways to combine them:

- **Hard voting**: each model picks a class, and the majority wins.
- **Soft voting**: each model gives probabilities, the probabilities are averaged, and the class with the highest average wins. Soft voting usually works better because it uses each model's confidence: a model that's 95% sure counts for more than one that's 51% sure. It needs models whose probabilities are reasonably calibrated.

For regression, the equivalent is simply averaging the predictions, sometimes with weights.

## Bagging: the same model on different data

Another way to get different models is to train the **same** kind of model on **different samples** of the data. That's **bagging** (bootstrap aggregating): each model gets a bootstrap sample, drawn from the training data at random with replacement, so each sees a slightly different dataset.

Bagging helps most with **unstable, high-variance** models, ones that change a lot when the data changes, like deep decision trees. Averaging many of them cancels much of that variance. It helps very little with stable models like linear regression, which come out almost identical on every bootstrap sample.

Random forests are bagging with one extra twist: random subsets of features at each split, making the trees even more different.

## Out-of-bag: a free validation set

Each bootstrap sample leaves out about 37% of the rows. For each row, the models that never saw it can predict it, and comparing those predictions with the truth gives the **out-of-bag (OOB)** score: an honest estimate of test performance, without setting aside a separate validation set.

## Stacking: learning how to combine

Voting combines models with fixed rules: majority or plain average. But maybe the random forest is great for some kinds of examples and the logistic regression for others. Wouldn't it be better to **learn** how to combine them?

That's **stacking**. It works in two levels:

- **Level 1, the base models**: several different models, like a random forest, gradient boosting and KNN.
- **Level 2, the meta-model**: a simple model, often logistic or linear regression, that takes the base models' predictions as its input features and learns how to combine them into the final answer.

There's one crucial rule. The meta-model must learn from base-model predictions on data the base models **didn't train on**. Otherwise, it sees overconfident predictions on memorised data and learns to trust them too much. The standard solution is to generate those predictions with cross-validation: split the training data into folds, and predict each fold using base models trained on the other folds. scikit-learn's StackingClassifier and StackingRegressor do this for you.

## Bagging, boosting and stacking side by side

| Method | Members | How they're trained | How they're combined | Mainly reduces |
| --- | --- | --- | --- | --- |
| Voting | different model types | independently, same data | majority or average | errors of individual models |
| Bagging | same model type | independently, bootstrap samples | majority or average | variance |
| Boosting | same model type, weak | one after another, fixing errors | weighted sum | bias (and variance) |
| Stacking | different model types | independently, cross-validated | a learned meta-model | errors of individual models |

## When ensembles are worth it

Ensembles nearly always add some accuracy, which is why they dominate competitions. But they cost something: more training time, slower predictions, more memory, and models that are harder to explain. In a real product, a single well-tuned gradient boosting model is often the sweet spot. Reach for voting or stacking when the extra accuracy really matters, and check on held-out data that the gain is real.

## What to remember

An ensemble combines several models so their mistakes cancel out, but only if the members are both accurate and different. Voting combines different model types by majority (hard) or averaged probabilities (soft). Bagging trains the same model on bootstrap samples and mainly reduces variance; its left-out rows give a free out-of-bag score. Stacking trains a meta-model on cross-validated predictions from the base models to learn the best way to combine them.
`;
