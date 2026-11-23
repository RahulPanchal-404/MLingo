export const story = String.raw`
## Opening three new shops

A supermarket chain wants to open three new delivery warehouses in a city. It has the addresses of thousands of customers who order online. Where should the three warehouses go so that, on average, every customer is as close as possible to one of them?

Nobody gives the company the answer. There's no list saying "these customers belong to warehouse A". The company has to discover natural groups in the customer locations by itself, and put each warehouse in the middle of its group.

This is a **clustering** problem, and the classic method for solving it is **K-Means**. It's different from everything in the previous chapters: there are no labels, no right answers to learn from. The model's job is to find structure on its own. That's why clustering is called **unsupervised learning**.

## The idea in plain words

K-Means finds K groups (clusters) in the data, where K is a number you choose. Each cluster is represented by its centre, called a **centroid**. Every point belongs to the cluster whose centroid is nearest.

The goal is to place the centroids so that points are as close as possible to their own centroid. For the supermarket, that means each warehouse sits in the middle of the customers it serves, and the total travel distance is small.

## How it works: two steps, repeated

K-Means is a beautifully simple loop. Imagine you have customer locations on a map and you want K = 3 warehouses.

**Start**: drop 3 warehouses somewhere on the map, for example at 3 randomly chosen customer locations.

**Step 1, assign**: every customer goes to their nearest warehouse. Now the customers are split into 3 groups.

**Step 2, move**: each warehouse moves to the exact middle of its group, the average of all its customers' positions. That average position is the new centroid.

Now go back to step 1. Because the warehouses moved, some customers are now closer to a different warehouse, so they switch groups. Then the warehouses move again to the middle of their new groups.

Repeat these two steps until nothing changes: no customer switches groups, and the warehouses stop moving. At that point, K-Means has **converged**. It usually takes only a handful of rounds. You can watch every round in the K-Means lab, or herd the sheep yourself in the Sheepdogs game.

## Measuring how tight the clusters are

To judge a clustering, we add up the squared distance from every point to its own centroid. This total is called **inertia**, or the within-cluster sum of squares. Small inertia means points sit close to their centres: tight, well-defined clusters.

Every round of K-Means can only lower the inertia or keep it the same. Assigning each point to its nearest centroid can only reduce distances, and moving a centroid to the average of its points is exactly the position that minimises the squared distances to them. That's why the loop is guaranteed to stop.

## The catch: where you start matters

K-Means always reaches a stable result, but not always the best one. It depends on where the centroids start.

Imagine two warehouses start in the same neighbourhood, and the third starts far away. The first two may end up splitting one natural group of customers between them, while the third is stuck serving two separate neighbourhoods. The loop is stable, since nothing changes from round to round, but the result is poor. This is called a **local minimum**.

There are two standard fixes:

- **k-means++**: instead of choosing starting points completely at random, pick them spread out. Each new starting centroid is chosen with a preference for points far from the centroids already chosen. This is the default in scikit-learn.
- **Several runs**: run K-Means many times from different starting points and keep the result with the lowest inertia. scikit-learn's n_init setting controls this.

## Choosing K

K-Means needs you to choose K in advance, and that's often the hardest part. More clusters always means lower inertia: with as many clusters as points, the inertia is zero. So you can't just pick the K with the smallest inertia.

The **elbow method** is the usual starting point. Run K-Means for K = 1, 2, 3, 4, 5 and so on, and plot the inertia for each. At first the inertia drops sharply, because each new cluster splits up a real group. At some point, the drop suddenly slows down: extra clusters are only cutting existing groups in half. That bend in the curve looks like an elbow, and it suggests a good K.

Another measure, the **silhouette score**, checks how much closer each point is to its own cluster than to the next nearest one. Higher is better. And often, the best K comes from the real problem: if the company can only afford three warehouses, K = 3.

## What K-Means assumes

K-Means works best when clusters are roughly **round**, **similar in size** and **well separated**. Because each point simply goes to the nearest centre, the borders between clusters are straight lines. It struggles with:

- **Odd shapes**, like rings or long curved bands. K-Means will slice them into pieces. DBSCAN, later in this chapter, handles these better.
- **Very different sizes or densities**: a big spread-out cluster next to a small tight one.
- **Outliers**: one far-away point drags its centroid towards it, because every point must belong to some cluster.

And like KNN, K-Means uses distances, so **always scale your features first**. If income is in lakhs and age in years, income alone will decide the clusters.

## Where K-Means is used

- **Customer segmentation**: grouping customers by behaviour to design different offers.
- **Image compression**: grouping similar colours in a photo and replacing each with its cluster's colour.
- **Organising documents**: grouping news articles or support tickets by topic.
- **Finding locations**: warehouses, ATMs, delivery hubs.

## What to remember

K-Means splits unlabelled data into K groups by repeating two steps: assign every point to its nearest centroid, then move each centroid to the average of its points. It stops when nothing changes, and inertia measures how tight the clusters are. The result depends on the starting points, so use k-means++ and several runs. Choose K with the elbow method, the silhouette score or the needs of the problem, and always scale your features first.
`;
