export const story = String.raw`
## The cricket selector's ranking

A cricket selector has to choose players for a tournament. Rather than saying "yes" or "no" to each player straight away, she first **ranks** all 30 candidates from most to least promising. Only then does she decide where to draw the line: the top 15 make the squad.

Notice there are two separate skills here. One is **ranking**: does she put the genuinely good players near the top? The other is **choosing the cut-off**: given the ranking, where should the line go? A selector can be excellent at ranking and still pick the wrong cut-off, or vice versa.

Classifiers work the same way. They first give each example a score, like a probability of fraud, which ranks the examples. Then a threshold turns scores into decisions. This page is about judging the ranking itself, separately from any one threshold, using the **ROC curve** and **AUC**, and about whether the scores can be trusted as real probabilities, which is called **calibration**.

## One threshold gives one confusion matrix

Suppose a fraud model gives every transaction a score between 0 and 1. If you pick a threshold of 0.5, you get one confusion matrix: so many frauds caught, so many false alarms. Pick 0.3 instead and you get a different one: more frauds caught, more false alarms. Every threshold gives a different trade-off.

Comparing two models at a single threshold can be unfair. Model A might look better at 0.5 and worse at 0.3. What we want is a way to see the model's performance at **every** threshold at once.

## The ROC curve: every threshold in one picture

The **ROC curve** (receiver operating characteristic, a name from radar engineering in the Second World War) does exactly that. For every possible threshold, compute two numbers:

- **True positive rate (TPR)**, which is recall: of all real frauds, the share caught.
- **False positive rate (FPR)**: of all honest transactions, the share wrongly flagged.

Plot FPR along the bottom and TPR up the side, one dot per threshold, and join the dots.

- A threshold of 1 flags nothing: TPR = 0, FPR = 0. Bottom-left corner.
- A threshold of 0 flags everything: TPR = 1, FPR = 1. Top-right corner.
- Thresholds in between trace a curve from one corner to the other.

A great model's curve shoots up the left side quickly: it catches most frauds before raising many false alarms. A useless model that guesses at random gives a straight diagonal line, because it flags frauds and honest transactions at the same rate.

## AUC: one number for the whole curve

The **AUC** is the **area under the ROC curve**. It runs from 0 to 1:

- 1.0: perfect ranking.
- 0.5: no better than random guessing (the diagonal).
- Below 0.5: worse than random, which usually means the labels are flipped somewhere.

AUC has a lovely plain meaning: **pick one random fraud and one random honest transaction; AUC is the probability that the model gives the fraud the higher score.** An AUC of 0.9 means the model ranks a fraud above an honest transaction 90% of the time. It measures ranking quality, independent of any threshold.

## When positives are rare, look at precision–recall

ROC curves have a blind spot. Suppose only 1 transaction in 1,000 is fraud. A false positive rate of just 1% sounds tiny, but 1% of 999 honest transactions is about 10 false alarms for every 1 real fraud. The ROC curve looks excellent while, in practice, most alarms are false.

The **precision–recall curve** fixes this by plotting precision against recall for every threshold. Precision directly shows how many alarms are real, so the rare-class problem can't hide. Its summary number, **average precision** or PR-AUC, has a baseline equal to the share of positives (0.001 here), not 0.5. For rare events like fraud, disease or defects, precision–recall is usually the more honest view.

## Choosing the threshold from costs

The ROC and PR curves show you the menu of trade-offs; you still have to pick one. The right threshold comes from what mistakes cost. If missing a fraud costs ₹50,000 and checking a false alarm costs ₹200, you should accept many false alarms to catch more frauds, so the threshold goes low. Write the costs down, compute the total cost at each threshold on validation data, and pick the cheapest. The Gatekeeper game is built around exactly this decision.

## Calibration: does "70%" really mean 70%?

Ranking is one question. A different question is whether the scores mean what they say. If a weather model says "70% chance of rain" on 100 different days, it should actually rain on about 70 of them. If it rains on only 40, the model is **overconfident**, even if it ranks rainy days above dry ones perfectly.

A model whose probabilities match real frequencies is **well calibrated**. You check it with a **reliability diagram**: group predictions into bins (0–10%, 10–20% and so on), and for each bin, plot the average predicted probability against the actual share of positives. A well-calibrated model's points lie on the diagonal.

Calibration matters whenever someone reads the number as a real probability: a doctor telling a patient their risk, a bank pricing a loan, an insurer setting a premium. Logistic regression is usually reasonably calibrated. Many other models, like random forests, boosted trees and SVMs, often aren't, and can be fixed afterwards with **Platt scaling** or **isotonic regression**, which learn a mapping from raw scores to honest probabilities on held-out data.

## What to remember

A classifier's scores rank examples; a threshold turns them into decisions. The ROC curve shows the true positive rate against the false positive rate at every threshold, and AUC is the chance a random positive is scored above a random negative. When positives are rare, precision–recall curves are more honest. Choose the threshold from the costs of each mistake, and check calibration whenever the scores will be read as real probabilities.
`;
