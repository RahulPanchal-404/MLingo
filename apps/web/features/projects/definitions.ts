import type { ProjectDefinition, ProjectMilestone } from "./types";

export const PROJECT_MILESTONES: ProjectMilestone[] = [
  {
    id: "problem",
    order: 1,
    tag: "Milestone 01",
    title: "Understand the Problem",
    shortDescription: "Frame the business objective, define inputs and target, and align ML task type.",
    educationalGoal: "Identify prediction target, input features, and success metrics before touching code.",
    completionCriteria: "Read the problem statement and review project objectives.",
  },
  {
    id: "explore",
    order: 2,
    tag: "Milestone 02",
    title: "Explore the Dataset",
    shortDescription: "Inspect sample count, columns, feature data types, and target distributions.",
    educationalGoal: "Understand data shapes and identify numeric vs categorical feature dimensions.",
    completionCriteria: "Inspect dataset summary metrics and column specifications.",
  },
  {
    id: "quality",
    order: 3,
    tag: "Milestone 03",
    title: "Check Data Quality",
    shortDescription: "Detect missing observations, duplicate records, and constant columns.",
    educationalGoal: "Spot data anomalies that require statistical remediation prior to modeling.",
    completionCriteria: "Inspect data quality analysis and missing value table entries.",
  },
  {
    id: "preprocess",
    order: 4,
    tag: "Milestone 04",
    title: "Prepare the Data",
    shortDescription: "Configure missing value imputation, feature scaling, and categorical encoding.",
    educationalGoal: "Transform raw inputs into clean numerical arrays suitable for gradient computations.",
    completionCriteria: "Review Before → After transformation preview and confirm preprocessing pipeline.",
  },
  {
    id: "split",
    order: 5,
    tag: "Milestone 05",
    title: "Split the Data",
    shortDescription: "Partition records into train and test sets to guarantee evaluation integrity.",
    educationalGoal: "Understand data leakage and ensure transformers fit strictly on the training partition.",
    completionCriteria: "Review split ratio and confirm isolation of test partition.",
  },
  {
    id: "model",
    order: 6,
    tag: "Milestone 06",
    title: "Choose a Model",
    shortDescription: "Select an appropriate algorithm architecture aligned with the learning task.",
    educationalGoal: "Match hypothesis function, loss formulation, and optimization method to task type.",
    completionCriteria: "Review model mechanics, parameter formulation, and training settings.",
  },
  {
    id: "train",
    order: 7,
    tag: "Milestone 07",
    title: "Train the Model",
    shortDescription: "Execute optimization, inspect loss convergence curves, and scrub training steps.",
    educationalGoal: "Observe how gradient updates adjust parameters frame by frame.",
    completionCriteria: "Run model training and inspect the telemetry timeline.",
  },
  {
    id: "experiment",
    order: 8,
    tag: "Milestone 08",
    title: "Experiment",
    shortDescription: "Vary a key hyperparameter to observe its effect on optimization and generalization.",
    educationalGoal: "Practice controlled scientific hypothesis testing by tuning one factor at a time.",
    completionCriteria: "Execute an experiment variation and observe comparative metric shifts.",
  },
  {
    id: "evaluate",
    order: 9,
    tag: "Milestone 09",
    title: "Evaluate Model",
    shortDescription: "Compute task metrics across training and test partitions to assess generalization.",
    educationalGoal: "Analyze operational metrics (MSE/R², Confusion Matrix, or Inertia) beyond training loss.",
    completionCriteria: "Inspect test evaluation scores and generalization gap analysis.",
  },
  {
    id: "interpret",
    order: 10,
    tag: "Milestone 10",
    title: "Interpret Results",
    shortDescription: "Connect telemetry evidence to mathematical reasons with Learning Intelligence.",
    educationalGoal: "Understand WHY the model behaved the way it did using evidence and theory.",
    completionCriteria: "Review the automated Learning Intelligence diagnostic explanation.",
  },
  {
    id: "reflect",
    order: 11,
    tag: "Milestone 11",
    title: "Reflect & Complete",
    shortDescription: "Synthesize lessons learned, record project takeaways, and review project completion.",
    educationalGoal: "Consolidate conceptual understanding from data cleaning to model interpretation.",
    completionCriteria: "Answer reflection questions and finalize the project portfolio record.",
  },
];

export const SALARY_PREDICTION_PROJECT: ProjectDefinition = {
  id: "salary-prediction",
  slug: "salary-prediction",
  title: "Salary Prediction",
  tagline: "Predict software engineer compensation using experience, education, and portfolio projects.",
  problemStatement:
    "An engineering recruiting agency wants to establish fair, data-driven compensation benchmarks. Given an engineer's years of professional experience, education tier, and completed open-source projects, predict their annual salary ($k). The raw dataset contains categorical values and an intentional missing project entry that must be cleaned before training.",
  type: "regression",
  datasetId: "housing_regression",
  difficulty: "Beginner",
  estimatedMinutes: 25,
  modelName: "Linear Regression (Ordinary Least Squares / Gradient Descent)",
  learningObjectives: [
    "Identify continuous numerical targets and formulate a linear regression hypothesis.",
    "Handle missing numerical values through mean/mode imputation.",
    "Encode categorical education tiers without imposing arbitrary numerical distances.",
    "Fit a feature scaler strictly on the training partition to prevent data leakage.",
    "Evaluate generalization with Mean Squared Error (MSE), Mean Absolute Error (MAE), and R² score.",
  ],
  focusConcepts: [
    "Linear Regression",
    "Numerical vs Categorical",
    "Missing Value Imputation",
    "Z-Score Scaling",
    "Train/Test Split",
    "Data Leakage",
    "MSE & MAE",
    "R² Score",
    "Generalization Gap",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Learning Rate Experiment",
    question: "What happens when you adjust the gradient descent learning rate from 0.05 to 0.25?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.25,
    explanation:
      "A higher learning rate can accelerate early loss reduction, but if set too high, it causes step overshooting and oscillation around the optimal weights.",
  },
  reflectionPrompts: [
    {
      id: "target",
      prompt: "What was the prediction target, and why is this a regression task rather than classification?",
      guidance: "Consider the datatype and continuous range of software engineering compensation ($k).",
      placeholder: "The target is annual salary ($k), which is a continuous real-valued number...",
    },
    {
      id: "preprocessing",
      prompt: "Which preprocessing step was most critical for this dataset, and what would fail without it?",
      guidance: "Recall the missing project count and categorical education column.",
      placeholder: "Imputation was necessary because the missing value prevents matrix dot products...",
    },
    {
      id: "leakage",
      prompt: "Why must feature scaling parameters (mean and standard deviation) be computed only on training rows?",
      guidance: "Think about what real production inference looks like when new candidates apply.",
      placeholder: "Fitting scalers on test data leaks future distribution information into training...",
    },
    {
      id: "generalization",
      prompt: "How did training MSE compare to test MSE? What does the R² score tell you about fit quality?",
      guidance: "Inspect the final test MSE and R² score on the evaluation milestone.",
      placeholder: "The test MSE was slightly higher than training MSE, indicating a healthy generalization gap...",
    },
  ],
  lessonsLearned: [
    "Linear regression models continuous targets through linear combinations of scaled features.",
    "Mean imputation allows rows with missing values to contribute without introducing drastic distortion.",
    "One-hot encoding translates discrete categories into orthogonal basis vectors.",
    "Fitting scalers only on training data preserves realistic test set isolation.",
    "R² measures the proportion of variance explained relative to a baseline mean predictor.",
  ],
  nextConcepts: [
    "Polynomial Features and Non-linear Relationships",
    "L2 Ridge Regularization for Collinear Features",
    "Feature Importance via Standardized Weights",
  ],
};

export const STUDENT_OUTCOME_PROJECT: ProjectDefinition = {
  id: "student-outcome",
  slug: "student-outcome",
  title: "Student Exam Outcome",
  tagline: "Predict student course admission and exam pass/fail probabilities from study habits.",
  problemStatement:
    "An academic advising department wants an early warning system to identify students at risk of failing final examinations. Using weekly study hours (which contains 1 missing record), attendance percentage, and tutoring participation, predict whether a student passes (1) or fails (0). Calibrate classification decision thresholds to prioritize student outreach.",
  type: "classification",
  datasetId: "student_classification",
  difficulty: "Beginner",
  estimatedMinutes: 30,
  modelName: "Logistic Regression (Sigmoid Hypothesis + Binary Cross-Entropy)",
  learningObjectives: [
    "Formulate binary classification as modeling conditional probability P(y=1 | x).",
    "Map linear combinations of features to (0, 1) probability space using the sigmoid function.",
    "Construct and interpret a 2x2 Confusion Matrix (TN, FP, FN, TP).",
    "Tune the decision threshold θ to adjust the trade-off between Precision and Recall.",
    "Inspect the Receiver Operating Characteristic (ROC) curve and Area Under the Curve (AUC).",
  ],
  focusConcepts: [
    "Binary Classification",
    "Sigmoid Function",
    "Decision Boundary",
    "Decision Threshold (θ)",
    "Confusion Matrix",
    "Precision & Recall",
    "F1 Score",
    "ROC Curve & AUC",
    "Generalization",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Decision Threshold Experiment",
    question: "How does shifting the decision threshold from θ = 0.50 to θ = 0.30 affect student recall?",
    parameterName: "threshold",
    defaultVal: 0.5,
    testVal: 0.3,
    explanation:
      "Lowering the decision threshold makes the model more sensitive: it flags more students as passing, catching true positives at the cost of higher false alarms (lower precision).",
  },
  reflectionPrompts: [
    {
      id: "target",
      prompt: "What is the prediction target, and how does logistic regression output probabilities instead of raw scores?",
      guidance: "Explain the role of the sigmoid activation function σ(z) = 1 / (1 + e^-z).",
      placeholder: "The target is passed (0 or 1). The sigmoid squashes the linear score into [0, 1]...",
    },
    {
      id: "threshold",
      prompt: "In an academic advising intervention, is False Negative (missing a failing student) or False Positive worse?",
      guidance: "Consider the real-world consequence of missing an at-risk student versus offering tutoring to a student who passed.",
      placeholder: "A false negative leaves an at-risk student without help, so high recall is preferred...",
    },
    {
      id: "precision_recall",
      prompt: "What trade-off occurred when shifting the classification threshold?",
      guidance: "Reference specific True Positive, False Positive, and Recall changes from your experiment.",
      placeholder: "Lowering θ to 0.30 increased Recall from 0.85 to 1.00 while reducing Precision...",
    },
    {
      id: "roc_auc",
      prompt: "What does an AUC of ~0.90 signify about the model's ranking capability across all thresholds?",
      guidance: "Recall that AUC = 1.0 represents perfect separability, while 0.5 is random guessing.",
      placeholder: "An AUC of ~0.90 indicates that a randomly chosen passing student has a 90% chance of higher predicted probability...",
    },
  ],
  lessonsLearned: [
    "Logistic regression models binary probabilities using the logistic sigmoid link function.",
    "Accuracy alone is misleading when class distributions are imbalanced.",
    "The decision threshold θ is an operational choice that controls the Precision-Recall trade-off.",
    "ROC curves evaluate ranking quality independent of a single fixed threshold.",
    "Imputing missing study hours allows the model to score all enrolled candidates.",
  ],
  nextConcepts: [
    "Multi-class Softmax Classification",
    "Cost-sensitive Learning & Asymmetric Loss",
    "Log-Loss Calibration & Reliability Diagrams",
  ],
};

export const CUSTOMER_SEGMENTATION_PROJECT: ProjectDefinition = {
  id: "customer-segmentation",
  slug: "customer-segmentation",
  title: "Customer Retail Segmentation",
  tagline: "Discover natural behavioral shopper cohorts using unsupervised K-Means clustering.",
  problemStatement:
    "An e-commerce retail platform wants to understand its customer base without predefined demographic labels. Using annual income ($k), spending loyalty score (1-100), and membership tier, discover natural customer clusters to guide personalized marketing and engagement strategies. Determine the optimal number of centroids using inertia.",
  type: "clustering",
  datasetId: "customer_clustering",
  difficulty: "Intermediate",
  estimatedMinutes: 25,
  modelName: "K-Means Clustering (Expectation-Maximization / Centroid Optimization)",
  learningObjectives: [
    "Understand unsupervised learning where data contains no supervisory target labels.",
    "Recognize the critical necessity of feature scaling when computing Euclidean distances.",
    "Trace the iterative two-step Expectation-Maximization loop: assignment and centroid updates.",
    "Evaluate clustering tightness using total within-cluster sum of squares (Inertia).",
    "Profile and interpret each discovered cluster in terms of business personas.",
  ],
  focusConcepts: [
    "Unsupervised Learning",
    "K-Means Clustering",
    "Euclidean Distance",
    "Feature Scaling",
    "Centroid Updates",
    "Inertia (WCSS)",
    "Choosing K",
    "Cluster Profiling",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Cluster Count (K) Experiment",
    question: "How does increasing the number of clusters from K = 2 to K = 3 impact total inertia and cluster sizes?",
    parameterName: "clusters",
    defaultVal: 2,
    testVal: 3,
    explanation:
      "Increasing K mechanically decreases total inertia because points are closer to more centroids, but too many clusters risks overfitting into meaningless micro-segments.",
  },
  reflectionPrompts: [
    {
      id: "unsupervised",
      prompt: "How does this unsupervised clustering task fundamentally differ from regression and classification?",
      guidance: "Highlight the absence of target labels y during training.",
      placeholder: "There are no ground-truth labels; the algorithm finds geometric groupings based on distance...",
    },
    {
      id: "scaling",
      prompt: "Why would K-Means fail if income ($20k-$120k) and spending score (1-100) were not standardized?",
      guidance: "Consider how Euclidean distance (x1 - x2)^2 is dominated by the variable with the largest range.",
      placeholder: "Income has a larger numerical scale, which would completely dominate the distance metric...",
    },
    {
      id: "inertia",
      prompt: "What does total inertia measure, and why cannot we simply set K equal to the number of samples?",
      guidance: "Explain the Elbow method intuition and cluster interpretability.",
      placeholder: "Inertia measures sum of squared distances to centroids. Setting K=N gives 0 inertia but no useful groupings...",
    },
    {
      id: "personas",
      prompt: "Describe the characteristics of the discovered customer segments from their centroid locations.",
      guidance: "Compare low-income/high-spending vs high-income/low-spending cohorts.",
      placeholder: "We observed distinct personas: budget-conscious shoppers, moderate spenders, and high-value VIPs...",
    },
  ],
  lessonsLearned: [
    "K-Means partitions unlabelled feature space by minimizing within-cluster variance.",
    "Without feature scaling, dimensions with large raw units distort geometric distance.",
    "Centroids represent the multidimensional arithmetic mean of assigned points.",
    "Inertia drops monotonically with K; genuine structure appears where rate of decrease elbows.",
    "Qualitative domain interpretation is essential to convert mathematical clusters into actionable strategy.",
  ],
  nextConcepts: [
    "The Elbow Method and Silhouette Analysis",
    "DBSCAN Density-based Clustering for Non-Spherical Shapes",
    "Hierarchical Agglomerative Clustering",
  ],
};

export const ALL_PROJECTS: ProjectDefinition[] = [
  SALARY_PREDICTION_PROJECT,
  STUDENT_OUTCOME_PROJECT,
  CUSTOMER_SEGMENTATION_PROJECT,
];

export function getAllProjects(): ProjectDefinition[] {
  return ALL_PROJECTS;
}

export function getProjectBySlug(slug: string): ProjectDefinition | undefined {
  return ALL_PROJECTS.find((p) => p.slug === slug || p.id === slug);
}

export function getProjectById(id: string): ProjectDefinition {
  const project = ALL_PROJECTS.find((p) => p.id === id || p.slug === id);
  if (!project) {
    throw new Error(`Project with ID "${id}" not found.`);
  }
  return project;
}
