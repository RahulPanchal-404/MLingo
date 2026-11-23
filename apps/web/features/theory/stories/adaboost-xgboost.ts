export const story = String.raw`
## A coach and the hardest shots

A badminton coach trains a beginner. In the first session, the player practises every kind of shot equally. Afterwards, the coach notes which shots went wrong: mostly the backhand clears and the drop shots at the net.

In the next session, the coach doesn't repeat everything equally. She spends most of the time on the shots that failed. After that session, a few shots are still weak, so the next session focuses on those. Session by session, the training **reweights itself** towards whatever is still going wrong.

At the end, the coach also judges which sessions helped most. A session that fixed a lot of problems counts for more in the player's final style than one that barely made a difference.

That's **AdaBoost**: train a sequence of simple models, each one focusing harder on the examples the previous ones got wrong, and combine them with votes weighted by how good each one was. This page goes through AdaBoost's maths in plain terms, and then **XGBoost**, the modern, heavily engineered version of gradient boosting that dominates competitions on table data.

## AdaBoost's building block: the stump

AdaBoost usually uses the weakest sensible model there is: a **decision stump**, a tree with just one question. "Is income above ₹40,000? Yes: approve. No: reject." On its own, a stump is barely better than guessing. AdaBoost's magic is turning many of them into a strong model.

## Step 1: every example starts with equal weight

Give every training example a weight. With 100 examples, each starts at 1/100. Train the first stump on the weighted data and look at which examples it gets wrong.

The stump's **weighted error** is the total weight of the examples it misclassified. If it gets 20 examples wrong and each weighs 1/100, its weighted error is 0.2.

## Step 2: how much say does this stump get?

A stump with low error should have a big say in the final vote; one that's barely better than chance should have little. AdaBoost gives each stump a voting weight:

α = ½ × ln((1 − error) ÷ error)

You don't need to memorise it, just its behaviour:

- error 0.5 (a coin flip): α = 0. No say at all.
- error 0.2: α = ½ × ln(4) ≈ 0.69.
- error 0.05: α = ½ × ln(19) ≈ 1.47. A strong voice.

## Step 3: make the mistakes heavier

Now the coach's trick. Every example the stump got **wrong** has its weight multiplied by e^α, making it heavier. Every example it got **right** is multiplied by e^(−α), making it lighter. Then all the weights are rescaled to add up to 1.

With error 0.2 and α ≈ 0.69, the 20 misclassified examples each become twice as heavy and the 80 correct ones half as heavy, before rescaling. After rescaling, the misclassified examples together carry exactly half the total weight. The next stump is forced to take them seriously: to do well, it must get many of them right.

## Step 4: the final vote

Repeat for many rounds. Each round adds one stump with its voting weight α. To classify a new example, each stump votes +1 or −1, the votes are multiplied by their α, and the sign of the total decides the class.

AdaBoost is sensitive to noisy labels. A mislabelled example keeps getting misclassified, so its weight keeps growing, and later stumps waste effort trying to fit it. Clean data helps AdaBoost a lot.

## XGBoost: gradient boosting, engineered

Gradient boosting, which you met on the boosting page, fits each new tree to the gradient of the loss. **XGBoost** (extreme gradient boosting) keeps that idea and adds several improvements that make it faster, more accurate and harder to overfit.

**A second-order look at the loss.** Plain gradient boosting uses the slope of the loss (the first derivative) to decide what to fit. XGBoost also uses the **curvature** (the second derivative), which tells it not just which way to move but roughly how far. It's like a hiker who notices not only that the ground slopes down, but also how quickly it's flattening out, and adjusts the step accordingly.

**Each leaf gets the best possible value.** Using the slope and curvature, XGBoost computes the exact optimal output for each leaf: minus the sum of the gradients, divided by the sum of the curvatures plus the regularization strength λ. No guessing.

**Regularization built in.** XGBoost's objective includes penalties on tree complexity:

- **λ (lambda)**: a Ridge-style penalty on the size of leaf values, which shrinks extreme corrections.
- **γ (gamma)**: a minimum improvement a split must achieve. If splitting a node doesn't reduce the loss by at least γ, the split isn't made, which prunes useless branches automatically.

**A formula for split quality.** Every candidate split gets a gain score, computed from the gradient and curvature sums on each side. The tree picks the split with the highest gain, and only if it beats γ.

**Engineering for speed.** XGBoost handles missing values by learning which way they should go at each split, bins feature values to speed up the search for thresholds, runs in parallel across CPU cores, and can train on GPUs. Close relatives, LightGBM and CatBoost, use similar ideas with their own speed tricks.

## How to tune XGBoost in practice

- Start with **learning_rate** around 0.05 to 0.1 and use **early stopping** to choose the number of trees.
- Tune **max_depth** (often 3 to 8) and **min_child_weight**, which limits how small a leaf can be.
- Add randomness with **subsample** and **colsample_bytree** (fractions of rows and columns per tree, like 0.8).
- Increase **lambda** or **gamma** if the model overfits.

## What to remember

AdaBoost trains simple stumps one after another, reweights the training examples so each new stump focuses on the previous mistakes, and gives each stump a vote weight α = ½ ln((1 − error) / error). XGBoost is gradient boosting with a second-order view of the loss, exact optimal leaf values, built-in penalties (λ on leaf values, γ on splits) and heavy engineering for speed. Both turn many weak trees into one strong model; XGBoost and its relatives are the standard for table data today.
`;
