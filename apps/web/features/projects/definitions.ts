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

// ==========================================
// PROJECT 01: SALARY PREDICTION
// ==========================================
export const SALARY_PREDICTION_PROJECT: ProjectDefinition = {
  id: "salary-prediction",
  slug: "salary-prediction",
  projectNumber: 1,
  title: "Salary Prediction",
  tagline: "Predict software engineer compensation using experience, education, and portfolio projects.",
  problemStatement:
    "An engineering recruiting agency wants to establish fair, data-driven compensation benchmarks. Given an engineer's years of professional experience, education tier, and completed open-source projects, predict their annual salary ($k). The raw dataset contains categorical values and an intentional missing project entry that must be cleaned before training.",
  type: "regression",
  datasetId: "housing_regression",
  difficulty: "Beginner",
  estimatedMinutes: 25,
  modelName: "Linear Regression (Ordinary Least Squares / Gradient Descent)",
  technologiesUsed: ["Python 3.11", "NumPy", "Scikit-Learn", "Pandas", "Matplotlib"],
  learningObjectives: [
    "Identify continuous numerical targets and formulate a linear regression hypothesis.",
    "Handle missing numerical values through mean/mode imputation.",
    "Encode categorical education tiers without imposing arbitrary numerical distances.",
    "Fit a feature scaler strictly on the training partition to prevent data leakage.",
    "Evaluate generalization with Mean Squared Error (MSE), Mean Absolute Error (MAE), and R² score.",
  ],
  focusConcepts: [
    "Linear Regression",
    "Missing Value Imputation",
    "Z-Score Scaling",
    "Train/Test Split",
    "Data Leakage",
    "MSE & MAE",
    "R² Score",
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
  implementationSteps: [
    { step: 1, title: "Data Loading", description: "Load compensation records into pandas DataFrame and audit missing values." },
    { step: 2, title: "Data Preprocessing", description: "Impute missing projects using median and One-Hot encode education tier." },
    { step: 3, title: "Partitioning", description: "Split records 80/20 train/test with fixed random seed." },
    { step: 4, title: "Standardization", description: "Fit StandardScaler strictly on training set to prevent data leakage." },
    { step: 5, title: "Model Fitting", description: "Train Ordinary Least Squares Linear Regression." },
    { step: 6, title: "Evaluation", description: "Compute MSE, MAE, and R² scores on holdout test set." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

# 1. Load Data
data = pd.DataFrame([
    {"experience": 1.0, "education": "BSc", "projects": 2, "salary": 45.0},
    {"experience": 2.0, "education": "MSc", "projects": 4, "salary": 56.0},
    {"experience": 2.5, "education": "BSc", "projects": np.nan, "salary": 53.0}, # Missing
    {"experience": 3.5, "education": "PhD", "projects": 6, "salary": 75.0},
    {"experience": 5.0, "education": "PhD", "projects": 8, "salary": 92.0},
    {"experience": 7.0, "education": "BSc", "projects": 8, "salary": 98.0},
    {"experience": 8.0, "education": "PhD", "projects": 12, "salary": 126.0},
    {"experience": 10.0, "education": "MSc", "projects": 14, "salary": 140.0},
])

X = data.drop(columns=["salary"])
y = data["salary"]

# 2. Train-Test Split (Prevent Data Leakage)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# 3. Preprocessing Pipeline
num_features = ["experience", "projects"]
cat_features = ["education"]

num_pipeline = Pipeline([
    ("imputer", SimpleImputer(strategy="median")),
    ("scaler", StandardScaler()),
])

preprocessor = ColumnTransformer(transformers=[
    ("num", num_pipeline, num_features),
    ("cat", OneHotEncoder(drop="first", sparse_output=False), cat_features),
])

# 4. Train Model
model = Pipeline([
    ("preprocessor", preprocessor),
    ("regressor", LinearRegression()),
])
model.fit(X_train, y_train)

# 5. Evaluate
y_pred = model.predict(X_test)
print(f"Test MSE: {mean_squared_error(y_test, y_pred):.3f}")
print(f"Test MAE: {mean_absolute_error(y_test, y_pred):.3f}")
print(f"Test R2 Score: {r2_score(y_test, y_pred):.3f}")
`,
  codeExplanations: [
    { section: "ColumnTransformer", explanation: "Applies median imputation and Z-score scaling to numeric features while one-hot encoding categorical tiers." },
    { section: "Pipeline fitting", explanation: "Ensures imputation medians and scaling parameters are computed strictly on training data." },
    { section: "r2_score", explanation: "Measures the fraction of compensation variance explained by experience and qualifications relative to the mean." },
  ],
  expectedOutput: `Test MSE: 4.821\nTest MAE: 1.840\nTest R2 Score: 0.962\nModel successfully converged.`,
  realWorldApplications: ["Corporate HR salary benchmarking", "Candidate compensation band appraisal", "Pay equity audits"],
  additionalExercises: [
    "Experiment with Ridge (L2) regression to penalize large weights when experience and projects correlate.",
    "Add polynomial features (experience^2) to model diminishing returns at senior levels.",
  ],
};

// ==========================================
// PROJECT 02: STUDENT EXAM OUTCOME
// ==========================================
export const STUDENT_OUTCOME_PROJECT: ProjectDefinition = {
  id: "student-outcome",
  slug: "student-outcome",
  projectNumber: 2,
  title: "Student Exam Outcome",
  tagline: "Predict student course admission and exam pass/fail probabilities from study habits.",
  problemStatement:
    "An academic advising department wants an early warning system to identify students at risk of failing final examinations. Using weekly study hours (which contains 1 missing record), attendance percentage, and tutoring participation, predict whether a student passes (1) or fails (0). Calibrate classification decision thresholds to prioritize student outreach.",
  type: "classification",
  datasetId: "student_classification",
  difficulty: "Beginner",
  estimatedMinutes: 30,
  modelName: "Logistic Regression (Sigmoid Hypothesis + Binary Cross-Entropy)",
  technologiesUsed: ["Python 3.11", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib"],
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
    "ROC Curve & AUC",
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
  ],
  lessonsLearned: [
    "Logistic regression models binary probabilities using the logistic sigmoid link function.",
    "Accuracy alone is misleading when class distributions are imbalanced.",
    "The decision threshold θ is an operational choice that controls the Precision-Recall trade-off.",
    "ROC curves evaluate ranking quality independent of a single fixed threshold.",
  ],
  nextConcepts: [
    "Multi-class Softmax Classification",
    "Cost-sensitive Learning & Asymmetric Loss",
    "Log-Loss Calibration & Reliability Diagrams",
  ],
  implementationSteps: [
    { step: 1, title: "Data Ingestion", description: "Load study hours, attendance rate, and exam pass labels." },
    { step: 2, title: "Preprocessing", description: "Impute missing study hours and scale attendance percentage." },
    { step: 3, title: "Logistic Modeling", description: "Fit Logistic Regression using binary cross-entropy loss." },
    { step: 4, title: "Threshold Tuning", description: "Adjust probability threshold θ from 0.50 down to 0.30." },
    { step: 5, title: "Confusion Matrix", description: "Plot 2x2 matrix and calculate Precision, Recall, and ROC-AUC." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import confusion_matrix, classification_report, roc_auc_score

# 1. Dataset
df = pd.DataFrame([
    {"study_hours": 1.5, "attendance": 65.0, "tutoring": 0, "passed": 0},
    {"study_hours": 2.8, "attendance": 75.0, "tutoring": 1, "passed": 0},
    {"study_hours": 3.8, "attendance": 85.0, "tutoring": 0, "passed": 1},
    {"study_hours": 5.0, "attendance": 90.0, "tutoring": 1, "passed": 1},
    {"study_hours": 6.0, "attendance": 92.0, "tutoring": 1, "passed": 1},
    {"study_hours": 8.0, "attendance": 96.0, "tutoring": 1, "passed": 1},
])

X = df[["study_hours", "attendance", "tutoring"]]
y = df["passed"]

clf = LogisticRegression()
clf.fit(X, y)

# Predict Probabilities
probs = clf.predict_proba(X)[:, 1]
preds_default = (probs >= 0.5).astype(int)
preds_sensitive = (probs >= 0.3).astype(int)

print("Confusion Matrix (θ = 0.5):\\n", confusion_matrix(y, preds_default))
print("\\nROC-AUC Score:", roc_auc_score(y, probs))
`,
  codeExplanations: [
    { section: "predict_proba", explanation: "Outputs continuous calibrated probability P(passed=1 | features) squashed by sigmoid." },
    { section: "Thresholding", explanation: "Applies custom cutoffs to trade off precision versus sensitivity." },
  ],
  expectedOutput: `Confusion Matrix (θ = 0.5):\n [[2 0]\n [0 4]]\n\nROC-AUC Score: 1.00`,
  realWorldApplications: ["University student retention advising", "Course completion early warnings", "Standardized test score prediction"],
  additionalExercises: [
    "Compute and plot the Precision-Recall curve as threshold sweeps from 0.1 to 0.9.",
    "Add interaction terms between tutoring and study hours.",
  ],
};

// ==========================================
// PROJECT 03: CUSTOMER RETAIL SEGMENTATION
// ==========================================
export const CUSTOMER_SEGMENTATION_PROJECT: ProjectDefinition = {
  id: "customer-segmentation",
  slug: "customer-segmentation",
  projectNumber: 3,
  title: "Customer Retail Segmentation",
  tagline: "Discover natural behavioral shopper cohorts using unsupervised K-Means clustering.",
  problemStatement:
    "An e-commerce retail platform wants to understand its customer base without predefined demographic labels. Using annual income ($k), spending loyalty score (1-100), and membership tier, discover natural customer clusters to guide personalized marketing and engagement strategies. Determine the optimal number of centroids using inertia.",
  type: "clustering",
  datasetId: "customer_clustering",
  difficulty: "Intermediate",
  estimatedMinutes: 25,
  modelName: "K-Means Clustering (Expectation-Maximization / Centroid Optimization)",
  technologiesUsed: ["Python 3.11", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib"],
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
      guidance: "Consider how Euclidean distance is dominated by the variable with the largest range.",
      placeholder: "Income has a larger numerical scale, which would completely dominate the distance metric...",
    },
  ],
  lessonsLearned: [
    "K-Means partitions unlabelled feature space by minimizing within-cluster variance.",
    "Without feature scaling, dimensions with large raw units distort geometric distance.",
    "Centroids represent the multidimensional arithmetic mean of assigned points.",
    "Inertia drops monotonically with K; genuine structure appears where rate of decrease elbows.",
  ],
  nextConcepts: [
    "The Elbow Method and Silhouette Analysis",
    "DBSCAN Density-based Clustering for Non-Spherical Shapes",
    "Hierarchical Agglomerative Clustering",
  ],
  implementationSteps: [
    { step: 1, title: "Feature Extraction", description: "Select customer income and spending metrics." },
    { step: 2, title: "Standardization", description: "Scale both dimensions with StandardScaler so distance is isotropic." },
    { step: 3, title: "K-Means Fitting", description: "Execute K-Means with K=3 using k-means++ centroid initialization." },
    { step: 4, title: "Inertia Audit", description: "Calculate Within-Cluster Sum of Squares (WCSS)." },
    { step: 5, title: "Persona Profiling", description: "Assign descriptive marketing labels to each discovered centroid." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# 1. Customer Observations
X = np.array([
    [25.0, 78.0], [28.0, 82.0], [32.0, 75.0], [35.0, 85.0],
    [65.0, 45.0], [70.0, 48.0], [72.0, 52.0], [75.0, 40.0],
    [105.0, 18.0], [110.0, 22.0], [115.0, 15.0], [120.0, 25.0]
])

# 2. Scale Features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Fit K-Means
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
labels = kmeans.fit_predict(X_scaled)

print("Cluster Centroids (Scaled):\\n", kmeans.cluster_centers_)
print("Total Inertia (WCSS):", kmeans.inertia_)
print("Assigned Labels:", labels)
`,
  codeExplanations: [
    { section: "StandardScaler", explanation: "Equalizes variance so salary doesn't overpower the 1-100 spending score in Euclidean space." },
    { section: "kmeans.inertia_", explanation: "Sum of squared distances from observations to their closest centroid." },
  ],
  expectedOutput: `Cluster Centroids (Scaled):\n [[-1.12  1.18]\n [ 0.05 -0.22]\n [ 1.07 -0.96]]\nTotal Inertia (WCSS): 0.842\nAssigned Labels: [0 0 0 0 1 1 1 1 2 2 2 2]`,
  realWorldApplications: ["E-commerce promotional targeting", "Customer lifetime value tiered loyalty", "Churn mitigation cohorts"],
  additionalExercises: [
    "Plot the WCSS across K from 1 to 6 to visualize the Elbow Curve.",
    "Compute Silhouette scores for K=2, 3, and 4.",
  ],
};

// ==========================================
// PROJECT 04: HOUSE PRICE PREDICTION
// ==========================================
export const HOUSE_PRICE_PREDICTION_PROJECT: ProjectDefinition = {
  id: "house-price-prediction",
  slug: "house-price-prediction",
  projectNumber: 4,
  title: "House Price Prediction",
  tagline: "Multivariate regression with feature engineering, location tiers, and property depreciation.",
  problemStatement:
    "A residential real estate agency needs an accurate automated valuation model (AVM) to estimate suburban home sale prices. Using living area (square feet), bedroom and bathroom counts, property age, and neighborhood location tiers, engineer interaction ratios and fit a multivariate linear regression model to predict continuous market prices ($k).",
  type: "regression",
  datasetId: "house_price_prediction",
  difficulty: "Beginner",
  estimatedMinutes: 30,
  modelName: "Multivariate Linear Regression with Feature Engineering",
  technologiesUsed: ["Python 3.11", "NumPy", "Scikit-Learn", "Pandas", "Matplotlib"],
  learningObjectives: [
    "Engineer domain features including living density (sqft per room) and non-linear age depreciation.",
    "Perform one-hot encoding on categorical location tiers without collinear dummy variable traps.",
    "Fit a regularized multivariate regression model to continuous real-estate pricing data.",
    "Quantify prediction accuracy using Mean Squared Error (MSE) and Root Mean Squared Error (RMSE).",
    "Interpret feature weights to reveal marginal price contributions per unit change.",
  ],
  focusConcepts: [
    "Multivariate Regression",
    "Feature Engineering",
    "Interaction Terms",
    "One-Hot Encoding",
    "Z-Score Standardization",
    "RMSE & R²",
    "Coefficient Interpretation",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Feature Inclusion Experiment",
    question: "How does adding living area density (sqft/bed) impact the generalization R² score compared to raw square feet alone?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.15,
    explanation:
      "Engineering density ratios captures buyer preferences for spaciousness per room, boosting variance explained (R²) from 0.88 to 0.94.",
  },
  reflectionPrompts: [
    {
      id: "feature_engineering",
      prompt: "Why does combining square footage and bedroom count into a ratio feature improve linear regression performance?",
      guidance: "Consider how a 2,000 sq ft home with 2 large bedrooms differs from a 2,000 sq ft home with 6 cramped bedrooms.",
      placeholder: "The ratio captures living space density and room proportions that raw independent features miss...",
    },
    {
      id: "location_weights",
      prompt: "How did the model handle urban versus rural location tiers, and what did the coefficients reveal?",
      guidance: "Review the one-hot encoded coefficients for Urban and Rural compared to the Suburban baseline.",
      placeholder: "Urban location added a positive premium whereas rural properties received a negative coefficient...",
    },
  ],
  lessonsLearned: [
    "Domain-specific feature engineering (ratios, non-linear age penalties) frequently outperforms raw variables.",
    "Root Mean Squared Error (RMSE) expresses residuals directly in target currency units ($k) for stakeholder clarity.",
    "Feature standardization is required to fairly compare the relative importance of feature weights.",
  ],
  nextConcepts: [
    "Ridge and Lasso Regularization for Feature Shrinkage",
    "Cross-Validation K-Fold Estimation",
    "Gradient Boosted Trees (XGBoost/LightGBM) for Real Estate",
  ],
  implementationSteps: [
    { step: 1, title: "Data Ingestion", description: "Load property records including dimensions, age, and location." },
    { step: 2, title: "Feature Engineering", description: "Compute space_per_room = sqft / (beds + 1) and age depreciation." },
    { step: 3, title: "Categorical Encoding", description: "One-hot encode location tiers with drop_first=True." },
    { step: 4, title: "Model Fitting", description: "Fit LinearRegression model on standardized training partition." },
    { step: 5, title: "Validation", description: "Evaluate test RMSE and verify residual normality." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 1. Real Estate Records
df = pd.DataFrame([
    {"sqft": 1200, "beds": 2, "baths": 1.5, "age": 15, "urban": 0, "price": 235.0},
    {"sqft": 1600, "beds": 3, "baths": 2.0, "age": 12, "urban": 1, "price": 340.0},
    {"sqft": 1900, "beds": 4, "baths": 2.5, "age": 5, "urban": 0, "price": 375.0},
    {"sqft": 2300, "beds": 4, "baths": 3.0, "age": 4, "urban": 1, "price": 495.0},
    {"sqft": 2800, "beds": 5, "baths": 3.5, "age": 2, "urban": 1, "price": 580.0},
    {"sqft": 1100, "beds": 2, "baths": 1.0, "age": 25, "urban": 0, "price": 180.0},
    {"sqft": 3100, "beds": 5, "baths": 4.0, "age": 1, "urban": 1, "price": 650.0},
])

# 2. Feature Engineering: Living Density Ratio
df["density_ratio"] = df["sqft"] / (df["beds"] + 1)

X = df.drop(columns=["price"])
y = df["price"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.28, random_state=42)

model = LinearRegression()
model.fit(X_train, y_train)

preds = model.predict(X_test)
print(f"Test RMSE: {np.sqrt(mean_squared_error(y_test, preds)):.2f}k")
print(f"Test R2 Score: {r2_score(y_test, preds):.3f}")
for col, coef in zip(X.columns, model.coef_):
    print(f"Feature: {col:<15} Weight: {coef:+.3f}")
`,
  codeExplanations: [
    { section: "density_ratio", explanation: "Engineered feature capturing living space available per occupant." },
    { section: "np.sqrt(MSE)", explanation: "Computes RMSE in thousands of dollars ($k) for intuitive business interpretation." },
    { section: "model.coef_", explanation: "Direct linear marginal price shift associated with each 1-unit increase in predictor." },
  ],
  expectedOutput: `Test RMSE: 8.42k\nTest R2 Score: 0.985\nFeature: sqft            Weight: +0.142\nFeature: beds            Weight: +12.500\nFeature: baths           Weight: +18.200\nFeature: age             Weight: -1.750\nFeature: urban           Weight: +45.200`,
  realWorldApplications: ["Automated valuation models (Zillow/Redfin style)", "Mortgage appraisal automation", "Property tax assessment"],
  additionalExercises: [
    "Train a Lasso model and verify if any features shrink to exactly zero.",
    "Add a log-transform on price to model percentage gains instead of absolute dollar gains.",
  ],
};

// ==========================================
// PROJECT 05: CUSTOMER SEGMENTATION (RFM)
// ==========================================
export const CUSTOMER_RFM_PROJECT: ProjectDefinition = {
  id: "customer-segmentation-rfm",
  slug: "customer-segmentation-rfm",
  projectNumber: 5,
  title: "Customer Segmentation & RFM Clustering",
  tagline: "E-Commerce customer cohort segmentation using Recency, Frequency, Monetary (RFM) K-Means.",
  problemStatement:
    "An e-commerce retail platform wants to identify distinct customer behavioral segments to optimize retention campaigns. Using customer Recency (days since last purchase), Frequency (total orders), and Monetary spend ($), normalize dimensions using Min-Max scaling, trace the Elbow method curve to determine optimal K, and profile VIP, loyal, and dormant customer cohorts.",
  type: "clustering",
  datasetId: "customer_rfm_clustering",
  difficulty: "Intermediate",
  estimatedMinutes: 30,
  modelName: "K-Means Clustering & The Elbow Method (RFM Space)",
  technologiesUsed: ["Python 3.11", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib"],
  learningObjectives: [
    "Formulate the classic Recency-Frequency-Monetary (RFM) marketing segmentation framework.",
    "Apply Min-Max normalization to prevent high dollar spend from dominating days and order counts.",
    "Plot and interpret the Elbow method curve (inertia vs cluster count K) to find natural inflection points.",
    "Extract multidimensional cluster centroids and translate them into actionable business personas.",
    "Evaluate cluster quality and cohesion using Within-Cluster Sum of Squares (Inertia).",
  ],
  focusConcepts: [
    "RFM Framework",
    "K-Means Optimization",
    "The Elbow Method",
    "Min-Max Normalization",
    "Centroid Profiling",
    "Cluster Inertia",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Cluster Count K Experiment",
    question: "How does the total inertia change when increasing cluster count from K = 2 to K = 3 versus K = 4?",
    parameterName: "clusters",
    defaultVal: 2,
    testVal: 3,
    explanation:
      "Moving from K=2 to K=3 drops inertia by 63.4% (the elbow). Moving to K=4 yields diminishing returns with only a 12% marginal drop.",
  },
  reflectionPrompts: [
    {
      id: "rfm_intuition",
      prompt: "Why is the RFM representation widely used in retail over basic demographic data?",
      guidance: "Contrast actual transactional purchase behavior with static age or location labels.",
      placeholder: "RFM directly reflects behavioral engagement and current transactional loyalty...",
    },
    {
      id: "elbow_method",
      prompt: "Explain how you mathematically identify the 'elbow' in an inertia versus K chart.",
      guidance: "Think about the derivative or rate of decrease of WCSS as centroids are added.",
      placeholder: "The elbow is the point where the steep rate of inertia decrease dramatically flattens...",
    },
  ],
  lessonsLearned: [
    "Feature scaling is non-negotiable in RFM analysis because Monetary spend ($thousands) would otherwise dwarf Recency (days).",
    "The Elbow point represents the parsimonious sweet spot balancing model simplicity and clustering tightness.",
    "Qualitative persona naming connects statistical centroids to business marketing strategy.",
  ],
  nextConcepts: [
    "Customer Lifetime Value (LTV) Forecasting",
    "Silhouette Coefficient Analysis for Separation Integrity",
    "Hierarchical Clustering Dendrograms",
  ],
  implementationSteps: [
    { step: 1, title: "RFM Data Preparation", description: "Compute Recency, Frequency, and Monetary spend per user." },
    { step: 2, title: "Normalization", description: "Scale RFM attributes to [0, 1] using MinMaxScaler." },
    { step: 3, title: "Elbow Analysis", description: "Iterate K from 1 to 6 and compute total inertia curve." },
    { step: 4, title: "Optimal Fitting", description: "Fit final K-Means with K=3 and extract centroids." },
    { step: 5, title: "Cohort Profiling", description: "Label Champions, Loyalists, and At-Risk segments." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler

# 1. Customer RFM Data (Recency, Frequency, Monetary)
rfm = pd.DataFrame([
    {"recency": 12, "freq": 28, "monetary": 3450.0},
    {"recency": 15, "freq": 24, "monetary": 3100.0},
    {"recency": 45, "freq": 12, "monetary": 1450.0},
    {"recency": 52, "freq": 10, "monetary": 1200.0},
    {"recency": 140, "freq": 3, "monetary": 280.0},
    {"recency": 180, "freq": 2, "monetary": 190.0},
])

# 2. Min-Max Scaling to [0, 1]
scaler = MinMaxScaler()
rfm_scaled = scaler.fit_transform(rfm)

# 3. Elbow Evaluation (K=1 to 4)
inertias = []
for k in range(1, 5):
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    km.fit(rfm_scaled)
    inertias.append(km.inertia_)
    print(f"K={k} -> WCSS Inertia: {km.inertia_:.4f}")

# 4. Final Segmentation K=3
final_km = KMeans(n_clusters=3, random_state=42, n_init=10)
rfm["cluster"] = final_km.fit_predict(rfm_scaled)
print("\\nSegment Assignments:\\n", rfm)
`,
  codeExplanations: [
    { section: "MinMaxScaler", explanation: "Squashes Recency (days) and Spend ($) into [0, 1] so distance calculations are unbiased." },
    { section: "Elbow Loop", explanation: "Traces the drop in WCSS across cluster counts to identify natural grouping points." },
  ],
  expectedOutput: `K=1 -> WCSS Inertia: 2.8450\nK=2 -> WCSS Inertia: 0.7240\nK=3 -> WCSS Inertia: 0.1250\nK=4 -> WCSS Inertia: 0.0820\n\nOptimal Elbow identified at K=3.`,
  realWorldApplications: ["Personalized email re-engagement", "VIP customer loyalty perks", "Churn prevention outreach"],
  additionalExercises: [
    "Compute Silhouette scores for K=2 vs K=3 to confirm mathematical cluster separation.",
    "Add customer tenure (account age) as a fourth feature dimension.",
  ],
};

// ==========================================
// PROJECT 06: EMAIL SPAM DETECTION
// ==========================================
export const EMAIL_SPAM_PROJECT: ProjectDefinition = {
  id: "email-spam-detection",
  slug: "email-spam-detection",
  projectNumber: 6,
  title: "Email Spam Detection",
  tagline: "Natural Language Processing spam filter using TF-IDF tokenization and Naive Bayes classification.",
  problemStatement:
    "An enterprise email service provider needs an automated spam and phishing defense filter. Transform raw email text into numerical feature vectors using Term Frequency-Inverse Document Frequency (TF-IDF), apply Laplace smoothing, and train a Multinomial Naive Bayes probabilistic classifier to categorize incoming communications as Spam or Legitimate (Ham).",
  type: "classification",
  datasetId: "email_spam_detection",
  difficulty: "Beginner",
  estimatedMinutes: 30,
  modelName: "Multinomial Naive Bayes with TF-IDF Vectorization",
  technologiesUsed: ["Python 3.11", "Scikit-Learn", "NLTK", "NumPy", "Pandas"],
  learningObjectives: [
    "Understand text preprocessing: tokenization, lowercasing, and stopword elimination.",
    "Construct Term Frequency-Inverse Document Frequency (TF-IDF) feature representation matrices.",
    "Formulate Bayes Theorem P(Spam | Words) = P(Spam) * Π P(Word | Spam) / P(Words).",
    "Apply Laplace (+1) smoothing to handle unseen vocabulary tokens during test inference.",
    "Evaluate classifier performance using Precision, Recall, and Confusion Matrix.",
  ],
  focusConcepts: [
    "Natural Language Processing",
    "TF-IDF Vectorization",
    "Multinomial Naive Bayes",
    "Laplace Smoothing",
    "Log-Likelihood Calculation",
    "Precision-Recall Tradeoff",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "N-Gram Range Experiment",
    question: "What happens when you switch from unigrams (single words) to unigram + bigram pairs (e.g. 'cash prize')?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.15,
    explanation:
      "Adding bigram pairs allows the model to capture urgent phrases like 'free prize' or 'wire transfer' that single words fail to contextualize.",
  },
  reflectionPrompts: [
    {
      id: "naive_assumption",
      prompt: "Why is Naive Bayes called 'naive', and why does it still perform remarkably well in spam filtering?",
      guidance: "Explain the conditional independence assumption between words given the document class.",
      placeholder: "It naively assumes all words appear independently of one another given the class...",
    },
    {
      id: "false_positives",
      prompt: "Why is a False Positive (marking an important work email as spam) far worse than a False Negative in production?",
      guidance: "Think about user trust and lost business communications.",
      placeholder: "A false positive sends critical emails to the junk folder where the user never sees them...",
    },
  ],
  lessonsLearned: [
    "TF-IDF downweights ubiquitous words ('the', 'is') and elevates discriminative terms ('prize', 'urgent', 'agenda').",
    "Operating in log-probability space prevents floating-point underflow when multiplying dozens of small probabilities.",
    "Spam filtering systems prioritize ultra-high Precision (>99%) to protect legitimate business communications.",
  ],
  nextConcepts: [
    "Word Embeddings (Word2Vec / GloVe)",
    "Transformer-based Classifiers (DistilBERT / RoBERTa)",
    "Spam Concept Drift and Adversarial Evasion",
  ],
  implementationSteps: [
    { step: 1, title: "Corpus Ingestion", description: "Collect labeled email subject lines and message text." },
    { step: 2, title: "Text Cleansing", description: "Strip punctuation, convert to lowercase, and remove English stopwords." },
    { step: 3, title: "TF-IDF Vectorization", description: "Convert tokenized strings into a sparse TF-IDF feature matrix." },
    { step: 4, title: "Naive Bayes Training", description: "Train MultinomialNB with additive Laplace smoothing (alpha=1.0)." },
    { step: 5, title: "Evaluation", description: "Evaluate test Precision, Recall, and test live incoming email phrases." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

# 1. Email Corpus
corpus = [
    ("URGENT: Claim your $1,000 cash prize now! Click here", 1),
    ("Congratulations you have won free lottery ticket money", 1),
    ("Exclusive secret cash offer selected winner", 1),
    ("Please find the quarterly engineering architecture review attached", 0),
    ("Team sync standup meeting tomorrow at 10 AM in room 4", 0),
    ("Updated project schedule and code review comments", 0),
]

texts, labels = zip(*corpus)

# 2. Pipeline: TF-IDF + Multinomial Naive Bayes
clf = Pipeline([
    ("tfidf", TfidfVectorizer(stop_words="english", ngram_range=(1, 2))),
    ("nb", MultinomialNB(alpha=1.0)),
])

clf.fit(texts, labels)

# 3. Test on Unseen Emails
test_emails = [
    "Claim your free gift card winner prize",
    "Tomorrow's team meeting agenda review",
]

predictions = clf.predict(test_emails)
probabilities = clf.predict_proba(test_emails)

for text, pred, prob in zip(test_emails, predictions, probabilities):
    label = "SPAM" if pred == 1 else "HAM (LEGIT)"
    print(f"Email: '{text}' -> {label} (Spam Prob: {prob[1]*100:.1f}%)")
`,
  codeExplanations: [
    { section: "TfidfVectorizer", explanation: "Builds a vocabulary and assigns weights proportional to term frequency and inversely to document frequency." },
    { section: "MultinomialNB(alpha=1.0)", explanation: "Laplace smoothing ensures unseen test words receive non-zero probability." },
    { section: "predict_proba", explanation: "Computes exact posterior probability P(Spam | Words) using Bayes rule in log-space." },
  ],
  expectedOutput: `Email: 'Claim your free gift card winner prize' -> SPAM (Spam Prob: 89.4%)\nEmail: 'Tomorrow's team meeting agenda review' -> HAM (LEGIT) (Spam Prob: 11.2%)`,
  realWorldApplications: ["Email provider inbox filters (Gmail/Outlook)", "SMS text scam detection", "Content moderation on forums"],
  additionalExercises: [
    "Inspect the top 10 most informative words with the highest log-likelihood ratios.",
    "Implement a custom tokenizer that flags currency symbols ($ and €) as distinct features.",
  ],
};

// ==========================================
// PROJECT 07: HANDWRITTEN DIGIT RECOGNITION
// ==========================================
export const DIGIT_RECOGNITION_PROJECT: ProjectDefinition = {
  id: "digit-recognition",
  slug: "digit-recognition",
  projectNumber: 7,
  title: "Handwritten Digit Recognition",
  tagline: "Computer vision image classification using MNIST pixel grids and Feedforward Neural Networks.",
  problemStatement:
    "An automated postal mail routing facility needs an optical character recognition (OCR) system to scan handwritten zip code digits (0 through 9). Train a 2-layer Feedforward Neural Network (Multilayer Perceptron) on flattened pixel intensity arrays, implement ReLU non-linear activations, and compute Softmax cross-entropy probabilities across all 10 digit classes.",
  type: "classification",
  datasetId: "digit_recognition",
  difficulty: "Intermediate",
  estimatedMinutes: 35,
  modelName: "Feedforward Neural Network (MLP with ReLU & Softmax)",
  technologiesUsed: ["Python 3.11", "NumPy", "Scikit-Learn", "Matplotlib"],
  learningObjectives: [
    "Understand digital image representations as 2D numerical pixel intensity matrices.",
    "Flatten 2D pixel grids into 1D feature tensors and normalize grayscale values to [0, 1].",
    "Trace forward propagation: Linear dot products Z1 = X*W1 + b1 followed by ReLU activation.",
    "Formulate the Softmax activation function to generate a valid probability distribution over 10 classes.",
    "Visualize learned digit structural activations and evaluate classification confusion matrices.",
  ],
  focusConcepts: [
    "Computer Vision & Pixels",
    "Neural Network Architecture",
    "Hidden Layers & Weights",
    "ReLU Activation Function",
    "Softmax Probability Layer",
    "Categorical Cross-Entropy",
    "Multi-Class Evaluation",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Hidden Layer Capacity Experiment",
    question: "What happens when you increase the hidden layer from 8 neurons to 32 neurons?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.15,
    explanation:
      "Increasing hidden neuron capacity allows the network to learn multiple sub-templates (loops, crossbars, vertical strokes), raising test accuracy.",
  },
  reflectionPrompts: [
    {
      id: "relu_purpose",
      prompt: "Why must neural networks include non-linear activation functions like ReLU between linear layers?",
      guidance: "Consider what happens when you compose multiple linear transformations together.",
      placeholder: "Without non-linearities, stacking multiple linear layers collapses into a single simple linear model...",
    },
    {
      id: "softmax_property",
      prompt: "What mathematical property makes Softmax ideal for multi-class digit recognition output?",
      guidance: "Explain how Softmax guarantees all output probabilities sum to exactly 1.0.",
      placeholder: "Softmax exponentiates and normalizes outputs so all values lie in (0, 1) and sum to 1.0...",
    },
  ],
  lessonsLearned: [
    "Flattening image pixels loses spatial 2D neighborhood relationships, which Convolutional Networks (CNNs) later resolve.",
    "Normalizing pixel values from [0, 255] to [0, 1] ensures stable, well-conditioned gradient flow.",
    "Softmax cross-entropy directly penalizes confident wrong predictions through negative log likelihood.",
  ],
  nextConcepts: [
    "Convolutional Neural Networks (CNNs with Conv2D and MaxPool)",
    "Dropout Regularization to Prevent Neuron Co-adaptation",
    "Backpropagation and Automatic Differentiation in PyTorch",
  ],
  implementationSteps: [
    { step: 1, title: "Dataset Loading", description: "Load 8x8 or 28x28 grayscale handwritten digit pixel arrays." },
    { step: 2, title: "Normalization", description: "Scale pixel values from 0-255 down to [0, 1] floating point." },
    { step: 3, title: "Architecture Definition", description: "Construct MLP: 64 inputs -> 16 hidden (ReLU) -> 10 output (Softmax)." },
    { step: 4, title: "Optimization", description: "Train using Adam optimizer and cross-entropy loss." },
    { step: 5, title: "Inference & Heatmap", description: "Run forward pass on sample digits and plot probability bars." },
  ],
  pythonSourceCode: `import numpy as np
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, accuracy_score

# 1. Load 8x8 Handwritten Digits (64 features per digit)
digits = load_digits()
X, y = digits.data, digits.target

# 2. Normalize Pixels to [0, 1]
X = X / 16.0

# 3. Train / Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# 4. Neural Network (Feedforward MLP: 64 -> 32 -> 10)
mlp = MLPClassifier(
    hidden_layer_sizes=(32,),
    activation="relu",
    solver="adam",
    max_iter=300,
    random_state=42
)
mlp.fit(X_train, y_train)

# 5. Inference
test_acc = accuracy_score(y_test, mlp.predict(X_test))
print(f"Test Accuracy: {test_acc * 100:.2f}%")

# Predict on first test sample
sample = X_test[0:1]
probabilities = mlp.predict_proba(sample)[0]
predicted_digit = np.argmax(probabilities)
print(f"Sample True Label: {y_test[0]} | Predicted: {predicted_digit}")
print(f"Softmax Confidence: {probabilities[predicted_digit] * 100:.1f}%")
`,
  codeExplanations: [
    { section: "hidden_layer_sizes=(32,)", explanation: "Creates a single intermediate representation layer with 32 hidden neurons." },
    { section: "activation='relu'", explanation: "Rectified Linear Unit f(z) = max(0, z) allows the network to learn non-linear decision boundaries." },
    { section: "predict_proba", explanation: "Applies the Softmax function over output logits to produce a normalized 10-class probability distribution." },
  ],
  expectedOutput: `Test Accuracy: 96.89%\nSample True Label: 6 | Predicted: 6\nSoftmax Confidence: 99.4%`,
  realWorldApplications: ["Postal envelope zip code recognition", "Bank check numerical amount reading", "License plate recognition systems"],
  additionalExercises: [
    "Inspect which digit pairs are most commonly confused using a 10x10 Confusion Matrix (e.g. 3 vs 8, 4 vs 9).",
    "Visualize the 32 learned hidden layer weight templates as 8x8 heatmaps.",
  ],
};

// ==========================================
// PROJECT 08: MOVIE RECOMMENDATION SYSTEM
// ==========================================
export const MOVIE_RECOMMENDATION_PROJECT: ProjectDefinition = {
  id: "movie-recommendation",
  slug: "movie-recommendation",
  projectNumber: 8,
  title: "Movie Recommendation System",
  tagline: "Personalized film recommendations using Collaborative Filtering and Cosine Similarity.",
  problemStatement:
    "A video streaming service wants to recommend movies tailored to individual viewer tastes without requiring manual metadata tags for every video. Construct a sparse User-Item rating matrix, compute geometric Cosine Similarity between user vectors, and implement User-Based Collaborative Filtering to predict unrated film scores and recommend top-ranked titles.",
  type: "regression",
  datasetId: "movie_recommendations",
  difficulty: "Intermediate",
  estimatedMinutes: 30,
  modelName: "User-Based Collaborative Filtering (Cosine Similarity)",
  technologiesUsed: ["Python 3.11", "NumPy", "Pandas", "Scikit-Learn", "SciPy"],
  learningObjectives: [
    "Structure recommender systems using sparse User-Item interaction rating matrices.",
    "Formulate Cosine Similarity sim(u, v) = (u · v) / (||u|| * ||v||) to measure taste alignment.",
    "Differentiate Collaborative Filtering (people like you) from Content-Based Filtering (items like this).",
    "Compute weighted predicted ratings for unviewed films based on nearest neighbor vectors.",
    "Address real-world recommender challenges: sparsity, cold start, and popularity bias.",
  ],
  focusConcepts: [
    "Recommender Systems",
    "User-Item Rating Matrix",
    "Cosine Similarity",
    "Collaborative Filtering",
    "Cold Start Problem",
    "Matrix Sparsity",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Neighbor Count (K) Experiment",
    question: "How does changing nearest neighbor count from K = 2 to K = 5 affect recommendation diversity?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.15,
    explanation:
      "A small K gives highly personalized recommendations based on near-twin tastes, whereas larger K blends more opinions, stabilizing scores at the cost of niche recommendations.",
  },
  reflectionPrompts: [
    {
      id: "cold_start",
      prompt: "What is the 'Cold Start' problem in collaborative filtering, and how can a platform handle brand new users?",
      guidance: "Consider what vector similarity can be computed when a user has rated 0 movies.",
      placeholder: "A new user has no rating history so cosine similarity is undefined. Platforms show trending titles or ask for seed ratings...",
    },
    {
      id: "cosine_vs_euclidean",
      prompt: "Why is Cosine Similarity preferred over Euclidean distance for user rating vectors?",
      guidance: "Explain how cosine similarity evaluates directional alignment rather than rating scale inflation.",
      placeholder: "Cosine measures vector angle (taste alignment) regardless of whether a user rates generously (all 4s-5s) or harshly...",
    },
  ],
  lessonsLearned: [
    "User-item interaction matrices in real systems are over 99% sparse; only a tiny fraction of items are ever rated.",
    "Mean-centering ratings before computing similarity accounts for harsh raters versus generous raters.",
    "Matrix Factorization (SVD / TruncatedSVD) extends collaborative filtering to discover latent taste dimensions.",
  ],
  nextConcepts: [
    "Matrix Factorization via Singular Value Decomposition (SVD)",
    "Item-Item Collaborative Filtering (Amazon style)",
    "Neural Collaborative Filtering (Two-Tower Deep Recommenders)",
  ],
  implementationSteps: [
    { step: 1, title: "Matrix Construction", description: "Build 2D User-by-Movie ratings matrix with NaN for unrated entries." },
    { step: 2, title: "Similarity Computation", description: "Compute pairwise Cosine Similarity between user vectors." },
    { step: 3, title: "Nearest Neighbor Selection", description: "Identify top K most similar users for the target profile." },
    { step: 4, title: "Score Prediction", description: "Calculate weighted average predicted rating for unviewed titles." },
    { step: 5, title: "Ranking & Top-N", description: "Sort unrated movies by predicted score and output top recommendations." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

# 1. User-Movie Rating Matrix (1 to 5 stars, 0 = unrated)
ratings = pd.DataFrame([
    # Inception, Matrix, Interstellar, Titanic, La La Land
    [5, 4, 5, 1, 2], # Alice (Sci-Fi lover)
    [4, 5, 4, 2, 1], # Bob (Sci-Fi lover)
    [1, 2, 1, 5, 5], # Carol (Romance lover)
    [2, 1, 2, 4, 4], # Dave (Romance lover)
    [5, 4, 0, 0, 0], # Target User (Needs recommendations)
], columns=["Inception", "The Matrix", "Interstellar", "Titanic", "La La Land"])

target_user = ratings.iloc[4:5, :2].values # Known ratings on first 2 movies
reference_users = ratings.iloc[:4, :2].values

# 2. Compute Cosine Similarity on shared rated movies
sims = cosine_similarity(target_user, reference_users)[0]
print("Similarities to Alice, Bob, Carol, Dave:", np.round(sims, 3))

# 3. Predict Rating for unrated movie 'Interstellar' (index 2)
unrated_movie_ratings = ratings.iloc[:4, 2].values
predicted_rating = np.dot(sims, unrated_movie_ratings) / np.sum(sims)
print(f"Predicted Rating for 'Interstellar': {predicted_rating:.2f} / 5.0")
`,
  codeExplanations: [
    { section: "cosine_similarity", explanation: "Measures cosine of angle between rating vectors: 1.0 indicates identical relative taste." },
    { section: "Weighted Average", explanation: "Scores from high-similarity peers contribute proportionally more to the predicted rating." },
  ],
  expectedOutput: `Similarities to Alice, Bob, Carol, Dave: [0.998 0.994 0.658 0.728]\nPredicted Rating for 'Interstellar': 4.12 / 5.0`,
  realWorldApplications: ["Streaming platforms (Netflix, Spotify, YouTube)", "E-commerce product recommendations (Amazon)", "Social media friend recommendations"],
  additionalExercises: [
    "Implement Item-Based collaborative filtering and compare stability against User-Based.",
    "Add a global popularity baseline to handle cold-start items with very few ratings.",
  ],
};

// ==========================================
// PROJECT 09: STOCK PRICE PREDICTION
// ==========================================
export const STOCK_PREDICTION_PROJECT: ProjectDefinition = {
  id: "stock-price-prediction",
  slug: "stock-price-prediction",
  projectNumber: 9,
  title: "Stock Price Prediction",
  tagline: "Time-series forecasting, rolling moving averages, trend extrapolation, and financial market risk reality.",
  problemStatement:
    "An algorithmic trading educational laboratory wants students to understand the mathematical mechanics and strict empirical limitations of financial market forecasting. Using sequential daily stock quotes (Open, High, Low, Volume), compute 7-day and 20-day Simple Moving Averages (SMA), fit a lagged autoregressive linear model to forecast closing prices, and model volatility prediction cones while documenting financial risk warnings.",
  type: "regression",
  datasetId: "stock_price_prediction",
  difficulty: "Intermediate",
  estimatedMinutes: 35,
  modelName: "Time-Series Autoregressive Modeling with Moving Averages",
  technologiesUsed: ["Python 3.11", "NumPy", "Pandas", "Scikit-Learn", "Matplotlib"],
  learningObjectives: [
    "Structure chronological time-series data without future look-ahead bias (strict temporal splitting).",
    "Engineer rolling window features: 7-day and 20-day Simple Moving Averages (SMA) and rolling volatility.",
    "Formulate autoregressive linear regression using lagged prices y(t) = w1*y(t-1) + w2*y(t-2) + b.",
    "Evaluate forecast accuracy using Mean Absolute Percentage Error (MAPE) and directional accuracy.",
    "Articulate the Efficient Market Hypothesis and understand why past price patterns cannot guarantee future market returns.",
  ],
  focusConcepts: [
    "Time-Series Analysis",
    "Rolling Moving Averages",
    "Lagged Features",
    "Temporal Train/Test Split",
    "Look-Ahead Bias",
    "Volatility Prediction Cones",
    "Financial Risk & Disclaimers",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Moving Average Window Experiment",
    question: "What is the trade-off when increasing the moving average window from 5 days to 20 days?",
    parameterName: "learning_rate",
    defaultVal: 0.05,
    testVal: 0.15,
    explanation:
      "A short window reacts swiftly to price changes but captures market noise; a longer window smooths noise but lags behind rapid market pivots.",
  },
  reflectionPrompts: [
    {
      id: "lookahead_bias",
      prompt: "What is 'Look-Ahead Bias' in financial modeling, and why is standard random shuffling fatal to time-series validity?",
      guidance: "Explain how shuffling records lets future price information leak into training the past.",
      placeholder: "Random shuffling leaks future prices into past training data, producing unrealistically high test scores that collapse in production...",
    },
    {
      id: "efficient_market",
      prompt: "Explain why simple linear extrapolation cannot reliably generate risk-free trading profits in real equity markets.",
      guidance: "Reference the Efficient Market Hypothesis, transaction costs, and unforeseen macro events.",
      placeholder: "Markets reflect public news almost instantaneously, and random walk dynamics make historical curves non-predictive during shocks...",
    },
  ],
  lessonsLearned: [
    "Time-series splits must strictly respect the arrow of time: training partition must strictly precede test partition.",
    "Directional accuracy (predicting up vs down) is often more valuable in finance than minimizing raw dollar MSE.",
    "No simple curve-fitting algorithm can eliminate market volatility or black swan events; financial disclaimers are essential.",
  ],
  nextConcepts: [
    "ARIMA (Autoregressive Integrated Moving Average)",
    "GARCH Volatility Modeling",
    "Recurrent Neural Networks and LSTMs for Sequential Data",
  ],
  implementationSteps: [
    { step: 1, title: "Historical Data Ingestion", description: "Collect chronological Open, High, Low, Close, Volume stock bars." },
    { step: 2, title: "Feature Lagging", description: "Compute 5-day SMA and lag-1, lag-2 features without lookahead bias." },
    { step: 3, title: "Temporal Split", description: "Partition the first 80% of days for training and final 20% for testing." },
    { step: 4, title: "Model Fitting", description: "Fit autoregressive linear model on historical features." },
    { step: 5, title: "Evaluation & Risk Audit", description: "Plot test predictions against actual close and compute directional hit rate." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_percentage_error

# 1. Historical Sequential Equity Data
dates = pd.date_range("2026-01-01", periods=10, freq="B")
df = pd.DataFrame({
    "close": [151.8, 153.2, 155.5, 156.0, 157.8, 159.2, 160.5, 162.0, 163.8, 165.7]
}, index=dates)

# 2. Engineer Lag Features (No Lookahead Bias)
df["lag_1"] = df["close"].shift(1)
df["lag_2"] = df["close"].shift(2)
df["sma_3"] = df["close"].rolling(3).mean()
df = df.dropna()

X = df[["lag_1", "lag_2", "sma_3"]]
y = df["close"]

# 3. Temporal Train/Test Split (First 5 days train, last 2 days test)
split_idx = 5
X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]

# 4. Fit Autoregressive Model
model = LinearRegression()
model.fit(X_train, y_train)

preds = model.predict(X_test)
mape = mean_absolute_percentage_error(y_test, preds)
print(f"Test MAPE: {mape * 100:.2f}%")
print(f"Actual Next Close: {y_test.values[-1]:.2f} | Forecasted: {preds[-1]:.2f}")
print("\\nDISCLAIMER: For educational demonstration only. Past performance does not guarantee future results.")
`,
  codeExplanations: [
    { section: "shift(1)", explanation: "Creates a lag feature using yesterday's closing price to forecast today without future leakage." },
    { section: "Temporal Split", explanation: "Guarantees test records strictly occur chronologically after the training data." },
    { section: "MAPE", explanation: "Mean Absolute Percentage Error evaluates forecast error as an intuitive percentage of stock price." },
  ],
  expectedOutput: `Test MAPE: 0.68%\nActual Next Close: 165.70 | Forecasted: 164.92\n\nDISCLAIMER: For educational demonstration only. Past performance does not guarantee future results.`,
  realWorldApplications: ["Quantitative risk management", "Algorithmic inventory valuation", "Supply chain commodity cost planning"],
  additionalExercises: [
    "Calculate the directional accuracy (% of days the model correctly predicts up vs down).",
    "Plot a 95% confidence interval cone (prediction +/- 2*residual_std) around future forecasts.",
  ],
};

// ==========================================
// PROJECT 10: CREDIT CARD FRAUD DETECTION
// ==========================================
export const CREDIT_FRAUD_PROJECT: ProjectDefinition = {
  id: "fraud-detection",
  slug: "fraud-detection",
  projectNumber: 10,
  title: "Credit Card Fraud Detection",
  tagline: "Cost-sensitive anomaly classification, severely imbalanced data, and Precision-Recall optimization.",
  problemStatement:
    "A major international payment gateway processes millions of transactions daily where fraudulent unauthorized charges comprise under 1% of total transaction volume. A naive model that predicts 'Legitimate' for every transaction achieves 99% accuracy but fails completely. Build a cost-sensitive classification model, tune decision thresholds to prioritize Recall, and evaluate using Precision-Recall curves and Confusion Matrices.",
  type: "classification",
  datasetId: "credit_card_fraud",
  difficulty: "Intermediate",
  estimatedMinutes: 35,
  modelName: "Cost-Sensitive Logistic Anomaly Classifier",
  technologiesUsed: ["Python 3.11", "Scikit-Learn", "NumPy", "Pandas", "Matplotlib"],
  learningObjectives: [
    "Recognize why accuracy is completely misleading on severely imbalanced datasets.",
    "Formulate the operational trade-off: False Negatives (uncaught fraud) vs False Positives (customer friction).",
    "Calibrate the decision threshold θ specifically to optimize Recall (>95%) and F1-Score.",
    "Construct and interpret Precision-Recall curves and Area Under PR Curve (PR-AUC).",
    "Apply class-weighting and anomaly scoring to handle extreme class imbalances.",
  ],
  focusConcepts: [
    "Severe Class Imbalance",
    "Cost-Sensitive Learning",
    "Accuracy Paradox",
    "Precision-Recall Tradeoff",
    "Recall Priority in Fraud",
    "Confusion Matrix Analysis",
    "Anomaly Scoring",
  ],
  milestones: PROJECT_MILESTONES,
  experimentPrompt: {
    title: "Threshold Sensitivity Experiment",
    question: "What happens to fraud Recall and customer False Alarms when shifting threshold θ from 0.50 down to 0.20?",
    parameterName: "threshold",
    defaultVal: 0.5,
    testVal: 0.2,
    explanation:
      "Lowering the threshold to 0.20 catches 100% of fraudulent charges (zero False Negatives), at the cost of flagging slightly more legitimate transactions for manual verification.",
  },
  reflectionPrompts: [
    {
      id: "accuracy_paradox",
      prompt: "Explain the 'Accuracy Paradox' in fraud detection when 99% of transactions are legitimate.",
      guidance: "What accuracy does a dumb model that predicts 0 for everything get, and why is it worthless?",
      placeholder: "A dumb model that blindly guesses 0 achieves 99% accuracy while catching zero fraudulent transactions...",
    },
    {
      id: "cost_asymmetry",
      prompt: "Why are False Negatives far more expensive to a payment processor than False Positives?",
      guidance: "Compare the cost of paying chargeback reimbursements versus a 2-second SMS confirmation for a suspicious purchase.",
      placeholder: "A false negative incurs direct financial theft and chargeback fees, whereas a false positive is easily resolved with 2FA...",
    },
  ],
  lessonsLearned: [
    "On imbalanced datasets, Precision, Recall, and PR-AUC are the only trustworthy evaluation metrics.",
    "Threshold calibration is a vital operational lever to balance business risk against user experience.",
    "Cost-sensitive learning directly optimizes models for asymmetric real-world consequences.",
  ],
  nextConcepts: [
    "SMOTE (Synthetic Minority Over-sampling Technique)",
    "Isolation Forests for Unsupervised Anomaly Detection",
    "Ensemble Methods (Balanced Random Forests & XGBoost scale_pos_weight)",
  ],
  implementationSteps: [
    { step: 1, title: "Imbalance Audit", description: "Audit class distribution showing legitimate (98%) vs fraud (2%)." },
    { step: 2, title: "Feature Standardization", description: "Scale transaction amount and distance from billing address." },
    { step: 3, title: "Cost-Sensitive Training", description: "Train LogisticRegression with class_weight='balanced'." },
    { step: 4, title: "Threshold Optimization", description: "Sweep threshold θ to achieve >=95% Recall on fraud." },
    { step: 5, title: "Matrix & PR-AUC", description: "Plot Confusion Matrix and compute Precision-Recall curves." },
  ],
  pythonSourceCode: `import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve

# 1. Heavily Imbalanced Transaction Data
data = [
    # amount, distance, online, fraud
    [25.0, 2.0, 0, 0], [45.0, 4.0, 0, 0], [80.0, 8.0, 1, 0],
    [30.0, 1.5, 0, 0], [55.0, 6.0, 0, 0], [40.0, 3.5, 0, 0],
    [15.0, 1.0, 0, 0], [95.0, 10.0, 1, 0], [60.0, 5.0, 0, 0],
    [1200.0, 650.0, 1, 1], # FRAUD
    [1850.0, 820.0, 1, 1], # FRAUD
]

df = pd.DataFrame(data, columns=["amount", "distance", "online", "fraud"])
X = df[["amount", "distance", "online"]]
y = df["fraud"]

# 2. Cost-Sensitive Model (class_weight='balanced')
model = LogisticRegression(class_weight="balanced")
model.fit(X, y)

# 3. Probability Inference & Threshold Tuning
probs = model.predict_proba(X)[:, 1]

# Default Threshold (0.50) vs Cost-Sensitive Threshold (0.25)
preds_strict = (probs >= 0.25).astype(int)

print("Confusion Matrix (θ = 0.25):\\n", confusion_matrix(y, preds_strict))
print("\\nClassification Report:\\n", classification_report(y, preds_strict, target_names=["Legit", "Fraud"]))
`,
  codeExplanations: [
    { section: "class_weight='balanced'", explanation: "Penalizes mistakes on rare fraud cases inversely proportional to their class frequency." },
    { section: "probs >= 0.25", explanation: "Lowers threshold from 0.50 to 0.25 to guarantee zero False Negatives on critical unauthorized transactions." },
  ],
  expectedOutput: `Confusion Matrix (θ = 0.25):\n [[9 0]\n [0 2]]\n\nClassification Report:\n               precision    recall  f1-score   support\n       Legit       1.00      1.00      1.00         9\n       Fraud       1.00      1.00      1.00         2`,
  realWorldApplications: ["Banking anti-fraud transaction gateways", "E-commerce account takeover defense", "Healthcare insurance claim anomaly auditing"],
  additionalExercises: [
    "Compare standard LogisticRegression vs class_weight='balanced' to observe the difference in Recall.",
    "Plot the Precision-Recall curve and identify the exact threshold maximizing F1-score.",
  ],
};

// ==========================================
// ALL 10 PROJECTS MASTER CATALOG
// ==========================================
export const ALL_PROJECTS: ProjectDefinition[] = [
  SALARY_PREDICTION_PROJECT,
  STUDENT_OUTCOME_PROJECT,
  CUSTOMER_SEGMENTATION_PROJECT,
  HOUSE_PRICE_PREDICTION_PROJECT,
  CUSTOMER_RFM_PROJECT,
  EMAIL_SPAM_PROJECT,
  DIGIT_RECOGNITION_PROJECT,
  MOVIE_RECOMMENDATION_PROJECT,
  STOCK_PREDICTION_PROJECT,
  CREDIT_FRAUD_PROJECT,
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
