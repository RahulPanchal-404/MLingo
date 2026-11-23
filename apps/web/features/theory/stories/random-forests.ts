export const story = String.raw`
## Guessing the weight of an ox

In 1906, at a country fair in England, around 800 people paid to guess the weight of an ox. Some were butchers and farmers; many were ordinary visitors with no idea at all. Individually, their guesses were all over the place.

The scientist Francis Galton collected the entries afterwards. The middle value of all the guesses came within about 1% of the true weight, better than almost any single expert. The errors of different people, some too high and some too low, largely cancelled out.

This is often called the **wisdom of crowds**, and it's the idea behind **random forests**: instead of trusting one decision tree, grow hundreds of different trees and let them vote. A single tree can be badly wrong; a crowd of varied trees is surprisingly reliable.

## The problem with a single tree

In the Decision Trees lesson, you saw that a deep tree can fit its training data perfectly, carving out tiny boxes around individual points. Its predictions are **high variance**: change a few training examples and you might get a completely different tree, with different questions and different predictions.

That instability is actually the key. If each tree's errors are partly random, and we could get many different trees, their random errors would cancel out when averaged, like the ox guesses. The question is how to get many different trees from one dataset.

## Bagging: a different dataset for every tree

The first trick is called **bagging**, short for **bootstrap aggregating**.

For each tree, build a new training set by drawing rows from the original data **at random, with replacement**, until it has as many rows as the original. "With replacement" means a row can be picked more than once. So each new training set, called a **bootstrap sample**, contains some rows twice or three times, and leaves out others entirely. On average, each bootstrap sample contains about 63% of the distinct original rows.

Train one deep tree on each bootstrap sample. Because each tree saw a slightly different dataset, each one comes out different. Then combine them:

- For **classification**, each tree votes and the majority wins.
- For **regression**, average the trees' predictions.

## Random forests: also vary the questions

Bagging alone has a weakness. Suppose one feature is very strong, like income when predicting loan default. Almost every tree will pick income for its first question, so the trees end up looking alike, and similar trees make similar mistakes. A crowd that all think alike isn't wise.

**Random forests** add a second source of randomness: at every split, each tree may only consider a **random subset of the features**. Maybe at one split it can choose only from age, city and loan amount; at the next, only from income, job type and existing debts. Now the strong feature isn't available everywhere, other features get their chance, and the trees become much more varied. More varied trees mean their errors are less related, so averaging cancels more of them.

A common default is to consider about √d features at each split for classification, where d is the total number of features. With 100 features, each split looks at about 10 random ones.

## A free test set: out-of-bag error

Here's a lovely bonus. Each tree never saw about 37% of the rows, the ones left out of its bootstrap sample. Those rows are a ready-made test set for that tree.

For each row, collect predictions only from the trees that didn't train on it, and compare with the true answer. Averaged over all rows, this is the **out-of-bag (OOB) error**. It estimates how well the forest does on new data, without setting aside a separate validation set. That's especially handy when data is limited.

## Which features matter?

Random forests can also tell you which features were most useful. **Impurity-based importance** adds up how much each feature reduced impurity across all the splits in all the trees. It's quick but biased towards features with many distinct values. **Permutation importance** is more reliable: shuffle one feature's values on test data, breaking its link with the target, and measure how much the accuracy drops. A big drop means the model relied on that feature.

## The settings that matter

- **n_estimators**: the number of trees. More trees never make a random forest overfit; they just make it slower and more stable. A few hundred is usually plenty.
- **max_features**: how many features to consider at each split. Smaller values make trees more different from each other.
- **max_depth** and **min_samples_leaf**: limits on each tree. Forests usually work well with deep trees, because averaging handles the variance, but limits can help on noisy data.

## Strengths and weaknesses

Random forests are one of the best "first serious models" for table-shaped data. They work well with default settings, handle numbers and categories, need no feature scaling, capture curves and interactions, and rarely overfit badly.

The trade-offs: a forest of 500 trees isn't easy to read like a single tree; it's slower to predict and larger to store; and, like all tree models, it can't predict values outside the range of the training data. When the very best accuracy matters, gradient boosting often edges ahead, but it needs more careful tuning.

## What to remember

A random forest grows many decision trees and lets them vote or averages them, so their individual errors cancel out. Bagging gives each tree a different bootstrap sample of the rows; random feature subsets at each split make the trees even more different. The rows each tree didn't see give a free out-of-bag estimate of test performance. More trees never cause overfitting, and forests work well with little tuning.
`;
