import { SectionPage } from "@/components/layout/section-page";
import Link from "next/link";

type LessonItem = {
  href: string;
  tag: string;
  title: string;
  summary: string;
  idea: string;
  difficulty: "Beginner" | "Intermediate";
  time: string;
  concepts: string[];
  tryIt: string;
};

const lessons: LessonItem[] = [
  {
    href: "/learn/what-is-machine-learning",
    tag: "Foundations / 01",
    title: "What is Machine Learning?",
    summary: "Models learn patterns from data rather than memorizing one fixed answer.",
    idea: "A model turns inputs into predictions using adjustable parameters. Training finds the right settings.",
    difficulty: "Beginner",
    time: "5 min",
    concepts: ["features", "targets", "predictions", "training vs inference"],
    tryIt: "Start conceptual lesson →",
  },
  {
    href: "/learn/how-models-learn",
    tag: "Foundations / 02",
    title: "How Does a Model Learn?",
    summary: "The continuous feedback loop of predicting, measuring error, and updating parameters.",
    idea: "Learning is iterative error reduction. Small repeated updates converge on the right fit.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["prediction", "error", "parameter updates", "repeated improvement"],
    tryIt: "Start conceptual lesson →",
  },
  {
    href: "/learn/loss-functions",
    tag: "Foundations / 03",
    title: "Loss: Measuring How Wrong the Model Is",
    summary: "Why training requires a single measurable objective score like Mean Squared Error.",
    idea: "Loss scores how far all predictions are from the true targets. Minimizing loss is the training objective.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["loss", "error vs loss", "MSE", "objective function"],
    tryIt: "Start conceptual lesson →",
  },
  {
    href: "/learn/gradient-descent",
    tag: "Foundations / 04",
    title: "Gradient Descent",
    subtitle: "The optimization engine that guides parameters downhill toward minimum loss.",
    summary: "The model updates by feeling the slope and stepping downhill toward lower loss.",
    idea: "Slope tells you which way is uphill; stepping in the opposite direction lowers error.",
    difficulty: "Beginner",
    time: "7 min",
    concepts: ["gradient descent", "slope", "parameter updates", "convergence"],
    tryIt: "Start conceptual lesson →",
  } as LessonItem,
  {
    href: "/learn/learning-rate",
    tag: "Foundations / 05",
    title: "Learning Rate",
    summary: "The step size multiplier that balances training speed against mathematical stability.",
    idea: "Too small crawls forever; too large overshoots and diverges. Choosing α is critical.",
    difficulty: "Beginner",
    time: "7 min",
    concepts: ["learning rate", "step size", "instability", "divergence"],
    tryIt: "Start conceptual lesson →",
  },
  {
    href: "/labs/logistic-regression",
    tag: "Supervised / 06",
    title: "Logistic regression",
    summary: "This model produces probabilities for binary outcomes instead of raw real-valued predictions.",
    idea: "Classification learns a separating boundary between two classes using the sigmoid function.",
    difficulty: "Beginner",
    time: "8 min",
    concepts: ["probability", "classification", "decision boundary"],
    tryIt: "Open the Logistic Regression lab",
  },
  {
    href: "/labs/k-means",
    tag: "Unsupervised / 07",
    title: "K-Means clustering",
    summary: "K-Means groups nearby points by distance to shared centroids.",
    idea: "The algorithm repeatedly assigns points to clusters and moves centroids toward their mean locations.",
    difficulty: "Beginner",
    time: "8 min",
    concepts: ["clustering", "centroids", "inertia"],
    tryIt: "Open the K-Means lab",
  },
  {
    href: "/labs/neural-network",
    tag: "Deep Learning / 08",
    title: "Neural networks & backpropagation",
    summary: "Hidden layers and nonlinear activations allow networks to learn complex decision surfaces.",
    idea: "The chain rule sends error signals backwards through the network to update all weights layer by layer.",
    difficulty: "Intermediate",
    time: "10 min",
    concepts: ["hidden layers", "backpropagation", "chain rule", "sigmoid activation"],
    tryIt: "Open the Neural Network lab",
  },
  {
    href: "/labs/gradient-descent",
    tag: "Analysis / 09",
    title: "How to read a training run",
    summary: "Connect loss curves, gradient norms, and parameter steps to diagnose convergence, plateaus, and instability from telemetry.",
    idea: "Evidence from telemetry explains why parameters move and how to adjust hyperparameters.",
    difficulty: "Intermediate",
    time: "8 min",
    concepts: ["loss", "gradients", "parameter updates", "convergence", "instability", "experiment comparison"],
    tryIt: "Explore in the Linear Regression lab",
  },
  {
    href: "/workbench",
    tag: "Workflow / 10",
    title: "Understanding datasets",
    summary: "Before fitting a model, inspect row counts, feature types, unique values, and missingness to understand your data surface.",
    idea: "Data shape, types, and quality dictate which models can learn effectively.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["features", "datatypes", "metadata", "sample size"],
    tryIt: "Open the Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 11",
    title: "Missing values & imputation",
    summary: "Missing values disrupt linear algebra. Imputing with mean or mode allows models to process incomplete records.",
    idea: "Impute missing observations without inventing false correlations.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["missing values", "mean imputation", "mode imputation"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 12",
    title: "Feature scaling",
    summary: "When features have vastly different ranges, gradients oscillate wildly. Scaling balances step sizes across dimensions.",
    idea: "Standardization (Z-Score) or Min-Max scaling equalizes feature magnitudes.",
    difficulty: "Beginner",
    time: "7 min",
    concepts: ["standardization", "min-max scaling", "normalization"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 13",
    title: "Categorical encoding",
    summary: "Machine learning models compute numeric dot products. One-hot encoding translates qualitative categories into binary basis indicators.",
    idea: "Encode categories without imposing artificial numerical ordering.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["categorical features", "one-hot encoding", "indicator variables"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 14",
    title: "Train / test split",
    summary: "Evaluating a model on the data used to train it gives a falsely confident score. Partitioning measures generalization to new data.",
    idea: "Reserve a hold-out test set to evaluate real generalization.",
    difficulty: "Beginner",
    time: "6 min",
    concepts: ["training set", "test set", "reproducibility", "random seed"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 15",
    title: "Data leakage",
    summary: "If test data influences preprocessing (such as scaling or imputation means), evaluation metrics become falsely optimistic.",
    idea: "Fit transformers on the training partition only, then apply to test data.",
    difficulty: "Intermediate",
    time: "8 min",
    concepts: ["data leakage", "pipeline isolation", "generalization integrity"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 16",
    title: "Evaluation metrics",
    summary: "Training loss is an optimization guide; evaluation metrics like MSE, MAE, R², and accuracy evaluate operational utility.",
    idea: "Choose metrics aligned with task objectives rather than raw loss alone.",
    difficulty: "Intermediate",
    time: "7 min",
    concepts: ["MSE", "MAE", "R-squared", "evaluation metrics"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 17",
    title: "The confusion matrix",
    summary: "A 2x2 contingency table separating true positives, false positives, true negatives, and false negatives in binary classification.",
    idea: "Inspect exact counts of errors rather than just a single summary score.",
    difficulty: "Beginner",
    time: "7 min",
    concepts: ["confusion matrix", "true positive", "false positive", "false negative"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 18",
    title: "Precision vs recall",
    summary: "Precision asks: when the model predicts positive, how often is it right? Recall asks: what fraction of actual positives were caught?",
    idea: "Tuning the decision threshold adjusts the trade-off between precision and recall.",
    difficulty: "Intermediate",
    time: "8 min",
    concepts: ["precision", "recall", "F1 score", "decision threshold"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/workbench",
    tag: "Workflow / 19",
    title: "Overfitting vs underfitting",
    summary: "Compare training and test performance to spot when a model memorizes training noise instead of general patterns.",
    idea: "A growing gap between train and test metrics indicates a generalization gap.",
    difficulty: "Intermediate",
    time: "8 min",
    concepts: ["overfitting", "underfitting", "generalization gap"],
    tryIt: "Practice in Data Workbench",
  },
  {
    href: "/projects/salary-prediction",
    tag: "Project / 20",
    title: "Project: Salary Prediction",
    summary: "Synthesize data cleaning, train/test split, and linear regression to predict engineering compensation without data leakage.",
    idea: "Connect data preprocessing, training runs, and evaluation metrics into one complete ML lifecycle.",
    difficulty: "Beginner",
    time: "15 min",
    concepts: ["regression", "imputation", "one-hot encoding", "MSE", "R²", "generalization"],
    tryIt: "Start Project in Project Studio",
  },
  {
    href: "/projects/student-outcome",
    tag: "Project / 21",
    title: "Project: Student Exam Outcome",
    summary: "Build a logistic regression early-warning model to predict student admission and balance Precision vs Recall with threshold tuning.",
    idea: "Calibrate decision boundaries and evaluate classification ranking with confusion matrices and ROC curves.",
    difficulty: "Intermediate",
    time: "20 min",
    concepts: ["classification", "decision threshold", "precision", "recall", "ROC", "AUC"],
    tryIt: "Start Project in Project Studio",
  },
  {
    href: "/projects/customer-segmentation",
    tag: "Project / 22",
    title: "Project: Customer Segmentation",
    summary: "Segment retail shoppers with unsupervised K-Means, standardizing features to discover cohesive behavioral cohorts.",
    idea: "Standardize multi-scale features and evaluate clustering cohesion using inertia and centroid analysis.",
    difficulty: "Intermediate",
    time: "20 min",
    concepts: ["unsupervised learning", "clustering", "feature scaling", "inertia", "centroids"],
    tryIt: "Start Project in Project Studio",
  },
];

export default function LearnPage() {
  return (
    <SectionPage
      title="Learn machine learning"
      description="Move from foundations to supervised and unsupervised learning. Each lesson provides core intuition and points to a real lab where you can test the idea."
    >
      <div className="space-y-6">
        <div className="challenge-list">
          {lessons.map((lesson) => (
            <Link className="challenge-card" href={lesson.href} key={lesson.title}>
              <div className="flex items-center justify-between">
                <p className="eyebrow">{lesson.tag}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                    {lesson.difficulty}
                  </span>
                  <span>⏱️ {lesson.time}</span>
                </div>
              </div>
              <h2 className="mt-1">{lesson.title}</h2>
              <p>{lesson.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-slate-500">
                <span className="font-bold text-slate-700">Key idea:</span>
                <span>{lesson.idea}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Concepts:</span>
                {lesson.concepts.map((concept) => (
                  <span key={concept} className="rounded bg-slate-100/80 px-1.5 py-0.5 text-slate-600">
                    {concept}
                  </span>
                ))}
              </div>
              <div className="mt-4 text-sm font-semibold text-teal-700">
                {lesson.tryIt}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </SectionPage>
  );
}
