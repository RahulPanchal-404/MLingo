export const story = String.raw`
## The detective with a notebook of clues

A detective at a railway station is trying to spot pickpockets in the crowd. Over the years, she's kept careful notes. She knows that only about 1 person in 100 at the station is a pickpocket. She knows that pickpockets often wear a loose jacket, often hang around the ticket counter without buying a ticket, and often glance around nervously. She also knows how common each of those things is among ordinary travellers.

Now she sees someone in a loose jacket, loitering by the counter, glancing around. She doesn't need a complicated theory. She combines the clues: each one makes "pickpocket" more or less likely, and together they shift her belief from "1 in 100" to "worth keeping an eye on".

That's **Naive Bayes**: a classifier that starts from how common each class is, then updates that belief using each clue, one at a time. It's one of the oldest machine learning methods, and it's still the classic choice for text tasks like spam filtering.

## Starting point: how common is each class?

Before looking at any clues, the detective knows the base rate: 1% pickpockets, 99% travellers. This starting belief is called the **prior**.

The prior matters a lot. Even very suspicious-looking behaviour has to fight against the fact that pickpockets are rare. You saw this effect in the probability lesson with the rare-disease test: when something is rare, even good evidence often leaves it fairly unlikely.

## Each clue updates the belief

For each class, the detective knows how likely each clue is:

- Among pickpockets, 60% wear loose jackets. Among travellers, only 20% do.
- Among pickpockets, 70% loiter at the counter. Among travellers, 5% do.

These are called **likelihoods**: the probability of seeing a clue, given the class. A clue is useful when its likelihood is very different between the classes. Loitering is a strong clue (70% against 5%); the jacket is a weaker one (60% against 20%).

**Bayes' rule** combines the prior with the evidence:

probability of the class given the clues ∝ prior × likelihood of the clues for that class

The "∝" means "proportional to". We compute this for every class and then scale the results so they add up to 1.

## The "naive" part

To use this, we need the likelihood of seeing *all* the clues together, for each class. With many clues, that's a problem: there are too many combinations to ever have data for each one.

Naive Bayes makes a bold simplifying assumption: **within each class, the clues are independent of each other**. It assumes that, among pickpockets, wearing a loose jacket says nothing about whether they loiter. Then the likelihood of all the clues together is simply the product of each one:

P(jacket and loitering | pickpocket) = P(jacket | pickpocket) × P(loitering | pickpocket)

That's the "naive" bit. In real life, clues are often related. But this simplification makes the model incredibly fast and needs very little data, because it only has to learn how common each clue is on its own, per class.

## Working it through

Let's score our suspicious person using the two clues above (we leave out the nervous glancing to keep the numbers small).

- **Pickpocket**: prior 0.01 × jacket 0.6 × loitering 0.7 = 0.0042
- **Traveller**: prior 0.99 × jacket 0.2 × loitering 0.05 = 0.0099

Scale them to add to 1: 0.0042 ÷ (0.0042 + 0.0099) ≈ **0.30**. So there's about a 30% chance this person is a pickpocket. That's a huge jump from the 1% base rate, but still less likely than not. The detective keeps watching rather than making an arrest.

## Why it's perfect for spam

Naive Bayes shines with text. Treat every word as a clue. From thousands of emails labelled spam or not spam, count how often each word appears in each class. "Lottery", "winner" and "urgent" appear far more often in spam; "meeting", "attached" and "regards" in normal email.

For a new email, multiply the prior by the likelihood of each of its words under each class, and compare. With thousands of possible words, the independence assumption is clearly wrong ("credit" and "card" often appear together), yet the classifier works remarkably well. It doesn't need the probabilities to be exactly right; it only needs the **correct class to come out on top**, and that's much easier.

## Two practical problems and their fixes

**A word never seen in a class.** If "blockchain" never appeared in any normal email in the training data, its likelihood for that class is 0, and multiplying by 0 wipes out all the other evidence. One unfamiliar word would make the email "impossible" as normal mail. The fix is **Laplace smoothing**: add a small count, usually 1, to every word in every class, so nothing is ever exactly zero.

**Numbers too small to store.** Multiplying hundreds of small probabilities gives a number so tiny the computer rounds it to zero. The fix is to add **logarithms** of the probabilities instead of multiplying the probabilities themselves. The class with the highest total still wins.

## Flavours of Naive Bayes

- **Multinomial NB**: for counts, like how many times each word appears. The standard choice for text.
- **Bernoulli NB**: for yes/no features, like whether each word appears at all.
- **Gaussian NB**: for continuous numbers, like height or temperature, assuming each feature follows a bell curve within each class.

## Strengths and weaknesses

Naive Bayes trains in a single pass over the data, works well with small datasets and thousands of features, and is easy to explain: you can list the words that pushed an email towards spam. It's a great first baseline for any text problem.

Its probabilities, though, are usually **overconfident**, because the independence assumption counts related clues as separate evidence. Use it for ranking and decisions, but don't trust its "99.99% spam" literally. And when features interact strongly, more flexible models usually beat it.

## What to remember

Naive Bayes starts with how common each class is (the prior) and multiplies in how likely each clue is under each class (the likelihoods), then picks the class with the highest result. The naive assumption, that clues are independent within a class, makes it fast and data-efficient. It's the classic baseline for text, needs smoothing so unseen words don't zero everything out, adds logs to avoid tiny numbers, and gives good decisions but overconfident probabilities.
`;
