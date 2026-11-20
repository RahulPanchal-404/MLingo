import type { EasyTopic } from "./types";

const r = String.raw;

/** Easy layer: K-Means Clustering. */
export const KMEANS: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "K-means repeats two moves: give each point to its nearest centre, then move each centre to the average of its points. It stops when nothing changes. You choose how many centres ($k$).",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Placing delivery hubs",
          blocks: [
            { p: "A company wants 3 warehouses for 200 shops. Start with 3 random warehouse spots. Each shop is served by its nearest warehouse; then each warehouse moves to the middle of its shops. Repeat. The warehouses settle where they minimise the total squared driving distance." },
          ],
        },
      ],
    },
    "Choosing K": {
      examples: [
        {
          title: "Elbow and silhouette on four true groups",
          blocks: [
            { table: { head: ["$k$", "2", "3", "4", "5", "6"], rows: [["Inertia", "522", "116", "29", "26", "23"], ["Silhouette", "0.56", "0.75", "0.80", "0.68", "0.57"]] } },
            { p: "Inertia always falls as $k$ grows, but the drop flattens after $k = 4$ (the elbow), and the silhouette peaks at $k = 4$, which is the true number of groups in this generated data." },
          ],
        },
      ],
    },
    "1.2.10 PCA and clustering answer different questions": {
      plain: "PCA finds directions where the data spread out most; clustering groups similar rows. Neither looks at the label, so neither is guaranteed to find what predicts it.",
    },
    "2.20.1 K-means: objective, derivation, and complete iteration": {
      plain: "K-means minimises the total squared distance from each point to its centre. Assigning to the nearest centre and moving centres to means each lower that total, so the algorithm always settles.",
      replace: {
        1: { p: "Let $X$ be a matrix with $n$ observations and $p$ numeric features. Row $x_i$ is a vector in $\\mathbb{R}^p$. For a proposed $k$ between 1 and the number of distinct rows, let $c_i \\in \\{1, \\dots, k\\}$ denote the cluster assigned to observation $i$, and let $\\mu_j \\in \\mathbb{R}^p$ denote the center of group $j$. Ordinary K-means minimizes the within-cluster sum of squared Euclidean distances:" },
        9: { p: "Compare this with $k = 1$. The mean of all six points is $(14/3, 14/3)$. The total squared error can be computed by the identity $\\sum_i\\lVert x_i - \\bar x\\rVert^2 = \\sum_i\\lVert x_i\\rVert^2 - n\\lVert\\bar x\\rVert^2$. Here $\\sum_i\\lVert x_i\\rVert^2 = 0 + 4 + 4 + 128 + 164 + 164 = 464$ and $n\\lVert\\bar x\\rVert^2 = 6 \\times 392/9 = 784/3$, giving $608/3 \\approx 202.667$. Choosing two groups lowers training error dramatically on these particular points. This alone is not evidence that two meaningful categories exist in a real city." },
      },
    },
    "2.20.2 Initialization, scale, empty groups, and choosing k": {
      plain: "Results depend on scaling, starting centres and $k$. Scale features, run several starts, and choose $k$ by whether the groups are stable and useful, not just by the elbow.",
      replace: {
        1: { p: "The objective assumes Euclidean geometry and penalizes squared deviations. A tenfold rescaling of one coordinate multiplies that coordinate's squared-error contribution by 100. If daily occupancy has a much wider numerical range than transit travel time, the clusters may largely separate occupancy unless features are scaled or weighted on purpose. Standardizing coordinate $r$ to $z_{ir} = (x_{ir} - \\bar x_r)/s_r$ gives each coordinate approximately unit training-set spread when $s_r > 0$, but it makes one standard deviation, rather than one original unit, the unit of distance. For a constant feature $s_r = 0$: remove it or specify a safe policy. Fit means and scales on the designated training period and apply the same values to later data. Compare cluster interpretation in original units as well as in scaled space." },
      },
      examples: [
        {
          at: 3,
          title: "A bad start, a worse answer",
          blocks: [
            { p: "Six points in two clear groups. Start both centres inside the left group and K-means may split the left group in two and lump the right group onto one centre: inertia far above the best 10.67. Running 10–20 random starts and keeping the lowest inertia avoids this." },
          ],
        },
      ],
    },
    "2.20.5 Silhouette, stability, and whether clusters help": {
      plain: "Silhouette compares how close a point is to its own group versus the next group: near 1 is well placed, near 0 is on a border, negative is probably in the wrong group.",
      examples: [
        {
          at: 4,
          title: "Silhouette for a border point",
          blocks: [
            { p: "A point's average distance to its own group is $a = 4$ and to the nearest other group is $b = 5$: silhouette $= (5 - 4)/5 = 0.2$, close to the border. If $a = 6$ and $b = 5$: $(5 - 6)/6 = -0.17$, so it sits closer to the other group." },
          ],
        },
      ],
    },
  },
  code: {
    "2.20.1 K-means: objective, derivation, and complete iteration#0": {
      goal: "K-means from scratch with several random starts",
      code: r`import math
import random


def squared_distance(a, b):
    return sum((u - v) ** 2 for u, v in zip(a, b))


def nearest_labels(rows, centers):
    return [min(range(len(centers)),
                key=lambda j: (squared_distance(x, centers[j]), j))
            for x in rows]


def fit_kmeans(data, k, *, n_init=10, max_iter=100, seed=7):
    rows = [tuple(float(v) for v in row) for row in data]
    if not rows or not rows[0]:
        raise ValueError("Expected a nonempty rectangular table")
    p = len(rows[0])
    if any(len(x) != p or any(not math.isfinite(v) for v in x)
           for x in rows):
        raise ValueError("Rows must have equal width and finite numbers")
    unique = list(dict.fromkeys(rows))
    if not isinstance(k, int) or isinstance(k, bool) or not 1 <= k <= len(unique):
        raise ValueError("k must be between 1 and the number of distinct rows")
    if (not isinstance(n_init, int) or isinstance(n_init, bool)
            or not isinstance(max_iter, int) or isinstance(max_iter, bool)
            or n_init < 1 or max_iter < 1):
        raise ValueError("n_init and max_iter must be positive")

    rng = random.Random(seed)
    best = None
    for _ in range(n_init):
        centers = rng.sample(unique, k)
        for iteration in range(max_iter):
            labels = nearest_labels(rows, centers)
            groups = [[x for x, label in zip(rows, labels) if label == j]
                      for j in range(k)]
            if any(not group for group in groups):
                break  # This start has no mean for one center; retry another.
            updated = [tuple(sum(x[r] for x in group) / len(group)
                             for r in range(p)) for group in groups]
            centers = updated
            if nearest_labels(rows, centers) == labels:
                break
        # An empty group after the last update can arise when reassignment
        # changes memberships; reject this start rather than hide the issue.
        labels = nearest_labels(rows, centers)
        if len(set(labels)) != k:
            continue
        inertia = sum(squared_distance(x, centers[label])
                      for x, label in zip(rows, labels))
        candidate = {"centers": centers, "labels": labels,
                     "inertia": inertia, "iterations": iteration + 1}
        if best is None or inertia < best["inertia"]:
            best = candidate
    if best is None:
        raise RuntimeError("All starts lost a cluster; try another seed or k")
    return best
fit = fit_kmeans([(0, 0), (0, 2), (2, 0), (8, 8), (8, 10), (10, 8)], 2, n_init=20, seed=7)
print("centers:", [tuple(round(v, 3) for v in c) for c in fit["centers"]], "| inertia:", round(fit["inertia"], 3))

# Output:
# centers: [(0.667, 0.667), (8.667, 8.667)] | inertia: 10.667`,
      walk: [
        { line: "labels = nearest_labels(rows, centers)", say: "Assignment step: each point goes to its nearest centre." },
        { line: "updated = [tuple(sum(x[r] for x in group) / len(group)", say: "Update step: each centre moves to the mean of its points." },
        { line: "inertia = sum(squared_distance(x, centers[label])", say: "Inertia: the total squared distance, the number K-means minimises." },
        { line: "best = candidate", say: "Keep the start with the lowest inertia." },
      ],
    },
    "2.20.1 K-means: objective, derivation, and complete iteration#1": {
      goal: "Run the implementation on the six-point example",
      code: r`import math
import random


def squared_distance(a, b):
    return sum((u - v) ** 2 for u, v in zip(a, b))


def nearest_labels(rows, centers):
    return [min(range(len(centers)),
                key=lambda j: (squared_distance(x, centers[j]), j))
            for x in rows]


def fit_kmeans(data, k, *, n_init=10, max_iter=100, seed=7):
    rows = [tuple(float(v) for v in row) for row in data]
    if not rows or not rows[0]:
        raise ValueError("Expected a nonempty rectangular table")
    p = len(rows[0])
    if any(len(x) != p or any(not math.isfinite(v) for v in x)
           for x in rows):
        raise ValueError("Rows must have equal width and finite numbers")
    unique = list(dict.fromkeys(rows))
    if not isinstance(k, int) or isinstance(k, bool) or not 1 <= k <= len(unique):
        raise ValueError("k must be between 1 and the number of distinct rows")
    if (not isinstance(n_init, int) or isinstance(n_init, bool)
            or not isinstance(max_iter, int) or isinstance(max_iter, bool)
            or n_init < 1 or max_iter < 1):
        raise ValueError("n_init and max_iter must be positive")

    rng = random.Random(seed)
    best = None
    for _ in range(n_init):
        centers = rng.sample(unique, k)
        for iteration in range(max_iter):
            labels = nearest_labels(rows, centers)
            groups = [[x for x, label in zip(rows, labels) if label == j]
                      for j in range(k)]
            if any(not group for group in groups):
                break  # This start has no mean for one center; retry another.
            updated = [tuple(sum(x[r] for x in group) / len(group)
                             for r in range(p)) for group in groups]
            centers = updated
            if nearest_labels(rows, centers) == labels:
                break
        # An empty group after the last update can arise when reassignment
        # changes memberships; reject this start rather than hide the issue.
        labels = nearest_labels(rows, centers)
        if len(set(labels)) != k:
            continue
        inertia = sum(squared_distance(x, centers[label])
                      for x, label in zip(rows, labels))
        candidate = {"centers": centers, "labels": labels,
                     "inertia": inertia, "iterations": iteration + 1}
        if best is None or inertia < best["inertia"]:
            best = candidate
    if best is None:
        raise RuntimeError("All starts lost a cluster; try another seed or k")
    return best

# ---- this step ----
X = [(0, 0), (0, 2), (2, 0), (8, 8), (8, 10), (10, 8)]
fit = fit_kmeans(X, 2, n_init=20, seed=7)
assert sorted(round(v, 8) for v in fit["centers"][0]) in (
    [round(2 / 3, 8)] * 2, [round(26 / 3, 8)] * 2)
assert abs(fit["inertia"] - 32 / 3) < 1e-9
assert sorted(fit["labels"].count(j) for j in range(2)) == [3, 3]
print("inertia:", round(fit["inertia"], 3), "| cluster sizes:", sorted(fit["labels"].count(j) for j in range(2)))

# Output:
# inertia: 10.667 | cluster sizes: [3, 3]`,
      walk: [
        { line: "fit = fit_kmeans(X, 2, n_init=20, seed=7)", say: "Two clusters, twenty random starts, a fixed seed so the result repeats." },
        { line: "assert abs(fit[\"inertia\"] - 32 / 3) < 1e-9", say: "Inertia 32/3, matching the hand calculation." },
      ],
    },
    "In Python#0": {
      goal: "Choose k with inertia and silhouette in scikit-learn",
      code: r`import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

X, _ = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)   # 4 true groups
Xs = StandardScaler().fit_transform(X)            # scale first: K-means uses distances

ks, inertias = range(2, 8), []
for k in ks:
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    inertias.append(km.inertia_)
    print(f"k = {k}: inertia {km.inertia_:7.1f}   silhouette {silhouette_score(Xs, km.labels_):.3f}")

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot(list(ks), inertias, marker="o")
ax.set(xlabel="k (number of clusters)", ylabel="inertia", title="Elbow plot")
fig.tight_layout()
fig.savefig("elbow.png")

# Output:
# k = 2: inertia   522.2   silhouette 0.561
# k = 3: inertia   116.1   silhouette 0.747
# k = 4: inertia    28.8   silhouette 0.798
# k = 5: inertia    25.6   silhouette 0.678
# k = 6: inertia    23.1   silhouette 0.567
# k = 7: inertia    20.3   silhouette 0.445`,
      figure: { src: "/theory/figures/code/elbow.svg", alt: "Inertia against k falls steeply until k = 4, then flattens." },
      walk: [
        { line: "X, _ = make_blobs(n_samples=500, centers=4, cluster_std=1.0, random_state=42)   # 4 true groups", say: "Generated data with 4 real groups, so we can check whether the methods find 4." },
        { line: "Xs = StandardScaler().fit_transform(X)            # scale first: K-means uses distances", say: "Scale so no feature dominates the distances." },
        { line: "km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)", say: "Fit K-means with 10 starts for each $k$." },
        { line: "print(f\"k = {k}: inertia {km.inertia_:7.1f}   silhouette {silhouette_score(Xs, km.labels_):.3f}\")", say: "Inertia keeps falling; the silhouette peaks at $k = 4$." },
      ],
    },
  },
};

/** Easy layer: Hierarchical Clustering. */
export const HIER: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "Start with every point as its own group. Repeatedly merge the two closest groups until one group remains. The record of merges is a tree (dendrogram); cut it at any height to get clusters.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "A family tree for data",
          blocks: [
            { p: "Merging cousins, then families, then villages: points that merge early are very similar; groups that merge only at the top are very different. You decide afterwards how many groups you want by choosing where to cut." },
          ],
        },
      ],
    },
    "Reading a dendrogram": {
      examples: [
        {
          title: "Where to cut",
          blocks: [
            { p: "Merge heights 1, 3 and 4 for four points (P, Q, R, S). A cut at height 2 gives three clusters ({P, Q}, {R}, {S}); a cut at 3.5 gives two ({P, Q, R}, {S}). A big jump between merge heights is a natural place to cut." },
          ],
        },
      ],
    },
    "2.20.3 Hierarchical clustering: linkage, merge tables, and complexity": {
      plain: "The linkage rule decides how far apart two groups are: closest pair (single), farthest pair (complete), average of all pairs (average), or increase in squared error (Ward). Different rules give different trees.",
    },
    "2.20.6 Build a hierarchy from distances and defend the chosen cut": {
      plain: "A dendrogram records merges for one choice of distance and linkage. Justify the cut by stability and usefulness, not by how the picture looks.",
    },
  },
  code: {
    "2.20.6 Build a hierarchy from distances and defend the chosen cut#0": {
      goal: "Single-linkage merges by hand on four points",
      code: r`points = {'P':0., 'Q':1., 'R':4., 'S':8.}
clusters = {name:(name,) for name in points}
history = []
while len(clusters)>1:
    choices=[]
    ids=sorted(clusters)
    for left_index,left in enumerate(ids):
        for right in ids[left_index+1:]:
            gap=min(abs(points[a]-points[b])
                    for a in clusters[left] for b in clusters[right])
            choices.append((gap,clusters[left],clusters[right],left,right))
    gap,member_a,member_b,left,right=min(choices)
    merged=tuple(sorted(member_a+member_b))
    del clusters[left],clusters[right]
    clusters['+'.join(merged)]=merged
    history.append((merged,gap))
assert history==[(('P','Q'),1.),(('P','Q','R'),3.),
                 (('P','Q','R','S'),4.)]
assert len(clusters)==1 and set(next(iter(clusters.values())))==set(points)
for members, height in history:
    print("merge", members, "at height", height)

# Output:
# merge ('P', 'Q') at height 1.0
# merge ('P', 'Q', 'R') at height 3.0
# merge ('P', 'Q', 'R', 'S') at height 4.0`,
      walk: [
        { line: "clusters = {name:(name,) for name in points}", say: "Start with each point as its own cluster." },
        { line: "history = []", say: "Record every merge and its height: that is the dendrogram." },
        { line: "assert history==[(('P','Q'),1.),(('P','Q','R'),3.),", say: "Merges at heights 1, 3 and 4, as in the text." },
      ],
    },
    "In Python#0": {
      goal: "Build and cut a dendrogram with SciPy, and compare with scikit-learn",
      code: r`import matplotlib.pyplot as plt
from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.cluster import AgglomerativeClustering
from sklearn.datasets import make_blobs

X, _ = make_blobs(n_samples=30, centers=3, cluster_std=0.8, random_state=1)

Z = linkage(X, method="ward")                       # the full merge history
fig, ax = plt.subplots(figsize=(7, 3))
dendrogram(Z, ax=ax, no_labels=True)
ax.set(ylabel="merge height (Ward)", title="Dendrogram of 30 points")
fig.tight_layout()
fig.savefig("dendrogram.png")                       # in a notebook: plt.show()

labels = fcluster(Z, t=3, criterion="maxclust")     # cut the tree into 3 clusters
print("cluster sizes from the cut:", sorted([int((labels == c).sum()) for c in set(labels)]))
print("last three merge heights:", Z[-3:, 2].round(2))

agg = AgglomerativeClustering(n_clusters=3, linkage="average").fit(X)
print("average-linkage cluster sizes:", sorted([int((agg.labels_ == c).sum()) for c in set(agg.labels_)]))

# Output:
# cluster sizes from the cut: [10, 10, 10]
# last three merge heights: [ 3.74 14.37 44.1 ]
# average-linkage cluster sizes: [10, 10, 10]`,
      figure: { src: "/theory/figures/code/dendrogram.svg", alt: "A dendrogram of 30 points with three groups merging low and joining at large heights." },
      walk: [
        { line: "Z = linkage(X, method=\"ward\")                       # the full merge history", say: "Every merge, its height and the groups involved, using Ward's rule." },
        { line: "dendrogram(Z, ax=ax, no_labels=True)", say: "Draw the tree. Three groups merge low; the last two merges are much higher." },
        { line: "labels = fcluster(Z, t=3, criterion=\"maxclust\")     # cut the tree into 3 clusters", say: "Cut so that exactly 3 clusters remain." },
        { line: "print(\"last three merge heights:\", Z[-3:, 2].round(2))", say: "Heights jump from 3.7 to 14.4 to 44.1: the big gaps say three groups is natural here." },
      ],
    },
  },
};

/** Easy layer: DBSCAN. */
export const DBSCAN: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "DBSCAN looks for crowded areas. A point with enough neighbours within distance ε is a core point; crowds of connected core points form clusters; lonely points are labelled noise. You do not choose the number of clusters.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Crowds at a fair",
          blocks: [
            { p: "From above, a fair looks like several crowds of any shape (a queue snaking around a stall, a circle round a stage) plus a few people wandering alone. DBSCAN finds the crowds whatever their shape and leaves the wanderers out, which K-means cannot do." },
          ],
        },
      ],
    },
    "Choosing ε and MinPts": {
      examples: [
        {
          title: "Reading the k-distance curve",
          blocks: [
            { p: "Sort every point's distance to its 5th nearest neighbour. On the half-moon data, 90% of points have this distance below 0.17 and 98% below 0.26, after which it climbs fast. ε = 0.3, just past the bend, keeps the crowds together and leaves only isolated points as noise." },
          ],
        },
      ],
    },
    "2.20.4 DBSCAN: neighborhoods, border points, and a worked density expansion": {
      plain: "Count neighbours within ε (including the point itself). Core points have at least min_samples; border points are near a core point; everything else is noise. Small changes to ε or min_samples can change everything, so check them.",
    },
  },
  code: {
    "2.20.4 DBSCAN: neighborhoods, border points, and a worked density expansion#0": {
      goal: "DBSCAN from scratch on seven points",
      code: r`import math


def dbscan_small(data, epsilon, min_samples):
    rows = [tuple(float(v) for v in row) for row in data]
    if (not rows or not rows[0] or not math.isfinite(epsilon)
            or epsilon < 0 or not isinstance(min_samples, int)
            or isinstance(min_samples, bool) or min_samples < 1):
        raise ValueError("Need data, epsilon >= 0, and min_samples >= 1")
    p = len(rows[0])
    if any(len(x) != p or any(not math.isfinite(v) for v in x)
           for x in rows):
        raise ValueError("Rows must be rectangular and finite")

    eps2 = epsilon * epsilon
    neighbors = [[j for j, y in enumerate(rows)
                  if sum((u - v) ** 2 for u, v in zip(x, y)) <= eps2]
                 for x in rows]
    core = {i for i, adjacent in enumerate(neighbors)
            if len(adjacent) >= min_samples}
    labels = [-1] * len(rows)
    component = 0
    for start in sorted(core):
        if labels[start] != -1:
            continue
        labels[start] = component
        todo = [start]
        while todo:
            i = todo.pop()
            for j in neighbors[i]:
                if j in core and labels[j] == -1:
                    labels[j] = component
                    todo.append(j)
        component += 1
    for i in range(len(rows)):
        if i not in core:
            touching = [labels[j] for j in neighbors[i] if j in core]
            if touching:
                labels[i] = min(touching)
    return labels


small = [(0, 0), (0, 2), (2, 0),
         (8, 8), (8, 10), (10, 8), (20, 0)]
assert dbscan_small(small, 2.1, 3) == [0, 0, 0, 1, 1, 1, -1]
assert dbscan_small(small, 2.1, 4) == [-1] * 7
print("eps=2.1, min_samples=3:", dbscan_small(small, 2.1, 3))
print("eps=2.1, min_samples=4:", dbscan_small(small, 2.1, 4))

# Output:
# eps=2.1, min_samples=3: [0, 0, 0, 1, 1, 1, -1]
# eps=2.1, min_samples=4: [-1, -1, -1, -1, -1, -1, -1]`,
      walk: [
        { line: "labels = [-1] * len(rows)", say: "Start with every point marked as noise (−1)." },
        { line: "todo = [start]", say: "From an unvisited core point, grow a cluster through neighbouring core points." },
        { line: "touching = [labels[j] for j in neighbors[i] if j in core]", say: "A border point joins a cluster it touches through a core point." },
        { line: "assert dbscan_small(small, 2.1, 4) == [-1] * 7", say: "Raise min_samples to 4 and no point is core any more: everything becomes noise." },
      ],
    },
    "In Python#0": {
      goal: "DBSCAN versus K-means on curved clusters",
      code: r`import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN, KMeans
from sklearn.datasets import make_moons
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler

X, true = make_moons(n_samples=300, noise=0.06, random_state=0)   # two curved shapes
Xs = StandardScaler().fit_transform(X)

dist, _ = NearestNeighbors(n_neighbors=5).fit(Xs).kneighbors(Xs)
k_dist = np.sort(dist[:, -1])                       # distance to the 5th neighbour, sorted
print("5th-neighbour distance at the 90th and 98th percentile:", np.percentile(k_dist, [90, 98]).round(3))

db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(Xs)
print("DBSCAN clusters:", sorted(int(v) for v in set(db.labels_)), "| noise points:", int((db.labels_ == -1).sum()))

def agreement(labels):                              # share of points grouped like the true moons
    return max(np.mean(labels == true), np.mean(labels == 1 - true))
print("agreement with true moons: DBSCAN", round(agreement(db.labels_), 3), "| K-means", round(agreement(km.labels_), 3))

fig, axes = plt.subplots(1, 2, figsize=(9, 3.4))
for ax, labels, title in ((axes[0], km.labels_, "K-means (k=2)"), (axes[1], db.labels_, "DBSCAN (eps=0.3)")):
    ax.scatter(Xs[:, 0], Xs[:, 1], c=labels, cmap="viridis", s=12)
    ax.set(title=title, xticks=[], yticks=[])
fig.tight_layout()
fig.savefig("moons.png")

# Output:
# 5th-neighbour distance at the 90th and 98th percentile: [0.17  0.258]
# DBSCAN clusters: [-1, 0, 1] | noise points: 1
# agreement with true moons: DBSCAN 0.997 | K-means 0.843`,
      figure: { src: "/theory/figures/code/moons.svg", alt: "Two half-moon shapes. K-means cuts them with a straight line; DBSCAN colours each moon as its own cluster." },
      walk: [
        { line: "dist, _ = NearestNeighbors(n_neighbors=5).fit(Xs).kneighbors(Xs)", say: "Distance from each point to its 5 nearest neighbours (the first is itself)." },
        { line: "db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)", say: "Fit DBSCAN with ε chosen from the k-distance curve." },
        { line: "print(\"agreement with true moons: DBSCAN\", round(agreement(db.labels_), 3), \"| K-means\", round(agreement(km.labels_), 3))", say: "DBSCAN recovers the moons almost perfectly (0.997); K-means cuts them with a straight line (0.84)." },
      ],
    },
  },
};

/** Easy layer: Principal Component Analysis. */
export const PCA: EasyTopic = {
  sections: {
    "Explained in depth": {
      plain: "PCA finds new axes for the data: the first points where the data spread out most, the second where they spread most among directions at right angles to the first, and so on. Keeping the first few axes compresses the data while losing as little spread as possible.",
      examples: [
        {
          at: 0,
          kind: "idea",
          title: "Height and arm span",
          blocks: [
            { p: "For 100 people, height and arm span are almost the same number. Plotted, the points form a thin diagonal cloud. PCA's first axis runs along the diagonal (\"overall size\"), the second across it (\"arm span minus height\"). Keeping only the first axis turns two numbers into one with almost no information lost." },
          ],
        },
      ],
    },
    "Choosing k": {
      examples: [
        {
          title: "How many components for digits?",
          blocks: [
            { table: { head: ["Components", "5", "10", "20", "64 (all)"], rows: [["Test accuracy (logistic regression)", "0.82", "0.87", "0.96", "0.97"]] } },
            { p: "From the code step below. 39 of 64 components keep 95% of the variance; 20 components already give almost full accuracy. Choose $k$ by the downstream score, not only the variance percentage." },
          ],
        },
      ],
    },
    "Textbook case: Covariance, Matrix Decompositions, and Dimensionality": {
      plain: "Air-quality stations used to build PCA from covariance, eigenvectors and the SVD, and to show when dimension reduction helps and when it hides the signal.",
    },
    "1.8.1 Variance and covariance as geometry": {
      plain: "Variance measures spread in one direction; covariance measures whether two features move together. The covariance matrix collects both, and its shape describes the cloud of points.",
      replace: {
        0: { p: "For $n$ observations of numeric feature $x$, the sample variance $s_x^2 = \\sum_i(x_i - \\bar x)^2/(n-1)$ summarizes average squared spread about its mean under the conventional sample estimator. For two features $x$ and $y$, the sample covariance $s_{xy} = \\sum_i(x_i - \\bar x)(y_i - \\bar y)/(n-1)$ records whether they move together. Positive covariance indicates that deviations in the same direction tend to coincide; negative covariance indicates opposite-direction deviations. Its magnitude depends on measurement units, so a covariance of 50 has little meaning without units and scale." },
        1: { p: "Pearson correlation $r_{xy} = s_{xy}/(s_xs_y)$ removes units when both standard deviations are nonzero. A correlation near one indicates strong linear co-movement in the observed sample, not that one variable causes the other. Stations with high temperature may also have high particulate readings because both respond to time of day or weather; changing a temperature reading in a data table will not necessarily change pollution." },
        2: { p: "For two centered data columns, the covariance matrix is $S = \\begin{bmatrix} s_x^2 & s_{xy} \\\\ s_{xy} & s_y^2 \\end{bmatrix}$. It is symmetric and positive semidefinite because $v^\\top Sv$ is the sample variance of the projected values $Xv$ for any vector $v$, up to the conventional scaling. A direction with large projected variance corresponds to a direction in feature space along which the points are widely spread. This observation connects covariance geometry to principal component analysis." },
        3: { p: "**Worked example:** Let centered observations be $(-1, -2)$, $(0, 0)$, $(1, 2)$. With denominator $n - 1 = 2$, $s_x^2 = (1 + 0 + 1)/2 = 1$, $s_y^2 = (4 + 0 + 4)/2 = 4$ and $s_{xy} = (2 + 0 + 2)/2 = 2$. The covariance matrix is $\\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$. The second feature is exactly twice the first, so there is only one direction of nonzero observed variance." },
      },
    },
    "1.8.2 Eigenvectors and the PCA objective": {
      plain: "The direction of greatest spread is the top eigenvector of the covariance matrix, and its eigenvalue is the amount of spread in that direction.",
      replace: {
        0: { p: "For centered matrix $X$ and covariance $S = X^\\top X/(n-1)$, the variance of one-dimensional projections $Xv$ along a unit vector $v$ is $v^\\top Sv$. PCA seeks $v$ maximizing this quantity subject to $v^\\top v = 1$. Use a Lagrange multiplier $\\lambda$: differentiate $v^\\top Sv - \\lambda(v^\\top v - 1)$ with respect to $v$. Because $S$ is symmetric, the stationary condition becomes $2Sv - 2\\lambda v = 0$, or $Sv = \\lambda v$. Thus candidate directions are eigenvectors of $S$; their associated eigenvalues are the variances captured along those directions. Select the largest eigenvalue for the first component." },
        1: { p: "For the covariance example $S = \\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$, $v = (1, 2)/\\sqrt5$ is a unit eigenvector with eigenvalue 5 because $Sv = (5, 10)/\\sqrt5 = 5v$. An orthogonal direction $(-2, 1)/\\sqrt5$ has eigenvalue zero. The first component captures all sample variance in this deliberately exact linear example. The signs can be reversed without changing the geometric axis. A noisy measurement would generally give a small but nonzero second eigenvalue." },
        2: { p: "For a general symmetric two-by-two covariance $S = \\begin{bmatrix} a & b \\\\ b & c \\end{bmatrix}$, eigenvalues solve $\\det(S - \\lambda I) = (a - \\lambda)(c - \\lambda) - b^2 = 0$. Expanding gives $\\lambda^2 - (a + c)\\lambda + (ac - b^2) = 0$, so $\\lambda_{1,2} = \\big[a + c \\pm \\sqrt{(a - c)^2 + 4b^2}\\big]/2$. With $S = \\begin{bmatrix} 1 & 2 \\\\ 2 & 4 \\end{bmatrix}$, the trace is 5, the determinant is zero and the discriminant is $(1 - 4)^2 + 4 \\cdot 2^2 = 25$: eigenvalues are $(5 + 5)/2 = 5$ and $(5 - 5)/2 = 0$. A direction can be found by solving $(S - \\lambda_1 I)v = 0$ and normalizing it. The second direction is orthogonal in this symmetric case. The determinant being zero explains why all centered sample points lie along one line; it does **not** imply all future stations must satisfy the same exact relationship." },
        3: { p: "The total variance of the original centered columns is $\\operatorname{trace}(S)$, the sum of diagonal entries. Here $1 + 4 = 5$, also the sum of eigenvalues. The explained-variance ratio for component $j$ is $\\lambda_j/\\sum_k\\lambda_k$ when total variance is positive. If the first two components together explain 95% of input variance, that says nothing by itself about whether they preserve a weak signal needed to predict a rare sensor failure." },
        4: { p: "To transform a new row $x$, subtract the training mean $\\mu$ and project: $z = (x - \\mu)^\\top v$. A validation row must use the mean and direction fitted on training data. Recomputing PCA on all rows before evaluating a downstream model leaks information about the validation distribution into the pipeline." },
        5: { p: "**Exercise:** For $S = \\begin{bmatrix} 9 & 0 \\\\ 0 & 1 \\end{bmatrix}$, identify both principal directions and explained-variance ratios. Then imagine incidents depend on the second coordinate only. Explain why retaining the first 90% of variance could lose all useful incident signal." },
      },
      examples: [
        {
          at: 5,
          title: "Answer to the exercise",
          blocks: [
            { p: "A diagonal matrix's eigenvectors are the axes themselves: $(1, 0)$ with eigenvalue 9 and $(0, 1)$ with eigenvalue 1. Ratios: $9/10 = 90\\%$ and $10\\%$. Keeping one component keeps the first axis and throws away the second, which is exactly where the incident signal lives." },
          ],
        },
      ],
    },
    "1.8.3 Singular value decomposition and numerical practice": {
      plain: "The SVD of the centred data gives the same directions as the covariance eigenvectors, more accurately. Keeping $k$ components and projecting back gives the best possible rank-$k$ reconstruction.",
      replace: {
        0: { p: "Singular value decomposition represents a matrix as $X = U\\Sigma V^\\top$, where columns of $U$ and $V$ describe orthogonal directions and $\\Sigma$ contains nonnegative singular values. For centered data, $X^\\top X = V\\Sigma^2V^\\top$, so columns of $V$ correspond to principal directions and covariance eigenvalues equal squared singular values divided by $n - 1$. A numerical PCA implementation can compute the SVD of a centered matrix rather than explicitly forming and decomposing a covariance matrix; this can improve numerical behavior in important settings." },
        2: { p: "The PCA reconstruction after retaining $k$ components is $\\hat x = \\mu + V_kV_k^\\top(x - \\mu)$ under the usual orthonormal-column convention. Reconstruction error measures information lost about $X$ in squared Euclidean terms; it does not measure forecast loss. A downstream model should be compared with and without PCA on the same held-out time periods and with all preprocessing fitted inside the folds." },
        3: { p: "For a centered training matrix $X$, write $X = U\\Sigma V^\\top$. The best rank-$k$ approximation of $X$ in squared Frobenius-error terms is obtained by keeping its $k$ largest singular values and associated vectors. Its squared reconstruction error is the sum of squares of the discarded singular values. Because covariance eigenvalues are $\\sigma_j^2/(n-1)$, the same error can be written $(n-1)\\sum_{j>k}\\lambda_j$. This identifies which loss PCA optimizes: training-input reconstruction under squared Euclidean distance. There is no theorem that the leading reconstructed input directions retain a low-variance variable that predicts rare faults. If feature scales change, the reconstruction metric changes as well." },
      },
    },
    "1.8.4 Distance concentration and feature selection": {
      plain: "Adding many irrelevant features makes all distances look alike. Feature selection keeps original columns; PCA mixes them into new ones.",
    },
    "1.8.5 Cluster validation and a downstream question": {
      plain: "Clusters are only useful if they help the actual decision. Check stability and usefulness, not only internal scores.",
    },
    "Textbook case: Geometry, Principal Components, and Distance Embeddings": {
      plain: "Ventilation sensors used to explore high dimensions, the PCA derivation, and maps built from distances (MDS).",
    },
    "1.9.1 Dimension and the meaning of a neighborhood": {
      plain: "In many dimensions, data are spread thin and \"nearby\" becomes less meaningful. Six features with 10 levels each already make a million combinations.",
    },
    "1.9.2 Derive the principal direction": {
      plain: "Maximise projected variance subject to unit length, and the answer is the top eigenvector. Open the derivation for the steps.",
    },
    "1.9.3 Variance retention is not label retention": {
      plain: "Keeping 99% of the variance can still throw away the one small direction that predicts the label.",
    },
    "1.9.4 Recover coordinates from distances with classical MDS": {
      plain: "If you only have a table of distances, classical MDS rebuilds coordinates whose distances match it.",
    },
    "1.9.5 Match the representation to the question": {
      plain: "Pick PCA for compression, feature selection for interpretability, MDS for distance maps, and supervised methods when the goal is prediction.",
    },
    "1.9.6 Calculate distance embeddings and quantify distortion": {
      plain: "Squashing data into fewer dimensions distorts some distances. Measure how much before trusting a map.",
    },
    "Textbook case: PCA, Singular Values, and Honest Dimensionality Reduction": {
      plain: "Two cooling-equipment sensors used to compare eigenvectors, SVD, reconstruction error and whether PCA actually helps prediction.",
    },
    "1.10.1 Centering turns variance maximization into an eigenproblem": {
      plain: "Subtract the mean first; then the direction of greatest spread is an eigenvector of the covariance matrix.",
    },
    "1.10.2 SVD computes the same principal subspace without forming covariance": {
      plain: "The SVD gives the same directions without forming the covariance matrix: squared singular values divided by $n - 1$ are the eigenvalues.",
    },
    "1.10.3 Reconstruction error and explained variance answer different questions": {
      plain: "Explained variance and reconstruction error describe how well the inputs are kept, not whether the label can still be predicted. One outlier can also rotate the components.",
    },
    "1.10.4 Classification after PCA requires its own held-out experiment": {
      plain: "Fit scaling and PCA on training data only, inside each fold, and compare the downstream model with and without PCA.",
    },
    "1.10.5 Manifold plots and distances need interpretation boundaries": {
      plain: "A 2-D picture of high-dimensional data is a communication aid. Its clusters and distances may be distorted.",
    },
    "Textbook case: Discriminant Projection and Distance Maps": {
      plain: "Water-monitoring data used to contrast PCA (ignores labels) with Fisher's LDA (uses labels), and to explain MDS and t-SNE maps.",
    },
    "1.11.1 Fisher discriminant analysis and its objective": {
      plain: "LDA finds the direction that pushes the class averages apart while keeping each class tight. Unlike PCA, it uses the labels.",
      replace: {
        1: { p: "Let $x_i$ be a $p$-dimensional numeric row with binary label $y_i \\in \\{0, 1\\}$. Let $\\mu_0$ and $\\mu_1$ be the mean vectors of the two classes. For each class $c$, calculate its within-class scatter $S_c = \\sum_{i: y_i = c}(x_i - \\mu_c)(x_i - \\mu_c)^\\top$ and set $S_W = S_0 + S_1$. Define $\\delta = \\mu_1 - \\mu_0$. If a projection direction $w$ transforms a row to $z = w^\\top x$, the projected difference between class means is $w^\\top\\delta$, while total within-class projected scatter is $w^\\top S_Ww$. Fisher's two-class separation criterion is" },
        2: { math: r`J(w) = \frac{(w^\top\delta)^2}{w^\top S_W\,w}` },
        4: { p: "When $S_W$ is positive definite, set $v = S_W^{1/2}w$ and $a = S_W^{-1/2}\\delta$. Then $J(w) = (v^\\top a)^2/(v^\\top v)$. By Cauchy–Schwarz, this ratio is at most $a^\\top a$, with equality when $v$ is parallel to $a$. Substituting back gives the optimal direction $w \\propto S_W^{-1}\\delta$. Implement by solving $S_Ww = \\delta$ instead of forming an explicit inverse. If $S_W$ is singular, this derivation requires an adjustment such as regularization $S_W + \\lambda I$, a reduced-rank computation, or a carefully specified generalized solution. An unregularized inverse does not exist merely because two class labels exist." },
        6: { p: "Use ordinary-day points $(-1, 0), (1, 0), (0, -1), (0, 1)$ and alert-day points $(-1, 3), (1, 3), (0, 2), (0, 4)$. Both class means have first coordinate zero; their second coordinates are 0 and 3. Hence $\\delta = (0, 3)$. Within each class the $x$ deviations contribute $1 + 1 = 2$ and $y$ deviations contribute $1 + 1 = 2$, with zero cross-products, so $S_0 = \\operatorname{diag}(2, 2)$ and $S_1 = \\operatorname{diag}(2, 2)$. Thus $S_W = \\operatorname{diag}(4, 4)$. Solving $S_Ww = \\delta$ gives $w = (0, 3/4)$. Any positive rescaling, including $(0, 1)$, gives the same ordering: projected ordinary values are −1, 0, 0, 1 and alert values are 2, 3, 3, 4 under $(0, 1)$. The Fisher ratio at $(0, 1)$ is $3^2/4 = 9/4$. Projecting onto $(1, 0)$ has zero between-class mean difference, even though there is $x$-direction variation." },
        12: { p: "To see the link to a Gaussian classifier, suppose $x \\mid y = c$ follows a multivariate normal distribution with mean $\\mu_c$ and one shared positive-definite covariance $\\Sigma$, and prior class probability $\\pi_c$. Up to terms common to both classes, the log score of class $c$ is $x^\\top\\Sigma^{-1}\\mu_c - \\frac12\\mu_c^\\top\\Sigma^{-1}\\mu_c + \\log\\pi_c$. The quadratic $x^\\top\\Sigma^{-1}x$ cancels when two class log densities are compared; that is why the class boundary is linear under the shared covariance assumption. If covariance differs by class, the quadratic terms generally remain and the decision boundary need not be linear. Using the toy class points, the pooled sample covariance $S_W/(8-2)$ is $\\operatorname{diag}(2/3, 2/3)$. With equal priors, the alert-minus-ordinary log score is $\\frac92y - \\frac{27}{4}$, where $y$ here is the second chemical coordinate, giving threshold $y = 1.5$. A different prior shifts the threshold without changing the Fisher ranking direction. This model-based threshold does not claim the real station distributions are Gaussian." },
      },
    },
    "1.11.2 Classical multidimensional scaling and principal coordinates": {
      plain: "From a table of distances, double-centring gives a matrix of inner products; its top eigenvectors give coordinates that reproduce the distances.",
      replace: {
        1: { p: "Sometimes an analyst has pairwise distances $d_{ij}$ rather than raw chemical vectors. Classical multidimensional scaling (also called principal coordinates analysis in many settings) seeks coordinates whose Euclidean distances reproduce the given dissimilarities as well as possible. Let $D^{(2)}$ contain squared distances, $J = I - \\mathbf 1\\mathbf 1^\\top/n$ be the centering matrix, and define" },
        2: { math: r`B = -\tfrac12\,J\,D^{(2)}J` },
        3: { p: "Why double-center? If centered points $z_i$ have inner products $B_{ij} = z_i^\\top z_j$, then $d_{ij}^2 = B_{ii} + B_{jj} - 2B_{ij}$. Multiplying the squared-distance matrix by $J$ on both sides removes terms depending only on a row or column and leaves $-2B$, so the formula recovers the centered Gram matrix when the distances are exactly Euclidean. Eigen-decompose $B = V\\Lambda V^\\top$. Keep positive eigenvalues $\\lambda_r$ and corresponding eigenvectors $v_r$; coordinate $r$ is $\\sqrt{\\lambda_r}\\,v_r$. The choice of sign of an eigenvector is arbitrary, and rotating an embedding does not change its pairwise distances." },
      },
    },
    "1.11.3 Metric versus nonmetric distance maps and out-of-sample limits": {
      plain: "Metric MDS tries to match the distances themselves; nonmetric MDS only tries to keep their order. Some distance tables cannot be drawn exactly in any number of dimensions.",
      replace: {
        0: { p: "Classical MDS begins with magnitudes of squared distances and recovers a Euclidean Gram matrix. Other stress-based MDS methods directly optimize discrepancies between input dissimilarities and embedded distances. A simple metric-stress objective is $\\sum_{i<j} w_{ij}\\big[d_{ij} - \\lVert z_i - z_j\\rVert\\big]^2$ for nonnegative weights $w_{ij}$. Nonmetric approaches instead emphasize preservation of the rank order of dissimilarities, fitting a monotone relationship between supplied dissimilarity ranks and plotted distances. A rank-preserving map can bend the numeric scale of the source dissimilarity; calling its plotted axis \"original units\" would be false." },
      },
    },
    "1.11.4 t-SNE: conditional neighborhoods and a KL objective": {
      plain: "t-SNE turns distances into \"how likely is this point my neighbour?\" probabilities, then arranges points in 2-D so the probabilities match. It preserves local neighbourhoods, not global distances.",
      replace: {
        2: { math: r`p_{j\mid i} = \frac{\exp\!\big(-\lVert x_i - x_j\rVert^2/2\sigma_i^2\big)}{\sum_{l \ne i}\exp\!\big(-\lVert x_i - x_l\rVert^2/2\sigma_i^2\big)}` },
        3: { p: "and $p_{i \\mid i} = 0$. Each row's bandwidth $\\sigma_i$ is adjusted to a selected neighborhood scale often expressed as a perplexity. With natural logarithms, $\\text{perplexity}_i = \\exp\\big(-\\sum_{j \\ne i} p_{j \\mid i}\\log p_{j \\mid i}\\big)$; it resembles an effective number of neighbors. To obtain symmetric joint probabilities, one common definition is $p_{ij} = [p_{j \\mid i} + p_{i \\mid j}]/(2n)$ for $i \\ne j$; the sum over ordered pairs is one." },
        4: { p: "In low-dimensional display positions $z_i$, define heavy-tailed similarities $q_{ij} \\propto (1 + \\lVert z_i - z_j\\rVert^2)^{-1}$, normalized over ordered pairs $i \\ne j$, with $q_{ii} = 0$. Optimize the KL divergence" },
        5: { math: r`\mathrm{KL}(P \,\Vert\, Q) = \sum_{i \ne j} p_{ij}\log\frac{p_{ij}}{q_{ij}}` },
        6: { p: "When the symmetric probabilities are normalized over ordered off-diagonal pairs, the gradient with respect to display position $z_i$ can be written $4\\sum_{j \\ne i}(p_{ij} - q_{ij})(z_i - z_j)/(1 + \\lVert z_i - z_j\\rVert^2)$. This expression has an attractive part when $p_{ij}$ exceeds $q_{ij}$ and a repulsive part when $q_{ij}$ exceeds $p_{ij}$, under the sign of a gradient-descent update. Its coefficients depend on all positions because every $q_{ij}$ shares a normalization denominator. In the two-point case, there is only one unordered pair, so $p_{12} = p_{21} = q_{12} = q_{21} = 1/2$ irrespective of their separation: the KL objective cannot determine an absolute distance between only two displayed points. This helps explain why visual separation is not a calibrated distance scale." },
      },
    },
    "1.11.5 Evaluate embeddings against their actual purpose": {
      plain: "Judge a map by its purpose: reconstruction error for compression, neighbour overlap for local structure, downstream accuracy for prediction.",
    },
  },
  code: {
    "1.8.3 Singular value decomposition and numerical practice#0": {
      goal: "One-component PCA by hand: mean, direction, projection and reconstruction",
      code: r`import math


def one_component_pca_2d(rows):
    if len(rows) < 2 or any(len(row) != 2 for row in rows):
        raise ValueError("Need at least two two-dimensional rows")
    if any(not math.isfinite(value) for row in rows for value in row):
        raise ValueError("Numeric inputs must be finite")
    mean = tuple(sum(row[j] for row in rows)/len(rows) for j in (0, 1))
    centered = [(x-mean[0], y-mean[1]) for x, y in rows]
    denom = len(rows)-1
    a = sum(x*x for x, _ in centered)/denom
    b = sum(x*y for x, y in centered)/denom
    c = sum(y*y for _, y in centered)/denom
    eigenvalue = (a+c+math.sqrt((a-c)**2+4*b*b))/2
    if eigenvalue <= 0:
        raise ValueError("No positive-variance direction exists")
    direction = (eigenvalue-c, b) if abs(b) > 1e-12 else (
        (1.0, 0.0) if a >= c else (0.0, 1.0))
    magnitude = math.hypot(*direction)
    direction = tuple(value/magnitude for value in direction)
    return {"mean": mean, "direction": direction,
            "eigenvalue": eigenvalue, "total_variance": a+c}


def project_and_reconstruct(row, fitted):
    centered = [value-mu for value, mu in zip(row, fitted["mean"])]
    score = sum(value*axis for value, axis in zip(
        centered, fitted["direction"]))
    reconstructed = tuple(mu+score*axis for mu, axis in zip(
        fitted["mean"], fitted["direction"]))
    return score, reconstructed


training_rows = [(1, 0), (2, 2), (3, 4)]
pca = one_component_pca_2d(training_rows)
assert abs(pca["eigenvalue"]-5) < 1e-12
assert all(abs(value-expected) < 1e-12 for value, expected in
           zip(pca["direction"], (1/math.sqrt(5), 2/math.sqrt(5))))
assert all(abs(a-b) < 1e-12 for row in training_rows
           for a, b in zip(project_and_reconstruct(row, pca)[1], row))
print("mean:", pca["mean"], "| eigenvalue:", round(pca["eigenvalue"], 6), "| direction:", tuple(round(v, 4) for v in pca["direction"]))

# Output:
# mean: (2.0, 2.0) | eigenvalue: 5.0 | direction: (0.4472, 0.8944)`,
      walk: [
        { line: "training_rows = [(1, 0), (2, 2), (3, 4)]", say: "Three training points lying exactly on a line." },
        { line: "pca = one_component_pca_2d(training_rows)", say: "Centre the rows, build the 2 × 2 covariance and find its top eigenvector." },
        { line: "assert abs(pca[\"eigenvalue\"]-5) < 1e-12", say: "All the variance (5) lies along one direction, $(1, 2)/\\sqrt5$." },
      ],
    },
    "1.9.6 Calculate distance embeddings and quantify distortion#0": {
      goal: "Rebuild coordinates from distances and measure the distortion of a 1-D map",
      code: r`import numpy as np

profiles = np.array([[0.,0.],[1.,0.],[1.,2.]])
distances = np.linalg.norm(profiles[:,None,:]-profiles[None,:,:],axis=2)
assert np.allclose(distances,distances.T)
assert np.allclose(np.diag(distances),0.)
n = len(profiles)
J = np.eye(n)-np.ones((n,n))/n
B = -0.5*J@(distances**2)@J
eigenvalues, eigenvectors = np.linalg.eigh(B)
order = np.argsort(eigenvalues)[::-1]
eigenvalues, eigenvectors = eigenvalues[order], eigenvectors[:,order]
assert eigenvalues[1] > 0 and eigenvalues[2] > -1e-10
coordinates_2d = eigenvectors[:,:2]*np.sqrt(eigenvalues[:2])
recovered = np.linalg.norm(coordinates_2d[:,None,:]-coordinates_2d[None,:,:],axis=2)
assert np.allclose(recovered,distances,atol=1e-10)
coordinates_1d = eigenvectors[:,:1]*np.sqrt(eigenvalues[:1])
approx = np.linalg.norm(coordinates_1d[:,None,:]-coordinates_1d[None,:,:],axis=2)
upper = np.triu_indices(n,1)
relative_error = np.linalg.norm(distances[upper]-approx[upper])/np.linalg.norm(distances[upper])
assert relative_error > 0
print("2-D map reproduces the distances exactly; 1-D map relative distance error:", round(relative_error, 4))

# Output:
# 2-D map reproduces the distances exactly; 1-D map relative distance error: 0.2265`,
      walk: [
        { line: "recovered = np.linalg.norm(coordinates_2d[:,None,:]-coordinates_2d[None,:,:],axis=2)", say: "Distances from the rebuilt 2-D coordinates match the originals exactly." },
        { line: "relative_error = np.linalg.norm(distances[upper]-approx[upper])/np.linalg.norm(distances[upper])", say: "Squashing to 1-D distorts the distances by about 23%." },
      ],
    },
    "1.10.2 SVD computes the same principal subspace without forming covariance#0": {
      goal: "PCA through the SVD",
      code: r`import numpy as np
X=np.array([[1.,2.],[2.,4.],[3.,6.]])
mean=X.mean(axis=0)
centered=X-mean
U,s,Vt=np.linalg.svd(centered,full_matrices=False)
covariance=np.cov(X,rowvar=False)
assert np.allclose(mean,[2.,4.])
assert np.allclose(covariance,[[1.,2.],[2.,4.]])
assert np.isclose(s[0],np.sqrt(10.))
assert s[1]<1e-12
projected=centered@Vt[0]
reconstructed=np.outer(projected,Vt[0])+mean
assert np.allclose(reconstructed,X)
print("singular values:", s.round(6), "| sqrt(10) =", round(np.sqrt(10), 6))

# Output:
# singular values: [3.162278 0.      ] | sqrt(10) = 3.162278`,
      walk: [
        { line: "assert np.isclose(s[0],np.sqrt(10.))", say: "The top singular value is $\\sqrt{10}$: squared and divided by $n - 1 = 2$ it gives the eigenvalue 5." },
        { line: "assert np.allclose(reconstructed,X)", say: "One component reconstructs these points exactly because they lie on a line." },
      ],
    },
    "1.11.1 Fisher discriminant analysis and its objective#0": {
      goal: "Fisher's discriminant direction by hand",
      code: r`import math


def fisher_direction_2d(rows, labels, ridge=0.0):
    if len(rows) != len(labels) or not rows or ridge < 0:
        raise ValueError("Need rows, labels, and nonnegative ridge")
    groups = [[tuple(map(float, x)) for x, y in zip(rows, labels) if y == c]
              for c in (0, 1)]
    if (any(not group for group in groups)
            or any(len(x) != 2 or any(not math.isfinite(v) for v in x)
                   for group in groups for x in group)):
        raise ValueError("Two nonempty classes with finite 2D rows required")
    means = [tuple(sum(x[j] for x in group)/len(group) for j in (0, 1))
             for group in groups]
    a = sum((x[0]-m[0])**2 for group, m in zip(groups, means)
            for x in group) + ridge
    b = sum((x[0]-m[0])*(x[1]-m[1]) for group, m in zip(groups, means)
            for x in group)
    c = sum((x[1]-m[1])**2 for group, m in zip(groups, means)
            for x in group) + ridge
    d0 = means[1][0]-means[0][0]
    d1 = means[1][1]-means[0][1]
    determinant = a*c-b*b
    if determinant <= 1e-12:
        raise ValueError("Within-class matrix singular; increase ridge")
    return ((c*d0-b*d1)/determinant,
            (a*d1-b*d0)/determinant)


ordinary = [(-1, 0), (1, 0), (0, -1), (0, 1)]
alert = [(-1, 3), (1, 3), (0, 2), (0, 4)]
direction = fisher_direction_2d(ordinary+alert, [0]*4+[1]*4)
assert all(abs(v-w)<1e-12 for v, w in zip(direction, (0, 0.75)))
print("Fisher direction:", direction)

# Output:
# Fisher direction: (0.0, 0.75)`,
      walk: [
        { line: "determinant = a*c-b*b", say: "Solve the 2 × 2 system $S_Ww = \\delta$ with the inverse formula." },
        { line: "assert all(abs(v-w)<1e-12 for v, w in zip(direction, (0, 0.75)))", say: "The direction is $(0, 3/4)$: only the second coordinate separates the classes." },
      ],
    },
    "1.11.2 Classical multidimensional scaling and principal coordinates#0": {
      goal: "Double-centre a distance matrix",
      code: r`def double_center_squared_distances(distances):
    n = len(distances)
    if n < 2 or any(len(row) != n for row in distances):
        raise ValueError("Need a square matrix of at least two distances")
    squared = [[float(value)**2 for value in row] for row in distances]
    row_means = [sum(row)/n for row in squared]
    grand_mean = sum(row_means)/n
    return [[-0.5*(squared[i][j]-row_means[i]-row_means[j]
                    +grand_mean) for j in range(n)] for i in range(n)]


locations = [0, 1, 3]
distance_matrix = [[abs(a-b) for b in locations] for a in locations]
gram = double_center_squared_distances(distance_matrix)
centered = [a-4/3 for a in locations]
assert all(abs(gram[i][j]-centered[i]*centered[j]) < 1e-12
           for i in range(3) for j in range(3))
assert abs(sum(gram[i][i] for i in range(3))-14/3) < 1e-12
print("double-centred matrix B:")
for row in gram:
    print("  ", [round(v, 4) for v in row])

# Output:
# double-centred matrix B:
#    [1.7778, 0.4444, -2.2222]
#    [0.4444, 0.1111, -0.5556]
#    [-2.2222, -0.5556, 2.7778]`,
      walk: [
        { line: "gram = double_center_squared_distances(distance_matrix)", say: "Compute $B = -\\frac12 JD^{(2)}J$." },
        { line: "assert all(abs(gram[i][j]-centered[i]*centered[j]) < 1e-12", say: "B equals the inner products of the centred positions $(-4/3, -1/3, 5/3)$." },
      ],
    },
    "1.11.3 Metric versus nonmetric distance maps and out-of-sample limits#0": {
      goal: "Measure stress for two candidate maps",
      code: r`def normalized_stress(dissimilarities, positions):
    pairs = [(i, j, float(dissimilarities[i][j]))
             for i in range(len(positions))
             for j in range(i+1, len(positions))]
    denominator = sum(distance**2 for _, _, distance in pairs)
    if denominator <= 0:
        raise ValueError("Need a nonzero dissimilarity")
    numerator = sum((distance - abs(positions[i]-positions[j]))**2
                    for i, j, distance in pairs)
    return (numerator/denominator)**0.5


distances = [[0, 1, 3], [1, 0, 2], [3, 2, 0]]
assert normalized_stress(distances, [0, 1, 3]) == 0.0
assert normalized_stress(distances, [0, 1, 2]) > 0
print("stress of exact map [0, 1, 3]:", normalized_stress(distances, [0, 1, 3]), "| of squashed map [0, 1, 2]:", round(normalized_stress(distances, [0, 1, 2]), 4))

# Output:
# stress of exact map [0, 1, 3]: 0.0 | of squashed map [0, 1, 2]: 0.378`,
      walk: [
        { line: "numerator = sum((distance - abs(positions[i]-positions[j]))**2", say: "Squared mismatch between given and plotted distances." },
        { line: "assert normalized_stress(distances, [0, 1, 2]) > 0", say: "The exact map has stress 0; the squashed one does not." },
      ],
    },
    "1.11.4 t-SNE: conditional neighborhoods and a KL objective#0": {
      goal: "One row of t-SNE neighbour probabilities and its perplexity",
      code: r`import math


def conditional_neighbors(squared_distances, bandwidth):
    if (not squared_distances or bandwidth <= 0
            or any(d < 0 or not math.isfinite(d) for d in squared_distances)):
        raise ValueError("Need finite squared distances and positive bandwidth")
    values = [-d/(2*bandwidth**2) for d in squared_distances]
    offset = max(values)
    weights = [math.exp(value-offset) for value in values]
    total = sum(weights)
    return [weight/total for weight in weights]


conditional = conditional_neighbors([1, 4], 1)
perplexity = math.exp(-sum(p*math.log(p) for p in conditional if p > 0))
assert abs(conditional[0]-0.8175744762) < 1e-9
assert abs(sum(conditional)-1) < 1e-12
assert 1.5 < perplexity < 1.7
print("conditional probabilities:", [round(p, 4) for p in conditional], "| perplexity:", round(perplexity, 3))

# Output:
# conditional probabilities: [0.8176, 0.1824] | perplexity: 1.608`,
      walk: [
        { line: "total = sum(weights)", say: "Turn Gaussian weights into probabilities that sum to 1." },
        { line: "perplexity = math.exp(-sum(p*math.log(p) for p in conditional if p > 0))", say: "Perplexity, the effective number of neighbours: about 1.6 here." },
      ],
    },
    "1.11.5 Evaluate embeddings against their actual purpose#0": {
      goal: "Neighbour overlap between original data and a map",
      code: r`def neighbor_overlap(original, embedded, k):
    n = len(original)
    if n != len(embedded) or not 1 <= k < n:
        raise ValueError("Need aligned rows and a valid neighborhood size")
    def nearest(rows, i):
        distance = lambda j: sum((a-b)**2
                                 for a, b in zip(rows[i], rows[j]))
        return set(sorted((j for j in range(n) if j != i),
                          key=lambda j: (distance(j), j))[:k])
    return sum(len(nearest(original, i) & nearest(embedded, i))/k
               for i in range(n))/n


original = [(0,), (1,), (3,)]
embedded = [(-4/3,), (-1/3,), (5/3,)]
assert neighbor_overlap(original, embedded, 1) == 1.0
print("neighbour overlap at k=1:", neighbor_overlap(original, embedded, 1))

# Output:
# neighbour overlap at k=1: 1.0`,
      walk: [
        { line: "def neighbor_overlap(original, embedded, k):", say: "For each point, compare its $k$ nearest neighbours before and after embedding." },
        { line: "assert neighbor_overlap(original, embedded, 1) == 1.0", say: "A pure shift keeps every neighbour: overlap 1." },
      ],
    },
    "In Python#0": {
      goal: "PCA on digit images: variance kept, accuracy kept, and a 2-D picture",
      code: r`import numpy as np
import matplotlib.pyplot as plt
from sklearn.datasets import load_digits
from sklearn.decomposition import PCA
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X, y = load_digits(return_X_y=True)                  # 1,797 images of digits, 8 x 8 = 64 pixels each
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)

pca = make_pipeline(StandardScaler(), PCA(n_components=0.95))   # keep enough components for 95% of the variance
Z = pca.fit_transform(X_train)
print("64 pixels ->", Z.shape[1], "components keep 95% of the variance")
print("variance explained by the first 5 components:", pca[-1].explained_variance_ratio_[:5].round(3))

for k in (5, 10, 20, 64):
    model = make_pipeline(StandardScaler(), PCA(n_components=k), LogisticRegression(max_iter=2000))
    model.fit(X_train, y_train)
    print(f"logistic regression on {k:>2} components: test accuracy {model.score(X_test, y_test):.3f}")

Z2 = make_pipeline(StandardScaler(), PCA(n_components=2)).fit_transform(X_train)
fig, ax = plt.subplots(figsize=(5.5, 4))
points = ax.scatter(Z2[:, 0], Z2[:, 1], c=y_train, cmap="tab10", s=8)
ax.set(xlabel="component 1", ylabel="component 2", title="Digits squashed to 2 dimensions")
fig.colorbar(points, ax=ax, label="digit")
fig.tight_layout()
fig.savefig("digits_pca.png")

# Output:
# 64 pixels -> 39 components keep 95% of the variance
# variance explained by the first 5 components: [0.123 0.097 0.086 0.065 0.051]
# logistic regression on  5 components: test accuracy 0.820
# logistic regression on 10 components: test accuracy 0.867
# logistic regression on 20 components: test accuracy 0.956
# logistic regression on 64 components: test accuracy 0.969`,
      figure: { src: "/theory/figures/code/digits_pca.svg", alt: "Handwritten digits projected onto two principal components; points of the same digit tend to cluster." },
      walk: [
        { line: "pca = make_pipeline(StandardScaler(), PCA(n_components=0.95))   # keep enough components for 95% of the variance", say: "A fraction for `n_components` means \"as many components as needed for this share of variance\": 39 here." },
        { line: "model = make_pipeline(StandardScaler(), PCA(n_components=k), LogisticRegression(max_iter=2000))", say: "PCA inside the pipeline, so it is fitted on training rows only." },
        { line: "print(f\"logistic regression on {k:>2} components: test accuracy {model.score(X_test, y_test):.3f}\")", say: "20 components get almost the same accuracy as all 64 pixels." },
        { line: "Z2 = make_pipeline(StandardScaler(), PCA(n_components=2)).fit_transform(X_train)", say: "Two components for a picture: some digits separate, others overlap." },
      ],
    },
  },
};
