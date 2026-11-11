/**
 * "Watch" links: the best matching video from StatQuest, CampusX and Krish Naik for each topic.
 * We link out to the creators; we never copy their transcripts or videos.
 *
 * kind:
 *  - "video":    a specific video, URL verified
 *  - "playlist": the creator's playlist for this subject
 *  - "search":   a YouTube search scoped to the creator and topic (used where we have not
 *                verified a single video, so the link never points somewhere wrong)
 */
export type Channel = "StatQuest" | "CampusX" | "Krish Naik";
export type WatchLink = { channel: Channel; title: string; url: string; kind: "video" | "playlist" | "search" };

const yt = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const list = (id: string) => `https://www.youtube.com/playlist?list=${id}`;
const search = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

const sq = (title: string, id: string): WatchLink => ({ channel: "StatQuest", title, url: yt(id), kind: "video" });
const cx = (title: string, id: string): WatchLink => ({ channel: "CampusX", title, url: yt(id), kind: "video" });
const sqFind = (topic: string): WatchLink => ({ channel: "StatQuest", title: topic, url: search(`StatQuest ${topic}`), kind: "search" });
const cxFind = (topic: string): WatchLink => ({ channel: "CampusX", title: topic, url: search(`CampusX ${topic}`), kind: "search" });
const knFind = (topic: string): WatchLink => ({ channel: "Krish Naik", title: topic, url: search(`Krish Naik ${topic}`), kind: "search" });

const PLAYLISTS = {
  statquestStats: { channel: "StatQuest", title: "Statistics Fundamentals (playlist)", url: list("PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9"), kind: "playlist" },
  statquestML: { channel: "StatQuest", title: "Machine Learning (playlist)", url: list("PLblh5JKOoLUICTaGLRoHQDuF_7q2GfuJF"), kind: "playlist" },
  campusxML: { channel: "CampusX", title: "100 Days of Machine Learning (playlist)", url: list("PLKnIA16_Rmvbr7zKYQuBfsVkjoLcJgxHH"), kind: "playlist" },
  campusxDL: { channel: "CampusX", title: "100 Days of Deep Learning (playlist)", url: list("PLKnIA16_RmvYuZauWaPlRTC54KxSNLtNn"), kind: "playlist" },
  campusxPandas: { channel: "CampusX", title: "Pandas (playlist)", url: list("PLKnIA16_RmvbR85fgbfVRKOiMokUKVupy"), kind: "playlist" },
  campusxStats: { channel: "CampusX", title: "Statistics for ML (playlist)", url: list("PLKnIA16_RmvbVrE0eZO2bCaFln6jaNq-1"), kind: "playlist" },
  campusxMetrics: { channel: "CampusX", title: "ML metrics (playlist)", url: list("PLKnIA16_RmvZJGOqRjqhOhTEmQW3vDdbQ"), kind: "playlist" },
  krishPython: { channel: "Krish Naik", title: "Python for data science (playlist)", url: list("PLZoTAELRMXVNUL99R4bDlVYsncUNvwUBB"), kind: "playlist" },
  krishML: { channel: "Krish Naik", title: "Machine Learning (playlist)", url: list("PLZoTAELRMXVPBTrWtJkn3wWQxZkmTXGwe"), kind: "playlist" },
} satisfies Record<string, WatchLink>;

/** Keyed by lesson / theory slug (they share slugs). */
export const WATCH: Record<string, WatchLink[]> = {
  // Before you start
  "vectors-matrices-notation": [sqFind("linear algebra vectors matrices"), cxFind("linear algebra for machine learning"), knFind("linear algebra for machine learning")],
  "derivatives-chain-rule": [sq("The Chain Rule, Clearly Explained", "wl1myxrtqhq"), cxFind("derivatives calculus for machine learning"), knFind("calculus derivatives for machine learning")],
  "partial-derivatives-gradients": [sq("Gradient Descent, Step-by-Step", "sDv4f4s2SB8"), cx("Gradient Descent From Scratch", "ORyfPJypKuU"), knFind("partial derivatives gradient")],
  "probability-statistics": [sq("The Mean, Variance and Standard Deviation", "SzZ6GpcfoQY"), PLAYLISTS.campusxStats, knFind("statistics for data science")],
  "python-numpy-pandas": [PLAYLISTS.campusxPandas, cxFind("numpy tutorial"), PLAYLISTS.krishPython],
  "python-plotting-sklearn": [cx("Understanding Your Data (Day 19)", "mJlRTUuVr04"), cx("EDA using Univariate Analysis (Day 20)", "4HyTlbHUKSw"), knFind("scikit-learn tutorial")],

  // Foundations
  "what-is-machine-learning": [sq("A Gentle Introduction to Machine Learning", "Gv9_4yMHFhI"), cx("What is Machine Learning? (Day 1)", "ZftI2fEz0Fw"), PLAYLISTS.krishML],
  "how-models-learn": [sq("The Main Ideas of Fitting a Line to Data", "nk2CQITm_eo"), PLAYLISTS.campusxML, knFind("how machine learning models learn")],
  "loss-functions": [sqFind("loss function sum of squared residuals"), cxFind("loss functions in machine learning"), knFind("loss functions")],
  "gradient-descent": [sq("Gradient Descent, Step-by-Step", "sDv4f4s2SB8"), cx("Gradient Descent From Scratch", "ORyfPJypKuU"), knFind("gradient descent")],
  "learning-rate": [sq("Stochastic Gradient Descent, Clearly Explained", "vMh0zPT0tLI"), cx("Stochastic Gradient Descent", "V7KBAa_gh4c"), knFind("learning rate gradient descent")],

  // Regression
  "linear-regression": [sq("Linear Regression / Fitting a Line", "nk2CQITm_eo"), cx("Simple Linear Regression | Code + Intuition", "UZPfbG0jNec"), knFind("linear regression")],
  "polynomial-regression": [sq("Bias and Variance", "EuBBz3bI-aA"), cxFind("polynomial regression"), knFind("polynomial regression")],
  regularization: [sq("Ridge Regression (Regularization Part 1)", "Q81RR3yKn30"), sq("Lasso Regression (Regularization Part 2)", "NGf0voTMlcs"), cxFind("ridge regression lasso regression")],

  // Classification
  "logistic-regression": [sqFind("logistic regression"), cx("Logistic Regression", "XNXzVfItWGY"), knFind("logistic regression")],
  "k-nearest-neighbors": [sq("K-nearest neighbors, Clearly Explained", "HVXime0nQeI"), cxFind("KNN algorithm"), knFind("K nearest neighbor")],
  "decision-trees": [sq("Decision and Classification Trees, Clearly Explained", "7VeUPuFGJHk"), cxFind("decision tree"), knFind("decision tree entropy gini")],
  "classification-metrics": [sq("The Confusion Matrix", "Kdsp6soqA7o"), sq("ROC and AUC, Clearly Explained", "4jRBRDbJemM"), PLAYLISTS.campusxMetrics],

  // Clustering
  "k-means": [sqFind("K-means clustering"), cxFind("K Means clustering"), knFind("K Means clustering")],
  "hierarchical-clustering": [sqFind("Hierarchical Clustering"), cxFind("hierarchical clustering"), knFind("hierarchical clustering")],
  dbscan: [sqFind("Clustering with DBSCAN"), cxFind("DBSCAN"), knFind("DBSCAN clustering")],

  // Neural networks & workflow
  "neural-networks": [sqFind("Neural Networks Pt. 1 Inside the Black Box"), PLAYLISTS.campusxDL, knFind("artificial neural network")],
  "feature-scaling": [sq("The Mean, Variance and Standard Deviation", "SzZ6GpcfoQY"), cxFind("feature scaling standardization"), knFind("feature scaling")],
  "train-test-split": [sq("Machine Learning Fundamentals: Cross Validation", "fSytzGwwBVw"), cxFind("train test split cross validation"), knFind("train test split cross validation")],
  "bias-variance": [sq("Machine Learning Fundamentals: Bias and Variance", "EuBBz3bI-aA"), cxFind("bias variance tradeoff"), knFind("bias variance tradeoff")],
};

export const getWatch = (slug: string) => WATCH[slug] ?? [];
