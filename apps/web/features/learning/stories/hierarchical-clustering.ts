export const story = String.raw`
## Building a family tree

Think about how families are related. You and your siblings are the closest group. Together with your cousins, you form a bigger group: your grandparents' family. Add your second cousins and you get an even bigger group, and so on, until eventually everyone belongs to one enormous extended family.

You don't have to decide in advance how many "groups" your family has. It depends on how far back you look. Look at just one generation and there are many small groups of siblings. Look back three generations and there are a few big branches.

**Hierarchical clustering** organises data exactly like a family tree. Instead of splitting points into a fixed number of groups like K-Means, it builds a whole tree of groups within groups. Then you decide how many clusters you want by choosing where to "cut" the tree.

## How it builds the tree, from the bottom up

The most common version is called **agglomerative** clustering, which just means "joining together". It works like this:

- **Start**: every point is its own little cluster. With 100 points, you have 100 clusters.
- **Step**: find the two clusters that are closest to each other, and merge them into one. Now you have 99 clusters.
- **Repeat**: find the closest two clusters again and merge them. 98. Then 97.
- **Finish**: keep going until everything has been merged into one single cluster.

Every merge is recorded, including how far apart the two clusters were when they were joined. That record is the family tree.

## The dendrogram: reading the tree

The tree is drawn as a diagram called a **dendrogram**. The points sit along the bottom. Every time two clusters merge, a horizontal line joins them, drawn at a height equal to the distance between them when they merged.

- Short connections near the bottom join points that are very close together, like siblings.
- Tall connections near the top join groups that are far apart, like distant branches of the family.

The dendrogram shows the structure of the data at every scale at once. You can see which points are tight little groups, which groups are close relatives, and which are very different.

## Cutting the tree to get clusters

To turn the tree into actual clusters, you draw a horizontal line across the dendrogram at some height and cut. Every branch that the line crosses becomes one cluster.

- Cut low, and you get many small clusters.
- Cut high, and you get a few big ones.

Where's the best place to cut? Look for the **tallest gap**, a long stretch of height where no merges happen. Merges below the gap join points that genuinely belong together. Merges above it join groups that are genuinely far apart. Cutting in the middle of that gap usually gives the most natural clusters. You can practise this in the Galaxy game's first level.

This is one of the method's big advantages over K-Means: you don't need to choose the number of clusters before you start. You build the tree once and can read off any number of clusters afterwards.

## How do you measure the distance between two groups?

Measuring the distance between two single points is easy. But after a few merges, you need the distance between two **groups** of points. There are several sensible ways, called **linkage** methods, and they give quite different results.

- **Single linkage**: the distance between the two **closest** points, one from each group. It's like saying two families are close if any two members are neighbours.
- **Complete linkage**: the distance between the two **farthest** points. Two families are close only if every member lives near every member of the other.
- **Average linkage**: the average distance over all pairs of points from the two groups.
- **Ward's method**: merge the two groups whose combination increases the total spread within clusters the least. This tends to make compact, evenly sized clusters, similar to K-Means.

## Why linkage matters

Different linkages suit different shapes.

**Single linkage** can follow long, snaking chains and rings, because it only needs one close pair to connect two groups. But that's also its weakness: a thin line of points between two separate clusters can act like a bridge and glue them together. This is called **chaining**.

**Complete linkage** and **Ward's method** ignore thin bridges and keep clusters compact and roundish. But they may cut a long, stretched-out cluster into pieces.

There's no single best linkage. Look at your data, think about what shape the groups probably have, and compare. Ward's method is a good default for most everyday data.

## Practical points

- **Scale your features.** Like K-Means and KNN, hierarchical clustering relies on distances.
- **It gets slow on big data.** The basic method compares every pair of clusters, so the work grows very fast with the number of points. It's comfortable with a few thousand points, but for hundreds of thousands, K-Means or DBSCAN are better choices.
- **Merges are final.** Once two clusters are joined, they're never separated again, even if a later view of the data suggests they shouldn't have been.

## Where it's used

Hierarchical clustering is popular wherever the tree itself is meaningful. Biologists use it to group genes or species by similarity and draw evolutionary trees. Shops use it to see how product categories relate at different levels of detail. And it's a great exploration tool: the dendrogram helps you decide how many clusters your data really has, even if you then use another method.

## What to remember

Agglomerative hierarchical clustering starts with every point alone and repeatedly merges the two closest clusters until one remains. The merges are drawn as a dendrogram, where the height of each join shows how far apart the groups were. Cut the tree at a height to get clusters, ideally in the biggest gap. The linkage method decides how the distance between groups is measured: single follows chains but can glue clusters together, complete and Ward keep them compact.
`;
