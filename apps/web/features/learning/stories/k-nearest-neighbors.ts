export const story = String.raw`
## New in town

Sana has just moved to a new city and wants to find a good restaurant for dinner. She doesn't know anyone's taste yet, so she does what most of us would do: she asks the neighbours. The three people living closest to her all recommend the same South Indian place down the road. She goes there.

That's a surprisingly powerful way to make decisions: **look at the most similar examples you already know, and go with what they say**. It needs no theory, no equations and no training. It's also the whole idea behind one of the simplest machine learning methods, **K-nearest neighbours**, usually shortened to **KNN**.

## How KNN classifies something new

Suppose a fruit seller wants a computer to tell apples from oranges using two measurements: weight and how smooth the skin is. She has 100 fruits she's already labelled.

A new fruit arrives. KNN does this:

- Measure the new fruit's weight and smoothness.
- Find the **K** labelled fruits whose measurements are closest to it. If K = 5, find the 5 most similar fruits.
- Look at their labels and take a **vote**. If 4 of the 5 are oranges, predict orange.

That's it. The "K" is just the number of neighbours you ask. For predicting a number instead of a category, like the price of a used bike, KNN takes the **average** of the neighbours' values instead of a vote. That version is called KNN regression.

## "Closest" means distance

To find the nearest neighbours, KNN needs a way to measure how close two examples are. Remember from the vectors lesson that each example is a vector of numbers, so we can use the **distance** between vectors. The usual choice is the **Euclidean distance**, the straight-line distance you'd measure with a ruler:

distance = √((weight difference)² + (smoothness difference)²)

With more features, you just keep adding squared differences under the square root. Other distances exist, like **Manhattan distance**, which adds the absolute differences instead (like walking along city blocks rather than flying straight), but Euclidean is the default.

## KNN doesn't really "train"

Most models spend time learning weights during training. KNN doesn't. It simply **stores all the training examples**. All the work happens later, when a new example needs a prediction and KNN measures its distance to every stored example.

This is why KNN is called a **lazy learner**. Training is instant, but predicting can be slow, because each prediction compares the new point with the whole training set. With a few thousand examples, that's fine. With millions, it gets expensive, and special data structures or approximate methods are used to speed up the search.

## Choosing K: the most important decision

The value of K changes KNN's behaviour completely.

**K = 1**: each new point copies its single nearest neighbour. This follows the training data perfectly, so the model gets 100% on the training set, since every point is its own nearest neighbour. But if that one neighbour happens to be mislabelled or unusual, the prediction is wrong. On a map of predictions, K = 1 produces a jagged border full of little islands around odd points. That's **overfitting**.

**Large K**, say 75 out of 100: each point takes a vote among most of the dataset. Local details disappear, and the border becomes very smooth, maybe too smooth to follow the real shape. Near the edges, the bigger group simply outvotes the smaller one. That's **underfitting**.

**Somewhere in between** is the right K. You find it by testing different values on data the model hasn't seen, using cross-validation, and picking the K with the best score. Two practical tips: for two classes, choose an **odd** K so votes can't tie; and you can give **closer neighbours a bigger vote** than farther ones, called distance weighting. The KNN lab lets you watch the border change as K grows.

## The scaling trap

Here's the mistake almost everyone makes with KNN at first. Imagine predicting whether someone will buy a car using two features: their annual income (in rupees, like 8,00,000) and their age (like 35).

Two people with incomes of ₹8,00,000 and ₹8,10,000 differ by 10,000 in income. Two people aged 25 and 60 differ by 35 in age. In the distance formula, the income difference completely swamps the age difference, so KNN effectively ignores age, even if age is the most useful feature.

The fix is **feature scaling**: rescale every feature to a similar range before measuring distances, usually by standardising (subtract the mean, divide by the standard deviation). For KNN, scaling isn't optional. It can be the difference between a useless model and a great one. The Sorter game has a level built around exactly this.

## The curse of dimensionality

KNN works beautifully with a handful of features. With hundreds of features, something strange happens: in very high-dimensional space, almost all points end up roughly the same distance from each other. "Nearest" stops meaning much, and KNN's performance drops. This is called the **curse of dimensionality**. When you have many features, it helps to remove useless ones or reduce the dimensions first, for example with PCA.

## When to use KNN

KNN is a good choice when you have a modest amount of data, a small number of meaningful features, and boundaries between classes that are curvy or irregular. It's also easy to explain: "we predicted this because these five similar cases had that outcome". It's a poor choice for huge datasets that need fast predictions, or data with many irrelevant features.

## What to remember

KNN predicts by finding the K most similar training examples and taking a vote (for classes) or an average (for numbers). It doesn't train; it stores the data and does the work at prediction time. Small K follows the data too closely and overfits; large K smooths too much and underfits. Because it relies on distances, always scale your features first.
`;
