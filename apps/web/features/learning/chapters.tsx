import { MODEL_LESSONS } from "@/features/learning/model-lessons";

/** Learn-page cards for a chapter's model lessons (tag prefix e.g. "Regression"). */
function lessonsFor(prefix: string, concepts: Record<string, string[]>): LessonItem[] {
  return MODEL_LESSONS.filter((l) => l.tag.startsWith(prefix)).map((l) => ({
    href: `/learn/${l.slug}`,
    num: l.number,
    title: l.title,
    summary: l.subtitle,
    idea: l.keyIdea,
    difficulty: l.difficulty,
    time: `${l.estimatedMinutes} min`,
    concepts: concepts[l.slug] ?? [],
    tryIt: "Start lesson →",
  }));
}

export type LessonItem = {
  href: string;
  num: string;
  title: string;
  summary: string;
  idea: string;
  difficulty: "Beginner" | "Intermediate";
  time: string;
  concepts: string[];
  tryIt: string;
  /** Optional sub-heading inside a chapter (e.g. "Before you start"). */
  group?: string;
};

export type Chapter = {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  lessons: LessonItem[];
  renderMiniVisual?: () => React.ReactNode;
};

export const chapters: Chapter[] = [
  {
    id: "foundations",
    chapterNumber: "01",
    title: "Foundations of Machine Learning",
    subtitle: "From rule-based programming to iterative parameter optimization on error surfaces.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Gradient Descent Descent">
        <line x1="15" y1="58" x2="145" y2="58" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        <polyline fill="none" stroke="#2dd4bf" strokeWidth="2.5" points="20,18 45,35 75,48 105,54 140,56" />
        <circle cx="75" cy="48" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
      </svg>
    ),
    lessons: [
      {
        href: "/learn/vectors-matrices-notation",
        num: "P1",
        title: "Vectors, Matrices & Notation",
        summary: "How datasets, weights and predictions are written: shapes, dot products, norms.",
        idea: "How datasets, weights and predictions are written: shapes, dot products, norms.",
        difficulty: "Beginner",
        time: "10 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/derivatives-chain-rule",
        num: "P2",
        title: "Derivatives & the Chain Rule",
        summary: "Slopes tell a model which way to move; the chain rule finds them through layers.",
        idea: "Slopes tell a model which way to move; the chain rule finds them through layers.",
        difficulty: "Beginner",
        time: "12 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/partial-derivatives-gradients",
        num: "P3",
        title: "Partial Derivatives & Gradients",
        summary: "Every slope in one vector, and the update rule θ ← θ − η∇L.",
        idea: "Every slope in one vector, and the update rule θ ← θ − η∇L.",
        difficulty: "Beginner",
        time: "12 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/probability-statistics",
        num: "P4",
        title: "Probability & Statistics Essentials",
        summary: "Mean, spread, correlation, Bayes' rule and the normal distribution.",
        idea: "Mean, spread, correlation, Bayes' rule and the normal distribution.",
        difficulty: "Beginner",
        time: "14 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/python-numpy-pandas",
        num: "P5",
        title: "Python for ML: NumPy & pandas",
        summary: "Vectorised arrays and DataFrames: from a CSV file to model inputs.",
        idea: "Vectorised arrays and DataFrames: from a CSV file to model inputs.",
        difficulty: "Beginner",
        time: "15 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/python-plotting-sklearn",
        num: "P6",
        title: "Plotting & the scikit-learn Workflow",
        summary: "Plot first, then split, preprocess, fit, predict and evaluate.",
        idea: "Plot first, then split, preprocess, fit, predict and evaluate.",
        difficulty: "Beginner",
        time: "12 min",
        concepts: [],
        tryIt: "Start lesson →",
        group: "Before you start: Math & Python",
      },
      {
        href: "/learn/what-is-machine-learning",
        num: "01",
        title: "What is Machine Learning?",
        summary: "Models learn patterns from data rather than memorizing one fixed answer.",
        idea: "A model turns inputs into predictions using adjustable parameters. Training finds the right settings.",
        difficulty: "Beginner",
        time: "5 min",
        concepts: ["features", "targets", "predictions", "training vs inference"],
        tryIt: "Start lesson →",
        group: "Core ideas",
      },
      {
        href: "/learn/how-models-learn",
        num: "02",
        title: "How Does a Model Learn?",
        summary: "The continuous feedback loop of predicting, measuring error, and updating parameters.",
        idea: "Learning is iterative error reduction. Small repeated updates converge on the right fit.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["prediction", "error", "parameter updates", "repeated improvement"],
        tryIt: "Start lesson →",
        group: "Core ideas",
      },
      {
        href: "/learn/loss-functions",
        num: "03",
        title: "Loss: Measuring How Wrong the Model Is",
        summary: "Why training requires a single measurable objective score like Mean Squared Error.",
        idea: "Loss scores how far all predictions are from the true targets. Minimizing loss is the training objective.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["loss", "error vs loss", "MSE", "objective function"],
        tryIt: "Start lesson →",
        group: "Core ideas",
      },
      {
        href: "/learn/gradient-descent",
        num: "04",
        title: "Gradient Descent",
        summary: "The optimization engine that guides parameters downhill toward minimum loss.",
        idea: "Slope tells you which way is uphill; stepping in the opposite direction lowers error.",
        difficulty: "Beginner",
        time: "7 min",
        concepts: ["gradient descent", "slope", "parameter updates", "convergence"],
        tryIt: "Start lesson →",
        group: "Core ideas",
      },
      {
        href: "/learn/learning-rate",
        num: "05",
        title: "Learning Rate",
        summary: "The step size multiplier that balances training speed against mathematical stability.",
        idea: "Too small crawls forever; too large overshoots and diverges. Choosing α is critical.",
        difficulty: "Beginner",
        time: "7 min",
        concepts: ["learning rate", "step size", "instability", "divergence"],
        tryIt: "Start lesson →",
        group: "Core ideas",
      },
    ],
  },
  {
    id: "regression",
    chapterNumber: "02",
    title: "Regression: Predicting Numbers",
    subtitle: "Straight lines, curves, and keeping flexible models honest with regularization.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Regression line">
        {[[20, 52], [40, 46], [60, 40], [80, 30], [100, 28], [120, 20], [140, 14]].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="2.5" fill="#38bdf8" />
        ))}
        <line x1="15" y1="56" x2="145" y2="12" stroke="#14b8a6" strokeWidth="2" />
      </svg>
    ),
    lessons: lessonsFor("Regression", { "linear-regression": ["weights", "bias", "MSE", "least squares"], "polynomial-regression": ["degree", "underfitting", "overfitting", "test error"], regularization: ["ridge", "lasso", "lambda", "feature selection"] }),
  },
  {
    id: "supervised",
    chapterNumber: "03",
    title: "Classification: Predicting Categories",
    subtitle: "Separating categories and calculating class probabilities using the sigmoid function.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Classification Boundary">
        <line x1="15" y1="58" x2="145" y2="58" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        <circle cx="35" cy="45" r="3" fill="#38bdf8" />
        <circle cx="50" cy="35" r="3" fill="#38bdf8" />
        <circle cx="110" cy="20" r="3" fill="#f59e0b" />
        <circle cx="125" cy="30" r="3" fill="#f59e0b" />
        <line x1="60" y1="55" x2="100" y2="15" stroke="#14b8a6" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    ),
    lessons: lessonsFor("Classification", { "logistic-regression": ["sigmoid", "probability", "log-loss", "threshold"], "k-nearest-neighbors": ["distance", "majority vote", "choosing K", "scaling"], "decision-trees": ["splits", "Gini impurity", "depth", "overfitting"] }),
  },
  {
    id: "unsupervised",
    chapterNumber: "04",
    title: "Clustering: Finding Groups",
    subtitle: "Discovering cohesive behavioral groupings without ground truth labels.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="K-Means Centroid Cluster">
        <circle cx="45" cy="35" r="2.5" fill="#14b8a6" />
        <circle cx="55" cy="30" r="2.5" fill="#14b8a6" />
        <circle cx="50" cy="32" r="6" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
        <circle cx="115" cy="35" r="2.5" fill="#a855f7" />
        <circle cx="125" cy="30" r="2.5" fill="#a855f7" />
        <circle cx="120" cy="32" r="6" fill="none" stroke="#c084fc" strokeWidth="1.5" />
      </svg>
    ),
    lessons: lessonsFor("Clustering", { "k-means": ["centroids", "inertia", "elbow", "k-means++"], "hierarchical-clustering": ["dendrogram", "linkage", "cut height"], "dbscan": ["density", "eps", "minPts", "noise"] }),
  },
  {
    id: "deep-learning",
    chapterNumber: "05",
    title: "Deep Learning & Backpropagation",
    subtitle: "Multi-layer perceptrons, non-linear activation flow, and analytical calculus gradients.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2" role="img" aria-label="Neural Network Nodes">
        <line x1="30" y1="25" x2="80" y2="20" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        <line x1="30" y1="45" x2="80" y2="50" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />
        <line x1="80" y1="20" x2="130" y2="35" stroke="#0f766e" strokeWidth="1.5" />
        <circle cx="30" cy="25" r="4" fill="#0284c7" />
        <circle cx="30" cy="45" r="4" fill="#0284c7" />
        <circle cx="80" cy="20" r="4" fill="#0f766e" />
        <circle cx="80" cy="50" r="4" fill="#0f766e" />
        <circle cx="130" cy="35" r="4" fill="#f59e0b" />
      </svg>
    ),
    lessons: [
      {
        href: "/labs/neural-network",
        num: "15",
        title: "Neural Networks & Backpropagation",
        summary: "Hidden layers and nonlinear activations allow networks to learn complex decision surfaces.",
        idea: "The chain rule sends error signals backwards through the network to update all weights layer by layer.",
        difficulty: "Intermediate",
        time: "10 min",
        concepts: ["hidden layers", "backpropagation", "chain rule", "sigmoid activation"],
        tryIt: "Open Neural Network lab →",
      },
    ],
  },
  {
    id: "workflow",
    chapterNumber: "06",
    title: "Data Science Workflow & Analysis",
    subtitle: "Feature scaling, missing value imputation, train/test leakage prevention, and metrics.",
    lessons: [
      {
        href: "/labs/gradient-descent",
        num: "16",
        title: "How to Read a Training Run",
        summary: "Connect loss curves, gradient norms, and parameter steps to diagnose convergence, plateaus, and instability from telemetry.",
        idea: "Evidence from telemetry explains why parameters move and how to adjust hyperparameters.",
        difficulty: "Intermediate",
        time: "8 min",
        concepts: ["loss", "gradients", "parameter updates", "convergence", "instability", "experiment comparison"],
        tryIt: "Explore in Linear Regression lab →",
      },
      {
        href: "/workbench",
        num: "17",
        title: "Understanding Datasets & Feature Shapes",
        summary: "Before fitting a model, inspect row counts, feature types, unique values, and missingness to understand your data surface.",
        idea: "Data shape, types, and quality dictate which models can learn effectively.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["features", "datatypes", "metadata", "sample size"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "18",
        title: "Missing Values & Imputation",
        summary: "Missing values disrupt linear algebra. Imputing with mean or mode allows models to process incomplete records.",
        idea: "Impute missing observations without inventing false correlations.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["missing values", "mean imputation", "mode imputation"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "19",
        title: "Feature Scaling (Z-Score & MinMax)",
        summary: "When features have vastly different ranges, gradients oscillate wildly. Scaling balances step sizes across dimensions.",
        idea: "Standardization (Z-Score) or Min-Max scaling equalizes feature magnitudes.",
        difficulty: "Beginner",
        time: "7 min",
        concepts: ["standardization", "min-max scaling", "normalization"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "20",
        title: "Categorical Encoding",
        summary: "Machine learning models compute numeric dot products. One-hot encoding translates qualitative categories into binary basis indicators.",
        idea: "Encode categories without imposing artificial numerical ordering.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["categorical features", "one-hot encoding", "indicator variables"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "21",
        title: "Train / Test Split & Generalization",
        summary: "Evaluating a model on the data used to train it gives a falsely confident score. Partitioning measures generalization to new data.",
        idea: "Reserve a hold-out test set to evaluate real generalization.",
        difficulty: "Beginner",
        time: "6 min",
        concepts: ["training set", "test set", "reproducibility", "random seed"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "22",
        title: "Preventing Data Leakage",
        summary: "If test data influences preprocessing (such as scaling or imputation means), evaluation metrics become falsely optimistic.",
        idea: "Fit transformers on the training partition only, then apply to test data.",
        difficulty: "Intermediate",
        time: "8 min",
        concepts: ["data leakage", "pipeline isolation", "generalization integrity"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "23",
        title: "Evaluation Metrics (MSE, MAE, R²)",
        summary: "Training loss is an optimization guide; evaluation metrics like MSE, MAE, R², and accuracy evaluate operational utility.",
        idea: "Choose metrics aligned with task objectives rather than raw loss alone.",
        difficulty: "Intermediate",
        time: "7 min",
        concepts: ["MSE", "MAE", "R-squared", "evaluation metrics"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "24",
        title: "The Confusion Matrix",
        summary: "A 2x2 contingency table separating true positives, false positives, true negatives, and false negatives in binary classification.",
        idea: "Inspect exact counts of errors rather than just a single summary score.",
        difficulty: "Beginner",
        time: "7 min",
        concepts: ["confusion matrix", "true positive", "false positive", "false negative"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "25",
        title: "Precision vs Recall & Threshold Tuning",
        summary: "Precision asks: when the model predicts positive, how often is it right? Recall asks: what fraction of actual positives were caught?",
        idea: "Tuning the decision threshold adjusts the trade-off between precision and recall.",
        difficulty: "Intermediate",
        time: "8 min",
        concepts: ["precision", "recall", "F1 score", "decision threshold"],
        tryIt: "Practice in Workbench →",
      },
      {
        href: "/workbench",
        num: "26",
        title: "Overfitting vs Underfitting",
        summary: "Compare training and test performance to spot when a model memorizes training noise instead of general patterns.",
        idea: "A growing gap between train and test metrics indicates a generalization gap.",
        difficulty: "Intermediate",
        time: "8 min",
        concepts: ["overfitting", "underfitting", "generalization gap"],
        tryIt: "Practice in Workbench →",
      },
    ],
  },
  {
    id: "capstone",
    chapterNumber: "07",
    title: "Capstone Guided Projects",
    subtitle: "Synthesizing data science pipelines into verified, recruiter-ready case studies.",
    lessons: [
      {
        href: "/projects/salary-prediction",
        num: "27",
        title: "Salary Prediction (Linear Regression)",
        summary: "Synthesize data cleaning, train/test split, and linear regression to predict engineering compensation without data leakage.",
        idea: "Connect data preprocessing, training runs, and evaluation metrics into one complete ML lifecycle.",
        difficulty: "Beginner",
        time: "15 min",
        concepts: ["regression", "imputation", "one-hot encoding", "MSE", "R²", "generalization"],
        tryIt: "Start Project →",
      },
      {
        href: "/projects/student-outcome",
        num: "28",
        title: "Student Exam Outcome (Logistic Regression)",
        summary: "Build a logistic regression early-warning model to predict student admission and balance Precision vs Recall with threshold tuning.",
        idea: "Calibrate decision boundaries and evaluate classification ranking with confusion matrices and ROC curves.",
        difficulty: "Intermediate",
        time: "20 min",
        concepts: ["classification", "decision threshold", "precision", "recall", "ROC", "AUC"],
        tryIt: "Start Project →",
      },
      {
        href: "/projects/customer-segmentation",
        num: "29",
        title: "Customer Retail Segmentation (K-Means)",
        summary: "Segment retail shoppers with unsupervised K-Means, standardizing features to discover cohesive behavioral cohorts.",
        idea: "Standardize multi-scale features and evaluate clustering cohesion using inertia and centroid analysis.",
        difficulty: "Intermediate",
        time: "20 min",
        concepts: ["unsupervised learning", "clustering", "feature scaling", "inertia", "centroids"],
        tryIt: "Start Project →",
      },
    ],
  },
];

