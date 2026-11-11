import type { TheoryTopic } from "../topics";

const r = String.raw;

export const CLUSTERING_THEORY: TheoryTopic[] = [
  {
    slug: "k-means",
    group: "Clustering",
    title: "K-Means",
    summary: "Place K centres, assign every point to its nearest centre, move centres to the mean, repeat.",
    learnHref: "/learn/k-means",
    playHref: "/games/clusters?level=start",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "K-Means splits unlabelled data into K groups by alternating two steps: assign each point to the nearest centroid, then move each centroid to the mean of its points." } },
          { p: "There are no labels, so there is nothing to be 'right' about. K-Means simply finds K compact, roughly round groups. Whether those groups mean anything is for you to judge." },
        ],
      },
      {
        heading: "The objective",
        blocks: [
          { p: "Minimise the within-cluster sum of squares (WCSS, also called inertia), where $\\boldsymbol\\mu_k$ is the centroid of cluster $C_k$:" },
          { math: r`J = \sum_{k=1}^{K}\sum_{\mathbf{x} \in C_k} \lVert\mathbf{x} - \boldsymbol\mu_k\rVert^2` },
          {
            steps: [
              { title: "Initialise", body: "Pick K starting centroids. k-means++ chooses them spread out, which is the scikit-learn default." },
              { title: "Assign", body: "Each point joins the cluster of its nearest centroid.", math: r`c_i = \arg\min_k \lVert\mathbf{x}_i - \boldsymbol\mu_k\rVert^2` },
              { title: "Update", body: "Each centroid moves to the mean of its assigned points.", math: r`\boldsymbol\mu_k = \frac{1}{|C_k|}\sum_{\mathbf{x} \in C_k}\mathbf{x}` },
              { title: "Repeat", body: "Stop when assignments no longer change. Each step can only lower J, so it always converges, but possibly to a local minimum." },
            ],
          },
        ],
      },
      {
        heading: "Worked example (1-D)",
        blocks: [
          { p: "Points $[1, 2, 3, 8, 9, 10]$, $K = 2$, bad starting centroids $\\mu_1 = 1$, $\\mu_2 = 2$." },
          {
            steps: [
              { title: "Assign (round 1)", body: "Only 1 is closer to μ₁. Clusters: {1} and {2, 3, 8, 9, 10}." },
              { title: "Update (round 1)", body: "", math: r`\mu_1 = 1, \qquad \mu_2 = \tfrac{2 + 3 + 8 + 9 + 10}{5} = 6.4` },
              { title: "Assign (round 2)", body: "2 and 3 are now closer to μ₁ = 1 than to 6.4. Clusters: {1, 2, 3} and {8, 9, 10}." },
              { title: "Update (round 2)", body: "Assignments will not change again, so K-Means has converged.", math: r`\mu_1 = 2, \quad \mu_2 = 9, \quad J = (1 + 0 + 1) + (1 + 0 + 1) = 4` },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "distance", caption: "K-Means uses Euclidean distance. Move the points to see how a big gap in one feature dominates the distance, which is why scaling matters." }],
      },
      {
        heading: "Choosing K",
        blocks: [
          {
            table: {
              head: ["Method", "How", "Read it"],
              rows: [
                ["Elbow", "Plot WCSS for K = 1, 2, 3, …", "Pick the K where the curve bends; after it, extra clusters help little"],
                ["Silhouette", "For each point, $s = \\frac{b - a}{\\max(a, b)}$ with $a$ = mean distance within its cluster, $b$ = to the nearest other cluster", "Average from −1 to 1; higher is better"],
                ["Domain knowledge", "How many groups can the business act on?", "Often the deciding factor"],
              ],
            },
          },
        ],
      },
      {
        heading: "Limits",
        blocks: [
          {
            table: {
              head: ["K-Means assumes", "So it struggles with"],
              rows: [
                ["Round, similar-sized clusters", "Long, curved or nested shapes (use DBSCAN)"],
                ["You know K", "Data where the number of groups is unclear"],
                ["Every point belongs somewhere", "Outliers, which drag centroids"],
                ["Features on comparable scales", "Unscaled data"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.preprocessing import StandardScaler

Xs = StandardScaler().fit_transform(X)
for k in range(2, 8):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(Xs)
    print(k, round(km.inertia_, 1), round(silhouette_score(Xs, km.labels_), 3))`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Running it once", fix: "Results depend on the start. Use n_init ≥ 10 and keep the lowest inertia." },
              { mistake: "Comparing inertia across different K to pick the lowest", fix: "Inertia always drops as K grows. Use the elbow or silhouette." },
              { mistake: "Treating cluster numbers as meaningful labels", fix: "Cluster 0 vs 1 is arbitrary. Describe clusters by their centroids." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Your data forms two interlocking crescent moons. Why does K-Means with K = 2 split them badly?", options: ["K is wrong", "K-Means assumes compact, roughly round clusters around a centre", "The data must be labelled", "The learning rate is too high"], answer: 1, why: "K-Means assigns by distance to a centre, which produces straight boundaries between round blobs. Density-based methods like DBSCAN follow curved shapes." } },
        ],
      },
    ],
  },
  {
    slug: "hierarchical-clustering",
    group: "Clustering",
    title: "Hierarchical Clustering",
    summary: "Merge the closest groups step by step and record the whole history as a dendrogram.",
    learnHref: "/learn/hierarchical-clustering",
    playHref: "/games/galaxy?level=dendro",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Agglomerative clustering starts with every point as its own cluster and repeatedly merges the two closest clusters, producing a tree (dendrogram) you can cut at any level." } },
          { p: "Unlike K-Means, you do not choose K up front. You build the full tree once, then decide how many clusters by where you cut it." },
        ],
      },
      {
        heading: "Linkage: how far apart are two clusters?",
        blocks: [
          {
            table: {
              head: ["Linkage", "Distance between clusters A and B", "Tends to produce"],
              rows: [
                ["Single", "$\\min d(a, b)$, closest pair", "Long chains; good for odd shapes, sensitive to noise"],
                ["Complete", "$\\max d(a, b)$, furthest pair", "Compact, similar-diameter clusters"],
                ["Average", "Mean of all pairwise distances", "A middle ground"],
                ["Ward", "Increase in total within-cluster variance if merged", "Round, balanced clusters (like K-Means); scikit-learn default"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example (1-D, single vs complete)",
        blocks: [
          { p: "Points A = 1, B = 2.5, C = 6, D = 8, E = 8.5." },
          {
            steps: [
              { title: "Merge 1", body: "Closest pair is D–E (distance 0.5). Clusters: A, B, C, {D, E}." },
              { title: "Merge 2", body: "Next closest: A–B (1.5). Clusters: {A, B}, C, {D, E}." },
              { title: "Merge 3: linkage matters", body: "C to {D, E}: single linkage uses the closest pair, complete uses the furthest.", math: r`\text{single} = \min(2, 2.5) = 2, \qquad \text{complete} = \max(2, 2.5) = 2.5` },
              { title: "Merge 4", body: "{A, B} joins {C, D, E}.", math: r`\text{single} = 6 - 2.5 = 3.5, \qquad \text{complete} = 8.5 - 1 = 7.5` },
              { title: "Cut the tree", body: "A horizontal cut at height 3 (single linkage) leaves two clusters: {A, B} and {C, D, E}." },
            ],
          },
        ],
      },
      {
        heading: "Reading a dendrogram",
        blocks: [
          {
            list: [
              "The height of each join is the distance at which two clusters merged.",
              "Long vertical gaps mean well-separated groups; cut across the longest gap.",
              "The number of vertical lines your cut crosses is the number of clusters.",
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from scipy.cluster.hierarchy import linkage, dendrogram, fcluster
from sklearn.cluster import AgglomerativeClustering
import matplotlib.pyplot as plt

Z = linkage(X, method="ward")
dendrogram(Z); plt.show()
labels = fcluster(Z, t=2, criterion="maxclust")     # cut into 2 clusters

agg = AgglomerativeClustering(n_clusters=3, linkage="average").fit(X)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Running it on hundreds of thousands of points", fix: "It needs all pairwise distances (O(n²) memory). Sample first or use K-Means / DBSCAN." },
              { mistake: "Using Ward with non-Euclidean distances", fix: "Ward is defined for Euclidean distance; use average or complete for others." },
              { mistake: "Ignoring the linkage choice", fix: "Single, complete and Ward can give very different trees. Try more than one." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Which linkage is most likely to produce long, chain-like clusters?", options: ["Single", "Complete", "Ward", "Average"], answer: 0, why: "Single linkage merges based on the closest pair, so a chain of nearby points can link distant regions together." } },
        ],
      },
    ],
  },
  {
    slug: "dbscan",
    group: "Clustering",
    title: "DBSCAN",
    summary: "Clusters are dense regions; points in sparse areas are labelled as noise.",
    learnHref: "/learn/dbscan",
    playHref: "/games/galaxy?level=eps",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "DBSCAN grows clusters outward from points that have many close neighbours, follows any shape the density takes, and leaves isolated points as noise." } },
          { p: "You never choose the number of clusters. You choose what 'dense' means with two numbers: a radius $\\varepsilon$ and a minimum count MinPts." },
        ],
      },
      {
        heading: "Three kinds of point",
        blocks: [
          { math: r`N_\varepsilon(\mathbf{p}) = \{\mathbf{q} : d(\mathbf{p}, \mathbf{q}) \le \varepsilon\} \quad (\text{includes } \mathbf{p} \text{ itself})` },
          {
            table: {
              head: ["Type", "Rule", "Role"],
              rows: [
                ["Core", "$|N_\\varepsilon(\\mathbf{p})| \\ge$ MinPts", "Starts and extends clusters"],
                ["Border", "Not core, but within ε of a core point", "Joins that core point's cluster"],
                ["Noise", "Neither", "Labelled −1, belongs to no cluster"],
              ],
            },
          },
          { p: "A cluster is every point reachable through a chain of core points, plus their border points." },
        ],
      },
      {
        heading: "Worked example (1-D)",
        blocks: [
          { p: "Points $[1, 1.5, 2, 2.5, 6, 6.5, 7, 12]$, $\\varepsilon = 0.6$, MinPts = 3." },
          {
            steps: [
              { title: "Count neighbours", body: "Within 0.6 (including itself): 1 → 2, 1.5 → 3, 2 → 3, 2.5 → 2, 6 → 2, 6.5 → 3, 7 → 2, 12 → 1." },
              { title: "Core points", body: "1.5, 2 and 6.5 have at least 3." },
              { title: "Cluster 1", body: "1.5 and 2 are core and within ε of each other. 1 and 2.5 are border points attached to them. Cluster: {1, 1.5, 2, 2.5}." },
              { title: "Cluster 2 and noise", body: "6.5 is core with borders 6 and 7: cluster {6, 6.5, 7}. 12 has no core neighbour, so it is **noise**." },
            ],
          },
        ],
      },
      {
        heading: "Choosing ε and MinPts",
        blocks: [
          {
            list: [
              "MinPts: a common rule is at least $d + 1$ (with $d$ features); 2× the number of features is a safe start.",
              "ε: plot each point's distance to its MinPts-th nearest neighbour, sorted. Pick ε at the 'knee' where the curve shoots up.",
              "ε too small: almost everything is noise. Too large: everything merges into one cluster.",
            ],
          },
          {
            table: {
              head: ["", "K-Means", "DBSCAN"],
              rows: [
                ["Need K?", "Yes", "No"],
                ["Cluster shape", "Round", "Any"],
                ["Outliers", "Forced into a cluster", "Labelled noise"],
                ["Weak spot", "Non-round shapes", "Clusters with very different densities"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.cluster import DBSCAN
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import numpy as np

Xs = StandardScaler().fit_transform(X)
dist, _ = NearestNeighbors(n_neighbors=5).fit(Xs).kneighbors(Xs)
k_dist = np.sort(dist[:, -1])          # plot this; ε is at the knee

db = DBSCAN(eps=0.3, min_samples=5).fit(Xs)
print(set(db.labels_))                  # -1 means noise`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Forgetting to scale", fix: "ε is a single radius for every feature, so features must share a scale." },
              { mistake: "Treating noise (−1) as a cluster", fix: "Filter label −1 before computing per-cluster statistics." },
              { mistake: "Using it when densities differ a lot", fix: "One ε cannot fit both dense and sparse clusters. Try HDBSCAN." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "A point has only 2 neighbours within ε (MinPts = 4) but one of them is a core point. What is it?", options: ["Core", "Border", "Noise", "A new cluster"], answer: 1, why: "It is not dense enough to be core, but it lies within ε of a core point, so it joins that cluster as a border point." } },
        ],
      },
    ],
  },
];

export const NN_THEORY: TheoryTopic[] = [
  {
    slug: "neural-networks",
    group: "Neural networks",
    title: "Neural Networks & Backpropagation",
    summary: "Layers of weighted sums and non-linear activations, trained by passing the error backwards.",
    learnHref: "/labs/neural-network",
    playHref: "/games/neurons?level=xor",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "A neural network stacks layers of neurons, each computing a weighted sum followed by a non-linear activation; backpropagation uses the chain rule to find every weight's gradient so gradient descent can train them all." } },
          { p: "One neuron is just logistic regression. The power comes from stacking: hidden layers build new features out of old ones, which lets the network bend its decision boundary into almost any shape." },
        ],
      },
      {
        heading: "A neuron and a layer",
        blocks: [
          { math: r`z = \mathbf{w}^\top\mathbf{x} + b, \qquad a = g(z)` },
          { p: "A whole layer does this for many neurons at once, with a weight matrix $\\mathbf{W}^{[l]}$:" },
          { math: r`\mathbf{a}^{[l]} = g\big(\mathbf{W}^{[l]}\mathbf{a}^{[l-1]} + \mathbf{b}^{[l]}\big), \qquad \mathbf{a}^{[0]} = \mathbf{x}` },
          {
            table: {
              head: ["Activation", "Formula", "Use"],
              rows: [
                ["ReLU", "$\\max(0, z)$", "Default for hidden layers: cheap, does not saturate for $z > 0$"],
                ["Sigmoid", "$1/(1 + e^{-z})$", "Output layer for binary classification"],
                ["Tanh", "$(e^z - e^{-z})/(e^z + e^{-z})$", "Hidden layers in small/older nets; output in (−1, 1)"],
                ["Softmax", "$e^{z_k}/\\sum_j e^{z_j}$", "Output layer for multiclass"],
                ["Linear", "$z$", "Output layer for regression"],
              ],
            },
          },
          { p: "Without a non-linear activation, stacked layers collapse into a single linear map ($\\mathbf{W}_2\\mathbf{W}_1\\mathbf{x}$ is just another matrix times $\\mathbf{x}$), so depth would add nothing." },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "neuron", caption: "Change inputs, weights and bias. With ReLU, the output is exactly zero whenever z is negative." }],
      },
      {
        heading: "Backpropagation",
        blocks: [
          { p: "Forward pass: compute every $z$ and $a$ layer by layer, then the loss. Backward pass: start from $\\partial L / \\partial \\hat{y}$ and apply the chain rule layer by layer, reusing what was already computed." },
          { math: r`\boldsymbol\delta^{[l]} = \frac{\partial L}{\partial \mathbf{z}^{[l]}} = \big(\mathbf{W}^{[l+1]\top}\boldsymbol\delta^{[l+1]}\big) \odot g'\big(\mathbf{z}^{[l]}\big), \qquad \frac{\partial L}{\partial \mathbf{W}^{[l]}} = \boldsymbol\delta^{[l]}\mathbf{a}^{[l-1]\top}` },
          {
            derive: {
              title: "Why this is just the chain rule",
              blocks: [
                { p: "A weight $w$ in layer $l$ affects the loss only through $z^{[l]}$, which affects $a^{[l]}$, which affects every later layer. Write the dependency as a chain and multiply the local derivatives:" },
                { math: r`\frac{\partial L}{\partial w^{[l]}} = \frac{\partial L}{\partial a^{[L]}}\cdot\frac{\partial a^{[L]}}{\partial z^{[L]}}\cdots\frac{\partial a^{[l]}}{\partial z^{[l]}}\cdot\frac{\partial z^{[l]}}{\partial w^{[l]}}` },
                { p: "Everything to the left of $\\partial a^{[l]}/\\partial z^{[l]}$ is shared by all weights in layer $l$; that shared part is $\\delta^{[l]}$. Computing it once per layer, from the output backwards, is what makes backprop fast." },
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: one update by hand",
        blocks: [
          { p: "Network: $x \\to h = \\text{ReLU}(w_1x) \\to \\hat{y} = w_2h$. Input $x = 1$, target $y = 2$, $w_1 = 0.5$, $w_2 = 2$, loss $(\\hat{y} - y)^2$, $\\eta = 0.1$." },
          {
            steps: [
              { title: "Forward", body: "", math: r`h = \text{ReLU}(0.5) = 0.5, \quad \hat{y} = 2 \times 0.5 = 1, \quad L = (1 - 2)^2 = 1` },
              { title: "Output gradient", body: "", math: r`\frac{\partial L}{\partial \hat{y}} = 2(\hat{y} - y) = -2` },
              { title: "Gradient for w₂", body: "$\\hat{y} = w_2h$, so $\\partial\\hat{y}/\\partial w_2 = h$.", math: r`\frac{\partial L}{\partial w_2} = -2 \times 0.5 = -1` },
              { title: "Pass back to w₁", body: "Through $w_2$, then ReLU (slope 1 because $0.5 > 0$), then $x$.", math: r`\frac{\partial L}{\partial w_1} = -2 \times w_2 \times 1 \times x = -2 \times 2 \times 1 \times 1 = -4` },
              { title: "Update and re-check", body: "Loss falls from 1 to about 0.012 after one step.", math: r`w_2 = 2.1, \quad w_1 = 0.9 \;\Rightarrow\; \hat{y} = 2.1 \times 0.9 = 1.89, \quad L \approx 0.012` },
            ],
          },
        ],
      },
      {
        heading: "Training in practice",
        blocks: [
          {
            table: {
              head: ["Problem", "Symptom", "Fix"],
              rows: [
                ["Vanishing gradients", "Early layers barely learn (common with sigmoid/tanh in deep nets)", "ReLU, good initialisation (He/Xavier), batch norm, residual connections"],
                ["Exploding gradients", "Loss jumps to NaN", "Lower learning rate, gradient clipping"],
                ["Overfitting", "Train loss falls, validation loss rises", "Dropout, L2 weight decay, early stopping, more data"],
                ["All weights start equal", "Every neuron learns the same thing", "Random initialisation (never all zeros)"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler

net = make_pipeline(
    StandardScaler(),
    MLPClassifier(hidden_layer_sizes=(16, 8), activation="relu",
                  solver="adam", alpha=1e-4, early_stopping=True,
                  max_iter=500, random_state=0),
)
net.fit(X_train, y_train)
print(net.score(X_test, y_test))`,
          },
          { p: "For images, text or anything large, use a deep-learning library (PyTorch, Keras). The maths is identical; they add GPUs and automatic differentiation." },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Feeding unscaled inputs", fix: "Standardise features; otherwise gradients are badly balanced and training stalls." },
              { mistake: "Using a network for a small tabular dataset by default", fix: "Try logistic regression or gradient boosting first; they are often as good and far easier." },
              { mistake: "Sigmoid in every hidden layer of a deep net", fix: "Use ReLU (or a variant) in hidden layers to avoid vanishing gradients." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Why can't a single neuron (logistic regression) solve XOR, while a network with one hidden layer can?", options: ["XOR needs more training data", "A single neuron's boundary is a straight line, and XOR is not linearly separable", "Single neurons cannot use the sigmoid", "XOR requires a regression loss"], answer: 1, why: "No straight line separates XOR's classes. A hidden layer creates new features (like 'x₁ OR x₂' and 'x₁ AND x₂') in which the classes become linearly separable." } },
        ],
      },
    ],
  },
];

export const WORKFLOW_THEORY: TheoryTopic[] = [
  {
    slug: "feature-scaling",
    group: "Workflow",
    title: "Feature Scaling",
    summary: "Put features on comparable scales so distances and gradients treat them fairly.",
    learnHref: "/workbench",
    playHref: "/games/sorter?level=scale",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Scaling transforms each feature to a similar range so that no feature dominates just because of its units." } },
          { p: "Height in cm (150–190) and income in rupees (20,000–1,20,000) differ by a factor of a thousand. Any model that measures distance or uses gradient descent will effectively ignore height." },
        ],
      },
      {
        heading: "The main scalers",
        blocks: [
          { math: r`\text{Standardisation: } z = \frac{x - \mu}{\sigma} \qquad \text{Min–max: } x' = \frac{x - x_{\min}}{x_{\max} - x_{\min}} \qquad \text{Robust: } x' = \frac{x - \text{median}}{\text{IQR}}` },
          {
            table: {
              head: ["Scaler", "Result", "Use when", "Weakness"],
              rows: [
                ["StandardScaler", "Mean 0, std 1", "Default for linear models, SVMs, neural nets, PCA", "Outliers inflate σ"],
                ["MinMaxScaler", "Range [0, 1]", "Bounded inputs needed (images, some nets)", "One outlier squashes everything else"],
                ["RobustScaler", "Median 0, IQR 1", "Data with outliers", "Range not bounded"],
                ["Log transform", "Compresses large values", "Right-skewed data (income, counts)", "Needs positive values (use log1p for zeros)"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example",
        blocks: [
          { p: "Heights $[150, 162, 170, 178, 190]$ cm." },
          {
            steps: [
              { title: "Mean and standard deviation", body: "Deviations: −20, −8, 0, 8, 20. Squares sum to 928.", math: r`\mu = 170, \qquad \sigma = \sqrt{928/5} \approx 13.62` },
              { title: "Standardise 190 and 162", body: "190 cm is about 1.47 standard deviations above average.", math: r`z_{190} = \frac{190 - 170}{13.62} \approx 1.47, \qquad z_{162} \approx -0.59` },
              { title: "Min–max 170", body: "", math: r`\frac{170 - 150}{190 - 150} = 0.5` },
              { title: "Apply the same numbers to new data", body: "A test height of 200 cm uses the training μ and σ: $z \\approx 2.20$. Min–max gives 1.25, outside [0, 1], which is expected." },
            ],
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "scaling", caption: "Compare raw and scaled versions. Raw income dwarfs height; after scaling both spread over a similar range." }],
      },
      {
        heading: "Which models need it?",
        blocks: [
          {
            table: {
              head: ["Needs scaling", "Does not"],
              rows: [
                ["KNN, K-Means, DBSCAN (distances)", "Decision trees"],
                ["Linear/logistic regression with gradient descent or regularisation", "Random forests"],
                ["SVMs, PCA, neural networks", "Gradient-boosted trees (XGBoost, LightGBM)"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from sklearn.neighbors import KNeighborsClassifier

scaler = StandardScaler().fit(X_train)       # learn mean and std from TRAIN only
X_train_s = scaler.transform(X_train)
X_test_s = scaler.transform(X_test)          # reuse the same numbers

# Better: a pipeline does this automatically, including inside cross-validation
model = make_pipeline(StandardScaler(), KNeighborsClassifier()).fit(X_train, y_train)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Fitting the scaler on the whole dataset", fix: "That leaks test statistics into training. Fit on train, transform both (or use a pipeline)." },
              { mistake: "Scaling the target for classification", fix: "Only features are scaled. Class labels stay as they are." },
              { mistake: "Scaling one-hot columns", fix: "0/1 columns are already comparable; scaling them is usually unnecessary." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Which model's predictions are unaffected by standardising the features?", options: ["KNN", "K-Means", "Decision tree", "Ridge regression"], answer: 2, why: "A tree splits on thresholds within one feature at a time; rescaling moves the thresholds but not the split order, so predictions do not change." } },
        ],
      },
    ],
  },
  {
    slug: "train-test-split",
    group: "Workflow",
    title: "Train/Test Split & Data Leakage",
    summary: "Keep data the model never sees, and make sure nothing from it sneaks into training.",
    learnHref: "/workbench",
    playHref: "/games/pipeline?level=leak",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "You only learn how a model will do on new data by testing it on data it has never touched, and leakage is anything that lets information from that data slip into training." } },
          { p: "A student who has seen the exam paper scores 100%, and that score says nothing about what they know. Training-set accuracy is the same: always optimistic." },
        ],
      },
      {
        heading: "Three sets",
        blocks: [
          {
            table: {
              head: ["Set", "Typical share", "Used for"],
              rows: [
                ["Training", "60–80%", "Fitting parameters"],
                ["Validation", "10–20% (or cross-validation inside training)", "Choosing hyperparameters and models"],
                ["Test", "10–20%", "One final, honest estimate"],
              ],
            },
          },
          { p: "**k-fold cross-validation** reuses the training data: split it into $k$ folds, train on $k - 1$, validate on the remaining one, rotate, and average. With $k = 5$, every example is validated exactly once and the estimate is far less noisy than a single split." },
          { math: r`\text{CV score} = \frac{1}{k}\sum_{j=1}^{k}\text{score}\big(\text{model trained without fold } j,\ \text{fold } j\big)` },
        ],
      },
      {
        heading: "Splitting correctly",
        blocks: [
          {
            table: {
              head: ["Data", "Split method", "Why"],
              rows: [
                ["Imbalanced classes", "Stratified split", "Keeps class proportions equal in every set"],
                ["Time series", "Train on the past, test on the future", "Random splits let the model peek at the future"],
                ["Several rows per person/patient", "Group split", "The same person in train and test inflates scores"],
              ],
            },
          },
        ],
      },
      {
        heading: "Worked example: spotting leakage",
        blocks: [
          { p: "A model predicts whether a loan defaults. Validation accuracy is 99%. Investigate:" },
          {
            steps: [
              { title: "Check suspicious features", body: "One column is 'number of collection calls'. Collections only happen **after** a default, so it encodes the answer. Remove features not available at prediction time." },
              { title: "Check preprocessing order", body: "The scaler and missing-value imputer were fitted on all data before splitting, so test means leaked into training. Fit them inside a pipeline after the split." },
              { title: "Check duplicates", body: "The same customer appears with several loans in both train and test. Use a group split by customer ID." },
              { title: "Re-evaluate", body: "With the fixes, accuracy drops to a believable level. That lower number is the real one." },
            ],
          },
        ],
      },
      {
        heading: "Types of leakage",
        blocks: [
          {
            list: [
              "**Target leakage**: a feature that is created from, or only known after, the target.",
              "**Train–test contamination**: preprocessing, feature selection or oversampling fitted on data that includes the test set.",
              "**Temporal leakage**: future information used to predict the past.",
              "**Duplicate leakage**: near-identical rows on both sides of the split.",
            ],
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.pipeline import make_pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42)

pipe = make_pipeline(SimpleImputer(), StandardScaler(), LogisticRegression())
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
print(cross_val_score(pipe, X_train, y_train, cv=cv).mean())   # preprocessing refit per fold

pipe.fit(X_train, y_train)
print(pipe.score(X_test, y_test))   # look at this once, at the end`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Scaling or imputing before splitting", fix: "Put every fitted step in a pipeline so it only sees training folds." },
              { mistake: "Repeatedly checking the test score while tuning", fix: "That turns the test set into a validation set. Tune with CV; test once." },
              { mistake: "Random splits on time-ordered data", fix: "Use TimeSeriesSplit or a cut-off date." },
              { mistake: "Oversampling (SMOTE) before splitting", fix: "Synthetic copies of test-like points end up in training. Oversample inside the training fold only." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "You fit a StandardScaler on the full dataset, then split into train and test. What is the problem?", options: ["None, scaling does not use labels", "Test-set statistics leaked into the training data", "The model will underfit", "StandardScaler needs a validation set"], answer: 1, why: "The mean and standard deviation included test rows, so training saw information from the test set. Even without labels, this makes the test score optimistic." } },
        ],
      },
    ],
  },
  {
    slug: "bias-variance",
    group: "Workflow",
    title: "Bias, Variance & Overfitting",
    summary: "Too simple misses the pattern; too flexible memorises the noise. Aim for the sweet spot.",
    learnHref: "/workbench",
    playHref: "/games/pipeline?level=overfit",
    sections: [
      {
        heading: "The idea",
        blocks: [
          { callout: { title: "In one sentence", body: "Prediction error comes from bias (the model is too simple to capture the pattern), variance (it changes too much with the training sample) and irreducible noise; reducing one usually raises the other." } },
          { p: "Think of throwing darts. High bias: all darts land together, but off-centre. High variance: centred on average, but scattered everywhere. You want tight and centred." },
        ],
      },
      {
        heading: "The decomposition",
        blocks: [
          { p: "For squared error at a point $\\mathbf{x}$, averaging over many possible training sets, with true function $f$ and noise variance $\\sigma^2$:" },
          { math: r`\mathbb{E}\big[(y - \hat{f}(\mathbf{x}))^2\big] = \underbrace{\big(\mathbb{E}[\hat{f}(\mathbf{x})] - f(\mathbf{x})\big)^2}_{\text{bias}^2} + \underbrace{\mathbb{E}\big[(\hat{f}(\mathbf{x}) - \mathbb{E}[\hat{f}(\mathbf{x})])^2\big]}_{\text{variance}} + \underbrace{\sigma^2}_{\text{noise}}` },
          {
            derive: {
              title: "Where the three terms come from",
              blocks: [
                { p: "Write $y = f + \\varepsilon$ with $\\mathbb{E}[\\varepsilon] = 0$, and let $\\bar{f} = \\mathbb{E}[\\hat{f}]$. Add and subtract $\\bar{f}$:" },
                { math: r`y - \hat{f} = \varepsilon + (f - \bar{f}) + (\bar{f} - \hat{f})` },
                { p: "Square and take expectations. The noise is independent of the training set, and $\\mathbb{E}[\\bar{f} - \\hat{f}] = 0$, so every cross term vanishes, leaving $\\sigma^2 + (f - \\bar{f})^2 + \\mathbb{E}[(\\hat{f} - \\bar{f})^2]$." },
              ],
            },
          },
        ],
      },
      {
        heading: "Diagnose from two numbers",
        blocks: [
          {
            table: {
              head: ["Train error", "Validation error", "Diagnosis", "What to try"],
              rows: [
                ["High", "High (similar)", "High bias: underfitting", "More features, more flexible model, less regularisation, train longer"],
                ["Low", "Much higher", "High variance: overfitting", "More data, regularisation, simpler model, early stopping, dropout"],
                ["Low", "Low (similar)", "Good fit", "Ship it, then monitor"],
                ["High", "Lower than train", "Suspicious", "Check for leakage or a mismatched split"],
              ],
            },
          },
        ],
      },
      {
        heading: "Try it",
        blocks: [{ tryit: "poly-degree", caption: "Degree 1 is high bias (both errors high). Degree 11 is high variance (train tiny, test huge). The best degree balances them." }],
      },
      {
        heading: "Worked example: reading learning curves",
        blocks: [
          { p: "A learning curve plots training and validation error as the training set grows." },
          {
            steps: [
              { title: "Both curves flatten high and close together", body: "More data will not help: the model cannot represent the pattern. That is **bias**. Add capacity." },
              { title: "A large gap that narrows as data grows", body: "The model memorises small samples. That is **variance**, and more data is likely to help." },
              { title: "Regularisation moves you along the trade-off", body: "Increasing λ in ridge raises bias and lowers variance; decreasing it does the opposite. Choose λ where validation error is lowest." },
            ],
          },
        ],
      },
      {
        heading: "Model complexity knobs",
        blocks: [
          {
            table: {
              head: ["Model", "More flexible (↑ variance)", "Simpler (↑ bias)"],
              rows: [
                ["Polynomial regression", "Higher degree", "Lower degree"],
                ["Ridge / Lasso", "Smaller λ", "Larger λ"],
                ["KNN", "Smaller K", "Larger K"],
                ["Decision tree", "Deeper, smaller leaves", "Shallower, larger leaves"],
                ["Neural network", "More layers/units, less dropout", "Fewer units, more dropout/weight decay"],
              ],
            },
          },
        ],
      },
      {
        heading: "In Python",
        blocks: [
          {
            code: `from sklearn.model_selection import learning_curve, validation_curve
from sklearn.tree import DecisionTreeClassifier
import numpy as np

depths = np.arange(1, 15)
train_s, val_s = validation_curve(DecisionTreeClassifier(random_state=0), X, y,
                                  param_name="max_depth", param_range=depths, cv=5)
best = depths[val_s.mean(axis=1).argmax()]

sizes, tr, va = learning_curve(DecisionTreeClassifier(max_depth=best), X, y,
                               train_sizes=np.linspace(0.1, 1.0, 8), cv=5)`,
          },
        ],
      },
      {
        heading: "Common mistakes",
        blocks: [
          {
            pitfalls: [
              { mistake: "Collecting more data for a high-bias model", fix: "If both errors are high and close, more data will not help. Increase capacity first." },
              { mistake: "Judging fit from the training score alone", fix: "Always compare with validation error; the gap is the diagnosis." },
              { mistake: "Expecting zero error", fix: "Irreducible noise sets a floor. Chasing below it is overfitting." },
            ],
          },
        ],
      },
      {
        heading: "Check yourself",
        blocks: [
          { quiz: { q: "Training accuracy is 99% and validation accuracy is 72%. Which change is most likely to help?", options: ["Make the model deeper", "Remove regularisation", "Add regularisation or collect more data", "Train for more epochs"], answer: 2, why: "A big train–validation gap is high variance (overfitting). Regularisation and more data reduce variance; the other options increase it." } },
        ],
      },
    ],
  },
];
