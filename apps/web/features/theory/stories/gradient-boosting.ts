export const story = String.raw`
## A sculptor and a block of stone

A sculptor starts with a rough block of marble. She doesn't carve the finished statue in one stroke. First she knocks off large chunks to get the rough shape of a person. Then she steps back, looks at where it's still wrong, and carves away a little more there: the shoulders are too wide, the head too square. Then she looks again and fixes the next most obvious problem. Each pass removes a bit of the remaining error, and slowly the statue emerges.

**Boosting** builds a model the same way. It starts with a very rough prediction, looks at where it's still wrong, adds a small model that corrects those mistakes, then looks again and adds another. Each new piece focuses on what the pieces before it got wrong. Gradient boosting, built this way from small decision trees, is one of the most accurate methods for table-shaped data, and it wins a large share of data science competitions.

## Boosting versus random forests

Random forests and boosting both combine many trees, but in opposite ways.

- A **random forest** grows hundreds of trees **independently**, each on its own random sample, and averages them. Each tree is deep and strong on its own; averaging cancels out their individual errors.
- **Boosting** grows trees **one after another**. Each tree is small and weak on its own, often just a few questions deep, but each one is trained specifically to fix the mistakes left by all the trees before it.

A forest is like asking many independent experts and averaging their opinions. Boosting is like a team where each new member specialises in exactly the cases the team keeps getting wrong.

## Gradient boosting, step by step

Let's predict house prices with gradient boosting.

**Step 0: a rough start.** Before any trees, predict the same value for every house: the average price, say ₹60 lakh. That's a terrible model, but it's a starting point.

**Step 1: look at the leftovers.** For each house, compute the **residual**: actual price minus current prediction. A house that sold for ₹80 lakh has a residual of +20; one that sold for ₹45 lakh has −15. These residuals are exactly what the model still gets wrong.

**Step 2: fit a small tree to the residuals.** Train a small regression tree, maybe three levels deep, to predict those residuals from the features. It might learn something like "big houses near the metro are underestimated by about ₹15 lakh".

**Step 3: add a little of it.** Update every prediction by adding the tree's output, multiplied by a small number called the **learning rate**, say 0.1. The big house's prediction moves from ₹60 lakh to ₹61.5 lakh, a small step in the right direction.

**Repeat.** Compute the new residuals, fit another small tree to them, add a little of it. After hundreds of rounds, the many small corrections add up to an accurate model.

You can watch exactly this happen in the Gradient Boosting lab: the prediction curve starts flat and builds up step by step as each tree fixes the leftover errors.

## Why "gradient"?

For squared error, the residual (actual − predicted) is exactly the negative gradient of the loss with respect to the prediction. So "fit a tree to the residuals" means "fit a tree to the direction that reduces the loss fastest". Each round is a step of gradient descent, except that instead of adjusting weights, we add a tree.

This view makes boosting very flexible. For other losses, like log loss for classification or absolute error for outlier-heavy data, you just compute that loss's gradient and fit the next tree to it. The recipe stays the same.

## Why small steps and small trees?

It might seem faster to add each tree's full correction. The trouble is that the residuals include noise. Correct them fully, and the model chases that noise. A small learning rate means each tree only nudges the model, so no single tree can push it too far in a wrong direction. The model learns more slowly but more reliably, and usually ends up more accurate.

The same goes for tree size. Small trees, a few levels deep, each capture a simple pattern. Deep trees would each try to fix everything at once and overfit.

## Knowing when to stop

Unlike random forests, boosting **can** overfit if you keep adding trees. Training error keeps falling forever, because every new tree fixes more of the leftover training errors, including the noise. Test error falls at first, then levels off, then slowly rises.

The standard fix is **early stopping**: keep a validation set aside, track its error after each tree, and stop when it hasn't improved for a while. There's a useful trade-off here: a smaller learning rate needs more trees but usually reaches a better final result.

## AdaBoost, the original boosting

Before gradient boosting, there was **AdaBoost** (adaptive boosting). Instead of fitting residuals, it keeps a weight for every training example. After each round, examples the model got wrong get heavier weights, so the next weak learner, usually a one-question tree called a **stump**, pays more attention to them. Each learner also gets a say in the final vote based on how accurate it was. The AdaBoost and XGBoost page goes through its maths step by step.

## The settings that matter

- **n_estimators**: number of trees. Use early stopping rather than guessing.
- **learning_rate**: typical values 0.01 to 0.3. Smaller is usually better but slower.
- **max_depth**: usually 3 to 8. Small trees are the point of boosting.
- **subsample**: training each tree on a random fraction of the rows, like 80%, adds randomness that often helps, a technique called stochastic gradient boosting.

## What to remember

Gradient boosting starts from a simple prediction, then repeatedly fits a small tree to the current errors and adds a fraction of it. Each tree fixes what the previous ones got wrong, and each step is a step of gradient descent on the loss. Small trees and a small learning rate make it accurate and stable, and because it can overfit as trees are added, early stopping on validation data tells you when to stop.
`;
