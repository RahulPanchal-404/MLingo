export const story = String.raw`
## Two ways to price a second-hand bike

You want to sell your old motorbike and need a fair price. You could ask two kinds of experts.

The first is a **dealer** who sorts bikes with questions: "Is it less than 5 years old? Yes. Has it run less than 30,000 km? Yes. Is it a 150cc or bigger? No." After a few questions, the dealer has put your bike in a group, and says: "Bikes in this group usually sell for about ₹48,000."

The second is your **friend** who browses OLX every day. She says: "Let me find the five listings most similar to your bike, same model, similar year and kilometres, and see what they sold for." She averages those five prices and gets ₹46,500.

Neither expert draws a straight line through anything. Both give sensible answers, and both can follow patterns that a straight line can't. The dealer is a **regression tree**. Your friend is **KNN regression**. This page is about using these two classification ideas to predict numbers instead.

## Regression trees: questions, then an average

A regression tree works almost exactly like the decision trees you've met for classification. It asks a series of yes/no questions about the features, splitting the data into smaller and smaller groups. The difference is what happens at the end.

In a classification tree, each final group (a **leaf**) predicts the most common class. In a regression tree, each leaf predicts the **average** value of the training examples that ended up there. If the leaf "under 5 years, under 30,000 km, under 150cc" contains bikes that sold for ₹45,000, ₹49,000, ₹47,000 and ₹51,000, it predicts their average, ₹48,000, for any new bike that lands there.

## How the tree picks its questions

For classification, the tree chose questions that made each group as pure as possible. For regression, "pure" means **the values in each group are close together**.

So at each step, the tree tries every feature and every possible threshold, and for each candidate split, it measures how spread out the prices are on each side: the sum of squared differences from each group's average. It picks the split that reduces that spread the most. A good split puts all the cheap bikes on one side and all the expensive ones on the other, so each side's average is a good prediction for its members.

## What tree predictions look like

Because every leaf predicts a single fixed number, a regression tree's predictions form a **staircase**. Plot predicted price against age and you'll see flat steps: one price for bikes aged 0 to 2 years, another for 2 to 5, another for 5 to 9. Within a step, the prediction doesn't change at all.

This has consequences:

- Trees handle **curves and thresholds** naturally. If prices crash once a bike passes 10 years, a tree can capture that with one split. A straight line can't.
- Trees handle **interactions** naturally. "Kilometres matter a lot for old bikes but not for new ones" is just one question inside another.
- Trees **cannot extrapolate**. Ask about a bike newer than anything in the training data, and the tree just gives the value of its nearest step. It can never predict a price higher than the highest leaf average. This matters for data with trends, like prices that rise every year.
- Deep trees **overfit**: grown until every leaf holds one bike, the staircase follows every noisy sale exactly. Limit the depth or the minimum number of examples per leaf.

## KNN regression: average the most similar examples

KNN regression is the online-browsing friend. To predict for a new example:

- Measure how similar it is to every training example, using distance between their feature vectors.
- Pick the **K** closest ones.
- Predict the **average** of their values.

You can also weight the neighbours by distance, so a nearly identical listing counts more than one that's only somewhat similar.

The choice of K matters just as it does for classification. With K = 1, the prediction copies the single most similar example, noise and all, and jumps sharply from point to point. With a very large K, it averages over many dissimilar examples and flattens out real differences. The best K is found with validation data.

And the same warnings apply: **scale the features** first, or the feature with the biggest numbers decides who counts as similar; and with many features, distances become less meaningful.

## Trees, KNN or a straight line?

| | Linear regression | Regression tree | KNN regression |
| --- | --- | --- | --- |
| Shape it can follow | straight (or added curves) | steps, any shape | smooth-ish, any shape |
| Needs feature scaling | for the weights to compare | no | yes, always |
| Extrapolates beyond the data | yes, along the line | no, flat beyond the edge | no, copies the edge |
| Easy to explain | weights | the questions | "these similar cases" |
| Main risk | missing curves | overfitting when deep | bad K, unscaled features |

A useful mental model: linear regression assumes a global rule that applies everywhere. Trees and KNN make **local** predictions: they look only at examples that resemble the one in front of them. Local methods are flexible but need more data, and they can't predict outside the range they've seen.

On their own, regression trees are a bit jumpy. Combine hundreds of them, as random forests and gradient boosting do, and you get some of the most accurate models for table-shaped data.

## What to remember

A regression tree splits the data with yes/no questions chosen to make the values in each group as similar as possible, and each leaf predicts its group's average, giving a staircase of predictions. KNN regression averages the values of the K most similar training examples. Both can follow curves and interactions that a straight line misses, neither can extrapolate beyond the training data, trees need depth limits, and KNN needs scaled features and a well-chosen K.
`;
