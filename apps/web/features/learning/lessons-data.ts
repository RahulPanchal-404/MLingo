export type LessonConceptVisual = {
  type: "diagram" | "equation" | "comparison" | "flow";
  title: string;
  items: { label: string; detail: string; highlight?: boolean }[];
};

export type LessonThinkPrompt = {
  question: string;
  options: { text: string; correct?: boolean; feedback: string }[];
};

export type LessonAction = {
  headline: string;
  buttonLabel: string;
  href: string;
  whatToObserve: string[];
};

export type LessonDefinition = {
  id: string;
  slug: string;
  number: string;
  tag: string;
  title: string;
  subtitle: string;
  difficulty: "Beginner" | "Intermediate";
  estimatedMinutes: number;
  prerequisites: string;
  whatAmILearning: string[];
  whyItMatters: string;
  keyIdea: string;
  visual: LessonConceptVisual;
  concreteExample: {
    context: string;
    input: string;
    prediction: string;
    target: string;
    errorNote: string;
  };
  thinkPrompt?: LessonThinkPrompt;
  nowTryIt: LessonAction;
  prevLesson?: { title: string; slug: string };
  nextLesson?: { title: string; slug: string };
};

export const FOUNDATIONAL_LESSONS: LessonDefinition[] = [
  {
    id: "lesson-01",
    slug: "what-is-machine-learning",
    number: "01",
    tag: "Foundations / 01",
    title: "What is Machine Learning?",
    subtitle: "How models discover patterns from data instead of hand-written rules.",
    difficulty: "Beginner",
    estimatedMinutes: 5,
    prerequisites: "Basic programming curiosity (Python or any language). No advanced math required.",
    whatAmILearning: [
      "Traditional programming vs machine learning: instead of writing exact if/else rules, a model adjusts internal parameters from examples.",
      "The core machine learning pipeline: Input Features (x) → Model (with internal parameters) → Prediction (ŷ).",
      "Why models need examples: training uses past data to discover relationships; inference uses those learned patterns on new, unseen data.",
    ],
    whyItMatters:
      "Writing manual rules for complex problems (like predicting house prices or diagnosing tumors) is impossible because human programmers cannot anticipate every combination of variables. Machine learning lets the computer discover the relationship directly from recorded data.",
    keyIdea:
      "A model is not a brain or magic: it is a mathematical function with adjustable knobs (parameters). Learning is the automated process of turning those knobs until predictions match reality.",
    visual: {
      type: "flow",
      title: "The Machine Learning Inference Flow",
      items: [
        { label: "1. Input Features (x)", detail: "Years of experience, square footage, test scores" },
        { label: "2. The Model (w, b)", detail: "Calculates ŷ = w · x + b using its current knob settings", highlight: true },
        { label: "3. Prediction (ŷ)", detail: "The estimated outcome (e.g. estimated salary: $82,000)" },
      ],
    },
    concreteExample: {
      context: "Predicting Software Engineer Compensation",
      input: "5 years of experience (feature x = 5)",
      prediction: "Model currently guesses $75,000 (prediction ŷ)",
      target: "Actual recorded market salary is $85,000 (target y)",
      errorNote: "Gap is $10,000. In training, the model uses this gap to adjust its internal parameters.",
    },
    thinkPrompt: {
      question: "If a model predicts $80k for someone earning $80k, should it change its parameters?",
      options: [
        {
          text: "Yes, models always change parameters on every example.",
          correct: false,
          feedback: "If the prediction is already exact, the error is 0. The model doesn't need to change for that example.",
        },
        {
          text: "No, when error is zero, the gradient is zero and parameters stay stable.",
          correct: true,
          feedback: "Spot on! When the prediction matches the target, there is no error signal pushing the parameters to change.",
        },
        {
          text: "It depends on the programming language used.",
          correct: false,
          feedback: "The math is identical regardless of language: zero error means zero update.",
        },
      ],
    },
    nowTryIt: {
      headline: "Now see a model learn in real time",
      buttonLabel: "⚡ Try the Interactive Demo →",
      href: "/demo",
      whatToObserve: [
        "Notice raw data points plotted without any line in Step 1.",
        "Watch how the model starts with random weights (w = 0) and refines them in Step 2.",
        "Scrub the timeline in Step 3 to see how predictions improve frame by frame.",
      ],
    },
    nextLesson: { title: "How Does a Model Learn?", slug: "how-models-learn" },
  },
  {
    id: "lesson-02",
    slug: "how-models-learn",
    number: "02",
    tag: "Foundations / 02",
    title: "How Does a Model Learn?",
    subtitle: "The continuous feedback loop of predicting, measuring error, and updating.",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    prerequisites: "Lesson 01 (What is Machine Learning).",
    whatAmILearning: [
      "The 4-step learning cycle: Make a prediction → Compare with actual answer → Calculate error → Adjust parameters.",
      "Parameters (weights and bias) are the internal memory of the model.",
      "How repeated small updates gradually converge on the optimal fit without guessing blindly.",
    ],
    whyItMatters:
      "A model doesn't learn in one giant leap. It takes dozens or hundreds of small, measured adjustments. Understanding this cycle makes gradient descent, epochs, and convergence intuitive.",
    keyIdea:
      "Learning is iterative error reduction. Every training step nudges the parameters in the direction that makes the predictions slightly less wrong.",
    visual: {
      type: "flow",
      title: "The 4-Step Continuous Learning Loop",
      items: [
        { label: "Predict (ŷ)", detail: "Compute current output using current weights and bias" },
        { label: "Measure Error (e)", detail: "Subtract prediction from true target: e = ŷ - y" },
        { label: "Calculate Push (∇)", detail: "Determine whether increasing w increases or decreases error", highlight: true },
        { label: "Update Parameters", detail: "Nudge w and b so the next prediction will be closer" },
      ],
    },
    concreteExample: {
      context: "Tuning a Single Line (y = w · x + b)",
      input: "Initial parameters: slope w = 0.0, bias b = 0.0",
      prediction: "For input x = 2, prediction is ŷ = 0.0",
      target: "Actual target is y = 5.0",
      errorNote: "Error = -5.0. The model needs a positive slope and bias, so the update rule pushes w and b upward.",
    },
    thinkPrompt: {
      question: "What would happen if the model made a giant parameter adjustment after seeing just one data point?",
      options: [
        {
          text: "It would reach the perfect model instantly.",
          correct: false,
          feedback: "One data point may have noise or outliers! A giant jump would ruin the fit for all other data points.",
        },
        {
          text: "It would over-correct and destabilize training for all other points.",
          correct: true,
          feedback: "Correct! That's why models take small, controlled steps (scaled by the learning rate) across the entire dataset.",
        },
        {
          text: "Nothing would change because slope doesn't affect lines.",
          correct: false,
          feedback: "Slope directly determines the orientation and predictions of the line.",
        },
      ],
    },
    nowTryIt: {
      headline: "Watch the model update itself frame by frame",
      buttonLabel: "Open Linear Regression Lab →",
      href: "/labs/gradient-descent",
      whatToObserve: [
        "Click 'Run training' and watch the red regression line rotate into alignment with the points.",
        "Look at the step counter in the timeline: notice that the line changes orientation on every step.",
        "Scrub back to Step 0: notice the flat line with zero slope before learning started.",
      ],
    },
    prevLesson: { title: "What is Machine Learning?", slug: "what-is-machine-learning" },
    nextLesson: { title: "Loss: Measuring How Wrong the Model Is", slug: "loss-functions" },
  },
  {
    id: "lesson-03",
    slug: "loss-functions",
    number: "03",
    tag: "Foundations / 03",
    title: "Loss: Measuring How Wrong the Model Is",
    subtitle: "Why training requires a single measurable objective score.",
    difficulty: "Beginner",
    estimatedMinutes: 6,
    prerequisites: "Lesson 02 (How Does a Model Learn).",
    whatAmILearning: [
      "The difference between an individual error (for one point) and global loss (across all points).",
      "Why we square errors (Mean Squared Error): squaring turns negative errors positive and penalizes large misses much more heavily than small ones.",
      "The loss curve: how loss plotted over time acts as the health scorecard of your training.",
    ],
    whyItMatters:
      "A computer cannot 'look' at a scatterplot and tell if a line looks nice. It needs a single objective numerical score. Lower loss means a better model; finding the lowest possible loss is the goal of all supervised learning.",
    keyIdea:
      "Loss is a single number summarizing how far all predictions are from the true targets. Training is simply the search for parameters that minimize this score.",
    visual: {
      type: "comparison",
      title: "Why Square the Errors? (Mean Squared Error)",
      items: [
        { label: "Canceling Problem", detail: "If point A is +4 off and point B is -4 off, average error = 0! Squaring prevents errors from canceling." },
        { label: "Outlier Penalty", detail: "A miss of 1 costs 1² = 1. A miss of 10 costs 10² = 100! Large mistakes are penalized 100x more.", highlight: true },
        { label: "Smooth Derivative", detail: "The square curve (parabola) has a smooth derivative everywhere, making gradient descent mathematically reliable." },
      ],
    },
    concreteExample: {
      context: "Calculating Mean Squared Error for 2 Points",
      input: "Point 1 target = 10, pred = 8 (error = -2). Point 2 target = 20, pred = 23 (error = +3).",
      prediction: "Squared errors: (-2)² = 4, (+3)² = 9.",
      target: "Sum of squares = 13. Divide by 2 points (Mean).",
      errorNote: "Final Loss (MSE) = 6.5. If the model improves its weights, this number drops closer to 0.",
    },
    thinkPrompt: {
      question: "If a training run's loss starts at 4.5 and drops to 0.12, what does that indicate?",
      options: [
        {
          text: "The model is failing to learn.",
          correct: false,
          feedback: "Remember: lower loss is better. A drop from 4.5 to 0.12 means predictions became significantly more accurate!",
        },
        {
          text: "The model's predictions have aligned closely with the true targets.",
          correct: true,
          feedback: "Exactly! The overall error between predictions and ground truth dropped dramatically.",
        },
        {
          text: "The learning rate is too large.",
          correct: false,
          feedback: "If the learning rate were too large, the loss would oscillate or explode, not settle near 0.12.",
        },
      ],
    },
    nowTryIt: {
      headline: "Watch the loss curve drop during training",
      buttonLabel: "Open Linear Regression Lab →",
      href: "/labs/gradient-descent",
      whatToObserve: [
        "Run training and look at the right-hand 'Loss Chart'.",
        "Notice how the curve falls steeply during the first 10 steps, then flattens out as the line settles.",
        "Hover over points on the loss curve to inspect exact MSE values at each step.",
      ],
    },
    prevLesson: { title: "How Does a Model Learn?", slug: "how-models-learn" },
    nextLesson: { title: "Gradient Descent", slug: "gradient-descent" },
  },
  {
    id: "lesson-04",
    slug: "gradient-descent",
    number: "04",
    tag: "Foundations / 04",
    title: "Gradient Descent",
    subtitle: "The optimization engine that guides parameters downhill toward minimum loss.",
    difficulty: "Beginner",
    estimatedMinutes: 7,
    prerequisites: "Lesson 03 (Loss Functions).",
    whatAmILearning: [
      "The mountain intuition: imagine standing on a foggy mountain where you can't see the bottom, but you can feel the slope under your feet.",
      "The gradient vector (∂L/∂w, ∂L/∂b): indicates which direction goes uphill. We move in the OPPOSITE direction (downhill).",
      "The update formula simplified: New Parameter = Old Parameter - (Learning Rate × Slope).",
      "Convergence: as we reach the flat valley floor, the slope shrinks to near zero, stopping updates naturally.",
    ],
    whyItMatters:
      "Almost every modern AI system—from simple linear regression to 100-billion-parameter LLMs—uses a variant of gradient descent to optimize its parameters.",
    keyIdea:
      "Gradient descent is simply: feel the slope, take a step downhill, and repeat. You don't need to know the entire landscape; you only need to know which way is downhill right now.",
    visual: {
      type: "diagram",
      title: "The Foggy Valley Metaphor",
      items: [
        { label: "Positive Slope (∂L/∂w > 0)", detail: "Moving right goes uphill. To decrease loss, step LEFT (subtract)." },
        { label: "Negative Slope (∂L/∂w < 0)", detail: "Moving right goes downhill. Subtracting a negative steps RIGHT (add)." },
        { label: "Zero Slope (∂L/∂w ≈ 0)", detail: "You have arrived at the valley floor (minimum loss). Parameter stops moving.", highlight: true },
      ],
    },
    concreteExample: {
      context: "Stepping Downhill with Slope = +4.0",
      input: "Current weight w = 1.5, Learning rate α = 0.1",
      prediction: "Calculated slope (gradient) ∂L/∂w = +4.0 (uphill to the right)",
      target: "Update formula: w_new = w - α · (∂L/∂w)",
      errorNote: "w_new = 1.5 - 0.1 × (4.0) = 1.5 - 0.4 = 1.1. Weight took a step to the left toward lower loss.",
    },
    thinkPrompt: {
      question: "Why do parameter steps become smaller as the model nears the optimal solution?",
      options: [
        {
          text: "Because the computer gets tired of calculating.",
          correct: false,
          feedback: "Computers don't tire! The reason is purely mathematical.",
        },
        {
          text: "Because the valley floor is flatter, so the gradient slope itself approaches zero.",
          correct: true,
          feedback: "Spot on! Step size is α × slope. When slope shrinks near the minimum, the step size naturally shrinks with it.",
        },
        {
          text: "Because the learning rate automatically drops to zero.",
          correct: false,
          feedback: "Standard gradient descent uses a fixed learning rate; it is the gradient (slope) that flattens out.",
        },
      ],
    },
    nowTryIt: {
      headline: "Run gradient descent and scrub through every parameter step",
      buttonLabel: "Open Lab & Inspect Model X-Ray →",
      href: "/labs/gradient-descent",
      whatToObserve: [
        "In the lab, look at the Model X-Ray panel below the plots.",
        "Scrub from Step 1 to Step 5: notice the Weight Gradient (∂L/∂w) is large (-1.2).",
        "Scrub to Step 40: notice the gradient has shrunk to near zero (-0.008) as the line converged.",
      ],
    },
    prevLesson: { title: "Loss: Measuring How Wrong the Model Is", slug: "loss-functions" },
    nextLesson: { title: "Learning Rate", slug: "learning-rate" },
  },
  {
    id: "lesson-05",
    slug: "learning-rate",
    number: "05",
    tag: "Foundations / 05",
    title: "Learning Rate",
    subtitle: "The most important hyperparameter: balancing speed against stability.",
    difficulty: "Beginner",
    estimatedMinutes: 7,
    prerequisites: "Lesson 04 (Gradient Descent).",
    whatAmILearning: [
      "What the learning rate (α) is: the step size multiplier in the update formula.",
      "Too small (e.g. α = 0.001): training crawls painfully slowly and may run out of epochs before reaching the minimum.",
      "Just right (e.g. α = 0.1): steady, smooth convergence down the loss valley.",
      "Too large (e.g. α = 1.1+): steps overshoot the valley, bounce wildly, and cause divergence (exploding loss).",
    ],
    whyItMatters:
      "Choosing the learning rate is the single most common reason a machine learning model either succeeds or crashes. Diagnosing whether your learning rate is too cautious or too aggressive is a critical practical engineering skill.",
    keyIdea:
      "Learning rate is your step size. Take baby steps and you'll never reach the destination; take giant leaps and you'll jump right off the cliff.",
    visual: {
      type: "comparison",
      title: "The 3 Regimes of Learning Rate",
      items: [
        { label: "Too Small (α = 0.001)", detail: "Safe but agonizingly slow. Loss barely moves across 50 steps." },
        { label: "Well Tuned (α = 0.1)", detail: "Smooth exponential drop in loss; stable convergence.", highlight: true },
        { label: "Too Large (α = 1.2+)", detail: "Overshoots the minimum, oscillates back and forth, and diverges." },
      ],
    },
    concreteExample: {
      context: "Overshooting the Valley with α = 1.5",
      input: "Target minimum is at w = 2.0. Current weight w = 1.0. Gradient = -4.0.",
      prediction: "Update: w_new = 1.0 - 1.5 × (-4.0) = 1.0 + 6.0 = 7.0!",
      target: "We wanted to reach 2.0, but we jumped all the way to 7.0.",
      errorNote: "At w = 7.0, the error is even bigger than before! Next step will jump to -15.0. That is divergence.",
    },
    thinkPrompt: {
      question: "If a model's loss decreases for 2 steps and then suddenly shoots up to Infinity / NaN, what happened?",
      options: [
        {
          text: "The dataset was too small.",
          correct: false,
          feedback: "Dataset size does not cause sudden mathematical divergence to infinity.",
        },
        {
          text: "The learning rate was too high, causing explosive overshooting (divergence).",
          correct: true,
          feedback: "Correct! That is classic divergence. The step size was so aggressive that each update moved further away from the minimum.",
        },
        {
          text: "The model converged early.",
          correct: false,
          feedback: "Convergence means settling safely at minimum loss, the exact opposite of exploding to infinity.",
        },
      ],
    },
    nowTryIt: {
      headline: "Intentionally break gradient descent with an aggressive learning rate",
      buttonLabel: "⚡ Open Break Mode Challenge →",
      href: "/challenges/gradient-descent-instability",
      whatToObserve: [
        "In Break Mode, the learning rate is intentionally preset to an unstable value (α = 1.1).",
        "Click 'Run training' and watch the loss curve oscillate and bounce upward.",
        "Scrub the timeline to find the exact frame where loss began rising, and mark it with a marker!",
      ],
    },
    prevLesson: { title: "Gradient Descent", slug: "gradient-descent" },
  },
];

export function getLessonBySlug(slug: string): LessonDefinition | undefined {
  return FOUNDATIONAL_LESSONS.find((l) => l.slug === slug);
}
