export const story = String.raw`
## Building a road between two villages

Two villages sit on either side of a wide field, with houses scattered around each. The government wants to build a straight road across the field that separates them, so every house of village A is on one side and every house of village B is on the other.

Many straight roads would do that. Some would pass right next to the last house of village A; others would brush past village B. Which road is best?

The sensible answer is: **the one that stays as far as possible from the houses on both sides**. A road squeezed against one village leaves no room for error. If a new house is built a little beyond the edge, it might end up on the wrong side. A road running through the middle of the widest empty strip is the safest choice.

That's the idea behind a **support vector machine (SVM)**: among all the lines that separate two classes, choose the one with the widest gap to the nearest points on each side.

## The margin: the empty strip

Picture the road with a pavement on each side, widened until each pavement just touches the nearest house. The total width of road plus pavements is the **margin**. The SVM looks for the line whose margin is as wide as possible.

The houses that the pavements touch are called **support vectors**. They're the only points that matter. You could move or remove every other house, and as long as it stays behind the pavements, the best road wouldn't change at all. Move one support vector, though, and the road shifts.

That's an unusual and useful property. Most models are influenced by every training point. An SVM's decision depends only on the handful of difficult points near the border, which makes it robust to the many easy points far from the boundary.

## The maths in plain words

Like logistic regression, a linear SVM draws its boundary as w · x + b = 0, with points on one side scoring positive and points on the other side negative. The pavements are the lines where the score is +1 and −1.

It turns out the width of the margin is 2 ÷ ‖w‖, where ‖w‖ is the length of the weight vector. So **a wider margin means smaller weights**. The SVM's goal can be stated as: make the weights as small as possible, while keeping every point on the correct side of its pavement.

## When the villages overlap: soft margins

Real data is messy. A few houses of village A might be mixed in among village B. No straight road can separate them perfectly, and insisting on it would either be impossible or produce a road twisted around a few odd houses.

The **soft-margin** SVM allows some points to sit inside the margin or even on the wrong side, but charges a penalty for each one. The penalty is the **hinge loss**:

- A point safely beyond its pavement costs nothing.
- A point inside the margin costs a little, more the deeper it is.
- A point on the wrong side of the road costs more still.

The setting **C** controls the trade-off:

- **Large C**: violations are expensive. The SVM tries hard to classify every training point correctly, accepting a narrow margin. Risk: overfitting to noisy points.
- **Small C**: violations are cheap. The SVM prefers a wide, simple margin, accepting a few mistakes. Risk: underfitting.

As always, choose C with cross-validation. You can watch the margin widen and shrink as C changes in the SVM lab.

## Curved borders: the kernel trick

What if the two villages aren't separated by a straight road at all, say, village A sits in a ring around village B? No straight line can separate a ring from its centre.

Here's a clever idea. Add a new feature: each house's distance from the centre of the field. In this new view, village B's houses all have small distances and village A's have large ones, so a simple threshold, which is a straight boundary in the new feature, separates them perfectly. Back on the original map, that straight boundary becomes a circle.

The **kernel trick** makes this practical. An SVM can work as if the data had been moved into a much richer space, with many new features, without ever computing those features. It only needs a **kernel**: a function that measures similarity between two points.

- **Linear kernel**: the plain straight-line SVM.
- **Polynomial kernel**: curved boundaries built from feature combinations.
- **RBF (radial basis function) kernel**: the most popular. It measures similarity by distance, so points close together count as similar. It can draw almost any smooth boundary. Its setting **gamma** controls how far each point's influence reaches: large gamma gives tight, wiggly boundaries around individual points (overfitting risk); small gamma gives smooth, broad ones.

## Practical notes

- **Scale your features.** SVMs measure distances and margins, so a feature with big numbers dominates. Standardise first, always.
- **Tune C and gamma together**, with a grid search and cross-validation.
- **Size matters.** Kernel SVMs are excellent on small and medium datasets, but training slows down a lot beyond tens of thousands of examples. For big data, a linear SVM or other models are usually better.
- **Scores, not probabilities.** An SVM outputs a distance from the boundary, not a probability. If you need probabilities, calibrate the scores afterwards.

## What to remember

An SVM chooses the boundary with the widest margin to the nearest points of each class; those nearest points are the support vectors, and they alone decide the boundary. A wider margin means smaller weights. Soft margins allow some violations, priced by the hinge loss, with C setting the trade-off between a wide margin and few errors. The kernel trick, usually with the RBF kernel, lets an SVM draw curved boundaries. Always scale features and tune C and gamma with cross-validation.
`;
