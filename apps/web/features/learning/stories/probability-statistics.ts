export const story = String.raw`
## The weather forecaster's job

Every morning, a weather forecaster in Bengaluru has to answer a question nobody can know for sure: will it rain today? She can't say "yes" or "no" with certainty, because the atmosphere is far too complicated. So she says something more honest: "There is a 70% chance of rain."

What does that actually mean? It means that on many days that looked just like today, with the same clouds, winds and humidity, it rained on about 7 out of every 10. She's not guessing wildly. She's summarising experience with a number.

Machine learning models are forecasters too. A spam filter doesn't "know" an email is spam; it says "this is 96% likely to be spam". A model predicting house prices can't know the exact price; it gives its best estimate, and good models also say how unsure they are. To understand those models, you need the language of uncertainty: **probability** and **statistics**.

## Probability: a number for how likely something is

A **probability** is a number between 0 and 1 that says how likely something is to happen.

- 0 means it never happens.
- 1 means it always happens.
- 0.5 means it happens half the time, like a fair coin landing heads.

You can also write it as a percentage: 0.7 is 70%.

The simplest way to estimate a probability is to count. If a bakery sold 200 cakes last month and 50 were chocolate, the probability that the next cake ordered is chocolate is about 50 ÷ 200 = 0.25. Machine learning does exactly this, just with far more data and far more careful counting.

Two rules hold everything together:

- The probabilities of all possible outcomes add up to 1. If there's a 0.7 chance of rain, there's a 0.3 chance of no rain.
- For two things that don't influence each other (**independent** events), the chance of both happening is the product. Two fair coins both landing heads: 0.5 × 0.5 = 0.25.

## Conditional probability: what changes when you know something

Here's where probability starts to feel like intelligence. Suppose 1 in every 10 emails you get is spam. Now an email arrives containing the words "you have won a lottery". Is it still a 1 in 10 chance it's spam?

Of course not. Knowing that phrase changes everything. Among emails that say "you have won a lottery", almost all are spam. This is **conditional probability**: the probability of something *given* that you know something else. It's written with a vertical bar:

P(spam | contains "lottery") is read "the probability of spam given that the email contains lottery".

Almost every classifier in this course computes a conditional probability: the chance of a label **given** the features. Logistic regression outputs P(class = 1 | x). Naive Bayes is built entirely out of conditional probabilities.

## Bayes' rule: updating your belief

Imagine a medical test for a rare disease that 1 in 1,000 people have. The test is very good: it catches 99% of people who have the disease, and it wrongly flags only 5% of healthy people. Your test comes back positive. How worried should you be?

Most people guess 99%. The real answer is surprisingly low. Picture 100,000 people:

- 100 of them have the disease. The test catches 99.
- 99,900 are healthy. The test wrongly flags 5% of them, which is about 4,995.

So about 99 + 4,995 = 5,094 people test positive, and only 99 of them are actually sick. Your chance of having the disease is 99 ÷ 5,094, **about 2%**.

The reason is that the disease is so rare that false alarms among the huge healthy group outnumber the real cases. This way of updating a belief with new evidence is called **Bayes' rule**:

P(disease | positive) = P(positive | disease) × P(disease) ÷ P(positive)

You don't need to memorise it today. Just remember the lesson: **how rare something is matters as much as how good the test is**. You'll see it again when you deal with imbalanced data.

## Statistics: describing a pile of numbers

Probability is about predicting what might happen. **Statistics** is about describing what did happen, using data. Say you record the delivery time of your last 10 food orders, in minutes:

25, 30, 28, 35, 22, 30, 27, 90, 31, 29

How do you describe this in a sentence? Statistics gives us a few tools.

## The middle: mean and median

The **mean** (average) adds everything up and divides by the count. Here the total is 347, so the mean is 34.7 minutes.

But look at that 90. One order got badly delayed, maybe it rained. That single number pulls the mean up, and 34.7 doesn't feel like a "typical" delivery anymore.

The **median** is the middle value once the numbers are sorted. Sorted, the list is 22, 25, 27, 28, 29, 30, 30, 31, 35, 90. With 10 numbers, the median is halfway between the 5th and 6th: (29 + 30) ÷ 2 = 29.5 minutes. That feels much more typical.

The rule of thumb: the mean is sensitive to extreme values (**outliers**), the median is not. When a model fills in missing values, choosing between mean and median is exactly this decision.

## The spread: variance and standard deviation

Two restaurants can both average 30 minutes, but one always delivers in 28 to 32, while the other swings between 10 and 50. The average hides that difference. We need a number for **spread**.

The **variance** measures how far values typically are from the mean: subtract the mean from each value, square the difference (so negatives don't cancel positives), and average the squares. The **standard deviation** is the square root of the variance, which brings it back to the original units, minutes.

A small standard deviation means the values huddle close to the mean. A large one means they're scattered. You'll use the standard deviation constantly: standardising features means subtracting the mean and dividing by it, so every feature ends up on a comparable scale.

## The bell curve

Measure the heights of a thousand adults and draw a histogram. You'll get a familiar shape: most people near the middle, fewer and fewer as you go taller or shorter, symmetric on both sides. That shape is the **normal distribution**, or bell curve.

It's described by just two numbers: the mean (where the peak is) and the standard deviation (how wide it is). About 68% of values fall within one standard deviation of the mean, and about 95% within two. Measurement errors, test scores and many natural quantities roughly follow it, which is why so many models assume the noise in data is normal.

## Correlation: do two things move together?

Does a bigger house cost more? Usually yes. When one goes up, the other tends to go up too. **Correlation** measures how strongly two quantities move together in a straight-line way, on a scale from −1 to +1:

- +1: they rise together perfectly.
- 0: no straight-line relationship.
- −1: when one rises, the other falls perfectly.

One famous warning: **correlation is not causation**. Ice-cream sales and drowning accidents rise together, but ice cream doesn't cause drowning. Both rise in hot weather. Models find correlations; deciding what causes what needs more care.

## What to remember

Probability puts a number on uncertainty, and conditional probability updates it when you learn something new. How rare an event is matters as much as how accurate a test is. Statistics summarises data: the mean and median describe the middle, the variance and standard deviation describe the spread, and correlation describes how two things move together. Every model you'll build makes predictions under uncertainty, and these are the words it speaks in.
`;
