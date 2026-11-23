export const story = String.raw`
## Grading two delivery apps

Two food delivery apps both show an estimated arrival time. You track ten of your orders on each app and write down how many minutes each estimate was off.

App A is always a little off: 3 minutes here, 4 minutes there, never more than 5. App B is usually spot on, but twice it was off by 25 minutes, and you ended up very hungry. Which app is "more accurate"?

There's no single right answer. It depends on what you care about. If you hate any error, App A's steady small misses might feel worse. If you hate being badly surprised, App B's two disasters matter more. **Regression metrics** are different ways of turning a list of errors into one number, and each one quietly answers that question differently. Picking a metric is picking what "good" means.

## MAE: the typical miss

The simplest metric is the **mean absolute error (MAE)**: take the size of every error, ignoring whether it's too high or too low, and average them.

If App A's errors were 3, 4, 2, 5, 3, 4, 3, 2, 4, 5 minutes, its MAE is 35 ÷ 10 = **3.5 minutes**. If App B's were 0, 1, 0, 25, 0, 1, 0, 25, 1, 0, its MAE is 53 ÷ 10 = **5.3 minutes**.

MAE is wonderfully easy to explain: "on average, the estimate is about 3.5 minutes off". It's in the same units as what you're predicting, and every minute of error counts equally. It's also fairly calm about outliers, because a 25-minute miss counts as 25, not more.

## MSE and RMSE: punish the big misses

The **mean squared error (MSE)** squares every error before averaging. For App A: 9, 16, 4, 25, 9, 16, 9, 4, 16, 25 add up to 133, so MSE = 13.3. For App B, the two 25-minute misses become 625 each, and the total is 1,253, so MSE = 125.3.

Squaring makes big errors dominate. App B's two disasters now outweigh everything else. MSE is the natural choice when large errors are much worse than small ones, and it's the loss most regression models are trained on, because it's smooth and easy to optimise.

The catch is that MSE is in "minutes squared", which nobody can picture. So people often take its square root: the **root mean squared error (RMSE)**. App A's RMSE is √13.3 ≈ **3.6 minutes**; App B's is √125.3 ≈ **11.2 minutes**.

Compare the two metrics. By MAE, App A is better, 3.5 against 5.3. By RMSE, App A is far better, 3.6 against 11.2, because RMSE punishes App B's big misses. A useful habit: if RMSE is much bigger than MAE, your model is making a few large errors, and it's worth looking at those cases.

## R²: compared with doing nothing clever

MAE and RMSE tell you the size of the errors, but not whether that's good. Is an RMSE of ₹2 lakh good for house prices? It depends on how much prices vary in the first place.

**R²** ("R-squared") answers by comparing your model with the laziest possible prediction: always guessing the average. It asks: what share of the variation in the target does my model explain, compared with that lazy guess?

- R² = 1: perfect predictions.
- R² = 0: no better than always guessing the average.
- R² below 0: worse than guessing the average. That happens, usually on test data, and it's a strong sign something is wrong.

R² is handy because it has no units: 0.8 means the same kind of thing for house prices and for delivery times. But it has a weakness on training data: adding any feature, even a useless random one, can never lower R². So a model stuffed with junk features looks better than it really is.

## Adjusted R²: a fee for every feature

**Adjusted R²** fixes that by charging a small penalty for each extra feature. A new feature has to improve the fit enough to pay its fee, or adjusted R² goes down. It's a quick sanity check when comparing models with different numbers of features, although checking error on held-out test data is still the more reliable test.

## Percentage errors and their trap

Sometimes a percentage feels more natural: "our forecast is off by 8% on average". That's the **mean absolute percentage error (MAPE)**: the average of each error divided by the true value.

MAPE is great for explaining to managers, but it has a nasty trap. When the true value is tiny, the percentage explodes. Predicting 3 sales when the truth was 1 is a 200% error, even though you were only off by 2. When the truth is zero, MAPE is undefined. It also punishes over-predictions and under-predictions unevenly. Use it only when the true values are comfortably far from zero.

## Which metric should you use?

- To **explain results to people**: MAE, or MAPE if values are never near zero.
- When **big errors are much worse** than small ones: RMSE.
- To see **how much better than a naive guess** you are: R².
- To **train** most models: MSE, because it's smooth.
- To compare models with **different numbers of features**: adjusted R², and always test data.

Whatever you choose, compute it on data the model **hasn't seen**. A metric on the training data tells you how well the model memorised, not how well it predicts.

## What to remember

MAE is the average size of the errors and is easy to explain. MSE squares them, punishing big errors heavily, and RMSE brings it back to the original units; if RMSE is much bigger than MAE, a few large errors are hiding. R² compares your model with always predicting the average, and adjusted R² adds a fee for each feature. MAPE gives percentages but breaks near zero. Always report metrics on held-out data.
`;
