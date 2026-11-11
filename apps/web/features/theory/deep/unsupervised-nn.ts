import type { Deep } from "./types";

const r = String.raw;

export const DEEP_UNSUPERVISED_NN: Record<string, Deep> = {
  "k-means": {
    explain: [
      { p: "Clustering asks: which points belong together? There are no labels, so 'together' must be defined by a measure. K-Means defines it as 'close to the same centre' and measures the quality of a clustering by the total squared distance from each point to its centre. Lower is tighter." },
      { p: "Why the two steps always improve things: the **assign** step gives each point its nearest centre, which can only lower its squared distance. The **update** step moves each centre to the mean of its points, and the mean is exactly the point that minimises total squared distance to a group (the same fact that makes MSE predict the mean). Neither step can increase the objective, and there are finitely many ways to assign points, so the algorithm must stop." },
      { p: "It stops at a **local** minimum, which depends on the starting centres. Bad starts can merge two real clusters and split another. **k-means++** fixes most of this: choose the first centre at random, then choose each next centre with probability proportional to its squared distance from the nearest centre already chosen, so starts are spread out. Running several starts (`n_init`) and keeping the lowest inertia handles the rest." },
      { p: "K-Means implicitly assumes clusters are roughly spherical, similar in size and similar in spread, because it assigns by straight-line distance to a centre. Elongated clusters get cut in half; a small cluster next to a big one gets swallowed. When clusters are not like that, consider DBSCAN (any shape), Gaussian mixture models (elliptical, soft assignments) or hierarchical clustering." },
      {
        table: {
          head: ["Method", "Cluster shape", "Assignment", "Choose K?"],
          rows: [
            ["K-Means", "Round", "Hard (one cluster)", "Yes"],
            ["Gaussian mixture (GMM)", "Elliptical", "Soft (probabilities)", "Yes"],
            ["Hierarchical", "Depends on linkage", "Hard, any level", "Cut later"],
            ["DBSCAN", "Any (density)", "Hard + noise", "No"],
          ],
        },
      },
      { p: "Common uses: customer segmentation, compressing colours in an image (each pixel replaced by its centroid colour, 'vector quantisation'), grouping documents, and creating features (distance to each centroid) for a downstream model. **Mini-batch K-Means** updates centres from small random batches and scales to millions of points." },
    ],
    practice: [
      {
        q: "Points (1, 1), (1, 2), (8, 8), (9, 8), K = 2, starting centres (1, 1) and (1, 2). Run K-Means to convergence and give the final inertia.",
        solution: [
          { p: "Round 1 assign: (1, 1) → c₁; (1, 2), (8, 8), (9, 8) → c₂ (closer to (1, 2)). Update: c₁ = (1, 1); c₂ = mean of (1, 2), (8, 8), (9, 8) = (6, 6)." },
          { p: "Round 2 assign: (1, 2) is at distance 1 from c₁ and about 6.4 from c₂, so it moves to c₁. Clusters {(1, 1), (1, 2)} and {(8, 8), (9, 8)}. Update: c₁ = (1, 1.5), c₂ = (8.5, 8)." },
          { p: "Round 3: no change. Inertia = 0.25 + 0.25 + 0.25 + 0.25 = 1." },
        ],
      },
      {
        q: "Inertia for K = 1..6: 1000, 420, 180, 160, 148, 140. Which K does the elbow suggest?",
        solution: [{ p: "K = 3. The drops are 580, 240, then only 20, 12, 8. After 3, extra clusters barely help." }],
      },
      {
        q: "A point's mean distance to its own cluster is a = 2 and to the nearest other cluster is b = 5. What is its silhouette value? What if a = 4, b = 3?",
        solution: [{ math: r`s = \frac{5 - 2}{5} = 0.6, \qquad s = \frac{3 - 4}{4} = -0.25 \;(\text{probably in the wrong cluster})` }],
      },
    ],
    interview: [
      { q: "Does K-Means always converge? To the global optimum?", a: "It always converges, because neither step increases the inertia and there are finitely many assignments. It usually reaches only a local optimum that depends on initialisation, hence k-means++ and multiple restarts." },
      { q: "How do you choose K?", a: "The elbow of the inertia curve, the average silhouette score, the gap statistic, and above all whether the clusters are useful and interpretable for the business question." },
      { q: "When does K-Means fail?", a: "Non-spherical or elongated clusters, clusters of very different sizes or densities, strong outliers, unscaled features, and categorical data (use K-Modes for that)." },
    ],
    summary: [
      "Minimise within-cluster squared distance (inertia).",
      "Alternate: assign to nearest centroid, move centroids to means.",
      "Converges to a local minimum; use k-means++ and several starts.",
      "Choose K with elbow, silhouette and domain sense.",
      "Assumes round, similar clusters; scale features first.",
    ],
    quiz: [
      { q: "The update step moves a centroid to the mean because the mean:", options: ["Is easiest to compute", "Minimises the total squared distance to the cluster's points", "Is always a data point", "Ignores outliers"], answer: 1, why: "For squared distance, the mean is the optimal centre (the median would be optimal for absolute distance)." },
      { q: "k-means++ improves on random initialisation by:", options: ["Choosing K automatically", "Spreading the initial centres apart", "Using the median", "Removing outliers"], answer: 1, why: "Each new initial centre is chosen with probability proportional to squared distance from existing ones." },
    ],
  },

  "hierarchical-clustering": {
    explain: [
      { p: "Hierarchical clustering builds a family tree of the data. At the bottom, every point is its own cluster. At each step the two closest clusters merge, until one cluster contains everything. The full history is drawn as a **dendrogram**, and you choose the number of clusters afterwards by cutting the tree at a height." },
      { p: "This bottom-up approach is **agglomerative**. The top-down alternative, **divisive** clustering, starts with everything in one cluster and splits repeatedly; it is rarely used because good splits are expensive to find. Agglomerative clustering needs all pairwise distances, which is $O(n^2)$ memory and at least $O(n^2)$ time, so it suits up to a few tens of thousands of points." },
      { p: "Linkage defines the distance between two clusters, and it changes the result a lot. **Single** linkage (closest pair) follows chains and can find long, snaking clusters, but one bridge of noise points can merge two groups. **Complete** linkage (farthest pair) prefers compact clusters of similar diameter. **Average** linkage sits between them. **Ward** merges the pair that increases total within-cluster variance the least, producing K-Means-like round clusters; it is the most common default." },
      { math: r`\text{Ward merge cost: } \Delta(A, B) = \frac{|A||B|}{|A| + |B|}\,\lVert\boldsymbol\mu_A - \boldsymbol\mu_B\rVert^2` },
      { p: "Reading a dendrogram: the vertical axis is merge distance. Short joins near the bottom are very similar points. Long vertical lines without joins mean a large gap before the next merge, a sign of well-separated clusters. Cutting across the longest such lines gives a natural number of clusters." },
      { p: "Hierarchical clustering is popular in biology (gene expression, evolutionary trees), document organisation and anywhere the nested structure itself is interesting, such as a taxonomy of products with categories and sub-categories." },
    ],
    practice: [
      {
        q: "1-D points 1, 2, 4, 8, 9. Run single-linkage agglomerative clustering and list each merge with its height.",
        solution: [
          { list: ["Merge {1, 2} at 1 (tie with {8, 9}; either order).", "Merge {8, 9} at 1.", "Merge 4 with {1, 2} at 2 (4 − 2).", "Merge {1, 2, 4} with {8, 9} at 4 (8 − 4)."] },
        ],
      },
      {
        q: "For the same points, at what height does complete linkage merge 4 with {1, 2}, and the final two clusters?",
        solution: [{ p: "4 with {1, 2}: farthest pair is 4 − 1 = 3. Final merge {1, 2, 4} with {8, 9}: farthest pair 9 − 1 = 8." }],
      },
      {
        q: "Ward cost of merging cluster A = {0, 2} with B = {10} (1-D).",
        solution: [{ math: r`\mu_A = 1,\; \mu_B = 10: \quad \Delta = \frac{2 \times 1}{3}(10 - 1)^2 = \tfrac{2}{3} \times 81 = 54` }],
      },
    ],
    interview: [
      { q: "Agglomerative vs divisive clustering?", a: "Agglomerative starts with single points and merges the closest clusters; divisive starts with one cluster and splits. Agglomerative is far more common because merging is cheap to decide." },
      { q: "What is a dendrogram and how do you use it?", a: "A tree diagram of the merge history, with merge distance on the vertical axis. Cutting it horizontally gives a clustering; the number of vertical lines crossed is the number of clusters. Long gaps suggest natural cut points." },
      { q: "How is hierarchical clustering different from K-Means?", a: "It does not need K in advance, gives a full nested hierarchy and works with any distance, but costs O(n²) memory and time and cannot reassign points once merged. K-Means is faster and scales to large data." },
    ],
    summary: [
      "Agglomerative: start with singletons, repeatedly merge the closest pair.",
      "Linkage (single, complete, average, Ward) defines cluster distance.",
      "Dendrogram shows the whole history; cut it to choose the number of clusters.",
      "O(n²) memory: fine for thousands, not millions.",
      "Merges are never undone (greedy).",
    ],
    quiz: [
      { q: "Which linkage tends to produce clusters similar to K-Means?", options: ["Single", "Complete", "Ward", "Centroid-free"], answer: 2, why: "Ward minimises the increase in within-cluster variance, the same quantity K-Means minimises." },
      { q: "For n = 10,000 points, how many pairwise distances does the full distance matrix hold (unique pairs)?", options: ["10,000", "about 50 million", "100 million", "about 5,000"], answer: 1, why: "n(n − 1)/2 = 49,995,000." },
    ],
  },

  dbscan: {
    explain: [
      { p: "DBSCAN defines a cluster as a region where points are packed densely, separated from other clusters by regions where points are sparse. It never needs to know how many clusters there are; it finds as many dense regions as exist, of whatever shape, and anything in the sparse gaps is labelled noise." },
      { p: "The algorithm is like spreading a rumour. Pick an unvisited core point and start a new cluster. Add every point within ε of it. For every newly added point that is itself a core point, add its ε-neighbours too, and keep going until the cluster stops growing. Then pick another unvisited core point. Points never reached are noise." },
      { p: "Two terms describe how points connect. A point $q$ is **directly density-reachable** from core point $p$ if it lies within ε of $p$. It is **density-reachable** if there is a chain of core points leading to it. Two points are **density-connected** if both are density-reachable from some common core point. A cluster is a maximal set of density-connected points." },
      { p: "DBSCAN's weak spot is varying density. A single ε that captures a sparse cluster will merge nearby dense clusters; one small enough to separate the dense clusters will label the sparse one as noise. **HDBSCAN** handles this by effectively trying all ε values and keeping the most stable clusters; **OPTICS** produces a reachability plot from which clusters at different densities can be read." },
      {
        table: {
          head: ["Parameter change", "Effect"],
          rows: [
            ["Increase ε", "Larger neighbourhoods: clusters merge, less noise"],
            ["Decrease ε", "More, smaller clusters; more noise"],
            ["Increase MinPts", "Stricter definition of dense: more noise, more robust"],
            ["Decrease MinPts", "Small groups become clusters; sensitive to noise"],
          ],
        },
      },
      { p: "Typical uses include geographic data (hotspots of GPS points, where ε is a real distance like 500 m), anomaly detection (noise points are candidate anomalies) and any problem with oddly shaped clusters. Border points between two clusters may be assigned to either one depending on processing order; core points and noise are always deterministic." },
    ],
    practice: [
      {
        q: "Points on a line: 0, 1, 2, 10, 11, 12, 13, 25. ε = 1.5, MinPts = 3 (including the point itself). Label every point.",
        solution: [
          { p: "Neighbour counts within 1.5: 0 → {0, 1} = 2; 1 → {0, 1, 2} = 3; 2 → {1, 2} = 2; 10 → 2; 11 → 3; 12 → 3; 13 → 2; 25 → 1." },
          { p: "Core: 1, 11, 12. Cluster 1: {0, 1, 2} (0 and 2 are border points of core 1). Cluster 2: {10, 11, 12, 13} (11 and 12 core, 10 and 13 border). 25: noise." },
        ],
      },
      {
        q: "Using the same points, what happens with ε = 10, MinPts = 3?",
        solution: [{ p: "Every point from 0 to 13 has at least 3 neighbours within 10, so they all join one cluster. 25 is 12 away from its nearest point (13), more than ε, so it is still noise. An ε that is too large merges separate clusters." }],
      },
      {
        q: "You have 2 features. Suggest a starting MinPts and describe how to choose ε.",
        solution: [{ p: "MinPts ≈ 2 × number of features = 4 (at least d + 1 = 3). Compute each point's distance to its 4th nearest neighbour, sort, plot, and take ε at the knee where distances start rising sharply." }],
      },
    ],
    interview: [
      { q: "What are core, border and noise points in DBSCAN?", a: "Core points have at least MinPts points within ε. Border points have fewer but lie within ε of a core point. Noise points are neither and belong to no cluster." },
      { q: "Advantages of DBSCAN over K-Means?", a: "No need to choose K, finds arbitrarily shaped clusters, explicitly labels outliers as noise, and is not pulled by outliers." },
      { q: "When does DBSCAN struggle?", a: "When clusters have very different densities (one ε cannot suit all), in high dimensions where distances lose meaning, and when ε is hard to choose without domain knowledge." },
    ],
    summary: [
      "Clusters = dense regions; sparse points = noise.",
      "Parameters: radius ε and MinPts.",
      "Core, border and noise points; clusters grow through core points.",
      "Finds any shape; no K needed; robust to outliers.",
      "Fails with very different densities: try HDBSCAN.",
    ],
    quiz: [
      { q: "Which points can extend a cluster to new points?", options: ["Border points", "Core points", "Noise points", "All points"], answer: 1, why: "Only core points have enough neighbours to pull further points into the cluster." },
      { q: "Increasing ε while keeping MinPts fixed generally:", options: ["Creates more noise", "Merges clusters and reduces noise", "Has no effect", "Increases the number of clusters always"], answer: 1, why: "Bigger neighbourhoods connect more points." },
    ],
  },

  pca: {
    explain: [
      { p: "Imagine a cloud of points shaped like a flattened rugby ball. Most of the spread lies along its long axis, less along the medium axis, and very little along the short one. PCA finds exactly those axes: the first principal component is the direction of greatest spread, the second is the direction of greatest remaining spread perpendicular to the first, and so on. Dropping the short axes loses little information." },
      { p: "Why is variance the measure of information? A direction where all points have nearly the same value tells you nothing about how points differ from each other. A direction where they spread widely distinguishes them. PCA keeps the directions that distinguish points and drops the ones that do not. This is an assumption, and it can fail: a low-variance direction might be exactly the one that separates two classes, because PCA never looks at labels." },
      { p: "PCA also minimises reconstruction error. If you project onto $k$ components and then map back to the original space, the squared distance between each point and its reconstruction is as small as possible for any $k$-dimensional linear projection. Maximising kept variance and minimising lost information are the same problem." },
      { p: "In practice PCA is computed with the **singular value decomposition** $\\mathbf{X} = \\mathbf{U}\\boldsymbol\\Sigma\\mathbf{V}^\\top$ of the centred data, rather than by building the covariance matrix. The columns of $\\mathbf{V}$ are the principal directions, and the eigenvalues of the covariance are $\\sigma_j^2/(n - 1)$. SVD is more numerically stable and is what scikit-learn uses." },
      {
        table: {
          head: ["Term", "Meaning"],
          rows: [
            ["Principal component / direction", "An eigenvector of the covariance matrix (a unit vector in feature space)"],
            ["Score / projection", "A point's coordinate along a component ($\\mathbf{z} = \\mathbf{X}\\mathbf{W}$)"],
            ["Loading", "How much each original feature contributes to a component"],
            ["Explained variance ratio", "Eigenvalue / sum of eigenvalues"],
            ["Whitening", "Rescale components to unit variance"],
          ],
        },
      },
      { p: "Related methods: **Kernel PCA** finds curved structure using a kernel; **t-SNE** and **UMAP** make 2-D maps that preserve local neighbourhoods (good for visualisation, not for features); **LDA** (linear discriminant analysis) is a supervised cousin that picks directions separating labelled classes." },
    ],
    practice: [
      {
        q: "Find the principal components of $\\mathbf{C} = \\begin{bmatrix} 5 & 0 \\\\ 0 & 1 \\end{bmatrix}$ and the variance explained by PC1.",
        solution: [{ p: "The matrix is already diagonal: eigenvalues 5 and 1, eigenvectors (1, 0) and (0, 1). PC1 is simply the first feature, explaining 5/6 ≈ 83.3% of the variance." }],
      },
      {
        q: "Eigenvalues: 4.0, 2.5, 1.5, 1.0, 0.6, 0.4. How many components are needed for at least 80% of the variance?",
        solution: [{ p: "Total = 10. Cumulative: 40%, 65%, 80%. So 3 components." }],
      },
      {
        q: "Centred data with $\\mathbf{v}_1 = \\tfrac{1}{\\sqrt{2}}(1, 1)$. Project the point (3, 1) onto PC1, then reconstruct it from that single score. What is the reconstruction error?",
        solution: [
          { math: r`z = \tfrac{3 + 1}{\sqrt{2}} = 2\sqrt{2}, \qquad \hat{\mathbf{x}} = z\,\mathbf{v}_1 = (2, 2)` },
          { math: r`\lVert(3, 1) - (2, 2)\rVert^2 = 1 + 1 = 2` },
        ],
      },
    ],
    interview: [
      { q: "What does PCA do, in one sentence?", a: "It finds orthogonal directions of maximum variance and re-expresses the data in those directions, so you can keep the top few and drop the rest with minimal information loss." },
      { q: "Why must you standardise before PCA?", a: "PCA maximises variance, and variance depends on units. Without scaling, a feature with a large range dominates the first component regardless of how informative it is." },
      { q: "Is PCA feature selection?", a: "No. Each component is a linear combination of all original features. It is feature extraction; you lose direct interpretability of the original columns." },
      { q: "Can PCA hurt a classifier?", a: "Yes. PCA ignores labels, so it may discard a low-variance direction that happens to separate the classes. Treat the number of components as a hyperparameter and validate." },
    ],
    summary: [
      "Components = eigenvectors of the covariance; variance = eigenvalues.",
      "Keep the top k for a target share of variance (e.g. 95%).",
      "Equivalent to minimising reconstruction error.",
      "Standardise first; fit inside the pipeline.",
      "Unsupervised: may drop label-relevant directions; components mix all features.",
    ],
    quiz: [
      { q: "Principal components are always:", options: ["Original features", "Orthogonal (perpendicular) to each other", "Equal in variance", "Chosen using labels"], answer: 1, why: "Eigenvectors of a symmetric covariance matrix are orthogonal." },
      { q: "Which method is supervised: it uses class labels to find directions?", options: ["PCA", "t-SNE", "LDA", "K-Means"], answer: 2, why: "Linear discriminant analysis maximises separation between labelled classes." },
    ],
  },

  "neural-networks": {
    explain: [
      { p: "A single neuron draws one straight line (a hyperplane) and says which side a point is on, softened by the activation. A layer of many neurons draws many lines at once. The next layer combines those half-spaces: 'on the left of line 1 AND above line 2'. Stacking layers lets the network build up complex regions from simple pieces, and with enough neurons it can approximate any continuous function (the **universal approximation theorem**)." },
      { p: "Hidden layers learn their own features. In an image network, the first layer learns edges, the next combines edges into corners and textures, then parts, then objects. Nobody programs these; they emerge because they help reduce the loss. This automatic feature learning is why neural networks dominate on raw data such as pixels, audio and text." },
      { p: "Counting parameters: a dense layer from $n_{\\text{in}}$ to $n_{\\text{out}}$ units has $n_{\\text{in}} \\times n_{\\text{out}}$ weights plus $n_{\\text{out}}$ biases. A network 784 → 128 → 10 (handwritten digits) has $784 \\times 128 + 128 + 128 \\times 10 + 10 = 101{,}770$ parameters. Large models have billions, which is why they need lots of data and regularisation." },
      { p: "The output layer and loss must match the task. Regression: one linear output, MSE. Binary classification: one sigmoid output, binary cross-entropy. Multiclass: $K$ softmax outputs, categorical cross-entropy. Multi-label (several labels can be true at once): $K$ sigmoid outputs, binary cross-entropy on each." },
      {
        table: {
          head: ["Architecture", "Built for", "Key idea"],
          rows: [
            ["MLP (dense layers)", "Tabular data, small problems", "Every unit connects to every unit in the next layer"],
            ["CNN", "Images, signals", "Small shared filters slide over the input (convolution)"],
            ["RNN / LSTM", "Sequences (older)", "A hidden state carries information through time"],
            ["Transformer", "Text, sequences, now images too", "Attention: every position looks at every other"],
          ],
        },
      },
      { p: "Backpropagation cost is roughly twice the forward pass, regardless of the number of parameters, because each layer's gradient reuses the one after it. That efficiency, combined with GPUs that do matrix multiplications in parallel, is what makes training large networks practical." },
    ],
    extra: [
      {
        heading: "Solving XOR by hand",
        blocks: [
          { p: "XOR outputs 1 when exactly one input is 1. Two hidden ReLU units are enough:" },
          { math: r`h_1 = \text{ReLU}(x_1 + x_2), \quad h_2 = \text{ReLU}(x_1 + x_2 - 1), \quad \hat{y} = h_1 - 2h_2` },
          {
            table: {
              head: ["$x_1, x_2$", "$h_1$", "$h_2$", "$\\hat{y}$"],
              rows: [["0, 0", "0", "0", "0"], ["0, 1", "1", "0", "1"], ["1, 0", "1", "0", "1"], ["1, 1", "2", "1", "0"]],
            },
          },
          { p: "The hidden layer turns the inputs into features (a count and 'both on') in which XOR becomes a simple linear combination." },
        ],
      },
    ],
    practice: [
      {
        q: "Count the parameters of a network 10 → 32 → 16 → 1.",
        solution: [{ math: r`(10 \times 32 + 32) + (32 \times 16 + 16) + (16 \times 1 + 1) = 352 + 528 + 17 = 897` }],
      },
      {
        q: "Forward pass: inputs $x = (1, 2)$, hidden weights $w_1 = (0.5, -1)$, $b_1 = 1$, $w_2 = (1, 1)$, $b_2 = -2$, ReLU hidden units, output $\\hat{y} = 2h_1 - h_2$. Compute $\\hat{y}$.",
        solution: [
          { math: r`h_1 = \text{ReLU}(0.5 - 2 + 1) = \text{ReLU}(-0.5) = 0, \qquad h_2 = \text{ReLU}(1 + 2 - 2) = 1` },
          { math: r`\hat{y} = 2(0) - 1 = -1` },
        ],
      },
      {
        q: "Softmax of scores (2, 1, 0). Which class is predicted and with what probability?",
        solution: [{ math: r`\frac{e^2}{e^2 + e^1 + e^0} = \frac{7.389}{7.389 + 2.718 + 1} \approx 0.665` }, { p: "Class 1, with probability about 0.665 (the others: 0.245 and 0.090)." }],
      },
    ],
    interview: [
      { q: "Why do neural networks need non-linear activation functions?", a: "Without them, any stack of layers collapses to a single linear transformation, so the network could only learn linear functions no matter how deep it is." },
      { q: "Explain backpropagation.", a: "After a forward pass computes the loss, backpropagation applies the chain rule from the output back to the input, computing each layer's error signal from the next layer's and reusing it, giving the gradient of the loss for every weight in about the cost of one more pass." },
      { q: "What is the vanishing gradient problem?", a: "In deep networks with saturating activations like sigmoid, gradients are multiplied by small derivatives at each layer and shrink exponentially, so early layers barely learn. ReLU, careful initialisation, batch norm and residual connections reduce it." },
    ],
    summary: [
      "Layers of weighted sums + non-linear activations.",
      "Hidden layers learn features automatically.",
      "Backprop = chain rule applied layer by layer from the output.",
      "Match the output and loss to the task (linear/MSE, sigmoid/BCE, softmax/CE).",
      "ReLU in hidden layers; MLP, CNN, RNN, Transformer for different data.",
    ],
    quiz: [
      { q: "A dense layer from 100 inputs to 50 units has how many parameters?", options: ["150", "5,000", "5,050", "5,100"], answer: 2, why: "100 × 50 weights + 50 biases." },
      { q: "For multi-label classification (an image can be both 'beach' and 'sunset'), the output layer should use:", options: ["One softmax over all labels", "One sigmoid per label", "A linear output", "ReLU outputs"], answer: 1, why: "Labels are not mutually exclusive, so each gets its own independent probability." },
    ],
  },

  "training-neural-networks": {
    explain: [
      { p: "Training a deep network is mostly about keeping signals healthy. On the forward pass, activations should neither shrink to zero nor blow up as they pass through many layers. On the backward pass, gradients should do the same. Initialisation, normalisation, activation choice and residual connections all serve that one goal." },
      { p: "Momentum in plain words: instead of stepping in the direction of today's gradient only, keep a running average of recent gradients and step in that direction. In a long narrow valley, the side-to-side components cancel out and the along-the-valley component builds up, so progress speeds up and zig-zags shrink. **Nesterov momentum** looks ahead by computing the gradient at the point momentum is about to carry you to, which corrects overshooting a little earlier." },
      { p: "Adam adapts the step per parameter. A parameter whose gradients are consistently large gets divided by a large $\\sqrt{v}$, so its steps stay moderate; a parameter with small, rare gradients (an embedding for a rare word) gets relatively larger steps. **AdamW** fixes how weight decay interacts with this scaling by applying decay directly to the weights; it is the modern default." },
      { p: "Dropout from another angle: with $n$ units and dropout, each training step uses a random sub-network, so training is like averaging an exponential number of thinned networks that share weights. Units cannot rely on any particular partner being present, so they learn features that are useful on their own. Typical rates: 0.1–0.3 for large models, up to 0.5 for dense layers in small ones." },
      {
        table: {
          head: ["Normalisation", "Normalises over", "Common in"],
          rows: [
            ["Batch norm", "The batch, per feature", "CNNs; needs reasonably large batches"],
            ["Layer norm", "The features, per example", "Transformers, RNNs; independent of batch size"],
            ["Group / instance norm", "Groups of channels per example", "Vision with small batches, style transfer"],
          ],
        },
      },
      { p: "A practical debugging routine: (1) overfit a single small batch until the loss is near zero (if you cannot, there is a bug); (2) then train on the full data with a sensible learning rate from a range test; (3) add regularisation only once you see overfitting; (4) change one thing at a time and log every run." },
    ],
    practice: [
      {
        q: "Momentum with β = 0.9, η = 0.1, constant gradient g = 1, starting v = 0. Compute v and the parameter change for the first three steps.",
        solution: [
          { p: "v₁ = 1 → Δθ = −0.1. v₂ = 0.9 + 1 = 1.9 → Δθ = −0.19. v₃ = 1.71 + 1 = 2.71 → Δθ = −0.271." },
          { p: "The step grows toward $\\eta/(1 - \\beta) = 1$ per step: momentum accelerates in a consistent direction." },
        ],
      },
      {
        q: "He initialisation for a ReLU layer with 256 inputs: what standard deviation should the weights have?",
        solution: [{ math: r`\sigma = \sqrt{\frac{2}{n_{\text{in}}}} = \sqrt{\frac{2}{256}} \approx 0.088` }],
      },
      {
        q: "Inverted dropout with p = 0.2 on activations [5, 0, 3, 2, 4] with mask [1, 1, 0, 1, 1]. What values go to the next layer during training? At test time?",
        solution: [{ p: "Training: kept values are divided by 1 − p = 0.8: [6.25, 0, 0, 2.5, 5]. Test: dropout off, no scaling: [5, 0, 3, 2, 4]." }],
      },
    ],
    interview: [
      { q: "Why does Adam often train faster than SGD?", a: "It combines momentum with per-parameter adaptive step sizes, so badly scaled or sparse parameters still make progress without hand-tuning per layer. SGD with momentum and a good schedule sometimes generalises slightly better in the end." },
      { q: "What does batch normalisation do and why does it help?", a: "It standardises each layer's pre-activations over the mini-batch and then rescales them with learned parameters. It keeps activation scales stable across layers, allowing higher learning rates and reducing sensitivity to initialisation." },
      { q: "How does dropout behave differently at training and test time?", a: "During training it randomly zeroes units and scales survivors by 1/(1 − p). At test time it is turned off and the full network is used; the scaling during training keeps expected activations equal." },
    ],
    summary: [
      "Momentum: average past gradients; Adam: momentum + per-parameter scaling.",
      "He init for ReLU, Xavier for tanh/sigmoid; never all zeros.",
      "Batch norm / layer norm keep activations stable.",
      "Regularise with weight decay, dropout, augmentation, early stopping.",
      "Debug by overfitting one batch first.",
    ],
    quiz: [
      { q: "With β = 0.9, momentum's steady-state step under a constant gradient is about how many times the plain SGD step?", options: ["0.9×", "1×", "10×", "100×"], answer: 2, why: "v converges to g / (1 − β) = 10g." },
      { q: "Which normalisation does not depend on the batch size?", options: ["Batch norm", "Layer norm", "Both", "Neither"], answer: 1, why: "Layer norm normalises across features within each example." },
    ],
  },
};
