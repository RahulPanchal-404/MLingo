export const story = String.raw`
## The airport security puzzle

An airport scanner checks 10,000 bags a day. On a typical day, maybe 10 of them contain something dangerous. Someone proudly builds a "scanner" that simply says **"safe"** for every bag, without looking at anything.

How accurate is it? It's right about 9,990 bags out of 10,000. That's **99.9% accuracy**. And it's completely useless: it misses every single dangerous bag.

This little story is the reason this page exists. **Accuracy**, the share of predictions that are correct, sounds like the obvious way to grade a classifier, but it can be badly misleading, especially when the thing you care about is rare. To really judge a classifier, you need to look at **which kinds** of mistakes it makes.

## Two kinds of right, two kinds of wrong

For a yes/no problem, call the thing you're looking for the **positive** class (dangerous bag, fraud, disease, spam), and everything else **negative**. Every prediction falls into one of four boxes:

- **True positive (TP)**: it was dangerous, and the scanner flagged it. A catch.
- **True negative (TN)**: it was safe, and the scanner let it through. Correct and quiet.
- **False positive (FP)**: it was safe, but the scanner flagged it. A false alarm; someone's bag gets searched for nothing.
- **False negative (FN)**: it was dangerous, but the scanner let it through. A miss, and the most worrying box here.

Laying these four counts out in a 2 × 2 table gives the **confusion matrix**: actual class along one side, predicted class along the other. It's the single most useful thing to look at when evaluating a classifier, because every other metric is built from these four numbers.

## Precision: when you raise an alarm, are you right?

**Precision** asks: of all the bags the scanner flagged, how many were really dangerous?

precision = TP ÷ (TP + FP)

High precision means few false alarms. If a scanner flags 20 bags and 15 are really dangerous, precision is 75%. Precision matters most when false alarms are expensive or annoying: a spam filter with low precision keeps throwing your real emails into the spam folder.

## Recall: of all the dangers, how many did you catch?

**Recall** (also called sensitivity, or the true positive rate) asks: of all the bags that really were dangerous, how many did the scanner catch?

recall = TP ÷ (TP + FN)

If there were 10 dangerous bags and the scanner caught 9, recall is 90%. Recall matters most when misses are expensive: airport security, cancer screening, fraud detection. The "always safe" scanner has a recall of **0%**, which exposes it immediately, even with 99.9% accuracy.

## The tug of war between them

Precision and recall usually pull against each other. Most classifiers output a score or probability, and you choose a **threshold** above which you say "positive".

- **Lower the threshold** and you flag more bags. You catch more of the dangerous ones (recall goes up), but you also flag more safe ones (precision goes down).
- **Raise the threshold** and you flag fewer bags. Your alarms are more often right (precision up), but you miss more (recall down).

There's no free lunch; you choose the balance based on what each mistake costs. An airport accepts many false alarms to avoid missing one weapon. A spam filter accepts some spam getting through to avoid losing an important email.

## F1: one number for the balance

When you want a single number that balances both, the common choice is the **F1 score**, the harmonic mean of precision and recall:

F1 = 2 × precision × recall ÷ (precision + recall)

The harmonic mean is strict: it's only high when **both** are high. A model with 100% precision and 10% recall gets an F1 of about 18%, not 55%. So F1 can't be fooled by a model that's good at one and terrible at the other.

## Other metrics worth knowing

- **Specificity**: of all the truly safe bags, how many were correctly let through? TN ÷ (TN + FP). It's recall for the negative class.
- **Balanced accuracy**: the average of recall and specificity. It isn't fooled by rare classes; the "always safe" scanner gets only 50%.
- **Matthews correlation coefficient (MCC)**: a single score from −1 to +1 that uses all four boxes and stays honest even with very unbalanced classes.

## More than two classes

With several classes, like sorting news into sports, politics and business, you can compute precision and recall for each class (treating it as positive and the rest as negative), then combine them:

- **Macro average**: average the per-class scores equally. Every class counts the same, so poor performance on a small class shows up clearly.
- **Weighted average**: weight each class by how many examples it has. Big classes dominate.
- **Micro average**: pool all the counts together first. For single-label problems, micro precision, recall and accuracy all come out the same.

If a small class matters, like rare diseases, look at macro averages and at each class separately.

## What to remember

Accuracy can look great while the model misses everything that matters, especially when positives are rare. The confusion matrix splits predictions into true positives, true negatives, false positives (false alarms) and false negatives (misses). Precision asks how many alarms were right; recall asks how many real cases were caught. A threshold trades one for the other, F1 balances them, and the right choice depends on what each kind of mistake costs.
`;
