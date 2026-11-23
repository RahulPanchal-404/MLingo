export const story = String.raw`
## Spotting crowds from a drone

Imagine flying a drone over a big festival ground in the evening. From above, you see people spread across the field. In some places, people are packed tightly together: one crowd in front of the main stage, a curving line of people along the food stalls, a ring of people around a fire dancer. In between, the ground is mostly empty, with a few people wandering around alone.

How would you describe what you see? You wouldn't say "there are exactly three round groups". You'd say: **wherever people are densely packed, that's a crowd**, whatever its shape. And the scattered people walking alone aren't part of any crowd at all.

That's precisely how **DBSCAN** thinks. Its full name is Density-Based Spatial Clustering of Applications with Noise, which is a mouthful, but the idea is the drone's: clusters are areas where points are packed closely together, separated by areas where they're sparse. And points that don't belong anywhere are labelled as **noise**.

## Why we need another clustering method

K-Means is great for round, evenly sized groups, but it has three big limits:

- You have to choose the number of clusters in advance.
- It assumes clusters are roughly round, so it slices curved or stretched shapes into pieces.
- It forces every single point into a cluster, even obvious outliers.

DBSCAN avoids all three. It finds the number of clusters by itself, it can find clusters of any shape, and it happily says "this point doesn't belong to any cluster".

## The two settings: reach and crowd size

DBSCAN has two settings you choose:

- **eps** (epsilon): how far each point can "reach". Think of it as the radius of a circle drawn around each point.
- **minPts**: how many points must be within that circle for the area to count as dense, a crowd.

With these two numbers, every point is put into one of three roles.

## Core points, border points and noise

- A **core point** has at least minPts points (counting itself) within its eps circle. It's standing in the middle of a crowd.
- A **border point** doesn't have enough neighbours to be a core point itself, but it's within reach of a core point. It's at the edge of a crowd.
- A **noise point** is neither: not enough neighbours, and not near any core point. It's someone wandering alone.

## How clusters grow

DBSCAN builds clusters by chaining core points together:

- Pick a core point that hasn't been visited yet. Start a new cluster with it.
- Add every point within its eps circle to the cluster.
- For each of those that is also a core point, add all of *its* neighbours too.
- Keep spreading like this until no more points can be reached. That's one complete cluster.
- Move on to the next unvisited core point and start a new cluster.
- Anything never reached is noise.

Because a cluster grows by hopping from one dense neighbourhood to the next, it can follow any shape: a curve, a ring, a long winding band, as long as the points along it are packed closely. That's why DBSCAN can find the ring around the fire dancer that K-Means would chop into pieces.

## Choosing eps and minPts

These two settings decide everything, so it's worth understanding what happens when they're off.

**eps too small**: the circles barely reach anyone. Very few points have enough neighbours, so most of the data is labelled noise and real clusters break into fragments.

**eps too large**: the circles reach across the empty gaps between groups. Separate clusters merge into one giant cluster.

**minPts** controls how strict "dense" is. A larger minPts means a point needs more neighbours to be a core point, so lonely points near a cluster are more likely to be labelled noise instead of being swallowed. A common starting point is minPts = 2 × (number of features), and at least 3 or 4.

A useful trick for choosing eps is the **k-distance plot**: for every point, measure the distance to its k-th nearest neighbour (with k = minPts), sort these distances and plot them. The curve stays low and flat for points inside clusters, then bends sharply upwards for outliers. The distance at the bend is a good eps. You can experiment with both settings in the Galaxy game.

## Noise is a feature, not a failure

One of DBSCAN's most useful abilities is finding **outliers**. Every point labelled as noise is, by definition, somewhere sparse, far from the crowds. That makes DBSCAN a natural tool for spotting unusual cases:

- A card transaction far away from a customer's normal patterns.
- A sensor reading that doesn't fit with the others.
- A star that doesn't belong to any galaxy.

K-Means can't do this, because it puts every point in some cluster, and an outlier just drags its cluster's centre off course.

## Where DBSCAN struggles

DBSCAN isn't perfect:

- **Clusters with different densities**: one eps can't suit both a tightly packed cluster and a loose one. Choose eps for the tight one and the loose one dissolves into noise; choose it for the loose one and nearby tight clusters merge. A related method, HDBSCAN, handles varying density better.
- **Many features**: as with KNN, distances become less meaningful in high dimensions, which makes "density" harder to define.
- **Scaling**: it uses distances, so features must be scaled first.

## Choosing between the clustering methods

| Method | Number of clusters | Cluster shapes | Handles outliers |
| --- | --- | --- | --- |
| K-Means | you choose K | round, similar size | no, every point gets a cluster |
| Hierarchical | choose by cutting the tree | depends on linkage | not directly |
| DBSCAN | found automatically | any shape | yes, labelled as noise |

A good habit is to plot your data first (or a 2-D view of it). Round blobs suggest K-Means. Curves, rings and scattered outliers suggest DBSCAN. Wanting to see structure at many levels suggests hierarchical clustering.

## What to remember

DBSCAN defines clusters as dense regions separated by sparse ones. A core point has at least minPts neighbours within distance eps; clusters grow by chaining core points together, so they can take any shape. Points that are never reached are labelled noise, which makes DBSCAN useful for finding outliers. eps and minPts control everything: too small and the data fragments into noise, too large and separate clusters merge.
`;
