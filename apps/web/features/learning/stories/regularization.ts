export const story = String.raw`
## The student who wrote too much

In a history exam, two students answer the same question about why a famous empire fell. The first writes a clear page covering the three main reasons. The second writes eight pages, listing every single event they've ever heard of, including the colour of the emperor's horse and the weather on a Tuesday, hoping some of it will match what the teacher wants.

The teacher prefers the first answer. Not because the second student knows nothing, but because they couldn't tell the important things from the noise. Their answer is complicated without being better.

Models can make the same mistake. Given enough flexibility, a model will use every feature and every wiggle it can to fit the training data, including the random noise. **Regularization** is how we tell the model: "keep it simple unless the data really demands complexity." It's one of the most useful ideas in practical machine learning.

## Big weights are a warning sign

In the last lesson, a high-degree polynomial overfit the data, swinging wildly between points. If you look at the weights of such a model, you'll usually see something telling: some of them are **huge**, often with big positive and big negative weights cancelling each other out. That's how the curve makes its sharp twists.

The same happens with many features. A model with 100 features and only 50 training examples can find a combination of large weights that fits the training data perfectly, but those weights are tuned to noise, and they fall apart on new data.

So here's the idea: **make large weights expensive**. If the model has to "pay" for every large weight, it will only use one when it really reduces the error.

## Adding a penalty to the loss

Normally, training minimises the error, for example the mean squared error. With regularization, we minimise the error **plus a penalty** that grows with the size of the weights:

total loss = error + λ × (size of the weights)

λ ("lambda") is a number you choose, called the **regularization strength**:

- λ = 0: no penalty. Plain linear regression, free to overfit.
- Small λ: a gentle nudge towards smaller weights.
- Large λ: weights are very expensive, so the model stays very simple and may underfit.

The model now has two goals pulling against each other: fit the data well, and keep the weights small. The best model under this rule fits the real pattern but refuses to bend over backwards for noise.

## Ridge: shrinking every weight a little

The most common penalty adds up the **squares** of the weights. This is called **Ridge regression**, or L2 regularization:

penalty = λ × (w₁² + w₂² + … + w_d²)

Ridge pushes every weight towards zero, with bigger weights pushed harder, because squaring makes them very expensive. But it rarely makes any weight exactly zero. Every feature still contributes, just more gently.

A nice way to picture Ridge: it's like a bridge with stiff beams. The bridge can still bend where it needs to, but it resists wobbling. You can see this in the Bridge game's "stiffness" levels: with no stiffness, a very bendy bridge wobbles through every pillar; with the right stiffness, it follows the canyon smoothly.

Ridge is especially helpful when features are strongly related to each other, like a flat's area in square feet and in square metres. Without regularization, the model can give one a huge positive weight and the other a huge negative weight. Ridge calms that down.

## Lasso: cutting features out completely

The other common penalty adds up the **sizes** of the weights, ignoring the sign. This is **Lasso regression**, or L1 regularization:

penalty = λ × (|w₁| + |w₂| + … + |w_d|)

The difference sounds small, but its effect is dramatic. Lasso tends to push the weights of unhelpful features **all the way to exactly zero**, removing them from the model entirely. So Lasso doesn't just shrink the model, it picks which features to keep. This is called **feature selection**.

Imagine predicting a house price from 50 features, many of which are irrelevant, like the owner's phone number's last digit. Lasso will typically set those weights to zero and keep only the handful that matter. The result is simpler, faster and easier to explain.

## Choosing between them

- Use **Ridge** when you think most features help a little, or when features are strongly correlated with each other.
- Use **Lasso** when you suspect only a few features really matter and you'd like the model to pick them.
- **Elastic Net** combines both penalties, and is a good choice when you have many correlated features and also want some selection.

## Two rules you must follow

**First, scale your features.** The penalty treats all weights equally. If one feature is measured in rupees and another in lakhs, their weights live on completely different scales, and the penalty will unfairly crush one of them. Standardise the features first so the penalty is fair.

**Second, choose λ with validation data.** Don't pick λ by looking at training error, because training error is always lowest with λ = 0. Try a range of values spread by factors of 10, such as 0.001, 0.01, 0.1, 1, 10, and pick the one with the lowest cross-validated error. scikit-learn's RidgeCV and LassoCV do this for you.

## Regularization is everywhere

The idea doesn't belong only to linear regression. Logistic regression in scikit-learn is regularized by default (its setting C is the inverse of λ). Neural networks use **weight decay**, which is Ridge by another name, and **dropout**, which randomly switches off neurons during training. Decision trees are regularized by limiting their depth. Whenever a model is powerful enough to memorise, some form of regularization keeps it honest.

## What to remember

Regularization adds a penalty for large weights to the loss, so the model only uses complexity when the data truly demands it. Ridge (squared weights) shrinks every weight; Lasso (absolute weights) can set weights to exactly zero and so selects features. λ controls the strength: too little and the model overfits, too much and it underfits. Always scale features first and choose λ with cross-validation.
`;
