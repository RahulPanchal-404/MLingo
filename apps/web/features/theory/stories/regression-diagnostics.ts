export const story = String.raw`
## The doctor reads the leftovers

When you visit a doctor, a good one doesn't just ask "how do you feel?" and leave it there. They check your temperature, your pulse, maybe a blood test. Those readings reveal problems you wouldn't notice yourself.

A regression model needs the same kind of check-up. Its overall score, like R² or RMSE, is the "how do you feel?" question. It can look fine while something important is wrong underneath. The real health check is in the **residuals**: the leftover errors, actual value minus predicted value, for every single example. Patterns in those leftovers tell you whether the model's assumptions hold, and whether you can trust its predictions and its weights.

## What a healthy model's leftovers look like

If a linear model has captured the real pattern, what's left over should be **pure noise**: small random ups and downs with no structure. Plot each residual against the model's prediction and you should see a shapeless horizontal band of dots, scattered evenly above and below zero, with the same width everywhere.

Any visible pattern means the model missed something. Learning to read these patterns is like learning to read an X-ray. Here are the four main things to check, and what each pattern looks like.

## Check 1: is the relationship really a straight line?

Linear regression assumes each feature affects the prediction by a steady amount. If the real relationship curves, the residuals will show it as a **curve** or **U shape**: the model underestimates at both ends and overestimates in the middle, or the other way round.

Think of predicting a car's fuel use from its speed. Fuel efficiency is worst at very low and very high speeds. A straight line can't follow that, and the residuals bend in a smile.

**Fix:** add curved features (like speed squared), transform a variable (for example, take the logarithm of a price), or use a more flexible model.

Note that "linear" here means linear in the **weights**. A model with x and x² as features is still linear regression, because it's a weighted sum. That's exactly why polynomial features fix curved residuals.

## Check 2: are the errors independent?

The model assumes that one example's error tells you nothing about the next one's. That's often broken when data comes in **time order**. If the model under-predicted sales yesterday, it probably under-predicts today too, because something it doesn't know about, like a festival season, is affecting both days.

Plot residuals in time order. If they drift in long runs above zero, then long runs below, instead of jumping around randomly, the errors are linked. This is called **autocorrelation**.

**Why it matters:** the model's predictions might still be decent, but its confidence is fake. Standard errors come out too small, so the model looks far more certain than it should.

**Fix:** add features that capture the time pattern, like last week's value or the month, or use a proper time-series model.

## Check 3: is the spread of errors constant?

Imagine predicting people's monthly spending from their income. For low-income people, spending varies a little. For high-income people, it varies enormously: some save most of it, some spend lavishly. Plot the residuals and you'll see a **funnel**: narrow on the left, wide on the right.

Constant spread has a long name, **homoscedasticity**; a changing spread is **heteroscedasticity**. When the spread changes, the model's predictions are still roughly fine on average, but its uncertainty estimates are wrong: too confident for the wide end, too cautious for the narrow end.

**Fix:** a log transform of the target often evens out the funnel, which is why prices and incomes are so often modelled on a log scale. Robust standard errors are another option when you need correct uncertainty.

## Check 4: are the errors roughly normal?

The classic formulas for confidence intervals and p-values on the weights assume the errors follow a bell curve. You can check with a histogram of the residuals, or a Q-Q plot, which lines the residuals up against an ideal bell curve; a straight line means normal.

This one matters less than people think. For predictions, it barely matters at all. For the weights' p-values, it matters mainly with small datasets; with a few hundred examples or more, the formulas work well even if the errors aren't quite normal.

## Outliers and influential points

Not all unusual points are equally dangerous.

- An **outlier** has an unusually large residual: the model predicts it badly. A flat listed at ₹5 crore in a ₹50-lakh neighbourhood might be a typo, or a penthouse.
- A point with high **leverage** has unusual feature values: it sits far from the other points along the x-axis, like the only 10,000 sq ft flat in a dataset of 1,000 sq ft flats.
- A point is **influential** when removing it changes the fitted line a lot. Influential points usually combine high leverage with a large residual. A single one can tilt the entire line towards itself.

A standard way to find influential points is **Cook's distance**, which measures how much all the predictions would change if that point were left out. Investigate the biggest ones. Never delete a point just because it's inconvenient. Delete it only if it's genuinely an error; otherwise, understand it, because it may be telling you the model is missing something.

## A practical routine

Every time you fit a regression model:

- Plot residuals against predictions. Look for curves and funnels.
- If the data has an order, especially time, plot residuals in that order.
- Look at the largest residuals and the most influential points one by one.
- Check a histogram of residuals if you plan to report p-values or intervals.

Five minutes of looking can save you from trusting a model that only looked healthy on paper.

## What to remember

Residuals, the leftover errors, are where a regression model's problems show up. A healthy model leaves a shapeless, even band of residuals. A curve means the relationship isn't straight; drifting runs mean errors are linked over time; a funnel means the spread changes; a skewed histogram matters mainly for small-sample p-values. Look for influential points that pull the whole line, and investigate them rather than deleting them blindly.
`;
