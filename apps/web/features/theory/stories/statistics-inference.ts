export const story = String.raw`
## Tasting the soup

A cook making a huge pot of sambar for a wedding wants to know if it needs more salt. She doesn't drink the whole pot. She stirs it well, tastes one spoonful, and decides for the entire pot.

That's a remarkable thing to do, and it works because of two ideas. First, if the pot is well stirred, one spoonful is a fair sample of the whole. Second, she knows one spoonful isn't perfect: a second spoon might taste slightly different. A good cook takes that wobble into account before adding a whole handful of salt.

**Statistical inference** is the science of that spoonful: using a sample to say something about a much bigger whole, and being honest about how sure you can be. In machine learning, you do this every time you report a test score. Your test set is a spoonful. The model's real performance on all future data is the pot.

## Every number from a sample wobbles

Suppose you want to know the average height of students at your college. Measuring all 5,000 is too much work, so you measure 50 random students and get an average of 166 cm.

If a friend measured a different random 50, they'd get a slightly different average, maybe 168 cm. A third friend might get 164 cm. None of them is "wrong". The sample average is itself a **random number**: it changes from sample to sample. What we really want is the true average of all 5,000, and each sample gives a slightly blurry view of it.

How blurry? That depends on two things:

- **How spread out heights are.** If everyone is about the same height, any sample of 50 gives nearly the same answer.
- **How big the sample is.** The bigger the sample, the less the average wobbles. The wobble shrinks with the square root of the sample size: to halve it, you need **four times** as many people.

The size of this wobble has a name: the **standard error**. It's the standard deviation of the data divided by the square root of the sample size.

## Confidence intervals: a range instead of a single guess

Since a single number hides the wobble, it's more honest to give a range. Instead of "the average height is 166 cm", say "the average height is somewhere between 163 and 169 cm". That range is a **confidence interval**.

A **95% confidence interval** is built so that if you repeated the whole sampling process many times, about 95% of the intervals you'd build would contain the true value. A rough recipe for an average is: sample average ± 2 × standard error.

A common misunderstanding is worth clearing up. A 95% interval doesn't mean "there's a 95% chance the true value is in *this* range". The true value is fixed; it's either in there or not. The 95% describes how reliable the *method* is, like a fisherman whose net catches the fish 95 times out of 100.

In ML, this is extremely practical. If your model scores 87% accuracy on 200 test examples, the interval is roughly 82% to 92%. If a second model scores 89%, that difference is well inside the wobble, and you can't honestly claim it's better.

## Hypothesis tests: is the difference real or luck?

Your team changes the "Buy" button on an app from grey to orange. With the old button, 10% of visitors bought something. With the new one, 11% did. Did the orange button help, or did you just get a lucky week?

A **hypothesis test** answers this in a slightly backwards but clever way. You start by assuming the boring explanation: "the button makes no difference". This is the **null hypothesis**. Then you ask: if that boring explanation were true, how surprising would a difference this large be, just by chance?

That surprise level is the **p-value**: the probability of seeing a difference at least this big if there were really no effect.

- A small p-value, say 0.01, means "this would be very unlikely by pure luck", so you have evidence the button matters.
- A large p-value, say 0.4, means "luck could easily produce this", so you don't have evidence either way.

By convention, people often treat p below 0.05 as "statistically significant". But keep three warnings in mind:

- A p-value is **not** the probability that the null hypothesis is true.
- "Significant" doesn't mean "important". With millions of users, a 0.01% improvement can be significant but worthless.
- If you run twenty tests, one will probably come out "significant" by pure chance. Testing many things at once needs extra care.

## A/B tests in machine learning

When a company wants to know if a new recommendation model is better than the old one, it runs an **A/B test**: randomly show half the users the old model (A) and half the new one (B), then compare a metric like clicks or purchases with a hypothesis test.

The word **randomly** is doing a lot of work. If the new model were shown only to users in one city, any difference might come from the city, not the model. Random assignment makes the two groups alike in every way except the thing you changed, so the difference can be blamed on the change.

## The bootstrap: when the formulas run out

The formulas for standard errors work well for simple numbers like averages. But what if you want a confidence interval for something complicated, like a model's F1 score, or the median, or the difference in AUC between two models? The formulas get hard or don't exist.

The **bootstrap** is a beautifully simple workaround. You pretend your sample is the whole pot, and take many new "spoonfuls" from it:

- Draw a new sample of the same size from your data, picking rows **at random with replacement**, so some rows appear twice and some not at all.
- Compute the number you care about on this new sample.
- Repeat a thousand times.

The spread of those thousand numbers shows how much your statistic wobbles. The middle 95% of them is a bootstrap confidence interval. No formula needed, just a computer doing the same calculation many times. The same resampling idea is the "bagging" behind random forests.

## What to remember

A sample is a spoonful of a bigger pot, so any number computed from it wobbles; the standard error measures how much, and it shrinks with the square root of the sample size. A confidence interval reports a range that is honest about that wobble. A hypothesis test asks how surprising a result would be if nothing were going on, and the p-value is that surprise level. The bootstrap gets intervals for anything by resampling your data many times.
`;
