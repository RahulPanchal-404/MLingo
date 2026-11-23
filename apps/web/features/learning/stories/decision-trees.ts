export const story = String.raw`
## The game of twenty questions

You've probably played this game. One person thinks of an animal, and the other has to guess it by asking yes/no questions. "Does it live in water?" No. "Does it have four legs?" Yes. "Is it bigger than a dog?" Yes. "Does it have stripes?" Yes. "Is it a tiger?" Yes!

A good player doesn't ask random questions. They ask the questions that split the possibilities most usefully. "Is it a tiger?" as a first question is a waste, because the answer is almost always no. "Does it live in water?" cuts the possibilities roughly in half.

A **decision tree** is a model that plays exactly this game with data. It makes a prediction by asking a series of simple yes/no questions about the features, one after another, until it reaches an answer. And it learns which questions to ask, and in which order, from the training data.

## What a tree looks like

Imagine a bank deciding whether to approve a credit card. A decision tree might look like this:

- First question: **Is monthly income above ₹40,000?**
- If no: **Does the applicant have an existing loan?** If yes, reject. If no, approve with a low limit.
- If yes: **Have they missed any payment in the last year?** If yes, reject. If no, approve.

The first question is the **root**. Each question is a **node**. The final answers at the ends of the branches are the **leaves**. To predict for a new applicant, you start at the root and follow the answers down until you reach a leaf.

This is one of the biggest attractions of decision trees: anyone can read them. A manager can look at the tree and understand exactly why an applicant was rejected, which matters a lot in areas like lending and medicine.

## How the tree picks its questions

The tree is built from the top down. At each step, it looks at the examples that reach that point and tries **every possible question**: every feature, and every possible threshold for that feature. "Income above ₹20,000? Above ₹25,000? Above ₹30,000?" and so on, for every feature.

For each candidate question, it asks: **how well does this separate the classes?** The best question is the one that leaves each side as "pure" as possible, meaning each side contains mostly one class.

Think of sorting a box of mixed red and blue marbles into two boxes with one rule. A rule that puts all the reds in one box and all the blues in the other is perfect. A rule that leaves both boxes half red and half blue is useless. The tree wants rules as close to perfect as possible.

## Measuring purity: Gini impurity

To compare questions, the tree needs a number for how mixed a group is. The most common one is **Gini impurity**:

Gini = 1 − (share of class A)² − (share of class B)²

- A group that's 100% one class has Gini = 1 − 1² − 0² = **0**. Perfectly pure.
- A group that's 50/50 has Gini = 1 − 0.5² − 0.5² = **0.5**. As mixed as it gets for two classes.
- A group that's 80/20 has Gini = 1 − 0.64 − 0.04 = **0.32**.

For each possible question, the tree calculates the Gini of the two groups it would create, weighted by their sizes, and picks the question with the lowest result, the biggest drop in impurity. Then it repeats the same process separately on each side. Another popular measure, **entropy**, comes from information theory and usually picks very similar questions.

For predicting numbers instead of classes, a **regression tree** works the same way, but chooses the questions that make the values in each group as similar as possible (lowest squared error), and each leaf predicts the average value of its group.

## Why trees overfit so easily

If you let a tree keep asking questions, it will. It keeps splitting until every leaf is perfectly pure, even if that means a leaf containing just one training example. At that point, the tree gets 100% of the training data right.

But look at what it has learned. Some of those final questions are carving out tiny boxes around single, possibly noisy examples: "if income is between ₹41,200 and ₹41,350 and age is 37, reject". That's not a real pattern; it's memorisation. On new data, those tiny rules are just as likely to be wrong as right. This is **overfitting**, and unrestricted decision trees are famous for it.

## Keeping the tree in check

The fix is to limit how much the tree can grow. This is the tree version of regularization. The common settings are:

- **max_depth**: the maximum number of questions in a row. A depth of 3 to 6 is often plenty.
- **min_samples_leaf**: every leaf must contain at least this many training examples, so the tree can't carve out tiny boxes.
- **min_samples_split**: a node needs at least this many examples before it's allowed to split.
- **Pruning**: grow a big tree, then cut back branches that don't improve performance on validation data.

You choose these settings with cross-validation, just like K in KNN or λ in regularization. In the Decision Tree lab, you can watch training accuracy race to 100% while test accuracy peaks and then falls, and see how limiting the depth fixes it.

## Strengths and weaknesses

Trees have real advantages. They're easy to explain. They handle both numbers and categories. They don't need feature scaling, because a question like "income above ₹40,000?" works the same whatever the units. And they can capture interactions automatically, like "high income matters only if there's no existing loan".

Their weaknesses: they overfit easily, their borders are made of straight horizontal and vertical steps, and they're **unstable**. A small change in the training data can produce a completely different tree. This instability is exactly what the next big idea, **ensembles**, fixes. Random forests build hundreds of trees on slightly different data and let them vote. Gradient boosting builds trees one after another, each fixing the mistakes of the ones before. Both are among the most powerful methods for table-shaped data.

## What to remember

A decision tree predicts by asking a series of yes/no questions about the features. At each step, it picks the question that best separates the classes, measured by how much it lowers Gini impurity. Left unchecked, it grows until it memorises the training data, so you limit its depth and leaf size. Trees are easy to read and need no scaling, and combining many of them gives random forests and gradient boosting.
`;
