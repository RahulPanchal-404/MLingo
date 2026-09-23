import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";

type LessonItem = {
  href: string;
  num: string;
  title: string;
  summary: string;
  idea: string;
  difficulty: "Beginner" | "Intermediate";
  time: string;
  concepts: string[];
  tryIt: string;
};

type Chapter = {
  id: string;
  chapterNumber: string;
  title: string;
  subtitle: string;
  lessons: LessonItem[];
  renderMiniVisual?: () => React.ReactNode;
};

const chapters: Chapter[] = [
  {
    id: "foundations",
    chapterNumber: "01",
    title: "Foundations of Machine Learning",
    subtitle: "From rule-based programming to iterative parameter optimization on error surfaces.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg bg-slate-950 p-2" role="img" aria-label="Gradient Descent Descent">
        <line x1="15" y1="58" x2="145" y2="58" stroke="#334155" strokeWidth="1" />
        <polyline fill="none" stroke="#2dd4bf" strokeWidth="2.5" points="20,18 45,35 75,48 105,54 140,56" />
        <circle cx="75" cy="48" r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1" />
      </svg>
    ),
    lessons: [
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
      },
    ],
  },
  {
    id: "supervised",
    chapterNumber: "02",
    title: "Supervised Learning & Classification",
    subtitle: "Separating categories and calculating class probabilities using the sigmoid function.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg bg-slate-950 p-2" role="img" aria-label="Classification Boundary">
        <line x1="15" y1="58" x2="145" y2="58" stroke="#334155" strokeWidth="1" />
        <circle cx="35" cy="45" r="3" fill="#38bdf8" />
        <circle cx="50" cy="35" r="3" fill="#38bdf8" />
        <circle cx="110" cy="20" r="3" fill="#f59e0b" />
        <circle cx="125" cy="30" r="3" fill="#f59e0b" />
        <line x1="60" y1="55" x2="100" y2="15" stroke="#14b8a6" strokeWidth="2" strokeDasharray="3 3" />
      </svg>
    ),
    lessons: [
      {
        href: "/labs/logistic-regression",
        num: "06",
        title: "Logistic Regression & Decision Boundaries",
        summary: "This model produces probabilities for binary outcomes instead of raw real-valued predictions.",
        idea: "Classification learns a separating boundary between two classes using the sigmoid function.",
        difficulty: "Beginner",
        time: "8 min",
        concepts: ["probability", "classification", "decision boundary", "log-loss"],
        tryIt: "Open Logistic Regression lab →",
      },
    ],
  },
  {
    id: "unsupervised",
    chapterNumber: "03",
    title: "Unsupervised Learning & Clustering",
    subtitle: "Discovering cohesive behavioral groupings without ground truth labels.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg bg-slate-950 p-2" role="img" aria-label="K-Means Centroid Cluster">
        <circle cx="45" cy="35" r="2.5" fill="#14b8a6" />
        <circle cx="55" cy="30" r="2.5" fill="#14b8a6" />
        <circle cx="50" cy="32" r="6" fill="none" stroke="#2dd4bf" strokeWidth="1.5" />
        <circle cx="115" cy="35" r="2.5" fill="#a855f7" />
        <circle cx="125" cy="30" r="2.5" fill="#a855f7" />
        <circle cx="120" cy="32" r="6" fill="none" stroke="#c084fc" strokeWidth="1.5" />
      </svg>
    ),
    lessons: [
      {
        href: "/labs/k-means",
        num: "07",
        title: "K-Means Clustering & Centroid Dynamics",
        summary: "K-Means groups nearby points by distance to shared geometric centroids.",
        idea: "The algorithm repeatedly assigns points to clusters and moves centroids toward their mean locations.",
        difficulty: "Beginner",
        time: "8 min",
        concepts: ["clustering", "centroids", "inertia", "within-cluster variance"],
        tryIt: "Open K-Means lab →",
      },
    ],
  },
  {
    id: "deep-learning",
    chapterNumber: "04",
    title: "Deep Learning & Backpropagation",
    subtitle: "Multi-layer perceptrons, non-linear activation flow, and analytical calculus gradients.",
    renderMiniVisual: () => (
      <svg viewBox="0 0 160 70" className="w-full h-16 select-none rounded-lg bg-slate-950 p-2" role="img" aria-label="Neural Network Nodes">
        <line x1="30" y1="25" x2="80" y2="20" stroke="#334155" strokeWidth="1" />
        <line x1="30" y1="45" x2="80" y2="50" stroke="#334155" strokeWidth="1" />
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
        num: "08",
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
    chapterNumber: "05",
    title: "Data Science Workflow & Analysis",
    subtitle: "Feature scaling, missing value imputation, train/test leakage prevention, and metrics.",
    lessons: [
      {
        href: "/labs/gradient-descent",
        num: "09",
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
        num: "10",
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
        num: "11",
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
        num: "12",
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
        num: "13",
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
        num: "14",
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
        num: "15",
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
        num: "16",
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
        num: "17",
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
        num: "18",
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
        num: "19",
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
    chapterNumber: "06",
    title: "Capstone Guided Projects",
    subtitle: "Synthesizing data science pipelines into verified, recruiter-ready case studies.",
    lessons: [
      {
        href: "/projects/salary-prediction",
        num: "20",
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
        num: "21",
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
        num: "22",
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

export default function LearnPage() {
  const totalLessons = chapters.reduce((acc, c) => acc + c.lessons.length, 0);

  return (
    <AppShell>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Header & Continue Learning Hero Banner */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 px-3 py-0.5 text-xs font-mono font-semibold text-teal-800 dark:text-teal-300">
                <span>CURRICULUM // LEARNING JOURNEY</span>
              </div>
              <h1 className="mt-2 text-3xl font-black text-slate-950 dark:text-white sm:text-4xl tracking-tight">
                The MLingo Learning Journey
              </h1>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Move progressively from core mathematical intuitions to supervised classifiers, clustering, deep learning, and data leakage prevention.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-center shadow-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Curriculum Length
                </span>
                <span className="text-lg font-mono font-bold text-teal-800 dark:text-teal-400">
                  {totalLessons} Lessons
                </span>
              </div>
            </div>
          </div>

          {/* Continue Learning Recommended Action Banner */}
          <div className="rounded-2xl border border-teal-300/80 dark:border-teal-800 bg-gradient-to-r from-teal-50/80 via-white to-teal-50/40 dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                START YOUR JOURNEY: LESSON 01
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                What is Machine Learning? (Features, Labels & Predictions)
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Learn how algorithms update parameters iteratively instead of running static if/else logic.
              </p>
            </div>

            <Link
              href="/learn/what-is-machine-learning"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-600 dark:hover:bg-teal-500 px-5 py-2.5 text-xs font-mono font-bold text-white shadow-md transition-all shrink-0 cursor-pointer"
            >
              <span>Begin Lesson 01 →</span>
            </Link>
          </div>
        </div>

        {/* Chapters Progression */}
        <div className="space-y-10">
          {chapters.map((chapter) => (
            <section
              key={chapter.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 shadow-xs space-y-6"
              aria-labelledby={`chapter-${chapter.id}`}
            >
              {/* Chapter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                      CHAPTER {chapter.chapterNumber}
                    </span>
                    <h2
                      id={`chapter-${chapter.id}`}
                      className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight"
                    >
                      {chapter.title}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chapter.subtitle}
                  </p>
                </div>

                {chapter.renderMiniVisual && (
                  <div className="w-40 shrink-0 hidden sm:block">
                    {chapter.renderMiniVisual()}
                  </div>
                )}
              </div>

              {/* Chapter Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapter.lessons.map((lesson) => (
                  <Link
                    key={lesson.title}
                    href={lesson.href}
                    className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 p-4 shadow-xs hover:border-teal-400 dark:hover:border-teal-700 hover:bg-white dark:hover:bg-slate-900 transition-all flex flex-col justify-between space-y-3 cursor-pointer"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-[10px] font-bold text-teal-800 dark:text-teal-400">
                          LESSON {lesson.num}
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span className="rounded bg-slate-200/80 dark:bg-slate-800 px-1.5 py-0.5 text-slate-700 dark:text-slate-300">
                            {lesson.difficulty}
                          </span>
                          <span>⏱️ {lesson.time}</span>
                        </div>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-teal-800 dark:group-hover:text-teal-300 transition-colors">
                        {lesson.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
                        {lesson.summary}
                      </p>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {lesson.concepts.slice(0, 3).map((concept) => (
                          <span
                            key={concept}
                            className="rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs font-mono font-bold text-teal-700 dark:text-teal-400 group-hover:translate-x-0.5 transition-transform">
                      <span>{lesson.tryIt}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
